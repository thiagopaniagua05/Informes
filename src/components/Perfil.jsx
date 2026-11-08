import { useState } from 'react'
import { Campo } from './Campos'

export default function Perfil({ perfil, onGuardar, onCancelar }) {
  const [p, setP] = useState(perfil || { nombre: '', lp: '', base: '', zona: '', supervisores: '' })
  const set = (k) => (v) => setP({ ...p, [k]: v })
  const ok = p.nombre.trim() && p.lp.trim()
  return (
    <div className="perfil">
      {!perfil && (
        <div className="bienvenida">
          <h2>Bienvenido</h2>
          <p>Cargá tus datos una sola vez. Se usan para completar solos los informes y novedades, y quedan guardados solo en este celular.</p>
        </div>
      )}
      <section className="bloque">
        <header><h3>{perfil ? 'Mis datos' : 'Tus datos'}</h3></header>
        <div className="bloque-cuerpo grilla">
          <Campo label="Apellido y nombre *" value={p.nombre} onChange={set('nombre')} placeholder="ej. Paniagua Thiago" ancho />
          <Campo label="LP *" value={p.lp} onChange={(v) => set('lp')(v.replace(/\D/g, ''))} inputMode="numeric" />
          <Campo label="Zona habitual" value={p.zona} onChange={set('zona')} placeholder="ej. 15 BIS" mayus />
          <Campo label="Lugar / base habitual" value={p.base} onChange={set('base')} placeholder="ej. Av. Maipú 2270 (Base ESCUDO)" ancho />
          <Campo label="Supervisores de turno" value={p.supervisores} onChange={set('supervisores')} placeholder="ej. Sossich - García - Lugo" ancho />
        </div>
      </section>
      <div className="fila-botones">
        {perfil && <button type="button" onClick={onCancelar}>Cancelar</button>}
        <button type="button" className="primario grande" disabled={!ok} onClick={() => onGuardar({ ...p, nombre: p.nombre.trim() })}>
          {perfil ? 'Guardar' : 'Entrar'}
        </button>
      </div>
    </div>
  )
}
