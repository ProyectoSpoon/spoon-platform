# UI V2 Inputs: Date, Time y File

Guía rápida de uso y accesibilidad.

- Siempre que uses `label`, se vincula con `htmlFor`/`id` del input para accesibilidad.
- `errorMessage` activa `aria-invalid` en el control y muestra el mensaje.
- `helperText` y `errorMessage` se referencian vía `aria-describedby`.
- FileInputV2 es accesible por teclado: Enter/Espacio en el contenedor abre el selector.
- Estados soportados: disabled, requiredMark (cuando aplique), y constraints nativas (`min`, `max`, `step`).

Ejemplos rápidos

- DatePickerV2 con rango:
  - min="2025-08-10" max="2025-08-20"
- TimePickerV2 con step:
  - step={300} // 5 minutos
- FileInputV2 restringido a imágenes y múltiple:
  - accept="image/png,image/jpeg" multiple

Consejos

- Prefiere controlled cuando el valor deba sincronizarse con estado global.
- En formularios, muestra `errorMessage` cuando haya validación fallida.
- No bloquea por formato: añade validación propia si necesitas reglas específicas.
