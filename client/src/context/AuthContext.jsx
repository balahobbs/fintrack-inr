import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('fintrack_token'));

  useEffect(() => {
    if (!localStorage.getItem('fintrack_token')) return;
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem('fintrack_token'))
      .finally(() => setLoading(false));
  }, []);

  const authenticate = async (path, body) => {
    const { data } = await api.post(path, body);
    localStorage.setItem('fintrack_token', data.token);
    setUser(data.user);
  };

  const value = {
    user,
    loading,
    login: (body) => authenticate('/auth/login', body),
    register: (body) => authenticate('/auth/register', body),
    logout: () => {
      localStorage.removeItem('fintrack_token');
      setUser(null);
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
