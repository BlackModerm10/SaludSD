import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import api from '../services/api';

const NotificationBell: React.FC = () => {
  const history = useHistory();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Unread count
  const unreadCount = notifications.filter(n => !n.leida && !n.read).length;

  const fetchNotifications = async (isInitial = false) => {
    try {
      const res = await api.get('/notifications');
      const newNotifs = res.data || [];
      
      // If not initial fetch, check if there are new unread notifications that we didn't have before
      if (!isInitial && newNotifs.length > 0) {
        const currentIds = new Set(notifications.map(n => n.id));
        const brandNewUnread = newNotifs.filter((n: any) => (!n.leida && !n.read) && !currentIds.has(n.id));
        
        if (brandNewUnread.length > 0) {
          // Trigger browser notification or custom toast
          brandNewUnread.forEach((n: any) => {
            showToast(n.titulo || n.title, n.mensaje || n.message);
          });
        }
      }
      
      setNotifications(newNotifs);
    } catch (err) {
      console.error('Error al obtener notificaciones en campana:', err);
    }
  };

  // Toast notification helper using custom event to trigger Ionic Toast
  const showToast = (title: string, message: string) => {
    const event = new CustomEvent('saludsd-toast', {
      detail: { title, message }
    });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    // Initial fetch
    fetchNotifications(true);

    // Polling every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 30000);

    // Click outside handler to close dropdown
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notifications.length]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, leida: true, read: true } : n))
      );
    } catch (err) {
      console.error('Error al marcar leída:', err);
    }
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev =>
        prev.map(n => ({ ...n, leida: true, read: true }))
      );
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error al eliminar notificación:', err);
    }
  };

  const handleNotificationClick = (n: any) => {
    setShowDropdown(false);
    history.push('/paciente/notificaciones');
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          padding: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          outline: 'none'
        }}
        title="Notificaciones"
      >
        <span className="material-icons-outlined" style={{ fontSize: '1.45rem' }}>notifications</span>
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              background: 'var(--salud-danger, #dc3545)',
              color: '#fff',
              fontSize: '0.68rem',
              fontWeight: 'bold',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 0 2px var(--gob-primary)'
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: '40px',
            right: 0,
            background: '#fff',
            borderRadius: 'var(--radius-lg, 8px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            width: '320px',
            zIndex: 1000,
            overflow: 'hidden',
            border: '1px solid #e0e0e0',
            animation: 'fadeInUp 0.2s ease'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '10px 15px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8f9fa'
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--gob-tertiary)' }}>
              Notificaciones
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--gob-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Marcar todas leídas
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '0.82rem' }}>
                No tienes notificaciones
              </div>
            ) : (
              notifications.slice(0, 5).map(n => {
                const isUnread = !n.leida && !n.read;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`notification-bell-item ${isUnread ? 'unread' : ''}`}
                  >
                    {/* Status dot */}
                    {isUnread && (
                      <div className="notification-bell-dot" />
                    )}
                    <div style={{ flex: 1, paddingRight: '20px' }}>
                      <div className="notification-bell-title">
                        {n.titulo || n.title}
                      </div>
                      <div className="notification-bell-message">
                        {n.mensaje || n.message}
                      </div>
                      <div className="notification-bell-date">
                        {new Date(n.fecha || n.createdAt).toLocaleDateString('es-CL')}
                      </div>
                    </div>

                    {/* Actions */}
                    <div
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      {isUnread && (
                        <button
                          onClick={(e) => handleMarkAsRead(n.id, e)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#888',
                            padding: 0
                          }}
                          title="Marcar como leída"
                        >
                          <span className="material-icons-outlined" style={{ fontSize: '0.95rem' }}>done</span>
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(n.id, e)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#bbb',
                          padding: 0
                        }}
                        title="Eliminar"
                      >
                        <span className="material-icons-outlined" style={{ fontSize: '0.95rem' }}>delete</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              borderTop: '1px solid #eee',
              textAlign: 'center',
              background: '#f8f9fa'
            }}
          >
            <button
              onClick={() => { setShowDropdown(false); history.push('/paciente/notificaciones'); }}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                padding: '8px',
                color: 'var(--gob-primary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Ver todas las notificaciones
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
