import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ViewStyle } from '../../types';
import { useTheme, useColors, useShadows, useRadii } from '../../context/ThemeContext';

/**
 * Tipos de cards disponibles en el design system
 */
export enum SpoonCardType {
  ELEVATED = 'elevated',
  OUTLINED = 'outlined',
  FILLED = 'filled',
}

/**
 * Props para el componente SpoonCard
 */
export interface SpoonCardProps {
  children: React.ReactNode;
  type?: SpoonCardType;
  onPress?: () => void;
  padding?: number | { top?: number; bottom?: number; left?: number; right?: number };
  margin?: number | { top?: number; bottom?: number; left?: number; right?: number };
  elevation?: number;
  backgroundColor?: string;
  borderRadius?: number;
  width?: number | string;
  height?: number | string;
  style?: ViewStyle;
  disabled?: boolean;
  testID?: string;
}

/**
 * Card personalizada del design system Spoon
 * 
 * Proporciona una interfaz consistente para todas las cards de la aplicación
 * con diferentes tipos, elevaciones y estilos.
 * 
 * @example
 * ```tsx
 * // Card básica
 * <SpoonCard>
 *   <Text>Contenido</Text>
 * </SpoonCard>
 * 
 * // Card elevada
 * <SpoonCard.elevated elevation={8}>
 *   <Text>Contenido elevado</Text>
 * </SpoonCard.elevated>
 * 
 * // Card con borde
 * <SpoonCard.outlined>
 *   <Text>Contenido con borde</Text>
 * </SpoonCard.outlined>
 * 
 * // Card rellena
 * <SpoonCard.filled>
 *   <Text>Contenido relleno</Text>
 * </SpoonCard.filled>
 * ```
 */
export const SpoonCard: React.FC<SpoonCardProps> & {
  elevated: React.FC<Omit<SpoonCardProps, 'type'>>;
  outlined: React.FC<Omit<SpoonCardProps, 'type' | 'elevation'>>;
  filled: React.FC<Omit<SpoonCardProps, 'type' | 'elevation'>>;
} = ({
  children,
  type = SpoonCardType.ELEVATED,
  onPress,
  padding,
  margin,
  elevation,
  backgroundColor,
  borderRadius,
  width,
  height,
  style,
  disabled = false,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = useColors();
  const shadows = useShadows();
  const radii = useRadii();

  // Normalizar padding y margin
  const normalizedPadding = typeof padding === 'number' 
    ? { top: padding, bottom: padding, left: padding, right: padding }
    : padding || { top: 16, bottom: 16, left: 16, right: 16 };

  const normalizedMargin = typeof margin === 'number'
    ? { top: margin, bottom: margin, left: margin, right: margin }
    : margin || { top: 8, bottom: 8, left: 8, right: 8 };

  // Obtener estilos según el tipo
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius ?? radii.md,
      width,
      height,
      marginTop: normalizedMargin.top,
      marginBottom: normalizedMargin.bottom,
      marginLeft: normalizedMargin.left,
      marginRight: normalizedMargin.right,
    };

    switch (type) {
      case SpoonCardType.ELEVATED:
        return {
          ...baseStyle,
          backgroundColor: backgroundColor || colors.surface,
          ...shadows.md,
        };

      case SpoonCardType.OUTLINED:
        return {
          ...baseStyle,
          backgroundColor: backgroundColor || colors.surface,
          borderWidth: 1,
          borderColor: colors.outline,
        };

      case SpoonCardType.FILLED:
        return {
          ...baseStyle,
          backgroundColor: backgroundColor || colors.surfaceVariant,
        };

      default:
        return baseStyle;
    }
  };

  const contentStyle: ViewStyle = {
    paddingTop: normalizedPadding.top,
    paddingBottom: normalizedPadding.bottom,
    paddingLeft: normalizedPadding.left,
    paddingRight: normalizedPadding.right,
  };

  const CardContent = () => (
    <View style={contentStyle}>
      {children}
    </View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        style={[getCardStyle(), style]}
        onPress={onPress}
        activeOpacity={0.7}
        testID={testID}
      >
        <CardContent />
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[getCardStyle(), disabled && styles.disabled, style]}
      testID={testID}
    >
      <CardContent />
    </View>
  );
};

// Constructores estáticos (Flutter-style)
SpoonCard.elevated = (props) => (
  <SpoonCard {...props} type={SpoonCardType.ELEVATED} />
);

SpoonCard.outlined = (props) => (
  <SpoonCard {...props} type={SpoonCardType.OUTLINED} />
);

SpoonCard.filled = (props) => (
  <SpoonCard {...props} type={SpoonCardType.FILLED} />
);

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
});

export default SpoonCard;
