export type ArcanoTarot = {
  slug: string;
  nombre: string;
  numero: number;
  imagen: string;
  palabrasClave: [string, string, string];
  significadoBreve: string;
  descripcionEditorial: string;
  categoria: "arcanos_mayores";
};

export const METADATA_TAROT = {
  title: "Tarot | Arcanos y guía editorial de La Botica de la Bruja Lore",
  description:
    "Explora los arcanos mayores con una lectura editorial breve: símbolos, palabras clave y contexto ritual para integrar tarot en tu recorrido en La Botica de la Bruja Lore.",
};

export const INTRO_TAROT = {
  etiqueta: "Archivo simbólico de la botica",
  titulo: "Tarot para orientar intención, ritmo y mirada",
  descripcion:
    "Esta sección reúne dibujos de arcanos mayores para consultar su pulso simbólico antes de elegir hierbas, rituales o una ruta editorial más amplia.",
  nota: "Contenido editorial y contemplativo: sin promesas milagrosas ni lectura predictiva personalizada.",
  fondoPergamino: "/fondos/fondo_pergamino.webp",
};

export const ARCANOS_TAROT: ArcanoTarot[] = [
  crearArcano("elmago", "El Mago", 1, ["inicio", "habilidad", "voluntad"], "Convierte intención en acción concreta.", "Representa la capacidad de ordenar recursos y comenzar con foco. En la botica sugiere pasar de la idea a un gesto práctico: preparar altar, elegir mezcla o abrir un encargo con criterio."),
  crearArcano("lapapisa", "La Papisa", 2, ["intuición", "silencio", "observación"], "Invita a escuchar antes de actuar.", "Marca una pausa fértil para leer señales internas y contexto externo. Es un arcano útil cuando conviene estudiar una guía editorial antes de tomar una decisión de compra."),
  crearArcano("laemperatriz", "La Emperatriz", 3, ["creación", "abundancia", "cuidado"], "Nutre procesos en crecimiento.", "Sugiere cultivar belleza útil y continuidad. En clave botica inspira combinaciones sensoriales que acompañen hábitos cotidianos con suavidad y presencia."),
  crearArcano("elemperador", "El Emperador", 4, ["estructura", "límite", "orden"], "Aporta dirección y marco estable.", "Propone definir reglas simples para sostener una práctica ritual. Ayuda a convertir inspiración difusa en una rutina clara y comercialmente viable."),
  crearArcano("elhierofante", "El Hierofante", 5, ["tradición", "aprendizaje", "linaje"], "Conecta con conocimiento transmitido.", "Recuerda que la sabiduría herbal y simbólica se construye en comunidad. Favorece estudiar fundamentos antes de experimentar combinaciones más complejas."),
  crearArcano("elcarro", "El Carro", 7, ["avance", "determinación", "rumbo"], "Empuja a mover energía con decisión.", "Arcano de desplazamiento y conquista de objetivos. En esta web invita a pasar de la exploración a una selección concreta de productos o rituales conectados."),
  crearArcano("lajusticia", "La Justicia", 8, ["equilibrio", "claridad", "consecuencia"], "Ordena decisiones con criterio.", "Pide evaluar intención, recursos y expectativas de forma honesta. Es útil para ajustar una cesta ritual evitando exceso o acumulación sin propósito."),
  crearArcano("elhermitaño", "El Ermitaño", 9, ["búsqueda", "pausa", "sabiduría"], "Alumbra un camino interior más lento.", "Favorece la revisión profunda y el estudio paciente. Señala momentos donde conviene reducir estímulos y privilegiar herramientas simples y duraderas."),
  crearArcano("laruedadelafortuna", "La Rueda de la Fortuna", 10, ["ciclo", "cambio", "ritmo"], "Recuerda que todo proceso se mueve.", "Habla de giros y oportunidades cuando se respeta el tiempo del ciclo. Puede orientar la elección de rituales de transición o cierre de etapa."),
  crearArcano("lafuerza", "La Fuerza", 11, ["templanza", "coraje", "presencia"], "Domina impulso con calma activa.", "No se impone por violencia, sino por coherencia interna. En la botica apunta a sostener prácticas pequeñas pero constantes con una energía amable."),
  crearArcano("elcolgado", "El Colgado", 12, ["entrega", "perspectiva", "renuncia"], "Invierte la mirada para ver distinto.", "Sugiere detener automatismos y aceptar una pausa estratégica. Es un buen símbolo para revisar una intención antes de insistir en la misma fórmula."),
  crearArcano("lamuerte", "La Muerte", 13, ["transformación", "cierre", "renovación"], "Cierra una etapa para abrir otra.", "Arcano de transición profunda: soltar lo que ya no sostiene el proceso. En clave editorial impulsa depuración y nuevos comienzos con bases más claras."),
  crearArcano("eldiablo", "El Diablo", 15, ["apego", "deseo", "sombra"], "Hace visible lo que condiciona.", "Invita a reconocer hábitos, excesos o dependencias simbólicas. Ayuda a recuperar libertad de elección con límites conscientes y lenguaje honesto."),
  crearArcano("latorre", "La Torre", 16, ["ruptura", "revelación", "desprendimiento"], "Rompe estructuras que ya no sirven.", "Aunque intenso, este arcano libera espacio para construir mejor. En recorrido comercial-editorial sugiere simplificar y volver al núcleo de la intención."),
  crearArcano("laestrella", "La Estrella", 17, ["esperanza", "inspiración", "calma"], "Aporta claridad suave tras la crisis.", "Representa confianza renovada y apertura sensible. Favorece rituales de descanso, gratitud y reconexión con una visión más limpia."),
  crearArcano("laluna", "La Luna", 18, ["sensibilidad", "símbolo", "profundidad"], "Navega zonas ambiguas con intuición.", "Muestra lo velado y lo emocionalmente cambiante. Sugiere acompañar procesos con escritura, observación y prácticas de cuidado del entorno."),
  crearArcano("elsol", "El Sol", 19, ["vitalidad", "verdad", "expansión"], "Ilumina y simplifica la experiencia.", "Arcano de claridad compartida y energía disponible. En la botica inspira elecciones directas, luminosas y fáciles de sostener en el tiempo."),
  crearArcano("eljuicio", "El Juicio", 20, ["llamado", "despertar", "integración"], "Convoca a responder con conciencia.", "Invita a revisar el recorrido completo y elegir desde madurez. Es útil al cerrar un ciclo ritual y definir el próximo paso comercial o editorial."),
  crearArcano("elmundo", "El Mundo", 21, ["culminación", "integridad", "apertura"], "Integra aprendizajes en una visión completa.", "Señala cierre armónico y disponibilidad para un nuevo comienzo. En esta sección simboliza una práctica ritual coherente, estética y aplicable."),
];

export function obtenerArcanoPorSlug(slug: string): ArcanoTarot | null {
  return ARCANOS_TAROT.find((arcano) => arcano.slug === slug) ?? null;
}

export function resolverSlugInicialTarot(slug?: string): string {
  if (!slug) {
    return ARCANOS_TAROT[0]?.slug ?? "";
  }

  return obtenerArcanoPorSlug(slug)?.slug ?? ARCANOS_TAROT[0]?.slug ?? "";
}

function crearArcano(
  slug: string,
  nombre: string,
  numero: number,
  palabrasClave: [string, string, string],
  significadoBreve: string,
  descripcionEditorial: string,
): ArcanoTarot {
  return {
    slug,
    nombre,
    numero,
    imagen: `/fondos/${slug}.webp`,
    palabrasClave,
    significadoBreve,
    descripcionEditorial,
    categoria: "arcanos_mayores",
  };
}
