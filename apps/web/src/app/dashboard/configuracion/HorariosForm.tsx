import React, { useState, useEffect } from 'react';
import { Loader, Plus, Trash2, Save, Pencil } from 'lucide-react';
import { Button } from '@spoon/shared/components/ui/Button';
import { InlineEditButton } from '@spoon/shared/components/ui/components/InlineEditButton';
import { FormCard } from '@spoon/shared/components/ui/components/FormCard';
import toast from 'react-hot-toast';
import { getUserRestaurant, updateRestaurant } from '@spoon/shared/lib/supabase';

// Type casting para componentes de lucide-react y @spoon/shared
const LoaderCast = Loader as any;
const PlusCast = Plus as any;
const Trash2Cast = Trash2 as any;
const SaveCast = Save as any;
const PencilCast = Pencil as any;
const ButtonCast = Button as any;
const InlineEditButtonCast = InlineEditButton as any;
const FormCardCast = FormCard as any;

// Tipos para horarios
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

const estadoInicial: Horarios = {
  lunes: { abierto: false, turnos: [{ horaApertura: '08:00', horaCierre: '18:00' }] },
  martes: { abierto: false, turnos: [{ horaApertura: '08:00', horaCierre: '18:00' }] },
  miercoles: { abierto: false, turnos: [{ horaApertura: '08:00', horaCierre: '18:00' }] },
  jueves: { abierto: false, turnos: [{ horaApertura: '08:00', horaCierre: '18:00' }] },
  viernes: { abierto: false, turnos: [{ horaApertura: '08:00', horaCierre: '18:00' }] },
  sabado: { abierto: false, turnos: [{ horaApertura: '08:00', horaCierre: '18:00' }] },
  domingo: { abierto: false, turnos: [{ horaApertura: '08:00', horaCierre: '18:00' }] }
};

function formatTo12Hour(hora24: string) {
  const [hora, minuto] = hora24.split(':').map(Number);
  const periodo = hora >= 12 ? 'PM' : 'AM';
  const hora12 = hora === 0 ? 12 : hora > 12 ? hora - 12 : hora;
  return `${hora12}:${minuto.toString().padStart(2, '0')} ${periodo}`;
}

function generarOpcionesHora() {
  const opciones = [];
  for (let hora = 6; hora <= 23; hora++) {
    for (let minuto = 0; minuto < 60; minuto += 30) {
      if (hora === 23 && minuto === 30) continue;
      const horaStr = hora.toString().padStart(2, '0');
      const minutoStr = minuto.toString().padStart(2, '0');
      const hora24 = `${horaStr}:${minutoStr}`;
      const hora12 = formatTo12Hour(hora24);
      opciones.push({ value: hora24, label: hora12 });
    }
  }
  return opciones;
}

const opcionesHora = generarOpcionesHora();

export default function HorariosForm({ readOnly = false, showSave = true, onCancel, onToggleEdit }: { readOnly?: boolean; showSave?: boolean; onCancel?: () => void; onToggleEdit?: () => void }) {
  const [horarios, setHorarios] = useState<Horarios>(estadoInicial);
  const [diaSeleccionado, setDiaSeleccionado] = useState<DiaSemana>('lunes');
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const restaurant = await getUserRestaurant();
        if (restaurant) {
          setRestaurantId(restaurant.id);
          if (restaurant.business_hours && Object.keys(restaurant.business_hours).length > 0) {
            setHorarios(restaurant.business_hours as Horarios);
          }
        }
      } catch (error) {
        toast.error('Error al cargar información');
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

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
        turnos: prev[dia].turnos.map((turno, i) => i === indice ? { ...turno, ...cambios } : turno)
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

  const tieneHorariosConfigurados = () => {
    return DIAS_SEMANA.some(dia => horarios[dia].abierto);
  };

  const guardarHorarios = async () => {
    if (!restaurantId) {
      toast.error('No se encontró información del restaurante');
      return;
    }
    try {
      setGuardando(true);
      await updateRestaurant(restaurantId, { business_hours: horarios });
      toast.success('Horarios guardados correctamente');
    } catch (error) {
      toast.error('Error al guardar horarios');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <LoaderCast className="h-8 w-8 animate-spin mx-auto mb-4 text-[color:var(--sp-primary-600)]" />
          <p className="text-[color:var(--sp-neutral-600)]">Cargando horarios...</p>
        </div>
      </div>
    );
  }

  const horarioDiaActual = horarios[diaSeleccionado];

  return (
  <FormCardCast readOnly={readOnly} onToggleEdit={onToggleEdit} hideHeaderEdit contentClassName="space-y-6">
      {/* Tabs de días + acción editar */}
  <div className="bg-[color:var(--sp-neutral-50)] p-4 rounded-lg">
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1 overflow-x-auto">
            {DIAS_SEMANA.map((dia) => (
              <button
                key={dia}
                onClick={() => setDiaSeleccionado(dia)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  diaSeleccionado === dia
        ? 'bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)]'
        : 'bg-[color:var(--sp-surface)] text-[color:var(--sp-neutral-700)] hover:bg-[color:var(--sp-neutral-100)]'
                }`}
                disabled={readOnly}
              >
                {NOMBRES_DIAS[dia]}
              </button>
            ))}
          </div>
          {/* Icono editar alineado al nivel de los días (visible siempre; deshabilitado en modo edición) */}
          {onToggleEdit && (
            <InlineEditButtonCast onClick={onToggleEdit} editing={!readOnly} label="Editar horarios" />
          )}
        </div>
      </div>

      {/* Vista general */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div className="bg-[color:var(--sp-neutral-50)] p-4 rounded-lg">
          <h4 className="heading-section mb-4">Resumen de la semana</h4>
          <div className="space-y-3">
            {DIAS_SEMANA.map((dia) => {
              const horarioDia = horarios[dia];
              return (
                <div
                  key={dia}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    diaSeleccionado === dia
                      ? 'border-[color:var(--sp-primary-300)] bg-[color:var(--sp-primary-50)]'
                      : 'border-[color:var(--sp-neutral-200)] bg-[color:var(--sp-surface)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        horarioDia.abierto ? 'bg-[color:var(--sp-success-500)]' : 'bg-[color:var(--sp-error-500)]'
                      }`}
                    />
                    <span className="font-medium text-[color:var(--sp-neutral-900)] w-20">
                      {NOMBRES_DIAS[dia]}
                    </span>
                  </div>
                  <div className="flex-1 text-sm text-[color:var(--sp-neutral-600)] mx-4">
                    {horarioDia.abierto ? (
                      horarioDia.turnos.map((turno, i) => (
                        <span key={i} className="mr-3">
                          {formatTo12Hour(turno.horaApertura)} - {formatTo12Hour(turno.horaCierre)}
                        </span>
                      ))
                    ) : (
                      <span className="text-[color:var(--sp-error-600)]">Cerrado</span>
                    )}
                  </div>
                  <InlineEditButtonCast
                    onClick={() => setDiaSeleccionado(dia)}
                    disabled={readOnly}
                    className="h-8 w-8 border-[color:var(--sp-primary-200)] text-[color:var(--sp-primary-600)] hover:bg-[color:var(--sp-primary-50)]"
                    label={`Editar ${NOMBRES_DIAS[dia]}`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Editor */}
  <div className="bg-[color:var(--sp-surface-elevated)] border border-[color:var(--sp-neutral-200)] rounded-lg p-4">
          <h4 className="heading-section mb-4">
            Configurar {NOMBRES_DIAS[diaSeleccionado]}
          </h4>
          <div className="space-y-4">
            {/* Estado del día */}
            <div>
              <label className="text-sm font-medium text-[color:var(--sp-neutral-700)] mb-2 block">
                Estado del día:
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleDiaAbierto(diaSeleccionado, true)}
          className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    horarioDiaActual.abierto
            ? 'bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)] border-[color:var(--sp-primary-600)]'
            : 'bg-[color:var(--sp-surface)] text-[color:var(--sp-neutral-700)] border-[color:var(--sp-neutral-300)] hover:bg-[color:var(--sp-neutral-50)]'
                  }`}
                disabled={readOnly}
                >
                  Abierto
                </button>
                <button
                  onClick={() => toggleDiaAbierto(diaSeleccionado, false)}
          className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    !horarioDiaActual.abierto
            ? 'bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)] border-[color:var(--sp-primary-600)]'
            : 'bg-[color:var(--sp-surface)] text-[color:var(--sp-neutral-700)] border-[color:var(--sp-neutral-300)] hover:bg-[color:var(--sp-neutral-50)]'
                  }`}
                  disabled={readOnly}
                >
                  Cerrado
                </button>
              </div>
            </div>
            {/* Horarios */}
            {horarioDiaActual.abierto && (
              <div>
                <label className="text-sm font-medium text-[color:var(--sp-neutral-700)] mb-3 block">
                  Horarios:
                </label>
                <div className="space-y-4">
                  {horarioDiaActual.turnos.map((turno, indice) => (
                    <div key={indice} className="border border-[color:var(--sp-neutral-200)] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-[color:var(--sp-neutral-700)]">
                          Turno {indice + 1}
                        </span>
                        {horarioDiaActual.turnos.length > 1 && (
                          <button
                            onClick={() => eliminarTurno(diaSeleccionado, indice)}
                            className="text-[color:var(--sp-error-600)] hover:text-[color:var(--sp-error-800)] text-sm flex items-center gap-1"
                          >
                            <Trash2Cast className="w-3 h-3" />
                            Eliminar
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-[color:var(--sp-neutral-600)] mb-1 block">Apertura:</label>
                          <select
                            value={turno.horaApertura}
                            onChange={(e) => actualizarTurno(diaSeleccionado, indice, { horaApertura: e.target.value })}
                            className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-[color:var(--sp-primary-500)] border-[color:var(--sp-neutral-300)] disabled:bg-[color:var(--sp-neutral-50)] disabled:text-[color:var(--sp-neutral-700)] disabled:border-[color:var(--sp-neutral-200)] disabled:cursor-default disabled:focus:ring-0"
                            disabled={readOnly}
                          >
                            {opcionesHora.map(opcion => (
                              <option key={opcion.value} value={opcion.value}>
                                {opcion.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-[color:var(--sp-neutral-600)] mb-1 block">Cierre:</label>
                          <select
                            value={turno.horaCierre}
                            onChange={(e) => actualizarTurno(diaSeleccionado, indice, { horaCierre: e.target.value })}
                            className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-[color:var(--sp-primary-500)] border-[color:var(--sp-neutral-300)] disabled:bg/[color:var(--sp-neutral-50)] disabled:text-[color:var(--sp-neutral-700)] disabled:border-[color:var(--sp-neutral-200)] disabled:cursor-default disabled:focus:ring-0"
                            disabled={readOnly}
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
                    className={`w-full py-2 text-sm border rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      horarioDiaActual.turnos.length >= 3
                        ? 'border-[color:var(--sp-neutral-200)] text-[color:var(--sp-neutral-400)] cursor-not-allowed'
                        : 'text-[color:var(--sp-primary-600)] border-[color:var(--sp-primary-200)] hover:bg-[color:var(--sp-primary-50)]'
                    }`}
                    disabled={readOnly || horarioDiaActual.turnos.length >= 3}
                  >
                    <PlusCast className="w-4 h-4" />
                    {horarioDiaActual.turnos.length >= 3 
                      ? 'Máximo 3 turnos por día'
                      : 'Agregar turno'
                    }
                  </button>
                </div>
              </div>
            )}
            {/* Copiar horarios */}
            <div className="pt-4 border-t border-[color:var(--sp-neutral-200)]">
              <label className="text-sm font-medium text-[color:var(--sp-neutral-700)] mb-2 block">
                Acciones rápidas:
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    copiarHorarios(e.target.value as DiaSemana, diaSeleccionado);
                    e.target.value = '';
                  }
                }}
                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-[color:var(--sp-primary-500)] border-[color:var(--sp-neutral-300)] disabled:bg-[color:var(--sp-neutral-50)] disabled:text-[color:var(--sp-neutral-700)] disabled:border-[color:var(--sp-neutral-200)] disabled:cursor-default disabled:focus:ring-0"
                defaultValue=""
                disabled={readOnly}
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
      {/* Botón de guardar */}
      {showSave && (
        <div className="flex justify-end gap-3 pt-4 border-t">
          <ButtonCast onClick={guardarHorarios} disabled={readOnly || guardando || !tieneHorariosConfigurados()} size="sm">
            {guardando ? (
              <>
                <LoaderCast className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <SaveCast className="w-4 h-4" />
                {tieneHorariosConfigurados() ? 'Guardar Horarios' : 'Configura horarios primero'}
              </>
            )}
          </ButtonCast>
          {onCancel && (
            <ButtonCast type="button" variant="outline" size="sm" onClick={onCancel}>
              Cancelar
            </ButtonCast>
          )}
        </div>
      )}
  </FormCardCast>
  );
}
