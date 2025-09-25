import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useColors, useSpacing, useTypography } from '../../context/ThemeContext';

export interface SpoonSearchHistoryItemProps {
  text: string;
  onPress?: () => void;
  testID?: string;
}

export const SpoonSearchHistoryItem: React.FC<SpoonSearchHistoryItemProps> = ({ text, onPress, testID='search-history-item' }) => {
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();
  return (
    <TouchableOpacity onPress={onPress} style={{ flexDirection:'row', alignItems:'center', paddingVertical: spacing.sm }} activeOpacity={0.7} testID={testID}>
      <Text style={{ fontSize:14, marginRight: spacing.sm }}>🕒</Text>
      <Text style={{ ...typography.bodyMedium, flex:1, color: colors.textPrimary }}>{text}</Text>
      <Text style={{ fontSize:14, color: colors.textSecondary }}>↗️</Text>
    </TouchableOpacity>
  );
};

export default SpoonSearchHistoryItem;
