# Deploy en Railway (fullstack: backend + frontend)

Este repo se despliega en Railway con **dos servicios separados** y una base de datos PostgreSQL:

1. **Backend (Django)**
2. **Frontend (Next.js)**
3. **PostgreSQL (servicio gestionado en Railway)**

## 1) Configuración obligatoria por servicio

### Backend (Django)
- Servicio dedicado para API, admin y healthcheck.
- `Config file path`: `/backend/railway.toml`
- Start command correcto de este repo:

```bash
gunicorn backend.configuracion_django.wsgi:application --bind 0.0.0.0:${PORT:-8000}
```

- Healthcheck esperado: `/healthz`

### Frontend (Next.js)
- Servicio dedicado para la web pública.
- `Root directory`: `frontend`
- `Config file path`: `/frontend/railway.toml`
- El frontend **no** debe compartir servicio con Django.

## 2) Variables requeridas en Railway UI

### Backend
- `SECRET_KEY`
- `DEBUG=false`
- `DATABASE_URL` **obligatoria** (inyectada desde el servicio PostgreSQL).
  - Si falta en Railway/producción, el backend falla por diseño con error de configuración temprano.
- `ALLOWED_HOSTS` (CSV)
- `CSRF_TRUSTED_ORIGINS` (CSV con URLs completas)

### Frontend
- `NEXT_PUBLIC_API_BASE_URL` con la URL pública del backend.


## 2.1) Regla de seguridad para base de datos

- En local/desarrollo, si `DATABASE_URL` no existe, el backend usa fallback a SQLite en `var/dev.sqlite3`.
- En Railway/producción, `DATABASE_URL` es obligatoria y no existe fallback a SQLite.
- Si falta `DATABASE_URL` en Railway, Django aborta arranque con: `DATABASE_URL es obligatoria en Railway/producción.`
- Este fallo es intencionado para evitar deploys “aparentemente correctos” conectados a una base equivocada.


## 3) Variables legacy que deben eliminarse en Railway UI

Aunque este repo **ya fuerza por código** `backend.configuracion_django.settings` en `manage.py` y `backend/configuracion_django/wsgi.py`, hay que limpiar variables antiguas para evitar configuraciones ambiguas en Railway UI.

Si existen en el servicio backend, eliminarlas:

- `APP_DEBUG`
- `DJANGO_SETTINGS_MODULE`
- `WSGI_APPLICATION`
- `Start Command` manual heredado en UI (dejar que prevalezca `backend/railway.toml`)

Este hardening reduce el riesgo de que Railway arranque otro proyecto/settings por arrastre histórico, pero la limpieza de UI sigue siendo obligatoria para cerrar el riesgo operativo.

## 4) URLs y conexión entre servicios

- URL pública backend: `https://TU-BACKEND.up.railway.app`
- URL pública frontend: `https://TU-FRONTEND.up.railway.app`

`NEXT_PUBLIC_API_BASE_URL` (en frontend) debe apuntar al backend:

```env
NEXT_PUBLIC_API_BASE_URL=https://TU-BACKEND.up.railway.app
```

## 5) Cómo configurar `DATABASE_URL`

En Railway, `DATABASE_URL` debe referenciar el servicio PostgreSQL real del proyecto.

```env
DATABASE_URL=${{SERVICE_NAME.DATABASE_URL}}
```

Reemplaza `SERVICE_NAME` por el nombre real del servicio Postgres en Railway UI.

## 6) Verificaciones tras deploy

1. `GET https://TU-BACKEND.up.railway.app/healthz` responde `200`.
2. `GET https://TU-FRONTEND.up.railway.app/` responde correctamente.
3. Frontend consume API desde `NEXT_PUBLIC_API_BASE_URL`.
4. Logs backend sin imports/rutas legacy.

## 7) Síntomas de configuración antigua en Railway UI

Si aparece alguno de estos síntomas, Railway sigue usando configuración residual:

- Logs intentando cargar `presentacion/proyecto_web` o `configuracion/app_config`.
- `Start Command` manual en UI distinto al definido en `backend/railway.toml` (puede saltarse el flujo esperado).
- Variables legacy (`APP_DEBUG`, `DJANGO_SETTINGS_MODULE`, `WSGI_APPLICATION`) aún presentes.
- Frontend apuntando a una API incorrecta en `NEXT_PUBLIC_API_BASE_URL`.
