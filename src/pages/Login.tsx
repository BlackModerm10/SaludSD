import React, { useState, useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import GobNavbar from '../components/GobNavbar';
import GobFooter from '../components/GobFooter';
import { useAuth } from '../services/AuthContext';
import { formatRut, validateRut } from '../services/mockData';

const Login: React.FC = () => {
  const history = useHistory();
  const { initiateClaveUnica, isAuthenticated, showRoleSelector, selectRole, loginWithCredentials } = useAuth();

  // Local Form state
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingLocal, setLoadingLocal] = useState(false);

  // If already authenticated and role selector is visible, show it
  // If authenticated without role selector, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && !showRoleSelector) {
      history.push('/paciente/dashboard');
    }
  }, [isAuthenticated, showRoleSelector, history]);

  const handleClaveUnicaClick = (isAdmin: boolean) => {
    initiateClaveUnica(isAdmin);
  };

  const handleSelectRole = (role: 'paciente' | 'admin') => {
    selectRole(role);
    if (role === 'paciente') {
      history.push('/paciente/dashboard');
    } else {
      history.push('/admin/dashboard');
    }
  };

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRut(e.target.value);
    setRut(formatted);
    setErrorMsg(null);
  };

  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!rut.trim() || !password.trim()) {
      setErrorMsg('RUT y contraseña son obligatorios.');
      return;
    }

    if (!validateRut(rut)) {
      setErrorMsg('El RUT ingresado no es válido.');
      return;
    }

    setLoadingLocal(true);
    try {
      await loginWithCredentials(rut, password);
      // Success will trigger useEffect for redirect or role selection
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <IonPage>
      <IonContent>
        <GobNavbar />

        {/* Role Selector Modal (shown after ClaveÚnica/Credentials auth for staff) */}
        {showRoleSelector && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(10, 19, 45, 0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 'var(--radius-xl)',
              padding: '2.5rem',
              width: '100%',
              maxWidth: 520,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              animation: 'fadeInUp 0.3s ease',
            }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #28a745, #48c768)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}>
                  <span className="material-icons-outlined" style={{ color: '#fff', fontSize: '1.6rem' }}>
                    check_circle
                  </span>
                </div>
                <h2 style={{
                  fontFamily: "'Roboto Slab', serif",
                  color: 'var(--gob-tertiary)',
                  fontSize: '1.4rem',
                  marginBottom: '0.5rem',
                }}>
                  Identidad verificada
                </h2>
                <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>
                  Su identidad fue verificada exitosamente.
                  <br />Seleccione cómo desea acceder al sistema:
                </p>
              </div>

              {/* Role Options */}
              <div className="row" style={{ gap: 0 }}>
                {/* Paciente */}
                <div className="col-sm-6 mb-3">
                  <div
                    onClick={() => handleSelectRole('paciente')}
                    style={{
                      border: '2px solid #e0e0e0',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.5rem 1rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      height: '100%',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--gob-primary)';
                      (e.currentTarget as HTMLElement).style.background = '#f0f7ff';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#e0e0e0';
                      (e.currentTarget as HTMLElement).style.background = '#fff';
                      (e.currentTarget as HTMLElement).style.transform = 'none';
                    }}
                  >
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #006FB3, #0088d6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 0.75rem',
                    }}>
                      <span className="material-icons-outlined" style={{ color: '#fff', fontSize: '1.5rem' }}>
                        person
                      </span>
                    </div>
                    <h3 style={{
                      fontFamily: "'Roboto Slab', serif",
                      fontSize: '1.05rem',
                      color: 'var(--gob-tertiary)',
                      marginBottom: '0.4rem',
                    }}>
                      Paciente
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#888', margin: 0, lineHeight: 1.4 }}>
                      Acceder como paciente para ver mis listas de espera, citas e historial.
                    </p>
                  </div>
                </div>

                {/* Funcionario / Admin */}
                <div className="col-sm-6 mb-3">
                  <div
                    onClick={() => handleSelectRole('admin')}
                    style={{
                      border: '2px solid #e0e0e0',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.5rem 1rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      height: '100%',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--gob-tertiary)';
                      (e.currentTarget as HTMLElement).style.background = '#f0f2f8';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#e0e0e0';
                      (e.currentTarget as HTMLElement).style.background = '#fff';
                      (e.currentTarget as HTMLElement).style.transform = 'none';
                    }}
                  >
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0A132D, #1a2540)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 0.75rem',
                    }}>
                      <span className="material-icons-outlined" style={{ color: '#fff', fontSize: '1.5rem' }}>
                        admin_panel_settings
                      </span>
                    </div>
                    <h3 style={{
                      fontFamily: "'Roboto Slab', serif",
                      fontSize: '1.05rem',
                      color: 'var(--gob-tertiary)',
                      marginBottom: '0.4rem',
                    }}>
                      Funcionario
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#888', margin: 0, lineHeight: 1.4 }}>
                      Acceder como profesional de salud para gestionar listas y estadísticas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div style={{
                background: '#f5f7fa',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1rem',
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}>
                <span className="material-icons-outlined" style={{ fontSize: '1rem', color: 'var(--gob-primary)', marginTop: 2 }}>
                  info
                </span>
                <p style={{ fontSize: '0.78rem', color: '#888', margin: 0, lineHeight: 1.5 }}>
                  Como funcionario de salud, puede cambiar entre vista de paciente y funcionario 
                  desde el menú del sistema en cualquier momento.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Login Page Content */}
        <div className="auth-container">
          <div className="auth-card" style={{ maxWidth: 480 }}>
            <div className="auth-logo">
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'linear-gradient(135deg, #006FB3, #004d7a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto',
              }}>
                <span className="material-icons-outlined" style={{ color: '#fff', fontSize: '1.8rem' }}>
                  local_hospital
                </span>
              </div>
              <h2>SaludSD</h2>
              <p className="subtitle">Municipalidad de Santo Domingo</p>
            </div>

            {errorMsg && (
              <div style={{
                background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb',
                padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem',
                fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <span className="material-icons-outlined" style={{ fontSize: '1.2rem' }}>error_outline</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ──────────────────────────────────────────── */}
            {/* FORMULARIO DE ACCESO LOCAL CON JWT */}
            {/* ──────────────────────────────────────────── */}
            <form onSubmit={handleLocalSubmit} style={{ marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="loginRut" style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--gob-tertiary)' }}>RUT</label>
                <input
                  type="text"
                  className="form-control"
                  id="loginRut"
                  placeholder="Ej: 12.345.678-9"
                  value={rut}
                  onChange={handleRutChange}
                  maxLength={12}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="loginPassword" style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--gob-tertiary)' }}>Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  id="loginPassword"
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMsg(null); }}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>

              <button
                type="submit"
                className="btn-gob-primary"
                disabled={loadingLocal}
                style={{
                  width: '100%', padding: '12px', background: 'var(--gob-primary)',
                  color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 600,
                  cursor: 'pointer', transition: 'background 0.2s'
                }}
              >
                {loadingLocal ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.88rem', color: '#888', margin: 0 }}>
                ¿No tienes una cuenta?{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); history.push('/register'); }}
                  style={{ color: 'var(--gob-primary)', fontWeight: 600 }}>
                  Regístrate aquí
                </a>
              </p>
            </div>

            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '1.5rem',
            }}>
              <div style={{ flex: 1, height: 1, background: '#dee2e6' }} />
              <span style={{ fontSize: '0.78rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>
                O Accede Con
              </span>
              <div style={{ flex: 1, height: 1, background: '#dee2e6' }} />
            </div>

            {/* ──────────────────────────────────────────── */}
            {/* BOTÓN OFICIAL CLAVE ÚNICA */}
            {/* ──────────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
              <button
                id="btn-claveunica-patient"
                onClick={() => handleClaveUnicaClick(false)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                  width: '100%', padding: '12px 24px', background: '#0F69B4', color: '#FFFFFF',
                  border: 'none', borderRadius: '4px', fontSize: '0.92rem', fontWeight: 600,
                  fontFamily: "'Roboto', sans-serif", cursor: 'pointer', transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#0C5A9E'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#0F69B4'; }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.65 10C11.83 7.67 9.61 6 7 6C3.69 6 1 8.69 1 12C1 15.31 3.69 18 7 18C9.61 18 11.83 16.33 12.65 14H17V18H21V14H23V10H12.65ZM7 14C5.9 14 5 13.1 5 12C5 10.9 5.9 10 7 10C8.1 10 9 10.9 9 12C9 13.1 8.1 14 7 14Z" fill="white"/>
                </svg>
                ClaveÚnica (Paciente de prueba)
              </button>

              <button
                id="btn-claveunica-admin"
                onClick={() => handleClaveUnicaClick(true)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                  width: '100%', padding: '12px 24px', background: '#0A132D', color: '#FFFFFF',
                  border: 'none', borderRadius: '4px', fontSize: '0.92rem', fontWeight: 600,
                  fontFamily: "'Roboto', sans-serif", cursor: 'pointer', transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#1a2540'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#0A132D'; }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.65 10C11.83 7.67 9.61 6 7 6C3.69 6 1 8.69 1 12C1 15.31 3.69 18 7 18C9.61 18 11.83 16.33 12.65 14H17V18H21V14H23V10H12.65ZM7 14C5.9 14 5 13.1 5 12C5 10.9 5.9 10 7 10C8.1 10 9 10.9 9 12C9 13.1 8.1 14 7 14Z" fill="white"/>
                </svg>
                ClaveÚnica (Funcionario de prueba)
              </button>
            </div>

            {/* Info cards */}
             <div style={{ marginBottom: '1.5rem' }}>
              <div className="info-alert-card">
                <span className="material-icons-outlined" style={{ color: 'var(--gob-primary)', fontSize: '1.1rem', marginTop: 2 }}>
                  vpn_key
                </span>
                <div>
                  <div className="info-alert-title">
                    Acceso para pruebas locales
                  </div>
                  <div className="info-alert-desc">
                    Puedes registrarte con el formulario o usar las ClaveÚnica de simulación. La contraseña común por defecto para cuentas semilla es <strong>123456</strong>.
                  </div>
                </div>
              </div>
            </div>

            {/* Security footer */}
            <div style={{
              textAlign: 'center', padding: '1rem 0 0', borderTop: '1px solid #eee',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '6px', marginBottom: '0.5rem',
              }}>
                <span className="material-icons-outlined" style={{ fontSize: '1rem', color: '#28a745' }}>
                  lock
                </span>
                <span style={{ fontSize: '0.78rem', color: '#888' }}>
                  Conexión segura SSL/TLS
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#bbb', margin: 0 }}>
                SaludSD no almacena tu contraseña de ClaveÚnica. La autenticación local utiliza cifrado irreversibles tipo bcrypt con sal y tokens firmados JWT.
              </p>
            </div>
          </div>
        </div>

        <GobFooter />
      </IonContent>
    </IonPage>
  );
};

export default Login;
