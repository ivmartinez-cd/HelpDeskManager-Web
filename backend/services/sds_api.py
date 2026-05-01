import os
import csv
import requests
import base64
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Tuple

# Credenciales de SDS
SDS_API_KEY = "2bc8f5eaae344c46814190bffd40060d"
SDS_API_SECRET = "0iIxVYcz5lH8sTjl6c6B89uvyQ4qyl2bojRPv155onzqkqpANt6culpITUBldR8a"
SDS_BASE_URL = "https://hp-sds-latam.insightportal.net/PortalAPI"

def _get_auth_token() -> str:
    """Obtiene el Bearer token de la API de SDS usando Key y Secret."""
    url = f"{SDS_BASE_URL}/login"
    
    credentials = f"{SDS_API_KEY}:{SDS_API_SECRET}"
    encoded_credentials = base64.b64encode(credentials.encode('utf-8')).decode('utf-8')
    
    headers = {
        "Authorization": f"Basic {encoded_credentials}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, headers=headers)
    if response.status_code == 200:
        # El token viene en el body JSON como access_token
        try:
            data = response.json()
            token = data.get('access_token') or data.get('token')
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
        raise Exception(f"Error al autenticar en SDS: {response.status_code} - {response.text}")

def get_sds_clients() -> List[Dict[str, Any]]:
    """Obtiene la lista de clientes ACTIVOS desde SDS."""
    token = _get_auth_token()
    url = f"{SDS_BASE_URL}/api/customers"
    headers = {
        "Authorization": token,
        "Accept": "application/json"
    }
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        all_customers = response.json()
        # Filtrar solo clientes activos
        active_customers = [c for c in all_customers if c.get("status", "").upper() == "ACTIVE"]
        return sorted(active_customers, key=lambda c: c.get("name", ""))
    else:
        raise Exception(f"Error al obtener clientes SDS: {response.status_code} - {response.text}")


def get_sds_device_meters(customer_id: int, max_date: str) -> List[Dict[str, Any]]:
    """
    Obtiene los contadores de las impresoras para un cliente dado, hasta una fecha máxima.
    `max_date` debe tener el formato YYYY-MM-DDTHH:mm:ss.
    """
    token = _get_auth_token()
    url = f"{SDS_BASE_URL}/api/devices/meters/latestbydate/{customer_id}"
    
    params = {
        "maxReadDateTimeLocal": max_date,
        "includeExtendedMeters": "true"
    }
    headers = {
        "Authorization": token,
        "Accept": "application/json"
    }
    
    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Error al obtener contadores SDS: {response.status_code} - {response.text}")

def export_sds_meters_to_csv(customer_id: int, customer_name: str, max_date: str, output_dir: str) -> str:
    """
    Descarga los contadores SDS y los exporta en el mismo formato CSV que la Descarga FTP:
      SERIE;FECHA;TIPO;CLASE_10;CONTADOR_10;CLASE_20;CONTADOR_20;MOTIVO;OBSERVACION
    - engineCycles  -> TIPO=15, CLASE_10=10, CONTADOR_10
    - a4Colour      -> TIPO=7,  CLASE_20=20, CONTADOR_20  (solo si > 0)
    Retorna la ruta absoluta al archivo generado.
    """
    meters = get_sds_device_meters(customer_id, max_date)

    if not meters:
        raise Exception(f"No se encontraron contadores para el cliente '{customer_name}' en la fecha especificada.")

    # Formatear nombre de archivo (igual que el FTP: _AutoCSV.csv)
    date_str = max_date.split("T")[0].replace("-", "")
    safe_name = "".join([c for c in customer_name if c.isalnum() or c in (' ', '_')]).strip().replace(' ', '_')
    filename = f"SDS_{safe_name}_{date_str}_AutoCSV.csv"
    output_path = Path(output_dir) / filename

    rows = []
    for device in meters:
        device_id = device.get("deviceId", "")
        # Convertir readingDate (YYYY-MM-DD) a DD/MM/YYYY
        raw_date = device.get("readingDate") or (device.get("readingDateTime", "")[:10])
        try:
            from datetime import datetime as _dt
            fecha = _dt.strptime(raw_date, "%Y-%m-%d").strftime("%d/%m/%Y")
        except Exception:
            fecha = raw_date

        engine_cycles = int(device.get("engineCycles") or 0)
        colour = int(device.get("a4Colour") or 0)

        row = {
            "SERIE":       device_id,
            "FECHA":       fecha,
            "TIPO":        22,
            "CLASE_10":    10,
            "CONTADOR_10": engine_cycles,
            "CLASE_20":    20 if colour > 0 else "",
            "CONTADOR_20": colour if colour > 0 else 0,
            "MOTIVO":      "",
            "OBSERVACION": "",
        }
        rows.append(row)

    # Escribir CSV con separador ; igual que el formato FTP (UTF-8, CRLF)
    fieldnames = ["SERIE", "FECHA", "TIPO", "CLASE_10", "CONTADOR_10", "CLASE_20", "CONTADOR_20", "MOTIVO", "OBSERVACION"]
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=";")
        writer.writeheader()
        writer.writerows(rows)

    return str(output_path)
