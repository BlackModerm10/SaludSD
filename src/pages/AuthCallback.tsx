import React, { useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

/**
 * ClaveÚnica OAuth Callback Page
 * 
 * In production:
 * 1. Receives `code` and `state` query parameters from ClaveÚnica
 * 2. Validates `state` token against sessionStorage (CSRF protection)
 * 3. Sends `code` to backend for token exchange
 * 4. Backend calls /openid/token/ to get access_token
 * 5. Backend calls /openid/userinfo/ to get user data (RUN + nombre)
 * 6. Frontend receives user data, checks staff status
 * 7. Redirects to role selector or dashboard
 * 
 * In prototype: simulates the entire flow with mock data
 */
const AuthCallback: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { handleClaveUnicaCallback, isAuthenticated, showRoleSelector } = useAuth();

  useEffect(() => {
    // Parse query params (code and state from ClaveÚnica)
    const params = new URLSearchParams(location.search);
    const code = params.get('code') || 'mock_code';
    const state = params.get('state') || 'mock_state';

    // Process the callback
    handleClaveUnicaCallback(code, state);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      if (showRoleSelector) {
        // Staff user: redirect to login page which shows role selector
        history.push('/login');
      } else {
        // Regular patient: go straight to dashboard
        history.push('/paciente/dashboard');
      }
    }
  }, [isAuthenticated, showRoleSelector, history]);

  return (
    <IonPage>
      <IonContent>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f5f7fa, #e4e9f0)',
        }}>
          <div style={{
            textAlign: 'center',
            background: '#fff',
            borderRadius: 'var(--radius-xl)',
            padding: '3rem',
            boxShadow: 'var(--shadow-lg)',
            maxWidth: 400,
            width: '90%',
          }}>
            {/* Loading Spinner */}
            <div style={{
              width: 56, height: 56,
              borderRadius: '50%',
              border: '3px solid #e0e0e0',
              borderTopColor: 'var(--gob-primary)',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1.5rem',
            }} />

            <h2 style={{
              fontFamily: "'Roboto Slab', serif",
              color: 'var(--gob-tertiary)',
              fontSize: '1.2rem',
              marginBottom: '0.5rem',
            }}>
              Verificando identidad...
            </h2>
            <p style={{ color: '#888', fontSize: '0.88rem', margin: 0 }}>
              Estamos procesando tu autenticación con ClaveÚnica. 
              Serás redirigido en un momento.
            </p>
          </div>
        </div>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </IonContent>
    </IonPage>
  );
};

export default AuthCallback;
