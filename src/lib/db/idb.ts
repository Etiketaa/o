/**
 * Envoltorio mínimo de IndexedDB. Sin dependencias.
 * Un object store por tabla, con keyPath "id".
 */

export const DB_NAME = "oz-turnero";
export const DB_VERSION = 1;

export const STORES = [
  "perfiles",
  "usuarios",
  "turnos",
  "sesiones",
  "inscripciones",
  "pagos",
  "pago_config",
  "gym_config",
  "plan_actividades",
] as const;

export type StoreName = (typeof STORES)[number];

let promesaDB: Promise<IDBDatabase> | null = null;

export function abrirDB(): Promise<IDBDatabase> {
  if (promesaDB) return promesaDB;

  promesaDB = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      for (const store of STORES) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: "id" });
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return promesaDB;
}

function tx<T>(
  store: StoreName,
  modo: IDBTransactionMode,
  fn: (objectStore: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return abrirDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(store, modo);
        const request = fn(transaction.objectStore(store));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
  );
}

export async function idbTodos<T>(store: StoreName): Promise<T[]> {
  return tx<T[]>(store, "readonly", (s) => s.getAll() as IDBRequest<T[]>);
}

export async function idbObtener<T>(store: StoreName, id: string): Promise<T | undefined> {
  return tx<T | undefined>(store, "readonly", (s) => s.get(id) as IDBRequest<T | undefined>);
}

export async function idbGuardar<T extends { id: string }>(store: StoreName, valor: T): Promise<T> {
  await tx(store, "readwrite", (s) => s.put(valor) as IDBRequest<IDBValidKey>);
  return valor;
}

export async function idbGuardarVarios<T extends { id: string }>(
  store: StoreName,
  valores: T[],
): Promise<void> {
  if (valores.length === 0) return;
  const db = await abrirDB();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(store, "readwrite");
    const objectStore = transaction.objectStore(store);
    for (const valor of valores) objectStore.put(valor);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function idbBorrar(store: StoreName, id: string): Promise<void> {
  await tx(store, "readwrite", (s) => s.delete(id) as IDBRequest<undefined>);
}

export async function idbVaciar(store: StoreName): Promise<void> {
  await tx(store, "readwrite", (s) => s.clear() as IDBRequest<undefined>);
}
