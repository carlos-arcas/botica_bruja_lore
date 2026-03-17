import * as assert from "node:assert/strict";
import { test } from "node:test";

import { debugLogViewerHabilitado } from "../infraestructura/configuracion/debugLogs";

const ORIGINAL_DEBUG = process.env.DEBUG_LOG_VIEWER_ENABLED;
const ORIGINAL_PUBLIC_DEBUG = process.env.NEXT_PUBLIC_DEBUG_LOG_VIEWER_ENABLED;

function restaurarEntorno(): void {
  if (ORIGINAL_DEBUG === undefined) {
    delete process.env.DEBUG_LOG_VIEWER_ENABLED;
  } else {
    process.env.DEBUG_LOG_VIEWER_ENABLED = ORIGINAL_DEBUG;
  }

  if (ORIGINAL_PUBLIC_DEBUG === undefined) {
    delete process.env.NEXT_PUBLIC_DEBUG_LOG_VIEWER_ENABLED;
  } else {
    process.env.NEXT_PUBLIC_DEBUG_LOG_VIEWER_ENABLED = ORIGINAL_PUBLIC_DEBUG;
  }
}

test("usa DEBUG_LOG_VIEWER_ENABLED cuando está definido en servidor", () => {
  process.env.DEBUG_LOG_VIEWER_ENABLED = "true";
  process.env.NEXT_PUBLIC_DEBUG_LOG_VIEWER_ENABLED = "false";

  assert.equal(debugLogViewerHabilitado(), true);

  restaurarEntorno();
});

test("usa NEXT_PUBLIC_DEBUG_LOG_VIEWER_ENABLED cuando la variable de servidor está vacía", () => {
  process.env.DEBUG_LOG_VIEWER_ENABLED = "   ";
  process.env.NEXT_PUBLIC_DEBUG_LOG_VIEWER_ENABLED = "on";

  assert.equal(debugLogViewerHabilitado(), true);

  restaurarEntorno();
});

test("retorna false cuando ambas variables no están activas", () => {
  process.env.DEBUG_LOG_VIEWER_ENABLED = "";
  process.env.NEXT_PUBLIC_DEBUG_LOG_VIEWER_ENABLED = "no";

  assert.equal(debugLogViewerHabilitado(), false);

  restaurarEntorno();
});
