import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, IonSkeletonText } from '@ionic/react';
import GobNavbar from '../../components/GobNavbar';
import GobFooter from '../../components/GobFooter';
import api from '../../services/api';

const WaitList: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/waitlist')
      .then(res => {
        setEntries(res.data);
      })
      .catch(err => {
        console.error('Error al obtener lista de espera:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <IonPage>
      <IonContent>
        <GobNavbar />
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: 900 }}>
          <div className="section-header">
            <h2>
              <span className="material-icons-outlined" style={{ fontSize: '1.3rem', verticalAlign: 'middle', marginRight: 6 }}>
                format_list_numbered
              </span>
              Mis Listas de Espera
            </h2>
            <span className="tag-estado en_espera">
              {loading ? 'Cargando...' : `${entries.length} activas`}
            </span>
          </div>

          <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Aquí puedes ver tu posición actual en cada lista de espera y el tiempo estimado de atención.
          </p>

          {loading ? (
            <div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="waitlist-item" style={{ borderLeftColor: '#e0e0e0', opacity: 0.7 }}>
                  <div className="d-flex align-items-start" style={{ gap: '16px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <IonSkeletonText animated style={{ width: '40%', height: '40%', borderRadius: '50%' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="d-flex align-items-center" style={{ gap: '8px', marginBottom: '8px' }}>
                        <IonSkeletonText animated style={{ width: '150px', height: '1.2rem' }} />
                        <IonSkeletonText animated style={{ width: '70px', height: '1.1rem', borderRadius: '12px' }} />
                        <IonSkeletonText animated style={{ width: '80px', height: '1.1rem', borderRadius: '12px' }} />
                      </div>
                      <div className="row mt-2">
                        <div className="col-sm-6">
                          <IonSkeletonText animated style={{ width: '80%', height: '0.85rem', marginBottom: '8px' }} />
                          <IonSkeletonText animated style={{ width: '60%', height: '0.85rem' }} />
                        </div>
                        <div className="col-sm-6 text-sm-right mt-2 mt-sm-0">
                          <div style={{ float: 'right', width: '100px' }}>
                            <IonSkeletonText animated style={{ width: '100%', height: '2.5rem', borderRadius: '10px' }} />
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: '12px' }}>
                        <IonSkeletonText animated style={{ width: '100%', height: '8px', borderRadius: '4px' }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '4rem 2rem', background: '#fff',
              borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)'
            }}>
              <span className="material-icons-outlined" style={{ fontSize: '3rem', color: '#ccc', marginBottom: '1rem' }}>
                list_alt
              </span>
              <h3 style={{ color: 'var(--gob-tertiary)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No estás en ninguna lista de espera</h3>
              <p style={{ color: '#888', fontSize: '0.9rem', maxWidth: 320, margin: '0 auto' }}>
                Si tu médico generó una interconsulta, aparecerá aquí tan pronto como sea procesada.
              </p>
            </div>
          ) : (
            entries.map((entry, idx) => {
              const total = Math.max(entry.totalEnLista || 0, entry.posicion || 0);
              const pos = entry.posicion || 1;
              
              let percent = 0;
              let badgeContent: React.ReactNode = pos;
              let positionText = '';
              let progressText = '';
              let progressFillStyle: React.CSSProperties = {};

              if (entry.estado === 'en_espera') {
                percent = total > 0 ? Math.min(100, Math.max(1, Math.round(((total - pos + 1) / total) * 100))) : 0;
                positionText = `Posición ${pos} de ${total}`;
                progressText = `${percent}% avanzado`;
              } else if (entry.estado === 'programada') {
                percent = 100;
                badgeContent = <span className="material-icons-outlined" style={{ fontSize: '1.25rem', verticalAlign: 'middle' }}>event</span>;
                positionText = 'Cita programada';
                progressText = '¡Turno asignado!';
                progressFillStyle = { background: 'linear-gradient(90deg, #28a745, #48c768)' };
              } else if (entry.estado === 'atendida' || entry.estado === 'completada') {
                percent = 100;
                badgeContent = <span className="material-icons-outlined" style={{ fontSize: '1.25rem', verticalAlign: 'middle' }}>check_circle</span>;
                positionText = 'Atención finalizada';
                progressText = 'Completado';
                progressFillStyle = { background: 'linear-gradient(90deg, #17a2b8, #38c2d8)' };
              } else {
                percent = 0;
                badgeContent = <span className="material-icons-outlined" style={{ fontSize: '1.25rem', verticalAlign: 'middle' }}>archive</span>;
                positionText = 'Solicitud retirada';
                progressText = 'Retirado';
                progressFillStyle = { background: '#888' };
              }

              return (
                <div key={entry.id} className={`waitlist-item prioridad-${entry.prioridad} animate-in`}
                  style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="d-flex align-items-start" style={{ gap: '16px' }}>
                    <div className="position-badge">{badgeContent}</div>
                    <div style={{ flex: 1 }}>
                      <div className="d-flex align-items-center flex-wrap" style={{ gap: '8px', marginBottom: '6px' }}>
                        <strong style={{ color: 'var(--gob-tertiary)', fontSize: '1.05rem' }}>
                          {entry.especialidad}
                        </strong>
                        <span className={`tag-prioridad ${entry.prioridad}`}>{entry.prioridad}</span>
                        <span className={`tag-estado ${entry.estado}`}>
                          {entry.estado === 'en_espera' ? 'En espera' :
                           entry.estado === 'programada' ? 'Programada' : entry.estado}
                        </span>
                      </div>

                      <div className="row mt-2">
                        <div className="col-sm-6">
                          <div style={{ fontSize: '0.82rem', color: '#888', marginBottom: '4px' }}>
                            <span className="material-icons-outlined" style={{ fontSize: '0.9rem', verticalAlign: 'middle', marginRight: 4 }}>
                              location_on
                            </span>
                            {entry.centroSalud}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#888' }}>
                            <span className="material-icons-outlined" style={{ fontSize: '0.9rem', verticalAlign: 'middle', marginRight: 4 }}>
                              calendar_today
                            </span>
                            Solicitada: {new Date(entry.fechaSolicitud).toLocaleDateString('es-CL')}
                          </div>
                        </div>
                        <div className="col-sm-6 text-sm-right mt-2 mt-sm-0">
                          <div className="estimated-days-box">
                            <div className="estimated-days-number">
                              ~{entry.tiempoEstimadoDias}
                            </div>
                            <div className="estimated-days-label">días estimados</div>
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: '12px' }}>
                        <div className="d-flex justify-content-between" style={{ fontSize: '0.78rem', color: '#888', marginBottom: 4 }}>
                          <span>{positionText}</span>
                          <span>{progressText}</span>
                        </div>
                        <div className="progress-custom">
                          <div className="progress-fill"
                            style={{ width: `${percent}%`, ...progressFillStyle }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Timeline explanation */}
          <div style={{
            background: '#fff',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            marginTop: '1.5rem'
          }}>
            <h3 style={{ fontFamily: "'Roboto Slab', serif", fontSize: '1.05rem', color: 'var(--gob-tertiary)', marginBottom: '1rem' }}>
              <span className="material-icons-outlined" style={{ fontSize: '1.1rem', verticalAlign: 'middle', marginRight: 6 }}>
                info
              </span>
              ¿Cómo funciona la lista de espera?
            </h3>
            <div className="row">
              {[
                { step: '1', icon: 'description', title: 'Solicitud', desc: 'Tu médico genera la interconsulta y quedas en la lista de la especialidad.' },
                { step: '2', icon: 'trending_up', title: 'Avance', desc: 'Tu posición avanza según la capacidad del centro y la prioridad clínica.' },
                { step: '3', icon: 'notifications', title: 'Notificación', desc: 'Recibirás una alerta cuando se acerque tu turno o cuando tu cita sea programada.' },
                { step: '4', icon: 'check_circle', title: 'Atención', desc: 'Asiste a tu cita en el centro de salud indicado con tu carnet y documentos.' },
              ].map((s, i) => (
                <div className="col-md-3 col-6 mb-3" key={i}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'var(--gob-primary)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 0.5rem', fontWeight: 700
                    }}>
                      {s.step}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--gob-tertiary)', marginBottom: 4 }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#888', lineHeight: 1.4 }}>
                      {s.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

export default WaitList;
