import PDFDocument from "pdfkit";
import fs from "fs";

const doc = new PDFDocument({ 
  margin: 50, 
  size: "A4",
  info: {
    Title: "OZ Entrenamiento - Sistema de Reservas",
    Author: "OZ Entrenamiento",
    Subject: "Manual del sistema de turnos",
  }
});
const out = fs.createWriteStream("OZ_Entrenamiento_Turnero.pdf");
doc.pipe(out);

const LIME = "#d4ff3d";
const DARK = "#0c0e11";
const GRAY = "#666666";
const LIGHT_GRAY = "#999999";

// ============ PORTADA ============
doc.moveDown(8);
doc.fontSize(14).font("Helvetica").fillColor(LIME).text("OZ ENTRENAMIENTO", { align: "center" });
doc.moveDown(0.5);
doc.fontSize(36).font("Helvetica-Bold").fillColor(DARK).text("Sistema de\nReservas de Turnos", { align: "center" });
doc.moveDown(1);
doc.fontSize(12).font("Helvetica").fillColor(GRAY).text("Manual de uso y funcionalidades", { align: "center" });
doc.moveDown(3);
doc.fontSize(10).font("Helvetica").fillColor(LIGHT_GRAY).text("Ingeniero White, Buenos Aires", { align: "center" });
doc.text("Julio 2026", { align: "center" });

// ============ NUEVA PÁGINA ============
doc.addPage();

function addSectionTitle(title) {
  doc.fontSize(18).font("Helvetica-Bold").fillColor(DARK).text(title);
  doc.moveDown(0.3);
  doc.rect(doc.x, doc.y, 40, 2).fill(LIME);
  doc.moveDown(0.8);
}

function addSubSection(title) {
  doc.fontSize(12).font("Helvetica-Bold").fillColor(DARK).text(title);
  doc.moveDown(0.3);
}

function addText(text) {
  doc.fontSize(10).font("Helvetica").fillColor(GRAY).text(text, { lineGap: 4 });
  doc.moveDown(0.5);
}

function addItem(text) {
  doc.fontSize(10).font("Helvetica").fillColor(GRAY).text(`•  ${text}`, { indent: 10, lineGap: 3 });
  doc.moveDown(0.2);
}

// ============ QUÉ ES ============
addSectionTitle("¿Qué es el Turnero?");
addText("El Turnero de OZ Entrenamiento es una aplicación web que permite a los socios reservar clases de forma rápida y sencilla desde cualquier dispositivo (computadora, celular o tablet).");
addText("El sistema reemplaza la reserva manual por WhatsApp o teléfono, automatizando el proceso y brindando control total al administrador del gym.");

// ============ FUNCIONALIDADES ============
doc.addPage();
addSectionTitle("Funcionalidades principales");

addSubSection("Para los socios (alumnos)");
addItem("Reservar clases en cualquier momento desde la app");
addItem("Ver la disponibilidad de horarios en tiempo real");
addItem("Cancelar una reserva si ya no puede asistir");
addItem("Consultar sus próximos turnos reservados");
addItem("Recibir notificaciones push de recordatorio");
addItem("Ver su perfil, plan y estado de cuenta");

doc.moveDown(0.5);

addSubSection("Para el administrador (dueño del gym)");
addItem("Ver el dashboard con estadísticas: alumnos activos, asistencia semanal, ingresos");
addItem("Gestionar la agenda completa de la semana");
addItem("Controlar la asistencia de cada clase (presencia/ausencia)");
addItem("Administrar la lista de alumnos con búsqueda rápida");
addItem("Seguimiento de pagos: cobrados, pendientes y vencidos");
addItem("Detectar alumnos con planes vencidos");
addItem("Ver gráficos de ocupación por día de la semana");

// ============ CÓMO SE UTILIZA ============
doc.addPage();
addSectionTitle("Cómo se utiliza");

addSubSection("Paso 1: Acceso");
addText("El socio ingresa a la aplicación desde el navegador de su celular o computadora. Se registra con su email y contraseña, o puede usar el acceso rápido de demostración.");

addSubSection("Paso 2: Reservar una clase");
addText("Desde la pantalla principal, el socio ve los días de la semana y los horarios disponibles. Hace click en el turno que desea y confirma la reserva con un solo clic.");

addSubSection("Paso 3: Gestionar reservas");
addText("En la sección 'Mis turnos' puede ver todas sus reservas activas y cancelar cualquier turno que ya no pueda asistir. Esto libera el lugar para otros socios.");

addSubSection("Paso 4: Panel del administrador");
addText("El administrador tiene acceso a un panel completo con sidebar de navegación. Desde ahí puede controlar asistencia, ver pagos, gestionar alumnos y monitorear estadísticas en tiempo real.");

// ============ VENTAJAS ============
doc.addPage();
addSectionTitle("Ventajas del sistema");

addSubSection("Para el gym");
addItem("Automatización completa del proceso de reserva");
addItem("Reducción de llamadas y mensajes de WhatsApp");
addItem("Control de asistencia en tiempo real");
addItem("Datos para tomar decisiones de negocio");
addItem("Mejor imagen profesional del gym");

addSubSection("Para los socios");
addItem("Reserva en 2 segundos desde el celular");
addItem("Disponibilidad en tiempo real (sin llamar)");
addItem("Recordatorios automáticos antes de la clase");
addItem("Transparencia sobre el estado de su plan");

doc.moveDown(1);

addSubSection("Resultados esperados");
addText("Gimnasios que implementan sistemas de reserva online reportan:");
addItem("Aumento del 20-30% en ocupación de clases");
addItem("Reducción del 40% en cancelaciones de última hora");
addItem("Mayor retención de socios por mejor experiencia");

// ============ TECNOLOGÍA ============
doc.addPage();
addSectionTitle("Tecnología utilizada");

addText("El sistema está construido con tecnologías modernas y seguras:");

addSubSection("Frontend");
addItem("React + TypeScript (interfaz rápida y confiable)");
addItem("Tailwind CSS (diseño responsive para todos los dispositivos)");
addItem("Vite (compilación rápida)");

addSubSection("Backend");
addItem("Supabase (base de datos en la nube con autenticación)");
addItem("Políticas de seguridad a nivel de base de datos (RLS)");
addItem("Notificaciones push para recordatorios");

addSubSection("Hosting");
addItem("Vercel (deploy automático, alta disponibilidad)");
addItem("SSL incluido (conexión segura HTTPS)");
addItem("Dominio personalizable");

// ============ MEJORAS FUTURAS ============
doc.addPage();
addSectionTitle("Mejoras en camino");

addText("Estamos comprometidos a seguir mejorando el sistema. Algunas funcionalidades que estamos evaluando para próximas versiones:");

doc.moveDown(0.5);

addSubSection("Corto plazo");
addItem("Pagos online integrados (Mercado Pago)");
addItem("Panel de estadísticas avanzadas con exportación");
addItem("Sistema de comunicación directa gym-socio");
addItem("Recordatorios por WhatsApp");

addSubSection("Mediano plazo");
addItem("App nativa para iOS y Android");
addItem("Sistema de suspensiones y pausas de membresía");
addItem("Múltiples sedes con gestión centralizada");
addItem("Programa de referidos y beneficios");

addSubSection("Largo plazo");
addItem("Integración con equipamiento (sensores de asistencia)");
addItem("Marketplace de productos y suplementos");
addItem("Clases virtuales en vivo integradas");

// ============ COSTOS ============
doc.addPage();
addSectionTitle("Costos del proyecto");

addSubSection("Costos fijos (anuales)");
addItem("Dominio .com.ar: USD 10/año (~ARS 10.000)");
addItem("Certificado SSL: Incluido (Vercel)");

doc.moveDown(0.5);

addSubSection("Hosting y servicios (mensuales)");
addItem("Vercel (hosting + deploy): USD 0 (plan Hobby) o USD 20/mes (Pro)");
addItem("Supabase (base de datos + auth): USD 0 (plan Free) o USD 25/mes (Pro)");
addItem("Notificaciones push: Incluidas");

doc.moveDown(0.5);

addSubSection("Inversión inicial de desarrollo");
addItem("Diseño UI/UX personalizado");
addItem("Desarrollo frontend (React + TypeScript)");
addItem("Configuración backend (Supabase)");
addItem("Integración con notificaciones push");
addItem("Landing page profesional");
addItem("Panel de administración completo");
addItem("Documentación y entrega");

doc.moveDown(0.5);

addSubSection("Costo total estimado");
addText("El desarrollo tiene un costo único de acuerdo al alcance acordado. Los servicios de hosting y dominio tienen un costo mensual mínimo que puede ser cubierto con el plan gratuito de cada plataforma.");

doc.moveDown(0.5);

addSubSection("Plan de mantenimiento (opcional)");
addItem("Actualizaciones de seguridad: Incluidas");
addItem("Soporte técnico: Disponible por consultas");
addItem("Nuevas funcionalidades: Presupuesto aparte");

// ============ CONTACTO ============
doc.addPage();
doc.moveDown(6);
doc.fontSize(14).font("Helvetica").fillColor(LIME).text("OZ ENTRENAMIENTO", { align: "center" });
doc.moveDown(0.5);
doc.fontSize(11).font("Helvetica").fillColor(GRAY).text("¿Tenés preguntas o sugerencias?", { align: "center" });
doc.moveDown(0.3);
doc.fontSize(11).font("Helvetica").fillColor(GRAY).text("Estamos abiertos a mejoras y adaptaciones", { align: "center" });
doc.text("para que el sistema se ajuste perfectamente a tu negocio.", { align: "center" });
doc.moveDown(2);
doc.fontSize(10).font("Helvetica").fillColor(LIGHT_GRAY).text("@oz.entrenamiento", { align: "center" });
doc.text("Ingeniero White, Buenos Aires", { align: "center" });

// ============ FINALIZAR ============
doc.end();
out.on("finish", () => {
  console.log("PDF generado: OZ_Entrenamiento_Turnero.pdf");
});
