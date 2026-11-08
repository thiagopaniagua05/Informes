import { Campo, Bloque } from './Campos'
import { calcularEdad, fechaValida } from '../datos'

const CIVIL = ['SOLTERO/A', 'CASADO/A', 'DIVORCIADO/A', 'VIUDO/A', 'CONCUBINO/A']
const NO_BRINDA = ['No brinda']

// Escribe las barras solas: 16101984 → 16/10/1984
const conBarras = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 8)
  return d.length > 4 ? `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}` : d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

export default function Persona({ id, p, titulo, onChange, onQuitar, fechaHecho }) {
  const set = (k) => (v) => onChange({ ...p, [k]: v })
  const setNac = (v) => {
    const nacimiento = conBarras(v)
    const edad = calcularEdad(nacimiento, fechaHecho)
    onChange({ ...p, nacimiento, edad: edad || (p.edadAuto ? '' : p.edad), edadAuto: !!edad })
  }
  return (
    <Bloque id={id} titulo={titulo} onQuitar={onQuitar}>
      <div className="grilla">
        <Campo label="Apellido y nombre" value={p.nombre} onChange={set('nombre')} ancho />
        <Campo label="DNI" value={p.dni} onChange={(v) => set('dni')(v.replace(/[^\d.]/g, ''))} inputMode="numeric" />
        <Campo label="Fecha de nacimiento" value={p.nacimiento} onChange={setNac} inputMode="numeric" placeholder="dd/mm/aaaa"
          error={p.nacimiento?.length === 10 && !fechaValida(p.nacimiento) ? 'Fecha inválida (día/mes/año)' : ''} />
        <Campo label="Edad" value={p.edad} onChange={(v) => onChange({ ...p, edad: v.replace(/\D/g, ''), edadAuto: false })} inputMode="numeric" />
        <label className="campo">
          <span>Estado civil</span>
          <select value={p.civil || ''} onChange={(e) => set('civil')(e.target.value)}>
            <option value="">—</option>
            {CIVIL.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <Campo label="Nacionalidad" value={p.nacionalidad} onChange={set('nacionalidad')} mayus />
        <Campo label="Domicilio" value={p.domicilio} onChange={set('domicilio')} ancho />
        <Campo label="Localidad" value={p.localidad} onChange={set('localidad')} chips={['Vicente López', 'Olivos', 'Florida', 'Munro', 'La Lucila']} />
        <Campo label="Ocupación" value={p.ocupacion} onChange={set('ocupacion')} />
        <Campo label="Teléfono" value={p.telefono} onChange={set('telefono')} inputMode="tel" chips={NO_BRINDA} />
        {p.tipo === 'victima' && <Campo label="Teléfono alternativo" value={p.telefono2} onChange={set('telefono2')} inputMode="tel" chips={NO_BRINDA} />}
        {p.tipo === 'detenido' && <>
          <Campo label="Nombre del padre (vive)" value={p.padre} onChange={set('padre')} ancho />
          <Campo label="Nombre de la madre (vive)" value={p.madre} onChange={set('madre')} ancho />
        </>}
      </div>
    </Bloque>
  )
}
