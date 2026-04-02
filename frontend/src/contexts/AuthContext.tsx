// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const token = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');
      if (token && storedUser) return JSON.parse(storedUser) as AuthUser;
    } catch {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
    return null;
  });
  const [loading] = useState(false);

  const login = useCallback(async (email: string) => {
    const res = await api.post<{ token: string; user: AuthUser }>(
      '/api/auth/login',
      { email }
    );
    localStorage.setItem('auth_token', res.token);
    localStorage.setItem('auth_user', JSON.stringify(res.user));
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
