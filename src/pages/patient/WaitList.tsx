import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import GobNavbar from '../../components/GobNavbar';
import GobFooter from '../../components/GobFooter';
import { mockWaitList } from '../../services/mockData';

const WaitList: React.FC = () => {
  const myEntries = mockWaitList.filter(w => w.pacienteId === 'u1');

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
            <span className="tag-estado en_espera">{myEntries.length} activas</span>
          </div>

          <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Aquí puedes ver tu posición actual en cada lista de espera y el tiempo estimado de atención.
          </p>

          {myEntries.map((entry, idx) => (
            <div key={entry.id} className={`waitlist-item prioridad-${entry.prioridad} animate-in`}
              style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="d-flex align-items-start" style={{ gap: '16px' }}>
                <div className="position-badge">{entry.posicion}</div>
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
                      <div style={{
                        background: '#f0f7ff',
                        borderRadius: '10px',
                        padding: '0.75rem 1rem',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gob-primary)' }}>
                          ~{entry.tiempoEstimadoDias}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#888' }}>días estimados</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <div className="d-flex justify-content-between" style={{ fontSize: '0.78rem', color: '#888', marginBottom: 4 }}>
                      <span>Posición {entry.posicion} de {entry.totalEnLista}</span>
                      <span>{Math.round(((entry.totalEnLista - entry.posicion) / entry.totalEnLista) * 100)}% avanzado</span>
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
      </IonContent>
    </IonPage>
  );
};

export default WaitList;
