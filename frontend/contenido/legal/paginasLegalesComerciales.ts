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
  seo: {
    indexable: boolean;
    incluirEnSitemap: boolean;
    esEstrategica: boolean;
  };
};

export const ENLACES_LEGALES_FOOTER: EnlaceLegalComercial[] = [
  { texto: "Condiciones de compra", href: "/condiciones-encargo" },
  { texto: "Envios y preparacion", href: "/envios-y-preparacion" },
  { texto: "Devoluciones", href: "/devoluciones" },
  { texto: "Privacidad", href: "/privacidad" },
  { texto: "Contacto", href: "/contacto" },
];

export const PAGINAS_LEGALES_COMERCIALES: PaginaLegalComercial[] = [
  {
    ruta: "/condiciones-encargo",
    etiquetaFooter: "Condiciones de compra",
    titulo: "Condiciones de compra y consulta artesanal",
    introduccion:
      "Estas condiciones resumen como funciona la compra local, que limites tienen los productos y cuando una seleccion debe pasar a consulta personalizada.",
    aviso:
      "Contenido informativo para entorno local con pago de prueba. No sustituye una revision legal profesional ni declara la tienda lista para go-live externo.",
    secciones: [
      {
        titulo: "Compra local y pago de prueba",
        parrafos: [
          "El checkout principal crea pedidos reales dentro del sistema local y usa una confirmacion de pago de prueba, sin conexion a pasarela bancaria real.",
          "La conexion con pasarela real queda reservada para una fase posterior y no se activa desde estas condiciones.",
        ],
      },
      {
        titulo: "Consulta personalizada",
        parrafos: [
          "Las piezas artesanales, combinaciones fuera de catalogo o solicitudes con contexto especial pueden requerir orientacion humana antes de convertirse en compra.",
          "La ruta de consulta no sustituye al checkout: funciona como canal secundario para casos que no encajan en el pedido catalogado.",
        ],
        lista: [
          "La solicitud puede ajustarse antes de cerrar una propuesta.",
          "Sin confirmacion clara, una consulta no se considera pedido aceptado.",
          "No usamos la consulta como reserva automatica de stock.",
        ],
      },
      {
        titulo: "Limites de producto",
        parrafos: [
          "Los productos herbales y esotericos se presentan para uso tradicional, aromatico, ritual, cultural, decorativo o de acompanamiento simbolico segun proceda.",
          "No son medicamentos, no sustituyen consejo medico o sanitario y no garantizan resultados fisicos, emocionales, espirituales ni terapeuticos.",
        ],
      },
    ],
    ctaPrincipal: { texto: "Ir al checkout", href: "/checkout" },
    ctaSecundaria: { texto: "Pedir orientacion artesanal", href: "/encargo" },
    metadata: {
      title: "Condiciones de compra | La Botica de la Bruja Lore",
      description:
        "Resumen comercial responsable sobre compra local, consulta artesanal, pago de prueba y limites de productos herbales/esotericos.",
    },
    seo: {
      indexable: false,
      incluirEnSitemap: false,
      esEstrategica: false,
    },
  },
  {
    ruta: "/envios-y-preparacion",
    etiquetaFooter: "Envios y preparacion",
    titulo: "Envios y preparacion",
    introduccion:
      "La preparacion se plantea como operativa artesanal: lotes pequenos, revision de disponibilidad y comunicacion honesta sobre plazos.",
    aviso:
      "Los tiempos son orientativos en esta fase local. No se prometen ventanas cerradas ni entregas garantizadas desde el entorno simulado.",
    secciones: [
      {
        titulo: "Preparacion del pedido",
        parrafos: [
          "El pedido queda registrado con lineas, direccion, totales y estado operativo para que pueda revisarse desde backoffice.",
          "Antes de preparar el envio se comprueba stock, coherencia de las lineas y cualquier incidencia pendiente.",
        ],
      },
      {
        titulo: "Envio",
        parrafos: [
          "El coste de envio se muestra antes de preparar el pedido y queda reflejado en el recibo.",
          "El seguimiento se informa cuando exista transportista y codigo de seguimiento; si no aplica, el backoffice puede marcar envio sin seguimiento.",
        ],
      },
      {
        titulo: "Incidencias de entrega",
        parrafos: [
          "Si hay una incidencia, se revisa el pedido y el estado operativo antes de proponer una solucion.",
          "No se prometen compensaciones automaticas fuera de una revision manual y trazable.",
        ],
      },
    ],
    ctaPrincipal: { texto: "Finalizar compra", href: "/checkout" },
    ctaSecundaria: { texto: "Ver condiciones", href: "/condiciones-encargo" },
    metadata: {
      title: "Envios y preparacion | La Botica de la Bruja Lore",
      description:
        "Informacion comercial sobre preparacion artesanal, envio, seguimiento e incidencias sin prometer plazos imposibles.",
    },
    seo: {
      indexable: true,
      incluirEnSitemap: true,
      esEstrategica: true,
    },
  },
  {
    ruta: "/devoluciones",
    etiquetaFooter: "Devoluciones",
    titulo: "Devoluciones y reembolsos",
    introduccion:
      "Esta pagina resume el criterio minimo para incidencias, devoluciones y reembolsos manuales dentro del entorno local.",
    aviso:
      "La politica definitiva para produccion requiere revision legal profesional. En local no se ejecutan reembolsos bancarios ni Stripe real.",
    secciones: [
      {
        titulo: "Revision de incidencias",
        parrafos: [
          "Cualquier incidencia debe revisarse con el numero de pedido, estado operativo y contexto suficiente para entender lo ocurrido.",
          "La aceptacion o rechazo de una devolucion se trata como decision manual, no como automatismo.",
        ],
      },
      {
        titulo: "Reembolso local",
        parrafos: [
          "En esta fase el reembolso se registra como operacion simulada/manual sobre un pedido real local.",
          "No se llama a Stripe ni a banco real; la trazabilidad queda en el pedido y en el backoffice.",
        ],
      },
      {
        titulo: "Restitucion de stock",
        parrafos: [
          "Si procede recuperar inventario, la restitucion se hace de forma controlada para evitar duplicados.",
          "No se garantiza restitucion automatica en productos personalizados, usados o fuera de condiciones comerciales razonables.",
        ],
      },
    ],
    ctaPrincipal: { texto: "Ver mi pedido", href: "/mi-cuenta/pedidos" },
    ctaSecundaria: { texto: "Contactar", href: "/contacto" },
    metadata: {
      title: "Devoluciones y reembolsos | La Botica de la Bruja Lore",
      description:
        "Criterio minimo para devoluciones, incidencias, reembolsos simulados y restitucion manual de stock en entorno local.",
    },
    seo: {
      indexable: false,
      incluirEnSitemap: false,
      esEstrategica: false,
    },
  },
  {
    ruta: "/privacidad",
    etiquetaFooter: "Privacidad",
    titulo: "Privacidad basica",
    introduccion:
      "Esta pagina resume que datos se solicitan para compra, cuenta o consulta, y que no se hace con ellos en esta fase.",
    aviso:
      "No usamos cookies publicitarias ni herramientas de analitica externas en la fase local. Esta informacion no sustituye una politica legal definitiva.",
    secciones: [
      {
        titulo: "Datos necesarios",
        parrafos: [
          "El checkout puede pedir datos de contacto, direccion de entrega y observaciones necesarias para preparar el pedido.",
          "La cuenta real puede guardar direcciones y mostrar pedidos asociados cuando el usuario inicia sesion.",
        ],
      },
      {
        titulo: "Datos que no usamos para analitica",
        parrafos: [
          "La analitica local del embudo no registra email, telefono, nombre, direccion ni codigo postal.",
          "No se envian eventos a Google Analytics, Meta Pixel ni herramientas externas.",
        ],
      },
      {
        titulo: "Cookies y sesion",
        parrafos: [
          "La web puede usar almacenamiento local o cookies funcionales para sesion, carrito, backoffice o continuidad de la experiencia.",
          "No se activan cookies publicitarias de terceros en esta fase.",
        ],
      },
    ],
    ctaPrincipal: { texto: "Conocer La Botica", href: "/la-botica" },
    ctaSecundaria: { texto: "Contactar", href: "/contacto" },
    metadata: {
      title: "Privacidad | La Botica de la Bruja Lore",
      description:
        "Resumen de privacidad basica para compra local, cuenta, consulta y analitica local sin terceros.",
    },
    seo: {
      indexable: false,
      incluirEnSitemap: false,
      esEstrategica: false,
    },
  },
  {
    ruta: "/contacto",
    etiquetaFooter: "Contacto",
    titulo: "Contacto y orientacion",
    introduccion:
      "Usa esta pagina para entender que canales publicos estan configurados y cuando conviene abrir una consulta personalizada.",
    aviso:
      "El contacto sirve para dudas comerciales y orientacion artesanal. No atiende consultas medicas ni sustituye consejo profesional.",
    secciones: [
      {
        titulo: "Canales disponibles",
        parrafos: [
          "Cuando existe email o WhatsApp publico configurado, la web lo indica de forma explicita.",
          "Si no hay canal publico activo, puedes preparar el resumen de una consulta y usar tu canal habitual fuera de la web.",
        ],
      },
      {
        titulo: "Cuando escribir",
        parrafos: [
          "Contacta si una pieza requiere personalizacion, si tienes una duda de disponibilidad o si necesitas aclarar una incidencia de pedido.",
          "Para productos comprables y con stock, el recorrido normal debe seguir por checkout.",
        ],
      },
      {
        titulo: "Limite sanitario",
        parrafos: [
          "No respondemos consultas de diagnostico, tratamiento, dosis medicinales ni sustitucion de pautas sanitarias.",
          "Ante dudas de salud, consulta con un profesional cualificado.",
        ],
      },
    ],
    ctaPrincipal: { texto: "Ir al checkout", href: "/checkout" },
    ctaSecundaria: { texto: "Abrir consulta personalizada", href: "/encargo" },
    metadata: {
      title: "Contacto | La Botica de la Bruja Lore",
      description:
        "Canales de contacto y orientacion artesanal con limites claros para productos herbales y esotericos.",
    },
    seo: {
      indexable: false,
      incluirEnSitemap: false,
      esEstrategica: false,
    },
  },
];

export function obtenerPaginaLegalComercial(ruta: string): PaginaLegalComercial {
  const pagina = PAGINAS_LEGALES_COMERCIALES.find((item) => item.ruta === ruta);

  if (!pagina) {
    throw new Error(`Pagina legal/comercial no encontrada para la ruta: ${ruta}`);
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
    return "Actualmente no hay un canal publico configurado en la web; usa el resumen de consulta como base para continuar por tu canal habitual.";
  }
  return `Canal publico activo: ${canales.join(" y ")}.`;
}
