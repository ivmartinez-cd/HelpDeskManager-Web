"""
Script de prueba para validar la integración de ERS en el backend de HelpDeskManager-Web.
1. Lista los clientes (grupos de dispositivos) de ERS.
2. Exporta contadores de Banco Industrial a un archivo CSV.
"""
import sys
import io
import json
from pathlib import Path
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

SCRIPTS_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPTS_DIR.parent
BACKEND_DIR = REPO_ROOT / "backend"
sys.path.append(str(BACKEND_DIR))

from services.ers_api import get_ers_clients, export_ers_meters_to_csv

def main():
    print("=== Test de Integración ERS — HelpDeskManager-Web ===")
    
    # 1. Test Listing Clients
    print("\n[1] Obteniendo lista de clientes/grupos desde ERS API...")
    try:
        clients = get_ers_clients()
        print(f"    ✓ {len(clients)} clientes encontrados:")
        for c in clients:
            print(f"      - ID: {c['customer_id']} | Nombre: {c['name']}")
    except Exception as e:
        print(f"    ✗ Error al obtener clientes: {e}")
        sys.exit(1)

    # 2. Test Exporting CSV
    print("\n[2] Intentando exportar contadores del Banco Industrial (BIND) a CSV...")
    
    # BIND ID we know is "baa9e6b9bbf54f37a15953d8892ef0c1"
    bind_client = next((c for c in clients if "BIND" in c["name"]), None)
    if not bind_client:
        print("    ✗ Error: No se encontró el grupo BIND en ERS.")
        sys.exit(1)
        
    group_id = bind_client["customer_id"]
    group_name = bind_client["name"]
    max_date = "2026-06-01T23:59:59"
    outputs_dir = BACKEND_DIR / "outputs"
    outputs_dir.mkdir(exist_ok=True)
    
    try:
        csv_file_path = export_ers_meters_to_csv(
            group_id=group_id,
            group_name=group_name,
            max_date=max_date,
            output_dir=str(outputs_dir),
            suma_color=False
        )
        print(f"    ✓ CSV exportado con éxito!")
        print(f"      - Archivo: {csv_file_path}")
        
        # Dump a preview of the CSV
        print("\n--- Previsualización del CSV Generado ---")
        with open(csv_file_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
            for line in lines[:10]:
                print(line.strip())
            if len(lines) > 10:
                print(f"... ({len(lines) - 10} líneas más)")
                
    except Exception as e:
        print(f"    ✗ Error al exportar contadores: {e}")
        sys.exit(1)

    print("\n=== Integración Verificada con Éxito ===")

if __name__ == "__main__":
    main()
