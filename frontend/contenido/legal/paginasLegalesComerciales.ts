import { ConfiguracionContactoPublico } from "../catalogo/canalContactoPublico";

export type EnlaceLegalComercial = {
  texto: string;
  href: string;
};

export type SeccionLegalComercial = {
  titulo: string;
  parrafos: string[];
  lista?: string[];
};

export type CtaLegalComercial = {
  texto: string;
  href: string;
};

export type PaginaLegalComercial = {
  ruta: string;
  etiquetaFooter: string;
  titulo: string;
  introduccion: string;
  aviso: string;
  secciones: SeccionLegalComercial[];
  ctaPrincipal: CtaLegalComercial;
  ctaSecundaria: CtaLegalComercial;
  metadata: {
    title: string;
    description: string;
  };
};

export const ENLACES_LEGALES_FOOTER: EnlaceLegalComercial[] = [
  { texto: "Condiciones del encargo", href: "/condiciones-encargo" },
  { texto: "Envíos y preparación", href: "/envios-y-preparacion" },
  { texto: "Privacidad y contacto", href: "/privacidad" },
];

export const PAGINAS_LEGALES_COMERCIALES: PaginaLegalComercial[] = [
  {
    ruta: "/condiciones-encargo",
    etiquetaFooter: "Condiciones del encargo",
    titulo: "Condiciones mínimas del encargo artesanal",
    introduccion:
      "Estas condiciones explican cómo funciona la solicitud de encargo en esta demo: qué podemos preparar, cómo se confirma y qué límites existen hoy.",
    aviso:
      "La web canaliza solicitudes y consultas. No hay compra ni pago automático integrado en este ciclo.",
    secciones: [
      {
        titulo: "Qué es un encargo en La Botica",
        parrafos: [
          "El catálogo orienta y muestra piezas base, pero algunas combinaciones requieren revisión manual para confirmar disponibilidad, formato y encaje con tu intención.",
          "Un encargo es una solicitud artesanal: recibimos tu contexto, proponemos una opción y cerramos por contacto directo si ambas partes están de acuerdo.",
        ],
      },
      {
        titulo: "Cómo se confirma",
        parrafos: [
          "Después de completar el flujo de /encargo, se genera un resumen listo para compartir por canal de contacto real cuando esté configurado.",
          "La confirmación final no ocurre dentro del sitio. Depende del intercambio posterior y de una validación humana del encargo.",
        ],
        lista: [
          "La solicitud puede ajustarse antes de cerrar una propuesta.",
          "Sin confirmación por canal real, el encargo no se considera aceptado.",
          "No usamos el formulario como pago ni como reserva automática.",
        ],
      },
      {
        titulo: "Alcance y uso responsable",
        parrafos: [
          "Los contenidos de producto y ritual son editoriales/comerciales. No sustituyen asesoramiento profesional ni constituyen promesas de resultado.",
          "La botica mantiene una comunicación prudente: sin claims médicos, sin promesas milagrosas y con expectativas realistas.",
        ],
      },
    ],
    ctaPrincipal: { texto: "Preparar solicitud de encargo", href: "/encargo" },
    ctaSecundaria: { texto: "Volver al catálogo", href: "/colecciones" },
    metadata: {
      title: "Condiciones del encargo artesanal | La Botica de la Bruja Lore",
      description:
        "Guía mínima y honesta de cómo se gestiona un encargo artesanal: solicitud, confirmación manual y límites de esta demo comercial.",
    },
  },
  {
    ruta: "/envios-y-preparacion",
    etiquetaFooter: "Envíos y preparación",
    titulo: "Envíos y preparación de piezas",
    introduccion:
      "Te contamos cómo trabajamos tiempos y revisiones en una operativa artesanal, sin prometer plazos cerrados que hoy no podemos sostener desde la web.",
    aviso:
      "Los tiempos son orientativos y se confirman de forma individual durante el contacto real posterior a la solicitud.",
    secciones: [
      {
        titulo: "Ritmo de preparación artesanal",
        parrafos: [
          "La selección y armado de piezas se hace en lotes pequeños. Esto cuida coherencia y calidad, pero implica tiempos variables según el tipo de encargo.",
          "El sitio no calcula plazos automáticos ni ventanas de entrega garantizadas en tiempo real.",
        ],
      },
      {
        titulo: "Qué puede influir en los tiempos",
        parrafos: [
          "Antes de confirmar un encargo revisamos disponibilidad de materiales, complejidad de la combinación y prioridad de solicitudes activas.",
        ],
        lista: [
          "Si pides una adaptación personalizada, puede requerir una revisión adicional.",
          "Las piezas con varios componentes suelen necesitar más preparación.",
          "La confirmación por canal real marca el inicio del proceso operativo.",
        ],
      },
      {
        titulo: "Incidencias y devoluciones",
        parrafos: [
          "Si detectas una incidencia en una pieza confirmada, compártela por el mismo canal de contacto para revisar el caso con contexto y evidencia.",
          "No publicamos una política cerrada de devoluciones automáticas en esta demo. Cada situación se estudia con criterio artesanal y comunicación transparente.",
        ],
      },
    ],
    ctaPrincipal: { texto: "Solicitar encargo con contexto", href: "/encargo" },
    ctaSecundaria: { texto: "Explorar ruta herbal", href: "/hierbas" },
    metadata: {
      title: "Envíos y preparación | La Botica de la Bruja Lore",
      description:
        "Explicación honesta sobre tiempos de preparación, confirmación manual e incidencias en una operativa artesanal sin checkout automático.",
    },
  },
  {
    ruta: "/privacidad",
    etiquetaFooter: "Privacidad y contacto",
    titulo: "Privacidad y contacto básico",
    introduccion:
      "Esta página resume cómo tratamos la información compartida en solicitudes y qué canales públicos existen realmente en cada momento.",
    aviso:
      "Solo usamos los datos del formulario para responder consultas o preparar encargos. No afirmamos procesos técnicos que esta demo no implementa.",
    secciones: [
      {
        titulo: "Datos que pedimos y para qué",
        parrafos: [
          "En /encargo solicitamos nombre, canal de contacto y contexto de intención para poder entender la consulta y dar continuidad comercial.",
          "La información se utiliza de forma acotada para gestionar la solicitud. No se presenta como sistema de alta de cuenta ni de compra automática.",
        ],
      },
      {
        titulo: "Canal de contacto disponible",
        parrafos: [
          "El resumen del encargo puede compartirse por email o WhatsApp si existe configuración pública válida.",
          "Cuando no hay configuración pública, la web lo indica y ofrece una salida honesta: copiar el resumen para usar tu canal habitual.",
        ],
      },
      {
        titulo: "Límites actuales",
        parrafos: [
          "No ofrecemos en esta fase un panel de gestión de consentimientos, autenticación avanzada ni flujos jurídicos exhaustivos.",
          "Si necesitas aclaraciones sobre tu solicitud, utiliza el canal real que se haya habilitado en el momento del contacto.",
        ],
      },
    ],
    ctaPrincipal: { texto: "Ir al flujo de encargo", href: "/encargo" },
    ctaSecundaria: { texto: "Conocer La Botica", href: "/la-botica" },
    metadata: {
      title: "Privacidad y contacto | La Botica de la Bruja Lore",
      description:
        "Resumen claro sobre uso básico de datos en solicitudes de encargo y disponibilidad real de canales de contacto públicos.",
    },
  },
];

export function obtenerPaginaLegalComercial(ruta: string): PaginaLegalComercial {
  const pagina = PAGINAS_LEGALES_COMERCIALES.find((item) => item.ruta === ruta);

  if (!pagina) {
    throw new Error(`Página legal/comercial no encontrada para la ruta: ${ruta}`);
  }

  return pagina;
}

export function describirCanalPublico(configuracion: ConfiguracionContactoPublico): string {
  const canales: string[] = [];

  if (configuracion.email) {
    canales.push(`email (${configuracion.email})`);
  }

  if (configuracion.whatsapp) {
    canales.push(`WhatsApp (${configuracion.whatsapp})`);
  }

  if (canales.length === 0) {
    return "Actualmente no hay un canal público configurado en la web; usa el resumen del encargo como base para continuar por tu canal habitual.";
  }

  return `Canal público activo en esta demo: ${canales.join(" y ")}.`;
}
