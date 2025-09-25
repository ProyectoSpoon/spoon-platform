import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SpoonRatingStars } from './SpoonRatingStars';

interface UserMeta { id: string; full_name: string; avatar_url?: string }
export interface SpoonReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment?: string;
    created_at: string;
    user: UserMeta;
  };
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const SpoonReviewCard: React.FC<SpoonReviewCardProps> = ({ review }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.user}>{review.user.full_name}</Text>
        <SpoonRatingStars rating={review.rating} size={16} />
      </View>
      {review.comment ? <Text style={styles.comment}>{review.comment}</Text> : null}
      <Text style={styles.date}>{new Date(review.created_at).toLocaleDateString('es-CO')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 8, shadowColor: '#0002', shadowOpacity: 0.15, shadowRadius: 6 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  user: { fontWeight: '600', fontSize: 14 },
  comment: { fontSize: 14, marginBottom: 6 },
  date: { fontSize: 12, color: '#666' }
});
