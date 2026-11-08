import { useLayoutEffect, useRef } from 'react'

/** Campo de texto con etiqueta y, opcionalmente, botones rápidos debajo (lugares usados, "Negativo", etc.) */
export function Campo({ label, value, onChange, chips = [], onBorrarChip, placeholder, inputMode, type = 'text', mayus, ancho, error }) {
  return (
    <label className={'campo' + (ancho ? ' ancho' : '')}>
      <span>{label}</span>
      <input type={type} value={value ?? ''} placeholder={placeholder} inputMode={inputMode} autoComplete="off"
        className={error ? 'error' : ''}
        onChange={(e) => onChange(mayus ? e.target.value.toUpperCase() : e.target.value)} />
      {error && <small className="error-msg">{error}</small>}
      {chips.length > 0 && (
        <div className="chips">
          {chips.filter((c) => c !== value).map((c) => (
            <span className="chip" key={c}>
              <button type="button" onClick={() => onChange(c)}>{c}</button>
              {onBorrarChip && <button type="button" className="x" aria-label="Olvidar" onClick={() => onBorrarChip(c)}>×</button>}
            </span>
          ))}
        </div>
      )}
    </label>
  )
}

/** Textarea que crece sola con el contenido */
export function TextoLargo({ value, onChange, placeholder, onFocus, refExterno, rows = 2 }) {
  const ref = useRef()
  const r = refExterno || ref
  useLayoutEffect(() => {
    const el = r.current; if (!el) return
    el.style.height = 'auto'; el.style.height = el.scrollHeight + 2 + 'px'
  }, [value, r])
  return <textarea ref={r} rows={rows} value={value} placeholder={placeholder} onFocus={onFocus} onChange={(e) => onChange(e.target.value)} />
}

export function Bloque({ id, titulo, children, onQuitar, extra }) {
  return (
    <section className="bloque" id={id}>
      <header>
        <h3>{titulo}</h3>
        {extra}
        {onQuitar && <button type="button" className="quitar" onClick={onQuitar}>Quitar</button>}
      </header>
      <div className="bloque-cuerpo">{children}</div>
    </section>
  )
}
