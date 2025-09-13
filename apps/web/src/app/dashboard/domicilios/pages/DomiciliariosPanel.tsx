'use client';

import React, { useState } from 'react';
import { Plus as PlusRaw, User as UserRaw, Phone as PhoneRaw, Circle as CircleRaw, MoreVertical as MoreVerticalRaw, UserPlus as UserPlusRaw } from 'lucide-react';
const Plus: any = PlusRaw;
const User: any = UserRaw;
const Phone: any = PhoneRaw;
const Circle: any = CircleRaw;
const MoreVertical: any = MoreVerticalRaw;
const UserPlus: any = UserPlusRaw;
import { Domiciliario, EstadoDomiciliario } from '../types/domiciliosTypes';
import { ESTADOS_DOMICILIARIO } from '../constants/domiciliosConstants';

interface DomiciliariosProps {
  domiciliarios: Domiciliario[];
  onUpdateStatus: (id: string, status: EstadoDomiciliario) => void;
  onAddDomiciliario: (nombre: string, telefono: string) => void;
  loading: boolean;
}

export default function DomiciliariosPanel({ 
  domiciliarios, 
  onUpdateStatus, 
  onAddDomiciliario, 
  loading 
}: DomiciliariosProps) {
  // Wizard steps: 0 resumen -> 1 lista -> 2 nuevo
  const [paso, setPaso] = useState<0 | 1 | 2>(0);
  const [abierto, setAbierto] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', telefono: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.telefono.trim()) return;
    await onAddDomiciliario(formData.nombre.trim(), formData.telefono.trim());
    setFormData({ nombre: '', telefono: '' });
    setPaso(1); // volver a lista
  };

  const disponibles = domiciliarios.filter(d => d.status === ESTADOS_DOMICILIARIO.DISPONIBLE).length;
  const ocupados = domiciliarios.filter(d => d.status === ESTADOS_DOMICILIARIO.OCUPADO).length;
  const desconectados = domiciliarios.filter(d => d.status === ESTADOS_DOMICILIARIO.DESCONECTADO).length;

  return (
    <div className="bg-[--sp-surface-elevated] rounded-lg shadow-sm h-fit">
      {/* Header */}
      <button
        onClick={() => setAbierto(a => !a)}
        className="w-full flex items-center justify-between px-4 py-4 border-b border-[color:var(--sp-neutral-200)] hover:bg-[color:var(--sp-neutral-50)] transition-colors"
        aria-expanded={abierto}
      >
        <div className="flex flex-col text-left">
          <h3 className="heading-section text-[color:var(--sp-neutral-900)]">Domiciliarios</h3>
          <span className="text-xs text-[color:var(--sp-neutral-500)]">{domiciliarios.length} registrados • {disponibles} disponibles</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs px-2 py-1 rounded-full bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-neutral-600)]">Wizard</span>
          <Plus className={'w-5 h-5 transition-transform ' + (abierto ? 'rotate-45' : '')} />
        </div>
      </button>

      {abierto && (
        <div className="p-4 space-y-5">
          {/* Pasos */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            {['Resumen','Listado','Nuevo'].map((etiqueta, idx) => {
              const activo = paso === idx as any;
              return (
                <button
                  key={etiqueta}
                  onClick={() => setPaso(idx as 0|1|2)}
                  className={'px-3 py-1 rounded-full border text-[11px] font-medium ' + (activo ? 'bg-[color:var(--sp-primary-600)] text-[--sp-on-primary] border-[color:var(--sp-primary-600)]' : 'border-[color:var(--sp-neutral-300)] text-[color:var(--sp-neutral-600)] hover:bg-[color:var(--sp-neutral-100)]')}
                  aria-current={activo ? 'step' : undefined}
                >{idx+1}. {etiqueta}</button>
              );
            })}
          </div>

          {/* Contenido dinámico */}
          {paso === 0 && (
            <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="p-3 rounded-md bg-[color:var(--sp-success-50)]">
                <p className="text-[color:var(--sp-neutral-500)]">Disponibles</p>
                <p className="font-semibold text-[color:var(--sp-neutral-900)] text-lg">{disponibles}</p>
              </div>
              <div className="p-3 rounded-md bg-[color:var(--sp-error-50)]">
                <p className="text-[color:var(--sp-neutral-500)]">Ocupados</p>
                <p className="font-semibold text-[color:var(--sp-neutral-900)] text-lg">{ocupados}</p>
              </div>
              <div className="p-3 rounded-md bg-[color:var(--sp-neutral-50)] col-span-2">
                <p className="text-[color:var(--sp-neutral-500)] mb-1">Desconectados</p>
                <p className="font-semibold text-[color:var(--sp-neutral-900)]">{desconectados}</p>
              </div>
              <div className="col-span-2 flex justify-end">
                <button onClick={()=>setPaso(1)} className="px-4 py-2 text-xs bg-[color:var(--sp-primary-600)] text-[--sp-on-primary] rounded-md hover:bg-[color:var(--sp-primary-700)]">Ver listado</button>
              </div>
            </div>
          )}

          {paso === 1 && (
            <div className="space-y-3">
              {domiciliarios.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-[color:var(--sp-neutral-600)] mb-3">No hay domiciliarios</p>
                  <button onClick={()=>setPaso(2)} className="text-sm text-[color:var(--sp-primary-600)] hover:text-[color:var(--sp-primary-700)] font-medium">Agregar el primero</button>
                </div>
              )}
              <div className="max-h-72 overflow-y-auto divide-y divide-[color:var(--sp-neutral-200)] rounded-md border border-[color:var(--sp-neutral-200)] bg-[--sp-surface]">
                {domiciliarios.map(d => (
                  <div key={d.id} className="p-3 flex items-center justify-between gap-3 hover:bg-[color:var(--sp-neutral-50)] transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-full bg-[color:var(--sp-neutral-200)] flex items-center justify-center"><User className="w-4 h-4 text-[color:var(--sp-neutral-600)]" /></div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[color:var(--sp-neutral-900)] truncate">{d.name}</p>
                        <p className="text-xs text-[color:var(--sp-neutral-500)] flex items-center"><Phone className="w-3 h-3 mr-1" />{d.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={'px-2 py-1 rounded-full text-[10px] font-medium ' + (d.status === ESTADOS_DOMICILIARIO.DISPONIBLE ? 'bg-[color:var(--sp-success-100)] text-[color:var(--sp-success-800)]' : d.status === ESTADOS_DOMICILIARIO.OCUPADO ? 'bg-[color:var(--sp-error-100)] text-[color:var(--sp-error-800)]' : 'bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-neutral-700)]')}>
                        {d.status === ESTADOS_DOMICILIARIO.DISPONIBLE ? 'Disponible' : d.status === ESTADOS_DOMICILIARIO.OCUPADO ? 'Ocupado' : 'Desconectado'}
                      </span>
                      <select
                        value={d.status}
                        onChange={(e)=>onUpdateStatus(d.id, e.target.value as EstadoDomiciliario)}
                        className="text-xs border border-[color:var(--sp-neutral-300)] rounded px-2 py-1 focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-[color:var(--sp-primary-500)]"
                      >
                        <option value={ESTADOS_DOMICILIARIO.DISPONIBLE}>Disponible</option>
                        <option value={ESTADOS_DOMICILIARIO.OCUPADO}>Ocupado</option>
                        <option value={ESTADOS_DOMICILIARIO.DESCONECTADO}>Desconectado</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-1">
                <button onClick={()=>setPaso(2)} className="text-xs text-[color:var(--sp-primary-600)] hover:text-[color:var(--sp-primary-700)] font-medium inline-flex items-center gap-1"><Plus className="w-4 h-4" /> Nuevo</button>
              </div>
            </div>
          )}

          {paso === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[color:var(--sp-neutral-600)] mb-1">Nombre completo</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e)=>setFormData(p=>({...p, nombre: e.target.value}))}
                    className="w-full px-3 py-2 border border-[color:var(--sp-neutral-300)] rounded-md text-sm focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-[color:var(--sp-primary-500)]"
                    placeholder="Juan Perez" required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[color:var(--sp-neutral-600)] mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e)=>setFormData(p=>({...p, telefono: e.target.value}))}
                    className="w-full px-3 py-2 border border-[color:var(--sp-neutral-300)] rounded-md text-sm focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-[color:var(--sp-primary-500)]"
                    placeholder="3001234567" required
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-[color:var(--sp-primary-600)] text-[--sp-on-primary] rounded-md text-sm hover:bg-[color:var(--sp-primary-700)] disabled:opacity-50">{loading ? 'Guardando...' : 'Guardar'}</button>
                <button type="button" onClick={()=>{ setPaso(1); setFormData({ nombre:'', telefono:''}); }} className="px-4 py-2 text-sm border border-[color:var(--sp-neutral-300)] rounded-md hover:bg-[color:var(--sp-neutral-50)]">Cancelar</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
