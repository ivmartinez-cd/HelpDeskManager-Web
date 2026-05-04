import os
import numpy as np
import pandas as pd
from datetime import datetime
from typing import Tuple, List


# --- COMMON UTILS ---
def _validar_fecha_dmy(fecha: str) -> datetime:
    try:
        return datetime.strptime(fecha, "%d/%m/%Y")
    except ValueError:
        raise ValueError("La fecha debe tener formato DD/MM/YYYY")


# --- 1) ESTIMACIÓN EN 0 (Limpiar a Cero) ---
def filtrar_falta_contador_csv(
    archivo_csv_entrada: str,
    fecha_nueva: str,
    nombre_cliente: str,
    carpeta_salida: str,
    delimiter_entrada: str = ";",
) -> str:
    if not os.path.isfile(archivo_csv_entrada):
        raise FileNotFoundError(f"No existe el archivo: {archivo_csv_entrada}")
    _validar_fecha_dmy(fecha_nueva)

    try:
        # Detectar automáticamente el separador y manejar BOM de Excel
        datos = pd.read_csv(archivo_csv_entrada, sep=None, engine="python", encoding="utf-8-sig")
    except Exception as exc:
        raise ValueError(f"No se pudo leer el CSV de entrada: {exc}")

    # Limpiar espacios en blanco en los encabezados
    datos.columns = datos.columns.astype(str).str.strip()

    if "Tipo" not in datos.columns:
        raise KeyError("La columna 'Tipo' no existe en el CSV de entrada.")

    datos = datos[
        datos["Tipo"].str.contains("FALTA CONTADOR", na=False, case=False)
    ].copy()
    if datos.empty:
        raise ValueError("No se encontraron filas con Tipo == 'FALTA CONTADOR'.")

    # Transformación similar a la original
    rename_map = {
        "Nro_serie": "SERIE",
        "FechaTomaContadorAnterior1": "FECHA",
        "ImpreContadorAnterior": "CONTADOR",
    }
    datos.rename(
        columns={k: v for k, v in rename_map.items() if k in datos.columns},
        inplace=True,
    )

    datos["FECHA"] = fecha_nueva
    datos["TIPO"] = "14"
    datos["CLASE_10"] = ""
    datos["CONTADOR_10"] = 0
    datos["CLASE_20"] = ""
    datos["CONTADOR_20"] = 0

    if "NombreClase" in datos.columns:
        es_color = datos["NombreClase"] == "Color"
        datos.loc[es_color, "CLASE_20"] = "20"
        datos.loc[es_color, "CONTADOR_20"] = datos.loc[es_color, "CONTADOR"]
        datos.loc[~es_color, "CLASE_10"] = "10"
        datos.loc[~es_color, "CONTADOR_10"] = datos.loc[~es_color, "CONTADOR"]

    columnas_finales = [
        "SERIE",
        "FECHA",
        "TIPO",
        "CLASE_10",
        "CONTADOR_10",
        "CLASE_20",
        "CONTADOR_20",
        "MOTIVO",
        "OBSERVACION",
    ]
    for col in columnas_finales:
        if col not in datos.columns:
            datos[col] = ""

    datos = (
        datos[columnas_finales]
        .groupby(["SERIE", "FECHA", "TIPO"], as_index=False)
        .agg(
            {
                "CLASE_10": "first",
                "CONTADOR_10": "max",
                "CLASE_20": "first",
                "CONTADOR_20": "max",
                "MOTIVO": "first",
                "OBSERVACION": "first",
            }
        )
    )

    nombre_archivo = f"{nombre_cliente}_Limpieza_Cero.csv"
    ruta_salida = os.path.join(carpeta_salida, nombre_archivo)
    datos.to_csv(
        ruta_salida, sep=";", index=False, encoding="utf-8", lineterminator="\r\n"
    )
    return ruta_salida


# --- 2) SUMA FIJA ---
def procesar_suma_fija(
    archivos_xls: List[str], fecha_usuario: str, hojas_a_sumar: int, carpeta_salida: str
) -> List[str]:
    fecha_actual = _validar_fecha_dmy(fecha_usuario).strftime("%d/%m/%Y")
    rutas_salida = []

    for archivo_xls in archivos_xls:
        try:
            datos = pd.read_excel(archivo_xls)
        except Exception as e:
            print(f"Error leyendo excel {archivo_xls}: {e}")
            continue

        if "Nro Serie" in datos.columns:
            datos.rename(columns={"Nro Serie": "SERIE"}, inplace=True)

        datos["FECHA"] = fecha_actual
        datos["TIPO"] = "14"
        datos["CLASE"] = "10"

        datos["CONTADOR"] = np.where(
            (datos["Estado"] == "Desaparecida") | (datos["Estado"] == "Backup Fijo"),
            datos["Cdor Actual"],
            np.where(
                datos["Cdor Actual"] == 1,
                datos["Cdor Actual"],
                np.where(
                    (datos["Estado"] == "Activa en Cliente")
                    & (datos["Cdor Actual"] != 1),
                    datos["Cdor Actual"] + int(hojas_a_sumar),
                    "",
                ),
            ),
        )

        base = os.path.splitext(os.path.basename(archivo_xls))[0]
        archivo_csv = os.path.join(carpeta_salida, f"{base}_SumaFija.csv")
        datos.to_csv(archivo_csv, index=False, sep=";")
        rutas_salida.append(archivo_csv)

    return rutas_salida


# --- 3) AUTOESTIMACIÓN ---
def ejecutar_autoestimacion(
    ruta_csv_detalle: str, fecha_nueva: str, carpeta_salida: str
) -> Tuple[str, str]:
    df = pd.read_csv(ruta_csv_detalle, sep=None, engine="python", encoding="utf-8-sig")
    df.columns = df.columns.astype(str).str.strip()

    df = df[df["Tipo"].astype(str).str.strip().str.lower() == "estimado"].copy()
    if df.empty:
        raise ValueError("No se encontraron registros con Tipo = 'Estimado'.")

    # Normalización
    if "Nro_serie" in df.columns:
        df["Nro_serie"] = df["Nro_serie"].astype(str).str.strip().str.upper()
    df["ContActual"] = (
        pd.to_numeric(df["ContActual"], errors="coerce").fillna(0).astype(int)
    )
    df["Impresiones_Realizadas"] = (
        pd.to_numeric(df["Impresiones_Realizadas"], errors="coerce")
        .fillna(0)
        .astype(int)
    )

    df["ContadorNuevo"] = df["ContActual"] + df["Impresiones_Realizadas"]
    df["FechaNueva"] = fecha_nueva

    # CSV 1: Importación
    df_import = df[
        [
            "Nro_serie",
            "FechaNueva",
            "ContadorNuevo",
            "ContActual",
            "Impresiones_Realizadas",
        ]
    ].copy()
    df_import.columns = ["SERIE", "FECHA", "CONTADOR", "CONT_ANT", "IMP_EST"]

    # CSV 2: Formato 14/10/20
    clase = df["NombreClase"].astype(str).str.strip().str.lower()
    df_formato = pd.DataFrame(
        {
            "SERIE": df["Nro_serie"],
            "FECHA": fecha_nueva,
            "TIPO": 14,
            "CLASE10": 10,
            "CONTADOR": df["ContadorNuevo"].where(clase.eq("mono"), ""),
            "CLASE20": 20,
            "CONTADOR20": df["ContadorNuevo"].where(clase.eq("color"), ""),
            "MOTIVO": "",
            "OBSERVACIONES": "",
        }
    )

    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    path1 = os.path.join(carpeta_salida, f"import_autoestim_{stamp}.csv")
    path2 = os.path.join(carpeta_salida, f"formato_14_10_20_{stamp}.csv")

    df_import.to_csv(path1, index=False, sep=";")
    df_formato.to_csv(path2, index=False, sep=";")

    return path1, path2


# --- 4) CALCULADORA (Estimador Manual) ---
def dias_360(start_date: datetime, end_date: datetime) -> int:
    d1 = min(30, start_date.day)
    d2 = end_date.day
    if d1 == 30 and d2 == 31:
        d2 = 30
    return (
        (end_date.year - start_date.year) * 360
        + (end_date.month - start_date.month) * 30
        + (d2 - d1)
    )


def calcular_estimacion_manual(ci: int, cf: int, fi_str: str, ff_str: str, fe_str: str):
    fi = _validar_fecha_dmy(fi_str)
    ff = _validar_fecha_dmy(ff_str)
    fe = _validar_fecha_dmy(fe_str)

    ndias = dias_360(fi, ff)
    if ndias <= 0:
        raise ValueError("Rango de días inválido")

    ndias_est = dias_360(ff, fe)
    imp_dia = round((cf - ci) / ndias, 2)
    imp_mes = round(imp_dia * 30, 2)

    imp_est = math.ceil(imp_dia * ndias_est)
    cont_est = cf + imp_est

    return {
        "imp_dia": imp_dia,
        "imp_mes": imp_mes,
        "dias_est": ndias_est,
        "cont_est": cont_est,
        "imp_est": imp_est,
    }


import math
