import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getCurrentUser,
  getUserProfile,
  signIn as supaSignIn,
  signUp as supaSignUp,
  signOut as supaSignOut,
  supabase,
  registerDevice,
  logUserActivity,
} from '../lib/supabase';
import type { User } from '../lib/supabase';

interface AuthContextValue {
  loading: boolean;
  user: any | null; // Raw Supabase auth user
  profile: User | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<User | null>(null);

  const loadSession = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser || null);
      if (currentUser) {
        const p = await getUserProfile();
        setProfile(p);
      } else {
        setProfile(null);
      }
    } catch (e) {
      // noop: keep null
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (!session?.user) {
        setProfile(null);
      } else {
        getUserProfile().then(setProfile).catch(() => {});
      }
    });
    return () => subscription.subscription.unsubscribe();
  }, [loadSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { user } = await supaSignIn(email, password);
      setUser(user);
      if (user) {
        const p = await getUserProfile();
        setProfile(p);
        // Registro básico de dispositivo (valores heurísticos / placeholders)
        try {
          await registerDevice({
            user_id: user.id,
            device_name: 'Mobile App',
            device_type: 'mobile',
            is_current: true,
            last_active_at: new Date().toISOString(),
            first_login_at: new Date().toISOString(),
            login_count: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as any);
          await logUserActivity(user.id, 'login', 'Inicio de sesión');
        } catch {}
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Error al iniciar sesión' };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      const { user } = await supaSignUp(email, password, fullName, phone);
      setUser(user);
      if (user) {
        const p = await getUserProfile();
        setProfile(p);
        try {
          await registerDevice({
            user_id: user.id,
            device_name: 'Mobile App',
            device_type: 'mobile',
            is_current: true,
            last_active_at: new Date().toISOString(),
            first_login_at: new Date().toISOString(),
            login_count: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as any);
          await logUserActivity(user.id, 'signup', 'Registro de usuario');
        } catch {}
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Error al registrarse' };
    }
  }, []);

  const signOut = useCallback(async () => {
    await supaSignOut();
    setUser(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    try {
      const p = await getUserProfile();
      setProfile(p);
    } catch {}
  }, [user]);

  const value: AuthContextValue = {
    loading,
    user,
    profile,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
