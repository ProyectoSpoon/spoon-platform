// ========================================
// PÁGINA PRINCIPAL DE DOMICILIOS
// File: domicilios/page.tsx
// ========================================

// Importación estática del componente cliente para evitar divisiones
// de chunks innecesarias en desarrollo que pueden causar 404/HMR.
import DomiciliosPage from './pages/DomiciliosPage';

export default function DomiciliosRoute() {
  return <DomiciliosPage />;
}
