import React, { useState, useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import GobNavbar from '../../components/GobNavbar';
import GobFooter from '../../components/GobFooter';
import { ESPECIALIDADES } from '../../services/mockData';
import api from '../../services/api';

const RequestAppointment: React.FC = () => {
  const history = useHistory();
  const [step, setStep] = useState(1);
  const [healthCenters, setHealthCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    especialidad: '', centro: '', motivo: '', prioridad: 'normal', fecha: '', horario: '',
  });

  useEffect(() => {
    api.get('/health-centers')
      .then(res => {
        setHealthCenters(res.data);
      })
      .catch(err => {
        console.error('Error al obtener centros de salud:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const centrosDisponibles = form.especialidad
    ? healthCenters.filter(c => c.especialidades.includes(form.especialidad))
    : [];

  const handleSubmit = async () => {
    try {
      await api.post('/waitlist', {
        especialidad: form.especialidad,
        centroId: form.centro,
        prioridad: form.prioridad,
        motivo: form.motivo
      });
      setStep(4); // Show confirmation screen on success
    } catch (err) {
      console.error('Error al enviar solicitud de cita:', err);
      alert('Error de red: No se pudo ingresar la solicitud. Intente nuevamente.');
    }
  };

  return (
    <IonPage>
      <IonContent>
        <GobNavbar />
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: 700 }}>
          <div className="section-header">
            <h2>
              <span className="material-icons-outlined" style={{ fontSize: '1.3rem', verticalAlign: 'middle', marginRight: 6 }}>
                add_circle
              </span>
              Solicitar Cita Médica
            </h2>
          </div>

          {/* Step Indicators */}
          <div className="step-indicator mb-4">
            {[1, 2, 3].map((s, i) => (
              <div className="step" key={s}>
                <div className={`step-circle ${step >= s ? (step > s ? 'completed' : 'active') : ''}`}>
                  {step > s ? '✓' : s}
                </div>
                {i < 2 && <div className={`step-line ${step > s ? 'completed' : ''}`} />}
              </div>
            ))}
          </div>

          <div style={{
            background: '#fff',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            boxShadow: 'var(--shadow-md)'
          }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: '3px solid #e0e0e0', borderTopColor: 'var(--gob-primary)',
                  animation: 'spin 1s linear infinite', margin: '0 auto 1rem'
                }} />
                <p style={{ color: '#888' }}>Cargando centros de salud...</p>
              </div>
            ) : (
              <>
                {/* Step 1: Especialidad */}
                {step === 1 && (
                  <div className="animate-in">
                    <h3 style={{ fontFamily: "'Roboto Slab', serif", fontSize: '1.1rem', color: 'var(--gob-tertiary)', marginBottom: '1.5rem' }}>
                      Paso 1: Selecciona la especialidad
                    </h3>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label htmlFor="especialidad" style={{ fontWeight: 600, fontSize: '0.88rem' }}>Especialidad médica *</label>
                      <select className="form-control" id="especialidad" value={form.especialidad}
                        onChange={e => { handleChange('especialidad', e.target.value); handleChange('centro', ''); }}
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        <option value="">Seleccione una especialidad...</option>
                        {ESPECIALIDADES.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label htmlFor="motivo" style={{ fontWeight: 600, fontSize: '0.88rem' }}>Motivo de la consulta</label>
                      <textarea className="form-control" id="motivo" rows={3}
                        placeholder="Describa brevemente el motivo de su consulta..."
                        value={form.motivo}
                        onChange={e => handleChange('motivo', e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label style={{ fontWeight: 600, fontSize: '0.88rem' }}>Prioridad</label>
                      <div className="d-flex" style={{ gap: '12px', marginTop: '4px' }}>
                        {['normal', 'alta', 'urgente'].map(p => (
                          <label key={p} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            cursor: 'pointer', fontSize: '0.9rem'
                          }}>
                            <input type="radio" name="prioridad" value={p}
                              checked={form.prioridad === p}
                              onChange={e => handleChange('prioridad', e.target.value)} />
                            <span className={`tag-prioridad ${p}`}>{p}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="d-flex justify-content-end">
                      <button className="btn btn-primary" disabled={!form.especialidad}
                        style={{ borderRadius: '20px', padding: '8px 24px', background: 'var(--gob-primary)', border: 'none', color: '#fff', cursor: 'pointer' }}
                        onClick={() => setStep(2)}>
                        Siguiente →
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Centro de salud */}
                {step === 2 && (
                  <div className="animate-in">
                    <h3 style={{ fontFamily: "'Roboto Slab', serif", fontSize: '1.1rem', color: 'var(--gob-tertiary)', marginBottom: '1.5rem' }}>
                      Paso 2: Selecciona el centro de salud
                    </h3>
                    {centrosDisponibles.length === 0 ? (
                      <p style={{ color: '#888', marginBottom: '1.5rem' }}>No hay centros disponibles en la comuna que atiendan la especialidad de {form.especialidad}.</p>
                    ) : (
                      <div style={{ marginBottom: '1.5rem' }}>
                        {centrosDisponibles.map(centro => (
                          <div key={centro.id}
                            className="center-card"
                            onClick={() => handleChange('centro', centro.id)}
                            style={{
                              cursor: 'pointer',
                              padding: '1rem',
                              borderRadius: 'var(--radius-md)',
                              marginBottom: '0.75rem',
                              background: '#fff',
                              boxShadow: 'var(--shadow-sm)',
                              border: form.centro === centro.id ? '2px solid var(--gob-primary)' : '2px solid #eee',
                            }}>
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <div className="d-flex align-items-center" style={{ gap: '8px', marginBottom: '6px' }}>
                                  <strong style={{ color: 'var(--gob-tertiary)' }}>{centro.nombre}</strong>
                                  <span className={`center-type ${centro.tipo}`} style={{
                                    fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px',
                                    background: '#e3f0ff', color: 'var(--gob-primary)'
                                  }}>{centro.tipo}</span>
                                </div>
                                <div style={{ fontSize: '0.82rem', color: '#888' }}>
                                  <span className="material-icons-outlined" style={{ fontSize: '0.9rem', verticalAlign: 'middle', marginRight: 4 }}>
                                    location_on
                                  </span>
                                  {centro.direccion}
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gob-primary)' }}>
                                  ~{centro.tiempoEsperaPromedio}d
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#888' }}>espera promedio</div>
                              </div>
                            </div>
                            <div style={{ marginTop: '8px' }}>
                              <div className="d-flex justify-content-between" style={{ fontSize: '0.75rem', color: '#888', marginBottom: 4 }}>
                                <span>Ocupación actual</span>
                                <span>{centro.ocupacionActual}%</span>
                              </div>
                              <div className="progress-custom">
                                <div className={`progress-fill ${centro.ocupacionActual > 85 ? 'high' : centro.ocupacionActual > 70 ? 'medium' : ''}`}
                                  style={{ width: `${centro.ocupacionActual}%` }} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="d-flex justify-content-between">
                      <button className="btn btn-outline-secondary" style={{ borderRadius: '20px', padding: '8px 24px', background: '#fff', border: '1px solid #ccc', cursor: 'pointer' }}
                        onClick={() => setStep(1)}>
                        ← Anterior
                      </button>
                      <button className="btn btn-primary" disabled={!form.centro}
                        style={{ borderRadius: '20px', padding: '8px 24px', background: 'var(--gob-primary)', border: 'none', color: '#fff', cursor: 'pointer' }}
                        onClick={() => setStep(3)}>
                        Siguiente →
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Preferencia */}
                {step === 3 && (
                  <div className="animate-in">
                    <h3 style={{ fontFamily: "'Roboto Slab', serif", fontSize: '1.1rem', color: 'var(--gob-tertiary)', marginBottom: '1.5rem' }}>
                      Paso 3: Preferencia de horario
                    </h3>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label htmlFor="horarioPref" style={{ fontWeight: 600, fontSize: '0.88rem' }}>Preferencia de horario</label>
                      <select className="form-control" id="horarioPref" value={form.horario}
                        onChange={e => handleChange('horario', e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        <option value="">Sin preferencia</option>
                        <option value="manana">Mañana (08:00 - 12:00)</option>
                        <option value="tarde">Tarde (14:00 - 18:00)</option>
                      </select>
                    </div>

                    {/* Summary */}
                    <div style={{
                      background: '#f5f7fa', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginTop: '1rem', marginBottom: '1.5rem'
                    }}>
                      <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--gob-tertiary)', fontWeight: 600 }}>Resumen de solicitud</h4>
                      <div className="row" style={{ fontSize: '0.88rem' }}>
                        <div className="col-6 mb-2"><strong>Especialidad:</strong></div>
                        <div className="col-6 mb-2">{form.especialidad}</div>
                        <div className="col-6 mb-2"><strong>Centro:</strong></div>
                        <div className="col-6 mb-2">{healthCenters.find(c => c.id === form.centro)?.nombre}</div>
                        <div className="col-6 mb-2"><strong>Prioridad:</strong></div>
                        <div className="col-6 mb-2"><span className={`tag-prioridad ${form.prioridad}`}>{form.prioridad}</span></div>
                        <div className="col-6"><strong>Horario:</strong></div>
                        <div className="col-6">{form.horario === 'manana' ? 'Mañana' : form.horario === 'tarde' ? 'Tarde' : 'Sin preferencia'}</div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between">
                      <button className="btn btn-outline-secondary" style={{ borderRadius: '20px', padding: '8px 24px', background: '#fff', border: '1px solid #ccc', cursor: 'pointer' }}
                        onClick={() => setStep(2)}>
                        ← Anterior
                      </button>
                      <button className="btn btn-primary"
                        style={{ borderRadius: '20px', padding: '8px 24px', background: 'var(--gob-primary)', border: 'none', color: '#fff', cursor: 'pointer' }}
                        onClick={handleSubmit}>
                        Confirmar Solicitud
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Confirmation */}
                {step === 4 && (
                  <div className="animate-in text-center" style={{ padding: '2rem 0' }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #28a745, #48c768)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 1.5rem'
                    }}>
                      <span className="material-icons-outlined" style={{ fontSize: '2rem', color: '#fff' }}>check</span>
                    </div>
                    <h3 style={{ fontFamily: "'Roboto Slab', serif", color: 'var(--gob-tertiary)', marginBottom: '0.75rem' }}>
                      ¡Solicitud enviada!
                    </h3>
                    <p style={{ color: '#888', maxWidth: 400, margin: '0 auto 2rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      Tu solicitud de cita para <strong>{form.especialidad}</strong> ha sido registrada exitosamente en nuestra base de datos.
                      Recibirás una notificación cuando se programe tu atención.
                    </p>
                    <div className="d-flex justify-content-center" style={{ gap: '12px' }}>
                      <button className="btn btn-primary"
                        style={{ borderRadius: '20px', padding: '8px 24px', background: 'var(--gob-primary)', border: 'none', color: '#fff', cursor: 'pointer' }}
                        onClick={() => history.push('/paciente/lista-espera')}>
                        Ver mi lista
                      </button>
                      <button className="btn btn-outline-secondary"
                        style={{ borderRadius: '20px', padding: '8px 24px', background: '#fff', border: '1px solid #ccc', cursor: 'pointer' }}
                        onClick={() => history.push('/paciente/dashboard')}>
                        Ir al Dashboard
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <GobFooter />
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </IonContent>
    </IonPage>
  );
};

export default RequestAppointment;
