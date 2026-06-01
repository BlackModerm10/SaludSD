import React, { useEffect, useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import GobNavbar from '../../components/GobNavbar';
import GobFooter from '../../components/GobFooter';
import api from '../../services/api';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndReadNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        const notifs = res.data;
        setNotifications(notifs);

        // Mark unread notifications as read asynchronously
        const unread = notifs.filter((n: any) => !n.leida);
        for (const n of unread) {
          api.put(`/notifications/${n.id}/read`).catch(err => {
            console.error(`Error al marcar leída notif ${n.id}:`, err);
          });
        }
      } catch (err) {
        console.error('Error al obtener notificaciones:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndReadNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.leida).length;

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
              {loading ? 'Cargando...' : `${unreadCount} nuevas`}
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                border: '3px solid #e0e0e0', borderTopColor: 'var(--gob-primary)',
                animation: 'spin 1s linear infinite', margin: '0 auto 1rem'
              }} />
              <p style={{ color: '#888' }}>Cargando notificaciones...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '4rem 2rem', background: '#fff',
              borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', color: '#888'
            }}>
              <span className="material-icons-outlined" style={{ fontSize: '3rem', color: '#ccc', marginBottom: '1rem' }}>
                notifications_off
              </span>
              <p>No tienes notificaciones registradas.</p>
            </div>
          ) : (
            notifications.map((n, idx) => (
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
            ))
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

export default Notifications;
