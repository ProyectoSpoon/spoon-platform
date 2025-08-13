// ========================================
// PÁGINA PRINCIPAL DE DOMICILIOS
// File: domicilios/page.tsx
// ========================================

import dynamic from 'next/dynamic';

const DomiciliosPage = dynamic(() => import('./pages/DomiciliosPage'), {
  loading: () => (
    <div className="min-h-[300px] flex items-center justify-center text-sm text-gray-500">
      Cargando Domicilios…
    </div>
  ),
});

export default function DomiciliosRoute() {
  return <DomiciliosPage />;
}
