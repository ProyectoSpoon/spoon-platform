// packages/shared/lib/errorHandling.ts
// Sistema profesional de manejo de errores

export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBase: number;
  jitter: boolean;
}

export interface CircuitBreakerState {
  failures: number;
  lastFailure: Date | null;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

// Configuraciones por tipo de operación
export const ERROR_CONFIGS = {
  CRITICAL_PAYMENT: {
    maxRetries: 5,
    baseDelay: 1000,
    maxDelay: 30000,
    exponentialBase: 2,
    jitter: true
  },
  CAJA_OPERATIONS: {
    maxRetries: 3,
    baseDelay: 500,
    maxDelay: 10000,
    exponentialBase: 1.5,
    jitter: true
  },
  DATA_FETCH: {
    maxRetries: 2,
    baseDelay: 250,
    maxDelay: 2000,
    exponentialBase: 2,
    jitter: false
  }
} as const;

// Circuit Breaker - Previene cascadas de fallos
class CircuitBreaker {
  private state: CircuitBreakerState = {
    failures: 0,
    lastFailure: null,
    state: 'CLOSED'
  };
  
  private readonly failureThreshold = 5;
  private readonly recoveryTimeout = 60000; // 1 minuto

  canExecute(): boolean {
    if (this.state.state === 'CLOSED') return true;
    
    if (this.state.state === 'OPEN') {
      const now = new Date();
      const timeSinceLastFailure = now.getTime() - (this.state.lastFailure?.getTime() || 0);
      
      if (timeSinceLastFailure > this.recoveryTimeout) {
        this.state.state = 'HALF_OPEN';
        return true;
      }
      return false;
    }
    
    return true; // HALF_OPEN
  }

  onSuccess(): void {
    this.state.failures = 0;
    this.state.state = 'CLOSED';
    this.state.lastFailure = null;
  }

  onFailure(): void {
    this.state.failures++;
    this.state.lastFailure = new Date();
    
    if (this.state.failures >= this.failureThreshold) {
      this.state.state = 'OPEN';
    }
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }
}

// Instancia global del circuit breaker
const globalCircuitBreaker = new CircuitBreaker();

// Función principal de retry con circuit breaker
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  config: RetryOptions,
  operationName: string = 'unknown'
): Promise<T> {
  
  // Verificar circuit breaker
  if (!globalCircuitBreaker.canExecute()) {
    const breakerState = globalCircuitBreaker.getState();
    console.error(`🚫 Circuit breaker OPEN - Operación ${operationName} bloqueada`, breakerState);
    throw new Error(`Sistema temporalmente no disponible. Último fallo: ${breakerState.lastFailure}`);
  }

  let lastError: Error = new Error('Unknown error');
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      console.log(`🔄 Intento ${attempt + 1}/${config.maxRetries + 1} - ${operationName}`);
      
      const result = await operation();
      
      // Éxito - resetear circuit breaker
      globalCircuitBreaker.onSuccess();
      
      if (attempt > 0) {
        console.log(`✅ ${operationName} exitosa después de ${attempt + 1} intentos`);
      }
      
      return result;
      
    } catch (error: any) {
      lastError = error;
      
      console.warn(`⚠️ Intento ${attempt + 1} falló - ${operationName}:`, error.message);
      
      // Si es el último intento, no esperar
      if (attempt === config.maxRetries) {
        globalCircuitBreaker.onFailure();
        break;
      }
      
      // Calcular delay con exponential backoff y jitter
      const exponentialDelay = Math.min(
        config.baseDelay * Math.pow(config.exponentialBase, attempt),
        config.maxDelay
      );
      
      const finalDelay = config.jitter 
        ? exponentialDelay * (0.5 + Math.random() * 0.5) // ±50% jitter
        : exponentialDelay;
      
      console.log(`⏳ Esperando ${Math.round(finalDelay)}ms antes del siguiente intento...`);
      await new Promise(resolve => setTimeout(resolve, finalDelay));
    }
  }
  
  // Todos los intentos fallaron
  globalCircuitBreaker.onFailure();
  
  console.error(`💥 ${operationName} falló después de ${config.maxRetries + 1} intentos:`, lastError);
  throw new Error(`${operationName} falló: ${lastError.message}`);
}

// Detectar tipo de error para decidir si reintentar
export function shouldRetry(error: any): boolean {
  // Errores de red - siempre reintentar
  if (error.message?.includes('Failed to fetch') || 
      error.message?.includes('Network') ||
      error.message?.includes('timeout') ||
      error.code === 'NETWORK_ERROR') {
    return true;
  }
  
  // Errores de Supabase temporales
  if (error.code === 'PGRST301' || // Timeout
      error.code === 'PGRST002' || // Connection error
      error.message?.includes('502') ||
      error.message?.includes('503') ||
      error.message?.includes('504')) {
    return true;
  }
  
  // Errores de lógica de negocio - NO reintentar
  if (error.message?.includes('Ya existe') ||
      error.message?.includes('no válida') ||
      error.message?.includes('insuficiente')) {
    return false;
  }
  
  // Por defecto, reintentar una vez
  return true;
}

// Wrapper específico para operaciones de Supabase
export async function executeSupabaseOperation<T>(
  operation: () => Promise<{ data: T; error: any }>,
  operationName: string,
  config: RetryOptions = ERROR_CONFIGS.DATA_FETCH
): Promise<T> {
  return executeWithRetry(async () => {
    const { data, error } = await operation();
    
    if (error) {
      if (!shouldRetry(error)) {
        // Error de negocio - no reintentar
        throw new Error(error.message || 'Error de validación');
      }
      throw error;
    }
    
    return data;
  }, config, operationName);
}

// Estado del circuit breaker para debugging
export function getCircuitBreakerStatus(): CircuitBreakerState {
  return globalCircuitBreaker.getState();
}