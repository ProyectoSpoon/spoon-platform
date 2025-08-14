/**
 * SPOON Design System - Spacing Tokens (8pt grid)
 */

export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
} as const;

export const componentSpacing = {
  input: { sm: spacing[3], md: spacing[4], lg: spacing[5] },
  button: {
    sm: `${spacing[2]} ${spacing[3]}`,
    md: `${spacing[3]} ${spacing[4]}`,
    lg: `${spacing[4]} ${spacing[6]}`,
  },
  card: { padding: spacing[6], gap: spacing[4] },
  stack: { xs: spacing[2], sm: spacing[4], md: spacing[6], lg: spacing[8], xl: spacing[12] },
} as const;
