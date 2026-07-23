import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore the session from a stored token.
  useEffect(() => {
    const token = localStorage.getItem('td_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem('td_token'))
      .finally(() => setLoading(false));
  }, []);

  const handleAuth = useCallback((data) => {
    localStorage.setItem('td_token', data.token);
    setUser(data.user);
  }, []);

  const login = useCallback(
    async (email, password) => handleAuth(await api.login({ email, password })),
    [handleAuth]
  );

  const signup = useCallback(
    async (name, email, password) => handleAuth(await api.signup({ name, email, password })),
    [handleAuth]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('td_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
