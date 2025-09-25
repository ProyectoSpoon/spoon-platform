// Colores de marca para redes sociales centralizados en el Design System
// Los hex aquí son aceptables porque son definiciones de tokens de marca.
export const socialColors = {
  instagram: '#E1306C',
  twitter: '#1DA1F2',
  facebook: '#4267B2',
  whatsapp: '#0B6FA4',
} as const;

export type SocialBrand = keyof typeof socialColors;
