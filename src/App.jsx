import { useEffect, useState } from 'react'
import Perfil from './components/Perfil'
import Formulario from './components/Formulario'
import Mensaje from './components/Mensaje'
import { cargarPerfil, guardarPerfil, cargarBorrador, guardarBorrador, informeNuevo, novedadNueva } from './datos'

const NOMBRE = { informe: 'Informe', novedad: 'Novedad' }

export default function App() {
  const [perfil, setPerfil] = useState(cargarPerfil)
  const [borrador, setBorradorState] = useState(cargarBorrador)
  const [pantalla, setPantalla] = useState('inicio') // inicio | form | mensaje | perfil

  // El borrador en curso se guarda solo: si se cierra la app o entra una llamada, no se pierde
  const setBorrador = (b) => { setBorradorState(b); guardarBorrador(b) }
  const set = (patch) => setBorradorState((b) => { const n = { ...b, ...patch }; guardarBorrador(n); return n })

  useEffect(() => { window.scrollTo(0, 0) }, [pantalla])

  if (!perfil) return <div className="app"><Perfil onGuardar={(p) => { guardarPerfil(p); setPerfil(p) }} /></div>

  const empezar = (tipo) => {
    if (borrador && !confirm(`Tenés un${borrador.tipo === 'novedad' ? 'a novedad' : ' informe'} sin terminar. ¿Descartarlo y empezar de nuevo?`)) return
    setBorrador(tipo === 'informe' ? informeNuevo(perfil) : novedadNueva(perfil))
    setPantalla('form')
  }
  const terminar = () => { setBorrador(null); setPantalla('inicio') }

  return (
    <div className="app">
      <header className="top">
        <button type="button" className="marca" onClick={() => setPantalla('inicio')}>
          <b>Informes</b><span>Cuerpo de Patrulla · Vicente López</span>
        </button>
        {pantalla === 'form' && <span className="tipo">{NOMBRE[borrador?.tipo]}</span>}
        {pantalla === 'mensaje' && <span className="tipo">Mensaje</span>}
      </header>

      {pantalla === 'inicio' && (
        <div className="inicio">
          <p className="hola">Hola, <b>{perfil.nombre}</b></p>
          {borrador && (
            <div className="pendiente">
              <div>
                <b>{NOMBRE[borrador.tipo]} sin terminar</b>
                <span>{borrador.lugar || 'Sin lugar'} · {borrador.hora} hs</span>
              </div>
              <div className="fila-botones">
                <button type="button" className="primario" onClick={() => setPantalla('form')}>Continuar</button>
                <button type="button" onClick={() => confirm('¿Descartar lo que estabas escribiendo?') && setBorrador(null)}>Descartar</button>
              </div>
            </div>
          )}
          <button type="button" className="grande-opcion" onClick={() => empezar('informe')}>
            <span className="icono">📝</span><b>Informe</b><small>Hecho con personal interviniente, víctimas, detenidos, síntesis…</small>
          </button>
          <button type="button" className="grande-opcion" onClick={() => empezar('novedad')}>
            <span className="icono">📣</span><b>Novedad</b><small>Comunicado corto para el supervisor</small>
          </button>
          <button type="button" className="link centro" onClick={() => setPantalla('perfil')}>⚙ Mis datos ({perfil.nombre} · LP {perfil.lp})</button>
        </div>
      )}

      {pantalla === 'perfil' && (
        <Perfil perfil={perfil} onCancelar={() => setPantalla('inicio')}
          onGuardar={(p) => { guardarPerfil(p); setPerfil(p); setPantalla('inicio') }} />
      )}

      {pantalla === 'form' && borrador && <Formulario d={borrador} set={set} onVer={() => setPantalla('mensaje')} />}
      {pantalla === 'mensaje' && borrador && <Mensaje d={borrador} onEditar={() => setPantalla('form')} onNuevo={terminar} />}
    </div>
  )
}
