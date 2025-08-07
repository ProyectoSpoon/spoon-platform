// ========================================
// COMBINACIONES DE ESPECIALES - TEMPORAL
// File: src/app/dashboard/carta/especiales/pages/EspecialesCombinationsPage.tsx
// ========================================

'use client';

import React from 'react';
import { ArrowLeft, Heart, Star, Edit3, Trash2 } from 'lucide-react';

interface EspecialesCombinationsPageProps {
  specialData: any;
  onBack: () => void;
}

export default function EspecialesCombinationsPage({ specialData, onBack }: EspecialesCombinationsPageProps) {
  const { currentSpecialDish, specialCombinations } = specialData;

  return (
    <div className="space-y-6">
      
      {/* ✅ HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </button>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Combinaciones de {currentSpecialDish?.dish_name || 'Especial'}
            </h2>
            <p className="text-gray-600 text-sm">
              Gestiona las combinaciones generadas para este plato especial
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            Precio: <span className="font-semibold text-gray-900">
              ${currentSpecialDish?.dish_price.toLocaleString()}
            </span>
          </div>
          
          {currentSpecialDish?.is_active && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Activo Hoy
            </span>
          )}
        </div>
      </div>

      {/* ✅ COMBINACIONES O ESTADO VACÍO */}
      {specialCombinations.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Combinaciones Disponibles
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {specialCombinations.length} combinación(es) generada(s)
            </p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {specialCombinations.map((combo: any) => (
              <div key={combo.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {combo.nombre || 'Combinación Sin Nombre'}
                      </h4>
                      
                      <div className="flex items-center gap-2">
                        {combo.favorito && (
                          <Heart className="w-4 h-4 text-red-500 fill-current" />
                        )}
                        {combo.destacado && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                        
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          combo.disponibleHoy 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {combo.disponibleHoy ? 'Disponible Hoy' : 'No Disponible'}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">
                      {combo.descripcion || 'Sin descripción'}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div>
                        <strong>Precio:</strong> ${combo.precio?.toLocaleString()}
                      </div>
                      
                      {combo.cantidadMaxima && (
                        <div>
                          <strong>Máx. diario:</strong> {combo.cantidadMaxima}
                        </div>
                      )}
                      
                      {combo.cantidadVendida > 0 && (
                        <div>
                          <strong>Vendidos:</strong> {combo.cantidadVendida}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => alert('Editar combinación (en desarrollo)')}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => alert('Eliminar combinación (en desarrollo)')}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ✅ ESTADO VACÍO */
        <div className="bg-white rounded-lg shadow-sm p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🍽️</span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay combinaciones
            </h3>
            
            <p className="text-gray-600 mb-6">
              Este plato especial aún no tiene combinaciones generadas. 
              Las combinaciones se crean automáticamente cuando el especial está configurado correctamente.
            </p>
            
            <button
              onClick={() => alert('Generar combinaciones (en desarrollo)')}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Generar Combinaciones
            </button>
          </div>
        </div>
      )}

      {/* ✅ INFO DEL ESPECIAL */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">
          Información del Especial:
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Estado:</span>
            <div className="font-medium">{currentSpecialDish?.status}</div>
          </div>
          <div>
            <span className="text-gray-500">Productos:</span>
            <div className="font-medium">{currentSpecialDish?.total_products_selected}</div>
          </div>
          <div>
            <span className="text-gray-500">Categorías:</span>
            <div className="font-medium">{currentSpecialDish?.categories_configured}</div>
          </div>
          <div>
            <span className="text-gray-500">Configurado:</span>
            <div className="font-medium">
              {currentSpecialDish?.setup_completed ? '✅ Sí' : '❌ No'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}