import models
from fastapi import FastAPI, UploadFile, File, HTTPException, Body, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
import shutil
import json
from pathlib import Path
from services.db3_to_csv import procesar_db_a_csv
from services.ftp_db3 import download_db3_from_ftp
from services.sds_api import get_sds_clients, export_sds_meters_to_csv

app = FastAPI(title="HelpDeskManager API", version="3.0.0")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar el dominio del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("outputs")

UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

@app.get("/")
async def root():
    return {"message": "HelpDeskManager API is running", "version": "3.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

from services.ftp_db3 import download_db3_many_from_ftp
from services.stc_service import process_db3_to_ips, process_txt_to_ips
from services.counters_tools import (
    filtrar_falta_contador_csv, 
    procesar_suma_fija, 
    ejecutar_autoestimacion, 
    calcular_estimacion_manual
)
from services.ftp_nas_config import ensure_nas_ftp_config
from database import engine, SessionLocal, get_db
from models import FTPClient
import models
models.Base.metadata.create_all(bind=engine)
from sqlalchemy.orm import Session
# Depends already imported at top

from pydantic import BaseModel
from typing import List, Optional

class ClientSchema(BaseModel):
    name: str
    host: str
    user: str
    password: str
    path: str = "/"
    pattern: str = "PrinterMonitorClient.db3.*"

class ResourceSchema(BaseModel):
    name: str
    url: str
    category: str = "Otros"

@app.get("/api/ftp/clients")
async def get_ftp_clients(db: Session = Depends(get_db)):
    """Obtiene todos los clientes con su configuración."""
    try:
        clients = db.query(FTPClient).order_by(FTPClient.name).all()
        return {"clients": clients}
    except Exception as e:
        print(f"ERROR al listar clientes FTP: {e}")
        return {"clients": [], "error": str(e)}

@app.post("/api/ftp/clients")
async def create_ftp_client(client_data: ClientSchema, db: Session = Depends(get_db)):
    """Crea un nuevo cliente FTP."""
    try:
        # Verificar si ya existe
        existing = db.query(FTPClient).filter(FTPClient.name == client_data.name).first()
        if existing:
            raise HTTPException(status_code=400, detail="El cliente ya existe.")
            
        new_client = FTPClient(**client_data.dict())
        db.add(new_client)
        db.commit()
        db.refresh(new_client)
        return new_client
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/ftp/clients/{client_id}")
async def update_ftp_client(client_id: int, client_data: ClientSchema, db: Session = Depends(get_db)):
    """Actualiza un cliente FTP existente."""
    try:
        client = db.query(FTPClient).filter(FTPClient.id == client_id).first()
        if not client:
            raise HTTPException(status_code=404, detail="Cliente no encontrado.")
            
        for key, value in client_data.dict().items():
            setattr(client, key, value)
            
        db.commit()
        db.refresh(client)
        return client
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/ftp/clients/{client_id}")
async def delete_ftp_client(client_id: int, db: Session = Depends(get_db)):
    """Elimina un cliente FTP."""
    try:
        client = db.query(FTPClient).filter(FTPClient.id == client_id).first()
        if not client:
            raise HTTPException(status_code=404, detail="Cliente no encontrado.")
            
        db.delete(client)
        db.commit()
        return {"message": "Cliente eliminado correctamente."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# --- RESOURCE LINKS ENDPOINTS ---

@app.get("/api/resources")
async def get_resources(db: Session = Depends(get_db)):
    return db.query(models.ResourceLink).all()

@app.post("/api/resources")
async def create_resource(res: ResourceSchema, db: Session = Depends(get_db)):
    new_res = models.ResourceLink(**res.dict())
    db.add(new_res)
    db.commit()
    db.refresh(new_res)
    return new_res

@app.delete("/api/resources/{res_id}")
async def delete_resource(res_id: int, db: Session = Depends(get_db)):
    res = db.query(models.ResourceLink).filter(models.ResourceLink.id == res_id).first()
    if not res: raise HTTPException(status_code=404)
    db.delete(res)
    db.commit()
    return {"status": "deleted"}

@app.on_event("startup")
async def startup_seed():
    # Asegurar que las tablas existan
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        from models import ResourceLink, FTPClient
        
        # Seed ResourceLinks
        if db.query(ResourceLink).count() == 0:
            demo_links = [
                ResourceLink(name="Manual App Mobile", url="https://cdst-ar.github.io/ST/appmobile", category="Manuales"),
                ResourceLink(name="Instructivos Contadores/ST", url="https://sites.google.com/view/calendarict", category="Documentación"),
                ResourceLink(name="Manuales Impresoras", url="https://drive.google.com/drive/folders/backup", category="Otros"),
                ResourceLink(name="Envíos Logística", url="https://docs.google.com/spreadsheets/logs", category="Otros"),
            ]
            db.add_all(demo_links)
            db.commit()
            print("DEBUG: ResourceLinks seeded.")

        # Seed FTPClients from JSON
        if db.query(FTPClient).count() == 0:
            json_path = Path("ftp_clientes.json")
            if json_path.exists():
                with open(json_path, "r", encoding="utf-8") as f:
                    clients_data = json.load(f)
                
                new_clients = []
                for name, info in clients_data.items():
                    new_clients.append(FTPClient(
                        name=name,
                        host=info.get("host", ""),
                        user=info.get("user", ""),
                        password=info.get("password", ""),
                        path=info.get("path", "/"),
                        pattern=info.get("pattern", "PrinterMonitorClient.db3.*")
                    ))
                
                db.add_all(new_clients)
                db.commit()
                print(f"DEBUG: {len(new_clients)} FTPClients seeded from JSON.")
            else:
                print("WARNING: ftp_clientes.json not found for seeding.")
    except Exception as e:
        print(f"ERROR during seeding: {e}")
        db.rollback()
    finally:
        db.close()

@app.post("/api/ftp/process-client")
async def process_ftp_client(
    client_name: str = Body(..., embed=True), 
    fecha_maxima: str = Body(default="", embed=True),
    db: Session = Depends(get_db)
):
    """Descarga el DB3 de un cliente vía FTP (usando datos de la DB) y lo procesa."""
    try:
        client = db.query(FTPClient).filter(FTPClient.name == client_name).first()
        
        if not client:
            raise HTTPException(status_code=404, detail=f"Cliente '{client_name}' no encontrado en la base de datos.")
        
        # Mapear el modelo a un diccionario para que sea compatible con download_db3_from_ftp
        cfg_map = {
            client.name.upper(): {
                "host": client.host,
                "user": client.user,
                "password": client.password,
                "path": client.path,
                "pattern": client.pattern
            }
        }
        
        print(f"DEBUG: Descargando y Fusionando DB3s para {client_name}...")
        locales, remotos = download_db3_many_from_ftp(
            cliente=client_name,
            cfg_map=cfg_map,
            dest_dir=str(UPLOAD_DIR)
        )
        
        if not locales:
            raise HTTPException(status_code=404, detail="No se encontraron archivos en el FTP para este cliente.")

        local_path = locales[0] # Es el archivo fusionado
        print(f"DEBUG: Descarga y Fusión completada. Procesando {local_path}...")
        
        output_file_path = procesar_db_a_csv(
            archivos_db=[local_path],
            fecha_maxima=fecha_maxima,
            nombre_base_salida=f"{client_name}_FTP",
            carpeta_salida=str(OUTPUT_DIR)
        )
        
        output_path = Path(output_file_path)
        
        # Copiar el DB3 fusionado a la carpeta de salida para que sea descargable
        db3_output_name = f"{client_name}_merged.db3"
        db3_output_path = OUTPUT_DIR / db3_output_name
        shutil.copy(local_path, db3_output_path)
        
        return {
            "status": "success",
            "message": f"¡{client_name} procesado con éxito!",
            "csv_file": output_path.name,
            "db3_file": db3_output_name
        }
        
    except Exception as e:
        import traceback
        print(f"ERROR FTP/Procesamiento:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Limpieza de archivos temporales de FTP (todos los .db3 descargados o fusionados)
        for f in UPLOAD_DIR.glob("*.db3*"):
            try: f.unlink()
            except: pass

@app.get("/api/download/{filename}")
async def download_file(filename: str):
    """Descarga un archivo desde la carpeta de salida."""
    file_path = OUTPUT_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    
    # Determinar media_type según extensión
    media_type = "application/octet-stream"
    if filename.endswith(".csv"):
        media_type = "text/csv"
    elif filename.endswith(".db3"):
        media_type = "application/x-sqlite3"
        
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type=media_type
    )

@app.post("/api/stc/process-db3")
async def stc_process_db3(files: List[UploadFile] = File(...)):
    """Extrae IPs desde uno o varios DB3 y devuelve un TXT con rangos /24."""
    try:
        temp_paths = []
        for file in files:
            temp_path = UPLOAD_DIR / file.filename
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            temp_paths.append(str(temp_path))
            
        ranges, count = process_db3_to_ips(temp_paths)
        
        # Limpiar temporales
        for p in temp_paths:
            try: os.remove(p)
            except: pass
            
        if count == 0:
            raise HTTPException(status_code=400, detail="No se encontraron IPs válidas en los archivos proporcionados.")
            
        output_name = "direcciones_de_ip_db3.txt"
        output_path = OUTPUT_DIR / output_name
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(ranges)
            
        return {
            "status": "success",
            "message": f"Se generaron {count} rangos /24.",
            "file": output_name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/stc/process-txt")
async def stc_process_txt(file: UploadFile = File(...)):
    """Extrae IPs desde un TXT y devuelve un TXT con rangos /24."""
    try:
        content = (await file.read()).decode("utf-8", errors="ignore")
        ranges, count = process_txt_to_ips(content)
        
        if count == 0:
            raise HTTPException(status_code=400, detail="No se encontraron IPs válidas en el archivo proporcionado.")
            
        output_name = "direcciones_de_ip_txt.txt"
        output_path = OUTPUT_DIR / output_name
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(ranges)
            
        return {
            "status": "success",
            "message": f"Se generaron {count} rangos /24.",
            "file": output_name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.post("/api/tools/en0")
async def tool_en0(file: UploadFile = File(...), fecha: str = Form(...), cliente: str = Form(...)):
    """Limpiar a Cero / Estimación en 0."""
    try:
        temp_path = UPLOAD_DIR / file.filename
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        output_path = filtrar_falta_contador_csv(
            archivo_csv_entrada=str(temp_path),
            fecha_nueva=fecha,
            nombre_cliente=cliente,
            carpeta_salida=str(OUTPUT_DIR)
        )
        os.remove(temp_path)
        return {"status": "success", "file": Path(output_path).name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tools/suma-fija")
async def tool_suma_fija(files: List[UploadFile] = File(...), fecha: str = Form(...), hojas: int = Form(...)):
    """Suma Fija de hojas."""
    try:
        temp_paths = []
        for file in files:
            p = UPLOAD_DIR / file.filename
            with open(p, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            temp_paths.append(str(p))
            
        outputs = procesar_suma_fija(temp_paths, fecha, hojas, str(OUTPUT_DIR))
        for p in temp_paths: os.remove(p)
        
        return {"status": "success", "files": [Path(o).name for o in outputs]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tools/autoestim")
async def tool_autoestim(file: UploadFile = File(...), fecha: str = Form(...)):
    """Autoestimación de contadores."""
    try:
        temp_path = UPLOAD_DIR / file.filename
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        out1, out2 = ejecutar_autoestimacion(str(temp_path), fecha, str(OUTPUT_DIR))
        os.remove(temp_path)
        return {"status": "success", "files": [Path(out1).name, Path(out2).name]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tools/calc")
async def tool_calc(
    ci: int = Body(..., embed=True), 
    cf: int = Body(..., embed=True), 
    fi: str = Body(..., embed=True), 
    ff: str = Body(..., embed=True), 
    fe: str = Body(..., embed=True)
):
    """Calculadora Manual."""
    try:
        res = calcular_estimacion_manual(ci, cf, fi, ff, fe)
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/contadores/process-db3")
async def process_db3(file: UploadFile = File(...), fecha_maxima: str = Form("")):
    """Procesa un archivo DB3 y devuelve un CSV."""
    temp_path = UPLOAD_DIR / file.filename
    print(f"DEBUG: Iniciando procesamiento de {file.filename}")
    try:
        with temp_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        print(f"DEBUG: Archivo guardado en {temp_path}")
        
        # El script original devuelve la ruta completa del archivo generado
        output_file_path = procesar_db_a_csv(
            archivos_db=[str(temp_path)],
            fecha_maxima=fecha_maxima,
            nombre_base_salida=file.filename.replace(".db3", ""),
            carpeta_salida=str(OUTPUT_DIR)
        )
        
        print(f"DEBUG: Archivo generado en {output_file_path}")
        
        output_path = Path(output_file_path)
        if not output_path.exists():
             print(f"ERROR: El archivo generado no existe en {output_file_path}")
             raise HTTPException(status_code=500, detail="Error: El archivo procesado no se encontró en el disco.")

        return FileResponse(
            path=output_path,
            filename=output_path.name,
            media_type="text/csv"
        )
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"ERROR durante el procesamiento:\n{error_trace}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if temp_path.exists():
            temp_path.unlink()
            print(f"DEBUG: Archivo temporal {temp_path} eliminado")

@app.get("/api/sds/clients")
async def sds_clients_list():
    """Devuelve la lista de clientes desde la API de SDS."""
    try:
        clients = get_sds_clients()
        return {"status": "success", "clients": clients}
    except Exception as e:
        import traceback
        print(f"ERROR obteniendo clientes SDS:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/sds/process")
async def sds_process_meters(
    customer_id: int = Body(..., embed=True),
    customer_name: str = Body(..., embed=True),
    fecha_maxima: str = Body(..., embed=True),
    suma_color: bool = Body(False, embed=True),
):
    """Obtiene los contadores de SDS y los exporta a CSV."""
    try:
        csv_path_str = export_sds_meters_to_csv(
            customer_id, customer_name, fecha_maxima, str(OUTPUT_DIR),
            suma_color=suma_color
        )
        csv_path = Path(csv_path_str)
        return {
            "status": "success",
            "message": f"¡Contadores de {customer_name} exportados con éxito!",
            "csv_file": csv_path.name
        }
    except Exception as e:
        import traceback
        print(f"ERROR procesando contadores SDS:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8010)
