import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonSkeletonText } from '@ionic/react';
import GobNavbar from '../../components/GobNavbar';
import GobFooter from '../../components/GobFooter';
import api from '../../services/api';

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const History: React.FC = () => {
  const [filter, setFilter] = useState<string>('todas');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/appointments')
      .then(res => {
        setAppointments(res.data);
      })
      .catch(err => {
        console.error('Error al obtener historial de citas:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filtered = filter === 'todas'
    ? appointments
    : appointments.filter(a => a.estado === filter);

  return (
    <IonPage>
      <IonContent>
        <GobNavbar />
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: 900 }}>
          <div className="section-header">
            <h2>
              <span className="material-icons-outlined" style={{ fontSize: '1.3rem', verticalAlign: 'middle', marginRight: 6 }}>
                history
              </span>
              Historial de Atenciones
            </h2>
          </div>

          {/* Filters */}
          <div className="d-flex flex-wrap mb-4" style={{ gap: '8px' }}>
            {[
              { value: 'todas', label: 'Todas' },
              { value: 'confirmada', label: 'Confirmadas' },
              { value: 'completada', label: 'Completadas' },
              { value: 'cancelada', label: 'Canceladas' },
            ].map(f => (
              <button key={f.value}
                className={`btn btn-sm ${filter === f.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                style={{ borderRadius: '20px', padding: '6px 16px', fontSize: '0.82rem', cursor: 'pointer' }}
                onClick={() => setFilter(f.value)}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Appointments */}
          {loading ? (
            <div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="history-item" style={{ opacity: 0.7 }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '6px', background: '#eee', flexShrink: 0 }}>
                    <IonSkeletonText animated style={{ width: '100%', height: '100%', borderRadius: '6px' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="d-flex align-items-center" style={{ gap: '8px', marginBottom: '8px' }}>
                      <IonSkeletonText animated style={{ width: '140px', height: '1.1rem' }} />
                      <IonSkeletonText animated style={{ width: '80px', height: '1rem', borderRadius: '12px' }} />
                    </div>
                    <IonSkeletonText animated style={{ width: '180px', height: '0.85rem', marginBottom: '6px' }} />
                    <IonSkeletonText animated style={{ width: '240px', height: '0.82rem' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#888' }}>
              <span className="material-icons-outlined" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem', opacity: 0.4 }}>
                event_busy
              </span>
              No hay atenciones con este filtro.
            </div>
          ) : (
            filtered.map((apt, idx) => {
              // Convert date safely
              const date = new Date(apt.fecha);
              return (
                <div key={apt.id} className="history-item animate-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="history-date"
                    style={{
                      background: apt.estado === 'completada' ? 'var(--gob-primary)' :
                        apt.estado === 'confirmada' ? 'var(--salud-success)' : '#888'
                    }}>
                    <div className="day">{date.getUTCDate()}</div>
                    <div className="month">{MONTHS[date.getUTCMonth()]}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="d-flex align-items-center flex-wrap" style={{ gap: '8px', marginBottom: '4px' }}>
                      <strong style={{ color: 'var(--gob-tertiary)', fontSize: '0.95rem' }}>
                        {apt.especialidad}
                      </strong>
                      <span className={`tag-estado ${apt.estado}`}>{
                        apt.estado === 'confirmada' ? 'Confirmada' :
                        apt.estado === 'completada' ? 'Completada' :
                        apt.estado === 'pendiente' ? 'Pendiente' : 'Cancelada'
                      }</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#555', marginBottom: '4px' }}>
                      <span className="material-icons-outlined" style={{ fontSize: '0.9rem', verticalAlign: 'middle', marginRight: 4 }}>
                        person
                      </span>
                      {apt.medico}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#888' }}>
                      <span className="material-icons-outlined" style={{ fontSize: '0.9rem', verticalAlign: 'middle', marginRight: 4 }}>
                        location_on
                      </span>
                      {apt.centroSalud}
                      <span style={{ margin: '0 8px' }}>•</span>
                      <span className="material-icons-outlined" style={{ fontSize: '0.9rem', verticalAlign: 'middle', marginRight: 4 }}>
                        schedule
                      </span>
                      {apt.hora.substring(0, 5)} hrs
                    </div>
                    {apt.notas && (
                      <div style={{
                        marginTop: '8px',
                        background: '#f5f7fa',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '0.82rem',
                        color: '#555',
                        borderLeft: '3px solid var(--gob-primary)'
                      }}>
                        <strong>Notas:</strong> {apt.notas}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
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

export default History;
