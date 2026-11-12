/**
 * Google Apps Script - Disparador Automático de Auditorías TV Planta 5
 * =====================================================================
 * Este script se puede vincular a las planillas de Google Forms de auditorías:
 *  - Pulseras ESD
 *  - Control de Torque
 *  - Checklist Inicio de Turno (RG-0220 / RG-0772)
 *  - Checklist Cambio de Modelo
 *  - Inicio de Producción Diario IM & JIG
 *  - Cambio de Modelo IM & JIG
 *
 * Cada vez que un auditor presione "Enviar" en el Google Form, este script
 * notifica al servidor del Site de Calidad para que la Matriz Semanal se
 * actualice instantáneamente.
 *
 * INSTRUCCIONES DE INSTALACIÓN EN GOOGLE FORMS / GOOGLE SHEETS:
 * 1. Abrí la planilla de respuestas de Google Forms (o la planilla de control).
 * 2. Menú: Extensiones > Apps Script.
 * 3. Pegá este código.
 * 4. Ajustá la variable SERVIDOR_URL con la IP o dominio de tu servidor (ej: http://10.x.x.x:8000).
 * 5. Hacé clic en el ícono de reloj ⏰ (Activadores / Triggers) en el panel izquierdo.
 * 6. Hacé clic en "+ Añadir activador" (abajo a la derecha):
 *      - Función: "alEnviarFormulario"
 *      - Fuente del evento: "Desde la hoja de cálculo" (o "Desde el formulario")
 *      - Tipo de evento: "Al enviar el formulario"
 * 7. Guardá y concedé los permisos solicitados.
 *
 * ¡Listo! Cada envío notificará al servidor al instante.
 */

// Reemplazá con la dirección IP o hostname de la máquina donde corre server.py
var SERVIDOR_URL = "http://localhost:8000";

function alEnviarFormulario(e) {
  try {
    var url = SERVIDOR_URL.replace(/\/+$/, "") + "/api/audits/notify";
    var options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        evento: "formulario_completado",
        timestamp: new Date().toISOString()
      }),
      muteHttpExceptions: true
    };
    var response = UrlFetchApp.fetch(url, options);
    Logger.log("Notificación enviada al servidor de Calidad: " + response.getResponseCode());
  } catch (error) {
    Logger.log("Aviso: No se pudo contactar al servidor local (normal si está en red interna sin túnel): " + error);
  }
}
