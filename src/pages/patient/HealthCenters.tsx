import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import GobNavbar from '../../components/GobNavbar';
import GobFooter from '../../components/GobFooter';
import { mockHealthCenters } from '../../services/mockData';

const HealthCenters: React.FC = () => {
  return (
    <IonPage>
      <IonContent>
        <GobNavbar />
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: 900 }}>
          <div className="section-header">
            <h2>
              <span className="material-icons-outlined" style={{ fontSize: '1.3rem', verticalAlign: 'middle', marginRight: 6 }}>
                location_on
              </span>
              Centros de Salud
            </h2>
          </div>
          <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Centros de salud disponibles en la comuna de Santo Domingo y alrededores.
          </p>

          {mockHealthCenters.map((centro, idx) => (
            <div key={centro.id} className="center-card animate-in" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <div className="d-flex align-items-center" style={{ gap: '8px', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--gob-tertiary)' }}>{centro.nombre}</h3>
                    <span className={`center-type ${centro.tipo}`}>{centro.tipo}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#888' }}>
                    <span className="material-icons-outlined" style={{ fontSize: '0.9rem', verticalAlign: 'middle', marginRight: 4 }}>
                      location_on
                    </span>
                    {centro.direccion}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#888', marginTop: 4 }}>
                    <span className="material-icons-outlined" style={{ fontSize: '0.9rem', verticalAlign: 'middle', marginRight: 4 }}>
                      phone
                    </span>
                    {centro.telefono}
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 80 }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--gob-primary)' }}>
                    ~{centro.tiempoEsperaPromedio}d
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#888' }}>espera promedio</div>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-sm-6">
                  <div style={{ fontSize: '0.82rem', color: '#666', marginBottom: 4 }}>
                    Capacidad diaria: <strong>{centro.capacidadDiaria}</strong> atenciones
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex justify-content-between" style={{ fontSize: '0.75rem', color: '#888', marginBottom: 4 }}>
                    <span>Ocupación actual</span>
                    <span style={{ fontWeight: 600, color: centro.ocupacionActual > 85 ? 'var(--salud-danger)' : 'var(--gob-primary)' }}>
                      {centro.ocupacionActual}%
                    </span>
                  </div>
                  <div className="progress-custom">
                    <div className={`progress-fill ${centro.ocupacionActual > 85 ? 'high' : centro.ocupacionActual > 70 ? 'medium' : ''}`}
                      style={{ width: `${centro.ocupacionActual}%` }} />
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--gob-tertiary)', marginBottom: '6px' }}>
                  Especialidades disponibles:
                </div>
                <div className="d-flex flex-wrap" style={{ gap: '6px' }}>
                  {centro.especialidades.map(esp => (
                    <span key={esp} style={{
                      background: '#e3f0ff', color: 'var(--gob-primary)',
                      padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 500
                    }}>
                      {esp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <GobFooter />
      </IonContent>
    </IonPage>
  );
};

export default HealthCenters;
