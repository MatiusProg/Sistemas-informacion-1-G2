/**
 * ============================================================
 * ARCHIVO: frontend/src/pages/Menus.tsx
 * CASO DE USO: CU20 - Gestionar Menús
 * FECHA: 17/05/26
 * DESCRIPCIÓN: Página para administrar menús desde la tabla de Supabase.
 *   - Listar menús
 *   - Crear nuevo menú
 *   - Editar menú existente
 *   - Eliminar menú
 * ============================================================
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { menuService, MenuRecord } from "@/services/menuServices";

const initialForm: MenuRecord = {
  nombre: "",
  descripcion: "",
  temporada: "",
};

export default function Menus() {
  const navigate = useNavigate();
  const [menus, setMenus] = useState<MenuRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuRecord | null>(null);
  const [form, setForm] = useState<MenuRecord>(initialForm);

  useEffect(() => {
    cargarMenus();
  }, []);

  const cargarMenus = async () => {
    try {
      setLoading(true);
      setMenus(await menuService.getAll());
    } catch (error) {
      console.error(error);
      toast.error("No se pudo cargar la lista de menús");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingMenu(null);
    setForm(initialForm);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.nombre.trim()) {
      toast.error("El nombre del menú es obligatorio");
      return;
    }

    try {
      setSaving(true);
      if (editingMenu?.id) {
        await menuService.update(editingMenu.id, {
          nombre: form.nombre,
          descripcion: form.descripcion,
          temporada: form.temporada,
        });
        toast.success("Menú actualizado correctamente");
      } else {
        await menuService.create({
          nombre: form.nombre,
          descripcion: form.descripcion,
          temporada: form.temporada,
        });
        toast.success("Menú creado correctamente");
      }
      resetForm();
      cargarMenus();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar el menú");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (menu: MenuRecord) => {
    setEditingMenu(menu);
    setForm({
      nombre: menu.nombre || "",
      descripcion: menu.descripcion || "",
      temporada: menu.temporada || "",
      id: menu.id,
    });
  };

  const handleDelete = async (menu: MenuRecord) => {
    if (!menu.id) return;
    if (!confirm(`¿Eliminar el menú "${menu.nombre}"? Esta acción no se puede deshacer.`)) return;

    try {
      await menuService.delete(menu.id);
      toast.success("Menú eliminado");
      cargarMenus();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo eliminar el menú");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <AppHeader />
      <main className="container py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gestionar Menús</h1>
            <p className="text-muted-foreground">Administra los menús de la tabla Menú en Supabase.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" /> Volver
            </Button>
            <Button onClick={resetForm} variant="outline">
              <Plus className="h-4 w-4" /> Nuevo Menú
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <div className="bg-white rounded-3xl shadow-card p-6 border">
            <h2 className="text-xl font-semibold mb-4">{editingMenu ? "Editar menú" : "Nuevo menú"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <Input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Menú Ejecutivo"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <Textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Descripción breve del menú"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Temporada</label>
                <select
                  value={form.temporada}
                  onChange={(e) => setForm({ ...form, temporada: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  required
                >
                  <option value="">Seleccione una temporada</option>
                  <option value="Verano">Verano</option>
                  <option value="Invierno">Invierno</option>
                  <option value="Otoño">Otoño</option>
                  <option value="Primavera">Primavera</option>
                  <option value="Todo Año">Todo Año</option>
                </select>
              </div>
              <Button type="submit" disabled={saving}>
                {editingMenu ? "Guardar cambios" : "Crear menú"}
              </Button>
            </form>
          </div>

          <div className="bg-white rounded-3xl shadow-card p-6 border overflow-x-auto">
            <h2 className="text-xl font-semibold mb-4">Menús registrados</h2>
            {loading ? (
              <p className="text-muted-foreground">Cargando menús...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead>Nombre</TableHead>
                    <TableHead>Temporada</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menus.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                        No hay menús registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    menus.map((menu) => (
                      <TableRow key={menu.id ?? menu.nombre}>
                        <TableCell>{menu.nombre}</TableCell>
                        <TableCell>{menu.temporada || "—"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(menu)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(menu)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
