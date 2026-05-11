import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import GobNavbar from '../../components/GobNavbar';
import GobFooter from '../../components/GobFooter';
import { mockNotifications } from '../../services/mockData';

const Notifications: React.FC = () => {
  return (
    <IonPage>
      <IonContent>
        <GobNavbar />
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: 700 }}>
          <div className="section-header">
            <h2>
              <span className="material-icons-outlined" style={{ fontSize: '1.3rem', verticalAlign: 'middle', marginRight: 6 }}>
                notifications
              </span>
              Notificaciones
            </h2>
            <span style={{
              background: 'var(--salud-danger)', color: '#fff', borderRadius: '12px',
              padding: '2px 10px', fontSize: '0.78rem', fontWeight: 600
            }}>
              {mockNotifications.filter(n => !n.leida).length} nuevas
            </span>
          </div>

          {mockNotifications.map((n, idx) => (
            <div key={n.id} className={`notification-item ${!n.leida ? 'unread' : ''} animate-in`}
              style={{ animationDelay: `${idx * 0.08}s` }}>
              <div className={`notif-icon ${n.tipo}`}>
                <span className="material-icons-outlined" style={{ fontSize: '1rem' }}>
                  {n.tipo === 'exito' ? 'check_circle' :
                    n.tipo === 'recordatorio' ? 'alarm' :
                    n.tipo === 'alerta' ? 'warning' : 'info'}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div className="d-flex justify-content-between align-items-start">
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--gob-tertiary)' }}>
                    {n.titulo}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#aaa', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                    {new Date(n.fecha).toLocaleDateString('es-CL')}
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.5, marginTop: '4px' }}>
                  {n.mensaje}
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

export default Notifications;
