export type TipoCanalContacto = "email" | "whatsapp";

type EntornoPublico = Record<string, string | undefined>;

export type ConfiguracionContactoPublico = {
  email: string | null;
  whatsapp: string | null;
};

export type CanalContactoDisponible = {
  tipo: TipoCanalContacto;
  etiqueta: string;
};

export type EstadoCanalContacto = {
  canales: CanalContactoDisponible[];
  principal: CanalContactoDisponible | null;
  disponible: boolean;
  ctaPrincipal: string;
  ctaSecundaria: string;
  descripcion: string;
};

const ASUNTO_EMAIL = "Consulta de encargo · La Botica de la Bruja Lore";

export function obtenerConfiguracionContactoPublico(entorno: EntornoPublico = process.env): ConfiguracionContactoPublico {
  return {
    email: normalizarEmail(entorno.NEXT_PUBLIC_CONTACT_EMAIL),
    whatsapp: normalizarTelefono(entorno.NEXT_PUBLIC_CONTACT_WHATSAPP),
  };
}

export function resolverCanalesDisponibles(configuracion: ConfiguracionContactoPublico): CanalContactoDisponible[] {
  const canales: CanalContactoDisponible[] = [];

  if (configuracion.email) {
    canales.push({ tipo: "email", etiqueta: "Enviar por email" });
  }

  if (configuracion.whatsapp) {
    canales.push({ tipo: "whatsapp", etiqueta: "Enviar por WhatsApp" });
  }

  return canales;
}

export function formatearResumenParaCanal(resumen: string, tipo: TipoCanalContacto): string {
  const textoBase = resumen.trim();
  if (!textoBase) {
    return "";
  }

  if (tipo === "whatsapp") {
    return textoBase.replace(/\n{3,}/g, "\n\n");
  }

  return textoBase;
}

export function construirEnlaceCanal(
  canal: CanalContactoDisponible,
  configuracion: ConfiguracionContactoPublico,
  resumen: string,
): string | null {
  const texto = formatearResumenParaCanal(resumen, canal.tipo);
  if (!texto) {
    return null;
  }

  if (canal.tipo === "email" && configuracion.email) {
    const asunto = encodeURIComponent(ASUNTO_EMAIL);
    const cuerpo = encodeURIComponent(texto);
    return `mailto:${configuracion.email}?subject=${asunto}&body=${cuerpo}`;
  }

  if (canal.tipo === "whatsapp" && configuracion.whatsapp) {
    const cuerpo = encodeURIComponent(texto);
    return `https://wa.me/${configuracion.whatsapp}?text=${cuerpo}`;
  }

  return null;
}

export function resolverEstadoCanalContacto(configuracion: ConfiguracionContactoPublico): EstadoCanalContacto {
  const canales = resolverCanalesDisponibles(configuracion);
  const principal = canales[0] ?? null;

  if (!principal) {
    return {
      canales,
      principal,
      disponible: false,
      ctaPrincipal: "Copiar solicitud",
      ctaSecundaria: "Canal de contacto no disponible",
      descripcion: "Ahora mismo no hay un canal público configurado. Copia tu solicitud y compártela por tu vía habitual.",
    };
  }

  return {
    canales,
    principal,
    disponible: true,
    ctaPrincipal: principal.etiqueta,
    ctaSecundaria: "Copiar solicitud",
    descripcion: "Tu resumen está listo. Puedes abrir un canal real o copiar el texto para revisarlo antes de enviarlo.",
  };
}

function normalizarEmail(email: string | undefined): string | null {
  if (!email) {
    return null;
  }

  const limpio = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio)) {
    return null;
  }

  return limpio;
}

function normalizarTelefono(telefono: string | undefined): string | null {
  if (!telefono) {
    return null;
  }

  const digitos = telefono.replace(/\D/g, "");
  if (digitos.length < 9) {
    return null;
  }

  return digitos;
}
