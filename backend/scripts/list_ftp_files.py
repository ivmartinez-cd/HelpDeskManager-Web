import sys
from pathlib import Path
from ftplib import FTP
import fnmatch

# Añadir el directorio padre al path
sys.path.append(str(Path(__file__).parent.parent))

from database import SessionLocal
from models import FTPClient


def list_files(client_name):
    db = SessionLocal()
    try:
        client = db.query(FTPClient).filter(FTPClient.name == client_name).first()
        if not client:
            print(f"Cliente '{client_name}' no encontrado.")
            return

        print(f"Conectando a {client.host} como {client.user}...")
        ftp = FTP(client.host, timeout=10)
        try:
            ftp.login(client.user, client.password)
            ftp.cwd(client.path)
            files = ftp.nlst()

            candidatos = [
                f for f in files if fnmatch.fnmatch(f.lower(), client.pattern.lower())
            ]

            print(
                f"\n--- Archivos encontrados para {client_name} (patrón: {client.pattern}) ---"
            )
            if not candidatos:
                print("No se encontraron archivos que coincidan.")
            else:
                for f in sorted(candidatos):
                    try:
                        size = ftp.size(f)
                        print(f"- {f} ({size} bytes)")
                    except:
                        print(f"- {f}")
                print(f"\nTotal de archivos coincidentes: {len(candidatos)}")
                print(f"Total de archivos en el directorio: {len(files)}")
        finally:
            ftp.close()
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) > 1:
        list_files(sys.argv[1])
    else:
        print("Uso: python list_ftp_files.py <nombre_cliente>")
