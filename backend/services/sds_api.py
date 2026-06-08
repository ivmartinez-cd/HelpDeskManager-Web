import csv
import httpx
import base64
from pathlib import Path
from typing import List, Dict, Any

# Credenciales de SDS
SDS_API_KEY = "2bc8f5eaae344c46814190bffd40060d"
SDS_API_SECRET = "0iIxVYcz5lH8sTjl6c6B89uvyQ4qyl2bojRPv155onzqkqpANt6culpITUBldR8a"
SDS_BASE_URL = "https://hp-sds-latam.insightportal.net/PortalAPI"

# Timeout global para todos los requests a SDS (segundos)
SDS_TIMEOUT = httpx.Timeout(20.0)


async def _get_auth_token() -> str:
    """Obtiene el Bearer token de la API de SDS usando Key y Secret."""
    url = f"{SDS_BASE_URL}/login"

    credentials = f"{SDS_API_KEY}:{SDS_API_SECRET}"
    encoded_credentials = base64.b64encode(credentials.encode("utf-8")).decode("utf-8")

    headers = {
        "Authorization": f"Basic {encoded_credentials}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=SDS_TIMEOUT) as client:
        response = await client.post(url, headers=headers)

    if response.status_code == 200:
        try:
            data = response.json()
            token = data.get("access_token") or data.get("token")
            if token:
                return f"Bearer {token}"
        except Exception:
            pass
        # Fallback: intentar desde el header de respuesta
        auth_header = response.headers.get("Authorization")
        if auth_header:
            return auth_header
        raise Exception("No se pudo extraer el token del response de login SDS.")
    else:
        raise Exception(
            f"Error al autenticar en SDS: {response.status_code} - {response.text}"
        )


async def get_sds_clients() -> List[Dict[str, Any]]:
    """Obtiene la lista de clientes ACTIVOS desde SDS."""
    token = await _get_auth_token()
    url = f"{SDS_BASE_URL}/api/customers"
    headers = {"Authorization": token, "Accept": "application/json"}

    async with httpx.AsyncClient(timeout=SDS_TIMEOUT) as client:
        response = await client.get(url, headers=headers)

    if response.status_code == 200:
        all_customers = response.json()
        active_customers = [
            c for c in all_customers if c.get("status", "").upper() == "ACTIVE"
        ]
        return sorted(active_customers, key=lambda c: c.get("name", ""))
    else:
        raise Exception(
            f"Error al obtener clientes SDS: {response.status_code} - {response.text}"
        )


async def _get_sds_device_meters(token: str, customer_id: int, max_date: str) -> List[Dict[str, Any]]:
    """
    Obtiene los contadores de las impresoras para un cliente dado, hasta una fecha máxima.
    `max_date` debe tener el formato YYYY-MM-DDTHH:mm:ss.
    """
    url = f"{SDS_BASE_URL}/api/devices/meters/latestbydate/{customer_id}"
    params = {"maxReadDateTimeLocal": max_date, "includeExtendedMeters": "true"}
    headers = {"Authorization": token, "Accept": "application/json"}

    async with httpx.AsyncClient(timeout=SDS_TIMEOUT) as client:
        response = await client.get(url, headers=headers, params=params)

    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(
            f"Error al obtener contadores SDS: {response.status_code} - {response.text}"
        )


async def _get_device_serial_map(token: str, customer_id: int) -> Dict[int, str]:
    """Devuelve un dict {deviceId: serialNumber} para un cliente dado."""
    url = f"{SDS_BASE_URL}/api/devices"
    headers = {"Authorization": token, "Accept": "application/json"}

    async with httpx.AsyncClient(timeout=SDS_TIMEOUT) as client:
        response = await client.get(url, headers=headers, params={"customerId": customer_id})

    if response.status_code == 200:
        devices = response.json()
        return {
            d["deviceId"]: d.get("serialNumber", "") for d in devices if "deviceId" in d
        }
    return {}


async def export_sds_meters_to_csv(
    customer_id: int,
    customer_name: str,
    max_date: str,
    output_dir: str,
    suma_color: bool = False,
) -> str:
    """
    Exporta contadores SDS en formato CSV idéntico al de Descarga FTP.

    Modo suma_color=False (default):
      - TIPO=21, CLASE_10=10, CONTADOR_10=monoPages
      - CLASE_20=20, CONTADOR_20=colourPages  (solo si el equipo tiene color)

    Modo suma_color=True (equipos color):
      - TIPO=21, CLASE_10=20, CONTADOR_10=engineCycles (mono+color combinados)
      - Sin CLASE_20 (ya está sumado)
      - Equipos solo mono: TIPO=21, CLASE_10=10, CONTADOR_10=monoPages
    """
    # Obtener token una sola vez y reutilizarlo en ambas llamadas
    token = await _get_auth_token()

    meters = await _get_sds_device_meters(token, customer_id, max_date)

    if not meters:
        raise Exception(
            f"No se encontraron contadores para el cliente '{customer_name}' en la fecha especificada."
        )

    # --- FILTRADO POR FECHA MÍNIMA (Hardcoded a 30 días) ---
    from datetime import datetime as _dt, timedelta as _td

    try:
        date_part = max_date.split("T")[0]
        if "-" in date_part:
            y, m, d = date_part.split("-")
            max_dt = _dt(int(y), int(m), int(d))
        else:
            max_dt = _dt.fromisoformat(date_part)

        min_dt = max_dt - _td(days=30)
        print(f"DEBUG SDS: Filtrando entre {min_dt} y {max_dt}")
    except Exception as e:
        print(f"DEBUG SDS: Error parseando fecha maxima ({max_date}): {e}")
        min_dt = None

    # Obtener mapa deviceId -> serialNumber (reutilizando el token)
    serial_map = await _get_device_serial_map(token, customer_id)

    # Formatear nombre de archivo
    date_str = max_date.split("T")[0].replace("-", "")
    safe_name = (
        "".join([c for c in customer_name if c.isalnum() or c in (" ", "_")])
        .strip()
        .replace(" ", "_")
    )
    suffix = "_SumaColor" if suma_color else ""
    filename = f"SDS_{safe_name}_{date_str}{suffix}_AutoCSV.csv"
    output_path = Path(output_dir) / filename

    rows = []
    for device in meters:
        device_id = device.get("deviceId")
        serie = serial_map.get(device_id, str(device_id) if device_id else "")

        raw_date = device.get("readingDate") or (device.get("readingDateTime", "")[:10])
        try:
            device_dt = _dt.strptime(raw_date, "%Y-%m-%d")
            if min_dt and device_dt < min_dt:
                continue
            fecha = device_dt.strftime("%d/%m/%Y")
        except Exception:
            fecha = raw_date

        engine_cycles = int(device.get("engineCycles") or 0)
        mono_pages = int(device.get("monoPages") or 0)
        colour_pages = int(device.get("colourPages") or 0)
        is_color = colour_pages > 0

        if suma_color and is_color:
            row = {
                "SERIE": serie,
                "FECHA": fecha,
                "TIPO": 21,
                "CLASE_10": 20,
                "CONTADOR_10": engine_cycles,
                "CLASE_20": "",
                "CONTADOR_20": 0,
                "MOTIVO": "",
                "OBSERVACION": "",
            }
            rows.append(row)
        else:
            row = {
                "SERIE": serie,
                "FECHA": fecha,
                "TIPO": 21,
                "CLASE_10": 10,
                "CONTADOR_10": mono_pages,
                "CLASE_20": 20 if is_color else "",
                "CONTADOR_20": colour_pages if is_color else 0,
                "MOTIVO": "",
                "OBSERVACION": "",
            }
            rows.append(row)

    fieldnames = [
        "SERIE",
        "FECHA",
        "TIPO",
        "CLASE_10",
        "CONTADOR_10",
        "CLASE_20",
        "CONTADOR_20",
        "MOTIVO",
        "OBSERVACION",
    ]
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=";")
        writer.writeheader()
        writer.writerows(rows)

    return str(output_path)
