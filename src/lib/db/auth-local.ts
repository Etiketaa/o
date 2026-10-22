import { idbGuardar, idbObtener, idbTodos } from "./idb";

/**
 * Usuario del motor local. El hash de la contraseña se guarda con SHA-256
 * + sal. No es un sustituto de un backend real: sirve para que el turnero
 * funcione en este dispositivo sin depender de Supabase.
 */
export interface UsuarioLocal {
  id: string;
  email: string;
  nombre: string;
  telefono: string;
  role: "admin" | "alumno";
  salt: string;
  hash: string;
  created_at: string;
}

const LLAVE_SESION = "oz:sesion";

export function generarSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const datos = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", datos);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function listarUsuarios(): Promise<UsuarioLocal[]> {
  return idbTodos<UsuarioLocal>("usuarios");
}

export async function buscarUsuarioPorEmail(email: string): Promise<UsuarioLocal | undefined> {
  const usuarios = await listarUsuarios();
  return usuarios.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export interface DatosUsuario {
  email: string;
  nombre: string;
  telefono: string;
  role: "admin" | "alumno";
}

export async function crearUsuario(datos: DatosUsuario, password: string): Promise<UsuarioLocal> {
  const existente = await buscarUsuarioPorEmail(datos.email);
  if (existente) throw new Error("Ya existe una cuenta con ese correo");

  const salt = generarSalt();
  const usuario: UsuarioLocal = {
    id: crypto.randomUUID(),
    email: datos.email.trim().toLowerCase(),
    nombre: datos.nombre,
    telefono: datos.telefono,
    role: datos.role,
    salt,
    hash: await hashPassword(password, salt),
    created_at: new Date().toISOString(),
  };

  await idbGuardar("usuarios", usuario);
  return usuario;
}

export async function autenticar(email: string, password: string): Promise<UsuarioLocal | null> {
  const usuario = await buscarUsuarioPorEmail(email);
  if (!usuario) return null;
  const hash = await hashPassword(password, usuario.salt);
  return hash === usuario.hash ? usuario : null;
}

export function guardarSesionLocal(usuarioId: string): void {
  localStorage.setItem(LLAVE_SESION, usuarioId);
}

export function leerSesionLocal(): string | null {
  return localStorage.getItem(LLAVE_SESION);
}

export function borrarSesionLocal(): void {
  localStorage.removeItem(LLAVE_SESION);
}
