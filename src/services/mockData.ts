/* ============================================
   SaludSD — Mock Data Service
   Simulates backend data for the prototype
   ============================================ */

export interface User {
  id: string;
  nombre: string;
  rut: string;
  email: string;
  region: string;
  comuna: string;
  role: 'paciente' | 'admin';
  avatar?: string;
}

export interface WaitListEntry {
  id: string;
  pacienteId: string;
  pacienteNombre: string;
  pacienteRut: string;
  especialidad: string;
  centroSalud: string;
  fechaSolicitud: string;
  posicion: number;
  totalEnLista: number;
  tiempoEstimadoDias: number;
  estado: 'en_espera' | 'programada' | 'atendida' | 'cancelada';
  prioridad: 'normal' | 'alta' | 'urgente';
}

export interface Appointment {
  id: string;
  pacienteId: string;
  especialidad: string;
  medico: string;
  centroSalud: string;
  fecha: string;
  hora: string;
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  notas?: string;
}

export interface HealthCenter {
  id: string;
  nombre: string;
  tipo: 'CESFAM' | 'Posta';
  direccion: string;
  telefono: string;
  especialidades: string[];
  tiempoEsperaPromedio: number; // días
  capacidadDiaria: number;
  ocupacionActual: number; // porcentaje
}

export interface Notification {
  id: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  tipo: 'info' | 'alerta' | 'exito' | 'recordatorio';
}

export interface StatsData {
  totalPacientesEspera: number;
  tiempoPromedioEspera: number;
  citasHoy: number;
  citasSemana: number;
  especialidadMasDemandada: string;
  centroMasSaturado: string;
  tendencia: 'subiendo' | 'bajando' | 'estable';
  porEspecialidad: { nombre: string; cantidad: number; promedioDias: number }[];
  porCentro: { nombre: string; ocupacion: number; enEspera: number }[];
}

// ────────────────────────────────────────────
// DATOS MOCK
// ────────────────────────────────────────────

export const REGIONES = [
  "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama",
  "Coquimbo", "Valparaíso", "Metropolitana", "O'Higgins",
  "Maule", "Ñuble", "Biobío", "Araucanía",
  "Los Ríos", "Los Lagos", "Aysén", "Magallanes"
];

export const COMUNAS_VALPARAISO = [
  "Santo Domingo", "San Antonio", "Cartagena", "El Tabo",
  "El Quisco", "Algarrobo", "Casablanca", "Valparaíso",
  "Viña del Mar", "Quilpué", "Villa Alemana"
];

export const ESPECIALIDADES = [
  "Medicina General", "Pediatría", "Ginecología", "Cardiología",
  "Traumatología", "Dermatología", "Oftalmología", "Neurología",
  "Psiquiatría", "Kinesiología", "Nutrición", "Odontología"
];

export const mockCurrentUser: User = {
  id: 'u1',
  nombre: 'María González Pérez',
  rut: '12.345.678-5',
  email: 'maria.gonzalez@email.com',
  region: 'Valparaíso',
  comuna: 'Santo Domingo',
  role: 'paciente'
};

export const mockAdminUser: User = {
  id: 'a1',
  nombre: 'Dr. Carlos Muñoz',
  rut: '9.876.543-3',
  email: 'carlos.munoz@saludsd.cl',
  region: 'Valparaíso',
  comuna: 'Santo Domingo',
  role: 'admin'
};

export const mockWaitList: WaitListEntry[] = [
  {
    id: 'wl1', pacienteId: 'u1', pacienteNombre: 'María González Pérez',
    pacienteRut: '12.345.678-5', especialidad: 'Cardiología',
    centroSalud: 'CESFAM Santo Domingo', fechaSolicitud: '2026-02-15',
    posicion: 12, totalEnLista: 89, tiempoEstimadoDias: 45,
    estado: 'en_espera', prioridad: 'normal'
  },
  {
    id: 'wl2', pacienteId: 'u1', pacienteNombre: 'María González Pérez',
    pacienteRut: '12.345.678-5', especialidad: 'Oftalmología',
    centroSalud: 'Posta Rural El Convento', fechaSolicitud: '2026-03-01',
    posicion: 34, totalEnLista: 120, tiempoEstimadoDias: 78,
    estado: 'en_espera', prioridad: 'normal'
  },
  {
    id: 'wl3', pacienteId: 'u2', pacienteNombre: 'Juan Martínez López',
    pacienteRut: '15.678.234-3', especialidad: 'Traumatología',
    centroSalud: 'CESFAM Santo Domingo', fechaSolicitud: '2026-01-20',
    posicion: 5, totalEnLista: 67, tiempoEstimadoDias: 15,
    estado: 'en_espera', prioridad: 'alta'
  },
  {
    id: 'wl4', pacienteId: 'u3', pacienteNombre: 'Ana Rojas Vera',
    pacienteRut: '18.234.567-9', especialidad: 'Dermatología',
    centroSalud: 'Posta Rural Bucalemu', fechaSolicitud: '2026-03-10',
    posicion: 22, totalEnLista: 45, tiempoEstimadoDias: 60,
    estado: 'en_espera', prioridad: 'normal'
  },
  {
    id: 'wl5', pacienteId: 'u4', pacienteNombre: 'Pedro Soto Díaz',
    pacienteRut: '11.222.333-9', especialidad: 'Medicina General',
    centroSalud: 'CESFAM Santo Domingo', fechaSolicitud: '2026-04-01',
    posicion: 3, totalEnLista: 25, tiempoEstimadoDias: 7,
    estado: 'en_espera', prioridad: 'urgente'
  },
  {
    id: 'wl6', pacienteId: 'u5', pacienteNombre: 'Lucía Fernández',
    pacienteRut: '14.555.666-K', especialidad: 'Ginecología',
    centroSalud: 'CESFAM Santo Domingo', fechaSolicitud: '2026-02-28',
    posicion: 18, totalEnLista: 55, tiempoEstimadoDias: 35,
    estado: 'en_espera', prioridad: 'alta'
  },
  {
    id: 'wl7', pacienteId: 'u6', pacienteNombre: 'Roberto Morales',
    pacienteRut: '10.111.222-5', especialidad: 'Cardiología',
    centroSalud: 'Posta Rural San Enrique', fechaSolicitud: '2026-01-10',
    posicion: 8, totalEnLista: 89, tiempoEstimadoDias: 25,
    estado: 'programada', prioridad: 'alta'
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: 'a1', pacienteId: 'u1', especialidad: 'Medicina General',
    medico: 'Dra. Patricia Herrera', centroSalud: 'CESFAM Santo Domingo',
    fecha: '2026-04-28', hora: '09:30', estado: 'confirmada'
  },
  {
    id: 'a2', pacienteId: 'u1', especialidad: 'Kinesiología',
    medico: 'Kin. Roberto Araya', centroSalud: 'CESFAM Santo Domingo',
    fecha: '2026-03-15', hora: '11:00', estado: 'completada',
    notas: 'Control de rehabilitación lumbar. Evolución favorable.'
  },
  {
    id: 'a3', pacienteId: 'u1', especialidad: 'Medicina General',
    medico: 'Dr. Felipe Cortés', centroSalud: 'Posta Rural El Convento',
    fecha: '2026-02-10', hora: '10:00', estado: 'completada',
    notas: 'Control preventivo anual. Exámenes de sangre solicitados.'
  },
  {
    id: 'a4', pacienteId: 'u1', especialidad: 'Nutrición',
    medico: 'Nut. Claudia Reyes', centroSalud: 'CESFAM Santo Domingo',
    fecha: '2026-01-22', hora: '14:30', estado: 'completada',
    notas: 'Plan alimentario personalizado entregado.'
  }
];

export const mockHealthCenters: HealthCenter[] = [
  {
    id: 'hc1', nombre: 'CESFAM Santo Domingo', tipo: 'CESFAM',
    direccion: 'Las Hortensias #146, Santo Domingo',
    telefono: '+56 35 220 4500',
    especialidades: ['Medicina General', 'Pediatría', 'Ginecología', 'Kinesiología', 'Nutrición', 'Odontología'],
    tiempoEsperaPromedio: 32, capacidadDiaria: 120, ocupacionActual: 87
  },
  {
    id: 'hc2', nombre: 'Posta Rural El Convento', tipo: 'Posta',
    direccion: 'Sector El Convento s/n, Santo Domingo',
    telefono: '+56 9 6669 3380',
    especialidades: ['Medicina General', 'Pediatría', 'Odontología', 'Kinesiología'],
    tiempoEsperaPromedio: 28, capacidadDiaria: 80, ocupacionActual: 72
  },
  {
    id: 'hc3', nombre: 'Posta Rural Bucalemu', tipo: 'Posta',
    direccion: 'Sector Bucalemu s/n, Santo Domingo',
    telefono: '+56 9 4131 2782',
    especialidades: ['Urgencia', 'Medicina General', 'Traumatología'],
    tiempoEsperaPromedio: 2, capacidadDiaria: 60, ocupacionActual: 93
  },
  {
    id: 'hc4', nombre: 'Posta Rural San Enrique', tipo: 'Posta',
    direccion: 'Sector San Enrique s/n, Santo Domingo',
    telefono: '+56 9 6669 3386',
    especialidades: ['Cardiología', 'Traumatología', 'Neurología', 'Oftalmología', 'Dermatología', 'Psiquiatría'],
    tiempoEsperaPromedio: 65, capacidadDiaria: 200, ocupacionActual: 95
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'n1', titulo: 'Cita confirmada',
    mensaje: 'Su cita de Medicina General con Dra. Patricia Herrera ha sido confirmada para el 28 de abril a las 09:30.',
    fecha: '2026-04-22', leida: false, tipo: 'exito'
  },
  {
    id: 'n2', titulo: 'Avance en lista de espera',
    mensaje: 'Su posición en la lista de Cardiología ha avanzado. Ahora está en el lugar #12 de 89.',
    fecha: '2026-04-20', leida: false, tipo: 'info'
  },
  {
    id: 'n3', titulo: 'Recordatorio',
    mensaje: 'Recuerde asistir a su control de Medicina General el 28 de abril. Presente su carnet y documentos.',
    fecha: '2026-04-24', leida: false, tipo: 'recordatorio'
  },
  {
    id: 'n4', titulo: 'Nuevo horario CESFAM',
    mensaje: 'CESFAM Santo Domingo amplía su horario de atención: Lunes a Viernes de 08:00 a 20:00 hrs.',
    fecha: '2026-04-18', leida: true, tipo: 'info'
  },
  {
    id: 'n5', titulo: 'Campaña de vacunación',
    mensaje: 'Campaña de vacunación contra la influenza disponible en todos los CESFAM de la comuna.',
    fecha: '2026-04-15', leida: true, tipo: 'info'
  }
];

export const mockStats: StatsData = {
  totalPacientesEspera: 847,
  tiempoPromedioEspera: 42,
  citasHoy: 45,
  citasSemana: 312,
  especialidadMasDemandada: 'Medicina General',
  centroMasSaturado: 'Posta Rural San Enrique',
  tendencia: 'bajando',
  porEspecialidad: [
    { nombre: 'Medicina General', cantidad: 156, promedioDias: 15 },
    { nombre: 'Cardiología', cantidad: 89, promedioDias: 65 },
    { nombre: 'Oftalmología', cantidad: 120, promedioDias: 78 },
    { nombre: 'Traumatología', cantidad: 67, promedioDias: 45 },
    { nombre: 'Dermatología', cantidad: 45, promedioDias: 55 },
    { nombre: 'Ginecología', cantidad: 55, promedioDias: 35 },
    { nombre: 'Pediatría', cantidad: 98, promedioDias: 12 },
    { nombre: 'Neurología', cantidad: 42, promedioDias: 90 },
    { nombre: 'Odontología', cantidad: 110, promedioDias: 20 },
    { nombre: 'Kinesiología', cantidad: 65, promedioDias: 18 },
  ],
  porCentro: [
    { nombre: 'CESFAM Santo Domingo', ocupacion: 87, enEspera: 320 },
    { nombre: 'Posta Rural El Convento', ocupacion: 72, enEspera: 185 },
    { nombre: 'Posta Rural Bucalemu', ocupacion: 93, enEspera: 42 },
    { nombre: 'Posta Rural San Enrique', ocupacion: 95, enEspera: 300 },
  ]
};

// ────────────────────────────────────────────
// Utilities
// ────────────────────────────────────────────

export function validateRut(rut: string): boolean {
  const cleaned = rut.replace(/[^0-9kK]/g, '');
  if (cleaned.length < 2) return false;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1).toUpperCase();
  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const expectedDv = 11 - (sum % 11);
  const dvChar = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : String(expectedDv);
  return dv === dvChar;
}

export function formatRut(value: string): string {
  const cleaned = value.replace(/[^0-9kK]/g, '');
  if (cleaned.length <= 1) return cleaned;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted}-${dv}`;
}
