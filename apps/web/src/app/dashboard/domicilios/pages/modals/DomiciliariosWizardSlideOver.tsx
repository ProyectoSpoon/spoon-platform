"use client";
import React, { useEffect, useState } from 'react';
import { X, Check, UserPlus, Users, Phone, Shield, MapPin } from 'lucide-react';
const IconX: any = X as any; // Casting pattern para evitar conflictos de tipos react duplicados
const IconUserPlus: any = UserPlus as any;
const IconUsers: any = Users as any;
const IconPhone: any = Phone as any;
const IconShield: any = Shield as any;
const IconMapPin: any = MapPin as any;
import { ESTADOS_DOMICILIARIO } from '../../constants/domiciliosConstants';
import { EstadoDomiciliario, Domiciliario } from '../../types/domiciliosTypes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (nombre: string, telefono: string) => Promise<void> | void;
  onUpdateStatus: (id: string, status: EstadoDomiciliario) => Promise<void> | void;
  onDeactivate?: (id: string) => Promise<void> | void;
  domiciliarios: Domiciliario[];
  loading?: boolean;
}

type Paso = 0 | 1 | 2; // 0 resumen, 1 listado, 2 nuevo

const pasosMeta = [
  { id: 0, label: 'Resumen' },
  { id: 1, label: 'Listado' },
  { id: 2, label: 'Nuevo' }
];

const DomiciliariosWizardSlideOver: React.FC<Props> = ({ isOpen, onClose, onAdd, onUpdateStatus, onDeactivate, domiciliarios, loading=false }) => {
  const [anim, setAnim] = useState(false);
  const [paso, setPaso] = useState<Paso>(0);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [errores, setErrores] = useState<string[]>([]);

  useEffect(()=>{ if(isOpen){ setAnim(true); setPaso(0); setNombre(''); setTelefono(''); setErrores([]);} else { setAnim(false);} },[isOpen]);

  if(!isOpen) return null;

  const disponibles = domiciliarios.filter(d=>d.status===ESTADOS_DOMICILIARIO.DISPONIBLE).length;
  const ocupados = domiciliarios.filter(d=>d.status===ESTADOS_DOMICILIARIO.OCUPADO).length;
  const desconectados = domiciliarios.filter(d=>d.status===ESTADOS_DOMICILIARIO.DESCONECTADO).length;

  const validar = () => {
    const errs: string[] = [];
    if(nombre.trim().length < 3) errs.push('Nombre muy corto');
    if(!/^\d{7,}$/.test(telefono.trim())) errs.push('Teléfono inválido');
    setErrores(errs); return errs.length===0;
  };

  const handleGuardar = async () => {
    if(!validar()) return; 
    await onAdd(nombre.trim(), telefono.trim());
    setNombre(''); setTelefono('');
    setPaso(1);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className={`absolute inset-0 bg-[color:var(--sp-overlay)] backdrop-blur-sm transition-opacity duration-300 ${anim? 'opacity-100':'opacity-0'}`} onClick={()=>onClose()} />
      <div className={`absolute right-0 top-0 h-full w-full sm:max-w-md md:max-w-lg bg-[color:var(--sp-surface-elevated)] shadow-xl transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${anim? 'translate-x-0':'translate-x-full'}`}> 
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[color:var(--sp-neutral-200)] bg-[color:var(--sp-surface)]/80 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h2 className="text-base font-semibold text-[color:var(--sp-neutral-900)] flex items-center gap-2"><IconUserPlus className="w-5 h-5"/> Domiciliarios</h2>
            <p className="text-xs text-[color:var(--sp-neutral-500)]">Gestiona personal y estados en tiempo real</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-[color:var(--sp-neutral-100)]"><IconX className="w-4 h-4"/></button>
        </div>

        {/* Steps */}
        <div className="px-5 py-3 border-b border-[color:var(--sp-neutral-200)] flex gap-2 overflow-x-auto no-scrollbar text-xs">
          {pasosMeta.map(p => (
            <button key={p.id} onClick={()=>setPaso(p.id as Paso)} className={`px-3 py-1 rounded-full border transition-colors ${paso===p.id? 'bg-[color:var(--sp-primary-600)] text-[--sp-on-primary] border-[color:var(--sp-primary-600)]':'border-[color:var(--sp-neutral-300)] text-[color:var(--sp-neutral-600)] hover:bg-[color:var(--sp-neutral-100)]'}`}>{p.id+1}. {p.label}</button>
          ))}
        </div>

        <div className="h-[calc(100%-170px)] overflow-y-auto p-5 space-y-6">
          {paso===0 && (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-4 rounded-lg bg-[color:var(--sp-success-50)]">
                <p className="text-[10px] uppercase tracking-wide text-[color:var(--sp-neutral-500)]">Disponibles</p>
                <p className="text-2xl font-semibold text-[color:var(--sp-neutral-900)]">{disponibles}</p>
              </div>
              <div className="p-4 rounded-lg bg-[color:var(--sp-error-50)]">
                <p className="text-[10px] uppercase tracking-wide text-[color:var(--sp-neutral-500)]">Ocupados</p>
                <p className="text-2xl font-semibold text-[color:var(--sp-neutral-900)]">{ocupados}</p>
              </div>
              <div className="p-4 rounded-lg bg-[color:var(--sp-neutral-100)]">
                <p className="text-[10px] uppercase tracking-wide text-[color:var(--sp-neutral-500)]">Desconect.</p>
                <p className="text-2xl font-semibold text-[color:var(--sp-neutral-900)]">{desconectados}</p>
              </div>
              <div className="col-span-3 mt-2 text-xs text-[color:var(--sp-neutral-500)] border-t pt-3">Resumen rápido del personal activo. Cambia a Listado para gestionar estados o crear uno nuevo.</div>
            </div>
          )}
          {paso===1 && (
            <div className="space-y-4">
              {domiciliarios.length===0 && <div className="text-center py-12 border rounded-lg text-sm text-[color:var(--sp-neutral-600)]">No hay domiciliarios aún</div>}
              <div className="divide-y rounded-lg border border-[color:var(--sp-neutral-200)] overflow-hidden">
                {domiciliarios.map(d => (
                  <div key={d.id} className="p-3 flex items-center gap-3 bg-[--sp-surface] hover:bg-[color:var(--sp-neutral-50)] transition-colors">
                    <div className="w-9 h-9 rounded-full bg-[color:var(--sp-neutral-200)] grid place-items-center"><IconUsers className="w-4 h-4 text-[color:var(--sp-neutral-600)]"/></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[color:var(--sp-neutral-900)] truncate flex items-center gap-2">{d.name}{d.status===ESTADOS_DOMICILIARIO.OCUPADO && <span className="text-[10px] px-1 py-0.5 rounded bg-[color:var(--sp-error-100)] text-[color:var(--sp-error-700)]">ocupado</span>}</p>
                      <p className="text-[11px] text-[color:var(--sp-neutral-500)] flex items-center gap-1"><IconPhone className="w-3 h-3"/>{d.phone}</p>
                    </div>
                    <select value={d.status} onChange={(e)=>onUpdateStatus(d.id, e.target.value as EstadoDomiciliario)} className="text-xs border rounded px-2 py-1 focus:ring-2 focus:ring-[color:var(--sp-primary-500)]">
                      <option value={ESTADOS_DOMICILIARIO.DISPONIBLE}>Disponible</option>
                      <option value={ESTADOS_DOMICILIARIO.OCUPADO}>Ocupado</option>
                      <option value={ESTADOS_DOMICILIARIO.DESCONECTADO}>Desconectado</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
          {paso===2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[color:var(--sp-neutral-600)] mb-1">Nombre completo</label>
                  <input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Juan Pérez" className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-[color:var(--sp-primary-500)]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[color:var(--sp-neutral-600)] mb-1">Teléfono</label>
                  <input value={telefono} onChange={e=>setTelefono(e.target.value)} placeholder="3001234567" className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-[color:var(--sp-primary-500)]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 rounded-md border border-dashed text-[color:var(--sp-neutral-600)] flex items-start gap-2"><IconShield className="w-4 h-4 text-[color:var(--sp-info-600)]"/>Verifica identidad mínima</div>
                <div className="p-3 rounded-md border border-dashed text-[color:var(--sp-neutral-600)] flex items-start gap-2"><IconMapPin className="w-4 h-4 text-[color:var(--sp-success-600)]"/>Opera dentro del área</div>
              </div>
              {errores.length>0 && <div className="bg-[color:var(--sp-error-50)] border border-[color:var(--sp-error-200)] rounded-md p-2 text-[11px] text-[color:var(--sp-error-700)] space-y-1">{errores.map((e,i)=><div key={i}>• {e}</div>)}</div>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-[color:var(--sp-surface)] sticky bottom-0 flex justify-between items-center gap-3">
          <button onClick={()=>onClose()} className="px-4 py-2 text-xs rounded-md border hover:bg-[color:var(--sp-neutral-50)]">Cerrar</button>
          {paso===0 && <button onClick={()=>setPaso(1)} className="px-4 py-2 text-xs rounded-md bg-[color:var(--sp-primary-600)] text-[--sp-on-primary] hover:bg-[color:var(--sp-primary-700)]">Ir a listado</button>}
          {paso===1 && <div className="flex gap-2"> <button onClick={()=>setPaso(2)} className="px-4 py-2 text-xs rounded-md bg-[color:var(--sp-primary-600)] text-[--sp-on-primary] hover:bg-[color:var(--sp-primary-700)] flex items-center gap-1"><IconUserPlus className="w-4 h-4"/> Nuevo</button></div>}
          {paso===2 && <div className="flex gap-2"><button onClick={()=>setPaso(1)} className="px-4 py-2 text-xs rounded-md border hover:bg-[color:var(--sp-neutral-50)]">Cancelar</button><button disabled={loading} onClick={handleGuardar} className="px-5 py-2 text-xs rounded-md bg-[color:var(--sp-success-600)] text-[--sp-on-success] hover:bg-[color:var(--sp-success-700)] disabled:opacity-60">{loading? 'Guardando...' : 'Guardar'}</button></div>}
        </div>
      </div>
    </div>
  );
};

export default DomiciliariosWizardSlideOver;
