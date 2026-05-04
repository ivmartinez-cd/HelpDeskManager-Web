import json
import os
from database import SessionLocal
from models import FTPClient


def migrate():
    json_path = "ftp_clientes.json"
    if not os.path.exists(json_path):
        print(f"File {json_path} not found.")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    db = SessionLocal()
    try:
        count = 0
        for name, cfg in data.items():
            # Check if already exists
            exists = db.query(FTPClient).filter(FTPClient.name == name).first()
            if not exists:
                client = FTPClient(
                    name=name,
                    host=cfg.get("host"),
                    user=cfg.get("user"),
                    password=cfg.get("password"),
                    path=cfg.get("path", "/"),
                    pattern=cfg.get("pattern", "PrinterMonitorClient.db3.*"),
                )
                db.add(client)
                count += 1
        db.commit()
        print(f"Migrated {count} clients to database.")
    except Exception as e:
        db.rollback()
        print(f"Error during migration: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    migrate()
