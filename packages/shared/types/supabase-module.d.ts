declare module '@spoon/shared/lib/supabase' {
  export const supabase: any;
  export const getUserProfile: any;
  export const getUserRestaurant: any;
  export const signInWithGoogle: any;
  export const ensureUserProfileFromSession: any;
  export const getTransaccionesDelDia: any;
  export const getGastosDelDia: any;
  export const getTransaccionesYGastosEnRango: any;
  export const crearGastoCaja: any;
  export const eliminarGastoCaja: any;
  export const getActiveRoles: any;
  export const hasAnyRole: any;
}
