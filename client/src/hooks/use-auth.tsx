import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@shared/schema";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    fetch("/api/user", {
      credentials: "include" // Add credentials to include cookies
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Not authenticated");
      })
      .then((userData) => setUser(userData))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Add credentials to include cookies
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const userData = await response.json();
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    const response = await fetch("/api/logout", {
      method: "POST",
      credentials: "include" // Add credentials to include cookies
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}