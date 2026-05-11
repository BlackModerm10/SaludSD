import React from 'react';

const GobFooter: React.FC = () => {
  return (
    <footer className="gob-footer">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4 mb-md-0">
            <h5>SaludSD</h5>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
              Sistema de Gestión de Listas de Espera y Tiempos de Atención de la
              Municipalidad de Santo Domingo.
            </p>
            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
              Comprometidos con mejorar el acceso a la salud primaria.
            </p>
          </div>
          <div className="col-md-4 mb-4 mb-md-0">
            <h5>Enlaces Útiles</h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="#">Municipalidad de Santo Domingo</a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="#">Atención Primaria de Salud</a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="#">Centros de Salud Comunales</a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="#">Política de Privacidad</a>
              </li>
              <li>
                <a href="#">Términos y Condiciones</a>
              </li>
            </ul>
          </div>
          <div className="col-md-4">
            <h5>Contacto</h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li className="d-flex align-items-center mb-2" style={{ gap: '8px' }}>
                <span className="material-icons-outlined" style={{ fontSize: '1rem' }}>location_on</span>
                Av. Sta. Teresa de Los Andes 1, Santo Domingo, Valparaíso
              </li>
              <li className="d-flex align-items-center mb-2" style={{ gap: '8px' }}>
                <span className="material-icons-outlined" style={{ fontSize: '1rem' }}>phone</span>
                +56 35 238 1603
              </li>
              <li className="d-flex align-items-center mb-2" style={{ gap: '8px' }}>
                <span className="material-icons-outlined" style={{ fontSize: '1rem' }}>email</span>
                contacto@santodomingo.cl
              </li>
              <li className="d-flex align-items-center" style={{ gap: '8px' }}>
                <span className="material-icons-outlined" style={{ fontSize: '1rem' }}>schedule</span>
                Lunes a Viernes: 08:00 - 17:00 hrs
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="mb-1">
            © 2026 Municipalidad de Santo Domingo — Todos los derechos reservados
          </p>
          <p style={{ margin: 0, fontSize: '0.75rem' }}>
            Desarrollado con el Framework Kit de Gobierno Digital de Chile
          </p>
        </div>
      </div>
    </footer>
  );
};

export default GobFooter;
