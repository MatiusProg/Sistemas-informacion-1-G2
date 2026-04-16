import { createContext, useContext, useState, ReactNode, useEffect } from "react";

// Roles del sistema (según documento del proyecto)
export type Role = "chef" | "administrador" | "usuario";

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: Role;
  activo?: boolean;
}

interface AuthContextValue {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: { nombre: string; email: string; password: string; rol: Role }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Pick<User, "nombre" | "email">>) => Promise<void>;
  changeUserRole: (id: string, rol: Role) => Promise<void>;
  toggleUserActive: (id: string) => Promise<void>;
  requestReset: (email: string) => Promise<{ ok: boolean; error?: string }>;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Restaurar sesión desde localStorage
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // Cargar lista de usuarios (solo para admin)
  const refreshUsers = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/auth/users/`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  useEffect(() => {
    if (user?.rol === "administrador") {
      refreshUsers();
    }
  }, [user]);

  const login: AuthContextValue["login"] = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        return { ok: false, error: error.error || "Credenciales inválidas" };
      }

      const data = await response.json();
      
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      
      // Obtener perfil completo
      const profileResponse = await fetch(`${API_URL}/auth/profile/`, {
        headers: { "Authorization": `Bearer ${data.access_token}` }
      });
      
      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        const userData: User = {
          id: profile.id,
          nombre: profile.nombre,
          email: profile.email,
          rol: profile.rol as Role,
        };
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      } else {
        // Fallback con datos básicos
        const userData: User = {
          id: data.user.id,
          nombre: data.user.email.split("@")[0],
          email: data.user.email,
          rol: "usuario",
        };
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      }

      return { ok: true };
    } catch (error) {
      console.error("Login error:", error);
      return { ok: false, error: "Error de conexión" };
    }
  };

  const register: AuthContextValue["register"] = async (data) => {
    try {
      const response = await fetch(`${API_URL}/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        return { ok: false, error: error.error || "Error al registrar" };
      }

      // Auto-login después de registro
      return await login(data.email, data.password);
    } catch (error) {
      console.error("Register error:", error);
      return { ok: false, error: "Error de conexión" };
    }
  };

  const logout = async () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        await fetch(`${API_URL}/auth/logout/`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` }
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateProfile: AuthContextValue["updateProfile"] = async (data) => {
    const token = localStorage.getItem("access_token");
    if (!token || !user) return;

    try {
      const response = await fetch(`${API_URL}/auth/profile/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const updated = await response.json();
        const updatedUser: User = { ...user, ...updated };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      console.error("Update profile error:", error);
    }
  };

  const changeUserRole: AuthContextValue["changeUserRole"] = async (id, rol) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/auth/users/${id}/role/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ rol })
      });

      if (response.ok) {
        await refreshUsers();
      }
    } catch (error) {
      console.error("Change role error:", error);
    }
  };

  const toggleUserActive: AuthContextValue["toggleUserActive"] = async (id) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/auth/users/${id}/toggle-active/`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        await refreshUsers();
      }
    } catch (error) {
      console.error("Toggle active error:", error);
    }
  };

  const requestReset: AuthContextValue["requestReset"] = async (email) => {
    try {
      const response = await fetch(`${API_URL}/auth/reset-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const error = await response.json();
        return { ok: false, error: error.error || "Error al solicitar recuperación" };
      }

      return { ok: true };
    } catch (error) {
      console.error("Request reset error:", error);
      return { ok: false, error: "Error de conexión" };
    }
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        login,
        register,
        logout,
        updateProfile,
        changeUserRole,
        toggleUserActive,
        requestReset,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}