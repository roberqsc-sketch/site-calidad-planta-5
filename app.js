/**
 * Site de Calidad Planta 5 - Producción de TV
 * Gestión de Estado, Autenticación (Login/Logout), Trazabilidad por Serial y Hub de Módulos
 */

// ==========================================
// 2. BASE DE DATOS DE TRAZABILIDAD SERIAL (TV)
// ==========================================
const SerialDatabase = {
  'TV-P5-98412': {
    serial: 'TV-P5-98412',
    model: 'OLED 55" 4K Smart Master',
    cell: 'CELDA 1 (OLED Flagship)',
    panelLot: 'LGD-OLED-55-LOT42',
    mainboardSN: 'MB-RTK-9821-OK',
    smpsSN: 'SMPS-3000V-781',
    hipot: '3.0 kV AC · Fuga 0.4 mA (Aprobado)',
    whiteBalance: '6508K D65 · Delta E 1.1 (Conforme)',
    audio: 'Dolby Atmos Pass · 100Hz-10kHz OK',
    firmware: 'v5.12.04_PROD_RELEASE',
    status: 'Liberado para Empaque OBA',
    auditor: 'Azul Son',
    timestamp: 'Hoy, 08:42'
  },
  'TV-P5-98413': {
    serial: 'TV-P5-98413',
    model: 'QLED 65" Quantum Pro 4K',
    cell: 'CELDA 2 (QLED Dimming)',
    panelLot: 'CSOT-QLED-65-LOT19',
    mainboardSN: 'MB-MTK-6542-OK',
    smpsSN: 'SMPS-3000V-902',
    hipot: '3.0 kV AC · Fuga 0.3 mA (Aprobado)',
    whiteBalance: '6495K D65 · Delta E 0.9 (Conforme)',
    audio: 'Stereo 20W Pass · THD 0.2%',
    firmware: 'v4.08.12_PROD_RELEASE',
    status: 'Liberado para Empaque OBA',
    auditor: 'Daniela Suarez',
    timestamp: 'Hoy, 09:15'
  },
  'TV-P5-98414': {
    serial: 'TV-P5-98414',
    model: 'UHD 50" 4K HDR Frameless',
    cell: 'LCD 6 (Línea D-LED)',
    panelLot: 'BOE-UHD-50-LOT88',
    mainboardSN: 'MB-RTK-5012-OBS',
    smpsSN: 'SMPS-3000V-611',
    hipot: '3.0 kV AC · Fuga 0.5 mA (Aprobado)',
    whiteBalance: '6520K D65 (Conforme)',
    audio: 'En Observación (Vibración altavoz derecho)',
    firmware: 'v3.22.01_PROD_RELEASE',
    status: 'En Retrabajo de Celda',
    auditor: 'Facundo Diaz',
    timestamp: 'Hoy, 09:30'
  }
};

// ==========================================
// 3. ESTADO GLOBAL
// ==========================================
const AppState = {
  currentUser: null,
  activeView: 'dashboard',
  selectedTurno: 'todos',
  searchQuery: '',

  // Datos de Líneas y Celdas de Televisores (Planta 5)
  lines: [
    {
      id: 1,
      lineCode: 'CELDA 1',
      modelName: 'OLED 55" 4K Smart Master',
      subfamily: 'OLED Serie 9 - 120Hz',
      turno: 'mañana',
      shiftName: 'Turno 1 - Mañana',
      checklist: { status: 'ok', time: '06:05', auditor: 'R. Quiquinlla' },
      auditoria1: { name: 'Azul Son', time: '07:24', status: 'ok', role: 'Auditor Panel' },
      auditoria2: { name: 'Daniela Suarez', time: '08:15', status: 'ok', role: 'Auditor Main' },
      stations: {
        hipot: { status: 'ok', val: 'OK', tooltip: 'Rigidez 3.0kV: Fuga 0.4mA' },
        openCell: { status: 'ok', val: '0.0', tooltip: 'Panel limpio sin partículas' },
        calibracion: { status: 'alert', val: '234', tooltip: 'Desvío D65 Temp Color (6950K)' },
        audio: { status: 'pending', val: '-', tooltip: 'Pendiente de prueba' },
        burnin: { status: 'pending', val: '-', tooltip: 'Envejecimiento en rack' },
        empaque: { status: 'pending', val: '-', tooltip: 'Caja y accesorios' }
      },
      status: 'Observado',
      statusClass: 'badge-warning',
      fpy: 94.2,
      inspectedUnits: 142,
      defectCount: 2
    },
    {
      id: 2,
      lineCode: 'CELDA 2',
      modelName: 'QLED 65" Quantum Pro 4K',
      subfamily: 'QLED Serie 8 - Local Dimming',
      turno: 'mañana',
      shiftName: 'Turno 1 - Mañana',
      dailyAuditors: [],
      checklist: { status: 'ok', time: '06:00', auditor: 'M. Rios' },
      auditoria1: { name: 'Asignando...', time: '--:--', status: 'pending', role: 'Auditor Panel' },
      auditoria2: { name: 'Asignando...', time: '--:--', status: 'pending', role: 'Auditor Main' },
      stations: {
        hipot: { status: 'ok', val: '0.3', tooltip: 'Fuga 0.3mA - Conforme' },
        openCell: { status: 'ok', val: '0.3', tooltip: 'Backlight uniforme' },
        calibracion: { status: 'ok', val: '0.3', tooltip: 'RGB Gain balanceado' },
        audio: { status: 'ok', val: 'OK', tooltip: 'Dolby Atmos test superado' },
        burnin: { status: 'ok', val: '2h', tooltip: '2 horas completas en rack' },
        empaque: { status: 'ok', val: 'OK', tooltip: 'Accesorios y control OK' }
      },
      status: 'Aprobado',
      statusClass: 'badge-ok',
      fpy: 99.4,
      inspectedUnits: 185,
      defectCount: 0
    },
    {
      id: 3,
      lineCode: 'LCD 6',
      modelName: 'UHD 50" 4K HDR Frameless',
      subfamily: 'D-LED Serie 7 Smart',
      turno: 'mañana',
      shiftName: 'Turno 1 - Mañana',
      dailyAuditors: [{ name: 'María Soledad Romano', email: 'mariasoledad.romano@newsan.com.ar' }],
      checklist: { status: 'ok', time: '06:10', auditor: 'R. Quiquinlla' },
      auditoria1: { name: 'Facundo Diaz', time: '08:02', status: 'ok', role: 'Auditor Panel' },
      auditoria2: { name: 'Daniela Suarez', time: '08:50', status: 'ok', role: 'Auditor Main' },
      stations: {
        hipot: { status: 'ok', val: 'OK', tooltip: 'Prueba dieléctrica OK' },
        openCell: { status: 'ok', val: 'OK', tooltip: 'Sin Mura ni fuga de luz' },
        calibracion: { status: 'ok', val: 'OK', tooltip: 'Patrón RGBW OK' },
        audio: { status: 'warning', val: 'OBS', tooltip: 'Vibración leve en altavoz derecho' },
        burnin: { status: 'ok', val: '2h', tooltip: 'Ciclo térmico superado' },
        empaque: { status: 'pending', val: 'Pend', tooltip: 'Falta lote manuales' }
      },
      status: 'En Proceso',
      statusClass: 'badge-warning',
      fpy: 96.8,
      inspectedUnits: 160,
      defectCount: 1
    },
    {
      id: 4,
      lineCode: 'LCD 8',
      modelName: 'FHD 43" Smart Google TV',
      subfamily: 'Slim D-LED Serie 6',
      turno: 'mañana',
      shiftName: 'Turno 1 - Mañana',
      dailyAuditors: [{ name: 'Cristian Ramírez', email: 'cristian.ramirez@newsan.com.ar' }],
      checklist: { status: 'ok', time: '06:12', auditor: 'E. Gimenez' },
      auditoria1: { name: 'Cristian Ramírez', time: '08:10', status: 'ok', role: 'Auditor Panel' },
      auditoria2: { name: 'Lucas Gomez', time: '08:40', status: 'ok', role: 'Auditor Main' },
      stations: {
        hipot: { status: 'ok', val: 'OK', tooltip: 'Aislamiento 3.0kV superado' },
        openCell: { status: 'ok', val: 'OK', tooltip: 'Lámina polarizada intacta' },
        calibracion: { status: 'ok', val: 'OK', tooltip: 'Gamma 2.2 / 6500K' },
        audio: { status: 'ok', val: 'OK', tooltip: 'Prueba sinusoidal OK' },
        burnin: { status: 'ok', val: '2h', tooltip: 'Terminado' },
        empaque: { status: 'ok', val: 'OK', tooltip: 'Caja sellada y etiquetada' }
      },
      status: 'Aprobado',
      statusClass: 'badge-ok',
      fpy: 98.7,
      inspectedUnits: 210,
      defectCount: 0
    },
    {
      id: 5,
      lineCode: 'CELDA 3',
      modelName: 'Smart HD 32" Compact Display',
      subfamily: 'Entry Level DVB/ATSC',
      turno: 'tarde',
      shiftName: 'Turno 2 - Tarde',
      dailyAuditors: [{ name: 'Maico Arias', email: 'maico.arias@newsan.com.ar' }],
      checklist: { status: 'pending', time: '14:00', auditor: 'Por Iniciar' },
      auditoria1: { name: 'Asignando...', time: '--:--', status: 'pending', role: 'Auditor Panel' },
      auditoria2: { name: 'Asignando...', time: '--:--', status: 'pending', role: 'Auditor Main' },
      stations: {
        hipot: { status: 'pending', val: 'Pend', tooltip: 'Por iniciar turno' },
        openCell: { status: 'pending', val: 'Pend', tooltip: 'Por iniciar turno' },
        calibracion: { status: 'pending', val: 'Pend', tooltip: 'Por iniciar turno' },
        audio: { status: 'pending', val: 'Pend', tooltip: 'Por iniciar turno' },
        burnin: { status: 'pending', val: 'Pend', tooltip: 'Por iniciar turno' },
        empaque: { status: 'pending', val: 'Pend', tooltip: 'Por iniciar turno' }
      },
      status: 'Pendiente',
      statusClass: 'badge-pending',
      fpy: 100.0,
      inspectedUnits: 0,
      defectCount: 0
    },
    {
      id: 6,
      lineCode: 'INSERCIÓN PLACAS',
      modelName: 'MiniLED 75" 8K CineMaster Pro',
      subfamily: 'Flagship Planta 5 - 144Hz VRR',
      turno: 'mañana',
      shiftName: 'Turno 1 - Mañana',
      checklist: { status: 'ok', time: '06:20', auditor: 'R. Quiquinlla' },
      auditoria1: { name: 'Azul Son', time: '08:25', status: 'ok', role: 'Auditor Panel' },
      auditoria2: { name: 'Azul Son', time: '09:05', status: 'ok', role: 'Auditor Main' },
      stations: {
        hipot: { status: 'ok', val: '0.2', tooltip: 'Excelente rigidez' },
        openCell: { status: 'ok', val: '0.1', tooltip: 'Panel MiniLED zero clouding' },
        calibracion: { status: 'ok', val: 'OK', tooltip: 'Calibración óptica CalMAN OK' },
        audio: { status: 'ok', val: 'OK', tooltip: 'Subwoofer integrado OK' },
        burnin: { status: 'ok', val: 'OK', tooltip: 'Ciclo 4 horas' },
        empaque: { status: 'ok', val: 'OK', tooltip: 'Empaque de madera reforzado' }
      },
      status: 'Aprobado',
      statusClass: 'badge-ok',
      fpy: 100.0,
      inspectedUnits: 74,
      defectCount: 0
    },
    {
      id: 7,
      lineCode: 'INSERCIÓN MANUAL & JIG',
      modelName: 'Inserción manual de placas',
      subfamily: 'Ensamble manual · JIG',
      turno: 'mañana',
      shiftName: 'Turno 1 - Mañana',
      dailyAuditors: [{ name: 'María Soledad Romano', email: 'mariasoledad.romano@newsan.com.ar' }],
      checklist: { status: 'pending', time: '--:--', auditor: 'Por iniciar' },
      auditoria1: { name: 'María Soledad Romano', time: '--:--', status: 'pending', role: 'Auditora de línea' },
      auditoria2: { name: 'María Soledad Romano', time: '--:--', status: 'pending', role: 'Auditora de línea' },
      stations: {
        hipot: { status: 'pending', val: 'Pend', tooltip: 'Por iniciar' },
        openCell: { status: 'pending', val: 'Pend', tooltip: 'Por iniciar' },
        calibracion: { status: 'pending', val: 'Pend', tooltip: 'Por iniciar' },
        audio: { status: 'pending', val: 'Pend', tooltip: 'Por iniciar' },
        burnin: { status: 'pending', val: 'Pend', tooltip: 'Por iniciar' },
        empaque: { status: 'pending', val: 'Pend', tooltip: 'Por iniciar' }
      },
      status: 'Pendiente',
      statusClass: 'badge-pending',
      fpy: 100.0,
      inspectedUnits: 0,
      defectCount: 0
    }
  ],

  // Contadores de Formularios de Planta 5 (Reflejando la imagen original)
  formCounts: {
    inicio_turno: 19,
    torque: 815,
    esd: 815,
    cambio_modelo: 19,
    im_diario: 34,
    im_cambio: 19
  },

  // Historial de Registros Recientes de Formularios
  recentFormRecords: [
    {
      id: 1,
      formKey: 'inicio_turno',
      formName: 'Checklist Inicio de Turno',
      line: 'CELDA 1',
      auditor: 'Rober Quiquinlla',
      time: 'Hoy, 06:05',
      result: '5S & Arranque Conforme (100%)',
      status: 'Aprobado',
      statusClass: 'text-emerald-700 bg-emerald-50 border border-emerald-200'
    },
    {
      id: 2,
      formKey: 'torque',
      formName: 'Control de Torque',
      line: 'CELDA 2 (QLED 65")',
      auditor: 'Rober Quiquinlla',
      time: 'Hoy, 07:15',
      result: 'Chasis TV · 4.5 kgf·cm (Tol. ±0.3)',
      status: 'Aprobado',
      statusClass: 'text-emerald-700 bg-emerald-50 border border-emerald-200'
    },
    {
      id: 3,
      formKey: 'esd',
      formName: 'Control de Pulseras ESD',
      line: 'LCD 6 (UHD 50")',
      auditor: 'Daniela Suarez',
      time: 'Hoy, 07:40',
      result: 'Operario L-341 · 1.25 MΩ (Conforme)',
      status: 'Aprobado',
      statusClass: 'text-emerald-700 bg-emerald-50 border border-emerald-200'
    },
    {
      id: 4,
      formKey: 'cambio_modelo',
      formName: 'Checklist Cambio Modelo (RG-0220)',
      line: 'LCD 8 (FHD 43")',
      auditor: 'Rober Quiquinlla',
      time: 'Hoy, 08:10',
      result: 'UHD 50" -> FHD 43" (Golden Sample OK)',
      status: 'Liberado',
      statusClass: 'text-emerald-700 bg-emerald-50 border border-emerald-200'
    },
    {
      id: 5,
      formKey: 'im_diario',
      formName: 'Inicio Producción Diario IM & JIG RG-0772',
      line: 'INSERCIÓN PLACAS',
      auditor: 'Azul Son',
      time: 'Hoy, 08:30',
      result: 'JIG-IM-0772-A · Poka-Yoke OK',
      status: 'Aprobado',
      statusClass: 'text-emerald-700 bg-emerald-50 border border-emerald-200'
    },
    {
      id: 6,
      formKey: 'im_cambio',
      formName: 'Checklist Cambio Modelo I.M & JIG',
      line: 'INSERCIÓN PLACAS',
      auditor: 'Cristian Ramírez',
      time: 'Hoy, 09:00',
      result: 'Máscara MB-RTK-9821 Ajustada',
      status: 'Aprobado',
      statusClass: 'text-emerald-700 bg-emerald-50 border border-emerald-200'
    }
  ]
};

const FALLBACK_MDR_RECORDS = [
  {
    plant: 'Planta 5',
    line: 'CELDA 1',
    mdr: 'MDR-2025-031',
    year: 2025,
    date: '2025-03-10',
    model: 'OLED 55" 4K Smart Master',
    supplier: 'LG Display',
    origin: 'Local',
    detectedBy: 'Azul Son',
    description: 'Panel con brillo no homogéneo en margen izquierdo.',
    status: 'Cuarentena',
    mdrFileUrl: 'https://example.com/mdr-031',
    response8dFileUrl: 'https://example.com/8d-031'
  },
  {
    plant: 'Planta 5',
    line: 'LCD 6',
    mdr: 'MDR-2025-028',
    year: 2025,
    date: '2025-03-08',
    model: 'UHD 50" 4K HDR Frameless',
    supplier: 'BOE',
    origin: 'Importado',
    detectedBy: 'Facundo Diaz',
    description: 'Vibración leve de altavoz derecho durante audio QA.',
    status: 'En análisis',
    mdrFileUrl: 'https://example.com/mdr-028',
    response8dFileUrl: 'https://example.com/8d-028'
  },
  {
    plant: 'Planta 5',
    line: 'CELDA 2',
    mdr: 'MDR-2025-019',
    year: 2025,
    date: '2025-02-22',
    model: 'QLED 65" Quantum Pro 4K',
    supplier: 'CSOT',
    origin: 'Importado',
    detectedBy: 'Daniela Suarez',
    description: 'Diferencia de TCO fuera de rango en módulo backlight.',
    status: 'Resuelto',
    mdrFileUrl: 'https://example.com/mdr-019',
    response8dFileUrl: 'https://example.com/8d-019'
  }
];

const DEMO_USERS = [
  {
    fullName: 'Rober Quiquinlla',
    username: 'rober',
    password: 'CalidadP5!2025',
    role: 'Supervisor de Calidad',
    shift: 'TURNO MAÑANA',
    isAdmin: true,
    initials: 'RQ',
    avatarBg: 'bg-red-600'
  },
  {
    fullName: 'María Soledad Romano',
    username: 'soledad',
    password: 'CalidadP5!2025',
    role: 'Auditor de Calidad',
    shift: 'TURNO MAÑANA',
    isAdmin: false,
    initials: 'SR',
    avatarBg: 'bg-violet-600'
  },
  {
    fullName: 'Daniela Suarez',
    username: 'daniela',
    password: 'CalidadP5!2025',
    role: 'Auditor de Calidad',
    shift: 'TURNO TARDE',
    isAdmin: false,
    initials: 'DS',
    avatarBg: 'bg-emerald-600'
  }
];

function getStoredDemoUsers() {
  try {
    const raw = localStorage.getItem('calidad_p5_demo_users');
    if (!raw) {
      localStorage.setItem('calidad_p5_demo_users', JSON.stringify(DEMO_USERS));
      return [...DEMO_USERS];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : [...DEMO_USERS];
  } catch (error) {
    console.warn('No se pudieron cargar los usuarios demo.', error);
    return [...DEMO_USERS];
  }
}

function setStoredDemoUsers(users) {
  localStorage.setItem('calidad_p5_demo_users', JSON.stringify(users));
}

function readStoredSessionUser() {
  try {
    const raw = localStorage.getItem('calidad_suite_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.username ? parsed : null;
  } catch (error) {
    return null;
  }
}

function writeStoredSessionUser(user) {
  if (!user) return;
  localStorage.setItem('calidad_suite_user', JSON.stringify(user));
}

function clearStoredSessionUser() {
  localStorage.removeItem('calidad_suite_user');
}

function normalizeSessionUser(user) {
  const name = user.fullName || user.username || 'Usuario';
  const initials = (user.initials || name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase()).slice(0, 2) || 'US';
  return {
    ...user,
    username: user.username ? user.username.toLowerCase() : user.username,
    fullName: name,
    initials,
    avatarBg: user.avatarBg || 'bg-red-600'
  };
}

function runMockAuthApi(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};
  const userPathParts = path.split('/').filter(Boolean);

  if (path === '/api/auth/me') {
    const currentUser = readStoredSessionUser();
    if (!currentUser) {
      const error = new Error('Sesión no iniciada');
      error.status = 401;
      throw error;
    }
    return { user: normalizeSessionUser(currentUser) };
  }

  if (path === '/api/auth/login' && method === 'POST') {
    const users = getStoredDemoUsers();
    const found = users.find(user =>
      user.username.toLowerCase() === String(body.username || '').trim().toLowerCase() &&
      user.password === String(body.password || '')
    );
    if (!found) {
      const error = new Error('Usuario o contraseña incorrectos.');
      error.status = 401;
      throw error;
    }
    const normalizedUser = normalizeSessionUser(found);
    writeStoredSessionUser(normalizedUser);
    return { user: normalizedUser };
  }

  if (path === '/api/auth/logout' && method === 'POST') {
    clearStoredSessionUser();
    return { ok: true };
  }

  if (path === '/api/admin/users' && method === 'GET') {
    const currentUser = readStoredSessionUser();
    if (!currentUser || !currentUser.isAdmin) {
      const error = new Error('Sin permisos de administrador.');
      error.status = 403;
      throw error;
    }
    return { users: getStoredDemoUsers().map(user => normalizeSessionUser(user)) };
  }

  if (path === '/api/admin/users' && method === 'POST') {
    const currentUser = readStoredSessionUser();
    if (!currentUser || !currentUser.isAdmin) {
      const error = new Error('Sin permisos de administrador.');
      error.status = 403;
      throw error;
    }
    const users = getStoredDemoUsers();
    const username = String(body.username || '').trim().toLowerCase();
    if (!body.fullName || !username || String(body.password || '').length < 12) {
      const error = new Error('Completá nombre y usuario, y usá una contraseña de al menos 12 caracteres.');
      error.status = 400;
      throw error;
    }
    const duplicate = users.some(user => user.username.toLowerCase() === username);
    if (duplicate) {
      const error = new Error('El nombre de usuario ya existe en el sistema compartido.');
      error.status = 409;
      throw error;
    }
    const newUser = normalizeSessionUser({
      fullName: body.fullName,
      username,
      password: String(body.password),
      role: body.role || 'Personal de Calidad',
      shift: body.shift || 'TURNO MAÑANA',
      isAdmin: Boolean(body.isAdmin),
      initials: (body.fullName || username).split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || username.slice(0, 2).toUpperCase(),
      avatarBg: body.isAdmin ? 'bg-violet-600' : 'bg-red-600'
    });
    users.push(newUser);
    setStoredDemoUsers(users);
    return { ok: true, user: newUser };
  }

  if (path === '/api/admin/users/import-local' && method === 'POST') {
    const currentUser = readStoredSessionUser();
    if (!currentUser || !currentUser.isAdmin) {
      const error = new Error('Sin permisos de administrador.');
      error.status = 403;
      throw error;
    }
    const accounts = Array.isArray(body.accounts) ? body.accounts : [];
    const users = getStoredDemoUsers();
    let imported = 0;
    let skipped = 0;
    accounts.forEach(account => {
      const username = String(account.username || '').trim().toLowerCase();
      const fullName = String(account.fullName || account.name || '').trim();
      const password = String(account.password || '');
      if (!username || !fullName || !password || users.some(user => user.username.toLowerCase() === username)) {
        skipped += 1;
        return;
      }
      users.push(normalizeSessionUser({
        fullName,
        username,
        password,
        role: account.role || 'Personal de Calidad',
        shift: account.shift || 'TURNO MAÑANA',
        isAdmin: Boolean(account.isAdmin),
        initials: fullName.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || username.slice(0, 2).toUpperCase(),
        avatarBg: account.isAdmin ? 'bg-violet-600' : 'bg-red-600'
      }));
      imported += 1;
    });
    setStoredDemoUsers(users);
    return { imported, skipped };
  }

  if (userPathParts[0] === 'api' && userPathParts[1] === 'admin' && userPathParts[2] === 'users' && userPathParts.length === 4) {
    const currentUser = readStoredSessionUser();
    if (!currentUser || !currentUser.isAdmin) {
      const error = new Error('Sin permisos de administrador.');
      error.status = 403;
      throw error;
    }
    const username = decodeURIComponent(userPathParts[3]);
    const users = getStoredDemoUsers();
    const index = users.findIndex(user => user.username.toLowerCase() === username.toLowerCase());

    if (method === 'PATCH') {
      if (index === -1) {
        const error = new Error('Usuario no encontrado.');
        error.status = 404;
        throw error;
      }
      if (String(body.password || '').length < 12) {
        const error = new Error('La nueva contraseña debe tener al menos 12 caracteres.');
        error.status = 400;
        throw error;
      }
      users[index].password = String(body.password);
      setStoredDemoUsers(users);
      return { ok: true };
    }

    if (method === 'DELETE') {
      if (index === -1) {
        const error = new Error('Usuario no encontrado.');
        error.status = 404;
        throw error;
      }
      users.splice(index, 1);
      setStoredDemoUsers(users);
      return { ok: true };
    }
  }

  const error = new Error('Endpoint no disponible en modo offline.');
  error.status = 404;
  throw error;
}

// ==========================================
// 4. INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  restoreDailyFormRecords();
  loadAuditSheetsData();
  restoreLineProductionStatus();
  initAuth();
  initClock();
  initTopNavigation();
  initFormulariosModule();
  initLinesTable();
  initShiftSelector();
  initSearch();
  initSerialSearch();
  initModals();
  initMdrDashboard();
  initTvEventsDashboard();
  initLabelComparison();
  initScreenValidationForm();
  initQualityTeamManagement();
  initScrapScreens();
  updateSummaryMetrics();
});

let scrapScreenRecords = [];
let scrapScreensCurrentPage = 1;
const SCRAP_SCREENS_PAGE_SIZE = 100;
const SCRAP_SCANNER_CLIENT_CACHE_TTL_MS = 5 * 60 * 1000;
let scrapScreensPayload = null;
let scrapScreensRequestId = 0;
let scrapScreensSearchTimer = null;
let scrapScreensRefreshTimer = null;
let scrapScreensSelectedModel = '';
let scrapScreensSelectedRecordId = '';
let scrapScreensSelectedMonth = 0;
let scrapScreensSelectedLots = null;
let scrapScreensAvailableModels = [];
let scrapScreensAvailableLots = [];
let scrapScannerData = null;
let scrapScannerLoadedAt = 0;
let scrapScannerSelectedMonth = null;
let scrapScannerRequestId = 0;
let scrapScannerRefreshTimer = null;

function initScrapScreens() {
  const yearFilter = document.getElementById('scrapScreensYearFilter');
  const lineFilter = document.getElementById('scrapScreensLineFilter');
  const brandFilter = document.getElementById('scrapScreensBrandFilter');
  const searchInput = document.getElementById('scrapScreensSearch');
  const clearFiltersButton = document.getElementById('scrapScreensClearFilters');
  const reloadButton = document.getElementById('scrapScreensReload');
  const previousButton = document.getElementById('scrapScreensPreviousPage');
  const nextButton = document.getElementById('scrapScreensNextPage');
  const clearModelButton = document.getElementById('scrapScreensClearModel');
  const trendYearSelect = document.getElementById('scrapScreensTrendYear');
  const clearMonthButton = document.getElementById('scrapScreensClearMonth');
  const modelSearchInput = document.getElementById('scrapScreensModelSearch');
  const modelMatches = document.getElementById('scrapScreensModelMatches');
  const lotSearchInput = document.getElementById('scrapScreensLotSearch');
  const clearLotButton = document.getElementById('scrapScreensClearLot');
  const rmaButton = document.getElementById('scrapScreensRmaButton');
  const scannerButton = document.getElementById('scrapScreensScannerButton');
  const scannerModal = document.getElementById('scrapScannerModal');
  const scannerCloseButton = document.getElementById('scrapScannerClose');
  const scannerRefreshButton = document.getElementById('scrapScannerRefresh');
  const scannerShowAllMonthsButton = document.getElementById('scrapScannerShowAllMonths');

  const supplierFilter = document.getElementById('scrapScreensSupplierFilter');
  const chassisFilter = document.getElementById('scrapScreensChassisFilter');
  [yearFilter, lineFilter, brandFilter, supplierFilter, chassisFilter].forEach(filter => {
    if (filter) filter.addEventListener('change', () => {
      if (filter === yearFilter) scrapScreensSelectedMonth = 0;
      scrapScreensSelectedLots = null;
      clearScrapScreensRecordSelection();
      scrapScreensCurrentPage = 1;
      loadScrapScreensData();
    });
  });
  if (modelSearchInput) {
    modelSearchInput.addEventListener('input', () => {
      if (scrapScreensSelectedModel && modelSearchInput.value.trim() !== scrapScreensSelectedModel) {
        scrapScreensSelectedModel = '';
        scrapScreensSelectedLots = null;
        scrapScreensSelectedMonth = 0;
        if (lotSearchInput) lotSearchInput.value = '';
        renderScrapLotTrend([]);
        clearScrapScreensRecordSelection();
        scrapScreensCurrentPage = 1;
        loadScrapScreensData();
      }
      renderScrapModelMatches(modelSearchInput.value);
    });
    modelSearchInput.addEventListener('focus', () => {
      if (modelSearchInput.value.trim()) renderScrapModelMatches(modelSearchInput.value);
    });
    modelSearchInput.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        modelMatches?.classList.add('hidden');
        modelSearchInput.setAttribute('aria-expanded', 'false');
      } else if (event.key === 'Enter' && modelMatches?.querySelector('[role="option"]')) {
        event.preventDefault();
        modelMatches.querySelector('[role="option"]').click();
      }
    });
  }
  if (lotSearchInput) lotSearchInput.addEventListener('input', () => {
    renderScrapLotTrend(scrapScreensPayload?.lotTrend || []);
  });
  document.addEventListener('click', event => {
    if (modelSearchInput?.contains(event.target) || modelMatches?.contains(event.target)) return;
    modelMatches?.classList.add('hidden');
    modelSearchInput?.setAttribute('aria-expanded', 'false');
  });
  if (trendYearSelect) trendYearSelect.addEventListener('change', () => {
    if (yearFilter) yearFilter.value = trendYearSelect.value;
    scrapScreensSelectedMonth = 0;
    scrapScreensSelectedLots = null;
    clearScrapScreensRecordSelection();
    scrapScreensCurrentPage = 1;
    loadScrapScreensData();
  });
  if (clearMonthButton) clearMonthButton.addEventListener('click', () => {
    scrapScreensSelectedMonth = 0;
    scrapScreensSelectedLots = null;
    scrapScreensCurrentPage = 1;
    loadScrapScreensData();
  });
  if (clearLotButton) clearLotButton.addEventListener('click', () => {
    scrapScreensSelectedLots = null;
    scrapScreensSelectedMonth = 0;
    if (yearFilter) yearFilter.value = '';
    clearScrapScreensRecordSelection();
    scrapScreensCurrentPage = 1;
    loadScrapScreensData();
  });
  if (searchInput) searchInput.addEventListener('input', () => {
    clearScrapScreensRecordSelection();
    scrapScreensCurrentPage = 1;
    window.clearTimeout(scrapScreensSearchTimer);
    scrapScreensSearchTimer = window.setTimeout(() => loadScrapScreensData(), 250);
  });
  if (clearFiltersButton) clearFiltersButton.addEventListener('click', () => {
    clearScrapScreensRecordSelection();
    if (yearFilter) yearFilter.value = '';
    if (lineFilter) lineFilter.value = '';
    if (brandFilter) brandFilter.value = '';
    if (searchInput) searchInput.value = '';
    if (modelSearchInput) modelSearchInput.value = '';
    if (lotSearchInput) lotSearchInput.value = '';
    modelMatches?.classList.add('hidden');
    scrapScreensSelectedModel = '';
    scrapScreensSelectedMonth = 0;
    scrapScreensSelectedLots = null;
    scrapScreensCurrentPage = 1;
    loadScrapScreensData();
  });
  if (clearModelButton) clearModelButton.addEventListener('click', () => {
    clearScrapScreensRecordSelection();
    scrapScreensSelectedModel = '';
    scrapScreensSelectedLots = null;
    scrapScreensSelectedMonth = 0;
    if (modelSearchInput) modelSearchInput.value = '';
    if (lotSearchInput) lotSearchInput.value = '';
    modelMatches?.classList.add('hidden');
    scrapScreensCurrentPage = 1;
    loadScrapScreensData();
  });
  if (reloadButton) reloadButton.addEventListener('click', () => loadScrapScreensData({ force: true }));
  if (rmaButton) rmaButton.addEventListener('click', () => {
    const record = scrapScreenRecords.find(item => item.recordId === scrapScreensSelectedRecordId);
    showScrapRmaModal(record || null);
  });
  if (scannerButton) scannerButton.addEventListener('click', () => {
    if (!scannerModal) return;
    scannerModal.classList.remove('hidden');
    scannerModal.classList.add('flex');
    loadScrapScannerData();
    scannerCloseButton?.focus();
  });
  const closeScannerModal = () => {
    window.clearTimeout(scrapScannerRefreshTimer);
    scrapScannerRefreshTimer = null;
    scannerModal?.classList.add('hidden');
    scannerModal?.classList.remove('flex');
  };
  if (scannerCloseButton) scannerCloseButton.addEventListener('click', closeScannerModal);
  if (scannerModal) scannerModal.addEventListener('click', event => {
    if (event.target === scannerModal) closeScannerModal();
  });
  if (scannerRefreshButton) scannerRefreshButton.addEventListener('click', () => {
    loadScrapScannerData({ force: true });
  });
  if (scannerShowAllMonthsButton) scannerShowAllMonthsButton.addEventListener('click', () => {
    scrapScannerSelectedMonth = null;
    if (scrapScannerData) {
      renderScrapScannerData(scrapScannerData);
      document.getElementById('scrapScannerMissingDetails')?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  });
  const disposalModal = document.getElementById('scrapDisposalModal');
  const disposalForm = document.getElementById('scrapDisposalForm');
  const closeDisposalModal = () => disposalModal?.classList.add('hidden');
  document.getElementById('scrapDisposalClose')?.addEventListener('click', closeDisposalModal);
  if (disposalModal) disposalModal.addEventListener('click', event => {
    if (event.target === disposalModal) disposalModal.classList.add('hidden');
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeDisposalModal();
      closeScannerModal();
    }
  });
  if (disposalForm) disposalForm.addEventListener('submit', submitScrapRma);
  if (previousButton) previousButton.addEventListener('click', () => {
    clearScrapScreensRecordSelection();
    scrapScreensCurrentPage = Math.max(1, scrapScreensCurrentPage - 1);
    loadScrapScreensData();
  });
  if (nextButton) nextButton.addEventListener('click', () => {
    clearScrapScreensRecordSelection();
    scrapScreensCurrentPage += 1;
    loadScrapScreensData();
  });

}

function clearScrapScreensRecordSelection() {
  scrapScreensSelectedRecordId = '';
  document.querySelectorAll('#scrapScreensResults tr[data-record-id]').forEach(row => {
    row.setAttribute('aria-selected', 'false');
    row.classList.remove('bg-sky-50');
  });
  const rmaButton = document.getElementById('scrapScreensRmaButton');
  if (rmaButton) rmaButton.disabled = false;
}

async function loadScrapScannerData(options = {}) {
  const status = document.getElementById('scrapScannerStatus');
  const errorBox = document.getElementById('scrapScannerError');
  const refreshButton = document.getElementById('scrapScannerRefresh');
  if (!status || !errorBox) return;

  if (
    !options.skipClientCache &&
    !options.force &&
    scrapScannerData &&
    Date.now() - scrapScannerLoadedAt < SCRAP_SCANNER_CLIENT_CACHE_TTL_MS
  ) {
    renderScrapScannerData(scrapScannerData);
    status.textContent = `Datos en caché · ${formatScrapScannerDate(scrapScannerData.today)}`;
    errorBox.classList.add('hidden');
    return;
  }

  window.clearTimeout(scrapScannerRefreshTimer);
  scrapScannerRefreshTimer = null;
  const requestId = ++scrapScannerRequestId;
  const parameters = new URLSearchParams();
  if (options.force) parameters.set('refresh', '1');
  status.textContent = options.force ? 'Actualizando datos de la planilla...' : 'Cargando datos de la planilla...';
  errorBox.classList.add('hidden');
  if (refreshButton && options.force) refreshButton.disabled = true;

  try {
    const query = parameters.toString();
    const response = await fetch(`/api/scrap-screens/scanner${query ? `?${query}` : ''}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`El servidor respondió ${response.status} ${response.statusText}.`);
    }
    const payload = await response.json();
    const validString = value => typeof value === 'string';
    if (payload.loading === true) {
      if (requestId !== scrapScannerRequestId) return;
      status.textContent = 'Preparando datos del scanner en segundo plano...';
      errorBox.classList.add('hidden');
      scheduleScrapScannerRefresh(requestId);
      return;
    }
    if (
      !Array.isArray(payload.proofOfLifeLocations) ||
      !Array.isArray(payload.unregisteredScans)
    ) {
      throw new Error(
        'El servidor del Scanner está desactualizado. Cerrá y volvé a iniciar server.py; después, actualizá este modal.'
      );
    }
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(payload.today) ||
      !Array.isArray(payload.scannedToday) ||
      !payload.scannedToday.every(record =>
        record &&
        validString(record.serial) &&
        validString(record.model) &&
        validString(record.op) &&
        validString(record.lpn) &&
        validString(record.scannedAt)
      ) ||
      !Number.isInteger(payload.bbddToday) ||
      !Number.isInteger(payload.receivedToday) ||
      !Number.isInteger(payload.pendingToday) ||
      payload.pendingToday !== payload.bbddToday - payload.receivedToday ||
      !Array.isArray(payload.pendingTodayRecords) ||
      payload.pendingToday !== payload.pendingTodayRecords.length ||
      !payload.pendingTodayRecords.every(record =>
        record &&
        validString(record.serial) &&
        validString(record.model)
      ) ||
      !Number.isInteger(payload.pendingTotal) ||
      !Array.isArray(payload.pendingByMonth) ||
      payload.pendingByMonth.length !== 12 ||
      !payload.pendingByMonth.every((item, index) =>
        item &&
        item.month === index + 1 &&
        validString(item.name) &&
        Number.isInteger(item.bbddCount) &&
        Number.isInteger(item.scannedCount) &&
        Number.isInteger(item.receivedCount) &&
        Number.isInteger(item.pendingCount) &&
        item.bbddCount >= item.receivedCount &&
        item.receivedCount >= 0 &&
        item.pendingCount === item.bbddCount - item.receivedCount
      ) ||
      !Array.isArray(payload.pendingRecords) ||
      !payload.pendingRecords.every(record =>
        record &&
        Number.isInteger(record.month) &&
        record.month >= 1 &&
        record.month <= 12 &&
        validString(record.serial) &&
        validString(record.model) &&
        validString(record.date)
      ) ||
      payload.pendingTotal !== payload.pendingRecords.length ||
      payload.pendingTotal !== payload.pendingByMonth.reduce((total, item) => total + item.pendingCount, 0) ||
      !payload.proofOfLifeLocations.every(record =>
        record &&
        validString(record.serial) &&
        validString(record.model) &&
        validString(record.scannedAt) &&
        validString(record.location) &&
        /prueba\s+de\s+vida/i.test(record.location)
      ) ||
      !payload.unregisteredScans.every(record =>
        record &&
        validString(record.serial) &&
        validString(record.model) &&
        validString(record.modelSource) &&
        validString(record.scannedAt)
      ) ||
      typeof payload.refreshing !== 'boolean' ||
      typeof payload.refreshError !== 'string' ||
      !Number.isFinite(payload.loadedAt)
    ) {
      throw new Error('La respuesta del scanner no tiene el formato esperado.');
    }
    if (requestId !== scrapScannerRequestId) return;

    scrapScannerData = payload;
    if (!payload.refreshing) scrapScannerLoadedAt = Date.now();
    renderScrapScannerData(payload);
    if (payload.refreshError) {
      status.textContent = `Mostrando datos anteriores · ${formatScrapScannerDate(payload.today)}`;
      errorBox.textContent = `No se pudieron actualizar los datos: ${payload.refreshError}`;
      errorBox.classList.remove('hidden');
    } else if (payload.refreshing) {
      status.textContent = `Mostrando datos disponibles · actualizando planillas en segundo plano`;
      scheduleScrapScannerRefresh(requestId);
    } else {
      status.textContent = `Datos actualizados · ${formatScrapScannerDate(payload.today)}`;
    }
  } catch (error) {
    if (requestId !== scrapScannerRequestId) return;
    console.error('No se pudieron cargar los datos del scanner.', error);
    status.textContent = 'No se pudieron actualizar los datos del scanner.';
    errorBox.textContent = error instanceof Error ? error.message : 'Error desconocido al cargar la planilla.';
    errorBox.classList.remove('hidden');
  } finally {
    if (requestId === scrapScannerRequestId && refreshButton) refreshButton.disabled = false;
  }
}

function scheduleScrapScannerRefresh(requestId) {
  const modal = document.getElementById('scrapScannerModal');
  if (!modal || modal.classList.contains('hidden')) return;
  window.clearTimeout(scrapScannerRefreshTimer);
  scrapScannerRefreshTimer = window.setTimeout(() => {
    if (requestId === scrapScannerRequestId) {
      loadScrapScannerData({ skipClientCache: true });
    }
  }, 1200);
}

function formatScrapScannerDate(value) {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function createScrapScannerCell(value, className = '') {
  const cell = document.createElement('td');
  cell.className = `px-3 py-2 align-top text-slate-700 ${className}`.trim();
  cell.textContent = value || '—';
  return cell;
}

function appendScrapScannerEmptyRow(body, colspan, message) {
  const row = document.createElement('tr');
  const cell = document.createElement('td');
  cell.colSpan = colspan;
  cell.className = 'px-3 py-8 text-center text-slate-400';
  cell.textContent = message;
  row.appendChild(cell);
  body.appendChild(row);
}

function renderScrapScannerData(payload) {
  const bbddTodayCount = document.getElementById('scrapScannerBbddTodayCount');
  const todayCount = document.getElementById('scrapScannerTodayCount');
  const todayDate = document.getElementById('scrapScannerTodayDate');
  const todayRecords = document.getElementById('scrapScannerTodayRecords');
  const pendingTodayCount = document.getElementById('scrapScannerPendingTodayCount');
  const pendingTodayRecords = document.getElementById('scrapScannerPendingTodayRecords');
  const monthlyContainer = document.getElementById('scrapScannerMissingMonths');
  const missingRecords = document.getElementById('scrapScannerMissingRecords');
  const monthLabel = document.getElementById('scrapScannerMissingMonthLabel');
  const pendingTotalCount = document.getElementById('scrapScannerPendingTotalCount');
  const proofOfLifeRecords = document.getElementById('scrapScannerProofOfLifeRecords');
  const unregisteredRecords = document.getElementById('scrapScannerUnregisteredRecords');
  const unregisteredCount = document.getElementById('scrapScannerUnregisteredCount');
  if (
    !bbddTodayCount ||
    !todayCount ||
    !todayDate ||
    !todayRecords ||
    !pendingTodayCount ||
    !pendingTodayRecords ||
    !monthlyContainer ||
    !missingRecords ||
    !pendingTotalCount ||
    !proofOfLifeRecords ||
    !unregisteredRecords ||
    !unregisteredCount
  ) return;

  bbddTodayCount.textContent = payload.bbddToday.toLocaleString('es-AR');
  todayCount.textContent = payload.receivedToday.toLocaleString('es-AR');
  todayDate.textContent = `RMA de ${formatScrapScannerDate(payload.today)} · cruce por serial (incluye escaneos previos)`;
  pendingTodayCount.textContent = payload.pendingToday.toLocaleString('es-AR');
  pendingTotalCount.textContent = payload.pendingTotal.toLocaleString('es-AR');
  todayRecords.replaceChildren();
  if (!payload.scannedToday.length) {
    appendScrapScannerEmptyRow(todayRecords, 5, 'Todavía no hay pantallas escaneadas hoy.');
  } else {
    payload.scannedToday.forEach(record => {
      const row = document.createElement('tr');
      row.append(
        createScrapScannerCell(record.scannedAt, 'whitespace-nowrap font-semibold'),
        createScrapScannerCell(record.serial, 'font-mono'),
        createScrapScannerCell(record.model),
        createScrapScannerCell(record.op, 'whitespace-nowrap font-mono select-all'),
        createScrapScannerCell(record.lpn, 'font-mono')
      );
      todayRecords.appendChild(row);
    });
  }

  pendingTodayRecords.replaceChildren();
  if (!payload.pendingTodayRecords.length) {
    appendScrapScannerEmptyRow(pendingTodayRecords, 2, 'No quedan pantallas de BBDD pendientes de traer hoy.');
  } else {
    payload.pendingTodayRecords.forEach(record => {
      const row = document.createElement('tr');
      row.append(
        createScrapScannerCell(record.serial, 'font-mono'),
        createScrapScannerCell(record.model)
      );
      pendingTodayRecords.appendChild(row);
    });
  }

  monthlyContainer.replaceChildren();
  payload.pendingByMonth.forEach(item => {
    const button = document.createElement('button');
    const selected = scrapScannerSelectedMonth === item.month;
    button.type = 'button';
    button.className = `rounded-lg border px-2 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-amber-300 ${
      selected ? 'border-amber-300 bg-amber-50' : 'border-slate-100 bg-slate-50 hover:border-amber-200 hover:bg-amber-50/60'
    }`;
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-label', `${item.name}: ${item.pendingCount} pantallas pendientes de traer`);
    const name = document.createElement('span');
    name.className = 'block truncate text-[9px] font-semibold text-slate-500';
    name.textContent = item.name.slice(0, 3);
    const count = document.createElement('span');
    count.className = `mt-1 block text-sm font-black ${item.pendingCount ? 'text-amber-800' : 'text-slate-400'}`;
    count.textContent = item.pendingCount.toLocaleString('es-AR');
    button.append(name, count);
    button.addEventListener('click', () => {
      scrapScannerSelectedMonth = selected ? null : item.month;
      renderScrapScannerData(payload);
      document.getElementById('scrapScannerMissingDetails')?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    });
    monthlyContainer.appendChild(button);
  });

  const selectedMissingRecords = payload.pendingRecords.filter(record =>
    scrapScannerSelectedMonth === null || record.month === scrapScannerSelectedMonth
  );
  if (monthLabel) {
    const selectedMonth = payload.pendingByMonth.find(item => item.month === scrapScannerSelectedMonth);
    const recordCount = selectedMissingRecords.length.toLocaleString('es-AR');
    monthLabel.textContent = selectedMonth
      ? `${selectedMonth.name} · ${recordCount} pendientes`
      : `Todos los meses de 2026 · ${recordCount} pendientes`;
  }
  missingRecords.replaceChildren();
  if (!selectedMissingRecords.length) {
    appendScrapScannerEmptyRow(missingRecords, 4, 'No hay pantallas pendientes de traer para el período seleccionado.');
  } else {
    selectedMissingRecords.forEach(record => {
      const row = document.createElement('tr');
      const monthName = payload.pendingByMonth.find(item => item.month === record.month)?.name || '';
      row.append(
        createScrapScannerCell(monthName),
        createScrapScannerCell(record.date, 'whitespace-nowrap'),
        createScrapScannerCell(record.serial, 'font-mono'),
        createScrapScannerCell(record.model)
      );
      missingRecords.appendChild(row);
    });
  }

  unregisteredCount.textContent = payload.unregisteredScans.length.toLocaleString('es-AR');
  unregisteredRecords.replaceChildren();
  if (!payload.unregisteredScans.length) {
    appendScrapScannerEmptyRow(unregisteredRecords, 4, 'No hay seriales escaneados fuera de la BBDD de RMA.');
  } else {
    payload.unregisteredScans.forEach(record => {
      const row = document.createElement('tr');
      row.append(
        createScrapScannerCell(record.scannedAt, 'whitespace-nowrap'),
        createScrapScannerCell(record.serial, 'font-mono'),
        createScrapScannerCell(record.model || 'Modelo no identificado', record.model ? '' : 'text-slate-400'),
        createScrapScannerCell(record.modelSource, 'text-slate-500')
      );
      unregisteredRecords.appendChild(row);
    });
  }

  proofOfLifeRecords.replaceChildren();
  if (!payload.proofOfLifeLocations.length) {
    appendScrapScannerEmptyRow(proofOfLifeRecords, 4, 'No hay ubicaciones con descripción “Prueba de vida”.');
  } else {
    payload.proofOfLifeLocations.forEach(record => {
      const row = document.createElement('tr');
      row.append(
        createScrapScannerCell(record.scannedAt, 'whitespace-nowrap'),
        createScrapScannerCell(record.serial, 'font-mono'),
        createScrapScannerCell(record.model),
        createScrapScannerCell(record.location)
      );
      proofOfLifeRecords.appendChild(row);
    });
  }
}

function selectScrapScreensRecord(recordId) {
  scrapScreensSelectedRecordId = recordId;
  document.querySelectorAll('#scrapScreensResults tr[data-record-id]').forEach(row => {
    const selected = row.dataset.recordId === recordId;
    row.setAttribute('aria-selected', String(selected));
    row.classList.toggle('bg-sky-50', selected);
  });
  const rmaButton = document.getElementById('scrapScreensRmaButton');
  if (rmaButton) rmaButton.disabled = false;
}

async function loadScrapScreensData(options = {}) {
  const status = document.getElementById('scrapScreensStatus');
  const error = document.getElementById('scrapScreensError');
  const results = document.getElementById('scrapScreensResults');
  const reloadButton = document.getElementById('scrapScreensReload');
  if (!status || !error || !results) return;

  window.clearTimeout(scrapScreensRefreshTimer);
  scrapScreensRefreshTimer = null;
  const requestId = ++scrapScreensRequestId;
  const parameters = new URLSearchParams({
    page: String(scrapScreensCurrentPage),
    pageSize: String(SCRAP_SCREENS_PAGE_SIZE)
  });
  const year = document.getElementById('scrapScreensYearFilter')?.value || '';
  const line = document.getElementById('scrapScreensLineFilter')?.value || '';
  const brand = document.getElementById('scrapScreensBrandFilter')?.value || '';
  const supplier = document.getElementById('scrapScreensSupplierFilter')?.value || '';
  const chassis = document.getElementById('scrapScreensChassisFilter')?.value || '';
  const model = scrapScreensSelectedModel.trim();
  const query = document.getElementById('scrapScreensSearch')?.value.trim() || '';
  if (year) parameters.set('year', year);
  if (line) parameters.set('line', line);
  if (brand) parameters.set('brand', brand);
  if (supplier) parameters.set('supplier', supplier);
  if (chassis) parameters.set('chassis', chassis);
  if (model) parameters.set('model', model);
  if (scrapScreensSelectedMonth) parameters.set('month', String(scrapScreensSelectedMonth));
  if (scrapScreensSelectedLots !== null) {
    parameters.set('lots', JSON.stringify(scrapScreensSelectedLots));
  }
  if (query) parameters.set('q', query);
  if (options.force) parameters.set('refresh', '1');

  status.textContent = options.force ? 'Actualizando desde Google Sheets...' : 'Cargando registros...';
  error.classList.add('hidden');
  if (reloadButton && options.force) reloadButton.disabled = true;
  const previousButton = document.getElementById('scrapScreensPreviousPage');
  const nextButton = document.getElementById('scrapScreensNextPage');
  if (previousButton) previousButton.disabled = true;
  if (nextButton) nextButton.disabled = true;
  try {
    const response = await fetch(`/api/scrap-screens?${parameters.toString()}`, { cache: 'no-store' });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('El servidor activo todavía no reconoce esta vista. Cerrá el servidor anterior y volvé a iniciar server.py.');
      }
      throw new Error(`El servidor respondió ${response.status} ${response.statusText}.`);
    }
    const payload = await response.json();
    if (
      !Array.isArray(payload.records) ||
      !Number.isInteger(payload.total) ||
      !payload.summary ||
      !payload.filters ||
      !Array.isArray(payload.trend) ||
      !Array.isArray(payload.monthlyTrend) ||
      !Array.isArray(payload.lotTrend) ||
      payload.lotTrend.some(item =>
        typeof item.lot !== 'string' ||
        !item.lot ||
        !(Number.isInteger(item.year) || item.year === null) ||
        !Number.isFinite(item.origin) ||
        !Number.isFinite(item.process)
      ) ||
      payload.monthlyTrend.some(item =>
        !Number.isInteger(item.year) ||
        !Number.isInteger(item.month) ||
        item.month < 1 ||
        item.month > 12 ||
        !Number.isFinite(item.origin) ||
        !Number.isFinite(item.process)
      ) ||
      payload.records.some(record =>
        typeof record.model !== 'string' ||
        typeof record.partNumber !== 'string' ||
        typeof record.line !== 'string' ||
        typeof record.brand !== 'string' ||
        !Array.isArray(record.photos) ||
        record.photos.some(photo => typeof photo.label !== 'string' || typeof photo.url !== 'string')
      ) ||
      !payload.topModels ||
      !['origin', 'process'].every(category =>
        Array.isArray(payload.topModels[category]) &&
        payload.topModels[category].every(item =>
          typeof item.model === 'string' && Number.isFinite(item.count)
        )
      ) ||
      typeof payload.selectedModel !== 'string' ||
      typeof payload.selectedLot !== 'string' ||
      typeof payload.lotFilter !== 'boolean' ||
      !Array.isArray(payload.selectedLots) ||
      payload.selectedLots.some(item =>
        !item ||
        typeof item.lot !== 'string' ||
        !(Number.isInteger(item.year) || item.year === null)
      ) ||
      !Array.isArray(payload.filters.models) ||
      payload.filters.models.some(model => typeof model !== 'string') ||
      typeof payload.refreshing !== 'boolean' ||
      typeof payload.refreshError !== 'string' ||
      typeof payload.isLive !== 'boolean'
    ) {
      throw new Error('La respuesta de la base de scrap no tiene el formato esperado.');
    }
    if (requestId !== scrapScreensRequestId) return;

    scrapScreenRecords = payload.records;
    scrapScreensPayload = payload;
    populateScrapScreensFilters(payload.filters);
    renderScrapScreens();
    const fetchedAt = Number(payload.fetchedAt);
    const updatedAt = new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(fetchedAt ? new Date(fetchedAt * 1000) : new Date());
    if (payload.refreshing) {
      const source = payload.isLive ? 'Mostrando la última sincronización' : 'Mostrando copia local hasta 2025';
      status.textContent = `${source} · Actualizando Google Sheets... · ${payload.total.toLocaleString('es-AR')} registros`;
      scrapScreensRefreshTimer = window.setTimeout(() => {
        if (requestId === scrapScreensRequestId) loadScrapScreensData();
      }, 2000);
    } else if (payload.refreshError) {
      status.textContent = `${payload.isLive ? 'Última sincronización' : 'Copia local hasta 2025'} · ${updatedAt} · ${payload.total.toLocaleString('es-AR')} registros`;
      error.textContent = payload.refreshError;
      error.classList.remove('hidden');
    } else {
      status.textContent = `Datos de Sheets · ${updatedAt} · ${payload.total.toLocaleString('es-AR')} registros`;
    }
  } catch (loadError) {
    if (requestId !== scrapScreensRequestId) return;
    console.error('No se pudieron cargar los datos de scrap de pantallas.', loadError);
    status.textContent = 'No se pudo actualizar la base de scrap.';
    error.textContent = loadError.message.includes('server.py')
      ? loadError.message
      : `No se pudieron cargar los registros desde Google Sheets. ${loadError.message} Verificá el acceso y que la planilla siga compartida.`;
    error.classList.remove('hidden');
    scrapScreenRecords = [];
    scrapScreensPayload = null;
    renderScrapScreens();
    results.replaceChildren();
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 14;
    cell.className = 'px-4 py-10 text-center text-red-600';
    cell.textContent = 'No se pudieron cargar los registros de scrap.';
    row.appendChild(cell);
    results.appendChild(row);
  } finally {
    if (requestId === scrapScreensRequestId && reloadButton) reloadButton.disabled = false;
  }
}

function populateScrapScreensFilters(filters) {
  const yearFilter = document.getElementById('scrapScreensYearFilter');
  const lineFilter = document.getElementById('scrapScreensLineFilter');
  const brandFilter = document.getElementById('scrapScreensBrandFilter');
  const modelSearchInput = document.getElementById('scrapScreensModelSearch');
  if (!yearFilter || !lineFilter || !brandFilter || !modelSearchInput || !filters) return;

  const selectedYear = yearFilter.value;
  const selectedLine = lineFilter.value;
  const selectedBrand = brandFilter.value;
  const selectedModel = scrapScreensSelectedModel;

  yearFilter.replaceChildren(new Option('Todos los años', ''));
  const years = [...new Set([...filters.years.filter(y => Number(y) >= 2024), 2024, 2025, 2026])];
  years.sort((left, right) => right - left);
  years.forEach(year => yearFilter.add(new Option(String(year), String(year))));
  lineFilter.replaceChildren(new Option('Todas las líneas', ''));
  filters.lines.forEach(line => lineFilter.add(new Option(line, line)));
  brandFilter.replaceChildren(new Option('Todas las marcas', ''));
  filters.brands.forEach(brand => brandFilter.add(new Option(brand, brand)));
  scrapScreensAvailableModels = filters.models;
  if (years.some(year => String(year) === selectedYear)) yearFilter.value = selectedYear;
  if (filters.lines.includes(selectedLine)) lineFilter.value = selectedLine;
  if (filters.brands.includes(selectedBrand)) brandFilter.value = selectedBrand;
  if (selectedModel && filters.models.includes(selectedModel)) modelSearchInput.value = selectedModel;

  const supplierFilter = document.getElementById('scrapScreensSupplierFilter');
  if (supplierFilter && Array.isArray(filters.suppliers)) {
    const selectedSupplier = supplierFilter.value;
    supplierFilter.replaceChildren(new Option('Todos los proveedores', ''));
    filters.suppliers.forEach(sup => supplierFilter.add(new Option(sup, sup)));
    if (filters.suppliers.includes(selectedSupplier)) supplierFilter.value = selectedSupplier;
  }

  const chassisFilter = document.getElementById('scrapScreensChassisFilter');
  if (chassisFilter && Array.isArray(filters.chassis)) {
    const selectedChassis = chassisFilter.value;
    chassisFilter.replaceChildren(new Option('Todos los chasis', ''));
    filters.chassis.forEach(chas => chassisFilter.add(new Option(chas, chas)));
    if (filters.chassis.includes(selectedChassis)) chassisFilter.value = selectedChassis;
  }
}

function renderScrapModelMatches(query) {
  const input = document.getElementById('scrapScreensModelSearch');
  const results = document.getElementById('scrapScreensModelMatches');
  if (!input || !results) return;
  results.replaceChildren();

  const normalize = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-AR')
    .trim();
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    results.classList.add('hidden');
    input.setAttribute('aria-expanded', 'false');
    return;
  }

  const matches = scrapScreensAvailableModels
    .filter(model => normalize(model).includes(normalizedQuery))
    .sort((left, right) => {
      const leftMatch = normalize(left);
      const rightMatch = normalize(right);
      const leftRank = leftMatch === normalizedQuery ? 0 : leftMatch.startsWith(normalizedQuery) ? 1 : 2;
      const rightRank = rightMatch === normalizedQuery ? 0 : rightMatch.startsWith(normalizedQuery) ? 1 : 2;
      return leftRank - rightRank || left.localeCompare(right, 'es-AR');
    })
    .slice(0, 20);
  if (!matches.length) {
    const empty = document.createElement('p');
    empty.className = 'px-3 py-2 text-xs text-slate-400';
    empty.textContent = 'No hay modelos coincidentes.';
    results.appendChild(empty);
  } else {
    matches.forEach(model => {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'block w-full truncate rounded-md px-3 py-2 text-left text-xs text-slate-700 transition hover:bg-sky-50 hover:text-sky-800';
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', String(scrapScreensSelectedModel === model));
      option.textContent = model;
      option.addEventListener('click', () => selectScrapScreensModel(model));
      results.appendChild(option);
    });
  }
  results.classList.remove('hidden');
  input.setAttribute('aria-expanded', 'true');
}

function selectScrapScreensModel(model) {
  const input = document.getElementById('scrapScreensModelSearch');
  const lotSearch = document.getElementById('scrapScreensLotSearch');
  const results = document.getElementById('scrapScreensModelMatches');
  scrapScreensSelectedModel = model;
  scrapScreensSelectedLots = null;
  scrapScreensSelectedMonth = 0;
  if (lotSearch) lotSearch.value = '';
  if (input) input.value = model;
  results?.classList.add('hidden');
  input?.setAttribute('aria-expanded', 'false');
  clearScrapScreensRecordSelection();
  scrapScreensCurrentPage = 1;
  loadScrapScreensData();
}

function renderScrapScreenLpnCell(lpn) {
  const cell = document.createElement('td');
  cell.className = 'px-3 py-3 align-top whitespace-nowrap font-mono';
  const val = String(lpn || '').trim();
  if (val && val !== '-' && val !== '—') {
    cell.className += ' text-slate-800 font-semibold';
    cell.textContent = val;
  } else {
    cell.innerHTML = '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-300 font-black text-[10px] shadow-2xs">⚠️ Sin LPN</span>';
  }
  return cell;
}

function createScrapScreenCell(value, className = '') {
  const cell = document.createElement('td');
  cell.className = `px-3 py-3 align-top ${className}`.trim();
  cell.textContent = value === null || value === undefined || value === '' ? '—' : String(value);
  return cell;
}

function renderScrapScreenPhotos(photos) {
  const cell = document.createElement('td');
  cell.className = 'px-3 py-3 align-top';
  if (!photos.length) {
    cell.textContent = '—';
    return cell;
  }

  const links = document.createElement('div');
  links.className = 'flex min-w-[180px] flex-wrap gap-1';
  photos.forEach(photo => {
    let photoUrl;
    try {
      photoUrl = new URL(photo.url);
    } catch (error) {
      return;
    }
    if (photoUrl.protocol !== 'https:') return;

    const link = document.createElement('a');
    link.href = photoUrl.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.title = photo.label;
    link.textContent = photo.label.replace(/^FOTO\s*/i, '').slice(0, 18);
    link.className = 'rounded-md border border-sky-100 bg-sky-50 px-2 py-1 text-[9px] font-semibold text-sky-700 hover:bg-sky-100';
    links.appendChild(link);
  });

  if (!links.childElementCount) {
    cell.textContent = 'Sin enlaces válidos';
    return cell;
  }
  cell.appendChild(links);
  return cell;
}

function renderScrapScreens() {
  const results = document.getElementById('scrapScreensResults');
  const totalLabel = document.getElementById('scrapScreensTotal');
  const originLabel = document.getElementById('scrapScreensOrigin');
  const processLabel = document.getElementById('scrapScreensProcess');
  const ebsLabel = document.getElementById('scrapScreensEbsPending');
  const pageInfo = document.getElementById('scrapScreensPageInfo');
  const pageNumber = document.getElementById('scrapScreensPageNumber');
  const previousButton = document.getElementById('scrapScreensPreviousPage');
  const nextButton = document.getElementById('scrapScreensNextPage');
  const rmaButton = document.getElementById('scrapScreensRmaButton');
  const activeModel = document.getElementById('scrapScreensActiveModel');
  const activeModelName = document.getElementById('scrapScreensActiveModelName');
  if (!results) return;

  const payload = scrapScreensPayload;
  const summary = payload?.summary || { total: 0, origin: 0, process: 0, ebsPending: 0 };
  const total = payload?.total || 0;
  const pageCount = Math.max(1, Math.ceil(total / SCRAP_SCREENS_PAGE_SIZE));
  scrapScreensCurrentPage = Math.min(scrapScreensCurrentPage, pageCount);
  const start = (scrapScreensCurrentPage - 1) * SCRAP_SCREENS_PAGE_SIZE;
  const visibleRecords = scrapScreenRecords;
  if (!visibleRecords.some(record => record.recordId === scrapScreensSelectedRecordId)) {
    clearScrapScreensRecordSelection();
  }

  if (totalLabel) totalLabel.textContent = summary.total.toLocaleString('es-AR');
  if (originLabel) originLabel.textContent = summary.origin.toLocaleString('es-AR');
  if (processLabel) processLabel.textContent = summary.process.toLocaleString('es-AR');
  if (ebsLabel) ebsLabel.textContent = summary.ebsPending.toLocaleString('es-AR');
  const selectedModel = payload?.selectedModel || '';
  scrapScreensSelectedModel = selectedModel;
  scrapScreensSelectedLots = payload?.lotFilter ? payload.selectedLots : null;
  if (activeModel) {
    activeModel.classList.toggle('hidden', !selectedModel);
    activeModel.classList.toggle('flex', Boolean(selectedModel));
  }
  if (activeModelName) activeModelName.textContent = selectedModel;
  if (pageInfo) {
    pageInfo.textContent = total
      ? `Mostrando ${start + 1}–${Math.min(start + visibleRecords.length, total)} de ${total.toLocaleString('es-AR')}`
      : '0 registros';
  }
  if (pageNumber) pageNumber.textContent = `Página ${scrapScreensCurrentPage} de ${pageCount}`;
  if (previousButton) previousButton.disabled = scrapScreensCurrentPage <= 1;
  if (nextButton) nextButton.disabled = scrapScreensCurrentPage >= pageCount;
  renderScrapTrendChart(payload?.trend || []);
  renderScrapMonthlyTrend(payload?.monthlyTrend || [], payload?.filters?.years || []);
  renderScrapLotTrend(payload?.lotTrend || []);
  renderScrapSupplierChassisTable(payload?.supplierChassisTrend || []);
  const activeMonth = document.getElementById('scrapScreensActiveMonth');
  const activeMonthName = document.getElementById('scrapScreensActiveMonthName');
  const selectedYear = document.getElementById('scrapScreensYearFilter')?.value || '';
  if (activeMonth) {
    activeMonth.classList.toggle('hidden', !scrapScreensSelectedMonth);
    activeMonth.classList.toggle('flex', Boolean(scrapScreensSelectedMonth));
  }
  if (activeMonthName) {
    const monthLabels = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    activeMonthName.textContent = `${monthLabels[scrapScreensSelectedMonth - 1]} ${selectedYear}`;
  }
  const activeLot = document.getElementById('scrapScreensActiveLot');
  const activeLotName = document.getElementById('scrapScreensActiveLotName');
  const lotCount = payload?.lotTrend?.length || 0;
  const selectedLotCount = scrapScreensSelectedLots === null
    ? lotCount
    : scrapScreensSelectedLots.length;
  if (activeLot) {
    const hasLotFilter = scrapScreensSelectedLots !== null;
    activeLot.classList.toggle('hidden', !hasLotFilter);
    activeLot.classList.toggle('flex', hasLotFilter);
  }
  if (activeLotName) activeLotName.textContent = `${selectedLotCount} de ${lotCount} lotes`;
  renderScrapTopModelsChart('scrapScreensOriginTop', payload?.topModels?.origin || [], 'bg-sky-500');
  renderScrapTopModelsChart('scrapScreensProcessTop', payload?.topModels?.process || [], 'bg-orange-500');
  results.replaceChildren();

  if (visibleRecords.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 14;
    cell.className = 'px-4 py-10 text-center text-slate-400';
    cell.textContent = 'No hay registros que coincidan con los filtros.';
    row.appendChild(cell);
    results.appendChild(row);
    return;
  }

  visibleRecords.forEach(record => {
    const row = document.createElement('tr');
    const selected = record.recordId === scrapScreensSelectedRecordId;
    row.className = 'cursor-pointer align-top transition-colors hover:bg-slate-50';
    row.dataset.recordId = record.recordId;
    row.tabIndex = 0;
    row.setAttribute('aria-selected', String(selected));
    row.setAttribute('aria-label', `Seleccionar ${record.model || 'registro'} para RMA`);
    row.classList.toggle('bg-sky-50', selected);
    row.addEventListener('click', event => {
      if (event.target.closest('a, button')) return;
      selectScrapScreensRecord(record.recordId);
    });
    row.addEventListener('keydown', event => {
      if (event.target !== row || (event.key !== 'Enter' && event.key !== ' ')) return;
      event.preventDefault();
      selectScrapScreensRecord(record.recordId);
    });
    const hasLpn = Boolean(record.lpn && String(record.lpn).trim() && String(record.lpn).trim() !== '-' && String(record.lpn).trim() !== '—');
    if (!hasLpn && !selected) {
      row.classList.add('bg-amber-50/20');
    }
    row.append(
      createScrapScreenCell(record.year, 'whitespace-nowrap font-mono text-slate-600'),
      createScrapScreenCell(record.model, 'font-semibold text-slate-800'),
      createScrapScreenCell(record.partNumber, 'whitespace-nowrap font-mono text-slate-700'),
      createScrapScreenCell(record.brand, 'whitespace-nowrap text-slate-700'),
      createScrapScreenCell(record.line, 'whitespace-nowrap text-slate-600'),
      createScrapScreenCell(record.inches ? `${record.inches}"` : '', 'whitespace-nowrap text-slate-600'),
      createScrapScreenCell(record.lot, 'whitespace-nowrap font-mono text-slate-700'),
      createScrapScreenCell(record.type, 'whitespace-nowrap text-slate-700'),
      renderScrapScreenPhotos(record.photos),
      renderScrapScreenLpnCell(record.lpn),
      createScrapScreenCell(record.disposedAt, 'whitespace-nowrap text-slate-600'),
      createScrapScreenCell(record.op, 'whitespace-nowrap font-mono text-slate-700'),
      createScrapScreenCell(record.po, 'whitespace-nowrap font-mono text-slate-700')
    );
    results.appendChild(row);
  });
  if (rmaButton) rmaButton.disabled = !visibleRecords.some(
    record => record.recordId === scrapScreensSelectedRecordId
  );
}

function renderScrapTrendChart(trend) {
  const container = document.getElementById('scrapScreensTrendChart');
  if (!container) return;
  container.replaceChildren();
  const trendByYear = new Map(
    trend
      .filter(item => /^\d{4}$/.test(item.year))
      .map(item => [Number(item.year), item])
  );
  const years = [2024, 2025, 2026];
  const yearlyTrend = years.map(year => trendByYear.get(year) || {
    year: String(year),
    origin: 0,
    process: 0
  });
  const maximum = Math.max(1, ...yearlyTrend.map(item => item.origin + item.process));
  const categories = [
    { key: 'origin', className: 'bg-sky-500', label: 'Origen' },
    { key: 'process', className: 'bg-orange-500', label: 'Roto en proceso' }
  ];
  container.className = 'space-y-3';

  yearlyTrend.forEach(item => {
    const row = document.createElement('div');
    row.className = 'grid grid-cols-[44px_minmax(0,1fr)_52px] items-center gap-2';
    const yearLabel = document.createElement('button');
    yearLabel.type = 'button';
    yearLabel.className = `rounded px-1 text-left text-[10px] font-bold transition hover:bg-red-50 hover:text-red-700 ${document.getElementById('scrapScreensYearFilter')?.value === item.year ? 'bg-red-50 text-red-700' : 'text-slate-600'}`;
    yearLabel.textContent = item.year;
    yearLabel.title = `Filtrar todos los registros del año ${item.year}`;
    yearLabel.setAttribute('aria-label', `Filtrar el año ${item.year}`);
    yearLabel.addEventListener('click', () => filterScrapScreensByYear(item.year));

    const track = document.createElement('div');
    track.className = 'flex h-5 min-w-0 overflow-hidden rounded-md bg-slate-100';
    track.setAttribute('role', 'group');
    track.setAttribute('aria-label', `Scrap de pantallas del año ${item.year}`);
    categories.forEach(category => {
      const count = item[category.key];
      if (!count) return;
      const segment = document.createElement('button');
      segment.type = 'button';
      segment.className = `${category.className} flex h-full min-w-0 items-center justify-center text-[9px] font-bold text-white transition hover:brightness-90`;
      segment.style.width = `${(count / maximum) * 100}%`;
      segment.title = `${category.label} en ${item.year}: ${count.toLocaleString('es-AR')}`;
      segment.setAttribute('aria-label', `${category.label}, ${item.year}: ${count.toLocaleString('es-AR')}`);
      segment.addEventListener('click', () => filterScrapScreensByYear(item.year));
      if (count / maximum >= 0.06) segment.textContent = String(count);
      track.appendChild(segment);
    });

    const total = document.createElement('span');
    total.className = 'text-right text-[10px] font-bold text-slate-700';
    total.textContent = (item.origin + item.process).toLocaleString('es-AR');
    total.setAttribute('aria-label', `Total ${item.year}: ${item.origin + item.process}`);
    row.append(yearLabel, track, total);
    container.appendChild(row);
  });
}

function renderScrapMonthlyTrend(trend, availableYears) {
  const chart = document.getElementById('scrapScreensMonthlyChart');
  const yearSelect = document.getElementById('scrapScreensTrendYear');
  if (!chart || !yearSelect) return;
  chart.replaceChildren();

  const years = [...new Set([
    ...availableYears.filter(y => Number.isInteger(y) && y >= 2024),
    2024, 2025, 2026
  ])].sort((left, right) => left - right);
  if (!years.length) {
    yearSelect.replaceChildren();
    return;
  }
  const yearFilter = document.getElementById('scrapScreensYearFilter');
  const filteredYear = Number(yearFilter?.value);
  const selectedYear = years.includes(filteredYear) ? filteredYear : years[years.length - 1];
  yearSelect.replaceChildren(...years.map(year => new Option(String(year), String(year))));
  yearSelect.value = String(selectedYear);

  const counts = Array.from({ length: 12 }, () => ({ origin: 0, process: 0 }));
  trend.forEach(item => {
    if (item.year !== selectedYear || item.month < 1 || item.month > 12) return;
    counts[item.month - 1].origin += item.origin;
    counts[item.month - 1].process += item.process;
  });
  const categories = [
    { key: 'origin', label: 'Origen', color: '#0ea5e9' },
    { key: 'process', label: 'Roto en proceso', color: '#f97316' }
  ];
  const maxValue = Math.max(1, ...counts.flatMap(monthCounts =>
    categories.map(category => monthCounts[category.key])
  ));
  const width = 780;
  const height = 300;
  const margin = { top: 18, right: 20, bottom: 42, left: 42 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const namespace = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(namespace, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('class', 'block h-auto w-full');
  svg.style.minWidth = '640px';
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `Tendencia mensual de scrap de pantallas para ${selectedYear}`);

  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const ySteps = 4;
  for (let step = 0; step <= ySteps; step += 1) {
    const value = Math.round(maxValue * (ySteps - step) / ySteps);
    const y = margin.top + plotHeight * step / ySteps;
    const gridLine = document.createElementNS(namespace, 'line');
    gridLine.setAttribute('x1', margin.left);
    gridLine.setAttribute('x2', width - margin.right);
    gridLine.setAttribute('y1', y);
    gridLine.setAttribute('y2', y);
    gridLine.setAttribute('stroke', '#e2e8f0');
    svg.appendChild(gridLine);

    const tickLabel = document.createElementNS(namespace, 'text');
    tickLabel.setAttribute('x', margin.left - 8);
    tickLabel.setAttribute('y', y + 3);
    tickLabel.setAttribute('text-anchor', 'end');
    tickLabel.setAttribute('font-size', '9');
    tickLabel.setAttribute('fill', '#64748b');
    tickLabel.textContent = value.toLocaleString('es-AR');
    svg.appendChild(tickLabel);
  }

  months.forEach((label, index) => {
    const x = margin.left + plotWidth * index / (months.length - 1);
    const monthLabel = document.createElementNS(namespace, 'text');
    monthLabel.setAttribute('x', x);
    monthLabel.setAttribute('y', height - 14);
    monthLabel.setAttribute('text-anchor', 'middle');
    monthLabel.setAttribute('font-size', '9');
    monthLabel.setAttribute('fill', '#64748b');
    monthLabel.textContent = label;
    svg.appendChild(monthLabel);
  });

  categories.forEach(category => {
    const points = counts.map((monthCounts, index) => ({
      x: margin.left + plotWidth * index / (months.length - 1),
      y: margin.top + plotHeight * (1 - monthCounts[category.key] / maxValue),
      value: monthCounts[category.key],
      month: index + 1
    }));
    const path = document.createElementNS(namespace, 'path');
    path.setAttribute('d', points.map((point, index) =>
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' '));
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', category.color);
    path.setAttribute('stroke-width', '2.75');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-linecap', 'round');
    svg.appendChild(path);

    points.forEach(point => {
      const selected = scrapScreensSelectedMonth === point.month;
      const circle = document.createElementNS(namespace, 'circle');
      circle.setAttribute('cx', point.x);
      circle.setAttribute('cy', point.y);
      circle.setAttribute('r', selected ? '6' : '4');
      circle.setAttribute('fill', category.color);
      circle.setAttribute('stroke', '#fff');
      circle.setAttribute('stroke-width', '1.5');
      circle.setAttribute('tabindex', '0');
      circle.setAttribute('role', 'button');
      circle.setAttribute('aria-label', `${selectedYear}, ${months[point.month - 1]}, ${category.label}: ${point.value}. Filtrar mes`);
      circle.setAttribute('class', 'cursor-pointer transition-all');
      const title = document.createElementNS(namespace, 'title');
      title.textContent = `${selectedYear} · ${months[point.month - 1]} · ${category.label}: ${point.value.toLocaleString('es-AR')}`;
      circle.appendChild(title);
      circle.addEventListener('click', () => filterScrapScreensByMonth(selectedYear, point.month));
      circle.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          filterScrapScreensByMonth(selectedYear, point.month);
        }
      });
      svg.appendChild(circle);
    });
  });
  chart.appendChild(svg);
}

let isScrapSupplierChassisOpen = false;

window.toggleScrapSupplierChassis = function() {
  isScrapSupplierChassisOpen = !isScrapSupplierChassisOpen;
  const content = document.getElementById('scrapSupplierChassisContent');
  const text = document.getElementById('scrapSupplierChassisToggleText');
  const icon = document.getElementById('scrapSupplierChassisToggleIcon');
  if (content) {
    content.classList.toggle('hidden', !isScrapSupplierChassisOpen);
  }
  if (text) {
    text.textContent = isScrapSupplierChassisOpen ? 'Ocultar tabla' : 'Mostrar tabla';
  }
  if (icon) {
    icon.textContent = isScrapSupplierChassisOpen ? '▲' : '▼';
  }
};

function renderScrapSupplierChassisTable(trend = []) {
  const countBadge = document.getElementById('scrapSupplierChassisCountBadge');
  if (countBadge) {
    countBadge.textContent = `${trend.length} combinaciones`;
  }
  const tbody = document.getElementById('scrapScreensSupplierChassisTableBody');
  if (!tbody) return;

  if (!trend || trend.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="px-3 py-6 text-center text-slate-400 text-xs">No hay registros de scrap para los filtros seleccionados.</td></tr>';
    return;
  }

  const grandTotal = trend.reduce((sum, item) => sum + (item.total || 0), 0) || 1;

  tbody.innerHTML = trend.slice(0, 15).map(item => {
    const originPct = item.total > 0 ? Math.round((item.origin / item.total) * 100) : 0;
    const processPct = item.total > 0 ? Math.round((item.process / item.total) * 100) : 0;
    const shareOfTotal = Math.round((item.total / grandTotal) * 1000) / 10;
    
    return `
      <tr class="hover:bg-slate-50/80 transition-colors">
        <td class="px-3 py-2.5 font-bold text-slate-900">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full ${item.supplier === 'Sin proveedor' ? 'bg-slate-300' : 'bg-orange-500'}"></span>
            <span>${escapeAuditReportText(item.supplier)}</span>
          </div>
        </td>
        <td class="px-3 py-2.5 font-semibold text-slate-700">
          ${item.chassis === 'Sin chasis' ? '<span class="text-slate-400 italic">Sin chasis</span>' : `<span class="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] font-bold text-slate-800 border border-slate-200">${escapeAuditReportText(item.chassis)}</span>`}
        </td>
        <td class="px-3 py-2.5 text-center">
          <span class="inline-block px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 font-bold text-[11px] border border-sky-200">
            ${item.origin.toLocaleString('es-AR')}
          </span>
        </td>
        <td class="px-3 py-2.5 text-center">
          <span class="inline-block px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 font-bold text-[11px] border border-orange-200">
            ${item.process.toLocaleString('es-AR')}
          </span>
        </td>
        <td class="px-3 py-2.5 text-center font-black text-slate-900 text-xs">
          ${item.total.toLocaleString('es-AR')}
        </td>
        <td class="px-3 py-2.5">
          <div class="space-y-1">
            <div class="h-2 w-full flex rounded-full overflow-hidden bg-slate-100 border border-slate-200">
              <div class="bg-sky-500 h-full" style="width: ${originPct}%" title="Origen: ${originPct}%"></div>
              <div class="bg-orange-500 h-full" style="width: ${processPct}%" title="Roto en proceso: ${processPct}%"></div>
            </div>
            <div class="flex justify-between text-[9.5px] text-slate-500 font-medium">
              <span class="text-sky-700 font-bold">${item.origin} (${originPct}%)</span>
              <span class="text-orange-700 font-bold">${item.process} (${processPct}%)</span>
            </div>
          </div>
        </td>
        <td class="px-3 py-2.5 text-center">
          <button type="button" onclick="window.filterScrapBySupplierAndChassis('${escapeAuditReportText(item.supplier)}', '${escapeAuditReportText(item.chassis)}')" class="px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-colors shadow-2xs">
            Filtrar
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.filterScrapBySupplierAndChassis = function(supplier, chassis) {
  const supFilter = document.getElementById('scrapScreensSupplierFilter');
  const chasFilter = document.getElementById('scrapScreensChassisFilter');
  if (supFilter && supplier && supplier !== 'Sin proveedor') supFilter.value = supplier;
  if (chasFilter && chassis && chassis !== 'Sin chasis') chasFilter.value = chassis;
  scrapScreensCurrentPage = 1;
  loadScrapScreensData();
};

function renderScrapLotTrend(trend) {
  const chart = document.getElementById('scrapScreensLotChart');
  const selectedModel = scrapScreensSelectedModel.trim();
  const workspace = document.getElementById('scrapScreensLotWorkspace');
  const modelLabel = document.getElementById('scrapScreensLotModelLabel');
  const lotSearch = document.getElementById('scrapScreensLotSearch');
  if (!chart) return;
  chart.replaceChildren();
  if (workspace) workspace.classList.toggle('hidden', !selectedModel);
  if (lotSearch) {
    lotSearch.disabled = !selectedModel;
    lotSearch.placeholder = selectedModel ? 'Escribí número de lote...' : 'Primero seleccioná un modelo...';
  }
  if (modelLabel) modelLabel.textContent = selectedModel ? `Modelo seleccionado: ${selectedModel}` : '';

  const normalize = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-AR')
    .trim();
  const lotQuery = normalize(lotSearch?.value);
  const collator = new Intl.Collator('es-AR', { numeric: true, sensitivity: 'base' });
  scrapScreensAvailableLots = [...trend].sort((left, right) =>
    (left.year ?? 0) - (right.year ?? 0) || collator.compare(left.lot, right.lot)
  );
  const matchingLots = scrapScreensAvailableLots
    .map(item => ({ item }))
    .filter(({ item }) => !lotQuery || normalize(item.lot).includes(lotQuery));

  if (!selectedModel) {
    chart.className = 'flex min-h-32 items-center justify-center text-xs text-slate-400';
    chart.textContent = 'Seleccioná un modelo para ver su tendencia por lote.';
    return;
  }
  if (!matchingLots.length) {
    chart.className = 'flex min-h-32 items-center justify-center text-xs text-slate-400';
    chart.textContent = lotQuery
      ? 'No hay lotes que coincidan con esa búsqueda.'
      : 'El modelo seleccionado no tiene lotes con registros para estos filtros.';
    return;
  }

  chart.className = 'max-h-[420px] space-y-2 overflow-auto pr-1';
  const sortedTrend = matchingLots.map(({ item }) => item);
  const maximum = Math.max(1, ...sortedTrend.map(item => item.origin + item.process));
  sortedTrend.forEach(item => {
    const row = document.createElement('div');
    const lotKey = scrapScreensLotKey(item);
    const selected = scrapScreensSelectedLots === null ||
      scrapScreensSelectedLots.some(selectedLot => scrapScreensLotKey(selectedLot) === lotKey);
    row.className = `grid grid-cols-[minmax(145px,0.42fr)_minmax(0,1fr)_44px] items-center gap-3 rounded-lg border px-2 py-2 transition ${selected ? 'border-violet-200 bg-violet-50/60' : 'border-transparent opacity-55 hover:border-slate-100 hover:bg-slate-50'}`;
    const label = document.createElement('label');
    label.className = 'flex min-w-0 cursor-pointer items-center gap-2';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = selected;
    checkbox.className = 'h-3.5 w-3.5 shrink-0 rounded border-slate-300 text-violet-600 focus:ring-violet-500';
    const yearLabel = item.year ?? 'Sin año';
    const lotName = document.createElement('span');
    lotName.className = `min-w-0 truncate text-[10px] font-bold ${selected ? 'text-violet-700' : 'text-slate-600'}`;
    lotName.textContent = `Lote ${item.lot}`;
    const year = document.createElement('span');
    year.className = 'shrink-0 text-[9px] font-medium text-slate-400';
    year.textContent = ` · ${yearLabel}`;
    checkbox.setAttribute('aria-label', `Incluir lote ${item.lot}, año ${yearLabel}`);
    checkbox.addEventListener('change', () => toggleScrapScreensLot(item));
    label.title = `Incluir modelo ${selectedModel}, lote ${item.lot}, año ${yearLabel}`;
    label.append(checkbox, lotName, year);

    const track = document.createElement('div');
    track.className = 'flex h-5 min-w-0 overflow-hidden rounded-md bg-slate-100';
    track.setAttribute('role', 'group');
    track.setAttribute('aria-label', `Modelo ${selectedModel}, lote ${item.lot}, año ${yearLabel}`);
    [
      { key: 'origin', className: 'bg-sky-500', label: 'Origen' },
      { key: 'process', className: 'bg-orange-500', label: 'Roto en proceso' }
    ].forEach(category => {
      const count = item[category.key];
      if (!count) return;
      const segment = document.createElement('button');
      segment.type = 'button';
      segment.className = `${category.className} flex h-full min-w-0 items-center justify-center text-[9px] font-bold text-white transition hover:brightness-90`;
      segment.style.width = `${(count / maximum) * 100}%`;
      segment.title = `${category.label} · lote ${item.lot} · ${yearLabel}: ${count.toLocaleString('es-AR')}`;
      segment.setAttribute('aria-label', `${category.label}, lote ${item.lot}, ${yearLabel}: ${count}. Tocar para incluir o quitar este lote`);
      segment.addEventListener('click', () => toggleScrapScreensLot(item));
      if (count / maximum >= 0.06) segment.textContent = String(count);
      track.appendChild(segment);
    });

    const total = document.createElement('span');
    total.className = 'text-right text-[10px] font-extrabold text-slate-700';
    total.textContent = (item.origin + item.process).toLocaleString('es-AR');
    row.append(label, track, total);
    chart.appendChild(row);
  });
}

function scrapScreensLotKey(item) {
  return JSON.stringify([item.year ?? null, item.lot]);
}

function toggleScrapScreensLot(item) {
  const allLots = scrapScreensAvailableLots;
  const itemKey = scrapScreensLotKey(item);
  const selectedKeys = new Set(
    (scrapScreensSelectedLots ?? allLots).map(scrapScreensLotKey)
  );
  if (selectedKeys.has(itemKey)) selectedKeys.delete(itemKey);
  else selectedKeys.add(itemKey);

  scrapScreensSelectedLots = selectedKeys.size === allLots.length
    ? null
    : allLots.filter(lot => selectedKeys.has(scrapScreensLotKey(lot)));
  clearScrapScreensRecordSelection();
  scrapScreensCurrentPage = 1;
  loadScrapScreensData();
}

function filterScrapScreensByYear(year) {
  const yearFilter = document.getElementById('scrapScreensYearFilter');
  if (!yearFilter) return;
  clearScrapScreensRecordSelection();
  scrapScreensSelectedMonth = 0;
  scrapScreensSelectedLots = null;
  yearFilter.value = yearFilter.value === String(year) ? '' : String(year);
  scrapScreensCurrentPage = 1;
  loadScrapScreensData();
}

function filterScrapScreensByMonth(year, month) {
  const yearFilter = document.getElementById('scrapScreensYearFilter');
  if (!yearFilter) return;
  clearScrapScreensRecordSelection();
  yearFilter.value = String(year);
  scrapScreensSelectedMonth = scrapScreensSelectedMonth === month ? 0 : month;
  scrapScreensSelectedLots = null;
  scrapScreensCurrentPage = 1;
  loadScrapScreensData();
}

function filterScrapScreensByModel(model) {
  clearScrapScreensRecordSelection();
  scrapScreensSelectedModel = scrapScreensSelectedModel.toLocaleLowerCase('es-AR') === model.toLocaleLowerCase('es-AR')
    ? ''
    : model;
  scrapScreensSelectedMonth = 0;
  scrapScreensSelectedLots = null;
  const lotSearch = document.getElementById('scrapScreensLotSearch');
  if (lotSearch) lotSearch.value = '';
  scrapScreensCurrentPage = 1;
  loadScrapScreensData();
}

function renderScrapTopModelsChart(containerId, models, barColor) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.replaceChildren();
  if (!models.length) {
    container.textContent = 'Sin registros para esta categoría.';
    container.className = 'flex min-h-32 items-center justify-center text-xs text-slate-400';
    return;
  }
  container.className = 'space-y-3';
  const maximum = Math.max(1, ...models.map(item => item.count));
  models.forEach((item, index) => {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'grid w-full grid-cols-[minmax(120px,1.2fr)_minmax(80px,2fr)_auto] items-center gap-2 rounded-lg px-1 py-1 text-left transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-red-200';
    row.setAttribute('aria-pressed', String(scrapScreensSelectedModel.toLocaleLowerCase('es-AR') === item.model.toLocaleLowerCase('es-AR')));
    row.setAttribute('aria-label', `Filtrar todo por modelo ${item.model}, ${item.count} unidades`);
    row.addEventListener('click', () => filterScrapScreensByModel(item.model));
    const label = document.createElement('span');
    label.className = 'truncate text-[11px] font-semibold text-slate-700';
    label.textContent = `${index + 1}. ${item.model}`;
    label.title = item.model;
    const track = document.createElement('div');
    track.className = 'h-2.5 overflow-hidden rounded-full bg-slate-100';
    track.setAttribute('role', 'progressbar');
    track.setAttribute('aria-label', `${item.model}: ${item.count}`);
    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', String(maximum));
    track.setAttribute('aria-valuenow', String(item.count));
    const bar = document.createElement('div');
    bar.className = `h-full rounded-full ${barColor}`;
    bar.style.width = `${Math.max(3, (item.count / maximum) * 100)}%`;
    track.appendChild(bar);
    const count = document.createElement('span');
    count.className = 'min-w-8 text-right text-[11px] font-bold text-slate-700';
    count.textContent = item.count.toLocaleString('es-AR');
    row.append(label, track, count);
    container.appendChild(row);
  });
}

function showScrapRmaModal(record = null) {
  const modal = document.getElementById('scrapDisposalModal');
  const form = document.getElementById('scrapDisposalForm');
  const recordIdInput = document.getElementById('scrapDisposalRecordId');
  const error = document.getElementById('scrapDisposalError');
  const submitButton = document.getElementById('scrapRmaSubmit');
  if (!modal || !form || !recordIdInput || !submitButton) return;

  form.reset();
  recordIdInput.value = record?.recordId || '';
  document.getElementById('scrapRmaModel').value = record?.model || '';
  document.getElementById('scrapRmaBrand').value = record?.brand || '';
  document.getElementById('scrapRmaLine').value = record?.line || '';
  document.getElementById('scrapRmaLot').value = record?.lot || '';
  document.getElementById('scrapRmaPartNumber').value = record?.partNumber || '';
  document.getElementById('scrapDisposalDate').value = new Date().toLocaleDateString('en-CA');
  document.getElementById('scrapDisposalResponsible').value = AppState.currentUser?.fullName || '';
  if (error) error.classList.add('hidden');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  submitButton.focus();
}

function submitScrapRma(event) {
  event.preventDefault();
  const errorBox = document.getElementById('scrapDisposalError');
  if (!errorBox) return;
  errorBox.textContent = 'RMA no registrado: falta conectar la BBDD compartida. Los datos siguen en el formulario y no se guardaron.';
  errorBox.classList.remove('hidden');
}

function initLabelComparison() {
  const sides = {
    reference: {
      input: document.getElementById('labelReferenceInput'),
      preview: document.querySelector('[data-label-preview="reference"]'),
      image: document.querySelector('[data-label-image="reference"]'),
      filename: document.querySelector('[data-label-filename="reference"]')
    },
    candidate: {
      input: document.getElementById('labelCandidateInput'),
      preview: document.querySelector('[data-label-preview="candidate"]'),
      image: document.querySelector('[data-label-image="candidate"]'),
      filename: document.querySelector('[data-label-filename="candidate"]')
    }
  };
  const status = document.getElementById('labelComparisonStatus');
  const clearButton = document.getElementById('clearLabelComparison');
  const objectUrls = { reference: null, candidate: null };
  const maxFileSize = 12 * 1024 * 1024;
  const allowedExtensions = /\.(jpe?g|png|webp|gif|bmp)$/i;

  const updateStatus = message => {
    if (status) status.textContent = message;
  };

  const clearSide = side => {
    const preview = sides[side];
    if (!preview.input || !preview.image || !preview.preview) return;
    if (objectUrls[side]) URL.revokeObjectURL(objectUrls[side]);
    objectUrls[side] = null;
    preview.input.value = '';
    preview.image.removeAttribute('src');
    preview.preview.classList.add('hidden');
  };

  Object.entries(sides).forEach(([side, preview]) => {
    if (!preview.input || !preview.preview || !preview.image || !preview.filename) return;

    document.querySelector(`[data-label-picker="${side}"]`)?.addEventListener('click', () => preview.input.click());
    document.querySelector(`[data-label-clear="${side}"]`)?.addEventListener('click', () => {
      clearSide(side);
      updateStatus('Cargá ambas imágenes para compararlas lado a lado.');
    });

    preview.input.addEventListener('change', () => {
      const file = preview.input.files && preview.input.files[0];
      if (!file) return;

      const supportedImage = file.type.startsWith('image/') && allowedExtensions.test(file.name);
      if (!supportedImage) {
        preview.input.value = '';
        updateStatus('Formato no válido. Usá una imagen JPG, PNG, WEBP, GIF o BMP.');
        return;
      }
      if (file.size > maxFileSize) {
        preview.input.value = '';
        updateStatus('La imagen supera el límite de 12 MB. Elegí un archivo más liviano.');
        return;
      }

      if (objectUrls[side]) URL.revokeObjectURL(objectUrls[side]);
      objectUrls[side] = URL.createObjectURL(file);
      preview.image.src = objectUrls[side];
      preview.filename.textContent = `${file.name} · ${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      preview.preview.classList.remove('hidden');

      const hasBothImages = Object.values(sides).every(item => item.input && item.input.files && item.input.files.length > 0);
      updateStatus(hasBothImages
        ? 'Ambas imágenes están listas. Revisá las etiquetas lado a lado; la validación es visual.'
        : 'Imagen cargada. Ahora cargá la otra etiqueta para compararlas.');
    });
  });

  if (clearButton) {
    clearButton.addEventListener('click', () => {
      clearSide('reference');
      clearSide('candidate');
      updateStatus('Cargá ambas imágenes para compararlas lado a lado.');
    });
  }

  window.addEventListener('beforeunload', () => {
    Object.values(objectUrls).forEach(url => {
      if (url) URL.revokeObjectURL(url);
    });
  });
}

const screenValidationImages = [];
const screenValidationAllowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const screenValidationMaxImageSize = 5 * 1024 * 1024;
const screenValidationMaxImages = 5;

function setScreenValidationMessage(message, type = 'error') {
  const messageBox = document.getElementById('screenValidationMessage');
  if (!messageBox) return;
  messageBox.textContent = message;
  const statusClass = type === 'success'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : type === 'warning'
      ? 'border-amber-200 bg-amber-50 text-amber-800'
      : 'border-red-200 bg-red-50 text-red-700';
  messageBox.className = `rounded-lg border px-3 py-2 text-xs ${statusClass}`;
}

function renderScreenValidationImages() {
  const container = document.getElementById('screenValidationImagePreviews');
  if (!container) return;
  container.replaceChildren();

  screenValidationImages.forEach((file, index) => {
    const card = document.createElement('div');
    card.className = 'relative overflow-hidden rounded-lg border border-slate-200 bg-white p-2';

    const image = document.createElement('img');
    image.src = URL.createObjectURL(file);
    image.alt = `Evidencia ${index + 1}: ${file.name}`;
    image.className = 'h-24 w-full rounded-md bg-slate-50 object-contain';
    image.addEventListener('load', () => URL.revokeObjectURL(image.src), { once: true });

    const filename = document.createElement('p');
    filename.className = 'mt-1 truncate text-[10px] text-slate-600';
    filename.textContent = file.name;

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'mt-1 text-[10px] font-semibold text-red-600 hover:text-red-700';
    removeButton.textContent = 'Quitar';
    removeButton.addEventListener('click', () => {
      screenValidationImages.splice(index, 1);
      renderScreenValidationImages();
    });

    card.append(image, filename, removeButton);
    container.appendChild(card);
  });
}

function initScreenValidationForm() {
  const form = document.getElementById('screenValidationForm');
  const fileInput = document.getElementById('screenValidationImages');
  const modelInput = document.getElementById('screenValidationModel');
  const submitButton = document.getElementById('screenValidationSubmit');
  if (!form || !fileInput || !modelInput || !submitButton) return;

  const responsibleInput = document.getElementById('screenValidationResponsible');
  if (responsibleInput && AppState.currentUser) {
    responsibleInput.value = AppState.currentUser.fullName;
  }

  // Convertir automáticamente a mayúsculas mientras el usuario escribe
  modelInput.addEventListener('input', () => {
    const start = modelInput.selectionStart;
    const end = modelInput.selectionEnd;
    modelInput.value = modelInput.value.toUpperCase();
    modelInput.setSelectionRange(start, end);
  });

  // Gestión dinámica de Códigos de Barras / Seriales múltiples (con escáner)
  const barcodeListContainer = document.getElementById('screenBarcodeList');
  const btnAddBarcode = document.getElementById('btnAddBarcodeRow');

  function updateBarcodeIndices() {
    if (!barcodeListContainer) return;
    const rows = barcodeListContainer.querySelectorAll('.barcode-row');
    rows.forEach((row, i) => {
      const idxSpan = row.querySelector('.barcode-index');
      if (idxSpan) idxSpan.textContent = i + 1;
      const removeBtn = row.querySelector('.btn-remove-barcode');
      if (removeBtn) {
        removeBtn.classList.toggle('hidden', rows.length === 1);
      }
    });
  }

  function addBarcodeRow(initialValue = '', focus = true) {
    if (!barcodeListContainer) return null;
    const row = document.createElement('div');
    row.className = 'barcode-row flex items-center gap-2';
    row.innerHTML = `
      <span class="barcode-index flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white border border-slate-200 text-[11px] font-mono font-bold text-slate-600">1</span>
      <input type="text" required maxlength="150" autocomplete="off" placeholder="Escaneá o ingresá el serial de la pantalla..." value="${initialValue}" class="screen-barcode-input flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-semibold text-slate-800 focus:border-red-400 focus:ring-1 focus:ring-red-200">
      <button type="button" class="btn-remove-barcode p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Eliminar fila">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
      </button>
    `;

    const input = row.querySelector('.screen-barcode-input');
    const removeBtn = row.querySelector('.btn-remove-barcode');

    // Al apretar Enter (escáner de código de barras o teclado manual)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (input.value.trim()) {
          const nextRow = addBarcodeRow('', true);
        }
      }
    });

    removeBtn.addEventListener('click', () => {
      const rows = barcodeListContainer.querySelectorAll('.barcode-row');
      if (rows.length > 1) {
        row.remove();
        updateBarcodeIndices();
      }
    });

    barcodeListContainer.appendChild(row);
    updateBarcodeIndices();
    if (focus) input.focus();
    return row;
  }

  if (barcodeListContainer) {
    const firstInput = barcodeListContainer.querySelector('.screen-barcode-input');
    if (firstInput) {
      firstInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (firstInput.value.trim()) {
            addBarcodeRow('', true);
          }
        }
      });
    }
  }

  if (btnAddBarcode) {
    btnAddBarcode.addEventListener('click', () => addBarcodeRow('', true));
  }

  fileInput.addEventListener('change', () => {
    const newFiles = Array.from(fileInput.files || []);
    fileInput.value = '';

    if (screenValidationImages.length + newFiles.length > screenValidationMaxImages) {
      setScreenValidationMessage('Podés adjuntar hasta 5 imágenes en total.');
      return;
    }

    const invalidFile = newFiles.find(file =>
      !screenValidationAllowedTypes.has(file.type) || file.size > screenValidationMaxImageSize
    );
    if (invalidFile) {
      setScreenValidationMessage(screenValidationAllowedTypes.has(invalidFile.type)
        ? `La imagen "${invalidFile.name}" supera el límite de 5 MB.`
        : 'Formato no válido. Usá imágenes JPG, PNG o WEBP.');
      return;
    }

    screenValidationImages.push(...newFiles);
    renderScreenValidationImages();
    const message = document.getElementById('screenValidationMessage');
    if (message) message.classList.add('hidden');
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const model = modelInput.value.trim().toUpperCase();
    modelInput.value = model;

    if (!model.startsWith('91')) {
      setScreenValidationMessage("El modelo debe comenzar con '91' (ej.: 91DB50X65800).");
      modelInput.focus();
      return;
    }

    // Recopilar todos los códigos de barra cargados
    const barcodeInputs = Array.from(document.querySelectorAll('.screen-barcode-input'));
    const barcodes = barcodeInputs.map(inp => inp.value.trim()).filter(Boolean);
    if (barcodes.length === 0) {
      setScreenValidationMessage("Debés ingresar al menos un código de barras / serial.");
      return;
    }
    const combinedBarcodes = barcodes.join(', ');

    submitButton.disabled = true;
    submitButton.textContent = 'Enviando y guardando...';
    try {
      const images = await Promise.all(screenValidationImages.map(async file => {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.addEventListener('load', () => resolve(reader.result), { once: true });
          reader.addEventListener('error', () => reject(new Error(`No se pudo leer la imagen "${file.name}".`)), { once: true });
          reader.readAsDataURL(file);
        });
        return { name: file.name, dataUrl };
      }));

      const payload = {
        line: document.getElementById('screenValidationLine').value,
        model,
        barcode: combinedBarcodes,
        barcodes,
        lot: document.getElementById('screenValidationLot').value.trim(),
        responsible: responsibleInput?.value || AppState.currentUser?.fullName || 'Rober Quiquinlla',
        observations: document.getElementById('screenValidationObservations').value.trim(),
        images
      };

      // Generar plantilla HTML minimalista para notificaciones y Apps Script
      const safeEsc = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
      const serialChipsHtml = barcodes.map(b => `<span style="display:inline-block;margin:3px 4px 3px 0;padding:5px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;font-weight:600;color:#1e293b;">${safeEsc(b)}</span>`).join('');
      const obsHtml = payload.observations ? `<div style="padding:10px 14px;background:#f8fafc;border-left:3px solid #cbd5e1;border-radius:4px;font-size:13px;color:#334155;line-height:1.5;">${safeEsc(payload.observations)}</div>` : '<span style="color:#94a3b8;font-size:13px;font-style:italic;">Sin observaciones</span>';
      const dateFormatted = new Date().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'medium' });

      payload.htmlBody = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Validación de pantalla</title></head>
<body style="margin:0;padding:24px 12px;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;-webkit-font-smoothing:antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.05);border:1px solid #e2e8f0;">
    <tr><td style="height:4px;background:linear-gradient(90deg, #dc2626 0%, #ef4444 100%);"></td></tr>
    <tr>
      <td style="padding:28px 28px 20px 28px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td>
              <div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#dc2626;margin-bottom:4px;">PLANTA 5 · CONTROL DE CALIDAD</div>
              <h1 style="margin:0;font-size:20px;font-weight:700;color:#0f172a;line-height:1.25;">Validación de Pantalla</h1>
            </td>
            <td align="right" valign="top">
              <span style="display:inline-block;padding:5px 12px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:20px;font-size:11px;font-weight:600;color:#059669;white-space:nowrap;">✓ Registrada</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="padding:0 28px;"><div style="height:1px;background-color:#f1f5f9;"></div></td></tr>
    <tr>
      <td style="padding:20px 28px 24px 28px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td width="50%" valign="top" style="padding-bottom:16px;padding-right:12px;">
              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:4px;">Línea</div>
              <div><span style="display:inline-block;padding:3px 10px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;font-weight:700;color:#1e293b;">${safeEsc(payload.line)}</span></div>
            </td>
            <td width="50%" valign="top" style="padding-bottom:16px;">
              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:4px;">Modelo</div>
              <div style="font-size:15px;font-weight:700;color:#0f172a;letter-spacing:-0.2px;">${safeEsc(payload.model)}</div>
            </td>
          </tr>
          <tr>
            <td width="50%" valign="top" style="padding-bottom:16px;padding-right:12px;">
              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:4px;">Lote</div>
              <div style="font-size:13px;font-weight:600;color:#1e293b;">${safeEsc(payload.lot)}</div>
            </td>
            <td width="50%" valign="top" style="padding-bottom:16px;">
              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:4px;">Responsable</div>
              <div style="font-size:13px;font-weight:600;color:#1e293b;">${safeEsc(payload.responsible)}</div>
            </td>
          </tr>
          <tr>
            <td colspan="2" valign="top" style="padding-bottom:18px;">
              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:4px;">Fecha y Hora</div>
              <div style="font-size:12px;color:#475569;">${dateFormatted}</div>
            </td>
          </tr>
          <tr>
            <td colspan="2" valign="top" style="padding-top:6px;padding-bottom:18px;">
              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:6px;">Códigos de barras / Serials escaneados (${barcodes.length})</div>
              <div>${serialChipsHtml}</div>
            </td>
          </tr>
          <tr>
            <td colspan="2" valign="top" style="padding-bottom:18px;">
              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:6px;">Observaciones</div>
              ${obsHtml}
            </td>
          </tr>
          <tr>
            <td colspan="2" valign="top">
              <div style="display:inline-flex;align-items:center;padding:7px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-size:12px;color:#475569;">
                📎 <strong style="margin-left:6px;margin-right:4px;color:#1e293b;">${images.length}</strong> archivo(s) de imagen adjunto(s)
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 28px;background-color:#f8fafc;border-top:1px solid #f1f5f9;font-size:11px;color:#94a3b8;line-height:1.5;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td>
              <strong style="color:#64748b;">Site de Calidad · Planta 5</strong><br>
              Notificación automática generada tras la inspección en línea.
            </td>
            <td align="right" valign="middle" style="color:#cbd5e1;font-size:10px;">CONFIDENCIAL</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      // 1. Guardar en servidor local
      const response = await requestAuthApi('/api/screen-validations', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      // 2. Enviar a Google Apps Script (Sheets + Drive + Mail nativo)
      const appsScriptUrl = 'https://script.google.com/macros/s/AKfycbwC_b5G6m6qS0140MB9-awYuKHr_vFNiodlSxJL2CJPrl3nGMQGdvSgRlYx1NoKiMgV/exec';
      let sheetsSyncOk = false;
      try {
        await fetch(appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        sheetsSyncOk = true;
      } catch (err) {
        console.warn('No se pudo sincronizar directo a Apps Script:', err);
      }

      form.reset();
      if (responsibleInput && AppState.currentUser) {
        responsibleInput.value = AppState.currentUser.fullName;
      }

      // Reiniciar lista de códigos de barra a 1 fila vacía
      if (barcodeListContainer) {
        barcodeListContainer.innerHTML = `
          <div class="barcode-row flex items-center gap-2">
            <span class="barcode-index flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white border border-slate-200 text-[11px] font-mono font-bold text-slate-600">1</span>
            <input type="text" required maxlength="150" autocomplete="off" placeholder="Escaneá o ingresá el serial de la pantalla..." class="screen-barcode-input flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-semibold text-slate-800 focus:border-red-400 focus:ring-1 focus:ring-red-200">
            <button type="button" class="btn-remove-barcode hidden p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Eliminar fila">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        `;
        const newFirstInput = barcodeListContainer.querySelector('.screen-barcode-input');
        if (newFirstInput) {
          newFirstInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (newFirstInput.value.trim()) addBarcodeRow('', true);
            }
          });
        }
      }

      screenValidationImages.length = 0;
      renderScreenValidationImages();
      setScreenValidationMessage(
        sheetsSyncOk
          ? `✓ Validación de ${barcodes.length} pantalla(s) registrada, sincronizada a Google Sheets y notificada por correo.`
          : '✓ Validación guardada correctamente en el sistema.',
        'success'
      );
      await loadScreenValidationRecords();
    } catch (error) {
      console.error('No se pudo guardar la validación de pantalla.', error);
      setScreenValidationMessage(error.message || 'No se pudo guardar la validación. Revisá la conexión e intentá nuevamente.');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Enviar mail y guardar validación';
    }
  });
}

async function loadScreenValidationRecords() {
  const status = document.getElementById('screenValidationRecentStatus');
  const tableBody = document.getElementById('screenValidationRecentRecords');
  if (!status || !tableBody) return;

  status.textContent = 'Cargando registros...';
  status.className = 'rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600';
  try {
    const response = await requestAuthApi('/api/screen-validations');
    if (!Array.isArray(response.records)) {
      throw new Error('La respuesta de validaciones no tiene el formato esperado.');
    }
    tableBody.replaceChildren();
    response.records.forEach(record => {
      const row = document.createElement('tr');
      const values = [
        new Date(record.createdAt * 1000).toLocaleString('es-AR'),
        record.line,
        record.model,
        record.barcode,
        record.lot
      ];
      values.forEach(value => {
        const cell = document.createElement('td');
        cell.className = 'py-2 pr-3 text-slate-700';
        cell.textContent = value;
        row.appendChild(cell);
      });

      const imagesCell = document.createElement('td');
      imagesCell.className = 'py-2 pr-3 text-slate-700';
      (Array.isArray(record.images) ? record.images : []).forEach((image, index) => {
        const link = document.createElement('a');
        link.href = `/api/screen-validations/${encodeURIComponent(record.id)}/images/${image.position}`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'mr-2 font-semibold text-cyan-700 hover:text-cyan-900';
        link.textContent = `Foto ${index + 1}`;
        link.title = image.filename;
        imagesCell.appendChild(link);
      });
      if (!imagesCell.childElementCount) imagesCell.textContent = '—';
      row.appendChild(imagesCell);

      const creatorCell = document.createElement('td');
      creatorCell.className = 'py-2 text-slate-700';
      creatorCell.textContent = record.createdBy;
      row.appendChild(creatorCell);

      const actionCell = document.createElement('td');
      actionCell.className = 'py-2 text-right pr-2';
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.title = 'Eliminar registro';
      deleteBtn.className = 'inline-flex items-center justify-center p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors';
      deleteBtn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>';
      deleteBtn.onclick = () => window.deleteScreenValidationRecord(record.id);
      actionCell.appendChild(deleteBtn);
      row.appendChild(actionCell);

      tableBody.appendChild(row);
    });
    status.textContent = response.records.length
      ? `Se muestran las últimas ${response.records.length} validaciones.`
      : 'Todavía no hay validaciones registradas.';
  } catch (error) {
    console.error('No se pudieron cargar las validaciones de pantallas.', error);
    status.textContent = error.message || 'No se pudieron cargar los registros.';
    status.className = 'rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700';
  }
}

let mdrRecords = [];
let mdrTrendYear = null;
const mdrInteractiveFilters = {
  year: null,
  month: null,
  origin: null,
  supplier: null
};

function initMdrDashboard() {
  const searchInput = document.getElementById('mdrSearchInput');
  const plantFilter = document.getElementById('mdrPlantFilter');
  const trendYearSelect = document.getElementById('mdrTrendYear');
  const clearFiltersButton = document.getElementById('mdrClearFilters');
  if (searchInput) {
    searchInput.addEventListener('input', renderMdrSearchResults);
  }
  if (plantFilter) {
    plantFilter.addEventListener('change', () => {
      clearMdrInteractiveFilters();
      renderMdrDashboard();
    });
  }
  if (trendYearSelect) {
    trendYearSelect.addEventListener('change', () => {
      const year = Number(trendYearSelect.value);
      if (!Number.isInteger(year)) return;
      mdrTrendYear = year;
      mdrInteractiveFilters.year = year;
      mdrInteractiveFilters.month = null;
      renderMdrDashboard();
    });
  }
  if (clearFiltersButton) {
    clearFiltersButton.addEventListener('click', () => {
      clearMdrInteractiveFilters();
      renderMdrDashboard();
    });
  }
  loadMdrData();
}

window.loadMdrData = async function() {
  const status = document.getElementById('mdrDataStatus');
  const errorBox = document.getElementById('mdrLoadError');
  const results = document.getElementById('mdrSearchResults');
  if (!status || !errorBox || !results) return;

  status.textContent = 'Actualizando desde Google Sheets...';
  errorBox.classList.add('hidden');
  try {
    const response = await fetch('/api/mdr', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`El servidor respondió ${response.status} ${response.statusText}.`);
    }
    const payload = await response.json();
    if (!Array.isArray(payload.records) || payload.records.some(record =>
      typeof record.plant !== 'string' ||
      typeof record.mdrFileUrl !== 'string' ||
      typeof record.response8dFileUrl !== 'string'
    )) {
      throw new Error('La respuesta de la base MDR no tiene el formato esperado.');
    }

    mdrRecords = payload.records;
    populateMdrPlantFilter();
    renderMdrDashboard();
    status.textContent = `Datos actualizados · ${new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date())}`;
  } catch (error) {
    console.warn('No se pudieron cargar los datos de Google Sheets para MDR; se usa la base demo local.', error);
    mdrRecords = FALLBACK_MDR_RECORDS;
    populateMdrPlantFilter();
    renderMdrDashboard();
    status.textContent = 'Base MDR de demostración local activa.';
    errorBox.textContent = 'No se pudieron cargar los registros desde la fuente remota. Se usó una base local demostrativa para seguir operando.';
    errorBox.classList.remove('hidden');
  }
};

function normalizeMdrFilterValue(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleUpperCase('es-AR')
    .replace(/[^A-Z0-9]/g, '');
}

function isMdrPlantFive(plant) {
  return ['UP5', 'P5', 'PLANTA5'].includes(normalizeMdrFilterValue(plant));
}

function isMdrExcludedDefaultLine(line) {
  const normalizedLine = normalizeMdrFilterValue(line);
  return [
    'MOTOROLAMOBIL',
    'CELULARPHILCO',
    'CELULARESNOBLEX',
    'CONECTARAIGUALDAD',
    'OPPO'
  ].some(keyword => normalizedLine.includes(keyword));
}

function populateMdrPlantFilter() {
  const filter = document.getElementById('mdrPlantFilter');
  if (!filter) return;
  const selectedValue = filter.value || 'planta5';
  const plants = new Map();
  mdrRecords.forEach(record => {
    const plant = record.plant.trim();
    const normalizedPlant = normalizeMdrFilterValue(plant);
    if (plant && normalizedPlant && !plants.has(normalizedPlant)) {
      plants.set(normalizedPlant, plant);
    }
  });

  filter.replaceChildren();
  const defaultOption = document.createElement('option');
  defaultOption.value = 'planta5';
  defaultOption.textContent = 'Planta 5 (predeterminada)';
  filter.appendChild(defaultOption);

  const allOption = document.createElement('option');
  allOption.value = 'todas';
  allOption.textContent = 'Todas las plantas';
  filter.appendChild(allOption);

  Array.from(plants.entries())
    .sort((plantA, plantB) => plantA[1].localeCompare(plantB[1], 'es'))
    .forEach(([normalizedPlant, plant]) => {
      if (isMdrPlantFive(plant)) return;
      const option = document.createElement('option');
      option.value = `planta:${normalizedPlant}`;
      option.textContent = plant;
      filter.appendChild(option);
    });

  filter.value = Array.from(filter.options).some(option => option.value === selectedValue)
    ? selectedValue
    : 'planta5';
}

function getFilteredMdrRecords() {
  const filterValue = document.getElementById('mdrPlantFilter')?.value || 'planta5';
  let records;
  if (filterValue === 'todas') {
    records = mdrRecords;
  } else if (filterValue === 'planta5') {
    records = mdrRecords.filter(record => isMdrPlantFive(record.plant) && !isMdrExcludedDefaultLine(record.line));
  } else {
    const selectedPlant = filterValue.slice('planta:'.length);
    records = mdrRecords.filter(record => normalizeMdrFilterValue(record.plant) === selectedPlant);
  }

  return records.filter(record =>
    (mdrInteractiveFilters.year === null || record.year === mdrInteractiveFilters.year) &&
    (mdrInteractiveFilters.month === null || getMdrMonth(record) === mdrInteractiveFilters.month) &&
    (mdrInteractiveFilters.origin === null || getMdrOriginCategory(record) === mdrInteractiveFilters.origin) &&
    (mdrInteractiveFilters.supplier === null || record.supplier.toLocaleLowerCase('es-AR') === mdrInteractiveFilters.supplier)
  );
}

function clearMdrInteractiveFilters() {
  mdrInteractiveFilters.year = null;
  mdrInteractiveFilters.month = null;
  mdrInteractiveFilters.origin = null;
  mdrInteractiveFilters.supplier = null;
  mdrTrendYear = Math.max(0, ...mdrRecords.map(record => record.year));
}

window.toggleMdrOriginFilter = function(origin) {
  mdrInteractiveFilters.origin = mdrInteractiveFilters.origin === origin
    ? null
    : origin;
  renderMdrDashboard();
};

function toggleMdrChartSegment(year, origin) {
  const isActive = mdrInteractiveFilters.year === year &&
    mdrInteractiveFilters.origin === origin;
  mdrInteractiveFilters.year = isActive ? null : year;
  mdrInteractiveFilters.month = null;
  mdrInteractiveFilters.origin = isActive ? null : origin;
  renderMdrDashboard();
}

function toggleMdrYearFilter(year) {
  mdrInteractiveFilters.year = mdrInteractiveFilters.year === year ? null : year;
  mdrInteractiveFilters.month = null;
  mdrTrendYear = mdrInteractiveFilters.year || Math.max(0, ...mdrRecords.map(record => record.year));
  renderMdrDashboard();
}

function toggleMdrSupplierFilter(supplier) {
  const normalizedSupplier = supplier.toLocaleLowerCase('es-AR');
  mdrInteractiveFilters.supplier = mdrInteractiveFilters.supplier === normalizedSupplier
    ? null
    : normalizedSupplier;
  renderMdrDashboard();
}

function toggleMdrMonthFilter(year, month, origin) {
  const isActive = mdrInteractiveFilters.year === year &&
    mdrInteractiveFilters.month === month &&
    mdrInteractiveFilters.origin === origin;
  mdrInteractiveFilters.year = isActive ? null : year;
  mdrInteractiveFilters.month = isActive ? null : month;
  mdrInteractiveFilters.origin = isActive ? null : origin;
  mdrTrendYear = year;
  renderMdrDashboard();
}

function updateMdrFilterSummary() {
  const summary = document.getElementById('mdrActiveFilters');
  const clearButton = document.getElementById('mdrClearFilters');
  if (!summary || !clearButton) return;

  const activeFilters = [];
  if (mdrInteractiveFilters.year !== null) activeFilters.push(`Año ${mdrInteractiveFilters.year}`);
  if (mdrInteractiveFilters.month !== null) {
    activeFilters.push(new Intl.DateTimeFormat('es', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2020, mdrInteractiveFilters.month - 1, 1))));
  }
  if (mdrInteractiveFilters.origin !== null) {
    activeFilters.push(mdrInteractiveFilters.origin === 'OTROS' ? 'Sin clasificación' : `${mdrInteractiveFilters.origin[0]}${mdrInteractiveFilters.origin.slice(1).toLowerCase()}`);
  }
  if (mdrInteractiveFilters.supplier !== null) {
    const supplier = mdrRecords.find(record =>
      record.supplier.toLocaleLowerCase('es-AR') === mdrInteractiveFilters.supplier
    )?.supplier;
    activeFilters.push(`Proveedor: ${supplier || mdrInteractiveFilters.supplier}`);
  }

  summary.textContent = activeFilters.length
    ? `Filtros activos: ${activeFilters.join(' · ')}. Indicadores, gráfico, proveedores y tabla están actualizados.`
    : 'Hacé clic en un año, segmento, mes o proveedor para filtrar todo el panel.';
  clearButton.classList.toggle('hidden', activeFilters.length === 0);
}

function parseMdrDate(value, year) {
  const match = String(value || '').match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!match) return Number(year) * 10000;
  const [, day, month, dateYear] = match;
  return Number(dateYear) * 10000 + Number(month) * 100 + Number(day);
}

function getMdrMonth(record) {
  const match = String(record.date || '').match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!match) return null;
  return Number(match[2]);
}

function getMdrOriginCategory(record) {
  if (record.origin === 'NACIONAL') return 'NACIONAL';
  if (record.origin === 'IMPORTADO') return 'IMPORTADO';
  return 'OTROS';
}

function compareMdrNewestFirst(recordA, recordB) {
  const dateDifference = parseMdrDate(recordB.date, recordB.year) - parseMdrDate(recordA.date, recordA.year);
  if (dateDifference !== 0) return dateDifference;
  return recordB.mdr.localeCompare(recordA.mdr, 'es', { numeric: true });
}

function renderMdrDashboard() {
  const filteredRecords = getFilteredMdrRecords();
  const countsByYear = new Map();
  const originCounts = { NACIONAL: 0, IMPORTADO: 0 };
  const currentYear = new Date().getFullYear();
  for (let year = 2022; year <= currentYear; year += 1) {
    countsByYear.set(year, { NACIONAL: 0, IMPORTADO: 0, OTROS: 0, total: 0 });
  }

  filteredRecords.forEach(record => {
    const yearCounts = countsByYear.get(record.year);
    if (!yearCounts) return;
    const originCategory = getMdrOriginCategory(record);
    yearCounts[originCategory] += 1;
    yearCounts.total += 1;
    if (Object.hasOwn(originCounts, originCategory)) {
      originCounts[originCategory] += 1;
    }
  });

  document.getElementById('mdrTotalCount').textContent = filteredRecords.length.toLocaleString('es-AR');
  document.getElementById('mdrImportedCount').textContent = originCounts.IMPORTADO.toLocaleString('es-AR');
  document.getElementById('mdrNationalCount').textContent = originCounts.NACIONAL.toLocaleString('es-AR');
  const selectedPlant = document.getElementById('mdrPlantFilter')?.value || 'planta5';
  const plantSummary = document.getElementById('mdrPlantSummary');
  if (plantSummary) {
    plantSummary.textContent = selectedPlant === 'planta5'
      ? 'Planta 5 (UP5) · excluye las líneas indicadas para la vista predeterminada. El gráfico agrupa los MDR por origen del proveedor.'
      : selectedPlant === 'todas'
        ? 'Todas las plantas · incluye las líneas excluidas de la vista predeterminada de UP5. El gráfico agrupa los MDR por origen del proveedor.'
        : `Planta seleccionada: ${document.getElementById('mdrPlantFilter').selectedOptions[0]?.textContent || 'Otra planta'}. El gráfico agrupa los MDR por origen del proveedor.`;
  }
  updateMdrFilterSummary();
  renderMdrYearChart(countsByYear);
  renderMdrMonthlyTrend(filteredRecords);
  renderMdrTopSuppliers('NACIONAL', 'mdrTopNational');
  renderMdrTopSuppliers('IMPORTADO', 'mdrTopImported');
  renderMdrSearchResults();
}

function renderMdrYearChart(countsByYear) {
  const chart = document.getElementById('mdrYearChart');
  if (!chart) return;
  chart.replaceChildren();

  const years = Array.from(countsByYear.entries()).sort(([yearA], [yearB]) => yearA - yearB);
  const categories = [
    { key: 'NACIONAL', className: 'bg-sky-500', label: 'Nacional' },
    { key: 'IMPORTADO', className: 'bg-violet-500', label: 'Importado' },
    { key: 'OTROS', className: 'bg-slate-300', label: 'Sin clasificación' }
  ];

  years.forEach(([year, counts]) => {
    const row = document.createElement('div');
    row.className = 'grid grid-cols-[36px_minmax(0,1fr)_44px] items-center gap-2';
    const yearLabel = document.createElement('button');
    yearLabel.type = 'button';
    yearLabel.className = `rounded px-1 text-left text-[10px] font-bold transition hover:bg-red-50 hover:text-red-700 ${mdrInteractiveFilters.year === year ? 'bg-red-50 text-red-700' : 'text-slate-600'}`;
    yearLabel.textContent = String(year);
    yearLabel.title = `Filtrar todos los registros del año ${year}`;
    yearLabel.setAttribute('aria-label', `Filtrar el año ${year}`);
    yearLabel.addEventListener('click', () => toggleMdrYearFilter(year));
    const track = document.createElement('div');
    track.className = 'flex h-5 min-w-0 overflow-hidden rounded-md bg-slate-100';
    track.setAttribute('aria-label', `Gráfico de MDR nacionales e importados del año ${year}`);

    if (counts.total > 0) {
      categories.forEach(category => {
        const count = counts[category.key];
        if (!count) return;
        const segment = document.createElement('button');
        segment.type = 'button';
        segment.className = `${category.className} flex h-full items-center justify-center text-[9px] font-bold text-white transition hover:brightness-90 ${mdrInteractiveFilters.year === year && mdrInteractiveFilters.origin === category.key ? 'z-10 ring-2 ring-inset ring-slate-900' : ''}`;
        segment.style.width = `${(count / counts.total) * 100}%`;
        segment.title = `Filtrar MDR ${category.label.toLowerCase()} en ${year}: ${count}`;
        segment.setAttribute('aria-label', `${category.label}, ${year}: ${count} MDR`);
        segment.addEventListener('click', () => toggleMdrChartSegment(year, category.key));
        if (count / counts.total >= 0.09) segment.textContent = String(count);
        track.appendChild(segment);
      });
    }

    const total = document.createElement('span');
    total.className = `text-right text-[10px] font-bold ${mdrInteractiveFilters.year === year ? 'text-red-700' : 'text-slate-700'}`;
    total.textContent = counts.total.toLocaleString('es-AR');
    row.append(yearLabel, track, total);
    chart.appendChild(row);
  });
}

function renderMdrMonthlyTrend(records) {
  const chart = document.getElementById('mdrMonthlyTrend');
  const legend = document.getElementById('mdrMonthlyLegend');
  const yearSelect = document.getElementById('mdrTrendYear');
  if (!chart || !legend || !yearSelect) return;
  chart.replaceChildren();
  legend.replaceChildren();

  const years = Array.from(new Set(mdrRecords.map(record => record.year))).sort((a, b) => a - b);
  if (years.length === 0) return;
  const selectedYear = years.includes(mdrInteractiveFilters.year)
    ? mdrInteractiveFilters.year
    : years.includes(mdrTrendYear) ? mdrTrendYear : years[years.length - 1];
  mdrTrendYear = selectedYear;

  yearSelect.replaceChildren();
  years.forEach(year => {
    const option = document.createElement('option');
    option.value = String(year);
    option.textContent = String(year);
    yearSelect.appendChild(option);
  });
  yearSelect.value = String(selectedYear);

  const counts = Array.from({ length: 12 }, () => ({ NACIONAL: 0, IMPORTADO: 0 }));
  records.forEach(record => {
    const month = getMdrMonth(record);
    if (!month || record.year !== selectedYear) return;
    const origin = getMdrOriginCategory(record);
    if (Object.hasOwn(counts[month - 1], origin)) {
      counts[month - 1][origin] += 1;
    }
  });
  const origins = [
    { key: 'NACIONAL', label: 'Nacional', color: '#0ea5e9' },
    { key: 'IMPORTADO', label: 'Importado', color: '#8b5cf6' }
  ];
  const maxValue = Math.max(1, ...counts.flatMap(monthCounts => origins.map(origin => monthCounts[origin.key])));
  const width = 780;
  const height = 300;
  const margin = { top: 18, right: 20, bottom: 42, left: 42 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const svgNs = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNs, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('class', 'block h-auto w-full');
  svg.style.minWidth = '640px';
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `Tendencia mensual de MDR nacionales e importados para ${selectedYear}`);

  const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const ySteps = 4;
  for (let step = 0; step <= ySteps; step += 1) {
    const value = Math.round(maxValue * (ySteps - step) / ySteps);
    const y = margin.top + plotHeight * step / ySteps;
    const gridLine = document.createElementNS(svgNs, 'line');
    gridLine.setAttribute('x1', margin.left);
    gridLine.setAttribute('x2', width - margin.right);
    gridLine.setAttribute('y1', y);
    gridLine.setAttribute('y2', y);
    gridLine.setAttribute('stroke', '#e2e8f0');
    gridLine.setAttribute('stroke-width', '1');
    svg.appendChild(gridLine);

    const tickLabel = document.createElementNS(svgNs, 'text');
    tickLabel.setAttribute('x', margin.left - 8);
    tickLabel.setAttribute('y', y + 3);
    tickLabel.setAttribute('text-anchor', 'end');
    tickLabel.setAttribute('font-size', '9');
    tickLabel.setAttribute('fill', '#64748b');
    tickLabel.textContent = value.toLocaleString('es-AR');
    svg.appendChild(tickLabel);
  }

  monthLabels.forEach((label, index) => {
    const x = margin.left + plotWidth * index / (monthLabels.length - 1);
    const monthLabel = document.createElementNS(svgNs, 'text');
    monthLabel.setAttribute('x', x);
    monthLabel.setAttribute('y', height - 14);
    monthLabel.setAttribute('text-anchor', 'middle');
    monthLabel.setAttribute('font-size', '9');
    monthLabel.setAttribute('fill', '#64748b');
    monthLabel.textContent = label;
    svg.appendChild(monthLabel);
  });

  origins.forEach(origin => {
    const points = counts.map((monthCounts, monthIndex) => ({
      x: margin.left + plotWidth * monthIndex / (monthLabels.length - 1),
      y: margin.top + plotHeight * (1 - monthCounts[origin.key] / maxValue),
      value: monthCounts[origin.key],
      month: monthIndex + 1
    }));
    const path = document.createElementNS(svgNs, 'path');
    path.setAttribute('d', points.map((point, index) =>
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' '));
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', origin.color);
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('opacity', mdrInteractiveFilters.origin === null || mdrInteractiveFilters.origin === origin.key ? '0.9' : '0.25');
    svg.appendChild(path);

    points.forEach(point => {
      const circle = document.createElementNS(svgNs, 'circle');
      circle.setAttribute('cx', point.x);
      circle.setAttribute('cy', point.y);
      circle.setAttribute('r', mdrInteractiveFilters.year === selectedYear &&
        mdrInteractiveFilters.month === point.month &&
        mdrInteractiveFilters.origin === origin.key ? '5' : '3.5');
      circle.setAttribute('fill', origin.color);
      circle.setAttribute('stroke', '#fff');
      circle.setAttribute('stroke-width', '1.5');
      circle.setAttribute('opacity', mdrInteractiveFilters.origin === null || mdrInteractiveFilters.origin === origin.key ? '1' : '0.3');
      circle.setAttribute('tabindex', '0');
      circle.setAttribute('role', 'button');
      circle.setAttribute('aria-label', `${selectedYear}, ${monthLabels[point.month - 1]}, ${origin.label}: ${point.value} MDR. Seleccionar`);
      circle.setAttribute('class', 'cursor-pointer');
      const title = document.createElementNS(svgNs, 'title');
      title.textContent = `${selectedYear} · ${monthLabels[point.month - 1]} · ${origin.label}: ${point.value} MDR`;
      circle.appendChild(title);
      circle.addEventListener('click', () => toggleMdrMonthFilter(selectedYear, point.month, origin.key));
      circle.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggleMdrMonthFilter(selectedYear, point.month, origin.key);
        }
      });
      svg.appendChild(circle);
    });

    const originButton = document.createElement('button');
    originButton.type = 'button';
    originButton.className = `inline-flex items-center gap-1.5 rounded px-1.5 py-1 hover:bg-slate-50 ${mdrInteractiveFilters.origin === origin.key ? 'font-extrabold text-slate-900' : 'text-slate-600'}`;
    const swatch = document.createElement('span');
    swatch.className = 'h-2.5 w-2.5 rounded-full';
    swatch.style.backgroundColor = origin.color;
    const label = document.createElement('span');
    label.textContent = origin.label;
    originButton.append(swatch, label);
    originButton.title = `Filtrar MDR de origen ${origin.label.toLowerCase()}`;
    originButton.addEventListener('click', () => window.toggleMdrOriginFilter(origin.key));
    legend.appendChild(originButton);
  });

  chart.appendChild(svg);
}

function renderMdrTopSuppliers(origin, listId) {
  const list = document.getElementById(listId);
  if (!list) return;
  list.replaceChildren();

  const suppliers = new Map();
  getFilteredMdrRecords().forEach(record => {
    const supplier = record.supplier.trim();
    if (!supplier || record.origin !== origin) return;
    const key = supplier.toLocaleLowerCase('es-AR');
    const entry = suppliers.get(key) || { name: supplier, count: 0 };
    entry.count += 1;
    suppliers.set(key, entry);
  });

  const topSuppliers = Array.from(suppliers.values())
    .sort((supplierA, supplierB) => supplierB.count - supplierA.count || supplierA.name.localeCompare(supplierB.name, 'es'))
    .slice(0, 5);
  if (topSuppliers.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'text-[10px] text-slate-400';
    empty.textContent = 'No hay proveedores para mostrar.';
    list.appendChild(empty);
    return;
  }

  topSuppliers.forEach((supplier, index) => {
    const item = document.createElement('li');
    item.className = 'flex items-start justify-between gap-2 text-[10px]';
    const name = document.createElement('button');
    name.type = 'button';
    name.className = `min-w-0 text-left font-medium underline-offset-2 hover:text-red-700 hover:underline ${mdrInteractiveFilters.supplier === supplier.name.toLocaleLowerCase('es-AR') ? 'text-red-700 underline' : 'text-slate-700'}`;
    name.textContent = `${index + 1}. ${supplier.name}`;
    name.title = `Filtrar por ${supplier.name}`;
    name.addEventListener('click', () => toggleMdrSupplierFilter(supplier.name));
    const count = document.createElement('span');
    count.className = 'shrink-0 rounded-full bg-slate-100 px-2 py-0.5 font-bold text-slate-600';
    count.textContent = supplier.count.toLocaleString('es-AR');
    item.append(name, count);
    list.appendChild(item);
  });
}

function renderMdrSearchResults() {
  const input = document.getElementById('mdrSearchInput');
  const tbody = document.getElementById('mdrSearchResults');
  const countLabel = document.getElementById('mdrSearchCount');
  if (!input || !tbody || !countLabel) return;

  const query = input.value.trim().toLocaleLowerCase('es-AR');
  const matches = getFilteredMdrRecords().filter(record =>
    !query ||
    record.mdr.toLocaleLowerCase('es-AR').includes(query) ||
    record.model.toLocaleLowerCase('es-AR').includes(query)
  ).sort(compareMdrNewestFirst);
  const visibleRecords = matches.slice(0, 100);
  countLabel.textContent = matches.length > 100
    ? `${matches.length.toLocaleString('es-AR')} resultados · primeros 100`
    : `${matches.length.toLocaleString('es-AR')} resultados`;
  tbody.replaceChildren();

  if (visibleRecords.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 8;
    cell.className = 'px-3 py-8 text-center text-slate-400';
    cell.textContent = query ? 'No hay MDR que coincidan con ese número o modelo.' : 'No hay registros MDR para mostrar.';
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  visibleRecords.forEach(record => {
    const row = document.createElement('tr');
    row.className = 'align-top transition-colors hover:bg-slate-50';
    const values = [
      { text: record.mdr || '—', className: 'font-mono font-bold text-red-600' },
      { text: `${record.year}${record.date ? ` · ${record.date}` : ''}`, className: 'whitespace-nowrap text-slate-600' },
      { text: record.model || '—', className: 'font-semibold text-slate-800' },
      { text: record.line || '—', className: 'text-slate-600' },
      { text: `${record.supplier || 'Sin proveedor'}${record.origin ? ` · ${record.origin}` : ''}`, className: 'text-slate-700' },
      { text: record.description || '—', className: 'max-w-sm whitespace-normal text-slate-600' },
      { url: record.mdrFileUrl, label: 'Abrir MDR', className: 'whitespace-nowrap' },
      { url: record.response8dFileUrl, label: 'Abrir 8D', className: 'whitespace-nowrap' }
    ];
    values.forEach(value => {
      const cell = document.createElement('td');
      cell.className = `px-3 py-3 ${value.className}`;
      if (value.url) {
        try {
          const fileUrl = new URL(value.url);
          if (fileUrl.protocol === 'https:' || fileUrl.protocol === 'http:') {
            const link = document.createElement('a');
            link.href = fileUrl.href;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.className = 'font-semibold text-sky-700 underline decoration-sky-300 underline-offset-2 hover:text-sky-900';
            link.textContent = value.label;
            cell.appendChild(link);
          } else {
            cell.textContent = 'Enlace no válido';
          }
        } catch (error) {
          cell.textContent = 'Enlace no válido';
        }
      } else {
        cell.textContent = value.text || '—';
      }
      row.appendChild(cell);
    });
    tbody.appendChild(row);
  });
}

window.exportMdrToExcel = function() {
  const input = document.getElementById('mdrSearchInput');
  const query = input ? input.value.trim().toLocaleLowerCase('es-AR') : '';
  const matches = (typeof getFilteredMdrRecords === 'function' ? getFilteredMdrRecords() : [])
    .filter(record =>
      !query ||
      (record.mdr && record.mdr.toLocaleLowerCase('es-AR').includes(query)) ||
      (record.model && record.model.toLocaleLowerCase('es-AR').includes(query))
    )
    .sort(compareMdrNewestFirst);

  if (!matches || matches.length === 0) {
    if (typeof showToast === 'function') {
      showToast('No hay registros filtrados para exportar a Excel.');
    } else {
      alert('No hay registros filtrados para exportar a Excel.');
    }
    return;
  }

  const exportRows = matches.map(r => ({
    'N° MDR': r.mdr || '',
    'Año': r.year || '',
    'Fecha': r.date || '',
    'Planta': r.plant || '',
    'Línea': r.line || '',
    'Modelo': r.model || '',
    'Proveedor': r.supplier || '',
    'Origen': r.origin || '',
    'Detectó': r.detectedBy || '',
    'Problema detectado': r.description || '',
    'Estado': r.status || '',
    'Link MDR Enviado': r.mdrFileUrl || '',
    'Link Respuesta 8D': r.response8dFileUrl || ''
  }));

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const fileName = `MDR_Filtrados_${year}${month}${day}_${hours}${minutes}`;

  // Si SheetJS (XLSX) está disponible, generar un .xlsx real con columnas ajustadas
  if (window.XLSX && window.XLSX.utils) {
    try {
      const ws = window.XLSX.utils.json_to_sheet(exportRows);

      const colWidths = Object.keys(exportRows[0]).map(key => {
        let maxLen = key.length;
        for (let i = 0; i < Math.min(exportRows.length, 60); i++) {
          const val = String(exportRows[i][key] || '');
          if (val.length > maxLen) maxLen = val.length;
        }
        return { wch: Math.min(Math.max(maxLen + 3, 10), 65) };
      });
      ws['!cols'] = colWidths;

      const wb = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(wb, ws, 'MDR Filtrados');
      window.XLSX.writeFile(wb, `${fileName}.xlsx`);

      if (typeof showToast === 'function') {
        showToast(`✓ Se descargaron ${matches.length.toLocaleString('es-AR')} registros en ${fileName}.xlsx`);
      }
      return;
    } catch (err) {
      console.warn('Error al generar XLSX nativo, usando fallback CSV:', err);
    }
  }

  // Fallback: CSV con UTF-8 BOM y sep=; para apertura directa en Excel en español
  const headers = Object.keys(exportRows[0]);
  const csvLines = [
    'sep=;',
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(';'),
    ...exportRows.map(row =>
      headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(';')
    )
  ];

  const blob = new Blob(['\uFEFF' + csvLines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  if (typeof showToast === 'function') {
    showToast(`✓ Se descargaron ${matches.length.toLocaleString('es-AR')} registros en ${fileName}.csv`);
  }
};

// ==========================================
// 4B. BBDD DE EVENTOS TV (MODELO / PROVEEDOR / CHASIS)
// ==========================================
let tvEventsRecords = [];
const tvEventsFilters = {
  supplier: null,
  chassis: null,
  model: null,
  year: '',
  ncType: '',
  onlyWithUrl: false,
  onlyMdr: false
};

function getTvEventUrls(record) {
  if (Array.isArray(record.urls) && record.urls.length > 0) return record.urls;
  const raw = String(record.evidenceUrl || '').trim();
  if (!raw) return [];
  return raw.split(/[\s,\n]+/).map(u => u.trim()).filter(u => u.startsWith('http'));
}

function checkTvEventHasMdr(record) {
  if (!record) return false;
  if (record.hasMdr !== undefined) return Boolean(record.hasMdr);
  const k = String(record.defect || '').toLocaleUpperCase();
  const m = String(record.impact || '').toLocaleUpperCase();
  const n = String(record.containmentAction || '').toLocaleUpperCase();
  const o = String(record.correctiveAction || '').toLocaleUpperCase();
  return k.includes('MDR') || m.includes('MDR') || n.includes('MDR') || o.includes('MDR');
}

window.toggleTvEventsMdrOnly = function() {
  tvEventsFilters.onlyMdr = !tvEventsFilters.onlyMdr;
  renderTvEventsDashboard();
};

window.switchReportSubTab = function(subTab) {
  const btnAuditorias = document.getElementById('tabBtnReporteAuditorias');
  const btnEventos = document.getElementById('tabBtnReporteEventos');
  const panelAuditorias = document.getElementById('reportSubpanelAuditorias');
  const panelEventos = document.getElementById('reportSubpanelEventos');

  if (!btnAuditorias || !btnEventos || !panelAuditorias || !panelEventos) return;

  if (subTab === 'eventos') {
    panelAuditorias.classList.add('hidden');
    panelEventos.classList.remove('hidden');

    btnAuditorias.className = 'relative px-4 py-2 text-xs font-bold transition-colors border-b-2 border-transparent text-slate-500 hover:text-slate-800';
    btnEventos.className = 'relative px-4 py-2 text-xs font-bold transition-colors border-b-2 border-red-600 text-red-600';

    if (tvEventsRecords.length === 0) {
      window.loadTvEventsData(false);
    } else {
      renderTvEventsDashboard();
    }
  } else {
    panelEventos.classList.add('hidden');
    panelAuditorias.classList.remove('hidden');

    btnEventos.className = 'relative px-4 py-2 text-xs font-bold transition-colors border-b-2 border-transparent text-slate-500 hover:text-slate-800';
    btnAuditorias.className = 'relative px-4 py-2 text-xs font-bold transition-colors border-b-2 border-red-600 text-red-600';

    if (typeof window.renderAuditReports === 'function') {
      window.renderAuditReports();
    }
  }
};

function initTvEventsDashboard() {
  const searchInput = document.getElementById('tvEventsSearchInput');
  const yearSelect = document.getElementById('tvEventsYearFilter');
  const ncTypeSelect = document.getElementById('tvEventsNcTypeFilter');
  const onlyWithUrlCheckbox = document.getElementById('tvEventsOnlyWithUrl');
  const detailModal = document.getElementById('tvEventDetailModal');

  if (searchInput) {
    searchInput.addEventListener('input', () => renderTvEventsDashboard());
  }
  if (yearSelect) {
    yearSelect.addEventListener('change', () => {
      tvEventsFilters.year = yearSelect.value;
      renderTvEventsDashboard();
    });
  }
  if (ncTypeSelect) {
    ncTypeSelect.addEventListener('change', () => {
      tvEventsFilters.ncType = ncTypeSelect.value;
      renderTvEventsDashboard();
    });
  }
  if (onlyWithUrlCheckbox) {
    onlyWithUrlCheckbox.addEventListener('change', () => {
      tvEventsFilters.onlyWithUrl = Boolean(onlyWithUrlCheckbox.checked);
      renderTvEventsDashboard();
    });
  }
  if (detailModal) {
    detailModal.addEventListener('click', event => {
      if (event.target === detailModal) {
        window.closeTvEventDetailModal();
      }
    });
  }

  window.loadTvEventsData(false);
}

window.loadTvEventsData = async function(forceRefresh = false) {
  const status = document.getElementById('tvEventsDataStatus');
  const errorBox = document.getElementById('tvEventsLoadError');
  if (!status || !errorBox) return;

  status.textContent = 'Actualizando desde Google Sheets...';
  errorBox.classList.add('hidden');

  try {
    const endpoint = forceRefresh ? '/api/tv-events?refresh=1' : '/api/tv-events';
    const response = await fetch(endpoint, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`El servidor respondió ${response.status} ${response.statusText}.`);
    }
    const payload = await response.json();
    if (!Array.isArray(payload.records)) {
      throw new Error('La respuesta de la BBDD de Eventos TV no tiene el formato esperado.');
    }

    tvEventsRecords = payload.records;
    populateTvEventsFilterOptions();
    renderTvEventsDashboard();
    const fetchedDate = payload.fetchedAt ? new Date(payload.fetchedAt * 1000) : new Date();
    status.textContent = `Datos sincronizados · ${new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(fetchedDate)}`;
  } catch (error) {
    console.error('No se pudieron cargar los datos de Eventos TV:', error);
    status.textContent = 'Error al sincronizar';
    errorBox.textContent = `No se pudieron cargar los registros de Eventos TV desde Google Sheets (${error.message}). Verificá la conexión e intentá con "Actualizar datos".`;
    errorBox.classList.remove('hidden');
  }
};

function populateTvEventsFilterOptions() {
  const yearSelect = document.getElementById('tvEventsYearFilter');
  const ncTypeSelect = document.getElementById('tvEventsNcTypeFilter');

  if (yearSelect) {
    const currentVal = yearSelect.value;
    const years = Array.from(
      new Set(tvEventsRecords.map(r => r.year).filter(y => Number.isInteger(y)))
    ).sort((a, b) => b - a);
    yearSelect.replaceChildren();
    const allOpt = document.createElement('option');
    allOpt.value = '';
    allOpt.textContent = 'Todos';
    yearSelect.appendChild(allOpt);
    years.forEach(yr => {
      const opt = document.createElement('option');
      opt.value = String(yr);
      opt.textContent = String(yr);
      yearSelect.appendChild(opt);
    });
    if (years.map(String).includes(currentVal)) {
      yearSelect.value = currentVal;
    }
  }

  if (ncTypeSelect) {
    const currentVal = ncTypeSelect.value;
    const ncTypes = Array.from(
      new Set(tvEventsRecords.map(r => (r.ncType || '').trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, 'es'));
    ncTypeSelect.replaceChildren();
    const allOpt = document.createElement('option');
    allOpt.value = '';
    allOpt.textContent = 'Todos los tipos';
    ncTypeSelect.appendChild(allOpt);
    ncTypes.forEach(nc => {
      const opt = document.createElement('option');
      opt.value = nc;
      opt.textContent = nc;
      ncTypeSelect.appendChild(opt);
    });
    if (ncTypes.includes(currentVal)) {
      ncTypeSelect.value = currentVal;
    }
  }
}

function getFilteredTvEvents(excludeDimension = null) {
  const query = (document.getElementById('tvEventsSearchInput')?.value || '').trim().toLocaleLowerCase('es-AR');

  return tvEventsRecords.filter(record => {
    if (tvEventsFilters.year && String(record.year || '') !== tvEventsFilters.year) {
      return false;
    }
    if (tvEventsFilters.ncType && (record.ncType || '').trim() !== tvEventsFilters.ncType) {
      return false;
    }
    if (tvEventsFilters.onlyWithUrl && getTvEventUrls(record).length === 0) {
      return false;
    }
    if (tvEventsFilters.onlyMdr && !checkTvEventHasMdr(record)) {
      return false;
    }
    if (excludeDimension !== 'supplier' && tvEventsFilters.supplier !== null) {
      const sup = (record.supplier || '').trim() || 'Sin especificar';
      if (sup.toLocaleLowerCase('es-AR') !== tvEventsFilters.supplier) return false;
    }
    if (excludeDimension !== 'chassis' && tvEventsFilters.chassis !== null) {
      const ch = (record.chassis || '').trim() || 'Sin chasis';
      if (ch.toLocaleLowerCase('es-AR') !== tvEventsFilters.chassis) return false;
    }
    if (excludeDimension !== 'model' && tvEventsFilters.model !== null) {
      const mod = (record.model || '').trim() || 'Sin modelo';
      if (mod.toLocaleLowerCase('es-AR') !== tvEventsFilters.model) return false;
    }
    if (query) {
      const haystack = [
        record.eventNumber ? `#${record.eventNumber}` : '',
        record.eventNumber,
        record.model,
        record.otherModels,
        record.supplier,
        record.chassis,
        record.lot,
        record.ncType,
        record.partNumber,
        record.materialSupplier,
        record.defect,
        record.responsibleArea,
        record.impact,
        record.containmentAction,
        record.correctiveAction,
        record.considerations,
        record.date
      ].join(' ').toLocaleLowerCase('es-AR');
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

window.toggleTvEventsDimensionFilter = function(dimension, value) {
  const normalized = String(value || '').toLocaleLowerCase('es-AR');
  tvEventsFilters[dimension] = tvEventsFilters[dimension] === normalized ? null : normalized;
  renderTvEventsDashboard();
};

window.clearTvEventsFilters = function() {
  tvEventsFilters.supplier = null;
  tvEventsFilters.chassis = null;
  tvEventsFilters.model = null;
  tvEventsFilters.year = '';
  tvEventsFilters.ncType = '';
  tvEventsFilters.onlyWithUrl = false;
  tvEventsFilters.onlyMdr = false;

  const yearSelect = document.getElementById('tvEventsYearFilter');
  const ncTypeSelect = document.getElementById('tvEventsNcTypeFilter');
  const onlyWithUrlCheckbox = document.getElementById('tvEventsOnlyWithUrl');
  const searchInput = document.getElementById('tvEventsSearchInput');

  if (yearSelect) yearSelect.value = '';
  if (ncTypeSelect) ncTypeSelect.value = '';
  if (onlyWithUrlCheckbox) onlyWithUrlCheckbox.checked = false;
  if (searchInput) searchInput.value = '';

  renderTvEventsDashboard();
};

function renderTvEventsHorizontalChart({
  containerId,
  records,
  fieldExtractor,
  emptyLabel,
  dimensionKey,
  activeValue,
  barColorClass,
  activeBadgeClass,
  maxItems = 10
}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.replaceChildren();

  const countsMap = new Map();
  records.forEach(record => {
    const rawVal = (fieldExtractor(record) || '').trim() || emptyLabel;
    const key = rawVal.toLocaleLowerCase('es-AR');
    const current = countsMap.get(key) || { label: rawVal, key, count: 0 };
    current.count += 1;
    countsMap.set(key, current);
  });

  const sorted = Array.from(countsMap.values())
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'es'))
    .slice(0, maxItems);

  if (sorted.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'py-8 text-center text-xs text-slate-400';
    empty.textContent = 'Sin datos para los filtros seleccionados.';
    container.appendChild(empty);
    return;
  }

  const totalInChart = records.length || 1;
  const maxCount = Math.max(1, ...sorted.map(item => item.count));

  sorted.forEach((item, index) => {
    const isSelected = activeValue === item.key;
    const pct = Math.round((item.count / totalInChart) * 100);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `group w-full rounded-xl border px-3 py-2 text-left transition ${
      isSelected
        ? `${activeBadgeClass} ring-2 ring-red-200`
        : 'border-slate-100 bg-slate-50/60 hover:border-slate-200 hover:bg-white'
    }`;
    btn.title = `Filtrar por ${item.label}: ${item.count} eventos (${pct}%)`;
    btn.addEventListener('click', () => window.toggleTvEventsDimensionFilter(dimensionKey, item.label));

    const headerRow = document.createElement('div');
    headerRow.className = 'flex items-center justify-between gap-2 text-xs';

    const labelSpan = document.createElement('span');
    labelSpan.className = `truncate font-bold ${isSelected ? 'text-red-700' : 'text-slate-800 group-hover:text-red-600'}`;
    labelSpan.textContent = `${index + 1}. ${item.label}`;

    const countSpan = document.createElement('span');
    countSpan.className = 'shrink-0 font-mono text-[11px] font-bold text-slate-600';
    countSpan.textContent = `${item.count} (${pct}%)`;

    headerRow.append(labelSpan, countSpan);

    const track = document.createElement('div');
    track.className = 'mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-200/70';

    const bar = document.createElement('div');
    bar.className = `h-full rounded-full transition-all duration-300 ${barColorClass}`;
    bar.style.width = `${Math.max(4, (item.count / maxCount) * 100)}%`;

    track.appendChild(bar);
    btn.append(headerRow, track);
    container.appendChild(btn);
  });
}

function renderTvEventsDashboard() {
  const filtered = getFilteredTvEvents();

  // KPIs
  const totalEl = document.getElementById('tvEventsTotalCount');
  const totalSubEl = document.getElementById('tvEventsTotalSub');
  const withUrlEl = document.getElementById('tvEventsWithUrlCount');
  const withUrlSubEl = document.getElementById('tvEventsWithUrlSub');
  const modelsCountEl = document.getElementById('tvEventsModelsCount');
  const topModelSubEl = document.getElementById('tvEventsTopModelSub');
  const supChassisEl = document.getElementById('tvEventsSuppliersChassisCount');
  const topSupplierSubEl = document.getElementById('tvEventsTopSupplierSub');

  const withUrlCount = filtered.filter(r => getTvEventUrls(r).length > 0).length;
  const totalLinksCount = filtered.reduce((acc, r) => acc + getTvEventUrls(r).length, 0);

  // Alerta MDR en columnas K, M, N, O
  const totalMdrCount = tvEventsRecords.filter(checkTvEventHasMdr).length;
  const mdrBanner = document.getElementById('tvEventsMdrBanner');
  const mdrBannerCount = document.getElementById('tvEventsMdrBannerCount');
  const mdrFilterBtn = document.getElementById('btnTvEventsFilterMdr');
  const mdrCountBadge = document.getElementById('tvEventsMdrCountBadge');

  if (mdrBanner && mdrBannerCount) {
    if (totalMdrCount > 0) {
      mdrBanner.classList.remove('hidden');
      mdrBannerCount.textContent = totalMdrCount;
    } else {
      mdrBanner.classList.add('hidden');
    }
  }
  if (mdrFilterBtn && mdrCountBadge) {
    mdrCountBadge.textContent = tvEventsFilters.onlyMdr
      ? `Mostrando MDR (${totalMdrCount}) ✕`
      : `MDR (${totalMdrCount})`;
    mdrFilterBtn.className = tvEventsFilters.onlyMdr
      ? 'inline-flex items-center gap-1.5 rounded-lg border border-rose-700 bg-rose-600 px-2.5 py-1 text-[11px] font-black text-white shadow-sm transition cursor-pointer'
      : 'inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-extrabold text-rose-700 shadow-2xs transition hover:bg-rose-100 hover:border-rose-300 cursor-pointer';
  }

  const uniqueModels = new Set(filtered.map(r => (r.model || '').trim()).filter(Boolean));
  const uniqueSuppliers = new Set(filtered.map(r => (r.supplier || '').trim()).filter(Boolean));
  const uniqueChassis = new Set(filtered.map(r => (r.chassis || '').trim()).filter(Boolean));

  if (totalEl) totalEl.textContent = filtered.length.toLocaleString('es-AR');
  if (totalSubEl) {
    totalSubEl.textContent = filtered.length === tvEventsRecords.length
      ? `Total histórico (${tvEventsRecords.length} eventos)`
      : `Filtrado de ${tvEventsRecords.length} eventos totales`;
  }
  if (withUrlEl) withUrlEl.textContent = withUrlCount.toLocaleString('es-AR');
  if (withUrlSubEl) {
    const pct = filtered.length ? Math.round((withUrlCount / filtered.length) * 100) : 0;
    withUrlSubEl.textContent = `${pct}% con link · ${totalLinksCount} archivos en Col. Q`;
  }
  if (modelsCountEl) modelsCountEl.textContent = uniqueModels.size.toLocaleString('es-AR');
  if (topModelSubEl) {
    topModelSubEl.textContent = tvEventsFilters.model
      ? `Filtro activo: ${tvEventsFilters.model.toUpperCase()}`
      : 'Modelos con eventos registrados';
  }
  if (supChassisEl) {
    supChassisEl.textContent = `${uniqueSuppliers.size} prov. · ${uniqueChassis.size} chasis`;
  }
  if (topSupplierSubEl) {
    topSupplierSubEl.textContent = tvEventsFilters.supplier
      ? `Proveedor: ${tvEventsFilters.supplier.toUpperCase()}`
      : 'Proveedores y plataformas activas';
  }

  // Resumen de filtros activos
  const activeParts = [];
  if (tvEventsFilters.supplier) activeParts.push(`Proveedor: ${tvEventsFilters.supplier.toUpperCase()}`);
  if (tvEventsFilters.chassis) activeParts.push(`Chasis: ${tvEventsFilters.chassis.toUpperCase()}`);
  if (tvEventsFilters.model) activeParts.push(`Modelo: ${tvEventsFilters.model.toUpperCase()}`);
  if (tvEventsFilters.year) activeParts.push(`Año: ${tvEventsFilters.year}`);
  if (tvEventsFilters.ncType) activeParts.push(`Tipo NC: ${tvEventsFilters.ncType}`);
  if (tvEventsFilters.onlyWithUrl) activeParts.push('Solo con URL (Col. Q)');
  if (tvEventsFilters.onlyMdr) activeParts.push('Solo eventos con MDR');
  const searchVal = (document.getElementById('tvEventsSearchInput')?.value || '').trim();
  if (searchVal) activeParts.push(`Búsqueda: "${searchVal}"`);

  const activeFiltersText = document.getElementById('tvEventsActiveFiltersText');
  const clearBtn = document.getElementById('tvEventsClearFiltersBtn');
  if (activeFiltersText) {
    activeFiltersText.textContent = activeParts.length
      ? `Filtros activos: ${activeParts.join(' · ')}`
      : 'Hacé clic en cualquier barra de Proveedor, Chasis o Modelo para filtrar todo el panel.';
  }
  if (clearBtn) {
    clearBtn.classList.toggle('hidden', activeParts.length === 0);
  }

  // Gráfico 1: Por Proveedor (Columna E)
  renderTvEventsHorizontalChart({
    containerId: 'tvEventsSupplierChart',
    records: getFilteredTvEvents('supplier'),
    fieldExtractor: r => r.supplier,
    emptyLabel: 'Sin proveedor',
    dimensionKey: 'supplier',
    activeValue: tvEventsFilters.supplier,
    barColorClass: 'bg-red-500',
    activeBadgeClass: 'border-red-300 bg-red-50/70',
    maxItems: 10
  });

  // Gráfico 2: Por Chasis (Columna F)
  renderTvEventsHorizontalChart({
    containerId: 'tvEventsChassisChart',
    records: getFilteredTvEvents('chassis'),
    fieldExtractor: r => r.chassis,
    emptyLabel: 'Sin chasis',
    dimensionKey: 'chassis',
    activeValue: tvEventsFilters.chassis,
    barColorClass: 'bg-violet-500',
    activeBadgeClass: 'border-violet-300 bg-violet-50/70',
    maxItems: 10
  });

  // Gráfico 3: Por Modelo (Columna C)
  renderTvEventsHorizontalChart({
    containerId: 'tvEventsModelChart',
    records: getFilteredTvEvents('model'),
    fieldExtractor: r => r.model,
    emptyLabel: 'Sin modelo',
    dimensionKey: 'model',
    activeValue: tvEventsFilters.model,
    barColorClass: 'bg-sky-500',
    activeBadgeClass: 'border-sky-300 bg-sky-50/70',
    maxItems: 10
  });

  // Tabla
  renderTvEventsTable(filtered);
}

function compareTvEventsNewestFirst(a, b) {
  const numA = Number.parseInt(a.eventNumber, 10);
  const numB = Number.parseInt(b.eventNumber, 10);
  if ((b.sortTs || 0) !== (a.sortTs || 0)) {
    return (b.sortTs || 0) - (a.sortTs || 0);
  }
  if (!Number.isNaN(numA) && !Number.isNaN(numB) && numB !== numA) {
    return numB - numA;
  }
  return (b.rowNumber || 0) - (a.rowNumber || 0);
}

function createTvEventTextCell(text, colLabel, maxWidthClass = 'max-w-[200px]') {
  const td = document.createElement('td');
  td.className = `px-3 py-2.5 text-xs text-slate-700 ${maxWidthClass} align-top`;

  const val = String(text || '').trim();
  if (!val) {
    td.className += ' text-slate-300 italic';
    td.textContent = '—';
    return td;
  }

  td.setAttribute('title', `${colLabel}:\n${val}`);

  const wrapper = document.createElement('div');
  wrapper.className = 'cell-hover-popover line-clamp-2 leading-relaxed cursor-help font-medium transition-colors hover:text-slate-950';
  wrapper.dataset.fullText = val;
  wrapper.dataset.colLabel = colLabel;

  if (/MDR/i.test(val)) {
    const parts = val.split(/(MDR[^\s,.]*)/i);
    parts.forEach(part => {
      if (/^MDR/i.test(part)) {
        const mdrPill = document.createElement('span');
        mdrPill.className = 'inline-block rounded bg-rose-600 px-1 py-0.2 text-[10px] font-black text-white shadow-2xs mx-0.5';
        mdrPill.textContent = part;
        wrapper.appendChild(mdrPill);
      } else if (part) {
        wrapper.appendChild(document.createTextNode(part));
      }
    });
  } else {
    wrapper.textContent = val;
  }

  td.appendChild(wrapper);
  return td;
}

function renderTvEventsTable(records) {
  const tbody = document.getElementById('tvEventsTableBody');
  const countLabel = document.getElementById('tvEventsSearchCount');
  if (!tbody || !countLabel) return;

  const sorted = [...records].sort(compareTvEventsNewestFirst);
  const visible = sorted.slice(0, 150);

  countLabel.textContent = sorted.length > 150
    ? `${sorted.length.toLocaleString('es-AR')} eventos · mostrando 150`
    : `${sorted.length.toLocaleString('es-AR')} eventos`;

  tbody.replaceChildren();

  if (visible.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 12;
    td.className = 'px-3 py-8 text-center text-slate-400';
    td.textContent = 'No hay eventos que coincidan con los filtros seleccionados.';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  visible.forEach(record => {
    const hasMdr = checkTvEventHasMdr(record);
    const tr = document.createElement('tr');
    tr.className = hasMdr
      ? 'align-top transition-colors bg-rose-50/50 hover:bg-rose-100/60 border-l-4 border-l-rose-500'
      : 'align-top transition-colors hover:bg-slate-50/90';

    // 1. N° Evento (Col V) + Alerta MDR
    const tdNum = document.createElement('td');
    tdNum.className = 'px-3 py-2.5 whitespace-nowrap';
    const numWrap = document.createElement('div');
    numWrap.className = 'flex flex-col items-start gap-1';

    const numBadge = document.createElement('span');
    numBadge.className = 'inline-flex items-center rounded-md bg-red-50 border border-red-200 px-2 py-0.5 font-mono text-xs font-extrabold text-red-700';
    numBadge.textContent = record.eventNumber !== '' ? `#${record.eventNumber}` : 'S/N';
    numWrap.appendChild(numBadge);

    if (record.date || record.timestamp) {
      const dtSpan = document.createElement('span');
      dtSpan.className = 'text-[10px] text-slate-400 font-medium';
      dtSpan.textContent = record.date || record.timestamp;
      numWrap.appendChild(dtSpan);
    }

    if (hasMdr) {
      const mdrBadge = document.createElement('span');
      mdrBadge.className = 'inline-flex items-center gap-1 rounded bg-rose-600 px-1.5 py-0.5 text-[9px] font-black uppercase text-white shadow-2xs tracking-wide animate-pulse';
      mdrBadge.textContent = '🚨 ALERTA MDR';
      mdrBadge.title = 'Se detectó la palabra MDR para gestionar reclamo';
      numWrap.appendChild(mdrBadge);
    }
    tdNum.appendChild(numWrap);

    // 2. Modelo (Col C)
    const tdModel = document.createElement('td');
    tdModel.className = 'px-3 py-2.5 max-w-[160px] align-top';
    const modelText = record.model || '—';
    const modelBtn = document.createElement('button');
    modelBtn.type = 'button';
    modelBtn.className = 'cell-hover-popover text-left font-bold text-slate-900 hover:text-red-600 hover:underline line-clamp-2';
    modelBtn.textContent = modelText;
    modelBtn.dataset.fullText = modelText;
    modelBtn.dataset.colLabel = 'Modelo (Col. C)';
    modelBtn.title = modelText;
    if (record.model) {
      modelBtn.addEventListener('click', () => window.toggleTvEventsDimensionFilter('model', record.model));
    }
    tdModel.appendChild(modelBtn);
    if (record.otherModels) {
      const otherP = document.createElement('p');
      otherP.className = 'cell-hover-popover mt-0.5 text-[10px] text-slate-500 line-clamp-1 cursor-help';
      otherP.textContent = `Aplica a: ${record.otherModels}`;
      otherP.dataset.fullText = record.otherModels;
      otherP.dataset.colLabel = 'Otros Modelos (Col. D)';
      tdModel.appendChild(otherP);
    }

    // 3. Tipo NC (Col H)
    const tdType = document.createElement('td');
    tdType.className = 'px-3 py-2.5 align-top whitespace-nowrap';
    if (record.ncType) {
      const badge = document.createElement('span');
      badge.className = 'inline-block rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800';
      badge.textContent = record.ncType;
      tdType.appendChild(badge);
    } else {
      tdType.innerHTML = '<span class="text-slate-300">—</span>';
    }

    // 4. P/N (Col I)
    const tdPn = document.createElement('td');
    tdPn.className = 'px-3 py-2.5 align-top whitespace-nowrap font-mono text-[11px] text-slate-700';
    if (record.partNumber) {
      const pnSpan = document.createElement('span');
      pnSpan.className = 'cell-hover-popover rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-800 cursor-help inline-block max-w-[120px] truncate';
      pnSpan.textContent = record.partNumber;
      pnSpan.dataset.fullText = record.partNumber;
      pnSpan.dataset.colLabel = 'P/N (Col. I)';
      pnSpan.title = record.partNumber;
      tdPn.appendChild(pnSpan);
    } else {
      tdPn.innerHTML = '<span class="text-slate-300">—</span>';
    }

    // 5. Defecto / Problema (Col K)
    const tdDefect = createTvEventTextCell(record.defect, 'Defecto / Problema (Col. K)', 'max-w-[220px]');

    // 6. Área responsable (Col L)
    const tdArea = document.createElement('td');
    tdArea.className = 'px-3 py-2.5 align-top text-xs text-slate-700 font-medium max-w-[130px]';
    if (record.responsibleArea) {
      const areaSpan = document.createElement('div');
      areaSpan.className = 'cell-hover-popover line-clamp-2 cursor-help';
      areaSpan.textContent = record.responsibleArea;
      areaSpan.dataset.fullText = record.responsibleArea;
      areaSpan.dataset.colLabel = 'Área Responsable (Col. L)';
      areaSpan.title = record.responsibleArea;
      tdArea.appendChild(areaSpan);
    } else {
      tdArea.innerHTML = '<span class="text-slate-300">—</span>';
    }

    // 7. Impacto (Col M)
    const tdImpact = createTvEventTextCell(record.impact, 'Impacto (Col. M)', 'max-w-[200px]');

    // 8. Acción Contención (Col N)
    const tdContainment = createTvEventTextCell(record.containmentAction, 'Acción de Contención (Col. N)', 'max-w-[220px]');

    // 9. Acción Correctiva (Col O)
    const tdCorrective = createTvEventTextCell(record.correctiveAction, 'Acción Correctiva (Col. O)', 'max-w-[220px]');

    // 10. URL Fotos / Evidencia (Col Q)
    const tdUrls = document.createElement('td');
    tdUrls.className = 'px-3 py-2.5 align-top';
    const urls = getTvEventUrls(record);
    if (urls.length > 0) {
      const wrap = document.createElement('div');
      wrap.className = 'flex flex-wrap gap-1';
      urls.forEach((rawUrl, idx) => {
        try {
          const parsed = new URL(rawUrl);
          if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
            const a = document.createElement('a');
            a.href = parsed.href;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.className = 'inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-[10px] font-bold text-sky-700 transition hover:border-sky-400 hover:bg-sky-100';
            a.textContent = urls.length === 1 ? 'Ver Foto' : `Foto ${idx + 1}`;
            a.title = parsed.href;
            wrap.appendChild(a);
          }
        } catch (e) {}
      });
      tdUrls.appendChild(wrap);
    } else {
      tdUrls.innerHTML = '<span class="text-slate-300 text-[11px] italic">Sin link</span>';
    }

    // 11. Observaciones / Consideraciones (Col R)
    const tdObs = createTvEventTextCell(record.observations || record.considerations, 'Observaciones / Consideraciones (Col. R)', 'max-w-[200px]');

    // 12. Botón Detalle
    const tdAction = document.createElement('td');
    tdAction.className = 'px-3 py-2.5 text-right whitespace-nowrap align-top';
    const detailBtn = document.createElement('button');
    detailBtn.type = 'button';
    detailBtn.className = 'rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700 cursor-pointer';
    detailBtn.textContent = 'Ver ficha';
    detailBtn.addEventListener('click', () => window.openTvEventDetailModal(record));
    tdAction.appendChild(detailBtn);

    tr.append(
      tdNum,
      tdModel,
      tdType,
      tdPn,
      tdDefect,
      tdArea,
      tdImpact,
      tdContainment,
      tdCorrective,
      tdUrls,
      tdObs,
      tdAction
    );
    tbody.appendChild(tr);
  });
}

// ==========================================
// TOOLTIP FLOTANTE PARA CELDAS CON TEXTO LARGO
// ==========================================
if (!window.__tvCellTooltipBound) {
  window.__tvCellTooltipBound = true;
  document.addEventListener('mouseover', function(e) {
    const target = e.target.closest('.cell-hover-popover');
    const tooltip = document.getElementById('globalCellTooltip');
    if (!target || !tooltip) return;

    const fullText = target.dataset.fullText;
    const colLabel = target.dataset.colLabel || 'Detalle';
    if (!fullText) return;

    const contentEl = document.getElementById('globalCellTooltipContent');
    const labelEl = document.getElementById('globalCellTooltipLabel');
    if (contentEl) contentEl.textContent = fullText;
    if (labelEl) labelEl.textContent = colLabel;

    tooltip.classList.remove('hidden');

    const rect = target.getBoundingClientRect();
    const tipWidth = Math.min(380, window.innerWidth - 30);
    tooltip.style.width = tipWidth + 'px';

    let left = rect.left;
    if (left + tipWidth > window.innerWidth - 15) {
      left = window.innerWidth - tipWidth - 15;
    }
    if (left < 10) left = 10;

    let top = rect.bottom + 8;
    const estHeight = tooltip.offsetHeight || 130;
    if (top + estHeight > window.innerHeight - 15) {
      top = Math.max(10, rect.top - 10 - estHeight);
    }

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
  });

  document.addEventListener('mouseout', function(e) {
    const target = e.target.closest('.cell-hover-popover');
    const tooltip = document.getElementById('globalCellTooltip');
    if (target && tooltip) {
      tooltip.classList.add('hidden');
    }
  });
}

window.openTvEventDetailModal = function(record) {
  const modal = document.getElementById('tvEventDetailModal');
  const badge = document.getElementById('tvEventDetailBadge');
  const title = document.getElementById('tvEventDetailModalTitle');
  const meta = document.getElementById('tvEventDetailMeta');
  const body = document.getElementById('tvEventDetailBody');
  if (!modal || !badge || !title || !meta || !body) return;

  badge.textContent = `Evento #${record.eventNumber !== '' ? record.eventNumber : 'S/N'} (Columna V)`;
  title.textContent = `${record.model || 'Sin modelo'} · ${record.supplier || 'Sin proveedor'}`;
  meta.textContent = `Fecha: ${record.timestamp || record.date || '—'} · Chasis: ${record.chassis || '—'} · Lote: ${record.lot || '—'} · Registró: ${record.email || '—'}`;

  body.replaceChildren();

  const fields = [
    { label: 'Tipo de No Conformidad (Col. H)', value: record.ncType },
    { label: 'Área responsable (Col. L)', value: record.responsibleArea },
    { label: 'Otros modelos a los que aplica (Col. D)', value: record.otherModels },
    { label: 'Part Number / P/N (Col. I)', value: record.partNumber },
    { label: 'Proveedor de material (Col. J)', value: record.materialSupplier },
    { label: 'Semi elaborado (Col. S)', value: record.semiFinished },
    { label: 'Defecto / Problema detectado (Col. K)', value: record.defect },
    { label: 'Considerar que (Col. R)', value: record.considerations },
    { label: 'Impacto en línea / producción (Col. M)', value: record.impact },
    { label: 'Acción de contención (Col. N)', value: record.containmentAction },
    { label: 'Acción correctiva y responsable (Col. O)', value: record.correctiveAction },
    { label: 'Contactos a considerar (Col. P)', value: record.contacts },
    { label: 'Cumplimiento de acción (Col. T)', value: record.actionCompliance }
  ];

  fields.forEach(item => {
    if (!item.value) return;
    const box = document.createElement('div');
    box.className = 'rounded-xl border border-slate-100 bg-slate-50/70 p-3';
    const lbl = document.createElement('p');
    lbl.className = 'text-[10px] font-extrabold uppercase tracking-wider text-slate-500';
    lbl.textContent = item.label;
    const val = document.createElement('p');
    val.className = 'mt-1 whitespace-pre-line text-xs text-slate-800 leading-relaxed';
    val.textContent = item.value;
    box.append(lbl, val);
    body.appendChild(box);
  });

  if (Array.isArray(record.urls) && record.urls.length > 0) {
    const urlBox = document.createElement('div');
    urlBox.className = 'rounded-xl border border-sky-100 bg-sky-50/60 p-3';
    const lbl = document.createElement('p');
    lbl.className = 'text-[10px] font-extrabold uppercase tracking-wider text-sky-700';
    lbl.textContent = `Evidencias / Archivos en Columna Q (${record.urls.length})`;
    const linksWrap = document.createElement('div');
    linksWrap.className = 'mt-2 flex flex-wrap gap-2';
    record.urls.forEach((rawUrl, i) => {
      try {
        const parsed = new URL(rawUrl);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          const a = document.createElement('a');
          a.href = parsed.href;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.className = 'inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-xs font-bold text-sky-800 shadow-2xs hover:border-sky-400 hover:bg-sky-50';
          a.textContent = `Abrir Evidencia ${i + 1} ↗`;
          linksWrap.appendChild(a);
        }
      } catch (e) {
        // ignore invalid url
      }
    });
    urlBox.append(lbl, linksWrap);
    body.appendChild(urlBox);
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
};

window.closeTvEventDetailModal = function() {
  const modal = document.getElementById('tvEventDetailModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
};

window.exportTvEventsToExcel = function() {
  const matches = getFilteredTvEvents().sort(compareTvEventsNewestFirst);
  if (!matches.length) {
    if (typeof showToast === 'function') {
      showToast('No hay eventos filtrados para exportar.');
    }
    return;
  }

  const exportRows = matches.map(r => ({
    'N° Evento (Col. V)': r.eventNumber || '',
    'Fecha': r.timestamp || r.date || '',
    'Modelo (Col. C)': r.model || '',
    'Otros Modelos (Col. D)': r.otherModels || '',
    'Proveedor de Modelo (Col. E)': r.supplier || '',
    'Chasis (Col. F)': r.chassis || '',
    'Lote (Col. G)': r.lot || '',
    'Tipo NC (Col. H)': r.ncType || '',
    'P/N (Col. I)': r.partNumber || '',
    'Proveedor Material (Col. J)': r.materialSupplier || '',
    'Defecto / Problema (Col. K)': r.defect || '',
    'Área Responsable (Col. L)': r.responsibleArea || '',
    'Impacto (Col. M)': r.impact || '',
    'Acción de Contención (Col. N)': r.containmentAction || '',
    'Acción Correctiva (Col. O)': r.correctiveAction || '',
    'Considerar que (Col. R)': (r.observations || r.considerations || ''),
    'URL Evidencias (Col. Q)': getTvEventUrls(r).join(' , ')
  }));

  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const fileName = `Eventos_TV_Planta5_${stamp}`;

  if (window.XLSX && window.XLSX.utils) {
    try {
      const ws = window.XLSX.utils.json_to_sheet(exportRows);
      const wb = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(wb, ws, 'Eventos TV');
      window.XLSX.writeFile(wb, `${fileName}.xlsx`);
      if (typeof showToast === 'function') {
        showToast(`✓ Se exportaron ${matches.length.toLocaleString('es-AR')} eventos en ${fileName}.xlsx`);
      }
      return;
    } catch (err) {
      console.warn('Fallback a CSV en exportación de Eventos TV:', err);
    }
  }

  const headers = Object.keys(exportRows[0]);
  const csvLines = [
    'sep=;',
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(';'),
    ...exportRows.map(row =>
      headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(';')
    )
  ];
  const blob = new Blob(['\uFEFF' + csvLines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ==========================================
// 5. AUTENTICACIÓN
// ==========================================
async function requestAuthApi(path, options = {}) {
  const canUseOfflineAuth = path.startsWith('/api/auth/') || path.startsWith('/api/admin/users');
  try {
    const response = await fetch(path, {
      ...options,
      credentials: 'same-origin',
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {})
      }
    });

    if (canUseOfflineAuth && !response.ok && (response.status === 404 || response.status === 0)) {
      return runMockAuthApi(path, options);
    }

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : {};
    if (!response.ok) {
      const error = new Error(payload.error || `Error de autenticación (${response.status}).`);
      error.status = response.status;
      throw error;
    }
    return payload;
  } catch (error) {
    if (canUseOfflineAuth && error && typeof error.status !== 'number') {
      return runMockAuthApi(path, options);
    }
    throw error;
  }
}

let authSessionCheckInProgress = false;
let authLoginInProgress = false;

function isAdministrator(user = AppState.currentUser) {
  return Boolean(user?.isAdmin);
}

function initQualityTeamManagement() {
  const form = document.getElementById('qualityTeamMemberForm');
  const toggleButton = document.getElementById('qualityTeamToggleForm');
  const cancelButton = document.getElementById('qualityTeamCancelForm');
  const nameInput = document.getElementById('qualityTeamName');
  const sectorInput = document.getElementById('qualityTeamSector');
  const emailInput = document.getElementById('qualityTeamEmail');
  const phoneInput = document.getElementById('qualityTeamPhone');
  const phone2Input = document.getElementById('qualityTeamPhone2');
  const formTitle = document.getElementById('qualityTeamFormTitle');
  const saveButton = document.getElementById('qualityTeamSaveMember');
  if (!form || !toggleButton || !cancelButton) return;

  toggleButton.addEventListener('click', () => {
    if (!isAdministrator()) return;
    form.reset();
    delete form.dataset.editingId;
    if (formTitle) formTitle.textContent = 'Agregar integrante';
    if (saveButton) saveButton.textContent = 'Guardar integrante';
    setQualityTeamFormMessage('');
    form.classList.remove('hidden');
    nameInput?.focus();
  });
  cancelButton.addEventListener('click', () => {
    form.reset();
    delete form.dataset.editingId;
    form.classList.add('hidden');
    if (formTitle) formTitle.textContent = 'Administrar equipo';
    if (saveButton) saveButton.textContent = 'Guardar integrante';
    setQualityTeamFormMessage('');
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!isAdministrator()) {
      showToast('Solo los administradores pueden modificar el equipo.');
      return;
    }

    if (saveButton) saveButton.disabled = true;
    const editingId = form.dataset.editingId;
    try {
      await requestAuthApi(editingId ? `/api/quality-team/${encodeURIComponent(editingId)}` : '/api/quality-team', {
        method: editingId ? 'PATCH' : 'POST',
        body: JSON.stringify({
          fullName: nameInput.value.trim(),
          sector: sectorInput.value.trim(),
          email: emailInput.value.trim(),
          phone: phoneInput.value.trim(),
          phone2: phone2Input.value.trim()
        })
      });
      form.reset();
      delete form.dataset.editingId;
      form.classList.add('hidden');
      if (formTitle) formTitle.textContent = 'Administrar equipo';
      if (saveButton) saveButton.textContent = 'Guardar integrante';
      setQualityTeamFormMessage('');
      await loadQualityTeamMembers();
      showToast(editingId ? 'Integrante actualizado.' : 'Integrante agregado al equipo.');
    } catch (error) {
      setQualityTeamFormMessage(error.message || 'No se pudo agregar el integrante.');
    } finally {
      if (saveButton) saveButton.disabled = false;
    }
  });
}

function setQualityTeamFormMessage(message) {
  const messageBox = document.getElementById('qualityTeamFormMessage');
  if (!messageBox) return;
  messageBox.textContent = message;
  messageBox.classList.toggle('hidden', !message);
  messageBox.className = message
    ? 'rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700'
    : 'hidden';
}

async function loadQualityTeamMembers() {
  const status = document.getElementById('qualityTeamStatus');
  const leadership = document.getElementById('qualityTeamLeadership');
  const departments = document.getElementById('qualityTeamDepartments');
  if (!status || !leadership || !departments) return;

  status.textContent = 'Cargando integrantes...';
  status.className = 'mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600';
  try {
    const response = await requestAuthApi('/api/quality-team');
    if (!Array.isArray(response.members)) {
      throw new Error('La respuesta del equipo no tiene el formato esperado.');
    }
    leadership.replaceChildren();
    departments.replaceChildren();

    const normalizeSector = sector => sector.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
    const groups = [
      { title: 'IQC', icon: '📦', color: 'sky', description: 'Control de calidad de ingreso', matches: sector => sector.startsWith('iqc'), members: [] },
      { title: 'Analistas', icon: '📊', color: 'violet', description: 'Análisis y seguimiento de calidad', matches: sector => sector.startsWith('analista'), members: [] },
      { title: 'Auditores', icon: '🔎', color: 'amber', description: 'Controles diarios por línea: inicio, torque y ESD', matches: sector => sector.startsWith('auditor'), members: [] },
      { title: 'OQC', icon: '✅', color: 'emerald', description: 'Control de calidad de salida', matches: sector => sector.includes('oqc'), members: [] },
      { title: 'QA', icon: '🛡️', color: 'rose', description: 'Aseguramiento de calidad', matches: sector => sector === 'qa' || sector.includes(' qa'), members: [] },
      { title: 'Reparaciones', icon: '🧰', color: 'orange', description: 'Soporte y reparación de producto', matches: sector => sector.includes('reparacion'), members: [] }
    ];
    const leaders = [];
    const otherMembers = [];

    response.members.forEach(member => {
      const sector = normalizeSector(member.sector);
      if (sector.includes('jefatura')) {
        leaders.push(member);
        return;
      }
      const matchedGroups = groups.filter(group => group.matches(sector));
      if (matchedGroups.length) {
        matchedGroups.forEach(group => group.members.push(member));
      } else {
        otherMembers.push(member);
      }
    });

    if (leaders.length) {
      const leader = leaders[0];
      const leaderCard = document.createElement('article');
      leaderCard.className = 'mx-auto max-w-md overflow-hidden rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 via-white to-orange-50 shadow-sm';
      const content = document.createElement('div');
      content.className = 'flex items-center gap-4 p-4 sm:p-5';
      const initials = document.createElement('div');
      initials.className = 'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-rose-500 text-sm font-extrabold text-white shadow-lg shadow-red-200';
      initials.textContent = leader.fullName.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
      const details = document.createElement('div');
      details.className = 'min-w-0 flex-1';
      const role = document.createElement('span');
      role.className = 'text-[9px] font-extrabold uppercase tracking-[0.16em] text-red-600';
      role.textContent = leader.sector;
      const name = document.createElement('h4');
      name.className = 'mt-0.5 text-sm font-extrabold text-slate-900';
      name.textContent = leader.fullName;
      const leadershipBadge = document.createElement('span');
      leadershipBadge.className = 'hidden rounded-full border border-red-100 bg-white/80 px-2.5 py-1 text-[9px] font-bold text-red-600 sm:inline-flex';
      leadershipBadge.textContent = 'Liderazgo';
      details.append(role, name);
      if (leader.email) {
        const email = document.createElement('a');
        email.className = 'mt-0.5 block break-all text-[11px] text-slate-500 hover:text-red-600';
        email.href = `mailto:${leader.email}`;
        email.textContent = leader.email;
        details.appendChild(email);
      }
      [
        ['Personal', leader.phone],
        ['Corporativo', leader.phone2]
      ].filter(([, number]) => number).forEach(([type, number]) => {
        const phone = document.createElement('a');
        phone.className = 'mt-0.5 block text-[11px] text-slate-500 hover:text-red-600';
        phone.href = `tel:${number.replace(/[^\d+]/g, '')}`;
        phone.textContent = `${type}: ${number}`;
        details.appendChild(phone);
      });
      content.append(initials, details, leadershipBadge);
      if (isAdministrator()) {
        content.appendChild(createQualityTeamActions(leader));
      }
      leaderCard.appendChild(content);
      leadership.appendChild(leaderCard);
      leaders.slice(1).forEach(member => otherMembers.push(member));
    }

    const palette = {
      sky: { border: 'hover:border-sky-200', shadow: 'hover:shadow-sky-900/5', icon: 'bg-sky-50', badge: 'bg-sky-50 text-sky-700', title: 'text-sky-700' },
      violet: { border: 'hover:border-violet-200', shadow: 'hover:shadow-violet-900/5', icon: 'bg-violet-50', badge: 'bg-violet-50 text-violet-700', title: 'text-violet-700' },
      amber: { border: 'hover:border-amber-200', shadow: 'hover:shadow-amber-900/5', icon: 'bg-amber-50', badge: 'bg-amber-50 text-amber-700', title: 'text-amber-700' },
      emerald: { border: 'hover:border-emerald-200', shadow: 'hover:shadow-emerald-900/5', icon: 'bg-emerald-50', badge: 'bg-emerald-50 text-emerald-700', title: 'text-emerald-700' },
      rose: { border: 'hover:border-rose-200', shadow: 'hover:shadow-rose-900/5', icon: 'bg-rose-50', badge: 'bg-rose-50 text-rose-700', title: 'text-rose-700' },
      orange: { border: 'hover:border-orange-200', shadow: 'hover:shadow-orange-900/5', icon: 'bg-orange-50', badge: 'bg-orange-50 text-orange-700', title: 'text-orange-700' },
      slate: { border: 'hover:border-slate-300', shadow: 'hover:shadow-slate-900/5', icon: 'bg-slate-50', badge: 'bg-slate-50 text-slate-700', title: 'text-slate-700' }
    };

    const renderDepartment = (group, index) => {
      if (!group.members.length) return;
      const colors = palette[group.color];
      const card = document.createElement('article');
      card.className = `group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-1 ${colors.border} hover:shadow-lg ${colors.shadow}`;
      const header = document.createElement('div');
      header.className = 'flex items-center justify-between';
      const icon = document.createElement('span');
      icon.className = `flex h-9 w-9 items-center justify-center rounded-xl ${colors.icon} text-lg`;
      icon.textContent = group.icon;
      const badge = document.createElement('span');
      badge.className = `rounded-full px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider ${colors.badge}`;
      badge.textContent = String(index).padStart(2, '0');
      header.append(icon, badge);
      const title = document.createElement('h4');
      title.className = `mt-4 text-[10px] font-extrabold uppercase tracking-[0.14em] ${colors.title}`;
      title.textContent = group.title;
      const memberList = document.createElement('div');
      memberList.className = 'mt-3 flex-1 space-y-3';

      group.members.forEach(member => {
        const entry = document.createElement('div');
        if (group.members.length > 1) entry.className = 'border-l-2 border-slate-200 pl-2.5';
        const name = document.createElement('p');
        name.className = 'text-xs font-bold text-slate-900';
        name.textContent = member.fullName;
        entry.appendChild(name);
        if (member.email) {
          const email = document.createElement('a');
          email.className = `mt-0.5 block break-all text-[9px] text-slate-500 hover:${colors.title}`;
          email.href = `mailto:${member.email}`;
          email.textContent = member.email;
          entry.appendChild(email);
        }
        [
          ['Personal', member.phone],
          ['Corporativo', member.phone2]
        ].filter(([, number]) => number).forEach(([type, number]) => {
          const phone = document.createElement('a');
          phone.className = `mt-1 block text-[9px] text-slate-500 hover:${colors.title}`;
          phone.href = `tel:${number.replace(/[^\d+]/g, '')}`;
          phone.textContent = `${type}: ${number}`;
          entry.appendChild(phone);
        });
        if (group.title === 'Auditores') {
          const assignment = member.sector.replace(/^Auditor[ií]a\s*[·-]?\s*/i, '').replace(/LCD6/gi, 'LCD 6').replace(/LCD8/gi, 'LCD 8').replace(/CELDA3/gi, 'CELDA 3');
          if (assignment) {
            const sector = document.createElement('p');
            sector.className = 'mt-1 text-[9px] leading-relaxed text-slate-500';
            sector.textContent = assignment;
            entry.appendChild(sector);
          }
        }
        if (isAdministrator()) entry.appendChild(createQualityTeamActions(member));
        memberList.appendChild(entry);
      });

      card.append(header, title, memberList);
      if (group.title === 'Reparaciones') {
        const note = document.createElement('p');
        note.className = 'mt-1 text-[10px] text-slate-500';
        note.textContent = 'Área de Calidad · a cargo de Agustina Queirolo';
        card.insertBefore(note, memberList);
      }
      if (group.description) {
        const description = document.createElement('p');
        description.className = 'mt-3 border-t border-slate-100 pt-3 text-[10px] text-slate-400';
        description.textContent = group.description;
        card.appendChild(description);
      }
      departments.appendChild(card);
    };

    groups.forEach((group, index) => renderDepartment(group, index + 1));
    if (otherMembers.length) {
      renderDepartment({
        title: 'Otros sectores',
        icon: '👥',
        color: 'slate',
        members: otherMembers
      }, groups.length + 1);
    }
    status.textContent = response.members.length
      ? `${response.members.length} integrantes del equipo.`
      : 'Todavía no hay integrantes cargados.';
  } catch (error) {
    console.error('No se pudo cargar el equipo de Calidad.', error);
    status.textContent = error.message || 'No se pudo cargar el equipo.';
    status.className = 'mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700';
  }
}

function createQualityTeamActions(member) {
  const actions = document.createElement('div');
  actions.className = 'mt-2 flex flex-wrap gap-1.5';
  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'rounded-md border border-sky-200 px-2 py-1 text-[9px] font-bold text-sky-700 hover:bg-sky-50';
  editButton.textContent = 'Editar';
  editButton.setAttribute('aria-label', `Editar a ${member.fullName}`);
  editButton.addEventListener('click', () => editQualityTeamMember(member));
  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.className = 'rounded-md border border-rose-200 px-2 py-1 text-[9px] font-bold text-rose-700 hover:bg-rose-50';
  removeButton.textContent = 'Eliminar';
  removeButton.addEventListener('click', () => deleteQualityTeamMember(member.id, member.fullName));
  actions.append(editButton, removeButton);
  return actions;
}

function editQualityTeamMember(member) {
  if (!isAdministrator()) {
    showToast('Solo los administradores pueden modificar el equipo.');
    return;
  }
  const form = document.getElementById('qualityTeamMemberForm');
  if (!form) return;
  form.dataset.editingId = String(member.id);
  document.getElementById('qualityTeamName').value = member.fullName;
  document.getElementById('qualityTeamSector').value = member.sector;
  document.getElementById('qualityTeamEmail').value = member.email || '';
  document.getElementById('qualityTeamPhone').value = member.phone || '';
  document.getElementById('qualityTeamPhone2').value = member.phone2 || '';
  const formTitle = document.getElementById('qualityTeamFormTitle');
  const saveButton = document.getElementById('qualityTeamSaveMember');
  if (formTitle) formTitle.textContent = `Editar a ${member.fullName}`;
  if (saveButton) saveButton.textContent = 'Guardar cambios';
  setQualityTeamFormMessage('');
  form.classList.remove('hidden');
  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  document.getElementById('qualityTeamName').focus();
}

async function deleteQualityTeamMember(memberId, fullName) {
  if (!isAdministrator()) {
    showToast('Solo los administradores pueden modificar el equipo.');
    return;
  }
  if (!window.confirm(`¿Eliminar a ${fullName} del equipo de Calidad?`)) return;
  try {
    await requestAuthApi(`/api/quality-team/${encodeURIComponent(memberId)}`, { method: 'DELETE' });
    await loadQualityTeamMembers();
    showToast('Integrante eliminado del equipo.');
  } catch (error) {
    console.error('No se pudo eliminar al integrante del equipo.', error);
    showToast(error.message || 'No se pudo eliminar al integrante.');
  }
}

async function renderServerUserManagement() {
  const tableBody = document.getElementById('adminUserTableBody');
  if (!tableBody || !isAdministrator()) return;

  try {
    const { users } = await requestAuthApi('/api/admin/users');
    tableBody.innerHTML = users.map(user => `
      <tr class="border-t border-slate-100">
        <td class="px-4 py-3">
          <div class="font-semibold text-slate-800">${escapeAuditReportText(user.fullName)}</div>
          <div class="text-[10px] text-slate-500">${escapeAuditReportText(user.role || 'Personal de Calidad')}</div>
        </td>
        <td class="px-4 py-3 font-mono text-slate-700">${escapeAuditReportText(user.username)}</td>
        <td class="px-4 py-3">${user.isAdmin
          ? '<span class="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700">Administrador</span>'
          : '<span class="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">Usuario</span>'}</td>
        <td class="px-4 py-3">
          <div class="flex min-w-[220px] gap-2">
            <input type="password" data-password-for="${escapeAuditReportText(user.username)}" minlength="12" maxlength="128" placeholder="Nueva contraseña (12 caracteres)" autocomplete="new-password" class="min-w-0 flex-1 rounded-lg border border-slate-200 px-2.5 py-2 text-xs">
            <button type="button" onclick="window.updateUserPassword('${escapeAuditReportText(user.username)}')" class="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-700 hover:bg-slate-50">Cambiar</button>
          </div>
        </td>
        <td class="px-4 py-3 text-right">
          ${user.username === AppState.currentUser.username
            ? '<span class="text-[10px] text-slate-400">Sesión actual</span>'
            : `<button type="button" onclick="window.deleteUserAccount('${escapeAuditReportText(user.username)}')" class="rounded-lg border border-rose-200 px-3 py-2 text-[10px] font-bold text-rose-700 hover:bg-rose-50">Eliminar</button>`}
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('No se pudieron cargar los usuarios del servidor.', error);
    tableBody.innerHTML = `<tr><td colspan="5" class="px-4 py-6 text-center text-red-600">${escapeAuditReportText(error.message)}</td></tr>`;
  }
}

function initUserManagement() {
  const form = document.getElementById('adminCreateUserForm');
  const legacyImportSection = document.getElementById('legacyAccountImport');
  const legacyImportButton = document.getElementById('importLegacyAccountsButton');
  if (legacyImportSection && localStorage.getItem('calidad_suite_user_accounts')) {
    legacyImportSection.classList.remove('hidden');
  }
  if (legacyImportButton) {
    legacyImportButton.addEventListener('click', async () => {
      if (!isAdministrator()) {
        showToast('Solo un administrador puede importar cuentas.');
        return;
      }
      const storedAccounts = localStorage.getItem('calidad_suite_user_accounts');
      if (!storedAccounts) {
        legacyImportSection?.classList.add('hidden');
        showToast('No hay cuentas anteriores para importar.');
        return;
      }
      let accounts;
      try {
        const parsed = JSON.parse(storedAccounts);
        accounts = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.users) ? parsed.users : Object.values(parsed || {});
      } catch (error) {
        showToast('No se pudieron leer las cuentas anteriores de esta PC.');
        return;
      }
      legacyImportButton.disabled = true;
      try {
        const result = await requestAuthApi('/api/admin/users/import-local', {
          method: 'POST',
          body: JSON.stringify({ accounts })
        });
        localStorage.removeItem('calidad_suite_user_accounts');
        legacyImportSection?.classList.add('hidden');
        await renderServerUserManagement();
        showToast(`Importación terminada: ${result.imported} nuevas y ${result.skipped} ya existentes.`);
      } catch (error) {
        showToast(error.message);
      } finally {
        legacyImportButton.disabled = false;
      }
    });
  }

  if (form) {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!isAdministrator()) {
        showToast('Solo un administrador puede gestionar usuarios.');
        return;
      }

      const fullName = document.getElementById('adminNewFullName').value.trim();
      const username = document.getElementById('adminNewUsername').value.trim().toLocaleLowerCase();
      const password = document.getElementById('adminNewPassword').value;
      const role = document.getElementById('adminNewRole').value.trim() || 'Personal de Calidad';
      const shift = document.getElementById('adminNewShift').value;
      const isAdmin = document.getElementById('adminNewIsAdmin').checked;
      if (!fullName || !username || password.length < 12) {
        showToast('Completá nombre y usuario, y usá una contraseña de al menos 12 caracteres.');
        return;
      }
      if (!/^[a-z0-9._-]{2,40}$/.test(username)) {
        showToast('El usuario debe tener entre 2 y 40 caracteres: letras, números, punto, guion o guion bajo.');
        return;
      }

      try {
        await requestAuthApi('/api/admin/users', {
          method: 'POST',
          body: JSON.stringify({ fullName, username, password, role, shift, isAdmin })
        });
      } catch (error) {
        showToast(error.message);
        return;
      }
      form.reset();
      renderServerUserManagement();
      showToast(`Usuario ${fullName} agregado al sistema compartido.`);
    });
  }
}

window.updateUserPassword = async function(username) {
  if (!isAdministrator()) {
    showToast('Solo un administrador puede cambiar contraseñas.');
    return;
  }
  const passwordInput = document.querySelector(`[data-password-for="${CSS.escape(username)}"]`);
  const newPassword = passwordInput?.value || '';
  if (newPassword.length < 12) {
    showToast('La nueva contraseña debe tener al menos 12 caracteres.');
    return;
  }

  try {
    await requestAuthApi(`/api/admin/users/${encodeURIComponent(username)}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ password: newPassword })
    });
  } catch (error) {
    showToast(error.message);
    return;
  }
  if (passwordInput) passwordInput.value = '';
  if (username === AppState.currentUser.username) {
    AppState.currentUser = null;
    showLoginScreen();
    showToast('Contraseña cambiada. Iniciá sesión con la nueva contraseña.');
    return;
  }
  showToast(`Contraseña actualizada para ${username}. Se cerraron sus sesiones en todos los equipos.`);
};

window.deleteUserAccount = async function(username) {
  if (!isAdministrator()) {
    showToast('Solo un administrador puede eliminar usuarios.');
    return;
  }
  if (username === AppState.currentUser.username) {
    showToast('No podés eliminar el usuario de la sesión actual.');
    return;
  }
  if (!window.confirm(`¿Eliminar el usuario ${username} del sistema compartido?`)) return;
  try {
    await requestAuthApi(`/api/admin/users/${encodeURIComponent(username)}`, { method: 'DELETE' });
  } catch (error) {
    showToast(error.message);
    return;
  }
  await renderServerUserManagement();
  showToast(`Usuario ${username} eliminado del sistema compartido.`);
};

function initAuth() {
  const loginView = document.getElementById('loginView');
  const appContainer = document.getElementById('appContainer');
  const loginForm = document.getElementById('loginForm');
  const logoutBtn = document.getElementById('logoutBtn');
  const userProfileMenu = document.getElementById('userProfileMenu');
  const profileDropdown = document.getElementById('profileDropdown');

  const savedSessionUser = readStoredSessionUser();
  if (savedSessionUser) {
    AppState.currentUser = normalizeSessionUser(savedSessionUser);
  }

  requestAuthApi('/api/auth/me')
    .then(({ user }) => {
      if (authLoginInProgress) return;
      AppState.currentUser = normalizeSessionUser(user);
      writeStoredSessionUser(AppState.currentUser);
      applyUserToUI(AppState.currentUser);
      loginView.classList.add('hidden');
      appContainer.classList.remove('hidden');
      loadScrapScreensData();
      if (isAdministrator()) renderServerUserManagement();
    })
    .catch(error => {
      if (authLoginInProgress) return;
      if (!error.message.includes('Sesión no iniciada') && !error.message.includes('Sesión vencida o revocada')) {
        console.error('No se pudo validar la sesión central.', error);
        showToast('No se pudo conectar con el servidor de usuarios. Verificá que la PC central esté encendida.');
      }
      AppState.currentUser = null;
      showLoginScreen();
    });

  // Submit Login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const usernameInput = document.getElementById('loginUsername').value.trim();
      const passwordInput = document.getElementById('loginPassword').value;
      const errorMsg = document.getElementById('loginErrorMsg');
      const submitButton = loginForm.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;
      authLoginInProgress = true;
      try {
        const { user } = await requestAuthApi('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });
        AppState.currentUser = normalizeSessionUser(user);
        writeStoredSessionUser(AppState.currentUser);
        applyUserToUI(AppState.currentUser);
        loginView.classList.add('hidden');
        appContainer.classList.remove('hidden');
        loadScrapScreensData();
        if (errorMsg) errorMsg.classList.add('hidden');
        if (isAdministrator()) renderServerUserManagement();
        showToast(`Bienvenido a Planta 5, ${user.fullName}`);
      } catch (error) {
        if (errorMsg) {
          errorMsg.textContent = error.message;
          errorMsg.classList.remove('hidden');
        }
      } finally {
        authLoginInProgress = false;
        if (submitButton) submitButton.disabled = false;
      }
    });
  }

  // Toggle Menú Perfil
  if (userProfileMenu && profileDropdown) {
    userProfileMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      profileDropdown.classList.add('hidden');
    });
  }

  // Cerrar Sesión
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await requestAuthApi('/api/auth/logout', { method: 'POST', body: '{}' });
      } catch (error) {
        console.error('No se pudo cerrar la sesión central.', error);
        showToast('No se pudo cerrar la sesión en el servidor.');
        return;
      }
      AppState.currentUser = null;
      clearStoredSessionUser();
      if (profileDropdown) profileDropdown.classList.add('hidden');
      showLoginScreen();
      showToast('Sesión cerrada correctamente');
    });
  }

  initUserManagement();
  window.setInterval(validateActiveAuthSession, 30000);
}

async function validateActiveAuthSession() {
  if (!AppState.currentUser || authSessionCheckInProgress) return;
  authSessionCheckInProgress = true;
  try {
    const { user } = await requestAuthApi('/api/auth/me');
    if (user.username.toLocaleLowerCase() !== AppState.currentUser.username.toLocaleLowerCase()) {
      throw new Error('La sesión activa cambió en el servidor.');
    }
    AppState.currentUser = normalizeSessionUser(user);
    writeStoredSessionUser(AppState.currentUser);
    applyUserToUI(AppState.currentUser);
  } catch (error) {
    console.error('La sesión central dejó de ser válida.', error);
    AppState.currentUser = null;
    showLoginScreen();
    showToast('La sesión se cerró o no se pudo validar con el servidor. Volvé a iniciar sesión.');
  } finally {
    authSessionCheckInProgress = false;
  }
}

function showLoginScreen() {
  const loginView = document.getElementById('loginView');
  const appContainer = document.getElementById('appContainer');
  if (loginView) loginView.classList.remove('hidden');
  if (appContainer) appContainer.classList.add('hidden');
}

function applyUserToUI(user) {
  if (!user) return;
  const adminNavGroup = document.getElementById('adminUsersNavGroup');
  if (adminNavGroup) adminNavGroup.classList.toggle('hidden', !isAdministrator(user));
  const screenValidationNav = document.querySelector('.nav-subitem[data-view="validacion-pantallas"]');
  if (screenValidationNav) screenValidationNav.classList.toggle('hidden', !isAdministrator(user));
  const qualityTeamAdminControls = document.getElementById('qualityTeamAdminControls');
  if (qualityTeamAdminControls) qualityTeamAdminControls.classList.toggle('hidden', !isAdministrator(user));

  const headerAvatar = document.getElementById('headerUserAvatar');
  const headerName = document.getElementById('headerUserName');
  const headerRole = document.getElementById('headerUserRole');

  if (headerAvatar) {
    headerAvatar.textContent = user.initials;
    headerAvatar.className = `w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shadow-xs transition-colors ${user.avatarBg || 'bg-red-600'}`;
  }
  if (headerName) headerName.textContent = user.fullName;
  if (headerRole) headerRole.textContent = `Verificado · ${user.role}`;

  const dropAvatar = document.getElementById('dropdownAvatar');
  const dropName = document.getElementById('dropdownName');
  const dropRole = document.getElementById('dropdownRole');
  const dropShift = document.getElementById('dropdownShift');

  if (dropAvatar) {
    dropAvatar.textContent = user.initials;
    dropAvatar.className = `w-10 h-10 rounded-full text-white font-bold text-sm flex items-center justify-center ${user.avatarBg || 'bg-red-600'}`;
  }
  if (dropName) dropName.textContent = user.fullName;
  if (dropRole) dropRole.textContent = user.role;
  if (dropShift) dropShift.textContent = user.shift;

  const welcomeName = document.getElementById('welcomeUserName');
  const welcomeShift = document.getElementById('welcomeUserShift');

  if (welcomeName) welcomeName.textContent = user.fullName;
  if (welcomeShift) welcomeShift.textContent = `Asignado a: ${user.role} (${user.shift})`;

  const auditorInput = document.getElementById('auditorInput');
  if (auditorInput) auditorInput.value = user.fullName;

  const screenResponsible = document.getElementById('screenValidationResponsible');
  if (screenResponsible) screenResponsible.value = user.fullName;
}

// ==========================================
// 6. RELOJ EN VIVO
// ==========================================
function initClock() {
  const clockElement = document.getElementById('liveDateTime');
  const update = () => {
    const now = new Date();
    const greeting = document.getElementById('greetingText');
    const greetingIcon = document.getElementById('greetingIcon');
    if (greeting) greeting.textContent = now.getHours() < 12 ? 'Buenos días' : 'Buenas tardes';
    if (greetingIcon) greetingIcon.textContent = now.getHours() < 12 ? '☀️' : '🌤️';

    const days = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    
    const dayName = days[now.getDay()];
    const dayNum = now.getDate();
    const monthName = months[now.getMonth()];
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    if (clockElement) {
      clockElement.textContent = `${dayName}, ${dayNum} ${monthName}, ${hours}:${minutes}`;
    }
  };
  update();
  setInterval(update, 10000);
}

// ==========================================
// 7. NAVEGACIÓN SIDEBAR (NAV-PILL)
// ==========================================
function initTopNavigation() {
  const navBtns = document.querySelectorAll('.nav-pill[data-view], .nav-subitem[data-view]');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      if (!view) return;

      const shouldCollapseSubmenu =
        btn.hasAttribute('data-submenu-toggle') && btn.getAttribute('aria-expanded') === 'true';
      updateSidebarNavigation(view);
      if (shouldCollapseSubmenu) {
        const submenu = document.getElementById(btn.getAttribute('data-submenu-toggle'));
        const chevron = document.querySelector(`[data-submenu-chevron="${btn.getAttribute('data-submenu-toggle')}"]`);
        submenu?.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
        chevron?.classList.remove('rotate-180');
      }

      switchView(view);
    });
  });
}

function updateSidebarNavigation(viewName) {
  if (viewName === 'validacion-pantallas' && !isAdministrator()) {
    viewName = 'dashboard';
  }
  const navBtns = document.querySelectorAll('.nav-pill[data-view], .nav-subitem[data-view]');
  const iqcSubMenuViews = new Set(['etiquetas', 'validacion-pantallas']);
  const documentationSubMenuViews = new Set(['documentacion-manuales', 'documentacion-instructivos']);
  const reportesSubMenuViews = new Set(['reportes-auditorias', 'reportes-eventos']);
  navBtns.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
  });

  const iqcButton = document.querySelector('.nav-pill[data-view="iqc"]');
  const iqcSubmenu = document.getElementById('iqcSubmenu');
  const iqcChevron = document.querySelector('[data-submenu-chevron="iqcSubmenu"]');
  const isIqcView = viewName === 'iqc' || iqcSubMenuViews.has(viewName);
  iqcButton?.classList.toggle('active', isIqcView);
  if (iqcSubmenu) iqcSubmenu.classList.toggle('hidden', !isIqcView);
  if (iqcButton) iqcButton.setAttribute('aria-expanded', String(isIqcView));
  iqcChevron?.classList.toggle('rotate-180', isIqcView);

  const reportesButton = document.querySelector('.nav-pill[data-view="reportes"]');
  const reportesSubmenu = document.getElementById('reportesSubmenu');
  const reportesChevron = document.querySelector('[data-submenu-chevron="reportesSubmenu"]');
  const isReportesView = viewName === 'reportes' || reportesSubMenuViews.has(viewName);
  reportesButton?.classList.toggle('active', isReportesView);
  if (reportesSubmenu) reportesSubmenu.classList.toggle('hidden', !isReportesView);
  if (reportesButton) reportesButton.setAttribute('aria-expanded', String(isReportesView));
  reportesChevron?.classList.toggle('rotate-180', isReportesView);

  const documentationButton = document.querySelector('.nav-pill[data-view="documentacion"]');
  const documentationSubmenu = document.getElementById('documentationSubmenu');
  const documentationChevron = document.querySelector('[data-submenu-chevron="documentationSubmenu"]');
  const isDocumentationView = viewName === 'documentacion' || documentationSubMenuViews.has(viewName);
  documentationButton?.classList.toggle('active', isDocumentationView);
  if (documentationSubmenu) documentationSubmenu.classList.toggle('hidden', !isDocumentationView);
  if (documentationButton) documentationButton.setAttribute('aria-expanded', String(isDocumentationView));
  documentationChevron?.classList.toggle('rotate-180', isDocumentationView);
}

window.navigateToView = function(viewName) {
  updateSidebarNavigation(viewName);
  switchView(viewName);
};

function switchView(viewName) {
  if (viewName === 'usuarios' && !isAdministrator()) {
    showToast('La administración de usuarios está disponible solo para administradores.');
    viewName = 'dashboard';
  }
  if (viewName === 'validacion-pantallas' && !isAdministrator()) {
    showToast('La validación de pantallas está disponible solo para administradores.');
    viewName = 'dashboard';
    updateSidebarNavigation(viewName);
  }
  AppState.activeView = viewName;
  const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
  
  const titles = {
    'dashboard': 'Dashboard Principal (Portada)',
    'equipo': 'Equipo de Calidad · Planta 5',
    'formularios': 'Formularios & Checklists Operativos',
    'auditorias': 'Auditorías de Línea & Celdas TV',
    'audit-torque': 'Auditoría · Control de Torque (Planta 5)',
    'audit-esd': 'Auditoría · Control de Pulseras ESD (Planta 5)',
    'audit-im-cambio': 'Auditoría · Cambio de Modelo I.M & JIG (Planta 5)',
    'iqc': 'IQC Calidad · Recepción de Materiales',
    'mdr': 'Gestión de MDR y No Conformidades',
    'reclamos-automatica': 'Reclamos a Automática · Planta 3',
    'reportes': 'Centro de Reportes · Planta 5',
    'reportes-auditorias': 'Reportes · Formularios',
    'reportes-eventos': 'Reportes · Eventos',
    'documentacion': 'Documentación de Calidad',
    'documentacion-manuales': 'Manuales de procedimiento',
    'documentacion-instructivos': 'Instructivos por área',
    'etiquetas': 'Validación de etiquetas',
    'validacion-pantallas': 'Validación de pantallas',
    'scrap-pantallas': 'Scrap de pantallas',
    'usuarios': 'Administración de usuarios'
  };

  if (breadcrumbCurrent) {
    breadcrumbCurrent.textContent = titles[viewName] || 'Dashboard Principal';
  }

  document.querySelectorAll('.view-container').forEach(el => el.classList.add('hidden'));

  const dashboard = document.getElementById('view-dashboard');
  const teamView = document.getElementById('view-equipo');
  if (dashboard && teamView) {
    Array.from(dashboard.children).forEach(child => {
      if (child !== teamView) child.classList.remove('hidden');
    });
  }

  if (viewName === 'equipo' && dashboard && teamView) {
    dashboard.classList.remove('hidden');
    Array.from(dashboard.children).forEach(child => {
      if (child !== teamView) child.classList.add('hidden');
    });
    teamView.classList.remove('hidden');
    loadQualityTeamMembers();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const targetView = viewName === 'reportes' ? 'reportes-auditorias' : viewName;
  const target = document.getElementById(`view-${targetView}`);
  if (target) {
    target.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    const defaultView = document.getElementById('view-dashboard');
    if (defaultView) defaultView.classList.remove('hidden');
  }
  if (viewName === 'reportes' || viewName === 'reportes-auditorias') {
    window.renderAuditReports();
  }
  if (viewName === 'reportes-eventos') {
    if (tvEventsRecords.length === 0) {
      window.loadTvEventsData(false);
    } else {
      renderTvEventsDashboard();
    }
  }
  if (viewName === 'validacion-pantallas') loadScreenValidationRecords();
  if (viewName === 'usuarios') renderServerUserManagement();
}

// ==========================================
// 8. BÚSQUEDA Y TRAZABILIDAD POR SERIAL TV
// ==========================================
function initSerialSearch() {
  const serialInput = document.getElementById('heroSerialSearchInput');
  const searchBtn = document.getElementById('heroSerialSearchBtn');

  const executeSearch = () => {
    if (!serialInput) return;
    const query = serialInput.value.trim().toUpperCase();
    if (!query) {
      showToast('Por favor ingresa o escanea un número de serie.');
      return;
    }

    const matched = SerialDatabase[query] || Object.values(SerialDatabase).find(s => s.serial.includes(query) || s.model.toUpperCase().includes(query));

    if (matched) {
      openSerialDetailModal(matched);
    } else {
      // Simular ficha generada para cualquier serial ingresado
      const generatedData = {
        serial: query,
        model: 'UHD 50" Smart 4K TV (Serie 7)',
        cell: 'LCD 6 (Línea de Ensamble)',
        panelLot: 'BOE-P5-LOT-REC',
        mainboardSN: 'MB-RTK-' + Math.floor(1000 + Math.random() * 9000),
        smpsSN: 'SMPS-3000V-OK',
        hipot: '3.0 kV AC · 0.4 mA (Aprobado IEC 62368-1)',
        whiteBalance: '6504K D65 · OK',
        audio: 'Audio Dolby Stereo Pass',
        firmware: 'v5.10.02_PROD',
        status: 'En Proceso / Conforme',
        auditor: AppState.currentUser ? AppState.currentUser.fullName : 'Rober Quiquinlla',
        timestamp: 'Hoy, Hace instantes'
      };
      openSerialDetailModal(generatedData);
    }
  };

  if (searchBtn) searchBtn.addEventListener('click', executeSearch);
  if (serialInput) {
    serialInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') executeSearch();
    });
  }
}

function openSerialDetailModal(data) {
  const modal = document.getElementById('serialDetailModal');
  if (!modal) return;

  document.getElementById('serialModalTitle').textContent = `Ficha Técnica: ${data.serial}`;
  document.getElementById('serialModalModel').textContent = data.model;
  document.getElementById('serialModalCell').textContent = data.cell;
  document.getElementById('serialModalPanel').textContent = data.panelLot;
  document.getElementById('serialModalMB').textContent = data.mainboardSN;
  document.getElementById('serialModalSMPS').textContent = data.smpsSN;
  document.getElementById('serialModalHipot').textContent = data.hipot;
  document.getElementById('serialModalWB').textContent = data.whiteBalance;
  document.getElementById('serialModalAudio').textContent = data.audio;
  document.getElementById('serialModalStatus').textContent = data.status;
  document.getElementById('serialModalAuditor').textContent = `${data.auditor} (${data.timestamp})`;

  modal.classList.remove('hidden');
}

window.quickScanDemo = function(serial) {
  const input = document.getElementById('heroSerialSearchInput');
  if (input) input.value = serial;
  const data = SerialDatabase[serial];
  if (data) openSerialDetailModal(data);
};

// ==========================================
// 9. TABLA DE MATRIZ DE CELDAS TV
// ==========================================
function initLinesTable() {
  renderLinesTable();
}

function renderLinesTable() {
  const tbody = document.getElementById('tvLinesTableBody');
  if (!tbody) return;

  const filtered = AppState.lines.filter(line => {
    const matchTurno = AppState.selectedTurno === 'todos' || line.turno === AppState.selectedTurno;
    const matchSearch = line.lineCode.toLowerCase().includes(AppState.searchQuery.toLowerCase()) ||
                        line.modelName.toLowerCase().includes(AppState.searchQuery.toLowerCase());
    return matchTurno && matchSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="text-center py-8 text-slate-400">
          No se encontraron celdas de televisión con los filtros seleccionados.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(line => {
    return `
      <tr class="hover:bg-slate-50/80 transition-colors cursor-pointer group" onclick="openLineDetailModal(${line.id})">
        <td class="font-medium text-slate-900 whitespace-nowrap">
          <div class="flex items-center gap-2.5">
            <span class="w-6 h-6 rounded bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-sm font-mono">
              ${line.id}
            </span>
            <div>
              <div class="font-bold text-xs text-slate-800 group-hover:text-red-600 transition-colors font-mono">
                ${line.lineCode}
              </div>
              <div class="text-[11px] text-slate-500 font-normal">
                ${line.modelName}
              </div>
            </div>
          </div>
        </td>

        <td class="text-center">
          ${line.checklist.status === 'ok' ? `
            <div class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <svg class="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              <span>${line.checklist.time}</span>
            </div>
          ` : `
            <span class="text-slate-300 font-mono text-xs">--:--</span>
          `}
        </td>

        <td class="text-center">
          ${line.auditoria1.time !== '--:--' ? `
            <div class="auditor-chip auditor-blue">
              <span class="name">${line.auditoria1.name}</span>
              <span class="time">${line.auditoria1.time}</span>
            </div>
          ` : `
            <span class="text-slate-300 font-mono text-xs">—</span>
          `}
        </td>

        <td class="text-center">
          ${line.auditoria2.time !== '--:--' ? `
            <div class="auditor-chip auditor-purple">
              <span class="name">${line.auditoria2.name}</span>
              <span class="time">${line.auditoria2.time}</span>
            </div>
          ` : `
            <span class="text-slate-300 font-mono text-xs">—</span>
          `}
        </td>

        <td class="text-center">
          ${renderStationChip(line.stations.hipot)}
        </td>

        <td class="text-center">
          ${renderStationChip(line.stations.openCell)}
        </td>

        <td class="text-center">
          ${renderStationChip(line.stations.calibracion)}
        </td>

        <td class="text-center">
          ${renderStationChip(line.stations.audio)}
        </td>

        <td class="text-center">
          ${renderStationChip(line.stations.burnin)}
        </td>

        <td class="text-right">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${line.statusClass}">
            <span class="w-1.5 h-1.5 rounded-full ${line.status === 'Aprobado' ? 'bg-emerald-500' : line.status === 'Observado' ? 'bg-amber-500' : 'bg-slate-400'}"></span>
            ${line.status}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

function renderStationChip(station) {
  if (!station) return '<span class="text-slate-300">—</span>';
  
  if (station.status === 'alert') {
    return `<span class="tv-station-chip badge-alert shadow-xs" title="${station.tooltip}">${station.val}</span>`;
  }
  if (station.status === 'warning') {
    return `<span class="tv-station-chip badge-warning shadow-xs" title="${station.tooltip}">${station.val}</span>`;
  }
  if (station.status === 'ok') {
    return `<span class="tv-station-chip badge-ok shadow-xs" title="${station.tooltip}">${station.val}</span>`;
  }
  return `<span class="tv-station-chip badge-pending" title="${station.tooltip}">${station.val}</span>`;
}

// ==========================================
// 10. FILTROS Y BÚSQUEDA
// ==========================================
function initShiftSelector() {
  const buttons = document.querySelectorAll('.shift-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => {
        b.classList.remove('bg-red-50', 'text-red-600', 'font-bold', 'border-red-200');
        b.classList.add('text-slate-600', 'border-slate-200');
      });
      btn.classList.add('bg-red-50', 'text-red-600', 'font-bold', 'border-red-200');
      btn.classList.remove('text-slate-600', 'border-slate-200');

      AppState.selectedTurno = btn.getAttribute('data-shift');
      renderLinesTable();
      updateSummaryMetrics();
    });
  });
}

function initSearch() {
  const searchInput = document.getElementById('lineSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      AppState.searchQuery = e.target.value;
      renderLinesTable();
    });
  }
}

function updateSummaryMetrics() {
  const approvedCount = AppState.lines.filter(l => l.status === 'Aprobado').length;
  const pendingCount = AppState.lines.filter(l => l.status === 'Pendiente' || l.status === 'En Proceso').length;
  const observedCount = AppState.lines.filter(l => l.status === 'Observado').length;
  const total = AppState.lines.length;
  const progressPercent = Math.round((approvedCount / total) * 100);

  const approvedEl = document.getElementById('metricApproved');
  const pendingEl = document.getElementById('metricPending');
  const percentEl = document.getElementById('metricPercent');

  if (approvedEl) approvedEl.textContent = approvedCount;
  if (pendingEl) pendingEl.textContent = pendingCount + observedCount;
  if (percentEl) percentEl.textContent = `${progressPercent}%`;

  renderDashboardOverview();
}

const DailyAuditDefinitions = [
  { key: 'inicio_turno', label: 'Checklist inicio de turno' },
  { key: 'torque', label: 'Control de torque' },
  { key: 'esd', label: 'Control de pulseras ESD' }
];
const DailyAuditLineCodes = ['LCD 6', 'LCD 8', 'CELDA 2', 'CELDA 3', 'INSERCIÓN MANUAL & JIG'];
const DailyFormRecordsStorageKey = 'calidad_suite_daily_form_records';
const LineProductionStatusStorageKey = 'calidad_suite_line_production_status';
let selectedDailyAuditCell = null;
let lineProductionStatus = [];
let pendingLineDisable = null;
let isDailyAuditDetailsOpen = false;

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function restoreDailyFormRecords() {
  try {
    const savedRecords = localStorage.getItem(DailyFormRecordsStorageKey);
    if (savedRecords) {
      const parsedRecords = JSON.parse(savedRecords);
      if (!Array.isArray(parsedRecords)) {
        throw new Error('El formato guardado de auditorías diarias no es válido.');
      }
      AppState.recentFormRecords = parsedRecords.filter(record =>
        !(Number(record.id) > 0 && Number(record.id) <= 6) && !record.isDemo
      );
      localStorage.setItem(DailyFormRecordsStorageKey, JSON.stringify(AppState.recentFormRecords));
      return;
    }

    // Descartar registros ficticios de demo para no alterar métricas reales
    AppState.recentFormRecords = [];
    localStorage.removeItem(DailyFormRecordsStorageKey);
  } catch (error) {
    console.error('No se pudieron recuperar los registros diarios de auditoría.', error);
    showToast('No se pudieron recuperar los registros diarios guardados.');
  }
}

function persistDailyFormRecords() {
  try {
    localStorage.setItem(DailyFormRecordsStorageKey, JSON.stringify(AppState.recentFormRecords));
  } catch (error) {
    console.error('No se pudieron guardar los registros diarios de auditoría.', error);
    showToast('No se pudo guardar el registro diario en este navegador.');
  }
}

function collectTorqueNgItems(rows = window.torquePuestosData || []) {
  return rows.flatMap(row => {
    const items = [];
    const position = `Puesto ${row.puesto || 'sin identificar'}`;
    const value = Number.parseFloat(row.torqueMedido);
    const minimum = Number.parseFloat(row.rangoMin);
    const maximum = Number.parseFloat(row.rangoMax);
    if (!Number.isFinite(value) || !Number.isFinite(minimum) || !Number.isFinite(maximum) || value < minimum || value > maximum) {
      const measured = Number.isFinite(value) ? `${value} kgf·cm` : 'sin medición';
      const range = Number.isFinite(minimum) && Number.isFinite(maximum) ? `${minimum}–${maximum} kgf·cm` : 'rango no definido';
      items.push(`${position}: torque fuera de rango (${measured}; permitido ${range})`);
    }
    if (row.prisionero !== 'OK') {
      items.push(`${position}: prisionero ausente o flojo`);
    }
    return items;
  });
}

function collectEsdNgItems(rows = window.esdPuestosData || []) {
  return rows.flatMap(row => {
    const items = [];
    const position = `Puesto ${row.puesto || 'sin identificar'}`;
    if (row.testigo !== 'OK') items.push(`${position}: testigo ESD NOK`);
    if (row.pulsera !== 'OK') items.push(`${position}: pulsera ESD NOK`);
    return items;
  });
}

function isAuditRecordNonConforming(record) {
  if (Array.isArray(record.ngItems) && record.ngItems.length > 0) return true;
  const status = String(record.status || '').toLocaleLowerCase();
  return status.includes('desvío') || status.includes('desvio') || status.includes('nok') ||
    status.includes('no conforme') || status.includes('falla') || status.includes('observad');
}

function escapeAuditReportText(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

const ALL_SIX_AUDIT_FORMS = [
  { key: 'inicio_turno', title: 'CHECKLIST INICIO DE TURNO', short: 'Inicio Turno', icon: '📋' },
  { key: 'torque', title: 'CONTROL DE TORQUE', short: 'Torque', icon: '🔧' },
  { key: 'esd', title: 'PULSERAS ESD', short: 'Pulseras ESD', icon: '⚡' },
  { key: 'cambio_modelo', title: 'CAMBIO DE MODELO (RG-0220 / RG-0772)', short: 'Cambio Modelo', icon: '🔄' },
  { key: 'im_diario', title: 'INICIO DE PRODUCCIÓN DIARIO DE IM', short: 'Inicio IM', icon: '🏭' },
  { key: 'im_cambio', title: 'SEGUIMIENTO DE PAUTAS IM', short: 'Pautas IM', icon: '📝' }
];

let auditSheetsDataMeta = null;
let auditMissingFilterState = 'all';

window.loadAuditSheetsData = async function(forceRefresh = false) {
  const badge = document.getElementById('auditSheetsRecordsBadge');
  const sourcesText = document.getElementById('auditSheetsSourcesText');
  if (badge) badge.textContent = forceRefresh ? 'Actualizando...' : 'Cargando BBDD...';

  try {
    const url = '/api/audits/sheets-data' + (forceRefresh ? '?refresh=1' : '');
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.records)) {
      auditSheetsDataMeta = data;
      
      // Update badge and text
      if (badge) {
        badge.textContent = `${data.counts?.totalAudits || data.records.length} registros en vivo`;
      }
      if (sourcesText) {
        sourcesText.textContent = `Pulseras ESD: ${data.counts?.esd || 0} · Torque: ${data.counts?.torque || 0} · Inicio Turno: ${data.counts?.inicio_turno || 0} · Cambio Modelo: ${data.counts?.cambio_modelo || 0} · IM Diario: ${data.counts?.im_diario || 0} · Pautas IM: ${data.counts?.im_cambio || 0}`;
      }

      // Merge into AppState.recentFormRecords keeping local submissions
      const localRecords = (Array.isArray(AppState.recentFormRecords) ? AppState.recentFormRecords : [])
        .filter(r => !r.source?.startsWith('Google Sheets') && !String(r.id).startsWith('sheet-'));
      
      AppState.recentFormRecords = [...localRecords, ...data.records];

      // Auto-generate radiography if in view or default
      auditRadiographyConfig.generated = true;
      if (typeof window.renderAuditReports === 'function') {
        window.renderAuditReports();
      }
      if (typeof renderDashboardOverview === 'function') {
        renderDashboardOverview();
      }
      if (typeof renderFormRecordsTable === 'function') {
        renderFormRecordsTable(AppState.recentFormRecords);
      }
    }
  } catch (err) {
    console.error('Error cargando auditorías de Google Sheets:', err);
    if (badge) badge.textContent = 'Modo local';
    if (sourcesText) sourcesText.textContent = 'No se pudo sincronizar con Google Sheets en este momento.';
  }
};

window.refreshAuditSheetsData = function() {
  window.loadAuditSheetsData(true);
};

window.setAuditMissingFilter = function(filter) {
  auditMissingFilterState = filter;
  window.renderAuditReports();
};

const AuditReportLines = [
  { value: 'all', label: 'Comparativa' },
  { value: 'CELDA 1', label: 'Celda 1' },
  { value: 'CELDA 2', label: 'Celda 2' },
  { value: 'LCD 6', label: 'LCD 6' },
  { value: 'LCD 8', label: 'LCD 8' },
  { value: 'CELDA 3', label: 'Celda 3' },
  { value: 'INSERCIÓN PLACAS', label: 'Inserción Placas' },
  { value: 'INSERCIÓN MANUAL & JIG', label: 'Inserción Manual & JIG' }
];
const AuditReportColors = ['#dc2626', '#2563eb', '#059669', '#d97706', '#7c3aed', '#0891b2'];
let auditRadiographyConfig = { line: 'all', period: 'all', start: '', end: '', month: '', formKey: 'all', auditor: 'all', generated: true };

function normalizeAuditReportLine(line) {
  const normalized = String(line || '').toLocaleUpperCase();
  if (normalized.includes('CELDA 1')) return 'CELDA 1';
  if (normalized.includes('CELDA 2')) return 'CELDA 2';
  if (normalized.includes('LCD 6')) return 'LCD 6';
  if (normalized.includes('LCD 8')) return 'LCD 8';
  if (normalized.includes('CELDA 3')) return 'CELDA 3';
  if (normalized.includes('INSERCIÓN PLACA') || normalized.includes('JIG PLACA')) return 'INSERCIÓN PLACAS';
  if (normalized.includes('INSERCIÓN MANUAL') || normalized.includes('IM-1') || normalized.includes('IM-2') || normalized.includes('INSERCIÓN MANUAL & JIG')) {
    return 'INSERCIÓN MANUAL & JIG';
  }
  return line || 'Sin línea';
}

function getCleanLineLabel(line) {
  const norm = normalizeAuditReportLine(line);
  if (norm === 'CELDA 1') return 'Celda 1';
  if (norm === 'CELDA 2') return 'Celda 2';
  if (norm === 'CELDA 3') return 'Celda 3';
  if (norm === 'LCD 6') return 'LCD 6';
  if (norm === 'LCD 8') return 'LCD 8';
  if (norm === 'INSERCIÓN PLACAS') return 'Inserción Placas';
  if (norm === 'INSERCIÓN MANUAL & JIG') return 'Inserción Manual & JIG';
  return norm || line || 'Sin línea';
}

function getAuditReportDateRange(period, start, end) {
  if (period === 'all') return null;
  if (period === 'custom') return { start, end };
  const today = new Date();
  const endDate = getLocalDateKey(today);
  const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (period === 'month') startDate.setDate(startDate.getDate() - 29);
  else startDate.setDate(startDate.getDate() - (Number(period) - 1));
  return { start: getLocalDateKey(startDate), end: endDate };
}

function isAuditDateWithinRange(dateKey, range) {
  if (!range) return true;
  return /^\d{4}-\d{2}-\d{2}$/.test(dateKey || '') &&
    dateKey >= range.start && dateKey <= range.end;
}

function getAuditMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('es-AR', { month: 'short', year: '2-digit' });
}

function getAuditReportFormDefinitions() {
  return Object.values(FormDefinitions);
}

function renderAuditReportTrend(records, forms) {
  const chart = document.getElementById('reportTrendChart');
  if (!chart) return;

  const monthKeys = [...new Set(records
    .filter(record => isAuditRecordNonConforming(record) && /^\d{4}-\d{2}-\d{2}$/.test(record.dateKey || ''))
    .map(record => record.dateKey.slice(0, 7)))]
    .sort().slice(-12);
  if (monthKeys.length === 0) {
    chart.innerHTML = '<p class="py-12 text-center text-xs text-slate-400">No hay fechas registradas para mostrar la tendencia mensual.</p>';
    return;
  }

  const series = forms.map((form, index) => ({
    key: form.key,
    title: form.title,
    color: AuditReportColors[index % AuditReportColors.length],
    values: monthKeys.map(month => records.filter(record =>
      record.formKey === form.key && isAuditRecordNonConforming(record) && record.dateKey?.startsWith(month)
    ).length)
  }));
  const maxValue = Math.max(1, ...series.flatMap(item => item.values));
  const width = Math.max(720, monthKeys.length * 84);
  const height = 300;
  const left = 42;
  const right = 18;
  const top = 18;
  const bottom = 48;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const x = index => left + (monthKeys.length === 1 ? plotWidth / 2 : index * plotWidth / (monthKeys.length - 1));
  const y = value => top + plotHeight - value * plotHeight / maxValue;
  const grid = Array.from({ length: maxValue + 1 }, (_, value) => `
    <line x1="${left}" y1="${y(value)}" x2="${width - right}" y2="${y(value)}" stroke="#e2e8f0" stroke-dasharray="3 4"/>
    <text x="${left - 10}" y="${y(value) + 4}" text-anchor="end" fill="#64748b" font-size="10">${value}</text>
  `).join('');
  const labels = monthKeys.map((month, index) =>
    `<text x="${x(index)}" y="${height - 18}" text-anchor="middle" fill="#64748b" font-size="10">${escapeAuditReportText(getAuditMonthLabel(month))}</text>`
  ).join('');
  const lines = series.map(item => {
    const points = item.values.map((value, index) => `${x(index)},${y(value)}`).join(' ');
    const markers = item.values.map((value, index) => value > 0
      ? `<circle cx="${x(index)}" cy="${y(value)}" r="5" fill="${item.color}" stroke="white" stroke-width="2" role="button" tabindex="0" aria-label="${escapeAuditReportText(item.title)}: ${value} auditorías NG en ${escapeAuditReportText(getAuditMonthLabel(monthKeys[index]))}" onclick="window.selectAuditReportMonth('${monthKeys[index]}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();window.selectAuditReportMonth('${monthKeys[index]}')}"><title>${escapeAuditReportText(item.title)} · ${value} auditorías NG · ${escapeAuditReportText(getAuditMonthLabel(monthKeys[index]))}</title></circle>`
      : '').join('');
    return `<polyline fill="none" stroke="${item.color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" points="${points}"/>${markers}`;
  }).join('');
  chart.innerHTML = `<svg viewBox="0 0 ${width} ${height}" class="w-full min-w-[720px]" role="img" aria-label="Tendencia mensual de auditorías con NG por formulario">${grid}${labels}${lines}</svg>`;
}

function renderParetoSvg(paretoRows, totalFaults) {
  if (!paretoRows || paretoRows.length === 0 || totalFaults === 0) {
    return `<div class="p-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">No se registraron desvíos o no conformidades para los filtros seleccionados.</div>`;
  }

  const displayItems = paretoRows.slice(0, 8);
  const maxCount = Math.max(1, displayItems[0].count);
  const width = 840;
  const height = 310;
  const left = 60;
  const right = 60;
  const top = 35;
  const bottom = 85;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const colWidth = plotWidth / displayItems.length;
  const barWidth = Math.min(54, Math.max(26, colWidth * 0.58));

  const gridLines = [0, 25, 50, 75, 100].map(pct => {
    const yVal = top + plotHeight - (pct * plotHeight / 100);
    const countVal = Math.round(pct * maxCount / 100);
    return `
      <line x1="${left}" y1="${yVal}" x2="${width - right}" y2="${yVal}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3 3"/>
      <text x="${left - 10}" y="${yVal + 3.5}" fill="#64748b" font-size="9" font-weight="600" text-anchor="end">${countVal}</text>
      <text x="${width - right + 10}" y="${yVal + 3.5}" fill="#64748b" font-size="9" font-weight="600" text-anchor="start">${pct}%</text>
    `;
  }).join('');

  const y80 = top + plotHeight - (80 * plotHeight / 100);
  const line80 = `
    <line x1="${left}" y1="${y80}" x2="${width - right}" y2="${y80}" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5 3"/>
    <rect x="${width - right - 135}" y="${y80 - 18}" width="130" height="16" rx="4" fill="#fef3c7" stroke="#fde68a"/>
    <text x="${width - right - 70}" y="${y80 - 6}" fill="#b45309" font-size="9" font-weight="bold" text-anchor="middle">Límite 80% (Ley Pareto)</text>
  `;

  const axisTitles = `
    <text x="${left}" y="${top - 16}" fill="#0f172a" font-size="10" font-weight="bold" text-anchor="middle">Casos (N°)</text>
    <text x="${width - right}" y="${top - 16}" fill="#b45309" font-size="10" font-weight="bold" text-anchor="middle">% Acumulado</text>
  `;

  const points = [];
  const bars = displayItems.map((item, idx) => {
    const barHeight = (item.count / maxCount) * plotHeight;
    const xCenter = left + idx * colWidth + colWidth / 2;
    const xBar = xCenter - barWidth / 2;
    const yBar = top + plotHeight - barHeight;
    const yPoint = top + plotHeight - (item.cumPercent * plotHeight / 100);
    points.push(`${xCenter},${yPoint}`);

    const barColor = item.isVital ? '#e11d48' : '#94a3b8';
    const labelShort = item.label.length > 24 ? item.label.slice(0, 22) + '...' : item.label;

    return `
      <g class="pareto-bar-group cursor-pointer">
        <rect x="${xBar}" y="${yBar}" width="${barWidth}" height="${barHeight}" rx="5" fill="${barColor}" fill-opacity="0.9" stroke="${barColor}" stroke-width="1">
          <title>${escapeAuditReportText(item.label)}: ${item.count} casos (${item.relPercent}% del total - ${item.cumPercent}% acumulado)</title>
        </rect>
        <text x="${xCenter}" y="${Math.max(top + 12, yBar - 6)}" fill="${barColor}" font-size="10" font-weight="bold" text-anchor="middle">${item.count}</text>
        <text x="${xCenter}" y="${height - 52}" fill="#334155" font-size="9" font-weight="500" text-anchor="end" transform="rotate(-30 ${xCenter} ${height - 52})">${escapeAuditReportText(labelShort)}</text>
      </g>
    `;
  }).join('');

  const polyline = `
    <polyline fill="none" stroke="#f59e0b" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" points="${points.join(' ')}"/>
    ${displayItems.map((item, idx) => {
      const [px, py] = points[idx].split(',');
      return `<circle cx="${px}" cy="${py}" r="4.5" fill="#f59e0b" stroke="#ffffff" stroke-width="2"><title>${escapeAuditReportText(item.label)}: ${item.cumPercent}% acumulado</title></circle>`;
    }).join('')}
  `;

  return `
    <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto" style="min-height: 280px; max-height: 330px;">
      ${axisTitles}
      ${gridLines}
      ${line80}
      ${bars}
      ${polyline}
    </svg>
  `;
}

window.setAuditReportLine = function(line) {
  auditRadiographyConfig.line = line;
  auditRadiographyConfig.month = '';
  window.renderAuditReports();
};

window.setAuditReportFormKey = function(formKey) {
  auditRadiographyConfig.formKey = formKey;
  window.renderAuditReports();
};

window.setAuditReportAuditor = function(auditor) {
  auditRadiographyConfig.auditor = auditor;
  window.renderAuditReports();
};

window.setAuditReportPeriod = function(period) {
  auditRadiographyConfig.period = period;
  auditRadiographyConfig.month = '';
  window.renderAuditReports();
};

window.selectAuditReportMonth = function(monthKey) {
  auditRadiographyConfig.month = auditRadiographyConfig.month === monthKey ? '' : monthKey;
  auditRadiographyConfig.generated = true;
  window.renderAuditReports();
};

window.clearAuditReportMonth = function() {
  auditRadiographyConfig.month = '';
  window.renderAuditReports();
};

window.generateAuditRadiography = function() {
  const start = document.getElementById('reportCustomStart')?.value || '';
  const end = document.getElementById('reportCustomEnd')?.value || '';
  if (auditRadiographyConfig.period === 'custom' && (!start || !end || start > end)) {
    showToast('Seleccioná un período personalizado válido.');
    return;
  }
  auditRadiographyConfig.start = start;
  auditRadiographyConfig.end = end;
  auditRadiographyConfig.generated = true;
  window.renderAuditReports();
};

window.renderAuditReports = function() {
  const lineOptions = document.getElementById('reportLineOptions');
  const periodOptions = document.querySelectorAll('.report-period-option');
  const customDates = document.getElementById('reportCustomDates');
  const results = document.getElementById('reportRadiographyResults');
  if (!lineOptions || !results) return;

  lineOptions.innerHTML = AuditReportLines.map(line => {
    const selected = line.value === auditRadiographyConfig.line;
    return `<button type="button" onclick="window.setAuditReportLine('${escapeAuditReportText(line.value)}')" aria-pressed="${selected}" class="min-h-[54px] rounded-lg border px-3 py-2 text-center transition-colors ${selected ? 'border-violet-400 bg-violet-50 text-violet-800 ring-1 ring-violet-200' : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300'}">
      <span class="block text-[11px] font-bold">${escapeAuditReportText(line.label)}</span>
    </button>`;
  }).join('');
  periodOptions.forEach(button => {
    const selected = button.dataset.period === auditRadiographyConfig.period;
    button.classList.toggle('bg-violet-600', selected);
    button.classList.toggle('border-violet-600', selected);
    button.classList.toggle('text-white', selected);
    button.classList.toggle('bg-white', !selected);
    button.classList.toggle('text-slate-700', !selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  if (customDates) {
    customDates.classList.toggle('hidden', auditRadiographyConfig.period !== 'custom');
    customDates.classList.toggle('grid', auditRadiographyConfig.period === 'custom');
  }
  const startInput = document.getElementById('reportCustomStart');
  const endInput = document.getElementById('reportCustomEnd');
  if (startInput && auditRadiographyConfig.start) startInput.value = auditRadiographyConfig.start;
  if (endInput && auditRadiographyConfig.end) endInput.value = auditRadiographyConfig.end;
  if (!auditRadiographyConfig.generated) return;

  // Poblado dinámico del filtro de formularios
  const formOptionsContainer = document.getElementById('reportFormOptions');
  if (formOptionsContainer) {
    const allFormsList = [
      { key: 'all', short: 'Todos los formularios' },
      ...ALL_SIX_AUDIT_FORMS
    ];
    formOptionsContainer.innerHTML = allFormsList.map(f => {
      const selected = f.key === (auditRadiographyConfig.formKey || 'all');
      return `<button type="button" onclick="window.setAuditReportFormKey('${escapeAuditReportText(f.key)}')" aria-pressed="${selected}" class="px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors ${selected ? 'border-violet-600 bg-violet-600 text-white shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300'}">
        ${escapeAuditReportText(f.short || f.title)}
      </button>`;
    }).join('');
  }

  // Poblado dinámico del selector de operarios/auditores
  const allRecordsRaw = (Array.isArray(AppState.recentFormRecords) ? AppState.recentFormRecords : [])
    .filter(record => !record.isDemo);
  const auditorSelect = document.getElementById('reportAuditorSelect');
  if (auditorSelect) {
    const distinctAuditors = [...new Set(allRecordsRaw.map(r => (r.auditor || '').trim()).filter(Boolean))].sort();
    const currentAud = (auditRadiographyConfig.auditor || 'all').toLowerCase();
    const opts = [
      `<option value="all" ${currentAud === 'all' ? 'selected' : ''}>Todos los auditores y operarios (${distinctAuditors.length})</option>`,
      ...distinctAuditors.map(a => `<option value="${escapeAuditReportText(a)}" ${currentAud === a.toLowerCase() ? 'selected' : ''}>${escapeAuditReportText(a)}</option>`)
    ].join('');
    auditorSelect.innerHTML = opts;
  }

  const definitions = getAuditReportFormDefinitions();
  const allRecords = allRecordsRaw;
  const range = getAuditReportDateRange(auditRadiographyConfig.period, auditRadiographyConfig.start, auditRadiographyConfig.end);
  const selectedRecords = allRecords.filter(record =>
    (auditRadiographyConfig.line === 'all' || normalizeAuditReportLine(record.line) === auditRadiographyConfig.line) &&
    (auditRadiographyConfig.formKey === 'all' || record.formKey === auditRadiographyConfig.formKey) &&
    (auditRadiographyConfig.auditor === 'all' || (record.auditor && record.auditor.trim().toLowerCase() === auditRadiographyConfig.auditor.trim().toLowerCase())) &&
    isAuditDateWithinRange(record.dateKey, range) &&
    (!auditRadiographyConfig.month || record.dateKey?.startsWith(auditRadiographyConfig.month))
  );
  const ngRecords = selectedRecords.filter(isAuditRecordNonConforming);
  const formSummaries = definitions.map((form, index) => {
    const formRecords = selectedRecords.filter(record => record.formKey === form.key);
    const ngAudits = formRecords.filter(isAuditRecordNonConforming);
    const ngItems = ngAudits.reduce((total, record) => total + (Array.isArray(record.ngItems) ? record.ngItems.length : 0), 0);
    const missingDetails = ngAudits.filter(record => !Array.isArray(record.ngItems) || record.ngItems.length === 0).length;
    return { form, color: AuditReportColors[index % AuditReportColors.length], total: formRecords.length, ngAudits: ngAudits.length, ngItems, missingDetails };
  });
  const totalNgItems = formSummaries.reduce((sum, item) => sum + item.ngItems, 0);
  const totalMissingDetails = formSummaries.reduce((sum, item) => sum + item.missingDetails, 0);
  const maxNg = Math.max(1, ...formSummaries.map(item => item.ngAudits));
  const lineLabel = AuditReportLines.find(line => line.value === auditRadiographyConfig.line)?.label || 'Todas las líneas';
  const periodLabel = auditRadiographyConfig.month
    ? getAuditMonthLabel(auditRadiographyConfig.month)
    : auditRadiographyConfig.period === 'all'
      ? 'Todo el período'
      : auditRadiographyConfig.period === 'custom'
        ? `${auditRadiographyConfig.start} al ${auditRadiographyConfig.end}`
        : auditRadiographyConfig.period === 'month'
          ? 'Últimos 30 días'
          : auditRadiographyConfig.period === '7' ? 'Últimos 7 días' : 'Últimos 14 días';
  const ngRowCount = ngRecords.length;
  const detailRows = ngRecords.flatMap(record => {
    const items = Array.isArray(record.ngItems) ? record.ngItems : [];
    const rows = items.length ? items : ['Desvío registrado; el detalle del ítem no está disponible'];
    return rows.map(item => {
      const dateLabel = /^\d{4}-\d{2}-\d{2}$/.test(record.dateKey || '')
        ? new Date(`${record.dateKey}T00:00:00`).toLocaleDateString('es-AR')
        : 'Sin fecha';
      return `<tr class="hover:bg-slate-50">
        <td class="px-4 py-3 whitespace-nowrap">${escapeAuditReportText(dateLabel)}</td>
        <td class="px-4 py-3">${escapeAuditReportText(normalizeAuditReportLine(record.line))}</td>
        <td class="px-4 py-3 font-medium text-slate-700">${escapeAuditReportText(record.formName || FormDefinitions[record.formKey]?.title || 'Formulario')}</td>
        <td class="px-4 py-3 ${items.length ? 'text-rose-700 font-semibold' : 'text-slate-500 italic'}">${escapeAuditReportText(item)}</td>
        <td class="px-4 py-3">${escapeAuditReportText(record.auditor || 'Sin auditor')}</td>
      </tr>`;
    });
  });

// Cálculo de Diagrama de Pareto de No Conformidades (80/20)
  const paretoDefectCounts = new Map();
  ngRecords.forEach(record => {
    const items = Array.isArray(record.ngItems) && record.ngItems.length > 0
      ? record.ngItems
      : ['Desvío registrado sin detalle'];
    items.forEach(rawItem => {
      let item = String(rawItem || '').trim();
      if (item.endsWith(': NG')) item = item.slice(0, -4).trim();
      paretoDefectCounts.set(item, (paretoDefectCounts.get(item) || 0) + 1);
    });
  });

  const sortedParetoItems = [...paretoDefectCounts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const totalParetoFaults = sortedParetoItems.reduce((acc, curr) => acc + curr.count, 0);
  let paretoCumulative = 0;
  const paretoRows = sortedParetoItems.map(item => {
    paretoCumulative += item.count;
    const relPercent = totalParetoFaults > 0 ? (item.count / totalParetoFaults * 100) : 0;
    const cumPercent = totalParetoFaults > 0 ? (paretoCumulative / totalParetoFaults * 100) : 0;
    const isVital = cumPercent <= 80 || (cumPercent - relPercent < 80);
    return {
      ...item,
      relPercent: Math.round(relPercent * 10) / 10,
      cumPercent: Math.round(cumPercent * 10) / 10,
      isVital
    };
  });

  const paretoTableRowsHtml = paretoRows.length ? paretoRows.map((row, idx) => `
    <tr class="hover:bg-slate-50/80 transition-colors">
      <td class="px-4 py-3 text-center">
        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-[10px] font-extrabold text-slate-700">#${idx + 1}</span>
      </td>
      <td class="px-4 py-3 font-semibold text-slate-800" title="${escapeAuditReportText(row.label)}">
        <div class="line-clamp-2 leading-snug">${escapeAuditReportText(row.label)}</div>
      </td>
      <td class="px-3 py-3 text-center">
        <span class="inline-block px-2.5 py-1 rounded-full bg-slate-100 font-black text-slate-900 text-xs border border-slate-200">${row.count}</span>
      </td>
      <td class="px-3 py-3 text-right text-slate-600 font-semibold">${row.relPercent}%</td>
      <td class="px-4 py-3">
        <div class="flex items-center gap-2">
          <div class="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
            <div class="h-full rounded-full ${row.isVital ? 'bg-rose-500' : 'bg-slate-400'}" style="width: ${row.cumPercent}%"></div>
          </div>
          <span class="text-[11px] font-bold text-amber-800 w-12 text-right">${row.cumPercent}%</span>
        </div>
      </td>
      <td class="px-4 py-3 text-center whitespace-nowrap">
        ${row.isVital
          ? '<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[10px] border border-rose-300 shadow-xs"><span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span>Zona Vital (80%)</span>'
          : '<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px] border border-slate-200"><span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>Zona Secundaria</span>'}
      </td>
    </tr>
  `).join('') : '<tr><td colspan="6" class="px-4 py-8 text-center text-slate-400 text-xs">Sin no conformidades para el período y filtros seleccionados.</td></tr>';

    // Análisis de formularios y auditorías realizadas por fecha
  const byDateMap = new Map();
  selectedRecords.forEach(r => {
    const dk = r.dateKey || '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dk)) return;
    if (!byDateMap.has(dk)) byDateMap.set(dk, []);
    byDateMap.get(dk).push(r);
  });

  const sortedDateKeys = [...byDateMap.keys()].sort().reverse();
  const summaryAnalysisRows = [];
  let rowsWithNg = 0;
  let rowsOk = 0;

  sortedDateKeys.forEach(dateKey => {
    const dayRecords = byDateMap.get(dateKey);
    const dayLines = [...new Set(dayRecords.map(r => normalizeAuditReportLine(r.line)))];

    dayLines.forEach(lineName => {
      const lineRecords = dayRecords.filter(r => normalizeAuditReportLine(r.line) === lineName);
      const completedKeys = new Set(lineRecords.map(r => r.formKey));

      const completedForms = ALL_SIX_AUDIT_FORMS.filter(f => completedKeys.has(f.key)).map(f => {
        const count = lineRecords.filter(r => r.formKey === f.key).length;
        const ngCount = lineRecords.filter(r => r.formKey === f.key && isAuditRecordNonConforming(r)).length;
        return { ...f, count, ngCount };
      });

      const ngCount = lineRecords.filter(isAuditRecordNonConforming).length;
      if (ngCount > 0) rowsWithNg++;
      else rowsOk++;

      const dateObj = new Date(`${dateKey}T00:00:00`);
      const dateFormatted = !isNaN(dateObj)
        ? new Intl.DateTimeFormat('es-AR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }).format(dateObj)
        : dateKey;

      summaryAnalysisRows.push({
        dateKey,
        dateFormatted,
        lineName: getCleanLineLabel(lineName),
        completedForms,
        recordsCount: lineRecords.length,
        ngCount
      });
    });
  });

  // Filtrado según auditMissingFilterState (all, ok_only, ng_only)
  const filteredAnalysisRows = summaryAnalysisRows.filter(row => {
    if (auditMissingFilterState === 'ng_only') return row.ngCount > 0;
    if (auditMissingFilterState === 'ok_only') return row.ngCount === 0;
    return true;
  });

  const summaryRowsHtml = filteredAnalysisRows.length ? filteredAnalysisRows.map(row => {
    const completedBadges = row.completedForms.map(f => `
      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold mr-1.5 mb-1 shadow-xs" title="${escapeAuditReportText(f.title)}">
        <span class="text-xs">${f.icon}</span>
        <span>${escapeAuditReportText(f.short)}</span>
        <span class="bg-emerald-200 text-emerald-900 rounded-full px-1.5 py-0.2 text-[10px] font-bold">${f.count}</span>
        ${f.ngCount > 0 ? `<span class="bg-rose-100 text-rose-700 px-1 rounded text-[9px] font-bold">${f.ngCount} NG</span>` : ''}
      </span>
    `).join('');

    const qualityBadge = row.ngCount === 0
      ? '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-300">✓ 100% Conforme</span>'
      : `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold border border-rose-300">⚠ ${row.ngCount} No Conforme${row.ngCount > 1 ? 's' : ''}</span>`;

    return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="px-4 py-3 whitespace-nowrap">
          <div class="font-bold text-slate-800 capitalize">${escapeAuditReportText(row.dateFormatted)}</div>
          <span class="text-[10px] font-mono text-slate-400">${escapeAuditReportText(row.dateKey)}</span>
        </td>
        <td class="px-4 py-3 whitespace-nowrap font-semibold text-slate-700">
          ${escapeAuditReportText(row.lineName)}
        </td>
        <td class="px-4 py-3">
          <div class="flex flex-wrap items-center">
            ${completedBadges || '<span class="text-xs text-slate-400 italic">Sin formularios</span>'}
          </div>
        </td>
        <td class="px-4 py-3 whitespace-nowrap text-center">
          <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            ${row.recordsCount} control${row.recordsCount > 1 ? 'es' : ''}
          </span>
        </td>
        <td class="px-4 py-3 text-right whitespace-nowrap">
          ${qualityBadge}
        </td>
      </tr>
    `;
  }).join('') : `
    <tr>
      <td colspan="5" class="px-4 py-8 text-center text-slate-400 text-xs">
        No se encontraron registros para el filtro seleccionado (${escapeAuditReportText(auditMissingFilterState)}).
      </td>
    </tr>
  `;

  results.innerHTML = `
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h4 class="font-bold text-sm text-slate-900">Radiografía: ${escapeAuditReportText(lineLabel)}</h4>
        <p class="text-[11px] text-slate-500 mt-1">Período: ${escapeAuditReportText(periodLabel)} · ${selectedRecords.length} formularios registrados · ${summaryAnalysisRows.length} registros fecha/línea analizados</p>
      </div>
      ${auditRadiographyConfig.month ? '<button type="button" onclick="window.clearAuditReportMonth()" class="text-[11px] font-semibold text-violet-700 hover:text-violet-900">Quitar filtro del gráfico</button>' : ''}
    </div>

    <!-- KPI CARDS -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
        <span class="text-xs text-slate-500 font-medium">Formularios realizados</span>
        <div class="mt-1 text-2xl font-black text-slate-900">${selectedRecords.length}</div>
        <p class="text-[10px] text-slate-500 mt-0.5">${sortedDateKeys.length} fechas registradas</p>
      </div>
      <div class="p-4 rounded-xl bg-emerald-50/80 border-emerald-200 border shadow-xs">
        <span class="text-xs text-emerald-800 font-medium">Auditorías Conformes (OK)</span>
        <div class="mt-1 text-2xl font-black text-emerald-900">${selectedRecords.length - ngRowCount}</div>
        <p class="text-[10px] text-emerald-700 mt-0.5">${selectedRecords.length ? Math.round((selectedRecords.length - ngRowCount) / selectedRecords.length * 100) : 100}% de conformidad operativa</p>
      </div>
      <div class="p-4 rounded-xl bg-rose-50 border border-rose-200 shadow-xs">
        <span class="text-xs text-rose-700 font-medium">Auditorías con NG</span>
        <div class="mt-1 text-2xl font-black text-slate-900">${ngRowCount}</div>
        <p class="text-[10px] text-rose-600 mt-0.5">${selectedRecords.length ? Math.round(ngRowCount / selectedRecords.length * 100) : 0}% de tasa de desvíos</p>
      </div>
      <div class="p-4 rounded-xl bg-purple-50 border border-purple-200 shadow-xs">
        <span class="text-xs text-purple-700 font-medium">Ítems NG identificados</span>
        <div class="mt-1 text-2xl font-black text-slate-900">${totalNgItems}</div>
        <span class="text-[10px] text-purple-600 mt-0.5 block">${totalMissingDetails} auditorías sin detalle de ítem</span>
      </div>
    </div>

    <!-- SECCIÓN INTERACTIVA: REGISTRO DE FORMULARIOS REALIZADOS POR FECHA -->
    <section class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
      <div class="p-4 sm:p-5 bg-gradient-to-r from-violet-50/80 via-slate-50/60 to-white border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-bold shadow-xs">📋</span>
            <h4 class="font-bold text-sm text-slate-900">Registro de Formularios Realizados por Fecha y Línea</h4>
            <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
              ${selectedRecords.length} auditorías registradas
            </span>
          </div>
          <p class="text-[11px] text-slate-500 mt-1">
            Detalle cronológico de los controles operativos y auditorías registradas en Planta 5.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <div class="inline-flex rounded-lg border border-slate-200 bg-white p-1 text-[11px] font-semibold shadow-xs">
            <button type="button" onclick="window.setAuditMissingFilter('all')" class="px-2.5 py-1 rounded-md transition-colors ${auditMissingFilterState === 'all' ? 'bg-violet-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              Todas (${summaryAnalysisRows.length})
            </button>
            <button type="button" onclick="window.setAuditMissingFilter('ok_only')" class="px-2.5 py-1 rounded-md transition-colors ${auditMissingFilterState === 'ok_only' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              ✅ Conformes (${rowsOk})
            </button>
            <button type="button" onclick="window.setAuditMissingFilter('ng_only')" class="px-2.5 py-1 rounded-md transition-colors ${auditMissingFilterState === 'ng_only' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              ⚠️ Con NG (${rowsWithNg})
            </button>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto max-h-[480px]">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500 border-b border-slate-200 sticky top-0 z-10 shadow-xs">
            <tr>
              <th class="px-4 py-3 bg-slate-50">Fecha</th>
              <th class="px-4 py-3 bg-slate-50">Línea</th>
              <th class="px-4 py-3 bg-slate-50 min-w-[280px]">Formularios Realizados</th>
              <th class="px-4 py-3 bg-slate-50 text-center">Cantidad</th>
              <th class="px-4 py-3 bg-slate-50 text-right">Estado de Calidad</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${summaryRowsHtml}
          </tbody>
        </table>
      </div>
    </section>

    <!-- SECCIÓN: DIAGRAMA DE PARETO (LEY 80/20) -->
    <section class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
      <div class="p-4 sm:p-5 bg-gradient-to-r from-rose-50/80 via-slate-50/60 to-white border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center text-sm font-bold shadow-xs">📊</span>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-bold text-sm text-slate-900">Diagrama de Pareto de No Conformidades (Ley 80 / 20)</h4>
                <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                  ${totalParetoFaults} desvíos analizados
                </span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">
                Identifica las causas vitales (80% del impacto) para priorizar las acciones correctivas de calidad en Planta 5.
              </p>
            </div>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-3 py-1 rounded-lg">
            <span class="w-2.5 h-2.5 rounded-xs bg-rose-500"></span> Barras: Casos (Eje Izq.)
          </span>
          <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg">
            <span class="w-2.5 h-0.5 bg-amber-500"></span> Línea: % Acumulado (Eje Der.)
          </span>
          <span class="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-lg">
            --- Corte 80%
          </span>
        </div>
      </div>

      <div class="p-4 sm:p-6 space-y-6">
        <!-- 1. Gráfico SVG de Pareto con espacio y márgenes equilibrados -->
        <div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:p-6 overflow-x-auto">
          <div class="min-w-[760px] mx-auto">
            ${renderParetoSvg(paretoRows, totalParetoFaults)}
          </div>
        </div>

        <!-- 2. Tabla Resumen y Clasificación de Pareto bien distribuida -->
        <div class="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs">
          <div class="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span class="text-xs font-bold text-slate-900">Ranking Detallado de Defectos & Clasificación ABC</span>
              <span class="text-[11px] text-slate-500 ml-2">(${paretoRows.length} tipos de fallas registradas)</span>
            </div>
            <span class="text-[10px] text-slate-500 font-medium">Los ítems marcados en rojo representan el 80% crítico del problema</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-white text-[10px] uppercase tracking-wide text-slate-500 border-b border-slate-100">
                <tr>
                  <th class="px-4 py-3 w-12 text-center">#</th>
                  <th class="px-4 py-3 min-w-[280px]">Falla / Ítem No Conforme</th>
                  <th class="px-3 py-3 text-center min-w-[80px]">Casos (N°)</th>
                  <th class="px-3 py-3 text-right min-w-[80px]">% Relativo</th>
                  <th class="px-4 py-3 min-w-[180px]">Curva Acumulada (% Acum)</th>
                  <th class="px-4 py-3 text-center min-w-[140px]">Zona de Pareto</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${paretoTableRowsHtml}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <!-- RESULTADO DE LOS 6 FORMULARIOS -->
    <section class="rounded-xl border border-slate-200 p-4 bg-white shadow-xs">
      <div class="mb-3"><h4 class="font-bold text-sm text-slate-900">Resultado de los 6 formularios</h4><p class="text-[11px] text-slate-500 mt-1">Registros y auditorías con NG para la línea y el período elegidos.</p></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        ${formSummaries.map(item => `<div class="rounded-lg border border-slate-200 bg-white p-3">
          <div class="flex items-start justify-between gap-3"><span class="text-xs font-bold text-slate-800">${escapeAuditReportText(item.form.title)}</span><span class="shrink-0 text-[10px] text-slate-500">${item.total} reg.</span></div>
          <div class="mt-2 flex items-center gap-2"><div class="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full" style="width:${item.ngAudits ? Math.max(4, item.ngAudits / maxNg * 100) : 0}%;background:${item.color}"></div></div><span class="w-16 text-right text-[10px] font-semibold text-rose-700">${item.ngAudits} NG</span></div>
          <p class="mt-1 text-[10px] text-slate-500">${item.ngItems} ítems identificados${item.missingDetails ? ` · ${item.missingDetails} sin detalle` : ''}</p>
        </div>`).join('')}
      </div>
    </section>

    <!-- TENDENCIA MENSUAL DE NG -->
    <section class="rounded-xl border border-slate-200 p-4 bg-white shadow-xs">
      <div class="mb-2"><h4 class="font-bold text-sm text-slate-900">Tendencia mensual de NG por formulario</h4><p class="text-[11px] text-slate-500 mt-1">Seleccioná un punto para filtrar el detalle a ese mes.</p></div>
      <div class="flex flex-wrap gap-x-3 gap-y-1 mb-2">${formSummaries.map(item => `<span class="inline-flex items-center gap-1.5 text-[10px] text-slate-600"><i class="w-2.5 h-2.5 rounded-full" style="background:${item.color}"></i>${escapeAuditReportText(item.form.title)}</span>`).join('')}</div>
      <div id="reportTrendChart" class="w-full overflow-x-auto"></div>
    </section>

    <!-- DETALLE DE NO CONFORMIDADES -->
    <section class="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs">
      <div class="px-4 py-3 bg-slate-50 border-b border-slate-200"><h4 class="font-bold text-sm text-slate-900">Detalle de no conformidades</h4><p class="text-[11px] text-slate-500 mt-1">${totalNgItems} ítems identificados · ${totalMissingDetails} auditorías sin detalle por ítem</p></div>
      <div class="overflow-x-auto max-h-[400px]"><table class="w-full text-left text-xs"><thead class="bg-white text-[10px] uppercase tracking-wide text-slate-500 sticky top-0 z-10 border-b border-slate-200"><tr><th class="px-4 py-3 bg-white">Fecha</th><th class="px-4 py-3 bg-white">Línea</th><th class="px-4 py-3 bg-white">Formulario</th><th class="px-4 py-3 bg-white">Ítem NG</th><th class="px-4 py-3 bg-white">Auditor</th></tr></thead>
      <tbody class="divide-y divide-slate-100">${detailRows.length ? detailRows.join('') : '<tr><td colspan="5" class="px-4 py-8 text-center text-slate-400">No hay no conformidades para la línea y el período seleccionados.</td></tr>'}</tbody></table></div>
    </section>
  `;
  renderAuditReportTrend(selectedRecords, definitions);
};

function restoreLineProductionStatus() {
  try {
    const savedStatus = localStorage.getItem(LineProductionStatusStorageKey);
    if (!savedStatus) return;
    const parsedStatus = JSON.parse(savedStatus);
    if (!Array.isArray(parsedStatus)) {
      throw new Error('El formato guardado de estado de producción no es válido.');
    }
    lineProductionStatus = parsedStatus;
  } catch (error) {
    console.error('No se pudieron recuperar los estados diarios de producción.', error);
    showToast('No se pudieron recuperar los estados de producción guardados.');
  }
}

function getLineProductionStatus(lineCode, dateKey) {
  return lineProductionStatus.find(status =>
    status.lineCode === lineCode && status.dateKey === dateKey
  );
}

function setLineProductionStatus(line, date, isProducing, reason = '') {
  const dateKey = getLocalDateKey(date);
  const existingStatus = getLineProductionStatus(line.lineCode, dateKey);
  const previousStatus = lineProductionStatus;
  if (isProducing) {
    if (!existingStatus) return;
    lineProductionStatus = lineProductionStatus.filter(status =>
      status.lineCode !== line.lineCode || status.dateKey !== dateKey
    );
  } else {
    if (!reason.trim()) {
      showToast('Escribe el motivo para registrar la línea sin producción.');
      return;
    }
    lineProductionStatus = lineProductionStatus.filter(status =>
      status.lineCode !== line.lineCode || status.dateKey !== dateKey
    );
    lineProductionStatus.push({
      lineCode: line.lineCode,
      dateKey,
      reason: reason.trim(),
      registeredBy: AppState.currentUser?.fullName || 'Usuario no identificado',
      updatedAt: new Date().toISOString()
    });
  }

  try {
    localStorage.setItem(LineProductionStatusStorageKey, JSON.stringify(lineProductionStatus));
    pendingLineDisable = null;
    showToast(isProducing ? `${line.lineCode} habilitada para producción.` : `${line.lineCode} marcada sin producción.`);
    renderDashboardOverview();
  } catch (error) {
    lineProductionStatus = previousStatus;
    console.error('No se pudo guardar el estado de producción de la línea.', error);
    showToast('No se pudo guardar el cambio. Revisa el almacenamiento del navegador.');
  }
}

function getAuditRecord(line, formKey, dateKey) {
  const lineCode = line.lineCode.toLocaleUpperCase();
  return AppState.recentFormRecords.find(record =>
    !record.isDemo &&
    record.formKey === formKey &&
    (record.dateKey === dateKey || (!record.dateKey && dateKey === getLocalDateKey() && String(record.time).startsWith('Hoy,'))) &&
    String(record.line).toLocaleUpperCase().includes(lineCode)
  );
}

function getCurrentWeekDates(referenceDate = new Date()) {
  const monday = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const offsetFromMonday = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - offsetFromMonday);
  return Array.from({ length: 5 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
}

function openDailyAuditForm(line, formKey) {
  window.openFormularioModal(formKey);

  const lineSelectId = formKey === 'torque'
    ? 'fieldTorqueLine'
    : formKey === 'esd'
      ? 'fieldEsdLine'
      : 'modalFormLineSelect';
  const lineSelect = document.getElementById(lineSelectId);
  if (!lineSelect) return;

  const lineCode = line.lineCode.toLocaleUpperCase();
  const option = Array.from(lineSelect.options).find(item =>
    item.value.toLocaleUpperCase().startsWith(lineCode)
  );
  if (option) lineSelect.value = option.value;
}

let weeklyMatrixWeekOffset = 0;

window.navigateWeeklyMatrix = function(direction) {
  if (direction === 0) {
    weeklyMatrixWeekOffset = 0;
  } else {
    weeklyMatrixWeekOffset += direction;
  }
  renderDashboardOverview();
};

function getDailyAuditRecordsForLine(lineCode, dateKey) {
  const allRecords = Array.isArray(AppState.recentFormRecords) ? AppState.recentFormRecords : [];
  const target = String(lineCode || '').toLocaleUpperCase().trim();
  return allRecords.filter(r => {
    // Solo registros REALES provenientes de las bases de datos sincronizadas
    if (r.isDemo) return false;
    const isRealSheetRecord = (r.source && String(r.source).includes('Google Sheets')) || String(r.id || '').startsWith('sheet-');
    if (!isRealSheetRecord) return false;

    if (r.dateKey !== dateKey) return false;
    const rLine = String(r.line || r.rawLine || '').toLocaleUpperCase();
    if (target.includes('LCD 6') && rLine.includes('LCD 6')) return true;
    if (target.includes('LCD 8') && rLine.includes('LCD 8')) return true;
    if (target.includes('CELDA 2') && rLine.includes('CELDA 2')) return true;
    if (target.includes('CELDA 3') && rLine.includes('CELDA 3')) return true;
    if (target.includes('CELDA 1') && rLine.includes('CELDA 1')) return true;
    if ((target.includes('INSERCI') || target.includes('MANUAL')) && (rLine.includes('INSERCI') || rLine.includes('MANUAL') || rLine.includes('IM-') || rLine.includes('JIG'))) return true;
    return false;
  });
}

function showMatrixHoverTooltip(targetElement, line, date, isFuture, productionStatus, lineDayRecords) {
  let tooltip = document.getElementById('matrixHoverTooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'matrixHoverTooltip';
    tooltip.className = 'fixed z-[9999] pointer-events-none transition-all duration-150 ease-out opacity-0 translate-y-1 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-2xl p-3.5 w-72 text-slate-800 text-xs';
    document.body.appendChild(tooltip);
  }

  const dateLabel = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'short'
  }).format(date);

  const count = (lineDayRecords || []).length;
  const ngCount = (lineDayRecords || []).filter(r => isAuditRecordNonConforming(r)).length;

  let contentHtml = `
    <div class="flex items-center justify-between pb-2.5 border-b border-slate-100">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full ${count > 0 ? (ngCount > 0 ? 'bg-amber-500 shadow-xs ring-2 ring-amber-100' : 'bg-emerald-500 shadow-xs ring-2 ring-emerald-100') : 'bg-slate-300'}"></span>
        <span class="font-extrabold text-slate-900 text-xs tracking-tight">${escapeAuditReportText(line.lineCode)}</span>
      </div>
      <span class="text-[10px] font-semibold text-slate-400 capitalize">${escapeAuditReportText(dateLabel)}</span>
    </div>
  `;

  if (isFuture) {
    contentHtml += `
      <div class="py-3 text-center text-slate-400 text-[11px] font-medium flex items-center justify-center gap-1.5">
        <span>📅</span><span>Fecha futura sin iniciar</span>
      </div>
    `;
  } else if (productionStatus) {
    contentHtml += `
      <div class="py-2.5 text-slate-600 text-[11px]">
        <div class="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Sin producción</div>
        <div class="text-[10.5px] text-slate-500 mt-1">${escapeAuditReportText(productionStatus.reason || 'No especificado')}</div>
      </div>
    `;
  } else if (count === 0) {
    contentHtml += `
      <div class="py-3 text-center text-slate-400 text-[11px] font-medium flex items-center justify-center gap-1.5">
        <span class="text-slate-300">⚪</span><span>0 formularios registrados en BBDD</span>
      </div>
    `;
  } else {
    contentHtml += `
      <div class="mt-2.5 space-y-1.5">
        <div class="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
          <span>Formularios Auditados</span>
          <span class="px-2 py-0.5 rounded-full ${ngCount > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'} font-black text-[9.5px]">
            ${count} ${count === 1 ? 'control' : 'controles'}
          </span>
        </div>
    `;

    lineDayRecords.forEach(r => {
      const isNg = isAuditRecordNonConforming(r);
      const icon = r.formKey === 'esd' ? '⚡' : r.formKey === 'torque' ? '🔩' : r.formKey === 'inicio_turno' ? '📋' : r.formKey === 'cambio_modelo' ? '🔄' : '🏭';
      const shortName = r.formName || r.formKey;

      contentHtml += `
        <div class="flex items-center justify-between gap-2 p-2 rounded-xl transition-colors ${isNg ? 'bg-rose-50/70 border border-rose-200/80' : 'bg-slate-50/80 border border-slate-100'}">
          <div class="flex items-center gap-2 min-w-0">
            <span class="w-6 h-6 rounded-md bg-white border border-slate-200/60 shadow-2xs flex items-center justify-center text-xs shrink-0">${icon}</span>
            <div class="min-w-0">
              <p class="font-bold text-slate-800 text-[11px] truncate leading-tight">${escapeAuditReportText(shortName)}</p>
              <p class="text-[9.5px] text-slate-500 truncate mt-0.5">${escapeAuditReportText(r.auditor || 'Auditor no registrado')}</p>
            </div>
          </div>
          <span class="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black ${isNg ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}">
            ${isNg ? 'Desvío NG' : 'Conforme'}
          </span>
        </div>
      `;
    });

    contentHtml += `</div>`;
  }

  tooltip.innerHTML = contentHtml;

  // Cálculo de posición precisa
  const rect = targetElement.getBoundingClientRect();
  const tooltipWidth = 288;
  let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
  if (left < 12) left = 12;
  if (left + tooltipWidth > window.innerWidth - 12) left = window.innerWidth - tooltipWidth - 12;

  const placeAbove = rect.top > 240;
  tooltip.style.left = `${left}px`;
  if (placeAbove) {
    tooltip.style.top = 'auto';
    tooltip.style.bottom = `${window.innerHeight - rect.top + 10}px`;
  } else {
    tooltip.style.bottom = 'auto';
    tooltip.style.top = `${rect.bottom + 10}px`;
  }

  tooltip.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-1');
  tooltip.classList.add('opacity-100', 'translate-y-0');
}

function hideMatrixHoverTooltip() {
  const tooltip = document.getElementById('matrixHoverTooltip');
  if (tooltip) {
    tooltip.classList.remove('opacity-100', 'translate-y-0');
    tooltip.classList.add('opacity-0', 'pointer-events-none', 'translate-y-1');
  }
}

function renderDailyAuditDetails(line, date, isFuture) {
  const details = document.getElementById('dashboardAuditDayDetails');
  if (!details) return;
  details.replaceChildren();

  const header = document.createElement('div');
  header.className = 'flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200';
  const title = document.createElement('h4');
  title.className = 'text-sm font-bold text-slate-900';
  const dateLabel = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
  title.textContent = `${line.lineCode} · ${dateLabel}`;
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 shadow-2xs';
  closeButton.textContent = '✕ Cerrar detalle';
  closeButton.setAttribute('aria-label', 'Cerrar detalle de auditoría');
  closeButton.addEventListener('click', () => {
    isDailyAuditDetailsOpen = false;
    details.classList.add('hidden');
  });
  header.append(title, closeButton);

  const dateKey = getLocalDateKey(date);
  const productionStatus = getLineProductionStatus(line.lineCode, dateKey);
  const isPendingLineDisable = pendingLineDisable?.lineCode === line.lineCode && pendingLineDisable.dateKey === dateKey;
  
  const statusPill = document.createElement('span');
  statusPill.className = `inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
    productionStatus || isPendingLineDisable
      ? 'border-slate-200 bg-slate-100 text-slate-600'
      : isFuture
        ? 'border-slate-200 bg-slate-50 text-slate-400'
        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }`;
  statusPill.textContent = isFuture
    ? 'Fecha futura'
    : isPendingLineDisable
      ? 'Confirmar sin producción'
      : productionStatus
        ? 'Sin producción'
        : 'Línea Activa';
  header.appendChild(statusPill);
  details.appendChild(header);

  // Consulta de auditorías reales de las bases de datos
  const lineDayRecords = getDailyAuditRecordsForLine(line.lineCode, dateKey);
  const auditListContainer = document.createElement('div');
  auditListContainer.className = 'mt-3 space-y-2';

  if (lineDayRecords.length > 0) {
    const listSummary = document.createElement('div');
    listSummary.className = 'flex items-center justify-between text-xs text-slate-600 pb-1';
    listSummary.innerHTML = `<span class="font-bold text-slate-800">Auditorías registradas en BBDD: <span class="text-emerald-700 font-extrabold">${lineDayRecords.length} formularios</span></span><span class="text-[11px] text-slate-500 font-mono">Fecha: ${dateKey}</span>`;
    auditListContainer.appendChild(listSummary);

    lineDayRecords.forEach(r => {
      const formCard = document.createElement('div');
      const isNg = isAuditRecordNonConforming(r);
      formCard.className = `flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border transition-colors ${
        isNg ? 'bg-amber-50/80 border-amber-200' : 'bg-white border-slate-200 shadow-2xs'
      }`;
      
      const leftCol = document.createElement('div');
      leftCol.className = 'flex items-center gap-2.5';
      const icon = document.createElement('span');
      icon.className = 'w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-sm';
      icon.textContent = r.formKey === 'esd' ? '⚡' : r.formKey === 'torque' ? '🔩' : r.formKey === 'inicio_turno' ? '📋' : r.formKey === 'cambio_modelo' ? '🔄' : '🏭';
      
      const info = document.createElement('div');
      const name = document.createElement('div');
      name.className = 'font-bold text-xs text-slate-800';
      name.textContent = r.formName || r.formKey;
      
      const meta = document.createElement('div');
      meta.className = 'text-[11px] text-slate-500';
      meta.textContent = `Auditor: ${r.auditor || 'Sin auditor'} · Turno: ${r.turno || '1'} · Origen: ${r.source || 'BBDD'}`;
      
      info.append(name, meta);
      leftCol.append(icon, info);
      
      const statusBadge = document.createElement('span');
      statusBadge.className = `px-2.5 py-1 rounded-full text-[10px] font-bold ${
        isNg ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
      }`;
      statusBadge.textContent = isNg ? 'Desvío NG' : 'Conforme';
      
      formCard.append(leftCol, statusBadge);
      auditListContainer.appendChild(formCard);
    });
  } else if (!isFuture && !productionStatus) {
    const emptyNotice = document.createElement('div');
    emptyNotice.className = 'p-4 rounded-xl border border-dashed border-slate-200 bg-white text-center text-xs text-slate-500';
    emptyNotice.textContent = 'No se registran formularios cargados en las bases de datos para esta línea en esta fecha.';
    auditListContainer.appendChild(emptyNotice);
  }

  details.appendChild(auditListContainer);

  if (productionStatus) {
    const reason = document.createElement('p');
    reason.className = 'mt-3 text-[11px] text-slate-600 bg-slate-100 p-2.5 rounded-lg border border-slate-200';
    reason.textContent = `Motivo sin producción: ${productionStatus.reason} · Registrado por: ${productionStatus.registeredBy || 'Usuario'}`;
    details.appendChild(reason);
  }

  if (!isFuture && !isPendingLineDisable) {
    const productionAction = document.createElement('div');
    productionAction.className = 'mt-4 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4';
    const actionCopy = document.createElement('div');
    const actionTitle = document.createElement('p');
    actionTitle.className = 'text-xs font-bold text-slate-800';
    actionTitle.textContent = productionStatus ? '¿La línea volvió a producir?' : '¿La línea no produjo en esta fecha?';
    const actionHint = document.createElement('p');
    actionHint.className = 'mt-0.5 text-[10px] text-slate-500';
    actionHint.textContent = productionStatus
      ? 'Al reactivarla, se reanuda el registro de actividad.'
      : 'Marcá la jornada como sin producción si no hubo operaciones.';
    actionCopy.append(actionTitle, actionHint);

    const productionButton = document.createElement('button');
    productionButton.type = 'button';
    productionButton.className = productionStatus
      ? 'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 transition-colors hover:bg-emerald-100'
      : 'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100';
    productionButton.textContent = productionStatus ? 'Reactivar producción' : 'Marcar sin producción';
    productionButton.addEventListener('click', () => {
      if (productionStatus) {
        setLineProductionStatus(line, date, true);
      } else {
        pendingLineDisable = { lineCode: line.lineCode, dateKey };
        renderDailyAuditDetails(line, date, isFuture);
      }
    });
    productionAction.append(actionCopy, productionButton);
    details.appendChild(productionAction);
  } else if (isPendingLineDisable) {
    const reasonForm = document.createElement('form');
    reasonForm.className = 'mt-3 rounded-xl border border-amber-200 bg-amber-50/50 p-3 space-y-2';
    const label = document.createElement('label');
    label.className = 'block text-xs font-bold text-amber-900';
    label.textContent = 'Indicá el motivo para marcar la jornada como sin producción:';
    const reasonInput = document.createElement('input');
    reasonInput.type = 'text';
    reasonInput.required = true;
    reasonInput.maxLength = 180;
    reasonInput.placeholder = 'Motivo (ej: Sin plan de producción / Mantenimiento)';
    reasonInput.className = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-red-500 focus:outline-none';
    const formActions = document.createElement('div');
    formActions.className = 'flex justify-end gap-2 pt-1';
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50';
    cancelButton.textContent = 'Cancelar';
    cancelButton.addEventListener('click', () => {
      pendingLineDisable = null;
      renderDailyAuditDetails(line, date, isFuture);
    });
    const saveButton = document.createElement('button');
    saveButton.type = 'submit';
    saveButton.className = 'rounded-lg bg-red-600 px-3.5 py-1.5 text-[11px] font-bold text-white hover:bg-red-700';
    saveButton.textContent = 'Confirmar';
    reasonForm.addEventListener('submit', event => {
      event.preventDefault();
      setLineProductionStatus(line, date, false, reasonInput.value);
    });
    formActions.append(cancelButton, saveButton);
    reasonForm.append(label, reasonInput, formActions);
    details.appendChild(reasonForm);
  }
}

function renderDashboardOverview() {
  const matrixHead = document.getElementById('dashboardWeeklyAuditHead');
  const matrixBody = document.getElementById('dashboardWeeklyAuditMatrix');
  if (!matrixHead || !matrixBody) return;

  const lines = DailyAuditLineCodes
    .map(lineCode => AppState.lines.find(line => line.lineCode === lineCode))
    .filter(Boolean);
  
  const today = new Date();
  const refDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (weeklyMatrixWeekOffset !== 0) {
    refDate.setDate(refDate.getDate() + (weeklyMatrixWeekOffset * 7));
  }
  const todayKey = getLocalDateKey(today);
  const dates = getCurrentWeekDates(refDate);
  const weekLabel = new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const dateElement = document.getElementById('dashboardAuditDate');
  if (dateElement) {
    const isCurrentWeek = weeklyMatrixWeekOffset === 0;
    dateElement.innerHTML = `Semana del ${weekLabel.format(dates[0])} al ${weekLabel.format(dates[4])} ${isCurrentWeek ? '<span class="ml-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Semana actual</span>' : '<span class="ml-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">Historial</span>'}`;
  }

  const dateKeys = dates.map(getLocalDateKey);
  const hasSelectedCell = selectedDailyAuditCell &&
    lines.some(line => line.lineCode === selectedDailyAuditCell.lineCode) &&
    dateKeys.includes(selectedDailyAuditCell.dateKey);
  if (!hasSelectedCell) {
    const currentWeekday = dateKeys.includes(todayKey)
      ? todayKey
      : dateKeys.filter(dateKey => dateKey <= todayKey).slice(-1)[0];
    selectedDailyAuditCell = {
      lineCode: lines[0]?.lineCode,
      dateKey: currentWeekday || dateKeys[0]
    };
  }

  matrixHead.replaceChildren();
  const headerRow = document.createElement('tr');
  const lineHeader = document.createElement('th');
  lineHeader.scope = 'col';
  lineHeader.className = 'sticky left-0 z-10 min-w-[150px] border-b border-slate-200 px-3 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-600 bg-slate-50';
  lineHeader.textContent = 'Línea · Responsables';
  headerRow.appendChild(lineHeader);
  dates.forEach(date => {
    const header = document.createElement('th');
    header.scope = 'col';
    header.className = 'min-w-[88px] border-b border-slate-200 px-2 py-3 text-center text-[10px] font-bold text-slate-600';
    const dateLabel = new Intl.DateTimeFormat('es-AR', { weekday: 'short', day: 'numeric' }).format(date);
    header.textContent = dateLabel.replace('.', '');
    header.title = new Intl.DateTimeFormat('es-AR', { dateStyle: 'full' }).format(date);
    if (getLocalDateKey(date) === todayKey) header.classList.add('text-rose-700');
    headerRow.appendChild(header);
  });
  matrixHead.appendChild(headerRow);

  matrixBody.replaceChildren();
  let initialSelection = null;
  lines.forEach(line => {
    const row = document.createElement('tr');
    const lineCell = document.createElement('th');
    lineCell.scope = 'row';
    lineCell.className = 'sticky left-0 z-[1] border-r border-slate-100 bg-white px-3 py-3 text-left text-xs font-bold text-slate-800';
    const lineName = document.createElement('div');
    lineName.textContent = line.lineCode;
    // Obtener auditores asignados dinámicamente desde el servidor/estado
    const assignment = Array.isArray(AppState.lineAuditorAssignments)
      ? AppState.lineAuditorAssignments.find(a => a.lineCode === line.lineCode)
      : null;
    let dailyAuditors = [];
    if (assignment) {
      if (assignment.auditor1Name) dailyAuditors.push({ name: assignment.auditor1Name, email: assignment.auditor1Email });
      if (assignment.auditor2Name) dailyAuditors.push({ name: assignment.auditor2Name, email: assignment.auditor2Email });
    } else if (Array.isArray(line.dailyAuditors) && line.dailyAuditors.length) {
      dailyAuditors = line.dailyAuditors;
    }
    const lineResponsibles = document.createElement('div');
    lineResponsibles.className = 'mt-1 space-y-0.5 text-[10px] font-normal leading-tight text-slate-500';
    if (dailyAuditors.length) {
      dailyAuditors.forEach(auditor => {
        const responsible = document.createElement('div');
        const responsibleName = document.createElement('div');
        responsibleName.textContent = auditor.name;
        responsible.appendChild(responsibleName);
        if (auditor.email) {
          const responsibleEmail = document.createElement('div');
          responsibleEmail.className = 'break-all text-[9px] text-slate-400';
          responsibleEmail.textContent = auditor.email;
          responsible.appendChild(responsibleEmail);
        }
        lineResponsibles.appendChild(responsible);
      });
    } else {
      const noAuditor = document.createElement('div');
      noAuditor.className = 'text-[10px] text-slate-400 italic';
      noAuditor.textContent = 'Sin auditor asignado';
      lineResponsibles.appendChild(noAuditor);
    }
    lineCell.append(lineName, lineResponsibles);
    row.appendChild(lineCell);

    dates.forEach(date => {
      const dateKey = getLocalDateKey(date);
      const isFuture = dateKey > todayKey;
      const productionStatus = getLineProductionStatus(line.lineCode, dateKey);

      // Conteo real por línea y fecha desde las BBDD
      const lineDayRecords = getDailyAuditRecordsForLine(line.lineCode, dateKey);
      const count = lineDayRecords.length;
      const ngCount = lineDayRecords.filter(r => isAuditRecordNonConforming(r)).length;
      const isSelected = selectedDailyAuditCell && selectedDailyAuditCell.lineCode === line.lineCode && selectedDailyAuditCell.dateKey === dateKey;
      if (isSelected) initialSelection = { line, date, isFuture, records: lineDayRecords };

      const cell = document.createElement('td');
      cell.className = `border-b border-slate-100 p-1.5 text-center ${dateKey === todayKey ? 'bg-rose-50/20' : ''}`;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `mx-auto flex min-h-12 w-full flex-col items-center justify-center rounded-lg border px-1 py-1.5 transition-all ${
        isFuture
          ? 'cursor-default border-slate-100 bg-slate-100 text-slate-400'
          : productionStatus
            ? 'cursor-default border-slate-300 bg-slate-200 text-slate-700'
            : count > 0
              ? (ngCount > 0
                  ? 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 shadow-xs'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 shadow-xs')
              : (dateKey === todayKey
                  ? 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  : 'border-slate-200 bg-slate-50/80 text-slate-400 hover:bg-slate-100')
      }${isSelected ? ' ring-2 ring-rose-500 ring-offset-1' : ''}`;
      button.disabled = isFuture;
      button.setAttribute('aria-label', `${line.lineCode}, ${dateKey}: ${count} formularios auditados`);
      // No seteamos title nativo para que no aparezca el tooltip negro feo del navegador
      button.removeAttribute('title');
      
      const countText = document.createElement('span');
      countText.className = 'text-xs font-black';
      countText.textContent = isFuture ? '—' : productionStatus ? 'N/P' : `${count}`;

      const statusText = document.createElement('span');
      statusText.className = 'text-[8.5px] font-semibold tracking-tight';
      statusText.textContent = isFuture
        ? 'Futuro'
        : productionStatus
          ? 'Sin prod.'
          : count > 0
            ? (count === 1 ? '1 auditado' : `${count} auditados`)
            : '0 auditados';

      button.append(countText, statusText);

      // Popover minimalista flotante al pasar el mouse (hover)
      button.addEventListener('mouseenter', () => {
        showMatrixHoverTooltip(button, line, date, isFuture, productionStatus, lineDayRecords);
      });
      button.addEventListener('mouseleave', () => {
        hideMatrixHoverTooltip();
      });

      if (!isFuture) {
        button.addEventListener('click', () => {
          pendingLineDisable = null;
          selectedDailyAuditCell = { lineCode: line.lineCode, dateKey };
          isDailyAuditDetailsOpen = true;
          renderDashboardOverview();
        });
      }
      cell.appendChild(button);
      row.appendChild(cell);
    });
    matrixBody.appendChild(row);
  });

  const details = document.getElementById('dashboardAuditDayDetails');
  if (initialSelection && isDailyAuditDetailsOpen) {
    selectedDailyAuditCell = {
      lineCode: initialSelection.line.lineCode,
      dateKey: getLocalDateKey(initialSelection.date)
    };
    details.classList.remove('hidden');
    renderDailyAuditDetails(initialSelection.line, initialSelection.date, initialSelection.isFuture);
  } else if (details) {
    details.classList.add('hidden');
  }
}

function initModals() {
  const lineModal = document.getElementById('lineDetailModal');
  const closeLineModalBtn = document.getElementById('closeLineModalBtn');
  if (closeLineModalBtn && lineModal) {
    closeLineModalBtn.addEventListener('click', () => {
      lineModal.classList.add('hidden');
    });
  }

  const newAuditModal = document.getElementById('newAuditModal');
  const openNewAuditBtn = document.getElementById('openNewAuditBtn');
  const closeNewAuditBtn = document.getElementById('closeNewAuditBtn');

  if (openNewAuditBtn && newAuditModal) {
    openNewAuditBtn.addEventListener('click', () => {
      if (AppState.currentUser) {
        const auditorInput = document.getElementById('auditorInput');
        if (auditorInput) auditorInput.value = AppState.currentUser.fullName;
      }
      newAuditModal.classList.remove('hidden');
    });
  }

  if (closeNewAuditBtn && newAuditModal) {
    closeNewAuditBtn.addEventListener('click', () => {
      newAuditModal.classList.add('hidden');
    });
  }

  // Cerrar Modal Serial
  const closeSerialModalBtn = document.getElementById('closeSerialModalBtn');
  const serialModal = document.getElementById('serialDetailModal');
  if (closeSerialModalBtn && serialModal) {
    closeSerialModalBtn.addEventListener('click', () => {
      serialModal.classList.add('hidden');
    });
  }

  // Submit Auditoría
  const auditForm = document.getElementById('newAuditForm');
  if (auditForm) {
    auditForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleNewAuditSubmit();
    });
  }
}

window.openLineDetailModal = function(lineId) {
  const line = AppState.lines.find(l => l.id === lineId);
  if (!line) return;

  const modal = document.getElementById('lineDetailModal');
  if (!modal) return;

  document.getElementById('detailLineTitle').textContent = `${line.lineCode} — ${line.modelName}`;
  document.getElementById('detailLineSubtitle').textContent = `${line.subfamily} | ${line.shiftName}`;
  document.getElementById('detailLineStatus').textContent = line.status;
  document.getElementById('detailLineFPY').textContent = `${line.fpy}%`;
  document.getElementById('detailLineUnits').textContent = `${line.inspectedUnits} unid.`;

  document.getElementById('detailStationHipot').innerHTML = renderStationChip(line.stations.hipot) + ` <span class="text-xs text-slate-500 ml-1">${line.stations.hipot.tooltip}</span>`;
  document.getElementById('detailStationOpenCell').innerHTML = renderStationChip(line.stations.openCell) + ` <span class="text-xs text-slate-500 ml-1">${line.stations.openCell.tooltip}</span>`;
  document.getElementById('detailStationCalib').innerHTML = renderStationChip(line.stations.calibracion) + ` <span class="text-xs text-slate-500 ml-1">${line.stations.calibracion.tooltip}</span>`;
  document.getElementById('detailStationAudio').innerHTML = renderStationChip(line.stations.audio) + ` <span class="text-xs text-slate-500 ml-1">${line.stations.audio.tooltip}</span>`;
  document.getElementById('detailStationBurnin').innerHTML = renderStationChip(line.stations.burnin) + ` <span class="text-xs text-slate-500 ml-1">${line.stations.burnin.tooltip}</span>`;
  document.getElementById('detailStationPacking').innerHTML = renderStationChip(line.stations.empaque) + ` <span class="text-xs text-slate-500 ml-1">${line.stations.empaque.tooltip}</span>`;

  modal.classList.remove('hidden');
};

function handleNewAuditSubmit() {
  const lineSelect = document.getElementById('auditLineSelect').value;
  const stationSelect = document.getElementById('auditStationSelect').value;
  const resultSelect = document.getElementById('auditResultSelect').value;
  const auditorName = document.getElementById('auditorInput').value || (AppState.currentUser ? AppState.currentUser.fullName : 'Rober Quiquinlla');
  const notes = document.getElementById('auditNotesInput').value;

  const targetLine = AppState.lines.find(l => l.id === parseInt(lineSelect));
  if (targetLine && targetLine.stations[stationSelect]) {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (resultSelect === 'ok') {
      targetLine.stations[stationSelect] = {
        status: 'ok',
        val: 'OK',
        tooltip: notes || `Aprobado por ${auditorName} a las ${timeStr}`
      };
    } else if (resultSelect === 'alert') {
      targetLine.stations[stationSelect] = {
        status: 'alert',
        val: 'NOK',
        tooltip: notes || `Falla registrada por ${auditorName}`
      };
      targetLine.status = 'Observado';
      targetLine.statusClass = 'badge-warning';
      targetLine.defectCount += 1;
    }

    renderLinesTable();
    updateSummaryMetrics();
  }

  const modal = document.getElementById('newAuditModal');
  if (modal) modal.classList.add('hidden');

  showToast(`✓ Inspección registrada con éxito por ${auditorName}.`);
}

// Toast
function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 transform transition-all duration-300 translate-y-3 opacity-0';
  toast.innerHTML = `
    <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
    <span>${msg}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('translate-y-3', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-3');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==========================================
// 13. MÓDULO DE FORMULARIOS & CHECKLISTS
// ==========================================
const FormDefinitions = {
  inicio_turno: {
    key: 'inicio_turno',
    title: 'CHECKLIST INICIO DE TURNO',
    subtitle: 'Supervisión del estado de arranque y orden (5S) en la línea.',
    badgeText: '19 reg',
    iconBg: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    iconSvg: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>`,
    renderFields: () => `
      <div class="space-y-2">
        <label class="block font-semibold text-slate-800 mb-1">Puntos de Control de Arranque & 5S</label>
        <div class="space-y-2 bg-slate-50/60 p-3 rounded-xl border border-slate-200/70">
          <label class="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input type="checkbox" checked required class="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-400">
            <span>Orden y limpieza de banco de trabajo y herramientas (5S)</span>
          </label>
          <label class="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input type="checkbox" checked required class="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-400">
            <span>Iluminación adecuada en estación de ensamble (>1000 Lux)</span>
          </label>
          <label class="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input type="checkbox" checked required class="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-400">
            <span>Disponibilidad y uso correcto de EPP (guantes limpios, batas ESD)</span>
          </label>
          <label class="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input type="checkbox" checked required class="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-400">
            <span>Muestras límite de defectos visibles y actualizadas</span>
          </label>
          <label class="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input type="checkbox" checked required class="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-400">
            <span>Pistola lectora de código de barras y terminal de trazabilidad operativo</span>
          </label>
        </div>
      </div>
    `,
    extractSummary: () => '5S & Arranque Conforme (100%)'
  },

  torque: {
    key: 'torque',
    title: 'CONTROL DE TORQUE',
    subtitle: 'Verificación estricta del torque de atornilladores eléctricos.',
    badgeText: '815 reg',
    iconBg: 'bg-rose-50 border-rose-100 text-rose-500',
    iconSvg: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
    renderFields: () => `
      <!-- Enlace BBDD y Cabecera de 6 Campos -->
      <div class="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3.5">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200/60">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold cursor-pointer hover:bg-emerald-100 transition-colors" onclick="showToast('Abriendo BBDD de Control de Torque...')">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span>BBDD - Control de Torque ↗</span>
            </span>
          </div>
          <span class="text-[11px] text-slate-400 font-medium">Planta 5 · Ensambles TV</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <!-- 1. LÍNEA -->
          <div>
            <label class="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
              Línea <span class="text-red-500">*</span>
            </label>
            <select id="fieldTorqueLine" class="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-medium focus:ring-2 focus:ring-red-400 focus:outline-none">
              <option value="CELDA 1">Celda 1</option>
              <option value="CELDA 2">Celda 2</option>
              <option value="LCD 6">LCD 6</option>
              <option value="LCD 8">LCD 8</option>
              <option value="CELDA 3">Celda 3</option>
              <option value="INSERCIÓN PLACAS">Inserción Placas</option>
              <option value="INSERCIÓN MANUAL &amp; JIG">Inserción Manual &amp; JIG</option>
            </select>
          </div>

          <!-- 2. AUDITOR -->
          <div>
            <label class="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
              Auditor <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-slate-400">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </span>
              <input type="text" id="fieldTorqueAuditor" value="Rober Quiquinlla" required
                class="w-full pl-7 pr-2.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-medium focus:ring-2 focus:ring-red-400 focus:outline-none">
            </div>
          </div>

          <!-- 3. SUPERVISOR / LÍDER -->
          <div>
            <label class="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
              Supervisor / Líder
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-slate-400">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </span>
              <select id="fieldTorqueSupervisor" class="w-full pl-7 pr-2.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-medium focus:ring-2 focus:ring-red-400 focus:outline-none">
                <option value="Soledad Romano">Soledad Romano</option>
                <option value="Rober Quiquinlla">Rober Quiquinlla</option>
                
                <option value="Cristian V.">Cristian V.</option>
              </select>
            </div>
          </div>

          <!-- 4. TURNO -->
          <div>
            <label class="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
              Turno
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-slate-400">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </span>
              <select id="fieldTorqueShift" class="w-full pl-7 pr-2.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-medium focus:ring-2 focus:ring-red-400 focus:outline-none">
                <option value="TURNO MAÑANA">TURNO MAÑANA</option>
                <option value="TURNO TARDE">TURNO TARDE</option>
                <option value="TURNO NOCHE">TURNO NOCHE</option>
              </select>
            </div>
          </div>

          <!-- 5. LOTE -->
          <div>
            <label class="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
              Lote
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-slate-400">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              </span>
              <input type="text" id="fieldTorqueLote" value="103" placeholder="103"
                class="w-full pl-7 pr-2.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-mono font-bold focus:ring-2 focus:ring-red-400 focus:outline-none">
            </div>
          </div>

          <!-- 6. MODELO AUDITADO -->
          <div>
            <label class="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
              Modelo Auditado <span class="text-red-500">*</span>
            </label>
            <input type="text" id="fieldTorqueModel" value="91DB50X3510" placeholder="Ej: 91DB50X3510" required
              class="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-mono font-bold focus:ring-2 focus:ring-red-400 focus:outline-none">
          </div>
        </div>
        <span class="text-[10px] text-slate-400 block">
          (introduzca un único modelo con "91" adelante y letras mayúsculas)
        </span>
      </div>

      <!-- Alerta Informativa de Tensión en Punta (Lunes / Martes) -->
      <div class="p-3 rounded-xl bg-amber-50/90 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div class="flex items-start gap-2.5">
          <div class="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold">
            ⚡
          </div>
          <div>
            <span class="font-bold text-amber-900">📅 HOY ES LUNES:</span>
            <span class="text-amber-800 ml-1">La medición de Tensión en Punta (&lt; 0.5 Vdc) se realiza los MARTES. En otros días el campo se anula automáticamente salvo confirmación explícita.</span>
          </div>
        </div>
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-200/60 border border-amber-300 text-amber-900 font-bold text-[11px] shrink-0 self-start sm:self-auto">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          <span>Anulado por defecto (Lunes)</span>
        </span>
      </div>

      <!-- Sección de Especificación de Torque por Puesto -->
      <div class="space-y-3 pt-2">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
            <div>
              <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wide">ESPECIFICACIÓN DE TORQUE POR PUESTO DE TRABAJO</h4>
              <p class="text-[11px] text-slate-500">Ingrese los rangos de pauta y valores medidos para cada puesto auditado.</p>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button type="button" onclick="showToast('Índice de Capacidad del Proceso: Cp = 1.42 · Cpk = 1.38 (Conforme)')"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-colors">
              <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              <span>CONFIABILIDAD</span>
            </button>
            <button type="button" onclick="addTorquePuestoRow()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              <span>+ AGREGAR PUESTO</span>
            </button>
          </div>
        </div>

        <!-- Tabla Completa de Puestos de Torque -->
        <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th class="py-2.5 px-2.5 min-w-[85px]">Puesto</th>
                <th class="py-2.5 px-2.5 min-w-[110px]">Nro Atornilladora</th>
                <th class="py-2.5 px-2.5 min-w-[75px]">Rango Mín</th>
                <th class="py-2.5 px-2.5 min-w-[75px]">Rango Máx</th>
                <th class="py-2.5 px-2.5 min-w-[90px] text-red-600 font-black">TORQUE MEDIDO</th>
                <th class="py-2.5 px-2.5 min-w-[125px]">Tornillo Prisionero</th>
                <th class="py-2.5 px-2.5 min-w-[130px]">Tensión Punta <span class="text-amber-600 font-bold">&lt;0.5V</span></th>
                <th class="py-2.5 px-2.5 text-center min-w-[75px]">Estado</th>
                <th class="py-2.5 px-2.5 min-w-[150px]">Observaciones / Desvíos</th>
                <th class="py-2.5 px-2.5 min-w-[160px]">Acción de Corrección</th>
                <th class="py-2.5 px-2 text-center w-[40px]">Acción</th>
              </tr>
            </thead>
            <tbody id="torquePuestosTableBody" class="divide-y divide-slate-100">
              <!-- Filas inyectadas por renderTorquePuestosTable() -->
            </tbody>
          </table>
        </div>
      </div>
    `,
    extractSummary: () => {
      const model = document.getElementById('fieldTorqueModel')?.value || '91DB50X3510';
      const count = window.torquePuestosData ? window.torquePuestosData.length : 1;
      const allOk = window.torquePuestosData ? window.torquePuestosData.every(p => {
        const val = parseFloat(p.torqueMedido) || 0;
        const min = parseFloat(p.rangoMin) || 0;
        const max = parseFloat(p.rangoMax) || 0;
        return val >= min && val <= max && p.prisionero === 'OK';
      }) : true;
      return `Modelo ${model} · ${count} puestos (${allOk ? 'Torque OK' : 'Con Fallas de Torque'})`;
    }
  },

  esd: {
    key: 'esd',
    title: 'CONTROL DE PULSERAS ESD',
    subtitle: 'Monitoreo de pulseras ESD y continuidad electrostática por puesto de trabajo.',
    badgeText: '815 reg',
    iconBg: 'bg-purple-50 border-purple-100 text-purple-600',
    iconSvg: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`,
    renderFields: () => `
      <!-- Cabecera Superior del Formulario ESD: Línea, Auditor, Supervisor, Turno, Modelo -->
      <div class="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3.5">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
              Línea <span class="text-red-500">*</span>
            </label>
            <select id="fieldEsdLine" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-red-400 focus:outline-none">
              <option value="CELDA 1">Celda 1</option>
              <option value="CELDA 2">Celda 2</option>
              <option value="LCD 6">LCD 6</option>
              <option value="LCD 8">LCD 8</option>
              <option value="CELDA 3">Celda 3</option>
              <option value="INSERCIÓN PLACAS">Inserción Placas</option>
              <option value="INSERCIÓN MANUAL &amp; JIG">Inserción Manual &amp; JIG</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
              Auditor <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </span>
              <input type="text" id="fieldEsdAuditor" value="Rober Quiquinlla" required
                class="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-red-400 focus:outline-none">
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
              Supervisor / Líder
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              </span>
              <select id="fieldEsdSupervisor" class="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-red-400 focus:outline-none">
                <option value="Rober Quiquinlla">Rober Quiquinlla</option>
                <option value="Soledad Romano">Soledad Romano</option>
                
                <option value="Cristian V.">Cristian V.</option>
              </select>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div>
            <label class="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
              Turno
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </span>
              <select id="fieldEsdShift" class="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-red-400 focus:outline-none">
                <option value="TURNO MAÑANA">TURNO MAÑANA</option>
                <option value="TURNO TARDE">TURNO TARDE</option>
                <option value="TURNO NOCHE">TURNO NOCHE</option>
              </select>
            </div>
          </div>

          <div class="md:col-span-2">
            <label class="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
              Modelo Auditado <span class="text-red-500">*</span>
            </label>
            <input type="text" id="fieldEsdModel" value="91DB50X3510" placeholder="Ej: 91DB50X3510" required
              class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono font-bold focus:ring-2 focus:ring-red-400 focus:outline-none">
            <span class="text-[10px] text-slate-400 mt-1 block">
              (introduzca un único modelo con "91" adelante y letras mayúsculas)
            </span>
          </div>
        </div>
      </div>

      <!-- Sección de Puestos Auditados con Botón de Agregar -->
      <div class="space-y-3 pt-2">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            </div>
            <div>
              <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wide">MONITOREO DE PULSERAS ESD POR PUESTO DE TRABAJO</h4>
              <p class="text-[11px] text-slate-500">Ingrese los datos correspondientes para cada puesto auditado.</p>
            </div>
          </div>
          <button type="button" onclick="addEsdPuestoRow()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>+ AGREGAR PUESTO</span>
          </button>
        </div>

        <!-- Tabla de Puestos ESD Dinámicos -->
        <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th class="py-2.5 px-3 min-w-[100px]">Puesto</th>
                <th class="py-2.5 px-3 min-w-[170px]">Estado de Testigo</th>
                <th class="py-2.5 px-3 min-w-[130px]">Estado de Pulsera</th>
                <th class="py-2.5 px-3 min-w-[150px]">Evidencia Fotográfica (Max 10)</th>
                <th class="py-2.5 px-3 min-w-[180px]">Observaciones / Desvíos</th>
                <th class="py-2.5 px-3 text-center min-w-[80px]">Estado</th>
                <th class="py-2.5 px-3 text-center w-[50px]">Acción</th>
              </tr>
            </thead>
            <tbody id="esdPuestosTableBody" class="divide-y divide-slate-100">
              <!-- Filas inyectadas por renderEsdPuestosTable() -->
            </tbody>
          </table>
        </div>
      </div>
    `,
    extractSummary: () => {
      const model = document.getElementById('fieldEsdModel')?.value || '91DB50X3510';
      const count = window.esdPuestosData ? window.esdPuestosData.length : 2;
      const allOk = window.esdPuestosData ? window.esdPuestosData.every(p => p.testigo === 'OK' && p.pulsera === 'OK') : true;
      return `Modelo ${model} · ${count} puestos (${allOk ? 'OK' : 'Con desvíos'})`;
    }
  },

  cambio_modelo: {
    key: 'cambio_modelo',
    title: 'CHECKLIST DE CAMBIO DE MODELO (RG-0220)',
    subtitle: 'Auditoría integral y verificación de pautas para el cambio de modelo en línea.',
    badgeText: '19 reg',
    iconBg: 'bg-amber-50 border-amber-100 text-amber-600',
    iconSvg: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>`,
    renderFields: () => `
      <div class="space-y-3 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/70">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Modelo Saliente</label>
            <input type="text" id="fieldChangeFrom" value="UHD 50\" 4K HDR" required class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nuevo Modelo Entrante</label>
            <select id="fieldChangeTo" class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium">
              <option value="OLED 55&quot; 4K Smart Master">OLED 55" 4K Smart Master</option>
              <option value="QLED 65&quot; Quantum Pro">QLED 65" Quantum Pro</option>
              <option value="FHD 43&quot; Google TV">FHD 43" Google TV</option>
              <option value="MiniLED 75&quot; 8K CineMaster">MiniLED 75" 8K CineMaster</option>
            </select>
          </div>
        </div>
        <div class="space-y-1.5 pt-2 border-t border-slate-200/60">
          <label class="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input type="checkbox" checked required class="w-4 h-4 text-red-600 rounded border-slate-300">
            <span>BOM validado y partes del modelo anterior retiradas de línea</span>
          </label>
          <label class="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input type="checkbox" checked required class="w-4 h-4 text-red-600 rounded border-slate-300">
            <span>Guías mecánicas, apoyos y topes de celda ajustados a nuevas dimensiones</span>
          </label>
          <label class="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input type="checkbox" checked required class="w-4 h-4 text-red-600 rounded border-slate-300">
            <span>Software, perfiles de imagen D65 y firmware de estación cargados</span>
          </label>
          <label class="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input type="checkbox" checked required class="w-4 h-4 text-red-600 rounded border-slate-300">
            <span>Primera pieza ("Golden Sample") inspeccionada y aprobada por Auditor</span>
          </label>
        </div>
      </div>
    `,
    extractSummary: () => {
      const toModel = document.getElementById('fieldChangeTo')?.value || 'Nuevo Modelo';
      return `Cambio a ${toModel} (Golden Sample OK)`;
    }
  },

  im_diario: {
    key: 'im_diario',
    title: 'CHECK LIST - INICIO DE PRODUCCIÓN DIARIO - IM & JIG RG-0772',
    subtitle: 'Control de inicio de producción diario para líneas de inserción de componentes IM & JIG RG-0772.',
    badgeText: '34 reg',
    iconBg: 'bg-sky-50 border-sky-100 text-sky-600',
    iconSvg: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>`,
    renderFields: () => `
      <div class="space-y-3 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/70">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Código de JIG / Matriz</label>
            <input type="text" id="fieldImJigCode" value="JIG-IM-0772-A" required class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Estación de Inserción</label>
            <select id="fieldImLine" class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium">
              <option value="Inserción Manual 1">Inserción Manual 1 (IM-1)</option>
              <option value="Inserción Manual 2">Inserción Manual 2 (IM-2)</option>
              <option value="Celdas de JIG Placas">Celdas de JIG Placas</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Lote de producción *</label>
            <input type="text" id="fieldImDailyLot" maxlength="100" required oninput="invalidateImDailySearch()" placeholder="Ej.: 103" class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Modelo a producir *</label>
            <input type="text" id="fieldImDailyModel" maxlength="250" required oninput="invalidateImDailySearch()" placeholder="Debe coincidir con el modelo auditado" class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800">
          </div>
        </div>
        <section class="space-y-3 rounded-xl border border-slate-300 bg-white p-3.5" aria-labelledby="imDailyDeviationsTitle">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 id="imDailyDeviationsTitle" class="font-bold text-slate-800">01 · Revisión de pautas y desvíos de Cambio de Modelo</h4>
              <p class="mt-1 text-[11px] text-slate-500">Se buscan las no conformidades del mismo lote y modelo para darles seguimiento.</p>
            </div>
            <button type="button" onclick="searchImDailyModelDeviations()" class="rounded-lg bg-blue-600 px-3 py-1.5 font-bold text-white hover:bg-blue-700">Buscar desvíos</button>
          </div>
          <div id="imDailyDeviationsStatus" class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
            Ingresá el lote y el modelo, y seleccioná «Buscar desvíos».
          </div>
          <div id="imDailyDeviationsList" class="hidden space-y-2"></div>
          <label class="block font-semibold text-slate-700">Texto consolidado del punto 1
            <textarea id="imDailyConsolidatedText" rows="2" readonly class="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 font-mono text-[11px] text-slate-700"></textarea>
          </label>
        </section>
        <div class="space-y-1.5 border-t border-slate-200/60 pt-2">
          <label class="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input type="checkbox" checked class="w-4 h-4 text-red-600 rounded border-slate-300">
            <span>Pines de centrado y trabas de fijación mecánicas en buen estado</span>
          </label>
          <label class="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input type="checkbox" checked class="w-4 h-4 text-red-600 rounded border-slate-300">
            <span>Poka-Yoke de orientación de capacitores electrolíticos y diodos OK</span>
          </label>
          <label class="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input type="checkbox" checked class="w-4 h-4 text-red-600 rounded border-slate-300">
            <span>Máscaras de soldadura y guías de corte limpias sin residuos</span>
          </label>
        </div>
      </div>
    `,
    extractSummary: () => {
      const jig = document.getElementById('fieldImJigCode')?.value || 'JIG-IM-0772';
      const lot = document.getElementById('fieldImDailyLot')?.value.trim();
      const model = document.getElementById('fieldImDailyModel')?.value.trim();
      return `${jig} · Lote ${lot || '—'} · Modelo ${model || '—'}`;
    }
  },

  im_cambio: {
    key: 'im_cambio',
    title: 'CHECKLIST CAMBIO DE MODELO I.M & JIG',
    subtitle: 'Auditoría integral y verificación de pautas para el cambio de modelo en líneas de Inserción Manual (IM & JIG).',
    badgeText: '19 reg',
    iconBg: 'bg-indigo-50 border-indigo-100 text-indigo-600',
    iconSvg: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/></svg>`,
    renderFields: () => `
      <div class="space-y-3">
        <div class="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 sm:grid-cols-2">
          <label class="font-semibold text-slate-700">Lote
            <input type="text" id="fieldImChangeLot" placeholder="Número de lote" class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-normal">
          </label>
          <label class="font-semibold text-slate-700">Modelo auditado *
            <input type="text" id="fieldImChangeModel" placeholder="Ej.: 91DB05X3510 - 91E..." required class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono font-normal">
          </label>
        </div>

        <section class="rounded-xl border border-slate-300 bg-white p-3.5" aria-labelledby="imChangePointOneTitle">
          <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 id="imChangePointOneTitle" class="font-bold text-slate-800">01 · ¿Se encuentra la pauta del modelo entrante y se cumple?</h4>
              <p class="mt-1 text-[11px] text-slate-500">Auditá cada puesto por separado. Agregá o quitá puestos según corresponda.</p>
            </div>
            <div class="flex items-center gap-2">
              <span id="imChangeStationSummary" class="text-[11px] font-semibold text-slate-600"></span>
              <button type="button" onclick="addImChangeStation()" class="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 font-bold text-red-700 hover:bg-red-100">+ Agregar puesto</button>
            </div>
          </div>
          <div class="overflow-x-auto rounded-lg border border-slate-200">
            <table class="w-full min-w-[760px] text-left text-[11px]">
              <thead class="bg-slate-100 uppercase tracking-wide text-slate-500">
                <tr>
                  <th class="px-2.5 py-2">Puesto / estación</th>
                  <th class="px-2.5 py-2">Auditoría</th>
                  <th class="px-2.5 py-2">Evidencia foto</th>
                  <th class="px-2.5 py-2">Observaciones / desvíos</th>
                  <th class="px-2.5 py-2"><span class="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody id="imChangeStationsBody" class="divide-y divide-slate-200"></tbody>
            </table>
          </div>
          <label class="mt-3 block font-semibold text-slate-700">Observaciones generales de pautas en línea</label>
          <textarea id="fieldImChangeStationNotes" rows="2" placeholder="Observaciones opcionales..." class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 font-normal text-slate-800"></textarea>
        </section>

        <section id="imChangeChecklist" class="space-y-2" aria-label="Puntos de control de auditoría">
          <h4 class="pb-1 font-bold uppercase tracking-wide text-slate-700">Puntos de control de auditoría (13)</h4>
          ${[
            'Verificar poka-yoke de prensado de disipadores.',
            'Uso de pulsera y/o talonera ESD.',
            'Verificar que en la línea se encuentren gavetas para material no conforme.',
            'Verificar que no haya exceso de material a granel.',
            'Material correctamente identificados.',
            'Componentes críticos identificados en pauta y físicamente.',
            'Verificar que las placas al ingresar al horno no sufran saltos en los finger.',
            'Verificar que estén encendidos los coolers de enfriamiento a la salida del horno.',
            '¿La temperatura (390 +-10) de los soldadores corresponde a la indicada en pauta?',
            '¿Los carros, mesas y bancos de trabajo se encuentran a tierra?',
            'Verificar que no se encimen las placas en las bandas.',
            'Paradas de emergencia (línea y máquinas) operativas y señalizadas.'
          ].map((point, index) => `
            <div class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5">
              <div class="flex min-w-0 items-center gap-2.5">
                <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 font-mono font-bold text-emerald-700">${String(index + 2).padStart(2, '0')}</span>
                <span class="text-[11px] font-medium text-slate-700">${point}</span>
              </div>
              <select data-im-change-point="${index + 2}" aria-label="Resultado punto ${index + 2}" class="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-700">
                <option value="OK">OK</option>
                <option value="NG">NG</option>
                <option value="N/A">N/A</option>
              </select>
            </div>
          `).join('')}
        </section>

        <section id="imChangeDischarge" class="hidden space-y-3 rounded-xl border border-rose-300 bg-rose-50/70 p-3.5">
          <div class="flex items-center justify-between gap-2">
            <div>
              <h4 class="font-bold uppercase text-rose-800">Descargo único de no conformidades detectadas</h4>
              <p class="text-[10px] text-rose-700">Completá un descargo consolidado para todos los puntos NG.</p>
            </div>
            <span id="imChangeNgCount" class="rounded-full bg-rose-700 px-2.5 py-1 text-[10px] font-bold text-white"></span>
          </div>
          <div>
            <span class="font-semibold text-slate-700">Afecta a:</span>
            <div id="imChangeAffectedPoints" class="mt-1 flex flex-wrap gap-1.5"></div>
          </div>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label class="font-semibold text-slate-700">Problema detectado *
              <input id="fieldImChangeProblem" type="text" maxlength="500" placeholder="Describí el desvío o falla" class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 font-normal">
            </label>
            <label class="font-semibold text-slate-700">Estado / acción inmediata *
              <input id="fieldImChangeAction" type="text" maxlength="500" placeholder="Ej.: Bloqueado / En revisión / Corregido" class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 font-normal">
            </label>
            <label class="font-semibold text-slate-700">Modelo(s) asociado(s) *
              <input id="fieldImChangeAssociatedModels" type="text" maxlength="500" placeholder="Modelo(s) afectados" class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 font-normal">
            </label>
          </div>
          <label class="block font-semibold text-slate-700">Observación / nota adicional
            <textarea id="fieldImChangeDischargeNotes" rows="2" maxlength="1500" placeholder="Comentario complementario del desvío..." class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 font-normal"></textarea>
          </label>
          <label class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700">
            Adjuntar evidencia fotográfica
            <input id="fieldImChangeDischargeEvidence" type="file" accept="image/*" multiple class="max-w-[200px] text-[10px] font-normal">
          </label>
        </section>
      </div>
    `,
    extractSummary: () => {
      const model = document.getElementById('fieldImChangeModel')?.value.trim() || 'Modelo sin identificar';
      return `${model} · Cambio de modelo auditado`;
    }
  }
};

const ImChangeChecklistPoints = [
  'Pauta del modelo entrante disponible y cumplida',
  'Verificar poka-yoke de prensado de disipadores.',
  'Uso de pulsera y/o talonera ESD.',
  'Verificar que en la línea se encuentren gavetas para material no conforme.',
  'Verificar que no haya exceso de material a granel.',
  'Material correctamente identificados.',
  'Componentes críticos identificados en pauta y físicamente.',
  'Verificar que las placas al ingresar al horno no sufran saltos en los finger.',
  'Verificar que estén encendidos los coolers de enfriamiento a la salida del horno.',
  '¿La temperatura (390 +-10) de los soldadores corresponde a la indicada en pauta?',
  '¿Los carros, mesas y bancos de trabajo se encuentran a tierra?',
  'Verificar que no se encimen las placas en las bandas.',
  'Paradas de emergencia (línea y máquinas) operativas y señalizadas.'
];

function escapeImChangeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function getImChangeNgItems() {
  const stationItems = (window.imChangeStationsData || [])
    .filter(station => station.status === 'NG')
    .map(station => `Punto 01 · Puesto ${station.name || 'sin identificar'}: pauta NG${station.observation ? ` · ${station.observation}` : ''}`);
  const checklistItems = Array.from(document.querySelectorAll('#imChangeChecklist [data-im-change-point]'))
    .filter(select => select.value === 'NG')
    .map(select => {
      const pointNumber = Number(select.dataset.imChangePoint);
      return `Punto ${String(pointNumber).padStart(2, '0')} · ${ImChangeChecklistPoints[pointNumber - 1]}`;
    });
  return [...stationItems, ...checklistItems];
}

function renderImChangeStations() {
  const tbody = document.getElementById('imChangeStationsBody');
  if (!tbody) return;
  const stations = window.imChangeStationsData || [];
  tbody.innerHTML = stations.map((station, index) => `
    <tr>
      <td class="px-2.5 py-2">
        <input type="text" data-im-change-station="${index}" data-field="name" value="${escapeImChangeHtml(station.name)}" aria-label="Puesto o estación ${index + 1}" class="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5" placeholder="Ej.: 1A" required>
      </td>
      <td class="px-2.5 py-2">
        <select data-im-change-station="${index}" data-field="status" aria-label="Auditoría puesto ${escapeImChangeHtml(station.name || index + 1)}" class="rounded-md border border-slate-300 bg-white px-2 py-1.5 font-semibold">
          <option value="OK" ${station.status === 'OK' ? 'selected' : ''}>OK</option>
          <option value="NG" ${station.status === 'NG' ? 'selected' : ''}>NG</option>
        </select>
      </td>
      <td class="px-2.5 py-2">
        <label class="cursor-pointer rounded-md border border-slate-300 bg-white px-2 py-1.5 font-semibold text-slate-700">
          + Foto
          <input type="file" data-im-change-station="${index}" data-field="evidence" accept="image/*" multiple class="sr-only">
        </label>
        <span class="ml-1 text-[10px] text-slate-500">${station.evidenceNames.length ? `${station.evidenceNames.length} archivo(s)` : ''}</span>
      </td>
      <td class="px-2.5 py-2">
        <input type="text" data-im-change-station="${index}" data-field="observation" value="${escapeImChangeHtml(station.observation)}" aria-label="Observación puesto ${escapeImChangeHtml(station.name || index + 1)}" class="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5" placeholder="Observación opcional...">
      </td>
      <td class="px-2.5 py-2 text-right">
        <button type="button" onclick="removeImChangeStation(${index})" aria-label="Eliminar puesto ${index + 1}" class="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-700">Eliminar</button>
      </td>
    </tr>
  `).join('');
  const okCount = stations.filter(station => station.status === 'OK').length;
  const ngCount = stations.filter(station => station.status === 'NG').length;
  const summary = document.getElementById('imChangeStationSummary');
  if (summary) summary.textContent = `${stations.length} puesto(s) · ${okCount} OK · ${ngCount} NG`;
  updateImChangeDischarge();
}

function updateImChangeDischarge() {
  const panel = document.getElementById('imChangeDischarge');
  if (!panel) return;
  const ngItems = getImChangeNgItems();
  panel.classList.toggle('hidden', ngItems.length === 0);
  const count = document.getElementById('imChangeNgCount');
  if (count) count.textContent = `${ngItems.length} ÍTEM(S) NG`;
  const affected = document.getElementById('imChangeAffectedPoints');
  if (affected) {
    affected.innerHTML = ngItems.map(item =>
      `<span class="rounded-md border border-rose-200 bg-white px-2 py-1 text-[10px] text-rose-800">${escapeImChangeHtml(item)}</span>`
    ).join('');
  }
}

window.addImChangeStation = function() {
  window.imChangeStationsData.push({ name: '', status: 'OK', observation: '', evidenceNames: [], evidenceFiles: [] });
  renderImChangeStations();
};

window.removeImChangeStation = function(index) {
  window.imChangeStationsData.splice(index, 1);
  renderImChangeStations();
};

function openImChangeEvidenceDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('quality-audit-evidence', 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains('evidence')) {
        const store = database.createObjectStore('evidence', { keyPath: 'id' });
        store.createIndex('recordId', 'recordId', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('No se pudo abrir el almacenamiento de evidencias.'));
  });
}

function saveImChangeEvidence(recordId, files) {
  if (files.length === 0) return Promise.resolve();
  return openImChangeEvidenceDatabase().then(database => new Promise((resolve, reject) => {
    const transaction = database.transaction('evidence', 'readwrite');
    const store = transaction.objectStore('evidence');
    files.forEach((item, index) => {
      store.put({
        id: `${recordId}:${index}`,
        recordId,
        name: item.name,
        type: item.type,
        blob: item.file
      });
    });
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error || new Error('No se pudieron guardar las evidencias fotográficas.'));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error || new Error('Se canceló el guardado de las evidencias fotográficas.'));
    };
  }));
}

window.openImChangeEvidence = async function(recordId) {
  const preview = window.open('', '_blank');
  if (!preview) {
    showToast('El navegador bloqueó la ventana de evidencias. Permití ventanas emergentes e intentá de nuevo.');
    return;
  }
  try {
    const database = await openImChangeEvidenceDatabase();
    const files = await new Promise((resolve, reject) => {
      const transaction = database.transaction('evidence', 'readonly');
      const request = transaction.objectStore('evidence').index('recordId').getAll(recordId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('No se pudieron leer las evidencias.'));
      transaction.oncomplete = () => database.close();
    });
    if (files.length === 0) {
      preview.close();
      showToast('No se encontraron archivos de evidencia para esta auditoría.');
      return;
    }

    preview.document.title = 'Evidencias · Auditoría Cambio de Modelo';
    const heading = preview.document.createElement('h1');
    heading.textContent = 'Evidencias fotográficas';
    preview.document.body.appendChild(heading);
    files.forEach(file => {
      const section = preview.document.createElement('section');
      const title = preview.document.createElement('p');
      title.textContent = file.name;
      section.appendChild(title);
      const image = preview.document.createElement('img');
      image.alt = file.name;
      image.src = URL.createObjectURL(file.blob);
      image.style.maxWidth = '100%';
      image.style.height = 'auto';
      section.appendChild(image);
      preview.document.body.appendChild(section);
    });
  } catch (error) {
    preview.close();
    console.error('No se pudieron abrir las evidencias de la auditoría I.M & JIG.', error);
    showToast('No se pudieron abrir las evidencias fotográficas guardadas.');
  }
};

function getImChangeAuditPayload(record, sourceId) {
  const details = record.auditDetails || {};
  const nonconformities = [];
  (details.stations || []).forEach(station => {
    if (station.status === 'NG') {
      nonconformities.push({
        key: String(nonconformities.length),
        description: `Puesto ${station.name || 'sin identificar'}: pauta del modelo entrante no conforme`,
        station: station.name || '',
        observation: station.observation || ''
      });
    }
  });
  (details.points || []).forEach(point => {
    if (point.status === 'NG') {
      nonconformities.push({
        key: String(nonconformities.length),
        description: `Punto ${String(point.number).padStart(2, '0')}: ${point.label}`,
        station: '',
        observation: ''
      });
    }
  });
  if (nonconformities.length === 0 && !details.stations && !details.points) {
    (record.ngItems || []).forEach(description => {
      nonconformities.push({
        key: String(nonconformities.length),
        description: String(description),
        station: '',
        observation: ''
      });
    });
  }
  return {
    sourceId,
    lot: details.lot || '',
    model: details.model || '',
    line: record.line || 'INSERCIÓN MANUAL & JIG',
    auditor: record.auditor || '',
    nonconformities
  };
}

async function saveImChangeAuditToSharedStore(record, sourceId) {
  const payload = getImChangeAuditPayload(record, sourceId);
  if (!payload.lot.trim() || !payload.model.trim()) {
    throw new Error('La auditoría de Cambio de Modelo necesita lote y modelo para compartir sus desvíos.');
  }
  return requestAuthApi('/api/audits/im-cambio', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

function renderImDailyDeviations(records) {
  const list = document.getElementById('imDailyDeviationsList');
  const status = document.getElementById('imDailyDeviationsStatus');
  if (!list || !status) return;
  const items = records.flatMap(record =>
    record.nonconformities.map(item => ({
      ...item,
      sourceId: record.sourceId,
      lot: record.lot,
      model: record.model,
      auditor: record.auditor,
      createdAt: record.createdAt
    }))
  );
  window.imDailyFollowups = items.map(item => ({
    sourceId: item.sourceId,
    key: item.key,
    status: item.status || 'Pendiente',
    notes: item.followupNotes || '',
    description: item.description
  }));
  list.classList.toggle('hidden', items.length === 0);
  if (items.length === 0) {
    status.className = 'rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-800';
    status.textContent = records.length
      ? 'Conforme: el cambio de modelo encontrado no tiene no conformidades pendientes.'
      : 'No se encontraron auditorías de Cambio de Modelo para este lote y modelo.';
    list.innerHTML = '';
    updateImDailyConsolidatedText();
    return;
  }

  status.className = 'rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900';
  status.textContent = `Se encontraron ${items.length} no conformidad(es) en ${records.length} auditoría(s) de cambio de modelo. Revisá y actualizá el seguimiento.`;
  list.innerHTML = items.map((item, index) => `
    <article class="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
      <div class="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
        <div class="min-w-0">
          <p class="font-bold text-slate-800">${escapeImChangeHtml(item.description)}</p>
          <p class="mt-1 text-[10px] text-slate-500">Origen: Cambio de Modelo · Lote ${escapeImChangeHtml(item.lot)} · Modelo ${escapeImChangeHtml(item.model)} · Auditor ${escapeImChangeHtml(item.auditor || '—')}</p>
          ${item.observation ? `<p class="mt-1 text-[11px] text-rose-700">Observación: ${escapeImChangeHtml(item.observation)}</p>` : ''}
        </div>
        <div class="grid shrink-0 grid-cols-1 gap-2 sm:w-56">
          <select data-im-daily-followup="${index}" data-field="status" aria-label="Estado de seguimiento" class="rounded-md border border-slate-300 bg-white px-2 py-1.5 font-semibold text-slate-700">
            ${['Pendiente', 'En seguimiento', 'Resuelto'].map(value => `<option value="${value}" ${item.status === value ? 'selected' : ''}>${value}</option>`).join('')}
          </select>
          <input type="text" data-im-daily-followup="${index}" data-field="notes" value="${escapeImChangeHtml(item.followupNotes || '')}" maxlength="1000" placeholder="Nota de seguimiento..." class="rounded-md border border-slate-300 bg-white px-2 py-1.5">
        </div>
      </div>
    </article>
  `).join('');
  updateImDailyConsolidatedText();
}

function updateImDailyConsolidatedText() {
  const output = document.getElementById('imDailyConsolidatedText');
  if (!output) return;
  const items = window.imDailyFollowups || [];
  output.value = items.length
    ? items.map(item => `${item.status}: ${item.description}${item.notes ? ` — ${item.notes}` : ''}`).join(' | ')
    : 'OK (Sin desvíos previos)';
}

window.searchImDailyModelDeviations = async function() {
  const lot = document.getElementById('fieldImDailyLot')?.value.trim() || '';
  const model = document.getElementById('fieldImDailyModel')?.value.trim() || '';
  const status = document.getElementById('imDailyDeviationsStatus');
  if (!lot || !model) {
    showToast('Ingresá el lote y el modelo para buscar las no conformidades.');
    return;
  }
  if (status) {
    status.className = 'rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] text-blue-800';
    status.textContent = 'Buscando auditorías de Cambio de Modelo...';
  }
  window.imDailySearchCompleted = false;
  try {
    const legacyRecords = AppState.recentFormRecords.filter(record =>
      record.formKey === 'im_cambio' &&
      String(record.auditDetails?.lot || '').trim().toLocaleLowerCase() === lot.toLocaleLowerCase() &&
      String(record.auditDetails?.model || '').trim().toLocaleLowerCase() === model.toLocaleLowerCase()
    );
    for (const record of legacyRecords) {
      await saveImChangeAuditToSharedStore(record, `legacy-${record.id}`);
    }
    const query = new URLSearchParams({ lot, model });
    const result = await requestAuthApi(`/api/audits/im-cambio?${query}`);
    renderImDailyDeviations(result.records || []);
    window.imDailySearchCompleted = true;
  } catch (error) {
    console.error('No se pudieron cargar las no conformidades del cambio de modelo.', error);
    if (status) {
      status.className = 'rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-800';
      status.textContent = `No se pudieron cargar los desvíos: ${error.message}`;
    }
  }
};

window.invalidateImDailySearch = function() {
  window.imDailySearchCompleted = false;
  window.imDailyFollowups = [];
  const list = document.getElementById('imDailyDeviationsList');
  const status = document.getElementById('imDailyDeviationsStatus');
  const consolidated = document.getElementById('imDailyConsolidatedText');
  if (list) {
    list.innerHTML = '';
    list.classList.add('hidden');
  }
  if (status) {
    status.className = 'rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600';
    status.textContent = 'Cambió el lote o modelo. Volvé a buscar los desvíos.';
  }
  if (consolidated) consolidated.value = '';
};

async function saveImDailyFollowups() {
  const grouped = new Map();
  (window.imDailyFollowups || []).forEach(item => {
    if (!grouped.has(item.sourceId)) grouped.set(item.sourceId, []);
    grouped.get(item.sourceId).push({ key: item.key, status: item.status, notes: item.notes });
  });
  if (grouped.size === 0) return;
  await requestAuthApi('/api/audits/im-cambio/followups', {
    method: 'POST',
    body: JSON.stringify({
      updates: Array.from(grouped, ([sourceId, followups]) => ({ sourceId, followups }))
    })
  });
}

function initFormulariosModule() {
  renderFormRecordsTable(AppState.recentFormRecords);

  const formElement = document.getElementById('formularioRegistroForm');
  if (formElement) {
    formElement.addEventListener('submit', (e) => {
      e.preventDefault();
      handleFormularioSubmit();
    });
  }

  const fullscreenForm = document.getElementById('imChangeFullscreenForm');
  if (fullscreenForm) {
    fullscreenForm.addEventListener('submit', event => {
      event.preventDefault();
      document.getElementById('modalFormKey').value = 'im_cambio';
      handleFormularioSubmit();
    });
  }
  bindImChangeFieldEvents(document.getElementById('modalFormDynamicFields'));
  bindImChangeFieldEvents(document.getElementById('fsImChangeDynamicFields'));
  const dailyFields = document.getElementById('modalFormDynamicFields');
  if (dailyFields) {
    dailyFields.addEventListener('input', event => {
      const input = event.target.closest('[data-im-daily-followup]');
      if (!input) return;
      const item = window.imDailyFollowups?.[Number(input.dataset.imDailyFollowup)];
      if (!item) return;
      item.notes = input.value;
      updateImDailyConsolidatedText();
    });
    dailyFields.addEventListener('change', event => {
      const select = event.target.closest('[data-im-daily-followup]');
      if (!select || select.dataset.field !== 'status') return;
      const item = window.imDailyFollowups?.[Number(select.dataset.imDailyFollowup)];
      if (!item) return;
      item.status = select.value;
      updateImDailyConsolidatedText();
    });
  }
}

function bindImChangeFieldEvents(container) {
  if (!container) return;
  const updateStationField = event => {
    const input = event.target.closest('[data-im-change-station]');
    if (!input) return;
    const station = window.imChangeStationsData?.[Number(input.dataset.imChangeStation)];
    if (!station) return;

    if (input.dataset.field === 'evidence') {
      station.evidenceFiles = Array.from(input.files || []);
      station.evidenceNames = station.evidenceFiles.map(file => file.name);
      const label = input.closest('label');
      const count = label?.nextElementSibling;
      if (count) count.textContent = station.evidenceNames.length ? `${station.evidenceNames.length} archivo(s)` : '';
    } else {
      station[input.dataset.field] = input.value;
      if (input.dataset.field === 'status') updateImChangeDischarge();
    }
  };
  container.addEventListener('input', updateStationField);
  container.addEventListener('change', updateStationField);
  container.addEventListener('change', event => {
    if (event.target.matches('[data-im-change-point]')) updateImChangeDischarge();
    if (event.target.id === 'fieldImChangeDischargeEvidence') {
      window.imChangeDischargeEvidenceFiles = Array.from(event.target.files || []);
    }
  });
}

// Gestor dinámico de Puestos para Control de Pulseras ESD (Imagen 2)
window.esdPuestosData = [];

window.renderEsdPuestosTable = function() {
  const bodies = [
    document.getElementById('esdPuestosTableBody'),
    document.getElementById('fsEsdPuestosTableBody')
  ].filter(Boolean);
  if (bodies.length === 0) return;

  if (window.esdPuestosData.length === 0) {
    const emptyRow = `
      <tr>
        <td colspan="7" class="text-center py-6 text-slate-400">
          No hay puestos agregados. Haga clic en "+ AGREGAR PUESTO" para comenzar.
        </td>
      </tr>
    `;
    bodies.forEach(b => b.innerHTML = emptyRow);
    return;
  }

  const rowsHtml = window.esdPuestosData.map((p, idx) => {
    const isOk = p.testigo === 'OK' && p.pulsera === 'OK';
    const statusBadge = isOk
      ? `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">OK</span>`
      : `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">NOK</span>`;

    const deleteBtn = window.esdPuestosData.length > 1
      ? `<button type="button" onclick="window.removeEsdPuestoRow(${idx})" class="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Eliminar fila">
           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
         </button>`
      : `<span class="text-slate-300">-</span>`;

    return `
      <tr class="hover:bg-slate-50/60 transition-colors">
        <td class="py-2.5 px-3">
          <input type="text" value="${p.puesto}" onchange="window.updateEsdRow(${idx}, 'puesto', this.value)"
            placeholder="EJ: 1A, 2A" class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-800 font-bold focus:ring-1 focus:ring-red-400">
        </td>
        <td class="py-2.5 px-3">
          <select onchange="window.updateEsdRow(${idx}, 'testigo', this.value)"
            class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-800 text-xs focus:ring-1 focus:ring-red-400">
            <option value="OK" ${p.testigo === 'OK' ? 'selected' : ''}>OK (Todo está bien)</option>
            <option value="NOK" ${p.testigo === 'NOK' ? 'selected' : ''}>NOK (Falla / Fuera de rango)</option>
          </select>
        </td>
        <td class="py-2.5 px-3">
          <select onchange="window.updateEsdRow(${idx}, 'pulsera', this.value)"
            class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-800 text-xs focus:ring-1 focus:ring-red-400 font-medium">
            <option value="OK" ${p.pulsera === 'OK' ? 'selected' : ''}>OK</option>
            <option value="NOK" ${p.pulsera === 'NOK' ? 'selected' : ''}>NOK</option>
          </select>
        </td>
        <td class="py-2.5 px-3">
          <label class="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors">
            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            <span>Adjuntar (${p.fotosCount || 0}/10)</span>
            <input type="file" multiple accept="image/*" class="hidden" onchange="window.handleEsdPhotoUpload(${idx}, this)">
          </label>
        </td>
        <td class="py-2.5 px-3">
          <input type="text" value="${p.obs || ''}" onchange="window.updateEsdRow(${idx}, 'obs', this.value)"
            placeholder="Observación del puesto..." class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-800 text-xs focus:ring-1 focus:ring-red-400">
        </td>
        <td class="py-2.5 px-3 text-center">
          ${statusBadge}
        </td>
        <td class="py-2.5 px-3 text-center">
          ${deleteBtn}
        </td>
      </tr>
    `;
  }).join('');

  bodies.forEach(b => b.innerHTML = rowsHtml);
};

window.addEsdPuestoRow = function(name) {
  const nextNumber = window.esdPuestosData.length + 1;
  const puestoName = name || `${nextNumber}A`;
  window.esdPuestosData.push({
    puesto: puestoName,
    testigo: 'OK',
    pulsera: 'OK',
    fotosCount: 0,
    obs: ''
  });
  window.renderEsdPuestosTable();
};

window.removeEsdPuestoRow = function(idx) {
  if (window.esdPuestosData.length > 1) {
    window.esdPuestosData.splice(idx, 1);
    window.renderEsdPuestosTable();
  }
};

window.updateEsdRow = function(idx, field, value) {
  if (window.esdPuestosData[idx]) {
    window.esdPuestosData[idx][field] = value;
    window.renderEsdPuestosTable();
  }
};

window.handleEsdPhotoUpload = function(idx, input) {
  if (input.files && window.esdPuestosData[idx]) {
    const count = Math.min(input.files.length, 10);
    window.esdPuestosData[idx].fotosCount = count;
    window.renderEsdPuestosTable();
  }
};

// Gestor dinámico de Puestos para Control de Torque (Imagen usuario)
window.torquePuestosData = [];

window.renderTorquePuestosTable = function() {
  const bodies = [
    document.getElementById('torquePuestosTableBody'),
    document.getElementById('fsTorquePuestosTableBody')
  ].filter(Boolean);
  if (bodies.length === 0) return;

  if (window.torquePuestosData.length === 0) {
    const emptyRow = `
      <tr>
        <td colspan="11" class="text-center py-6 text-slate-400">
          No hay puestos de torque agregados. Haga clic en "+ AGREGAR PUESTO" para comenzar.
        </td>
      </tr>
    `;
    bodies.forEach(b => b.innerHTML = emptyRow);
    return;
  }

  const rowsHtml = window.torquePuestosData.map((p, idx) => {
    const min = parseFloat(p.rangoMin);
    const max = parseFloat(p.rangoMax);
    const val = parseFloat(p.torqueMedido);
    const isValOk = !isNaN(val) && !isNaN(min) && !isNaN(max) && val >= min && val <= max;
    const isPrisioneroOk = p.prisionero === 'OK';
    const isOk = isValOk && isPrisioneroOk;

    const statusBadge = isOk
      ? `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">OK</span>`
      : `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">FALLA</span>`;

    const accionCol = isOk
      ? `<span class="text-slate-400 text-[11px] italic">No requerida</span>`
      : `
        <div class="space-y-1">
          <button type="button" onclick="window.promptTorqueAccion(${idx})"
            class="w-full px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs transition-colors">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <span>${p.accionCorreccion ? 'Editar acción' : '⚠ Ingrese acción'}</span>
          </button>
          <span class="text-[9px] text-red-600 font-bold block text-center">▲ Requerido por falla detectada</span>
          ${p.accionCorreccion ? `<div class="text-[10px] text-slate-700 bg-red-50 p-1 rounded border border-red-200 truncate" title="${p.accionCorreccion}">${p.accionCorreccion}</div>` : ''}
        </div>
      `;

    const deleteBtn = window.torquePuestosData.length > 1
      ? `<button type="button" onclick="window.removeTorquePuestoRow(${idx})" class="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Eliminar fila">
           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
         </button>`
      : `<span class="text-slate-300">-</span>`;

    return `
      <tr class="hover:bg-slate-50/60 transition-colors">
        <td class="py-2.5 px-3">
          <input type="text" value="${p.puesto}" onchange="window.updateTorqueRow(${idx}, 'puesto', this.value)"
            placeholder="EJ: 1A, 2A" class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-800 font-bold focus:ring-1 focus:ring-red-400">
        </td>
        <td class="py-2.5 px-3">
          <input type="text" value="${p.atornilladora}" onchange="window.updateTorqueRow(${idx}, 'atornilladora', this.value)"
            placeholder="NRO ATOR." class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-800 text-xs font-mono focus:ring-1 focus:ring-red-400">
        </td>
        <td class="py-2.5 px-3">
          <input type="number" step="0.1" value="${p.rangoMin}" onchange="window.updateTorqueRow(${idx}, 'rangoMin', this.value)"
            placeholder="Mín" class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-800 text-xs font-mono focus:ring-1 focus:ring-red-400">
        </td>
        <td class="py-2.5 px-3">
          <input type="number" step="0.1" value="${p.rangoMax}" onchange="window.updateTorqueRow(${idx}, 'rangoMax', this.value)"
            placeholder="Máx" class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-800 text-xs font-mono focus:ring-1 focus:ring-red-400">
        </td>
        <td class="py-2.5 px-3">
          <input type="number" step="0.1" value="${p.torqueMedido}" onchange="window.updateTorqueRow(${idx}, 'torqueMedido', this.value)"
            placeholder="Medido" class="w-full px-2.5 py-1.5 bg-white border ${isValOk ? 'border-emerald-300 text-emerald-800 font-black bg-emerald-50/30' : 'border-red-300 text-red-600 font-black bg-red-50/30'} rounded-md text-xs font-mono focus:ring-1 focus:ring-red-400">
        </td>
        <td class="py-2.5 px-3">
          <select onchange="window.updateTorqueRow(${idx}, 'prisionero', this.value)"
            class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-800 text-xs focus:ring-1 focus:ring-red-400 font-medium">
            <option value="OK" ${p.prisionero === 'OK' ? 'selected' : ''}>OK (Tiene)</option>
            <option value="NOK" ${p.prisionero === 'NOK' ? 'selected' : ''}>NOK (No tiene / Suelto)</option>
          </select>
        </td>
        <td class="py-2.5 px-3">
          <span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-medium">
            <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            <span>Anulado (Lunes)</span>
          </span>
        </td>
        <td class="py-2.5 px-3 text-center">
          ${statusBadge}
        </td>
        <td class="py-2.5 px-3">
          <input type="text" value="${p.obs || ''}" onchange="window.updateTorqueRow(${idx}, 'obs', this.value)"
            placeholder="Observación del puesto..." class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-800 text-xs focus:ring-1 focus:ring-red-400">
        </td>
        <td class="py-2.5 px-3">
          ${accionCol}
        </td>
        <td class="py-2.5 px-2 text-center">
          ${deleteBtn}
        </td>
      </tr>
    `;
  }).join('');

  bodies.forEach(b => b.innerHTML = rowsHtml);
};

window.addTorquePuestoRow = function(name) {
  const nextNumber = window.torquePuestosData.length + 1;
  const puestoName = name || `${nextNumber}A`;
  window.torquePuestosData.push({
    puesto: puestoName,
    atornilladora: `AT-${String(nextNumber).padStart(2, '0')}`,
    rangoMin: 4.0,
    rangoMax: 5.0,
    torqueMedido: 4.5,
    prisionero: 'OK',
    tensionPunta: 'Anulado (Lunes)',
    obs: '',
    accionCorreccion: ''
  });
  window.renderTorquePuestosTable();
};

window.removeTorquePuestoRow = function(idx) {
  if (window.torquePuestosData.length > 1) {
    window.torquePuestosData.splice(idx, 1);
    window.renderTorquePuestosTable();
  }
};

window.updateTorqueRow = function(idx, field, value) {
  if (window.torquePuestosData[idx]) {
    window.torquePuestosData[idx][field] = value;
    window.renderTorquePuestosTable();
  }
};

window.promptTorqueAccion = function(idx) {
  if (!window.torquePuestosData[idx]) return;
  const current = window.torquePuestosData[idx].accionCorreccion || '';
  const action = prompt('Acción de Corrección para falla detectada:\n(Ej: Calibración inmediata en banco, cambio de resorte o atornilladora de backup)', current);
  if (action !== null) {
    window.torquePuestosData[idx].accionCorreccion = action.trim();
    window.renderTorquePuestosTable();
  }
};

// ==========================================
// VISTAS COMPLETAS DEDICADAS (PANTALLA COMPLETA)
// ==========================================
window.openAuditFullscreen = function(auditType) {
  if (auditType === 'torque') {
    if (!window.torquePuestosData || window.torquePuestosData.length === 0) {
      window.torquePuestosData = [
        {
          puesto: '1A',
          atornilladora: 'AT-01',
          rangoMin: 4.0,
          rangoMax: 5.0,
          torqueMedido: 4.5,
          prisionero: 'OK',
          tensionPunta: 'Anulado (Lunes)',
          obs: '',
          accionCorreccion: ''
        },
        {
          puesto: '2A',
          atornilladora: 'AT-02',
          rangoMin: 4.0,
          rangoMax: 5.0,
          torqueMedido: 4.7,
          prisionero: 'OK',
          tensionPunta: 'Anulado (Lunes)',
          obs: '',
          accionCorreccion: ''
        }
      ];
    }
    const auditorInput = document.getElementById('fsTorqueAuditor');
    if (auditorInput && AppState.currentUser) {
      auditorInput.value = AppState.currentUser.fullName;
    }
    window.renderTorquePuestosTable();
    navigateToView('audit-torque');
  } else if (auditType === 'esd') {
    if (!window.esdPuestosData || window.esdPuestosData.length === 0) {
      window.esdPuestosData = [
        { puesto: '1A', testigo: 'OK', pulsera: 'OK', fotosCount: 0, obs: '' },
        { puesto: '2A', testigo: 'OK', pulsera: 'OK', fotosCount: 0, obs: '' }
      ];
    }
    const auditorInput = document.getElementById('fsEsdAuditor');
    if (auditorInput && AppState.currentUser) {
      auditorInput.value = AppState.currentUser.fullName;
    }
    window.renderEsdPuestosTable();
    navigateToView('audit-esd');
  }
};

window.handleTorqueFullscreenSubmit = function(e) {
  if (e) e.preventDefault();
  const line = document.getElementById('fsTorqueLine')?.value || 'CELDA 1';
  const auditor = document.getElementById('fsTorqueAuditor')?.value || (AppState.currentUser ? AppState.currentUser.fullName : 'Rober Quiquinlla');
  const model = document.getElementById('fsTorqueModel')?.value || '91DB50X3510';
  const ngItems = collectTorqueNgItems();
  const isAllOk = ngItems.length === 0;

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timeStr = `Hoy, ${hours}:${minutes}`;

  AppState.formCounts['torque'] = (AppState.formCounts['torque'] || 0) + 1;
  const newCount = AppState.formCounts['torque'];

  document.querySelectorAll('.count-badge-torque').forEach(el => {
    el.textContent = `${newCount} reg`;
  });

  const countPuestos = window.torquePuestosData ? window.torquePuestosData.length : 1;
  const newRecord = {
    id: Date.now(),
    formKey: 'torque',
    formName: 'CONTROL DE TORQUE',
    line: line,
    auditor: auditor,
    time: timeStr,
    dateKey: getLocalDateKey(now),
    result: `Modelo ${model} · ${countPuestos} puestos (${isAllOk ? 'Torque Conforme' : 'Con Fallas de Torque'})`,
    ngItems: ngItems,
    status: isAllOk ? 'Aprobado' : 'Con Desvíos',
    statusClass: isAllOk 
      ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' 
      : 'text-rose-700 bg-rose-50 border border-rose-200'
  };

  AppState.recentFormRecords.unshift(newRecord);
  persistDailyFormRecords();
  renderFormRecordsTable(AppState.recentFormRecords);

  showToast(`✓ Registro de Control de Torque guardado con éxito (${isAllOk ? '100% Conforme' : 'Con Desvíos Registrados'})`);
  navigateToView('auditorias');
};

window.handleEsdFullscreenSubmit = function(e) {
  if (e) e.preventDefault();
  const line = document.getElementById('fsEsdLine')?.value || 'CELDA 1';
  const auditor = document.getElementById('fsEsdAuditor')?.value || (AppState.currentUser ? AppState.currentUser.fullName : 'Rober Quiquinlla');
  const model = document.getElementById('fsEsdModel')?.value || '91DB50X3510';
  const ngItems = collectEsdNgItems();
  const isAllOk = ngItems.length === 0;

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timeStr = `Hoy, ${hours}:${minutes}`;

  AppState.formCounts['esd'] = (AppState.formCounts['esd'] || 0) + 1;
  const newCount = AppState.formCounts['esd'];

  document.querySelectorAll('.count-badge-esd').forEach(el => {
    el.textContent = `${newCount} reg`;
  });

  const countPuestos = window.esdPuestosData ? window.esdPuestosData.length : 1;
  const newRecord = {
    id: Date.now(),
    formKey: 'esd',
    formName: 'CONTROL DE PULSERAS ESD',
    line: line,
    auditor: auditor,
    time: timeStr,
    dateKey: getLocalDateKey(now),
    result: `Modelo ${model} · ${countPuestos} puestos (${isAllOk ? 'Continuidad OK' : 'Con Desvíos'})`,
    ngItems: ngItems,
    status: isAllOk ? 'Aprobado' : 'Con Desvíos',
    statusClass: isAllOk 
      ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' 
      : 'text-rose-700 bg-rose-50 border border-rose-200'
  };

  AppState.recentFormRecords.unshift(newRecord);
  persistDailyFormRecords();
  renderFormRecordsTable(AppState.recentFormRecords);

  showToast(`✓ Registro de Pulseras ESD guardado con éxito (${isAllOk ? 'Conforme' : 'Con Desvíos'})`);
  navigateToView('auditorias');
};

window.openFormularioModal = function(formKey) {
  const formDef = FormDefinitions[formKey];
  if (!formDef) return;

  if (formKey === 'im_cambio') {
    const dynamicFields = document.getElementById('fsImChangeDynamicFields');
    if (!dynamicFields) return;
    dynamicFields.innerHTML = formDef.renderFields();
    document.getElementById('modalFormKey').value = formKey;
    const auditorInput = document.getElementById('fsImChangeAuditor');
    if (auditorInput) auditorInput.value = AppState.currentUser?.fullName || 'Rober Quiquinlla';
    const supervisorSelect = document.getElementById('fieldImChangeSupervisor');
    if (supervisorSelect) supervisorSelect.value = '';
    window.imChangeStationsData = [
      { name: '1A', status: 'OK', observation: '', evidenceNames: [], evidenceFiles: [] },
      { name: '1B', status: 'OK', observation: '', evidenceNames: [], evidenceFiles: [] },
      { name: '2A', status: 'OK', observation: '', evidenceNames: [], evidenceFiles: [] }
    ];
    window.imChangeDischargeEvidenceFiles = [];
    renderImChangeStations();
    navigateToView('audit-im-cambio');
    return;
  }

  const modal = document.getElementById('modalFormulario');
  const modalCard = document.getElementById('modalFormularioCard');
  const standardHeader = document.getElementById('modalFormStandardHeader');
  const standardNotes = document.getElementById('modalFormStandardNotes');
  if (!modal) return;

  document.getElementById('modalFormKey').value = formKey;
  document.getElementById('modalFormTitle').textContent = formDef.title;
  document.getElementById('modalFormSubtitle').textContent = formDef.subtitle;
  document.getElementById('modalFormBadge').textContent = `${AppState.formCounts[formKey] || 0} reg`;

  const iconContainer = document.getElementById('modalFormIconContainer');
  if (iconContainer) {
    iconContainer.className = `w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${formDef.iconBg}`;
    iconContainer.innerHTML = formDef.iconSvg;
  }

  // Prellenar auditor estándar
  const auditorInput = document.getElementById('modalFormAuditorInput');
  const lineInput = document.getElementById('modalFormLineSelect');
  if (lineInput) {
    lineInput.required = formKey === 'im_cambio';
    if (formKey === 'im_cambio') lineInput.value = 'INSERCIÓN MANUAL & JIG';
  }
  if (auditorInput) {
    auditorInput.value = AppState.currentUser ? AppState.currentUser.fullName : 'Rober Quiquinlla';
    auditorInput.required = formKey === 'im_cambio';
  }

  // Ajustar ancho del modal y visibilidad de cabeceras estándar
  if (formKey === 'esd' || formKey === 'torque') {
    if (modalCard) {
      modalCard.classList.remove('max-w-lg');
      modalCard.classList.add('max-w-6xl');
    }
    if (formKey === 'esd' || formKey === 'torque') {
      if (standardHeader) standardHeader.classList.add('hidden');
      if (standardNotes) standardNotes.classList.add('hidden');
    } else {
      if (standardHeader) standardHeader.classList.remove('hidden');
      if (standardNotes) standardNotes.classList.remove('hidden');
    }
  } else {
    if (modalCard) {
      modalCard.classList.remove('max-w-6xl', 'max-w-5xl');
      modalCard.classList.add('max-w-lg');
    }
    if (standardHeader) standardHeader.classList.remove('hidden');
    if (standardNotes) standardNotes.classList.remove('hidden');
  }

  // Inyectar campos dinámicos
  const dynamicFields = document.getElementById('modalFormDynamicFields');
  if (dynamicFields) {
    dynamicFields.innerHTML = formDef.renderFields();
    const checklistInputs = dynamicFields.querySelectorAll('input[type="checkbox"]');
    if (checklistInputs.length > 0) {
      checklistInputs.forEach(input => { input.required = false; });
      dynamicFields.insertAdjacentHTML('afterbegin', `
        <p class="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] text-blue-800">
          Dejá marcados los puntos conformes y desmarcá los que resulten NG. Los puntos desmarcados se detallarán en Reportes.
        </p>
      `);
    }
  }

  if (formKey === 'im_diario') {
    window.imDailyFollowups = [];
    window.imDailySearchCompleted = false;
    const status = document.getElementById('imDailyDeviationsStatus');
    const list = document.getElementById('imDailyDeviationsList');
    const consolidated = document.getElementById('imDailyConsolidatedText');
    if (status) {
      status.className = 'rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600';
      status.textContent = 'Ingresá el lote y el modelo, y seleccioná «Buscar desvíos».';
    }
    if (list) {
      list.innerHTML = '';
      list.classList.add('hidden');
    }
    if (consolidated) consolidated.value = '';
  }

  // Inicializar filas iniciales según formulario
  if (formKey === 'esd') {
    window.esdPuestosData = [
      { puesto: '1A', testigo: 'OK', pulsera: 'OK', fotosCount: 0, obs: '' },
      { puesto: '2A', testigo: 'OK', pulsera: 'OK', fotosCount: 0, obs: '' }
    ];
    window.renderEsdPuestosTable();
  } else if (formKey === 'torque') {
    window.torquePuestosData = [
      {
        puesto: '1A',
        atornilladora: 'AT-01',
        rangoMin: 4.0,
        rangoMax: 5.0,
        torqueMedido: 4.5,
        prisionero: 'OK',
        tensionPunta: 'Anulado (Lunes)',
        obs: '',
        accionCorreccion: ''
      },
      {
        puesto: '2A',
        atornilladora: 'AT-02',
        rangoMin: 4.0,
        rangoMax: 5.0,
        torqueMedido: 4.7,
        prisionero: 'OK',
        tensionPunta: 'Anulado (Lunes)',
        obs: '',
        accionCorreccion: ''
      }
    ];
    window.renderTorquePuestosTable();
  }

  modal.classList.remove('hidden');
};

window.closeFormularioModal = function() {
  const modal = document.getElementById('modalFormulario');
  if (modal) modal.classList.add('hidden');
};

async function handleFormularioSubmit() {
  const formKey = document.getElementById('modalFormKey').value;
  const formDef = FormDefinitions[formKey];
  if (!formDef) return;

  let line = '';
  let auditor = '';
  let ngItems = [];

  if (formKey === 'esd') {
    line = document.getElementById('fieldEsdLine')?.value || 'CELDA 1';
    auditor = document.getElementById('fieldEsdAuditor')?.value || 'Rober Quiquinlla';
    ngItems = collectEsdNgItems();
  } else if (formKey === 'torque') {
    line = document.getElementById('fieldTorqueLine')?.value || 'CELDA 1';
    auditor = document.getElementById('fieldTorqueAuditor')?.value || 'Rober Quiquinlla';
    ngItems = collectTorqueNgItems();
  } else if (formKey === 'im_cambio') {
    line = document.getElementById('fsImChangeLine')?.value || 'INSERCIÓN MANUAL & JIG';
    auditor = document.getElementById('fsImChangeAuditor')?.value || (AppState.currentUser ? AppState.currentUser.fullName : 'Rober Quiquinlla');
    const stations = window.imChangeStationsData || [];
    if (stations.length === 0) {
      showToast('Agregá al menos un puesto para auditar la pauta del modelo.');
      return;
    }
    const emptyStation = stations.find(station => !station.name.trim());
    if (emptyStation) {
      showToast('Completá el nombre de cada puesto o eliminá la fila vacía.');
      document.querySelector('#imChangeStationsBody input[data-field="name"]:invalid')?.focus();
      return;
    }
    ngItems = getImChangeNgItems();
    if (ngItems.length > 0) {
      const requiredDischargeFields = [
        ['fieldImChangeProblem', 'Describí el problema detectado.'],
        ['fieldImChangeAction', 'Indicá el estado o la acción inmediata.'],
        ['fieldImChangeAssociatedModels', 'Indicá los modelos asociados.']
      ];
      const missingField = requiredDischargeFields.find(([id]) =>
        !document.getElementById(id)?.value.trim()
      );
      if (missingField) {
        showToast(missingField[1]);
        document.getElementById(missingField[0])?.focus();
        return;
      }
    }
  } else {
    line = formKey === 'im_diario'
      ? (document.getElementById('fieldImLine')?.value || 'INSERCIÓN MANUAL & JIG')
      : (document.getElementById('modalFormLineSelect')?.value || 'CELDA 1');
    auditor = document.getElementById('modalFormAuditorInput')?.value || (AppState.currentUser ? AppState.currentUser.fullName : 'Rober Quiquinlla');
    ngItems = Array.from(document.querySelectorAll('#modalFormDynamicFields input[type="checkbox"]:not(:checked)'))
      .map(input => input.closest('label')?.querySelector('span')?.textContent?.trim())
      .filter(Boolean);
    if (formKey === 'im_diario') {
      if (!window.imDailySearchCompleted) {
        showToast('Buscá los desvíos por lote y modelo antes de guardar el inicio diario.');
        return;
      }
      ngItems.push(...(window.imDailyFollowups || [])
        .filter(item => item.status !== 'Resuelto')
        .map(item => `Seguimiento Cambio de Modelo · ${item.status}: ${item.description}${item.notes ? ` · ${item.notes}` : ''}`));
      try {
        await saveImDailyFollowups();
      } catch (error) {
        console.error('No se pudo guardar el seguimiento de pautas de Cambio de Modelo.', error);
        showToast(`No se guardó el inicio diario porque falló el seguimiento compartido: ${error.message}`);
        return;
      }
    }
  }
  const isAllOk = ngItems.length === 0;

  const summary = ngItems.length > 0 && formKey !== 'esd' && formKey !== 'torque'
    ? `${formDef.title} · ${ngItems.length} ítems NG`
    : formDef.extractSummary();

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timeStr = `Hoy, ${hours}:${minutes}`;

  // Guardar nuevo registro al inicio
  const newRecord = {
    id: Date.now(),
    formKey: formKey,
    formName: formDef.title,
    line: line,
    auditor: auditor,
    time: timeStr,
    dateKey: getLocalDateKey(now),
    result: summary,
    ngItems: ngItems,
    ...(formKey === 'im_cambio' ? {
      shift: document.getElementById('fsImChangeShift')?.value || '',
      auditDetails: {
        supervisor: document.getElementById('fieldImChangeSupervisor')?.value.trim() || '',
        lot: document.getElementById('fieldImChangeLot')?.value.trim() || '',
        model: document.getElementById('fieldImChangeModel')?.value.trim() || '',
        stations: window.imChangeStationsData.map(station => ({
          name: station.name.trim(),
          status: station.status,
          observation: station.observation.trim(),
          evidenceNames: station.evidenceNames
        })),
        points: Array.from(document.querySelectorAll('#imChangeChecklist [data-im-change-point]'))
          .map(select => ({
            number: Number(select.dataset.imChangePoint),
            status: select.value,
            label: ImChangeChecklistPoints[Number(select.dataset.imChangePoint) - 1]
          })),
        stationNotes: document.getElementById('fieldImChangeStationNotes')?.value.trim() || '',
        notes: document.getElementById('fsImChangeNotes')?.value.trim() || '',
        discharge: ngItems.length > 0 ? {
          problem: document.getElementById('fieldImChangeProblem')?.value.trim() || '',
          action: document.getElementById('fieldImChangeAction')?.value.trim() || '',
          associatedModels: document.getElementById('fieldImChangeAssociatedModels')?.value.trim() || '',
          notes: document.getElementById('fieldImChangeDischargeNotes')?.value.trim() || '',
          evidenceNames: Array.from(document.getElementById('fieldImChangeDischargeEvidence')?.files || [])
            .map(file => file.name)
        } : null
      }
    } : {}),
    ...(formKey === 'im_diario' ? {
      shift: document.getElementById('modalFormShiftSelect')?.value || '',
      auditDetails: {
        jigCode: document.getElementById('fieldImJigCode')?.value.trim() || '',
        station: document.getElementById('fieldImLine')?.value || '',
        lot: document.getElementById('fieldImDailyLot')?.value.trim() || '',
        model: document.getElementById('fieldImDailyModel')?.value.trim() || '',
        point1Text: document.getElementById('imDailyConsolidatedText')?.value || 'OK (Sin desvíos previos)',
        followups: (window.imDailyFollowups || []).map(item => ({
            sourceId: item.sourceId,
            key: item.key,
            description: item.description,
            status: item.status,
            notes: item.notes
        }))
      }
    } : {}),
    status: isAllOk ? 'Aprobado' : 'Con Desvíos',
    statusClass: isAllOk 
      ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' 
      : 'text-rose-700 bg-rose-50 border border-rose-200'
  };

  if (formKey === 'im_cambio') {
    const evidenceFiles = [
      ...window.imChangeStationsData.flatMap((station, stationIndex) =>
        station.evidenceFiles.map(file => ({ name: `Puesto ${station.name || stationIndex + 1} · ${file.name}`, file }))
      ),
      ...(window.imChangeDischargeEvidenceFiles || []).map(file => ({ name: file.name, file }))
    ];
    try {
      await saveImChangeEvidence(newRecord.id, evidenceFiles);
      newRecord.auditDetails.evidenceCount = evidenceFiles.length;
      const username = AppState.currentUser?.username || 'usuario';
      newRecord.auditDetails.sharedSourceId = `${username}-${newRecord.id}`;
      await saveImChangeAuditToSharedStore(newRecord, newRecord.auditDetails.sharedSourceId);
    } catch (error) {
      console.error('No se pudo compartir la auditoría de Cambio de Modelo I.M & JIG.', error);
      showToast(`No se registró la auditoría. ${error.message}`);
      return;
    }
  }

  // Incrementar contador después de completar el guardado de evidencias.
  AppState.formCounts[formKey] = (AppState.formCounts[formKey] || 0) + 1;
  const newCount = AppState.formCounts[formKey];
  document.querySelectorAll(`.count-badge-${formKey}`).forEach(el => {
    el.textContent = `${newCount} reg`;
  });

  AppState.recentFormRecords.unshift(newRecord);
  persistDailyFormRecords();

  // Re-render tabla
  renderFormRecordsTable(AppState.recentFormRecords);
  updateSummaryMetrics();

  if (formKey === 'im_cambio') navigateToView('auditorias');
  else closeFormularioModal();
  showToast(`✓ Registro guardado con éxito: ${formDef.title}`);
}

function renderFormRecordsTable(records) {
  const tbody = document.getElementById('formRecordsTableBody');
  if (!tbody) return;

  if (!records || records.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-6 text-slate-400">
          No hay registros con el filtro seleccionado.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = records.map(r => `
    <tr class="hover:bg-slate-50 transition-colors">
      <td class="py-3 px-3">
        <div class="font-bold text-slate-800">${r.formName}</div>
      </td>
      <td class="py-3 px-3 text-slate-600 font-mono text-[11px]">${r.line}</td>
      <td class="py-3 px-3 text-slate-700 font-semibold">${r.auditor}</td>
      <td class="py-3 px-3 text-slate-400 font-mono text-[11px]">${r.time}</td>
      <td class="py-3 px-3">
        <span class="text-slate-800 font-medium">${r.result}</span>
        ${r.auditDetails?.evidenceCount ? `<button type="button" onclick="openImChangeEvidence(${Number(r.id)})" class="ml-2 text-[10px] font-bold text-red-700 underline">Ver fotos (${r.auditDetails.evidenceCount})</button>` : ''}
      </td>
      <td class="py-3 px-3 text-right">
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${r.statusClass}">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          ${r.status}
        </span>
      </td>
    </tr>
  `).join('');
}

window.filterRecentFormRecords = function() {
  const select = document.getElementById('filterFormType');
  if (!select) return;

  const value = select.value;
  if (value === 'todos') {
    renderFormRecordsTable(AppState.recentFormRecords);
  } else {
    const filtered = AppState.recentFormRecords.filter(r => r.formKey === value);
    renderFormRecordsTable(filtered);
  }
};


window.exportAuditReportPdf = function() {
  const element = document.getElementById('reportRadiographyResults');
  if (!element) {
    if (typeof showToast === 'function') showToast('Primero generá la radiografía para exportarla a PDF.');
    return;
  }

  const lineLabel = AuditReportLines.find(l => l.value === auditRadiographyConfig.line)?.label || 'Todas las líneas';
  const periodLabel = auditRadiographyConfig.month
    ? getAuditMonthLabel(auditRadiographyConfig.month)
    : auditRadiographyConfig.period === 'all'
      ? 'Todo el período'
      : auditRadiographyConfig.period === 'custom'
        ? `${auditRadiographyConfig.start} al ${auditRadiographyConfig.end}`
        : auditRadiographyConfig.period === 'month'
          ? 'Últimos 30 días'
          : auditRadiographyConfig.period === '7' ? 'Últimos 7 días' : 'Últimas 2 semanas';
  const formObj = ALL_SIX_AUDIT_FORMS.find(f => f.key === auditRadiographyConfig.formKey);
  const formLabel = auditRadiographyConfig.formKey === 'all' ? 'Todos los formularios' : (formObj?.title || auditRadiographyConfig.formKey);
  const auditorLabel = auditRadiographyConfig.auditor === 'all' ? 'Todos los auditores y operarios' : auditRadiographyConfig.auditor;
  const now = new Date();
  const dateFormatted = new Intl.DateTimeFormat('es-AR', { dateStyle: 'full', timeStyle: 'short' }).format(now);

  const wrapper = document.createElement('div');
  wrapper.className = 'pdf-export-sheet p-6 bg-white text-slate-800';
  wrapper.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  wrapper.innerHTML = `
    <div style="border-bottom: 2px solid #e11d48; padding-bottom: 12px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.14em; color: #e11d48;">
            NEWSAN · PLANTA 5 · CALIDAD OPERATIVA
          </div>
          <h1 style="font-size: 18px; font-weight: 900; color: #0f172a; margin: 4px 0 0 0;">
            Radiografía de Auditorías & Análisis de Calidad
          </h1>
          <p style="font-size: 11px; color: #64748b; margin: 2px 0 0 0;">
            Reporte oficial con análisis de Pareto (80/20), cumplimiento diario y detección de formularios faltantes.
          </p>
        </div>
        <div style="text-align: right; font-size: 10px; color: #64748b; line-height: 1.4;">
          <div style="font-weight: 700; color: #0f172a;">Calidad Planta 5</div>
          <div>${dateFormatted}</div>
        </div>
      </div>

      <!-- Filtros aplicados -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 12px; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 10px;">
        <div><strong style="color: #475569;">Línea:</strong> <span style="font-weight: 700; color: #0f172a;">${escapeAuditReportText(lineLabel)}</span></div>
        <div><strong style="color: #475569;">Período:</strong> <span style="font-weight: 700; color: #0f172a;">${escapeAuditReportText(periodLabel)}</span></div>
        <div><strong style="color: #475569;">Formulario:</strong> <span style="font-weight: 700; color: #0f172a;">${escapeAuditReportText(formLabel)}</span></div>
        <div><strong style="color: #475569;">Auditor:</strong> <span style="font-weight: 700; color: #0f172a;">${escapeAuditReportText(auditorLabel)}</span></div>
      </div>
    </div>

    <div>
      ${element.innerHTML}
    </div>
  `;

  // Remove interactive buttons / controls from cloned element
  wrapper.querySelectorAll('button, input, select').forEach(el => el.remove());

  const opt = {
    margin: [8, 8, 8, 8],
    filename: `Radiografia_Calidad_Planta5_${new Date().toISOString().slice(0, 10)}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  if (typeof showToast === 'function') showToast('Generando archivo PDF...');

  if (typeof html2pdf !== 'undefined') {
    html2pdf().set(opt).from(wrapper).save().then(() => {
      if (typeof showToast === 'function') showToast('PDF descargado con éxito.');
    }).catch(err => {
      console.warn('html2pdf fallback to window.print:', err);
      window.print();
    });
  } else {
    window.print();
  }
};

window.deleteScreenValidationRecord = async function(id) {
  if (!confirm('¿Estás seguro de que deseás eliminar este registro de validación?')) return;
  try {
    const res = await requestAuthApi(`/api/screen-validations/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    showToast('Registro de validación eliminado correctamente.');
    await loadScreenValidationRecords();
  } catch (err) {
    console.error('Error al eliminar validación:', err);
    alert(err.message || 'No se pudo eliminar el registro.');
  }
};


// ==========================================
// ASIGNACIÓN DE LÍNEAS A AUDITORES
// ==========================================

async function loadLineAuditorAssignments() {
  try {
    const res = await requestAuthApi('/api/line-auditors');
    if (res && Array.isArray(res.assignments)) {
      AppState.lineAuditorAssignments = res.assignments;
      return res.assignments;
    }
  } catch (err) {
    console.warn('No se pudieron cargar asignaciones de auditores desde el servidor:', err);
  }
  return AppState.lineAuditorAssignments || [];
}

window.openLineAuditorModal = async function() {
  const modal = document.getElementById('lineAuditorModal');
  const body = document.getElementById('lineAuditorModalBody');
  if (!modal || !body) return;

  modal.classList.remove('hidden');
  body.innerHTML = '<div class="text-center py-6 text-slate-400 text-xs">Cargando equipo de calidad y asignaciones...</div>';

  try {
    // Cargar asignaciones y equipo de calidad
    const [assignmentsRes, teamRes] = await Promise.all([
      requestAuthApi('/api/line-auditors').catch(() => ({ assignments: [] })),
      requestAuthApi('/api/quality-team').catch(() => ({ members: [] }))
    ]);

    const assignments = assignmentsRes.assignments || AppState.lineAuditorAssignments || [];
    const members = teamRes.members || [];
    AppState.lineAuditorAssignments = assignments;

    // Líneas a configurar
    const targetLines = [
      { code: 'LCD 6', name: 'LCD 6', color: 'sky' },
      { code: 'LCD 8', name: 'LCD 8', color: 'blue' },
      { code: 'CELDA 2', name: 'CELDA 2', color: 'amber' },
      { code: 'CELDA 3', name: 'CELDA 3', color: 'emerald' },
      { code: 'INSERCIÓN MANUAL & JIG', name: 'INSERCIÓN MANUAL & JIG', color: 'orange' },
      { code: 'CELDA 1', name: 'CELDA 1', color: 'rose' },
      { code: 'INSERCIÓN PLACAS', name: 'INSERCIÓN PLACAS', color: 'purple' }
    ];

    body.innerHTML = '';

    targetLines.forEach(line => {
      const current = assignments.find(a => a.lineCode === line.code) || {};
      const card = document.createElement('div');
      card.className = 'rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3';
      card.dataset.lineCode = line.code;

      const titleRow = document.createElement('div');
      titleRow.className = 'flex items-center justify-between';
      titleRow.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black bg-white border border-slate-200 text-slate-800 shadow-2xs">
            ${line.code}
          </span>
        </div>
      `;
      card.appendChild(titleRow);

      const selectorsGrid = document.createElement('div');
      selectorsGrid.className = 'grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1';

      // Dropdown Auditor 1
      const a1Col = document.createElement('div');
      a1Col.innerHTML = `
        <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">Auditor 1 (Principal)</label>
        <select class="line-auditor-select-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-200">
          <option value="">— Sin auditor asignado —</option>
          ${members.map(m => `
            <option value="${m.fullName}" data-email="${m.email || ''}" ${current.auditor1Name === m.fullName ? 'selected' : ''}>
              ${m.fullName} ${m.sector ? '(' + m.sector.split('·')[0].trim() + ')' : ''}
            </option>
          `).join('')}
        </select>
      `;
      selectorsGrid.appendChild(a1Col);

      // Dropdown Auditor 2
      const a2Col = document.createElement('div');
      a2Col.innerHTML = `
        <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">Auditor 2 (Apoyo / Opcional)</label>
        <select class="line-auditor-select-2 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-200">
          <option value="">— Ninguno —</option>
          ${members.map(m => `
            <option value="${m.fullName}" data-email="${m.email || ''}" ${current.auditor2Name === m.fullName ? 'selected' : ''}>
              ${m.fullName} ${m.sector ? '(' + m.sector.split('·')[0].trim() + ')' : ''}
            </option>
          `).join('')}
        </select>
      `;
      selectorsGrid.appendChild(a2Col);

      card.appendChild(selectorsGrid);
      body.appendChild(card);
    });

  } catch (err) {
    console.error('Error al abrir modal de asignación de auditores:', err);
    body.innerHTML = '<div class="p-4 text-center text-xs text-red-600 bg-red-50 rounded-lg">Error al cargar datos. Verificá la conexión con el servidor.</div>';
  }
};

window.closeLineAuditorModal = function() {
  const modal = document.getElementById('lineAuditorModal');
  if (modal) modal.classList.add('hidden');
};

window.saveLineAuditorAssignments = async function() {
  const saveBtn = document.getElementById('btnSaveLineAuditorModal');
  const cards = document.querySelectorAll('#lineAuditorModalBody [data-line-code]');
  if (!cards.length) return;

  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Guardando...';
  }

  const assignments = [];
  cards.forEach(card => {
    const lineCode = card.dataset.lineCode;
    const s1 = card.querySelector('.line-auditor-select-1');
    const s2 = card.querySelector('.line-auditor-select-2');

    const opt1 = s1?.selectedOptions?.[0];
    const opt2 = s2?.selectedOptions?.[0];

    const a1Name = s1?.value || '';
    const a1Email = opt1?.dataset?.email || '';

    const a2Name = s2?.value || '';
    const a2Email = opt2?.dataset?.email || '';

    assignments.push({
      lineCode,
      auditor1Name: a1Name,
      auditor1Email: a1Email,
      auditor2Name: a2Name,
      auditor2Email: a2Email
    });
  });

  try {
    await requestAuthApi('/api/line-auditors', {
      method: 'POST',
      body: JSON.stringify({ assignments })
    });

    AppState.lineAuditorAssignments = assignments;
    window.closeLineAuditorModal();
    showToast('✓ Asignaciones de auditores guardadas correctamente.', 'success');
    await loadLineAuditorAssignments();
  renderWeeklyMatrix();
  } catch (err) {
    console.error('Error al guardar asignaciones de auditores:', err);
    alert('No se pudieron guardar las asignaciones: ' + (err.message || 'Error de servidor'));
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Guardar asignaciones';
    }
  }
};
