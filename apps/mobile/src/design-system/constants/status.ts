// Central status & compatibility thresholds + color resolver
import { useColors } from '../context/ThemeContext';

export const COMPATIBILITY_HIGH = 70; // >= 70 -> success
export const COMPATIBILITY_MEDIUM = 40; // >= 40 && < 70 -> warning, else error

// Public hook simplificado: recibe número y devuelve color semántico
export function useCompatibilityColor() {
  const colors = useColors();
  return (value: number) => {
    if (value >= COMPATIBILITY_HIGH) return colors.success;
    if (value >= COMPATIBILITY_MEDIUM) return colors.warning;
    return colors.error;
  };
}
