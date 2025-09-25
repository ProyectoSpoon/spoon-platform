import React from 'react';
import { View, TextInput, TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { useColors, useSpacing, useRadii, useShadows, useTypography } from '../../context/ThemeContext';

export interface SpoonSearchBarProps {
  value: string;
  placeholder?: string;
  onChange: (text: string) => void;
  onSubmit?: (text: string) => void;
  onActionPress?: () => void; // filtro / settings
  actionIcon?: string;
  testID?: string;
}

export const SpoonSearchBar: React.FC<SpoonSearchBarProps> = ({
  value,
  placeholder = 'Buscar...',
  onChange,
  onSubmit,
  onActionPress,
  actionIcon = '⚙️',
  testID = 'spoon-search-bar'
}) => {
  const colors = useColors();
  const spacing = useSpacing();
  const radii = useRadii();
  const shadows = useShadows();
  const typography = useTypography();

  const container: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    ...shadows.sm,
  };

  const inputStyle: TextStyle = {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.textPrimary,
  };

  const iconStyle: TextStyle = {
    fontSize: 18,
    marginRight: spacing.sm,
  };

  const actionBtn: ViewStyle = {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  };

  return (
    <View style={container} testID={testID}>
      <Text style={iconStyle}>🔍</Text>
      <TextInput
        style={inputStyle}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChange}
        onSubmitEditing={() => onSubmit?.(value)}
        returnKeyType="search"
        testID={`${testID}-input`}
      />
      {!!onActionPress && (
        <TouchableOpacity style={actionBtn} onPress={onActionPress} testID={`${testID}-action`}>
          <Text style={{ fontSize: 18 }}>{actionIcon}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SpoonSearchBar;
