import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, Role } from "@/context/AuthContext";
import { ChefHat, ShieldCheck, User, LogOut, Edit3, Save, X, Mail, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

// ✅ Roles actualizados
const ROLE_META: Record<Role, { label: string; icon: React.ElementType; color: string }> = {
  chef: { label: "Chef", icon: ChefHat, color: "from-primary to-primary-glow" },
  administrador: { label: "Administrador", icon: ShieldCheck, color: "from-accent to-primary" },
  usuario: { label: "Usuario", icon: User, color: "from-primary-glow to-primary" },
};

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.nombre ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  if (!user) return null;
  
  const meta = ROLE_META[user.rol] || ROLE_META.usuario;
  const Icon = meta.icon;
  const isChef = user.rol === "chef";

  const save = async () => {
    await updateProfile({ nombre: name, email });
    setEditing(false);
    toast.success("Perfil actualizado");
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <AppHeader />
      <main className="container py-8 lg:py-14 max-w-3xl">
        <div className="bg-card rounded-3xl shadow-card overflow-hidden">
          {/* Banner */}
          <div className={`h-40 bg-gradient-to-br ${meta.color} relative`}>
            <div className="absolute -bottom-12 left-8 lg:left-12">
              <div className="h-24 w-24 lg:h-28 lg:w-28 rounded-3xl bg-card border-4 border-card shadow-soft grid place-items-center">
                <Icon className="h-12 w-12 lg:h-14 lg:w-14 text-primary" />
              </div>
            </div>
          </div>

          <div className="pt-16 lg:pt-20 px-6 lg:px-12 pb-8 lg:pb-12">
            {!editing ? (
              <>
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h1 className="text-3xl lg:text-4xl font-bold">{user.nombre}</h1>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                    {meta.label}
                  </span>
                </div>
                <p className="text-muted-foreground text-lg flex items-center gap-2 mb-8">
                  <Mail className="h-5 w-5" /> {user.email}
                </p>

                <div className="grid sm:grid-cols-2 gap-3 max-w-xl">
                  <Button
                    size="lg"
                    onClick={() => setEditing(true)}
                    className={`${isChef ? "chef-touch text-lg" : ""} shadow-soft`}
                  >
                    <Edit3 className="mr-2 h-5 w-5" /> Editar Perfil
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={async () => { 
                      await logout(); 
                      navigate("/login"); 
                      toast.success("Sesión cerrada"); 
                    }}
                    className={isChef ? "chef-touch text-lg" : ""}
                  >
                    <LogOut className="mr-2 h-5 w-5" /> Cerrar Sesión
                  </Button>
                </div>

                {isChef && (
                  <div className="mt-10 p-6 rounded-2xl bg-secondary/50 border border-border">
                    <h3 className="font-bold text-lg mb-2">👨‍🍳 Bienvenido, Chef</h3>
                    <p className="text-muted-foreground">
                      Tu interfaz está pensada para uso rápido en cocina: botones grandes, contraste alto y navegación táctil.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-5 max-w-xl">
                <h2 className="text-2xl font-bold">Editar Perfil</h2>
                <div className="space-y-2">
                  <Label className="text-base">Nombre</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input value={name} onChange={(e) => setName(e.target.value)} className="chef-touch pl-12" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-base">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="chef-touch pl-12" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button size="lg" onClick={save} className={`${isChef ? "chef-touch" : ""} flex-1 shadow-soft`}>
                    <Save className="mr-2 h-5 w-5" /> Guardar
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => { 
                    setEditing(false); 
                    setName(user.nombre); 
                    setEmail(user.email); 
                  }}
                    className={`${isChef ? "chef-touch" : ""} flex-1`}>
                    <X className="mr-2 h-5 w-5" /> Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}