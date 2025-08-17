// Modal de Configuración de Mesas - SIMPLIFICADO (Solo cantidad total)
import React, { useState, useEffect } from 'react';
import { Button } from '@spoon/shared/components/ui/Button';
import { 
  X, 
  Check,
  Plus,
  Minus,
  Settings
} from 'lucide-react';

// ========================================
// INTERFACES SIMPLIFICADAS
// ========================================

interface ConfiguracionMesasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigurar: (totalMesas: number, distribucion?: any) => Promise<boolean>;
  loading: boolean;
  // Props para mostrar configuración actual
  configuracionActual?: {
    configuradas: boolean;
    totalMesas: number;
    zonas: string[];
  };
}

// ========================================
// COMPONENTE PRINCIPAL SIMPLIFICADO
// ========================================

const ConfiguracionMesasModal: React.FC<ConfiguracionMesasModalProps> = ({
  isOpen,
  onClose,
  onConfigurar,
  loading,
  configuracionActual
}) => {
  
  // ========================================
  // ESTADO SIMPLE - SOLO CANTIDAD DE MESAS
  // ========================================
  
  const [totalMesas, setTotalMesas] = useState<number>(
    configuracionActual?.totalMesas || 12
  );

  // Actualizar cuando cambie la configuración actual
  useEffect(() => {
    if (isOpen && configuracionActual?.configuradas) {
      setTotalMesas(configuracionActual.totalMesas);
      
    }
  }, [isOpen, configuracionActual]);

  // ========================================
  // FUNCIONES SIMPLES
  // ========================================

  const incrementarMesas = () => {
    if (totalMesas < 100) {
      setTotalMesas(prev => prev + 1);
    }
  };

  const decrementarMesas = () => {
    if (totalMesas > 1) {
      setTotalMesas(prev => prev - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = parseInt(e.target.value) || 0;
    if (valor >= 1 && valor <= 100) {
      setTotalMesas(valor);
    }
  };

  const handleConfigurar = async () => {
    
    
    try {
      // Pasamos solo el número total, sin distribución de zonas
      const success = await onConfigurar(totalMesas);
      
      
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('❌ Error en configuración:', error);
    }
  };

  const handleClose = () => {
    if (!loading) {
      // Resetear al valor actual o por defecto
      setTotalMesas(configuracionActual?.totalMesas || 12);
      onClose();
    }
  };

  // ========================================
  // RENDERIZADO SIMPLIFICADO
  // ========================================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[color:var(--sp-overlay)] z-50 flex items-center justify-center p-4">
      <div className="bg-[color:var(--sp-surface)] rounded-lg shadow-xl max-w-md w-full">
        
    {/* Header Simple */}
  <div className="bg-[color:var(--sp-surface-elevated)] text-[color:var(--sp-on-surface)] p-6 flex justify-between items-center rounded-t-lg">
          <div>
            <h2 className="text-xl font-bold">
              {configuracionActual?.configuradas ? 'Reconfigurar Mesas' : 'Configurar Mesas'}
            </h2>
            <p className="text-[color:var(--sp-neutral-300)] text-sm">
              {configuracionActual?.configuradas 
                ? `Actualmente: ${configuracionActual.totalMesas} mesas configuradas`
                : 'Define cuántas mesas tiene tu restaurante'
              }
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-[color:var(--sp-on-surface)] hover:text-[color:var(--sp-on-surface)]/80 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Contenido Principal */}
        <div className="p-8">
          <div className="text-center space-y-6">
            
            {/* Icono */}
            <div className="mx-auto w-16 h-16 bg-[color:var(--sp-info-100)] rounded-full flex items-center justify-center">
              <Settings className="h-8 w-8 text-[color:var(--sp-info-600)]" />
            </div>

            {/* Título */}
            <div>
              <h3 className="text-lg font-bold text-[color:var(--sp-on-surface)] mb-2">
                ¿Cuántas mesas tiene tu restaurante?
              </h3>
              <p className="text-[color:var(--sp-neutral-600)] text-sm">
                Configuraremos todas las mesas con numeración del 1 al {totalMesas}
              </p>
            </div>

            {/* Control de Cantidad */}
            <div className="bg-[color:var(--sp-surface-elevated)] rounded-xl p-6 space-y-4">
              
              {/* Controles de cantidad */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={decrementarMesas}
                  disabled={totalMesas <= 1}
                  className="w-12 h-12 rounded-full bg-[color:var(--sp-surface)] border-2 border-[color:var(--sp-border)] flex items-center justify-center hover:border-[color:var(--sp-focus)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="h-5 w-5 text-[color:var(--sp-neutral-600)]" />
                </button>
                
                <div className="text-center">
                  <input
                    type="number"
                    value={totalMesas}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    className="w-20 h-16 text-4xl font-bold text-center border-2 border-[color:var(--sp-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--sp-focus)] focus:outline-none"
                  />
                  <div className="text-sm text-[color:var(--sp-neutral-500)] mt-1">mesas</div>
                </div>
                
                <button
                  onClick={incrementarMesas}
                  disabled={totalMesas >= 100}
                  className="w-12 h-12 rounded-full bg-[color:var(--sp-surface)] border-2 border-[color:var(--sp-border)] flex items-center justify-center hover:border-[color:var(--sp-focus)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-5 w-5 text-[color:var(--sp-neutral-600)]" />
                </button>
              </div>

              {/* Presets rápidos eliminados: se mantiene solo control manual (+/-, input) */}
            </div>

            {/* Vista previa */}
      <div className="bg-[color:var(--sp-info-50)] rounded-lg p-4 border border-[color:var(--sp-info-200)]">
              <div className="text-center">
        <div className="text-2xl font-bold text-[color:var(--sp-info-600)] mb-1">
                  Mesa 1 → Mesa {totalMesas}
                </div>
        <div className="text-sm text-[color:var(--sp-info-700)]">
                  Se configurarán {totalMesas} mesa{totalMesas !== 1 ? 's' : ''} numerada{totalMesas !== 1 ? 's' : ''} consecutivamente
                </div>
              </div>
            </div>

            {/* Alerta si se está reconfigurando */}
            {configuracionActual?.configuradas && (
              <div className="bg-[color:var(--sp-warning-50)] border border-[color:var(--sp-warning-200)] rounded-lg p-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="text-[color:var(--sp-warning-600)] text-lg">⚠️</div>
                  <div>
                    <h4 className="font-bold text-[color:var(--sp-warning-800)] text-sm">Atención</h4>
                    <p className="text-[color:var(--sp-warning-700)] text-xs">
                      Cambiar la configuración reorganizará todas las mesas. 
                      Las órdenes activas se mantendrán pero la numeración puede cambiar.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer con botones */}
  <div className="p-6 border-t border-[color:var(--sp-border)] bg-[color:var(--sp-surface-elevated)] rounded-b-lg">
          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handleConfigurar}
              className="flex-1 bg-[color:var(--sp-success-600)] hover:bg-[color:var(--sp-success-700)] text-[color:var(--sp-neutral-0)]"
              disabled={loading || totalMesas < 1}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[color:var(--sp-neutral-0)] mr-2"></div>
                  Configurando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {configuracionActual?.configuradas ? 'Reconfigurar' : 'Configurar'} {totalMesas} Mesa{totalMesas !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>

          {/* Info adicional */}
          <p className="text-xs text-[color:var(--sp-neutral-500)] text-center mt-3">
            💡 Podrás modificar nombres y capacidades individuales después de la configuración
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionMesasModal;
