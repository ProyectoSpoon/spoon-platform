'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@spoon/shared/components/ui/Card';
import { Button } from '@spoon/shared/components/ui/Button';
import { Input } from '@spoon/shared/components/ui/Input';
import { SelectV2 } from '@spoon/shared/components/ui/SelectV2';
import { UsuariosService, type UsuarioRestaurante, type RoleSistema } from '@spoon/shared/services/usuarios';
import { getCurrentUser } from '@spoon/shared/lib/supabase';

interface ModalAperturaCajaProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmar: (montoInicial: number, notas?: string, cajeroId?: string) => Promise<{ success: boolean; error?: string } | void>;
  loading?: boolean;
}

const ModalAperturaCaja: React.FC<ModalAperturaCajaProps> = ({ isOpen, onClose, onConfirmar, loading = false }) => {
  const [monto, setMonto] = useState<string>('');
  const [montoMasked, setMontoMasked] = useState<string>('');
  const [notas, setNotas] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioRestaurante[]>([]);
  const [cajeroId, setCajeroId] = useState<string>('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMonto('');
  setNotas('');
      setError(null);
      setEnviando(false);
  setMontoMasked('');
      // cargar usuarios activos del restaurante y filtrar por roles con permiso de caja (p.ej. 'cajero')
      (async () => {
        const [{ data: users }, { data: roles }] = await Promise.all([
          UsuariosService.getUsuariosRestaurante(),
          UsuariosService.getRolesSistema()
        ]);

  const activos = (users || []).filter(u => u.is_active);
  let candidatos = activos;

        try {
          // Roles permitidos para operar la caja: incluir propietario/gerente/admin además de cajero
          const allowedSlugs = new Set(['cajero', 'gerente', 'propietario', 'administrador']);
          const normalize = (s: string) => (s || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z]/g, '')
            .trim();
          const roleIdPermitidos = new Set<string>();
          (roles || []).forEach((r: RoleSistema) => {
            const slug = normalize(r.name);
            if (allowedSlugs.has(slug)) {
              roleIdPermitidos.add(r.id);
            }
          });
          if (roleIdPermitidos.size > 0) {
            candidatos = activos.filter(u => (u.user_roles || []).some(ur => ur.is_active && roleIdPermitidos.has(ur.role_id)));
          }
          // Si el filtrado por roles da vacío (p.ej., no hay 'cajero' pero sí propietario/gerente sin mapeo), usar activos
          if (candidatos.length === 0) {
            candidatos = activos;
          }
        } catch {
          // fallback: mantener 'activos' completos si algo falla
          candidatos = activos;
        }

        setUsuarios(candidatos);

        // Preseleccionar usuario actual si está en lista filtrada
        try {
          const current = await getCurrentUser();
          if (current?.id && candidatos.some(u => u.id === current.id)) {
            setCajeroId(current.id);
          } else {
            setCajeroId('');
          }
        } catch {
          setCajeroId('');
        }
      })();
    }
  }, [isOpen]);

  // Parsear montos escritos con separadores locales (p.ej. 1´550.000) a pesos enteros
  const parseMonto = (val: string) => {
    const digitsOnly = (val || '').replace(/[^0-9]/g, '');
    const n = parseInt(digitsOnly || '0', 10);
    return Number.isFinite(n) ? n : 0;
  };

  const formatMiles = (val: number) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(val || 0);

  const handleMontoChange = (raw: string) => {
    const value = parseMonto(raw);
    setMonto(String(value));
    setMontoMasked(value ? formatMiles(value) : '');
  };

  const handleConfirmar = async () => {
  const montoNum = parseMonto(monto);
    if (!monto || montoNum <= 0) {
      setError('Ingresa un monto inicial válido (> 0).');
      return;
    }
    if (!cajeroId) {
      setError('Selecciona el cajero que abrirá la caja.');
      return;
    }
    setError(null);
    setEnviando(true);
    try {
  // Enviar en pesos enteros; el hook convierte a centavos
  const res: any = await onConfirmar(montoNum, notas || undefined, cajeroId);
      if (!res || res.success) {
        onClose();
      } else if (res?.error) {
        setError(res.error);
      }
    } finally {
      setEnviando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--sp-neutral-900)]/60">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Abrir caja</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-[color:var(--sp-neutral-700)]">Cajero</label>
            <SelectV2
              placeholder="Selecciona el usuario"
              value={cajeroId}
              onChange={(e) => setCajeroId(e.target.value)}
              required
            >
              <option value="" disabled hidden>Selecciona el usuario</option>
              {usuarios.map(u => (
                <option key={u.id} value={u.id}>
                  {u.first_name} {u.last_name} — {u.email}
                </option>
              ))}
            </SelectV2>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-[color:var(--sp-neutral-700)]">Monto inicial (COP)</label>
            <Input
              inputMode="numeric"
              placeholder="0"
              value={montoMasked}
              onChange={(e) => handleMontoChange(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-[color:var(--sp-neutral-700)]">Notas (opcional)</label>
            <Input
              placeholder="Ej: Apertura de turno mañana"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>
          {error && (
            <div className="text-sm text-[color:var(--sp-error-700)]">{error}</div>
          )}
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={enviando || loading}>Cancelar</Button>
            <Button variant="green" onClick={handleConfirmar} disabled={enviando || loading}>
              {enviando || loading ? 'Abriendo…' : 'Abrir caja'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModalAperturaCaja;
