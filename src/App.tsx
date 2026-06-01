import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { AuthProvider, useAuth } from './services/AuthContext';

/* Pages */
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import PatientDashboard from './pages/patient/Dashboard';
import WaitList from './pages/patient/WaitList';
import RequestAppointment from './pages/patient/RequestAppointment';
import History from './pages/patient/History';
import HealthCenters from './pages/patient/HealthCenters';
import Notifications from './pages/patient/Notifications';
import AdminDashboard from './pages/admin/Dashboard';
import ManageLists from './pages/admin/ManageLists';
import Statistics from './pages/admin/Statistics';

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

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <IonReactRouter>
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
      </IonReactRouter>
    </AuthProvider>
  </IonApp>
);

export default App;
