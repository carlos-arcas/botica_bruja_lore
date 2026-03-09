import type { Metadata } from "next";

export type EnlaceAccionLegal = {
  texto: string;
  href: string;
};

export type SeccionLegalComercial = {
  titulo: string;
  descripcion: string;
  puntos?: string[];
};

export type PaginaLegalComercial = {
  ruta: "/condiciones-encargo" | "/envios-y-preparacion" | "/privacidad";
  titulo: string;
  introduccion: string;
  aviso: string;
  secciones: SeccionLegalComercial[];
  cta: {
    primaria: EnlaceAccionLegal;
    secundaria: EnlaceAccionLegal;
  };
  metadata: Metadata;
};

const AVISO_CANALIZA_SOLICITUDES =
  "Este sitio canaliza solicitudes y encargos artesanales. No hay compra ni pago automático integrado en la web.";

export const PAGINAS_LEGALES_COMERCIALES: PaginaLegalComercial[] = [
  {
    ruta: "/condiciones-encargo",
    titulo: "Condiciones del encargo artesanal",
    introduccion:
      "Explicamos cómo funciona la solicitud en esta demo: qué revisamos, cómo confirmamos y qué límites tiene el proceso antes de cerrar un encargo.",
    aviso: AVISO_CANALIZA_SOLICITUDES,
    secciones: [
      {
        titulo: "Naturaleza del servicio",
        descripcion:
          "La botica combina catálogo editorial y propuesta comercial orientativa. Cada solicitud se valida de forma manual para confirmar disponibilidad, alcance y siguientes pasos.",
      },
      {
        titulo: "Cómo se confirma un encargo",
        descripcion:
          "El envío del formulario genera un resumen para compartir por el canal disponible. La confirmación final solo existe cuando hay respuesta explícita por ese canal.",
        puntos: [
          "Puedes revisar el resumen antes de enviarlo.",
          "Si no hay canal público activo, copia el texto y úsalo por tu vía habitual.",
          "Sin confirmación posterior no se considera encargo cerrado.",
        ],
      },
      {
        titulo: "Alcance y límites de la demo",
        descripcion:
          "No prometemos disponibilidad permanente, precio final automático ni reserva inmediata desde la web. Esta capa busca claridad comercial, no sustituir la conversación de validación.",
      },
    ],
    cta: {
      primaria: { texto: "Preparar solicitud", href: "/encargo" },
      secundaria: { texto: "Volver a colecciones", href: "/colecciones" },
    },
    metadata: {
      title: "Condiciones del encargo artesanal | La Botica de la Bruja Lore",
      description:
        "Cómo funciona la solicitud artesanal: validación manual, confirmación por canal real y límites comerciales de esta demo.",
    },
  },
  {
    ruta: "/envios-y-preparacion",
    titulo: "Envíos, preparación e incidencias",
    introduccion:
      "Compartimos una guía prudente sobre tiempos y revisión de incidencias para que sepas qué esperar antes y después de confirmar tu encargo.",
    aviso: AVISO_CANALIZA_SOLICITUDES,
    secciones: [
      {
        titulo: "Preparación artesanal",
        descripcion:
          "Las piezas se preparan por tandas y según complejidad. Por eso comunicamos ventanas orientativas durante la confirmación, evitando promesas de plazos cerrados sin revisar tu caso.",
      },
      {
        titulo: "Envíos y seguimiento",
        descripcion:
          "Cuando un encargo queda confirmado, compartimos por el canal acordado el estado de preparación y la información de envío disponible en ese momento.",
      },
      {
        titulo: "Revisión de incidencias y devoluciones",
        descripcion:
          "Si detectas una incidencia, escríbenos con el resumen de solicitud y una descripción breve. Revisamos cada caso con criterio artesanal y buscamos una solución razonable sin respuestas automáticas engañosas.",
        puntos: [
          "Indica referencia o contenido del encargo.",
          "Explica qué ha ocurrido y cuándo lo detectaste.",
          "Adjunta contexto útil para poder evaluar la incidencia.",
        ],
      },
    ],
    cta: {
      primaria: { texto: "Consultar mi encargo", href: "/encargo" },
      secundaria: { texto: "Explorar rituales", href: "/rituales" },
    },
    metadata: {
      title: "Envíos y preparación artesanal | La Botica de la Bruja Lore",
      description:
        "Guía mínima y honesta sobre preparación, envíos e incidencias en encargos artesanales de La Botica de la Bruja Lore.",
    },
  },
  {
    ruta: "/privacidad",
    titulo: "Privacidad y uso responsable del contacto",
    introduccion:
      "Esta demo recoge solo la información que compartes en tu solicitud para preparar una respuesta artesanal por el canal disponible.",
    aviso:
      "No existe pasarela de pago ni área privada en esta fase. El intercambio se limita al proceso de solicitud y seguimiento manual.",
    secciones: [
      {
        titulo: "Qué datos se comparten",
        descripcion:
          "Nombre, email, teléfono opcional y detalle de tu intención de encargo. Estos datos aparecen en el resumen que decides enviar.",
      },
      {
        titulo: "Para qué se usan",
        descripcion:
          "Se usan únicamente para entender tu solicitud, responderte y, si procede, coordinar la continuidad del encargo por un canal real.",
      },
      {
        titulo: "Canales públicos y transparencia",
        descripcion:
          "El sitio muestra solo los canales configurados públicamente. Si no hay ninguno activo, se indica de forma explícita y puedes copiar tu solicitud para usar otro medio.",
      },
    ],
    cta: {
      primaria: { texto: "Ir al formulario de encargo", href: "/encargo" },
      secundaria: { texto: "Conocer La Botica", href: "/la-botica" },
    },
    metadata: {
      title: "Privacidad y contacto | La Botica de la Bruja Lore",
      description:
        "Cómo usamos los datos del formulario de encargo en esta demo: alcance, límites y canales de contacto configurados públicamente.",
    },
  },
];

export function obtenerPaginaLegalComercial(ruta: PaginaLegalComercial["ruta"]): PaginaLegalComercial {
  const pagina = PAGINAS_LEGALES_COMERCIALES.find((item) => item.ruta === ruta);
  if (!pagina) {
    throw new Error(`No existe contenido legal/comercial para la ruta ${ruta}`);
  }

  return pagina;
}
