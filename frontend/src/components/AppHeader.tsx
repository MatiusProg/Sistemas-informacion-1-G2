import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import { LogOut, User as UserIcon, Users } from "lucide-react";

export default function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!user) return null;

  const isChef = user.rol === "chef";

  return (
    <header className="bg-card border-b border-border shadow-card sticky top-0 z-40">
      <div className="container flex items-center justify-between py-4">
        <Link to="/perfil"><Logo size={isChef ? "md" : "sm"} /></Link>
        <nav className="flex items-center gap-2">
          <Button
            variant={pathname === "/perfil" ? "default" : "ghost"}
            size={isChef ? "lg" : "default"}
            className={isChef ? "chef-touch px-6" : ""}
            onClick={() => navigate("/perfil")}
          >
            <UserIcon className="mr-2 h-5 w-5" /> Perfil
          </Button>
          {user.rol === "administrador" && (
            <Button
              variant={pathname === "/admin" ? "default" : "ghost"}
              onClick={() => navigate("/admin")}
            >
              <Users className="mr-2 h-5 w-5" /> Usuarios
            </Button>
          )}
          <Button
            variant="outline"
            size={isChef ? "lg" : "default"}
            className={isChef ? "chef-touch px-6" : ""}
            onClick={() => { logout(); navigate("/login"); }}
          >
            <LogOut className="mr-2 h-5 w-5" /> Salir
          </Button>
        </nav>
      </div>
    </header>
  );
}
