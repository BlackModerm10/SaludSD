import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import GobNavbar from '../components/GobNavbar';
import GobFooter from '../components/GobFooter';
import { useAuth } from '../services/AuthContext';

const Login: React.FC = () => {
  const history = useHistory();
  const { initiateClaveUnica, isAuthenticated, showRoleSelector, selectRole } = useAuth();

  // If already authenticated and role selector is visible, show it
  // If authenticated without role selector, redirect
  React.useEffect(() => {
    if (isAuthenticated && !showRoleSelector) {
      // Already selected role, redirect
    }
  }, [isAuthenticated, showRoleSelector]);

  const handleClaveUnicaClick = () => {
    initiateClaveUnica();
  };

  const handleSelectRole = (role: 'paciente' | 'admin') => {
    selectRole(role);
    if (role === 'paciente') {
      history.push('/paciente/dashboard');
    } else {
      history.push('/admin/dashboard');
    }
  };

  return (
    <IonPage>
      <IonContent>
        <GobNavbar />

        {/* Role Selector Modal (shown after ClaveÚnica auth for staff) */}
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
                  Su identidad fue verificada exitosamente con ClaveÚnica.
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

            {/* Description */}
            <p style={{
              textAlign: 'center',
              fontSize: '0.9rem',
              color: '#666',
              lineHeight: 1.6,
              marginBottom: '2rem',
            }}>
              Accede al Sistema de Gestión de Listas de Espera y Tiempos de Atención 
              utilizando tu <strong>ClaveÚnica</strong>.
            </p>

            {/* ──────────────────────────────────────────── */}
            {/* BOTÓN OFICIAL CLAVE ÚNICA */}
            {/* Diseño basado en los lineamientos oficiales */}
            {/* https://wikiguias.digital.gob.cl/guias/BotónCU */}
            {/* ──────────────────────────────────────────── */}
            <button
              id="btn-claveunica"
              onClick={handleClaveUnicaClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                width: '100%',
                padding: '14px 24px',
                background: '#0F69B4',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: 600,
                fontFamily: "'Roboto', sans-serif",
                cursor: 'pointer',
                transition: 'background 0.2s ease, transform 0.1s ease',
                marginBottom: '1.5rem',
                letterSpacing: '0.3px',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#0C5A9E';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#0F69B4';
              }}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(0.98)';
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
              }}
            >
              {/* ClaveÚnica Key Icon (SVG oficial) */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.65 10C11.83 7.67 9.61 6 7 6C3.69 6 1 8.69 1 12C1 15.31 3.69 18 7 18C9.61 18 11.83 16.33 12.65 14H17V18H21V14H23V10H12.65ZM7 14C5.9 14 5 13.1 5 12C5 10.9 5.9 10 7 10C8.1 10 9 10.9 9 12C9 13.1 8.1 14 7 14Z" fill="white"/>
              </svg>
              Iniciar sesión con ClaveÚnica
            </button>

            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '1.5rem',
            }}>
              <div style={{ flex: 1, height: 1, background: '#dee2e6' }} />
              <span style={{ fontSize: '0.78rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Información
              </span>
              <div style={{ flex: 1, height: 1, background: '#dee2e6' }} />
            </div>

            {/* Info cards */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                padding: '0.75rem 1rem',
                background: '#f0f7ff',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '0.5rem',
              }}>
                <span className="material-icons-outlined" style={{ color: 'var(--gob-primary)', fontSize: '1.1rem', marginTop: 2 }}>
                  vpn_key
                </span>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gob-tertiary)' }}>
                    ¿Qué es ClaveÚnica?
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#888', lineHeight: 1.5 }}>
                    Es tu contraseña única para todos los servicios del Estado de Chile. 
                    Si ya la tienes, puedes usarla para acceder a SaludSD.
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                padding: '0.75rem 1rem',
                background: '#f5f7fa',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '0.5rem',
              }}>
                <span className="material-icons-outlined" style={{ color: '#28a745', fontSize: '1.1rem', marginTop: 2 }}>
                  person_add
                </span>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gob-tertiary)' }}>
                    ¿No tienes ClaveÚnica?
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#888', lineHeight: 1.5 }}>
                    Puedes obtenerla en{' '}
                    <a href="https://claveunica.gob.cl/" target="_blank" rel="noopener noreferrer"
                      style={{ color: 'var(--gob-primary)', fontWeight: 600 }}>
                      claveunica.gob.cl
                    </a>
                    {' '}o en cualquier oficina del Registro Civil.
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                padding: '0.75rem 1rem',
                background: '#f5f7fa',
                borderRadius: 'var(--radius-sm)',
              }}>
                <span className="material-icons-outlined" style={{ color: '#6f42c1', fontSize: '1.1rem', marginTop: 2 }}>
                  medical_services
                </span>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gob-tertiary)' }}>
                    Profesionales de salud
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#888', lineHeight: 1.5 }}>
                    Si eres médico, funcionario o profesional del área de salud, al iniciar sesión 
                    podrás elegir entre tu vista de paciente o de funcionario.
                  </div>
                </div>
              </div>
            </div>

            {/* Security footer */}
            <div style={{
              textAlign: 'center',
              padding: '1rem 0 0',
              borderTop: '1px solid #eee',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '6px', marginBottom: '0.5rem',
              }}>
                <span className="material-icons-outlined" style={{ fontSize: '1rem', color: '#28a745' }}>
                  lock
                </span>
                <span style={{ fontSize: '0.78rem', color: '#888' }}>
                  Conexión segura con el Estado de Chile
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#bbb', margin: 0 }}>
                SaludSD no almacena tu contraseña. La autenticación es gestionada por 
                ClaveÚnica del Gobierno de Chile mediante el protocolo OpenID Connect.
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
