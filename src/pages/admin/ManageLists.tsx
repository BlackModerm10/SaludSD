import React, { useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import GobNavbar from '../../components/GobNavbar';
import GobFooter from '../../components/GobFooter';
import { mockWaitList, ESPECIALIDADES } from '../../services/mockData';

const ManageLists: React.FC = () => {
  const [filterEsp, setFilterEsp] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = mockWaitList.filter(w => {
    if (filterEsp && w.especialidad !== filterEsp) return false;
    if (filterEstado && w.estado !== filterEstado) return false;
    if (searchTerm && !w.pacienteNombre.toLowerCase().includes(searchTerm.toLowerCase())
      && !w.pacienteRut.includes(searchTerm)) return false;
    return true;
  });

  return (
    <IonPage>
      <IonContent>
        <GobNavbar />
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: 1100 }}>
          <div className="section-header">
            <h2>
              <span className="material-icons-outlined" style={{ fontSize: '1.3rem', verticalAlign: 'middle', marginRight: 6 }}>
                list_alt
              </span>
              Gestión de Listas de Espera
            </h2>
            <button className="btn btn-primary btn-sm" style={{ borderRadius: '20px', padding: '6px 18px' }}>
              <span className="material-icons-outlined" style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: 4 }}>
                add
              </span>
              Agregar Paciente
            </button>
          </div>

          {/* Filters */}
          <div style={{
            background: '#fff', borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem', boxShadow: 'var(--shadow-sm)', marginBottom: '1.5rem'
          }}>
            <div className="row align-items-end">
              <div className="col-md-4 mb-2">
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--gob-tertiary)' }}>
                  Buscar paciente
                </label>
                <input type="text" className="form-control form-control-sm"
                  placeholder="Nombre o RUT..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <div className="col-md-3 mb-2">
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--gob-tertiary)' }}>
                  Especialidad
                </label>
                <select className="form-control form-control-sm" value={filterEsp}
                  onChange={e => setFilterEsp(e.target.value)}>
                  <option value="">Todas</option>
                  {ESPECIALIDADES.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="col-md-3 mb-2">
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--gob-tertiary)' }}>
                  Estado
                </label>
                <select className="form-control form-control-sm" value={filterEstado}
                  onChange={e => setFilterEstado(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="en_espera">En espera</option>
                  <option value="programada">Programada</option>
                  <option value="atendida">Atendida</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
              <div className="col-md-2 mb-2">
                <button className="btn btn-outline-secondary btn-sm btn-block"
                  onClick={() => { setFilterEsp(''); setFilterEstado(''); setSearchTerm(''); }}>
                  Limpiar
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.75rem' }}>
            Mostrando <strong>{filtered.length}</strong> de {mockWaitList.length} registros
          </p>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Paciente</th>
                  <th>RUT</th>
                  <th>Especialidad</th>
                  <th>Centro</th>
                  <th>Fecha solicitud</th>
                  <th>Posición</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry, idx) => (
                  <tr key={entry.id}>
                    <td style={{ fontWeight: 500 }}>{idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--gob-tertiary)' }}>{entry.pacienteNombre}</div>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{entry.pacienteRut}</td>
                    <td>{entry.especialidad}</td>
                    <td style={{ fontSize: '0.82rem' }}>{entry.centroSalud}</td>
                    <td style={{ fontSize: '0.82rem' }}>
                      {new Date(entry.fechaSolicitud).toLocaleDateString('es-CL')}
                    </td>
                    <td>
                      <strong style={{ color: 'var(--gob-primary)' }}>{entry.posicion}</strong>
                      <span style={{ color: '#888', fontSize: '0.78rem' }}>/{entry.totalEnLista}</span>
                    </td>
                    <td>
                      <span className={`tag-prioridad ${entry.prioridad}`}>{entry.prioridad}</span>
                    </td>
                    <td>
                      <span className={`tag-estado ${entry.estado}`}>
                        {entry.estado === 'en_espera' ? 'En espera' :
                          entry.estado === 'programada' ? 'Programada' : entry.estado}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn edit" title="Editar">
                        <span className="material-icons-outlined" style={{ fontSize: '1rem' }}>edit</span>
                      </button>
                      <button className="action-btn delete" title="Eliminar">
                        <span className="material-icons-outlined" style={{ fontSize: '1rem' }}>delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#888' }}>
              <span className="material-icons-outlined" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem', opacity: 0.4 }}>
                search_off
              </span>
              No se encontraron resultados con los filtros aplicados.
            </div>
          )}
        </div>
        <GobFooter />
      </IonContent>
    </IonPage>
  );
};

export default ManageLists;
