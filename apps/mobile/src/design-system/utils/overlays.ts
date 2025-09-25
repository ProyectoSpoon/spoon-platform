// Utilidades de overlays para Spoon Design System
// Estandariza capas semitransparentes comúnmente usadas

import { SpoonColors } from '../theme/colors';

export const overlayTokens = {
  light: (colors: typeof SpoonColors) => SpoonColors.withOpacity(colors.black, 0.15),
  medium: (colors: typeof SpoonColors) => SpoonColors.withOpacity(colors.black, 0.3),
  strong: (colors: typeof SpoonColors) => SpoonColors.withOpacity(colors.black, 0.5),
  extra: (colors: typeof SpoonColors) => SpoonColors.withOpacity(colors.black, 0.7),
};

export const getOverlay = (level: keyof typeof overlayTokens, colors: any) => overlayTokens[level](colors);

// Utilidad para aplicar alpha a cualquier token hex (devuelve rgba)
export function applyAlpha(hexColor: string, alpha: number) {
  if (alpha < 0 || alpha > 1) throw new Error('alpha 0-1');
  const hex = hexColor.replace('#','');
  const r = parseInt(hex.substring(0,2),16);
  const g = parseInt(hex.substring(2,4),16);
  const b = parseInt(hex.substring(4,6),16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default overlayTokens;
