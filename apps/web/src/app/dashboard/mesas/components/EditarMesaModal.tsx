// Modal de Editar Mesa - Basado en ConfiguracionMesasModal existente
import React, { useState, useEffect } from 'react';
import { Button } from '@spoon/shared/components/ui/Button';
import {
  X,
  Save,
  Users,
  MapPin,
  FileText,
  AlertCircle,
  Settings,
  Minus,
  Plus
} from 'lucide-react';

// ========================================
// INTERFACES
// ========================================

interface Mesa {
  id: string;
  numero: number;
  nombre?: string;
  zona?: string;
  capacidad: number;
  estado: string;
  notas?: string;
}

interface EditarMesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mesa: Mesa;
  onGuardar: (datosActualizados: Partial<Mesa>) => Promise<boolean>;
  loading?: boolean;
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

const EditarMesaModal: React.FC<EditarMesaModalProps> = ({
  isOpen,
  onClose,
  mesa,
  onGuardar,
  loading = false
}) => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: mesa.nombre || '',
    zona: mesa.zona || '',
    capacidad: mesa.capacidad || 4,
    notas: mesa.notas || ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);

  // Resetear form cuando cambie la mesa
  useEffect(() => {
    setFormData({
      nombre: mesa.nombre || '',
      zona: mesa.zona || '',
      capacidad: mesa.capacidad || 4,
      notas: mesa.notas || ''
    });
    setErrors({});
  }, [mesa]);

  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !guardando) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, guardando, onClose]);

  // Validaciones
  const validarFormulario = () => {
    const newErrors: Record<string, string> = {};

    if (formData.capacidad < 1 || formData.capacidad > 20) {
      newErrors.capacidad = 'La capacidad debe estar entre 1 y 20 personas';
    }

    if (formData.zona.trim().length < 2) {
      newErrors.zona = 'La zona debe tener al menos 2 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en inputs
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Guardar cambios
  const handleGuardar = async () => {
    if (!validarFormulario()) return;

    setGuardando(true);

    try {
      const exito = await onGuardar({
        nombre: formData.nombre.trim() || undefined,
        zona: formData.zona.trim(),
        capacidad: formData.capacidad,
        notas: formData.notas.trim() || undefined
      });

      if (exito) {
        onClose();
      }
    } catch (error) {
      console.error('Error al guardar mesa:', error);
    } finally {
      setGuardando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[color:var(--sp-neutral-900)]/60 flex items-center justify-center p-4 z-50">
      <div 
        className="bg-[color:var(--sp-surface-elevated)] rounded-xl shadow-2xl w-full max-w-md transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
  <div className="flex items-center justify-between p-6 border-b border-[color:var(--sp-border)]">
          <div className="flex items-center space-x-3">
            <div className="bg-[color:var(--sp-primary-100)] p-2 rounded-lg">
              <Settings className="h-5 w-5 text-[color:var(--sp-primary-600)]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[color:var(--sp-neutral-900)]">
                Editar Mesa {mesa.numero}
              </h2>
              <p className="text-sm text-[color:var(--sp-neutral-500)]">
                Modificar configuración de la mesa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={guardando}
            className="p-2 hover:bg-[color:var(--sp-neutral-100)] rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-[color:var(--sp-neutral-500)]" />
          </button>
        </div>

        {/* Contenido */}
  <div className="p-6 space-y-6">
          {/* Nombre de la mesa */}
          <div>
            <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-2">
              <FileText className="h-4 w-4 inline mr-2" />
              Nombre personalizado (opcional)
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              placeholder={`Mesa ${mesa.numero}`}
              className="w-full px-3 py-2 border border-[color:var(--sp-neutral-300)] rounded-lg focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-[color:var(--sp-primary-500)]"
              disabled={guardando}
            />
          </div>

          {/* Zona */}
          <div>
            <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-2">
              <MapPin className="h-4 w-4 inline mr-2" />
              Zona *
            </label>
            <select
              value={formData.zona}
              onChange={(e) => handleInputChange('zona', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-[color:var(--sp-primary-500)] ${
                errors.zona ? 'border-[color:var(--sp-error-300)]' : 'border-[color:var(--sp-neutral-300)]'
              }`}
              disabled={guardando}
            >
              <option value="">Seleccionar zona</option>
              <option value="Terraza">Terraza</option>
              <option value="Salón principal">Salón principal</option>
              <option value="Área VIP">Área VIP</option>
              <option value="Exterior">Exterior</option>
              <option value="Barra">Barra</option>
            </select>
            {errors.zona && (
              <p className="mt-1 text-sm text-[color:var(--sp-error-600)] flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.zona}
              </p>
            )}
          </div>

          {/* Capacidad */}
          <div>
            <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-2">
              <Users className="h-4 w-4 inline mr-2" />
              Capacidad de personas *
            </label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => handleInputChange('capacidad', Math.max(1, formData.capacidad - 1))}
                disabled={guardando || formData.capacidad <= 1}
                className="p-2 border border-[color:var(--sp-neutral-300)] rounded-lg hover:bg-[color:var(--sp-neutral-50)] disabled:opacity-50"
              >
                <Minus className="h-4 w-4" />
              </button>
              
              <input
                type="number"
                value={formData.capacidad}
                onChange={(e) => handleInputChange('capacidad', parseInt(e.target.value) || 1)}
                min="1"
                max="20"
                className={`w-20 px-3 py-2 border rounded-lg text-center focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-[color:var(--sp-primary-500)] ${
                  errors.capacidad ? 'border-[color:var(--sp-error-300)]' : 'border-[color:var(--sp-neutral-300)]'
                }`}
                disabled={guardando}
              />
              
              <button
                type="button"
                onClick={() => handleInputChange('capacidad', Math.min(20, formData.capacidad + 1))}
                disabled={guardando || formData.capacidad >= 20}
                className="p-2 border border-[color:var(--sp-neutral-300)] rounded-lg hover:bg-[color:var(--sp-neutral-50)] disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
              
              <span className="text-sm text-[color:var(--sp-neutral-500)]">personas</span>
            </div>
            {errors.capacidad && (
              <p className="mt-1 text-sm text-[color:var(--sp-error-600)] flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.capacidad}
              </p>
            )}
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-2">
              Notas adicionales (opcional)
            </label>
            <textarea
              value={formData.notas}
              onChange={(e) => handleInputChange('notas', e.target.value)}
              placeholder="Ej: Mesa con vista al jardín, requiere reserva..."
              rows={3}
              className="w-full px-3 py-2 border border-[color:var(--sp-neutral-300)] rounded-lg focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-[color:var(--sp-primary-500)]"
              disabled={guardando}
            />
          </div>
        </div>

        {/* Footer */}
  <div className="flex items-center justify-end space-x-3 p-6 border-t border-[color:var(--sp-border)] bg-[color:var(--sp-neutral-50)] rounded-b-xl">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={guardando}
          >
            Cancelar
          </Button>
          
          <Button
            variant="blue"
            onClick={handleGuardar}
            disabled={guardando}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{guardando ? 'Guardando...' : 'Guardar cambios'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditarMesaModal;
