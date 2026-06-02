"""
Script local para HelpDeskManager-Web.
1. Ejecuta el ers_token_refresher localmente usando Playwright.
2. Sube el token generado a la VM de Google Cloud en producción usando gcloud scp.
3. Mueve el archivo a la ruta de la aplicación del backend y aplica permisos.
"""
import subprocess
import sys
import os
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPTS_DIR.parent
BACKEND_DIR = REPO_ROOT / "backend"
TOKEN_FILE_LOCAL = BACKEND_DIR / "data" / "ers_token.json"

# Configuración de GCP
VM_NAME = "instance-20260529-143249"
ZONE = "us-central1-a"
PROJECT = "clean-circuit-405918"

# Usar shell=True en Windows para ejecutar archivos por lotes de gcloud (.cmd / .bat)
USE_SHELL = os.name == "nt"

def main():
    print("=== Sincronizador de Token ERS a Produccion ===")
    
    # 1. Regenerar token localmente
    print("\n[1] Regenerando token de ERS localmente usando Playwright...")
    try:
        subprocess.run(
            [sys.executable, "-m", "services.ers_token_refresher"],
            check=True,
            cwd=str(BACKEND_DIR)
        )
        print("    [OK] Token regenerado con exito de forma local.")
    except subprocess.CalledProcessError as e:
        print(f"    [ERROR] Error al generar el token localmente: {e}")
        sys.exit(1)

    if not TOKEN_FILE_LOCAL.exists():
        print(f"    [ERROR] No se encontro el archivo generado en {TOKEN_FILE_LOCAL}")
        sys.exit(1)

    # 2. Copiar a la VM en la carpeta /tmp
    print(f"\n[2] Copiando token a la VM '{VM_NAME}'...")
    try:
        subprocess.run([
            "gcloud", "compute", "scp",
            str(TOKEN_FILE_LOCAL),
            f"{VM_NAME}:/tmp/ers_token.json",
            "--zone", ZONE,
            "--project", PROJECT
        ], check=True, shell=USE_SHELL)
        print("    [OK] Archivo copiado a /tmp en la VM.")
    except subprocess.CalledProcessError as e:
        print(f"    [ERROR] Error al copiar el archivo por scp: {e}")
        sys.exit(1)

    # 3. Mover a la ruta de producción y cambiar ownership
    print("\n[3] Aplicando permisos y moviendo archivo en la VM...")
    vm_cmd = (
        "sudo mkdir -p /home/ivmartinez_cd/HelpDeskManager-Web/backend/data && "
        "sudo mv /tmp/ers_token.json /home/ivmartinez_cd/HelpDeskManager-Web/backend/data/ers_token.json && "
        "sudo chown -R ivmartinez_cd:ivmartinez_cd /home/ivmartinez_cd/HelpDeskManager-Web/backend/data"
    )
    try:
        subprocess.run([
            "gcloud", "compute", "ssh", VM_NAME,
            "--zone", ZONE,
            "--project", PROJECT,
            "--command", vm_cmd
        ], check=True, shell=USE_SHELL)
        print("    [OK] Token posicionado con exito en produccion.")
        print("\n=== Sincronizacion Completada con Exito ===")
    except subprocess.CalledProcessError as e:
        print(f"    [ERROR] Error al configurar el token en la VM: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
