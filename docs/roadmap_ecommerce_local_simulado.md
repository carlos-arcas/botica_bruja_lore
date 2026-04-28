# Roadmap ecommerce local real con pago simulado

## 0. Estado final del roadmap
- **Estado**: `CERRADO_LOCALMENTE`.
- **Fecha de cierre documental**: 2026-04-28.
- **Alcance cerrado**: ecommerce local real para entorno local/portfolio con pago `simulado_local`, checkout real, pedido real, stock preventivo, cesta real, cuenta real, recibo/documento, backoffice, SEO/noindex, gates y documentacion operativa.
- **Evidencia de cierre**:
  1. los hitos `ELS-01` a `ELS-38` estan clasificados como `DONE` o `DONE documental`;
  2. el gate local `scripts/check_ecommerce_local_simulado.py` no reporta `BLOCKER`;
  3. la auditoria final `scripts/audit_ecommerce_local_simulado.py` no reporta `BLOCKER`;
  4. existen guias y evidencias en `docs/operativa_ecommerce_local_simulado.md`, `docs/checklist_presentacion_ecommerce_local.md`, `docs/auditoria_final_ecommerce_local_simulado.md`, `docs/deuda_residual_ecommerce_local.md` y `docs/mapa_rutas_ecommerce_local.md`.
- **Warnings aceptados**:
  1. legacy demo visible de forma controlada;
  2. `/encargo` conservado como consulta secundaria;
  3. preseleccion heredada `encargoConsulta` documentada como deuda residual no bloqueante.
- **Limites del cierre**:
  1. no declara produccion lista;
  2. no desbloquea `V2-R10`;
  3. no activa Stripe real ni Stripe sandbox;
  4. no sustituye staging, E2E browser real, backup/restore real ni revision legal profesional;
  5. no elimina fisicamente `/encargo`, `/pedido-demo`, `PedidoDemo` ni `cuenta-demo`.

## 1. Objetivo de la fase
Reencauzar el producto hacia un ecommerce real ejecutable en local, donde producto, cesta, checkout, pedido, stock, cuenta, documento fiscal y backoffice operan sobre capacidades reales del sistema.

La unica simulacion permitida en esta fase es la pasarela de pago. Esa simulacion debe existir como adaptador intercambiable detras del puerto de pago, no como logica especial en vistas, componentes o rutas publicas.

## 2. Diferencia entre flujos

### 2.1 Ecommerce real local
- Usa `Producto`, `Pedido`, cuenta cliente real, inventario real, documento fiscal real y backoffice operativo.
- Debe ser el flujo principal de navegacion, compra local y validacion funcional.
- No depende de `PedidoDemo`, `CuentaDemo` ni contratos `*-demo` para capacidades nuevas.

### 2.2 Demo legacy
- Incluye `/encargo`, `/pedido-demo` y `cuenta-demo`.
- Permanece accesible como compatibilidad controlada y referencia historica.
- No se elimina en esta fase, pero queda deprecada progresivamente como flujo principal.
- Solo puede recibir mantenimiento de compatibilidad, integridad o retirada controlada.

### 2.3 Pago simulado
- Sustituye al PSP activo en local para cerrar el recorrido sin cobro externo.
- Debe entrar por puerto/adaptador de pasarela de pago.
- No debe contaminar dominio, casos de uso de pedido ni presentacion con bifurcaciones especiales.
- Stripe queda reservado para futuro y no es el flujo activo local.

## 3. Rutas canonicas de la nueva fase

| Ruta | Estado objetivo | Rol |
|---|---|---|
| `/checkout` | Principal | Checkout real local sobre `Pedido`. |
| `/pedido/[id_pedido]` | Principal | Detalle, estado y documento del pedido real. |
| `/mi-cuenta` | Principal | Cuenta cliente real y acceso a pedidos reales. |
| `/encargo` | Legacy deprecado | Consulta artesanal/manual o compatibilidad historica. |
| `/pedido-demo` | Legacy deprecado | Consulta de pedidos demo existentes. |
| `cuenta-demo` | Legacy deprecado | Cuenta demo historica, no evolucionable para capacidades nuevas. |

## 4. Reglas obligatorias
1. Ninguna capacidad nueva debe depender de `PedidoDemo`.
2. Ningun CTA publico nuevo debe apuntar a `/encargo`, salvo consulta artesanal/manual explicita.
3. El checkout publico principal es `/checkout`.
4. El detalle principal de pedido es `/pedido/[id_pedido]`.
5. La cuenta principal es `/mi-cuenta`.
6. El pago simulado debe implementarse como adaptador del puerto de pasarela de pago.
7. Stripe queda `RESERVADO_FUTURO` para esta fase local simulada.
8. La demo legacy se depreca por sustitucion progresiva, no por borrado inmediato.
9. No se reabren V1/V2 cerrados; esta fase local se apoya en lo ya implementado y ajusta el flujo activo local.

## 5. Orden de fases

### ELS-01 - Reencauce documental
- **Estado**: `DONE documental`.
- **Objetivo**: fijar la nueva fuente de verdad de ecommerce local real con pago simulado.
- **Resultado**:
  1. existe este roadmap como documento rector de la fase local simulada;
  2. `docs/90_estado_implementacion.md` registra la nueva fase, legacy deprecado, pago simulado y Stripe reservado;
  3. `docs/roadmap_ecommerce_real_v2.md` mantiene `V2-R10` bloqueado y no activa pagos reales.
- **Fuera de alcance**: cambios funcionales, CTAs, frontend, backend y Stripe.
- **Criterio de cierre**: roadmap creado, estado factual actualizado y V2-R10 sin contradiccion.

### ELS-02 - Deprecacion UX de demo legacy
- **Estado**: `DONE`.
- **Objetivo**: hacer visible que `/encargo`, `/pedido-demo` y `cuenta-demo` son legacy controlado.
- **Fuera de alcance**: borrar rutas demo o romper pedidos demo existentes.
- **Resultado**:
  1. navegacion principal publica expone `/checkout` y deja fuera `/encargo` y `cuenta-demo`;
  2. cesta y fichas publicas ofrecen compra normal hacia `/checkout`;
  3. `/encargo` se conserva como consulta personalizada/orientacion artesanal secundaria;
  4. `/pedido-demo` y `cuenta-demo` permanecen como legacy interno compatible, sin promocion como flujo normal.

### ELS-03 - Pasarela simulada
- **Estado**: `DONE`.
- **Objetivo**: incorporar adaptador local de pago simulado detras del puerto de pasarela.
- **Resultado**:
  1. existe `PasarelaPagoSimuladaLocal` como adaptador de infraestructura del puerto canonico;
  2. `BOTICA_PAYMENT_PROVIDER=simulado_local` es el proveedor por defecto local;
  3. `BOTICA_PAYMENT_PROVIDER=stripe` conserva Stripe como proveedor futuro/configurable;
  4. valores invalidos fallan de forma explicita;
  5. confirmacion/webhook simulado y post-pago quedan fuera de esta fase.
- **Fuera de alcance**: activar Stripe, banco o PSP real.

### ELS-04 - Confirmacion de pago simulado
- **Estado**: `DONE`.
- **Objetivo**: cerrar localmente pedido real -> intencion simulada -> confirmacion local -> post-pago real.
- **Resultado**:
  1. existe `ConfirmarPagoSimuladoPedido`;
  2. existe `POST /api/v1/pedidos/{id_pedido}/confirmar-pago-simulado/`;
  3. la confirmacion valida proveedor `simulado_local` e intencion existente;
  4. el descuento de inventario, incidencias y email post-pago se delegan en `ProcesarPostPagoPedido`.
- **Fuera de alcance**: frontend, webhook simulado, reembolso simulado y Stripe real.

### ELS-05 - UI de pago simulado en checkout real
- **Estado**: `DONE`.
- **Objetivo**: permitir completar desde la UI el flujo pedido real -> intencion simulada -> confirmacion local.
- **Resultado**:
  1. el frontend expone `confirmarPagoSimuladoPedido`;
  2. `/pedido/[id_pedido]` muestra accion de confirmacion cuando el proveedor es `simulado_local`;
  3. la confirmacion redirige al retorno success del pedido real;
  4. no se usa `/encargo` ni `PedidoDemo`.
- **Fuera de alcance**: Stripe frontend real, redisenar checkout completo, cuenta real y backoffice.

### ELS-06 - Stock preventivo
- **Estado**: `DONE`.
- **Objetivo**: reforzar coherencia de disponibilidad antes de iniciar pago y antes de confirmar pago simulado.
- **Resultado**:
  1. existe `ValidarStockPreventivoPedido` en aplicacion;
  2. iniciar pago valida inventario antes de crear intencion PSP;
  3. confirmar pago simulado revalida inventario antes de delegar en post-pago;
  4. los errores salen como `stock_no_disponible` con detalle por linea;
  5. `ProcesarPostPagoPedido` sigue como segunda barrera ante concurrencia o cambios de ultima hora.
- **Fuera de alcance**: frontend, reservas temporales, multi-almacen, lotes o cambios logisticos.

### ELS-07 - Stock visible en ficha, cesta y checkout
- **Estado**: `DONE`.
- **Objetivo**: mostrar disponibilidad antes del pago y bloquear lo claramente no comprable.
- **Resultado**:
  1. el contrato publico de producto expone `disponible_compra`, `cantidad_disponible` y `mensaje_disponibilidad` junto a `disponible`/`estado_disponibilidad`;
  2. ficha y cards muestran disponibilidad sobria y desactivan compra directa sin stock;
  3. cesta marca lineas sin stock y bloquea el CTA a checkout hasta ajustar o eliminar;
  4. checkout valida disponibilidad visible y muestra errores preventivos de stock sin codigos tecnicos.
- **Fuera de alcance**: reserva temporal, cambios de precio, backoffice, Stripe real o eliminacion legacy.

### ELS-08 - Cesta real limpia
- **Estado**: `DONE`.
- **Objetivo**: asegurar que la cesta del flujo principal no arrastra contratos demo ni lineas fuera de contrato hacia `/checkout`.
- **Resultado**:
  1. `cestaReal.ts` clasifica lineas como `comprable`, `requiere_consulta`, `invalida` o `sin_stock`;
  2. la cesta solo serializa hacia `/checkout` las lineas comprables;
  3. las lineas artesanales/fuera de catalogo se muestran como consulta personalizada con salida secundaria a `/encargo`;
  4. el CTA principal "Finalizar compra" queda activo solo si todas las lineas son comprables y hay al menos una linea valida.
- **Fuera de alcance**: rediseño global de catalogo, promociones, descuentos, pago o backend.

### ELS-09 - Cuenta real unica visible
- **Estado**: `DONE`.
- **Objetivo**: orientar continuidad cliente hacia `/mi-cuenta`, pedidos reales y direcciones reales, dejando `cuenta-demo` como legacy controlado.
- **Resultado**:
  1. la navegacion principal mantiene `/mi-cuenta` como unica cuenta visible y no expone `/cuenta-demo`;
  2. `/mi-cuenta` muestra datos de cuenta, pedidos reales, enlaces a `/pedido/[id_pedido]`, documento fiscal y direcciones guardadas;
  3. checkout real prioriza sesion/direcciones de cuenta real y conserva invitado sin usar `CuentaDemo`;
  4. `cuenta-demo` sigue accesible por ruta legacy y tests, pero sin CTA desde la cuenta real principal.
- **Fuera de alcance**: borrar modelos/endpoints demo, migrar datos demo o redisenar autenticacion profunda.

### ELS-10 - Pedido real, recibo y documento fiscal local
- **Estado**: `DONE`.
- **Objetivo**: pulir `/pedido/[id_pedido]`, recibo y documento fiscal para operar como ecommerce real local con pago simulado.
- **Resultado**:
  1. el recibo real elimina lenguaje de demo antigua, legacy o coexistencia;
  2. el detalle de pedido muestra estado, fecha, contacto, entrega, lineas, totales, documento fiscal y seguimiento operativo;
  3. el pago simulado se comunica como `Pago confirmado en entorno local simulado`;
  4. el documento fiscal HTML mantiene desglose, trazabilidad y nota de alcance sin prometer numeracion fiscal legal avanzada.
- **Fuera de alcance**: calculo fiscal profundo, pasarela, stock, backoffice, PDF o eliminacion de `/pedido-demo`.

### ELS-11 - Backoffice operativo
- **Estado**: `DONE`.
- **Objetivo**: operar pedidos reales locales creados desde `/checkout` con pago simulado.
- **Resultado**:
  1. Django Admin de `PedidoRealModelo` expone email, cliente, total, estado, pago, proveedor, pago simulado, revision, inventario e incidencias;
  2. el listado incorpora filtros operativos para pendiente de pago, pagado, preparando, enviado, entregado, revision manual, incidencia de stock, reembolso y pago simulado local;
  3. las acciones manuales permiten marcar preparando, enviado y entregado reutilizando casos de uso de aplicacion;
  4. el envio exige tracking o marca explicita de envio sin seguimiento;
  5. las acciones operativas registran actor, pedido, estado anterior/nuevo, `operation_id` y resultado.
- **Fuera de alcance**: CRM completo, panel frontend nuevo, automatizar reembolsos, activar Stripe o eliminar `PedidoDemo`.

### ELS-12 - Postventa local simulada/manual
- **Estado**: `DONE`.
- **Objetivo**: alinear devoluciones, reembolso y restitucion con pago `simulado_local` sin integraciones reales.
- **Resultado**:
  1. la devolucion aceptada puede ejecutar reembolso simulado/manual solo para pedidos `simulado_local`;
  2. el reembolso genera `id_externo_reembolso` trazable `SIM-REF-{id_pedido}-{operation_id}` y registra fecha;
  3. Django Admin de postventa no llama a Stripe para devoluciones aceptadas ni para reembolsos locales;
  4. la restitucion postventa es manual, idempotente y registra ledger cuando hubo inventario descontado;
  5. una devolucion aceptada queda resuelta cuando el reembolso esta ejecutado y la restitucion esta ejecutada o no aplica.
- **Fuera de alcance**: portal cliente de devoluciones, etiquetas de transporte, emails reales nuevos, banco/PSP real o cambios fiscales profundos.

### ELS-13 - SEO y noindex operativo
- **Estado**: `DONE`.
- **Objetivo**: asegurar que checkout, pedido real, cuenta, auth, backoffice y legacy demo no se indexan.
- **Resultado**:
  1. `docs/seo_contrato.json` declara como no indexables y fuera de sitemap las rutas transaccionales/privadas nuevas;
  2. `/checkout`, `/pedido/[id_pedido]`, `/mi-cuenta`, auth y backoffice usan metadata `noindex` con el helper SEO existente;
  3. `/encargo`, `/pedido-demo`, `/pedido-demo/[id_pedido]` y `cuenta-demo` siguen como legacy controlado no indexable;
  4. catalogo, fichas y editorial mantienen su contrato indexable/canonical vigente.
- **Fuera de alcance**: reescritura de contenido SEO, nuevas landings, cambios funcionales de checkout o eliminacion legacy.

### ELS-14 - Limpieza de copy comercial
- **Estado**: `DONE`.
- **Objetivo**: limpiar el copy visible para que la web suene a tienda real artesanal/editorial, sin lenguaje tecnico, demo, legacy, V1 o coexistencia en superficies publicas.
- **Resultado**:
  1. home, fichas, cesta, checkout, recibo, pedido, cuenta y rutas legacy visibles eliminan copy publico de demo tecnica;
  2. el pago local se comunica solo donde procede como prueba en entorno local, sin presentar toda la tienda como demo;
  3. `/encargo`, `/pedido-demo` y `cuenta-demo` conservan compatibilidad legacy sin promocion comercial;
  4. los tests textuales se actualizan al tono comercial vigente.
- **Fuera de alcance**: cambios de logica de pagos, URLs, borrado legacy, rebranding visual o claims sanitarios.

### ELS-15 - Gate local ecommerce
- **Estado**: `DONE`.
- **Objetivo**: definir y ejecutar un gate local que valide el flujo ecommerce real con pago simulado.
- **Resultado**:
  1. existe `scripts/check_ecommerce_local_simulado.py`;
  2. el gate valida contratos minimos de roadmap, rutas, pago simulado, confirmacion local, checkout/recibo, cuenta, backoffice, noindex y bloqueo `V2-R10`;
  3. la salida soporta texto humano y `--json`;
  4. `--fail-on warning` permite endurecer ejecucion local sin cambiar el criterio por defecto;
  5. el gate no requiere servicios externos, no activa Stripe y no declara go-live externo.
- **Fuera de alcance**: desbloquear `V2-R10`, deploy real, backup real, smoke post-deploy externo o ejecutar E2E con servidor.

### ELS-16 - Seed local comprable
- **Estado**: `DONE`.
- **Objetivo**: garantizar datos locales minimos para ejecutar producto publicado -> stock disponible -> cesta -> checkout -> pago simulado -> pedido real -> documento/recibo.
- **Resultado**:
  1. existe `scripts/bootstrap_ecommerce_local_simulado.py`;
  2. el bootstrap crea o actualiza secciones publicas de producto, una planta/intencion local, cuatro productos publicados comprables, inventario compatible y una cuenta cliente local opcional con direccion;
  3. los SKUs usan prefijo `LOCAL-ECOM-` y no se duplican en ejecuciones repetidas;
  4. `--dry-run` permite validar el plan sin persistir cambios;
  5. no crea pedidos, pagos, imagenes, migraciones ni datos masivos.
- **Fuera de alcance**: checkout, pasarela, Stripe real, pedidos precargados, imagenes nuevas o datos de produccion.

### ELS-17 - Regresion compra local
- **Estado**: `DONE`.
- **Objetivo**: proteger por tests el recorrido catalogo -> ficha -> cesta -> checkout -> pago simulado -> pedido real -> documento/recibo -> cuenta.
- **Resultado**:
  1. existe `tests/nucleo_herbal/test_regresion_compra_local_simulada.py`;
  2. existe `frontend/tests/compra-local-simulada.test.ts`;
  3. `npm --prefix frontend run test:compra-local` ejecuta la regresion frontend reusable;
  4. la matriz de cobertura vive en `docs/13_testing_ci_y_quality_gate.md`;
  5. la regresion evita Playwright/E2E pesado y protege contratos por capas.
- **Fuera de alcance**: servidor frontend, E2E browser, Stripe real, borrado legacy o datos masivos.

### ELS-18 - Rendimiento frontend ecommerce
- **Estado**: `DONE`.
- **Objetivo**: optimizar de forma segura el rendimiento percibido de home -> catalogo/secciones -> ficha -> cesta -> checkout -> pedido sin cambiar negocio.
- **Resultado**:
  1. la tarjeta publica de producto en Botica Natural deja de ser Client Component completo;
  2. solo el bloque interactivo de cantidad/carrito queda hidratado en `AccionesTarjetaProductoBoticaNatural`;
  3. el checkout real memoiza la resolucion inicial de preseleccion para no recalcular cesta/slug en cada render;
  4. metadata SEO de catalogo/fichas y noindex de rutas transaccionales se conservan;
  5. no se tocan imagenes binarias, pasarela, backend ni flujo de negocio.
- **Fuera de alcance**: redisenar UI, CDN, analitica externa, Stripe real, E2E browser pesado o cambio de datos.

### ELS-19 - Accesibilidad y usabilidad de compra
- **Estado**: `DONE`.
- **Objetivo**: mejorar accesibilidad basica del flujo catalogo/ficha -> cesta -> checkout -> pago simulado -> pedido sin cambiar negocio.
- **Resultado**:
  1. los campos del checkout real tienen `label` asociado, `id`, `aria-invalid` y errores enlazados;
  2. los errores globales del checkout se anuncian y reciben foco cuando bloquean el avance;
  3. los botones bloqueados de cesta/checkout enlazan una explicacion visible con `aria-describedby`;
  4. las cantidades y eliminacion de lineas en cesta tienen controles identificables para teclado/lector;
  5. el recibo anuncia carga/mensajes y el bloque de pago simulado como region accesible.
- **Fuera de alcance**: redisenar UI, cambiar logica de pago, tocar backend, imagenes o introducir librerias externas de accesibilidad.

### ELS-20 - Seguridad local ecommerce simulado
- **Estado**: `DONE`.
- **Objetivo**: endurecer guardrails locales para proveedor de pago, secretos, confirmacion simulada y exposicion accidental.
- **Resultado**:
  1. `BOTICA_PAYMENT_PROVIDER` se valida al cargar settings y solo acepta `simulado_local` o `stripe`;
  2. `simulado_local` sigue como valor seguro por defecto;
  3. si se selecciona `stripe`, settings exige claves y URLs de retorno antes de construir servicios;
  4. los logs de pago dejan de incluir email de contacto;
  5. tests cubren proveedor invalido, Stripe sin claves, confirmacion simulada contra Stripe/cancelado y ausencia de secretos en errores conocidos.
- **Fuera de alcance**: activar Stripe, pentest completo, CSP avanzada, deploy real o desbloquear `V2-R10`.

### ELS-21 - Analitica local de embudo
- **Estado**: `DONE`.
- **Objetivo**: medir localmente el embudo vista producto -> cesta -> checkout -> pedido -> pago simulado -> pedido pagado sin servicios externos ni tracking invasivo.
- **Resultado**:
  1. existe `frontend/contenido/analitica/embudoLocal.ts` como contrato centralizado de eventos;
  2. las vistas de producto emiten `producto_visto` y las acciones de cesta emiten `producto_anadido_cesta`;
  3. `/checkout` emite `checkout_iniciado` y la API frontend de pedidos emite `pedido_creado`, `pago_simulado_iniciado`, `pago_simulado_confirmado`, `pedido_pagado` y `error_stock`;
  4. la emision es local por consola estructurada `botica_embudo_local`, desactivable con `NEXT_PUBLIC_ANALITICA_LOCAL=false`;
  5. el contrato excluye email, telefono, nombre, direccion y codigo postal.
- **Fuera de alcance**: endpoint analitico, persistencia, dashboard, cookies publicitarias, servicios externos o tracking cross-site.

#### Contrato de eventos ELS-21
- `producto_visto`: ficha de producto visitada.
- `producto_anadido_cesta`: producto agregado a cesta local.
- `checkout_iniciado`: entrada al checkout real.
- `pedido_creado`: API frontend recibe pedido real creado.
- `pago_simulado_iniciado`: API frontend recibe intencion de pago `simulado_local`.
- `pago_simulado_confirmado`: confirmacion local devuelta correctamente.
- `pedido_pagado`: pedido devuelto con `estado_pago=pagado`.
- `error_stock`: API devuelve bloqueo preventivo de stock.
- `checkout_abandonado`: no se implementa en esta fase porque requeriria inferencia de navegacion/sesion mas invasiva.

Los eventos solo admiten campos tecnicos minimos: `timestamp`, `ruta`, `session_id`, `operation_id`, `id_producto`, `slug_producto`, `id_pedido`, `proveedor_pago`, `codigo_error` y `cantidad`.

### ELS-22 - Legal y confianza comercial
- **Estado**: `DONE`.
- **Objetivo**: ordenar paginas legales/comerciales minimas para que la tienda local parezca coherente sin prometer cumplimiento legal definitivo ni claims sanitarios.
- **Resultado**:
  1. el footer enlaza condiciones de compra, envios/preparacion, devoluciones, privacidad y contacto;
  2. existen paginas publicas para `/devoluciones` y `/contacto`, ademas de condiciones, envios y privacidad;
  3. checkout real enlaza condiciones, privacidad, envios y devoluciones antes de preparar pedido;
  4. el copy declara limites de productos herbales/esotericos: uso tradicional, ritual, aromatico, cultural o decorativo, sin sustituir consejo medico ni garantizar resultados;
  5. la documentacion visible indica que esta base no sustituye revision legal profesional y que no hay go-live externo.
- **Fuera de alcance**: politica legal definitiva de produccion, cookies de terceros, pasarela real, backend o claims sanitarios.

### ELS-23 - Guardrail legacy demo congelado
- **Estado**: `DONE`.
- **Objetivo**: congelar formalmente la demo legacy y evitar regresiones hacia `/encargo`, `/pedido-demo`, `PedidoDemo` o `cuenta-demo` en capacidades nuevas.
- **Resultado**:
  1. el gate local valida que checkout real no depende de `PedidoDemo`, `PayloadPedidoDemo`, `CuentaDemo`, `pedidosDemo` ni `cuentasDemo`;
  2. el gate local bloquea CTAs publicos evidentes hacia `/pedido-demo`;
  3. el gate local bloquea `cuenta-demo` en navegacion principal;
  4. `/encargo` queda permitido solo como consulta secundaria y genera `WARNING`;
  5. legacy sigue accesible, testeable y no se borra en esta fase.
- **Fuera de alcance**: borrar rutas legacy, migrar datos demo, reescribir checkout, tocar pago o cuenta real.

#### Estado congelado de legacy demo
- `/encargo`: conservado como consulta personalizada/manual y salida secundaria para lineas no comprables.
- `/pedido-demo`: conservado solo como historico/controlado; no debe ser destino de CTAs principales nuevos.
- `cuenta-demo`: conservada solo como historico/controlado; no debe aparecer en navegacion principal ni nuevos flujos.
- `PedidoDemo`: conservado para compatibilidad legacy, tests y backoffice historico; ninguna capacidad nueva debe depender de el.

#### Prohibiciones para nuevas features
1. No importar ni depender de `PedidoDemo`, `PayloadPedidoDemo`, `CuentaDemo`, `pedidosDemo` o `cuentasDemo` desde checkout real, pago simulado, pedido real, cuenta real o cesta real.
2. No crear CTAs principales hacia `/pedido-demo`.
3. No reintroducir `cuenta-demo` en navegacion principal.
4. No usar `/encargo` como compra normal; solo consulta manual/secundaria.
5. No mezclar persistencia o DTOs demo con `Pedido` real.

#### Retirada futura
La retirada de legacy demo requiere una fase posterior explicita y debe seguir `docs/plan_retirada_legacy_demo.md`: inventario de datos demo, congelado de escritura, lectura historica, migracion/exportacion o descarte documentado, retirada de endpoints, retirada segura de modelos/migraciones y eliminacion progresiva de tests legacy. No se ejecuta en esta fase.

### ELS-24 - Operativa local ecommerce simulado
- **Estado**: `DONE`.
- **Objetivo**: crear una guia operativa local unica para levantar, poblar, comprar, confirmar pago simulado, operar pedidos y validar gates sin depender de memoria o prompts previos.
- **Resultado**:
  1. existe `docs/operativa_ecommerce_local_simulado.md`;
  2. la guia distingue ecommerce real local, pago simulado y legacy congelado;
  3. documenta requisitos, variables, backend, frontend, bootstrap, cuenta real, compra local, pago simulado, pedido, documento fiscal, admin, gates, tests y troubleshooting;
  4. lista comandos verificados y comandos documentados pero no ejecutados para evitar falsas garantias;
  5. reafirma que no se activa Stripe ni se desbloquea `V2-R10`.
- **Fuera de alcance**: cambiar codigo funcional, arrancar servidores persistentes, tocar deploy Railway o activar pagos reales.

### ELS-25 - Checklist final de presentacion
- **Estado**: `DONE`.
- **Objetivo**: crear una checklist final para validar si la web esta presentable como pieza portfolio/ecommerce local real con pago simulado, sin venderla como produccion real.
- **Resultado**:
  1. existe `docs/checklist_presentacion_ecommerce_local.md`;
  2. la checklist cubre marca, home, catalogo, ficha, cesta, checkout, pago simulado, pedido, cuenta, backoffice, stock, documento fiscal, SEO/noindex, legal/confianza, accesibilidad, rendimiento, tests/gates y limites conocidos;
  3. cada bloque exige estado `OK / REVISAR / BLOQUEA PRESENTACION`, evidencia, comprobacion, ruta relacionada y riesgo;
  4. incluye guion recomendado de demo, lo que no se debe prometer y siguiente salto real;
  5. reafirma que `V2-R10` sigue bloqueado y que no se activan pagos reales.
- **Fuera de alcance**: implementar features, corregir bugs funcionales grandes, cerrar `V2-R10`, tocar frontend/backend funcional o crear automatizaciones nuevas.

### ELS-26 - Catalogo vendible por seccion
- **Estado**: `DONE`.
- **Objetivo**: auditar y corregir coherencia del catalogo vendible para que cada producto publico comprable tenga contrato comercial completo.
- **Resultado**:
  1. `scripts/bootstrap_ecommerce_local_simulado.py` garantiza 14 productos locales comprables: 5 en `botica-natural` y 3 en cada seccion comercial abierta restante;
  2. existe `tests/nucleo_herbal/test_catalogo_vendible_local.py` como contrato verificable de producto vendible y minimo por seccion;
  3. el contrato valida SKU, slug, nombre, precio, unidad, incremento, cantidad minima, tipo fiscal, seccion, estado publicado, inventario compatible, fallback visual y CTA hacia cesta/checkout;
  4. la API publica no mezcla fallback herbal en secciones abiertas distintas de `botica-natural`;
  5. producto sin stock se expone como no comprable y no debe avanzar a checkout.
- **Fuera de alcance**: productos masivos, imagenes nuevas, cambios de pasarela, pedidos, borrado legacy o activacion de Stripe.

### ELS-27 - Errores y estados vacios comerciales
- **Estado**: `DONE`.
- **Objetivo**: controlar estados vacios, bloqueos y errores publicos para que el flujo comercial no parezca roto cuando falta stock, falla el pago local, falta producto o no existe un pedido.
- **Resultado**:
  1. existe helper frontend `estadosComercialesPedido` para traducir codigos/detalles tecnicos a mensajes humanos;
  2. checkout y recibo real muestran errores de stock/pago sin exponer `stock_no_disponible`, `simulado_local` ni detalles internos;
  3. el checkout ofrece salidas claras: volver a cesta y revisar disponibilidad;
  4. pedido no cargado muestra estado controlado con CTA a cuenta y exploracion;
  5. Botica Natural cubre seccion vacia, producto no encontrado y producto sin stock con salidas comerciales sobrias.
- **Fuera de alcance**: cambiar backend, pasarela, logica de negocio, legal/copy global o eliminar legacy demo.

### ELS-28 - Estabilidad visual de secciones comerciales
- **Estado**: `DONE`.
- **Objetivo**: unificar la presentacion visual y funcional de las secciones comerciales para que compartan estructura, jerarquia, grid, tarjetas, CTAs y estados.
- **Resultado**:
  1. existe configuracion comun de secciones comerciales en `seccionesComerciales.ts`;
  2. `SeccionComercialProductos` compone hero, bloque de catalogo, rail de filtros opcional, estado de error y grid compartido;
  3. `ListadoProductosSeccionComercial` reutiliza la misma tarjeta publica, disponibilidad, precio y acciones de carrito/ficha;
  4. `botica-natural`, `velas-e-incienso`, `minerales-y-energia` y `herramientas-esotericas` usan la misma composicion;
  5. Botica Natural conserva filtros; las otras secciones renderizan productos publicos por seccion sin duplicar JSX.
- **Fuera de alcance**: imagenes nuevas, backend, stock, pago, checkout, SEO nuevo o rediseño global.

### ELS-29 - Plan retirada legacy demo
- **Estado**: `DONE`.
- **Objetivo**: crear un plan tecnico para retirar gradualmente `/encargo`, `/pedido-demo`, `PedidoDemo` y `cuenta-demo` sin ejecutar la retirada todavia.
- **Resultado**:
  1. existe `docs/plan_retirada_legacy_demo.md`;
  2. el plan inventaria rutas, componentes, endpoints, modelos, tablas, migraciones, tests, datos persistidos y dependencias actuales;
  3. define fases A-G: ocultar navegacion publica, congelar escritura nueva, mantener lectura historica, migrar/exportar datos si procede, retirar endpoints, retirar modelos/migraciones solo cuando sea seguro y eliminar/mover tests legacy;
  4. cada fase incluye objetivo, precondiciones, cambios permitidos/prohibidos, tests obligatorios y rollback;
  5. el plan mantiene `V2-R10` bloqueado, no activa pagos reales y no declara legacy eliminado.
- **Fuera de alcance**: borrar codigo legacy, tocar rutas/modelos/migraciones/datos, cambiar frontend funcional o modificar tests.

### ELS-30 - Auditoria final automatizable
- **Estado**: `DONE`.
- **Objetivo**: consolidar el estado del ecommerce local simulado en una auditoria final documental y automatizable antes de presentacion u optimizacion.
- **Resultado**:
  1. existe `docs/auditoria_final_ecommerce_local_simulado.md`;
  2. existe `scripts/audit_ecommerce_local_simulado.py` con salida texto, `--json` y severidades `OK/WARNING/BLOCKER`;
  3. la auditoria agrega gate local, guardrail legacy, catalogo vendible, noindex, proveedor simulado, documentacion clave y bloqueo `V2-R10`;
  4. los tests de script cubren fixture valido sin blockers, ausencia de roadmap local, `V2-R10` desbloqueado, falta de adaptador simulado y legacy no congelado;
  5. la auditoria diferencia presentacion local de release/go-live real.
- **Fuera de alcance**: corregir todos los problemas detectados, tocar UX/pago/catalogo funcional, cerrar `V2-R10` o borrar legacy.

### ELS-31 - Recorrido de presentacion
- **Estado**: `DONE`.
- **Objetivo**: definir un recorrido de demo estable para presentar ecommerce local real con pago simulado sin fingir produccion.
- **Resultado**:
  1. existe `docs/guion_demo_ecommerce_local.md`;
  2. el guion cubre home, seccion comercial, ficha comprable, cesta, checkout, pago simulado, pedido, documento fiscal, cuenta real y backoffice;
  3. cada paso documenta ruta exacta, dato necesario, accion, resultado esperado, frase sugerida, riesgo y recuperacion;
  4. incluye que no decir en la demo y que si destacar;
  5. mantiene `/checkout`, `Pedido` y `/mi-cuenta` como recorrido principal y deja legacy fuera de la ruta de compra.
- **Fuera de alcance**: nuevas features, pago real, deploy, borrado legacy, videos/capturas o cambios funcionales.

### ELS-32 - Stripe reservado
- **Estado**: `DONE`.
- **Objetivo**: preparar el cambio futuro de `simulado_local` a `stripe` sin activar Stripe real ni romper el modo local.
- **Resultado**:
  1. existe `docs/pagos_modo_local_y_stripe.md`;
  2. el modo local mantiene `BOTICA_PAYMENT_PROVIDER=simulado_local` como default y no exige claves Stripe;
  3. `BOTICA_PAYMENT_PROVIDER=stripe` queda documentado como fase futura con precondiciones, pruebas y rollback;
  4. el gate local advierte si se ejecuta con `BOTICA_PAYMENT_PROVIDER=stripe` y bloquea proveedores desconocidos;
  5. tests cubren que local simulado no exige claves Stripe y que el gate detecta proveedor de entorno no local.
- **Fuera de alcance**: activar Stripe real, crear sesiones nuevas, tocar webhooks funcionales, checkout frontend, deploy o `V2-R10`.

### ELS-33 - Staging futuro
- **Estado**: `DONE documental`.
- **Objetivo**: preparar documentacion y checks minimos para un futuro entorno staging sin desplegar, activar Stripe ni desbloquear `V2-R10`.
- **Resultado**:
  1. existe `docs/preparacion_staging_ecommerce.md`;
  2. la guia distingue local, staging y produccion;
  3. documenta variables, servicios, base temporal, URLs, backup/restore drill, checks pre/post deploy y rollback;
  4. fija `simulado_local` como modo inicial permitido en staging y reserva Stripe sandbox para fase futura explicita;
  5. reafirma que esta preparacion no activa produccion, no activa pago real y no desbloquea `V2-R10`.
- **Fuera de alcance**: deploy, infraestructura Railway real, backup/restore real, cambios de settings productivos o cierre de go-live.

### ELS-34 - Auditoria dependencias demo/real
- **Estado**: `DONE`.
- **Objetivo**: auditar acoplamientos entre modulos demo legacy y modulos reales antes de seguir optimizando.
- **Resultado**:
  1. existe `docs/auditoria_dependencias_demo_real.md`;
  2. se corrigio el acoplamiento de `checkoutReal.ts` hacia `checkoutDemo`;
  3. el gate local bloquea imports demo desde checkout, pedido, cuenta y APIs frontend reales;
  4. `encargoConsulta` en checkout real queda como `WARNING` transitorio documentado;
  5. backend real permanece sin dependencia funcional de `PedidoDemo`/`CuentaDemo`.
- **Fuera de alcance**: borrar legacy, refactor grande de preseleccion, migrar datos, cambiar UX o tocar pagos funcionales.

### ELS-35 - Estado unico documental
- **Estado**: `DONE documental`.
- **Objetivo**: consolidar documentacion viva para evitar contradicciones entre fase local simulada, V2, demo legacy, Stripe reservado y `V2-R10` bloqueado.
- **Resultado**:
  1. `docs/90_estado_implementacion.md` incorpora lectura rapida para agentes;
  2. `docs/00_vision_proyecto.md`, `docs/02_alcance_y_fases.md`, `docs/10_checkout_y_flujos_ecommerce.md` y `docs/17_migracion_ecommerce_real.md` quedan normalizados como historico cuando hablan de demo;
  3. `docs/99_fuente_de_verdad.md` enlaza la fase local simulada dentro de la precedencia documental;
  4. `docs/roadmap_ecommerce_real_v2.md` aclara que Stripe en V2 no implica proveedor activo local ni go-live;
  5. no se toca codigo, no se cierra `V2-R10` y no se declara produccion lista.
- **Fuera de alcance**: borrar documentacion historica, ejecutar cambios externos, tocar codigo funcional o crear un roadmap nuevo.

### ELS-36 - Barrido de deuda menor
- **Estado**: `DONE documental`.
- **Objetivo**: auditar marcadores de deuda (`TODO`, `FIXME`, `HACK`, `temporal`, `demo`, `legacy`, `v1`, `coexistencia`, `pendiente`, `simulado`) sin abrir refactors grandes.
- **Resultado**:
  1. existe `docs/deuda_residual_ecommerce_local.md`;
  2. se clasifican los marcadores entre documental valido, legacy permitido, deuda menor corregida, deuda mayor documentada y blockers;
  3. se corrigen titulos duplicados de ELS-23/ELS-24 en este roadmap para evitar ambiguedad;
  4. no se toca codigo funcional, no se borra legacy, no se activa Stripe y no se cierra `V2-R10`;
  5. la deuda residual principal queda acotada a historico documentado, legacy controlado y el warning conocido de `encargoConsulta` en checkout real.
- **Fuera de alcance**: eliminar `PedidoDemo`, reescribir preseleccion compartida, migraciones destructivas, refactors grandes o cambios de UX.

### ELS-37 - Entorno local reproducible
- **Estado**: `DONE`.
- **Objetivo**: definir y verificar el contrato minimo para levantar ecommerce local simulado en otra maquina/agente sin ambiguedad.
- **Resultado**:
  1. existe `.env.example` raiz con variables locales sin secretos y `BOTICA_PAYMENT_PROVIDER=simulado_local`;
  2. existe `docs/checklist_entorno_local_ecommerce.md` con variables, instalacion, migraciones, bootstrap, arranque, compra local, gates, tests y troubleshooting;
  3. existe `scripts/check_entorno_local_ecommerce.py` con salida humana, `--json` y `--fail-on`;
  4. el script valida archivos clave, variables ejemplo, scripts frontend criticos, checklist y proveedor de pago del entorno sin conectarse a servicios externos;
  5. tests unitarios cubren fixture valido, ausencia de `.env.example`, scripts frontend incompletos, proveedor `stripe` como warning y salida JSON.
- **Fuera de alcance**: dockerizar, crear instalador pesado, ejecutar deploy, activar Stripe, crear base SQLite versionada o arrancar servidores persistentes.

### ELS-38 - Mapa final de rutas
- **Estado**: `DONE`.
- **Objetivo**: auditar y documentar rutas publicas, privadas, transaccionales, API, backoffice y legacy para separar flujo real, pago simulado y demo legacy.
- **Resultado**:
  1. existe `docs/mapa_rutas_ecommerce_local.md`;
  2. el mapa clasifica rutas por proposito, estado, indexacion, flujo, tests/gate y posibilidad de CTA principal;
  3. el gate local exige que el mapa exista y contenga rutas canonicas, legacy, noindex y guardrails;
  4. no se corrigen rutas ni metadata porque el contrato SEO/gate vigente ya protege noindex y CTAs principales;
  5. Stripe queda reservado y `V2-R10` sigue bloqueado.
- **Fuera de alcance**: borrar rutas legacy, cambiar routing, activar pago real, tocar backend funcional o crear nuevas paginas.

## 6. Cierre y matriz final de hitos
| Hito | Estado final | Evidencia principal | Nota |
|---|---|---|---|
| ELS-01 | DONE documental | Roadmap local y `docs/90_estado_implementacion.md` | Reencauce sin codigo. |
| ELS-02 | DONE | Navegacion/CTAs hacia `/checkout` | Legacy conserva salida secundaria. |
| ELS-03 | DONE | Adaptador `pagos_simulados.py` y wiring | Stripe reservado. |
| ELS-04 | DONE | Confirmacion simulada y post-pago real | No sustituye webhook Stripe. |
| ELS-05 | DONE | UI checkout/recibo para pago simulado | Sin `/encargo` como compra. |
| ELS-06 | DONE | Stock preventivo backend | Post-pago sigue como segunda barrera. |
| ELS-07 | DONE | Disponibilidad visible en ficha/cesta/checkout | Sin reserva temporal. |
| ELS-08 | DONE | Cesta real limpia | Lineas no comprables no pasan a checkout. |
| ELS-09 | DONE | `/mi-cuenta` como cuenta visible | `cuenta-demo` sigue legacy. |
| ELS-10 | DONE | Pedido, recibo y documento fiscal real local | Sin lenguaje demo en flujo real. |
| ELS-11 | DONE | Backoffice operativo | Django Admin priorizado. |
| ELS-12 | DONE | Postventa/reembolso simulado manual | Sin llamadas a Stripe. |
| ELS-13 | DONE | SEO/noindex operativo | Transaccionales fuera de indexacion. |
| ELS-14 | DONE | Copy comercial limpio | Simulacion solo donde corresponde. |
| ELS-15 | DONE | Gate local ecommerce | No es release gate productivo. |
| ELS-16 | DONE | Bootstrap local comprable | Idempotente y sin binarios. |
| ELS-17 | DONE | Regresion compra local | Sin dependencia de `PedidoDemo`. |
| ELS-18 | DONE | Rendimiento frontend | Sin cambio de negocio. |
| ELS-19 | DONE | Accesibilidad/usabilidad | Flujo compra mas usable. |
| ELS-20 | DONE | Seguridad local | Stripe no se activa accidentalmente. |
| ELS-21 | DONE | Analitica local privada | Sin terceros ni PII. |
| ELS-22 | DONE | Legal/confianza minima | No sustituye revision legal. |
| ELS-23 | DONE | Guardrail legacy demo | Legacy congelado, no eliminado. |
| ELS-24 | DONE documental | Guia operativa local | Comandos documentados. |
| ELS-25 | DONE documental | Checklist presentacion | No promete produccion. |
| ELS-26 | DONE | Catalogo vendible | Contrato verificable. |
| ELS-27 | DONE | Estados vacios/errores | UI sin codigos tecnicos publicos. |
| ELS-28 | DONE | Estabilidad visual secciones | Componentes comunes. |
| ELS-29 | DONE documental | Plan retirada legacy | No ejecuta retirada. |
| ELS-30 | DONE | Auditoria final automatizable | Sin blockers de cierre local. |
| ELS-31 | DONE documental | Guion demo local | Presentacion defendible. |
| ELS-32 | DONE | Stripe futuro preparado | Default local sigue `simulado_local`. |
| ELS-33 | DONE documental | Preparacion staging futuro | No desbloquea `V2-R10`. |
| ELS-34 | DONE | Auditoria dependencias demo/real | Warning transitorio documentado. |
| ELS-35 | DONE documental | Estado unico documental | Precedencia normalizada. |
| ELS-36 | DONE documental | Deuda residual documentada | Sin blockers locales nuevos. |
| ELS-37 | DONE | Entorno local reproducible | `.env.example` y check local. |
| ELS-38 | DONE | Mapa final de rutas | Guardrail en gate local. |

No quedan hitos `PARTIAL`, `BLOCKED` ni `NOT_STARTED` dentro de este roadmap. Los limites aceptados pasan a proximos hitos fuera de alcance.

## 7. Proximos hitos fuera de este roadmap
1. **Staging**: preparar entorno externo temporal con URLs reales, base segura y rollback documentado.
2. **Stripe sandbox**: activar solo en fase explicita posterior, con claves de prueba, webhooks y pruebas de no regresion.
3. **E2E browser real**: cubrir el recorrido completo con servidor backend/frontend levantado y datos locales reproducibles.
4. **Revision legal profesional**: validar condiciones, privacidad, devoluciones, fiscalidad y claims antes de cualquier venta real.
5. **Backup/restore real**: ejecutar drill verificable sobre base no productiva antes de salida externa.
6. **Go-live `V2-R10`**: permanece bloqueado hasta completar staging, smoke post-deploy, backup/restore y validacion externa.
7. **Retirada fisica de legacy demo**: ejecutar `docs/plan_retirada_legacy_demo.md` por fases, sin mezclar con el cierre local.

## 8. Guias operativas locales
La guia practica vigente para trabajar en local sin romper el flujo principal es `docs/operativa_ecommerce_local_simulado.md`.

La checklist reproducible de entorno local es `docs/checklist_entorno_local_ecommerce.md` y se valida con `python scripts/check_entorno_local_ecommerce.py`.

El mapa final de rutas publicas, privadas, transaccionales, API y legacy es `docs/mapa_rutas_ecommerce_local.md`.

La checklist final para decidir si el proyecto esta presentable como portfolio/ecommerce local simulado es `docs/checklist_presentacion_ecommerce_local.md`.

El plan de retirada progresiva de legacy demo es `docs/plan_retirada_legacy_demo.md`.

La auditoria final automatizable es `docs/auditoria_final_ecommerce_local_simulado.md` y se ejecuta con `python scripts/audit_ecommerce_local_simulado.py`.

El guion de presentacion estable es `docs/guion_demo_ecommerce_local.md`.

La preparacion del modo Stripe futuro vive en `docs/pagos_modo_local_y_stripe.md`.

La preparacion del futuro entorno staging, sin desplegar ni desbloquear `V2-R10`, vive en `docs/preparacion_staging_ecommerce.md`.

La auditoria de dependencias demo vs real vive en `docs/auditoria_dependencias_demo_real.md`.

El informe de deuda residual y marcadores permitidos vive en `docs/deuda_residual_ecommerce_local.md`.

La fuente rapida de estado unico para agentes vive en `docs/90_estado_implementacion.md` seccion "Lectura rapida para agentes" y la precedencia documental en `docs/99_fuente_de_verdad.md`.

## 9. Relacion con V2-R10
Esta fase no desbloquea el go-live externo. `V2-R10` sigue bloqueado por dependencias externas de despliegue, smoke post-deploy y restore drill real.

El objetivo de este roadmap es cerrar credibilidad y operacion local sin activar pagos reales ni presentar el entorno local como salida productiva.
