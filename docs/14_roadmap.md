# 14 — Roadmap oficial de implementación

## 2. Propósito del documento
Este roadmap define la **secuencia oficial de construcción** de La Botica de la Bruja Lore tras el cierre documental del Ciclo 0. Su función es traducir la estrategia y el alcance ya definidos a un orden operativo ejecutable, con foco en hitos visibles, dependencias reales y criterios de avance verificables.

Este documento:
- no sustituye `docs/02_alcance_y_fases.md`, sino que lo operacionaliza;
- no es backlog atómico ni lista de prompts;
- sí fija qué se construye primero, qué se bloquea hasta madurez previa y qué evidencia mínima habilita el siguiente ciclo.

## 3. Punto de partida real del proyecto
Estado consolidado de partida:
- Ciclo 0 documental cerrado (visión, alcance, dominio, arquitectura, decisiones no negociables, UX, checkout demo objetivo, backoffice, SEO/editorial, quality gate y gobernanza documental).
- Producto funcional aún no implementado.
- Próximo paso correcto: **arranque de implementación real en Ciclo 1 (núcleo herbal navegable)**.
- Enfoque vigente: **portfolio-first, business-ready**, demo sólida y creíble sin compra real activa.

Implicación operativa: no procede abrir más documentación base estructural; procede ejecutar construcción incremental con evidencia técnica y funcional por ciclo.

## 4. Principios rectores del roadmap
1. **Secuencia por valor demostrable**: cada ciclo debe cerrar una capacidad navegable, visualizable y defendible.
2. **Dependencias explícitas**: no se abre un frente cuya base funcional o editorial no exista.
3. **Primero núcleo, luego sofisticación**: la línea herbal es puerta de entrada prioritaria.
4. **Progresión de experiencia**: evolución natural → místico, sin romper usabilidad comercial.
5. **Dominio congelado donde aplica**: `Planta` y `Producto` permanecen separados; editorial y comercial no se fusionan.
6. **Calidad incremental obligatoria**: el quality gate se despliega progresivamente, pero no se pospone al final.
7. **Foco y control de alcance**: evitar paralelismo excesivo y evitar megaproyecto monolítico.
8. **Evidencia antes de avance**: no se declara progreso de ciclo sin pruebas de capacidad real.

## 5. Secuencia oficial de implementación
Secuencia macro oficial (fuerte):
1. **Ciclo 0 (cerrado)** — Base documental, arquitectura y contratos.
2. **Ciclo 1** — Núcleo herbal navegable.
3. **Ciclo 2** — Rituales conectados sobre base herbal ya usable.
4. **Ciclo 3** — Ecommerce demo completo (carrito, checkout demo y operación editorial-comercial coherente).
5. **Ciclo 4** — Cuenta de usuario con valor real.
6. **Ciclo 5** — Calendario ritual y capa editorial diferencial avanzada.
7. **Ciclo 6** — Refinamiento portfolio / business-ready.

Regla de secuencia: el orden anterior se considera contractual para evitar inversión de prioridades. Se permiten ajustes internos de cada ciclo, pero no saltos que rompan esta progresión.

## 6. Hitos y entregables visibles por ciclo
### Ciclo 0 — Base documental, arquitectura y contratos (cerrado)
- **Hito macro**: marco de verdad y gobierno del proyecto listo para ejecutar.
- **Entregable visible**: corpus documental troncal coherente y trazable.

### Ciclo 1 — Núcleo herbal navegable
- **Hito macro**: primera experiencia funcional pública creíble.
- **Entregables visibles mínimos**:
  - catálogo herbal navegable;
  - detalle de ficha útil para decisión de usuario;
  - primeras relaciones de descubrimiento guiado dentro del ámbito herbal;
  - base editorial/comercial coherente sin sobrecargar funcionalidades secundarias.

### Ciclo 2 — Rituales conectados
- **Hito macro**: puente funcional entre conocimiento herbal y rituales.
- **Entregables visibles mínimos**:
  - navegación entre plantas/productos y rituales relacionados;
  - narrativa de uso coherente con restricciones comunicativas del proyecto;
  - relaciones de dominio explícitas sin mezclar `Ritual` con `ReglaCalendario`.

### Ciclo 3 — Ecommerce demo completo
- **Hito macro**: flujo de compra demo de extremo a extremo, demostrable.
- **Entregables visibles mínimos**:
  - carrito usable;
  - checkout demo completo sin cobro real;
  - integración operacional mínima entre catálogo, decisión y cierre de flujo;
  - backoffice v1 (Django Admin customizado) con utilidad operativa inicial.

### Ciclo 4 — Cuenta de usuario con valor
- **Hito macro**: continuidad de experiencia post-descubrimiento/compra.
- **Entregables visibles mínimos**:
  - autenticación y área de usuario orientadas a utilidad;
  - historial/favoritos/recordatorios con valor real en demo;
  - no introducir cuenta “cosmética” sin beneficio funcional.

### Ciclo 5 — Calendario ritual y capa editorial diferencial
- **Hito macro**: diferenciación avanzada sobre base comercial ya sólida.
- **Entregables visibles mínimos**:
  - calendario ritual funcional basado en reglas explícitas;
  - profundización editorial (glosario/correspondencias y similares) sin romper claridad de navegación;
  - conexión trazable entre contenido editorial y rutas de valor del producto.

### Ciclo 6 — Refinamiento portfolio / business-ready
- **Hito macro**: cierre de demo madura, coherente y presentable en contexto portfolio + negocio.
- **Entregables visibles mínimos**:
  - refinamiento UX/UI transversal;
  - robustez operativa y consistencia narrativa global;
  - cierre de gaps críticos de calidad, mantenibilidad y demostrabilidad.

## 7. Dependencias, prerequisitos y bloqueos
### Dependencias fuertes por ciclo
- **C1 depende de C0**: sin base documental cerrada no hay inicio controlado de implementación.
- **C2 depende de C1**: no se conectan rituales sin núcleo herbal navegable y semánticamente estable.
- **C3 depende de C1+C2**: no se habilita flujo ecommerce demo completo sin catálogo creíble ni contexto de descubrimiento suficiente.
- **C4 depende de C3**: la cuenta de usuario requiere base transaccional demo y señales de continuidad reales.
- **C5 depende de C2+C4**: calendario y capa editorial avanzada requieren relaciones rituales maduras y contexto de usuario útil.
- **C6 depende de C1–C5**: refinamiento final solo sobre capacidades ya demostrables.

### Prerequisitos transversales de avance
- Evidencia funcional navegable del ciclo en curso.
- Trazabilidad de límites de dominio y capa por capacidad implementada.
- Nivel de quality gate aplicable al ciclo activo, con tendencia de endurecimiento progresivo.

### Bloqueos explícitos
- Ausencia de evidencia funcional mínima del ciclo anterior.
- Intento de abrir múltiples frentes no acoplados a hito de ciclo.
- Deriva de dominio (especialmente mezcla `Planta`/`Producto` o `Ritual`/`ReglaCalendario`).

## 8. Qué no debe adelantarse
Hasta consolidar C1–C3, quedan fuera de prioridad:
- calendario ritual como frente principal;
- cuenta avanzada de usuario sin base ecommerce demo suficientemente creíble;
- extras visuales o microinteracciones de lucimiento sin impacto en capacidad vertical;
- expansiones de catálogo/SEO de baja palanca frente a deuda de flujo principal;
- optimizaciones prematuras que no cambian la demostrabilidad del ciclo.

Regla operativa: lo atractivo pero no habilitador se pospone; primero se construye lo que desbloquea valor acumulativo.

## 9. Criterios de paso entre hitos/ciclos
No se avanza de ciclo sin evidencia de salida del ciclo actual en cuatro planos:
1. **Funcional**: capacidad navegable y demostrable según hito definido.
2. **Arquitectónico**: respeto de Clean Architecture y separación de capas/dominio.
3. **Calidad**: tests exigibles y quality gate del ciclo superado (según nivel progresivo comprometido).
4. **Trazabilidad**: estado actualizado en documentación de implementación y decisiones relevantes registradas.

Criterio ejecutivo: “definido” o “diseñado” no habilita avance; solo habilita avance lo implementado y validado.

## 10. Riesgos de secuencia a evitar
1. **Parálisis por documentación adicional** tras cierre de Ciclo 0.
2. **Sobrealcance temprano** (abrir cuenta, calendario y extras antes del núcleo herbal/ecommerce demo).
3. **Desalineación valor-secuencia** (priorizar complejidad técnica sobre capacidad visible).
4. **Calidad al final como parche** en lugar de adopción incremental por ciclo.
5. **Falsa sensación de avance** por cerrar piezas horizontales aisladas sin experiencia completa.
6. **Fragmentación de foco** por demasiados frentes paralelos sin dependencia directa.
7. **Drift de dominio** que rompa decisiones congeladas.

## 11. Decisiones congeladas y aspectos evolutivos
### Decisiones congeladas (no renegociables en este roadmap)
- Construcción por ciclos con capacidad cerrada y demostrable.
- Secuencia fuerte C1→C6 definida en este documento.
- Prioridad inmediata de C1 como siguiente paso correcto.
- Prelación del núcleo herbal sobre capacidades avanzadas.
- Separación de dominio `Planta`/`Producto` y separación editorial/comercial.
- Separación `Ritual`/`ReglaCalendario`.
- Quality gate obligatorio con despliegue progresivo (no opcional).
- Enfoque portfolio-first, business-ready como criterio de priorización.

### Aspectos evolutivos (refinables sin romper secuencia fuerte)
- microhitos internos dentro de cada ciclo;
- granularidad de entregables parciales de un mismo ciclo;
- nivel exacto de endurecimiento del quality gate por iteración;
- orden fino de capacidades secundarias dentro de C2–C6;
- ajustes de alcance menor por validación, siempre manteniendo dependencias y prioridad estructural.

---
Este roadmap queda como base maestra para futuros documentos `docs/ciclos/ciclo_XX.md` y para la generación de prompts de implementación uno a uno, preservando foco, coherencia arquitectónica y avance defendible.
