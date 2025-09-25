import React from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SpoonPage } from '../src/design-system/components';
import { SpoonReviewForm } from '../src/design-system/components/reviews';
import { createReview, updateReview } from '../src/lib/supabase';
import { Alert } from 'react-native';

export default function WriteReviewScreen() {
  const route: any = useRoute();
  const nav = useNavigation();
  const { restaurantId, restaurantName, editReview } = route.params;
  const [loading, setLoading] = React.useState(false);
  const editing = !!editReview;

  const submit = async (data: { rating: number; comment?: string }) => {
    try {
      setLoading(true);
      if (editing) {
        await updateReview(editReview.id, { rating: data.rating, comment: data.comment });
        Alert.alert('Éxito', 'Reseña actualizada');
      } else {
        await createReview({ restaurant_id: restaurantId, rating: data.rating, comment: data.comment });
        Alert.alert('Éxito', 'Reseña creada');
      }
      nav.goBack();
    } catch (e:any) {
      Alert.alert('Error', e.message || 'No se pudo crear la reseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SpoonPage>
      {/* Encabezado simple */}
      {/* Asumimos que SpoonPage no recibe title, por eso mostramos texto manual */}
      {/* TODO: Reemplazar por componente de header propio si existe */}
      <SpoonReviewForm
        onSubmit={submit}
        loading={loading}
        initialData={editing ? { rating: editReview.rating, comment: editReview.comment } : undefined}
        submitLabel={editing ? 'Actualizar Reseña' : 'Enviar Reseña'}
      />
    </SpoonPage>
  );
}
