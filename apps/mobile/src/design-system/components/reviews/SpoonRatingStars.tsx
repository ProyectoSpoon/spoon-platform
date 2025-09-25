import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

interface Props {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (value: number) => void;
  max?: number;
}

export const SpoonRatingStars: React.FC<Props> = ({ rating, size = 20, interactive = false, onRatingChange, max = 5 }) => {
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  return (
    <View style={{ flexDirection: 'row' }}>
      {stars.map(value => {
        const filled = value <= Math.round(rating);
        const char = filled ? '★' : '☆';
        const color = filled ? '#FFC107' : '#E0E0E0';
        return (
          <TouchableOpacity
            key={value}
            disabled={!interactive}
            onPress={() => interactive && onRatingChange?.(value)}
            style={{ paddingHorizontal: 2 }}
          >
            <Text style={{ fontSize: size, color }}>{char}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
