# Migración: blanco/negro → tokens semánticos

Objetivo: eliminar `bg-white`, `text-white`, `text-black`, y colores hex directos en componentes. Usa variables CSS semánticas expuestas por `globals.css`.

Tokens principales:
- Superficies: `bg-[color:var(--sp-surface)]`, `bg-[color:var(--sp-surface-elevated)]`.
- Texto: `text-[color:var(--sp-on-surface)]`, `text-[color:var(--sp-on-surface-inverted)]`, `text-[color:var(--sp-on-primary)]`, `text-[color:var(--sp-on-success)]`, `text-[color:var(--sp-on-warning)]`, `text-[color:var(--sp-on-error)]`, `text-[color:var(--sp-on-info)]`.
- Bordes y focus: `border-[color:var(--sp-border)]`, `focus:ring-[color:var(--sp-focus)]`.
- Overlay: `bg-[color:var(--sp-overlay)]`.

Antes:
  - `bg-white text-black border-gray-200`
  - `text-white bg-[color:var(--sp-primary-600)]`
  - `focus:ring-[color:var(--sp-primary-600)]`

Después:
  - `bg-[color:var(--sp-surface)] text-[color:var(--sp-on-surface)] border-[color:var(--sp-border)]`
  - `bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)]`
  - `focus:ring-[color:var(--sp-focus)]`

Modo oscuro:
- Se activa con la clase `dark` en html/body. Los tokens se remapean automáticamente (ver `globals.css`).

Notas:
- Evita usar hex en TS para colores de UI. Fuente de verdad: variables CSS.
- Para historias/demos, usa tokens en botones de ejemplo también.
