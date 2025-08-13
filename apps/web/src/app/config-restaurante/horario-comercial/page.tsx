'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Clock, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { getUserProfile, getUserRestaurant, updateRestaurant } from '@spoon/shared';
import toast from 'react-hot-toast';
import { Grid } from '@spoon/shared/components/ui/Grid';

// Tipos
interface Turno {
  horaApertura: string;
  horaCierre: string;
}

interface HorarioDia {
  abierto: boolean;
  turnos: Turno[];
}

interface Horarios {
  lunes: HorarioDia;
  martes: HorarioDia;
  miercoles: HorarioDia;
  jueves: HorarioDia;
  viernes: HorarioDia;
  sabado: HorarioDia;
  domingo: HorarioDia;
}

type DiaSemana = keyof Horarios;

// Constantes
const DIAS_SEMANA: DiaSemana[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

const NOMBRES_DIAS: Record<DiaSemana, string> = {
  lunes: 'Lunes',
  martes: 'Martes', 
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo'
};

// Generar opciones de hora (6:00 AM a 11:30 PM)
const generarOpcionesHora = () => {
  const opciones = [];
  for (let hora = 6; hora <= 23; hora++) {
    for (let minuto = 0; minuto < 60; minuto += 30) {
      if (hora === 23 && minuto === 30) continue; // No permitir 11:30 PM como cierre
      const horaStr = hora.toString().padStart(2, '0');
      const minutoStr = minuto.toString().padStart(2, '0');
      const hora24 = `${horaStr}:${minutoStr}`;
      const hora12 = formatTo12Hour(hora24);
      opciones.push({ value: hora24, label: hora12 });
    }
  }
  return opciones;
};

// Formatear a 12 horas
const formatTo12Hour = (hora24: string) => {
  const [hora, minuto] = hora24.split(':').map(Number);
  const periodo = hora >= 12 ? 'PM' : 'AM';
  const hora12 = hora === 0 ? 12 : hora > 12 ? hora - 12 : hora;
  return `${hora12}:${minuto.toString().padStart(2, '0')} ${periodo}`;
};

// Estado inicial
const estadoInicial: Horarios = {
  lunes: { abierto: false, turnos: [{ horaApertura: '08:00', horaCierre: '18:00' }] },
  martes: { abierto: false, turnos: [{ horaApertura: '08:00', horaCierre: '18:00' }] },
  miercoles: { abierto: false, turnos: [{ horaApertura: '08:00', horaCierre: '18:00' }] },
  jueves: { abierto: false, turnos: [{ horaApertura: '08:00', horaCierre: '18:00' }] },
  viernes: { abierto: false, turnos: [{ horaApertura: '08:00', horaCierre: '18:00' }] },
  sabado: { abierto: false, turnos: [{ horaApertura: '08:00', horaCierre: '18:00' }] },
  domingo: { abierto: false, turnos: [{ horaApertura: '08:00', horaCierre: '18:00' }] }
};

export default function HorarioComercialPage() {
  const router = useRouter();
  const [horarios, setHorarios] = useState<Horarios>(estadoInicial);
  const [diaSeleccionado, setDiaSeleccionado] = useState<DiaSemana>('lunes');
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tabAnim, setTabAnim] = useState(false);

  const opcionesHora = generarOpcionesHora();

  // Animación al cambiar de día
  useEffect(() => {
    setTabAnim(true);
    const timer = setTimeout(() => setTabAnim(false), 350);
    return () => clearTimeout(timer);
  }, [diaSeleccionado]);

  // Cargar datos existentes con timeout de seguridad
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const cargarDatos = async () => {
      try {
        timeout = setTimeout(() => {
          if (cargando) {
            setCargando(false);
            setError('La carga está tardando demasiado. Verifica tu conexión o recarga la página.');
          }
        }, 12000);

        const profile = await getUserProfile();
        const restaurant = await getUserRestaurant();
        
        if (restaurant) {
          setRestaurantId(restaurant.id);
          if (restaurant.business_hours && Object.keys(restaurant.business_hours).length > 0) {
            setHorarios(restaurant.business_hours as Horarios);
          }
        }
      } catch (err: any) {
        setError('Error al cargar información. Intenta nuevamente.');
        console.error('❌ Error cargando datos:', err);
      } finally {
        setCargando(false);
        clearTimeout(timeout);
      }
    };

    cargarDatos();
    return () => clearTimeout(timeout);
  }, []);

  // Validar horarios
  const validarHorarios = (horarios: Horarios): string[] => {
    const errores: string[] = [];
    DIAS_SEMANA.forEach(dia => {
      const horarioDia = horarios[dia];
      if (!horarioDia.abierto) return;
      horarioDia.turnos.forEach((turno, index) => {
        const apertura = parseInt(turno.horaApertura.replace(':', ''));
        const cierre = parseInt(turno.horaCierre.replace(':', ''));
        if (apertura >= cierre) {
          errores.push(`${NOMBRES_DIAS[dia]} - Turno ${index + 1}: La hora de cierre debe ser posterior a la de apertura`);
        }
      });
      for (let i = 0; i < horarioDia.turnos.length - 1; i++) {
        const turno1 = horarioDia.turnos[i];
        const turno2 = horarioDia.turnos[i + 1];
        const cierre1 = parseInt(turno1.horaCierre.replace(':', ''));
        const apertura2 = parseInt(turno2.horaApertura.replace(':', ''));
        if (cierre1 > apertura2) {
          errores.push(`${NOMBRES_DIAS[dia]}: Los turnos ${i + 1} y ${i + 2} se solapan`);
        }
      }
    });
    return errores;
  };

  const tieneHorariosConfigurados = () => {
    return DIAS_SEMANA.some(dia => horarios[dia].abierto);
  };

  const toggleDiaAbierto = (dia: DiaSemana, abierto: boolean) => {
    setHorarios(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        abierto
      }
    }));
  };

  const actualizarTurno = (dia: DiaSemana, indice: number, cambios: Partial<Turno>) => {
    setHorarios(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        turnos: prev[dia].turnos.map((turno, i) => 
          i === indice ? { ...turno, ...cambios } : turno
        )
      }
    }));
  };

  const agregarTurno = (dia: DiaSemana) => {
    if (horarios[dia].turnos.length >= 3) return;
    setHorarios(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        turnos: [...prev[dia].turnos, { horaApertura: '08:00', horaCierre: '18:00' }]
      }
    }));
  };

  const eliminarTurno = (dia: DiaSemana, indice: number) => {
    if (horarios[dia].turnos.length <= 1) return;
    setHorarios(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        turnos: prev[dia].turnos.filter((_, i) => i !== indice)
      }
    }));
  };

  const copiarHorarios = (origen: DiaSemana, destino: DiaSemana) => {
    setHorarios(prev => ({
      ...prev,
      [destino]: { ...prev[origen] }
    }));
    toast.success(`Horarios copiados de ${NOMBRES_DIAS[origen]} a ${NOMBRES_DIAS[destino]}`);
  };

  const guardarHorarios = async () => {
    if (!restaurantId) {
      toast.error('No se encontró información del restaurante');
      return false;
    }
    const errores = validarHorarios(horarios);
    if (errores.length > 0) {
      toast.error(`Errores en horarios: ${errores[0]}`);
      return false;
    }
    try {
      setGuardando(true);
      await updateRestaurant(restaurantId, {
        business_hours: horarios
      });
      return true;
    } catch (error) {
      console.error('❌ Error guardando horarios:', error);
      throw error;
    } finally {
      setGuardando(false);
    }
  };

  const handleVolver = () => {
    router.push('/config-restaurante');
  };

  const handleContinuar = async () => {
    const errores = validarHorarios(horarios);
    if (errores.length > 0) {
      toast.error(`Corrige los errores: ${errores.join(', ')}`);
      return;
    }
    try {
      const exito = await guardarHorarios();
      if (exito) {
        toast.success('Horarios guardados correctamente');
        router.push('/config-restaurante/logo-portada');
      }
    } catch (error) {
      toast.error('Error al guardar horarios');
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center animate-fade-in" role="status">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando horarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center animate-fade-in" role="alert">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <p className="text-red-700 font-semibold mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }

  const horarioDiaActual = horarios[diaSeleccionado];
  const errores = validarHorarios(horarios);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleVolver}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
            <div className="text-center flex-1">
              <span className="text-sm text-gray-500 font-medium">Paso 3 de 4</span>
            </div>
            <div className="w-20"></div>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Horario Comercial
            </h1>
            <p className="text-gray-600">
              Configura los horarios de atención de tu restaurante para cada día de la semana
            </p>
            {errores.length > 0 && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 animate-fade-in" role="alert">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Hay errores en los horarios configurados</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs de días */}
        <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-lg">
          <div className="flex gap-1 overflow-x-auto" role="tablist">
            {DIAS_SEMANA.map((dia) => (
              <button
                key={dia}
                role="tab"
                aria-selected={diaSeleccionado === dia}
                aria-current={diaSeleccionado === dia ? 'page' : undefined}
                onClick={() => setDiaSeleccionado(dia)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap relative focus:outline-none ${
                  diaSeleccionado === dia
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {NOMBRES_DIAS[dia]}
                {diaSeleccionado === dia && (
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-3/4 h-1 bg-orange-500 rounded-full animate-fade-in" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vista general */}
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Horarios de la semana</h3>
            <div className="space-y-3">
              {DIAS_SEMANA.map((dia) => {
                const horarioDia = horarios[dia];
                return (
                  <div
                    key={dia}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      diaSeleccionado === dia 
                        ? 'border-gray-300 bg-gray-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          horarioDia.abierto ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                      <span className="font-medium text-gray-900 w-20">
                        {NOMBRES_DIAS[dia]}
                      </span>
                    </div>
                    <div className="flex-1 text-sm text-gray-600 mx-4">
                      {horarioDia.abierto ? (
                        horarioDia.turnos.map((turno, i) => (
                          <span key={i} className="mr-3">
                            {formatTo12Hour(turno.horaApertura)} - {formatTo12Hour(turno.horaCierre)}
                          </span>
                        ))
                      ) : (
                        <span className="text-red-600 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Cerrado</span>
                      )}
                    </div>
                    <button
                      onClick={() => setDiaSeleccionado(dia)}
                      className="text-xs px-3 py-1 rounded border text-blue-600 border-blue-200 hover:bg-blue-50 transition-colors"
                    >
                      Editar
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Editor */}
          <div className={`bg-white p-5 border border-gray-100 rounded-lg shadow-lg transition-all duration-300 ${tabAnim ? 'scale-[1.03] bg-orange-50' : ''}`}>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Configurar {NOMBRES_DIAS[diaSeleccionado]}
            </h3>
            <div className="space-y-4">
              {/* Estado del día */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Estado del día:
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleDiaAbierto(diaSeleccionado, true)}
                    className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                      horarioDiaActual.abierto
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Abierto
                  </button>
                  <button
                    onClick={() => toggleDiaAbierto(diaSeleccionado, false)}
                    className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                      !horarioDiaActual.abierto
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Cerrado
                  </button>
                </div>
              </div>

              {/* Horarios */}
              {horarioDiaActual.abierto && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Horarios:
                  </label>
                  <div className="space-y-4">
                    {horarioDiaActual.turnos.map((turno, indice) => (
                      <div key={indice} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">
                            Turno {indice + 1}
                          </span>
                          {horarioDiaActual.turnos.length > 1 && (
                            <button
                              onClick={() => eliminarTurno(diaSeleccionado, indice)}
                              className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1 transition-transform active:scale-95"
                              aria-label={`Eliminar turno ${indice + 1}`}
                            >
                              <Trash2 className="w-3 h-3" />
                              Eliminar
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Apertura:</label>
                            <select
                              value={turno.horaApertura}
                              onChange={(e) => actualizarTurno(diaSeleccionado, indice, { horaApertura: e.target.value })}
                              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                              {opcionesHora.map(opcion => (
                                <option key={opcion.value} value={opcion.value}>
                                  {opcion.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Cierre:</label>
                            <select
                              value={turno.horaCierre}
                              onChange={(e) => actualizarTurno(diaSeleccionado, indice, { horaCierre: e.target.value })}
                              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                              {opcionesHora.map(opcion => (
                                <option key={opcion.value} value={opcion.value}>
                                  {opcion.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => agregarTurno(diaSeleccionado)}
                      disabled={horarioDiaActual.turnos.length >= 3}
                      className={`w-full py-2 text-sm border rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                        horarioDiaActual.turnos.length >= 3
                          ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                          : 'text-blue-600 border-blue-200 hover:bg-blue-50 active:scale-95'
                      } animate-fade-in`}
                      aria-label="Agregar turno"
                    >
                      <Plus className="w-4 h-4" />
                      {horarioDiaActual.turnos.length >= 3 
                        ? 'Máximo 3 turnos por día'
                        : 'Agregar turno'
                      }
                    </button>
                  </div>
                </div>
              )}

              {/* Copiar horarios */}
              <div className="pt-4 border-t border-gray-200">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Acciones rápidas:
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      copiarHorarios(e.target.value as DiaSemana, diaSeleccionado);
                      e.target.value = '';
                    }
                  }}
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  defaultValue=""
                >
                  <option value="">Copiar desde otro día...</option>
                  {DIAS_SEMANA.filter(dia => dia !== diaSeleccionado).map(dia => (
                    <option key={dia} value={dia}>
                      {NOMBRES_DIAS[dia]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-lg">
          <div className="flex justify-between items-center">
            <button
              onClick={handleVolver}
              className="flex items-center gap-2 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Ubicación
            </button>
            <button
              onClick={handleContinuar}
              disabled={guardando || !tieneHorariosConfigurados() || errores.length > 0}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                tieneHorariosConfigurados() && !guardando && errores.length === 0
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {guardando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {errores.length > 0
                    ? 'Corrige errores primero'
                    : tieneHorariosConfigurados() 
                    ? 'Guardar y Continuar' 
                    : 'Configura horarios'
                  }
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info de progreso */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-md">
          <div className="flex items-center gap-3">
            <Clock className="text-blue-600 w-5 h-5" />
            <div>
              <h3 className="font-bold text-blue-800">Horarios de Atención</h3>
              <p className="text-sm text-blue-700">
                Define cuándo estará abierto tu restaurante. Horarios disponibles de 6:00 AM a 11:30 PM.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}