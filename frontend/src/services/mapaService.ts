/**
 * ============================================================
 * ARCHIVO: frontend/src/services/mapaService.ts
 * CASO DE USO: CU19 - Localizar Proveedores mediante Mapa
 * CICLO: 4
 * AUTOR: Adalid
 * FECHA: 21/06/26
 *
 * DESCRIPCION: Servicio de comunicacion con la API REST para
 * el mapa de proveedores. Sigue el patron exacto de
 * proveedorService.ts con headers Bearer.
 * ============================================================
 */

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const getToken = () => localStorage.getItem("access_token");

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ── Tipos ────────────────────────────────────────────────────

export interface ProveedorMapa {
  id: number;
  nombre: string;
  ubicacion: string;
  tipo_pago: string;
  // null cuando el proveedor aun no tiene ubicacion asignada en el mapa
  latitud: number | null;
  longitud: number | null;
}

// ── Endpoints ────────────────────────────────────────────────

/**
 * GET /api/proveedores/mapa/
 * Devuelve TODOS los proveedores. Los que tienen latitud/longitud se
 * pintan como pines; los que no, se listan para asignarles ubicacion.
 * @param ubicacion  Filtro opcional por ciudad/ubicacion (ilike)
 */
export async function getProveedoresMapa(ubicacion?: string): Promise<ProveedorMapa[]> {
  const params = ubicacion ? `?ubicacion=${encodeURIComponent(ubicacion)}` : "";
  const res = await fetch(`${API_URL}/proveedores/mapa/${params}`, {
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener proveedores del mapa.");
  return data;
}

/**
 * PATCH /api/proveedores/{id}/
 * Guarda la nueva ubicacion (latitud/longitud) de un proveedor tras
 * arrastrar su pin en el mapa. Reutiliza el endpoint de CU17.
 */
export async function actualizarUbicacionProveedor(
  id: number,
  latitud: number,
  longitud: number
): Promise<void> {
  const res = await fetch(`${API_URL}/proveedores/${id}/`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ latitud, longitud }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Error al actualizar la ubicacion del proveedor.");
  }
}
