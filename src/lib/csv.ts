import type { Profile, Pago } from "@/types";

export function exportAlumnosCSV(alumnos: Profile[]) {
  const headers = ["Nombre", "Email", "Teléfono", "Plan", "Estado", "Fecha de registro"];
  const rows = alumnos.map((a) => [
    a.nombre,
    a.email,
    a.telefono,
    a.plan,
    a.estado,
    new Date(a.created_at).toLocaleDateString("es-AR"),
  ]);
  downloadCSV(headers, rows, "alumnos.csv");
}

export function exportPagosCSV(pagos: Pago[], alumnosById: Record<string, Profile>) {
  const headers = ["Alumno", "Email", "Período", "Descripción", "Monto", "Método", "Estado", "Fecha", "Verificado"];
  const rows = pagos.map((p) => {
    const al = alumnosById[p.alumno_id];
    return [
      al?.nombre || "Desconocido",
      al?.email || "",
      `${String(p.mes_pago).padStart(2, "0")}/${p.anio_pago}`,
      p.descripcion,
      String(p.monto),
      p.metodo,
      p.estado,
      new Date(p.fecha).toLocaleDateString("es-AR"),
      p.verificado ? "Sí" : "No",
    ];
  });
  downloadCSV(headers, rows, "pagos.csv");
}

function downloadCSV(headers: string[], rows: string[][], filename: string) {
  const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
