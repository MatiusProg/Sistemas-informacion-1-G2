import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Este useEffect captura el token de la URL y lo guarda en la sesión
  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");

      if (accessToken && type === "recovery") {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || "",
        });
        toast.success("Ahora puedes crear tu nueva contraseña.");
      } else {
        toast.error("El enlace de recuperación no es válido o ha expirado.");
        navigate("/login");
      }
    }
  }, [location, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("¡Contraseña actualizada con éxito!");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-soft p-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="bg-card p-8 rounded-3xl shadow-card space-y-5">
          <h2 className="text-2xl font-bold text-center">Crear Nueva Contraseña</h2>
          <p className="text-sm text-muted-foreground text-center">
            Ingresa y confirma tu nueva contraseña.
          </p>
          
          <div className="space-y-2">
            <Label>Nueva Contraseña</Label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="chef-touch"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Confirmar Contraseña</Label>
            <Input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="chef-touch"
            />
          </div>

          <Button type="submit" className="w-full chef-touch text-lg" disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar Contraseña"}
          </Button>
        </form>
      </div>
    </div>
  );
}