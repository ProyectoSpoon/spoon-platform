# Informe de Migración UI V2 — Spoon Platform

Fecha: 2025-08-13
Rama de trabajo: refactor/mesas-module-improvement
Repositorio: ProyectoSpoon/spoon-platform

Este informe documenta, con máximo detalle, todas las acciones realizadas durante la iteración de migración a la UI V2: definición y uso de tokens semánticos (CSS variables), aplicación de accesibilidad consistente, dark mode por clase `.dark`, eliminación de “anti-colores” (uso directo de white/black/hex), y refactors en componentes base. Incluye lista exhaustiva de archivos tocados, propósito de cada cambio y verificación de calidad.

---

## 1) Alcance y objetivos

- Unificar la paleta de colores mediante tokens CSS (`--sp-*`).
- Integrar los tokens con Tailwind vía valores arbitrarios (p. ej., `bg-[color:var(--sp-surface)]`).
- Enforzar accesibilidad (focus-visible consistente, contraste, roles ARIA en patrones).
- Habilitar dark mode por clase `.dark` (sin depender solo de media query).
- Prohibir “anti-colores” en clases (white/black/hex) mediante ESLint.
- Migrar tipografías/utilidades globales y barrer componentes base para usar tokens.

---

## 2) Resumen de calidad (estado final)

- Lint: PASS (sin warnings ni errores).
- Tests: PASS (37 suites, 147 tests).
- Build/Typecheck: PASS (Next.js 14, compilación optimizada exitosa).

Validado ejecutando: lint, test y build del monorepo.

---

## 3) Archivos modificados (ruta exacta, propósito y detalles)

A continuación, se listan todos los archivos que modificamos en esta iteración, con el motivo y qué se cambió exactamente.

### 3.1 Estilos globales y tokens

- apps/web/src/app/globals.css
  - Propósito: Fuente de verdad de tokens de color y utilidades base; integración con Tailwind y modo oscuro.
  - Cambios clave:
    - Definición/ampliación de tokens CSS:
      - Superficies y texto:
        - `--sp-surface`, `--sp-surface-elevated`
        - `--sp-on-surface`, `--sp-on-surface-variant`, `--sp-on-surface-inverted`
      - Acciones/estados semánticos:
        - `--sp-on-primary`, `--sp-on-success`, `--sp-on-warning`, `--sp-on-error`, `--sp-on-info`
      - Paleta neutral base (incluye `--sp-neutral-950`) y escala primaria (`--sp-primary-50…900`).
      - Borde, focus y overlay: `--sp-border`, `--sp-focus`, `--sp-overlay`.
    - Dark mode por clase `.dark` con overrides para superficies, texto, borde, focus y overlay.
    - Fallback opcional via `@media (prefers-color-scheme: dark)` cuando no se usa `.dark`.
    - Tipografías/utilidades globales migradas a tokens:
      - `.heading-page`, `.heading-section`, `.subtitle`, `.value-number`, `.label-tertiary`, `.subtle-text` ahora usan `on-surface`/`on-surface-variant`.
    - Componentes utilitarios:
      - `.btn-secondary`, `.input-field` migradas para usar `bg/border/text/focus/placeholder` basados en tokens.
    - Establecidos color de fondo y texto global del `body` con tokens; `* { border-color: var(--sp-border); }`.
    - Lineamientos de uso: clases arbitrarias Tailwind como `bg-[color:var(--sp-surface)]`, `text-[color:var(--sp-on-surface)]`, etc.

### 3.2 Reglas de lint (enforcement anti-colores)

- apps/web/.eslintrc.json
- packages/shared/.eslintrc.json
  - Propósito: Prohibir el uso de clases Tailwind que referencien colores predefinidos (grises/white/black/hex) en `className`.
  - Cambios clave:
    - Bloqueo de `bg|text|border|ring-(white|black)`.
    - Bloqueo de paletas Tailwind tipo `text-gray-700`, `bg-neutral-50`, etc., en JSX.
    - Bloqueo de hex `#000`/`#fff` en literales de `className` (sin afectar archivos TS de tokens/definiciones).
    - Objetivo: forzar el uso de tokens CSS (`var(--sp-...)`) en combinación con Tailwind.

### 3.3 Componentes base y UI compartida

- packages/shared/components/ui/Card/card-title.tsx
  - Propósito: Normalizar color de títulos de tarjeta.
  - Cambio: `text-gray-900` → `text-[color:var(--sp-on-surface)]`.

- packages/shared/components/ui/components/InlineEditButton.tsx
  - Propósito: Eliminar grises directos y aplicar tokens en borde/texto/hover.
  - Cambios: Reemplazo de `border-gray-200`, `text-gray-700`, `hover:bg-gray-100` por equivalentes con `--sp-border`, `--sp-on-surface`, `--sp-neutral-50`/`--sp-neutral-100` según corresponda.

- packages/shared/components/ui/Input/input.tsx
  - Propósito: Unificar tipografías y colores de campo de texto clásico.
  - Cambios: Label/placeholder/helper → `on-surface-variant`; texto principal → `on-surface`; focus y borde usan `--sp-focus` y `--sp-border`.

- packages/shared/components/ui/InputV2/input.tsx
  - Propósito: Alinear el nuevo Input V2 con tokens y a11y.
  - Cambios: Placeholder/label/helper a `on-surface-variant`; variantes `error/success` con tokens semánticos; focus con `--sp-focus`.

- apps/web/src/app/dashboard/caja/pages/modals/ModalProcesarPago.tsx
  - Propósito: Corregir infracción de lint por anti-colores.
  - Cambio: Spinner `border-white` → `border-[color:var(--sp-on-info)]`.

### 3.4 Módulo “Especiales” (páginas)

- apps/web/src/app/dashboard/carta/especiales/page.tsx
  - Propósito: Normalizar superficies, títulos y separadores.
  - Cambios: Fondos a `--sp-surface`/`--sp-surface-elevated`; textos a `--sp-on-surface`/`--sp-on-surface-variant`; bordes a `--sp-border`.

- apps/web/src/app/dashboard/carta/especiales/pages/SpecialesPage.tsx
  - Propósito: Unificación de cabezal y descripciones con tokens.
  - Cambios: Headings y descripciones a `on-surface`/`on-surface-variant`; separadores a `--sp-border`; estados vacíos con tokens de superficie.

- apps/web/src/app/dashboard/carta/especiales/pages/EspecialesCombinationsPage.tsx
  - Propósito: Corrección de clase inválida y normalización.
  - Cambios:
    - Fix: `text-[--sp-on-primary]` → `text-[color:var(--sp-on-primary)]`.
    - Superficies: `--sp-surface`/`--sp-surface-elevated`.
    - Labels/títulos a `on-surface`/`on-surface-variant`; bordes a `--sp-border`.

- apps/web/src/app/dashboard/carta/especiales/pages/index.ts
  - Propósito: Reparar rutas de re-export centralizado.
  - Cambio: `export ... from './pages/...'` → `export ... from './...'` (los archivos son hermanos, no están en subcarpeta adicional).

### 3.5 Autenticación — bugfix de tipado

- apps/web/src/app/auth/useRegister.ts
  - Propósito: Ajustar payload al contrato de `signUpUser`.
  - Cambio: Propiedad `ord` → `password` al invocar `signUpUser({...})` (coincidiendo con `{ email, password, first_name, last_name, phone }`).
  - Efecto: Resuelve error de typecheck en build.

---

## 4) Tokens y convenciones (cómo usarlos)

- Superficies y texto:
  - Fondo base: `bg-[color:var(--sp-surface)]`
  - Fondo elevado: `bg-[color:var(--sp-surface-elevated)]`
  - Texto principal: `text-[color:var(--sp-on-surface)]`
  - Texto secundario: `text-[color:var(--sp-on-surface-variant)]`
- Estados y semánticos:
  - Texto sobre primario/success/warning/error/info: `text-[color:var(--sp-on-<variant>)]`
  - Focus ring: `focus:ring-[color:var(--sp-focus)]`
  - Borde: `border-[color:var(--sp-border)]`
  - Overlay: usar `bg-[color:var(--sp-overlay)]` en scrims/backdrops.
- Modo oscuro:
  - Se activa agregando `.dark` en el contenedor raíz.
  - Los tokens se sobreescriben automáticamente sin cambiar clases.
- Tailwind:
  - Se usan “clases arbitrarias” de color: `bg-[color:var(--sp-...)]`, `text-[color:var(--sp-...)]`, `ring-[color:var(--sp-...)]`.

---

## 5) Lint (anti-colores) — detalle de enforcement

- Prohibidos en className (JSX):
  - `bg|text|border|ring-(white|black)`
  - `text-gray-*`, `bg-neutral-*`, etc. (paletas predefinidas de Tailwind)
  - Literales hex `#000`, `#fff`
- Permitido: uso de tokens CSS con clases arbitrarias.
- Scoped: la regla se limita a literales de className para evitar falsos positivos en archivos TS (definiciones de tokens, etc.).

---

## 6) Validación: ejecución y resultados

- Lint:
  - Resultado: PASS.
  - Nota: se detectó y corrigió un caso (`border-white` en spinner del modal de Caja).
- Tests:
  - Resultado: PASS (37 suites, 147 tests).
  - Cobertura funcional abarca UI base V2 (Buttons/Inputs/Select/Tabs/Tooltip/Popover/Dialog/Drawer/Progress/Skeleton/Spinner/Tables, etc.).
- Build/Typecheck:
  - Primer intento: fallo por `useRegister` (propiedad `ord` desconocida por `signUpUser`).
  - Fix aplicado (usar `password`), segundo build: PASS.
  - Además, se corrigió un error de rutas en `especiales/pages/index.ts`.

---

## 7) Guía de migración rápida (para equipos)

- Sustituir grises/white/black por tokens semánticos.
- Usar `on-surface` para texto primario; `on-surface-variant` para labels/placeholder/helper.
- Mantener `focus` accesible con `--sp-focus` (usando `focus:ring-2` + `ring-[color:var(--sp-focus)]`).
- Superficies: `--sp-surface` como base; `--sp-surface-elevated` para paneles/modales.
- Bordes: `--sp-border`; overlays: `--sp-overlay`.
- Preferir patrones V2 (InputV2/SelectV2/TextareaV2/DialogV2/DrawerV2/TooltipV2/PopoverV2/TabsV2/etc.) donde sea posible.

---

## 8) Observaciones y próximos pasos (opcionales)

- Storybook: alinear historias/temas con tokens V2 (cuando se habilite nuevamente).
- Turborepo: sugerida actualización (mensaje informativo indica v1.13.4 → v2.5.5). No se aplicó en esta iteración.
- Monitoreo: mantener lint estricto para prevenir regresiones de “anti-colores”.

---

## 9) Anexos: lista rápida de verificación cumplida

- [x] Tokens base en `globals.css` (incluye `on-surface-variant`, `neutral-950`).
- [x] Utilidades tipográficas globales a `on-surface`/`on-surface-variant`.
- [x] Regla de lint anti-colores aplicada (white/black/hex/paletas Tailwind directas).
- [x] Barrido de UI base: eliminación de anti-colores y uso de tokens.
- [x] Correcciones en módulo “Especiales”.
- [x] Fix de build en `useRegister` y ruta en `especiales/pages/index.ts`.

---

¿Dudas o quieres que genere un checklist de migración por módulo adicional? 

## 10) Tabla resumen de cambios por componente (antes → después)

| Archivo | Ruta | Antes (clases/uso) | Después (clases/uso) | Motivo |
|---|---|---|---|---|
| Card Title | packages/shared/components/ui/Card/card-title.tsx | text-gray-900 | text-[color:var(--sp-on-surface)] | Usar token de texto principal en superficies |
| InlineEditButton | packages/shared/components/ui/components/InlineEditButton.tsx | border-gray-200, text-gray-700, hover:bg-gray-100 | border-[color:var(--sp-border)], text-[color:var(--sp-on-surface)], hover:bg-[color:var(--sp-neutral-50)] | Eliminar grises directos y alinear a tokens |
| Input (legacy) | packages/shared/components/ui/Input/input.tsx | Label/placeholder/helper en grises; focus/border genéricos | Label/placeholder/helper → text-[color:var(--sp-on-surface-variant)]; border-[color:var(--sp-border)]; focus:ring-[color:var(--sp-focus)] | Tipografía y a11y consistentes |
| InputV2 | packages/shared/components/ui/InputV2/input.tsx | Placeholder/label en grises; focus genérico | Tokens para placeholder/label/helper; variantes error/success con border/ring semánticos; focus con --sp-focus | Coherencia V2 + estados semánticos |
| Spinner (ModalProcesarPago) | apps/web/src/app/dashboard/caja/pages/modals/ModalProcesarPago.tsx | border-white | border-[color:var(--sp-on-info)] | Cumplir anti-colores y mejorar contraste |
| Especiales (root page) | apps/web/src/app/dashboard/carta/especiales/page.tsx | Fondos/textos/bordes con grises | bg-[color:var(--sp-surface[/-elevated])], text-[color:var(--sp-on-surface[/-variant])], border-[color:var(--sp-border)] | Tokenización integral del módulo |
| SpecialesPage | apps/web/src/app/dashboard/carta/especiales/pages/SpecialesPage.tsx | Headings/descr. con grises; separadores genéricos | Headings → on-surface; descr. → on-surface-variant; separadores → --sp-border | Legibilidad y consistencia |
| EspecialesCombinationsPage | apps/web/src/app/dashboard/carta/especiales/pages/EspecialesCombinationsPage.tsx | text-[--sp-on-primary] (sintaxis inválida); grises varios | text-[color:var(--sp-on-primary)]; superficies/bordes/títulos con tokens | Corregir sintaxis y alinear tokens |
| Exports Especiales | apps/web/src/app/dashboard/carta/especiales/pages/index.ts | export desde './pages/...'(ruta incorrecta) | export desde './...' (archivos hermanos) | Fix de rutas para build |
| Globals (tokens/utilidades) | apps/web/src/app/globals.css | Utilidades previas no tokenizadas; tokens incompletos | Tokens completos (surfaces/on-*/border/focus/overlay/neutral-950); utilidades tipográficas y de inputs/botones a tokens; dark mode `.dark` | Base de Design System y dark mode |
| useRegister (funcional) | apps/web/src/app/auth/useRegister.ts | Payload a signUpUser con `ord` | Payload a signUpUser con `password` | Compatibilidad de tipos y build PASS |

Notas rápidas de uso de tokens:
- Texto primario/secundario: `text-[color:var(--sp-on-surface)]` / `text-[color:var(--sp-on-surface-variant)]`.
- Superficies: `bg-[color:var(--sp-surface)]` y `bg-[color:var(--sp-surface-elevated)]`.
- Borde/focus: `border-[color:var(--sp-border)]`, `focus:ring-[color:var(--sp-focus)]`.
- Estados: `text-[color:var(--sp-on-primary|success|warning|error|info)]` según caso.

# Inventario de archivos: C:\spoon-platform\packages

Este informe lista cada archivo dentro de C:\spoon-platform\packages con su ruta, nombre y función.

Leyenda abreviada:
- stories: ejemplos de Storybook
- tests: pruebas unitarias con RTL/Jest
- barrel: re-exporta módulos desde un índice

## edge-functions

- Ruta: C:\spoon-platform\packages\edge-functions\analytics\ — Nombre: (carpeta) — Función: placeholder para funciones edge de analítica (vacía).
- Ruta: C:\spoon-platform\packages\edge-functions\billing\ — Nombre: (carpeta) — Función: placeholder para funciones edge de facturación (vacía).
- Ruta: C:\spoon-platform\packages\edge-functions\menu-generator\ — Nombre: (carpeta) — Función: placeholder para generación de menús (vacía).
- Ruta: C:\spoon-platform\packages\edge-functions\onboarding\ — Nombre: (carpeta) — Función: placeholder para onboarding (vacía).
- Ruta: C:\spoon-platform\packages\edge-functions\search-engine\ — Nombre: (carpeta) — Función: placeholder para funciones de búsqueda (vacía).

## integrations

- Ruta: C:\spoon-platform\packages\integrations\crm\ — Nombre: (carpeta) — Función: punto de integración con CRM (vacía).
- Ruta: C:\spoon-platform\packages\integrations\notifications\ — Nombre: (carpeta) — Función: integraciones de notificaciones (vacía).
- Ruta: C:\spoon-platform\packages\integrations\payments\ — Nombre: (carpeta) — Función: integraciones de pago (vacía).

## shared (paquete compartido)

Top-level
- Ruta: C:\spoon-platform\packages\shared\.eslintrc.json — Nombre: .eslintrc.json — Función: configuración de ESLint del paquete.
- Ruta: C:\spoon-platform\packages\shared\client-hooks.ts — Nombre: client-hooks.ts — Función: re-exporta hooks de cliente (use client), p.ej. useCajaSesion.
- Ruta: C:\spoon-platform\packages\shared\index.ts — Nombre: index.ts — Función: barrel principal; exporta UI V2, patrones, utils, tipos y módulos de caja.
- Ruta: C:\spoon-platform\packages\shared\package.json — Nombre: package.json — Función: metadatos del paquete @spoon/shared, dependencias y scripts.
- Ruta: C:\spoon-platform\packages\shared\.turbo\turbo-lint.log — Nombre: turbo-lint.log — Función: log de Turbo para tareas de lint.

### __tests__ (pruebas)
- Ruta: C:\spoon-platform\packages\shared\__tests__\hooks\mesas\hooks-simplified.test.ts — Nombre: hooks-simplified.test.ts — Función: tests simplificados de hooks de mesas.
- Ruta: C:\spoon-platform\packages\shared\__tests__\hooks\mesas\integration.test.ts — Nombre: integration.test.ts — Función: pruebas de integración de hooks de mesas.
- Ruta: C:\spoon-platform\packages\shared\__tests__\hooks\mesas\useMesaActions.test.ts — Nombre: useMesaActions.test.ts — Función: tests de acciones de mesa.
- Ruta: C:\spoon-platform\packages\shared\__tests__\hooks\mesas\useMesaState.test.ts — Nombre: useMesaState.test.ts — Función: tests del estado de mesa.
- Ruta: C:\spoon-platform\packages\shared\__tests__\setup\config.test.ts — Nombre: config.test.ts — Función: configuración/fixtures de pruebas.
- Ruta: C:\spoon-platform\packages\shared\__tests__\types\mesas\ — Nombre: (carpeta) — Función: placeholder para tipos de pruebas (vacía).
- Ruta: C:\spoon-platform\packages\shared\__tests__\utils\mesas\formatters.test.ts — Nombre: formatters.test.ts — Función: tests de formateadores de mesas.
- Ruta: C:\spoon-platform\packages\shared\__tests__\utils\mesas\mesaFormatters.test.ts — Nombre: mesaFormatters.test.ts — Función: tests adicionales de formateadores.
- Ruta: C:\spoon-platform\packages\shared\__tests__\utils\mesas\mesaStateUtils.test.ts — Nombre: mesaStateUtils.test.ts — Función: tests utilidades de estado de mesas.
- Ruta: C:\spoon-platform\packages\shared\__tests__\utils\mesas\mesaValidators.test.ts — Nombre: mesaValidators.test.ts — Función: tests de validadores de mesas.

### caja
- Ruta: C:\spoon-platform\packages\shared\caja\constants\cajaConstants.ts — Nombre: cajaConstants.ts — Función: constantes de caja (config, mensajes, formatos).
- Ruta: C:\spoon-platform\packages\shared\caja\constants\index.ts — Nombre: index.ts — Función: barrel de constantes de caja.
- Ruta: C:\spoon-platform\packages\shared\caja\hooks\index.ts — Nombre: index.ts — Función: barrel de hooks de caja.
- Ruta: C:\spoon-platform\packages\shared\caja\hooks\useCajaSesion.ts — Nombre: useCajaSesion.ts — Función: hook de sesión/estado del módulo caja.

### components/caja
- Ruta: C:\spoon-platform\packages\shared\components\caja\AccionesPrincipales.tsx — Nombre: AccionesPrincipales.tsx — Función: componente de acciones principales de caja.
- Ruta: C:\spoon-platform\packages\shared\components\caja\SidebarResumen.tsx — Nombre: SidebarResumen.tsx — Función: sidebar/resumen del módulo caja.

### components/mesas
- Ruta: C:\spoon-platform\packages\shared\components\mesas\ConfiguracionMesasModal.tsx — Nombre: ConfiguracionMesasModal.tsx — Función: modal para configurar mesas.
- Ruta: C:\spoon-platform\packages\shared\components\mesas\CrearOrdenWizard.tsx — Nombre: CrearOrdenWizard.tsx — Función: wizard para crear órdenes desde mesas.
- Ruta: C:\spoon-platform\packages\shared\components\mesas\configuration\ — Nombre: (carpeta) — Función: placeholder de vistas de configuración (vacía).
- Ruta: C:\spoon-platform\packages\shared\components\mesas\core\ — Nombre: (carpeta) — Función: placeholder de componentes base (vacía).
- Ruta: C:\spoon-platform\packages\shared\components\mesas\details\ — Nombre: (carpeta) — Función: placeholder de vistas de detalle (vacía).
- Ruta: C:\spoon-platform\packages\shared\components\mesas\wizards\ — Nombre: (carpeta) — Función: placeholder de wizards (vacía).

### components/ui (biblioteca de UI)
- Ruta: C:\spoon-platform\packages\shared\components\ui\ActionBar\index.tsx — Nombre: index.tsx — Función: ActionBar (legacy), implementación.
- Ruta: C:\spoon-platform\packages\shared\components\ui\ActionBarV2\action-bar.tsx — Nombre: action-bar.tsx — Función: ActionBar V2 (implementación).
- Ruta: C:\spoon-platform\packages\shared\components\ui\ActionBarV2\action-bar.test.tsx — Nombre: action-bar.test.tsx — Función: tests.
- Ruta: C:\spoon-platform\packages\shared\components\ui\ActionBarV2\ActionBarV2.stories.tsx — Nombre: ActionBarV2.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\ActionBarV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\AlertV2\alert.tsx — Nombre: alert.tsx — Función: componente Alert V2.
- Ruta: C:\spoon-platform\packages\shared\components\ui\AlertV2\AlertV2.stories.tsx — Nombre: AlertV2.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\AlertV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\AvatarV2\avatar.tsx — Nombre: avatar.tsx — Función: componente Avatar V2.
- Ruta: C:\spoon-platform\packages\shared\components\ui\AvatarV2\avatar.test.tsx — Nombre: avatar.test.tsx — Función: tests.
- Ruta: C:\spoon-platform\packages\shared\components\ui\AvatarV2\avatar.stories.tsx — Nombre: avatar.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\AvatarV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\BadgeV2\badge.tsx — Nombre: badge.tsx — Función: componente Badge V2.
- Ruta: C:\spoon-platform\packages\shared\components\ui\BadgeV2\BadgeV2.stories.tsx — Nombre: BadgeV2.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\BadgeV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\BreadcrumbV2\breadcrumb.tsx — Nombre: breadcrumb.tsx — Función: componente Breadcrumb V2.
- Ruta: C:\spoon-platform\packages\shared\components\ui\BreadcrumbV2\breadcrumb.test.tsx — Nombre: breadcrumb.test.tsx — Función: tests.
- Ruta: C:\spoon-platform\packages\shared\components\ui\BreadcrumbV2\breadcrumb.stories.tsx — Nombre: breadcrumb.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\BreadcrumbV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\Button\button.tsx — Nombre: button.tsx — Función: Button (legacy).
- Ruta: C:\spoon-platform\packages\shared\components\ui\Button\button.types.ts — Nombre: button.types.ts — Función: tipados del Button legacy.
- Ruta: C:\spoon-platform\packages\shared\components\ui\Button\Button.stories.tsx — Nombre: Button.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\Button\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\ButtonV2\button.tsx — Nombre: button.tsx — Función: Button V2.
- Ruta: C:\spoon-platform\packages\shared\components\ui\ButtonV2\button.test.tsx — Nombre: button.test.tsx — Función: tests.
- Ruta: C:\spoon-platform\packages\shared\components\ui\ButtonV2\ButtonV2.stories.tsx — Nombre: ButtonV2.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\ButtonV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\Card\card.tsx — Nombre: card.tsx — Función: contenedor Card base.
- Ruta: C:\spoon-platform\packages\shared\components\ui\Card\card-content.tsx — Nombre: card-content.tsx — Función: subcomponente contenido.
- Ruta: C:\spoon-platform\packages\shared\components\ui\Card\card-description.tsx — Nombre: card-description.tsx — Función: subcomponente descripción.
- Ruta: C:\spoon-platform\packages\shared\components\ui\Card\card-header.tsx — Nombre: card-header.tsx — Función: subcomponente header.
- Ruta: C:\spoon-platform\packages\shared\components\ui\Card\card-title.tsx — Nombre: card-title.tsx — Función: subcomponente título.
- Ruta: C:\spoon-platform\packages\shared\components\ui\Card\index.ts — Nombre: index.ts — Función: barrel.
- Ruta: C:\spoon-platform\packages\shared\components\ui\Card\types.ts — Nombre: types.ts — Función: tipados de Card.

- Ruta: C:\spoon-platform\packages\shared\components\ui\CheckboxGroupV2\checkbox-group.tsx — Nombre: checkbox-group.tsx — Función: CheckboxGroup V2.
- Ruta: C:\spoon-platform\packages\shared\components\ui\CheckboxGroupV2\checkbox-group.test.tsx — Nombre: checkbox-group.test.tsx — Función: tests.
- Ruta: C:\spoon-platform\packages\shared\components\ui\CheckboxGroupV2\CheckboxGroupV2.stories.tsx — Nombre: CheckboxGroupV2.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\CheckboxGroupV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\CheckboxV2\checkbox.tsx — Nombre: checkbox.tsx — Función: Checkbox V2.
- Ruta: C:\spoon-platform\packages\shared\components\ui\CheckboxV2\checkbox.test.tsx — Nombre: checkbox.test.tsx — Función: tests.
- Ruta: C:\spoon-platform\packages\shared\components\ui\CheckboxV2\CheckboxV2.stories.tsx — Nombre: CheckboxV2.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\CheckboxV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\components\FormCard.tsx — Nombre: FormCard.tsx — Función: tarjeta de formulario compuesta.
- Ruta: C:\spoon-platform\packages\shared\components\ui\components\GeneralInfoForm.tsx — Nombre: GeneralInfoForm.tsx — Función: formulario de info general.
- Ruta: C:\spoon-platform\packages\shared\components\ui\components\InlineEditButton.tsx — Nombre: InlineEditButton.tsx — Función: botón utilitario para edición inline.
- Ruta: C:\spoon-platform\packages\shared\components\ui\components\UbicacionForm.tsx — Nombre: UbicacionForm.tsx — Función: formulario de ubicación.

- Ruta: C:\spoon-platform\packages\shared\components\ui\DatePickerV2\date-picker.tsx — Nombre: date-picker.tsx — Función: selector de fecha V2.
- Ruta: C:\spoon-platform\packages\shared\components\ui\DatePickerV2\date-picker.test.tsx — Nombre: date-picker.test.tsx — Función: tests.
- Ruta: C:\spoon-platform\packages\shared\components\ui\DatePickerV2\DatePickerV2.stories.tsx — Nombre: DatePickerV2.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\DatePickerV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\DialogV2\dialog.tsx — Nombre: dialog.tsx — Función: diálogo modal V2.
- Ruta: C:\spoon-platform\packages\shared\components\ui\DialogV2\dialog.test.tsx — Nombre: dialog.test.tsx — Función: tests.
- Ruta: C:\spoon-platform\packages\shared\components\ui\DialogV2\dialog.stories.tsx — Nombre: dialog.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\DialogV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\DrawerV2\drawer.tsx — Nombre: drawer.tsx — Función: cajón lateral V2.
- Ruta: C:\spoon-platform\packages\shared\components\ui\DrawerV2\drawer.test.tsx — Nombre: drawer.test.tsx — Función: tests.
- Ruta: C:\spoon-platform\packages\shared\components\ui\DrawerV2\drawer.stories.tsx — Nombre: drawer.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\DrawerV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\DropdownV2\dropdown.tsx — Nombre: dropdown.tsx — Función: dropdown/menú V2.
- Ruta: C:\spoon-platform\packages\shared\components\ui\DropdownV2\dropdown.test.tsx — Nombre: dropdown.test.tsx — Función: tests.
- Ruta: C:\spoon-platform\packages\shared\components\ui\DropdownV2\dropdown.stories.tsx — Nombre: dropdown.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\DropdownV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\FileInputV2\file-input.tsx — Nombre: file-input.tsx — Función: input de archivo V2.
- Ruta: C:\spoon-platform\packages\shared\components\ui\FileInputV2\file-input.test.tsx — Nombre: file-input.test.tsx — Función: tests.
- Ruta: C:\spoon-platform\packages\shared\components\ui\FileInputV2\FileInputV2.stories.tsx — Nombre: FileInputV2.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\FileInputV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\Grid\Grid.tsx — Nombre: Grid.tsx — Función: sistema de grid simple.
- Ruta: C:\spoon-platform\packages\shared\components\ui\Grid\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\hooks\useRestaurantForm.ts — Nombre: useRestaurantForm.ts — Función: hook para formularios de restaurante.

- Ruta: C:\spoon-platform\packages\shared\components\ui\Input\input.tsx — Nombre: input.tsx — Función: Input legacy.
- Ruta: C:\spoon-platform\packages\shared\components\ui\Input\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\InputV2\input.tsx — Nombre: input.tsx — Función: Input V2.
- Ruta: C:\spoon-platform\packages\shared\components\ui\InputV2\input.test.tsx — Nombre: input.test.tsx — Función: tests.
- Ruta: C:\spoon-platform\packages\shared\components\ui\InputV2\InputV2.stories.tsx — Nombre: InputV2.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\InputV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\MenuV2\menu.tsx — Nombre: menu.tsx — Función: menú contextual V2.
- Ruta: C:\spoon-platform\packages\shared\components\ui\MenuV2\menu.test.tsx — Nombre: menu.test.tsx — Función: tests.
- Ruta: C:\spoon-platform\packages\shared\components\ui\MenuV2\menu.stories.tsx — Nombre: menu.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\MenuV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\PaginationV2\pagination.tsx — Nombre: pagination.tsx — Función: paginación V2.
- Ruta: C:\spoon-platform\packages\shared\components\ui\PaginationV2\pagination.test.tsx — Nombre: pagination.test.tsx — Función: tests.
- Ruta: C:\spoon-platform\packages\shared\components\ui\PaginationV2\pagination.stories.tsx — Nombre: pagination.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\PaginationV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\PopoverV2\popover.tsx — Nombre: popover.tsx — Función: popover V2.
- Ruta: C:\spoon-platform\packages\shared\components\ui\PopoverV2\popover.test.tsx — Nombre: popover.test.tsx — Función: tests.
- Ruta: C:\spoon-platform\packages\shared\components\ui\PopoverV2\popover.stories.tsx — Nombre: popover.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\PopoverV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\Progress\progress.tsx — Nombre: progress.tsx — Función: barra de progreso legacy.
- Ruta: C:\spoon-platform\packages\shared\components\ui\Progress\types.ts — Nombre: types.ts — Función: tipados de Progress legacy.
- Ruta: C:\spoon-platform\packages\shared\components\ui\Progress\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\ProgressV2\progress.tsx — Nombre: progress.tsx — Función: barra de progreso V2.
- Ruta: C:\spoon-platform\packages\shared\components\ui\ProgressV2\progress.test.tsx — Nombre: progress.test.tsx — Función: tests.
- Ruta: C:\spoon-platform\packages\shared\components\ui\ProgressV2\ProgressV2.stories.tsx — Nombre: ProgressV2.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\ProgressV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\RadioGroupV2\radio-group.tsx — Nombre: radio-group.tsx — Función: grupo de radio V2.
- Ruta: C:\spoon-platform\packages\shared\components\ui\RadioGroupV2\radio-group.test.tsx — Nombre: radio-group.test.tsx — Función: tests.
- Ruta: C:\spoon-platform\packages\shared\components\ui\RadioGroupV2\RadioGroupV2.stories.tsx — Nombre: RadioGroupV2.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\RadioGroupV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\RadioV2\radio.tsx — Nombre: radio.tsx — Función: radio V2.
- Ruta: C:\spoon-platform\packages\shared\components\ui\RadioV2\index.ts — Nombre: index.ts — Función: barrel.
- Ruta: C:\spoon-platform\packages\shared\components\ui\RadioV2\RadioV2.stories.tsx — Nombre: RadioV2.stories.tsx — Función: stories.

- Ruta: C:\spoon-platform\packages\shared\components\ui\SelectV2\select.tsx — Nombre: select.tsx — Función: select V2.
- Ruta: C:\spoon-platform\packages\shared\components\ui\SelectV2\select.test.tsx — Nombre: select.test.tsx — Función: tests.
- Ruta: C:\spoon-platform\packages\shared\components\ui\SelectV2\SelectV2.stories.tsx — Nombre: SelectV2.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\SelectV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\SkeletonV2\skeleton.tsx — Nombre: skeleton.tsx — Función: esqueleto/placeholder V2.
- Ruta: C:\spoon-platform\packages\shared\components\ui\SkeletonV2\skeleton.test.tsx — Nombre: skeleton.test.tsx — Función: tests.
- Ruta: C:\spoon-platform\packages\shared\components\ui\SkeletonV2\skeleton.stories.tsx — Nombre: skeleton.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\SkeletonV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\SpinnerV2\spinner.tsx — Nombre: spinner.tsx — Función: spinner V2.
- Ruta: C:\spoon-platform\packages\shared\components\ui\SpinnerV2\SpinnerV2.stories.tsx — Nombre: SpinnerV2.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\SpinnerV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\SwitchV2\switch.tsx — Nombre: switch.tsx — Función: switch/toggle V2.
- Ruta: C:\spoon-platform\packages\shared\components\ui\SwitchV2\switch.test.tsx — Nombre: switch.test.tsx — Función: tests.
- Ruta: C:\spoon-platform\packages\shared\components\ui\SwitchV2\SwitchV2.stories.tsx — Nombre: SwitchV2.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\SwitchV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\TableV2\table.tsx — Nombre: table.tsx — Función: tabla V2.
- Ruta: C:\spoon-platform\packages\shared\components\ui\TableV2\table.test.tsx — Nombre: table.test.tsx — Función: tests.
- Ruta: C:\spoon-platform\packages\shared\components\ui\TableV2\table.stories.tsx — Nombre: table.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\TableV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\Tabs\tabs.tsx — Nombre: tabs.tsx — Función: Tabs legacy.
- Ruta: C:\spoon-platform\packages\shared\components\ui\Tabs\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\TabsV2\tabs.tsx — Nombre: tabs.tsx — Función: Tabs V2.
- Ruta: C:\spoon-platform\packages\shared\components\ui\TabsV2\tabs.test.tsx — Nombre: tabs.test.tsx — Función: tests.
- Ruta: C:\spoon-platform\packages\shared\components\ui\TabsV2\TabsV2.stories.tsx — Nombre: TabsV2.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\TabsV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\TextareaV2\textarea.tsx — Nombre: textarea.tsx — Función: textarea V2.
- Ruta: C:\spoon-platform\packages\shared\components\ui\TextareaV2\textarea.test.tsx — Nombre: textarea.test.tsx — Función: tests.
- Ruta: C:\spoon-platform\packages\shared\components\ui\TextareaV2\TextareaV2.stories.tsx — Nombre: TextareaV2.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\TextareaV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\TimePickerV2\time-picker.tsx — Nombre: time-picker.tsx — Función: selector de hora V2.
- Ruta: C:\spoon-platform\packages\shared\components\ui\TimePickerV2\time-picker.test.tsx — Nombre: time-picker.test.tsx — Función: tests.
- Ruta: C:\spoon-platform\packages\shared\components\ui\TimePickerV2\TimePickerV2.stories.tsx — Nombre: TimePickerV2.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\TimePickerV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\Toast\toast.tsx — Nombre: toast.tsx — Función: API de notificaciones/toast.
- Ruta: C:\spoon-platform\packages\shared\components\ui\Toast\toaster.tsx — Nombre: toaster.tsx — Función: host/contenedor de toasts.
- Ruta: C:\spoon-platform\packages\shared\components\ui\Toast\use-toast.tsx — Nombre: use-toast.tsx — Función: hook para disparar toasts.
- Ruta: C:\spoon-platform\packages\shared\components\ui\Toast\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\TooltipV2\tooltip.tsx — Nombre: tooltip.tsx — Función: tooltip V2.
- Ruta: C:\spoon-platform\packages\shared\components\ui\TooltipV2\tooltip.test.tsx — Nombre: tooltip.test.tsx — Función: tests.
- Ruta: C:\spoon-platform\packages\shared\components\ui\TooltipV2\tooltip.stories.tsx — Nombre: tooltip.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\components\ui\TooltipV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\components\ui\utils\useSaveFeedback.ts — Nombre: useSaveFeedback.ts — Función: hook utilitario de feedback.

### constants
- Ruta: C:\spoon-platform\packages\shared\constants\index.ts — Nombre: index.ts — Función: barrel central de constantes.
- Ruta: C:\spoon-platform\packages\shared\constants\menu-dia\menuConstants.ts — Nombre: menuConstants.ts — Función: constantes del módulo Menú del Día.
- Ruta: C:\spoon-platform\packages\shared\constants\mesas\index.ts — Nombre: index.ts — Función: barrel de constantes de mesas.
- Ruta: C:\spoon-platform\packages\shared\constants\mesas\mesasConstants.ts — Nombre: mesasConstants.ts — Función: constantes de negocio de mesas.
- Ruta: C:\spoon-platform\packages\shared\constants\mesas\stateConstants.ts — Nombre: stateConstants.ts — Función: constantes/estados de máquina de mesas.
- Ruta: C:\spoon-platform\packages\shared\constants\special-dishes\specialDishConstants.ts — Nombre: specialDishConstants.ts — Función: constantes de especiales.

### Context
- Ruta: C:\spoon-platform\packages\shared\Context\notification-context.tsx — Nombre: notification-context.tsx — Función: contexto de notificaciones.
- Ruta: C:\spoon-platform\packages\shared\Context\page-title-context.tsx — Nombre: page-title-context.tsx — Función: contexto de título de página.
- Ruta: C:\spoon-platform\packages\shared\Context\user-context.tsx — Nombre: user-context.tsx — Función: contexto de usuario.

### hooks
- Ruta: C:\spoon-platform\packages\shared\hooks\menu-dia\useMenuData.ts — Nombre: useMenuData.ts — Función: datos de Menú del Día.
- Ruta: C:\spoon-platform\packages\shared\hooks\menu-dia\useMenuState.ts — Nombre: useMenuState.ts — Función: estado de Menú del Día.
- Ruta: C:\spoon-platform\packages\shared\hooks\mesas\core\index.ts — Nombre: index.ts — Función: barrel de hooks core de mesas.
- Ruta: C:\spoon-platform\packages\shared\hooks\mesas\core\useMesaActions.ts — Nombre: useMesaActions.ts — Función: acciones/comandos sobre mesa.
- Ruta: C:\spoon-platform\packages\shared\hooks\mesas\core\useMesaConfig.ts — Nombre: useMesaConfig.ts — Función: configuración de mesa.
- Ruta: C:\spoon-platform\packages\shared\hooks\mesas\core\useMesaState.ts — Nombre: useMesaState.ts — Función: estado (store/reducer) de mesa.
- Ruta: C:\spoon-platform\packages\shared\hooks\mesas\core\useMesaStats.ts — Nombre: useMesaStats.ts — Función: estadísticas/derivados.
- Ruta: C:\spoon-platform\packages\shared\hooks\mesas\details\index.ts — Nombre: index.ts — Función: barrel de hooks de detalles.
- Ruta: C:\spoon-platform\packages\shared\hooks\mesas\details\useMesaDetails.ts — Nombre: useMesaDetails.ts — Función: detalles/datos de mesa.
- Ruta: C:\spoon-platform\packages\shared\hooks\mesas\index.ts — Nombre: index.ts — Función: barrel general de hooks de mesas.
- Ruta: C:\spoon-platform\packages\shared\hooks\mesas\useMesas.ts — Nombre: useMesas.ts — Función: hook de alto nivel de mesas.
- Ruta: C:\spoon-platform\packages\shared\hooks\special-dishes\useSpecialData.ts — Nombre: useSpecialData.ts — Función: datos de especiales.

### lib
- Ruta: C:\spoon-platform\packages\shared\lib\errorHandling.ts — Nombre: errorHandling.ts — Función: utilidades de manejo de errores.
- Ruta: C:\spoon-platform\packages\shared\lib\supabase.ts — Nombre: supabase.ts — Función: cliente Supabase + tipos + cache TTL dedupe.
- Ruta: C:\spoon-platform\packages\shared\lib\useAriaHiddenOthers.ts — Nombre: useAriaHiddenOthers.ts — Función: hook a11y para ocultar otros nodos.
- Ruta: C:\spoon-platform\packages\shared\lib\useScrollLock.ts — Nombre: useScrollLock.ts — Función: hook de bloqueo de scroll.
- Ruta: C:\spoon-platform\packages\shared\lib\utils.ts — Nombre: utils.ts — Función: utilidades comunes (cn, currency helpers).

### patterns
- Ruta: C:\spoon-platform\packages\shared\patterns\FormControlV2\FormControlV2.tsx — Nombre: FormControlV2.tsx — Función: contenedor de campo con label/ayuda/error.
- Ruta: C:\spoon-platform\packages\shared\patterns\FormControlV2\FormControlV2.test.tsx — Nombre: FormControlV2.test.tsx — Función: tests.
- Ruta: C:\spoon-platform\packages\shared\patterns\FormControlV2\FormControlV2.stories.tsx — Nombre: FormControlV2.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\patterns\FormControlV2\index.ts — Nombre: index.ts — Función: barrel.

- Ruta: C:\spoon-platform\packages\shared\patterns\FormFieldsV2\index.ts — Nombre: index.ts — Función: barrel de campos precompuestos.
- Ruta: C:\spoon-platform\packages\shared\patterns\FormFieldsV2\FormFieldsV2.stories.tsx — Nombre: FormFieldsV2.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\patterns\FormFieldsV2\FormFieldWrappers.stories.tsx — Nombre: FormFieldWrappers.stories.tsx — Función: stories de envoltorios.
- Ruta: C:\spoon-platform\packages\shared\patterns\FormFieldsV2\presets\EmailField.tsx — Nombre: EmailField.tsx — Función: campo email preconfigurado.
- Ruta: C:\spoon-platform\packages\shared\patterns\FormFieldsV2\presets\InputFieldV2.tsx — Nombre: InputFieldV2.tsx — Función: campo input genérico V2.
- Ruta: C:\spoon-platform\packages\shared\patterns\FormFieldsV2\presets\PasswordField.tsx — Nombre: PasswordField.tsx — Función: campo contraseña preconfigurado.
- Ruta: C:\spoon-platform\packages\shared\patterns\FormFieldsV2\presets\SelectFieldV2.tsx — Nombre: SelectFieldV2.tsx — Función: campo select preconfigurado.
- Ruta: C:\spoon-platform\packages\shared\patterns\FormFieldsV2\presets\TextareaFieldV2.tsx — Nombre: TextareaFieldV2.tsx — Función: campo textarea preconfigurado.

- Ruta: C:\spoon-platform\packages\shared\patterns\FormSection\FormSection.tsx — Nombre: FormSection.tsx — Función: sección de formularios (layout y título).
- Ruta: C:\spoon-platform\packages\shared\patterns\FormSection\FormSection.stories.tsx — Nombre: FormSection.stories.tsx — Función: stories.
- Ruta: C:\spoon-platform\packages\shared\patterns\FormSection\index.ts — Nombre: index.ts — Función: barrel.

### services
- Ruta: C:\spoon-platform\packages\shared\services\menu-dia\menuApiService.ts — Nombre: menuApiService.ts — Función: llamadas API de Menú del Día.
- Ruta: C:\spoon-platform\packages\shared\services\restaurant.ts — Nombre: restaurant.ts — Función: servicio de datos de restaurante.

### tokens (design system)
- Ruta: C:\spoon-platform\packages\shared\tokens\colors.ts — Nombre: colors.ts — Función: tokens de color.
- Ruta: C:\spoon-platform\packages\shared\tokens\spacing.ts — Nombre: spacing.ts — Función: tokens de espaciado.
- Ruta: C:\spoon-platform\packages\shared\tokens\typography.ts — Nombre: typography.ts — Función: tokens tipográficos.
- Ruta: C:\spoon-platform\packages\shared\tokens\index.ts — Nombre: index.ts — Función: barrel de tokens.

### types
- Ruta: C:\spoon-platform\packages\shared\types\index.ts — Nombre: index.ts — Función: barrel de tipos compartidos.
- Ruta: C:\spoon-platform\packages\shared\types\facturacion\facturaTypes.ts — Nombre: facturaTypes.ts — Función: tipos de facturación.
- Ruta: C:\spoon-platform\packages\shared\types\menu-dia\menuTypes.ts — Nombre: menuTypes.ts — Función: tipos de Menú del Día.
- Ruta: C:\spoon-platform\packages\shared\types\mesas\actionTypes.ts — Nombre: actionTypes.ts — Función: tipos de acciones de mesas.
- Ruta: C:\spoon-platform\packages\shared\types\mesas\index.ts — Nombre: index.ts — Función: barrel de tipos de mesas.
- Ruta: C:\spoon-platform\packages\shared\types\mesas\mesasTypes.ts — Nombre: mesasTypes.ts — Función: tipos de entidad de mesa.
- Ruta: C:\spoon-platform\packages\shared\types\mesas\stateTypes.ts — Nombre: stateTypes.ts — Función: tipos de estado de mesas.
- Ruta: C:\spoon-platform\packages\shared\types\special-dishes\specialDishTypes.ts — Nombre: specialDishTypes.ts — Función: tipos de platos especiales.

### utils
- Ruta: C:\spoon-platform\packages\shared\utils\mesas\index.ts — Nombre: index.ts — Función: barrel de utilidades de mesas.
- Ruta: C:\spoon-platform\packages\shared\utils\mesas\mesaFormatters.ts — Nombre: mesaFormatters.ts — Función: formateadores de visualización de mesas.
- Ruta: C:\spoon-platform\packages\shared\utils\mesas\mesaStateUtils.ts — Nombre: mesaStateUtils.ts — Función: utilidades de estado de mesas.
- Ruta: C:\spoon-platform\packages\shared\utils\mesas\mesaValidators.ts — Nombre: mesaValidators.ts — Función: validadores de datos/acciones de mesa.

### validations
- Ruta: C:\spoon-platform\packages\shared\validations\ — Nombre: (carpeta) — Función: placeholder para esquemas/validaciones (vacía).
