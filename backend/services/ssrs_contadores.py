import base64
import os

SSRS_BASE = os.getenv("SSRS_BASE", "http://reportes.cdsa.com.ar:8090")
SSRS_REPORT_PATH = "/Impresión/Contadores Facturables por empresa"
SSRS_NS = "http://schemas.microsoft.com/sqlserver/2005/06/30/reporting/reportingservices"


class SsrsContadoresClient:
    def __init__(self):
        self._client = None
        self._empresas: dict[str, str] = {}

    def _get_client(self):
        if self._client is not None:
            return self._client
        import requests
        from requests_ntlm import HttpNtlmAuth
        from zeep import Client
        from zeep.transports import Transport

        user = os.getenv("SSRS_USER", "")
        password = os.getenv("SSRS_PASSWORD", "")
        domain = os.getenv("SSRS_DOMAIN", "")

        if not user or not password:
            raise RuntimeError(
                "Credenciales SSRS no configuradas. "
                "Defina SSRS_USER, SSRS_PASSWORD y SSRS_DOMAIN en el entorno."
            )

        session = requests.Session()
        ntlm_user = f"{domain}\\{user}" if domain else user
        session.auth = HttpNtlmAuth(ntlm_user, password)
        transport = Transport(session=session, timeout=120)
        wsdl = f"{SSRS_BASE}/Reports_ws/ReportExecution2005.asmx?WSDL"
        self._client = Client(wsdl, transport=transport)
        return self._client

    def _exec_header(self, exec_id: str):
        from lxml import etree
        h = etree.Element(f"{{{SSRS_NS}}}ExecutionHeader")
        e = etree.SubElement(h, f"{{{SSRS_NS}}}ExecutionID")
        e.text = exec_id
        return h

    def obtener_empresas(self) -> list[str]:
        from zeep.helpers import serialize_object
        client = self._get_client()
        r1 = client.service.LoadReport(Report=SSRS_REPORT_PATH, HistoryID=None)
        d1 = serialize_object(r1)
        exec_info = d1["body"]["executionInfo"]
        valid_values = (
            exec_info["Parameters"]["ReportParameter"][0]["ValidValues"]["ValidValue"]
        )
        self._empresas = {vv["Label"]: vv["Value"] for vv in valid_values}
        # Reset client so next call gets a fresh execution
        self._client = None
        return sorted(self._empresas.keys())

    def descargar_excel(self, empresa_label: str) -> bytes:
        from zeep.helpers import serialize_object

        if not self._empresas:
            self.obtener_empresas()

        empresa_id = self._empresas.get(empresa_label)
        if not empresa_id:
            raise ValueError(f"Empresa '{empresa_label}' no encontrada en el servidor SSRS.")

        client = self._get_client()

        # LoadReport
        r1 = client.service.LoadReport(Report=SSRS_REPORT_PATH, HistoryID=None)
        d1 = serialize_object(r1)
        exec_id = d1["header"]["ExecutionHeader"]["ExecutionID"]

        # SetExecutionParameters
        ParameterValue = client.get_type(f"{{{SSRS_NS}}}ParameterValue")
        ArrayOfPV = client.get_type(f"{{{SSRS_NS}}}ArrayOfParameterValue")
        param = ParameterValue(Name="Empresa", Value=empresa_id)
        params_array = ArrayOfPV(ParameterValue=[param])

        r2 = client.service.SetExecutionParameters(
            Parameters=params_array,
            ParameterLanguage="es-AR",
            _soapheaders=[self._exec_header(exec_id)],
        )
        d2 = serialize_object(r2)
        new_exec_id = (
            d2.get("header", {}).get("ExecutionHeader", {}).get("ExecutionID", exec_id)
        )

        # Render EXCELOPENXML
        r3 = client.service.Render(
            Format="EXCELOPENXML",
            DeviceInfo="",
            _soapheaders=[self._exec_header(new_exec_id)],
        )
        d3 = serialize_object(r3)
        body3 = d3.get("body", d3)
        result = body3.get("Result") if isinstance(body3, dict) else None

        if not result:
            raise RuntimeError("SSRS no devolvió datos (Result vacío).")
        if isinstance(result, str):
            result = base64.b64decode(result)

        self._client = None
        return bytes(result)


_ssrs_client = SsrsContadoresClient()


def obtener_empresas_ssrs() -> list[str]:
    return _ssrs_client.obtener_empresas()


def descargar_excel_ssrs(empresa: str) -> bytes:
    return _ssrs_client.descargar_excel(empresa)
