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
PYTHONPATH=${PYTHONPATH:-$(pwd)}:${PYTHONPATH:-} gunicorn backend.configuracion_django.wsgi:application --bind 0.0.0.0:${PORT:-8000}
```

- `PYTHONPATH` se fija explícitamente para soportar despliegues donde el servicio ejecuta comandos con `root directory` en `backend` o en la raíz del monorepo.

- Healthcheck esperado: `/healthz`

- `preDeployCommand` esperado:

```bash
PYTHONPATH=${PYTHONPATH:-$(pwd)}:${PYTHONPATH:-} python ${DJANGO_MANAGE_PATH:-manage.py} migrate --noinput && \
PYTHONPATH=${PYTHONPATH:-$(pwd)}:${PYTHONPATH:-} python ${DJANGO_MANAGE_PATH:-manage.py} collectstatic --noinput
```

- `DJANGO_MANAGE_PATH` es opcional:
  - valor por defecto: `manage.py` (estructura actual del repo),
  - valor alternativo: `../manage.py` si el servicio se configuró con raíz efectiva `backend`.

- `/healthz` ejecuta una comprobación mínima de base de datos (`SELECT 1`).
- Si la BBDD no responde, `/healthz` devuelve `503` con JSON de error controlado.
- Railway debe seguir apuntando su healthcheck a `/healthz` (sin cambios de path).

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

1. `GET https://TU-BACKEND.up.railway.app/healthz` responde `200` solo cuando app + BBDD están operativas (readiness real).
2. `GET https://TU-FRONTEND.up.railway.app/` responde correctamente.
3. Frontend consume API desde `NEXT_PUBLIC_API_BASE_URL`.
4. Logs backend sin imports/rutas legacy.

## 6.3) Smoke check manual post-deploy (entorno real)

Además del gate local/CI, este repositorio incorpora un smoke check **manual, reproducible y de solo lectura** para validar el stack realmente desplegado (por ejemplo, en Railway):

```bash
BACKEND_BASE_URL="https://TU-BACKEND.up.railway.app" \
FRONTEND_BASE_URL="https://TU-FRONTEND.up.railway.app" \
python scripts/check_deployed_stack.py
```

Qué valida:

- backend vivo (`/healthz`) y con JSON válido;
- APIs públicas backend (`/api/v1/herbal/plantas/`, `/api/v1/rituales/`);
- frontend público (`/`, `/hierbas`, `/rituales`) con respuesta HTML 200;
- wiring frontend/backend (detecta caídas reales de rutas públicas aunque CI esté verde).

Opcionales:

- `EXPECT_NON_EMPTY_DATA=true` exige listas no vacías en APIs públicas.
- `HERBAL_SLUG` y `RITUAL_SLUG` habilitan checks de detalle (`/hierbas/{slug}`, `/rituales/{slug}` y endpoints backend equivalentes).

Límites importantes:

- Este smoke check **no sustituye** CI ni `python scripts/check_release_gate.py`.
- No se integra en CI por defecto porque depende de URLs reales desplegadas.
- Su objetivo es detectar fallos operativos de UI/configuración/despliegue que no emergen en entornos de build/test aislados.

## 6.1) Verificación canónica previa (antes de deploy)

Antes de promover cambios a Railway, ejecutar en local el gate técnico canónico de demo/release (solo lectura):

```bash
python scripts/check_release_gate.py
```

Este comando entrega un veredicto único (`OK`/`ERROR`) y ejecuta:

- readiness backend,
- `python manage.py check`,
- tests backend críticos (healthcheck + seed demo),
- snapshot de conteos públicos en modo lectura,
- integridad operativa/documental del repo (`python scripts/check_repo_operational_integrity.py`),
- validación frontend básica (`npm run lint` y `npm run build`) cuando el entorno lo permite.

Regla clave de auditoría:

- El gate canónico **no ejecuta** `migrate` ni `seed_demo_publico` por defecto.
- Si se necesita preparar datos demo, usar operación de bootstrap separada (mutante).

Interpretación operativa:

- `ERROR` en bloques backend: no promover deploy.
- `SKIP` en frontend: permitido solo cuando el entorno no puede ejecutarlo (sin `frontend/package.json` o sin Node/npm), siempre con motivo explícito.
- Este gate no reemplaza verificaciones manuales en Railway UI ni monitoreo post-deploy.

## 6.2) Bootstrap demo explícito (operación mutante)

Para preparar un entorno nuevo o reseteado (local/demo/staging), ejecutar de forma explícita:

```bash
python scripts/bootstrap_demo_release.py
```

Esta operación **sí muta estado** (esquema y datos):

- `python manage.py migrate --noinput`,
- `python manage.py seed_demo_publico` (primera ejecución),
- segunda ejecución de `seed_demo_publico` para comprobar idempotencia (opcional con `--skip-second-seed`),
- resumen final de conteos públicos.

Nota de CI/auditoría:

- GitHub Actions valida este bootstrap en un job separado (`bootstrap_demo_validation`) usando SQLite temporal aislada.
- Esa validación automática **no** ejecuta bootstrap en Railway ni sustituye la operación manual/controlada en Railway UI.

## 7) Síntomas de configuración antigua en Railway UI

Si aparece alguno de estos síntomas, Railway sigue usando configuración residual:

- Logs intentando cargar `presentacion/proyecto_web` o `configuracion/app_config`.
- `Start Command` manual en UI distinto al definido en `backend/railway.toml` (puede saltarse el flujo esperado).
- Variables legacy (`APP_DEBUG`, `DJANGO_SETTINGS_MODULE`, `WSGI_APPLICATION`) aún presentes.
- Frontend apuntando a una API incorrecta en `NEXT_PUBLIC_API_BASE_URL`.

## 8) Seed demo pública mínima (staging/demo, operación mutante)

Para evitar un entorno vacío tras deploy, existe un comando idempotente que carga una base editorial/comercial mínima pública (intenciones, plantas, productos y rituales):

```bash
python manage.py seed_demo_publico
```

Cuándo ejecutarlo:
- justo después de `migrate` en un entorno nuevo de Railway,
- cuando se resetee la base de datos de staging/demo,
- en local para validar rápidamente navegación pública sin carga manual desde admin.

Qué desbloquea visualmente (mínimo):
- `/`
- `/hierbas`
- `/hierbas/[slug]`
- `/rituales`
- `/rituales/[slug]`

Notas operativas:
- el comando es idempotente: puede ejecutarse más de una vez sin duplicar registros,
- está diseñado para demo/staging y validación visual inicial,
- no sustituye la carga curada definitiva del catálogo real de producción.
