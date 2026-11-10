# Site de Calidad Planta 5 — Producción de TV

Portal integral de aseguramiento y control de calidad desarrollado específicamente para líneas de fabricación, ensamble y testeo de **Televisores (Smart TV, OLED, QLED, UHD 4K y MiniLED)** en Planta 5.

Portal de aseguramiento y control adaptado con criterios normativos de televisión (IEC 62368-1, calibración óptica D65, cuartos limpios para Open Cell y auditorías de empaque OBA).

La fotografía de un técnico trabajando sobre los componentes internos de un televisor en la pantalla de acceso es de [Pexels](https://www.pexels.com/photo/technician-repairing-television-circuit-board-indoors-37492292/).
El logotipo Newsan se muestra desde la imagen proporcionada para el sitio.

---

## 📺 Módulos y Estaciones de Calidad de TV

1. **Dashboard en Tiempo Real**:
   - Marca Newsan con acento rojo y saludo interactivo personalizado, más una matriz semanal de cumplimiento para LCD 6, LCD 8, CELDA 2, CELDA 3 e Inserción Manual & JIG.
   - Las fechas se colorean según el avance de los tres controles diarios por línea (inicio de turno, torque y ESD); el detalle muestra responsables, pendientes y hallazgos registrados.
   - La matriz semanal muestra únicamente de lunes a viernes y permite marcar una línea sin producción en un día concreto, guardar el motivo y excluir sus auditorías del cumplimiento exigible de esa fecha.
   - El Dashboard incluye un sinóptico del equipo de Calidad, con jefatura, áreas, responsables de auditoría por línea y equipo de Reparaciones.
   - **Política de Gestión**: Carrusel interactivo con 6 compromisos legales, estándares de panel y seguridad eléctrica.
   - **10 Principios de Calidad TV**: Carrusel horizontal con reglas de oro (ESD, Hi-Pot, tolerancia de píxeles, comunicación controlada).
   - **Controles del Día**: Matriz de seguimiento en vivo con indicadores de cumplimiento (Aprobados, Pendientes, Avance %), selector de turno y búsqueda.

2. **Estaciones Críticas de Ensamble de TV en la Matriz**:
   - **CheckList Inicial**: Verificación 5S, pulseras ESD y torque de atornilladores.
   - **Auditoría I (Panel & Open Cell)**: Inspección de sala limpia ISO 7, partículas, polarizador y cables FFC/LVDS.
   - **Auditoría II (Mainboard & Fuente SMPS)**: Aislamiento térmico, disipadores, pads y ruteo seguro de cables.
   - **Hi-Pot / Seguridad Eléctrica**: Ensayo dieléctrico 3.0 kV AC según norma IEC 62368-1 (cero fallas toleradas).
   - **Calibración Óptica TV**: Balance de blancos D65 (6500K), luminancia nits y verificación de patrones RGBW para píxeles muertos / Mura.
   - **Audio & Conectividad**: Respuesta en frecuencia de altavoces Dolby Atmos, enlace HDMI ARC/eARC, Wi-Fi y Bluetooth.
   - **Burn-in Rack**: Ensayos de envejecimiento térmico por 2 a 4 horas en rack continuo a 40°C.
   - **OBA & Empaque**: Bisel frontal, seriales MAC escaneados, manuales y accesorios completos.

3. **Herramientas Integradas**:
   - **Qual-e (IA TV)**: Asistente virtual con respuestas instantáneas sobre tolerancias de píxeles, ensayos Hi-Pot, temperaturas de color y paradas de línea.
   - **Formularios de Inspección**: Carga rápida de auditorías y mediciones directas. El Checklist Cambio de Modelo I.M & JIG abre en una vista completa, como Torque y Pulseras ESD, y permite agregar o eliminar puestos en la revisión de la pauta; cada puesto guarda su resultado, observación y fotos de evidencia. Sus 13 puntos de control generan un descargo consolidado cuando hay NG. Los datos necesarios para buscar sus desvíos por lote y modelo se comparten entre equipos desde la base central del servidor; las fotos permanecen guardadas en el navegador que realizó la auditoría. El inicio diario RG-0772 permite cargar esos desvíos y guardar sus estados y notas de seguimiento en la base central. El registro general RG-0772 sigue guardándose en el navegador, y este flujo todavía no escribe en Google Sheets.
   - **Reportes de auditorías**: Radiografía por línea y período, comparación de los seis formularios y tendencia mensual de NG por formulario.
   - **Gestión de Hallazgos (8D)**: Registro de no conformidades y acciones de contención inmediata.

---

## 🚀 Cómo Iniciar el Portal

La aplicación debe ejecutarse con el servidor Python, que sirve la web y valida las cuentas compartidas.

Desde la carpeta del proyecto, inicia el servidor:

```bash
.\.venv\Scripts\python.exe server.py
```

El servidor abrirá la web en `http://localhost:8000`. Para que otras computadoras de la misma red la usen, deben abrir `http://IP-DE-LA-PC-SERVIDORA:8000`; la PC servidora debe permanecer encendida y el firewall debe permitir conexiones entrantes al puerto TCP 8000 en la red privada.

La autenticación central requiere abrir la web desde el servidor. Abrir `index.html` directamente no permite iniciar sesión.

### Gestión MDR

La vista consulta la [base MDR de Google Sheets](https://docs.google.com/spreadsheets/d/1lBdDXVgjBblsGtRbuwekvsp3yHrk0awVXQPF8ed_ACs/edit?gid=0#gid=0), donde se genera la numeración, y muestra registros desde 2022, un gráfico anual interactivo de MDR nacionales e importados y una tendencia mensual con selector de año y dos líneas comparativas (Nacional e Importado). Incluye el acceso con ícono de Excel a esa base y la descarga de la plantilla oficial `RG-0158` para preparar reclamos a proveedores. Al seleccionar años, meses, segmentos o proveedores, se actualizan los indicadores, los gráficos, los rankings y la tabla. La tabla ordena por fecha descendente y ofrece los enlaces de `Link MDR Enviado` y `Link Respuesta 8D`, sin mostrar las columnas Detectó ni Estado. Por defecto filtra la planta `UP5` (Planta 5) usando la columna **Planta**; el selector permite elegir otra planta o todas. En la vista predeterminada de UP5 se excluyen las líneas que contengan `MOTOROLA MOBIL`, `CELULAR PHILCO`, `CELULARES NOBLEX`, `CONECTARA IGUALDAD` u `OPPO`; al elegir otra planta o todas, esos registros se pueden consultar. Si la planilla no está disponible o dejó de estar compartida, la vista muestra un aviso de error y permite volver a intentar con **Actualizar datos**.

### Validación de pantallas

Desde **Operaciones > IQC Recepción**, el submenú permite abrir la validación de etiquetas y la validación de pantallas; esta última y sus registros son visibles solo para administradores, con autorización verificada también por el servidor. El formulario de pantallas registra línea (LCD6, LCD8, CELDA1, CELDA2 o CELDA3), modelo/descripción en mayúsculas que comienza con `91` (por ejemplo, `91DV43X7180`), código de barras/serial, lote, observaciones y hasta cinco imágenes JPG, PNG o WEBP (máximo 5 MB cada una). Los registros y las imágenes se guardan en la base compartida `quality_users.sqlite3` del servidor; la vista muestra las últimas 20 validaciones.

Al guardar una validación, el servidor intenta enviar un correo desde Gmail, con los datos y las imágenes adjuntas. Los destinatarios predeterminados son `roberqsc@gmail.com` y `roberqsc@hotmail.com`; se pueden cambiar con `QUALITY_SCREEN_VALIDATION_RECIPIENTS`. Para habilitar el envío, creá una contraseña de aplicación para la cuenta Gmail que enviará los mensajes (requiere verificación en dos pasos) y configurá estas variables en PowerShell, en la misma ventana desde la que se inicia el servidor:

```powershell
$env:QUALITY_SMTP_USER = "cuenta-que-envia@gmail.com"
$env:QUALITY_SMTP_APP_PASSWORD = "contraseña-de-aplicación-de-Google"
$env:QUALITY_SCREEN_VALIDATION_RECIPIENTS = "roberqsc@gmail.com,roberqsc@hotmail.com"
.\.venv\Scripts\python.exe server.py
```

No uses la contraseña normal de Gmail ni guardes la contraseña de aplicación en el código. Si el correo falla o no se configuró, el registro y sus imágenes quedan guardados y el formulario avisa que el mensaje no se envió. Reiniciá el servidor después de cambiar su código o la configuración.

### Scrap de pantallas

En el modal Scanner, el detalle de seriales pendientes se muestra junto a los meses y se desplaza a la vista al seleccionar uno. La sección de ubicaciones “Prueba de vida” permanece plegada hasta que se necesite consultar. El detalle de escaneos del día incluye la OP de la columna I de SCANER; si está vacía, busca la OP en BBDD por serial exacto. Los seriales escaneados que aún no figuran en RMA muestran el modelo de la columna D de SCANER como referencia posible; si SCANER no reconoce el modelo, se intenta sugerirlo por seriales similares de BBDD y se muestra el serial usado como referencia. El servidor prepara los datos del Scanner en segundo plano al iniciar y los mantiene en caché cinco minutos; al abrir o actualizar el modal responde con los datos disponibles sin esperar a que Google Sheets termine otra descarga.

La vista **Scrap de pantallas** consulta la pestaña `gid=1203582049` de la base compartida. Muestra modelo (B), part number (C), marca, línea (D), pulgadas (F), lote (G), tipo (J), las evidencias enlazadas en K–P, LPN (Q), pendiente de baja en EBS (S), fecha y hora de baja (T), OP (V), PO (W) y año (Y). Si el año está vacío, lo deduce de la fecha de la columna T. Para completar la marca, compara el modelo con las columnas D/E de la pestaña IQC `gid=1493243980`; si no encuentra coincidencia, conserva la marca de la base de scrap. Los registros de la tabla se ordenan del más reciente al más antiguo. Incluye una comparación anual minimalista de Origen y Roto en proceso, en barras apiladas de 2022 a 2026 en orden cronológico; una tendencia mensual de líneas con selector de año, usando la fecha de la columna T; y una tendencia lote a lote. Los buscadores de modelo y lote aparecen juntos; al elegir un modelo se habilita el buscador de lote y se detectan las combinaciones de lote/año disponibles con casillas marcadas por defecto. Se pueden tildar o destildar varios lotes; los indicadores, gráficos, rankings y tabla aplican la selección en conjunto. **Incluir todos** restaura todos los lotes. También incluye Top 5 de modelos por categoría (cantidades en Z y AA) y filtros por año, línea, marca, modelo y búsqueda. El indicador de pendientes de baja en EBS cuenta solo registros de 2026 en adelante. En la barra superior están los botones **RMA** y **Scanner**. **Scanner** compara el serial de BBDD (E) con el serial de SCANER (A), usando filas desde la 3669 con fecha de escaneo K válida en 2026. Ignora los registros de RMA cuyo serial es el marcador “S”. La fecha de baja (T) define el mes del pendiente, pero un serial escaneado en cualquier fecha de 2026 se considera recibido; así una baja RMA posterior no vuelve a contar la pantalla como pendiente. El modal muestra las bajas del día, los pendientes por mes y los seriales escaneados que aún no figuran en RMA, con el modelo leído en SCANER como referencia. La ubicación (M) aparece en un único recuadro y solo para filas con descripción “Prueba de vida”. Las planillas se cachean cinco minutos; al reabrir el modal se usa esa caché y **Actualizar** fuerza una nueva consulta. **RMA** siempre abre el modal, haya o no una fila seleccionada; si se selecciona una, sus datos se cargan como referencia. El formulario permite completar el modelo, marca, línea, lote, part number, fecha, responsable y motivo. Hasta conectar la URL autorizada de escritura de la BBDD compartida, confirmar muestra un aviso y no guarda ni registra la baja. La búsqueda y las páginas de 100 registros se resuelven en el servidor, que conserva los datos en caché durante cinco minutos y los precarga al iniciar. Además, guarda una copia local en `scrap_screens_archive.sqlite3` con los registros hasta 2025, sin persistir los de 2026 en adelante. Al abrir la vista, el histórico local aparece mientras el servidor actualiza Sheets en segundo plano; el estado indica si la actualización continúa o falló. **Actualizar datos** solicita una sincronización inmediata.

La sección **Documentación** se despliega en el menú lateral y separa tres apartados: **Documentación de proveedores** (material existente de LG e Hisense con accesos a Google Drive), **Manuales de procedimiento** y **Instructivos por área** (MDR, IQC, Analistas, QA y Auditores). Los apartados internos muestran espacios preparados para incorporar los documentos cuando estén disponibles; los enlaces de proveedores se abren en pestaña nueva y dependen de los permisos de Drive del usuario.

### Reportes de auditorías

La vista **Reportes** ofrece una radiografía comparable por línea de producción y período (última semana, últimas dos semanas, últimos 30 días, todo el período o rango personalizado). Resume los seis formularios configurados en Planta 5, muestra los ítems NG guardados y grafica su tendencia mensual. Los envíos nuevos guardan el detalle detectado en los controles de torque y ESD y los puntos desmarcados de las listas de verificación. Los registros históricos que no conservaron el detalle se muestran como auditorías con NG sin identificación del ítem; los registros sin fecha sólo se incluyen en «Todo el período» y no aparecen en la tendencia mensual. Estos registros se guardan en el navegador donde se completó el formulario.

### Administración compartida de usuarios

Los administradores pueden agregar usuarios, asignar permisos, cambiar contraseñas y eliminar cuentas desde **Usuarios**. En **Equipo de Calidad** cualquier usuario autenticado puede consultar la estructura visual por jefatura y áreas; los administradores también pueden agregar, editar o eliminar integrantes y actualizar nombre, sector, correo y hasta dos celulares. Las cuentas, el equipo y las sesiones se guardan en `quality_users.sqlite3`, junto a `server.py`; por eso todas las computadoras deben conectarse al mismo servidor. Cambiar una contraseña invalida las sesiones existentes de esa cuenta en todos los equipos. Las pestañas abiertas consultan la sesión cada 30 segundos y vuelven a la pantalla de inicio de sesión si fue revocada.

La primera vez que se inicia el servidor se crean las cuentas base. Se recomienda que el administrador cambie las contraseñas iniciales desde la web. Si se configura `QUALITY_ADMIN_PASSWORD` antes del primer inicio, esa contraseña se establece para `rober`; la variable solo se aplica cuando aún no existe la base de datos. El archivo de base contiene hashes de contraseña, no contraseñas en texto plano; debe incluirse en las copias de seguridad y no debe compartirse públicamente.

Si esta computadora conserva cuentas creadas en la versión local anterior, un administrador puede importarlas desde **Usuarios**. Se agregan solo las cuentas que todavía no existen; las cuentas centrales no se sobrescriben. Al terminar, se elimina del navegador la copia local importada.

El servidor de esta versión usa HTTP, por lo que las credenciales no están cifradas durante el tránsito. Restringe el acceso a una red interna confiable; para redes no confiables o información sensible, configura HTTPS mediante un proxy de confianza antes de usarlo.

---

## 🛠️ Tecnologías Utilizadas

- **HTML5 & CSS3**: Diseño responsivo y arquitectura modular.
- **Tailwind CSS**: Estilizado moderno con la paleta roja Newsan y fondos rosados claros para los estados seleccionados.
- **JavaScript Vanilla**: Estado reactivo, filtrado en vivo, carruseles y simulador de IA sin dependencias pesadas.
- **Python 3**: Servidor local ligero para despliegue inmediato.
