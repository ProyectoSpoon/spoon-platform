# Guía de migración a UI V2

Esta guía resume cambios y equivalencias entre componentes V1 y V2 para acelerar la adopción.

## Principios
- Props más tipadas y consistentes (errorMessage, helperText, required).
- Accesibilidad: aria-invalid, aria-required, aria-describedby, roles correctos.
- Variantes unificadas via class-variance-authority.

## Equivalencias rápidas
- Input → InputV2
- Textarea → TextareaV2
- Checkbox → CheckboxV2; use CheckboxGroupV2 para etiqueta/grupo
- Radio → RadioV2; use RadioGroupV2 para grupo
- Select → SelectV2
- Botón → ButtonV2 (variantes: primary, secondary, blue, danger, ghost, link)
- Fecha/Hora → DatePickerV2/TimePickerV2 (wrappers de InputV2)
- Archivos → FileInputV2 (click + drag&drop)

## Patrones comunes
- Estado de error: pasar errorMessage y opcionalmente id para enlazar aria-describedby.
- Requerido: usar required (el V2 añade aria-required automáticamente).
- Helper: helperText para mensajes informativos.

## Migración típica
- Reemplaza importaciones desde @spoon/shared a sus equivalentes V2 desde el barrel index.
- Ajusta variantes de ButtonV2 si usabas nombres no soportados.
- Para radios/checkboxes con etiqueta de grupo, usa RadioGroupV2/CheckboxGroupV2 y pasa label/helper/error a nivel de grupo.

## Ejemplo mínimo
- Input con error y helper usando InputV2 con id + aria-describedby (gestionado automáticamente por el componente).

## Notas
- ToastV2: export temporal de toast básico para compatibilidad. Una implementación completa se documentará luego.
- Los componentes V2 incluyen pruebas RTL y stories para referencia visual.
