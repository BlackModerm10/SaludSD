import React, { useEffect, useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import GobNavbar from '../../components/GobNavbar';
import GobFooter from '../../components/GobFooter';
import api from '../../services/api';

const BAR_COLORS = [
  '#006FB3', '#28a745', '#FE6565', '#ffc107', '#17a2b8',
  '#6f42c1', '#e83e8c', '#fd7e14', '#20c997', '#007bff'
];

const Statistics: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats')
      .then(res => {
        setStats(res.data);
      })
      .catch(err => {
        console.error('Error al obtener estadísticas:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const maxCantidad = stats && stats.porEspecialidad.length > 0
    ? Math.max(...stats.porEspecialidad.map((e: any) => e.cantidad))
    : 1;

  const maxDias = stats && stats.porEspecialidad.length > 0
    ? Math.max(...stats.porEspecialidad.map((e: any) => e.promedioDias))
    : 1;

  return (
    <IonPage>
      <IonContent>
        <GobNavbar />
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: 1100 }}>
          <div className="section-header">
            <h2>
              <span className="material-icons-outlined" style={{ fontSize: '1.3rem', verticalAlign: 'middle', marginRight: 6 }}>
                analytics
              </span>
              Estadísticas del Sistema
            </h2>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                border: '3px solid #e0e0e0', borderTopColor: 'var(--gob-primary)',
                animation: 'spin 1s linear infinite', margin: '0 auto 1rem'
              }} />
              <p style={{ color: '#888' }}>Cargando analíticas...</p>
            </div>
          ) : !stats ? (
            <p style={{ color: '#888', textAlign: 'center' }}>Error al cargar estadísticas.</p>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="row mb-4">
                {[
                  { label: 'Total en espera', value: stats.totalPacientesEspera, icon: 'people', color: 'primary' },
                  { label: 'Espera promedio', value: `${stats.tiempoPromedioEspera} días`, icon: 'schedule', color: 'warning' },
                  { label: 'Más demandada', value: stats.especialidadMasDemandada, icon: 'local_fire_department', color: 'danger' },
                  { label: 'Centro más saturado', value: stats.centroMasSaturado.replace('Hospital ', 'H. '), icon: 'warning', color: 'secondary' },
                ].map((s, i) => (
                  <div className="col-md-3 col-6 mb-3" key={i}>
                    <div className={`stat-card ${s.color}`}>
                      <div className="d-flex align-items-center" style={{ gap: '12px' }}>
                        <div className={`stat-icon ${s.color}`}>
                          <span className="material-icons-outlined">{s.icon}</span>
                        </div>
                        <div>
                          <div className="stat-value" style={{ fontSize: '1.1rem' }}>{s.value}</div>
                          <div className="stat-label">{s.label}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="row">
                {/* Pacientes por Especialidad */}
                <div className="col-lg-6 mb-4">
                  <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-md)' }}>
                    <h3 style={{ fontFamily: "'Roboto Slab', serif", fontSize: '1rem', color: 'var(--gob-tertiary)', marginBottom: '1.25rem' }}>
                      Pacientes en espera por Especialidad
                    </h3>
                    {stats.porEspecialidad.length === 0 ? (
                      <p style={{ color: '#888', textAlign: 'center', padding: '2rem 0' }}>No hay datos.</p>
                    ) : (
                      <div className="bar-chart" style={{ marginBottom: '30px' }}>
                        {stats.porEspecialidad.map((esp: any, i: number) => (
                          <div key={i} className="bar"
                            style={{
                              height: `${(esp.cantidad / maxCantidad) * 100}%`,
                              background: BAR_COLORS[i % BAR_COLORS.length]
                            }}
                            title={`${esp.nombre}: ${esp.cantidad} pacientes`}>
                            <div className="bar-value">{esp.cantidad}</div>
                            <div className="bar-label">{esp.nombre.substring(0, 5)}.</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tiempo promedio por especialidad */}
                <div className="col-lg-6 mb-4">
                  <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-md)' }}>
                    <h3 style={{ fontFamily: "'Roboto Slab', serif", fontSize: '1rem', color: 'var(--gob-tertiary)', marginBottom: '1.25rem' }}>
                      Tiempo promedio de espera (días)
                    </h3>
                    {stats.porEspecialidad.length === 0 ? (
                      <p style={{ color: '#888', textAlign: 'center', padding: '2rem 0' }}>No hay datos.</p>
                    ) : (
                      <div className="bar-chart" style={{ marginBottom: '30px' }}>
                        {stats.porEspecialidad.map((esp: any, i: number) => (
                          <div key={i} className="bar"
                            style={{
                              height: `${(esp.promedioDias / maxDias) * 100}%`,
                              background: esp.promedioDias > 60 ? '#dc3545' : esp.promedioDias > 30 ? '#ffc107' : '#28a745'
                            }}
                            title={`${esp.nombre}: ~${esp.promedioDias} días`}>
                            <div className="bar-value">{esp.promedioDias}</div>
                            <div className="bar-label">{esp.nombre.substring(0, 5)}.</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Detalle por centro */}
              <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-md)', marginBottom: '1.5rem' }}>
                <h3 style={{ fontFamily: "'Roboto Slab', serif", fontSize: '1rem', color: 'var(--gob-tertiary)', marginBottom: '1.25rem' }}>
                  Estado por Centro de Salud
                </h3>
                <div className="row">
                  {stats.porCentro.map((centro: any, i: number) => (
                    <div className="col-md-6 mb-3" key={i}>
                      <div style={{
                        border: '1px solid #eee', borderRadius: 'var(--radius-md)',
                        padding: '1.25rem'
                      }}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong style={{ color: 'var(--gob-tertiary)', fontSize: '0.95rem' }}>{centro.nombre}</strong>
                          <span style={{
                            fontSize: '0.82rem', fontWeight: 600,
                            color: centro.ocupacion > 85 ? 'var(--salud-danger)' : 'var(--gob-primary)'
                          }}>
                            {centro.ocupacion}% ocupación
                          </span>
                        </div>
                        <div className="progress-custom mb-2">
                          <div className={`progress-fill ${centro.ocupacion > 85 ? 'high' : centro.ocupacion > 70 ? 'medium' : ''}`}
                            style={{ width: `${centro.ocupacion}%` }} />
                        </div>
                        <div className="d-flex justify-content-between" style={{ fontSize: '0.78rem', color: '#888' }}>
                          <span>{centro.enEspera} pacientes en espera</span>
                          <span style={{
                            color: centro.ocupacion > 90 ? 'var(--salud-danger)' : 'var(--salud-success)',
                            fontWeight: 600
                          }}>
                            {centro.ocupacion > 90 ? '⚠ Crítico' : centro.ocupacion > 75 ? '● Alto' : '● Normal'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Table breakdown */}
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Especialidad</th>
                      <th>Pacientes en espera</th>
                      <th>Espera promedio</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.porEspecialidad.map((esp: any, i: number) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600, color: 'var(--gob-tertiary)' }}>{esp.nombre}</td>
                        <td>{esp.cantidad}</td>
                        <td>
                          <span style={{
                            fontWeight: 600,
                            color: esp.promedioDias > 60 ? 'var(--salud-danger)' :
                              esp.promedioDias > 30 ? '#856404' : 'var(--salud-success)'
                          }}>
                            {esp.promedioDias} días
                          </span>
                        </td>
                        <td>
                          <span className={`tag-estado ${esp.promedioDias > 60 ? 'cancelada' : esp.promedioDias > 30 ? 'en_espera' : 'programada'}`}>
                            {esp.promedioDias > 60 ? 'Crítico' : esp.promedioDias > 30 ? 'Alto' : 'Normal'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        <GobFooter />
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </IonContent>
    </IonPage>
  );
};

export default Statistics;
