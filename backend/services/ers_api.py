import csv
import json
import requests
import re
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Any

# ERS API paths
BASE_URL = "https://www.remote-services.epson.com/prod"
BACKEND_DIR = Path(__file__).resolve().parent.parent
TOKEN_FILE = BACKEND_DIR / "data" / "ers_token.json"

def _ensure_ers_session() -> requests.Session:
    """Carga el Bearer token y cookies de Incapsula y crea la sesión requests."""
    if not TOKEN_FILE.exists():
        raise Exception(
            "La sesión de ERS no está inicializada. Por favor ejecute primero:\n"
            "  python scripts/ers_token_refresher.py"
        )
        
    try:
        with open(TOKEN_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        raise Exception(f"No se pudo leer el archivo de token de ERS: {e}")

    token = data.get("token")
    cookies_data = data.get("cookies", [])

    if not token:
        raise Exception("No se encontró un token válido en ers_token.json.")

    session = requests.Session()
    session.headers.update({
        "accept": "application/json, text/plain, */*",
        "accept-language": "es-ES,es;q=0.9,ro;q=0.8",
        "authorization": token,
        "priority": "u=1, i",
        "referer": "https://www.remote-services.epson.com/devices",
        "sec-ch-ua-mobile": "?0",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    })

    # Set Incapsula WAF cookies
    for c in cookies_data:
        session.cookies.set(
            name=c.get("name"),
            value=c.get("value"),
            domain=c.get("domain"),
            path=c.get("path")
        )
        
    return session

def get_ers_clients() -> List[Dict[str, Any]]:
    """
    Obtiene los grupos de dispositivos desde ERS
    y los formatea como clientes compatibles con el frontend.
    """
    session = _ensure_ers_session()
    url = f"{BASE_URL}/device_groups/"
    
    r = session.get(url, timeout=15)
    if r.status_code in (401, 403):
        raise Exception("Sesión de ERS expirada. Por favor vuelva a correr 'python scripts/ers_token_refresher.py'.")
    r.raise_for_status()

    device_groups = r.json().get("items", [])
    
    # Formatear idéntico al get_sds_clients del frontend
    clients = []
    for dg in device_groups:
        clients.append({
            "customer_id": dg.get("id"),
            "name": f"EPSON - {dg.get('name', '').upper()}",
            "status": "ACTIVE"
        })
        
    return sorted(clients, key=lambda c: c.get("name", ""))

def _get_latest_upload_id(session: requests.Session, device_id: str, max_date_dt: datetime) -> tuple[str | None, str | None]:
    """Obtiene el upload_id más reciente y su fecha para un device_id hasta max_date."""
    # Buscar últimos 60 días para estar seguros de tener telemetría
    start_dt = max_date_dt - timedelta(days=60)
    
    url = f"{BASE_URL}/devices/{device_id}/statuses/"
    params = {
        "start_datetime": start_dt.strftime("%Y-%m-%dT00:00:00Z"),
        "end_datetime": max_date_dt.strftime("%Y-%m-%dT23:59:59Z")
    }
    
    try:
        r = session.get(url, params=params, timeout=10)
        if r.status_code != 200:
            return None, None
            
        items = r.json().get("items", [])
        if not items:
            return None, None
            
        # First item is the most recent
        return items[0].get("upload_id"), items[0].get("collected_datetime")
    except Exception:
        return None, None

def _get_device_telemetry(session: requests.Session, device_id: str, upload_id: str) -> Dict[str, Any] | None:
    """Obtiene el JSON completo de telemetría de un upload."""
    url = f"{BASE_URL}/devices/{device_id}/statuses/{upload_id}/"
    try:
        r = session.get(url, timeout=10)
        if r.status_code != 200:
            return None
        return r.json()
    except Exception:
        return None

def export_ers_meters_to_csv(
    group_id: str,
    group_name: str,
    max_date: str,
    output_dir: str,
    suma_color: bool = False
) -> str:
    """
    Extrae la telemetría de ERS de todos los dispositivos de un grupo
    y los exporta al mismo formato de CSV consolidado que usa la aplicación.
    """
    session = _ensure_ers_session()
    
    # 1. Obtener los IDs de los dispositivos del grupo
    url = f"{BASE_URL}/device_groups/{group_id}/devices/"
    r = session.get(url, timeout=15)
    r.raise_for_status()
    device_ids = r.json().get("devices", [])

    if not device_ids:
        raise Exception(f"No se encontraron dispositivos en el grupo ERS '{group_name}'.")

    # Parse max_date
    try:
        date_part = max_date.split("T")[0]
        if "-" in date_part:
            y, m, d = date_part.split("-")
            max_dt = datetime(int(y), int(m), int(d))
        else:
            max_dt = datetime.fromisoformat(date_part)
    except Exception as e:
        print(f"Error parseando fecha maxima ({max_date}): {e}")
        max_dt = datetime.utcnow()

    # Filtro de 30 días
    min_dt = max_dt - timedelta(days=30)
    print(f"Filtro ERS: buscando lecturas entre {min_dt} y {max_dt}")

    rows = []
    
    # Hacer peticiones en secuencia o multihilo ligero
    from concurrent.futures import ThreadPoolExecutor, as_completed
    
    def process_single_device(did):
        upload_id, collected_dt_str = _get_latest_upload_id(session, did, max_dt)
        if not upload_id or not collected_dt_str:
            return None

        # Filtrar por rango de fecha de 30 días
        try:
            # Format is usually: 2026-05-31T16:03:24Z
            clean_date_str = collected_dt_str.replace("Z", "").split(".")[0]
            device_dt = datetime.fromisoformat(clean_date_str)
            if device_dt < min_dt or device_dt > max_dt:
                return None
            fecha_csv = device_dt.strftime("%d/%m/%Y")
        except Exception:
            fecha_csv = collected_dt_str[:10]

        details = _get_device_telemetry(session, did, upload_id)
        if not details:
            return None

        serial = details.get("serial_number", "")
        info = details.get("device_info_json", {})
        usage = info.get("UsageInfo", {})
        
        # Obtener total de páginas
        marker = usage.get("Marker", [{}])[0] if usage.get("Marker") else {}
        total_pages = int(marker.get("TP") or usage.get("PrtMarker", {}).get("LC") or 0)
        
        # Distribuir si es color (ERS maneja MarkerTotal)
        marker_total = usage.get("MarkerTotal", [])
        simplex = 0
        duplex = 0
        color_pages = 0
        for mt in marker_total:
            ppft = mt.get("PPFT", 0)
            if ppft == 1:
                simplex = int(mt.get("PPF", 0))
            elif ppft == 2:
                duplex = int(mt.get("PPF", 0))
            elif ppft == 3:
                color_pages = int(mt.get("PPF", 0))

        # Determinar si es monocromo o color
        is_color = color_pages > 0 or details.get("model", "").upper().startswith("L") # L series is color
        
        if is_color:
            if suma_color:
                # Suma color: clase_10 = 20, valor = total_pages
                return {
                    "SERIE": serial,
                    "FECHA": fecha_csv,
                    "TIPO": 21,
                    "CLASE_10": 20,
                    "CONTADOR_10": total_pages,
                    "CLASE_20": "",
                    "CONTADOR_20": 0,
                    "MOTIVO": "",
                    "OBSERVACION": "Epson ERS - SumaColor",
                }
            else:
                # Discriminado: monoPages en CLASE_10, colorPages en CLASE_20
                mono_calc = max(0, total_pages - color_pages)
                return {
                    "SERIE": serial,
                    "FECHA": fecha_csv,
                    "TIPO": 21,
                    "CLASE_10": 10,
                    "CONTADOR_10": mono_calc,
                    "CLASE_20": 20,
                    "CONTADOR_20": color_pages,
                    "MOTIVO": "",
                    "OBSERVACION": "Epson ERS",
                }
        else:
            # Monocromático estándar
            return {
                "SERIE": serial,
                "FECHA": fecha_csv,
                "TIPO": 21,
                "CLASE_10": 10,
                "CONTADOR_10": total_pages,
                "CLASE_20": "",
                "CONTADOR_20": 0,
                "MOTIVO": "",
                "OBSERVACION": "Epson ERS",
            }

    # Procesar dispositivos en paralelo para mayor velocidad
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(process_single_device, did): did for did in device_ids}
        for future in as_completed(futures):
            row = future.result()
            if row:
                rows.append(row)

    if not rows:
        raise Exception(f"No se encontraron contadores en el rango de fechas para el cliente '{group_name}'.")

    # Formatear nombre de archivo
    date_str = max_date.split("T")[0].replace("-", "")
    safe_name = (
        "".join([c for c in group_name if c.isalnum() or c in (" ", "_")])
        .strip()
        .replace(" ", "_")
    )
    suffix = "_SumaColor" if suma_color else ""
    filename = f"EPSON_{safe_name}_{date_str}{suffix}_AutoCSV.csv"
    output_path = Path(output_dir) / filename

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
