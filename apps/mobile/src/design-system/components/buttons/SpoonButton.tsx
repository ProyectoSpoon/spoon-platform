import React, { useState } from 'react';
import { ActivityIndicator, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ViewStyle, TextStyle } from '../../types';
import { useTheme, useColors, useTypography, useSpacing, useShadows } from '../../context/ThemeContext';

/**
 * Tipos de botones disponibles en el design system
 */
export enum SpoonButtonType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  OUTLINED = 'outlined',
  TEXT = 'text',
  DANGER = 'danger',
}

/**
 * Tamaños de botones disponibles
 */
export enum SpoonButtonSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

/**
 * Props para el componente SpoonButton
 */
export interface SpoonButtonProps {
  text: string;
  onPress?: () => void;
  type?: SpoonButtonType;
  size?: SpoonButtonSize;
  isLoading?: boolean;
  icon?: string; // nombre del icono
  fullWidth?: boolean;
  disabled?: boolean;
  padding?: number | { top?: number; bottom?: number; left?: number; right?: number };
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

/**
 * Botón personalizado del design system Spoon
 * 
 * Proporciona una interfaz consistente para todos los botones de la aplicación
 * con diferentes tipos, tamaños y estados.
 * 
 * @example
 * ```tsx
 * // Botón básico
 * <SpoonButton text="Presionar" onPress={() => {}} />
 * 
 * // Botón primario
 * <SpoonButton.primary text="Confirmar" onPress={() => {}} />
 * 
 * // Botón secundario
 * <SpoonButton.secondary text="Cancelar" onPress={() => {}} />
 * 
 * // Botón outlined
 * <SpoonButton.outlined text="Ver más" onPress={() => {}} />
 * 
 * // Botón de texto
 * <SpoonButton.text text="Omitir" onPress={() => {}} />
 * 
 * // Botón de peligro
 * <SpoonButton.danger text="Eliminar" onPress={() => {}} />
 * 
 * // Con icono y loading
 * <SpoonButton.primary 
 *   text="Guardar" 
 *   icon="save" 
 *   isLoading={isLoading}
 *   onPress={() => {}} 
 * />
 * ```
 */
export const SpoonButton: React.FC<SpoonButtonProps> & {
  primary: React.FC<Omit<SpoonButtonProps, 'type'>>;
  secondary: React.FC<Omit<SpoonButtonProps, 'type'>>;
  outlined: React.FC<Omit<SpoonButtonProps, 'type'>>;
  text: React.FC<Omit<SpoonButtonProps, 'type'>>;
  danger: React.FC<Omit<SpoonButtonProps, 'type'>>;
} = ({
  text,
  onPress,
  type = SpoonButtonType.PRIMARY,
  size = SpoonButtonSize.MEDIUM,
  isLoading = false,
  icon,
  fullWidth = false,
  disabled = false,
  padding,
  style,
  textStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = useColors();
  const typography = useTypography();
  const spacing = useSpacing();
  const shadows = useShadows();

  const [isPressed, setIsPressed] = useState(false);

  // Normalizar padding
  const normalizedPadding = typeof padding === 'number' 
    ? { top: padding, bottom: padding, left: padding, right: padding }
    : padding || getDefaultPadding();

  function getDefaultPadding() {
    switch (size) {
      case SpoonButtonSize.SMALL:
        return { top: spacing.xs, bottom: spacing.xs, left: spacing.sm, right: spacing.sm };
      case SpoonButtonSize.MEDIUM:
        return { top: spacing.sm, bottom: spacing.sm, left: spacing.md, right: spacing.md };
      case SpoonButtonSize.LARGE:
        return { top: spacing.md, bottom: spacing.md, left: spacing.lg, right: spacing.lg };
      default:
        return { top: spacing.sm, bottom: spacing.sm, left: spacing.md, right: spacing.md };
    }
  }

  // Obtener estilos según el tipo y estado
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      paddingTop: normalizedPadding.top,
      paddingBottom: normalizedPadding.bottom,
      paddingLeft: normalizedPadding.left,
      paddingRight: normalizedPadding.right,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: getMinHeight(),
      width: fullWidth ? '100%' : undefined,
      opacity: disabled || isLoading ? 0.5 : isPressed ? 0.8 : 1.0,
    };

    switch (type) {
      case SpoonButtonType.PRIMARY:
        return {
          ...baseStyle,
          backgroundColor: colors.primary,
          ...shadows.sm,
        };

      case SpoonButtonType.SECONDARY:
        return {
          ...baseStyle,
          backgroundColor: colors.secondary,
          ...shadows.sm,
        };

      case SpoonButtonType.DANGER:
        return {
          ...baseStyle,
          backgroundColor: colors.error,
          ...shadows.sm,
        };

      case SpoonButtonType.OUTLINED:
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.primary,
        };

      case SpoonButtonType.TEXT:
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };

      default:
        return baseStyle;
    }
  };

  function getMinHeight(): number {
    switch (size) {
      case SpoonButtonSize.SMALL:
        return 32;
      case SpoonButtonSize.MEDIUM:
        return 44;
      case SpoonButtonSize.LARGE:
        return 52;
      default:
        return 44;
    }
  }

  // Obtener color del texto
  const getTextColor = (): string => {
    switch (type) {
      case SpoonButtonType.PRIMARY:
        return colors.textOnPrimary;
      case SpoonButtonType.SECONDARY:
        return colors.textOnSecondary;
      case SpoonButtonType.DANGER:
        return colors.white;
      case SpoonButtonType.OUTLINED:
      case SpoonButtonType.TEXT:
        return colors.primary;
      default:
        return colors.textOnPrimary;
    }
  };

  // Obtener estilo del texto
  const getTextStyle = (): TextStyle => {
    const baseTextStyle = {
      color: getTextColor(),
      fontWeight: '600' as const,
      textAlign: 'center' as const,
    };

    switch (size) {
      case SpoonButtonSize.SMALL:
        return {
          ...baseTextStyle,
          fontSize: typography.labelSmall.fontSize,
          lineHeight: typography.labelSmall.lineHeight,
        };
      case SpoonButtonSize.MEDIUM:
        return {
          ...baseTextStyle,
          fontSize: typography.labelMedium.fontSize,
          lineHeight: typography.labelMedium.lineHeight,
        };
      case SpoonButtonSize.LARGE:
        return {
          ...baseTextStyle,
          fontSize: typography.labelLarge.fontSize,
          lineHeight: typography.labelLarge.lineHeight,
        };
      default:
        return baseTextStyle;
    }
  };

  function getIconSize(): number {
    switch (size) {
      case SpoonButtonSize.SMALL:
        return 16;
      case SpoonButtonSize.MEDIUM:
        return 18;
      case SpoonButtonSize.LARGE:
        return 20;
      default:
        return 18;
    }
  }

  const handlePress = () => {
    if (!disabled && !isLoading && onPress) {
      onPress();
    }
  };

  const handlePressIn = () => setIsPressed(true);
  const handlePressOut = () => setIsPressed(false);

  const buttonContent = () => {
    if (isLoading) {
      return (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
          testID={`${testID}-loading`}
        />
      );
    }

    return (
      <View style={styles.content}>
        {icon && (
          <View style={styles.iconContainer}>
            <Text style={[{ color: getTextColor() }, styles.icon]}>
              {icon}
            </Text>
          </View>
        )}
        <Text style={[getTextStyle(), textStyle]}>
          {text}
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || isLoading}
      activeOpacity={1}
      testID={testID}
    >
      {buttonContent()}
    </TouchableOpacity>
  );
};

// Constructores estáticos (Flutter-style)
SpoonButton.primary = (props) => (
  <SpoonButton {...props} type={SpoonButtonType.PRIMARY} />
);

SpoonButton.secondary = (props) => (
  <SpoonButton {...props} type={SpoonButtonType.SECONDARY} />
);

SpoonButton.outlined = (props) => (
  <SpoonButton {...props} type={SpoonButtonType.OUTLINED} />
);

SpoonButton.text = (props) => (
  <SpoonButton {...props} type={SpoonButtonType.TEXT} />
);

SpoonButton.danger = (props) => (
  <SpoonButton {...props} type={SpoonButtonType.DANGER} />
);

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  icon: {
    fontSize: 16,
  },
});

export default SpoonButton;
