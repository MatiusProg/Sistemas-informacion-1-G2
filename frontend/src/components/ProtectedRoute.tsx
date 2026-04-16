import { Navigate } from "react-router-dom";
import { useAuth, Role } from "@/context/AuthContext";

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
