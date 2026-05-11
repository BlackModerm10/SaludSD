import React, { useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import GobNavbar from '../components/GobNavbar';
import { useAuth } from '../services/AuthContext';
import { REGIONES, COMUNAS_VALPARAISO, formatRut, validateRut } from '../services/mockData';

const Register: React.FC = () => {
  const history = useHistory();
  const { loginAsPatient } = useAuth();

  const [form, setForm] = useState({
    nombre: '', rut: '', email: '', region: '',
    comuna: '', password: '', confirmPassword: '', terms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRut(e.target.value);
    handleChange('rut', formatted);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!form.rut.trim()) newErrors.rut = 'El RUT es obligatorio';
    else if (!validateRut(form.rut)) newErrors.rut = 'RUT inválido';
    if (!form.email.trim()) newErrors.email = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Correo inválido';
    if (!form.region) newErrors.region = 'Seleccione una región';
    if (!form.comuna) newErrors.comuna = 'Seleccione una comuna';
    if (!form.password) newErrors.password = 'La contraseña es obligatoria';
    else if (form.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    if (!form.terms) newErrors.terms = 'Debe aceptar los términos';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      loginAsPatient();
      history.push('/paciente/dashboard');
    }
  };

  const comunas = form.region === 'Valparaíso' ? COMUNAS_VALPARAISO :
    ['Seleccione su región primero'];

  return (
    <IonPage>
      <IonContent>
        <GobNavbar />
        <div className="auth-container" style={{ padding: '2rem 1rem' }}>
          <div className="auth-card" style={{ maxWidth: 520 }}>
            <div className="auth-logo">
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'linear-gradient(135deg, #006FB3, #004d7a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto'
              }}>
                <span className="material-icons-outlined" style={{ color: '#fff', fontSize: '1.6rem' }}>
                  person_add
                </span>
              </div>
              <h2>Crear Cuenta</h2>
              <p className="subtitle">Municipalidad de Santo Domingo</p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Nombre */}
              <div className="form-group">
                <label htmlFor="regNombre">Nombre completo *</label>
                <input type="text" className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                  id="regNombre" placeholder="Ej: María González Pérez"
                  value={form.nombre} onChange={e => handleChange('nombre', e.target.value)} />
                {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
              </div>

              {/* RUT */}
              <div className="form-group">
                <label htmlFor="regRut">RUT *</label>
                <input type="text" className={`form-control ${errors.rut ? 'is-invalid' : ''}`}
                  id="regRut" placeholder="Ej: 12.345.678-9"
                  value={form.rut} onChange={handleRutChange} maxLength={12} />
                {errors.rut && <div className="invalid-feedback">{errors.rut}</div>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="regEmail">Correo Electrónico *</label>
                <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  id="regEmail" placeholder="Ej: maria@email.com"
                  value={form.email} onChange={e => handleChange('email', e.target.value)} />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>

              {/* Región + Comuna */}
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="regRegion">Región *</label>
                    <select className={`form-control ${errors.region ? 'is-invalid' : ''}`}
                      id="regRegion" value={form.region}
                      onChange={e => { handleChange('region', e.target.value); handleChange('comuna', ''); }}>
                      <option value="">Seleccione...</option>
                      {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    {errors.region && <div className="invalid-feedback">{errors.region}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="regComuna">Comuna *</label>
                    <select className={`form-control ${errors.comuna ? 'is-invalid' : ''}`}
                      id="regComuna" value={form.comuna}
                      onChange={e => handleChange('comuna', e.target.value)}
                      disabled={!form.region}>
                      <option value="">Seleccione...</option>
                      {form.region === 'Valparaíso' && comunas.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.comuna && <div className="invalid-feedback">{errors.comuna}</div>}
                  </div>
                </div>
              </div>

              {/* Contraseña */}
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="regPassword">Contraseña *</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPassword ? 'text' : 'password'}
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        id="regPassword" placeholder="Mínimo 6 caracteres"
                        value={form.password}
                        onChange={e => handleChange('password', e.target.value)} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', cursor: 'pointer', padding: 4
                        }}>
                        <span className="material-icons-outlined" style={{ fontSize: '1.1rem', color: '#aaa' }}>
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                    {errors.password && <div className="invalid-feedback" style={{ display: 'block' }}>{errors.password}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="regConfirm">Confirmar Contraseña *</label>
                    <input type={showPassword ? 'text' : 'password'}
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      id="regConfirm" placeholder="Repita su contraseña"
                      value={form.confirmPassword}
                      onChange={e => handleChange('confirmPassword', e.target.value)} />
                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                  </div>
                </div>
              </div>

              {/* Términos */}
              <div className="form-group">
                <div className="custom-control custom-checkbox">
                  <input type="checkbox" className="custom-control-input" id="regTerms"
                    checked={form.terms}
                    onChange={e => handleChange('terms', e.target.checked)} />
                  <label className="custom-control-label" htmlFor="regTerms"
                    style={{ fontSize: '0.85rem', color: '#555' }}>
                    Acepto los <a href="#" style={{ color: 'var(--gob-primary)' }}>Términos y Condiciones</a> y
                    la <a href="#" style={{ color: 'var(--gob-primary)' }}>Política de Privacidad</a>
                  </label>
                </div>
                {errors.terms && <div className="invalid-feedback" style={{ display: 'block' }}>{errors.terms}</div>}
              </div>

              <button type="submit" className="btn-gob-primary mb-3">
                Crear Cuenta
              </button>
            </form>

            <p className="text-center mb-0" style={{ fontSize: '0.88rem', color: '#888' }}>
              ¿Ya tienes cuenta?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); history.push('/login'); }}
                style={{ color: 'var(--gob-primary)', fontWeight: 600 }}>
                Inicia sesión aquí
              </a>
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;
