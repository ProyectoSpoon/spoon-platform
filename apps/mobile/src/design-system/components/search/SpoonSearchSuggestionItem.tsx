import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useColors, useSpacing, useTypography } from '../../context/ThemeContext';

export interface SpoonSearchSuggestionItemProps {
  icon?: string;
  text: string;
  type?: string;
  onPress?: () => void;
  testID?: string;
}

export const SpoonSearchSuggestionItem: React.FC<SpoonSearchSuggestionItemProps> = ({ icon='🔍', text, type, onPress, testID='search-suggestion-item' }) => {
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();
  return (
    <TouchableOpacity onPress={onPress} style={{ flexDirection:'row', alignItems:'center', paddingVertical: spacing.sm }} activeOpacity={0.7} testID={testID}>
      <Text style={{ fontSize:18, marginRight: spacing.sm }}>{icon}</Text>
      <View style={{ flex:1 }}>
        <Text style={{ ...typography.bodyMedium, color: colors.textPrimary }}>{text}</Text>
        {!!type && <Text style={{ ...typography.labelSmall, color: colors.textSecondary }}>{type}</Text>}
      </View>
      <Text style={{ fontSize:14, color: colors.textSecondary }}>↗️</Text>
    </TouchableOpacity>
  );
};

export default SpoonSearchSuggestionItem;
