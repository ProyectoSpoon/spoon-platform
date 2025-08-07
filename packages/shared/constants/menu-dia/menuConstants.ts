// ✅ CONSTANTES PARA MENU DEL DIA

export const CATEGORIAS_MENU_CONFIG = [
  { id: 'entradas', nombre: 'Entradas', uuid: '494fbac6-59ed-42af-af24-039298ba16b6' },
  { id: 'principios', nombre: 'Principios', uuid: 'de7f4731-3eb3-4d41-b830-d35e5125f4a3' },
  { id: 'proteinas', nombre: 'Proteínas', uuid: '299b1ba0-0678-4e0e-ba53-90e5d95e5543' },
  { id: 'acompanamientos', nombre: 'Acompañamientos', uuid: '8b0751ae-1332-409e-a710-f229be0b9758' },
  { id: 'bebidas', nombre: 'Bebidas', uuid: 'c77ffc73-b65a-4f03-adb1-810443e61799' },
  { id: 'configuracion-final', nombre: 'Configuración Final', uuid: null }
];

export const DEFAULT_MENU_PRICE = 15000;

export const DEFAULT_PROTEIN_QUANTITY = 10;

export const WIZARD_STEPS_COUNT = 6;

export const DEFAULT_FILTERS = {
  favorites: false,
  specials: false,
  category: 'all'
};

export const DEFAULT_COMBO_FILTERS = {
  favorites: false,
  specials: false,
  availability: 'all' as const,
  sortBy: 'name' as const
};

export const CATEGORY_ICONS = {
  'Entradas': '🥗',
  'Principios': '🍚',
  'Proteínas': '🍗',
  'Acompañamientos': '🥔',
  'Bebidas': '🥤',
  'default': '🍽️'
};

export const LOADING_MESSAGES = {
  saving: 'Guardando menú...',
  generating: 'Generando combinaciones...',
  loading: 'Cargando...',
  deleting: 'Eliminando...',
  updating: 'Actualizando...'
};
