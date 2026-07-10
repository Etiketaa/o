import PDFDocument from "pdfkit";
import fs from "fs";

const doc = new PDFDocument({ margin: 40, size: "A4" });
const out = fs.createWriteStream("Client_Benefits.pdf");
doc.pipe(out);

// Title
doc.fontSize(28).font("Helvetica-Bold").fillColor("#111").text("OZ Entrenamiento – Beneficios de la Aplicación", { align: "center" });
doc.moveDown(1);

// Helper to add sections
function addSection(title, items) {
  doc.fontSize(20).font("Helvetica-Bold").fillColor("#111").text(title);
  doc.moveDown(0.5);
  doc.fontSize(12).font("Helvetica").fillColor("#333");
  items.forEach(item => {
    doc.circle(doc.x + 5, doc.y + 7, 3).fill("#4caf50");
    doc.fillColor("#333").text(`  ${item}`, { indent: 15 });
    doc.moveDown(0.3);
  });
  doc.moveDown(1);
}

addSection("Gestión de Turnos", [
  "Reserva de clases en tiempo real",
  "Visualización de disponibilidad de horarios",
  "Cancelación y reprogramación sencilla",
  "Historial de turnos del usuario"
]);

addSection("Experiencia de Usuario", [
  "Interfaz moderna y responsiva",
  "Notificaciones push para recordatorios",
  "Integración con Instagram",
  "Acceso rápido mediante demo sin backend"
]);

addSection("Seguridad y Escalabilidad", [
  "Autenticación segura con Supabase",
  "Roles de administrador y alumno",
  "Políticas RLS que protegen los datos",
  "Arquitectura lista para despliegues en producción"
]);

addSection("Beneficios Comerciales", [
  "Aumento de ocupación de clases",
  "Reducción de ausencias y cancelaciones tardías",
  "Mayor satisfacción y retención de socios",
  "Datos de asistencia para análisis de negocio"
]);

doc.end();
out.on("finish", () => {
  console.log("PDF generado: Client_Benefits.pdf");
});
