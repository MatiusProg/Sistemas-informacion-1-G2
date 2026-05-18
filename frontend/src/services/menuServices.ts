import { supabase } from "@/lib/supabase";

const MENU_TABLES = ["Menu", "menus", "menu"];
let resolvedTableName: string | null = null;

async function resolveMenuTable(): Promise<string> {
  if (resolvedTableName) return resolvedTableName;

  for (const table of MENU_TABLES) {
    const { error } = await supabase.from(table).select("id").limit(1);
    if (!error) {
      resolvedTableName = table;
      return table;
    }
  }

  throw new Error("No se encontró la tabla de Menús en Supabase");
}

export interface MenuRecord {
  id?: number;
  nombre: string;
  descripcion: string;
  temporada: string;
}

export const menuService = {
  getAll: async (): Promise<MenuRecord[]> => {
    const table = await resolveMenuTable();
    const { data, error } = await supabase.from<MenuRecord>(table).select("*").order("id", { ascending: true });
    if (error) throw new Error(error.message || "Error al cargar menús");
    return data || [];
  },

  create: async (menu: MenuRecord): Promise<MenuRecord> => {
    const table = await resolveMenuTable();
    const { data, error } = await supabase.from<MenuRecord>(table).insert(menu).single();
    if (error) throw new Error(error.message || "Error al crear el menú");
    return data as MenuRecord;
  },

  update: async (id: number, menu: Partial<MenuRecord>): Promise<MenuRecord> => {
    const table = await resolveMenuTable();
    const { data, error } = await supabase.from<MenuRecord>(table).update(menu).eq("id", id).single();
    if (error) throw new Error(error.message || "Error al actualizar el menú");
    return data as MenuRecord;
  },

  delete: async (id: number): Promise<void> => {
    const table = await resolveMenuTable();
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw new Error(error.message || "Error al eliminar el menú");
  },
};
