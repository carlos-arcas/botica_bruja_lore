# Roadmap retirada demo/legacy y profesionalizacion ecommerce real

## 1. Objetivo
Eliminar progresivamente todo rastro funcional, publico y arquitectonico de demo/legacy para dejar un flujo ecommerce profesional y real:

`catalogo -> ficha -> cesta -> checkout -> pago -> pedido -> documento -> cuenta -> backoffice`

La retirada no debe improvisarse ni borrar datos a ciegas. Cada tarea debe cerrar una brecha verificable, con tests y rollback cuando toque persistencia.

## 2. Estado inicial
- **Estado global**: `PLANIFICADO`.
- **Motivo**: la auditoria estricta detecto que el flujo local funciona, pero aun conserva deuda incompatible con un ecommerce profesional expuesto.
- **Fuente factual**: `docs/90_estado_implementacion.md`.
- **Bitacora de esta fase**: `docs/bitacora_retirada_demo_legacy_profesional.md`.
- **Plan historico relacionado**: `docs/plan_retirada_legacy_demo.md`.

## 3. Problemas a resolver

| Codigo | Severidad | Problema | Riesgo |
|---|---|---|---|
| `P-SEC-001` | Alta | Pedidos de invitado y documentos accesibles por URL de pedido. | Exposicion de PII/documento fiscal si la URL se filtra o se adivina. |
| `P-SEC-002` | Alta | Confirmacion de pago simulado por endpoint publico de pedido. | Aceptable en local; no profesional si queda expuesto fuera de entorno cerrado. |
| `P-UX-001` | Alta | El usuario crea pedido en checkout y paga despues en `/pedido/[id]`. | Flujo menos intuitivo que ecommerce estandar. |
| `P-ARCH-001` | Alta | Checkout real aun importa helpers de `encargo`/seleccion legacy. | Dependencia conceptual de legacy en flujo real. |
| `P-DATA-001` | Alta | Payload frontend deriva precio desde catalogo estatico y `precioVisible`. | Desalineacion de precio/contrato frente a backend como fuente de verdad. |
| `P-LEG-001` | Alta | Existen rutas, APIs, modelos y tests `PedidoDemo`/`CuentaDemo`. | Riesgo de reintroducir demo en nuevas capacidades. |
| `P-COPY-001` | Media | Mojibake visible en copy (`TelÃ©fono`, `EnvÃ­o`, etc.). | Deteriora confianza y percepcion profesional. |
| `P-QA-001` | Media | Falta auditoria E2E visual/browser real completa. | Riesgo de regresiones navegables no detectadas por tests de contrato. |
| `P-OPS-001` | Media | `V2-R10` sigue bloqueado y no hay staging real. | No apto para go-live aunque el flujo local funcione. |

## 4. Reglas de ejecucion
1. Ejecutar siempre la primera tarea `TODO` no `BLOCKED`.
2. Ejecutar una sola tarea por corrida.
3. No borrar modelos, endpoints ni datos demo sin export/backup y tarea explicita.
4. No activar Stripe real ni declarar produccion lista.
5. No mantener rutas demo como compra, cuenta o pedido visibles.
6. Toda tarea con logica ejecutable requiere tests.
7. Toda tarea que toque persistencia debe incluir `makemigrations --check --dry-run` y rollback documentado.
8. Al cerrar cada tarea, actualizar este roadmap y `docs/bitacora_retirada_demo_legacy_profesional.md`.
9. Si la tarea no queda correctamente implementada, mantener o devolver su estado a `TODO`.

## 5. Roadmap atomico

### RDL-000 - Crear roadmap y automatizacion de retirada
- **Estado**: `DONE`.
- **Objetivo**: crear la cola de trabajo profesional, bitacora y automatizacion recurrente.
- **Evidencia esperada**:
  - `docs/roadmap_retirada_demo_legacy_profesional.md`;
  - `docs/bitacora_retirada_demo_legacy_profesional.md`;
  - entrada en `docs/roadmap_codex.md`;
  - automatizacion recurrente de 10 minutos.
- **Checks**: `git diff --check`.

### RDL-001 - Corregir mojibake y copy no profesional
- **Estado**: `DONE`.
- **Objetivo**: eliminar texto corrupto y restos visibles de lenguaje demo/legacy en superficies publicas reales.
- **Alcance**: checkout real, recibo real, cuenta real, navegacion y documentos publicos de confianza.
- **Fuera de alcance**: borrar rutas legacy o cambiar logica de pago.
- **Checks obligatorios**:
  - busqueda final de `Ã`, `Â`, `demo`, `legacy`, `coexistencia`, `real v1` en frontend publico real;
  - `npm --prefix frontend run lint`;
  - tests frontend afectados;
  - `npm --prefix frontend run build`;
  - `git diff --check`.
- **Evidencia de cierre**:
  - `/encargo` deja de presentarse como "Checkout demo" en metadata y se describe como consulta personalizada;
  - la libreta de direcciones de cuenta real elimina mojibake visible;
  - `test:cuenta-cliente`, lint y build frontend pasan;
  - la busqueda de mojibake en frontend real no devuelve resultados.

### RDL-002 - Separar checkout real de helpers legacy
- **Estado**: `TODO`.
- **Objetivo**: extraer helpers neutrales para seleccion/preseleccion y eliminar imports de `encargoConsulta`, `seleccionEncargo` y almacenamiento `Encargo` desde checkout real.
- **Criterio de cierre**:
  - `/checkout` no importa modulos de `/encargo` ni nombres `Encargo`;
  - el legacy puede consumir el helper neutral, no al reves;
  - gate local deja de emitir warning `checkout_real_encargo_consulta_controlada`.
- **Checks obligatorios**: tests de checkout real, tests de cesta, guardrail legacy, lint, build y `git diff --check`.

### RDL-003 - Retirar navegacion y superficies publicas legacy
- **Estado**: `TODO`.
- **Objetivo**: quitar `/encargo`, `/pedido-demo` y `cuenta-demo` de cualquier navegacion publica, footer, cards, CTAs, rutas de ayuda comercial y sitemap.
- **Criterio de cierre**:
  - no hay CTA publico hacia `/encargo`, `/pedido-demo` ni `cuenta-demo`;
  - si una ruta legacy sigue existiendo, queda no enlazada y no indexable;
  - `/checkout`, `/pedido/[id_pedido]` y `/mi-cuenta` gobiernan todo flujo visible.
- **Checks obligatorios**: tests shell/navegacion, tests SEO/noindex, gate local, lint, build y `git diff --check`.

### RDL-004 - Congelar escritura nueva demo
- **Estado**: `TODO`.
- **Objetivo**: impedir creacion publica de `PedidoDemo` y `CuentaDemo` sin romper lectura historica temporal.
- **Criterio de cierre**:
  - endpoints de escritura demo devuelven cierre controlado o quedan inaccesibles fuera de entorno interno;
  - lectura historica, si se conserva, esta separada del flujo real;
  - tests legacy se ajustan a modo solo lectura o se mueven a historico.
- **Checks obligatorios**: tests backend de pedidos/cuentas demo actualizados, tests de checkout real, `python manage.py check` y `git diff --check`.

### RDL-005 - Migrar, exportar o descartar datos demo con politica explicita
- **Estado**: `TODO`.
- **Objetivo**: decidir y ejecutar politica segura para datos `PedidoDemo`/`CuentaDemo` antes de eliminar modelos.
- **Criterio de cierre**: informe de conteos, dry-run de export o descarte, checksum o evidencia equivalente y rollback documentado.
- **Checks obligatorios**: tests del script si se crea, `python manage.py check` y `git diff --check`.

### RDL-006 - Eliminar frontend demo/legacy
- **Estado**: `TODO`.
- **Objetivo**: retirar paginas y componentes frontend de `/encargo`, `/pedido-demo` y `cuenta-demo` cuando escritura demo ya este congelada y datos resueltos.
- **Criterio de cierre**:
  - rutas demo eliminadas o sustituidas por estado `410`/archivo historico si se decide;
  - no quedan imports `cuenta_demo`, `pedidosDemo`, `checkoutDemo`, `PedidoDemo` en flujo real;
  - tests reales cubren el hueco funcional.
- **Checks obligatorios**: tests de rutas/navegacion, checkout/cesta/cuenta real, lint, build y `git diff --check`.

### RDL-007 - Eliminar backend demo/legacy
- **Estado**: `TODO`.
- **Objetivo**: retirar casos de uso, vistas, repositorios, admin y modelos demo cuando los datos esten resueltos.
- **Criterio de cierre**:
  - `PedidoDemo` y `CuentaDemo` no existen como capacidad activa;
  - migraciones de retirada controlada validadas;
  - `Pedido` y cuenta real quedan intactos.
- **Checks obligatorios**: tests backend de pedido/cuenta/pago/inventario, `python manage.py check`, `python manage.py makemigrations --check --dry-run` y `git diff --check`.

### RDL-008 - Profesionalizar seguridad de pedido invitado y documento
- **Estado**: `TODO`.
- **Objetivo**: sustituir acceso publico por `id_pedido` por token firmado, sesion propietaria o mecanismo equivalente para pedido invitado, documento fiscal e inicio/confirmacion de pago.
- **Criterio de cierre**:
  - pedido de cuenta exige propietario;
  - pedido invitado exige token no adivinable o sesion equivalente;
  - documento fiscal no queda expuesto solo por `id_pedido`;
  - confirmacion de pago local queda limitada a entorno local o token valido.
- **Checks obligatorios**: tests ACL backend, tests API pedido/documento/pago, tests frontend de URL/retorno, `python manage.py check`, build si toca frontend y `git diff --check`.

### RDL-009 - Convertir checkout en flujo ecommerce estandar
- **Estado**: `TODO`.
- **Objetivo**: integrar inicio/confirmacion de pago dentro del checkout o en un paso de pago claro antes del recibo final, dejando `/pedido/[id_pedido]` como confirmacion/detalle.
- **Criterio de cierre**:
  - CTA final comunica compra/pago de forma normal;
  - el usuario no interpreta que el pedido ya termino antes de pagar;
  - recibo solo muestra estado y acciones de recuperacion, no el flujo principal de pago.
- **Checks obligatorios**: tests checkout real, compra local, recibo, lint, build y `git diff --check`.

### RDL-010 - Hacer backend fuente unica de precio y contrato comercial
- **Estado**: `TODO`.
- **Objetivo**: dejar de construir payload real desde `precioVisible`/catalogo estatico como fuente de verdad comercial.
- **Criterio de cierre**:
  - backend resuelve precio, unidad, tipo fiscal y disponibilidad por `id_producto`/SKU;
  - frontend envia intencion/cantidad, no precio autoritativo;
  - discrepancias se devuelven como error controlado.
- **Checks obligatorios**: tests backend de pedido/precio/stock, tests frontend de payload, `python manage.py check`, build y `git diff --check`.

### RDL-011 - Auditoria visual E2E del flujo profesional
- **Estado**: `TODO`.
- **Objetivo**: ejecutar auditoria con navegador/snapshots sobre flujo ya sin demo/legacy visible.
- **Criterio de cierre**:
  - home, secciones, ficha, cesta, checkout, pago, pedido, cuenta y admin revisados;
  - errores visuales o navegables quedan documentados como tareas concretas;
  - no se generan screenshots versionados.
- **Checks obligatorios**: gate local, build frontend y reporte de auditoria visual en docs sin binarios.

### RDL-012 - Auditoria final y reapertura automatica de tareas defectuosas
- **Estado**: `TODO`.
- **Objetivo**: revisar cada tarea `RDL-001` a `RDL-011`; si alguna no cumple evidencia, tests o criterio de cierre, devolverla a `TODO`.
- **Criterio de cierre**:
  - tabla de verificacion por tarea;
  - tareas incompletas reabiertas como `TODO`;
  - ninguna tarea queda `DONE` por declaracion sin evidencia;
  - dictamen final: `PROFESIONAL_LOCAL`, `PROFESIONAL_CON_WARNINGS` o `NO_CERRABLE`.
- **Checks obligatorios**: todos los gates relevantes, auditoria de imports demo/legacy, auditoria de rutas publicas, auditoria de seguridad de pedido/documento y `git diff --check`.

## 6. Cursor actual
- **Ultima tarea cerrada**: `RDL-001`.
- **Siguiente tarea ejecutable**: `RDL-002`.
- **Regla para automatizacion**: si el hilo ya esta trabajando o hay ejecucion activa, la automatizacion debe responder `SKIP: hilo trabajando` y no editar archivos.

## 7. Definicion de cierre de la fase
La fase solo puede cerrarse cuando:
1. no quedan rutas demo/legacy visibles ni funcionales como compra/cuenta/pedido;
2. `PedidoDemo` y `CuentaDemo` no sostienen ninguna capacidad activa;
3. checkout y pago se comportan como ecommerce profesional;
4. pedido/documento tienen ACL profesional;
5. backend gobierna precio/contrato comercial;
6. E2E visual no detecta bloqueos graves;
7. `RDL-012` confirma o reabre tareas defectuosas.
