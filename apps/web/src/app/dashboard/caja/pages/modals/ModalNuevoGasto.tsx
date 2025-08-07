'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@spoon/shared/components/ui/Card';
import { Button } from '@spoon/shared/components/ui/Button';
import { Input } from '@spoon/shared/components/ui/Input';
import { NuevoGasto, CategoriaGasto } from '../../types/cajaTypes';
import { 
  formatCurrency, 
  CATEGORIAS_GASTOS, 
  CONCEPTOS_FRECUENTES,
  VALIDACIONES_GASTOS,
  getIconoCategoria,
  getColorCategoria
} from '../../constants/cajaConstants';

interface ModalNuevoGastoProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmar: (gasto: NuevoGasto) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;
  loading?: boolean;
}

export const ModalNuevoGasto: React.FC<ModalNuevoGastoProps> = ({
  isOpen,
  onClose,
  onConfirmar,
  loading = false
}) => {
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState<number>(0);
  const [categoria, setCategoria] = useState<CategoriaGasto>('otro');
  const [notas, setNotas] = useState('');
  const [errores, setErrores] = useState<string[]>([]);
  const [procesando, setProcesando] = useState(false);
  const [gastoExitoso, setGastoExitoso] = useState(false);
  const [showConceptosSugeridos, setShowConceptosSugeridos] = useState(false);

  // Reset modal al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setConcepto('');
      setMonto(0);
      setCategoria('otro');
      setNotas('');
      setErrores([]);
      setGastoExitoso(false);
      setShowConceptosSugeridos(false);
    }
  }, [isOpen]);

  const validarFormulario = (): boolean => {
    const nuevosErrores: string[] = [];

    if (!concepto.trim() || concepto.trim().length < VALIDACIONES_GASTOS.CONCEPTO_MIN_LENGTH) {
      nuevosErrores.push(`El concepto debe tener al menos ${VALIDACIONES_GASTOS.CONCEPTO_MIN_LENGTH} caracteres`);
    }

    if (monto < VALIDACIONES_GASTOS.MONTO_MINIMO) {
      nuevosErrores.push('El monto debe ser mayor a $1');
    }

    if (monto > VALIDACIONES_GASTOS.MONTO_MAXIMO) {
      nuevosErrores.push('El monto no puede exceder $1,000,000');
    }

    if (notas.length > VALIDACIONES_GASTOS.NOTAS_MAX_LENGTH) {
      nuevosErrores.push('Las notas no pueden exceder 500 caracteres');
    }

    setErrores(nuevosErrores);
    return nuevosErrores.length === 0;
  };

  const handleConfirmarGasto = async () => {
    if (!validarFormulario()) return;

    try {
      setProcesando(true);
      
      const nuevoGasto: NuevoGasto = {
        concepto: concepto.trim(),
        monto: Math.round(monto * 100), // Convertir a centavos
        categoria,
        notas: notas.trim() || undefined
      };

      const resultado = await onConfirmar(nuevoGasto);

      if (resultado.success) {
        setGastoExitoso(true);
        // Auto-cerrar después de 2 segundos
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setErrores([resultado.error || 'Error registrando el gasto']);
      }
    } catch (err: any) {
      setErrores([err.message || 'Error inesperado']);
    } finally {
      setProcesando(false);
    }
  };

  const handleClose = () => {
    if (!procesando) {
      onClose();
    }
  };

  const seleccionarConceptoSugerido = (conceptoSugerido: string) => {
    setConcepto(conceptoSugerido);
    setShowConceptosSugeridos(false);
  };

  const conceptosSugeridos = CONCEPTOS_FRECUENTES[categoria] || [];

  if (!isOpen) return null;

  // Pantalla de éxito
  if (gastoExitoso) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ¡Gasto Registrado!
              </h3>
              <p className="text-gray-600">
                {concepto} - {formatCurrency(monto * 100)}
              </p>
            </div>
            <Button onClick={handleClose} className="w-full">
              Continuar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💸</span>
              <span>Nuevo Gasto</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={procesando}
            >
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Selección de categoría */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Categoría del gasto</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIAS_GASTOS.map((cat) => (
                <Button
                  key={cat.value}
                  variant={categoria === cat.value ? "default" : "outline"}
                  onClick={() => setCategoria(cat.value)}
                  disabled={procesando}
                  className={`flex items-center justify-start space-x-2 p-3 h-auto ${
                    categoria === cat.value 
                      ? `bg-${cat.color}-500 hover:bg-${cat.color}-600` 
                      : `border-${cat.color}-200 hover:bg-${cat.color}-50`
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-sm">{cat.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Concepto del gasto */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Concepto del gasto</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConceptosSugeridos(!showConceptosSugeridos)}
                disabled={procesando}
                className="text-xs"
              >
                💡 Sugerencias
              </Button>
            </div>
            
            <Input
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              placeholder="Ej: Compra de verduras, Pago de servicios..."
              disabled={procesando}
              maxLength={VALIDACIONES_GASTOS.CONCEPTO_MAX_LENGTH}
            />

            {/* Conceptos sugeridos */}
            {showConceptosSugeridos && conceptosSugeridos.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-2">Conceptos frecuentes para {categoria}:</p>
                <div className="space-y-1">
                  {conceptosSugeridos.map((sugerencia, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => seleccionarConceptoSugerido(sugerencia)}
                      className="w-full justify-start text-xs h-auto py-1"
                    >
                      {sugerencia}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500">
              {concepto.length}/{VALIDACIONES_GASTOS.CONCEPTO_MAX_LENGTH} caracteres
            </p>
          </div>

          {/* Monto del gasto */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Monto gastado</label>
            <Input
              type="number"
              value={monto}
              onChange={(e) => setMonto(parseFloat(e.target.value || '0'))}
              placeholder="0"
              className="text-right text-lg"
              disabled={procesando}
              min={1}
              max={1000000}
              step={0.01}
            />
            <p className="text-xs text-gray-500">
              Equivale a: {formatCurrency(Math.round(monto * 100))}
            </p>

            {/* Montos rápidos */}
            <div className="space-y-2">
              <label className="text-xs text-gray-500">Montos rápidos</label>
              <div className="grid grid-cols-4 gap-2">
                {[5000, 10000, 20000, 50000].map((montoRapido) => (
                  <Button
                    key={montoRapido}
                    variant="outline"
                    size="sm"
                    onClick={() => setMonto(montoRapido)}
                    disabled={procesando}
                    className="text-xs"
                  >
                    ${montoRapido.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Notas adicionales */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Notas adicionales (opcional)</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Detalles adicionales sobre el gasto..."
              className="w-full p-2 border rounded-md resize-none h-20 text-sm"
              disabled={procesando}
              maxLength={VALIDACIONES_GASTOS.NOTAS_MAX_LENGTH}
            />
            <p className="text-xs text-gray-500">
              {notas.length}/{VALIDACIONES_GASTOS.NOTAS_MAX_LENGTH} caracteres
            </p>
          </div>

          {/* Errores de validación */}
          {errores.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-sm text-red-700">
                {errores.map((error, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={procesando}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmarGasto}
              disabled={procesando || concepto.trim().length < 3 || monto <= 0}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {procesando ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Registrando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>💸</span>
                  <span>Registrar Gasto</span>
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};