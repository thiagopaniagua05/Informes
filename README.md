# Informes · Cuerpo de Patrulla Vicente López

App web para armar rápido los **informes** y **novedades** que se mandan por WhatsApp al supervisor, sin copiar y pegar plantillas ni borrar a mano lo que no se usa.

Stack: React 18 + Vite. No tiene backend ni login.

## Cómo funciona

- **La primera vez** pide tus datos: apellido y nombre, LP, zona, lugar/base habitual y supervisores de turno. Quedan guardados en el celular y se completan solos en cada informe. Se cambian desde *Mis datos*.
- **Informe**:
  - Fecha y hora ya cargadas. "Negativo" por defecto donde corresponde.
  - Se agregan solo las secciones que hacen falta: víctima / llamante, testigo, detenido (las veces que haga falta), comisaría, móvil de traslado y relevamiento de cámaras. Lo que no se agrega o queda vacío no sale en el mensaje.
  - La edad se calcula sola desde la fecha de nacimiento, a la fecha del hecho.
  - Los lugares, unidades y compañeros que usás quedan como botones para la próxima vez.
- **Novedad**: el comunicado corto para el supervisor.
- **Síntesis / novedad por renglones**: cada renglón lleva su hora (la actual, editable). Debajo del renglón están los **comienzos rápidos** ("Se presenta en el puesto de guardia…", "Se modula a la Central…"); se editan y se agregan propios desde *✎ Editar comienzos*.
- **Ver mensaje**: el texto exacto con el formato de WhatsApp, para **Copiar** o abrir **WhatsApp** directo.

## Privacidad

No hay historial: los informes quedan en WhatsApp al enviarlos. La app solo guarda en el navegador del celular (localStorage):

- el informe que estás escribiendo, para no perderlo si se cierra la app; se borra con *Listo, terminar*;
- tus datos, los comienzos, y los lugares, unidades y compañeros usados.

Nada se manda a ningún servidor.

## Desarrollo

```bash
npm install
npm run dev
npm run build
```

Deploy: importar el repo en Vercel (detecta Vite). No necesita variables de entorno.

## Estructura

```
src/datos.js                 guardado local, valores por defecto, armado del mensaje
src/components/Perfil.jsx    tus datos (bienvenida)
src/components/Formulario.jsx  informe / novedad por bloques
src/components/Persona.jsx   víctima, testigo, detenido
src/components/Sintesis.jsx  renglones con hora y comienzos rápidos
src/components/Mensaje.jsx   vista previa, copiar, WhatsApp
```
