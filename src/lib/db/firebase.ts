import {
  getApps,
  initializeApp,
  type FirebaseApp,
} from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  type Firestore,
} from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import type {
  GymConfig,
  Inscripcion,
  Pago,
  PagoConfig,
  PlanActividad,
  Profile,
  Sesion,
  Turno,
} from "@/types";
import type { DataStore } from "./tipos";
import { generarSesionesFaltantes } from "@/lib/sesiones";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

const app: FirebaseApp =
  getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

export const firebaseApp: FirebaseApp = app;
export const firebaseAuth: Auth = getAuth(app);
export const firestore: Firestore = getFirestore(app);
export const firebaseStorage: FirebaseStorage = getStorage(app);

/** Quita campos con valor `undefined` (Firestore no los acepta). */
function limpiar<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as T;
}

export const firebaseStore: DataStore = {
  motor: "firebase",

  async getConfig() {
    const snap = await getDoc(doc(firestore, "gym_config", "unica"));
    return snap.exists() ? (snap.data() as GymConfig) : null;
  },

  async saveConfig(config) {
    await setDoc(doc(firestore, "gym_config", "unica"), limpiar({ ...config, id: "unica" }));
  },

  async listPerfiles() {
    const snap = await getDocs(collection(firestore, "profiles"));
    const perfiles = snap.docs.map((d) => d.data() as Profile);
    return perfiles.sort((a, b) => a.nombre.localeCompare(b.nombre));
  },

  async getPerfil(id) {
    const snap = await getDoc(doc(firestore, "profiles", id));
    return snap.exists() ? (snap.data() as Profile) : null;
  },

  async savePerfil(perfil) {
    if (perfil.role === "admin") {
      const snap = await getDocs(collection(firestore, "profiles"));
      const perfiles = snap.docs.map((d) => d.data() as Profile);
      if (perfiles.some((p) => p.role === "admin" && p.id !== perfil.id)) {
        throw new Error("Ya existe un profesor registrado");
      }
    }
    await setDoc(doc(firestore, "profiles", perfil.id), limpiar({ ...perfil }));
  },

  async listTurnos() {
    const snap = await getDocs(collection(firestore, "turnos"));
    const turnos = snap.docs.map((d) => d.data() as Turno);
    return turnos.sort((a, b) => a.hora.localeCompare(b.hora));
  },

  async saveTurno(turno) {
    await setDoc(doc(firestore, "turnos", turno.id), limpiar({ ...turno }));
  },

  async deleteTurno(id) {
    await deleteDoc(doc(firestore, "turnos", id));
  },

  async listSesiones(desde, hasta) {
    const snap = await getDocs(collection(firestore, "sesiones"));
    const sesiones = snap.docs.map((d) => d.data() as Sesion);
    return sesiones
      .filter((s) => s.fecha >= desde && s.fecha <= hasta)
      .sort((a, b) =>
        a.fecha === b.fecha ? a.hora.localeCompare(b.hora) : a.fecha.localeCompare(b.fecha),
      );
  },

  async ensureSesiones(fechas) {
    if (fechas.length === 0) return [];
    const ordenadas = [...fechas].sort();
    const desde = ordenadas[0];
    const hasta = ordenadas[ordenadas.length - 1];

    const turnosSnap = await getDocs(
      query(collection(firestore, "turnos"), where("activo", "==", true)),
    );
    const turnos = turnosSnap.docs.map((d) => d.data() as Turno);

    const existentes = await firebaseStore.listSesiones(desde, hasta);
    const nuevos = generarSesionesFaltantes(fechas, turnos, existentes);

    for (const sesion of nuevos) {
      await setDoc(doc(firestore, "sesiones", sesion.id), limpiar({ ...sesion }));
    }

    return [...existentes, ...nuevos].filter((s) => fechas.includes(s.fecha));
  },

  async listInscripciones(filtro) {
    const snap = await getDocs(collection(firestore, "inscripciones"));
    let todas = snap.docs.map((d) => d.data() as Inscripcion);
    if (filtro?.sesionIds?.length) {
      todas = todas.filter((i) => filtro.sesionIds!.includes(i.sesion_id));
    }
    if (filtro?.alumnoIds?.length) {
      todas = todas.filter((i) => filtro.alumnoIds!.includes(i.alumno_id));
    }
    return todas;
  },

  async crearInscripcion(sesionId, alumnoId) {
    const existentes = await firebaseStore.listInscripciones({ sesionIds: [sesionId] });
    const previa = existentes.find((i) => i.alumno_id === alumnoId && i.estado !== "cancelada");
    if (previa) return previa;

    const inscripcion: Inscripcion = {
      id: crypto.randomUUID(),
      sesion_id: sesionId,
      alumno_id: alumnoId,
      estado: "confirmada",
      feedback: null,
      comentario: null,
      feedback_at: null,
      created_at: new Date().toISOString(),
    };
    await setDoc(doc(firestore, "inscripciones", inscripcion.id), limpiar({ ...inscripcion }));
    return inscripcion;
  },

  async actualizarInscripcion(id, cambios) {
    await updateDoc(doc(firestore, "inscripciones", id), limpiar({ ...cambios }));
  },

  async listPagos() {
    const snap = await getDocs(collection(firestore, "pagos"));
    const pagos = snap.docs.map((d) => d.data() as Pago);
    return pagos.sort((a, b) => b.mes_pago - a.mes_pago);
  },

  async savePago(pago) {
    await setDoc(doc(firestore, "pagos", pago.id), limpiar({ ...pago }));
  },

  async getPagoConfig() {
    const snap = await getDoc(doc(firestore, "pago_config", "unica"));
    return snap.exists() ? (snap.data() as PagoConfig) : null;
  },

  async savePagoConfig(config) {
    await setDoc(doc(firestore, "pago_config", "unica"), limpiar({ ...config, id: "unica" }));
  },

  async listPlanActividades() {
    const snap = await getDocs(collection(firestore, "plan_actividades"));
    return snap.docs.map((d) => d.data() as PlanActividad);
  },

  async savePlanActividad(planActividad) {
    await setDoc(doc(firestore, "plan_actividades", planActividad.id), limpiar({ ...planActividad }));
  },

  async deletePlanActividad(id) {
    await deleteDoc(doc(firestore, "plan_actividades", id));
  },
};
