# Ciclo 1 — Núcleo herbal navegable

## 1. Propósito del documento
Definir el contrato operativo del **Ciclo 1** como primer ciclo de implementación real del producto, transformando el roadmap maestro en un alcance cerrado, ejecutable y verificable.

Este documento fija qué se construye ahora, qué se bloquea para ciclos posteriores y qué evidencia mínima debe existir para declarar cierre real del ciclo.

## 2. Objetivo oficial del Ciclo 1
Entregar la **primera columna vertebral funcional pública** de La Botica de la Bruja Lore: una experiencia herbal usable, navegable y creíble que permita descubrir, comprender y evaluar la oferta base sin compra real activa.

El ciclo existe para convertir la fase documental cerrada (Ciclo 0) en un producto demostrable, manteniendo foco en la línea herbal como puerta principal y evitando abrir frentes prematuros de ecommerce completo o ritualidad profunda.

## 3. Entregable visible mínimo
Al cierre del ciclo debe existir una experiencia pública navegable de extremo a extremo, centrada en lo herbal, con este recorrido mínimo defendible:

1. Home orientadora con entrada clara al universo herbal.
2. Navegación inicial hacia la línea herbal.
3. Listado herbal navegable con estructura útil de descubrimiento.
4. Ficha de conocimiento herbal (planta) con valor editorial aplicable.
5. Ficha o resolución comercial mínima de producto herbal conectada a la capa de conocimiento.
6. Relaciones básicas visibles entre **Planta**, **Producto** e **Intención** para habilitar descubrimiento guiado inicial.

> **Decisión consolidada**: el entregable del ciclo no es “frontend parcial”, sino un **núcleo herbal navegable completo en términos de experiencia mínima**.

## 4. Alcance obligatorio del ciclo
### 4.1 Alcance funcional obligatorio
- Home pública operativa, narrativa y funcional, con prioridad de usabilidad sobre ornamentación mística.
- Entrada explícita a la línea herbal como flujo principal.
- Listado herbal navegable y coherente con taxonomías definidas.
- Vista de detalle de planta (plano editorial/conocimiento) utilizable para decisión.
- Vista de detalle o resolución mínima de producto herbal (plano comercial) conectada sin fusionar entidades.
- Capa inicial de descubrimiento guiado por intención dentro del ámbito herbal.
- Enlaces y relaciones base Planta ↔ Producto ↔ Intención con semántica consistente.

### 4.2 Alcance de datos y operación mínima
- Estructura de datos y administración mínima necesarias para sostener las entidades y relaciones incluidas en el entregable visible.
- Backoffice v1 limitado a lo imprescindible para cargar, editar y publicar contenido/objetos del núcleo herbal de este ciclo.

### 4.3 Alcance de calidad mínima operativa
- Primer nivel operativo de quality gate activo para código del ciclo.
- Validación funcional navegable del flujo público definido.
- Trazabilidad de implementación respecto a decisiones de dominio y arquitectura vigentes.

> **Propuesta operativa inicial razonada**: en este ciclo, el backoffice se limita a operaciones esenciales de alta/edición/publicación para no desviar esfuerzo hacia personalizaciones avanzadas que no impacten el entregable público mínimo.

## 5. Fuera de alcance del ciclo
Queda explícitamente fuera del Ciclo 1, aunque esté definido en documentos maestros:

- Ecommerce demo completo (carrito + checkout demo de extremo a extremo).
- Capa profunda de rituales conectados y su navegación extendida.
- Cuenta de usuario con valor funcional.
- Calendario ritual y reglas avanzadas asociadas.
- Refinamientos avanzados no desbloqueantes de UX/UI.
- Expansión editorial completa más allá de la base necesaria para el núcleo herbal.
- Complejidad de backoffice no imprescindible para sostener el entregable del ciclo.

Regla de control: cualquier ítem no necesario para cumplir el entregable visible mínimo se considera sobrealcance en Ciclo 1.

## 6. Dependencias y prerequisitos
### 6.1 Dependencia previa satisfecha (Ciclo 0)
El Ciclo 0 habilita este ciclo al dejar cerrados:
- visión y posicionamiento de producto,
- alcance por fases y secuencia oficial,
- modelo de dominio y separación de entidades,
- arquitectura técnica y stack,
- decisiones técnicas no negociables,
- marco de calidad y criterio de DONE,
- estado real consolidado de “documentado pero no implementado”.

### 6.2 Dependencias internas del Ciclo 1
- La home no se considera cerrada sin navegación efectiva hacia línea herbal.
- El listado no se considera cerrado sin detalle consultable de planta y resolución comercial mínima.
- El descubrimiento por intención no se considera cerrado sin relaciones navegables Planta/Producto/Intención.
- El entregable público no se considera cerrable sin base mínima operativa en backoffice para sostener contenido y catálogo del ciclo.

## 7. Criterios de aceptación funcional
Se acepta funcionalmente el ciclo solo si se verifican todos los puntos:

1. Un usuario nuevo puede entrar por home y llegar a la línea herbal sin fricción crítica.
2. Puede recorrer un listado herbal y abrir detalles relevantes.
3. Puede consultar al menos una ficha de planta útil para entender contexto/uso no médico.
4. Puede consultar al menos una resolución comercial mínima de producto herbal asociada.
5. Percibe relaciones básicas por intención que guían exploración (sin requerir capa ritual profunda).
6. La experiencia global se percibe coherente, seria y demostrable como primera capacidad real de producto.

## 8. Criterios de aceptación técnicos mínimos
Se acepta técnicamente el ciclo solo si se verifica:

1. Respeto explícito de Clean Architecture y separación de capas.
2. Mantenimiento de separación de dominio `Planta` vs `Producto` y plano editorial/comercial.
3. Persistencia y diseño alineados con enfoque PostgreSQL-first (SQLite solo soporte local).
4. Tests obligatorios de la implementación del ciclo y validaciones funcionales básicas automatizadas según capacidad implementada.
5. Quality gate activo en nivel mínimo operativo definido para Ciclo 1 (no diferido al final del proyecto).
6. Ausencia de artefactos prohibidos y cumplimiento de normas i18n del repositorio.
7. Evidencia de que lo marcado como DONE está implementado y no solo diseñado/documentado.

> **Propuesta operativa inicial razonada**: el nivel mínimo de quality gate para este ciclo debe incluir, al menos, ejecución de tests requeridos del núcleo implementado y validaciones automáticas básicas de calidad estática acordes al stack.

## 9. Riesgos y desviaciones a evitar
Riesgos principales de deriva en Ciclo 1:

- Convertir el ciclo en “maqueta visual” sin columna vertebral funcional.
- Abrir checkout demo o cuenta de usuario antes de consolidar núcleo herbal.
- Sobredimensionar rituales y desplazar el foco de la puerta herbal.
- Mezclar semánticamente `Planta` y `Producto` por atajos de modelado/presentación.
- Elevar complejidad de backoffice más allá de lo necesario para sostener el entregable público.
- Declarar avance por volumen de trabajo y no por capacidad navegable validada.

Medida de control: toda decisión de alcance en este ciclo se evalúa por su contribución directa al entregable visible mínimo.

## 10. Evidencias de cierre del ciclo
Para declarar Ciclo 1 como cerrado debe existir evidencia verificable de:

1. Recorrido público navegable completo del núcleo herbal definido.
2. Relaciones visibles y funcionales entre planta, producto e intención en alcance mínimo.
3. Operación mínima de carga/edición/publicación en backoffice para sostener el recorrido.
4. Validación funcional documentada del flujo principal del ciclo.
5. Evidencia técnica de cumplimiento arquitectónico, tests exigidos y quality gate mínimo activo/aprobado.
6. Registro explícito de límites respetados (qué no se implementó por pertenecer a ciclos posteriores).

Sin estas evidencias, el ciclo permanece en progreso y no puede marcarse DONE.

## 11. Qué debe ocurrir al cerrar el ciclo
Al cierre efectivo del Ciclo 1 deben ejecutarse estas acciones de gobernanza:

1. Actualizar `docs/90_estado_implementacion.md` con estado real implementado y evidencia de cierre.
2. Mantener `docs/14_roadmap.md` como secuencia macro, sin reabrir decisiones ya congeladas.
3. Abrir planificación operativa del siguiente ciclo (Ciclo 2) únicamente sobre capacidades realmente cerradas en Ciclo 1.
4. Generar roadmap de prompts de implementación del Ciclo 1 como trazabilidad de ejecución (si no existía), distinguiendo claramente lo ya implementado de lo pendiente.
5. Registrar cualquier desvío de alcance aprobado y su justificación para evitar arrastre de deuda de producto.

> **Congelación de alcance del ciclo**: Ciclo 1 queda formalmente definido como “núcleo herbal navegable” y no se amplía con capacidades de checkout completo, cuenta de usuario, calendario ritual ni ritualidad profunda.
