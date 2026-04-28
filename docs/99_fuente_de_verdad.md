# 99 — Fuente de verdad y precedencia documental del repositorio

## 1. Propósito del documento
Fijar la constitución documental de `botica_bruja_lore`: qué documentos son oficiales, qué tipo de verdad gobierna cada uno, en qué orden deben leerse y cómo resolver conflictos sin ambigüedad.

## 2. Qué se considera fuente de verdad en este repositorio
La fuente de verdad principal está en `docs/`. `AGENTS.md` es contrato operativo resumido para ejecución del agente, subordinado al marco documental base.

### Estado unico vigente 2026-04-28
Para cualquier trabajo nuevo de ecommerce, la lectura operativa vigente es:
- `docs/90_estado_implementacion.md` manda como estado factual rapido.
- `docs/roadmap_ecommerce_local_simulado.md` manda sobre la fase local actual.
- `docs/roadmap_ecommerce_real_v2.md` mantiene `V2-R10` bloqueado para go-live externo.
- `docs/10_checkout_y_flujos_ecommerce.md` y textos de demo anteriores son historicos normalizados: describen legacy, no el flujo principal.

## 3. Núcleo documental oficial del proyecto
El núcleo oficial y vigente está formado por:
1. `docs/00_vision_proyecto.md`
2. `docs/02_alcance_y_fases.md`
3. `docs/05_modelo_de_dominio_y_entidades.md`
4. `docs/07_arquitectura_tecnica.md`
5. `docs/08_decisiones_tecnicas_no_negociables.md`
6. `docs/90_estado_implementacion.md`
7. `AGENTS.md`

Sin estos documentos no se autoriza propuesta de implementación ni evaluación de DONE.

## 4. Jerarquía y precedencia entre documentos
La precedencia se aplica por ámbito y, en empate, por especificidad:

1. **Estado real implementado**: `docs/90_estado_implementacion.md` manda sobre cualquier texto que sugiera avance no ejecutado.
2. **Normas técnicas no negociables**: `docs/08_decisiones_tecnicas_no_negociables.md` manda sobre cualquier propuesta de diseño, implementación o prompt.
3. **Dominio y entidades**: `docs/05_modelo_de_dominio_y_entidades.md` manda sobre modelado conceptual, límites semánticos y relaciones de negocio.
4. **Arquitectura y stack**: `docs/07_arquitectura_tecnica.md` manda sobre organización técnica, capas y decisiones arquitectónicas.
5. **Alcance, ciclos y estados de trabajo**: `docs/02_alcance_y_fases.md` manda sobre prioridad, secuencia de entrega y estado por ciclo.
6. **Visión estratégica e identidad de producto**: `docs/00_vision_proyecto.md` manda sobre propósito, dirección y coherencia narrativa/comercial.
7. **Contrato operativo del agente**: `AGENTS.md` guía comportamiento operativo diario, pero no sustituye ni contradice la documentación base.

## 5. Qué tipo de verdad gobierna cada documento
- `docs/00_vision_proyecto.md`: verdad estratégica (qué es el proyecto y hacia dónde va).
- `docs/02_alcance_y_fases.md`: verdad de alcance y ejecución incremental (qué se hará, cuándo y en qué estado).
- `docs/05_modelo_de_dominio_y_entidades.md`: verdad de dominio (qué conceptos existen y cómo se separan).
- `docs/07_arquitectura_tecnica.md`: verdad arquitectónica (cómo se construye técnicamente).
- `docs/08_decisiones_tecnicas_no_negociables.md`: verdad normativa obligatoria (qué no se negocia).
- `docs/90_estado_implementacion.md`: verdad factual de implementación (qué está hecho realmente).
- `AGENTS.md`: verdad operativa resumida para conducta del agente (cómo actuar al ejecutar trabajo).

## 6. Orden de lectura obligatorio para agentes
Antes de proponer cambios, prompts o planes, el agente debe leer en este orden:
1. `docs/00_vision_proyecto.md`
2. `docs/02_alcance_y_fases.md`
3. `docs/05_modelo_de_dominio_y_entidades.md`
4. `docs/07_arquitectura_tecnica.md`
5. `docs/08_decisiones_tecnicas_no_negociables.md`
6. `docs/90_estado_implementacion.md`
7. Si la tarea toca ecommerce, `docs/roadmap_ecommerce_local_simulado.md`
8. Si la tarea toca go-live/deploy, `docs/roadmap_ecommerce_real_v2.md` y `docs/preparacion_staging_ecommerce.md`
9. `AGENTS.md`

Sin esta lectura previa, cualquier propuesta queda fuera de norma.

## 7. Cómo resolver conflictos documentales
Regla operativa obligatoria:
1. Identificar el ámbito del conflicto (estrategia, alcance, dominio, arquitectura, norma técnica o estado real).
2. Aplicar el documento que gobierna ese ámbito según la sección 4.
3. Si persiste tensión, priorizar el documento **más específico** del ámbito.
4. Si hay contradicción entre “planificado” y “hecho”, prevalece `docs/90_estado_implementacion.md`.
5. Registrar trazabilidad de la decisión citando documentos y sección aplicada.
6. No ejecutar implementación hasta cerrar la contradicción documental.

## 8. Relación entre `docs/` y `AGENTS.md`
- `docs/` define la verdad de producto, dominio, arquitectura, normas y estado.
- `AGENTS.md` traduce esa verdad a reglas de operación cotidiana del agente.
- `AGENTS.md` no puede rebajar ni reemplazar decisiones fijadas en `docs/`.
- Si `AGENTS.md` y `docs/` divergen, se corrige la ejecución para alinearla con `docs/` y se documenta la incidencia.

## 9. Reglas de uso para prompts, revisiones y ciclos
1. Todo prompt debe ser trazable al núcleo documental oficial.
2. Ningún prompt puede declarar como implementado algo no respaldado por `docs/90_estado_implementacion.md`.
3. Toda revisión debe validar: coherencia estratégica, alcance del ciclo, respeto de dominio, cumplimiento arquitectónico y normas no negociables.
4. No mezclar múltiples objetivos de ciclo en una única entrega sin justificación explícita.
5. No marcar DONE sin evidencia verificable y consistencia con estado real.

## 10. Implicaciones operativas para el repositorio
- Este documento es la referencia de precedencia para resolver dudas de gobernanza documental.
- Cualquier nueva documentación debe declararse compatible con esta jerarquía.
- Toda propuesta futura (prompt, plan o implementación) debe citar el documento rector de su ámbito.
- Este marco cierra la gobernanza documental del Ciclo 0 y habilita evolución por ciclos sin contradicciones entre definición y ejecución.
