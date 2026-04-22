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
    const search = location.search;
    
    if (search) {
        const params = new URLSearchParams(search);
        const tokenHash = params.get("token_hash");
        const type = params.get("type");

        if (tokenHash && type === "recovery") {
        // 🔥 Verificar el token OTP (One-Time Password)
        supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery'
        }).then(({ data, error }) => {
            if (error) {
            console.error("Error verificando OTP:", error);
            toast.error("El enlace de recuperación no es válido o ha expirado.");
            navigate("/login");
            } else {
              // 🔥 GUARDAR EL TOKEN MANUALMENTE
              if (data.session?.access_token) {
                localStorage.setItem("access_token", data.session.access_token);
                localStorage.setItem("refresh_token", data.session.refresh_token || "");
              }
              // Token verificado correctamente. Ahora el usuario tiene una sesión activa.
              if (data.user?.email) {
                  setEmail(data.user.email);
              }
              toast.success(`Restableciendo contraseña para ${data.user?.email || 'tu cuenta'}`);
            }
        });
        } else {
        toast.error("El enlace de recuperación no es válido o ha expirado.");
        navigate("/login");
        }
    }
     }, [location, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación de contraseña fuerte
    if (password.length < 8) {
    toast.error("La contraseña debe tener al menos 8 caracteres.");
    return;
    }
    if (!/[A-Z]/.test(password)) {
    toast.error("La contraseña debe contener al menos una letra mayúscula.");
    return;
    }
    if (!/[a-z]/.test(password)) {
    toast.error("La contraseña debe contener al menos una letra minúscula.");
    return;
    }
    if (!/[0-9]/.test(password)) {
    toast.error("La contraseña debe contener al menos un número.");
    return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    toast.error("La contraseña debe contener al menos un carácter especial (!@#$%^&*...).");
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

      // Después de supabase.auth.updateUser() exitoso
      // Registrar en bitácora
      try {
        const token = localStorage.getItem("access_token");
        if (token) {
          await fetch(`${import.meta.env.VITE_API_URL}/auth/log-password-reset/`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
          });
        }
      } catch (e) {
        console.warn("No se pudo registrar en bitácora:", e);
      }

      toast.success(`¡Contraseña actualizada con éxito para ${email || 'tu cuenta'}!`);
      
      // Cerrar sesión después de actualizar
      await supabase.auth.signOut();

      // Limpiar localStorage por seguridad
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate("/login");
      }, 2000);

      setLoading(false);
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