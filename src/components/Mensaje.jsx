import { useState } from 'react'
import { mensaje, faltantes, recordar, binomioATexto } from '../datos'

// Muestra el texto como se ve en WhatsApp: *negrita* y _cursiva_
function Vista({ texto }) {
  const html = texto
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/\*([^*\n]+)\*/g, '<b>$1</b>')
    .replace(/(^|[\s(>])_([^_\n]+)_/g, '$1<i>$2</i>')
  return <div className="vista-wa" dangerouslySetInnerHTML={{ __html: html }} />
}

export default function Mensaje({ d, onEditar, onNuevo }) {
  const texto = mensaje(d)
  const falta = faltantes(d)
  const [hecho, setHecho] = useState('')

  const recordarTodo = () => {
    recordar('lugares', d.lugar)
    if (d.tipo === 'informe') { recordar('unidades', d.unidad); d.agentes.slice(1).forEach((a) => recordar('companeros', a)) }
    else (d.binomios || []).filter((b) => b.nombre.trim()).forEach((b) => { recordar('binomios', binomioATexto(b)); recordar('companeros', b.nombre) })
  }
  const copiar = async () => {
    try { await navigator.clipboard.writeText(texto) } catch {
      const ta = document.createElement('textarea'); ta.value = texto; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove()
    }
    recordarTodo(); setHecho('copiado')
  }
  const enviar = () => { recordarTodo(); setHecho('enviado'); window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank') }

  return (
    <div className="mensaje">
      {falta.length > 0 && <div className="aviso">⚠ Falta completar: {falta.join(', ')}. Podés enviarlo igual.</div>}
      <div className="acciones-mensaje">
        <button type="button" className="primario" onClick={copiar}>{hecho === 'copiado' ? '✓ Copiado' : '📋 Copiar'}</button>
        <button type="button" className="wa" onClick={enviar}>WhatsApp</button>
        {hecho && <button type="button" className="secundario ancho" onClick={onNuevo}>✓ Listo, terminar</button>}
      </div>
      <Vista texto={texto} />
      <button type="button" onClick={onEditar}>← Volver a editar</button>
    </div>
  )
}
