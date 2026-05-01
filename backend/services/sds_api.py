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
    Descarga los contadores y los guarda en un CSV.
    Retorna la ruta absoluta al archivo generado.
    """
    meters = get_sds_device_meters(customer_id, max_date)
    
    if not meters:
        raise Exception(f"No se encontraron contadores para el cliente '{customer_name}' en la fecha especificada.")
        
    # Formatear el nombre del archivo
    date_str = max_date.split("T")[0].replace("-", "")
    safe_name = "".join([c for c in customer_name if c.isalnum() or c in (' ', '_')]).strip().replace(' ', '_')
    filename = f"SDS_{safe_name}_{date_str}.csv"
    output_path = Path(output_dir) / filename
    
    # Extraer todas las posibles claves para los headers (aplanando un poco si es necesario)
    # Dependiendo de la estructura, extraeremos campos clave como deviceId, engineCycles, a4Mono, etc.
    # Como no sabemos todas las claves con seguridad, usamos las del primer registro como base.
    # Pero nos aseguramos de que "engineCycles" esté.
    
    if len(meters) > 0:
        # Obtenemos todos los headers que existen en al menos un registro
        headers_set = set()
        for m in meters:
            headers_set.update(m.keys())
            
        headers = list(headers_set)
        
        # Ordenamos los headers de forma amigable (engineCycles al principio, etc.)
        preferred_order = ["deviceId", "readingDate", "engineCycles", "a4Mono", "a4Colour", "a3Mono", "a3Colour"]
        final_headers = []
        for h in preferred_order:
            if h in headers:
                final_headers.append(h)
                headers.remove(h)
        final_headers.extend(sorted(headers))
        
        with open(output_path, "w", newline="", encoding="utf-8") as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=final_headers)
            writer.writeheader()
            for row in meters:
                # Escribimos solo las claves presentes en row
                safe_row = {k: v for k, v in row.items() if k in final_headers}
                writer.writerow(safe_row)
                
    return str(output_path)
