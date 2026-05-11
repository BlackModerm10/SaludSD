import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, mockCurrentUser, mockAdminUser } from '../services/mockData';

// ────────────────────────────────────────────
// ClaveÚnica OpenID Connect Configuration
// In production, these come from environment variables
// ────────────────────────────────────────────
export const CLAVE_UNICA_CONFIG = {
  // Authorization endpoint (OAuth 2.0)
  authorizeUrl: 'https://accounts.claveunica.gob.cl/openid/authorize/',
  // Token endpoint (backend-only in production)
  tokenUrl: 'https://accounts.claveunica.gob.cl/openid/token/',
  // UserInfo endpoint (backend-only in production)
  userInfoUrl: 'https://accounts.claveunica.gob.cl/openid/userinfo/',
  // Logout endpoint
  logoutUrl: 'https://accounts.claveunica.gob.cl/api/v1/accounts/app/logout',
  // Client ID (will come from env in production)
  clientId: 'PLACEHOLDER_CLIENT_ID',
  // Redirect URI (callback after ClaveÚnica auth)
  redirectUri: 'https://saludsd.santodomingo.gob.cl/auth/callback',
  // Scopes required by ClaveÚnica
  scope: 'openid run name',
  // Response type for Authorization Code Flow
  responseType: 'code',
};

// Generate CSRF state token
export function generateStateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Build the ClaveÚnica authorization URL
export function buildClaveUnicaUrl(): string {
  const state = generateStateToken();
  // In production, store state in sessionStorage for CSRF validation
  sessionStorage.setItem('claveunica_state', state);

  const params = new URLSearchParams({
    client_id: CLAVE_UNICA_CONFIG.clientId,
    response_type: CLAVE_UNICA_CONFIG.responseType,
    scope: CLAVE_UNICA_CONFIG.scope,
    redirect_uri: CLAVE_UNICA_CONFIG.redirectUri,
    state: state,
  });

  return `${CLAVE_UNICA_CONFIG.authorizeUrl}?${params.toString()}`;
}

// Build the ClaveÚnica logout URL
export function buildLogoutUrl(): string {
  const redirectUri = encodeURIComponent(window.location.origin);
  return `${CLAVE_UNICA_CONFIG.logoutUrl}?redirect=${redirectUri}`;
}

// ────────────────────────────────────────────
// User roles for staff who can be both patient and funcionario
// ────────────────────────────────────────────
export type ActiveRole = 'paciente' | 'admin';

// List of RUTs that are registered as staff (doctor, admin, funcionario)
// In production, this comes from the database
export const STAFF_RUTS = [
  '9.876.543-2',   // Dr. Carlos Muñoz
  '11.111.111-1',  // Dra. Patricia Herrera
  '22.222.222-2',  // Kin. Roberto Araya
];

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isStaff: boolean;
  activeRole: ActiveRole;
  showRoleSelector: boolean;
  // ClaveÚnica flow
  initiateClaveUnica: () => void;
  handleClaveUnicaCallback: (code: string, state: string) => void;
  // Mock login for prototype demo
  loginWithClaveUnicaMock: () => void;
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
  initiateClaveUnica: () => {},
  handleClaveUnicaCallback: () => {},
  loginWithClaveUnicaMock: () => {},
  selectRole: () => {},
  setShowRoleSelector: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<ActiveRole>('paciente');
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const isAuthenticated = !!user;
  // Check if the logged-in user is a staff member (doctor, admin, funcionario)
  const isStaff = user ? STAFF_RUTS.includes(user.rut) || user.role === 'admin' : false;

  /**
   * Initiate ClaveÚnica OAuth flow
   * In production: redirects to ClaveÚnica login
   * In prototype: mocks the flow
   */
  const initiateClaveUnica = () => {
    // In production, this would redirect:
    // window.location.href = buildClaveUnicaUrl();

    // For prototype, simulate the flow
    loginWithClaveUnicaMock();
  };

  /**
   * Handle callback from ClaveÚnica after authorization
   * In production: validates state, exchanges code for token, gets user info
   */
  const handleClaveUnicaCallback = (_code: string, _state: string) => {
    // Production flow:
    // 1. Validate state matches sessionStorage('claveunica_state')
    // 2. POST to backend with code → backend exchanges for access_token
    // 3. Backend calls /openid/userinfo/ with access_token
    // 4. Backend returns user data (RUN + nombre)
    // 5. Check if RUN is in staff table → show role selector if yes

    // Mock: simulate receiving user data
    loginWithClaveUnicaMock();
  };

  /**
   * Mock ClaveÚnica login for prototype demonstration.
   * Simulates what happens after a successful ClaveÚnica auth:
   * - User identity is obtained (RUN + nombre)
   * - System checks if user is staff → shows role selector
   * - Otherwise, logs in directly as patient
   */
  const loginWithClaveUnicaMock = () => {
    // Simulate: by default, user identified as a staff member for demo
    // This way we can show the role selector
    const authenticatedUser: User = {
      ...mockAdminUser,
      // ClaveÚnica returns: RolUnico.numero (RUN) and name
    };

    setUser(authenticatedUser);

    // Check if user is staff → show role selector
    if (STAFF_RUTS.includes(authenticatedUser.rut) || authenticatedUser.role === 'admin') {
      setShowRoleSelector(true);
    } else {
      setActiveRole('paciente');
      setShowRoleSelector(false);
    }
  };

  /**
   * Select active role (for staff who have dual access)
   */
  const selectRole = (role: ActiveRole) => {
    setActiveRole(role);
    setShowRoleSelector(false);

    if (role === 'paciente') {
      // Even though they're staff, they view as patient
      setUser(prev => prev ? { ...prev, role: 'paciente' } : null);
    } else {
      setUser(prev => prev ? { ...prev, role: 'admin' } : null);
    }
  };

  /**
   * Logout: close local session + ClaveÚnica session
   */
  const logout = () => {
    setUser(null);
    setActiveRole('paciente');
    setShowRoleSelector(false);
    sessionStorage.removeItem('claveunica_state');

    // In production: redirect to ClaveÚnica logout endpoint
    // window.location.href = buildLogoutUrl();
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isStaff,
      activeRole,
      showRoleSelector,
      initiateClaveUnica,
      handleClaveUnicaCallback,
      loginWithClaveUnicaMock,
      selectRole,
      setShowRoleSelector,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
