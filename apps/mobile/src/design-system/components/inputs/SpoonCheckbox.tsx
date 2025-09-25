import React from 'react';
import { TouchableOpacity, View, Text, ViewStyle, TextStyle } from 'react-native';
import { useColors, useSpacing, useRadii, useTypography } from '../../context/ThemeContext';

export interface SpoonCheckboxProps {
  label?: string | React.ReactNode;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  description?: string;
  style?: ViewStyle;
  testID?: string;
}

export const SpoonCheckbox: React.FC<SpoonCheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  description,
  style,
  testID = 'spoon-checkbox'
}) => {
  const colors = useColors();
  const spacing = useSpacing();
  const radii = useRadii();
  const typo = useTypography();

  const boxStyle: ViewStyle = {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: disabled ? colors.outline : checked ? colors.primary : colors.outline,
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: checked ? colors.primary : 'transparent'
  };

  const labelStyle: TextStyle = {
    ...typo.bodySmall,
    color: disabled ? colors.textDisabled : colors.textSecondary,
    lineHeight: 20
  } as TextStyle;

  const descriptionStyle: TextStyle = {
    ...typo.bodySmall,
    color: colors.textSecondary,
    marginTop: 2
  } as TextStyle;

  return (
    <TouchableOpacity
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      onPress={() => !disabled && onChange(!checked)}
      style={[{ flexDirection: 'row', alignItems: 'flex-start' }, style]}
      disabled={disabled}
      testID={testID}
    >
  <View style={boxStyle}>{checked && <Text style={{ color: colors.textOnPrimary, fontSize: 12, fontWeight: 'bold' }}>✓</Text>}</View>
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        {typeof label === 'string' ? <Text style={labelStyle}>{label}</Text> : label}
        {!!description && <Text style={descriptionStyle}>{description}</Text>}
      </View>
    </TouchableOpacity>
  );
};

export default SpoonCheckbox;
