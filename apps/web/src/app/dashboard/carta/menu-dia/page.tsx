// ✅ PÁGINA PRINCIPAL - IMPORTACIÓN DINÁMICA PARA REDUCIR JS INICIAL
import dynamic from 'next/dynamic';

const MenuDiaPage = dynamic(() => import('./index').then(m => m.MenuDiaPage), {
  loading: () => (
  <div className="min-h-[300px] flex items-center justify-center text-sm text-[color:var(--sp-neutral-500)]">
      Cargando Menú del Día…
    </div>
  ),
});

export default function Page() {
  return <MenuDiaPage />;
}
