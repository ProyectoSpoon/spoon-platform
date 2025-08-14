'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
  <div className="min-h-screen flex items-center justify-center bg-[color:var(--sp-surface)]">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-[color:var(--sp-neutral-900)] mb-4">
          🍴 SPOON Platform
        </h1>
        <p className="text-[color:var(--sp-neutral-600)] mb-8 text-lg">
          Sistema operativo para restaurantes
        </p>
        
        <div className="space-y-4">
          <Link
            href="/auth"
      className="block w-full bg-[color:var(--sp-primary-600)] hover:bg-[color:var(--sp-primary-700)] text-[color:var(--sp-on-primary)] font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Empezar ahora
          </Link>
          
          <p className="text-sm text-[color:var(--sp-neutral-500)]">
            Registrarse o iniciar sesión
          </p>
        </div>
      </div>
    </div>
  );
}