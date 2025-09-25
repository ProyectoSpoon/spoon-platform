import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ViewStyle, TextStyle } from 'react-native';
import { useColors, useSpacing, useRadii, useShadows, useTypography } from '../../context/ThemeContext';

export interface SpoonSearchHeaderProps {
  value: string;
  onChange: (text: string) => void;
  onSubmit?: () => void;
  onBack?: () => void;
  onClear?: () => void;
  onFilters?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  testID?: string;
}

export const SpoonSearchHeader: React.FC<SpoonSearchHeaderProps> = ({
  value,
  onChange,
  onSubmit,
  onBack,
  onClear,
  onFilters,
  placeholder = 'Buscar…',
  autoFocus = false,
  testID = 'search-header'
}) => {
  const colors = useColors();
  const spacing = useSpacing();
  const radii = useRadii();
  const shadows = useShadows();
  const typography = useTypography();

  const container: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    ...shadows.sm,
  };

  const backBtn: ViewStyle = {
    padding: spacing.xs,
    marginRight: spacing.sm,
  };

  const searchWrapper: ViewStyle = {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  };

  const inputStyle: TextStyle = {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.textPrimary,
    paddingVertical: 4,
  };

  const iconStyle: TextStyle = { fontSize: 18, marginRight: spacing.xs };
  const trailingBtn: ViewStyle = { padding: spacing.xs, marginLeft: spacing.xs };

  return (
    <View style={container} testID={testID}>
      {!!onBack && (
        <TouchableOpacity style={backBtn} onPress={onBack} testID={`${testID}-back`}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
      )}
      <View style={searchWrapper}>
        <Text style={iconStyle}>🔍</Text>
        <TextInput
          style={inputStyle}
          placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            value={value}
            onChangeText={onChange}
            onSubmitEditing={onSubmit}
            autoFocus={autoFocus}
            returnKeyType="search"
            testID={`${testID}-input`}
        />
        {!!value && !!onClear && (
          <TouchableOpacity style={trailingBtn} onPress={onClear} testID={`${testID}-clear`}>
            <Text style={{ fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
        {!!onFilters && (
          <TouchableOpacity style={trailingBtn} onPress={onFilters} testID={`${testID}-filters`}>
            <Text style={{ fontSize: 18 }}>⚙️</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SpoonSearchHeader;
