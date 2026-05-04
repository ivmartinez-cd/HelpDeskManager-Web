import os
import json
import sys
from pathlib import Path

# Añadir el directorio padre al path para poder importar database y models
sys.path.append(str(Path(__file__).parent.parent))

from database import engine, SessionLocal, Base
from models import FTPClient
from services.ftp_nas_config import ensure_nas_ftp_config


def migrate():
    print("=== Iniciando Migración JSON -> DB ===")

    # 1. Crear tablas si no existen
    print("Creando tablas en la base de datos...")
    Base.metadata.create_all(bind=engine)

    # 2. Intentar leer JSON local primero, luego NAS
    json_path = "/app/ftp_clientes.json"
    if not os.path.exists(json_path):
        try:
            json_path = ensure_nas_ftp_config()
        except:
            json_path = None

    if not json_path or not os.path.exists(json_path):
        print("ERROR: No se encontró ftp_clientes.json ni local ni en el NAS.")
        return

    print(f"Leyendo configuración desde: {json_path}")

    try:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        if not data:
            print("El archivo JSON está vacío. Nada que migrar.")
            return

        db = SessionLocal()
        try:
            count = 0
            for name, config in data.items():
                # Verificar si ya existe
                existing = db.query(FTPClient).filter(FTPClient.name == name).first()
                if not existing:
                    client = FTPClient(
                        name=name,
                        host=config.get("host", "www.cdsisa.com.ar"),
                        user=config.get("user", ""),
                        password=config.get("password", ""),
                        path=config.get("path", "/"),
                        pattern=config.get("pattern", "PrinterMonitorClient.db3.*"),
                    )
                    db.add(client)
                    count += 1
                else:
                    print(f"Saltando '{name}': ya existe en la DB.")

            db.commit()
            print(f"Migración completada con éxito. {count} clientes migrados.")

        except Exception as e:
            db.rollback()
            print(f"ERROR durante la migración: {e}")
        finally:
            db.close()

    except Exception as e:
        print(f"ERROR al procesar el archivo: {e}")


if __name__ == "__main__":
    migrate()
