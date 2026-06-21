/**
 * ============================================================
 * ARCHIVO: frontend/src/pages/Proveedores/MapaProveedores.tsx
 * CASO DE USO: CU19 - Localizar Proveedores mediante Mapa
 * CICLO: 4
 * AUTOR: Adalid
 * FECHA: 21/06/26
 *
 * DESCRIPCION: Pagina de mapa interactivo de proveedores.
 * Muestra marcadores coloreados por tipo de pago sobre un mapa
 * OpenStreetMap centrado en Bolivia. Incluye panel lateral con
 * busqueda y filtro por ciudad, y leyenda de colores.
 *
 * EDICION DE UBICACION:
 *   - Al hacer clic en un pin se abre su info (Popup).
 *   - Dentro del Popup, el enlace "Cambiar ubicacion" activa el
 *     modo edicion SOLO para ese pin: pasa a ser arrastrable.
 *   - Al soltar el pin (dragend) se guarda la nueva ubicacion.
 *   - Los proveedores SIN coordenadas se listan aparte con un
 *     boton "Asignar ubicacion" que coloca un pin en el centro
 *     del mapa para luego ajustarlo arrastrandolo.
 *
 * Usa react-leaflet con iconos divIcon (fix de iconos para Vite).
 * ============================================================
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { Search, MapPin, Filter, Move, X, MapPinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AppHeader from "@/components/AppHeader";

import {
  getProveedoresMapa,
  actualizarUbicacionProveedor,
  type ProveedorMapa,
} from "@/services/mapaService";

// ── Centro por defecto (Bolivia) ──────────────────────────────
const CENTRO_BOLIVIA: [number, number] = [-16.5, -64.5];

// ── Colores de pin por tipo de pago ───────────────────────────
const COLOR_POR_TIPO: Record<string, string> = {
  Efectivo: "#16a34a",      // verde
  Transferencia: "#2563eb", // azul
  Credito: "#ea580c",       // naranja
  Crédito: "#ea580c",       // con tilde
};

const COLOR_DEFAULT = "#6b7280"; // gris

function getColorTipoPago(tipoPago: string): string {
  return COLOR_POR_TIPO[tipoPago] ?? COLOR_DEFAULT;
}

// Icono de pin. Si `editando` es true se resalta para indicar que
// ese pin esta en modo arrastrable.
function crearIconoDiv(color: string, editando = false): L.DivIcon {
  const tam = editando ? 38 : 28;
  const anillo = editando
    ? "outline: 3px dashed #1f2937; outline-offset: 3px;"
    : "";
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: ${tam}px; height: ${tam}px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 6px rgba(0,0,0,0.35);
        ${anillo}
      "></div>
    `,
    iconSize: [tam, tam],
    iconAnchor: [tam / 2, tam],
    popupAnchor: [0, -tam - 2],
  });
}

// ── Componente auxiliar para volar al marcador seleccionado ───
interface FlyToProps {
  coords: [number, number] | null;
}

function FlyToController({ coords }: FlyToProps) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 13, { duration: 1.2 });
    }
  }, [coords, map]);
  return null;
}

// ── Ciudades disponibles para el filtro ───────────────────────
const CIUDADES = [
  "Santa Cruz",
  "La Paz",
  "Cochabamba",
  "Tarija",
  "Oruro",
  "El Alto",
  "Sucre",
];

// ── Helpers de coordenadas ────────────────────────────────────
function tieneCoords(p: ProveedorMapa): boolean {
  return p.latitud !== null && p.longitud !== null;
}

// ── Componente principal ──────────────────────────────────────
export default function MapaProveedores() {
  const [proveedores, setProveedores] = useState<ProveedorMapa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [ciudadFiltro, setCiudadFiltro] = useState<string>("todas");
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);

  // ID del proveedor cuyo pin esta en modo edicion (arrastrable). null = ninguno.
  const [editandoId, setEditandoId] = useState<number | null>(null);

  // Referencia al mapa para leer el centro al asignar ubicacion.
  const mapRef = useRef<L.Map | null>(null);

  // ── Carga inicial y cuando cambia filtro de ciudad ───────────
  useEffect(() => {
    cargarProveedores(ciudadFiltro === "todas" ? undefined : ciudadFiltro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ciudadFiltro]);

  async function cargarProveedores(ubicacion?: string) {
    try {
      setCargando(true);
      const data = await getProveedoresMapa(ubicacion);
      setProveedores(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cargar el mapa.";
      toast.error(msg);
    } finally {
      setCargando(false);
    }
  }

  // ── Filtro local por texto de busqueda ────────────────────────
  const proveedoresFiltrados = proveedores.filter((p) => {
    const term = busqueda.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(term) ||
      p.ubicacion.toLowerCase().includes(term)
    );
  });

  const conCoords = proveedoresFiltrados.filter(tieneCoords);
  const sinCoords = proveedoresFiltrados.filter((p) => !tieneCoords(p));

  const proveedorEditando = proveedores.find((p) => p.id === editandoId) || null;

  // ── Acciones ──────────────────────────────────────────────────

  function handleSeleccionarProveedor(p: ProveedorMapa) {
    if (tieneCoords(p)) {
      setFlyTo([p.latitud as number, p.longitud as number]);
    }
  }

  // Activa el modo edicion (pin arrastrable) para un proveedor con coords.
  function iniciarEdicion(p: ProveedorMapa) {
    setEditandoId(p.id);
    if (tieneCoords(p)) {
      setFlyTo([p.latitud as number, p.longitud as number]);
    }
    mapRef.current?.closePopup();
    toast.info(`Arrastra el pin de "${p.nombre}" y sueltalo para guardar.`);
  }

  function terminarEdicion() {
    setEditandoId(null);
  }

  // Persiste la nueva ubicacion tras arrastrar el pin (o al asignar).
  async function guardarUbicacion(id: number, lat: number, lng: number) {
    // Actualizacion optimista del estado local
    setProveedores((prev) =>
      prev.map((p) => (p.id === id ? { ...p, latitud: lat, longitud: lng } : p))
    );
    try {
      await actualizarUbicacionProveedor(id, lat, lng);
      toast.success("Ubicacion guardada correctamente.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo guardar la ubicacion.";
      toast.error(msg);
      // Si falla, recargamos para descartar el cambio optimista
      cargarProveedores(ciudadFiltro === "todas" ? undefined : ciudadFiltro);
    }
  }

  // Asigna una ubicacion inicial (centro del mapa) a un proveedor sin coords
  // y entra en modo edicion para que el usuario la ajuste arrastrando.
  async function asignarUbicacion(p: ProveedorMapa) {
    const centro = mapRef.current?.getCenter();
    const lat = centro?.lat ?? CENTRO_BOLIVIA[0];
    const lng = centro?.lng ?? CENTRO_BOLIVIA[1];
    await guardarUbicacion(p.id, lat, lng);
    setEditandoId(p.id);
    setFlyTo([lat, lng]);
    toast.info(`Pin colocado. Arrastralo para ajustar la ubicacion de "${p.nombre}".`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Encabezado ── */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-orange-50">
            <MapPin className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mapa de Proveedores</h1>
            <p className="text-sm text-gray-400">
              Visualiza la ubicacion geografica de los proveedores registrados.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Panel lateral ── */}
          <div className="w-full lg:w-80 flex-shrink-0 space-y-4">

            {/* Filtro por ciudad */}
            <Card className="rounded-2xl border-0 shadow-sm bg-white">
              <CardHeader className="pb-2 px-5 pt-5">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-orange-500" />
                  Filtrar por ciudad
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <Select value={ciudadFiltro} onValueChange={setCiudadFiltro}>
                  <SelectTrigger className="rounded-xl h-10 border-gray-200">
                    <SelectValue placeholder="Selecciona ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las ciudades</SelectItem>
                    {CIUDADES.map((ciudad) => (
                      <SelectItem key={ciudad} value={ciudad}>
                        {ciudad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Busqueda y lista */}
            <Card className="rounded-2xl border-0 shadow-sm bg-white">
              <CardHeader className="pb-2 px-5 pt-5">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Search className="h-4 w-4 text-orange-500" />
                  Buscar proveedor
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nombre o ubicacion..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-9 rounded-xl border-gray-200 h-10"
                  />
                </div>

                {cargando ? (
                  <div className="flex justify-center py-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
                  </div>
                ) : conCoords.length === 0 ? (
                  <p className="text-xs text-gray-400 italic text-center py-4">
                    No hay proveedores con ubicacion en el mapa.
                  </p>
                ) : (
                  <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {conCoords.map((p) => (
                      <li key={p.id}>
                        <div className="rounded-xl px-3 py-2.5 hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-100">
                          <button
                            onClick={() => handleSeleccionarProveedor(p)}
                            className="w-full text-left"
                          >
                            <p className="text-sm font-medium text-gray-800 leading-tight">
                              {p.nombre}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{p.ubicacion}</p>
                            <Badge
                              className="mt-1 text-xs border-0 px-2 py-0"
                              style={{
                                backgroundColor: `${getColorTipoPago(p.tipo_pago)}20`,
                                color: getColorTipoPago(p.tipo_pago),
                              }}
                            >
                              {p.tipo_pago}
                            </Badge>
                          </button>
                          <button
                            onClick={() => iniciarEdicion(p)}
                            className="mt-2 inline-flex items-center gap-1 text-xs text-orange-600 hover:underline font-medium"
                          >
                            <Move className="h-3 w-3" />
                            Cambiar ubicacion
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Proveedores sin ubicacion (para asignarles un pin) */}
            {!cargando && sinCoords.length > 0 && (
              <Card className="rounded-2xl border-0 shadow-sm bg-white">
                <CardHeader className="pb-2 px-5 pt-5">
                  <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPinOff className="h-4 w-4 text-gray-400" />
                    Sin ubicacion ({sinCoords.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <ul className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {sinCoords.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 border border-gray-100"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">{p.nombre}</p>
                          <p className="text-xs text-gray-400 truncate">{p.ubicacion}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => asignarUbicacion(p)}
                          className="rounded-lg h-8 text-xs whitespace-nowrap border-orange-200 text-orange-600 hover:bg-orange-50"
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          Asignar
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Leyenda */}
            <Card className="rounded-2xl border-0 shadow-sm bg-white">
              <CardHeader className="pb-2 px-5 pt-5">
                <CardTitle className="text-sm font-semibold text-gray-700">Leyenda</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-2">
                {[
                  { label: "Efectivo", color: "#16a34a" },
                  { label: "Transferencia", color: "#2563eb" },
                  { label: "Credito", color: "#ea580c" },
                  { label: "Otro", color: "#6b7280" },
                ].map(({ label, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span
                      className="inline-block h-3.5 w-3.5 rounded-full border-2 border-white shadow"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-gray-600">{label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Enlace a lista */}
            <Link to="/proveedores">
              <Button variant="outline" className="w-full rounded-xl border-gray-200 h-10 text-sm">
                Ver lista de Proveedores
              </Button>
            </Link>
          </div>

          {/* ── Mapa ── */}
          <div className="flex-1 relative rounded-2xl overflow-hidden shadow-md border border-gray-200" style={{ minHeight: "520px" }}>

            {/* Banner de modo edicion */}
            {proveedorEditando && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] w-[92%] max-w-xl">
                <div className="flex items-center gap-3 bg-gray-900/95 text-white rounded-xl px-4 py-2.5 shadow-lg">
                  <Move className="h-4 w-4 text-orange-400 flex-shrink-0" />
                  <p className="text-xs leading-snug flex-1">
                    Editando <span className="font-semibold">{proveedorEditando.nombre}</span>.
                    Arrastra el pin y sueltalo para guardar la ubicacion.
                  </p>
                  <button
                    onClick={terminarEdicion}
                    className="inline-flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg px-2 py-1 transition-colors"
                  >
                    <X className="h-3 w-3" />
                    Terminar
                  </button>
                </div>
              </div>
            )}

            <MapContainer
              center={CENTRO_BOLIVIA}
              zoom={6}
              style={{ height: "100%", minHeight: "520px", width: "100%" }}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <FlyToController coords={flyTo} />

              {conCoords.map((p) => {
                const enEdicion = editandoId === p.id;
                return (
                  <Marker
                    key={p.id}
                    position={[p.latitud as number, p.longitud as number]}
                    icon={crearIconoDiv(getColorTipoPago(p.tipo_pago), enEdicion)}
                    draggable={enEdicion}
                    eventHandlers={
                      enEdicion
                        ? {
                            dragend: (e) => {
                              const m = e.target as L.Marker;
                              const { lat, lng } = m.getLatLng();
                              guardarUbicacion(p.id, lat, lng);
                            },
                          }
                        : undefined
                    }
                  >
                    <Popup>
                      <div className="text-sm min-w-[180px]">
                        <p className="font-bold text-gray-800 mb-1">{p.nombre}</p>
                        <p className="text-gray-500 text-xs mb-1">
                          <span className="font-medium">Ubicacion:</span> {p.ubicacion}
                        </p>
                        <p className="text-gray-500 text-xs mb-2">
                          <span className="font-medium">Tipo de pago:</span>{" "}
                          <span style={{ color: getColorTipoPago(p.tipo_pago) }}>
                            {p.tipo_pago}
                          </span>
                        </p>

                        {enEdicion ? (
                          <p className="text-xs text-orange-600 font-medium mb-2">
                            Modo edicion activo: arrastra este pin.
                          </p>
                        ) : (
                          <button
                            onClick={() => iniciarEdicion(p)}
                            className="inline-flex items-center gap-1 text-xs text-orange-600 hover:underline font-medium mb-2"
                          >
                            <Move className="h-3 w-3" />
                            Cambiar ubicacion
                          </button>
                        )}

                        <div>
                          <Link
                            to="/proveedores"
                            className="text-xs text-gray-500 hover:underline"
                          >
                            Ver en lista de proveedores
                          </Link>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
