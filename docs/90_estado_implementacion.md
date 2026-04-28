# 90 — Estado de implementación del proyecto

## 1. Propósito del documento
Este documento es el tablero vivo de estado de **La Botica de la Bruja Lore**.

Su función es separar, sin ambigüedad:
- lo **definido documentalmente**,
- de lo **implementado funcionalmente**.

Se usa para gobernar avance real por ciclos, evitar declarar avances ficticios y mantener trazabilidad operativa entre capacidades, evidencia y estado.

## 2. Convención oficial de estados
Los estados oficiales de proyecto y capacidad son:

- **DEFINIDO**: la capacidad está especificada y alineada con arquitectura/dominio, pero no implementada.
- **PLANIFICADO**: la capacidad tiene ciclo objetivo y dependencia identificada para ejecución futura.
- **EN_PROGRESO**: existe implementación activa en curso dentro del ciclo actual.
- **DONE**: la capacidad está implementada y es verificable/navegable/demostrable, respeta arquitectura y pasa quality gate cuando aplica.
- **BLOQUEADO**: la capacidad no puede avanzar por dependencia, restricción o riesgo no resuelto.
- **DESCARTADO**: la capacidad se retira explícitamente del alcance con decisión trazable.

## 3. Principios de uso del documento
1. Este tablero **no reemplaza** visión, alcance, dominio ni arquitectura; los referencia.
2. No se marca **DONE funcional** sin implementación real verificable.
3. Lo documental puede estar cerrado sin que exista producto implementado.
4. Cada capacidad debe indicar ciclo asociado y evidencia concreta.
5. Este archivo se actualiza por cambios de estado, no como diario ni changelog narrativo.
6. En caso de duda, prevalece la fuente de verdad en `docs/`.

## 4. Estado global actual del proyecto
- Estado de definición estratégica/documental: **alto y consistente**.
- Estado de implementación funcional de producto: **ecommerce local real con pago simulado implementado y auditable; go-live externo bloqueado**.
- Backend (dominio/aplicación/infraestructura/presentación pública): **implementado para `Pedido` real, pago por puerto, stock, cuenta real, documento fiscal, postventa local y backoffice operativo**.
- Frontend (home + catálogo + cesta + checkout + pedido + cuenta): **implementado y navegable como flujo local real sobre `/checkout`, `/pedido/[id_pedido]` y `/mi-cuenta`**.
- Backoffice/admin mínimo: **implementado para operación de pedidos reales, inventario, incidencias, devoluciones/reembolsos simulados/manuales y trazabilidad**.
- Checkout demo, pedido demo y cuenta demo: **DEPRECATED_CONTROLLED**; permanecen accesibles como legacy, no como flujo principal ni base de nuevas features.
- Calendario ritual: **Prompts 1–3 implementados (dominio/aplicación + persistencia/API + frontend editorial mínimo con gate)**.
- Quality gate y CI canónica: **activos** con workflow `Quality Gate` en GitHub Actions (`push` + `pull_request`).

Resumen ejecutivo de estado real: existe recorrido funcional y defendible desde exploración editorial/comercial hasta checkout/pago reales, operación física mínima y ahora cuenta real v1 con área privada y pedidos asociados, manteniendo `CuentaDemo` como legado explícito y compatible.

## 4.0 Lectura rápida para agentes
- Ruta principal de compra local: `/checkout`.
- Pedido principal: `Pedido` real; detalle en `/pedido/[id_pedido]`.
- Cuenta visible: `/mi-cuenta`.
- Pago activo local: `BOTICA_PAYMENT_PROVIDER=simulado_local`.
- Stripe: **RESERVADO_FUTURO**; no activo en local y no debe exigirse para esta fase.
- Legacy: `/encargo`, `/pedido-demo`, `/pedido-demo/[id_pedido]`, `cuenta-demo`, `PedidoDemo` y `CuentaDemo` quedan **DEPRECATED_CONTROLLED**.
- Go-live externo: `V2-R10` sigue **BLOCKED** por staging/URLs reales, PostgreSQL seguro, smoke post-deploy, backup/restore drill real y validación externa.
- Siguiente paso recomendado: trabajar proximos hitos fuera del roadmap local (`staging`, Stripe sandbox futuro, E2E browser real, revision legal, backup/restore real, `V2-R10` y retirada fisica legacy), sin mezclarlo con el cierre local.

## 4.1 Nueva fase: ecommerce local real con pago simulado
- Capacidad: **Ecommerce local real con pago simulado**.
- Estado final de fase local: **CERRADO_LOCALMENTE**.
- Documento rector: `docs/roadmap_ecommerce_local_simulado.md`.
- Decisión estratégica:
  1. el flujo principal local pasa a ser ecommerce real sobre `/checkout`, `/pedido/[id_pedido]` y `/mi-cuenta`;
  2. producto, cesta, checkout, pedido, stock, cuenta, documento fiscal y backoffice deben operar como capacidades reales;
  3. la única pieza simulada será la pasarela de pago, siempre por puerto/adaptador;
  4. Stripe queda **RESERVADO_FUTURO** y no se activa como flujo local principal;
  5. la demo legacy queda **DEPRECATED_CONTROLLED**: `/encargo`, `/pedido-demo` y `cuenta-demo` permanecen accesibles, pero no gobiernan capacidades nuevas.
- Estado de pago simulado: **CONFIRMACION_LOCAL_IMPLEMENTADA**; webhook simulado queda pendiente.
- Regla activa: ninguna capacidad nueva debe depender de `PedidoDemo` ni de `CuentaDemo`; el legado demo se retira por sustitución progresiva, no por borrado inmediato.
- Avance UX ELS-002: **DONE** para deprecación pública inicial de demo legacy:
  1. navegación principal y CTA de footer apuntan al checkout real local;
  2. cesta y fichas públicas priorizan `/checkout` para compra normal;
  3. `/encargo` queda visible como consulta personalizada/orientación artesanal;
  4. `/pedido-demo` y `cuenta-demo` se conservan como legacy compatible, no como CTA principal.
- Avance backend ELS-003: **DONE** para pasarela simulada por puerto:
  1. `simulado_local` implementa el mismo puerto que Stripe desde infraestructura;
  2. `BOTICA_PAYMENT_PROVIDER` selecciona `simulado_local` por defecto local y conserva `stripe` como opcion futura;
  3. `Pedido` acepta `simulado_local` como proveedor de pago valido;
  4. no se implementan confirmacion, webhook simulado, descuento de stock ni post-pago simulado en esta fase.
- Avance backend ELS-004: **DONE** para confirmacion local de pago simulado:
  1. `POST /api/v1/pedidos/{id_pedido}/confirmar-pago-simulado/` confirma una intencion `simulado_local`;
  2. `ConfirmarPagoSimuladoPedido` valida proveedor, intencion y estado antes de confirmar;
  3. stock, incidencia operativa y email post-pago se procesan por `ProcesarPostPagoPedido`;
  4. Stripe y su webhook permanecen intactos y separados.
- Avance frontend ELS-005: **DONE** para UI de pago simulado en checkout real:
  1. el recibo real inicia pago y detecta `simulado_local` por proveedor;
  2. la UI muestra "Pago simulado local" y "Confirmar pago de prueba" sin reactivar `/encargo`;
  3. la confirmacion llama al endpoint real y redirige a `/pedido/[id_pedido]?retorno_pago=success`;
  4. Stripe no se elimina y el pago externo queda disponible para proveedor no simulado.
- Avance backend ELS-006: **DONE** para stock preventivo antes de pago:
  1. `ValidarStockPreventivoPedido` valida inventario desde aplicacion antes de iniciar pago;
  2. la confirmacion `simulado_local` revalida stock antes de llamar a `ProcesarPostPagoPedido`;
  3. si falta inventario, stock o unidad compatible, no se crea intencion nueva ni se marca pagado;
  4. la proteccion post-pago permanece activa como segunda barrera de concurrencia/cambios tardios.
- Avance full-stack ELS-007: **DONE** para disponibilidad visible:
  1. producto publico mantiene `disponible`/`estado_disponibilidad` y añade `disponible_compra`, `cantidad_disponible`, `mensaje_disponibilidad`;
  2. ficha/card comercial bloquean compra directa cuando no hay stock;
  3. cesta marca lineas sin stock y bloquea el avance a `/checkout`;
  4. checkout/recibo muestran errores preventivos de stock con copy comercial, sin codigos tecnicos.
- Avance frontend ELS-008: **DONE** para cesta real limpia:
  1. la cesta clasifica lineas como `comprable`, `requiere_consulta`, `invalida` o `sin_stock`;
  2. `/checkout` recibe solo lineas comprables con contrato real de producto;
  3. las lineas artesanales, no catalogadas o fuera de contrato bloquean el CTA principal y se derivan como consulta secundaria a `/encargo`;
  4. eliminar la linea bloqueante desbloquea el CTA real sin reactivar `PedidoDemo`.
- Avance full-stack ELS-009: **DONE** para cuenta real principal:
  1. la navegacion publica mantiene `/mi-cuenta` como unica cuenta visible y no promociona `cuenta-demo`;
  2. `/mi-cuenta` muestra datos de cuenta, pedidos reales, enlaces a `/pedido/[id_pedido]`, documento fiscal y direcciones guardadas;
  3. checkout real prioriza sesion y direcciones de cuenta real, manteniendo invitado como alternativa;
  4. `cuenta-demo` se conserva como legacy compatible, sin CTA desde la cuenta real principal.
- Avance full-stack ELS-010: **DONE** para recibo real local:
  1. `/pedido/[id_pedido]` usa copy de detalle de pedido real, sin "pedido demo", legacy o coexistencia;
  2. el recibo muestra fecha, estado de pedido/pago, contacto, entrega, lineas, totales, documento fiscal y seguimiento operativo;
  3. el pago `simulado_local` se comunica como pago confirmado en entorno local simulado, no como demo de tienda;
  4. el documento fiscal HTML incluye proveedor de pago, nota local simulada cuando aplica y mantiene la advertencia de numeracion fiscal legal avanzada pendiente.
- Avance backend ELS-011: **DONE** para backoffice operativo minimo:
  1. Django Admin de pedidos reales visibiliza cliente, email, total, estado, pago, proveedor, pago simulado, revision manual, inventario e incidencias;
  2. el listado incorpora filtros operativos para estados fisicos, revision, incidencia de stock, reembolso y pago simulado local;
  3. las acciones manuales de preparar, enviar y entregar reutilizan casos de uso de aplicacion sobre `Pedido`, no `PedidoDemo`;
  4. el envio requiere codigo de seguimiento o marca explicita de envio sin seguimiento;
  5. las acciones operativas registran actor, id de pedido, estado anterior/nuevo, `operation_id` y resultado.
- Avance backend ELS-012: **DONE** para postventa local simulada/manual:
  1. el reembolso de devolucion aceptada usa `ReembolsarPagoSimuladoManualPedido` solo para proveedor `simulado_local`;
  2. el reembolso simulado genera `SIM-REF-{id_pedido}-{operation_id}`, registra fecha y mantiene idempotencia;
  3. Django Admin de postventa no llama a Stripe para devoluciones aceptadas ni para reembolsos locales;
  4. la restitucion postventa usa `RestituirInventarioManualPostventa`, evita dobles restituciones y registra ledger cuando aplica;
  5. `DevolucionPedidoModelo` considera resuelta una devolucion aceptada cuando el reembolso esta ejecutado y la restitucion esta ejecutada o no aplica.
- Avance frontend/SEO ELS-013: **DONE** para noindex operativo:
  1. `/checkout`, `/pedido/[id_pedido]`, `/mi-cuenta`, auth y backoffice declaran metadata `noindex` mediante el helper SEO existente;
  2. `/encargo`, `/pedido-demo`, `/pedido-demo/[id_pedido]` y `cuenta-demo` permanecen como legacy controlado no indexable;
  3. `docs/seo_contrato.json` mantiene esas rutas fuera de sitemap y conserva catalogo/fichas/editorial como indexables cuando procede;
  4. no se desbloquea `V2-R10`, no se activan pagos reales y no se elimina legacy.
- Avance frontend ELS-014: **DONE** para limpieza de copy comercial:
  1. home, fichas, cesta, checkout, recibo, pedido, cuenta y rutas legacy visibles eliminan lenguaje publico de demo tecnica, V1, legacy, coexistencia, contrato/API/payload;
  2. el pago local se comunica solo donde procede como prueba en entorno local, sin presentar toda la tienda como demo;
  3. `/encargo`, `/pedido-demo` y `cuenta-demo` conservan compatibilidad controlada con copy comercial secundario;
  4. no se cambian URLs, logica de pagos, backend funcional ni claims de producto.
- Avance DevEx/QA ELS-015: **DONE** para gate local ecommerce simulado:
  1. `scripts/check_ecommerce_local_simulado.py` valida contratos minimos de ecommerce local simulado sin arrancar servidores ni depender de servicios externos;
  2. el gate usa severidades `OK`, `WARNING` y `BLOCKER`, con exit code `1` solo ante `BLOCKER` salvo `--fail-on warning`;
  3. la salida soporta texto humano y `--json`;
  4. el gate reafirma que `V2-R10` sigue bloqueado y que no se activan Stripe ni pagos reales.
- Avance backend/DevEx ELS-016: **DONE** para seed local comprable:
  1. `scripts/bootstrap_ecommerce_local_simulado.py` prepara datos locales minimos para compra de punta a punta;
  2. el dataset garantiza una seccion publica por familia comercial relevante, productos publicados, precio/tipo fiscal/unidad validos e inventario compatible;
  3. la cuenta cliente local y su direccion predeterminada se crean como apoyo opcional al checkout autenticado;
  4. el script es idempotente y ofrece `--dry-run` para validar sin persistir.
- Avance QA/full-stack ELS-017: **DONE** para regresion compra local:
  1. backend cubre catalogo/ficha, pedido real invitado, pago simulado, stock preventivo, documento fiscal y cuenta real con direccion guardada;
  2. frontend cubre cesta comprable, payload de checkout real, API de pago simulado y CTAs principales hacia `/checkout`/`/mi-cuenta`;
  3. la regresion verifica que el flujo principal no usa `PedidoDemo`, `/pedido-demo`, `cuenta-demo` ni `/encargo` para cerrar compra;
  4. no introduce E2E browser ni dependencias externas.

## 5. Estado por capacidades
| Capacidad | Estado actual | Ciclo asociado | Evidencia / referencia | Notas operativas |
|---|---|---|---|---|
| Base documental del proyecto | DONE | Ciclo 0 | `docs/00_vision_proyecto.md`, `docs/02_alcance_y_fases.md`, `docs/05_modelo_de_dominio_y_entidades.md`, `docs/07_arquitectura_tecnica.md`, `docs/08_decisiones_tecnicas_no_negociables.md` | Base documental vigente y alineada. |
| Contrato operativo del agente (`AGENTS.md`) | DONE | Ciclo 0 | `AGENTS.md` | Contrato operativo activo y consistente. |
| Núcleo de dominio/aplicación herbal (`Planta`, `Producto`, `Intencion` + casos de uso) | DONE | Ciclo 1 | `backend/nucleo_herbal/dominio/entidades.py`, `backend/nucleo_herbal/aplicacion/casos_de_uso.py`, `tests/nucleo_herbal/test_entidades.py`, `tests/nucleo_herbal/test_casos_de_uso.py` | Separación Planta/Producto aplicada y validada por tests unitarios. |
| Persistencia y repositorios mínimos | DONE | Ciclo 1 | `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios.py`, `tests/nucleo_herbal/infraestructura/test_repositorios_django.py` | Implementado; validación automática condicionada a disponibilidad de Django en entorno. |
| Exposición pública mínima real (API herbal) | DONE | Ciclo 1 | `backend/nucleo_herbal/presentacion/publica/urls.py`, `backend/nucleo_herbal/presentacion/publica/views.py`, `tests/nucleo_herbal/test_exposicion_publica.py` | Contratos públicos implementados para listado, detalle, productos y relaciones por intención. |
| Backoffice mínimo útil | DONE | Ciclo 1 | `backend/nucleo_herbal/infraestructura/persistencia_django/admin.py`, `tests/nucleo_herbal/infraestructura/test_admin_django.py` | Admin mínimo implementado para Intención/Planta/Producto. |
| Home orientadora conectada | DONE | Ciclo 1 | `frontend/app/page.tsx`, `frontend/componentes/home/` | Home conectada con preview herbal y entrada a exploración. |
| Listado herbal navegable | DONE | Ciclo 1 | `frontend/app/hierbas/page.tsx`, `frontend/componentes/herbal/ListadoHerbal.tsx` | Listado conectado al contrato público backend. |
| Ficha herbal conectada (editorial + comercial mínima) | DONE | Ciclo 1 | `frontend/app/hierbas/[slug]/page.tsx`, `frontend/componentes/herbal/detalle/` | Separación editorial/comercial visible en UI y consumo de API. |
| Dominio/aplicación ritual conectada (`Ritual` + casos de uso) | DONE | Ciclo 2 | `backend/nucleo_herbal/dominio/rituales.py`, `backend/nucleo_herbal/aplicacion/casos_de_uso_rituales.py`, `tests/nucleo_herbal/test_entidades_rituales.py`, `tests/nucleo_herbal/test_casos_de_uso_rituales.py` | Intención como eje puente y relaciones ritual ↔ planta/producto implementadas y validadas. |
| Persistencia/repositorios ritual | DONE | Ciclo 2 | `backend/nucleo_herbal/infraestructura/persistencia_django/models.py`, `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios.py`, `tests/nucleo_herbal/infraestructura/test_repositorios_django.py` | Persistencia mínima de rituales y cruces críticos operativa en Django. |
| Exposición pública ritual mínima real | DONE | Ciclo 2 | `backend/nucleo_herbal/presentacion/publica/urls_rituales.py`, `backend/nucleo_herbal/presentacion/publica/views.py`, `tests/nucleo_herbal/test_exposicion_publica.py` | Listado/ficha ritual y endpoints de relaciones publicados con contrato consistente. |
| Backoffice mínimo ritual | DONE | Ciclo 2 | `backend/nucleo_herbal/infraestructura/persistencia_django/admin.py`, `tests/nucleo_herbal/infraestructura/test_admin_django.py` | Admin permite gestionar rituales y relaciones del ciclo sin ampliar alcance. |
| Listado ritual navegable | DONE | Ciclo 2 | `frontend/app/rituales/page.tsx`, `frontend/componentes/rituales/ListadoRituales.tsx` | Ruta pública funcional y conectada a backend real. |
| Ficha ritual conectada | DONE | Ciclo 2 | `frontend/app/rituales/[slug]/page.tsx`, `frontend/componentes/rituales/detalle/` | Ficha con bloques editoriales y resolución comercial mínima enlazando a herbal/producto. |
| Integración bidireccional herbal ↔ ritual | DONE | Ciclo 2 | `frontend/componentes/herbal/detalle/BloqueRitualesRelacionados.tsx`, `frontend/componentes/rituales/detalle/BloquePlantasRelacionadas.tsx`, `tests/nucleo_herbal/test_exposicion_publica.py` | Recorridos de ida y vuelta implementados sin romper prioridad herbal en navegación. |
| Quality gate mínimo operativo de ciclo | DONE | Ciclo 2 (cierre) | `python manage.py check`, `python manage.py test`, `pytest -q tests/nucleo_herbal/test_entidades.py tests/nucleo_herbal/test_casos_de_uso.py tests/nucleo_herbal/test_entidades_rituales.py tests/nucleo_herbal/test_casos_de_uso_rituales.py`, `npm run lint`, `npm run build` | Gate mínimo de cierre ejecutado en entorno local con resultados favorables. |
| Checkout demo | DONE / DEPRECATED_CONTROLLED | Ciclo 3 legacy | `docs/10_checkout_y_flujos_ecommerce.md`, `docs/17_migracion_ecommerce_real.md` | Implementado como legacy; no usar para nuevas features. |
| Login / invitado | DONE | Ciclo 3–4 + ecommerce real | `docs/17_migracion_ecommerce_real.md`, `/checkout`, `/mi-cuenta` | Invitado y cuenta real operan en checkout real; cuenta demo queda legacy. |
| Historial de pedidos demo | DONE / DEPRECATED_CONTROLLED | Ciclo 4 legacy | `docs/10_checkout_y_flujos_ecommerce.md`, `docs/plan_retirada_legacy_demo.md` | Conservado como histórico/controlado; no es cuenta visible principal. |
| Favoritos | PLANIFICADO | Ciclo 4 | `docs/02_alcance_y_fases.md`, `docs/05_modelo_de_dominio_y_entidades.md` | Sin cambios, fuera de alcance. |
| Recordatorios | PLANIFICADO | Ciclo 4–5 | `docs/02_alcance_y_fases.md`, `docs/05_modelo_de_dominio_y_entidades.md` | Sin cambios, fuera de alcance. |
| Cuenta real v1 (`CuentaCliente`) | DONE | Evolución ecommerce real | `backend/nucleo_herbal/dominio/cuentas_cliente.py`, `backend/nucleo_herbal/presentacion/publica/views_cuentas_cliente.py`, `frontend/app/mi-cuenta/page.tsx`, `frontend/componentes/cuenta_cliente/PanelCuentaCliente.tsx`, `tests/nucleo_herbal/test_api_cuentas_cliente.py` | Registro/login/logout reales con sesión backend, pedidos asociados y coexistencia explícita con `CuentaDemo` legacy. |
| Verificación de email cuenta real v1.1 | DONE | Evolución ecommerce real | `backend/nucleo_herbal/aplicacion/casos_de_uso_cuentas_cliente.py`, `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios_cuentas_cliente.py`, `backend/nucleo_herbal/presentacion/publica/views_cuentas_cliente.py`, `frontend/app/verificar-email/page.tsx`, `frontend/componentes/cuenta_cliente/PanelCuentaCliente.tsx`, `tests/nucleo_herbal/test_casos_de_uso_verificacion_email_cuenta_cliente.py`, `tests/nucleo_herbal/test_api_cuentas_cliente.py` | Registro crea cuenta no verificada, genera/verifica token seguro, permite reenvío controlado y refleja el estado en UI de cuenta real. |
| Recuperación de contraseña cuenta real v1.1 | DONE | Evolución ecommerce real | `backend/nucleo_herbal/aplicacion/casos_de_uso_cuentas_cliente.py`, `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios_cuentas_cliente.py`, `backend/nucleo_herbal/presentacion/publica/views_cuentas_cliente.py`, `frontend/app/recuperar-password/page.tsx`, `frontend/componentes/cuenta_cliente/FormularioRecuperacionPassword.tsx`, `frontend/infraestructura/api/cuentasCliente.ts`, `tests/nucleo_herbal/test_casos_de_uso_recuperacion_password_cuenta_cliente.py`, `tests/nucleo_herbal/test_api_cuentas_cliente.py`, `frontend/tests/cuenta-cliente-recuperacion.test.ts` | Flujo real por email con respuesta genérica, token seguro con expiración, invalidación tras uso y UI mínima para solicitud y reset sin reabrir alcance ajeno. |
| Calendario ritual | DONE | Ciclo 5 | `backend/nucleo_herbal/dominio/calendario_ritual.py`, `backend/nucleo_herbal/aplicacion/casos_de_uso_calendario_ritual.py`, `backend/nucleo_herbal/presentacion/publica/views.py`, `frontend/app/calendario-ritual/page.tsx`, `frontend/infraestructura/api/calendarioRitual.ts`, `frontend/tests/calendario-ritual.test.ts`, `docs/ciclos/ciclo_05_calendario_editorial.md` | Prompts 1–3 oficiales cubiertos (dominio/aplicación + persistencia/API + frontend/gate mínimo). |

## 6. Último ciclo cerrado
- **Ciclo cerrado formalmente**: Ciclo 2 (rituales conectados).
- **Estado de Ciclo 2**: **DONE técnico** para su contrato de alcance.
- **Evidencia de cierre de Ciclo 2**:
  - recorrido directo validado: home → rituales → ficha ritual conectada → plantas/productos,
  - recorrido inverso validado: home → hierbas → ficha herbal → rituales relacionados,
  - separación editorial/comercial mantenida en backend y frontend,
  - backoffice mínimo ritual y exposición pública mínima ritual operativos,
  - quality gate mínimo ejecutado con checks backend/frontend en verde.

## 7. Ciclo actual
- **Ciclo operativo vigente**: Ciclo 5 (Prompts 1–3 ejecutados).
- **Estado**: **EN_PROGRESO**.
- **Condición de continuidad aplicada**:
  1. Prompts 1–3 de Ciclo 5 implementados con separación limpia de capas;
  2. Ciclos 3 y 4 permanecen cerrados sin reapertura de alcance;
  3. ciclo técnicamente cerrable sin adelantar capacidades de ciclo siguiente.

## 8. Deuda y bloqueos conocidos
1. No se detectan bloqueos técnicos/documentales para declarar Ciclo 5 cerrable tras Prompt 3.
2. La activación de nuevas capacidades debe entrar exclusivamente por roadmap oficial siguiente, evitando frentes paralelos.

## 8.1 Transición formal demo → real
- Capacidad: **Base arquitectónica de migración ecommerce real**.
- Estado: **EN_PROGRESO**.
- Evidencia implementada:
  - contrato canónico real en `backend/nucleo_herbal/dominio/pedidos.py`;
  - adaptador anti-corrupción inicial en `backend/nucleo_herbal/aplicacion/anti_corrupcion_pedidos_demo.py`;
  - decisión documental y mapa de migración en `docs/17_migracion_ecommerce_real.md`.
- Regla activa:
  1. `PedidoDemo` queda congelado como legado controlado.
  2. Toda nueva semántica transaccional real debe entrar por `Pedido`.
  3. La retirada de rutas demo será incremental y con coexistencia temporal.

## 8.2 Pago real v1 sobre Pedido
- Capacidad: **Pago real v1 desacoplado del dominio**.
- Estado: **DONE**.
- Evidencia implementada:
  - puerto `backend/nucleo_herbal/aplicacion/puertos/pasarela_pago.py`;
  - adaptador Stripe `backend/nucleo_herbal/infraestructura/pagos_stripe.py`;
  - caso de uso `backend/nucleo_herbal/aplicacion/casos_de_uso_pago_pedidos.py`;
  - rutas `POST /api/v1/pedidos/{id_pedido}/iniciar-pago/` y `POST /api/v1/pedidos/webhooks/stripe/`;
  - frontend de continuación en `frontend/componentes/catalogo/checkout-real/ReciboPedidoReal.tsx`.
- Regla activa:
  1. El dominio sigue desacoplado de Stripe.
  2. El flujo demo legacy no se toca para cobro real.
  3. El siguiente incremento debe cerrar post-pago operativo y gestión administrativa del pedido pagado.

## 8.3 Envío estándar v1 + total real del pedido
- Capacidad: **DONE**.
- Evidencia implementada:
  - `Pedido` incorpora `metodo_envio=envio_estandar`, `importe_envio` y `total=subtotal+importe_envio`;
  - resolución desacoplada de tarifa fija configurable vía `ENVIO_ESTANDAR_IMPORTE`;
  - checkout/serialización y recibo real muestran `subtotal`, `importe_envio` y `total`;
  - el inicio de pago real y Stripe usan el **total real** (incluyendo envío) como importe final.
- Regla activa:
  1. sigue existiendo un único método `envio_estandar`;
  2. no hay selector de métodos, reglas geográficas, impuestos ni promociones en este bloque.

## 9. Próximos movimientos recomendados
1. Ejecutar validación de cierre técnico de Ciclo 5 con `python scripts/check_release_gate.py` en cada incremento posterior.
2. Preservar trazabilidad estado↔roadmap para evitar reabrir capacidades ya cerradas de Ciclos 3 y 4.
3. No abrir nuevas capacidades sin contrato explícito del siguiente ciclo.
4. Checkout real v1 en coexistencia: DONE para contrato, ruta API, persistencia y frontend dedicado sin romper el flujo demo legado.
5. Pago real v1: DONE para intención Stripe desacoplada, webhook mínimo seguro, transición `pendiente_pago` → `pagado`, decremento real de inventario al confirmar pago e idempotencia reforzada.

## 10. Reencauce de control por ciclos (actualización de gobierno)
- Diagnóstico oficial: **C (deriva detectada)**.
- Causa de deriva: en frontend se implementaron capacidades valiosas (home comercial, catálogo/colecciones, cesta ritual local, flujo de encargo, marca y legales) que no corresponden al contrato congelado de `docs/ciclos/ciclo_03_ecommerce_demo.md` (carrito + checkout demo + pedido demo + confirmación + recibo/email).
- Decisión operativa: **no abrir nueva feature** hasta absorber documentalmente la deriva y dejar explícito el siguiente paso único del ciclo.
- Estado oficial tras reencauce:
  - Ciclo 1: **DONE**.
  - Ciclo 2: **DONE**.
  - Ciclo 3 (ecommerce demo completo): **EN_PROGRESO**, sin cierre válido todavía.
  - Microciclo de reencauce documental: **DONE** con trazabilidad en `docs/ciclos/ciclo_03_reencauce_control.md`.
- Regla activa de continuidad: todo incremento nuevo debe mapearse explícitamente a un prompt del roadmap oficial de Ciclo 3 o bloquearse por sobrealcance.

---

**Regla de lectura rápida del estado actual:**
- Ciclo 2 está técnicamente cerrado con evidencia de recorrido y quality gate mínimo operativo.
- No se detectan bloqueos externos que impidan declarar DONE dentro del contrato de este ciclo.
- El siguiente paso correcto es abrir Ciclo 3 respetando el alcance ya definido.

## 11. Actualización incremental de home (Ciclo 3 en progreso)
- Capacidad: **Home comercial + narrativa + UX ligera**.
- Estado: **EN_PROGRESO**.
- Evidencia implementada:
  - estructura de contenido mantenible centralizada en `frontend/contenido/home/contenidoHome.ts`;
  - secciones nuevas en home: hero refinado, Alquimia del Deseo, intenciones con selector, cómo elegir ritual, confianza comercial, FAQ accesible y CTA final;
  - mejoras UX: navegación por anclas, tabs de intenciones sin recarga y acordeón FAQ accesible.
- Tests añadidos para lógica de interacción de tabs/FAQ en `frontend/tests/home-interacciones.test.ts`.
- Nota operativa: la ampliación de contenido futuro debe hacerse sobre el módulo de contenido, evitando hardcodear bloques largos dentro de componentes de presentación.

## 12. Catálogo/colecciones navegables (Ciclo 3 en progreso)
- Capacidad: **Catálogo ritual navegable con filtros y ordenación**.
- Estado: **EN_PROGRESO**.
- Implementación activa:
  - ruta pública `frontend/app/colecciones/page.tsx` como entrada de colecciones;
  - fuente de datos tipada en `frontend/contenido/catalogo/catalogo.ts`;
  - lógica pura de filtrado/ordenación en `frontend/contenido/catalogo/filtrosCatalogo.ts`;
  - UI de catálogo con controles y estado vacío en `frontend/componentes/catalogo/`;
  - enlace desde home al catálogo actualizado en `frontend/contenido/home/contenidoHome.ts`.
- Ampliación implementada (ficha por slug):
  - ruta dinámica `frontend/app/colecciones/[slug]/page.tsx` con `notFound()` para slugs inválidos;
  - componente de detalle en `frontend/componentes/catalogo/detalle/FichaProductoCatalogo.tsx`;
  - helpers puros de resolución y relacionados en `frontend/contenido/catalogo/detalleCatalogo.ts`;
  - navegación de tarjetas actualizada en `frontend/componentes/catalogo/TarjetaCatalogo.tsx` hacia `/colecciones/[slug]`.
- Tests añadidos para detalle de catálogo en `frontend/tests/catalogo-detalle.test.ts` (slug válido/inexistente, relacionados y fallback).
- Regla operativa para ampliar fichas y relacionados:
  1. Cada nuevo producto debe incluir `slug` único en `PRODUCTOS_CATALOGO`.
  2. La lógica de resolución de detalle y relacionados se mantiene en `detalleCatalogo.ts`, nunca dentro del componente de página.
  3. Los textos de guía ritual por intención se amplían en `obtenerGuiaRitual` para mantener presentación desacoplada de la capa de datos.
- Regla operativa para ampliar catálogo:
  1. Añadir productos en `PRODUCTOS_CATALOGO` siguiendo el tipo `ProductoCatalogo`.
  2. Si se incorpora una nueva intención/categoría, extender primero `OPCIONES_INTENCION` y/o `OPCIONES_CATEGORIA`.
  3. Mantener filtros/ordenación en helpers puros (`filtrosCatalogo.ts`), evitando hardcodear lógica en componentes de presentación.
- Regla operativa para buscador y URL compartible del catálogo:
  1. La normalización/tokenización y búsqueda textual viven en `frontend/contenido/catalogo/busquedaCatalogo.ts`.
  2. El estado compartible de catálogo (`q`, `in`, `cat`, `ord`) se serializa/deserializa en `frontend/contenido/catalogo/estadoCatalogoUrl.ts`.
  3. Para ampliar campos indexables, extender `construirIndiceBusqueda` sin mover lógica al componente `CatalogoColecciones`.
  4. Cualquier cambio en filtros/orden debe seguir resolviéndose en `resolverCatalogo` para mantener compatibilidad con tarjeta, cesta ritual y flujo `/encargo`.

## 13. Flujo ligero de encargo/consulta desde ficha (Ciclo 3 en progreso)
- Capacidad: **Conversión de ficha de colección a acción comercial sin checkout**.
- Estado: **EN_PROGRESO**.
- Implementación activa:
  - ruta `frontend/app/encargo/page.tsx` para iniciar consultas ligeras con metadata propia;
  - CTA principal de ficha en `frontend/componentes/catalogo/detalle/FichaProductoCatalogo.tsx` enlazado a `/encargo?producto=<slug>`;
  - formulario y UX del flujo en `frontend/componentes/catalogo/encargo/FlujoEncargoConsulta.tsx` + estilos encapsulados;
  - helpers puros en `frontend/contenido/catalogo/encargoConsulta.ts` para preselección, estado inicial, validación, resumen y fallback por slug inválido;
  - configuración pública de contacto y resolución de canal en `frontend/contenido/catalogo/canalContactoPublico.ts`.
- Cierre de flujo actual:
  - sin backend nuevo ni integraciones externas;
  - salida con resumen copiable de solicitud y CTA real solo si existe configuración pública legítima;
  - fallback seguro a "Copiar solicitud" cuando no hay email o WhatsApp público válido.
- Tests añadidos:
  - `frontend/tests/encargo-consulta.test.ts` cubre preselección por slug, slug inválido, entrada directa sin slug, validación y construcción de resumen.
  - `frontend/tests/encargo-canal-contacto.test.ts` cubre disponibilidad de canal, construcción de enlace y fallback sin configuración.
- Guía de ampliación controlada:
  1. Para preseleccionar desde cualquier ficha, usar query param `producto` con slug (`/encargo?producto=<slug>`).
  2. Nuevos campos del formulario deben iniciar en `construirEstadoInicialConsulta` y validarse en `validarSolicitudConsulta`.
  3. El texto final que viaja a canales externos se centraliza en `construirResumenConsulta`.
  4. La configuración pública vive en variables `NEXT_PUBLIC_CONTACT_EMAIL` y/o `NEXT_PUBLIC_CONTACT_WHATSAPP`; si no existen o son inválidas, no se expone canal.
  5. Si más adelante se conecta un canal real adicional, extender `canalContactoPublico.ts` sin duplicar la composición del mensaje ni mezclar reglas de validación en componentes grandes.

## 14. Actualización puntual — Shell comercial global (frontend)
- **Capacidad**: shell comercial global con cabecera, navegación unificada, acceso visible a cesta y footer editorial.

## 15. Actualización incremental — R02 producto vendible y cantidad comercial
- Capacidad: **Semántica comercial explícita de producto vendible**.
- Estado: **DONE**.
- Evidencia implementada:
  - `Producto` incorpora contrato comercial (`unidad_comercial`, `incremento_minimo_venta`, `cantidad_minima_compra`) en dominio, ORM, DTO y serialización pública;
  - migración compatible con datos existentes mediante defaults conservadores (`ud`, `1`, `1`);
  - validaciones de backoffice para unidad válida, incremento/mínimo > 0, compatibilidad mínimo↔incremento y coherencia mínima con `InventarioProducto.unidad_base` cuando ya existe inventario.
- Regla activa:
  1. la línea de pedido real y el checkout real ya usan `cantidad_comercial` + `unidad_comercial`; el payload legacy `cantidad` se mantiene solo como compatibilidad transitoria en backend;
  2. las cantidades comerciales siguen siendo enteras (sin floats) y controladas por catálogo cerrado de unidades.

## 16. Actualización incremental — R04 checkout real compatible con granel
- Capacidad: **Checkout real con semántica comercial explícita para unitario y granel**.
- Estado: **DONE**.
- Evidencia implementada:
  - frontend checkout real construye líneas con `cantidad_comercial` + `unidad_comercial` y muestra unidad/incremento/mínimo en UX mínima;
  - validación frontend de enteros sin floats, múltiplos de incremento y mínimo de compra por producto;
  - backend aplica validación final de semántica comercial por línea (`unidad_comercial`, `incremento_minimo_venta`, `cantidad_minima_compra`) antes de validar stock;
  - pruebas backend y frontend de checkout real cubren caso unitario, caso granel válido y rechazos por unidad/incremento/mínimo.
- Regla activa:
  1. frontend converge al contrato nuevo de R03 y evita depender del alias legacy para construir pedidos reales;
  2. la compatibilidad legacy de `cantidad` queda restringida al backend mientras existan consumidores transitorios;
  3. no se amplía alcance a fiscalidad, promociones, métodos de envío múltiples ni logística avanzada.
- **Estado**: DONE.
- **Ciclo asociado**: evolución ecommerce demo (frontend).
- **Evidencia técnica**:
  - `frontend/app/layout.tsx`
  - `frontend/componentes/shell/CabeceraComercial.tsx`
  - `frontend/componentes/shell/NavegacionPrincipal.tsx`
  - `frontend/componentes/shell/FooterComercial.tsx`
  - `frontend/contenido/shell/navegacionGlobal.ts`
  - `frontend/tests/shell-global.test.ts`
- **Notas**:
  - Ruta activa resuelta con helper tipado y `aria-current`.
  - Contador de cesta integrado en navegación global sin convertir el layout entero en componente cliente.
  - Responsive base resuelta sin dependencias nuevas ni rediseño masivo.

## 17. Actualización incremental — R05 descuento post-pago según unidad base
- Capacidad: **Descuento post-pago unit-aware (cantidad + unidad comercial contra unidad base de inventario)**.

## 18. Actualización incremental — V2-R09 seguridad y ACL mínima
- Capacidad: **Seguridad de acceso y ACL mínima en superficies privadas críticas**.
- Estado: **DONE**.
- Evidencia implementada:
  - autorización backend owner-only para pedidos de cuenta real en detalle (`GET /api/v1/pedidos/{id}/`), documento (`GET /api/v1/pedidos/{id}/documento/`) e inicio de pago (`POST /api/v1/pedidos/{id}/iniciar-pago/`);
  - denegación explícita (`401` no autenticado, `403` usuario distinto) con contrato JSON estable para accesos cruzados;
  - proxy privado de backoffice Next (`/api/backoffice/proxy/*`) exige sesión/token antes de reenviar;
  - tests de autorización añadidos para no acceso cruzado y no regresión de acceso válido.
- Regla activa:
  1. pedidos asociados a cuenta real (`id_usuario`/`id_cliente`) sólo son accesibles por su propietario autenticado o staff activo;
  2. pedidos invitados legacy mantienen compatibilidad de acceso público por alcance de coexistencia;
  3. el proxy de backoffice no actúa como única barrera: backend sigue validando staff en cada endpoint privado.

- Estado: **DONE**.
- Evidencia implementada:
  - el caso de uso post-pago valida por línea la compatibilidad de unidad (`unidad_comercial` de la línea vs `unidad_base` de inventario) antes de cualquier descuento;
  - el descuento usa explícitamente `cantidad_comercial` (sin alias legacy) para unitarios y granel;
  - ante unidad incompatible o stock insuficiente, el pedido queda `pagado` con incidencia operativa (`inventario_descontado=False`, `incidencia_stock_confirmacion=True`, `requiere_revision_manual=True`) y sin descuento parcial;
  - pruebas backend de post-pago cubren unitario, granel `g`, idempotencia, no descuento parcial y conflicto de unidad.
- Regla activa:
  1. no se introducen conversiones entre unidades diferentes en R05: la unidad de línea debe coincidir exactamente con la unidad base;
  2. no se abren reservas previas, devoluciones automáticas ni ledger completo de inventario (queda para R06).

## 15. Página editorial de marca / La Botica (Ciclo 3 en progreso)
- Capacidad: **Capa de marca sólida conectada al flujo comercial**.
- Estado: **EN_PROGRESO**.
- Implementación activa:
  - nueva ruta pública `frontend/app/la-botica/page.tsx` con metadata SEO específica centralizada en contenido de marca;
  - composición en `frontend/componentes/marca/PaginaEditorialBotica.tsx` + estilos encapsulados;
  - contenido tipado y mantenible en `frontend/contenido/marca/contenidoMarca.ts`.
- Integración con shell global:
  - enlace de navegación principal y footer en `frontend/contenido/shell/navegacionGlobal.ts`.
- Tests añadidos:
  - `frontend/tests/marca-contenido.test.ts` valida bloques mínimos y CTA conectadas a catálogo/encargo;
  - `frontend/tests/shell-global.test.ts` actualizado para reflejar la nueva ruta editorial.
- Guía de ampliación controlada:
  1. Añadir o ajustar copy de marca exclusivamente en `contenidoMarca.ts`.
  2. Mantener composición declarativa en `PaginaEditorialBotica.tsx` evitando hardcodear texto largo en componentes de shell.
  3. Conservar CTA principales a `/colecciones` y `/encargo` para sostener continuidad narrativa → acción comercial.

## 16. Páginas legales/comerciales mínimas de confianza (Ciclo 3 en progreso)
- Capacidad: **Capa mínima de confianza operativa/legal en frontend**.
- Estado: **EN_PROGRESO**.
- Implementación activa:
  - nuevas rutas públicas: `frontend/app/condiciones-encargo/page.tsx`, `frontend/app/envios-y-preparacion/page.tsx`, `frontend/app/privacidad/page.tsx`;
  - composición compartida en `frontend/componentes/legal/PaginaLegalComercial.tsx` con estilos encapsulados;
  - contenido tipado + metadata centralizada en `frontend/contenido/legal/paginasLegalesComerciales.ts`.
- Integración:
  - enlaces legales/comerciales incorporados al footer global mediante `frontend/contenido/shell/navegacionGlobal.ts`;
  - refuerzo contextual dentro de `/encargo` con accesos directos a condiciones, envíos y privacidad.
- Regla operativa para ampliar textos sin hardcodear:
  1. Ajustar títulos, introducción, secciones, CTA y metadata en `paginasLegalesComerciales.ts`.
  2. Mantener la presentación en `PaginaLegalComercial.tsx` sin duplicar contenido por página.
  3. Para notas dinámicas de contacto público usar `describirCanalPublico` con la configuración existente (`NEXT_PUBLIC_CONTACT_EMAIL` y `NEXT_PUBLIC_CONTACT_WHATSAPP`), preservando fallback honesto cuando no exista canal.
- Tests añadidos:
  - `frontend/tests/legal-comercial.test.ts` (estructura mínima, metadata, rutas y fallback de contacto);
  - `frontend/tests/shell-global.test.ts` actualizado para comprobar enlaces legales en footer.

## 17. Base transaccional demo de pedidos (Prompt 1 oficial Ciclo 3)
- Capacidad: **Núcleo dominio/aplicación para `PedidoDemo` y `LineaPedido`**.

- Estado: **EN_PROGRESO**.
- Implementación activa:
  - agregado y reglas de dominio en `backend/nucleo_herbal/dominio/pedidos_demo.py`;
  - casos de uso mínimos en `backend/nucleo_herbal/aplicacion/casos_de_uso_pedidos_demo.py`;
  - DTOs transaccionales demo en `backend/nucleo_herbal/aplicacion/dto.py`.
- Reglas cerradas en este incremento:
  1. `PedidoDemo` requiere identificador, email, canal válido y al menos una línea.
  2. `LineaPedido` valida snapshot mínimo (producto, cantidad > 0, precio demo >= 0).
  3. Normalización de líneas repetidas con rechazo de snapshot inconsistente (nombre/precio distinto para mismo producto).
  4. Subtotal demo calculable por línea y por pedido en núcleo desacoplado de framework.
- Tests añadidos:
  - `tests/nucleo_herbal/test_entidades_pedidos_demo.py`;

## 17.1 Actualización incremental — R12 recibo descargable y trazable
- Capacidad: **Documento descargable mínimo de pedido real**.
- Estado: **DONE**.
- Evidencia implementada:
  - backend expone `/api/v1/pedidos/{id_pedido}/documento/` con respuesta HTML `attachment` construida desde `PedidoRealDTO` canónico;
  - el documento muestra identificador, fecha de pedido, cliente, líneas, subtotal, envío, impuestos, total, moneda y estado cliente (incluyendo cancelación/reembolso cuando aplica);
  - frontend añade acceso directo al recibo desde `/pedido/[id_pedido]` y desde `/mi-cuenta/pedidos` sin rediseñar el área privada;
  - pruebas backend y frontend del bloque en verde con contrato de documento y visibilidad de acceso.
- Regla activa:
  1. Se evita versionar binarios (sin PDFs estáticos en repo).
  2. La aritmética del documento no se recalcula en frontend ni en un modelo paralelo.

## 18. Persistencia e infraestructura de pedidos demo (Prompt 2 oficial Ciclo 3)
- Capacidad: **Persistencia mínima de `PedidoDemo` y `LineaPedido` con repositorio ORM y mapeo dominio↔persistencia**.
- Estado: **EN_PROGRESO**.
- Implementación activa:
  - puerto de repositorio transaccional en `backend/nucleo_herbal/aplicacion/puertos/repositorios_pedidos_demo.py`;
  - modelos ORM y migración de esquema para pedido demo y líneas en `backend/nucleo_herbal/infraestructura/persistencia_django/models.py` y `backend/nucleo_herbal/infraestructura/persistencia_django/migrations/0003_pedidodemomodelo_lineapedidomodelo.py`;
  - mapeo de reconstrucción de agregado y snapshot de líneas en `backend/nucleo_herbal/infraestructura/persistencia_django/mapeadores.py`;
  - repositorio concreto en `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios.py`.
- Operaciones mínimas cerradas en este incremento:
  1. guardar/actualizar agregado `PedidoDemo` con reemplazo consistente de líneas snapshot;
  2. obtener pedido demo por identificador con reconstrucción del agregado;
  3. actualizar estado demo y reconstruir agregado resultante.
- Integración mínima con aplicación:
  - nuevo caso de uso `RegistrarPedidoDemo` en `backend/nucleo_herbal/aplicacion/casos_de_uso_pedidos_demo.py` para orquestar construcción + persistencia sin acoplar dominio al ORM.
- Tests añadidos:
  - integración ORM en `tests/nucleo_herbal/infraestructura/test_repositorios_django.py` para guardado, reconstrucción, líneas, importes y estado/canal;
  - integración aplicación↔puerto en `tests/nucleo_herbal/test_casos_de_uso_pedidos_demo.py`.
- Trazabilidad del roadmap:
  - este cambio cubre el alcance oficial del **Prompt 2** (persistencia/infraestructura);
  - sigue pendiente Prompt 3 (API del flujo), sin adelantar endpoints ni UI checkout.

## 19. API del flujo de pedido demo (Prompt 3 oficial Ciclo 3)
- Capacidad: **Exposición API mínima para crear y consultar `PedidoDemo`**.
- Estado: **EN_PROGRESO**.
- Implementación activa:
  - endpoints en `backend/nucleo_herbal/presentacion/publica/urls_pedidos_demo.py` y `backend/nucleo_herbal/presentacion/publica/views_pedidos_demo.py`;
  - serialización HTTP de pedido demo en `backend/nucleo_herbal/presentacion/publica/pedidos_demo_serializadores.py`;
  - cableado de casos de uso para pedidos demo en `backend/nucleo_herbal/presentacion/publica/dependencias.py`;
  - recuperación por identificador en aplicación mediante `ObtenerPedidoDemoPorId` en `backend/nucleo_herbal/aplicacion/casos_de_uso_pedidos_demo.py`.
- Operaciones mínimas cerradas en este incremento:
  1. crear pedido demo por API con validación de forma/tipos básicos;
  2. recuperar pedido demo por identificador;
  3. devolver contrato de respuesta mínimo (`id_pedido`, `estado`, `canal`, `email`, `resumen`, `lineas`).
- Tests añadidos:
  - `tests/nucleo_herbal/test_api_pedidos_demo.py` (creación válida, payload inválido, línea inválida, autenticado sin usuario, consulta existente e inexistente).

## 42. Actualización incremental — R08 restitución manual de inventario
- Capacidad: **Restitución manual explícita, auditable e idempotente de inventario**.
- Estado: **DONE**.
- Evidencia implementada:
  - `Pedido` añade trazabilidad explícita (`inventario_restituido`, `fecha_restitucion_inventario`) para marcar restituciones manuales cerradas;
  - nuevo caso de uso `RestituirInventarioManualPedidoCancelado` en backoffice aplicación, con política de elegibilidad conservadora y rechazo explícito por estado inválido/sin descuento;
  - restitución transaccional de stock por `cantidad_comercial` + validación de unidad contra `unidad_base`, registrando movimiento `restitucion_manual` en ledger existente;
  - Django Admin incorpora la acción `restituir_inventario_manual` sobre pedidos reales y visibilidad del estado de restitución;
  - pruebas backend de dominio/aplicación/repositorio/admin cubren caso válido, rechazos e idempotencia sin duplicar movimiento.
- Regla activa:
  1. la restitución **no** se automatiza en cancelación ni en reembolso;
  2. solo aplica sobre pedidos cancelados operativamente que sí descontaron inventario y no fueron restituidos antes;
  3. cualquier intento no elegible se rechaza de forma auditable y sin efectos parciales sobre stock/ledger.
## 20. Backoffice mínimo de pedidos demo (Prompt 4 oficial Ciclo 3)
- Capacidad: **Backoffice/admin mínimo para consulta y gestión operativa básica de `PedidoDemo`**.
- Estado: **EN_PROGRESO**.
- Implementación activa:
  - registro de `PedidoDemoModelo` en Django Admin con listado operativo en `backend/nucleo_herbal/infraestructura/persistencia_django/admin.py`;
  - inline de `LineaPedidoModelo` en detalle de pedido demo para visualizar snapshot de líneas;
  - filtros mínimos de backoffice por estado/canal y búsqueda por id/email de pedido demo.
- Operaciones mínimas cerradas en este incremento:
  1. listar pedidos demo con campos operativos (`id_pedido`, `email_contacto`, `canal_compra`, `estado`, número de líneas, fecha);
  2. consultar detalle de pedido demo con lectura de líneas snapshot;
  3. actualizar estado de pedido demo desde admin (edición individual de `estado`).
- Tests añadidos:
  - `tests/nucleo_herbal/infraestructura/test_admin_django.py` ampliado con cobertura de registro de modelo, changelist de pedidos demo, búsqueda/filtro y edición de estado desde detalle.
- Trazabilidad del roadmap:
  - este cambio cubre el alcance oficial del **Prompt 4** (backoffice mínimo de pedidos demo);
  - sigue pendiente Prompt 5 (frontend de carrito), sin adelantar checkout público, confirmación/email ni pagos reales.

## 21. Checkout público demo conectado a API (Prompt 5 oficial Ciclo 3)
- Capacidad: **Conexión mínima del flujo público `/encargo` con la API de `PedidoDemo` para envío real de pedido demo**.
- Estado: **EN_PROGRESO**.
- Implementación activa:
  - helper de checkout demo para construir payload y validación mínima en `frontend/contenido/catalogo/checkoutDemo.ts`;
  - cliente API desacoplado para creación de pedido demo en `frontend/infraestructura/api/pedidosDemo.ts`;
  - integración UX de envío/resultado en `frontend/componentes/catalogo/encargo/FlujoEncargoConsulta.tsx`, reutilizando preselección desde ficha/cesta.
- Operaciones mínimas cerradas en este incremento:
  1. transformar selección de producto/cesta en `lineas` del contrato `/api/v1/pedidos-demo/`;
  2. enviar pedido demo público con canal invitado o autenticado (demo) y tratar respuesta inmediata;
  3. mostrar estados mínimos de carga, error y éxito inmediato en UI sin invadir confirmación final/recibo.
- Tests añadidos:
  - `frontend/tests/checkout-demo.test.ts` (payload, validación, éxito API y error de API/red).
- Trazabilidad del roadmap:
  - este cambio cubre el alcance funcional solicitado para **checkout público demo mínimo conectado a API**;
  - sigue pendiente la fase de confirmación final/recibo/email demo del siguiente hito del ciclo.

## 22. Confirmación/recibo post-checkout demo (siguiente hito oficial)
- Capacidad: **Salida pública de confirmación/recibo demo recuperable por URL tras crear `PedidoDemo`**.
- Estado: **EN_PROGRESO**.
- Implementación activa:
  - nueva ruta pública de recibo en `frontend/app/pedido-demo/[id_pedido]/page.tsx` y fallback de navegación rota en `frontend/app/pedido-demo/page.tsx`;
  - componente de confirmación con estados de carga/error/vacío/éxito en `frontend/componentes/catalogo/encargo/ReciboPedidoDemo.tsx`;
  - helper de transición post-checkout en `frontend/contenido/catalogo/postCheckoutDemo.ts`;
  - cliente API ampliado con consulta `GET /api/v1/pedidos-demo/{id_pedido}/` en `frontend/infraestructura/api/pedidosDemo.ts`;
  - redirección estable desde `/encargo` al recibo tras `POST` exitoso usando `id_pedido`.
- Operaciones mínimas cerradas en este incremento:
  1. resolver traspaso checkout → confirmación con URL recuperable por `id_pedido`;
  2. consultar pedido demo existente por API y mostrar resumen mínimo con líneas;
  3. cubrir estados UX de carga, error de consulta y navegación sin id válido;
  4. mostrar copy explícito de entorno demo sin cobro real y CTA de continuidad.
- Tests añadidos:
  - `frontend/tests/checkout-demo.test.ts` ampliado con pruebas de helper post-checkout y consulta de detalle de pedido demo.
- Trazabilidad del roadmap:
  - este cambio cubre la fase de **confirmación/recibo post-checkout** del hito oficial siguiente al checkout conectado a API;
  - queda pendiente la **emisión de email/recibo demo** si se exige de forma ejecutable en el siguiente incremento operativo de ciclo.


## 23. Emisión de email demo post-pedido (hito oficial siguiente)
- Capacidad: **Composición y consulta de email demo asociado a `PedidoDemo` sin integración externa de correo**.
- Estado: **EN_PROGRESO**.
- Implementación activa:
  - caso de uso de composición/consulta en `backend/nucleo_herbal/aplicacion/casos_de_uso_email_demo.py`;
  - endpoint público mínimo `GET /api/v1/pedidos-demo/{id_pedido}/email-demo/` en `backend/nucleo_herbal/presentacion/publica/views_pedidos_demo.py` + `urls_pedidos_demo.py`;
  - serialización HTTP específica en `backend/nucleo_herbal/presentacion/publica/email_demo_serializadores.py`;
  - consumo frontend en `frontend/infraestructura/api/pedidosDemo.ts` y render mínimo en `frontend/componentes/catalogo/encargo/ReciboPedidoDemo.tsx`.
- Operaciones mínimas cerradas en este incremento:
  1. componer asunto/cuerpo de email demo desde el `PedidoDemo` persistido (id, estado, email, canal, líneas y subtotal);
  2. recuperar email demo por `id_pedido` con 404 cuando no existe pedido;
  3. mostrar en recibo post-checkout una vista mínima del email demo dejando explícito que es simulación sin envío real.
- Tests añadidos:
  - `tests/nucleo_herbal/test_casos_de_uso_pedidos_demo.py` ampliado para composición de email demo y pedido inexistente;
  - `tests/nucleo_herbal/test_api_pedidos_demo.py` ampliado para endpoint de email demo existente/inexistente;
  - `frontend/tests/checkout-demo.test.ts` ampliado con consumo del endpoint de email demo.
- Trazabilidad del roadmap:
  - este cambio cubre la parte de **emisión de email/recibo demo** pendiente tras confirmación en pantalla;
  - este cierre alimenta Prompt 8 con la base funcional completa, a la espera de consolidación integral de calidad/gate.


## 24. Tests integrales y quality gate de cierre (Prompt 8 oficial Ciclo 3)
- Capacidad: **Cierre técnico de calidad del flujo ecommerce demo (`/encargo` → `PedidoDemo` → `/pedido-demo/[id_pedido]` → email demo)**.
- Estado: **DONE**.
- Implementación activa:
  - prueba integral backend del recorrido completo crear pedido → consultar detalle → consultar email demo en `tests/nucleo_herbal/test_api_pedidos_demo.py`;
  - refuerzo de contrato frontend para secuencia post-checkout de endpoints (`POST pedido`, `GET detalle`, `GET email demo`) en `frontend/tests/checkout-demo.test.ts`;
  - endurecimiento del gate canónico para incluir test contractual de checkout demo en `scripts/check_release_gate.py`;
  - alineación documental del gate en `docs/13_testing_ci_y_quality_gate.md`.
- Evidencia reproducible de cierre:
  1. `python manage.py test tests.nucleo_herbal.test_api_pedidos_demo tests.nucleo_herbal.test_casos_de_uso_pedidos_demo tests.nucleo_herbal.infraestructura.test_admin_django`
  2. `npm --prefix frontend run test:checkout-demo`
  3. `python scripts/check_release_gate.py`
- Trazabilidad del roadmap:
  - este cambio cubre el alcance oficial del **Prompt 8** del roadmap de Ciclo 3 (tests integrales + quality gate).

## 25. Cierre oficial de Ciclo 3 tras Prompt 8
- Estado del ciclo: **DONE (cierre oficial declarado)**.
- Justificación:
  1. Prompts 1–8 están implementados y trazados en este documento (dominio, persistencia, API, backoffice, checkout, confirmación/recibo, email demo y quality gate).
  2. La evidencia reproducible de cierre de Prompt 8 está en verde y valida el circuito crítico e2e del ecommerce demo.
  3. No se introdujeron features comerciales nuevas ni cambios fuera del foco de cierre de calidad.
- Evidencia consolidada:
  - `python manage.py test tests.nucleo_herbal.test_api_pedidos_demo tests.nucleo_herbal.test_casos_de_uso_pedidos_demo tests.nucleo_herbal.infraestructura.test_admin_django`;
  - `npm --prefix frontend run test:checkout-demo`;
  - `python scripts/check_release_gate.py`.
- Nota de trazabilidad histórica:
  - las secciones iniciales de este documento conservan contexto heredado de cierre de Ciclo 2; para gobierno operativo del estado actual prevalece la secuencia consolidada de secciones 17–25 (Ciclo 3 oficial).

## 26. Apertura controlada de Ciclo 4 (gobernanza, histórico)
- Estado del ciclo: **PLANIFICADO**.
- Foco único habilitado: **Cuenta de usuario con valor real**, sin reabrir alcance de ecommerce demo ya cerrado.
- Documentación oficial de apertura:
  - `docs/ciclos/ciclo_04_cuenta_valor.md` (contrato de alcance de ciclo);
  - `docs/ciclos/ciclo_04_roadmap_prompts.md` (secuencia oficial de prompts del ciclo).
- Siguiente paso oficial permitido (histórico en ese momento):
  - ejecutar **Prompt 1 del Ciclo 4** definido en el roadmap, sin implementar todavía prompts siguientes ni abrir frentes paralelos.

## 27. Base dominio/aplicación de cuenta con valor (Prompt 1 oficial Ciclo 4)
- Capacidad: **Núcleo mínimo de cuenta demo útil (autenticación demo, perfil mínimo e historial de `PedidoDemo` asociado)**.
- Estado: **DONE**.
- Implementación activa:
  - agregado y validaciones mínimas de cuenta demo en `backend/nucleo_herbal/dominio/cuentas_demo.py`;
  - casos de uso de cuenta en `backend/nucleo_herbal/aplicacion/casos_de_uso_cuentas_demo.py`;
  - puertos de cuenta e historial en `backend/nucleo_herbal/aplicacion/puertos/repositorios_cuentas_demo.py` y `backend/nucleo_herbal/aplicacion/puertos/proveedores_historial_pedidos_demo.py`;
  - DTOs de cuenta/perfil en `backend/nucleo_herbal/aplicacion/dto.py`.
- Reglas cerradas en este incremento:
  1. cuenta demo válida requiere `id_usuario`, email válido, perfil con nombre visible y credencial demo mínima;
  2. autenticación demo valida credencial contra cuenta existente (sin sesión ni integración auth real);
  3. perfil mínimo recuperable por `id_usuario`;
  4. historial de cuenta se consulta por contrato de aplicación, asociando pedidos por `id_usuario` o por email de contacto de cuenta cuando aplique migración invitado→cuenta.
- Tests añadidos:
  - `tests/nucleo_herbal/test_entidades_cuentas_demo.py`;
  - `tests/nucleo_herbal/test_casos_de_uso_cuentas_demo.py`.
- Trazabilidad del roadmap:
  - este cambio cubre el alcance oficial del **Prompt 1 del Ciclo 4** (`docs/ciclos/ciclo_04_roadmap_prompts.md`);
  - este bloque quedó posteriormente completado por prompts 2–4 dentro del mismo Ciclo 4.

## 28. Persistencia e infraestructura de cuenta demo (Prompt 2 oficial Ciclo 4)
- Capacidad: **Persistencia mínima de cuenta demo y proveedor de historial de `PedidoDemo` asociado por vínculo de cuenta**.
- Estado: **DONE**.
- Implementación activa:
  - modelo ORM `CuentaDemoModelo` y migración en `backend/nucleo_herbal/infraestructura/persistencia_django/models.py` y `backend/nucleo_herbal/infraestructura/persistencia_django/migrations/0004_cuentademomodelo.py`;
  - mapeadores dominio↔persistencia de cuenta demo en `backend/nucleo_herbal/infraestructura/persistencia_django/mapeadores.py`;
  - adaptador de repositorio de cuenta demo en `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios.py`;
  - adaptador proveedor de historial de pedidos demo vinculado por `id_usuario` o `email_contacto` en `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios.py`.
- Reglas cerradas en este incremento:
  1. persistencia de cuenta demo con unicidad por email y claves mínimas de perfil/credencial para autenticación demo de Prompt 1;
  2. reconstrucción de entidad de dominio `CuentaDemo` sin acoplar dominio a Django ORM;
  3. consulta de historial combinada por `id_usuario` o `email_contacto` reutilizando `PedidoDemo` existente de Ciclo 3;
  4. no se abren API, UI, sesión real ni integración total con `auth` de Django.
- Tests añadidos:
  - cobertura de repositorio de cuenta demo y proveedor de historial en `tests/nucleo_herbal/infraestructura/test_repositorios_django.py`.
- Trazabilidad del roadmap:
  - este cambio cubre el alcance oficial del **Prompt 2 del Ciclo 4** (`docs/ciclos/ciclo_04_roadmap_prompts.md`);
  - este bloque habilita Prompt 3 (API/backoffice mínimo de cuenta) como siguiente paso oficial.



## 29. API/backoffice mínimo de cuenta demo (Prompt 3 oficial Ciclo 4)
- Capacidad: **API mínima de cuenta demo con valor (registro/autenticación demo, perfil e historial de `PedidoDemo`) + soporte admin mínimo**.
- Estado: **DONE**.
- Implementación activa:
  - endpoints públicos en `backend/nucleo_herbal/presentacion/publica/urls_cuentas_demo.py` y `backend/nucleo_herbal/presentacion/publica/views_cuentas_demo.py`;
  - serialización de contrato HTTP en `backend/nucleo_herbal/presentacion/publica/cuentas_demo_serializadores.py`;
  - cableado de casos de uso de cuenta en `backend/nucleo_herbal/presentacion/publica/dependencias.py`;
  - publicación de rutas en `backend/configuracion_django/urls.py`;
  - soporte admin de cuentas demo en `backend/nucleo_herbal/infraestructura/persistencia_django/admin.py`.
- Reglas cerradas en este incremento:
  1. autenticación demo mínima sin sesión real, cookies ni tokens productivos;
  2. perfil mínimo consultable por `id_usuario`;
  3. historial de pedidos demo vinculado por `id_usuario` y/o `email_contacto`, reutilizando contratos de `PedidoDemo` de Ciclo 3 sin reabrirlos;
  4. validación de payload en capa API, preservando invariantes de dominio/aplicación en casos de uso existentes.
- Tests añadidos/actualizados:
  - `tests/nucleo_herbal/test_api_cuentas_demo.py`;
  - `tests/nucleo_herbal/infraestructura/test_admin_django.py`.
- Evidencia reproducible:
  1. `python manage.py test tests.nucleo_herbal.test_api_cuentas_demo tests.nucleo_herbal.test_casos_de_uso_cuentas_demo tests.nucleo_herbal.infraestructura.test_admin_django`.
- Trazabilidad del roadmap:
  - este cambio cubre el alcance oficial del **Prompt 3 del Ciclo 4** (`docs/ciclos/ciclo_04_roadmap_prompts.md`);
  - habilita el Prompt 4 (frontend + quality gate final del ciclo) como cierre técnico del ciclo.


## 30. Frontend de cuenta demo + cierre técnico/no-regresión (Prompt 4 oficial Ciclo 4)
- Capacidad: **Área de cuenta demo navegable en frontend consumiendo API de cuenta + refuerzo de gate técnico de ciclo**.
- Estado: **DONE**.
- Implementación activa:
  - nueva ruta `/cuenta-demo` con UI mínima de registro, autenticación, perfil e historial en `frontend/app/cuenta-demo/page.tsx` y `frontend/componentes/cuenta_demo/AreaCuentaDemo.tsx`;
  - cliente API desacoplado para `CuentaDemo` en `frontend/infraestructura/api/cuentasDemo.ts`;
  - persistencia local explícita de sesión demo (sin auth real) y validaciones de formulario en `frontend/contenido/cuenta_demo/estadoCuentaDemo.ts`;
  - enlace de acceso en shell principal para navegabilidad de cuenta demo en `frontend/contenido/shell/navegacionGlobal.ts`;
  - cobertura contractual frontend para cuenta demo en `frontend/tests/cuenta-demo.test.ts`;
  - gate canónico actualizado para ejecutar test de cuenta demo en `scripts/check_release_gate.py`;
  - documentación de gate alineada en `docs/13_testing_ci_y_quality_gate.md`.
- Reglas cerradas en este incremento:
  1. cuenta demo en frontend reutiliza contratos API cerrados en Prompt 3 sin abrir auth real, cookies ni JWT;
  2. continuidad demo resuelta con estado local + `localStorage` mínimo para restaurar `id_usuario`;
  3. UX mínima cubierta para carga, error, éxito de registro/autenticación, perfil e historial vacío/con pedidos;
  4. no-regresión del foco comercial de Ciclo 3 preservada, sin cambios de contrato en `PedidoDemo`.
- Evidencia reproducible:
  1. `npm --prefix frontend run test:cuenta-demo`;
  2. `npm --prefix frontend run test:shell`;
  3. `npm --prefix frontend run build`;
  4. `python scripts/check_release_gate.py`.
- Trazabilidad del roadmap:
  - este cambio cubre el alcance oficial del **Prompt 4 del Ciclo 4** (`docs/ciclos/ciclo_04_roadmap_prompts.md`);
  - con prompts 1–4 trazados y evidencia consolidada, el **Ciclo 4 queda oficialmente cerrado**; la continuidad permitida es apertura controlada de Ciclo 5.


## 31. Cierre oficial de Ciclo 4 y apertura controlada de Ciclo 5 (gobernanza)
- Diagnóstico oficial: **A (Ciclo 4 DONE cerrable sin bloqueos)**.
- Decisión de gobierno:
  1. se declara **Ciclo 4 oficialmente cerrado** con trazabilidad en `docs/ciclos/ciclo_04_cierre_oficial.md`;
  2. se habilita apertura documental de **Ciclo 5** con foco único en calendario ritual + capa editorial diferencial;
  3. no se implementa ningún prompt de Ciclo 5 dentro de esta actualización.
- Prompt 1 oficial permitido para el siguiente incremento:
  - implementar base de dominio/aplicación de `ReglaCalendario` y casos de uso mínimos de calendario ritual conectados a `Ritual`, con tests unitarios y sin tocar checkout/cuenta.


## 32. Ciclo 5 — Prompt 1 oficial (base dominio/aplicación de calendario ritual)
- Capacidad: **Base mínima de `ReglaCalendario` + consulta temporal/editorial conectada a `Ritual`**.
- Estado: **DONE (Prompt 1)**.
- Implementación activa:
  - entidad de dominio `ReglaCalendario` con invariantes y evaluación temporal (`aplica_en`) en `backend/nucleo_herbal/dominio/calendario_ritual.py`;
  - puerto de aplicación para reglas temporales en `backend/nucleo_herbal/aplicacion/puertos/repositorios_calendario_ritual.py`;
  - caso de uso `ConsultarCalendarioRitualPorFecha` y DTOs de respuesta en `backend/nucleo_herbal/aplicacion/casos_de_uso_calendario_ritual.py` y `backend/nucleo_herbal/aplicacion/dto.py`.
- Reglas cerradas en este incremento:
  1. `ReglaCalendario` permanece separada de `Ritual` (frontera de entidades preservada).
  2. Las reglas validan rango temporal, prioridad y datos mínimos obligatorios.
  3. La consulta temporal devuelve rituales aplicables por fecha con prioridad mínima por ritual cuando coinciden múltiples reglas.
  4. Se mantiene alcance de Prompt 1 sin abrir persistencia, API ni frontend de calendario.
- Tests añadidos:
  - `tests/nucleo_herbal/test_entidades_calendario_ritual.py`;
  - `tests/nucleo_herbal/test_casos_de_uso_calendario_ritual.py`.
- Trazabilidad del roadmap:
  - este cambio cubre el alcance oficial del **Prompt 1 del Ciclo 5** (`docs/ciclos/ciclo_05_calendario_editorial.md`);
  - queda pendiente Prompt 2 (persistencia/API mínima) y Prompt 3 (integración frontend + gate de ciclo).


## 33. Ciclo 5 — Prompt 2 oficial (persistencia + API mínima de calendario ritual)
- Capacidad: **Persistencia mínima de `ReglaCalendario` + endpoint público de consulta temporal por fecha**.
- Estado: **DONE (Prompt 2)**.
- Implementación activa:
  - modelo ORM `ReglaCalendarioModelo` con rango temporal, prioridad, activación y vínculo a `RitualModelo` en `backend/nucleo_herbal/infraestructura/persistencia_django/models.py`;
  - migración de infraestructura `0005_reglacalendariomodelo.py` con `CheckConstraint` de rango e índices de consulta temporal;
  - mapeadores dominio ↔ ORM de regla en `backend/nucleo_herbal/infraestructura/persistencia_django/mapeadores.py`;
  - repositorio concreto `RepositorioReglasCalendarioORM` para `listar_vigentes_en` (filtrando activas/publicadas por fecha) en `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios.py`;
  - endpoint público mínimo `GET /api/v1/calendario-ritual/?fecha=YYYY-MM-DD` en `backend/nucleo_herbal/presentacion/publica/views.py`, `backend/nucleo_herbal/presentacion/publica/urls_calendario_ritual.py` y `backend/configuracion_django/urls.py`.
- Reglas cerradas en este incremento:
  1. Se preserva frontera `ReglaCalendario` separada de `Ritual` en dominio e infraestructura.
  2. La API valida presencia/formato de fecha y delega reglas temporales/invariantes al núcleo de aplicación.
  3. La consulta responde lista vacía cuando no hay coincidencias y prioriza la regla de menor prioridad por ritual según Prompt 1.
  4. No se implementa frontend ni backoffice editorial del calendario (reservado para Prompt 3).
- Tests añadidos/extendidos:
  - `tests/nucleo_herbal/infraestructura/test_repositorios_django.py` (persistencia + reconstrucción + filtrado);
  - `tests/nucleo_herbal/test_exposicion_publica.py` (API calendario: con resultado, sin resultado y fecha inválida).
- Trazabilidad del roadmap:
  - este cambio cubre el alcance oficial del **Prompt 2 del Ciclo 5** (`docs/ciclos/ciclo_05_calendario_editorial.md`);
  - queda pendiente Prompt 3 (integración frontend editorial mínima + gate de ciclo).

## 34. Ciclo 5 — Prompt 3 oficial (frontend editorial mínimo + gate de ciclo)
- Capacidad: **Superficie frontend mínima de calendario ritual por fecha + no-regresión técnica del ciclo**.
- Estado: **DONE (Prompt 3)**.
- Implementación activa:
  - ruta pública `frontend/app/calendario-ritual/page.tsx` con entrada editorial mínima y navegación coherente con shell existente;
  - cliente API desacoplado `frontend/infraestructura/api/calendarioRitual.ts` para consulta `GET /api/v1/calendario-ritual/?fecha=YYYY-MM-DD`, validación básica de fecha y mapeo hacia `Ritual`;
  - componente de consulta temporal `frontend/componentes/calendario_ritual/CalendarioRitualEditorial.tsx` cubriendo carga, error, estado vacío y listado con enlace a ficha ritual;
  - shell global actualizada con acceso navegable a calendario ritual en `frontend/contenido/shell/navegacionGlobal.ts`.
- No-regresión y gate:
  - tests frontend de contrato calendario en `frontend/tests/calendario-ritual.test.ts`;
  - ajuste de regresión shell por nueva ruta en `frontend/tests/shell-global.test.ts`;
  - gate canónico reforzado con `npm run test:calendario-ritual` en `scripts/check_release_gate.py`;
  - documentación de gate alineada en `docs/13_testing_ci_y_quality_gate.md`.
- Evidencia reproducible:
  1. `npm --prefix frontend run test:calendario-ritual`;
  2. `npm --prefix frontend run test:shell`;
  3. `npm --prefix frontend run build`;
  4. `python scripts/check_release_gate.py`.
- Trazabilidad del roadmap:
  - este cambio cubre el alcance oficial del **Prompt 3 del Ciclo 5** (`docs/ciclos/ciclo_05_calendario_editorial.md`);
  - con Prompts 1–3 trazados y evidencia de no-regresión, el **Ciclo 5 queda técnicamente cerrable** (sin abrir capacidades de ciclo siguiente).


## 35. Cierre oficial de Ciclo 5 y apertura controlada de Ciclo 6 (gobernanza)
- Diagnóstico oficial: **A (Ciclo 5 DONE cerrable sin bloqueos)**.
- Decisión de gobierno:
  1. se declara **Ciclo 5 oficialmente cerrado** con trazabilidad en `docs/ciclos/ciclo_05_cierre_oficial.md`;
  2. se habilita apertura documental de **Ciclo 6** con foco único en refinamiento portfolio/business-ready sin nuevas features de negocio;
  3. no se implementa ningún prompt de Ciclo 6 dentro de esta actualización.
- Prompt 1 oficial permitido para el siguiente incremento:
  - ejecutar una auditoría integral de consistencia funcional/documental y registrar backlog priorizado de brechas críticas (arquitectura, UX de confianza y trazabilidad) sin abrir nuevos flujos funcionales.

## 36. Ciclo 6 — Prompt 1 oficial (auditoría trazable + backlog priorizado)
- Capacidad: **Auditoría integral de consistencia entre documentación, estado real y recorridos críticos con backlog priorizado de brechas**.
- Estado: **DONE (Prompt 1)**.
- Evidencia de ejecución:
  - informe de auditoría y backlog en `docs/ciclos/ciclo_06_prompt_01_auditoria_backlog.md`;
  - contraste explícito de recorridos críticos (home, catálogo, ficha, cesta/checkout demo, recibo/email demo, cuenta demo, calendario ritual y admin mínimo);
  - identificación y priorización de brechas por criticidad/tipo sin implementar nuevas features.
- Decisión de gobierno:
  1. se mantiene foco exclusivo de auditoría para Prompt 1;
  2. las correcciones quedan diferidas al Prompt 2 oficial de Ciclo 6;
  3. no se reabren ciclos cerrados (3, 4, 5) fuera de inconsistencias objetivas documentadas.
- Siguiente paso permitido:
  - ejecutar Prompt 2 de Ciclo 6 con foco único en resolver brechas críticas documentadas (consistencia contractual/naming) y su evidencia de no-regresión.

## 37. Índice editorial navegable de `/guias` con segmentación mínima (Feature 31)
- Capacidad: **Evolución del hub `/guias` hacia índice editorial filtrable y escalable sin CMS**.
- Estado: **DONE (Feature 31)**.
- Implementación activa:
  - helpers dedicados de índice y filtros en `frontend/contenido/editorial/indiceGuias.ts`;
  - `frontend/app/guias/page.tsx` ahora resuelve filtros por query (`tema`, `hub`), resume resultados y maneja estado vacío limpio;
  - reutilización de la fuente editorial existente (`guiasEditoriales`) manteniendo exclusión de borradores/no indexables.
- Segmentación aplicada:
  1. por tema editorial (`hierbas`, `rituales`, `colecciones`);
  2. por hub relacionado (`hierbas`, `rituales`, `colecciones`, `la-botica`).
- Reglas preservadas:
  1. canonical y metadata SEO del hub sin ruptura (`/guias`);
  2. continuidad de subhubs (`/guias/temas/[slug]`) y detalle (`/guias/[slug]`);
  3. separación editorial/comercial sin abrir CMS/backoffice.
- Tests añadidos/extendidos:
  - `frontend/tests/editorial-seo.test.ts` cubre filtros por tema/hub, exclusión de no indexables, combinación vacía y conteos de opciones;
  - actualización de script `frontend/package.json` (`test:editorial-seo`) para compilar el nuevo helper `contenido/editorial/indiceGuias.ts`.

## 19. Página pública Tarot editorial (Feature 33)
- Capacidad: **Sección pública `/tarot` con exploración visual de arcanos mayores**.
- Estado: **EN_PROGRESO**.
- Implementación activa:
  - nueva ruta `frontend/app/tarot/page.tsx` con metadata SEO mínima;
  - contenido reusable tipado en `frontend/contenido/tarot/arcanosTarot.ts`;
  - componentes desacoplados para listado y detalle en `frontend/componentes/tarot/`;
  - integración de assets existentes (`/fondos/fondo_pergamino.webp` + dibujos de arcanos en `/fondos/*.webp`).
- Interacción cerrada en este incremento:
  1. listado de arcanos mayores en grid responsive;
  2. selección por tarjeta (botón) con panel de detalle inline;
  3. fallback explícito cuando un `slug` no existe.
- Integración con shell global:
  - nuevo enlace "Tarot" en navegación principal y footer desde `frontend/contenido/shell/navegacionGlobal.ts`.
- Tests añadidos/ajustados:
  - `frontend/tests/tarot-contenido.test.ts` (estructura + helpers + metadata);
  - `frontend/tests/shell-global.test.ts` (enlace global a `/tarot`).


## 19. Checkout real v1 en coexistencia
- Capacidad: **Checkout real v1 en coexistencia controlada con legado demo**.
- Estado: **DONE**.
- Implementación activa:
  - contrato canónico + validación en `backend/nucleo_herbal/dominio/pedidos.py` y `backend/nucleo_herbal/presentacion/publica/payload_pedidos.py`;
  - API real en `backend/nucleo_herbal/presentacion/publica/urls_pedidos.py` y `views_pedidos.py`;
  - persistencia real en `backend/nucleo_herbal/infraestructura/persistencia_django/models_pedidos.py` y `repositorios_pedidos.py`;
  - frontend real desacoplado del demo en `frontend/app/checkout/page.tsx`, `frontend/componentes/catalogo/checkout-real/` e `frontend/infraestructura/api/pedidos.ts`.
- Regla de convivencia activa:
  1. `/api/v1/pedidos-demo/` y `/encargo` siguen como legado controlado.
  2. `/api/v1/pedidos/` y `/checkout` son el camino canónico nuevo.
  3. No se introduce PSP todavía; el estado inicial sigue siendo `pendiente_pago`.
- Siguiente bloque recomendado: **intención de pago real + transición de estados de pago** sobre el agregado `Pedido`, manteniendo la coexistencia con el legado demo hasta cerrar migración comercial completa.


## Actualización post-pago operativo v1.1
- El checkout real ya expone retornos `success` y `cancel` hacia `/pedido/[id_pedido]` con estado visible y siguiente acción recomendada.
- Historico de proveedor real preparado: cuando Stripe confirma `pagado`, el backend ejecuta un caso de uso post-pago desacoplado del webhook. En la fase local vigente, la confirmacion activa entra por `simulado_local`.
- El pedido real añade `requiere_revision_manual` y `email_post_pago_enviado` para conciliación mínima y seguimiento administrativo.
- El backoffice Next/Django ya puede listar pedidos reales y marcar el primer avance operativo `preparando` sin abrir todavía logística avanzada, fraude o devoluciones.
- Pendiente para el siguiente bloque: expedición real, tracking, incidencias, SLA operativos y automatización de estados posteriores.

## Actualización operación física y expedición v1.2
- Capacidad: **Operación física mínima post-pago con expedición y entrega**.
- Estado: **DONE**.
- Implementación activa:
  - backend real con transición `pagado -> preparando -> enviado -> entregado` y persistencia de expedición/tracking;
  - backoffice Next/Django con filtros por estado y acciones operativas para preparar, enviar y entregar;
  - email transaccional mínimo de envío y logging estructurado para hitos operativos;
  - visibilidad pública en `/pedido/[id_pedido]` del estado, tracking y mensaje de seguimiento.
- Decisión operativa explícita:
  1. `transportista` es obligatorio al marcar `enviado`;
  2. `codigo_seguimiento` también lo es salvo `envio_sin_seguimiento=True`;
  3. no se permiten saltos directos a `enviado` o `entregado` fuera de la secuencia controlada.
- Actualización R13 (tracking visible endurecido):
  - detalle de pedido y "Mi cuenta" ya renderizan estado de tracking coherente (tracking disponible, envío sin tracking público o pendiente/no informado);
  - el documento descargable incorpora resumen explícito de expedición para evitar contradicción entre superficie cliente y operación.
- Pendiente para el siguiente bloque: incidencias operativas y postventa básica (cancelación operativa acotada, reintentos logísticos y trazabilidad de incidencias) sin abrir todavía devoluciones complejas ni logística enterprise.


## 8.3 Cuenta real v1 y legado demo controlado
- Capacidad: **Cuenta real v1 usable para cliente final**.
- Estado: **DONE**.
- Evidencia implementada:
  - dominio y puertos: `backend/nucleo_herbal/dominio/cuentas_cliente.py`, `backend/nucleo_herbal/aplicacion/casos_de_uso_cuentas_cliente.py`;
  - persistencia y auth segura: `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios_cuentas_cliente.py`, migración `0018_cuenta_cliente_real_v1.py`;
  - API pública real: `backend/nucleo_herbal/presentacion/publica/views_cuentas_cliente.py`;
  - frontend canónico: `/registro`, `/acceso`, `/mi-cuenta`, `/mi-cuenta/pedidos`;
  - tests: `tests/nucleo_herbal/test_api_cuentas_cliente.py`, `tests/nucleo_herbal/test_entidades_cuentas_cliente.py`, `tests/nucleo_herbal/test_documentacion_cuenta_real_v1.py`.
- Regla activa:
  1. `CuentaDemo` queda congelada como compatibilidad demo, no como base del producto final.
  2. Todo pedido real autenticado se vincula automáticamente al usuario real.
  3. El siguiente incremento debe cerrar identidad/cliente v1.1: verificación email, recuperación de contraseña y direcciones.


## 8.4 Cuenta real v1.1 — libreta de direcciones
- Capacidad: **DONE** para libreta de direcciones autenticada de `CuentaCliente`.
- Evidencia implementada:
  - dominio/aplicación: `backend/nucleo_herbal/dominio/cuentas_cliente.py`, `backend/nucleo_herbal/aplicacion/casos_de_uso_direcciones_cuenta_cliente.py`;
  - persistencia dedicada: `DireccionCuentaClienteModelo` + migración `0021_direcciones_cuenta_cliente.py`;
  - API pública real: `GET|POST /api/v1/cuenta/direcciones/`, `PUT|DELETE /api/v1/cuenta/direcciones/{id}/`, `POST /api/v1/cuenta/direcciones/{id}/predeterminada/`;
  - frontend canónico: `/mi-cuenta/direcciones`;
  - tests: `backend/nucleo_herbal/presentacion/tests/test_cuenta_cliente_direcciones.py` + `frontend/tests/cuenta-cliente-direcciones.test.ts`.
- Regla activa:
  1. una cuenta mantiene como máximo una dirección predeterminada activa;
  2. la primera dirección creada queda predeterminada automáticamente;
  3. si se elimina la predeterminada y quedan alternativas, se reasigna de forma determinista;
  4. la libreta queda alineada con el contrato futuro de `DireccionEntrega` y ya se integra en checkout real mediante snapshot histórico, sin referencia viva al pedido.

## 38. Inventario real v1 para productos vendibles
- Capacidad: **Base mínima de inventario real operable y persistida**.
- Estado: **DONE**.
- Evidencia implementada:
  - dominio/aplicación: `backend/nucleo_herbal/dominio/inventario.py`, `backend/nucleo_herbal/aplicacion/casos_de_uso_inventario.py`, `backend/nucleo_herbal/aplicacion/dto_inventario.py`;
  - persistencia dedicada: `backend/nucleo_herbal/infraestructura/persistencia_django/models_inventario.py`, `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios_inventario.py`, migraciones `0022_inventarioproductomodelo.py` y `0028_inventarioproductomodelo_unidad_base_and_more.py`;
  - backoffice/admin mínimo: `backend/nucleo_herbal/infraestructura/persistencia_django/admin_inventario.py`;
  - tests: `tests/nucleo_herbal/test_entidades_inventario.py`, `tests/nucleo_herbal/test_casos_de_uso_inventario.py`, `tests/nucleo_herbal/infraestructura/test_repositorios_django.py`, `tests/nucleo_herbal/infraestructura/test_admin_django.py`.
- Contrato operativo activo:
  1. un producto vendible puede tener como máximo un inventario asociado;
  2. la cantidad disponible y ajustes se expresan en enteros de `unidad_base` (`ud`, `g`, `ml`) sin floats;
  3. el ajuste manual de stock ya es operable en backend/admin;
  4. `bajo_stock` queda disponible como señal operativa mínima por umbral opcional y misma unidad base;
  5. el checkout real valida stock antes de persistir `Pedido` y rechaza completo cualquier línea sin inventario o con cantidad insuficiente;
  6. el rechazo de stock sale con contrato JSON estable (`codigo=stock_no_disponible` + detalle por línea) y ya se refleja en el frontend de checkout real.
- Fuera de alcance preservado:
  - el catálogo público sigue sin exponer badges de stock;
  - no existe reserva, decremento automático, multi-almacén ni movimientos complejos.
- Quality gate ejecutado para este incremento:
  1. `pytest -q tests/nucleo_herbal/test_entidades_inventario.py tests/nucleo_herbal/test_casos_de_uso_inventario.py`;
  2. `python -m unittest tests.nucleo_herbal.infraestructura.test_repositorios_django tests.nucleo_herbal.infraestructura.test_admin_django`;
  3. `python manage.py check`;
  4. `python scripts/check_release_gate.py` **falló** por deuda preexistente de frontend en páginas con `useSearchParams()` sin `Suspense` (`/mi-cuenta`, `/mi-cuenta/pedidos`, `/recuperar-password`, `/verificar-email`).

- Prompt 08: **DONE** para exposición pública mínima de disponibilidad de stock conectada al inventario real en APIs públicas de producto, ficha Botica Natural, productos relacionados de ritual y aviso informativo en checkout real; sin reservas, decremento automático ni promesa de stock duro.

- Prompt 09: **DONE** para decremento efectivo de inventario al confirmar pago real con transacción atómica, protección idempotente ante reintentos/webhooks duplicados, incidencia operativa explícita si ya no hay stock suficiente y sin introducir reservas ni compensaciones automáticas.

- Prompt 10: **DONE** para soporte mínimo de backoffice en Django Admin sobre pedidos pagados con incidencia de stock post-pago: listado filtrable por incidencia, detalle operativo del pedido, marca explícita `incidencia_stock_revisada` con `fecha_revision_incidencia_stock` y acción manual honesta de revisión sin borrar la incidencia histórica ni automatizar reembolsos, cancelaciones o compensaciones.

- Prompt 12: **DONE** para cancelación operativa manual explícita de pedidos pagados con incidencia de stock, con acción de Django Admin restringida a estados coherentes y trazabilidad auditada (`cancelado_operativa_incidencia_stock`, `fecha_cancelacion_operativa`, `motivo_cancelacion_operativa`) sin automatizar reembolsos ni devolución de inventario.

- Prompt 13: **DONE** para reembolso manual explícito de pedidos cancelados por incidencia de stock, con acción de Django Admin, trazabilidad auditable (`estado_reembolso`, `fecha_reembolso`, `id_externo_reembolso`, `motivo_fallo_reembolso`), idempotencia para evitar dobles ejecuciones y registro de fallo PSP sin corromper el estado del pedido ni activar devoluciones de inventario o emails automáticos.

- V2-R03: **DONE** para marco mínimo de devoluciones manuales/postventa con entidad dedicada (`DevolucionPedidoModelo`) vinculada a pedido real, elegibilidad mínima (`enviado|entregado` + `pagado`), estados operativos (`abierta`, `recibida`, `aceptada`, `rechazada`, `cerrada`), transiciones controladas y operación real desde Django Admin; sin automatizar reembolso, restitución de inventario ni email de devolución.

## 39. Visibilidad cliente de cancelación y reembolso (Prompt 14)
- Capacidad: **Estado visible de cancelación operativa y reembolso en pedido y mi cuenta**.
- Estado: **DONE**.
- Evidencia implementada:
  - backend expone `estado_cliente` en serialización de pedido real con `cancelado_operativamente`, `estado_reembolso` y `fecha_reembolso`;
  - frontend usa mapper único `resolverEstadoVisiblePedidoCliente` para evitar condicionales duplicados;
  - `/pedido/[id_pedido]` muestra copy sobrio de cancelación y reembolso (incluido fallback de revisión manual cuando el reembolso falla);
  - `/mi-cuenta/pedidos` refleja el resumen visible del estado de cancelación/reembolso sin abrir workflows nuevos.
- Fuera de alcance preservado:
  1. sin emails automáticos nuevos;
  2. sin formularios de soporte;
  3. sin cambios de inventario ni nuevos flujos financieros.

## 40. Ledger mínimo de movimientos de inventario (R06)
- Capacidad: **Ledger auditable mínimo que acompaña la fuente actual de stock**.
- Estado: **DONE**.
- Evidencia implementada:
  - dominio/puertos nuevos: `backend/nucleo_herbal/dominio/inventario_movimientos.py`, `backend/nucleo_herbal/aplicacion/puertos/repositorios_movimientos_inventario.py`;
  - persistencia dedicada: `MovimientoInventarioModelo` + migración `0031_movimientoinventariomodelo.py`;
  - repositorio/mapeadores desacoplados: `repositorios_inventario.py`, `mapeadores_inventario.py`;
  - integración operativa: alta inicial y ajuste manual en `casos_de_uso_inventario.py`, descuento post-pago en `casos_de_uso_post_pago_pedidos.py`;
  - visibilidad mínima backoffice: inline de movimientos en `admin_inventario.py`.
- Regla activa:
  1. `InventarioProducto` sigue siendo fuente de verdad operativa de stock;
  2. el ledger no recalcula stock histórico ni sustituye lectura operativa;
  3. `descuento_pago` se registra sin duplicados en reintentos idempotentes y no se genera si el post-pago falla con incidencia de stock/unidad.

## 41. Backoffice Next con page propia de inventario (R07)
- Capacidad: **Operativa de inventario real en Next como superficie principal**.
- Estado: **DONE**.
- Evidencia implementada:
  - página dedicada `frontend/app/admin/(panel)/inventario/page.tsx` integrada al layout y navegación real del backoffice;
  - módulo `frontend/componentes/admin/ModuloInventarioAdmin.tsx` con listado operativo (producto, unidad base, stock actual, umbral, estado bajo stock, timestamp);
  - API privada staff en backend para inventario (`listado`, `detalle`, `ajuste_manual`, `ledger`): `backend/nucleo_herbal/presentacion/backoffice_views/inventario.py` + `backoffice_urls.py`;
  - ajuste manual desde Next consume backend real y mantiene trazabilidad en ledger vía `AjustarInventarioProducto` + `RepositorioMovimientosInventarioORM`.
- Límites preservados:
  1. Django Admin no se elimina y permanece como soporte/fallback;
  2. no se recalcula stock desde ledger;
  3. no se introduce multi-almacén, lotes/caducidad, reporting avanzado ni bulk actions complejas.

## 42. Disponibilidad pública real para producto a granel (R09)
- Capacidad: **Contrato público coherente de disponibilidad + semántica comercial (unitario/granel)**.
- Estado: **DONE**.
- Evidencia implementada:
  - backend mantiene una única fuente de disponibilidad pública desde inventario real (`resolver_disponibilidad_publica`) y refuerza cobertura en `test_publico_producto_detalle.py` y `test_exposicion_publica.py` para inventario ausente/stock cero y serialización de unidad+incremento;
  - frontend ritual preserva contrato comercial al mapear productos relacionados (`frontend/infraestructura/api/rituales.ts`);
  - UI pública reutiliza `EstadoDisponibilidadProducto` para mostrar estado, unidad comercial (cuando aplica), incremento mínimo y mínimo de compra sin sobreprometer reserva;
  - bloque comercial de ritual incorpora disponibilidad real de cada producto relacionado (`BloqueResolucionComercialRitual.tsx`).
- Regla activa:
  1. frontend informa disponibilidad y semántica comercial;
  2. backend sigue siendo última línea de defensa en checkout/pedido;
  3. no se expone stock duro exacto ni reserva temporal desde ficha pública.

## 43. Emails transaccionales reales mínimos (R10)
- Capacidad: **Emails transaccionales mínimos para eventos operativos reales estabilizados**.
- Estado: **DONE**.
- Evidencia implementada:
  - adaptador real único `NotificadorEmailPostPago` ampliado para: pedido pagado, pedido enviado, cancelación operativa por incidencia de stock y reembolso manual ejecutado;
  - casos de uso operativos (`ProcesarPostPagoPedido`, `MarcarPedidoEnviado`, `CancelarPedidoOperativoPorIncidenciaStock`, `ReembolsarPedidoCanceladoPorIncidenciaStock`) desacoplados por puerto de notificación y con manejo explícito de error de envío sin corromper estado de pedido;
  - trazabilidad mínima anti-duplicado para eventos reintentables con flags persistentes: `email_cancelacion_enviado`, `fecha_email_cancelacion`, `email_reembolso_enviado`, `fecha_email_reembolso`;
  - pruebas backend relevantes en verde para composición/copy sobrio, idempotencia y coherencia de estado.
- Regla activa:
  1. no se mezcla el sistema demo legacy (`email-demo`) con los correos reales de operación;
  2. un fallo de envío no revierte la transición operativa ya persistida;
  3. la idempotencia de correo clave se resuelve con flags mínimos, sin abrir CRM/newsletter ni un mail-log enterprise.

## 44. Fiscalidad base e importe legalmente coherente (R11)
- Capacidad: **Base fiscal mínima explícita y coherente extremo a extremo en pedido real**.
- Estado: **DONE**.
- Evidencia implementada:
  - dominio de pedido real centraliza aritmética fiscal con `Decimal`: `base_imponible`, `tipo_impositivo` (21% por defecto), `importe_impuestos` y `total` con redondeo monetario único (`ROUND_HALF_UP`);
  - persistencia de pedido real incorpora `tipo_impositivo` en ORM + migración (`0034`) para trazabilidad histórica del tipo aplicado;
  - serialización pública del pedido (`pedido` y `resumen`) ahora expone desglose fiscal completo (`subtotal`, `importe_envio`, `base_imponible`, `tipo_impositivo`, `importe_impuestos`, `total`);
  - pago real mantiene coherencia de cobro: `importe` de iniciar pago usa total fiscal y la sesión Stripe incorpora línea explícita de impuestos;
  - superficies frontend de checkout y detalle de pedido muestran subtotal, envío, impuestos y total sin contradicción con backend.
- Regla activa:
  1. política fiscal mínima de fase: IVA general único del 21% para pedido real;
  2. sin motor tributario avanzado en esta entrega (sin multi-país, OSS/IOSS, exenciones raras ni promociones fiscales);
  3. no se abre aún factura/recibo descargable formal (siguiente incremento R12).

## 45. Observabilidad y conciliación operativa mínima (R14)
- Capacidad: **Conciliación operativa auditable de pedido↔inventario↔reembolso↔expedición↔emails**.
- Estado: **DONE**.
- Evidencia implementada:
  - script operativo de solo lectura `scripts/check_operational_reconciliation.py` con salida textual/JSON, matriz de severidad (`BLOCKER`, `WARNING`, `INFO`, `SKIP`) y política configurable de exit code (`--fail-on blocker|warning|none`, manteniendo alias legacy `error`);
  - reglas mínimas accionables para detectar desalineaciones reales: pago sin descuento ni incidencia, reembolso sin cancelación operativa, cancelación operativa sin reembolso iniciado, restitución de inventario sin ledger `restitucion_manual`, incoherencias logísticas y banderas de email contradictorias;
  - integración endurecida en gate canónico mediante bloque bloqueante por severidad crítica (`check_release_gate.py` ejecuta `--fail-on blocker`) para detener release solo ante incoherencias de bajo falso positivo.
- Regla activa:
  1. la conciliación no modifica datos ni sustituye workflows de backoffice;
  2. la detección se centra en discrepancias operativas de alto valor (no reporting cosmético);
  3. el gate conserva carácter no mutante y reporta conciliación como señal operativa reutilizable.

## 46. Seguridad, privacidad operativa y release readiness mínimo (R15)
- Capacidad: **Hardening mínimo de configuración sensible + privacidad de logs + base de backup/restore y checklist de salida**.
- Estado: **DONE**.
- Evidencia implementada:
  - validación de settings críticos en producción (`DEBUG=false`) con guardrails explícitos para `PUBLIC_SITE_URL`, URLs de pago HTTPS, `DEFAULT_FROM_EMAIL` y `EMAIL_BACKEND` real en `backend/configuracion_django/validaciones_entorno.py` integrado desde `settings.py`;
  - visor técnico de logs endurecido para no exponer línea cruda, devolviendo únicamente contenido sanitizado (`backend/nucleo_herbal/presentacion/debug_logs/servicio_logs.py`);
  - check operativo mínimo de release readiness (`scripts/check_release_readiness.py`) con cobertura en `tests/scripts/test_check_release_readiness.py`;
  - documentación operativa mínima de salida y backup/restore PostgreSQL en `docs/release_readiness_minima.md`, alineada con `docs/deploy_railway.md` y `docs/13_testing_ci_y_quality_gate.md`.
- Regla activa:
  1. producción falla rápido ante configuración sensible incompleta o insegura;
  2. debug logs internos no devuelven datos crudos potencialmente sensibles;
  3. pre-release requiere checklist explícito y backup lógico verificable antes de desplegar.

## 47. Operación V2-R01: backups automatizables y restore drill mínimo
- Capacidad: **base operativa reutilizable de backup/restore lógico PostgreSQL, con modo verificable seguro**.
- Estado: **DONE**.
- Evidencia implementada:
  - nuevo script `scripts/backup_restore_postgres.py` con modos `backup` y `restore-drill`, lectura de entorno (`DATABASE_URL`, `BOTICA_BACKUP_DIR`, `BOTICA_RESTORE_DATABASE_URL`) y salida operacional explícita sin exponer secretos;
  - protección para evitar dumps dentro del repositorio (ruta de backup obligatoriamente fuera de árbol versionado);
  - estrategia honesta de restore drill: `--dry-run` verificable para runners sin DB temporal y ejecución real opcional cuando exista entorno seguro;
  - cobertura dedicada en `tests/scripts/test_backup_restore_postgres.py`;
  - endurecimiento del check de readiness (`scripts/check_release_readiness.py`) para exigir marcadores de script/variables de backup en documentación.
- Regla activa:
  1. no se admite hardcodear credenciales en scripts de operación;
  2. dump lógico no se genera en rutas versionables del repo;
  3. `dry-run` no sustituye drill real, pero deja base repetible y auditable en entornos limitados.

## 48. Operación V2-R04: coordinación devolución aceptada con reembolso y restitución manual
- Capacidad: **Coordinación operativa mínima postventa para devolución aceptada**.
- Estado: **DONE**.
- Evidencia implementada:
  - `DevolucionPedidoModelo` expone estado operativo derivado (`reembolso_operativo`, `restitucion_operativa`, `esta_resuelta_operativamente`) sin introducir duplicación de flags persistidos;
  - Django Admin de devoluciones muestra resumen operativo y estados de reembolso/restitución para evitar ambigüedad operativa;
  - acciones admin desde devolución para ejecutar reembolso manual o restitución manual sobre pedido asociado, con elegibilidad explícita y logging de ejecución/rechazo;
  - pruebas de postventa cubren devolución aceptada pendiente/parcial/resuelta y rechazo de acción coordinada en devoluciones no elegibles.
- Regla activa:
  1. no hay automatización de reembolso al aceptar devolución;
  2. no hay automatización de restitución al aceptar devolución;
  3. la resolución operativa de devolución es explícita y auditable, pero su cierre administrativo sigue siendo manual.

## 49. Operación V2-R07: observabilidad y alertas operativas v2
- Capacidad: **Capa mínima de alertas operativas agregadas y accionables para ecommerce real**.
- Estado: **DONE**.
- Evidencia implementada:
  - script agregador `scripts/check_operational_alerts_v2.py` con salida textual y JSON (`--json`) + política de salida (`--fail-on blocker|warning|none`);
  - reutilización explícita de señales existentes: estados/flags de `PedidoRealModelo`, `DevolucionPedidoModelo`, `check_operational_reconciliation.py` (solo BLOCKER) y `check_release_readiness.py`;
  - tipificación mínima por alerta: severidad, código, entidad, mensaje, acción sugerida y fuente;
  - cobertura dedicada en `tests/scripts/test_check_operational_alerts_v2.py` (clasificación, no falsos positivos sintéticos, salida JSON y exit codes);
  - documentación operativa actualizada en `docs/13_testing_ci_y_quality_gate.md`, `docs/release_readiness_minima.md` y roadmap V2.
- Regla activa:
  1. no se introducen dashboards/servicios externos enterprise en este incremento;
  2. la capa agrega señales existentes, no duplica reglas de negocio transaccional;
  3. puede ejecutarse manualmente o programarse por scheduler externo sin acoplamiento adicional.

## 50. Operación V2-R08: automatización mínima de reintentos operativos seguros
- Capacidad: **Reintento automatizable (dry-run + ejecución real) de tareas operativas idempotentes sobre flags existentes**.
- Estado: **DONE**.
- Evidencia implementada:
  - nuevo script `scripts/retry_operational_tasks_v2.py` con modo `--dry-run`, selección por `--task` y salida texto/JSON;
  - cobertura de tareas reintentables de bajo riesgo en pedido real: `email_post_pago`, `email_envio`, `email_cancelacion`, `email_reembolso`;
  - elegibilidad explícita por estado+flag y segunda validación en ejecución para evitar duplicados en reintentos concurrentes;
  - marcado persistente por bandera de email tras envío exitoso (`RepositorioPedidosORM`) y omisión segura cuando la tarea ya no es elegible;
  - pruebas dedicadas en `tests/scripts/test_retry_operational_tasks_v2.py` para dry-run sin mutación, ejecución solo elegibles, idempotencia de reejecución, omisión de no elegibles y salida verificable.
- Regla activa:
  1. no se automatiza reembolso, restitución de inventario, cancelación ni decisiones sensibles de negocio;
  2. se automatiza solo superficie ya cerrada semánticamente con flags anti-duplicado existentes;
  3. el script queda listo para scheduler externo, sin introducir plataforma de colas enterprise en este incremento.

## 48. Fiscalidad avanzada v2 por producto y cálculo por línea (V2-R05)
- Capacidad: **fiscalidad explícita por producto con cálculo y trazabilidad por línea en pedido real**.
- Estado: **DONE**.
- Evidencia implementada:
  - `Producto` incorpora `tipo_fiscal` controlado (`iva_general`, `iva_reducido`) en dominio, persistencia, contrato público y operación backoffice;
  - checkout real en backend enriquece cada línea con `tipo_impositivo` derivado de producto y calcula impuestos por línea (sin floats, con `Decimal` + `ROUND_HALF_UP`);
  - pedido real persiste snapshot fiscal de línea (`tipo_impositivo`, `importe_impuestos`) y serializa esos campos en API/documento;
  - Stripe alinea el cobro con la aritmética persistida (impuestos por línea + envío), evitando desajustes pedido↔PSP;
  - frontend de checkout y recibo real mantiene desglose comprensible y coherente con la aritmética de backend.
- Regla activa:
  1. sin casuística multi-país/OSS/IOSS en este bloque;
  2. sin motor fiscal enterprise, solo catálogo fiscal acotado y mantenible;
  3. se mantiene compatibilidad de contratos existentes mientras se expone la nueva trazabilidad por línea.

## 26. Actualización V2-R06 — documento fiscal v2 más formal
- Capacidad: **Documento fiscal HTML v2 trazable y más formal sobre pedido real**.
- Estado: **DONE**.
- Evidencia implementada:
  - render HTML de documento evoluciona de recibo mínimo a estructura fiscal formal con identificador documental derivado del pedido (`DOC-{id_pedido}-{fecha}`), bloques de emisor/cliente/estado y tabla de detalle por línea (base, tipo impositivo, cuota y total línea);
  - se mantienen totales canónicos de pedido (`subtotal`, `base imponible`, `envío`, `impuestos`, `total`) sin recalcular en frontend ni introducir motor paralelo;
  - cancelación/reembolso se muestra de forma explícita y sobria cuando aplica;
  - acceso cliente se conserva en detalle de pedido y listado de pedidos en mi cuenta, actualizando copy a “documento fiscal”.
- Decisiones:
  1. Se mantiene generación runtime en HTML descargable/imprimible y no se versionan binarios.
  2. No se abre serie fiscal enterprise, multi-país, firma ni automatización de envío por email.
- Validación ejecutada en este bloque:
  - tests backend de API/documento de pedido real;
  - tests frontend de visibilidad de enlace;
  - `python manage.py check`, `python manage.py makemigrations --check --dry-run`, lint/build frontend y gate.

## 51. Auditoria V2-R10: go-live checklist v2
- Capacidad: **cierre operativo de go-live real v2**.
- Estado: **BLOCKED externo**.
- Evidencia verificada en V2G-001:
  - `scripts/check_release_readiness.py` pasa en local;
  - `scripts/check_release_gate.py` pasa y cubre readiness backend, Django check, tests criticos, `tests.scripts`, contratos API/frontend-demo, snapshot publico, SEO, integridad y conciliacion operativa;
  - `scripts/check_operational_alerts_v2.py --fail-on none --json` pasa sin alertas;
  - `scripts/retry_operational_tasks_v2.py --dry-run --json` pasa sin candidatos ni mutaciones;
  - `scripts/backup_restore_postgres.py` valida backup y restore drill en modo `--dry-run` sin generar artefactos versionables;
  - `scripts/check_deployed_stack.py` no puede ejecutarse sin `BACKEND_BASE_URL`/`FRONTEND_BASE_URL` reales.
- Regla activa:
  1. el go-live real no se declara `DONE` solo con validacion local/demo;
  2. smoke post-deploy y restore drill real requieren entorno externo seguro;
  3. no se activan pagos reales ni banco/PSP real en esta fase.
  4. la nueva fase de ecommerce local real con pago simulado no desbloquea `V2-R10` ni habilita go-live externo.

## 52. Operacion local: check no destructivo de setup/run_app (RUN-001)
- Capacidad: **validacion local de entorno y deteccion de componentes sin arrancar servidores**.
- Estado: **DONE**.
- Evidencia implementada:
  - `setup_entorno.bat` acepta `--check` y `/check` para validar Python, `.venv`, archivo de dependencias Python, `npm` y `frontend\node_modules` sin instalar nada;
  - `run_app.bat` acepta `--check` y `/check`, delega en el check de setup, detecta backend Django y frontend Next, y termina antes de ejecutar `start`;
  - el modo check permite a la automatizacion verificar preparacion local sin dejar procesos persistentes.
- Regla activa:
  1. `run_app.bat --check` no arranca backend ni frontend;
  2. `setup_entorno.bat --check` no instala dependencias ni modifica el entorno;
  3. el smoke real de servidores queda separado para una tarea posterior con control de PID.

## 53. Operacion local: smoke controlado backend/frontend (RUN-002)
- Capacidad: **arranque local verificable de backend Django y frontend Next con control de PID**.
- Estado: **DONE**.
- Evidencia implementada:
  - backend Django arranca en `127.0.0.1:18080` con `--noreload` para evitar procesos no controlados por autoreloader;
  - frontend Next arranca en `127.0.0.1:13080` usando `node frontend\node_modules\next\dist\bin\next dev`;
  - ambos servicios responden en local: backend con `404` esperado en raiz sin ruta publica y frontend con `200` en `/`;
  - los PIDs del ciclo se registran, se cierran y se verifica que no quedan procesos vivos asociados al repo.
- Regla activa:
  1. el smoke local no activa pagos reales ni banco/PSP real;
  2. los servidores de desarrollo se arrancan solo en puertos comprobados como libres;
  3. cualquier smoke futuro debe registrar PIDs y cerrar procesos del repo antes de terminar.

## 54. Ecommerce local simulado: rendimiento frontend (ELS-018)
- Capacidad: **optimizacion de rendimiento percibido en rutas comerciales**.
- Estado: **DONE**.
- Evidencia implementada:
  - `TarjetaProductoBoticaNatural` deja de ser Client Component completo y mantiene imagen, textos, disponibilidad y enlaces como render estructural;
  - `AccionesTarjetaProductoBoticaNatural` concentra la hidratacion necesaria para cantidad y carrito;
  - `FlujoCheckoutReal` memoiza `resolverContextoPreseleccionado` para evitar reparsing de slug/cesta en cada render del formulario;
  - tests de Botica Natural y tarjetas protegen que no se rehidrate toda la card por accidente.
- Regla activa:
  1. no se cambia negocio, pasarela, backend ni rutas;
  2. catalogo/fichas conservan SEO indexable y checkout/pedido conservan noindex;
  3. no se versionan artefactos de build ni imagenes binarias;
  4. medicion Web Vitals/E2E browser queda como mejora futura con runner dedicado.

## 55. Ecommerce local simulado: accesibilidad de compra (ELS-019)
- Capacidad: **accesibilidad y usabilidad del flujo de compra principal**.
- Estado: **DONE**.
- Evidencia implementada:
  - checkout real asocia campos con `label/htmlFor`, `id`, `aria-invalid` y errores por campo;
  - el bloque de error del checkout usa `role="alert"`, recibe foco y comunica errores de stock o validacion;
  - cesta enlaza el CTA bloqueado con la explicacion visible de lineas no comprables;
  - controles de cantidad y eliminar linea en cesta tienen identificadores y etiquetas accesibles;
  - recibo/pedido anuncia carga, mensajes de estado y pago simulado local con roles/ARIA.
- Regla activa:
  1. no se cambia negocio ni flujo de pago;
  2. no se introducen librerias externas;
  3. la mejora es semantica/usabilidad, sin rediseño global;
  4. futuras mejoras visuales de foco/contraste deben hacerse con auditoria CSS dedicada.

## 56. Ecommerce local simulado: seguridad local (ELS-020)
- Capacidad: **guardrails de seguridad para fase local con pago simulado**.
- Estado: **DONE**.
- Evidencia implementada:
  - `BOTICA_PAYMENT_PROVIDER` se valida en settings y solo acepta `simulado_local` o `stripe`;
  - `simulado_local` sigue como proveedor seguro por defecto;
  - si `BOTICA_PAYMENT_PROVIDER=stripe`, settings exige `STRIPE_PUBLIC_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PAYMENT_SUCCESS_URL` y `PAYMENT_CANCEL_URL`;
  - logs de pago dejan de incluir email de contacto;
  - `.env.railway.example` documenta el modo local simulado y advierte que Stripe queda reservado para futuro.
- Regla activa:
  1. Stripe no se activa accidentalmente: requiere variable explicita y configuracion completa;
  2. errores de configuracion mencionan nombres de variables, no valores secretos;
  3. confirmacion simulada sigue limitada a pedidos `simulado_local`, no cancelados y con intencion valida;
  4. la fase local no desbloquea `V2-R10` ni activa pagos reales.

## 57. Ecommerce local simulado: analitica local privada (ELS-021)
- Capacidad: **embudo local minimo sin terceros ni persistencia analitica**.
- Estado: **DONE**.
- Evidencia implementada:
  - `frontend/contenido/analitica/embudoLocal.ts` define contrato de eventos del embudo y emisor local centralizado;
  - ficha de producto, acciones de cesta, checkout real y API frontend de pedidos emiten eventos locales del recorrido de compra;
  - los eventos se publican en consola estructurada `botica_embudo_local` solo cuando la analitica local esta activa;
  - `NEXT_PUBLIC_ANALITICA_LOCAL=false` queda documentado como desactivacion explicita en entorno frontend;
  - tests cubren construccion sin PII, desactivacion, emision y eventos de pago simulado.
- Regla activa:
  1. no se integran Google Analytics, Meta Pixel ni servicios externos;
  2. no se persisten eventos analiticos ni se crea endpoint nuevo;
  3. los eventos no admiten email, telefono, nombre, direccion ni codigo postal;
  4. `checkout_abandonado` queda fuera hasta poder inferirse sin tracking invasivo.

## 58. Ecommerce local simulado: legal y confianza comercial (ELS-022)
- Capacidad: **paginas de confianza minimas para tienda local con pago simulado**.
- Estado: **DONE**.
- Evidencia implementada:
  - el contrato `PAGINAS_LEGALES_COMERCIALES` cubre condiciones de compra, envios/preparacion, devoluciones, privacidad y contacto;
  - existen rutas frontend `/devoluciones` y `/contacto`, ademas de las paginas informativas previas;
  - el footer enlaza condiciones, envios, devoluciones, privacidad y contacto;
  - checkout real enlaza condiciones, privacidad, envios y devoluciones antes de preparar pedido;
  - el copy declara que la base comercial no sustituye revision legal profesional y que no hay go-live externo;
  - los limites de producto quedan visibles: uso tradicional, ritual, aromatico, cultural o decorativo, sin sustituir consejo medico ni garantizar resultados.
- Regla activa:
  1. no se presenta esta base como politica legal definitiva de produccion;
  2. no se activan cookies publicitarias ni pasarela real;
  3. no se hacen claims sanitarios, curativos, milagrosos ni de resultado garantizado;
  4. contacto y consulta artesanal son secundarios respecto al checkout para productos comprables.

## 59. Ecommerce local simulado: guardrail legacy demo (ELS-023)
- Capacidad: **congelado automatizado de demo legacy para evitar regresion al flujo antiguo**.
- Estado: **DONE**.
- Evidencia implementada:
  - `scripts/check_ecommerce_local_simulado.py` valida que checkout real no depende de `PedidoDemo`, `PayloadPedidoDemo`, `CuentaDemo`, `pedidosDemo` ni `cuentasDemo`;
  - el gate bloquea CTAs publicos evidentes hacia `/pedido-demo`;
  - el gate bloquea `cuenta-demo` en navegacion principal;
  - `/encargo` se permite como consulta secundaria y queda reportado como `WARNING`;
  - tests del gate cubren patrones prohibidos, legacy secundario permitido y ausencia de archivos opcionales.
- Regla activa:
  1. legacy demo se conserva, no se borra;
  2. ninguna capacidad nueva puede depender de `PedidoDemo` o `CuentaDemo`;
  3. `/pedido-demo` y `cuenta-demo` no son rutas de continuidad comercial nueva;
  4. `/encargo` solo puede actuar como consulta artesanal/manual secundaria;
  5. la retirada definitiva requiere fase futura explicita.

## 60. Ecommerce local simulado: operativa local (ELS-024)
- Capacidad: **guia operativa local unica para trabajar sin romper el flujo ecommerce real con pago simulado**.
- Estado: **DONE**.
- Evidencia implementada:
  - existe `docs/operativa_ecommerce_local_simulado.md`;
  - la guia documenta objetivo de fase local, real vs simulado vs legacy, requisitos, variables, backend, frontend, bootstrap, cuenta real, compra local, pago simulado, pedido, documento fiscal, admin, gates, tests y troubleshooting;
  - los comandos no destructivos `setup_entorno.bat --check`, `run_app.bat --check` y los `--help` de bootstrap/gate fueron verificados;
  - comandos que mutan datos o arrancan procesos persistentes quedan documentados como no ejecutados durante la creacion de la guia;
  - la guia reafirma que Stripe no se activa y que `V2-R10` sigue bloqueado.
- Regla activa:
  1. usar la guia local antes de ejecutar recorridos manuales de compra;
  2. no inventar comandos operativos sin verificarlos o marcarlos como no verificados;
  3. mantener legacy demo congelado y fuera del flujo principal;
  4. no declarar produccion lista desde validaciones locales.

## 61. Ecommerce local simulado: checklist final de presentacion (ELS-025)
- Capacidad: **checklist final para presentar el proyecto como portfolio/ecommerce local real con pago simulado**.
- Estado: **DONE**.
- Evidencia implementada:
  - existe `docs/checklist_presentacion_ecommerce_local.md`;
  - la checklist cubre identidad, home, catalogo, ficha, cesta, checkout, pago simulado, pedido/recibo, cuenta real, backoffice, stock, documento fiscal, SEO/noindex, legal/confianza, accesibilidad, rendimiento, tests/gates y limites conocidos;
  - cada bloque exige estado `OK / REVISAR / BLOQUEA PRESENTACION`, evidencia esperada, forma de comprobacion, archivo/ruta relacionada y nota de riesgo;
  - incluye guion recomendado de demo, lista de promesas prohibidas y siguiente salto real hacia staging, Stripe sandbox/real, backup/restore, revision legal, E2E y `V2-R10`;
  - no declara go-live externo ni produccion lista.
- Regla activa:
  1. usar esta checklist antes de mostrar el proyecto a terceros;
  2. explicar siempre que el pago es simulado local y que Stripe queda reservado;
  3. no presentar esta fase como cumplimiento legal/fiscal completo;
  4. no desbloquear `V2-R10` sin entorno externo, smoke post-deploy, backup/restore real y revision legal.

## 62. Ecommerce local simulado: catalogo vendible por seccion (ELS-026)
- Capacidad: **contrato de catalogo vendible local por seccion publica abierta**.
- Estado: **DONE**.
- Evidencia implementada:
  - `scripts/bootstrap_ecommerce_local_simulado.py` prepara 14 productos locales comprables con SKUs `LOCAL-ECOM-*`;
  - el dataset local garantiza 5 productos publicados propios en `botica-natural` y 3 en `velas-e-incienso`, `minerales-y-energia` y `herramientas-esotericas`;
  - `tests/nucleo_herbal/test_catalogo_vendible_local.py` valida contrato de producto vendible: SKU, slug, nombre, precio, unidad, incremento, cantidad minima, tipo fiscal, seccion, publicado, inventario compatible, fallback visual y CTA checkout/cesta;
  - la API publica se comprueba por seccion para evitar fallback herbal en secciones abiertas ajenas;
  - producto sin stock queda expuesto como `disponible_compra=false` y `estado_disponibilidad=no_disponible`.
- Regla activa:
  1. ninguna seccion publica abierta debe promocionarse sin minimo vendible propio;
  2. ningun producto incompleto debe aparecer como comprable;
  3. las lineas sin stock o fuera de contrato no deben avanzar a checkout real;
  4. no se versionan imagenes ni binarios para resolver faltantes visuales: se usa fallback frontend.

## 63. Ecommerce local simulado: errores y estados vacios comerciales (ELS-027)
- Capacidad: **estados vacios, bloqueos y errores publicos controlados para el flujo comercial**.
- Estado: **DONE**.
- Evidencia implementada:
  - `frontend/contenido/pedidos/estadosComercialesPedido.ts` centraliza la traduccion de errores de pedido, pago y stock a copy comercial;
  - API frontend de pedidos normaliza mensajes antes de entregarlos a checkout/recibo;
  - checkout real muestra lineas de stock con texto humano y CTA a cesta/disponibilidad;
  - recibo real controla pedido no cargado, errores de pago simulado y errores de stock sin exponer detalles internos;
  - Botica Natural ofrece salidas utiles para seccion vacia, producto no encontrado y producto sin stock.
- Regla activa:
  1. la UI publica no debe mostrar codigos internos como `stock_no_disponible` ni detalles de intencion/pasarela;
  2. cada bloqueo comercial debe ofrecer una siguiente accion clara;
  3. `/encargo` se mantiene solo como consulta personalizada cuando el producto no es comprable;
  4. no se cambia negocio ni backend para resolver estados de presentacion.

## 64. Ecommerce local simulado: estabilidad visual de secciones comerciales (ELS-028)
- Capacidad: **presentacion comercial coherente para secciones publicas de catalogo**.
- Estado: **DONE**.
- Evidencia implementada:
  - `frontend/contenido/catalogo/seccionesComerciales.ts` centraliza configuracion de las secciones comerciales;
  - `frontend/componentes/catalogo/secciones/SeccionComercialProductos.tsx` compone hero, cabecera de catalogo, filtros opcionales, error y listado compartido;
  - `frontend/componentes/catalogo/secciones/ListadoProductosSeccionComercial.tsx` reutiliza la tarjeta comercial existente con precio, stock, ficha, cesta y estado vacio;
  - `/botica-natural`, `/velas-e-incienso`, `/minerales-y-energia` y `/herramientas-esotericas` usan la misma composicion;
  - Botica Natural mantiene filtros y las otras secciones muestran productos reales de su seccion cuando la API los expone.
- Regla activa:
  1. nuevas secciones comerciales deben usar configuracion y composicion compartida antes de crear JSX propio;
  2. las diferencias de contenido viven en configuracion, no en componentes duplicados;
  3. no se introducen claims sanitarios, pago real, imagenes nuevas ni cambios de backend para estabilizar presentacion.

## 65. Ecommerce local simulado: plan retirada legacy demo (ELS-029)
- Capacidad: **plan tecnico para retirar gradualmente `/encargo`, `/pedido-demo`, `PedidoDemo` y `cuenta-demo`**.
- Estado: **DONE documental**.
- Evidencia implementada:
  - existe `docs/plan_retirada_legacy_demo.md`;
  - el plan inventaria rutas frontend, componentes, endpoints, dominio/aplicacion/infraestructura backend, modelos, tablas, migraciones, tests, datos persistidos y dependencias legacy;
  - define fases A-G para ocultar navegacion publica, congelar escritura nueva, mantener lectura historica, migrar/exportar datos si procede, retirar endpoints, retirar modelos/migraciones solo cuando sea seguro y eliminar/mover tests legacy;
  - cada fase incluye precondiciones, cambios permitidos/prohibidos, tests obligatorios y rollback;
  - el plan queda enlazado desde `docs/roadmap_ecommerce_local_simulado.md`.
- Regla activa:
  1. legacy demo no esta eliminado; permanece `DEPRECATED_CONTROLLED`;
  2. ninguna retirada real puede ejecutarse sin seguir fases, backup/exportacion cuando aplique y rollback;
  3. `PedidoDemo` y `CuentaDemo` no pueden contaminar checkout real, pago simulado, pedido real ni cuenta real;
  4. esta capacidad no desbloquea `V2-R10`, no activa Stripe y no declara go-live externo.

## 66. Ecommerce local simulado: auditoria final automatizable (ELS-030)
- Capacidad: **auditoria final de estado local simulado antes de presentacion u optimizacion**.
- Estado: **DONE**.
- Evidencia implementada:
  - existe `docs/auditoria_final_ecommerce_local_simulado.md`;
  - existe `scripts/audit_ecommerce_local_simulado.py` con salida humana, `--json` y severidades `OK/WARNING/BLOCKER`;
  - el script agrega resultados del gate local, guardrail legacy, catalogo vendible, documentacion clave, checklist de presentacion, regresion local y bloqueo `V2-R10`;
  - tests de script validan fixture sin blockers, ausencia de roadmap local, `V2-R10` desbloqueado, falta de adaptador simulado y legacy no congelado;
  - la documentacion diferencia presentacion local de go-live real.
- Regla activa:
  1. ejecutar esta auditoria antes de presentar el ecommerce local simulado como cierre de fase;
  2. `WARNING` solo es aceptable si corresponde a legacy controlado y se explica;
  3. cualquier `BLOCKER` impide presentar la fase como cerrada;
  4. la auditoria no sustituye release gate externo, staging, smoke post-deploy, backup/restore real ni revision legal profesional.

## 67. Ecommerce local simulado: guion de presentacion (ELS-031)
- Capacidad: **recorrido estable de demo para portfolio/ecommerce local simulado**.
- Estado: **DONE documental**.
- Evidencia implementada:
  - existe `docs/guion_demo_ecommerce_local.md`;
  - el guion recorre `/`, `/botica-natural`, ficha comprable, `/cesta`, `/checkout`, `/pedido/[id_pedido]`, documento fiscal, `/mi-cuenta` y `/admin/`;
  - cada paso incluye ruta, dato necesario, accion, resultado esperado, frase sugerida, riesgo y recuperacion;
  - declara que no se debe prometer produccion, Stripe activo, cumplimiento legal final, facturacion legal definitiva ni claims medicos;
  - destaca Clean Architecture, separacion legacy/real, pago por puerto, stock preventivo, post-pago, documento fiscal, backoffice, SEO/noindex y guardrails.
- Regla activa:
  1. la demo principal debe usar `/checkout`, `Pedido` y `/mi-cuenta`;
  2. `/encargo` solo puede mostrarse como consulta secundaria;
  3. el pago simulado se explica como prueba local, no como cobro real;
  4. este guion no desbloquea `V2-R10` ni sustituye staging, E2E, backup/restore o revision legal.

## 68. Ecommerce local simulado: Stripe reservado (ELS-032)
- Capacidad: **preparacion segura del cambio futuro de `simulado_local` a `stripe`**.
- Estado: **DONE**.
- Evidencia implementada:
  - existe `docs/pagos_modo_local_y_stripe.md`;
  - `simulado_local` sigue siendo el proveedor por defecto local y no exige claves Stripe;
  - `stripe` queda documentado como proveedor futuro, explicito y condicionado a claves, URLs, staging, pruebas y rollback;
  - el gate local verifica el proveedor del entorno: `simulado_local` OK, `stripe` WARNING y proveedor desconocido BLOCKER;
  - tests cubren que local simulado no exige claves Stripe y que el gate local advierte/bloquea proveedores de entorno.
- Regla activa:
  1. no activar Stripe real en esta fase;
  2. no introducir secretos ni registrarlos en logs;
  3. `BOTICA_PAYMENT_PROVIDER=stripe` solo puede usarse en fase futura explicita;
  4. esta preparacion no desbloquea `V2-R10` ni sustituye staging/smoke/backup/revision legal.

## 69. Ecommerce local simulado: preparacion staging futuro (ELS-033)
- Capacidad: **guia preparatoria para staging externo futuro sin go-live**.
- Estado: **DONE documental**.
- Evidencia implementada:
  - existe `docs/preparacion_staging_ecommerce.md`;
  - la guia distingue local, staging y produccion;
  - documenta variables, servicios, base temporal, URLs, modo de pago permitido, checks pre/post deploy y rollback;
  - fija `BOTICA_PAYMENT_PROVIDER=simulado_local` como modo inicial de staging y reserva Stripe sandbox para una fase futura explicita;
  - enlaza con readiness, pagos local/Stripe futuro y `V2-R10` bloqueado.
- Regla activa:
  1. esta guia no despliega infraestructura ni toca Railway real;
  2. no introduce secretos ni activa servicios externos;
  3. no activa Stripe real ni sandbox por defecto;
  4. no desbloquea `V2-R10`, que sigue dependiendo de URLs reales, PostgreSQL seguro, smoke post-deploy, backup/restore drill real y validacion externa.

## 70. Ecommerce local simulado: auditoria dependencias demo/real (ELS-034)
- Capacidad: **auditoria arquitectonica de acoplamientos entre flujo real y legacy demo**.
- Estado: **DONE**.
- Evidencia implementada:
  - existe `docs/auditoria_dependencias_demo_real.md`;
  - `frontend/contenido/catalogo/checkoutReal.ts` deja de importar `LineaNoConvertiblePedido` desde `checkoutDemo`;
  - `scripts/check_ecommerce_local_simulado.py` bloquea imports demo desde modulos reales de checkout, pedido, cuenta y APIs frontend;
  - el gate marca como `WARNING` el uso transitorio de `encargoConsulta` en checkout real;
  - tests del gate cubren el bloqueo de `checkoutDemo` y el warning controlado de `encargoConsulta`.
- Regla activa:
  1. `PedidoDemo`, `CuentaDemo`, `pedidosDemo`, `cuentasDemo` y `checkoutDemo` no pueden entrar en modulos reales;
  2. `/encargo` y helpers de consulta solo pueden permanecer como legacy/adaptadores transitorios documentados;
  3. cualquier nuevo acoplamiento demo -> real debe corregirse o registrarse como blocker antes de optimizar.

## 71. Ecommerce local simulado: barrido de deuda menor (ELS-036)
- Capacidad: **auditoria de marcadores de deuda menor y lenguaje historico demo/legacy**.
- Estado: **DONE documental**.
- Evidencia implementada:
  - existe `docs/deuda_residual_ecommerce_local.md`;
  - se auditaron marcadores `TODO`, `FIXME`, `HACK`, `temporal`, `demo`, `legacy`, `v1`, `coexistencia`, `pendiente` y `simulado`;
  - `docs/roadmap_ecommerce_local_simulado.md` corrige titulos duplicados de ELS-23 y ELS-24;
  - la deuda residual queda clasificada entre documental valido, legacy permitido, deuda mayor documentada y blockers;
  - no se toca codigo funcional ni se elimina legacy.
- Regla activa:
  1. los marcadores `demo`/`legacy` restantes son aceptables solo si pertenecen a historico normalizado, legacy controlado, tests legacy o documentacion de retirada;
  2. `TODO`/`FIXME`/`HACK` nuevos en flujo real deben justificarse o eliminarse antes de cierre;
  3. `encargoConsulta` en checkout real sigue como warning transitorio hasta una microfase de helper neutral;
  4. este barrido no desbloquea `V2-R10`, no activa Stripe y no convierte legacy en flujo principal.

## 72. Ecommerce local simulado: entorno local reproducible (ELS-037)
- Capacidad: **contrato verificable para levantar ecommerce local simulado**.
- Estado: **DONE**.
- Evidencia implementada:
  - existe `.env.example` raiz con variables locales seguras y sin secretos reales;
  - existe `docs/checklist_entorno_local_ecommerce.md`;
  - existe `scripts/check_entorno_local_ecommerce.py` con salida humana, `--json` y `--fail-on`;
  - existe `tests/scripts/test_check_entorno_local_ecommerce.py`;
  - `docs/operativa_ecommerce_local_simulado.md` enlaza el contrato reproducible.
- Regla activa:
  1. el proveedor local recomendado es `BOTICA_PAYMENT_PROVIDER=simulado_local`;
  2. Stripe no se activa ni se exige para desarrollo local;
  3. el contrato local no debe conectarse a servicios externos ni crear datos por si mismo;
  4. `var/dev.sqlite3` y cualquier base local siguen fuera de versionado;
  5. `V2-R10` sigue bloqueado y no se reinterpreta por tener entorno local reproducible.

## 73. Ecommerce local simulado: mapa final de rutas (ELS-038)
- Capacidad: **clasificacion final de rutas publicas, privadas, transaccionales, API, backoffice y legacy**.
- Estado: **DONE documental + guardrail**.
- Evidencia implementada:
  - existe `docs/mapa_rutas_ecommerce_local.md`;
  - el mapa clasifica cada familia de ruta por proposito, estado, indexacion, flujo, tests/gate y CTA principal;
  - `scripts/check_ecommerce_local_simulado.py` valida la presencia del mapa de rutas;
  - los tests del gate cubren ausencia de mapa como `BLOCKER`;
  - no se modifican rutas ni metadata porque el contrato SEO vigente ya cubre noindex transaccional.
- Regla activa:
  1. `/checkout`, `/pedido/[id_pedido]` y `/mi-cuenta` son rutas principales del flujo real local;
  2. `/encargo`, `/pedido-demo` y `/cuenta-demo` permanecen `LEGACY_DEPRECATED`;
  3. rutas transaccionales, cuenta, auth y admin deben mantenerse `NOINDEX`;
  4. APIs y backoffice son `INTERNA`/`NO_APLICA` para indexacion;
  5. ningun CTA principal nuevo puede apuntar a legacy.

## 74. Ecommerce local simulado: cierre del roadmap local (ELS-039)
- Capacidad: **cierre documental del roadmap ecommerce local real con pago simulado**.
- Estado: **DONE documental**.
- Estado final del roadmap local: **CERRADO_LOCALMENTE**.
- Evidencia implementada:
  - `docs/roadmap_ecommerce_local_simulado.md` incorpora estado final, matriz de hitos y proximos hitos fuera de alcance;
  - los hitos `ELS-01` a `ELS-38` quedan clasificados como `DONE` o `DONE documental`;
  - `scripts/check_ecommerce_local_simulado.py` y `scripts/audit_ecommerce_local_simulado.py` se mantienen como evidencia automatizable sin `BLOCKER`;
  - `docs/auditoria_final_ecommerce_local_simulado.md`, `docs/checklist_presentacion_ecommerce_local.md`, `docs/deuda_residual_ecommerce_local.md`, `docs/mapa_rutas_ecommerce_local.md` y `docs/operativa_ecommerce_local_simulado.md` sostienen el cierre.
- Flujo principal vigente:
  1. catalogo/ficha/cesta -> `/checkout`;
  2. pedido real `Pedido`;
  3. pago activo local `simulado_local`;
  4. detalle/recibo en `/pedido/[id_pedido]`;
  5. cuenta real visible en `/mi-cuenta`;
  6. backoffice/admin opera pedidos reales.
- Legacy demo:
  - `/encargo`, `/pedido-demo`, `/pedido-demo/[id_pedido]`, `cuenta-demo`, `PedidoDemo` y `CuentaDemo` siguen **DEPRECATED_CONTROLLED**;
  - no son base de nuevas capacidades;
  - su retirada fisica queda fuera de este cierre y debe seguir `docs/plan_retirada_legacy_demo.md`.
- Pago:
  - `simulado_local` es el modo activo local;
  - Stripe queda **RESERVADO_FUTURO**;
  - no se activan pagos reales ni Stripe sandbox en este cierre.
- Limites:
  1. no se declara produccion lista;
  2. no se cierra `V2-R10`;
  3. no sustituye staging, E2E browser real, backup/restore real ni revision legal profesional.
- Proximos hitos fuera del roadmap local:
  1. staging futuro;
  2. Stripe sandbox en fase explicita;
  3. E2E browser real;
  4. revision legal profesional;
  5. backup/restore real;
  6. go-live `V2-R10` cuando deje de estar bloqueado;
  7. retirada fisica de legacy demo.
