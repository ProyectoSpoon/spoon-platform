export const retryWithExponentialBackoff = async (
  operation: () => Promise<any>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    useJitter?: boolean;
  } = {}
): Promise<any> => {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 30000, useJitter = true } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
      const finalDelay = useJitter
        ? exponentialDelay * (0.5 + Math.random() * 0.5)
        : exponentialDelay;

      console.log("Reintentando en " + finalDelay + "ms antes del siguiente intento...");
      await new Promise(resolve => setTimeout(resolve, finalDelay));
    }
  }
};

// Exports adicionales para compatibilidad
export const executeWithRetry = retryWithExponentialBackoff;

export const ERROR_CONFIGS = {
  DEFAULT: { maxRetries: 3, baseDelay: 1000 },
  NETWORK: { maxRetries: 5, baseDelay: 2000 },
  DATABASE: { maxRetries: 3, baseDelay: 1500 }
};

export const getCircuitBreakerStatus = () => {
  return { isOpen: false, failureCount: 0 };
};
