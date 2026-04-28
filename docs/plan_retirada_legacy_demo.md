# Plan de retirada progresiva de legacy demo

## 1. Estado y alcance
- **Estado**: `PLANIFICADO`.
- **Tipo de trabajo**: plan tecnico de retirada, sin ejecucion.
- **Legacy afectado**: `/encargo`, `/pedido-demo`, `/pedido-demo/[id_pedido]`, `cuenta-demo`, `PedidoDemo`, `CuentaDemo` y sus contratos asociados.
- **Flujo principal vigente**: `/checkout` -> `Pedido` -> pago `simulado_local` -> `/pedido/[id_pedido]` -> `/mi-cuenta`.
- **Regla base**: ninguna capacidad nueva debe depender de `PedidoDemo`, `CuentaDemo`, `pedidosDemo`, `cuentasDemo` ni rutas demo.

Este plan no elimina rutas, modelos, migraciones ni datos. Define la salida segura para una fase posterior explicita.

## 2. Inventario de legacy

### 2.1 Rutas frontend
| Ruta | Estado actual | Uso permitido durante retirada |
|---|---|---|
| `/encargo` | Legacy controlado | Consulta personalizada/manual secundaria. |
| `/pedido-demo` | Legacy controlado | Pantalla historica de recibo demo sin CTA principal nuevo. |
| `/pedido-demo/[id_pedido]` | Legacy controlado | Lectura historica de pedido demo. |
| `/cuenta-demo` | Legacy controlado | Acceso historico/controlado, fuera de navegacion principal. |
| `/condiciones-encargo` | Informativa legacy | Mantener mientras `/encargo` exista. |

### 2.2 Componentes y modulos frontend
- `frontend/app/encargo/page.tsx`
- `frontend/app/pedido-demo/page.tsx`
- `frontend/app/pedido-demo/[id_pedido]/page.tsx`
- `frontend/app/cuenta-demo/page.tsx`
- `frontend/componentes/catalogo/encargo/FlujoEncargoConsulta.tsx`
- `frontend/componentes/catalogo/encargo/ReciboPedidoDemo.tsx`
- `frontend/componentes/catalogo/encargo/BloqueIdentificacionCheckoutDemo.tsx`
- `frontend/componentes/catalogo/encargo/ResumenEnvioEncargoDemo.tsx`
- `frontend/componentes/cuenta_demo/AreaCuentaDemo.tsx`
- `frontend/componentes/cuenta_demo/FormulariosCuentaDemo.tsx`
- `frontend/componentes/cuenta_demo/HistorialPedidosDemo.tsx`
- `frontend/contenido/catalogo/checkoutDemo.ts`
- `frontend/contenido/catalogo/postCheckoutDemo.ts`
- `frontend/contenido/catalogo/estadoCheckoutDemo.ts`
- `frontend/contenido/cuenta_demo/estadoCuentaDemo.ts`
- `frontend/contenido/cuenta_demo/pedidoRecienteDemo.ts`
- `frontend/contenido/cuenta_demo/retornoCuentaDemo.ts`
- `frontend/infraestructura/api/pedidosDemo.ts`
- `frontend/infraestructura/api/cuentasDemo.ts`

### 2.3 Dominio, aplicacion e infraestructura backend
- `backend/nucleo_herbal/dominio/pedidos_demo.py`
- `backend/nucleo_herbal/dominio/cuentas_demo.py`
- `backend/nucleo_herbal/aplicacion/casos_de_uso_pedidos_demo.py`
- `backend/nucleo_herbal/aplicacion/casos_de_uso_cuentas_demo.py`
- `backend/nucleo_herbal/aplicacion/anti_corrupcion_pedidos_demo.py`
- `backend/nucleo_herbal/aplicacion/puertos/repositorios_pedidos_demo.py`
- `backend/nucleo_herbal/aplicacion/puertos/repositorios_cuentas_demo.py`
- `backend/nucleo_herbal/aplicacion/puertos/proveedores_historial_pedidos_demo.py`
- `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios.py`
- `backend/nucleo_herbal/infraestructura/persistencia_django/mapeadores.py`
- `backend/nucleo_herbal/infraestructura/persistencia_django/admin_pedidos_demo.py`
- `backend/nucleo_herbal/infraestructura/persistencia_django/models.py`

### 2.4 Endpoints backend
| Endpoint | Vista | Uso permitido durante retirada |
|---|---|---|
| `POST /api/v1/pedidos-demo/` | `crear_pedido_demo` | Escritura legacy hasta Fase B. |
| `GET /api/v1/pedidos-demo/{id_pedido}/` | `detalle_pedido_demo` | Lectura historica hasta decidir migracion/exportacion. |
| `GET /api/v1/pedidos-demo/{id_pedido}/email-demo/` | `email_demo_pedido` | Lectura tecnica legacy. |
| `POST /api/v1/cuentas-demo/registro/` | `registrar_cuenta_demo` | Escritura legacy hasta Fase B. |
| `POST /api/v1/cuentas-demo/autenticacion/` | `autenticar_cuenta_demo` | Acceso legacy hasta Fase C. |
| `GET /api/v1/cuentas-demo/{id_usuario}/perfil/` | `perfil_cuenta_demo` | Lectura historica. |
| `GET /api/v1/cuentas-demo/{id_usuario}/historial-pedidos/` | `historial_pedidos_demo_cuenta` | Lectura historica. |

### 2.5 Modelos, tablas y migraciones afectadas
- `PedidoDemoModelo` -> tabla `nucleo_pedido_demo`.
- `LineaPedidoModelo` -> tabla `nucleo_linea_pedido_demo`.
- `CuentaDemoModelo` -> tabla `nucleo_cuenta_demo`.
- Migraciones legacy: `0003_pedidodemomodelo_lineapedidomodelo.py`, `0004_cuentademomodelo.py`, `0008_alter_cuentademomodelo_options_and_more.py`.

No se debe retirar ningun modelo ni migracion sin copia/exportacion de datos, validacion en base limpia y aprobacion explicita.

### 2.6 Tests afectados
- `tests/nucleo_herbal/test_entidades_pedidos_demo.py`
- `tests/nucleo_herbal/test_casos_de_uso_pedidos_demo.py`
- `tests/nucleo_herbal/test_api_pedidos_demo.py`
- `tests/nucleo_herbal/test_entidades_cuentas_demo.py`
- `tests/nucleo_herbal/test_casos_de_uso_cuentas_demo.py`
- `tests/nucleo_herbal/test_api_cuentas_demo.py`
- `tests/nucleo_herbal/infraestructura/test_repositorios_django.py`
- `tests/nucleo_herbal/infraestructura/test_admin_django.py`
- `frontend/tests/encargo-consulta.test.ts`
- `frontend/tests/encargo-canal-contacto.test.ts`
- `frontend/tests/checkout-demo.test.ts`
- `frontend/tests/checkout-demo-ui.test.ts`
- `frontend/tests/post-checkout-demo.test.ts`
- `frontend/tests/cuenta-demo.test.ts`
- Tests de contrato SEO/noindex que siguen cubriendo rutas legacy mientras existan.

### 2.7 Datos persistidos y dependencias
- Pedidos demo historicos con lineas snapshot y datos de contacto demo.
- Cuentas demo con credencial demo, perfil e historial asociado por `id_usuario` o email.
- Estado local de frontend para sesion demo y pedido reciente demo.
- Admin legacy para consulta de pedidos demo.
- Guardrail local `scripts/check_ecommerce_local_simulado.py`.
- Documentacion viva de migracion ecommerce real, SEO/noindex y estado de implementacion.

## 3. Fases de retirada

### Fase A - Ocultar navegacion publica
- **Objetivo**: asegurar que el usuario publico no entra al legacy como recorrido comercial normal.
- **Precondiciones**: `/checkout`, `/pedido/[id_pedido]`, `/mi-cuenta` y cesta real cubiertos por tests.
- **Cambios permitidos**: retirar enlaces visibles principales, mantener `/encargo` como consulta secundaria, mantener noindex.
- **Cambios prohibidos**: borrar rutas, bloquear lectura historica, tocar modelos o migraciones.
- **Tests obligatorios**: navegacion principal, footer, checkout real, cuenta real, SEO/noindex y guardrail legacy.
- **Rollback**: restaurar enlaces secundarios previos sin cambiar persistencia.

### Fase B - Congelar escritura nueva
- **Objetivo**: impedir que se creen nuevos `PedidoDemo` o `CuentaDemo` desde superficies publicas.
- **Precondiciones**: compra local completa y cuenta real con cobertura de regresion; decision explicita sobre excepciones internas.
- **Cambios permitidos**: feature flag de solo lectura, respuestas controladas para creacion demo, copy de canal cerrado.
- **Cambios prohibidos**: eliminar datos existentes, reutilizar DTO demo para el flujo real, redirigir silenciosamente payloads demo a `Pedido`.
- **Tests obligatorios**: escritura demo bloqueada, lectura demo conservada, checkout real crea `Pedido`, cuenta real no usa `CuentaDemo`.
- **Rollback**: desactivar flag de solo lectura y reabrir escrituras demo si se detecta dependencia operativa.

### Fase C - Mantener lectura historica
- **Objetivo**: conservar acceso controlado a pedidos/cuentas demo ya existentes mientras se decide migracion o exportacion.
- **Precondiciones**: Fase B activa sin errores de soporte; inventario de volumen de datos demo.
- **Cambios permitidos**: rutas read-only, mensajes de historico, admin de consulta, auditoria de accesos.
- **Cambios prohibidos**: nuevas transiciones de estado demo, nuevos emails demo operativos, nuevas dependencias desde UI principal.
- **Tests obligatorios**: detalle de pedido demo historico, historial cuenta demo historico, noindex, ausencia de CTAs principales.
- **Rollback**: restaurar pantallas legacy completas desde version anterior si lectura historica queda rota.

### Fase D - Migrar o exportar datos si procede
- **Objetivo**: decidir y ejecutar, en fase futura, si los datos demo se exportan, se migran parcialmente o se descartan con trazabilidad.
- **Precondiciones**: aprobacion de politica de datos, backup local, dry-run y mapeo campo a campo.
- **Cambios permitidos**: script de exportacion idempotente, informe de registros, checksum, migracion asistida solo si el dato es compatible.
- **Cambios prohibidos**: migracion destructiva, conversion automatica opaca de demo a pedido real, perdida de lineas historicas.
- **Tests obligatorios**: dry-run, idempotencia, conteos antes/despues, validacion de export, rollback de import si existe.
- **Rollback**: restaurar backup/export anterior y dejar rutas en solo lectura.

### Fase E - Retirar endpoints legacy
- **Objetivo**: cerrar la API demo cuando ya no haya escritura ni necesidad de lectura dinamica.
- **Precondiciones**: datos resueltos por Fase D, frontend sin llamadas demo, soporte documentado.
- **Cambios permitidos**: devolver `410 Gone` o redireccion controlada, retirar clientes frontend demo, mantener nota operativa.
- **Cambios prohibidos**: retirar endpoints antes de resolver datos, afectar `Pedido` real, tocar Stripe/pago simulado.
- **Tests obligatorios**: endpoints demo cerrados de forma esperada, checkout real intacto, gate local sin blockers, SEO sin indexar legacy.
- **Rollback**: restaurar urls/vistas demo desde version anterior y reactivar solo lectura.

### Fase F - Retirar modelos y migraciones solo cuando sea seguro
- **Objetivo**: eliminar tablas/modelos demo sin romper bases existentes ni instalaciones nuevas.
- **Precondiciones**: aprobacion explicita, backup verificado, datos exportados o descartados formalmente, pruebas sobre base limpia y base con historico.
- **Cambios permitidos**: migracion Django de retirada controlada, limpieza de admin/repositorios/mapeadores, documentacion de impacto.
- **Cambios prohibidos**: borrar archivos de migracion historicos sin estrategia, hacer `reset` de migraciones, tocar tablas reales de `Pedido`.
- **Tests obligatorios**: `makemigrations --check --dry-run`, migraciones en base limpia, migraciones en base con legacy, repositorios reales, admin real.
- **Rollback**: restaurar backup de base y revertir migracion de retirada con migracion inversa validada.

### Fase G - Eliminar o mover tests legacy a historico
- **Objetivo**: retirar cobertura legacy solo cuando el codigo legacy ya no exista o quede archivado.
- **Precondiciones**: Fases E/F cerradas, regresion ecommerce local simulado ampliada, decision de archivo.
- **Cambios permitidos**: borrar tests que cubren codigo retirado, mover casos utiles a tests de flujo real, conservar guardrail anti-regresion.
- **Cambios prohibidos**: borrar tests antes de retirar codigo, perder contratos de no contaminacion del checkout real.
- **Tests obligatorios**: regresion compra local, gate local, checkout real, cuenta real, pedido real, SEO/noindex.
- **Rollback**: recuperar tests legacy archivados si reaparece dependencia durante estabilizacion.

## 4. Matriz de riesgos
| Riesgo | Impacto | Mitigacion | Senal de rollback |
|---|---|---|---|
| Romper rutas antiguas | Usuarios o tests historicos sin acceso | Retirada por fases, noindex, `410` solo tras Fase D | Errores en lectura historica o soporte. |
| Perder datos demo | Perdida de trazabilidad | Backup, export, checksum y conteos antes/despues | Diferencia de conteos o export incompleto. |
| Borrar tests utiles | Regresion en flujo real o noindex | Mapeo test-a-contrato antes de borrar | Gate local deja de cubrir dependencia demo. |
| Contaminar checkout real | Nuevas dependencias a `PedidoDemo` | Guardrail con `BLOCKER` y revision de imports | Checkout importa modulos demo o CTAs a `/pedido-demo`. |
| Contradiccion documental | Estado declarado como eliminado sin estarlo | Actualizar `docs/90` y roadmap local por fase | Docs dicen eliminado pero rutas/modelos existen. |
| Retirada destructiva de migraciones | Bases existentes no migran | No borrar migraciones historicas sin estrategia | `migrate` falla en base limpia o con historico. |
| Confusion SEO | Legacy indexable accidentalmente | Mantener noindex/sitemap hasta retirada final | Contrato SEO incluye rutas demo indexables. |

## 5. Criterios para iniciar la retirada real
1. Gate local ecommerce simulado sin `BLOCKER`.
2. Regresion completa de compra local simulada en verde.
3. Navegacion publica sin `cuenta-demo` y sin CTAs principales a `/pedido-demo`.
4. `/encargo` usado solo como consulta secundaria.
5. Politica de datos demo aprobada: mantener, exportar, migrar o descartar.
6. Plan de rollback por fase aceptado.
7. `V2-R10` sigue bloqueado; esta retirada no activa pagos reales ni go-live externo.

## 6. Rollback global
Si cualquier fase rompe el flujo principal o lectura historica:
1. detener la retirada;
2. restaurar la ultima version estable de rutas/endpoints afectados;
3. reactivar flags de lectura/escritura previos si existian;
4. restaurar datos desde backup/export si hubo operacion sobre persistencia;
5. ejecutar regresion de compra local, tests legacy afectados y gate local;
6. documentar causa y nueva precondicion antes de reintentar.

## 7. Relacion con guardrail
El guardrail vigente debe mantenerse incluso despues de retirar legacy. Su objetivo cambia de "legacy aislado" a "legacy no reintroducido":
- `BLOCKER`: checkout real o cuenta real vuelven a depender de `PedidoDemo`/`CuentaDemo`.
- `BLOCKER`: CTA principal apunta a `/pedido-demo`.
- `BLOCKER`: `cuenta-demo` vuelve a navegacion principal.
- `WARNING`: `/encargo` sigue enlazado como consulta mientras exista.
- `OK`: legacy ausente o aislado sin contaminar flujo real.
