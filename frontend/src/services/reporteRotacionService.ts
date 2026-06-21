/**
 * ============================================================
 * ARCHIVO: frontend/src/services/reporteRotacionService.ts
 * CASO DE USO: CU26 - Generar Reporte de Rotacion de Inventario
 * CICLO: 4
 * AUTOR: Adalid
 * FECHA: 21/06/26
 *
 * DESCRIPCION: Servicio de comunicacion con la API REST para
 * el reporte de rotacion. Las descargas de PDF y Excel se manejan
 * como blobs (no JSON) y se disparan con un link temporal.
 * Sigue el patron exacto de reporteCostosService.ts.
 * ============================================================
 */

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const getToken = () => localStorage.getItem("access_token");

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ── Tipos ────────────────────────────────────────────────────

export interface ItemReporteRotacion {
  insumo_id: number;
  nombre: string;
  categoria: string;
  total_ingresado: number;
  total_consumido: number;
  total_mermado: number;
  rotacion: number;
  stock_actual: number;
}

export interface ReporteRotacionResponse {
  reporte: ItemReporteRotacion[];
  total_insumos: number;
  insumo_mayor_rotacion: ItemReporteRotacion | null;
  insumo_mayor_merma: ItemReporteRotacion | null;
}

export interface FiltrosRotacion {
  fecha_desde?: string;
  fecha_hasta?: string;
  insumo_id?: number;
}

// ── Helpers ──────────────────────────────────────────────────

function buildQueryString(filtros: FiltrosRotacion): string {
  const params = new URLSearchParams();
  if (filtros.fecha_desde) params.append("fecha_desde", filtros.fecha_desde);
  if (filtros.fecha_hasta) params.append("fecha_hasta", filtros.fecha_hasta);
  if (filtros.insumo_id !== undefined && filtros.insumo_id !== null) {
    params.append("insumo_id", String(filtros.insumo_id));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/** Dispara la descarga de un blob en el navegador con el nombre indicado */
function descargarBlob(blob: Blob, nombreArchivo: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

// ── Endpoints ────────────────────────────────────────────────

/** GET /api/reportes/rotacion/ — Reporte en JSON */
export async function getReporteRotacion(
  filtros: FiltrosRotacion = {}
): Promise<ReporteRotacionResponse> {
  const qs = buildQueryString(filtros);
  const res = await fetch(`${API_URL}/reportes/rotacion/${qs}`, {
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener el reporte de rotacion.");
  return data;
}

/** GET /api/reportes/rotacion/pdf/ — Descarga el reporte en PDF */
export async function descargarRotacionPDF(filtros: FiltrosRotacion = {}): Promise<void> {
  const qs = buildQueryString(filtros);
  const res = await fetch(`${API_URL}/reportes/rotacion/pdf/${qs}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error("Error al generar el PDF del reporte de rotacion.");
  const blob = await res.blob();
  descargarBlob(blob, "reporte_rotacion_inventario.pdf");
}

/** GET /api/reportes/rotacion/excel/ — Descarga el reporte en Excel */
export async function descargarRotacionExcel(filtros: FiltrosRotacion = {}): Promise<void> {
  const qs = buildQueryString(filtros);
  const res = await fetch(`${API_URL}/reportes/rotacion/excel/${qs}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error("Error al generar el Excel del reporte de rotacion.");
  const blob = await res.blob();
  descargarBlob(blob, "reporte_rotacion_inventario.xlsx");
}
