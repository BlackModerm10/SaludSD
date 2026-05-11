import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import GobNavbar from '../../components/GobNavbar';
import GobFooter from '../../components/GobFooter';
import { useAuth } from '../../services/AuthContext';
import { mockWaitList, mockAppointments, mockNotifications } from '../../services/mockData';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const history = useHistory();

  const myWaitList = mockWaitList.filter(w => w.pacienteId === 'u1');
  const nextAppointment = mockAppointments.find(a => a.estado === 'confirmada');
  const unreadNotifs = mockNotifications.filter(n => !n.leida).length;

  return (
    <IonPage>
      <IonContent>
        <GobNavbar />

        <div className="container" style={{ padding: '2rem 1rem', maxWidth: 1100 }}>
          {/* Welcome */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{
              fontFamily: "'Roboto Slab', serif",
              fontSize: '1.6rem',
              color: 'var(--gob-tertiary)',
              marginBottom: '0.25rem'
            }}>
              Hola, {user?.nombre?.split(' ')[0]} 👋
            </h1>
            <p style={{ color: '#888', margin: 0 }}>
              Bienvenida a tu panel de salud. Aquí puedes ver el resumen de tu atención.
            </p>
          </div>

          {/* Stat Cards */}
          <div className="row mb-4">
            <div className="col-md-3 col-6 mb-3">
              <div className="stat-card primary animate-in"
                onClick={() => history.push('/paciente/lista-espera')}
                style={{ cursor: 'pointer' }}>
                <div className="d-flex align-items-center" style={{ gap: '12px' }}>
                  <div className="stat-icon primary">
                    <span className="material-icons-outlined">format_list_numbered</span>
                  </div>
                  <div>
                    <div className="stat-value">{myWaitList.length}</div>
                    <div className="stat-label">Listas activas</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6 mb-3">
              <div className="stat-card success animate-in">
                <div className="d-flex align-items-center" style={{ gap: '12px' }}>
                  <div className="stat-icon success">
                    <span className="material-icons-outlined">event_available</span>
                  </div>
                  <div>
                    <div className="stat-value">1</div>
                    <div className="stat-label">Cita próxima</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6 mb-3">
              <div className="stat-card warning animate-in"
                onClick={() => history.push('/paciente/historial')}
                style={{ cursor: 'pointer' }}>
                <div className="d-flex align-items-center" style={{ gap: '12px' }}>
                  <div className="stat-icon warning">
                    <span className="material-icons-outlined">history</span>
                  </div>
                  <div>
                    <div className="stat-value">3</div>
                    <div className="stat-label">Atenciones previas</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6 mb-3">
              <div className="stat-card secondary animate-in">
                <div className="d-flex align-items-center" style={{ gap: '12px' }}>
                  <div className="stat-icon secondary">
                    <span className="material-icons-outlined">notifications</span>
                  </div>
                  <div>
                    <div className="stat-value">{unreadNotifs}</div>
                    <div className="stat-label">Notificaciones</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Wait List Summary */}
            <div className="col-lg-7 mb-4">
              <div className="section-header">
                <h2>
                  <span className="material-icons-outlined" style={{ fontSize: '1.3rem', verticalAlign: 'middle', marginRight: 6 }}>
                    pending
                  </span>
                  Mis Listas de Espera
                </h2>
                <a href="#" onClick={(e) => { e.preventDefault(); history.push('/paciente/lista-espera'); }}
                  style={{ color: 'var(--gob-primary)', fontWeight: 600, fontSize: '0.88rem' }}>
                  Ver todas →
                </a>
              </div>

              {myWaitList.map(entry => (
                <div key={entry.id} className={`waitlist-item prioridad-${entry.prioridad}`}>
                  <div className="d-flex align-items-center" style={{ gap: '14px' }}>
                    <div className="position-badge">{entry.posicion}</div>
                    <div style={{ flex: 1 }}>
                      <div className="d-flex align-items-center flex-wrap" style={{ gap: '8px', marginBottom: '4px' }}>
                        <strong style={{ color: 'var(--gob-tertiary)', fontSize: '0.95rem' }}>
                          {entry.especialidad}
                        </strong>
                        <span className={`tag-prioridad ${entry.prioridad}`}>{entry.prioridad}</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#888' }}>
                        {entry.centroSalud} • Solicitada: {new Date(entry.fechaSolicitud).toLocaleDateString('es-CL')}
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        <div className="d-flex justify-content-between" style={{ fontSize: '0.78rem', color: '#888', marginBottom: 4 }}>
                          <span>Posición {entry.posicion} de {entry.totalEnLista}</span>
                          <span>~{entry.tiempoEstimadoDias} días</span>
                        </div>
                        <div className="progress-custom">
                          <div className="progress-fill"
                            style={{ width: `${((entry.totalEnLista - entry.posicion) / entry.totalEnLista) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div className="col-lg-5">
              {/* Next Appointment */}
              {nextAppointment && (
                <div style={{
                  background: 'linear-gradient(135deg, #006FB3, #004d7a)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  color: '#fff',
                  marginBottom: '1.5rem',
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  <div className="d-flex align-items-center" style={{ gap: '8px', marginBottom: '1rem' }}>
                    <span className="material-icons-outlined">event</span>
                    <strong>Próxima Cita</strong>
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    {new Date(nextAppointment.fecha).toLocaleDateString('es-CL', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </div>
                  <div style={{ opacity: 0.9, marginBottom: '0.75rem' }}>
                    {nextAppointment.hora} hrs — {nextAppointment.especialidad}
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    padding: '0.75rem'
                  }}>
                    <div style={{ fontSize: '0.85rem' }}>
                      <strong>{nextAppointment.medico}</strong>
                    </div>
                    <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>
                      {nextAppointment.centroSalud}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="section-header">
                <h2>
                  <span className="material-icons-outlined" style={{ fontSize: '1.3rem', verticalAlign: 'middle', marginRight: 6 }}>
                    flash_on
                  </span>
                  Acciones Rápidas
                </h2>
              </div>
              <div className="row">
                {[
                  { icon: 'add_circle', label: 'Solicitar Cita', path: '/paciente/solicitar-cita', color: '#006FB3' },
                  { icon: 'history', label: 'Mi Historial', path: '/paciente/historial', color: '#28a745' },
                  { icon: 'location_on', label: 'Centros de Salud', path: '/paciente/centros', color: '#FE6565' },
                  { icon: 'notifications', label: 'Notificaciones', path: '/paciente/notificaciones', color: '#ffc107' },
                ].map((action, i) => (
                  <div className="col-6 mb-3" key={i}>
                    <div
                      onClick={() => history.push(action.path)}
                      style={{
                        background: '#fff',
                        borderRadius: 'var(--radius-md)',
                        padding: '1.1rem 0.75rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = 'none';
                        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
                      }}
                    >
                      <span className="material-icons-outlined"
                        style={{ fontSize: '1.8rem', color: action.color, marginBottom: '0.4rem', display: 'block' }}>
                        {action.icon}
                      </span>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--gob-tertiary)' }}>
                        {action.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Notifications */}
              <div className="section-header mt-3">
                <h2>
                  <span className="material-icons-outlined" style={{ fontSize: '1.3rem', verticalAlign: 'middle', marginRight: 6 }}>
                    notifications
                  </span>
                  Últimas Notificaciones
                </h2>
              </div>
              {mockNotifications.slice(0, 3).map(n => (
                <div key={n.id} className={`notification-item ${!n.leida ? 'unread' : ''}`}>
                  <div className={`notif-icon ${n.tipo}`}>
                    <span className="material-icons-outlined" style={{ fontSize: '1rem' }}>
                      {n.tipo === 'exito' ? 'check_circle' :
                        n.tipo === 'recordatorio' ? 'alarm' :
                        n.tipo === 'alerta' ? 'warning' : 'info'}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--gob-tertiary)' }}>
                      {n.titulo}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#888', lineHeight: 1.4 }}>
                      {n.mensaje.substring(0, 80)}...
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#aaa', marginTop: 4 }}>
                      {new Date(n.fecha).toLocaleDateString('es-CL')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <GobFooter />
      </IonContent>
    </IonPage>
  );
};

export default PatientDashboard;
