# Despliegue en Railway

Este proyecto se despliega en Railway con **dos servicios separados**:
- **Backend Django**
- **Frontend Next.js**

## Configuración recomendada por servicio

### Backend
- Servicio independiente para API, admin y healthcheck.
- `Config file path`: `/backend/railway.toml`.
- Builder recomendado: `RAILPACK`.
- Healthcheck: `/healthz`.

### Frontend
- Servicio independiente para web pública.
- `Root directory`: `frontend`.
- `Config file path`: `/frontend/railway.toml`.
- Builder recomendado: `RAILPACK`.
- Healthcheck: `/`.

## Variables requeridas en Railway UI

### Backend
- `SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`
- `CSRF_TRUSTED_ORIGINS`
- `DATABASE_URL`

### Frontend
- `NEXT_PUBLIC_API_BASE_URL`

## Ejemplos de variables

```env
DATABASE_URL=${{SERVICE_NAME.DATABASE_URL}}
```

```env
NEXT_PUBLIC_API_BASE_URL=https://TU-BACKEND.up.railway.app
```

## Pasos básicos post-deploy

1. Confirmar que el backend inicia sin errores.
2. Verificar `https://TU-BACKEND.up.railway.app/healthz` con respuesta 200.
3. Verificar frontend en su dominio Railway (`/`).
4. Confirmar que `NEXT_PUBLIC_API_BASE_URL` apunta al backend correcto.

## URLs esperadas por servicio

- **Backend:** `https://TU-BACKEND.up.railway.app`
- **Frontend:** `https://TU-FRONTEND.up.railway.app`

## Fuera de alcance del documento

- DNS custom y dominios propios.
- Certificados avanzados y políticas de red.
- CI/CD externo y promoción entre entornos.
