# Checklist entorno local ecommerce simulado

## 1. Objetivo
Definir el contrato minimo para levantar y validar el ecommerce local real con pago simulado en otra maquina o por otro agente sin depender de memoria.

No declara produccion lista, no activa Stripe, no requiere servicios externos y no desbloquea `V2-R10`.

## 2. Variables locales
Backend raiz (`.env.example`):

```env
DEBUG=true
LOG_LEVEL=INFO
BOTICA_PAYMENT_PROVIDER=simulado_local
PUBLIC_SITE_URL=http://127.0.0.1:3000
DEFAULT_FROM_EMAIL=no-reply@botica-lore.local
EMAIL_BACKEND=django.core.mail.backends.locmem.EmailBackend
ENVIO_ESTANDAR_IMPORTE=4.90
```

Frontend (`frontend/.env.example`):

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
NEXT_PUBLIC_ANALITICA_LOCAL=false
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=
```

Reglas:
- `BOTICA_PAYMENT_PROVIDER=simulado_local` es el modo local recomendado.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` y claves reales no deben rellenarse en local simulado.
- Las variables `NEXT_PUBLIC_*` no pueden contener secretos.

## 3. Instalacion
Comprobacion no destructiva:

```powershell
.\setup_entorno.bat --check
```

Instalacion completa si faltan dependencias:

```powershell
.\setup_entorno.bat
```

Equivalentes manuales:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
npm --prefix frontend install
```

## 4. Base local
Django usa `var/dev.sqlite3` si `DATABASE_URL` no esta definido. Ese archivo es local y no debe versionarse.

Migraciones:

```powershell
.\.venv\Scripts\python.exe manage.py migrate
```

Check estructural:

```powershell
.\.venv\Scripts\python.exe manage.py check
```

## 5. Datos comprables
Validar sin persistir:

```powershell
.\.venv\Scripts\python.exe scripts/bootstrap_ecommerce_local_simulado.py --dry-run
```

Poblar datos:

```powershell
.\.venv\Scripts\python.exe scripts/bootstrap_ecommerce_local_simulado.py
```

Debe dejar productos publicados, stock compatible, precio, unidad, tipo fiscal y cuenta cliente local opcional.

## 6. Arranque
Check de arranque sin servidores:

```powershell
.\run_app.bat --check
```

Arranque por ventanas:

```powershell
.\run_app.bat
```

Arranque manual:

```powershell
.\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
npm --prefix frontend run dev
```

URLs esperadas:
- Backend: `http://127.0.0.1:8000`
- Frontend: `http://127.0.0.1:3000`
- Admin: `http://127.0.0.1:8000/admin/`

## 7. Compra local
Recorrido esperado:
1. Abrir home o seccion comercial.
2. Entrar en ficha comprable con stock.
3. Anadir a cesta.
4. Revisar `/cesta`.
5. Finalizar en `/checkout`.
6. Crear `Pedido` real.
7. Iniciar pago.
8. Confirmar pago de prueba local.
9. Ver `/pedido/[id_pedido]`, documento fiscal y `/mi-cuenta`.

El flujo normal no usa `/pedido-demo`, `cuenta-demo` ni `PedidoDemo`.

## 8. Gates y checks
Contrato de entorno:

```powershell
.\.venv\Scripts\python.exe scripts/check_entorno_local_ecommerce.py
.\.venv\Scripts\python.exe scripts/check_entorno_local_ecommerce.py --json
```

Gate ecommerce local:

```powershell
.\.venv\Scripts\python.exe scripts/check_ecommerce_local_simulado.py
.\.venv\Scripts\python.exe scripts/check_ecommerce_local_simulado.py --json
```

Auditoria final local:

```powershell
.\.venv\Scripts\python.exe scripts/audit_ecommerce_local_simulado.py
```

Tests criticos backend:

```powershell
.\.venv\Scripts\python.exe manage.py test tests.nucleo_herbal.test_api_pedidos_real tests.nucleo_herbal.test_api_pago_real tests.nucleo_herbal.test_regresion_compra_local_simulada
```

Tests criticos frontend:

```powershell
npm --prefix frontend run test:checkout-real
npm --prefix frontend run test:compra-local
npm --prefix frontend run test:cesta
npm --prefix frontend run test:cuenta-cliente
npm --prefix frontend run lint
npm --prefix frontend run build
```

## 9. Errores frecuentes
### Migraciones pendientes
- Sintoma: errores de tabla inexistente o modelo no sincronizado.
- Accion: ejecutar `manage.py migrate` y luego `manage.py check`.

### Sin stock
- Sintoma: checkout o pago bloqueado por disponibilidad.
- Accion: ejecutar bootstrap con `--dry-run`, poblar si procede y revisar inventario en admin.

### Proveedor de pago incorrecto
- Sintoma: gate advierte `stripe` o bloquea proveedor desconocido.
- Accion: usar `BOTICA_PAYMENT_PROVIDER=simulado_local`.

### Frontend apunta a backend incorrecto
- Sintoma: errores de API o pedido no creado.
- Accion: revisar `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000`.

### Build frontend roto
- Sintoma: `npm --prefix frontend run build` falla.
- Accion: ejecutar lint/tests especificos antes de reintentar build.

### Gate local falla
- Sintoma: `BLOCKER` en gate o auditoria.
- Accion: corregir la ruta indicada antes de seguir; un `WARNING` de legacy controlado es aceptable si esta documentado.

## 10. No hacer
- No activar Stripe real.
- No introducir secretos en `.env.example` ni `frontend/.env.example`.
- No versionar `var/dev.sqlite3`, `.db`, `.sqlite3`, `.pyc`, `.mo`, builds, zips, PDFs ni imagenes generadas.
- No usar `/encargo` como compra principal.
- No crear features nuevas sobre `PedidoDemo`.
- No declarar `V2-R10` desbloqueado.

## 11. Pendiente no verificado automaticamente
- Este checklist no arranca servidores.
- No ejecuta una compra E2E con navegador.
- No valida credenciales reales de admin.
- No comprueba servicios externos porque la fase local no debe depender de ellos.
