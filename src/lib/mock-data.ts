import type { TurnoConReservas, Profile, DiaSemana, Pago } from "@/types";

export const mockAlumnos: Profile[] = [
  { id: "a1", email: "martina@mail.com", nombre: "Martina Suárez", role: "alumno", plan: "Full", estado: "activo", telefono: "291 400-1122", created_at: "2025-01-15" },
  { id: "a2", email: "bruno@mail.com", nombre: "Bruno Ferreyra", role: "alumno", plan: "3x semana", estado: "activo", telefono: "291 400-1133", created_at: "2025-02-10" },
  { id: "a3", email: "camila@mail.com", nombre: "Camila Ortiz", role: "alumno", plan: "Full", estado: "activo", telefono: "291 400-1144", created_at: "2025-01-20" },
  { id: "a4", email: "tomas@mail.com", nombre: "Tomás Ledesma", role: "alumno", plan: "2x semana", estado: "activo", telefono: "291 400-1155", created_at: "2025-03-05" },
  { id: "a5", email: "julieta@mail.com", nombre: "Julieta Paz", role: "alumno", plan: "Full", estado: "vencido", telefono: "291 400-1166", created_at: "2024-06-01" },
  { id: "a6", email: "ramiro@mail.com", nombre: "Ramiro Godoy", role: "alumno", plan: "3x semana", estado: "activo", telefono: "291 400-1177", created_at: "2025-02-28" },
  { id: "a7", email: "sofia@mail.com", nombre: "Sofía Aguirre", role: "alumno", plan: "Full", estado: "activo", telefono: "291 400-1188", created_at: "2025-01-10" },
  { id: "a8", email: "lucas@mail.com", nombre: "Lucas Benítez", role: "alumno", plan: "2x semana", estado: "activo", telefono: "291 400-1199", created_at: "2025-04-12" },
  { id: "a9", email: "agustina@mail.com", nombre: "Agustina Roldán", role: "alumno", plan: "Full", estado: "vencido", telefono: "291 400-1200", created_at: "2024-05-20" },
  { id: "a10", email: "ezequiel@mail.com", nombre: "Ezequiel Ríos", role: "alumno", plan: "3x semana", estado: "activo", telefono: "291 400-1211", created_at: "2025-03-15" },
  { id: "a11", email: "valentina@mail.com", nombre: "Valentina Cano", role: "alumno", plan: "Full", estado: "activo", telefono: "291 400-1222", created_at: "2025-02-01" },
  { id: "a12", email: "franco@mail.com", nombre: "Franco Molina", role: "alumno", plan: "2x semana", estado: "activo", telefono: "291 400-1233", created_at: "2025-04-20" },
  { id: "a13", email: "delfina@mail.com", nombre: "Delfina Acosta", role: "alumno", plan: "Full", estado: "activo", telefono: "291 400-1244", created_at: "2025-01-25" },
  { id: "a14", email: "ian@mail.com", nombre: "Ian Domínguez", role: "alumno", plan: "3x semana", estado: "activo", telefono: "291 400-1255", created_at: "2025-03-10" },
];

export const mockTurnos: Record<DiaSemana, TurnoConReservas[]> = {
  Lun: [
    { id: "t1", dia: "Lun", hora: "07:00", actividad: "Funcional", coach: "Nacho", cupo: 12, activo: true, created_at: "", inscritos: ["a1","a2","a3","a4","a5","a6","a7","a8","a9","a10"], ocupados: 10, fijos: ["a1","a3","a7"] },
    { id: "t2", dia: "Lun", hora: "09:00", actividad: "Pesas Libres", coach: "Vale", cupo: 8, activo: true, created_at: "", inscritos: ["a2","a5"], ocupados: 2, fijos: ["a2"] },
    { id: "t3", dia: "Lun", hora: "18:30", actividad: "CrossTraining", coach: "Nacho", cupo: 14, activo: true, created_at: "", inscritos: ["a1","a3","a4","a6","a7","a8","a9","a10","a11","a12","a13","a14"], ocupados: 12, fijos: ["a1","a6","a11"] },
    { id: "t4", dia: "Lun", hora: "20:00", actividad: "Movilidad", coach: "Vale", cupo: 10, activo: true, created_at: "", inscritos: ["a2","a3"], ocupados: 2, fijos: [] },
  ],
  Mar: [
    { id: "t5", dia: "Mar", hora: "08:00", actividad: "Funcional", coach: "Nacho", cupo: 12, activo: true, created_at: "", inscritos: ["a1","a2","a3","a4","a5","a6"], ocupados: 6, fijos: ["a1","a2"] },
    { id: "t6", dia: "Mar", hora: "19:00", actividad: "Pesas Libres", coach: "Vale", cupo: 8, activo: true, created_at: "", inscritos: ["a5","a6","a7","a8","a9","a10","a11","a12"], ocupados: 8, fijos: ["a5","a10"] },
  ],
  Mié: [
    { id: "t7", dia: "Mié", hora: "07:00", actividad: "Funcional", coach: "Nacho", cupo: 12, activo: true, created_at: "", inscritos: ["a1","a2"], ocupados: 2, fijos: [] },
    { id: "t8", dia: "Mié", hora: "18:30", actividad: "CrossTraining", coach: "Nacho", cupo: 14, activo: true, created_at: "", inscritos: ["a3","a4","a5","a6","a7","a8"], ocupados: 6, fijos: ["a3","a7"] },
  ],
  Jue: [
    { id: "t9", dia: "Jue", hora: "09:00", actividad: "Movilidad", coach: "Vale", cupo: 10, activo: true, created_at: "", inscritos: ["a1","a2","a3","a4","a5","a6","a7","a8","a9","a10"], ocupados: 10, fijos: ["a1","a9"] },
  ],
  Vie: [
    { id: "t10", dia: "Vie", hora: "07:00", actividad: "Funcional", coach: "Nacho", cupo: 12, activo: true, created_at: "", inscritos: ["a1","a2","a3"], ocupados: 3, fijos: [] },
    { id: "t11", dia: "Vie", hora: "18:30", actividad: "CrossTraining", coach: "Nacho", cupo: 14, activo: true, created_at: "", inscritos: [], ocupados: 0, fijos: [] },
  ],
  Sáb: [
    { id: "t12", dia: "Sáb", hora: "10:00", actividad: "Funcional", coach: "Vale", cupo: 12, activo: true, created_at: "", inscritos: ["a1","a4","a9"], ocupados: 3, fijos: ["a1"] },
  ],
  Dom: [],
};

export const mockMisReservas: string[] = ["t2"];

export const mockAdmin: Profile = {
  id: "admin1",
  email: "admin@gym.com",
  nombre: "Dueño Gym",
  role: "admin",
  plan: "Full",
  estado: "activo",
  telefono: "291 400-0000",
  created_at: "2024-01-01",
};

export const mockAlumnoActual: Profile = {
  id: "a1",
  email: "martina@mail.com",
  nombre: "Martina Suárez",
  role: "alumno",
  plan: "Full",
  estado: "activo",
  telefono: "291 400-1122",
  created_at: "2025-01-15",
};

export const mockPagos: Pago[] = [
  { id: "p1", alumno_id: "a1", monto: 15000, fecha: "2025-07-01", metodo: "transferencia", estado: "pagado", descripcion: "Julio 2025 - Full", created_at: "" },
  { id: "p2", alumno_id: "a2", monto: 12000, fecha: "2025-07-01", metodo: "efectivo", estado: "pagado", descripcion: "Julio 2025 - 3x semana", created_at: "" },
  { id: "p3", alumno_id: "a5", monto: 15000, fecha: "2025-05-01", metodo: "mercadopago", estado: "pagado", descripcion: "Mayo 2025 - Full", created_at: "" },
  { id: "p4", alumno_id: "a3", monto: 15000, fecha: "2025-07-05", metodo: "tarjeta", estado: "pendiente", descripcion: "Julio 2025 - Full", created_at: "" },
];
