import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useState } from "react";
import type { AuthContextType } from "../types/interfaces";

// Création du contexte avec une valeur par défaut null
const AuthContext = createContext<AuthContextType | null>(null);

// Le Provider englobe toute l'app et rend le token accessible partout
export function AuthProvider({ children }: { children: ReactNode }) {
  // Le token est stocké en mémoire (pas localStorage) pour éviter les attaques XSS
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );

  const login = useCallback((newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
        isAuthenticated: token !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook custom pour utiliser le contexte facilement dans n'importe quel composant
// Ex: const { token, login } = useAuth()
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return context;
}
