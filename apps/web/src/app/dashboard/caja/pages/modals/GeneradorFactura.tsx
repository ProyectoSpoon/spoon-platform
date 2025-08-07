"use client";

// packages/shared/caja/components/GeneradorFactura.tsx
import React, { useState, useEffect } from 'react';
import { X, Receipt, AlertCircle, CheckCircle, User, Phone, Mail, FileText } from 'lucide-react';

// Importar funciones de supabase
import { generarFactura, getProximoNumeroFactura } from '@spoon/shared/lib/supabase';

// Importar tipos y constantes
import type { TransaccionCaja } from '@spoon/shared/lib/supabase';
import { formatearMonto, VALIDACIONES, MENSAJES_FACTURACION } from '../../constants/facturacion/facturaConstants';




interface DatosCliente {
  nombre: string;
  documento: string;
  email: string;
  telefono: string;
}

interface GeneradorFacturaProps {
  transaccion: TransaccionCaja;
  onFacturaGenerada: (factura: any) => void;
  onCerrar: () => void;
}

export function GeneradorFactura({ transaccion, onFacturaGenerada, onCerrar }: GeneradorFacturaProps) {
  const [datosCliente, setDatosCliente] = useState<DatosCliente>({
    nombre: '',
    documento: '',
    email: '',
    telefono: ''
  });
  
  const [proximoNumero, setProximoNumero] = useState<string>('');
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [erroresValidacion, setErroresValidacion] = useState<Record<string, string>>({});

  // Cargar próximo número de factura al montar
  useEffect(() => {
    const cargarProximoNumero = async () => {
      try {
        // Obtener restaurant_id de la transacción o sesión de caja
        const restaurantId = transaccion.restaurant_id || 
                            transaccion.caja_sesiones?.restaurant_id;
        
        if (!restaurantId) {
          console.warn('No se pudo obtener restaurant_id para vista previa');
          setProximoNumero('FACT######');
          return;
        }
        
        const { data, error } = await getProximoNumeroFactura(restaurantId);
        
        if (error) {
          console.error('Error obteniendo próximo número:', error);
          setProximoNumero('FACT######');
        } else {
          setProximoNumero(data || 'FACT######');
        }
      } catch (err) {
        console.error('Error cargando próximo número:', err);
        setProximoNumero('FACT######');
      }
    };

    cargarProximoNumero();
  }, [transaccion]);
  
  const validarDatos = (): boolean => {
    const errores: Record<string, string> = {};
    
    // Validar email si está presente
    if (datosCliente.email && !VALIDACIONES.CLIENTE_EMAIL.pattern.test(datosCliente.email)) {
      errores.email = MENSAJES_FACTURACION.EMAIL_INVALIDO;
    }
    
    // Validar teléfono si está presente
    if (datosCliente.telefono) {
      const telefonoLimpio = datosCliente.telefono.replace(/\D/g, '');
      if (!VALIDACIONES.CLIENTE_TELEFONO.pattern.test(telefonoLimpio)) {
        errores.telefono = MENSAJES_FACTURACION.TELEFONO_INVALIDO;
      }
    }
    
    // Validar documento si está presente
    if (datosCliente.documento && datosCliente.documento.length < VALIDACIONES.CLIENTE_DOCUMENTO.minLength) {
      errores.documento = `Documento debe tener al menos ${VALIDACIONES.CLIENTE_DOCUMENTO.minLength} caracteres`;
    }
    
    setErroresValidacion(errores);
    return Object.keys(errores).length === 0;
  };

  const handleInputChange = (campo: keyof DatosCliente, valor: string) => {
    setDatosCliente(prev => ({ 
      ...prev, 
      [campo]: valor 
    }));
    
    // Limpiar error específico cuando el usuario corrige
    if (erroresValidacion[campo]) {
      setErroresValidacion(prev => {
        const nuevos = { ...prev };
        delete nuevos[campo];
        return nuevos;
      });
    }
    
    // Limpiar error general
    if (error) {
      setError(null);
    }
  };
  
  const handleGenerar = async () => {
    // Resetear estados
    setError(null);
    setSuccess(false);
    
    // Validar datos
    if (!validarDatos()) {
      setError(MENSAJES_FACTURACION.ERROR_VALIDACION);
      return;
    }

    setGenerando(true);
    
    try {
      console.log('🧾 Generando factura para transacción:', transaccion.id);
      
      // Calcular impuestos (19% IVA)
      const subtotal = transaccion.monto_total;
      const impuestos = Math.round(subtotal * 0.19);
      const total = subtotal + impuestos;
      
      // Obtener restaurant_id (desde sesión de caja o contexto)
      const restaurantId = transaccion.restaurant_id || 
                          transaccion.caja_sesiones?.restaurant_id || 
                          '';

      if (!restaurantId) {
        throw new Error('No se pudo obtener el ID del restaurante');
      }

      // Preparar datos para factura (CORREGIDO para coincidir con supabase.ts)
      const datosFactura = {
        restaurantId: restaurantId,
        transaccionId: transaccion.id,
        clienteNombre: datosCliente.nombre || 'Cliente General',
        clienteDocumento: datosCliente.documento || undefined,
        subtotal: subtotal,
        impuestos: impuestos,
        total: total,
        metodoPago: transaccion.metodo_pago,
        detalles: { // CAMBIADO: usar 'detalles' en lugar de 'detallesOrden'
          transaccion_original: transaccion,
          cliente_datos: datosCliente,
          metodo_pago: transaccion.metodo_pago,
          monto_recibido: transaccion.monto_recibido,
          monto_cambio: transaccion.monto_cambio,
          fecha_transaccion: transaccion.procesada_at,
          items_detalle: [
            {
              descripcion: `Consumo ${transaccion.tipo_orden}${transaccion.tipo_orden === 'mesa' ? ` #${transaccion.orden_id.slice(-6)}` : ''}`,
              cantidad: 1,
              precio_unitario: subtotal,
              precio_total: subtotal
            }
          ]
        }
      };
      
      console.log('📋 Datos de factura preparados:', datosFactura);
      
      const { factura, error: facturaError } = await generarFactura(datosFactura);
      
      if (facturaError) {
        throw facturaError;
      }
      
      if (!factura) {
        throw new Error('No se pudo generar la factura');
      }
      
      console.log('✅ Factura generada exitosamente:', factura.numero_factura);
      
      setSuccess(true);
      
      // Esperar un momento para mostrar el éxito antes de cerrar
      setTimeout(() => {
        onFacturaGenerada(factura);
      }, 1500);
      
    } catch (err) {
      console.error('❌ Error generando factura:', err);
      setError(err instanceof Error ? err.message : MENSAJES_FACTURACION.ERROR_GENERAR);
    } finally {
      setGenerando(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCerrar();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleGenerar();
    }
  };
  
  if (success) {
    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onKeyDown={handleKeyDown}
      >
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ¡Factura Generada!
            </h3>
            <p className="text-green-600 mb-4">
              {MENSAJES_FACTURACION.FACTURA_GENERADA}
            </p>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-sm text-green-700">
                Número: <span className="font-mono font-bold">{proximoNumero}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Generar Factura
          </h3>
          <button
            onClick={onCerrar}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            disabled={generando}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Vista previa de factura */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm text-gray-600">Número de factura:</p>
              <p className="font-mono text-sm font-bold">{proximoNumero}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total a facturar:</p>
              <p className="text-2xl font-bold">{formatearMonto(transaccion.monto_total)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Método:</p>
              <p className="font-medium capitalize">{transaccion.metodo_pago}</p>
            </div>
            <div>
              <p className="text-gray-600">Tipo:</p>
              <p className="font-medium capitalize">{transaccion.tipo_orden}</p>
            </div>
          </div>
        </div>
        
        {/* Error general */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}
        
        {/* Datos del cliente */}
        <div className="space-y-4 mb-6">
          <h4 className="font-medium flex items-center gap-2">
            <User className="w-4 h-4" />
            Datos del Cliente (Opcional)
          </h4>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Nombre del Cliente
            </label>
            <input
              type="text"
              value={datosCliente.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                erroresValidacion.nombre ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={MENSAJES_FACTURACION.PLACEHOLDER_CLIENTE}
              disabled={generando}
            />
            {erroresValidacion.nombre && (
              <p className="text-red-600 text-xs mt-1">{erroresValidacion.nombre}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              <FileText className="w-3 h-3 inline mr-1" />
              Cédula/NIT (Opcional)
            </label>
            <input
              type="text"
              value={datosCliente.documento}
              onChange={(e) => handleInputChange('documento', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                erroresValidacion.documento ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={MENSAJES_FACTURACION.PLACEHOLDER_DOCUMENTO}
              disabled={generando}
            />
            {erroresValidacion.documento && (
              <p className="text-red-600 text-xs mt-1">{erroresValidacion.documento}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              <Mail className="w-3 h-3 inline mr-1" />
              Email (Opcional)
            </label>
            <input
              type="email"
              value={datosCliente.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                erroresValidacion.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={MENSAJES_FACTURACION.PLACEHOLDER_EMAIL}
              disabled={generando}
            />
            {erroresValidacion.email && (
              <p className="text-red-600 text-xs mt-1">{erroresValidacion.email}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              <Phone className="w-3 h-3 inline mr-1" />
              Teléfono (Opcional)
            </label>
            <input
              type="tel"
              value={datosCliente.telefono}
              onChange={(e) => handleInputChange('telefono', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                erroresValidacion.telefono ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={MENSAJES_FACTURACION.PLACEHOLDER_TELEFONO}
              disabled={generando}
            />
            {erroresValidacion.telefono && (
              <p className="text-red-600 text-xs mt-1">{erroresValidacion.telefono}</p>
            )}
          </div>
        </div>
        
        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <p className="text-blue-800 text-xs">
            <strong>Nota:</strong> Esta factura se generará con los datos de la transacción ya procesada. 
            El subtotal incluye el 19% de IVA según la normativa vigente.
          </p>
        </div>
        
        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={onCerrar}
            className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={generando}
          >
            Cancelar
          </button>
          <button
            onClick={handleGenerar}
            disabled={generando}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {generando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {MENSAJES_FACTURACION.GENERANDO_FACTURA}
              </>
            ) : (
              <>
                <Receipt className="w-4 h-4" />
                Generar Factura
              </>
            )}
          </button>
        </div>
        
        {/* Shortcuts hint */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Esc</kbd> para cancelar • 
            <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+Enter</kbd> para generar
          </p>
        </div>
      </div>
    </div>
  );
}