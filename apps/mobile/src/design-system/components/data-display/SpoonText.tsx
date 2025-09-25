import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { useTypography, useColors } from '../../context/ThemeContext';

export interface SpoonTextProps extends TextProps {
  variant?: keyof ReturnType<typeof useTypography>;
  weight?: 'regular' | 'medium' | 'bold' | 'semibold';
  color?: 'primary' | 'secondary' | 'accent' | 'error' | 'warning' | 'success' | 'inverse';
}

/**
 * Texto tipográfico con variantes del sistema.
 */
export const SpoonText: React.FC<SpoonTextProps> = ({
  variant = 'bodyMedium',
  weight = 'regular',
  color = 'primary',
  style,
  children,
  ...rest
}) => {
  const typography = useTypography();
  const colors = useColors();

  const base = typography[variant] as TextStyle;

  const weightMap: Record<string, TextStyle['fontWeight']> = {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  };

  const colorMap: Record<string, string> = {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
    accent: colors.primary,
    error: colors.error,
    warning: colors.warning,
    success: colors.success,
    inverse: colors.background,
  };

  return (
    <Text
      {...rest}
      style={[
        base,
        { fontWeight: weightMap[weight] || undefined, color: colorMap[color] },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export default SpoonText;
