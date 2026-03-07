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
- Estado de definición estratégica/documental: **alto y consistente (Ciclo 0 cerrado a nivel documental)**.
- Estado de implementación funcional de producto: **no iniciado**.
- Backend: **no implementado**.
- Frontend: **no implementado**.
- Backoffice/admin: **no implementado**.
- Checkout demo: **no implementado**.
- Calendario ritual: **no implementado**.
- Quality gate: **definido como regla no negociable, despliegue operativo completo aún pendiente**.

Resumen ejecutivo de estado real: el proyecto dispone de base documental suficiente para iniciar ejecución por ciclos, pero todavía no existe producto funcional navegable.

## 5. Estado por capacidades
| Capacidad | Estado actual | Ciclo asociado | Evidencia / referencia | Notas operativas |
|---|---|---|---|---|
| Base documental del proyecto | DONE | Ciclo 0 | `docs/00_vision_proyecto.md`, `docs/02_alcance_y_fases.md`, `docs/05_modelo_de_dominio_y_entidades.md`, `docs/07_arquitectura_tecnica.md`, `docs/08_decisiones_tecnicas_no_negociables.md` | DONE documental. No implica implementación funcional. |
| Contrato operativo del agente (`AGENTS.md`) | DONE | Ciclo 0 | `AGENTS.md` | Contrato operativo presente y alineado con reglas del proyecto. |
| Modelo `Planta` vs `Producto` | DONE | Ciclo 0 | `docs/05_modelo_de_dominio_y_entidades.md`, `docs/08_decisiones_tecnicas_no_negociables.md` | DONE solo como decisión de dominio/documentación. Implementación pendiente. |
| Taxonomías e intenciones base | DEFINIDO | Ciclo 1 | `docs/05_modelo_de_dominio_y_entidades.md`, `docs/02_alcance_y_fases.md` | Definición cerrada; sin artefacto funcional implementado. |
| Núcleo herbal navegable | PLANIFICADO | Ciclo 1 | `docs/02_alcance_y_fases.md` (Ciclo 1) | Primera capacidad funcional visible a construir. |
| Ficha de hierba con sinergias | PLANIFICADO | Ciclo 1–2 | `docs/02_alcance_y_fases.md`, `docs/05_modelo_de_dominio_y_entidades.md` | Requiere base herbal + relaciones editoriales curadas. |
| Rituales conectados | PLANIFICADO | Ciclo 2 | `docs/02_alcance_y_fases.md`, `docs/05_modelo_de_dominio_y_entidades.md` | Debe mantener separación `Ritual`/`ReglaCalendario`. |
| Packs y regalos | PLANIFICADO | Ciclo 2–3 | `docs/02_alcance_y_fases.md`, `docs/05_modelo_de_dominio_y_entidades.md` | Integración progresiva en narrativa comercial guiada. |
| Checkout demo | PLANIFICADO | Ciclo 3 | `docs/02_alcance_y_fases.md` | Sin cobro real; demostrable y coherente con demo ecommerce. |
| Login / invitado | PLANIFICADO | Ciclo 3–4 | `docs/02_alcance_y_fases.md` | Modo invitado en demo + posterior capa de cuenta con valor. |
| Historial de pedidos demo | PLANIFICADO | Ciclo 4 | `docs/02_alcance_y_fases.md`, `docs/05_modelo_de_dominio_y_entidades.md` | Asociado a cuenta con utilidad real, no formalidad técnica. |
| Favoritos | PLANIFICADO | Ciclo 4 | `docs/02_alcance_y_fases.md`, `docs/05_modelo_de_dominio_y_entidades.md` | Capacidad de continuidad de descubrimiento/compra. |
| Recordatorios | PLANIFICADO | Ciclo 4–5 | `docs/02_alcance_y_fases.md`, `docs/05_modelo_de_dominio_y_entidades.md` | Vinculado a valor de cuenta y temporalidad editorial. |
| Calendario ritual | PLANIFICADO | Ciclo 5 | `docs/02_alcance_y_fases.md`, `docs/05_modelo_de_dominio_y_entidades.md` | Debe implementarse sobre `ReglaCalendario` separada de `Ritual`. |
| Glosario / correspondencias | PLANIFICADO | Ciclo 5 | `docs/02_alcance_y_fases.md`, `docs/05_modelo_de_dominio_y_entidades.md` | Capa editorial diferencial sin romper usabilidad principal. |
| Backoffice / admin usable | PLANIFICADO | Ciclo 3 (base) y refinamiento en ciclos posteriores | `docs/07_arquitectura_tecnica.md`, `docs/02_alcance_y_fases.md` | Django Admin customizado v1 previsto, aún no implementado. |
| Quality gate operativo | PLANIFICADO | Transversal (activación progresiva desde primeros ciclos con código) | `docs/08_decisiones_tecnicas_no_negociables.md`, `docs/02_alcance_y_fases.md` | Regla documental cerrada; despliegue operativo completo pendiente. |
| Roadmaps por ciclo | DONE | Ciclo 0 | `docs/02_alcance_y_fases.md` | Marco de ciclos 0–6 definido y trazable. |
| Prompting de implementación uno a uno | DEFINIDO | Ciclo 0 (regla), ejecución desde Ciclo 1 | `docs/02_alcance_y_fases.md`, `AGENTS.md` | Regla de operación definida; ejecución práctica aún pendiente. |

## 6. Último ciclo cerrado
- **Ciclo cerrado**: Ciclo 0.
- **Tipo de cierre**: documental/estructural (no funcional).
- **Evidencia de cierre**:
  - visión y marco estratégico definidos,
  - alcance y ciclos definidos,
  - dominio y entidades núcleo definidos,
  - arquitectura técnica definida,
  - decisiones técnicas no negociables definidas,
  - contrato operativo del agente disponible.
- **Advertencia explícita**: este cierre no equivale a backend/frontend/admin implementados.

## 7. Ciclo actual
- **Ciclo actual operativo**: pre-inicio de Ciclo 1 (sin implementación en curso).
- **Estado**: pendiente de arranque de implementación real por capacidad vertical.
- **Condición de entrada recomendada**:
  1. seleccionar una capacidad única del Ciclo 1,
  2. emitir prompt de implementación atómico,
  3. ejecutar con evidencia verificable,
  4. actualizar este tablero sin mezclar definido con implementado.

## 8. Deuda conocida
1. No existe código funcional de producto (backend, frontend, admin).
2. No existe capacidad navegable demo en entorno ejecutable.
3. No hay quality gate operativo desplegado sobre pipeline real (aunque su obligatoriedad está definida).
4. No hay trazabilidad de evidencias de ejecución porque aún no comenzó implementación.

## 9. Próximos movimientos recomendados
1. Iniciar **Ciclo 1** con una capacidad vertical mínima y visible del núcleo herbal navegable.
2. Priorizar una primera entrega demostrable: listado herbal + detalle básico coherente con separación `Planta`/`Producto`.
3. Definir criterio de evidencia de DONE para esa capacidad (navegabilidad + validación + cumplimiento arquitectónico).
4. Activar quality gate mínimo aplicable al primer código para no diferir control de calidad.
5. Actualizar este documento tras cada cierre de capacidad, manteniendo separación entre estado documental y estado funcional.

---

**Regla de lectura rápida del estado actual:**
- Lo documental base (Ciclo 0) está cerrado.
- El producto funcional todavía no está implementado.
- El siguiente paso correcto es comenzar implementación incremental por capacidades del Ciclo 1.
