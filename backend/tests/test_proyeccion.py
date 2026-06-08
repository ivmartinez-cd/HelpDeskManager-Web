import os
import pandas as pd
from datetime import date
from services.proyeccion_contadores import ejecutar_proyeccion


def test_ejecutar_proyeccion_basica(tmp_path):
    # Crear datos dummy con estructura de SSRS (Fila 0: Título, Fila 1: Headers)
    datos = [
        ["Reporte Contadores de Impresoras", "", "", "", "", "", ""],
        ["Articulo", "Nro Serie", "Sector", "Fecha", "Tipo Contador", "Clase", "Contador"],
        # Serie A: Lectura real en la fecha de toma (15/05/2026) -> método REAL
        ["Kyocera 3560", "SER-A001", "Administración", "01/03/2026", "Lectura de Consola", "Mono", 50000],
        ["Kyocera 3560", "SER-A001", "Administración", "01/04/2026", "Lectura de Consola", "Mono", 52500],
        ["Kyocera 3560", "SER-A001", "Administración", "15/05/2026", "Lectura de Consola", "Mono", 55000],
        # Serie B: Sin lectura en la fecha de toma -> método PROYECTADO
        # Crecimiento de 1500 copias en 30 días (50 copias/día)
        # Desde 01/04/2026 (33000) a 15/05/2026 (44 días) -> 33000 + 50 * 44 = 35200
        ["HP LaserJet", "SER-B002", "Ventas", "01/02/2026", "Lectura de Consola", "Color", 30000],
        ["HP LaserJet", "SER-B002", "Ventas", "01/03/2026", "Lectura de Consola", "Color", 31500],
        ["HP LaserJet", "SER-B002", "Ventas", "01/04/2026", "Lectura de Consola", "Color", 33000],
    ]

    # Guardar en archivo Excel
    excel_path = tmp_path / "contadores_test.xlsx"
    df = pd.DataFrame(datos)
    df.to_excel(excel_path, header=False, index=False)

    output_dir = tmp_path / "output"
    output_dir.mkdir()

    fecha_toma = date(2026, 5, 15)

    # Ejecutar la proyección
    ruta_excel, ruta_csv, logs, kpi_stats, records, validation = ejecutar_proyeccion(
        file_input=str(excel_path),
        fecha_toma=fecha_toma,
        folder_salida=str(output_dir),
        tolerancia_dias=2,
        min_dias_intervalo=1,
        ventana_reciente_dias=365,
        umbral_minimo_consumo=0.2,
        max_antiguedad_lectura_dias=365
    )

    # Verificar kpi_stats y records
    assert kpi_stats is not None
    assert isinstance(records, list)
    assert len(records) == 2
    assert isinstance(validation, list)

    # Verificar que los archivos existan
    assert os.path.exists(ruta_excel)
    assert os.path.exists(ruta_csv)

    # Leer resultados de Proyección
    df_res = pd.read_excel(ruta_excel, sheet_name="Proyeccion")
    assert len(df_res) == 2

    # Verificar Serie A (REAL)
    row_a = df_res[df_res["Nro Serie"] == "SER-A001"].iloc[0]
    assert row_a["Metodo"] == "REAL"
    assert row_a["Contador Proyectado"] == 55000

    # Verificar Serie B (PROYECTADO)
    row_b = df_res[df_res["Nro Serie"] == "SER-B002"].iloc[0]
    assert row_b["Metodo"] == "PROYECTADO"
    assert round(row_b["Consumo Diario Promedio"], 4) == 50.9793
    assert row_b["Dias Proyectados"] == 44
    assert row_b["Contador Proyectado"] == 35243

    # Leer resultados de SiGes (CSV)
    df_siges = pd.read_csv(ruta_csv, sep=";")
    # Solo las series PROYECTADAS van al CSV de SiGes
    assert len(df_siges) == 1
    assert df_siges.iloc[0]["SERIE"] == "SER-B002"
    assert df_siges.iloc[0]["CONTADOR_20"] == 35243
