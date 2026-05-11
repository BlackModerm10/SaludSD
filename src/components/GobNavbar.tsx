import React from 'react';
import { useAuth } from '../services/AuthContext';
import { useHistory, useLocation } from 'react-router-dom';

const GobNavbar: React.FC = () => {
  const { user, isAuthenticated, isStaff, activeRole, logout, selectRole } = useAuth();
  const history = useHistory();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    history.push('/');
  };

  const handleSwitchRole = () => {
    const newRole = user?.role === 'admin' ? 'paciente' : 'admin';
    selectRole(newRole as 'paciente' | 'admin');
    if (newRole === 'paciente') {
      history.push('/paciente/dashboard');
    } else {
      history.push('/admin/dashboard');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg gob-navbar">
      <div className="container">
        <a
          className="navbar-brand d-flex align-items-center"
          href="#"
          onClick={(e) => { e.preventDefault(); history.push('/'); }}
          style={{ gap: '10px' }}
        >
          <div style={{
            width: 36, height: 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem'
          }}>
            <span className="material-icons-outlined" style={{ color: '#fff', fontSize: '1.3rem' }}>
              local_hospital
            </span>
          </div>
          <span style={{ color: '#fff', fontFamily: "'Roboto Slab', serif", fontWeight: 700, fontSize: '1.15rem' }}>
            SaludSD
          </span>
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSalud"
          aria-controls="navbarSalud"
          aria-expanded="false"
          aria-label="Menú"
          style={{ borderColor: 'rgba(255,255,255,0.3)' }}
        >
          <span className="material-icons-outlined" style={{ color: '#fff' }}>menu</span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSalud">
          <ul className="navbar-nav ml-auto align-items-center">
            {!isAuthenticated ? (
              <>
                <li className="nav-item">
                  <a className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    href="#" onClick={(e) => { e.preventDefault(); history.push('/'); }}>
                    Inicio
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#"
                    onClick={(e) => { e.preventDefault(); history.push('/login'); }}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '20px',
                      padding: '6px 16px',
                      display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.65 10C11.83 7.67 9.61 6 7 6C3.69 6 1 8.69 1 12C1 15.31 3.69 18 7 18C9.61 18 11.83 16.33 12.65 14H17V18H21V14H23V10H12.65ZM7 14C5.9 14 5 13.1 5 12C5 10.9 5.9 10 7 10C8.1 10 9 10.9 9 12C9 13.1 8.1 14 7 14Z" fill="white"/>
                    </svg>
                    Iniciar con ClaveÚnica
                  </a>
                </li>
              </>
            ) : user?.role === 'paciente' ? (
              <>
                <li className="nav-item">
                  <a className={`nav-link ${isActive('/paciente/dashboard') ? 'active' : ''}`}
                    href="#" onClick={(e) => { e.preventDefault(); history.push('/paciente/dashboard'); }}>
                    Dashboard
                  </a>
                </li>
                <li className="nav-item">
                  <a className={`nav-link ${isActive('/paciente/lista-espera') ? 'active' : ''}`}
                    href="#" onClick={(e) => { e.preventDefault(); history.push('/paciente/lista-espera'); }}>
                    Mi Lista
                  </a>
                </li>
                <li className="nav-item">
                  <a className={`nav-link ${isActive('/paciente/solicitar-cita') ? 'active' : ''}`}
                    href="#" onClick={(e) => { e.preventDefault(); history.push('/paciente/solicitar-cita'); }}>
                    Solicitar Cita
                  </a>
                </li>
                <li className="nav-item">
                  <a className={`nav-link ${isActive('/paciente/historial') ? 'active' : ''}`}
                    href="#" onClick={(e) => { e.preventDefault(); history.push('/paciente/historial'); }}>
                    Historial
                  </a>
                </li>

                {/* Role Switch for Staff */}
                {isStaff && (
                  <li className="nav-item" style={{ marginLeft: '0.25rem' }}>
                    <a className="nav-link d-flex align-items-center" href="#"
                      onClick={(e) => { e.preventDefault(); handleSwitchRole(); }}
                      style={{
                        gap: '5px',
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: '20px',
                        padding: '4px 12px',
                        fontSize: '0.82rem',
                      }}
                      title="Cambiar a vista de funcionario"
                    >
                      <span className="material-icons-outlined" style={{ fontSize: '1rem' }}>swap_horiz</span>
                      Funcionario
                    </a>
                  </li>
                )}

                <li className="nav-item" style={{ marginLeft: '0.25rem' }}>
                  <a className="nav-link d-flex align-items-center" href="#"
                    onClick={(e) => { e.preventDefault(); handleLogout(); }}
                    style={{ gap: '6px', opacity: 0.85 }}>
                    <span className="material-icons-outlined" style={{ fontSize: '1.1rem' }}>logout</span>
                    Salir
                  </a>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <a className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
                    href="#" onClick={(e) => { e.preventDefault(); history.push('/admin/dashboard'); }}>
                    Dashboard
                  </a>
                </li>
                <li className="nav-item">
                  <a className={`nav-link ${isActive('/admin/listas') ? 'active' : ''}`}
                    href="#" onClick={(e) => { e.preventDefault(); history.push('/admin/listas'); }}>
                    Listas de Espera
                  </a>
                </li>
                <li className="nav-item">
                  <a className={`nav-link ${isActive('/admin/estadisticas') ? 'active' : ''}`}
                    href="#" onClick={(e) => { e.preventDefault(); history.push('/admin/estadisticas'); }}>
                    Estadísticas
                  </a>
                </li>

                {/* Role Switch for Staff */}
                {isStaff && (
                  <li className="nav-item" style={{ marginLeft: '0.25rem' }}>
                    <a className="nav-link d-flex align-items-center" href="#"
                      onClick={(e) => { e.preventDefault(); handleSwitchRole(); }}
                      style={{
                        gap: '5px',
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: '20px',
                        padding: '4px 12px',
                        fontSize: '0.82rem',
                      }}
                      title="Cambiar a vista de paciente"
                    >
                      <span className="material-icons-outlined" style={{ fontSize: '1rem' }}>swap_horiz</span>
                      Paciente
                    </a>
                  </li>
                )}

                <li className="nav-item" style={{ marginLeft: '0.25rem' }}>
                  <a className="nav-link d-flex align-items-center" href="#"
                    onClick={(e) => { e.preventDefault(); handleLogout(); }}
                    style={{ gap: '6px', opacity: 0.85 }}>
                    <span className="material-icons-outlined" style={{ fontSize: '1.1rem' }}>logout</span>
                    Salir
                  </a>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default GobNavbar;
