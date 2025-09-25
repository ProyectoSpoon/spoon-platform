import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { SpoonRatingStars } from './SpoonRatingStars';

interface Props {
  onSubmit: (data: { rating: number; comment?: string }) => Promise<void> | void;
  initialData?: { rating: number; comment?: string } | null;
  loading?: boolean;
  submitLabel?: string;
}

export const SpoonReviewForm: React.FC<Props> = ({ onSubmit, initialData, loading, submitLabel }) => {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [comment, setComment] = useState(initialData?.comment || '');

  const disabled = loading || rating === 0;

  return (
    <View style={{ padding: 12 }}>
      <Text style={{ fontWeight: '600', marginBottom: 6 }}>Tu Calificación</Text>
      <SpoonRatingStars rating={rating} interactive onRatingChange={setRating} size={28} />
      <TextInput
        placeholder="Escribe un comentario (opcional)"
        multiline
        value={comment}
        onChangeText={setComment}
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginTop: 12, padding: 8, minHeight: 80 }}
      />
  <Button title={loading ? 'Enviando...' : (submitLabel || 'Enviar Reseña')} onPress={() => onSubmit({ rating, comment })} disabled={disabled} />
    </View>
  );
};
