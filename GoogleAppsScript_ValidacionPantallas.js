/**
 * Google Apps Script - Validación de Pantallas Planta 5
 * 
 * Vinculado a la planilla oficial de Google Sheets:
 * https://docs.google.com/spreadsheets/d/1RdQDItzlz2T_OT-D_DVZ38SrZbLwWuK8IJTFD5XQcoE/edit?gid=0#gid=0
 * 
 * CARACTERÍSTICAS:
 * - Guarda las fotos en Google Drive (carpeta "Evidencias Validación Pantallas").
 * - Crea enlaces azules clicables (Foto 1, Foto 2, etc.) en la columna "Evidencias" (Columna H).
 * - Envía correo con diseño ejecutivo minimalista y fotos adjuntas.
 * 
 * PASOS PARA ACTUALIZAR EN TU GOOGLE SHEETS:
 * 1. Abrí tu planilla: https://docs.google.com/spreadsheets/d/1RdQDItzlz2T_OT-D_DVZ38SrZbLwWuK8IJTFD5XQcoE/edit
 * 2. En el menú superior hacé clic en: Extensiones > Apps Script
 * 3. En Código.gs reemplazá todo el código por este bloque completo.
 * 4. Hacé clic en: Implementar > Gestionar implementaciones > Editar (icono lápiz) > Versión: "Nueva versión" > Implementar.
 */

function doPost(e) {
  try {
    var contents = e.postData.contents;
    var data = JSON.parse(contents);

    // 1. Obtener la hoja de cálculo activa
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // 2. Formatear fecha y hora
    var fechaStr = Utilities.formatDate(new Date(), "America/Argentina/Buenos_Aires", "d/M/yyyy, HH:mm:ss");

    // 3. Procesar seriales / códigos de barra
    var barcodes = [];
    if (Array.isArray(data.barcodes) && data.barcodes.length > 0) {
      barcodes = data.barcodes;
    } else if (data.barcode) {
      barcodes = data.barcode.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
    }
    var barcodesUnidos = barcodes.length > 0 ? barcodes.join(', ') : (data.barcode || '');

    // 4. Guardar imágenes en Google Drive y crear enlaces azules
    var attachments = [];
    var photoLinks = [];
    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      // Buscar o crear carpeta en Drive para almacenar las fotos
      var folderName = "Evidencias Validación Pantallas";
      var folders = DriveApp.getFoldersByName(folderName);
      var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);

      for (var i = 0; i < data.images.length; i++) {
        var img = data.images[i];
        if (img && img.dataUrl) {
          try {
            var parts = img.dataUrl.split(',');
            var base64Data = parts[1];
            var mimeMatch = parts[0].match(/data:([^;]+)/);
            var mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
            var bytes = Utilities.base64Decode(base64Data);
            var safeName = (data.model || 'pantalla') + '_' + (barcodes[i] || ('serial_' + (i + 1))) + '_' + (i + 1) + '.jpg';
            var blob = Utilities.newBlob(bytes, mimeType, img.name || safeName);
            
            // Crear archivo en Drive y habilitar visualización
            var file = folder.createFile(blob);
            try {
              file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
            } catch (shareErr) {
              console.warn('Permiso público no aplicado: ' + shareErr);
            }
            
            var fileUrl = file.getUrl();
            photoLinks.push({ label: 'Foto ' + (i + 1), url: fileUrl });
            attachments.push(blob);
          } catch (errImg) {
            console.warn('Error al guardar imagen en Drive: ' + errImg);
          }
        }
      }
    }

    // 5. Guardar la fila en Google Sheets
    // Columnas: Fecha (A), Responsable (B), Línea (C), Modelo (D), Código de Barras (E), Lote (F), Observaciones (G), Evidencias (H)
    sheet.appendRow([
      fechaStr,
      data.responsible || 'Rober Quiquinlla',
      data.line || '',
      data.model || '',
      barcodesUnidos,
      data.lot || '',
      data.observations || '',
      photoLinks.length > 0 ? '' : '—'
    ]);

    var newRow = sheet.getLastRow();

    // 5.1 Si hay fotos, construir los enlaces clicables de color azul en la columna H (Evidencias)
    if (photoLinks.length > 0) {
      var cell = sheet.getRange(newRow, 8); // Columna H = 8
      var fullText = "";
      var linkRanges = [];

      for (var k = 0; k < photoLinks.length; k++) {
        var prefix = k > 0 ? "   " : "";
        var startIdx = fullText.length + prefix.length;
        fullText += prefix + photoLinks[k].label;
        var endIdx = fullText.length;
        linkRanges.push({ start: startIdx, end: endIdx, url: photoLinks[k].url });
      }

      var richTextBuilder = SpreadsheetApp.newRichTextValue().setText(fullText);
      for (var r = 0; r < linkRanges.length; r++) {
        richTextBuilder.setLinkUrl(linkRanges[r].start, linkRanges[r].end, linkRanges[r].url);
      }
      cell.setRichTextValue(richTextBuilder.build());
    }

    // 6. Generar el correo con diseño ejecutivo minimalista
    var htmlBody = data.htmlBody;
    if (!htmlBody) {
      var chipsHtml = barcodes.map(function(b) {
        return '<span style="display:inline-block;margin:3px 4px 3px 0;padding:5px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;font-weight:600;color:#1e293b;">' + escapeHtml(b) + '</span>';
      }).join('');

      var obsHtml = data.observations
        ? '<div style="padding:10px 14px;background:#f8fafc;border-left:3px solid #cbd5e1;border-radius:4px;font-size:13px;color:#334155;line-height:1.5;">' + escapeHtml(data.observations) + '</div>'
        : '<span style="color:#94a3b8;font-size:13px;font-style:italic;">Sin observaciones</span>';

      var driveLinksHtml = '';
      if (photoLinks.length > 0) {
        driveLinksHtml = '<div style="margin-top:6px;font-size:12px;">' +
          photoLinks.map(function(p) {
            return '<a href="' + p.url + '" target="_blank" style="color:#0284c7;font-weight:600;margin-right:12px;text-decoration:underline;">' + p.label + ' ↗</a>';
          }).join('') +
          '</div>';
      }

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
        '              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:4px;">Responsable</div>' +
        '              <div style="font-size:13px;font-weight:600;color:#1e293b;">' + escapeHtml(data.responsible) + '</div>' +
        '            </td>' +
        '          </tr>' +
        '          <tr>' +
        '            <td colspan="2" valign="top" style="padding-bottom:18px;">' +
        '              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:4px;">Fecha y Hora</div>' +
        '              <div style="font-size:12px;color:#475569;">' + fechaStr + '</div>' +
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
        '                📎 <strong style="margin-left:6px;margin-right:4px;color:#1e293b;">' + photoLinks.length + '</strong> archivo(s) de imagen adjunto(s)' +
        '              </div>' +
        '              ' + driveLinksHtml +
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

    // 7. Enviar correo a los destinatarios con las imágenes adjuntas
    var recipients = "roberqsc@gmail.com, roberqsc@hotmail.com";
    var subject = "Validación de Pantalla · Línea " + (data.line || '') + " · " + (data.model || '') + " · " + barcodesUnidos;

    MailApp.sendEmail({
      to: recipients,
      subject: subject,
      htmlBody: htmlBody,
      attachments: attachments
    });

    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    console.error('Error en doPost: ' + err);
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
