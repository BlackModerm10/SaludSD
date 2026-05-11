import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { AuthProvider } from './services/AuthContext';

/* Pages */
import Landing from './pages/Landing';
import Login from './pages/Login';
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

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <IonReactRouter>
        <IonRouterOutlet>
          {/* Public Routes */}
          <Route exact path="/" component={Landing} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/auth/callback" component={AuthCallback} />

          {/* Patient Routes */}
          <Route exact path="/paciente/dashboard" component={PatientDashboard} />
          <Route exact path="/paciente/lista-espera" component={WaitList} />
          <Route exact path="/paciente/solicitar-cita" component={RequestAppointment} />
          <Route exact path="/paciente/historial" component={History} />
          <Route exact path="/paciente/centros" component={HealthCenters} />
          <Route exact path="/paciente/notificaciones" component={Notifications} />

          {/* Admin Routes */}
          <Route exact path="/admin/dashboard" component={AdminDashboard} />
          <Route exact path="/admin/listas" component={ManageLists} />
          <Route exact path="/admin/estadisticas" component={Statistics} />

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
