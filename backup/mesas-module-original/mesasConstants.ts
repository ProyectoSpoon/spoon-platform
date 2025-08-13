// ========================================
// CONSTANTES PARA SISTEMA MAESTRO DE MESAS
// File: packages/shared/constants/mesas/mesasConstants.ts
// Actualizado para eliminar número fijo y agregar sistema maestro
// ========================================

// ========================================
// INTERFACES TYPESCRIPT
// ========================================

export interface ZonaPredefinida {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
  icono: string;
  capacidadDefault: number;
  esDefault: boolean;
}

export interface ConfiguracionRapida {
  id: string;
  mesas: number;
  nombre: string;
  descripcion: string;
  distribucion: Record<string, number>;
  recomendadoPara: string[];
  esRecomendado?: boolean;
}

export interface TipoMesa {
  id: string;
  nombre: string;
  capacidad: number;
  descripcion: string;
  icono: string;
  esDefault?: boolean;
}

export interface MesaValidacion {
  numero?: number;
  nombre?: string;
  capacidad: number;
  zona?: string;
}

// ========================================
// ESTADOS DE MESA (COMPATIBILIDAD)
// ========================================

export const ESTADOS_MESA = {
  VACIA: 'vacia',
  OCUPADA: 'ocupada'
} as const;

// ========================================
// ESTADOS DEL SISTEMA MAESTRO
// ========================================

export const ESTADOS_MESA_MAESTRO = {
  LIBRE: 'libre',
  OCUPADA: 'ocupada', 
  RESERVADA: 'reservada',
  INACTIVA: 'inactiva'
} as const;

// ========================================
// COLORES POR ESTADO
// ========================================

export const COLORES_ESTADO = {
  // Estados compatibles (anterior)
  vacia: '#10b981',    // green-500 - Mesa libre
  ocupada: '#ef4444',  // red-500 - Mesa con orden activa
  
  // Estados del sistema maestro
  libre: '#10b981',    // green-500 - Mesa disponible
  reservada: '#f59e0b', // amber-500 - Mesa reservada
  inactiva: '#6b7280'   // gray-500 - Mesa desactivada
};

export const TEXTOS_ESTADO = {
  // Estados compatibles (anterior)
  vacia: 'Libre',
  ocupada: 'Ocupada',
  
  // Estados del sistema maestro  
  libre: 'Libre',
  reservada: 'Reservada',
  inactiva: 'Inactiva'
};

// ========================================
// ZONAS PREDEFINIDAS PARA CONFIGURACIÓN
// ========================================

export const ZONAS_PREDEFINIDAS: ZonaPredefinida[] = [
  {
    id: 'comedor_principal',
    nombre: 'Comedor Principal',
    descripcion: 'Área principal del restaurante',
    color: '#3b82f6', // blue-500
    icono: '🍽️',
    capacidadDefault: 4,
    esDefault: true
  },
  {
    id: 'terraza',
    nombre: 'Terraza',
    descripcion: 'Área exterior con vista',
    color: '#10b981', // emerald-500
    icono: '🌿',
    capacidadDefault: 4,
    esDefault: false
  },
  {
    id: 'vip',
    nombre: 'VIP',
    descripcion: 'Área exclusiva y privada',
    color: '#f59e0b', // amber-500
    icono: '⭐',
    capacidadDefault: 6,
    esDefault: false
  },
  {
    id: 'bar',
    nombre: 'Bar',
    descripcion: 'Área de bar y bebidas',
    color: '#8b5cf6', // violet-500
    icono: '🍸',
    capacidadDefault: 2,
    esDefault: false
  },
  {
    id: 'salon_privado',
    nombre: 'Salón Privado',
    descripcion: 'Salón para eventos privados',
    color: '#ef4444', // red-500
    icono: '🎉',
    capacidadDefault: 8,
    esDefault: false
  },
  {
    id: 'patio',
    nombre: 'Patio',
    descripcion: 'Área de patio interior',
    color: '#06b6d4', // cyan-500
    icono: '🌳',
    capacidadDefault: 4,
    esDefault: false
  },
  {
    id: 'segunda_planta',
    nombre: 'Segunda Planta',
    descripcion: 'Nivel superior del restaurante',
    color: '#84cc16', // lime-500
    icono: '🏢',
    capacidadDefault: 4,
    esDefault: false
  },
  {
    id: 'jardin',
    nombre: 'Jardín',
    descripcion: 'Área de jardín al aire libre',
    color: '#22c55e', // green-500
    icono: '🌺',
    capacidadDefault: 4,
    esDefault: false
  }
];

// ========================================
// CONFIGURACIONES RÁPIDAS PREDEFINIDAS
// ========================================

export const CONFIGURACIONES_RAPIDAS: ConfiguracionRapida[] = [
  {
    id: 'pequeno',
    mesas: 8,
    nombre: 'Restaurante Pequeño',
    descripcion: 'Ideal para negocios familiares',
    distribucion: {
      'Comedor Principal': 8
    },
    recomendadoPara: ['Cafeterías', 'Restaurantes familiares', 'Comedores pequeños']
  },
  {
    id: 'mediano',
    mesas: 12,
    nombre: 'Restaurante Mediano',
    descripcion: 'Configuración más popular',
    distribucion: {
      'Comedor Principal': 8,
      'Terraza': 4
    },
    recomendadoPara: ['Restaurantes casual', 'Bistrós', 'Restaurantes de barrio'],
    esRecomendado: true
  },
  {
    id: 'grande',
    mesas: 20,
    nombre: 'Restaurante Grande',
    descripcion: 'Para establecimientos amplios',
    distribucion: {
      'Comedor Principal': 12,
      'Terraza': 6,
      'VIP': 2
    },
    recomendadoPara: ['Restaurantes grandes', 'Hoteles', 'Centros comerciales']
  },
  {
    id: 'muy_grande',
    mesas: 30,
    nombre: 'Restaurante Muy Grande',
    descripcion: 'Para complejos gastronómicos',
    distribucion: {
      'Comedor Principal': 16,
      'Terraza': 8,
      'VIP': 4,
      'Bar': 2
    },
    recomendadoPara: ['Complejos gastronómicos', 'Restaurantes de lujo', 'Eventos corporativos']
  }
];

// ========================================
// CAPACIDADES ESTÁNDAR POR TIPO DE MESA
// ========================================

export const CAPACIDADES_ESTANDAR = {
  INDIVIDUAL: 1,
  PAREJA: 2,
  FAMILIAR_PEQUEÑA: 4,
  FAMILIAR_GRANDE: 6,
  GRUPO_PEQUEÑO: 8,
  GRUPO_GRANDE: 10,
  EVENTOS: 12
};

export const TIPOS_MESA: TipoMesa[] = [
  {
    id: 'individual',
    nombre: 'Individual',
    capacidad: CAPACIDADES_ESTANDAR.INDIVIDUAL,
    descripcion: 'Mesa para 1 persona',
    icono: '👤'
  },
  {
    id: 'pareja',
    nombre: 'Pareja',
    capacidad: CAPACIDADES_ESTANDAR.PAREJA,
    descripcion: 'Mesa para 2 personas',
    icono: '👥'
  },
  {
    id: 'familiar_pequena',
    nombre: 'Familiar Pequeña',
    capacidad: CAPACIDADES_ESTANDAR.FAMILIAR_PEQUEÑA,
    descripcion: 'Mesa para 4 personas',
    icono: '👨‍👩‍👧‍👦',
    esDefault: true
  },
  {
    id: 'familiar_grande',
    nombre: 'Familiar Grande',
    capacidad: CAPACIDADES_ESTANDAR.FAMILIAR_GRANDE,
    descripcion: 'Mesa para 6 personas',
    icono: '👨‍👩‍👧‍👦+'
  },
  {
    id: 'grupo_pequeno',
    nombre: 'Grupo Pequeño',
    capacidad: CAPACIDADES_ESTANDAR.GRUPO_PEQUEÑO,
    descripcion: 'Mesa para 8 personas',
    icono: '👥👥'
  },
  {
    id: 'grupo_grande',
    nombre: 'Grupo Grande',
    capacidad: CAPACIDADES_ESTANDAR.GRUPO_GRANDE,
    descripcion: 'Mesa para 10 personas',
    icono: '👥👥+'
  },
  {
    id: 'eventos',
    nombre: 'Eventos',
    capacidad: CAPACIDADES_ESTANDAR.EVENTOS,
    descripcion: 'Mesa para 12+ personas',
    icono: '🎉'
  }
];

// ========================================
// CONFIGURACIÓN DE FORMATO Y VISUALIZACIÓN
// ========================================

export const FORMATO_MONEDA = {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
} as const;

export const CONFIGURACION_GRID = {
  // Columnas responsivas para el grid de mesas
  MOVIL: 'grid-cols-3',
  TABLET: 'md:grid-cols-4',
  DESKTOP: 'lg:grid-cols-6',
  DESKTOP_GRANDE: 'xl:grid-cols-8'
};

export const TAMAÑOS_MESA_CARD = {
  PEQUEÑO: 'min-h-[100px] p-3',
  MEDIANO: 'min-h-[120px] p-4', // Default
  GRANDE: 'min-h-[140px] p-5'
};

// ========================================
// LÍMITES Y VALIDACIONES
// ========================================

export const LIMITES_CONFIGURACION = {
  MESAS_MINIMAS: 1,
  MESAS_MAXIMAS: 100,
  ZONAS_MINIMAS: 1,
  ZONAS_MAXIMAS: 10,
  CAPACIDAD_MINIMA: 1,
  CAPACIDAD_MAXIMA: 20,
  NOMBRE_MESA_MIN_LENGTH: 1,
  NOMBRE_MESA_MAX_LENGTH: 50,
  NOMBRE_ZONA_MIN_LENGTH: 1,
  NOMBRE_ZONA_MAX_LENGTH: 30
};

// ========================================
// CONFIGURACIÓN DE AUTO-REFRESH
// ========================================

export const CONFIGURACION_TIEMPO_REAL = {
  INTERVALO_REFRESH: 30000, // 30 segundos
  INTERVALO_REFRESH_RAPIDO: 10000, // 10 segundos (cuando hay actividad)
  TIMEOUT_INACTIVIDAD: 300000 // 5 minutos sin actividad
};

// ========================================
// MENSAJES Y TEXTOS PREDEFINIDOS
// ========================================

export const MENSAJES = {
  SIN_CONFIGURACION: {
    titulo: '¡Configura tus mesas para empezar!',
    descripcion: 'El sistema maestro de mesas te permite personalizar tu restaurante con nombres, zonas, capacidades y mucho más.',
    accion: 'Configurar Mesas'
  },
  CONFIGURACION_EXITOSA: {
    titulo: '¡Mesas configuradas exitosamente!',
    descripcion: 'Tu restaurante está listo para recibir clientes.',
    accion: 'Ver Mesas'
  },
  ERROR_CONFIGURACION: {
    titulo: 'Error en la configuración',
    descripcion: 'No se pudieron configurar las mesas. Inténtalo de nuevo.',
    accion: 'Reintentar'
  }
};

export const TOOLTIPS = {
  MESA_LIBRE: 'Mesa disponible para nuevos clientes',
  MESA_OCUPADA: 'Mesa con orden activa - Click para ver detalles',
  MESA_RESERVADA: 'Mesa reservada para un cliente específico',
  MESA_INACTIVA: 'Mesa temporalmente fuera de servicio',
  BOTON_CONFIGURAR: 'Configurar o modificar las mesas del restaurante',
  BOTON_ACTUALIZAR: 'Actualizar el estado de todas las mesas'
};

// ========================================
// UTILIDADES PARA COMPATIBILIDAD
// ========================================

/**
 * @deprecated Usar sistema maestro en su lugar
 * Mantenido solo para compatibilidad con código anterior
 */
export const TOTAL_MESAS_DEFAULT = 12;

// ========================================
// FUNCIONES AUXILIARES PARA CONSTANTES
// ========================================

/**
 * Obtener zona predefinida por ID
 */
export const obtenerZonaPorId = (id: string): ZonaPredefinida | undefined => {
  return ZONAS_PREDEFINIDAS.find(zona => zona.id === id);
};

/**
 * Obtener configuración rápida por ID
 */
export const obtenerConfiguracionRapida = (id: string): ConfiguracionRapida | undefined => {
  return CONFIGURACIONES_RAPIDAS.find(config => config.id === id);
};

/**
 * Obtener tipo de mesa por capacidad
 */
export const obtenerTipoMesaPorCapacidad = (capacidad: number): TipoMesa | undefined => {
  return TIPOS_MESA.find(tipo => tipo.capacidad === capacidad) || TIPOS_MESA.find(tipo => tipo.esDefault);
};

/**
 * Validar configuración de mesa
 */
export const validarConfiguracionMesa = (mesa: MesaValidacion): string[] => {
  const errores: string[] = [];
  
  if (!mesa.numero || mesa.numero < 1) {
    errores.push('Número de mesa debe ser mayor a 0');
  }
  
  if (mesa.capacidad < LIMITES_CONFIGURACION.CAPACIDAD_MINIMA || 
      mesa.capacidad > LIMITES_CONFIGURACION.CAPACIDAD_MAXIMA) {
    errores.push(`Capacidad debe estar entre ${LIMITES_CONFIGURACION.CAPACIDAD_MINIMA} y ${LIMITES_CONFIGURACION.CAPACIDAD_MAXIMA}`);
  }
  
  if (mesa.nombre && (mesa.nombre.length < LIMITES_CONFIGURACION.NOMBRE_MESA_MIN_LENGTH || 
                      mesa.nombre.length > LIMITES_CONFIGURACION.NOMBRE_MESA_MAX_LENGTH)) {
    errores.push(`Nombre debe tener entre ${LIMITES_CONFIGURACION.NOMBRE_MESA_MIN_LENGTH} y ${LIMITES_CONFIGURACION.NOMBRE_MESA_MAX_LENGTH} caracteres`);
  }
  
  return errores;
};

// ========================================
// EXPORTACIÓN POR DEFECTO
// ========================================

export default {
  // Constantes principales
  ESTADOS_MESA,
  ESTADOS_MESA_MAESTRO,
  COLORES_ESTADO,
  TEXTOS_ESTADO,
  ZONAS_PREDEFINIDAS,
  CONFIGURACIONES_RAPIDAS,
  CAPACIDADES_ESTANDAR,
  TIPOS_MESA,
  FORMATO_MONEDA,
  CONFIGURACION_GRID,
  LIMITES_CONFIGURACION,
  MENSAJES,
  TOOLTIPS,
  
  // Funciones auxiliares
  obtenerZonaPorId,
  obtenerConfiguracionRapida,
  obtenerTipoMesaPorCapacidad,
  validarConfiguracionMesa
} as const;