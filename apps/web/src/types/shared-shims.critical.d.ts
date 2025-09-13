// Shims para permitir typecheck de Caja/Domicilios sin arrastrar tipos reales de @spoon/shared
declare module '@spoon/shared' {
  export const toast: any;
  export const Toaster: any;
  export const useToast: any;
  export const Tabs: any;
  export const Button: any;
  export const DialogV2: any;
  export const SelectV2: any;
  export const SwitchV2: any;
  export const Card: any;
}

declare module '@spoon/shared/*' {
  const mod: any;
  export = mod;
}

declare module 'packages/*' {
  const mod: any;
  export = mod;
}