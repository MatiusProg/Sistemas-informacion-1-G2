/**
 * ============================================================
 * ARCHIVO: frontend/src/hooks/useComandoVoz.ts
 * CASO DE USO: CU32 - Reportes por Voz con IA
 * CICLO: 4
 * AUTOR: Mateo Hurtado
 * FECHA: 21/06/26
 *
 * DESCRIPCIÓN: Hook que encapsula toda la lógica del "Control"
 * de CU32 (CCComandoVoz en el diagrama de clases): captura de
 * audio vía Web Speech API del navegador, interpretación del
 * texto transcrito por palabras clave, y registro de bitácora.
 * La navegación queda a cargo de quien use el hook (AppHeader).
 *
 * "IA" = Web Speech API nativa del navegador + parser de
 * palabras clave. NO hay modelo de lenguaje propio ni backend
 * de reconocimiento — esto se documenta explícitamente para no
 * sobre-prometer en la defensa académica.
 *
 * Filtrado por rol (decisión de sesión de diseño Fase 3): los
 * comandos hacia reportes que el rol actual no puede ver se
 * excluyen ANTES de interpretar, igual criterio que el sidebar
 * (menuConfig.ts) ya aplica para ocultar nodos por rol.
 * ============================================================
 */

import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Role } from "@/context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const getToken = () => localStorage.getItem("access_token");

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ── Tipos ────────────────────────────────────────────────────

export type FormatoDetectado = "pdf" | "excel" | null;

interface ComandoDestino {
  cuDestino: string;
  ruta: string;
  /** Palabras clave que disparan este destino. */
  palabrasClave: string[];
  /** Roles que pueden ver este reporte (mismo criterio que menuConfig.ts). */
  rolesPermitidos: Role[];
}

interface ComandoInterpretado {
  cuDestino: string;
  ruta: string;
  formato: FormatoDetectado;
}

// Mapeo de comandos -> destino, con sus roles permitidos
// (CU25/CU29: administrador+gerente. CU27: + chef, igual que su ruta real).
const COMANDOS_DESTINO: ComandoDestino[] = [
  {
    cuDestino: "CU25",
    ruta: "/reportes/valor-perdido",
    palabrasClave: ["valor perdido", "pérdidas", "perdidas", "mermas"],
    rolesPermitidos: ["administrador", "gerente"],
  },
  {
    cuDestino: "CU27",
    ruta: "/reportes/costos",
    palabrasClave: ["costos", "costo por plato", "costo de platos"],
    rolesPermitidos: ["administrador", "gerente", "chef"],
  },
  {
    cuDestino: "CU29",
    ruta: "/dashboard",
    palabrasClave: ["dashboard", "kpis", "indicadores"],
    rolesPermitidos: ["administrador", "gerente"],
  },
];

const PALABRAS_FORMATO_PDF = ["pdf"];
const PALABRAS_FORMATO_EXCEL = ["excel"];

/**
 * Interpreta la transcripción de voz contra los comandos disponibles
 * para el rol actual. Devuelve null si no se reconoció ningún comando.
 */
function interpretarComando(
  transcripcion: string,
  rol: Role
): ComandoInterpretado | null {
  const texto = transcripcion.toLowerCase();

  const comandosDisponibles = COMANDOS_DESTINO.filter((c) =>
    c.rolesPermitidos.includes(rol)
  );

  const destino = comandosDisponibles.find((c) =>
    c.palabrasClave.some((palabra) => texto.includes(palabra))
  );

  if (!destino) return null;

  let formato: FormatoDetectado = null;
  if (PALABRAS_FORMATO_PDF.some((p) => texto.includes(p))) {
    formato = "pdf";
  } else if (PALABRAS_FORMATO_EXCEL.some((p) => texto.includes(p))) {
    formato = "excel";
  }

  return { cuDestino: destino.cuDestino, ruta: destino.ruta, formato };
}

/** POST /api/bitacora/log-accion-voz/ — registra el comando reconocido */
async function registrarComandoVoz(
  transcripcion: string,
  cuDestino: string,
  formatoDetectado: FormatoDetectado
): Promise<void> {
  try {
    await fetch(`${API_URL}/bitacora/log-accion-voz/`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        transcripcion,
        cu_destino: cuDestino,
        formato_detectado: formatoDetectado,
      }),
    });
  } catch {
    // Silencioso: un fallo de auditoría no debe interrumpir la
    // navegación que ya ocurrió — mismo criterio que registrar_accion()
    // aplica del lado del backend.
  }
}

// Tipado mínimo de la Web Speech API (no está en lib.dom.d.ts por defecto)
interface SpeechRecognitionResultLike {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

export function useComandoVoz(rolActual: Role | undefined) {
  const navigate = useNavigate();
  const [escuchando, setEscuchando] = useState(false);
  const reconocimientoRef = useRef<any>(null);

  const soportado =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const iniciarReconocimiento = useCallback(() => {
    if (!soportado) {
      toast.error("Tu navegador no soporta reconocimiento de voz. Usa Chrome.");
      return;
    }
    if (!rolActual) return;

    // F1 (alt): soporte ya validado arriba.
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const reconocimiento = new SpeechRecognitionCtor();
    reconocimiento.lang = "es-BO";
    reconocimiento.continuous = false;
    reconocimiento.interimResults = false;

    reconocimiento.onstart = () => setEscuchando(true);
    reconocimiento.onend = () => setEscuchando(false);

    reconocimiento.onerror = (event: any) => {
      setEscuchando(false);
      if (event.error === "not-allowed" || event.error === "permission-denied") {
        toast.error("Permiso de micrófono denegado.");
      } else if (event.error === "no-speech") {
        toast.info("No se detectó ningún comando de voz.");
      } else {
        toast.error("Error al capturar el comando de voz.");
      }
    };

    reconocimiento.onresult = (event: SpeechRecognitionResultLike) => {
      const transcripcion = event.results[0][0].transcript;

      // F2 (alt): comando reconocido / no reconocido
      const interpretado = interpretarComando(transcripcion, rolActual);

      if (!interpretado) {
        toast.info(
          `No se reconoció ningún comando válido. Intenta: "mostrar costos", "mostrar dashboard"...`
        );
        return;
      }

      // F3 (critical): registrar bitácora — no se espera la respuesta
      // para no demorar la navegación, igual principio que descargarBlob
      // no bloquea la UI esperando confirmaciones secundarias.
      registrarComandoVoz(transcripcion, interpretado.cuDestino, interpretado.formato);

      if (interpretado.formato) {
        toast.success(
          `Comando reconocido: ir a ${interpretado.cuDestino} (formato ${interpretado.formato})`
        );
      } else {
        toast.success(`Comando reconocido: ir a ${interpretado.cuDestino}`);
      }

      navigate(interpretado.ruta, {
        state: { formatoSugerido: interpretado.formato },
      });
    };

    reconocimientoRef.current = reconocimiento;
    reconocimiento.start();
  }, [soportado, rolActual, navigate]);

  return { soportado, escuchando, iniciarReconocimiento };
}