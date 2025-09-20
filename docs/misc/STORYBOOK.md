# Storybook

Archivo original `README.storybook.md` movido aquí.

Uso rápido:
```
npx storybook dev -p 6006
```

Rutas de historias: `packages/shared/components/**/**/*.stories.tsx`

Pendiente: añadir preset de Tailwind y documentación de tokens.

---

## Tailwind en Storybook (preset)

Asegúrate de que Storybook cargue el CSS de Tailwind y tus variables de tokens:

- `packages/shared/.storybook/main.ts`
```ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // ...existing config...
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // Vite: asegura incluir tu CSS global con Tailwind y tokens
  viteFinal: async (config) => {
    // opción A: importar el CSS desde preview.ts
    return config;
  },
};
export default config;
```

- `packages/shared/.storybook/preview.ts`
```ts
import '../src/styles/globals.css'; // contiene @tailwind base/components/utilities y variables --sp-*

export const parameters = {
  controls: { expanded: true },
  a11y: { disable: false },
};
```

## Ejemplo usando tokens

```tsx
export const PrimaryButton = () => (
  <button
    className="px-4 py-2 rounded text-[color:var(--sp-on-primary)] bg-[color:var(--sp-primary-600)] hover:bg-[color:var(--sp-primary-700)] focus:outline-none focus:ring-2 focus:ring-[color:var(--sp-primary-500)]"
  >
    Guardar
  </button>
);
```

Notas:
- Evita clases de color tailwind directas (p.ej. `bg-blue-600`). Usa tokens `--sp-*`.
- Revisa contraste con el addon a11y.
