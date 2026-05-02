# Bitacora retirada demo/legacy y profesionalizacion ecommerce real

## Proposito
Registrar el avance de la fase que elimina demo/legacy y deja el ecommerce en un flujo profesional real.

Esta bitacora complementa `docs/bitacora_codex.md`; no la sustituye. Cada ejecucion debe indicar tarea, estado, evidencia, checks y siguiente paso exacto.

## Formato obligatorio por entrada
- **Tarea**:
- **Estado final**: `DONE` | `TODO` | `BLOCKED`
- **Objetivo**:
- **Archivos tocados**:
- **Decision tecnica/producto**:
- **Evidencia**:
- **Checks ejecutados**:
- **Riesgos**:
- **Siguiente paso exacto**:

## Entrada 2026-05-01-RDL-000
- **Tarea**: `RDL-000 - Crear roadmap y automatizacion de retirada`.
- **Estado final**: `DONE`.
- **Objetivo**: crear una cola operativa para eliminar todo demo/legacy y corregir los problemas detectados en la auditoria estricta.
- **Archivos tocados**:
  - `docs/roadmap_retirada_demo_legacy_profesional.md`;
  - `docs/bitacora_retirada_demo_legacy_profesional.md`;
  - `docs/roadmap_codex.md`;
  - `docs/90_estado_implementacion.md`;
  - `docs/bitacora_codex.md`.
- **Decision tecnica/producto**:
  1. La retirada deja de ser solo un plan historico y pasa a tener cola atomica ejecutable.
  2. La fase no activa Stripe, no declara produccion lista y no cierra `V2-R10`.
  3. La ultima tarea (`RDL-012`) revisa todas las anteriores y devuelve a `TODO` cualquier tarea mal cerrada.
- **Evidencia**:
  - roadmap especifico creado con tareas `RDL-001` a `RDL-012`;
  - cursor actual definido en `RDL-001`;
  - automatizacion recurrente solicitada para revisar cada 10 minutos.
- **Checks ejecutados**:
  - `git diff --check` -> **OK**; solo avisos CRLF del worktree.
  - detector de primera `TODO` en `docs/roadmap_codex.md` -> **OK**, devuelve `RDL-001`.
- **Riesgos**:
  - borrar legacy sin resolver datos demo antes puede romper bases existentes;
  - profesionalizar seguridad de pedidos requiere cambios de contrato frontend/backend;
  - convertir el checkout a flujo estandar toca UX y casos de uso de pago.
- **Siguiente paso exacto**: ejecutar `RDL-001` para corregir mojibake y copy no profesional en superficies publicas reales.

## Entrada 2026-05-01-RDL-001
- **Tarea**: `RDL-001 - Corregir mojibake y copy no profesional`.
- **Estado final**: `DONE`.
- **Objetivo**: eliminar texto corrupto y rebajar lenguaje demo en superficies reales principales sin borrar legacy ni tocar logica de pago.
- **Archivos tocados**:
  - `frontend/app/encargo/page.tsx`;
  - `frontend/componentes/cuenta_cliente/PanelDireccionesCuentaCliente.tsx`;
  - `frontend/tests/cuenta-cliente.test.ts`;
  - `docs/roadmap_retirada_demo_legacy_profesional.md`;
  - `docs/roadmap_codex.md`;
  - `docs/bitacora_retirada_demo_legacy_profesional.md`;
  - `docs/bitacora_codex.md`.
- **Decision tecnica/producto**:
  1. Mantener `/encargo` vivo, pero describirlo como consulta personalizada y no como checkout demo.
  2. Corregir mojibake visible en la cuenta real, especialmente la libreta de direcciones.
  3. No limpiar todavia los textos demo dentro de modulos explicitamente legacy; quedan para RDL-002/RDL-003 y posteriores.
  4. Corregir el test de cuenta para importar el contrato Google que ya estaba ejercitando.
- **Evidencia**:
  - busqueda de `Ã`, `Â` y `â€¦` en frontend real sin resultados;
  - los terminos `pedido demo` y `cuenta demo` restantes aparecen en modulos legacy explicitos o helpers de compatibilidad;
  - build frontend correcto.
- **Checks ejecutados**:
  - `npm --prefix frontend run test:cuenta-cliente` -> **OK**;
  - `npm --prefix frontend run lint` -> **OK**;
  - `npm --prefix frontend run build` -> **OK**;
  - `rg -n "Ã|Â|â€¦" frontend/app frontend/componentes frontend/contenido frontend/infraestructura -S` -> **OK**, sin resultados;
  - `rg -n "Checkout demo|pedido demo|cuenta demo|real v1|coexistencia|legacy" frontend/app frontend/componentes frontend/contenido frontend/infraestructura -S` -> **WARNING controlado**, solo modulos legacy/compatibilidad;
  - `git diff --check` -> **OK**, solo avisos CRLF del worktree.
- **Riesgos**:
  - quedan textos demo dentro del flujo `/encargo` porque la retirada funcional se abordara de forma atomica en tareas posteriores;
  - el checkout real aun tiene deuda de acoplamiento con helpers heredados.
- **Siguiente paso exacto**: ejecutar `RDL-002` para separar checkout real de helpers legacy.
