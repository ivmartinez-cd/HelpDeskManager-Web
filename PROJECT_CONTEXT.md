# Mapa de Contexto del Proyecto: HelpDeskManager-Web

Este archivo centraliza el conocimiento sobre la infraestructura, directorios y configuración de despliegue de HelpDeskManager-Web para asegurar la continuidad entre sesiones de agentes de IA y desarrolladores.

---

## 🌐 1. Arquitectura de Despliegue

### 🎨 Frontend
- **Framework**: Next.js 15+ (App Router, TypeScript).
- **Alojamiento**: Vercel (CI/CD conectado a GitHub).
- **URL de Producción**: `https://help-desk-manager-web-git-fi-e39093-ivmartinezcd-8237s-projects.vercel.app/`
- **Integración con Backend**: 
  - La variable de entorno `BACKEND_URL` en Vercel apunta al Backend en la VM de GCP.
  - El frontend reescribe las llamadas `/api/:path*` hacia el backend en `${BACKEND_URL}/api/:path*` (definido en `next.config.ts`).

### ⚙️ Backend
- **Framework**: FastAPI (Python 3.12).
- **Alojamiento**: Máquina Virtual (VM) en Google Cloud Platform (GCP).
- **Configuración de la VM**:
  - **Proyecto GCP**: `clean-circuit-405918`
  - **Instancia**: `instance-20260529-143249`
  - **Zona**: `us-central1-a`
  - **IP Externa**: `34.63.48.46`
  - **IP Interna**: `10.128.0.2`
  - **Puerto del Backend**: `8010` (mapeado desde el contenedor a `0.0.0.0:8010`)
- **Directorio del Proyecto en la VM**: `/home/ivmartinez_cd/HelpDeskManager-Web`
  - **Propietario del Directorio**: `ivmartinez_cd:ivmartinez_cd`
  - **Acceso SSH (gcloud)**: Se accede mediante `gcloud compute ssh instance-20260529-143249 --project clean-circuit-405918 --zone us-central1-a`. 
  - **Nota de Permisos**: La sesión SSH inicia por defecto como el usuario `imartinez`. Para operar dentro del directorio del proyecto `/home/ivmartinez_cd/...`, se deben usar comandos prefijados con `sudo` o `sudo -u ivmartinez_cd`.

- **Contenedores Docker Activos en la VM**:
  - `helpdesk-backend` (Imagen `helpdeskmanager-web-backend:latest`): Expone puerto `8010`.
  - `printer-logs-analyzer-backend-1` (Imagen `printer-logs-analyzer-backend:latest`): Expone puerto `8082`.
  - `printer-logs-analyzer-db-1` (Imagen `postgres:17-alpine`): Expone base de datos PostgreSQL local en puerto `5432`.

---

## 🗄️ 2. Base de Datos
- **Motor Principal**: PostgreSQL alojado en **Neon** (servidor serverless en AWS).
- **URL de Conexión (DATABASE_URL)**: `postgresql://neondb_owner:npg_TF7LyjxW6kEO@ep-icy-smoke-adpxoqpt.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require` (definida en el archivo `.env` tanto local como en la VM).

---

## 🔑 3. Integración de Epson Remote Services (ERS)
- **Credenciales**: Configuradas en `backend/.env` (`EPSON_ERS_USERNAME`, `EPSON_ERS_PASSWORD`).
- **Archivo de Token**: Generado en `backend/data/ers_token.json` mediante un navegador headless gestionado por Playwright en [ers_token_refresher.py](file:///c:/Users/imartinez.CDSA/Desktop/Proyectos/HelpDeskManager-Web/backend/services/ers_token_refresher.py).
- **Gitignore**: La carpeta `backend/data/` está ignorada por Git.
- **Flujo de Ejecución**:
  - Al consultar `/api/ers/clients`, si el token local expiró o no existe, el backend ejecuta `ers_token_refresher.py` en un subproceso para recrear el token.
  - Esto requiere que Playwright y sus dependencias de Chromium estén correctamente instalados y compilados en la imagen de Docker en ejecución.
