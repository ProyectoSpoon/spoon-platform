// src/design-system/components/inputs/SpoonToggleSwitch.tsx

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { ViewStyle, TextStyle } from '../../types';
import { useTheme, useColors, useSpacing, useTypography } from '../../context/ThemeContext';

/**
 * Tamaños disponibles para el toggle switch
 */
export enum SpoonToggleSwitchSize {
  SMALL = 'small',
  MEDIUM = 'medium', 
  LARGE = 'large',
}

/**
 * Props para el componente SpoonToggleSwitch
 */
export interface SpoonToggleSwitchProps {
  value: boolean;
  onValueChange?: (value: boolean) => void;
  size?: SpoonToggleSwitchSize;
  activeColor?: string;
  inactiveColor?: string;
  activeTrackColor?: string;
  inactiveTrackColor?: string;
  thumbColor?: string;
  enabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}

/**
 * Props para el componente SpoonLabeledToggle
 */
export interface SpoonLabeledToggleProps extends SpoonToggleSwitchProps {
  label: string;
  subtitle?: string;
  padding?: number;
  crossAxisAlignment?: 'flex-start' | 'center' | 'flex-end';
}

/**
 * Toggle Switch personalizado del design system Spoon
 *
 * Proporciona una interfaz consistente para switches/toggles en la aplicación
 * con diferentes tamaños y estilos.
 * 
 * @example
 * ```tsx
 * // Toggle básico
 * <SpoonToggleSwitch
 *   value={isEnabled}
 *   onValueChange={setIsEnabled}
 * />
 * 
 * // Toggle grande con colores personalizados
 * <SpoonToggleSwitch
 *   value={notifications}
 *   onValueChange={setNotifications}
 *   size={SpoonToggleSwitchSize.LARGE}
 *   activeColor="#4CAF50"
 * />
 * 
 * // Toggle con etiqueta
 * <SpoonLabeledToggle
 *   label="Notificaciones push"
 *   subtitle="Recibe alertas en tiempo real"
 *   value={pushEnabled}
 *   onValueChange={setPushEnabled}
 * />
 * ```
 */
export const SpoonToggleSwitch: React.FC<SpoonToggleSwitchProps> = ({
  value,
  onValueChange,
  size = SpoonToggleSwitchSize.MEDIUM,
  activeColor,
  inactiveColor,
  activeTrackColor,
  inactiveTrackColor,
  thumbColor,
  enabled = true,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = useColors();

  // Obtener dimensiones según el tamaño
  const getDimensions = () => {
    switch (size) {
      case SpoonToggleSwitchSize.SMALL:
        return {
          width: 40,
          height: 24,
          thumbSize: 18,
          padding: 3,
        };
      case SpoonToggleSwitchSize.MEDIUM:
        return {
          width: 50,
          height: 30,
          thumbSize: 24,
          padding: 3,
        };
      case SpoonToggleSwitchSize.LARGE:
        return {
          width: 60,
          height: 36,
          thumbSize: 30,
          padding: 3,
        };
      default:
        return {
          width: 50,
          height: 30,
          thumbSize: 24,
          padding: 3,
        };
    }
  };

  const dimensions = getDimensions();

  // Obtener colores del switch
  const getSwitchColors = () => ({
    activeThumb: thumbColor || colors.white,
    inactiveThumb: thumbColor || colors.white,
    activeTrack: activeTrackColor || activeColor || colors.primary,
    inactiveTrack: inactiveTrackColor || inactiveColor || colors.outline,
  });

  const switchColors = getSwitchColors();

  const getTrackStyle = (): ViewStyle => ({
    width: dimensions.width,
    height: dimensions.height,
    borderRadius: dimensions.height / 2,
    backgroundColor: value ? switchColors.activeTrack : switchColors.inactiveTrack,
    justifyContent: 'center',
    padding: dimensions.padding,
    opacity: enabled ? 1 : 0.5,
  });

  const getThumbStyle = (): ViewStyle => ({
    width: dimensions.thumbSize,
    height: dimensions.thumbSize,
    borderRadius: dimensions.thumbSize / 2,
    backgroundColor: value ? switchColors.activeThumb : switchColors.inactiveThumb,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
    transform: [
      {
        translateX: value 
          ? dimensions.width - dimensions.thumbSize - dimensions.padding * 2
          : 0
      }
    ],
  });

  const handlePress = () => {
    if (enabled && onValueChange) {
      onValueChange(!value);
    }
  };

  return (
    <TouchableOpacity
      style={[getTrackStyle(), style]}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={!enabled}
      testID={testID}
    >
      <View style={getThumbStyle()} />
    </TouchableOpacity>
  );
};

/**
 * Widget combinado de toggle con etiqueta
 */
export const SpoonLabeledToggle: React.FC<SpoonLabeledToggleProps> = ({
  label,
  subtitle,
  value,
  onValueChange,
  size = SpoonToggleSwitchSize.MEDIUM,
  enabled = true,
  padding,
  crossAxisAlignment = 'center',
  style,
  testID,
  ...toggleProps
}) => {
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();

  const getContainerStyle = (): ViewStyle => ({
    flexDirection: 'row',
    alignItems: crossAxisAlignment,
    justifyContent: 'space-between',
    paddingVertical: padding || spacing.md,
    paddingHorizontal: padding || spacing.md,
  });

  const getLabelStyle = (): TextStyle => ({
    ...typography.bodyMedium,
    color: enabled ? colors.textPrimary : colors.textSecondary,
    fontWeight: '500',
  });

  const getSubtitleStyle = (): TextStyle => ({
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  });

  return (
    <View style={[getContainerStyle(), style]} testID={testID}>
      <View style={styles.labelContainer}>
        <Text style={getLabelStyle()}>
          {label}
        </Text>
        {subtitle && (
          <Text style={getSubtitleStyle()}>
            {subtitle}
          </Text>
        )}
      </View>
      
      <SpoonToggleSwitch
        value={value}
        onValueChange={onValueChange}
        size={size}
        enabled={enabled}
        testID={`${testID}-toggle`}
        {...toggleProps}
      />
    </View>
  );
};

/**
 * Modelo para items de toggle en grupos
 */
export interface SpoonToggleItem {
  key: string;
  label: string;
  subtitle?: string;
  value: boolean;
  enabled?: boolean;
}

/**
 * Props para el componente SpoonToggleGroup
 */
export interface SpoonToggleGroupProps {
  title?: string;
  items: SpoonToggleItem[];
  onToggleChange: (key: string, value: boolean) => void;
  size?: SpoonToggleSwitchSize;
  style?: ViewStyle;
  testID?: string;
}

/**
 * Widget para grupo de toggles
 */
export const SpoonToggleGroup: React.FC<SpoonToggleGroupProps> = ({
  title,
  items,
  onToggleChange,
  size = SpoonToggleSwitchSize.MEDIUM,
  style,
  testID,
}) => {
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();

  const getTitleStyle = (): TextStyle => ({
    ...typography.titleMedium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  });

  const getGroupStyle = (): ViewStyle => ({
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
  });

  return (
    <View style={[getGroupStyle(), style]} testID={testID}>
      {title && (
        <Text style={getTitleStyle()}>
          {title}
        </Text>
      )}
      
      {items.map((item, index) => (
        <View key={item.key}>
          <SpoonLabeledToggle
            label={item.label}
            subtitle={item.subtitle}
            value={item.value}
            onValueChange={(value) => onToggleChange(item.key, value)}
            size={size}
            enabled={item.enabled}
            testID={`${testID}-item-${item.key}`}
          />
          
          {index < items.length - 1 && (
            <View style={[styles.divider, { backgroundColor: colors.outline }]} />
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  labelContainer: {
    flex: 1,
    marginRight: 16,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
});

export default SpoonToggleSwitch;
