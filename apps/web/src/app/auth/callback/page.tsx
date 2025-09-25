"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ensureUserProfileFromSession } from '@spoon/shared/lib/supabase';

export default function OAuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        // Asegura que haya sesión activa y crea perfil si no existe
        await ensureUserProfileFromSession();
        // Redirige al dashboard o a onboarding si aplica; aquí vamos a dashboard por defecto
        router.replace('/dashboard');
      } catch (e: any) {
        console.error('[OAuth callback] Error:', e);
        toast.error('No se pudo completar el inicio de sesión');
        router.replace('/auth');
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Procesando inicio de sesión...</p>
    </div>
  );
}
