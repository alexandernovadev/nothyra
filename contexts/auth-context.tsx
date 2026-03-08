import React, { createContext, useCallback, useContext, useState } from 'react';

// Credenciales quemadas por ahora (Firebase después)
const MOCK_EMAIL = 't@t.com';
const MOCK_PASSWORD = 'mypass';

type AuthState = {
  isAuthenticated: boolean;
  email: string | null;
};

type AuthContextType = {
  isAuthenticated: boolean;
  email: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    email: null,
  });

  const login = useCallback(async (email: string, password: string) => {
    // Validación quemada
    if (email === MOCK_EMAIL && password === MOCK_PASSWORD) {
      setState({ isAuthenticated: true, email });
      return { success: true };
    }
    return { success: false, error: 'Email o contraseña incorrectos' };
  }, []);

  const logout = useCallback(() => {
    setState({ isAuthenticated: false, email: null });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: state.isAuthenticated,
        email: state.email,
        login,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
