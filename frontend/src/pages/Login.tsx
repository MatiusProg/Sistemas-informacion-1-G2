import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Mail, Lock } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Ahora es async
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await login(email, password);
    
    setLoading(false);
    
    if (!res.ok) {
      return toast.error(res.error || "Error al iniciar sesión");
    }
    
    toast.success("¡Bienvenido de vuelta!");
    navigate("/perfil");
  };

  return (
    <AuthLayout title="Iniciar Sesión" subtitle="Accede a tu almacén gastronómico">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-base">Email</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              id="email" 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@cocina.com" 
              className="chef-touch pl-12" 
              disabled={loading}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-base">Contraseña</Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              id="password" 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="chef-touch pl-12" 
              disabled={loading}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          size="lg" 
          className="w-full chef-touch text-lg font-semibold shadow-soft"
          disabled={loading}
        >
          {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </Button>

        <div className="flex flex-col items-center gap-3 pt-2 text-sm">
          <Link to="/recuperar" className="text-primary font-medium hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
          <p className="text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link to="/registro" className="text-primary font-semibold hover:underline">Regístrate</Link>
          </p>
        </div>

        {/* ✅ Cuentas demo actualizadas con roles correctos */}
        <div className="rounded-xl bg-secondary/60 p-4 text-xs text-muted-foreground space-y-1 mt-4">
          <p className="font-semibold text-foreground">Cuentas de prueba:</p>
          <p>👨‍🍳 chef@cocina.com / chef123</p>
          <p>🛡️ admin@cocina.com / admin123</p>
          <p>👤 usuario@cocina.com / usuario123</p>
        </div>
      </form>
    </AuthLayout>
  );
}