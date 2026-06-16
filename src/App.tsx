import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonToast, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { AuthProvider, useAuth } from './services/AuthContext';

/* Pages */
const Landing = React.lazy(() => import('./pages/Landing'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const AuthCallback = React.lazy(() => import('./pages/AuthCallback'));
const PatientDashboard = React.lazy(() => import('./pages/patient/Dashboard'));
const WaitList = React.lazy(() => import('./pages/patient/WaitList'));
const RequestAppointment = React.lazy(() => import('./pages/patient/RequestAppointment'));
const History = React.lazy(() => import('./pages/patient/History'));
const HealthCenters = React.lazy(() => import('./pages/patient/HealthCenters'));
const Notifications = React.lazy(() => import('./pages/patient/Notifications'));
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const ManageLists = React.lazy(() => import('./pages/admin/ManageLists'));
const Statistics = React.lazy(() => import('./pages/admin/Statistics'));

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import './theme/global.css';

setupIonicReact({
  mode: 'md', // Use Material Design for consistent look
});

// PrivateRoute component for protecting patient and admin workspaces
const PrivateRoute: React.FC<{ component: React.ComponentType<any>; exact?: boolean; path: string; requiredRole?: 'paciente' | 'admin' }> = ({ component: Component, requiredRole, ...rest }) => {
  const { isAuthenticated, loading, activeRole } = useAuth();

  if (loading) {
    // Show a clean loading state while restoring session from JWT token
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7fa'
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '3px solid #e0e0e0', borderTopColor: 'var(--gob-primary)',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!isAuthenticated) {
          return <Redirect to="/login" />;
        }
        if (requiredRole && activeRole !== requiredRole) {
          // If the user's active role doesn't match the required role, redirect to their active workspace
          return <Redirect to={activeRole === 'admin' ? '/admin/dashboard' : '/paciente/dashboard'} />;
        }
        return <Component {...props} />;
      }}
    />
  );
};

const App: React.FC = () => {
  const [offlineMessage, setOfflineMessage] = React.useState<string | null>(null);
  const [toastInfo, setToastInfo] = React.useState<{ title: string; message: string } | null>(null);

  React.useEffect(() => {
    const handleOffline = (e: Event) => {
      const customEvent = e as CustomEvent;
      setOfflineMessage(customEvent.detail?.message || 'Estás navegando en modo offline.');
    };

    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent;
      setToastInfo({
        title: customEvent.detail?.title || 'Notificación',
        message: customEvent.detail?.message || ''
      });
    };

    window.addEventListener('saludsd-offline', handleOffline);
    window.addEventListener('saludsd-toast', handleToast);

    // Native online/offline events
    const handleNativeOffline = () => {
      setOfflineMessage('Sin conexión a Internet. Usando datos almacenados localmente.');
    };
    const handleNativeOnline = () => {
      setOfflineMessage(null);
      setToastInfo({
        title: 'Conexión Restablecida',
        message: 'Has vuelto a conectarte a la red.'
      });
    };

    window.addEventListener('offline', handleNativeOffline);
    window.addEventListener('online', handleNativeOnline);

    // Initial check
    if (!navigator.onLine) {
      handleNativeOffline();
    }

    return () => {
      window.removeEventListener('saludsd-offline', handleOffline);
      window.removeEventListener('saludsd-toast', handleToast);
      window.removeEventListener('offline', handleNativeOffline);
      window.removeEventListener('online', handleNativeOnline);
    };
  }, []);

  return (
    <IonApp>
      {offlineMessage && (
        <div style={{
          background: 'var(--ion-color-warning, #ffc409)',
          color: '#000',
          padding: '10px 16px',
          textAlign: 'center',
          fontSize: '0.88rem',
          fontWeight: 600,
          zIndex: 9999,
          position: 'sticky',
          top: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          transition: 'all 0.3s ease'
        }}>
          <span className="material-icons-outlined" style={{ fontSize: '1.25rem', color: '#000' }}>wifi_off</span>
          <span>{offlineMessage}</span>
        </div>
      )}
      <AuthProvider>
        <IonReactRouter>
          <React.Suspense fallback={
            <div style={{
              height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ion-background-color, #f5f7fa)'
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                border: '3px solid #e0e0e0', borderTopColor: 'var(--gob-primary)',
                animation: 'spin 1s linear infinite'
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          }>
            <IonRouterOutlet>
              {/* Public Routes */}
              <Route exact path="/" component={Landing} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/register" component={Register} />
              <Route exact path="/auth/callback" component={AuthCallback} />

              {/* Patient Routes (Protected) */}
              <PrivateRoute exact path="/paciente/dashboard" component={PatientDashboard} requiredRole="paciente" />
              <PrivateRoute exact path="/paciente/lista-espera" component={WaitList} requiredRole="paciente" />
              <PrivateRoute exact path="/paciente/solicitar-cita" component={RequestAppointment} requiredRole="paciente" />
              <PrivateRoute exact path="/paciente/historial" component={History} requiredRole="paciente" />
              <PrivateRoute exact path="/paciente/centros" component={HealthCenters} requiredRole="paciente" />
              <PrivateRoute exact path="/paciente/notificaciones" component={Notifications} requiredRole="paciente" />

              {/* Admin Routes (Protected) */}
              <PrivateRoute exact path="/admin/dashboard" component={AdminDashboard} requiredRole="admin" />
              <PrivateRoute exact path="/admin/listas" component={ManageLists} requiredRole="admin" />
              <PrivateRoute exact path="/admin/estadisticas" component={Statistics} requiredRole="admin" />

              {/* Fallback */}
              <Route>
                <Redirect to="/" />
              </Route>
            </IonRouterOutlet>
          </React.Suspense>
        </IonReactRouter>
      </AuthProvider>
      <IonToast
        isOpen={!!toastInfo}
        onDidDismiss={() => setToastInfo(null)}
        header={toastInfo?.title}
        message={toastInfo?.message}
        duration={4500}
        position="top"
        color="primary"
        buttons={[
          {
            text: 'Cerrar',
            role: 'cancel'
          }
        ]}
      />
    </IonApp>
  );
};

export default App;
