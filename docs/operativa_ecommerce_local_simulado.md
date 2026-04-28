# Operativa ecommerce local con pago simulado

## 1. Objetivo
Esta guia permite levantar, poblar, probar y validar el proyecto como ecommerce local real con pago simulado.

No declara go-live externo, no activa Stripe y no sustituye la documentacion de deploy. La fase local sirve para validar el recorrido completo en maquina local:

`producto -> cesta -> checkout -> pago simulado -> pedido real -> documento -> cuenta -> backoffice`.

## 2. Que es real y que es simulado

### Real en local
- Catalogo publicado.
- Cesta y checkout principal en `/checkout`.
- Pedido real `Pedido`.
- Inventario y stock preventivo.
- Cuenta real `/mi-cuenta`.
- Recibo y documento fiscal HTML.
- Django Admin/backoffice de pedidos reales.
- Postventa local manual.
- Gates y tests de regresion.

### Simulado en local
- Solo la pasarela de pago: `BOTICA_PAYMENT_PROVIDER=simulado_local`.
- La confirmacion de pago se hace con endpoint local y reutiliza post-pago real.
- No hay cobro bancario ni Stripe real.

### Legacy congelado
- `/encargo`: consulta personalizada/manual, no compra principal.
- `/pedido-demo`: historico/controlado.
- `cuenta-demo`: historico/controlado.
- `PedidoDemo`: solo compatibilidad legacy; nuevas features no deben depender de el.

## 3. Requisitos locales
- Python 3 disponible como `py -3` o desde `.venv`.
- Entorno virtual `.venv`.
- Dependencias Python desde `requirements.txt`.
- Node.js/npm y `frontend/node_modules`.
- Base local compatible con Django. SQLite puede servir como apoyo local; PostgreSQL sigue siendo objetivo real.

Comprobacion no destructiva verificada:

```powershell
.\setup_entorno.bat --check
.\run_app.bat --check
```

## 4. Variables de entorno clave

Backend local:

```env
DEBUG=true
BOTICA_PAYMENT_PROVIDER=simulado_local
LOG_LEVEL=INFO
```

Frontend local (`frontend/.env.example`):

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
NEXT_PUBLIC_ANALITICA_LOCAL=false
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=
```

Reglas:
- No poner secretos en variables `NEXT_PUBLIC_*`.
- No usar `BOTICA_PAYMENT_PROVIDER=stripe` en fase local simulada.
- Si Stripe se selecciona en el futuro, debe hacerse de forma explicita y con claves/configuracion completas.
- El contrato futuro de Stripe esta documentado en `docs/pagos_modo_local_y_stripe.md`.

## 5. Levantar backend

Comandos habituales desde la raiz del repo:

```powershell
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

Check estructural:

```powershell
.\.venv\Scripts\python.exe manage.py check
```

## 6. Levantar frontend

Desde la raiz:

```powershell
npm --prefix frontend run dev
```

URL local habitual:

```text
http://127.0.0.1:3000
```

Build de validacion:

```powershell
npm --prefix frontend run build
```

## 7. Poblar datos comprables

Bootstrap local:

```powershell
.\.venv\Scripts\python.exe scripts/bootstrap_ecommerce_local_simulado.py --dry-run
.\.venv\Scripts\python.exe scripts/bootstrap_ecommerce_local_simulado.py
```

Que garantiza:
- productos publicados comprables;
- stock suficiente para al menos una compra;
- unidad comercial coherente;
- precio y tipo fiscal validos;
- cuenta cliente local opcional si el script la soporta;
- idempotencia: no duplica SKUs ni inventario.

El `--dry-run` calcula y revierte los cambios.

## 8. Crear o usar cuenta real

Opciones:
- Desde frontend: `/registro`, `/acceso`, `/mi-cuenta`.
- Desde admin si necesitas usuario staff: `createsuperuser`.

```powershell
.\.venv\Scripts\python.exe manage.py createsuperuser
```

La cuenta real visible es `/mi-cuenta`. No usar `cuenta-demo` para flujos nuevos.

## 9. Hacer una compra local
1. Abrir catalogo o seccion publica.
2. Entrar en una ficha de producto con stock.
3. Agregar a cesta o ir a `Comprar ahora`.
4. Revisar `/cesta`.
5. Finalizar en `/checkout`.
6. Crear pedido real.
7. Abrir `/pedido/[id_pedido]`.
8. Iniciar pago.
9. Confirmar pago de prueba local.
10. Verificar estado pagado, recibo y documento.

El recorrido normal nunca debe pasar por `/pedido-demo`.

## 10. Confirmar pago simulado
La UI del pedido real muestra la accion cuando el proveedor es `simulado_local`.

Endpoint backend esperado:

```text
POST /api/v1/pedidos/{id_pedido}/confirmar-pago-simulado/
```

Reglas:
- solo pedidos con proveedor `simulado_local`;
- no pedidos Stripe;
- no pedidos cancelados;
- debe existir intencion de pago simulada;
- reutiliza post-pago real.

## 11. Ver pedido y documento fiscal
- Detalle real: `/pedido/[id_pedido]`.
- Documento fiscal: enlace desde el recibo o `/api/pedidos/[id_pedido]/documento` via proxy frontend.
- Cuenta real: `/mi-cuenta/pedidos`.

El documento fiscal local es HTML. No versionar PDFs generados ni binarios.

## 12. Operar pedido desde admin
Entrar en Django Admin:

```text
http://127.0.0.1:8000/admin/
```

Operaciones esperadas:
- revisar pedidos reales;
- filtrar por estado/pago/incidencia;
- marcar preparando;
- marcar enviado;
- registrar transportista/codigo de seguimiento o envio sin seguimiento;
- marcar entregado;
- revisar incidencias de stock;
- gestionar devolucion/reembolso local manual si aplica.

No operar nuevas compras sobre `PedidoDemo`.

## 13. Gate local ecommerce

Contrato reproducible de entorno:

```powershell
.\.venv\Scripts\python.exe scripts/check_entorno_local_ecommerce.py
.\.venv\Scripts\python.exe scripts/check_entorno_local_ecommerce.py --json
```

La checklist de entorno vive en `docs/checklist_entorno_local_ecommerce.md` y fija variables, comandos, datos, arranque y troubleshooting local.

Comando principal:

```powershell
.\.venv\Scripts\python.exe scripts/check_ecommerce_local_simulado.py
```

Salida JSON:

```powershell
.\.venv\Scripts\python.exe scripts/check_ecommerce_local_simulado.py --json
```

Endurecer warnings:

```powershell
.\.venv\Scripts\python.exe scripts/check_ecommerce_local_simulado.py --fail-on warning
```

Interpretacion actual:
- `BLOCKER`: hay regresion que rompe el flujo local.
- `WARNING`: legacy visible/controlado o condicion pendiente no bloqueante.
- `OK`: contrato cumplido.

Warnings esperados mientras legacy exista:
- legacy documentado como deprecado;
- `/encargo` enlazado como consulta secundaria.

## 13.1 Auditoria final local

Comando de auditoria antes de presentacion:

```powershell
.\.venv\Scripts\python.exe scripts/audit_ecommerce_local_simulado.py
```

Salida JSON:

```powershell
.\.venv\Scripts\python.exe scripts/audit_ecommerce_local_simulado.py --json
```

La auditoria agrega gate local, documentacion clave, catalogo vendible, checklist de presentacion, regresion local, legacy congelado y bloqueo `V2-R10`. No sustituye release gate real, staging ni smoke externo.

## 13.2 Guion de presentacion

El recorrido recomendado para ensenar el proyecto a terceros vive en:

```text
docs/guion_demo_ecommerce_local.md
```

Usarlo despues de ejecutar la auditoria final y antes de abrir una sesion de demo. El guion evita prometer produccion, Stripe activo o cumplimiento legal final.

## 14. Tests relevantes

Backend:

```powershell
.\.venv\Scripts\python.exe manage.py test tests.nucleo_herbal.test_api_pago_real
.\.venv\Scripts\python.exe manage.py test tests.nucleo_herbal.test_api_pedidos_real tests.nucleo_herbal.test_regresion_compra_local_simulada
.\.venv\Scripts\python.exe -m unittest tests.scripts.test_check_ecommerce_local_simulado
```

Frontend:

```powershell
npm --prefix frontend run test:checkout-real
npm --prefix frontend run test:compra-local
npm --prefix frontend run test:cesta
npm --prefix frontend run test:cuenta-cliente
npm --prefix frontend run test:legal
npm --prefix frontend run lint
npm --prefix frontend run build
```

SEO/legal:

```powershell
npm --prefix frontend run test:seo:contrato
npm --prefix frontend run test:paginas-informativas-seo
```

## 15. Detectar que caíste en legacy por error

Senales de alarma:
- una compra normal termina en `/encargo`;
- aparece `/pedido-demo` tras pagar;
- una feature nueva importa `PedidoDemo`, `PayloadPedidoDemo`, `CuentaDemo`, `pedidosDemo` o `cuentasDemo`;
- `cuenta-demo` aparece en navegacion principal;
- un CTA principal dice compra/finalizar y apunta a `/encargo` o `/pedido-demo`;
- un test nuevo necesita `PedidoDemo` para validar checkout real.

Comando para detectarlo:

```powershell
.\.venv\Scripts\python.exe scripts/check_ecommerce_local_simulado.py
```

## 16. No hacer
- No activar Stripe real en local simulado.
- No usar `/encargo` como compra principal.
- No crear nuevas features sobre `PedidoDemo`.
- No reintroducir `cuenta-demo` en navegacion principal.
- No versionar binarios, `.pyc`, `.sqlite3`, `.db`, `.mo`, zips, PDFs o builds.
- No declarar `V2-R10` desbloqueado.
- No presentar esta fase como produccion lista.

## 17. Troubleshooting

### No hay stock
- Ejecutar bootstrap local con `--dry-run` y luego sin `--dry-run` si procede.
- Revisar inventario en admin.
- Ejecutar tests/gate si el error aparece durante pago.

### No aparece producto
- Comprobar que el producto esta publicado.
- Revisar seccion publica y stock.
- Reejecutar bootstrap local.

### Pago simulado no confirma
- Confirmar que `BOTICA_PAYMENT_PROVIDER=simulado_local`.
- Verificar que el pedido tiene intencion de pago creada.
- Revisar que el pedido no esta cancelado.
- Ejecutar `manage.py check` y tests de pago.

### Pedido no aparece en cuenta
- Comprobar que la compra se hizo con cuenta real autenticada o que el pedido puede consultarse por enlace directo.
- Revisar `/mi-cuenta/pedidos`.
- No usar `cuenta-demo` para validar cuenta real.

### Documento fiscal no descarga
- Abrir el enlace desde `/pedido/[id_pedido]`.
- Comprobar que el pedido existe y que el acceso esta permitido.
- Revisar proxy frontend `/api/pedidos/[id_pedido]/documento`.

### Gate local falla
- Leer severidad: `BLOCKER` exige correccion antes de cerrar.
- Revisar ruta y accion sugerida en la salida.
- Si falla por legacy, comprobar que no se reintrodujo demo como flujo principal.

## 18. Comandos verificados al crear esta guia
- `.\setup_entorno.bat --check`
- `.\run_app.bat --check`
- `.\.venv\Scripts\python.exe scripts/bootstrap_ecommerce_local_simulado.py --help`
- `.\.venv\Scripts\python.exe scripts/check_ecommerce_local_simulado.py --help`

## 19. Comandos documentados pero no ejecutados en esta guia
Estos comandos son existentes y se usan en el proyecto, pero no se ejecutaron durante la creacion de esta guia para no mutar datos ni arrancar procesos persistentes:
- `manage.py migrate`
- `manage.py runserver`
- `npm --prefix frontend run dev`
- `scripts/bootstrap_ecommerce_local_simulado.py` sin `--dry-run`
- `createsuperuser`
