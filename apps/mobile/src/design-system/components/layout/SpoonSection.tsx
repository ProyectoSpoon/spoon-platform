import React from 'react';
import { View, ViewStyle, Text, TextStyle } from 'react-native';
import { useSpacing, useColors, useTypography } from '../../context/ThemeContext';

export interface SpoonSectionProps {
  title?: string;
  subtitle?: string;
  inset?: boolean; // agrega padding horizontal interno
  children?: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  rightAction?: React.ReactNode; // por ejemplo un botón "Ver todos"
  spacingTop?: keyof ReturnType<typeof useSpacing>;
  spacingBottom?: keyof ReturnType<typeof useSpacing>;
  testID?: string;
}

/**
 * Sección básica vertical con título y contenido.
 * Estandariza paddings y jerarquía tipográfica.
 */
export const SpoonSection: React.FC<SpoonSectionProps> = ({
  title,
  subtitle,
  inset = true,
  children,
  style,
  contentStyle,
  rightAction,
  spacingTop = 'md',
  spacingBottom = 'lg',
  testID = 'spoon-section'
}) => {
  const spacing = useSpacing();
  const colors = useColors();
  const typography = useTypography();

  const container: ViewStyle = {
    width: '100%',
    paddingTop: spacing[spacingTop],
    paddingBottom: spacing[spacingBottom],
    ...(style as object),
  };

  const header: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: title || subtitle ? spacing.xs : 0,
    paddingHorizontal: inset ? spacing.md : 0,
  };

  const titleStyle: TextStyle = {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '700',
  };

  const subtitleStyle: TextStyle = {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  };

  const body: ViewStyle = {
    paddingHorizontal: inset ? spacing.md : 0,
    ...(contentStyle as object),
  };

  const renderHeader = () => {
    if (!title && !rightAction) return null;
    return (
      <View style={header} testID={`${testID}-header`}>
        <View style={{ flex: 1, paddingRight: spacing.sm }}>
          {title && <Text style={titleStyle}>{title}</Text>}
          {subtitle && <Text style={subtitleStyle}>{subtitle}</Text>}
        </View>
        {rightAction}
      </View>
    );
  };

  return (
    <View style={container} testID={testID}>
      {renderHeader()}
      <View style={body} testID={`${testID}-content`}>
        {children}
      </View>
    </View>
  );
};

export default SpoonSection;
