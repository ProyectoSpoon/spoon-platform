'use client';

import React, { useState } from 'react';
import { Plus, User, Phone, Circle, MoreVertical, UserPlus } from 'lucide-react';
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
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim() || !formData.telefono.trim()) {
      alert('Completa todos los campos');
      return;
    }

    await onAddDomiciliario(formData.nombre.trim(), formData.telefono.trim());
    
    setFormData({ nombre: '', telefono: '' });
    setMostrarFormulario(false);
  };

  const disponibles = domiciliarios.filter(d => d.status === ESTADOS_DOMICILIARIO.DISPONIBLE).length;
  const ocupados = domiciliarios.filter(d => d.status === ESTADOS_DOMICILIARIO.OCUPADO).length;
  const desconectados = domiciliarios.filter(d => d.status === ESTADOS_DOMICILIARIO.DESCONECTADO).length;

  return (
    <div className="bg-[--sp-surface-elevated] rounded-lg shadow-sm h-fit">
      <div className="px-4 py-4 border-b border-[color:var(--sp-neutral-200)]">
        <div className="flex items-center justify-between">
          <h3 className="heading-section text-[color:var(--sp-neutral-900)]">
            Domiciliarios ({domiciliarios.length})
          </h3>
          
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="p-2 text-[color:var(--sp-neutral-400)] hover:text-[color:var(--sp-neutral-600)] hover:bg-[color:var(--sp-neutral-100)] rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

  <div className="mt-3 flex space-x-4 text-sm">
          <div className="flex items-center">
            <Circle className="w-3 h-3 text-[color:var(--sp-success-500)] mr-1" />
            <span className="text-[color:var(--sp-neutral-600)]">{disponibles} disponibles</span>
          </div>
          <div className="flex items-center">
            <Circle className="w-3 h-3 text-[color:var(--sp-error-500)] mr-1" />
            <span className="text-[color:var(--sp-neutral-600)]">{ocupados} ocupados</span>
          </div>
        </div>
      </div>

      {mostrarFormulario && (
        <div className="px-4 py-4 bg-[--sp-surface] border-b border-[color:var(--sp-neutral-200)]">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                className="w-full px-3 py-2 border border-[color:var(--sp-neutral-300)] rounded-md focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-[color:var(--sp-primary-500)] text-sm"
                placeholder="Juan Perez"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-1">
                Telefono
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                className="w-full px-3 py-2 border border-[color:var(--sp-neutral-300)] rounded-md focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-[color:var(--sp-primary-500)] text-sm"
                placeholder="3001234567"
                required
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-3 py-2 bg-[color:var(--sp-primary-600)] text-[--sp-on-primary] text-sm rounded-md hover:bg-[color:var(--sp-primary-700)] disabled:opacity-50 transition-colors"
              >
                {loading ? 'Agregando...' : 'Agregar'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false);
                  setFormData({ nombre: '', telefono: '' });
                }}
                className="px-3 py-2 border border-[color:var(--sp-neutral-300)] text-[color:var(--sp-neutral-700)] text-sm rounded-md hover:bg-[color:var(--sp-neutral-50)] transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

  <div className="divide-y divide-[color:var(--sp-neutral-200)] max-h-96 overflow-y-auto">
        {domiciliarios.length === 0 ? (
          <div className="px-4 py-8 text-center">
    <div className="w-12 h-12 bg-[color:var(--sp-neutral-100)] rounded-full flex items-center justify-center mx-auto mb-3">
              <UserPlus className="w-6 h-6 text-[color:var(--sp-neutral-400)]" />
            </div>
            <p className="text-sm text-[color:var(--sp-neutral-600)] mb-2">No hay domiciliarios</p>
            <button
              onClick={() => setMostrarFormulario(true)}
              className="text-sm text-[color:var(--sp-primary-600)] hover:text-[color:var(--sp-primary-700)] font-medium"
            >
              Agregar el primero
            </button>
          </div>
        ) : (
      domiciliarios.map((domiciliario) => (
    <div key={domiciliario.id} className="px-4 py-3 hover:bg-[--sp-surface] transition-colors">
              <div className="flex items-center justify-between">
                
                <div className="flex items-center space-x-3 flex-1">
      <div className="w-8 h-8 bg-[color:var(--sp-neutral-200)] rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-[color:var(--sp-neutral-600)]" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[color:var(--sp-neutral-900)] truncate">
                      {domiciliario.name}
                    </p>
                    <div className="flex items-center text-xs text-[color:var(--sp-neutral-500)]">
                      <Phone className="w-3 h-3 mr-1" />
                      <span>{domiciliario.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    domiciliario.status === ESTADOS_DOMICILIARIO.DISPONIBLE 
                      ? 'bg-[color:var(--sp-success-100)] text-[color:var(--sp-success-800)]'
                      : domiciliario.status === ESTADOS_DOMICILIARIO.OCUPADO 
                      ? 'bg-[color:var(--sp-error-100)] text-[color:var(--sp-error-800)]'
                      : 'bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-neutral-800)]'
                  }`}>
                    <span className="mr-1">
                      {domiciliario.status === ESTADOS_DOMICILIARIO.DISPONIBLE ? '🟢' : 
                       domiciliario.status === ESTADOS_DOMICILIARIO.OCUPADO ? '🔴' : '⚫'}
                    </span>
                    {domiciliario.status === ESTADOS_DOMICILIARIO.DISPONIBLE ? 'Disponible' :
                     domiciliario.status === ESTADOS_DOMICILIARIO.OCUPADO ? 'Ocupado' : 'Desconectado'}
                  </span>

                  <select
                    value={domiciliario.status}
                    onChange={(e) => onUpdateStatus(domiciliario.id, e.target.value as EstadoDomiciliario)}
                    className="text-xs border border-[color:var(--sp-neutral-300)] rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-[color:var(--sp-primary-500)] text-[color:var(--sp-neutral-700)]"
                  >
                    <option value={ESTADOS_DOMICILIARIO.DISPONIBLE}>Disponible</option>
                    <option value={ESTADOS_DOMICILIARIO.OCUPADO}>Ocupado</option>
                    <option value={ESTADOS_DOMICILIARIO.DESCONECTADO}>Desconectado</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}