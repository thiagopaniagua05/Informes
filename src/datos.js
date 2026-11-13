// Datos, guardado local y armado del mensaje de WhatsApp.
// No hay historial: solo se guarda el borrador en curso, tus datos, lugares, compañeros y comienzos.

const K = { perfil: 'inf:perfil', borrador: 'inf:borrador', recuerdos: 'inf:recuerdos', comienzos: 'inf:comienzos' }
const leer = (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def } catch { return def } }
const escribir = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)) } catch { /* sin espacio */ } }

export const cargarPerfil = () => leer(K.perfil, null)
export const guardarPerfil = (p) => escribir(K.perfil, p)
export const cargarBorrador = () => leer(K.borrador, null)
export const guardarBorrador = (b) => escribir(K.borrador, b)

export const COMIENZOS_BASE = [
  'Se presenta en el puesto de guardia de Base ESCUDO',
  'Se acerca un ciudadano a la base refiriendo',
  'Se toma conocimiento de',
  'Se modula a la Central solicitando presencia de personal de patrulla.',
  'Se requiere la presencia de una unidad de patrulla en',
  'Arriba al lugar el móvil N°',
  'Se entrevista con',
  'Se retira por sus propios medios del lugar.',
  'Se da por finalizada la intervención. S/N.',
]
export const cargarComienzos = () => leer(K.comienzos, COMIENZOS_BASE)
export const guardarComienzos = (c) => escribir(K.comienzos, c)

// Lugares, compañeros y unidades usados: se recuerdan para tocarlos la próxima vez
export const cargarRecuerdos = () => ({ lugares: [], companeros: [], unidades: [], binomios: [], ...leer(K.recuerdos, {}) })
export function recordar(tipo, valor) {
  const v = String(valor || '').trim()
  if (!v || /^negativo$/i.test(v)) return
  const r = cargarRecuerdos()
  r[tipo] = [v, ...r[tipo].filter((x) => x.toLowerCase() !== v.toLowerCase())].slice(0, 8)
  escribir(K.recuerdos, r)
}
export function olvidar(tipo, valor) {
  const r = cargarRecuerdos(); r[tipo] = r[tipo].filter((x) => x !== valor); escribir(K.recuerdos, r)
}

// ---------------------------------------------------------------------------
const pad = (n) => String(n).padStart(2, '0')
export const ahora = () => { const d = new Date(); return { fecha: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, hora: `${pad(d.getHours())}:${pad(d.getMinutes())}` } }
export const nuevoId = () => Math.random().toString(36).slice(2, 9)
const fechaDMY = (iso, corto = false) => { if (!iso) return ''; const [y, m, d] = iso.split('-'); return `${d}/${m}/${corto ? y.slice(2) : y}` }

/** dd/mm/aaaa con día y mes posibles (evita cosas como 12/13/1980) */
export function fechaValida(nac) {
  const m = String(nac || '').match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/)
  if (!m) return false
  const [d, mes, y] = [+m[1], +m[2], +m[3]]
  const f = new Date(y, mes - 1, d)
  return f.getFullYear() === y && f.getMonth() === mes - 1 && f.getDate() === d && y > 1900
}

/** Edad a la fecha del hecho a partir de una fecha de nacimiento dd/mm/aaaa */
export function calcularEdad(nac, fechaHecho) {
  const m = String(nac || '').match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/)
  if (!m || !fechaValida(nac)) return ''
  let y = +m[3]; if (y < 100) y += y > 30 ? 1900 : 2000
  const ref = fechaHecho ? new Date(fechaHecho + 'T12:00') : new Date()
  let edad = ref.getFullYear() - y
  if (ref.getMonth() + 1 < +m[2] || (ref.getMonth() + 1 === +m[2] && ref.getDate() < +m[1])) edad--
  return edad >= 0 && edad < 120 ? String(edad) : ''
}

export const PERSONA_CAMPOS = [
  ['nombre', 'APELLIDO/NOMBRE'], ['dni', 'DNI'], ['nacimiento', 'FECHA NACIMIENTO'], ['edad', 'EDAD'],
  ['civil', 'ESTADO CIVIL'], ['nacionalidad', 'NACIONALIDAD'], ['domicilio', 'DOMICILIO'], ['localidad', 'LOCALIDAD'],
  ['ocupacion', 'OCUPACION'], ['telefono', 'TELEFONO'],
]
export const EXTRA = {
  victima: [['telefono2', 'TELEFONO ALTERNATIVO']],
  testigo: [],
  detenido: [['padre', 'NOMBRE PADRE (vive)'], ['madre', 'NOMBRE MADRE (vive)']],
}
export const TITULO_PERSONA = { victima: 'VICTIMA / LLAMANTE', testigo: 'TESTIGO', detenido: 'DETENIDO' }

export const personaVacia = (tipo) => ({ id: nuevoId(), tipo, nacionalidad: 'ARGENTINA' })
// Otros móviles que intervienen en el traslado (además de policía): SAME, Bomberos, etc.
export const TIPOS_TRASLADO = ['SAME', 'BOMBEROS', 'DEFENSA CIVIL']
export const otroTraslado = (tipo) => ({ id: nuevoId(), tipo, movil: '', cargo: '' })

// Binomio en la novedad: se recuerda como "Apellido Nombre · LP"
export const binomioVacio = () => ({ id: nuevoId(), nombre: '', lp: '' })
export const binomioDeTexto = (t) => { const [nombre, lp = ''] = t.split(' · '); return { id: nuevoId(), nombre, lp } }
export const binomioATexto = (b) => [b.nombre.trim(), b.lp.trim()].filter(Boolean).join(' · ')

export const renglon = (hora) => ({ id: nuevoId(), hora: hora || ahora().hora, texto: '' })

export function informeNuevo(perfil) {
  const { fecha, hora } = ahora()
  return {
    tipo: 'informe', fecha, hora, lugar: perfil?.base || '', calificacion: '',
    vehiculo: 'Negativo', unidad: '', zona: perfil?.zona || '', agentes: [perfil?.nombre].filter(Boolean), ofPolicia: 'Negativo',
    traslado: { movil: 'Negativo', oficial: 'Negativo', otros: [] }, comisaria: null, camaras: null,
    personas: [], sintesis: [renglon(hora)], sustraidos: 'Negativo', cerrajero: 'Negativo',
    supervisores: perfil?.supervisores || '',
  }
}

export function novedadNueva(perfil) {
  const { fecha, hora } = ahora()
  return {
    tipo: 'novedad', fecha, hora, agente: perfil?.nombre || '', lp: perfil?.lp || '', binomios: [],
    lugar: perfil?.base || '', zona: perfil?.zona || '', sintesis: [renglon(hora)], supervisores: perfil?.supervisores || '',
  }
}

const lineasSintesis = (s) => s.filter((r) => r.texto.trim()).map((r) => `${r.hora} hs: ${r.texto.trim()}`)

/** Arma el texto exacto para WhatsApp */
export function mensaje(d) {
  if (d.tipo === 'novedad') {
    const zona = [d.lugar, d.zona && `Zona ${d.zona}`].filter(Boolean).join(', ')
    return [
      '*Comunicado para el Supervisor* ', '',
      `*Fecha:*  ${fechaDMY(d.fecha, true)}`,
      `*Hora:* ${d.hora} hs`,
      `*Agente:* ${d.agente} `,
      `*LP:* ${d.lp}`,
      ...(d.binomios || []).filter((b) => b.nombre.trim()).flatMap((b) => [`*Agente:* ${b.nombre.trim()} `, `*LP:* ${b.lp.trim()}`]), '',
      `*Zona* ${zona}`, '',
      '*Novedad:* ', ...lineasSintesis(d.sintesis), '',
      `_*Supervisores  de Turno*:_  _*${d.supervisores}*_`,
    ].join('\n')
  }

  const T = []
  T.push('_*Dirección General de Operaciones*_', '_*Unidad Cuerpo de Patrulla Vicente López*_', '')
  T.push(`_FECHA_: ${fechaDMY(d.fecha)}`, `_HORA INTERVENCIÓN_: ${d.hora}`, `_LUGAR DEL HECHO_: ${d.lugar}`, `_CALIFICACIÓN_: ${d.calificacion}`, '')
  T.push('*-PERSONAL INTERVINIENTE*', '')
  T.push(`VEHICULO NO IDENTIFICABLE: ${d.vehiculo}`, `UNIDAD DE PATRULLA: N° ${d.unidad}`, `ZONA: ${d.zona}`,
    `AGENTE: ${d.agentes.filter(Boolean).join(', ')}`, `OF. DE POLICIA: ${d.ofPolicia}`, '')
  if (d.traslado) {
    T.push('_*MOVIL DE TRASLADO COMANDO*_', '', `*MOVIL:* *N°* ${d.traslado.movil}`, `*A/C OF.DE POLICIA:* ${d.traslado.oficial}`, '')
    for (const o of d.traslado.otros || []) {
      if (!o.movil.trim() && !o.cargo.trim()) continue
      T.push(`*MOVIL ${o.tipo}:* *N°* ${o.movil.trim()}`, `*A/C ${o.tipo}:* ${o.cargo.trim()}`, '')
    }
  }
  if (d.comisaria != null) T.push(`_*DEPENDENCIA ACTUACIONES COMISARIA*:_ ${d.comisaria}`, '')
  for (const p of d.personas) {
    const campos = [...PERSONA_CAMPOS, ...EXTRA[p.tipo]].filter(([k]) => String(p[k] || '').trim())
    if (!campos.length) continue
    T.push(`_*${TITULO_PERSONA[p.tipo]}*_`, '', ...campos.map(([k, l]) => `${l}: ${String(p[k]).trim()}`), '')
  }
  T.push('*-SINTESIS DEL HECHO:* ', '', ...lineasSintesis(d.sintesis), '')
  if (d.camaras != null) T.push('*-RELEVAMIENTO DE CAMARAS:*', d.camaras, '')
  T.push('*-ELEMENTOS SUSTRAIDOS:* ', d.sustraidos, '')
  T.push('_*SOLICITA CERRAJERO*_', d.cerrajero, '', '')
  T.push('_*Supervisores de Turno*:_', ...d.supervisores.split(/\s*[-\n]\s*/).filter(Boolean).map((s) => `_*${s}*_`))
  return T.join('\n')
}

/** Campos importantes que faltan (se avisa antes de enviar, pero deja enviar igual) */
export function faltantes(d) {
  const f = []
  if (!d.lugar?.trim()) f.push('lugar')
  if (d.tipo === 'informe' && !d.calificacion?.trim()) f.push('calificación')
  if (!d.sintesis.some((r) => r.texto.trim())) f.push(d.tipo === 'informe' ? 'síntesis' : 'novedad')
  if (!d.supervisores?.trim()) f.push('supervisores')
  return f
}
