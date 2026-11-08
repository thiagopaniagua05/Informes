import { useEffect, useState } from 'react'
import { Campo, Bloque, TextoLargo } from './Campos'
import Persona from './Persona'
import Sintesis from './Sintesis'
import { cargarRecuerdos, olvidar, personaVacia, otroTraslado, TIPOS_TRASLADO } from '../datos'

const NEG = ['Negativo']
const ZONAS = ['1', '2', '3', '4', '5', '5 BIS', '6', '7', '8', '9', '10', '11', '12', '13', '13 BIS', '14', '14 BIS', '15', '15 BIS',
  '16', '17', '18', '18 BIS', '19', '19 BIS', '20', '20 BIS', 'UVG']

function ZonaSelect({ value, onChange }) {
  const lista = value && !ZONAS.includes(value) ? [value, ...ZONAS] : ZONAS
  return (
    <label className="campo">
      <span>Zona</span>
      <select value={value || ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">—</option>
        {lista.map((z) => <option key={z}>{z}</option>)}
      </select>
    </label>
  )
}

export default function Formulario({ d, set, onVer }) {
  const [rec, setRec] = useState(cargarRecuerdos)
  const borrarRec = (tipo) => (v) => { olvidar(tipo, v); setRec(cargarRecuerdos()) }
  const esInforme = d.tipo === 'informe'

  // Al agregar algo, la pantalla baja sola hasta eso y deja el cursor listo para escribir
  const [irA, setIrA] = useState(null)
  useEffect(() => {
    if (!irA) return
    const el = document.getElementById(irA); setIrA(null)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    const campo = el.querySelector('input:not([type=date]):not([type=time]):not([type=checkbox]), textarea')
    setTimeout(() => campo?.focus({ preventScroll: true }), 400)
  }, [irA])
  const agregarY = (patch, id) => { set(patch); setIrA(id) }
  const setP = (id, p) => set({ personas: d.personas.map((x) => (x.id === id ? p : x)) })
  const agregarP = (tipo) => { const p = personaVacia(tipo); agregarY({ personas: [...d.personas, p] }, 'p-' + p.id) }
  const tr = d.traslado
  const setOtro = (id, patch) => set({ traslado: { ...tr, otros: (tr.otros || []).map((o) => (o.id === id ? { ...o, ...patch } : o)) } })
  const numero = (p) => {
    const mismas = d.personas.filter((x) => x.tipo === p.tipo)
    return mismas.length > 1 ? ' ' + (mismas.indexOf(p) + 1) : ''
  }
  const TIT = { victima: 'Víctima / llamante', testigo: 'Testigo', detenido: 'Detenido' }

  return (
    <div className="form">
      <Bloque titulo={esInforme ? 'Datos del hecho' : 'Datos'}>
        <div className="grilla">
          <Campo label="Fecha" type="date" value={d.fecha} onChange={(fecha) => set({ fecha })} />
          <Campo label={esInforme ? 'Hora de intervención' : 'Hora'} type="time" value={d.hora} onChange={(hora) => set({ hora })} />
          <Campo label={esInforme ? 'Lugar del hecho' : 'Lugar'} value={d.lugar} onChange={(lugar) => set({ lugar })} ancho
            chips={rec.lugares} onBorrarChip={borrarRec('lugares')} placeholder="ej. Av. Maipú 2270 (Base ESCUDO)" />
          {esInforme
            ? <Campo label="Calificación" value={d.calificacion} onChange={(calificacion) => set({ calificacion })} ancho placeholder="ej. Confrontación en vía pública" />
            : <>
              <ZonaSelect value={d.zona} onChange={(zona) => set({ zona })} />
              <Campo label="Agente" value={d.agente} onChange={(agente) => set({ agente })} />
              <Campo label="LP" value={d.lp} onChange={(lp) => set({ lp })} inputMode="numeric" />
            </>}
        </div>
      </Bloque>

      {esInforme && (
        <Bloque titulo="Personal interviniente">
          <div className="grilla">
            <Campo label="Vehículo no identificable" value={d.vehiculo} onChange={(vehiculo) => set({ vehiculo })} chips={NEG} />
            <Campo label="Unidad de patrulla N°" value={d.unidad} onChange={(unidad) => set({ unidad })}
              chips={rec.unidades} onBorrarChip={borrarRec('unidades')} placeholder="ej. Camioneta 58" />
            <ZonaSelect value={d.zona} onChange={(zona) => set({ zona })} />
            <Campo label="Of. de policía" value={d.ofPolicia} onChange={(ofPolicia) => set({ ofPolicia })} chips={NEG} />
          </div>
          <div className="agentes">
            <span className="etiqueta">Agentes</span>
            {d.agentes.map((a, i) => (
              <div className="fila-agente" key={i} id={'ag-' + i}>
                <input value={a} placeholder="Apellido y nombre" onChange={(e) => set({ agentes: d.agentes.map((x, j) => (j === i ? e.target.value : x)) })} />
                <button type="button" className="quitar" onClick={() => set({ agentes: d.agentes.filter((_, j) => j !== i) })}>✕</button>
              </div>
            ))}
            <div className="chips">
              {rec.companeros.filter((c) => !d.agentes.includes(c)).map((c) => (
                <span className="chip" key={c}>
                  <button type="button" onClick={() => set({ agentes: [...d.agentes.filter(Boolean), c] })}>+ {c}</button>
                  <button type="button" className="x" aria-label="Olvidar" onClick={() => borrarRec('companeros')(c)}>×</button>
                </span>
              ))}
            </div>
            <button type="button" className="link" onClick={() => agregarY({ agentes: [...d.agentes, ''] }, 'ag-' + d.agentes.length)}>+ Agregar otro agente</button>
          </div>
        </Bloque>
      )}

      {esInforme && tr && (
        <Bloque id="b-traslado" titulo="Móvil de traslado comando" onQuitar={() => set({ traslado: null })}>
          <div className="grilla">
            <Campo label="Móvil N°" value={tr.movil} onChange={(movil) => set({ traslado: { ...tr, movil } })} chips={NEG} />
            <Campo label="A/C Of. de policía" value={tr.oficial} onChange={(oficial) => set({ traslado: { ...tr, oficial } })} chips={NEG} />
          </div>
          {(tr.otros || []).map((o) => (
            <div className="sub-bloque" id={'t-' + o.id} key={o.id}>
              <div className="sub-titulo">
                <b>{o.tipo}</b>
                <button type="button" className="quitar" onClick={() => set({ traslado: { ...tr, otros: tr.otros.filter((x) => x.id !== o.id) } })}>Quitar</button>
              </div>
              <div className="grilla">
                <Campo label={`Móvil ${o.tipo === 'SAME' ? 'SAME' : o.tipo.toLowerCase()} N°`} value={o.movil} onChange={(movil) => setOtro(o.id, { movil })} inputMode="numeric" />
                <Campo label="A cargo de" value={o.cargo} onChange={(cargo) => setOtro(o.id, { cargo })} ancho
                  placeholder={o.tipo === 'SAME' ? 'ej. Médico Ramírez Juan' : 'ej. Oficial Gómez'} />
              </div>
            </div>
          ))}
          <div className="botones-secciones chicos">
            {TIPOS_TRASLADO.map((t) => (
              <button type="button" key={t} onClick={() => { const o = otroTraslado(t); agregarY({ traslado: { ...tr, otros: [...(tr.otros || []), o] } }, 't-' + o.id) }}>
                + {t === 'SAME' ? 'SAME' : t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </Bloque>
      )}

      {esInforme && d.comisaria != null && (
        <Bloque id="b-comisaria" titulo="Dependencia actuaciones (comisaría)" onQuitar={() => set({ comisaria: null })}>
          <Campo label="Comisaría" value={d.comisaria} onChange={(comisaria) => set({ comisaria })} ancho placeholder="ej. Comisaría 1ra Vicente López" />
        </Bloque>
      )}

      {esInforme && d.personas.map((p) => (
        <Persona key={p.id} id={'p-' + p.id} p={p} titulo={TIT[p.tipo] + numero(p)} fechaHecho={d.fecha}
          onChange={(np) => setP(p.id, np)} onQuitar={() => confirm(`¿Quitar ${TIT[p.tipo].toLowerCase()}?`) && set({ personas: d.personas.filter((x) => x.id !== p.id) })} />
      ))}

      {esInforme && (
        <div className="agregar-secciones">
          <span className="etiqueta">Agregar al informe</span>
          <div className="botones-secciones">
            <button type="button" onClick={() => agregarP('victima')}>+ Víctima / llamante</button>
            <button type="button" onClick={() => agregarP('testigo')}>+ Testigo</button>
            <button type="button" onClick={() => agregarP('detenido')}>+ Detenido</button>
            {d.comisaria == null && <button type="button" onClick={() => agregarY({ comisaria: '' }, 'b-comisaria')}>+ Comisaría</button>}
            {!tr && <button type="button" onClick={() => agregarY({ traslado: { movil: 'Negativo', oficial: 'Negativo', otros: [] } }, 'b-traslado')}>+ Móvil de traslado</button>}
            {d.camaras == null && <button type="button" onClick={() => agregarY({ camaras: '' }, 'b-camaras')}>+ Relevamiento de cámaras</button>}
          </div>
        </div>
      )}

      <Bloque titulo={esInforme ? 'Síntesis del hecho' : 'Novedad'}>
        <Sintesis renglones={d.sintesis} onChange={(sintesis) => set({ sintesis })} />
      </Bloque>

      {esInforme && d.camaras != null && (
        <Bloque id="b-camaras" titulo="Relevamiento de cámaras" onQuitar={() => set({ camaras: null })}>
          <TextoLargo value={d.camaras} onChange={(camaras) => set({ camaras })} placeholder="Qué se vio en las cámaras…" />
        </Bloque>
      )}

      {esInforme && (
        <Bloque titulo="Cierre">
          <div className="grilla">
            <Campo label="Elementos sustraídos" value={d.sustraidos} onChange={(sustraidos) => set({ sustraidos })} chips={NEG} ancho />
            <Campo label="Solicita cerrajero" value={d.cerrajero} onChange={(cerrajero) => set({ cerrajero })} chips={NEG} ancho />
          </div>
        </Bloque>
      )}

      <Bloque titulo="Supervisores de turno">
        <Campo label="Supervisores" value={d.supervisores} onChange={(supervisores) => set({ supervisores })} ancho placeholder="ej. Sossich - García - Lugo" />
      </Bloque>

      <button type="button" className="primario ver" onClick={onVer}>Ver mensaje para WhatsApp →</button>
    </div>
  )
}
