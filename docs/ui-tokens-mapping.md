# Guía de mapeo de colores: legacy → tokens

Objetivo: unificar estilos eliminando colores hardcodeados (hex/Tailwind) y usar tokens semánticos CSS para facilitar theming y consistencia.

## Paleta semántica

- Primary: --sp-primary-50..900
- Neutral: --sp-neutral-50..900
- Success: --sp-success-50..900
- Warning: --sp-warning-50..900
- Error: --sp-error-50..900
- Info: --sp-info-50..900

Uso en clases utilitarias compatibles con Tailwind arbitrary values:
- Texto: `text-[color:var(--sp-<key>-<step>)]`
- Fondo: `bg-[color:var(--sp-<key>-<step>)]`
- Borde: `border-[color:var(--sp-<key>-<step>)]`
- Anillo: `ring-[color:var(--sp-<key>-<step>)]`

## Mapeos comunes

- blue-500/600 → primary-500/600
- green-500/600 → success-500/600
- red-500/600 → error-500/600
- yellow/amber/orange 500/600 → warning-500/600
- gray/slate 500/600 → neutral-500/600
- purple/violet 600/700 → info-600/700

Ejemplos:
- `bg-blue-600` → `bg-[color:var(--sp-primary-600)]`
- `text-red-700` → `text-[color:var(--sp-error-700)]`
- `border-gray-200` → `border-[color:var(--sp-neutral-200)]`
- `ring-[#3b82f6]` → `ring-[color:var(--sp-primary-600)]`
- `#64748b` → `text-[color:var(--sp-neutral-600)]`

## Patrones de gradientes

Sustituir `from-<color>-50 via-<color>-50 to-<color>-100` por:
- `from-[color:var(--sp-<key>-50)] via-[color:var(--sp-<key>-50)] to-[color:var(--sp-<key>-100)]`

## Componentes migrados

- Button (legacy): variantes y focus ring → tokens.
- ActionBar: colores primarios/secundarios/bordes → tokens.
- Special Dishes: `getSpecialStatusColor` → tokens.
- Mesas: `COLORES_ESTADO` → tokens; `MesaCard` gradientes/badges/textos → tokens.

## Recomendaciones

- Preferir componentes V2 (ButtonV2, etc.).
- Evitar hex directos y nombres de colores Tailwind fuera de tokens.
- Al agregar nuevos estados, escoger familia semántica acorde (success/warning/error/info/primary/neutral).

## Troubleshooting

- Si una clase `text-[color:var(--sp-...)]` no aplica, verifica que el CSS raíz defina la variable y que Tailwind permita valores arbitrarios en tu config (Tailwind v3+).
