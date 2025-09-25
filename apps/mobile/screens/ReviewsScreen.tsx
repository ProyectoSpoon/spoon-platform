import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { obtenerReviewsRestaurante } from '../src/lib/supabasewebadmin';
import { SpoonReviewCard, SpoonReviewStats } from '../src/design-system/components/reviews';
import { SpoonPage, SpoonSection, SpoonText } from '../src/design-system/components';

export default function ReviewsScreen() {
  const route: any = useRoute();
  const { restaurantId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const load = useCallback(async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      setError(null);
      const res = await (obtenerReviewsRestaurante as any)({ restaurantId, limit, offset: reset ? 0 : offset });
      if (reset) {
        setReviews(res.reviews);
      } else {
        setReviews(prev => [...prev, ...res.reviews]);
      }
      setStats(res.stats);
      const total = res.total || res.stats?.reviews_count || 0;
      const newOffset = (reset ? 0 : offset) + limit;
      setOffset(newOffset);
      setHasMore(newOffset < total);
    } catch (e) {
      const msg = (e as any).message || 'Error cargando reseñas';
      console.warn('Error cargando reseñas', msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, limit, offset, loading]);

  useEffect(() => { load(true); }, [restaurantId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setOffset(0);
    await load(true);
    setRefreshing(false);
  }, [load]);

  return (
    <SpoonPage>
      <View style={{ padding:16 }}><SpoonText style={{ fontSize:20, fontWeight:'700' }}>Reseñas</SpoonText></View>
      <FlatList
        ListHeaderComponent={<View style={{ padding: 16 }}>
          <SpoonReviewStats stats={stats} />
          {error && !loading && (
            <View style={{ backgroundColor:'#fee', padding:12, borderRadius:8, marginTop:8 }}>
              <SpoonText style={{ color:'#900', marginBottom:8 }}>{error}</SpoonText>
              <TouchableOpacity onPress={() => load(true)} style={{ backgroundColor:'#900', padding:10, borderRadius:6 }}>
                <SpoonText style={{ color:'#fff', textAlign:'center', fontWeight:'600' }}>Reintentar</SpoonText>
              </TouchableOpacity>
            </View>
          )}
        </View>}
        data={reviews}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <View style={{ paddingHorizontal: 16 }}><SpoonReviewCard review={item} /></View>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListFooterComponent={loading ? <ActivityIndicator style={{ margin: 16 }} /> : null}
        onEndReachedThreshold={0.3}
        onEndReached={() => { if (!loading && hasMore) load(); }}
        ListEmptyComponent={!loading ? <View style={{ padding: 32, alignItems: 'center' }}><SpoonText>No hay reseñas aún</SpoonText></View> : null}
      />
    </SpoonPage>
  );
}
