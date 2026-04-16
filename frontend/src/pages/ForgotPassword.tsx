import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";

export default function ForgotPassword() {
  const { requestReset } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestReset(email);
    setSent(true);
  };

  return (
    <AuthLayout title="Recuperar Contraseña" subtitle="Te enviaremos un enlace para restablecerla">
      {sent ? (
        <div className="text-center space-y-5 py-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-success/15 grid place-items-center">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">¡Enlace enviado!</h3>
            <p className="text-muted-foreground">
              Revisa <span className="font-semibold text-foreground">{email}</span> para continuar con la recuperación.
            </p>
          </div>
          <Link to="/login">
            <Button variant="outline" size="lg" className="chef-touch w-full">
              <ArrowLeft className="mr-2 h-5 w-5" /> Volver al login
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-base">Email</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@cocina.com" className="chef-touch pl-12" />
            </div>
          </div>
          <Button type="submit" size="lg" className="w-full chef-touch text-lg font-semibold shadow-soft">
            Enviar enlace de recuperación
          </Button>
          <Link to="/login" className="flex items-center justify-center gap-2 text-primary font-medium hover:underline pt-2">
            <ArrowLeft className="h-4 w-4" /> Volver al login
          </Link>
        </form>
      )}
    </AuthLayout>
  );
}
