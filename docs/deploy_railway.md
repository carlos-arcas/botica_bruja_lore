# Despliegue en Railway (config-as-code)

Este proyecto se despliega en **dos servicios separados** en Railway:

1. **Backend Django** (API, admin y healthcheck).
2. **Frontend Next.js** (home pública y navegación de catálogo editorial/comercial).

> La home pública vive en el frontend. El backend expone API/admin/healthcheck.

---

## Backend (Django)

### Propósito del servicio
Servicio backend para:
- API pública (`/api/v1/herbal/...`)
- administración (`/admin/`)
- healthcheck (`/healthz`)

### Config-as-code
- **Archivo recomendado:** `/backend/railway.toml`
- Builder: `RAILPACK`
- `preDeployCommand`: aplica migraciones y ejecuta `collectstatic` antes del release.
- `healthcheckPath`: `/healthz`

### Variables requeridas (Railway Variables)
Configurar en la UI de Railway (no en `railway.toml`):

- `SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`
- `CSRF_TRUSTED_ORIGINS`
- `DATABASE_URL`

Referencia típica para base de datos gestionada por otro servicio (placeholder):

```env
DATABASE_URL=${{SERVICE_NAME.DATABASE_URL}}
```

> Sustituye `SERVICE_NAME` por el nombre real del servicio PostgreSQL en Railway.

### Verificación tras deploy
1. Confirmar deploy exitoso y ejecución de `preDeployCommand`.
2. Abrir `https://TU-BACKEND.up.railway.app/healthz` y verificar respuesta 200.
3. Validar acceso a `https://TU-BACKEND.up.railway.app/admin/`.
4. Validar endpoint público (por ejemplo listado herbal) bajo `/api/v1/herbal/...`.

---

## Frontend (Next.js)

### Propósito del servicio
Servicio frontend para la experiencia pública del sitio (home y rutas navegables del catálogo).

### Config-as-code
- **Root directory del servicio:** `frontend`
- **Archivo recomendado:** `/frontend/railway.toml`
- Builder: `RAILPACK`
- Start command: `npm run start`
- Healthcheck: `/`

### Variable requerida (Railway Variables)
- `NEXT_PUBLIC_API_BASE_URL`

Debe apuntar al backend ya desplegado, por ejemplo:

```env
NEXT_PUBLIC_API_BASE_URL=https://TU-BACKEND.up.railway.app
```

### Verificación tras deploy
Comprobar al menos estas rutas en el frontend desplegado:
- `/`
- `/hierbas`
- `/rituales`

---

## Resumen operativo

- Backend y frontend se gestionan como **servicios distintos** en Railway.
- Los secretos y variables se cargan desde **Railway Variables**, no desde los `railway.toml`.
- Config-as-code por servicio:
  - Backend: `/backend/railway.toml`
  - Frontend: `/frontend/railway.toml`
