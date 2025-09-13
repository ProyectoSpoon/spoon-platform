'use client';
import React from 'react';
import { getCierreCajaDetalle } from '@spoon/shared/lib/supabase';

const CloseBtn: any = (props: { onClick: () => void }) => (
  <button onClick={props.onClick} className="px-3 py-1.5 text-xs rounded-md bg-[color:var(--sp-neutral-800)] text-[color:var(--sp-on-neutral)] hover:bg-[color:var(--sp-neutral-900)]">Cerrar</button>
);

interface Props {
  cierreId: string | null;
  onClose: () => void;
}

const fmt = (cents?: number) => {
  if (cents == null) return '—';
  return '$' + new Intl.NumberFormat('es-CO').format(Math.round(cents / 100));
};

export const CierreDetalle: React.FC<Props> = ({ cierreId, onClose }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<null | any>(null);

  React.useEffect(() => {
    if (!cierreId) return;
    let cancel = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const detalle = await getCierreCajaDetalle(cierreId);
        if (!cancel) setData(detalle);
      } catch (e: any) {
        if (!cancel) setError(e?.message || 'Error cargando detalle');
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    load();
    return () => { cancel = true; };
  }, [cierreId]);

  if (!cierreId) return null;

  const agreg = data?.agregados;
  const sesion = data?.sesion;
  const transacciones = data?.transacciones || [];
  const gastos = data?.gastos || [];

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center bg-[color:var(--sp-overlay)]/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-[color:var(--sp-surface-elevated)] rounded-xl shadow-xl border border-[color:var(--sp-neutral-200)] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-[color:var(--sp-neutral-200)] sticky top-0 bg-[color:var(--sp-surface)] rounded-t-xl">
          <div>
            <h3 className="text-base font-semibold text-[color:var(--sp-neutral-900)]">Cierre #{cierreId}</h3>
            {sesion && (() => {
              const apertura = new Date(sesion.abierta_at);
              const cierre = sesion.cerrada_at ? new Date(sesion.cerrada_at) : null;
              const fmtFecha = (d: Date) => d.toLocaleDateString('es-CO', { weekday: 'long', day: '2-digit', month: '2-digit' });
              const fmtHora = (d: Date) => d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
              return (
                <p className="text-[11px] text-[color:var(--sp-neutral-500)] mt-0.5 capitalize">
                  Apertura: {fmtFecha(apertura)} {fmtHora(apertura)} · Cierre: {cierre ? `${fmtFecha(cierre)} ${fmtHora(cierre)}` : '—'}
                </p>
              );
            })()}
            {error && <p className="text-[11px] text-[color:var(--sp-error-600)] mt-1">{error}</p>}
          </div>
          <CloseBtn onClick={onClose} />
        </div>
        <div className="p-5 space-y-6">
          {/* Resumen */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[
              { k: 'Ventas totales', v: fmt(agreg?.total_ventas_centavos) },
              { k: 'Efectivo', v: fmt(agreg?.total_efectivo_centavos) },
              { k: 'Tarjeta', v: fmt(agreg?.total_tarjeta_centavos) },
              { k: 'Digital', v: fmt(agreg?.total_digital_centavos) },
              { k: 'Gastos', v: fmt(agreg?.total_gastos_centavos) }
            ].map(item => (
              <div key={item.k} className="p-3 rounded-lg border border-[color:var(--sp-neutral-200)] bg-[color:var(--sp-neutral-50)]">
                <div className="text-[10px] uppercase tracking-wide text-[color:var(--sp-neutral-500)] mb-1">{item.k}</div>
                <div className="text-sm font-semibold text-[color:var(--sp-neutral-800)]">{item.v}</div>
              </div>
            ))}
          </div>

          {/* Flujo efectivo */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Flujo de efectivo</h4>
            <div className="rounded-lg border border-[color:var(--sp-neutral-200)] divide-y divide-[color:var(--sp-neutral-200)] overflow-hidden text-[12px]">
              <div className="flex items-center justify-between px-3 py-2 bg-[color:var(--sp-surface)]"><span>Saldo inicial</span><span className="font-medium">{fmt(sesion?.monto_inicial)}</span></div>
              <div className="flex items-center justify-between px-3 py-2 bg-[color:var(--sp-surface)]"><span>+ Efectivo recibido</span><span className="font-medium">{fmt(agreg?.total_efectivo_centavos)}</span></div>
              <div className="flex items-center justify-between px-3 py-2 bg-[color:var(--sp-surface)]"><span>- Gastos</span><span className="font-medium">{fmt(agreg?.total_gastos_centavos)}</span></div>
              <div className="flex items-center justify-between px-3 py-2 bg-[color:var(--sp-neutral-50)] font-semibold"><span>= Teórico</span><span>{fmt(agreg?.efectivo_teorico_centavos)}</span></div>
              <div className="flex items-center justify-between px-3 py-2 bg-[color:var(--sp-surface)]"><span>- Contado (faltante campo)</span><span className="font-medium">—</span></div>
              <div className="flex items-center justify-between px-3 py-2 bg-[color:var(--sp-neutral-50)]"><span>= Diferencia</span><span className="font-medium">—</span></div>
            </div>
            {!loading && !data && !error && (
              <div className="text-[11px] text-[color:var(--sp-neutral-500)]">No hay datos.</div>
            )}
          </div>

            {/* Transacciones */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">Transacciones <span className="text-[10px] font-normal text-[color:var(--sp-neutral-500)]">{transacciones.length}</span></h4>
              <div className="max-h-56 overflow-auto rounded-md border border-[color:var(--sp-neutral-200)] divide-y divide-[color:var(--sp-neutral-200)] bg-[color:var(--sp-surface)]">
                {loading ? (
                  <div className="p-4 text-[11px] text-[color:var(--sp-neutral-500)]">Cargando...</div>
                ) : transacciones.length === 0 ? (
                  <div className="p-4 text-[11px] text-[color:var(--sp-neutral-500)]">Sin transacciones.</div>
                ) : transacciones.map((t: any) => (
                  <div key={t.id} className="px-3 py-2 text-[11px] flex items-center justify-between">
                    <span className="truncate max-w-[45%]">{t.tipo_orden}/{t.metodo_pago}</span>
                    <span className="text-[color:var(--sp-neutral-500)]">{new Date(t.procesada_at).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}</span>
                    <span className="font-medium">{fmt(t.monto_total)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gastos */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">Gastos <span className="text-[10px] font-normal text-[color:var(--sp-neutral-500)]">{gastos.length}</span></h4>
              <div className="max-h-48 overflow-auto rounded-md border border-[color:var(--sp-neutral-200)] divide-y divide-[color:var(--sp-neutral-200)] bg-[color:var(--sp-surface)]">
                {loading ? (
                  <div className="p-4 text-[11px] text-[color:var(--sp-neutral-500)]">Cargando...</div>
                ) : gastos.length === 0 ? (
                  <div className="p-4 text-[11px] text-[color:var(--sp-neutral-500)]">Sin gastos.</div>
                ) : gastos.map((g: any) => (
                  <div key={g.id} className="px-3 py-2 text-[11px] flex items-center justify-between">
                    <span className="truncate max-w-[45%]">{g.categoria}</span>
                    <span className="text-[color:var(--sp-neutral-500)]">{new Date(g.registrado_at).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}</span>
                    <span className="font-medium">{fmt(g.monto)}</span>
                  </div>
                ))}
              </div>
            </div>

          {/* Notas */}
          <div>
            <h4 className="text-sm font-medium mb-1">Notas</h4>
            <div className="p-3 rounded-md border border-[color:var(--sp-neutral-200)] text-[12px] text-[color:var(--sp-neutral-600)] bg-[color:var(--sp-neutral-50)] min-h-[60px]">
              {sesion?.notas_cierre || sesion?.notas_apertura || <span className="text-[color:var(--sp-neutral-400)]">Sin notas.</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CierreDetalle;

