# Despliegue en Railway (backend + frontend)

Este repositorio se despliega en Railway como **dos servicios separados**:

1. **Backend Django** (API, admin, healthcheck).
2. **Frontend Next.js** (sitio público).

## Configuración recomendada por servicio

### Backend

- **Config file path:** `/backend/railway.toml`
- Builder: `RAILPACK`
- Start command: Gunicorn sobre Django WSGI
- Pre-deploy: `migrate` + `collectstatic`
- Healthcheck: `/healthz`

### Frontend

- **Root directory del servicio:** `frontend`
- **Config file path:** `/frontend/railway.toml`
- Builder: `RAILPACK`
- Start command: `npm run start`
- Healthcheck: `/`

## Variables requeridas en Railway UI

> Definir en la UI de Railway (no en `railway.toml`).

### Backend

- `SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`
- `CSRF_TRUSTED_ORIGINS`
- `DATABASE_URL`

Ejemplo de referencia para PostgreSQL en Railway:

```env
DATABASE_URL=${{SERVICE_NAME.DATABASE_URL}}
```

### Frontend

- `NEXT_PUBLIC_API_BASE_URL`

Ejemplo:

```env
NEXT_PUBLIC_API_BASE_URL=https://TU-BACKEND.up.railway.app
```

## Pasos básicos post-deploy

1. Verificar que el backend arranca y ejecuta `preDeployCommand`.
2. Comprobar backend en `https://TU-BACKEND.up.railway.app/healthz` (200 esperado).
3. Comprobar backend admin/API en su dominio de backend (`/admin/`, `/api/v1/...`).
4. Comprobar frontend en su dominio de frontend (`/`, `/hierbas`, `/rituales`).
5. Confirmar que `NEXT_PUBLIC_API_BASE_URL` apunta al dominio backend correcto.

## URLs esperadas por servicio

- **URL backend:** dominio Railway del servicio Django (usa `/healthz` para verificación de vida).
- **URL frontend:** dominio Railway del servicio Next.js (experiencia pública).

## Fuera de alcance de este documento

- DNS custom, certificados y dominios propios.
- Estrategias avanzadas de observabilidad/alertado.
- CI/CD externo y políticas de promoción entre entornos.
