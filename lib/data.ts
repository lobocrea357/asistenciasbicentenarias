export interface Brother {
  id: string;
  name: string;
  grade: 'Aprendiz' | 'Compañero' | 'Maestro';
  position: string;
  totalAttendances: number;
  gradeAttendances: number;
  totalSessions: number;
  gradeSessions: number;
}

export interface Tenida {
  id: string;
  theme: string;
  date: string;
  location: string;
  type: 'Conjunta' | 'Ordinaria' | 'Extraordinaria';
  grade: 'Aprendiz' | 'Compañero' | 'Maestro';
  createdAt: string;
}

export const mockBrothers: Brother[] = [
  {
    id: '1',
    name: 'H∴ Juan Carlos Mendoza',
    grade: 'Maestro',
    position: 'Venerable Maestro',
    totalAttendances: 45,
    gradeAttendances: 32,
    totalSessions: 48,
    gradeSessions: 36
  },
  {
    id: '2',
    name: 'H∴ Miguel Ángel Rodríguez',
    grade: 'Maestro',
    position: 'Primer Vigilante',
    totalAttendances: 42,
    gradeAttendances: 38,
    totalSessions: 48,
    gradeSessions: 42
  },
  {
    id: '3',
    name: 'H∴ Carlos Eduardo Silva',
    grade: 'Maestro',
    position: 'Segundo Vigilante',
    totalAttendances: 40,
    gradeAttendances: 35,
    totalSessions: 48,
    gradeSessions: 40
  },
  {
    id: '4',
    name: 'H∴ Roberto Antonio López',
    grade: 'Maestro',
    position: 'Orador',
    totalAttendances: 38,
    gradeAttendances: 30,
    totalSessions: 48,
    gradeSessions: 36
  },
  {
    id: '5',
    name: 'H∴ Fernando José García',
    grade: 'Compañero',
    position: 'Secretario',
    totalAttendances: 35,
    gradeAttendances: 28,
    totalSessions: 40,
    gradeSessions: 32
  },
  {
    id: '6',
    name: 'H∴ Andrés Felipe Martínez',
    grade: 'Compañero',
    position: 'Tesorero',
    totalAttendances: 33,
    gradeAttendances: 25,
    totalSessions: 40,
    gradeSessions: 30
  },
  {
    id: '7',
    name: 'H∴ Diego Alejandro Herrera',
    grade: 'Compañero',
    position: 'Hospitalario',
    totalAttendances: 30,
    gradeAttendances: 22,
    totalSessions: 40,
    gradeSessions: 28
  },
  {
    id: '8',
    name: 'H∴ Luis Fernando Castillo',
    grade: 'Aprendiz',
    position: 'Guarda Templo Exterior',
    totalAttendances: 25,
    gradeAttendances: 20,
    totalSessions: 30,
    gradeSessions: 24
  },
  {
    id: '9',
    name: 'H∴ Sebastián Morales',
    grade: 'Aprendiz',
    position: 'Guarda Templo Interior',
    totalAttendances: 22,
    gradeAttendances: 18,
    totalSessions: 30,
    gradeSessions: 22
  },
  {
    id: '10',
    name: 'H∴ Alejandro Vargas',
    grade: 'Aprendiz',
    position: 'Primer Experto',
    totalAttendances: 20,
    gradeAttendances: 15,
    totalSessions: 30,
    gradeSessions: 20
  }
];

export const mockTenidas: Tenida[] = [
  {
    id: '1',
    theme: 'La Importancia de la Fraternidad en la Masonería Moderna',
    date: '2024-01-15',
    location: 'Templo Principal - Caracas',
    type: 'Ordinaria',
    grade: 'Maestro',
    createdAt: '2024-01-10'
  },
  {
    id: '2',
    theme: 'Los Símbolos Masónicos y su Significado Profundo',
    date: '2024-01-22',
    location: 'Templo Principal - Caracas',
    type: 'Conjunta',
    grade: 'Aprendiz',
    createdAt: '2024-01-17'
  },
  {
    id: '3',
    theme: 'Ceremonia de Iniciación - Nuevos Hermanos',
    date: '2024-02-05',
    location: 'Templo Principal - Caracas',
    type: 'Extraordinaria',
    grade: 'Maestro',
    createdAt: '2024-01-30'
  },
  {
    id: '4',
    theme: 'La Geometría Sagrada en la Construcción del Templo',
    date: '2024-02-12',
    location: 'Templo Principal - Caracas',
    type: 'Ordinaria',
    grade: 'Compañero',
    createdAt: '2024-02-07'
  },
  {
    id: '5',
    theme: 'Reflexiones sobre la Moral y la Ética Masónica',
    date: '2024-02-19',
    location: 'Templo Principal - Caracas',
    type: 'Ordinaria',
    grade: 'Maestro',
    createdAt: '2024-02-14'
  }
];