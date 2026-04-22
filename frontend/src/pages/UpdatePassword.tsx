import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";


export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    const search = location.search;
    
    let accessToken: string | null = null;
    let refreshToken: string | null = null;
    let type: string | null = null;

    // Intentar obtener de la query string (?token_hash=...)
    if (search) {
        const params = new URLSearchParams(search);
        accessToken = params.get("token_hash");
        refreshToken = params.get("refresh_token");
        type = params.get("type");
    }

    // Si no hay en query string, intentar del hash (#access_token=...)
    if (!accessToken && hash) {
        const params = new URLSearchParams(hash.substring(1));
        accessToken = params.get("access_token");
        refreshToken = params.get("refresh_token");
        type = params.get("type");
    }

    if (accessToken && type === "recovery") {
        // 🔥 LIMPIEZA NUCLEAR: Borrar TODO el localStorage/sessionStorage
        Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
            localStorage.removeItem(key);
        }
        });
        
        Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
            sessionStorage.removeItem(key);
        }
        });

        // Establecer la nueva sesión con el token
        supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || "",
        }).then(({ data, error }) => {
        if (error) {
            console.error("Error setting session:", error);
            toast.error("El enlace de recuperación no es válido o ha expirado.");
            navigate("/login");
        } else {
            if (data.user?.email) {
            setEmail(data.user.email);
            }
            toast.success(`Restableciendo contraseña para ${data.user?.email || 'tu cuenta'}`);
        }
        });
    } else if (search || hash) {
        // Si hay parámetros pero no son válidos
        toast.error("El enlace de recuperación no es válido o ha expirado.");
        navigate("/login");
    }
    // Si no hay ni search ni hash, simplemente mostramos el formulario (por si alguien llega manualmente)
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
    
    // Actualizar la contraseña del usuario con la sesión activa
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      console.error("Error updating password:", error);
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success(`¡Contraseña actualizada con éxito para ${email || 'tu cuenta'}!`);
      
      // Cerrar sesión después de actualizar
      await supabase.auth.signOut();
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-soft p-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="bg-card p-8 rounded-3xl shadow-card space-y-5">
          <h2 className="text-2xl font-bold text-center">Crear Nueva Contraseña</h2>
          
          {email && (
            <p className="text-sm text-center bg-primary/10 text-primary py-2 px-4 rounded-full">
              Para: <strong>{email}</strong>
            </p>
          )}
          
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
              autoComplete="new-password"
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
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" className="w-full chef-touch text-lg" disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar Contraseña"}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Al actualizar, se cerrará tu sesión y deberás iniciar sesión nuevamente.
          </p>
        </form>
      </div>
    </div>
  );
}