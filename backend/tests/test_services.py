import os
import sqlite3
import pandas as pd
from services.stc_service import process_txt_to_ips, process_db3_to_ips
from services.db3_to_csv import procesar_db_a_csv

def test_process_txt_to_ips():
    # Test text parsing to IP ranges
    content = "Printers are at 192.168.1.10 and 192.168.2.55"
    ranges, count = process_txt_to_ips(content)
    assert count == 2
    assert "192.168.1.1-192.168.1.254" in ranges
    assert "192.168.2.1-192.168.2.254" in ranges

def test_db3_to_csv_dummy(tmp_path):
    # Create a dummy sqlite DB with required columns
    db_path = tmp_path / "test.db3"
    conn = sqlite3.connect(db_path)
    conn.execute("CREATE TABLE counters (serialnumber TEXT, readdate TEXT, readvalue INTEGER, model TEXT, counterclass_id INTEGER)")
    conn.execute("INSERT INTO counters (serialnumber, readdate, readvalue, model, counterclass_id) VALUES ('SN001', '2026-04-27 10:00:00', 1000, 'TestModel', 10)")
    conn.commit()
    conn.close()

    output_dir = tmp_path / "output"
    output_dir.mkdir()
    
    # Process it
    csv_path = procesar_db_a_csv(
        archivos_db=[str(db_path)],
        fecha_maxima="",
        nombre_base_salida="test_output",
        carpeta_salida=str(output_dir)
    )
    
    assert os.path.exists(csv_path)
    df = pd.read_csv(csv_path)
    assert not df.empty
    # El CSV generado tiene estas columnas específicas
    assert "CONTADOR_10" in df.columns
    assert df.iloc[0]["CONTADOR_10"] == 1000
