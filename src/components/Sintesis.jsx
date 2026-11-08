import { useLayoutEffect, useRef, useState } from 'react'
import { TextoLargo } from './Campos'
import { ahora, renglon, cargarComienzos, guardarComienzos, COMIENZOS_BASE } from '../datos'

/** Síntesis / novedad por renglones con hora, y comienzos rápidos para no escribir siempre lo mismo */
export default function Sintesis({ renglones, onChange }) {
  const [activo, setActivo] = useState(renglones[renglones.length - 1]?.id)
  const [comienzos, setComienzos] = useState(cargarComienzos)
  const [editando, setEditando] = useState(false)
  const [nueva, setNueva] = useState('')
  const refs = useRef({})
  // Después de insertar un comienzo: foco y cursor al final, apenas React actualiza el texto
  const cursor = useRef(null)
  useLayoutEffect(() => {
    if (!cursor.current) return
    const el = refs.current[cursor.current]?.current
    cursor.current = null
    if (el) { el.focus({ preventScroll: true }); el.setSelectionRange(el.value.length, el.value.length); el.closest('.renglon')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  })

  const cambiar = (id, patch) => onChange(renglones.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  const agregar = () => {
    const r = renglon(ahora().hora)
    cursor.current = r.id
    onChange([...renglones, r]); setActivo(r.id)
  }
  const usar = (frase) => {
    const id = activo && renglones.some((r) => r.id === activo) ? activo : renglones[renglones.length - 1]?.id
    if (!id) return
    const r = renglones.find((x) => x.id === id)
    const texto = r.texto.trim() ? r.texto.trimEnd() + ' ' + frase + ' ' : frase + ' '
    cursor.current = id
    cambiar(id, { texto })
  }
  const guardar = (c) => { setComienzos(c); guardarComienzos(c) }

  return (
    <div className="sintesis">
      {renglones.map((r) => {
        refs.current[r.id] = refs.current[r.id] || { current: null }
        return (
          <div className={'renglon' + (r.id === activo ? ' activo' : '')} key={r.id}>
            <div className="renglon-top">
              <input type="time" value={r.hora} onChange={(e) => cambiar(r.id, { hora: e.target.value })} aria-label="Hora" />
              <span className="hs">hs</span>
              {renglones.length > 1 && (
                <button type="button" className="quitar" onClick={() => onChange(renglones.filter((x) => x.id !== r.id))}>Quitar</button>
              )}
            </div>
            <TextoLargo refExterno={refs.current[r.id]} value={r.texto} onFocus={() => setActivo(r.id)}
              onChange={(texto) => cambiar(r.id, { texto })} placeholder="Qué pasó… (tocá un comienzo de abajo o dictá con el micrófono)" />
            {r.id === activo && (
              <div className="comienzos" onMouseDown={(e) => e.preventDefault()}>
                {comienzos.map((c) => <button type="button" key={c} onClick={() => usar(c)}>{c}</button>)}
                <button type="button" className="editar" onClick={() => setEditando(!editando)}>✎ Editar comienzos</button>
              </div>
            )}
          </div>
        )
      })}
      <button type="button" className="agregar" onClick={agregar}>+ Agregar renglón ({ahora().hora} hs)</button>

      {editando && (
        <div className="editor-comienzos">
          <h4>Mis comienzos</h4>
          {comienzos.map((c, i) => (
            <div className="fila-comienzo" key={i}>
              <input value={c} onChange={(e) => guardar(comienzos.map((x, j) => (j === i ? e.target.value : x)))} />
              <button type="button" className="quitar" onClick={() => guardar(comienzos.filter((_, j) => j !== i))}>✕</button>
            </div>
          ))}
          <div className="fila-comienzo">
            <input value={nueva} placeholder="Nuevo comienzo…" onChange={(e) => setNueva(e.target.value)} />
            <button type="button" className="primario" disabled={!nueva.trim()} onClick={() => { guardar([...comienzos, nueva.trim()]); setNueva('') }}>Agregar</button>
          </div>
          <div className="fila-botones">
            <button type="button" onClick={() => confirm('¿Volver a los comienzos de fábrica?') && guardar(COMIENZOS_BASE)}>Restaurar</button>
            <button type="button" className="primario" onClick={() => setEditando(false)}>Listo</button>
          </div>
        </div>
      )}
    </div>
  )
}
