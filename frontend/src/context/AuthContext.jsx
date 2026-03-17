import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await api.get('/users/profile');
        setUser(response.data);
      } catch (error) {
        // If profile fetch fails, clear user and local token
        setUser(null);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/users/login', { email, password });
      setUser(response.data);
      // Store token in localStorage as fallback for cross-site cookie issues
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      toast.success('Logged in successfully!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await api.post('/users', { username, email, password });
      setUser(response.data);
      // Store token in localStorage as fallback
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return { success: false };
    }
  };

  const logout = async () => {
    try {
      await api.post('/users/logout');
      setUser(null);
      localStorage.removeItem('token');
      toast.success('Logged out successfully!');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
