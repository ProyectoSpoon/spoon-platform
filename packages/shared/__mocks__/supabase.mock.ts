// Centralized Supabase mocks for caja tests

type ChannelHandler = {
  event: string;
  cb: (payload: any) => void;
  filter?: any;
};

const channels: any[] = [];
function createChannel(name: string) {
  const handlers: ChannelHandler[] = [];
  const channel: any = {};
  channel.name = name;
  channel.handlers = handlers;
  channel.on = jest.fn((event: string, filterOrCb: any, maybeCb?: any) => {
    const cb = typeof filterOrCb === 'function' ? filterOrCb : maybeCb;
    handlers.push({ event, cb, filter: typeof filterOrCb === 'function' ? undefined : filterOrCb });
    return channel;
  });
  channel.subscribe = jest.fn(() => ({ unsubscribe: jest.fn() }));
  channel.unsubscribe = jest.fn();
  channel.emit = (event: string, payload: any) => {
    handlers.filter(h => h.event === event).forEach(h => h.cb(payload));
  };
  return channel;
}

export const supabase = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  })),
  rpc: jest.fn(),
  channel: jest.fn((name: string) => {
    const ch = createChannel(name);
    channels.push(ch);
    return ch;
  }),
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
  }
} as any;

// Expose channels registry for tests
(supabase as any).__channels = channels;

export const getUserProfile = jest.fn(async () => ({ id: 'user-1', restaurant_id: 'rest-1' }));

export const getTransaccionesDelDia = jest.fn(async () => ({
  transacciones: [],
  totalVentas: 0,
  totalEfectivo: 0,
  totalTarjeta: 0,
  totalDigital: 0,
}));

export const getGastosDelDia = jest.fn(async () => ({
  gastos: [],
  totalGastos: 0,
  gastosPorCategoria: { proveedor: 0, servicios: 0, suministros: 0, otro: 0 },
}));

export const getTransaccionesYGastosEnRango = jest.fn(async () => ({
  transacciones: [],
  gastos: [],
  totalVentas: 0,
  totalEfectivo: 0,
  totalTarjeta: 0,
  totalDigital: 0,
  totalGastos: 0,
  gastosPorCategoria: { proveedor: 0, servicios: 0, suministros: 0, otro: 0 },
}));

export const crearGastoCaja = jest.fn(async () => ({ id: 'g-1' }));
export const eliminarGastoCaja = jest.fn(async () => ({}));
