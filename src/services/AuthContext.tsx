import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from './api';

export interface User {
  id: string;
  nombre: string;
  rut: string;
  email: string;
  region?: string;
  comuna?: string;
  role: 'paciente' | 'admin';
  avatar?: string;
}

export type ActiveRole = 'paciente' | 'admin';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isStaff: boolean;
  activeRole: ActiveRole;
  showRoleSelector: boolean;
  loading: boolean;
  error: string | null;
  // Auth actions
  initiateClaveUnica: (isAdminFlow?: boolean) => void;
  handleClaveUnicaCallback: (code: string, state: string) => Promise<void>;
  loginWithCredentials: (rut: string, password: string) => Promise<void>;
  registerPatient: (form: any) => Promise<void>;
  // Role management
  selectRole: (role: ActiveRole) => void;
  setShowRoleSelector: (show: boolean) => void;
  // Logout
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isStaff: false,
  activeRole: 'paciente',
  showRoleSelector: false,
  loading: false,
  error: null,
  initiateClaveUnica: () => { },
  handleClaveUnicaCallback: async () => { },
  loginWithCredentials: async () => { },
  registerPatient: async () => { },
  selectRole: () => { },
  setShowRoleSelector: () => { },
  logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<ActiveRole>('paciente');
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;
  // En SaludSD, si el rol del usuario retornado es admin, es funcionario.
  const isStaff = user ? user.role === 'admin' : false;

  // Cargar usuario persistido al arrancar
  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('saludsd_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        const loggedUser = res.data.user;
        setUser(loggedUser);

        // Cargar rol guardado o por defecto
        const savedRole = localStorage.getItem('saludsd_active_role') as ActiveRole;
        if (savedRole) {
          setActiveRole(savedRole);
        } else {
          setActiveRole(loggedUser.role);
        }
      } catch (err) {
        console.error('Error al restaurar sesión:', err);
        localStorage.removeItem('saludsd_token');
      } finally {
        setLoading(false);
      }
    };

    fetchMe();

    // Escuchar el evento 401 del interceptor
    const handleUnauthorized = () => {
      setUser(null);
      setActiveRole('paciente');
      setShowRoleSelector(false);
      localStorage.removeItem('saludsd_token');
      localStorage.removeItem('saludsd_active_role');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  /**
   * Inicia el flujo de ClaveÚnica.
   * Redirige al callback simulado.
   * Si isAdminFlow es true, simulamos que se autentica un funcionario (Dr. Carlos Muñoz).
   */
  const initiateClaveUnica = (isAdminFlow: boolean = false) => {
    setError(null);
    setLoading(true);

    // Simular el redireccionamiento de ClaveÚnica al callback de nuestra app
    const code = isAdminFlow ? 'mock_admin_code' : 'mock_patient_code';
    const state = isAdminFlow ? 'mock_admin_state' : 'mock_patient_state';

    // Redirigir a nuestro Callback
    window.location.href = `/auth/callback?code=${code}&state=${state}`;
  };

  /**
   * Procesa el código devuelto por ClaveÚnica y obtiene el JWT firmado por el backend
   */
  const handleClaveUnicaCallback = async (code: string, state: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/claveunica/callback', { code, state });
      const { token, user: loggedUser } = res.data;

      localStorage.setItem('saludsd_token', token);
      setUser(loggedUser);

      // Si es funcionario, mostramos el selector de rol
      if (loggedUser.role === 'admin') {
        setShowRoleSelector(true);
      } else {
        setActiveRole('paciente');
        localStorage.setItem('saludsd_active_role', 'paciente');
        setShowRoleSelector(false);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Error al autenticar con ClaveÚnica.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Inicio de sesión local con RUT y Contraseña
   */
  const loginWithCredentials = async (rut: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { rut, password });
      const { token, user: loggedUser } = res.data;

      localStorage.setItem('saludsd_token', token);
      setUser(loggedUser);

      if (loggedUser.role === 'admin') {
        setShowRoleSelector(true);
      } else {
        setActiveRole('paciente');
        localStorage.setItem('saludsd_active_role', 'paciente');
        setShowRoleSelector(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Credenciales inválidas.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registro local de paciente
   */
  const registerPatient = async (form: any) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      const { token, user: loggedUser } = res.data;

      localStorage.setItem('saludsd_token', token);
      setUser(loggedUser);
      setActiveRole('paciente');
      localStorage.setItem('saludsd_active_role', 'paciente');
      setShowRoleSelector(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrar paciente.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Seleccionar rol (para funcionarios con acceso dual)
   */
  const selectRole = (role: ActiveRole) => {
    setActiveRole(role);
    localStorage.setItem('saludsd_active_role', role);
    setShowRoleSelector(false);
  };

  /**
   * Cerrar Sesión local y limpiar localStorage
   */
  const logout = () => {
    setUser(null);
    setActiveRole('paciente');
    setShowRoleSelector(false);
    localStorage.removeItem('saludsd_token');
    localStorage.removeItem('saludsd_active_role');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isStaff,
      activeRole,
      showRoleSelector,
      loading,
      error,
      initiateClaveUnica,
      handleClaveUnicaCallback,
      loginWithCredentials,
      registerPatient,
      selectRole,
      setShowRoleSelector,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
