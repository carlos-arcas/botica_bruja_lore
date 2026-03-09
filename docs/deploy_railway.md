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
- `DATABASE_URL` (inyectada desde el servicio PostgreSQL)
- `ALLOWED_HOSTS` (CSV)
- `CSRF_TRUSTED_ORIGINS` (CSV con URLs completas)

### Frontend
- `NEXT_PUBLIC_API_BASE_URL` con la URL pública del backend.

## 3) Variables legacy que deben eliminarse en Railway UI

Si existen en el servicio backend, eliminarlas para evitar arranque con configuración antigua:

- `APP_DEBUG`
- `DJANGO_SETTINGS_MODULE`
- `WSGI_APPLICATION`

También elimina cualquier variable manual que apunte a rutas legacy como:
- `presentacion/proyecto_web`
- `configuracion/app_config`

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
- `Start Command` manual en UI distinto al definido en `backend/railway.toml`.
- Variables legacy (`APP_DEBUG`, `DJANGO_SETTINGS_MODULE`, `WSGI_APPLICATION`) aún presentes.
- Frontend apuntando a una API incorrecta en `NEXT_PUBLIC_API_BASE_URL`.
