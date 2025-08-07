'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🍴 SPOON Platform
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          Sistema operativo para restaurantes
        </p>
        
        <div className="space-y-4">
          <Link
            href="/auth"
            className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Empezar ahora
          </Link>
          
          <p className="text-sm text-gray-500">
            Registrarse o iniciar sesión
          </p>
        </div>
      </div>
    </div>
  );
}