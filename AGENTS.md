# turnero-gym — sistema de turnos de OZ Entrenamiento

> Turnero de un gimnasio (reserva de clases, control de asistencia, puntaje por
> concurrencia, pagos y feedback de alumnos). Funciona **sin backend** usando
> IndexedDB del navegador como motor por defecto, con una capa opcional de
> Supabase que se activa si el backend responde (probe HTTP al arrancar).
> Proyecto sin remote, 2 commits.

---

## Arquitectura actual

Es un **frontend puro** (Vite + React + TypeScript). No hay backend propio
(FastAPI, Express, NestJS, etc.). La capa de persistencia es dual y se elige
automáticamente en `src/lib/db/index.ts`:

```
  Navegador (http://localhost:5173)
            │
            ▼
  ┌─────────────────────────────────────────────┐
  │  detectarMotor() — probe HTTP a Supabase    │
  │  - Si responde → motor "supabase"           │
  │  - Si falla (DNS, NXDOMAIN, timeout 5 s) →  │
  │    motor "local" (IndexedDB, default)       │
  └─────────────────────────────────────────────┘
            │
    ┌───────┴───────┐
    ▼               ▼
  local.ts        supabase.ts
  IndexedDB       Supabase (Postgres)
  (funciona       (no verificado contra
   offline)        proyecto real)
```

- `local` (IndexedDB, default): todo vive en el navegador. Funciona offline.
- `supabase`: mapea 1:1 con tablas de Supabase (`gym_config`, `profiles`,
  `turnos`, `sesiones`, `inscripciones`, `pagos`, `pago_config`,
  `plan_actividades`, `usuarios`). Requiere `VITE_SUPABASE_URL` y
  `VITE_SUPABASE_ANON_KEY`. **No se verificó contra un proyecto real** porque el
  proyecto original dejó de existir (muerto/NXDOMAIN).

La lógica de negocio nunca habla con el motor directamente: siempre pasa por la
interfaz `DataStore` de `src/lib/db/tipos.ts`, implementada por `localStore` y
`supabaseStore`.

El `db` es un Proxy que reenvía cada llamada al motor activo en el momento de
la llamada, así funciona aunque se cambie de motor tras importar el módulo.

---

## URLs locales

| Servicio | URL |
|----------|-----|
| App de desarrollo (Vite) | http://localhost:5173 |

---

## Comandos

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (Vite, HMR) en :5173
npm run dev

# Build de producción: tsc -b (type check) + vite build
npm run build

# Vista previa del build
npm run preview

# Linter (oxlint sobre src/)
npm run lint

# Tests (vitest en watch)
npm run test

# Tests: una sola pasada
npm run test:run
```

---

## Entorno

| Cosa | Valor |
|------|-------|
| Node | v26.x (no se usa bun; se usa npm) |
| Gestor de paquetes | npm (package-lock.json presente) |
| TypeScript | ~6.0.2 |
| Vite | ^8.1.1 |
| Vitest | ^4.1.10 (tests en `src/**/__tests__/`) |
| Linter | oxlint ^1.71.0 (`npm run lint`) |
| PWA | vite-plugin-pwa ^1.3.0, manifest en `vite.config.ts` |
| PIL (Pillow) | 10.2.0 disponible (para generar íconos del PWA) |
| Supabase JS | @supabase/supabase-js ^2.110.2 (solo si se activa motor supabase) |

No hay venv de Python en este proyecto (PIL solo se menciona para generar los
íconos del PWA si se necesita).

---

## Endpoints

**No hay backend propio**, por lo tanto no hay endpoints propios.

- Motor `local`: cero endpoints; todo en IndexedDB del navegador.
- Motor `supabase`: usa la API REST/Realtime de Supabase a través de
  `@supabase/supabase-js` (`supabase.from(...)`). Requiere que el proyecto de
  Supabase exista y responda; hoy el proyecto configurado en `.env.local` no
  responde (NXDOMAIN).
- PWA: workbox con `runtimeCaching` para `*.supabase.co` (NetworkFirst) si el
  motor supabase está activo.

Variables de entorno (`.env.example` / `.env.local.example`):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

El `.env.local` tiene valores pero el proyecto de Supabase ya no existe.

---

## Motores

| Motor | Offline | Backend necesario | Estado | Notas |
|-------|---------|-------------------|--------|-------|
| `local` (IndexedDB) | ✅ Sí | No | **Default, activo** | Auth propio (SHA-256 + sal en `auth-local.ts`). Primer arranque requiere crear la cuenta del profesor (sin password hardcodeado). |
| `supabase` | ❌ No | Sí | No verificado | El proyecto original fue borrado (muerto/NXDOMAIN). `supabase.ts` mapea 1:1 con el schema, pero nombres de columnas y políticas RLS no se confirmaron contra un proyecto real. |
| `firebase` | ❌ No | Sí | Implementado | Firestore + Firebase Auth + Firebase Storage. Requiere credenciales `VITE_FIREBASE_*`. Se activa si `VITE_FIREBASE_PROJECT_ID` está presente (sin probe). |

Selector: `detectarMotor()` en `src/lib/db/index.ts`. Si hay `VITE_FIREBASE_PROJECT_ID`,
usa `firebase`. Si no, hace un probe HTTP (HEAD con timeout de 5 s) a
`VITE_SUPABASE_URL/rest/v1/`; si responde usa `supabase`, si falla usa `local`
y avisa por consola.

---

## Modelo de datos

Todas las tablas/colecciones (en IndexedDB se comportan como "stores"; en
Supabase son tablas):

### `gym_config` (1 fila, id = "unica")
Configuración general del gym: nombre, dirección, días activos, franjas de
apertura, duración de turno, paso entre inicios, minutos de aviso.

### `profiles`
Perfiles de cliente o profesor. Campos: id, email, nombre, role
(`admin` \| `alumno`), plan (`Full` \| `3x semana` \| `2x semana`),
estado (`activo` \| `vencido`), teléfono, avatar_url,
frecuencia_semana, veces_mes_objetivo, franja (`manana` \| `tarde` \| `ambas`),
slots_preferidos, created_at.

### `turnos` (plantilla semanal)
Qué actividad hay en cada horario. Un turno = (día de la semana, hora) →
actividad, coach, cupo, activo. La plantilla se genera por defecto con
5 días × 20 horarios = 100 turnos/semana (franjas 08:00–11:00 y 13:00–21:00,
duración 60 min, paso 30 min → `m + duracion <= fin`).

### `sesiones` (fecha real)
Materialización concreta de un turno en una fecha dada. Campos: id, fecha,
hora, actividad, coach, cupo, turno_id (ref al turno de la plantilla),
created_at. Se generan con `ensureSesiones()` para los 7 días de la semana en
curso.

### `inscripciones` (reemplaza a `reservas`/`asistencias`)
Inscripción de un alumno a una sesión. Campos: id, sesion_id, alumno_id,
estado (`confirmada` \| `cancelada` \| `asistio` \| `faltó`),
feedback (`up` \| `down` \| null), comentario, feedback_at, created_at.

### `pagos` (conservado del sistema anterior)
Pagos de alumnos. Campos: id, alumno_id, monto, fecha, metodo
(`efectivo` \| `transferencia` \| `tarjeta` \| `mercadopago`),
estado (`pagado` \| `pendiente` \| `vencido`), descripción, mes_pago,
anio_pago, comprobante_url/tipo/nombre, verificado, verificado_por,
verificado_at, notas_admin, created_at.

### `pago_config` (1 fila, id = "unica")
Config de pagos: dia_limite, monto_base, cvu, alias, titular, banco, activo,
created_at.

### `plan_actividades`
Vincula planes con actividades (el corazón del filtrado de lo que ve cada
alumno). Campos: id, plan, actividad, created_at. Por defecto:
- Full: Funcional, Pesas Libres, CrossTraining, Movilidad
- 3x semana: Funcional, Pesas Libres, Movilidad
- 2x semana: Pesas Libres, Movilidad

### `usuarios` (solo motor local)
Usuarios del auth local: id, email, nombre, telefono, role, salt, hash
(SHA-256 + sal), created_at.

### Relaciones
- `gym_config` → `turnos` (plantilla semanal de referencia)
- `turnos` → `sesiones` (una plantilla materializa muchas sesiones por fecha)
- `sesiones` → `inscripciones` (una sesión tiene muchas inscripciones)
- `profiles` → `inscripciones` (alumno_id)
- `profiles` → `pagos` (alumno_id)
- `plan_actividades` → filtra qué actividades ve cada alumno según su `plan`
- `turnos` y `sesiones` comparten `actividad`, `coach`, `cupo`

### Puntaje y niveles (en `src/lib/puntaje.ts`)
- `concurrencia = asistidas / (asistidas + faltadas)` (redondeado).
- Niveles según concurrencia (solo si hay ≥3 sesiones evaluadas):
  ACERO (0) → PLATA (≥50) → PLATINO (≥75) → DIAMANTE (≥90).
- 13 insignias en `CATALOGO_INSIGNIAS`: primera_sesion, diez_sesiones,
  veinticinco_sesiones, cincuenta_sesiones, racha_5, racha_10, puntaje_75,
  puntaje_90, puntaje_100, madrugador, nocturno, mes_cerrado, semana_completa.
- `resumenAlumno()` devuelve asistidas, faltadas, canceladas, reservadas,
  asistidasMes, concurrencia, cumplimiento, racha, rachaMax, feedbackPositivo,
  feedbackNegativo, nivel, insignias.

---

## Stores y libs

### Stores (`src/stores/`)

| Archivo | Propósito |
|---------|-----------|
| `gymStore.ts` | Store principal (zustand). Config, perfiles, turnos, sesiones, inscripciones, pagos, pago_config, plan_actividades. Acciones: init, inscribir, cancelarInscripcion, marcarAsistencia, guardarFeedback, cargar/guardar todo. Reemplaza al eliminado `turnosStore`. Expone `actividadesDePlan()` y `motorActivo()`. |
| `authStore.ts` | Autenticación. Login/signup/crearCuentaProfesor/logout/loadSession. Soporta motor supabase (supabase.auth) y motor local (auth-local con SHA-256 + sal). `necesitaSetup` cuando no hay cuentas (primer arranque local). |
| `uiStore.ts` | Estado de UI: pestaña activa, fecha seleccionada, sesión seleccionada, sidebar abierto/cerrado. |
| `pagosStore.ts` | Pagos: listar, filtrar por alumno, estado de pago, subir comprobante (data URL en local / Supabase Storage en supabase), verificar pago, días restantes hasta el límite de pago. Precios por plan: 2x=12000, 3x=14000, Full=16000. |

### Libs (`src/lib/`)

| Archivo | Propósito |
|---------|-----------|
| `db/tipos.ts` | Interfaz `DataStore` (contrato de persistencia, motor-agnóstico). |
| `db/index.ts` | `detectarMotor()`, `getMotor()`, proxy `db` que reenvía al motor activo. |
| `db/local.ts` | `localStore`: implementación de `DataStore` sobre IndexedDB (vía `idb`). Incluye `borrarTodoLocal()`. |
| `db/supabase.ts` | `supabaseStore`: implementación de `DataStore` sobre Supabase (no verificado contra proyecto real). |
| `db/auth-local.ts` | Auth propio para motor local: crear usuario, autenticar (SHA-256 + sal), manejar sesión en localStorage. |
| `db/idb.ts` | Utilidades de bajo nivel sobre IndexedDB (guardar, obtener, todos, borrar, vaciar). |
| `horarios.ts` | `generarSlots()` (slots de inicio con `m + duracion <= fin`), solapamiento de turnos, franja de hora, conversión hora↔minutos. |
| `fechas.ts` | Utilidades de fecha ISO local: hoyISO, sumarDias, diaSemanaDe, semanaDe, instanteSesion, sesionTermino/esEmpezo, minutosParaEmpezar/Terminar, esDelMesActual. |
| `sesiones.ts` | `generarSesionesFaltantes()`: materializa sesiones concretas de la plantilla para fechas dadas, sin duplicar. `ordenarSesiones()`, `agruparPorFecha()`. |
| `semilla.ts` | `CONFIG_POR_DEFECTO` (OZ Entrenamiento, 08–11 y 13–21), `generarPlantillaPorDefecto()`, `ACTIVIDADES_POR_PLAN`, `frecuenciaDePlan()`, `planDeFrecuencia()`, `planActividadesPorDefecto()`. |
| `puntaje.ts` | Niveles (ACERO/PLATA/PLATINO/DIAMANTE), catálogo de 13 insignias, `resumenAlumno()`, `infoNivel()`, `etiquetaPuntaje()`. |
| `utils.ts` | Utilidades varias. |
| `csv.ts` | Exportación/importación CSV. |
| `notifications.ts` | Notificaciones (push/web). |

### Vistas (`src/views/`)

| Alumno | Admin | Landing |
|--------|-------|---------|
| `ReservarView.tsx` | `AgendaView.tsx` | `LandingView.tsx` |
| `MisTurnosView.tsx` | `ControlView.tsx` | |
| `PerfilView.tsx` | `AlumnosView.tsx` | |
| `ProgresoView.tsx` | `DashboardView.tsx` | |
| | `SettingsView.tsx` | |
| | `CalendarioView.tsx` | |
| | `PagosView.tsx` | |

Layouts: `AppLayout.tsx`, `AuthLayout.tsx`.

---

## Estado real (honesto)

- **Supabase está muerto**: el proyecto original dejó de existir (responde
  NXDOMAIN / no hay DNS). El `.env.local` aún apunta a esa URL y key, pero no
  sirve. El motor `local` es el que funciona y es el default.
- **Motor local verificado**: IndexedDB + auth propio (SHA-256 + sal) funciona
  offline. Primer arranque requiere crear la cuenta del profesor desde la UI
  (no hay password hardcodeado).
- **Motor supabase no verificado**: `supabase.ts` existe y mapea tablas, pero
  no se probó contra un proyecto real. Nombres de columnas y políticas RLS por
  verificar al crear un proyecto nuevo.
- **PWA sin iconos aún**: `vite.config.ts` declara VitePWA con manifest que
  apunta a `/icons/icon-192x192.png` y `/icons/icon-512x512.png`, pero esos
  archivos no existen todavía (generar con PIL, 10.2.0 disponible).
- **Migraciones SQL por verificar**: hay scripts sueltos en la raíz
  (`supabase-schema.sql`, `supabase-plan-actividades.sql`, `supabase-pagos.sql`,
  `supabase-push-subscriptions.sql`, `supabase-fix-rls.sql`,
  `supabase-fix-recursion.sql`) aplicados a mano al proyecto viejo. No hay
  carpeta de migraciones ni registro de cuáles se aplicaron.
- **`pagosStore` se conserva** pero ahora usa `db` (el motor activo) en lugar
  de hablar directo con Supabase.
- **`turnosStore` se eliminó**; `gymStore` lo reemplaza.

---

## Próximos pasos (qué falta)

1. Correr `npm run build` y verificar que `tsc -b` y `vite build` pasan.
2. Correr `npm run test:run` y verificar que los tests de vitest pasan.
3. Generar los íconos del PWA (`/icons/icon-192x192.png`, `/icons/icon-512x512.png`)
   con PIL (10.2.0 disponible) para que el manifest no falle.
4. Revisar en browser a `375 px` (mobile-first) el flujo de reserva y el
   checkout de pagos.
5. Crear un proyecto de Supabase nuevo y verificar el motor `supabase`
   (migraciones, nombres de columnas, RLS, storage de comprobantes).
6. Revisar los scripts SQL sueltos de la raíz y decidir si se migran a una
   carpeta de migraciones con registro de aplicación.
7. Verificar `.gitignore` antes de cualquier commit (no subir `.env` ni
   secretos; el repo es público).

---

## Archivos relevantes (rutas absolutas)

- `/home/franco/Proyectos/turnero-gym/AGENTS.md` — este archivo.
- `/home/franco/Proyectos/turnero-gym/package.json` — scripts y dependencias.
- `/home/franco/Proyectos/turnero-gym/vite.config.ts` — Vite + VitePWA + alias `@`.
- `/home/franco/Proyectos/turnero-gym/vitest.config.ts` — configuración de tests.
- `/home/franco/Proyectos/turnero-gym/.env.example` — variables de entorno (ejemplo).
- `/home/franco/Proyectos/turnero-gym/.env.local` — variables locales (Supabase muerto, no usar).
- `/home/franco/Proyectos/turnero-gym/.gitignore` — revisar antes de commitear.
- `/home/franco/Proyectos/turnero-gym/src/types/index.ts` — tipos del modelo de datos.
- `/home/franco/Proyectos/turnero-gym/src/lib/db/tipos.ts` — contrato `DataStore`.
- `/home/franco/Proyectos/turnero-gym/src/lib/db/index.ts` — `detectarMotor()` + proxy `db`.
- `/home/franco/Proyectos/turnero-gym/src/lib/db/local.ts` — motor IndexedDB.
- `/home/franco/Proyectos/turnero-gym/src/lib/db/supabase.ts` — motor Supabase (no verificado).
- `/home/franco/Proyectos/turnero-gym/src/lib/db/auth-local.ts` — auth local (SHA-256 + sal).
- `/home/franco/Proyectos/turnero-gym/src/lib/db/idb.ts` — utilidades IndexedDB.
- `/home/franco/Proyectos/turnero-gym/src/lib/horarios.ts` — generación de slots de turno.
- `/home/franco/Proyectos/turnero-gym/src/lib/fechas.ts` — utilidades de fecha.
- `/home/franco/Proyectos/turnero-gym/src/lib/sesiones.ts` — materialización de sesiones.
- `/home/franco/Proyectos/turnero-gym/src/lib/semilla.ts` — config por defecto, plantilla, planes/actividades.
- `/home/franco/Proyectos/turnero-gym/src/lib/puntaje.ts` — niveles, insignias, `resumenAlumno()`.
- `/home/franco/Proyectos/turnero-gym/src/stores/gymStore.ts` — store principal del gym.
- `/home/franco/Proyectos/turnero-gym/src/stores/authStore.ts` — autenticación (local + supabase).
- `/home/franco/Proyectos/turnero-gym/src/stores/uiStore.ts` — estado de UI.
- `/home/franco/Proyectos/turnero-gym/src/stores/pagosStore.ts` — pagos y comprobantes.
- `/home/franco/Proyectos/turnero-gym/src/main.tsx` — punto de entrada React.
- `/home/franco/Proyectos/turnero-gym/src/App.tsx` — rutas de la aplicación.
- `/home/franco/Proyectos/turnero-gym/src/views/` — vistas alumno / admin / landing.
- `/home/franco/Proyectos/turnero-gym/src/components/` — componentes compartidos (+ `__tests__`).
- `/home/franco/Proyectos/turnero-gym/src/stores/__tests__/` — tests de stores.
- `/home/franco/Proyectos/turnero-gym/src/lib/__tests__/` — tests de libs.
- `/home/franco/Proyectos/turnero-gym/supabase-schema.sql` — schema SQL (no verificado).
- `/home/franco/Proyectos/turnero-gym/supabase-plan-actividades.sql` — SQL de plan_actividades.
- `/home/franco/Proyectos/turnero-gym/supabase-pagos.sql` — SQL de pagos.
- `/home/franco/Proyectos/turnero-gym/supabase-push-subscriptions.sql` — SQL de suscripciones push.
- `/home/franco/Proyectos/turnero-gym/supabase-fix-rls.sql` — parche RLS (aplicado a mano, registro desconocido).
- `/home/franco/Proyectos/turnero-gym/supabase-fix-recursion.sql` — parche recursividad (aplicado a mano, registro desconocido).
- `/home/franco/Proyectos/turnero-gym/MEJORAS-OZ-ENTRENAMIENTO.txt` — README de facto con detalle de mejoras.
- `/home/franco/Proyectos/turnero-gym/README.md` — template genérico de Vite, no sirve. Ignorarlo.
