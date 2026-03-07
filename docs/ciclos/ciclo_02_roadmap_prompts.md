# Ciclo 02 — Roadmap oficial de prompts de implementación

## 1. Propósito del documento
Este documento define la **secuencia oficial de prompts** para ejecutar el Ciclo 2 (“rituales conectados sobre núcleo herbal usable”) de forma controlada, trazable y verificable.

Su función es convertir el alcance del ciclo en unidades atómicas de implementación, evitando prompts gigantes, solapes entre capas y deriva funcional. Este roadmap no implementa código ni sustituye los prompts: establece el orden, dependencias, entregables parciales y reglas de paso entre prompts.

## 2. Principios de secuenciación del Ciclo 2
1. **Núcleo herbal como base prioritaria**: rituales se incorporan como capa conectada que refuerza descubrimiento herbal, no como línea competidora.
2. **Dependencias primero, exposición después**: modelado y contratos antes de API, API antes de interfaz.
3. **Vertical slices pequeños y verificables**: cada prompt debe dejar valor real navegable o base técnica validable.
4. **Arquitectura sin atajos**: mantener separación estricta dominio/aplicación/infraestructura/presentación.
5. **Integración progresiva**: primero rituales mínimos, después cruces bidireccionales ritual ↔ planta ↔ producto.
6. **Quality gate incremental**: exigencia desde el primer prompt con código, cierre formal en prompt final.
7. **Control de alcance contractual**: no abrir checkout, cuenta, calendario ritual protagonista ni editorialidad profunda.

## 3. Número total de prompts y criterio de partición
### Decisión consolidada
El Ciclo 2 se ejecutará **prompt a prompt** con control de estado y evidencia verificable en cada paso.

### Propuesta operativa inicial razonada
Se fijan **8 prompts** como secuencia oficial. Este número es razonable porque:
- cubre todas las áreas mínimas del ciclo (dominio, persistencia/API, backoffice, frontend, integración cruzada y cierre de calidad);
- evita granularidad excesiva (que ralentiza y fragmenta valor) y evita prompts demasiado grandes (que mezclan responsabilidades);
- permite mantener dependencia clara entre capas sin bloquear entregas parciales.

## 4. Secuencia oficial de prompts del ciclo

| Prompt | Tipo | Objetivo principal |
|---|---|---|
| Prompt 1 | Base dominio/aplicación ritual conectada | Definir caso de uso y contratos de aplicación para rituales conectados al núcleo herbal, sin exposición pública aún. |
| Prompt 2 | Persistencia e infraestructura mínima | Implementar repositorios/adaptadores mínimos de ritual e intención con relaciones clave (ritual-planta-producto). |
| Prompt 3 | API pública ritual mínima | Exponer listado/ficha ritual y cruces básicos para consumo frontend, preservando semántica de entidades. |
| Prompt 4 | Backoffice mínimo ritual | Habilitar alta/edición/publicación ritual y gestión de relaciones esenciales en Django Admin customizado. |
| Prompt 5 | Frontend listado ritual | Incorporar entrada y listado de rituales en navegación pública sin desplazar la puerta herbal. |
| Prompt 6 | Frontend ficha ritual conectada | Construir ficha ritual con contexto, intención y enlaces útiles hacia plantas/productos. |
| Prompt 7 | Integración bidireccional herbal ↔ ritual | Completar enlaces de retorno desde planta/producto hacia rituales relacionados y cohesionar navegación cruzada. |
| Prompt 8 | Tests, hardening y quality gate de ciclo | Consolidar cobertura del alcance, no regresión herbal y validación de criterios técnicos/funcionales de cierre. |

## 5. Dependencias y entregables parciales por prompt

### Prompt 1 — Base dominio/aplicación ritual conectada
- **Dependencias previas**: núcleo herbal Ciclo 1 estable; decisiones de dominio congeladas vigentes.
- **Entregable parcial**: contratos de aplicación y modelo de interacción ritual-intención-planta-producto definidos y trazables.
- **Riesgo si se altera orden**: API o UI sin base semántica consistente, con riesgo de acoplamiento a framework.

### Prompt 2 — Persistencia e infraestructura mínima
- **Dependencias previas**: Prompt 1 completado.
- **Entregable parcial**: persistencia operativa mínima de rituales y relaciones críticas conforme a contratos de aplicación.
- **Riesgo si se altera orden**: duplicación de reglas en API/frontend y deuda técnica por rehacer integración.

### Prompt 3 — API pública ritual mínima
- **Dependencias previas**: Prompt 2 completado.
- **Entregable parcial**: endpoints de listado/ficha ritual y cruces mínimos listos para consumo.
- **Riesgo si se altera orden**: frontend bloqueado o forzado a mocks inestables fuera de contrato real.

### Prompt 4 — Backoffice mínimo ritual
- **Dependencias previas**: Prompt 2 completado (y coherencia con contratos de Prompt 1).
- **Entregable parcial**: operación editorial mínima para crear/publicar rituales y mantener relaciones esenciales.
- **Riesgo si se altera orden**: datos de demo inconsistentes o dependientes de carga manual fuera de flujo objetivo.

### Prompt 5 — Frontend listado ritual
- **Dependencias previas**: Prompt 3 completado.
- **Entregable parcial**: vista de listado ritual navegable e integrada al mapa de navegación sin romper prioridad herbal.
- **Riesgo si se altera orden**: listado no confiable, semántica desalineada o UX sin datos reales.

### Prompt 6 — Frontend ficha ritual conectada
- **Dependencias previas**: Prompt 5 completado (y API de ficha disponible desde Prompt 3).
- **Entregable parcial**: ficha ritual funcional con enlaces contextuales hacia plantas/productos.
- **Riesgo si se altera orden**: experiencia parcial inconexa y pérdida del objetivo de “rituales conectados”.

### Prompt 7 — Integración bidireccional herbal ↔ ritual
- **Dependencias previas**: Prompts 5 y 6 completados.
- **Entregable parcial**: navegación cruzada de ida y vuelta entre rituales, plantas y productos.
- **Riesgo si se altera orden**: descubrimiento unilateral, bajo valor comercial/editorial y cierre funcional débil.

### Prompt 8 — Tests, hardening y quality gate de ciclo
- **Dependencias previas**: Prompts 1–7 completados.
- **Entregable parcial**: evidencia verificable de no regresión, cobertura del alcance y gate técnico del ciclo aprobado.
- **Riesgo si se altera orden**: cierre sin garantías objetivas y deuda de calidad trasladada al siguiente ciclo.

## 6. Criterios de paso entre prompts
Para avanzar de un prompt al siguiente deben cumplirse, como mínimo, estos criterios:

1. **Entregable del prompt actual verificado** contra su objetivo declarado.
2. **No regresión visible del núcleo herbal** en navegación y semántica.
3. **Respeto de fronteras arquitectónicas** (sin mezclar dominio/aplicación/infraestructura/presentación).
4. **Tests del alcance del prompt en verde** (nivel y tipo según componente tocado).
5. **Estado documental actualizado** del prompt: definido → en progreso → done con evidencia.
6. **Sin sobrealcance introducido** respecto a límites contractuales del ciclo.

Regla operativa: si un prompt no cumple criterios de paso, no se inicia el siguiente.

## 7. Qué no entra en este roadmap
No deben existir prompts en Ciclo 2 para:
- checkout completo o endurecimiento transaccional de compra;
- cuenta de usuario/perfiles/autenticación avanzada;
- calendario ritual como feature principal (ReglaCalendario sigue desacoplada);
- ritualidad profunda o enciclopedia editorial extensa;
- packs complejos no imprescindibles;
- expansiones SEO avanzadas fuera del mínimo de rutas rituales navegables.

Estos temas se mantienen fuera para evitar sobrealcance y proteger el cierre defendible del ciclo.

## 8. Riesgos de secuencia a evitar
1. **Adelantar frontend antes de contratos/API estables**: produce retrabajo y deuda de integración.
2. **Abrir backoffice tardíamente**: compromete carga/curación de contenido para demo funcional.
3. **Posponer integración bidireccional al “final opcional”**: debilita la propuesta de valor del ciclo.
4. **Concentrar tests solo al cierre**: eleva riesgo de regresión acumulada y bloqueos tardíos.
5. **Convertir rituales en eje principal de entrada**: rompe decisión de producto de continuidad herbal-first.
6. **Mezclar correspondencias/calendario como foco**: desvía el ciclo del objetivo contractual vigente.

## 9. Decisiones congeladas y aspectos evolutivos
### Decisiones congeladas (no reabribles en este roadmap)
- Objetivo del ciclo: **rituales conectados sobre núcleo herbal usable**.
- `Ritual` se modela como entidad conectada, no como categoría de producto.
- `Intencion` mantiene rol principal de descubrimiento; `Correspondencia` permanece secundaria.
- `ReglaCalendario` no protagoniza este ciclo y se mantiene separada.
- Navegación bidireccional ritual ↔ planta ↔ producto es requisito del cierre de ciclo.

### Aspectos evolutivos permitidos (sin romper alcance)
- Ajuste fino de detalle técnico dentro de cada prompt manteniendo su objetivo.
- Subdivisión interna de tareas de implementación dentro de un prompt, sin crear prompts adicionales fuera de la secuencia oficial.
- Endurecimiento gradual de quality gate desde primeros prompts con código, con cierre formal en Prompt 8.

Este roadmap queda como base oficial para solicitar y ejecutar de forma secuencial: “Prompt 1 del Ciclo 2”, “Prompt 2 del Ciclo 2”, …, “Prompt 8 del Ciclo 2”.
