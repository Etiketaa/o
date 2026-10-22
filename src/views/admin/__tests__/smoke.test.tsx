import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useGymStore } from "@/stores/gymStore";
import { usePagosStore } from "@/stores/pagosStore";
import { useUIStore } from "@/stores/uiStore";
import { hoyISO, diaSemanaDe } from "@/lib/fechas";
import type { GymConfig, Inscripcion, Profile, Sesion, Turno } from "@/types";

vi.mock("@/lib/db", () => {
  const noop = async () => undefined;
  return {
    db: {
      ensureSesiones: vi.fn(async () => []),
      listSesiones: vi.fn(async () => []),
      listInscripciones: vi.fn(async () => []),
      listTurnos: vi.fn(async () => []),
      listPerfiles: vi.fn(async () => []),
      listPagos: vi.fn(async () => []),
      listPlanActividades: vi.fn(async () => []),
      saveTurno: noop,
      deleteTurno: noop,
      savePerfil: noop,
      saveConfig: noop,
      guardarPago: noop,
      actualizarInscripcion: noop,
      getConfig: vi.fn(async () => null),
      getPagoConfig: vi.fn(async () => null),
      savePlanActividad: vi.fn(async () => {}),
      deletePlanActividad: vi.fn(async () => {}),
    },
    detectarMotor: vi.fn(async () => "local"),
    getMotor: vi.fn(() => "local"),
  };
});

const HOY = hoyISO();

const config: GymConfig = {
  id: "unica",
  nombre: "OZ Entrenamiento",
  direccion: "Ingeniero White 123",
  dias_activos: ["Lun", "Mar", "Mié", "Jue", "Vie"],
  franjas: [
    { inicio: "08:00", fin: "12:00" },
    { inicio: "16:00", fin: "21:00" },
  ],
  duracion_min: 60,
  paso_min: 30,
  minutos_aviso: 15,
  actualizado_at: new Date().toISOString(),
};

const turnos: Turno[] = [
  {
    id: "t1",
    dia: "Lun",
    hora: "09:00",
    actividad: "Funcional",
    coach: "Nacho",
    cupo: 12,
    activo: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "t2",
    dia: "Mar",
    hora: "18:00",
    actividad: "CrossFit",
    coach: "Mauro",
    cupo: 10,
    activo: true,
    created_at: new Date().toISOString(),
  },
];

function alumno(
  parcial: Partial<Profile> & { id: string; nombre: string },
): Profile {
  return {
    email: `${parcial.id}@oz.test`,
    role: "alumno",
    plan: "2x semana",
    estado: "activo",
    telefono: "249 000 0000",
    frecuencia_semana: 2,
    veces_mes_objetivo: 8,
    franja: "manana",
    slots_preferidos: [],
    created_at: new Date().toISOString(),
    ...parcial,
  } as Profile;
}

const perfiles: Profile[] = [
  alumno({
    id: "p1",
    nombre: "Ana Gómez",
    plan: "3x semana",
    slots_preferidos: [{ dia: diaSemanaDe(HOY), hora: "09:00" }],
  }),
  alumno({ id: "p2", nombre: "Bruno Díaz", plan: "2x semana", estado: "vencido" }),
  alumno({ id: "p3", nombre: "Carla Ruiz", plan: "Full" }),
];

const sesiones: Sesion[] = [
  {
    id: "s1",
    fecha: HOY,
    hora: "09:00",
    actividad: "Funcional",
    coach: "Nacho",
    cupo: 12,
    turno_id: "t1",
    created_at: new Date().toISOString(),
  },
  {
    id: "s2",
    fecha: HOY,
    hora: "18:00",
    actividad: "CrossFit",
    coach: "Mauro",
    cupo: 10,
    turno_id: "t2",
    created_at: new Date().toISOString(),
  },
];

const inscripciones: Inscripcion[] = [
  {
    id: "i1",
    sesion_id: "s1",
    alumno_id: "p1",
    estado: "asistio",
    feedback: "up",
    created_at: new Date().toISOString(),
  },
  {
    id: "i2",
    sesion_id: "s1",
    alumno_id: "p2",
    estado: "confirmada",
    created_at: new Date().toISOString(),
  },
  {
    id: "i3",
    sesion_id: "s2",
    alumno_id: "p3",
    estado: "confirmada",
    created_at: new Date().toISOString(),
  },
];

beforeEach(() => {
  useGymStore.setState({
    config,
    perfiles,
    turnos,
    sesiones,
    inscripciones,
    planActividades: [],
    initialized: true,
    loading: false,
    marcarAsistencia: vi.fn(async () => {}),
    guardarPerfil: vi.fn(async () => {}),
    guardarConfig: vi.fn(async () => {}),
    guardarTurno: vi.fn(async () => {}),
    borrarTurno: vi.fn(async () => {}),
    cargarPlantilla: vi.fn(async () => {}),
    asegurarSesiones: vi.fn(async () => {}),
    cargarSesiones: vi.fn(async () => {}),
    cargarInscripciones: vi.fn(async () => {}),
  });
  usePagosStore.setState({
    pagos: [],
    loadPagos: vi.fn(async () => {}),
    loadConfig: vi.fn(async () => {}),
  });
  useUIStore.setState({ selectedFecha: HOY, selectedSesionId: null });
});

describe("AlumnosView", () => {
  it("lista clientes con plan, nivel y puntaje", async () => {
    const { AlumnosView } = await import("../AlumnosView");
    render(<AlumnosView />);
    expect(screen.getByText("Ana Gómez")).toBeInTheDocument();
    expect(screen.getByText("Bruno Díaz")).toBeInTheDocument();
    expect(screen.getByText("Carla Ruiz")).toBeInTheDocument();
    expect(screen.getByText(/3× SEMANA/)).toBeInTheDocument();
    expect(screen.getAllByText(/concurrencia/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/racha/).length).toBeGreaterThan(0);
  });

  it("filtra por búsqueda", async () => {
    const { AlumnosView } = await import("../AlumnosView");
    render(<AlumnosView />);
    fireEvent.change(screen.getByLabelText(/Buscar cliente/), { target: { value: "carla" } });
    expect(screen.getByText("Carla Ruiz")).toBeInTheDocument();
    expect(screen.queryByText("Ana Gómez")).not.toBeInTheDocument();
  });

  it("filtra por plan", async () => {
    const { AlumnosView } = await import("../AlumnosView");
    render(<AlumnosView />);
    fireEvent.click(screen.getByRole("button", { name: "FULL" }));
    expect(screen.getByText("Carla Ruiz")).toBeInTheDocument();
    expect(screen.queryByText("Bruno Díaz")).not.toBeInTheDocument();
  });

  it("expande el detalle y muestra los horarios pedidos", async () => {
    const { AlumnosView } = await import("../AlumnosView");
    render(<AlumnosView />);
    fireEvent.click(screen.getByText("Ana Gómez"));
    expect(screen.getByText("Horarios que pidió")).toBeInTheDocument();
    expect(screen.getByText(/Turnos totales/)).toBeInTheDocument();
  });

  it("muestra la pestaña de horarios pedidos", async () => {
    const { AlumnosView } = await import("../AlumnosView");
    render(<AlumnosView />);
    fireEvent.click(screen.getByRole("button", { name: /Horarios pedidos/ }));
    expect(screen.getByText(/Turno fijo/)).toBeInTheDocument();
    expect(screen.getByText(/Quiere estos horarios/)).toBeInTheDocument();
  });

  it("abre el modal de edición", async () => {
    const { AlumnosView } = await import("../AlumnosView");
    render(<AlumnosView />);
    fireEvent.click(screen.getByText("Ana Gómez"));
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
    expect(screen.getByText("Guardar cambios")).toBeInTheDocument();
  });
});

describe("DashboardView", () => {
  it("muestra los 6 KPIs y la asistencia de hoy", async () => {
    const { DashboardView } = await import("../DashboardView");
    render(<DashboardView />);
    expect(screen.getByText("Clientes activos")).toBeInTheDocument();
    expect(screen.getByText("Total clientes")).toBeInTheDocument();
    expect(screen.getByText("Turnos de hoy")).toBeInTheDocument();
    expect(screen.getByText("Asistencia hoy")).toBeInTheDocument();
    expect(screen.getByText("Ingresos del mes")).toBeInTheDocument();
    expect(screen.getByText("Clientes nuevos")).toBeInTheDocument();
    expect(screen.getByText("Asistencia de hoy")).toBeInTheDocument();
    expect(screen.getByText("Funcional")).toBeInTheDocument();
    expect(screen.getByText("CrossFit")).toBeInTheDocument();
  });

  it("marca asistencia", async () => {
    const { DashboardView } = await import("../DashboardView");
    render(<DashboardView />);
    const marcar = useGymStore.getState().marcarAsistencia as ReturnType<typeof vi.fn>;
    fireEvent.click(screen.getByLabelText(/Marcar asistencia de Bruno/));
    expect(marcar).toHaveBeenCalledWith("i2", "asistio");
  });

  it("marca ausencia", async () => {
    const { DashboardView } = await import("../DashboardView");
    render(<DashboardView />);
    const marcar = useGymStore.getState().marcarAsistencia as ReturnType<typeof vi.fn>;
    fireEvent.click(screen.getByLabelText(/Marcar ausencia de Carla/));
    expect(marcar).toHaveBeenCalledWith("i3", "faltó");
  });
});

describe("SettingsView", () => {
  it("muestra los datos del gym y guarda la configuración", async () => {
    const { SettingsView } = await import("../SettingsView");
    render(<SettingsView />);
    const input = screen.getByLabelText("Nombre") as HTMLInputElement;
    expect(input.value).toBe("OZ Entrenamiento");
    fireEvent.change(input, { target: { value: "OZ Gym" } });
    fireEvent.click(screen.getByRole("button", { name: /Guardar configuración/ }));
    await waitFor(() => {
      expect(useGymStore.getState().guardarConfig).toHaveBeenCalled();
    });
  });

  it("muestra la grilla semanal y las actividades por plan", async () => {
    const { SettingsView } = await import("../SettingsView");
    render(<SettingsView />);
    expect(screen.getByText("Grilla semanal")).toBeInTheDocument();
    expect(screen.getAllByText("Funcional").length).toBeGreaterThan(0);
    expect(screen.getByText("Actividades por plan")).toBeInTheDocument();
  });

  it("abre el modal de turno nuevo", async () => {
    const { SettingsView } = await import("../SettingsView");
    render(<SettingsView />);
    fireEvent.click(screen.getByRole("button", { name: /Turno/ }));
    expect(screen.getByText("Nuevo turno")).toBeInTheDocument();
    expect(screen.getByLabelText("Cupo")).toBeInTheDocument();
  });

  it("agrega y quita actividades de un plan", async () => {
    const { SettingsView } = await import("../SettingsView");
    const { db } = await import("@/lib/db");
    render(<SettingsView />);

    // El plan "2x semana" arranca con la lista por defecto: Pesas Libres, Movilidad.
    fireEvent.change(screen.getByLabelText("Elegir actividad para 2x semana"), {
      target: { value: "CrossFit" },
    });
    fireEvent.click(screen.getByLabelText("Agregar actividad a 2x semana"));

    await waitFor(() => {
      expect(db.savePlanActividad).toHaveBeenCalledWith(
        expect.objectContaining({ plan: "2x semana", actividad: "CrossFit" }),
      );
    });
    expect(
      useGymStore
        .getState()
        .planActividades.filter((pa) => pa.plan === "2x semana")
        .map((pa) => pa.actividad),
    ).toEqual(["Pesas Libres", "Movilidad", "CrossFit"]);

    fireEvent.click(screen.getByLabelText("Quitar Movilidad de 2x semana"));
    await waitFor(() => {
      expect(db.deletePlanActividad).toHaveBeenCalled();
    });
    expect(
      useGymStore
        .getState()
        .planActividades.filter((pa) => pa.plan === "2x semana")
        .map((pa) => pa.actividad),
    ).toEqual(["Pesas Libres", "CrossFit"]);
  });
});

describe("CalendarioView", () => {
  it("muestra el mes y el detalle del día", async () => {
    const { CalendarioView } = await import("../CalendarioView");
    render(<CalendarioView />);
    await waitFor(() => {
      expect(screen.getByText("09:00")).toBeInTheDocument();
    });
    expect(screen.getByText("Turnos")).toBeInTheDocument();
  });

  it("abre el detalle de una sesión con asistencia", async () => {
    const { CalendarioView } = await import("../CalendarioView");
    render(<CalendarioView />);
    await waitFor(() => {
      expect(screen.getByText("09:00")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("09:00"));
    await waitFor(() => {
      expect(screen.getByLabelText(/Marcar asistencia de Bruno/)).toBeInTheDocument();
    });
    expect(screen.getByText("Pidieron este horario")).toBeInTheDocument();
  });
});
