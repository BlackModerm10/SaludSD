import React, { useEffect, useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import GobNavbar from '../../components/GobNavbar';
import GobFooter from '../../components/GobFooter';
import { useAuth } from '../../services/AuthContext';
import api from '../../services/api';

const BAR_COLORS = [
  '#006FB3', '#28a745', '#FE6565', '#ffc107', '#17a2b8',
  '#6f42c1', '#e83e8c', '#fd7e14', '#20c997', '#007bff'
];

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const history = useHistory();
  
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats')
      .then(res => {
        setStats(res.data);
      })
      .catch(err => {
        console.error('Error al obtener estadísticas del dashboard:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const maxCantidad = stats && stats.porEspecialidad.length > 0 
    ? Math.max(...stats.porEspecialidad.map((e: any) => e.cantidad))
    : 1;

  return (
    <IonPage>
      <IonContent>
        <GobNavbar />
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: 1100 }}>
          {/* Welcome */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{
              fontFamily: "'Roboto Slab', serif", fontSize: '1.6rem',
              color: 'var(--gob-tertiary)', marginBottom: '0.25rem'
            }}>
              Panel de Administración
            </h1>
            <p style={{ color: '#888', margin: 0 }}>
              Bienvenido, {user?.nombre}. Resumen general del sistema de salud.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                border: '3px solid #e0e0e0', borderTopColor: 'var(--gob-primary)',
                animation: 'spin 1s linear infinite', margin: '0 auto 1rem'
              }} />
              <p style={{ color: '#888' }}>Cargando estadísticas generales...</p>
            </div>
          ) : !stats ? (
            <p style={{ color: '#888', textAlign: 'center' }}>Error al cargar estadísticas.</p>
          ) : (
            <>
              {/* Stats */}
              <div className="row mb-4">
                {[
                  { icon: 'people', value: stats.totalPacientesEspera, label: 'Pacientes en espera', color: 'primary' },
                  { icon: 'schedule', value: `${stats.tiempoPromedioEspera}d`, label: 'Espera promedio', color: 'warning' },
                  { icon: 'today', value: stats.citasHoy, label: 'Citas hoy', color: 'success' },
                  { icon: 'date_range', value: stats.citasSemana, label: 'Citas esta semana', color: 'info' },
                ].map((s, i) => (
                  <div className="col-md-3 col-6 mb-3" key={i}>
                    <div className={`stat-card ${s.color} animate-in`}>
                      <div className="d-flex align-items-center" style={{ gap: '12px' }}>
                        <div className={`stat-icon ${s.color}`}>
                          <span className="material-icons-outlined">{s.icon}</span>
                        </div>
                        <div>
                          <div className="stat-value">{s.value}</div>
                          <div className="stat-label">{s.label}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="row">
                {/* Chart: Demanda por especialidad */}
                <div className="col-lg-8 mb-4">
                  <div style={{
                    background: '#fff', borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem', boxShadow: 'var(--shadow-md)'
                  }}>
                    <div className="section-header">
                      <h2 style={{ fontSize: '1.1rem' }}>
                        <span className="material-icons-outlined" style={{ fontSize: '1.1rem', verticalAlign: 'middle', marginRight: 6 }}>
                          bar_chart
                        </span>
                        Demanda por Especialidad
                      </h2>
                    </div>
                    {stats.porEspecialidad.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem 0', color: '#888' }}>
                        No hay pacientes registrados en listas de espera.
                      </div>
                    ) : (
                      <div className="bar-chart" style={{ marginBottom: '30px' }}>
                        {stats.porEspecialidad.map((esp: any, i: number) => (
                          <div key={i} className="bar"
                            style={{
                              height: `${(esp.cantidad / maxCantidad) * 100}%`,
                              background: BAR_COLORS[i % BAR_COLORS.length],
                            }}
                            title={`${esp.nombre}: ${esp.cantidad} pacientes (~${esp.promedioDias} días)`}
                          >
                            <div className="bar-value">{esp.cantidad}</div>
                            <div className="bar-label">{esp.nombre.substring(0, 6)}.</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar Stats */}
                <div className="col-lg-4 mb-4">
                  <div style={{
                    background: '#fff', borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem', boxShadow: 'var(--shadow-md)', marginBottom: '1rem'
                  }}>
                    <h3 style={{ fontFamily: "'Roboto Slab', serif", fontSize: '1rem', color: 'var(--gob-tertiary)', marginBottom: '1rem' }}>
                      <span className="material-icons-outlined" style={{ fontSize: '1.05rem', verticalAlign: 'middle', marginRight: 6 }}>
                        trending_down
                      </span>
                      Tendencia
                    </h3>
                    <div className="d-flex align-items-center" style={{ gap: '8px', marginBottom: '0.75rem' }}>
                      <span className="material-icons-outlined"
                        style={{ color: 'var(--salud-success)', fontSize: '2rem' }}>
                        trending_down
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--salud-success)', fontSize: '1.1rem' }}>
                          Estable
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#888' }}>
                          El tiempo promedio de espera se mantiene bajo el límite crítico comunal.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: '#fff', borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem', boxShadow: 'var(--shadow-md)'
                  }}>
                    <h3 style={{ fontFamily: "'Roboto Slab', serif", fontSize: '1rem', color: 'var(--gob-tertiary)', marginBottom: '1rem' }}>
                      Ocupación por Centro
                    </h3>
                    {stats.porCentro.map((c: any, i: number) => (
                      <div key={i} style={{ marginBottom: '1rem' }}>
                        <div className="d-flex justify-content-between" style={{ fontSize: '0.82rem', marginBottom: 4 }}>
                          <span style={{ fontWeight: 500, color: 'var(--gob-tertiary)' }}>{c.nombre}</span>
                          <span style={{ fontWeight: 600, color: c.ocupacion > 85 ? 'var(--salud-danger)' : 'var(--gob-primary)' }}>
                            {c.ocupacion}%
                          </span>
                        </div>
                        <div className="progress-custom">
                          <div className={`progress-fill ${c.ocupacion > 85 ? 'high' : c.ocupacion > 70 ? 'medium' : ''}`}
                            style={{ width: `${c.ocupacion}%` }} />
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#aaa', marginTop: 2 }}>
                          {c.enEspera} pacientes en espera
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Quick Actions */}
          <div className="row mb-4">
            {[
              { icon: 'list_alt', label: 'Gestionar Listas', path: '/admin/listas', color: '#006FB3' },
              { icon: 'analytics', label: 'Estadísticas', path: '/admin/estadisticas', color: '#28a745' },
              { icon: 'person_search', label: 'Buscar Paciente', path: '/admin/listas', color: '#FE6565' },
            ].map((a, i) => (
              <div className="col-md-4 mb-3" key={i}>
                <div onClick={() => history.push(a.path)}
                  style={{
                    background: '#fff', borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem', boxShadow: 'var(--shadow-md)',
                    cursor: 'pointer', textAlign: 'center',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'none'; }}
                >
                  <span className="material-icons-outlined"
                    style={{ fontSize: '2rem', color: a.color, marginBottom: '0.5rem', display: 'block' }}>
                    {a.icon}
                  </span>
                  <div style={{ fontWeight: 600, color: 'var(--gob-tertiary)' }}>{a.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <GobFooter />
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </IonContent>
    </IonPage>
  );
};

export default AdminDashboard;
