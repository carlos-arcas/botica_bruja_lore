# Despliegue en Railway (backend + frontend)

Este repositorio está preparado para desplegarse en Railway con **dos servicios separados** y una base de datos PostgreSQL gestionada por Railway:

- **Servicio Backend (Django)**
- **Servicio Frontend (Next.js)**

> Punto crítico: el backend correcto de este repo arranca únicamente con:
>
> `gunicorn backend.configuracion_django.wsgi:application --bind 0.0.0.0:${PORT:-8000}`

---

## 1) Configuración por servicio (Railway)

### Backend (Django)
- Servicio independiente para API, admin y healthcheck.
- `Config file path`: `/backend/railway.toml`.
- `Start Command` efectivo (desde TOML):
  `gunicorn backend.configuracion_django.wsgi:application --bind 0.0.0.0:${PORT:-8000}`
- Healthcheck: `/healthz`.

### Frontend (Next.js)
- Servicio independiente para la web pública.
- `Root directory`: `frontend`.
- `Config file path`: `/frontend/railway.toml`.
- Healthcheck: `/`.

---

## 2) Variables que SÍ deben existir en Railway UI

### Backend
- `SECRET_KEY`
- `DEBUG=false`
- `DATABASE_URL` (provisionada por PostgreSQL en Railway)
- `ALLOWED_HOSTS` (CSV)
- `CSRF_TRUSTED_ORIGINS` (CSV con URLs completas)

### Frontend
- `NEXT_PUBLIC_API_BASE_URL` (URL pública del backend)

---

## 3) Variables legacy/conflictivas que deben ELIMINARSE en Railway UI

Si existen en el servicio backend, eliminarlas para evitar que Railway arranque configuración ajena o antigua:

- `APP_DEBUG`
- `DJANGO_SETTINGS_MODULE` (si apunta a rutas legacy o a otro proyecto)
- `WSGI_APPLICATION` (si fuerza un módulo distinto al del repo actual)
- cualquier variable que apunte a `presentacion/proyecto_web` o `configuracion/app_config`

> Nota: en este repo `manage.py` y `wsgi.py` ya fijan el settings module correcto (`backend.configuracion_django.settings`).

---

## 4) DATABASE_URL y separación de URLs públicas

### DATABASE_URL
- Debe provenir del servicio PostgreSQL de Railway.
- Ejemplo de referencia interna en Railway:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### URLs públicas esperadas
- **Backend:** `https://TU-BACKEND.up.railway.app`
- **Frontend:** `https://TU-FRONTEND.up.railway.app`

### Variable del frontend

```env
NEXT_PUBLIC_API_BASE_URL=https://TU-BACKEND.up.railway.app
```

---

## 5) Checklist operativa en Railway UI (obligatoria)

### Backend service
- [ ] Confirmar `Config file path=/backend/railway.toml`.
- [ ] Eliminar `APP_DEBUG` si existe.
- [ ] Eliminar `DJANGO_SETTINGS_MODULE` legacy/conflictivo si existe.
- [ ] Eliminar `WSGI_APPLICATION` legacy/conflictivo si existe.
- [ ] Definir `SECRET_KEY`.
- [ ] Definir `DEBUG=false`.
- [ ] Definir `DATABASE_URL` enlazada al servicio PostgreSQL.
- [ ] Definir `ALLOWED_HOSTS` (incluyendo dominio Railway backend).
- [ ] Definir `CSRF_TRUSTED_ORIGINS` (incluyendo `https://TU-BACKEND.up.railway.app`).

### Frontend service
- [ ] Confirmar `Root directory=frontend`.
- [ ] Confirmar `Config file path=/frontend/railway.toml`.
- [ ] Definir `NEXT_PUBLIC_API_BASE_URL=https://TU-BACKEND.up.railway.app`.

---

## 6) Verificación post-deploy

1. Backend responde en:
   - `GET https://TU-BACKEND.up.railway.app/healthz` → `200`.
2. Frontend responde en:
   - `GET https://TU-FRONTEND.up.railway.app/`.
3. El frontend consume la API correcta (`NEXT_PUBLIC_API_BASE_URL`).
4. En logs backend no aparecen rutas legacy tipo:
   - `presentacion/proyecto_web/wsgi.py`
   - `configuracion/app_config.py`

---

## 7) Errores típicos que indican configuración antigua en Railway

- Logs intentando cargar módulos que no existen en este repo (`presentacion/proyecto_web` o `configuracion/app_config`).
- Definición manual en UI de un `Start Command` distinto al del TOML.
- Variables heredadas (`DJANGO_SETTINGS_MODULE`, `WSGI_APPLICATION`, `APP_DEBUG`) que fuerzan rutas antiguas.
- `NEXT_PUBLIC_API_BASE_URL` apuntando a un backend equivocado.

---

## 8) Alcance de este documento

Este documento cubre despliegue estándar en Railway para demo fullstack con PostgreSQL. No cubre DNS custom, networking avanzado ni pipelines externos.
