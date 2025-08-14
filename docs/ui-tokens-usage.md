# Guía rápida de tokens de color (UI V2)

Esta guía resume cómo usar los tokens semánticos de color con Tailwind y variables CSS en SPOON.

## Principios
- Usa colores semánticos, no utilidades tailwind con paletas directas (regla ESLint en error).
- Tokens disponibles (prefijo `--sp-`): neutral, primary, info, success, warning, error.
- Escalas numéricas 50..900. Ej.: `--sp-primary-600`.
- Accesibilidad: focus-visible consistente en [color:var(--sp-primary-500)], overlays en neutral-900 con opacidad.

## Patron de clases
- Fondo: `bg-[color:var(--sp-<semantic>-<shade>)]`
- Texto: `text-[color:var(--sp-<semantic>-<shade>)]`
- Borde: `border-[color:var(--sp-<semantic>-<shade>)]`
- Ring: `ring-[color:var(--sp-primary-500)]` y/o `focus:ring-[color:var(--sp-primary-500)]`
- Gradientes: `from-[color:var(--sp-...)] via-[color:var(--sp-...)] to-[color:var(--sp-...)]`

## Ejemplos
- Botón primario: `bg-[color:var(--sp-primary-600)] hover:bg-[color:var(--sp-primary-700)] text-white`
- Texto secundario: `text-[color:var(--sp-neutral-600)]`
- Caja informativa: `bg-[color:var(--sp-info-50)] border border-[color:var(--sp-info-200)] text-[color:var(--sp-info-800)]`
- Error en formulario: `text-[color:var(--sp-error-600)]`
- Input focus: `focus:border-[color:var(--sp-primary-500)] focus:ring-2 focus:ring-[color:var(--sp-primary-500)]`
- Overlay modal: `bg-[color:var(--sp-neutral-900)]/60`

## Do / Don't
- Do: `text-[color:var(--sp-neutral-700)]`
- Don't: `text-gray-700`
- Do: `bg-[color:var(--sp-success-100)]`
- Don't: `bg-green-100`

## Notas SSR/Client
- Evita dependencias de ventana/documento en server components.
- Si necesitas detectar tema o dimensiones, usa `use client` únicamente cuando sea necesario.

## Linters
- La regla anti-colores está en `apps/web/.eslintrc.json` y `packages/shared/.eslintrc.json` como error.

## QA con Storybook
- Addon a11y activado; revisa contraste y focus.
- Ejecuta Storybook y valida estados hover/focus en light/dark.
