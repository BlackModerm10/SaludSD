import React, { useState, useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import GobNavbar from '../../components/GobNavbar';
import GobFooter from '../../components/GobFooter';
import { ESPECIALIDADES } from '../../services/mockData';
import api from '../../services/api';

const ManageLists: React.FC = () => {
  const [waitList, setWaitList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterEsp, setFilterEsp] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Editing state
  const [editingEntry, setEditingEntry] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ estado: '', prioridad: '', posicion: 1 });
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchWaitList = () => {
    setLoading(true);
    api.get('/waitlist')
      .then(res => {
        setWaitList(res.data);
      })
      .catch(err => {
        console.error('Error al obtener listas de espera:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWaitList();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este paciente de la lista de espera?')) {
      try {
        await api.delete(`/waitlist/${id}`);
        // Refetch or update local state
        setWaitList(prev => prev.filter(w => w.id !== id));
      } catch (err) {
        console.error('Error al eliminar registro:', err);
        alert('No se pudo eliminar el registro.');
      }
    }
  };

  const handleEditClick = (entry: any) => {
    setEditingEntry(entry);
    setEditForm({
      estado: entry.estado,
      prioridad: entry.prioridad,
      posicion: entry.posicion
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;

    try {
      await api.put(`/waitlist/${editingEntry.id}`, {
        estado: editForm.estado,
        prioridad: editForm.prioridad,
        posicion: editForm.posicion
      });
      
      setShowEditModal(false);
      setEditingEntry(null);
      fetchWaitList(); // Refetch updated items
    } catch (err) {
      console.error('Error al actualizar registro:', err);
      alert('No se pudo guardar la actualización.');
    }
  };

  const filtered = waitList.filter(w => {
    if (filterEsp && w.especialidad !== filterEsp) return false;
    if (filterEstado && w.estado !== filterEstado) return false;
    if (searchTerm) {
      const matchName = w.pacienteNombre?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRut = w.pacienteRut?.includes(searchTerm);
      if (!matchName && !matchRut) return false;
    }
    return true;
  });

  return (
    <IonPage>
      <IonContent>
        <GobNavbar />
        
        {/* Simple Edit Modal */}
        {showEditModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
          }}>
            <div style={{
              background: '#fff', borderRadius: 'var(--radius-lg)', padding: '2rem',
              width: '100%', maxWidth: 440, boxShadow: 'var(--shadow-lg)'
            }}>
              <h3 style={{ fontFamily: "'Roboto Slab', serif", marginBottom: '1.5rem', color: 'var(--gob-tertiary)' }}>
                Actualizar Registro
              </h3>
              
              <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
                Paciente: <strong>{editingEntry?.pacienteNombre}</strong><br />
                Especialidad: <strong>{editingEntry?.especialidad}</strong>
              </p>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.82rem', display: 'block', marginBottom: 4 }}>Estado</label>
                <select className="form-control" value={editForm.estado}
                  onChange={e => setEditForm(prev => ({ ...prev, estado: e.target.value }))}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <option value="en_espera">En espera</option>
                  <option value="programada">Programada</option>
                  <option value="atendida">Atendida</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.82rem', display: 'block', marginBottom: 4 }}>Prioridad</label>
                <select className="form-control" value={editForm.prioridad}
                  onChange={e => setEditForm(prev => ({ ...prev, prioridad: e.target.value }))}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.82rem', display: 'block', marginBottom: 4 }}>Posición</label>
                <input type="number" className="form-control" value={editForm.posicion} min={1}
                  onChange={e => setEditForm(prev => ({ ...prev, posicion: parseInt(e.target.value) || 1 }))}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>

              <div className="d-flex justify-content-end" style={{ gap: '10px' }}>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowEditModal(false)}
                  style={{ borderRadius: '20px', padding: '6px 16px', background: '#fff', border: '1px solid #ccc', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleSaveEdit}
                  style={{ borderRadius: '20px', padding: '6px 16px', background: 'var(--gob-primary)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="container" style={{ padding: '2rem 1rem', maxWidth: 1100 }}>
          <div className="section-header">
            <h2>
              <span className="material-icons-outlined" style={{ fontSize: '1.3rem', verticalAlign: 'middle', marginRight: 6 }}>
                list_alt
              </span>
              Gestión de Listas de Espera
            </h2>
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
                  style={{ cursor: 'pointer' }}
                  onClick={() => { setFilterEsp(''); setFilterEstado(''); setSearchTerm(''); }}>
                  Limpiar
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.75rem' }}>
            Mostrando <strong>{filtered.length}</strong> de {waitList.length} registros
          </p>

          {/* Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                border: '3px solid #e0e0e0', borderTopColor: 'var(--gob-primary)',
                animation: 'spin 1s linear infinite', margin: '0 auto 1rem'
              }} />
              <p style={{ color: '#888' }}>Cargando registros...</p>
            </div>
          ) : (
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
                        <button className="action-btn edit" title="Editar" onClick={() => handleEditClick(entry)}
                          style={{ cursor: 'pointer', background: '#e3f0ff', color: 'var(--gob-primary)', border: 'none', borderRadius: '4px', width: 32, height: 32, marginRight: 4 }}>
                          <span className="material-icons-outlined" style={{ fontSize: '1rem' }}>edit</span>
                        </button>
                        <button className="action-btn delete" title="Eliminar" onClick={() => handleDelete(entry.id)}
                          style={{ cursor: 'pointer', background: '#f8d7da', color: '#dc3545', border: 'none', borderRadius: '4px', width: 32, height: 32 }}>
                          <span className="material-icons-outlined" style={{ fontSize: '1rem' }}>delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#888' }}>
              <span className="material-icons-outlined" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem', opacity: 0.4 }}>
                search_off
              </span>
              No se encontraron resultados con los filtros aplicados.
            </div>
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

export default ManageLists;
