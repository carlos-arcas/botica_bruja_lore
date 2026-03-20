import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  construirEnlaceCanal,
  obtenerConfiguracionContactoPublico,
  resolverCanalesDisponibles,
  resolverEstadoCanalContacto,
} from "../contenido/catalogo/canalContactoPublico";
import { PRODUCTOS_CATALOGO } from "../contenido/catalogo/catalogo";
import { construirResumenConsulta } from "../contenido/catalogo/encargoConsulta";

test("resolverEstadoCanalContacto devuelve fallback cuando no hay configuración", () => {
  const estado = resolverEstadoCanalContacto({ email: null, whatsapp: null });

  assert.equal(estado.disponible, false);
  assert.equal(estado.canales.length, 0);
  assert.match(estado.ctaSecundaria, /Canal de contacto no disponible|Copiar solicitud/);
});

test("obtenerConfiguracionContactoPublico normaliza email y teléfono público", () => {
  const configuracion = obtenerConfiguracionContactoPublico({
    NEXT_PUBLIC_CONTACT_EMAIL: "equipo@botica-lore.es ",
    NEXT_PUBLIC_CONTACT_WHATSAPP: "+34 600-123-123",
  });

  assert.equal(configuracion.email, "equipo@botica-lore.es");
  assert.equal(configuracion.whatsapp, "34600123123");
});

test("construirEnlaceCanal genera mailto válido cuando existe configuración", () => {
  const canal = resolverCanalesDisponibles({ email: "equipo@botica-lore.es", whatsapp: null })[0];
  const enlace = construirEnlaceCanal(canal, { email: "equipo@botica-lore.es", whatsapp: null }, "Resumen de prueba");

  assert.ok(enlace);
  assert.match(enlace ?? "", /^mailto:equipo@botica-lore\.es/);
  assert.match(decodeURIComponent(enlace ?? ""), /Resumen de prueba/);
});

test("construirEnlaceCanal reutiliza el resumen de consulta para WhatsApp", () => {
  const producto = PRODUCTOS_CATALOGO[0];
  const resumen = construirResumenConsulta(
    {
      nombre: "Lore",
      email: "lore@botica.es",
      telefono: "",
      productoSlug: producto.slug,
      cantidad: "2 unidades",
      mensaje: "Deseo una combinación para ritual de cierre y calma.",
      consentimiento: true,
    },
    producto,
    "producto",
  );

  const canal = resolverCanalesDisponibles({ email: null, whatsapp: "34600123123" })[0];
  const enlace = construirEnlaceCanal(canal, { email: null, whatsapp: "34600123123" }, resumen);

  assert.ok(enlace);
  assert.match(enlace ?? "", /^https:\/\/wa\.me\/34600123123\?text=/);
  assert.match(decodeURIComponent(enlace ?? ""), /Bruma de Lavanda Serena/);
  assert.match(decodeURIComponent(enlace ?? ""), /Lore/);
});
