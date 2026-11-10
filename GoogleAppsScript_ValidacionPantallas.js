/**
 * Google Apps Script - Validación de Pantallas Planta 5
 * 
 * Este script se usa en la Web App de Apps Script:
 * https://script.google.com/macros/s/AKfycbwC_b5G6m6qS0140MB9-awYuKHr_vFNiodlSxJL2CJPrl3nGMQGdvSgRlYx1NoKiMgV/exec
 * 
 * Si necesitas actualizarlo en el editor de Google Apps Script:
 * 1. Abrí tu script en script.google.com
 * 2. Pegá este código en Código.gs
 * 3. Hacé clic en 'Implementar' > 'Gestionar implementaciones' > Editar > 'Nueva versión' > Guardar.
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // 1. Usar el cuerpo HTML pre-renderizado si la aplicación lo envió
    var htmlBody = data.htmlBody;
    
    // 2. Si no viene htmlBody, construir la plantilla minimalista automáticamente
    if (!htmlBody) {
      var dateStr = Utilities.formatDate(new Date(), "America/Argentina/Buenos_Aires", "dd/MM/yyyy HH:mm:ss");
      var barcodes = data.barcodes || (data.barcode ? data.barcode.split(',') : []);
      var chipsHtml = barcodes.map(function(b) {
        return '<span style="display:inline-block;margin:3px 4px 3px 0;padding:5px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;font-weight:600;color:#1e293b;">' + escapeHtml(b.toString().trim()) + '</span>';
      }).join('');
      
      var obsHtml = data.observations 
        ? '<div style="padding:10px 14px;background:#f8fafc;border-left:3px solid #cbd5e1;border-radius:4px;font-size:13px;color:#334155;line-height:1.5;">' + escapeHtml(data.observations) + '</div>'
        : '<span style="color:#94a3b8;font-size:13px;font-style:italic;">Sin observaciones</span>';
        
      var imagesCount = (data.images && data.images.length) ? data.images.length : 0;
      
      htmlBody = '<!DOCTYPE html>' +
        '<html lang="es">' +
        '<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Validación de pantalla</title></head>' +
        '<body style="margin:0;padding:24px 12px;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;-webkit-font-smoothing:antialiased;">' +
        '  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.05);border:1px solid #e2e8f0;">' +
        '    <tr><td style="height:4px;background:linear-gradient(90deg, #dc2626 0%, #ef4444 100%);"></td></tr>' +
        '    <tr>' +
        '      <td style="padding:28px 28px 20px 28px;">' +
        '        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">' +
        '          <tr>' +
        '            <td>' +
        '              <div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#dc2626;margin-bottom:4px;">PLANTA 5 · CONTROL DE CALIDAD</div>' +
        '              <h1 style="margin:0;font-size:20px;font-weight:700;color:#0f172a;line-height:1.25;">Validación de Pantalla</h1>' +
        '            </td>' +
        '            <td align="right" valign="top">' +
        '              <span style="display:inline-block;padding:5px 12px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:20px;font-size:11px;font-weight:600;color:#059669;white-space:nowrap;">✓ Registrada</span>' +
        '            </td>' +
        '          </tr>' +
        '        </table>' +
        '      </td>' +
        '    </tr>' +
        '    <tr><td style="padding:0 28px;"><div style="height:1px;background-color:#f1f5f9;"></div></td></tr>' +
        '    <tr>' +
        '      <td style="padding:20px 28px 24px 28px;">' +
        '        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">' +
        '          <tr>' +
        '            <td width="50%" valign="top" style="padding-bottom:16px;padding-right:12px;">' +
        '              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:4px;">Línea</div>' +
        '              <div><span style="display:inline-block;padding:3px 10px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;font-weight:700;color:#1e293b;">' + escapeHtml(data.line) + '</span></div>' +
        '            </td>' +
        '            <td width="50%" valign="top" style="padding-bottom:16px;">' +
        '              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:4px;">Modelo</div>' +
        '              <div style="font-size:15px;font-weight:700;color:#0f172a;letter-spacing:-0.2px;">' + escapeHtml(data.model) + '</div>' +
        '            </td>' +
        '          </tr>' +
        '          <tr>' +
        '            <td width="50%" valign="top" style="padding-bottom:16px;padding-right:12px;">' +
        '              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:4px;">Lote</div>' +
        '              <div style="font-size:13px;font-weight:600;color:#1e293b;">' + escapeHtml(data.lot) + '</div>' +
        '            </td>' +
        '            <td width="50%" valign="top" style="padding-bottom:16px;">' +
        '              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:4px;">Auditor / Responsable</div>' +
        '              <div style="font-size:13px;font-weight:600;color:#1e293b;">' + escapeHtml(data.responsible) + '</div>' +
        '            </td>' +
        '          </tr>' +
        '          <tr>' +
        '            <td colspan="2" valign="top" style="padding-bottom:18px;">' +
        '              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:4px;">Fecha y Hora</div>' +
        '              <div style="font-size:12px;color:#475569;">' + dateStr + '</div>' +
        '            </td>' +
        '          </tr>' +
        '          <tr>' +
        '            <td colspan="2" valign="top" style="padding-top:6px;padding-bottom:18px;">' +
        '              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:6px;">Códigos de barras / Serials escaneados (' + barcodes.length + ')</div>' +
        '              <div>' + chipsHtml + '</div>' +
        '            </td>' +
        '          </tr>' +
        '          <tr>' +
        '            <td colspan="2" valign="top" style="padding-bottom:18px;">' +
        '              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:6px;">Observaciones</div>' +
        '              ' + obsHtml +
        '            </td>' +
        '          </tr>' +
        '          <tr>' +
        '            <td colspan="2" valign="top">' +
        '              <div style="display:inline-flex;align-items:center;padding:7px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-size:12px;color:#475569;">' +
        '                📎 <strong style="margin-left:6px;margin-right:4px;color:#1e293b;">' + imagesCount + '</strong> archivo(s) de imagen adjunto(s)' +
        '              </div>' +
        '            </td>' +
        '          </tr>' +
        '        </table>' +
        '      </td>' +
        '    </tr>' +
        '    <tr>' +
        '      <td style="padding:16px 28px;background-color:#f8fafc;border-top:1px solid #f1f5f9;font-size:11px;color:#94a3b8;line-height:1.5;">' +
        '        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">' +
        '          <tr>' +
        '            <td>' +
        '              <strong style="color:#64748b;">Site de Calidad · Planta 5</strong><br>' +
        '              Notificación automática generada tras la inspección en línea.' +
        '            </td>' +
        '            <td align="right" valign="middle" style="color:#cbd5e1;font-size:10px;">CONFIDENCIAL</td>' +
        '          </tr>' +
        '        </table>' +
        '      </td>' +
        '    </tr>' +
        '  </table>' +
        '</body>' +
        '</html>';
    }

    // 3. Envío de correo
    var recipients = "roberqsc@gmail.com, roberqsc@hotmail.com";
    var subject = "Validación de Pantalla · Línea " + data.line + " · " + data.model + " · " + (data.barcode || (data.barcodes ? data.barcodes.join(', ') : ''));

    MailApp.sendEmail({
      to: recipients,
      subject: subject,
      htmlBody: htmlBody
    });

    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
