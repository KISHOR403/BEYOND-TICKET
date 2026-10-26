import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  demoLogin: (role: "customer" | "organizer" | "admin") => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("beyond_access_token");
    const savedUser = localStorage.getItem("beyond_user");
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.clear();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login/", { email, password });
    const { access, refresh } = res.data;
    localStorage.setItem("beyond_access_token", access);
    localStorage.setItem("beyond_refresh_token", refresh);
    setToken(access);

    // Fetch user profile
    const profileRes = await api.get("/auth/profile/", {
      headers: { Authorization: `Bearer ${access}` },
    });
    const userData = profileRes.data;
    setUser(userData);
    localStorage.setItem("beyond_user", JSON.stringify(userData));
  };

  const register = async (data: any) => {
    await api.post("/auth/register/", data);
    await login(data.email, data.password);
  };

  const logout = () => {
    localStorage.removeItem("beyond_access_token");
    localStorage.removeItem("beyond_refresh_token");
    localStorage.removeItem("beyond_user");
    setUser(null);
    setToken(null);
  };

  const demoLogin = async (role: "customer" | "organizer" | "admin") => {
    if (role === "admin") {
      await login("admin@beyondtickets.com", "Admin@123456");
    } else if (role === "organizer") {
      try {
        await login("organizer@beyondtickets.com", "Organizer@123");
      } catch {
        // Fallback or auto-register demo organizer
        await register({
          email: "organizer@beyondtickets.com",
          username: "demorganizer",
          first_name: "Event",
          last_name: "Organizer",
          password: "Organizer@123",
          role: "organizer",
        });
      }
    } else {
      try {
        await login("customer@example.com", "Customer@123");
      } catch {
        // Fallback or auto-register demo customer
        await register({
          email: "customer@example.com",
          username: "democustomer",
          first_name: "Aarav",
          last_name: "Sharma",
          password: "Customer@123",
          role: "customer",
        });
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
