import React from 'react';
import { View, Text } from 'react-native';
import { SpoonRatingStars } from './SpoonRatingStars';

interface Props {
  stats: { rating_average: number; reviews_count: number } | null | undefined;
  showBreakdown?: boolean;
}

export const SpoonReviewStats: React.FC<Props> = ({ stats }) => {
  if (!stats) return null;
  return (
    <View style={{ padding: 12, backgroundColor: '#fff', borderRadius: 12, marginBottom: 12 }}>
      <Text style={{ fontSize: 32, fontWeight: '700' }}>{stats.rating_average?.toFixed(1) || '—'}</Text>
      <SpoonRatingStars rating={stats.rating_average || 0} size={18} />
      <Text style={{ marginTop: 4, color: '#666' }}>{stats.reviews_count} reseñas</Text>
    </View>
  );
};
