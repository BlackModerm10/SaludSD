import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import GobNavbar from '../components/GobNavbar';
import GobFooter from '../components/GobFooter';

const Landing: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonContent>
        <GobNavbar />

        {/* Hero */}
        <section className="hero-section">
          <div className="container">
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(201, 136, 136, 0.15)', marginBottom: '1.5rem'
            }}>
              <span className="material-icons-outlined" style={{ fontSize: '2.2rem', color: '#fff' }}>
                health_and_safety
              </span>
            </div>
            <h1>Gestión de Listas de Espera</h1>
            <p style={{ color: '#ffffffa4' }}>
              Accede al sistema de la Municipalidad de Santo Domingo para consultar tus
              tiempos de espera, solicitar citas médicas y estar al día con tu atención
              de salud primaria.
            </p>
            <div className="d-flex justify-content-center flex-wrap" style={{ gap: '12px' }}>
              <button
                className="btn btn-light btn-lg d-flex align-items-center"
                style={{ borderRadius: '30px', fontWeight: 600, padding: '12px 32px', gap: '10px' }}
                onClick={() => history.push('/login')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.65 10C11.83 7.67 9.61 6 7 6C3.69 6 1 8.69 1 12C1 15.31 3.69 18 7 18C9.61 18 11.83 16.33 12.65 14H17V18H21V14H23V10H12.65ZM7 14C5.9 14 5 13.1 5 12C5 10.9 5.9 10 7 10C8.1 10 9 10.9 9 12C9 13.1 8.1 14 7 14Z" fill="#0F69B4"/>
                </svg>
                Ingresar con ClaveÚnica
              </button>
            </div>
          </div>
        </section>

        {/* Stats Strip */}
        <section style={{
          background: '#fff',
          padding: '2rem 0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <div className="container">
            <div className="row text-center">
              {[
                { value: '4', label: 'Centros de Salud', icon: 'local_hospital' },
                { value: '847', label: 'Pacientes en lista', icon: 'people' },
                { value: '42 días', label: 'Espera promedio', icon: 'schedule' },
                { value: '24/7', label: 'Acceso al sistema', icon: 'cloud' },
              ].map((stat, i) => (
                <div className="col-6 col-md-3 mb-3 mb-md-0" key={i}>
                  <span className="material-icons-outlined" style={{
                    fontSize: '2rem', color: 'var(--gob-primary)', marginBottom: '0.5rem', display: 'block'
                  }}>
                    {stat.icon}
                  </span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gob-tertiary)' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#888' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ background: '#f5f7fa', padding: '3rem 0' }}>
          <div className="container text-center">
            <h2 style={{
              fontFamily: "'Roboto Slab', serif",
              color: 'var(--gob-tertiary)',
              marginBottom: '0.5rem'
            }}>
              ¿Qué puedes hacer en SaludSD?
            </h2>
            <p style={{ color: '#888', marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem' }}>
              Digitaliza tu experiencia de atención primaria de salud
            </p>
          </div>
          <div className="features-grid">
            {[
              {
                icon: 'format_list_numbered',
                title: 'Consulta tu posición',
                desc: 'Revisa en tiempo real tu lugar en la lista de espera y el tiempo estimado para tu atención.',
                bg: 'linear-gradient(135deg, #006FB3, #0088d6)'
              },
              {
                icon: 'event_available',
                title: 'Solicita citas médicas',
                desc: 'Pide hora con la especialidad que necesites en los centros de salud de Santo Domingo.',
                bg: 'linear-gradient(135deg, #28a745, #48c768)'
              },
              {
                icon: 'history',
                title: 'Historial de atenciones',
                desc: 'Consulta tu historial de citas pasadas, diagnósticos y seguimiento de tratamientos.',
                bg: 'linear-gradient(135deg, #FE6565, #ff8a8a)'
              },
              {
                icon: 'notifications_active',
                title: 'Notificaciones',
                desc: 'Recibe alertas cuando tu posición avance, recordatorios de citas y novedades de salud.',
                bg: 'linear-gradient(135deg, #ffc107, #ffd54f)'
              },
              {
                icon: 'location_on',
                title: 'Centros de salud',
                desc: 'Encuentra los CESFAM y SAR disponibles con sus tiempos de espera actualizados.',
                bg: 'linear-gradient(135deg, #17a2b8, #38c2d8)'
              },
              {
                icon: 'bar_chart',
                title: 'Transparencia',
                desc: 'Acceso a estadísticas públicas sobre tiempos de espera y cobertura de atención en la comuna.',
                bg: 'linear-gradient(135deg, #6f42c1, #9775d9)'
              },
            ].map((f, i) => (
              <div className="feature-card animate-in" key={i}>
                <div className="feature-icon" style={{ background: f.bg }}>
                  <span className="material-icons-outlined">{f.icon}</span>
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{
          background: 'linear-gradient(135deg, var(--gob-tertiary) 0%, #1a2540 100%)',
          color: '#fff',
          padding: '4rem 1.5rem',
          textAlign: 'center'
        }}>
          <div className="container">
            <h2 style={{ fontFamily: "'Roboto Slab', serif", marginBottom: '1rem' }}>
              Mejora tu experiencia de salud en Santo Domingo
            </h2>
            <p style={{ opacity: 0.8, maxWidth: 500, margin: '0 auto 2rem' }}>
              Accede con tu ClaveÚnica y comienza a gestionar tus citas y listas de espera
              de forma digital, transparente y eficiente.
            </p>
            <button
              className="btn btn-light btn-lg d-flex align-items-center"
              style={{ borderRadius: '30px', fontWeight: 600, padding: '14px 40px', gap: '10px', margin: '0 auto' }}
              onClick={() => history.push('/login')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.65 10C11.83 7.67 9.61 6 7 6C3.69 6 1 8.69 1 12C1 15.31 3.69 18 7 18C9.61 18 11.83 16.33 12.65 14H17V18H21V14H23V10H12.65ZM7 14C5.9 14 5 13.1 5 12C5 10.9 5.9 10 7 10C8.1 10 9 10.9 9 12C9 13.1 8.1 14 7 14Z" fill="#0F69B4"/>
              </svg>
              Acceder con ClaveÚnica
            </button>
          </div>
        </section>

        <GobFooter />
      </IonContent>
    </IonPage>
  );
};

export default Landing;
