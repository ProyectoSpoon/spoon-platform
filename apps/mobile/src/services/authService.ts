// src/services/authService.ts
// Implementación real usando Supabase (reemplaza el mock previo)

import {
  signUp as supaSignUp,
  signIn as supaSignIn,
  signOut as supaSignOut,
  getCurrentUser as supaGetCurrentUser,
} from '../lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
}

export interface SignUpResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

export interface SignInResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

export interface SignOutResult {
  success: boolean;
  error?: string;
}

const mapSupabaseUser = (user: any): AuthUser => ({
  id: user.id,
  email: user.email,
  name: user.user_metadata?.full_name || user.user_metadata?.name || '',
  phone: user.user_metadata?.phone,
});

export const authService = {
  // Registro de usuario con metadata (full_name, phone)
  async signUp(email: string, password: string, name: string, phone: string): Promise<SignUpResult> {
    try {
      if (!email || !password || !name || !phone) {
        return { success: false, error: 'Datos incompletos' };
      }
      const { user } = await supaSignUp(email, password, name, phone);
      if (!user) {
        return { success: false, error: 'No se pudo crear el usuario' };
      }
      return { success: true, user: mapSupabaseUser(user) };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error al registrar' };
    }
  },

  // Inicio de sesión (email + password)
  async signIn(email: string, password: string): Promise<SignInResult> {
    try {
      if (!email || !password) {
        return { success: false, error: 'Email y contraseña requeridos' };
      }
      const { user } = await supaSignIn(email, password);
      if (!user) {
        return { success: false, error: 'Credenciales inválidas' };
      }
      return { success: true, user: mapSupabaseUser(user) };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error al iniciar sesión' };
    }
  },

  // Cierre de sesión
  async signOut(): Promise<SignOutResult> {
    try {
      await supaSignOut();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error al cerrar sesión' };
    }
  },

  // Usuario actual (sesión activa)
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const user = await supaGetCurrentUser();
      return user ? mapSupabaseUser(user) : null;
    } catch {
      return null;
    }
  },
};
