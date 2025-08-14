# Grupos V2: CheckboxGroupV2 y RadioGroupV2

Proveen etiquetado accesible y mensajes de ayuda/error para colecciones de CheckboxV2/RadioV2.

## Props clave
- label: texto de cabecera del grupo.
- helperText, errorMessage: mensajes informativos y de error enlazados con aria-describedby.
- requiredMark: añade aria-required y marca visual.
- layout: control del stack (e.g. vertical/horizontal, gap).

## Uso básico
- Envolver ítems individuales y pasar name en RadioV2 para exclusividad.

## Accesibilidad
- role="group" para checkboxes y role="radiogroup" para radios.
- id/aria-labelledby/aria-describedby manejados por el contenedor.

## Tests y stories
- Incluyen casos disabled, error, required y distintos layouts.
