# Auditoria final ecommerce local simulado

## 1. Resumen ejecutivo
El proyecto esta presentable como **ecommerce local real con pago simulado** para portfolio, demo tecnica y evaluacion de producto en entorno local.

No esta listo para go-live externo. Esta auditoria no desbloquea `V2-R10`, no activa Stripe, no certifica cumplimiento legal/fiscal definitivo y no sustituye pruebas E2E reales sobre staging.

Flujo principal auditado:

`catalogo -> ficha -> cesta -> checkout -> pago simulado -> pedido real -> documento -> cuenta -> backoffice`

## 2. Que esta listo
- Reencauce documental y fuente de verdad local.
- `/checkout` como flujo principal de compra.
- `Pedido` real con recibo en `/pedido/[id_pedido]`.
- Pasarela `simulado_local` por puerto/adaptador.
- Confirmacion local de pago simulado reutilizando post-pago real.
- Validacion preventiva de stock antes de pago.
- Disponibilidad visible en ficha, cesta y checkout.
- Cesta real limpia: solo lineas comprables avanzan a checkout.
- `/mi-cuenta` como cuenta visible principal.
- Backoffice Django Admin para operar pedidos reales.
- Documento fiscal HTML accesible desde pedido/cuenta.
- SEO/noindex para rutas transaccionales, privadas y legacy.
- Copy publico sin lenguaje tecnico de demo como flujo principal.
- Gate local y regresiones por capas.
- Bootstrap local de datos comprables.
- Checklist de presentacion y guia operativa local.
- Plan de retirada progresiva de legacy demo.

## 3. Que sigue simulado
- Solo la pasarela de pago local: `BOTICA_PAYMENT_PROVIDER=simulado_local`.
- La confirmacion de pago local no cobra en banco ni Stripe.
- No hay webhook simulado completo ni PSP externo activo.
- La numeracion/fiscalidad avanzada no debe presentarse como facturacion legal final.
- No hay staging externo ni smoke post-deploy real validado por esta auditoria.

## 4. Que sigue legacy
- `/encargo`: consulta personalizada/manual secundaria.
- `/pedido-demo` y `/pedido-demo/[id_pedido]`: historico/controlado.
- `cuenta-demo`: historico/controlado, fuera de navegacion principal.
- `PedidoDemo` y `CuentaDemo`: compatibilidad legacy, tests y lectura historica.

La retirada debe seguir `docs/plan_retirada_legacy_demo.md`. El legacy no esta eliminado.

## 5. Que bloquea go-live real
1. `V2-R10` sigue `BLOCKED`.
2. Stripe real no esta activado ni probado.
3. Falta staging con variables separadas.
4. Falta smoke post-deploy sobre URLs reales.
5. Falta backup/restore real fuera del repo.
6. Falta revision legal profesional.
7. Falta E2E browser completo sobre servidores reales.
8. Falta estrategia productiva de seguridad, observabilidad y operacion.

## 6. Riesgos tecnicos
- El entorno local acumula muchas piezas; conviene ejecutar gate y regresion antes de cada demo.
- Los warnings de legacy son aceptables solo mientras esten documentados y aislados.
- La retirada de modelos/migraciones demo requiere backup/exportacion y fase propia.
- El build frontend puede mostrar avisos esperados si el backend local no esta levantado.
- El flujo no debe reusar DTOs, endpoints ni persistencia demo en nuevas capacidades.

## 7. Riesgos UX
- Si faltan datos locales o stock, el ecommerce puede parecer vacio o bloqueado.
- `/encargo` debe mantenerse como consulta secundaria; si se presenta como compra normal, se degrada la narrativa de ecommerce real.
- El pago simulado debe explicarse como pago de prueba local, no como demo general de la tienda.
- Antes de presentar, conviene recorrer home, secciones, ficha, cesta, checkout, pedido, cuenta y admin.

## 8. Riesgos legales/comerciales
- No prometer produccion real, cobro real, cumplimiento legal final ni facturacion legal completa.
- No hacer claims medicos, curativos, milagrosos o de resultado garantizado.
- Las paginas de confianza son realistas para demo/local, no sustituyen revision legal profesional.
- El documento fiscal HTML conserva alcance local y no debe venderse como PDF fiscal definitivo.

## 9. Riesgos de datos y stock
- El bootstrap local debe ejecutarse si no hay productos comprables.
- Stock preventivo bloquea falta de inventario antes de pago, pero post-pago sigue como segunda barrera.
- No hay reserva temporal de stock; concurrencia real queda pendiente.
- Las secciones abiertas deben mantener minimos de catalogo vendible.

## 10. Calidad de tests
- Hay regresion backend/frontend por capas para compra local simulada.
- El gate local cubre ruta principal, pasarela simulada, noindex, legacy guardrail y bloqueo `V2-R10`.
- La auditoria final automatizable agrega documentacion clave, gate local, catalogo vendible, checklist, regresion y legacy congelado.
- No sustituye E2E browser completo ni pruebas sobre entorno externo.

## 11. Auditoria automatizable
Comando texto:

```powershell
python scripts/audit_ecommerce_local_simulado.py
```

Comando JSON:

```powershell
python scripts/audit_ecommerce_local_simulado.py --json
```

Endurecer warnings:

```powershell
python scripts/audit_ecommerce_local_simulado.py --fail-on warning
```

Interpretacion:
- `OK`: contrato local satisfecho.
- `WARNING`: riesgo conocido o legacy controlado; se puede presentar si se explica.
- `BLOCKER`: no presentar ni seguir optimizando como si estuviera cerrado hasta corregir.

Diferencia con release gate real:
- Esta auditoria valida presentacion local y coherencia de fase.
- No ejecuta deploy, no prueba URLs externas, no valida backup/restore real y no activa pagos reales.

## 12. Checklist de presentacion
Antes de mostrar a terceros:
1. Ejecutar `scripts/audit_ecommerce_local_simulado.py`.
2. Ejecutar `scripts/check_ecommerce_local_simulado.py`.
3. Preparar datos con bootstrap local si hace falta.
4. Recorrer compra local completa.
5. Mostrar limites: pago simulado, Stripe reservado, legacy deprecado, no go-live.
6. Registrar blockers/warnings en la tabla de `docs/checklist_presentacion_ecommerce_local.md`.

## 13. Siguiente roadmap recomendado
1. Resolver cualquier `BLOCKER` de auditoria.
2. Ejecutar revision visual manual desktop/mobile del recorrido completo.
3. Abrir fase A real de retirada legacy solo si la presentacion local ya esta estable.
4. Preparar staging separado para reabrir `V2-R10`.
5. Incorporar Stripe sandbox en fase explicita, sin mezclarlo con la retirada legacy.
6. Ejecutar E2E browser y smoke externo cuando exista infraestructura.
7. Completar revision legal/fiscal profesional antes de cualquier produccion real.
