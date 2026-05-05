import { Navigate } from "react-router-dom";
import { useAuth, Role } from "@/context/AuthContext";

/**
 * ProtectedRoute - Componente de Protección de Rutas.
 * 
 * Este componente envuelve páginas que requieren autenticación
 * y/o roles específicos para ser accedidas.
 * 
 * Props:
 * - children: El componente hijo que se renderizará si el acceso es permitido.
 * - roles (opcional): Array de roles permitidos. Si no se especifica,
 *   cualquier usuario autenticado puede acceder.
 * 
 * Comportamiento:
 * - Si el usuario NO está autenticado: Redirige a /login.
 * - Si el usuario está autenticado pero su rol NO está en la lista:
 *   Redirige a /perfil.
 * - Si todo es correcto: Renderiza el componente hijo.
 * 
 * Uso típico:
 * <ProtectedRoute roles={["administrador"]}>
 *   <AdminUsers />
 * </ProtectedRoute>
 * 
 * Fecha: 05/05/26
 */

interface Props {
  children: React.ReactNode;
  roles?: Role[];
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.rol)) return <Navigate to="/perfil" replace />;
  return <>{children}</>;
}
