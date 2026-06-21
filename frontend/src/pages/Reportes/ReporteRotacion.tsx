/**
 * ============================================================
 * ARCHIVO: frontend/src/pages/Reportes/ReporteRotacion.tsx
 * CASO DE USO: CU26 - Generar Reporte de Rotacion de Inventario
 * CICLO: 4
 * AUTOR: Adalid
 * FECHA: 21/06/26
 *
 * DESCRIPCION: Pagina de reporte de rotacion de inventario.
 * Muestra para cada insumo el total ingresado, consumido, mermado
 * y el indice de rotacion (%), con barra de progreso coloreada.
 * Permite filtrar por rango de fechas e insumo especifico, y
 * descargar el reporte en PDF o Excel.
 * Sigue el patron de ReporteCostos.tsx.
 * ============================================================
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  BarChart3,
  Loader2,
  FileDown,
  FileSpreadsheet,
  TrendingUp,
  AlertTriangle,
  PackageSearch,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AppHeader from "@/components/AppHeader";

import { insumoService, type Insumo } from "@/services/insumoServices";
import {
  getReporteRotacion,
  descargarRotacionPDF,
  descargarRotacionExcel,
  type ItemReporteRotacion,
  type FiltrosRotacion,
} from "@/services/reporteRotacionService";

export default function ReporteRotacion() {
  const navigate = useNavigate();

  // ── Estado de filtros ──────────────────────────────────────
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");
  const [insumoIdFiltro, setInsumoIdFiltro] = useState<string>("todos");

  // ── Estado del reporte ─────────────────────────────────────
  const [reporte, setReporte] = useState<ItemReporteRotacion[]>([]);
  const [totalInsumos, setTotalInsumos] = useState<number>(0);
  const [mayorRotacion, setMayorRotacion] = useState<ItemReporteRotacion | null>(null);
  const [mayorMerma, setMayorMerma] = useState<ItemReporteRotacion | null>(null);

  // ── Estado de UI ────────────────────────────────────────────
  const [cargando, setCargando] = useState(true);
  const [descargandoPDF, setDescargandoPDF] = useState(false);
  const [descargandoExcel, setDescargandoExcel] = useState(false);

  // ── Cargar catalogo de insumos y reporte inicial ────────────
  useEffect(() => {
    async function cargarInicial() {
      try {
        setCargando(true);
        const listaInsumos = await insumoService.getAll();
        setInsumos(listaInsumos);
        await cargarReporte({});
      } catch {
        toast.error("No se pudo cargar el reporte de rotacion.");
      } finally {
        setCargando(false);
      }
    }
    cargarInicial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cargarReporte(filtros: FiltrosRotacion) {
    const data = await getReporteRotacion(filtros);
    setReporte(data.reporte);
    setTotalInsumos(data.total_insumos);
    setMayorRotacion(data.insumo_mayor_rotacion);
    setMayorMerma(data.insumo_mayor_merma);
  }

  function obtenerFiltrosActuales(): FiltrosRotacion {
    return {
      fecha_desde: fechaDesde || undefined,
      fecha_hasta: fechaHasta || undefined,
      insumo_id: insumoIdFiltro !== "todos" ? Number(insumoIdFiltro) : undefined,
    };
  }

  async function handleGenerarReporte() {
    try {
      setCargando(true);
      await cargarReporte(obtenerFiltrosActuales());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al generar el reporte.";
      toast.error(msg);
    } finally {
      setCargando(false);
    }
  }

  async function handleDescargarPDF() {
    try {
      setDescargandoPDF(true);
      await descargarRotacionPDF(obtenerFiltrosActuales());
      toast.success("PDF descargado correctamente.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al descargar el PDF.";
      toast.error(msg);
    } finally {
      setDescargandoPDF(false);
    }
  }

  async function handleDescargarExcel() {
    try {
      setDescargandoExcel(true);
      await descargarRotacionExcel(obtenerFiltrosActuales());
      toast.success("Excel descargado correctamente.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al descargar el Excel.";
      toast.error(msg);
    } finally {
      setDescargandoExcel(false);
    }
  }

  // ── Coloreado de barra de progreso ──────────────────────────
  function colorRotacion(rotacion: number): string {
    if (rotacion >= 66) return "#22c55e"; // green-500
    if (rotacion >= 33) return "#facc15"; // yellow-400
    return "#ef4444"; // red-500
  }

  function badgeRotacion(rotacion: number) {
    if (rotacion >= 66) {
      return (
        <Badge className="bg-green-100 text-green-700 border-0 gap-1">
          <TrendingUp className="h-3 w-3" />
          {rotacion.toFixed(1)}%
        </Badge>
      );
    }
    if (rotacion >= 33) {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-0">
          {rotacion.toFixed(1)}%
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-700 border-0 gap-1">
        <AlertTriangle className="h-3 w-3" />
        {rotacion.toFixed(1)}%
      </Badge>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Boton volver ── */}
        <Button
          variant="ghost"
          className="mb-6 gap-2 text-gray-500 hover:text-gray-700 -ml-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>

        {/* ── Encabezado y filtros ── */}
        <Card className="rounded-3xl shadow-md border-0 bg-white mb-6">
          <CardHeader className="pb-2 px-8 pt-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-50">
                <BarChart3 className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Reporte de Rotacion de Inventario
                </CardTitle>
                <p className="text-sm text-gray-400 mt-0.5">
                  Ingresos, consumo, merma e indice de rotacion por insumo en el periodo seleccionado.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8 pt-6">
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-end">

              {/* Desde */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Desde</label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="h-11 rounded-xl border border-gray-200 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                />
              </div>

              {/* Hasta */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Hasta</label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="h-11 rounded-xl border border-gray-200 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                />
              </div>

              {/* Insumo */}
              <div className="space-y-1.5 flex-1 min-w-[180px]">
                <label className="text-sm font-medium text-gray-700">Insumo (opcional)</label>
                <Select value={insumoIdFiltro} onValueChange={setInsumoIdFiltro}>
                  <SelectTrigger className="rounded-xl h-11 border-gray-200">
                    <SelectValue placeholder="Todos los insumos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los insumos</SelectItem>
                    {insumos.map((ins) => (
                      <SelectItem key={ins.id} value={String(ins.id)}>
                        {ins.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Generar */}
              <Button
                className="h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white gap-2"
                onClick={handleGenerarReporte}
                disabled={cargando}
              >
                {cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
                Generar Reporte
              </Button>

              {/* Descargas */}
              <Button
                variant="outline"
                className="h-11 rounded-xl gap-2 border-gray-200 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleDescargarPDF}
                disabled={descargandoPDF || cargando}
              >
                {descargandoPDF ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4" />
                )}
                Descargar PDF
              </Button>
              <Button
                variant="outline"
                className="h-11 rounded-xl gap-2 border-gray-200 text-green-700 hover:text-green-800 hover:bg-green-50"
                onClick={handleDescargarExcel}
                disabled={descargandoExcel || cargando}
              >
                {descargandoExcel ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4" />
                )}
                Descargar Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Tarjetas resumen ── */}
        {!cargando && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

            {/* Total insumos */}
            <Card className="rounded-3xl shadow-md border-0 bg-white">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-orange-50">
                  <PackageSearch className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total insumos analizados</p>
                  <p className="text-2xl font-bold text-gray-900">{totalInsumos}</p>
                </div>
              </CardContent>
            </Card>

            {/* Mayor rotacion */}
            <Card className="rounded-3xl shadow-md border-0 bg-white">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-50">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Mayor rotacion</p>
                  <p className="text-base font-bold text-gray-900 leading-tight">
                    {mayorRotacion ? mayorRotacion.nombre : "N/D"}
                  </p>
                  {mayorRotacion && (
                    <p className="text-sm text-green-600 font-medium">
                      {mayorRotacion.rotacion.toFixed(1)}%
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Mayor merma */}
            <Card className="rounded-3xl shadow-md border-0 bg-white">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-red-50">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Mayor merma</p>
                  <p className="text-base font-bold text-gray-900 leading-tight">
                    {mayorMerma ? mayorMerma.nombre : "N/D"}
                  </p>
                  {mayorMerma && (
                    <p className="text-sm text-red-600 font-medium">
                      {mayorMerma.total_mermado.toFixed(2)} unidades
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Tabla ── */}
        <Card className="rounded-3xl shadow-md border-0 bg-white">
          <CardContent className="p-8">
            {cargando ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3 text-gray-400">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
                  <p className="text-sm">Calculando reporte de rotacion...</p>
                </div>
              </div>
            ) : reporte.length === 0 ? (
              <p className="text-sm text-gray-400 italic py-8 text-center bg-gray-50 rounded-xl">
                No hay movimientos registrados para el periodo y filtros seleccionados.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Insumo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Total Ingresado</TableHead>
                      <TableHead className="text-right">Total Consumido</TableHead>
                      <TableHead className="text-right">Total Mermado</TableHead>
                      <TableHead className="text-center w-48">Rotacion</TableHead>
                      <TableHead className="text-right">Stock Actual</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reporte.map((item) => (
                      <TableRow key={item.insumo_id}>
                        <TableCell className="font-medium text-gray-800">
                          {item.nombre}
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {item.categoria || "-"}
                        </TableCell>
                        <TableCell className="text-right text-gray-600">
                          {item.total_ingresado.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-gray-600">
                          {item.total_consumido.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-gray-600">
                          {item.total_mermado.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            {badgeRotacion(item.rotacion)}
                            {/* Barra de progreso coloreada segun indice de rotacion */}
                            <div className="relative h-1.5 w-28 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min(item.rotacion, 100)}%`,
                                  backgroundColor: colorRotacion(item.rotacion),
                                }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-gray-600">
                          {item.stock_actual.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
