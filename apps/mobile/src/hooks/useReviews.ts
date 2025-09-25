// src/hooks/useReviews.ts

import { useState, useEffect, useCallback } from 'react';
import {
  obtenerReviewsRestaurante,
  obtenerEstadisticasRestaurante,
  enviarReview,
  obtenerMiReview,
  eliminarMiReview,
  type ApiReview as RestaurantReview,
  type RestaurantStats
} from '../lib/supabasewebadmin';
import { getUserProfile } from '../lib/supabase';
import { Alert } from 'react-native';

interface UseReviewsParams {
  restaurantId: string;
  autoLoad?: boolean;
}

interface UseReviewsReturn {
  reviews: RestaurantReview[];
  stats: RestaurantStats | null;
  myReview: RestaurantReview | null;
  currentUser: any;
  loading: boolean;
  refreshing: boolean;
  submitting: boolean;
  hasMore: boolean;
  error: string | null;
  loadReviews: (reset?: boolean) => Promise<void>;
  loadStats: () => Promise<void>;
  loadMyReview: () => Promise<void>;
  submitReview: (reviewData: { rating: number; comment?: string }) => Promise<void>;
  deleteMyReview: () => Promise<void>;
  refresh: () => Promise<void>;
  canSubmitReview: boolean;
  totalPages: number;
}

export const useReviews = ({ 
  restaurantId, 
  autoLoad = true 
}: UseReviewsParams): UseReviewsReturn => {
  // Estados
  const [reviews, setReviews] = useState<RestaurantReview[]>([]);
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [myReview, setMyReview] = useState<RestaurantReview | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  
  const REVIEWS_PER_PAGE = 10;

  // Cargar usuario actual
  useEffect(() => {
    getUserProfile()
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null));
  }, []);

  // Auto-cargar datos al montar
  useEffect(() => {
    if (autoLoad && restaurantId) {
      loadInitialData();
    }
  }, [restaurantId, autoLoad]);

  const loadInitialData = async () => {
    await Promise.all([
      loadStats(),
      loadReviews(true),
      currentUser && loadMyReview()
    ]);
  };

  const loadReviews = useCallback(async (reset = false) => {
    if (!restaurantId) return;
    if (!reset && (loading || !hasMore)) return;

    try {
      setLoading(true);
      setError(null);

      const offset = reset ? 0 : reviews.length;
      const response = await (obtenerReviewsRestaurante as any)({
        restaurantId,
        limit: REVIEWS_PER_PAGE,
        offset,
        order: 'created_at_desc'
      });

      if (reset) {
        setReviews(response.reviews);
        setCurrentPage(1);
      } else {
        setReviews(prev => [...prev, ...response.reviews]);
        setCurrentPage(prev => prev + 1);
      }

  const total = response.total || response.stats?.reviews_count || 0;
  setHasMore(reviews.length + response.reviews.length < total);

    } catch (err: any) {
      console.error('Error loading reviews:', err);
      setError(err.message || 'Error cargando reseñas');
    } finally {
      setLoading(false);
    }
  }, [restaurantId, reviews.length, loading, hasMore]);

  const loadStats = useCallback(async () => {
    if (!restaurantId) return;

    try {
      const statsData = await obtenerEstadisticasRestaurante(restaurantId);
      setStats(statsData);
    } catch (err: any) {
      console.error('Error loading stats:', err);
      // No mostrar error para stats, solo log
    }
  }, [restaurantId]);

  const loadMyReview = useCallback(async () => {
    if (!restaurantId || !currentUser) return;

    try {
      const reviewData = await obtenerMiReview(
        restaurantId,
        currentUser.id,
        'auth-token' // Token real aquí
      );
      setMyReview(reviewData);
    } catch (err) {
      // No hay review del usuario o no autenticado
      setMyReview(null);
    }
  }, [restaurantId, currentUser]);

  const submitReview = useCallback(async (reviewData: { rating: number; comment?: string }) => {
    if (!currentUser) {
      Alert.alert('Error', 'Debes iniciar sesión para dejar una reseña');
      throw new Error('Usuario no autenticado');
    }

    try {
      setSubmitting(true);
      setError(null);

  await enviarReview(restaurantId, reviewData, 'auth-token');

      // Recargar datos
      await Promise.all([
        loadStats(),
        loadMyReview(),
        loadReviews(true) // Reset reviews para mostrar la nueva
      ]);

      Alert.alert('Éxito', 'Reseña enviada correctamente');

    } catch (err: any) {
      console.error('Error submitting review:', err);
      const errorMessage = err.message || 'No se pudo enviar la reseña';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [currentUser, restaurantId, loadStats, loadMyReview, loadReviews]);

  const deleteMyReview = useCallback(async () => {
    if (!currentUser || !myReview) {
      throw new Error('No hay reseña para eliminar');
    }

    return new Promise<void>((resolve, reject) => {
      Alert.alert(
        'Eliminar reseña',
        '¿Estás seguro de que quieres eliminar tu reseña?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => reject(new Error('Cancelado por usuario'))
          },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              try {
                await eliminarMiReview(
                  restaurantId,
                  currentUser.id,
                  'auth-token'
                );

                // Recargar datos
                await Promise.all([
                  loadStats(),
                  loadReviews(true)
                ]);

                setMyReview(null);
                Alert.alert('Éxito', 'Reseña eliminada correctamente');
                resolve();

              } catch (err: any) {
                console.error('Error deleting review:', err);
                const errorMessage = err.message || 'No se pudo eliminar la reseña';
                Alert.alert('Error', errorMessage);
                reject(err);
              }
            }
          }
        ]
      );
    });
  }, [currentUser, myReview, restaurantId, loadStats, loadReviews]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadStats(),
        loadReviews(true),
        currentUser && loadMyReview()
      ]);
    } catch (err) {
      console.error('Error refreshing:', err);
    } finally {
      setRefreshing(false);
    }
  }, [loadStats, loadReviews, loadMyReview, currentUser]);

  // Computed properties
  const canSubmitReview = Boolean(currentUser && !submitting);
  const totalPages = stats ? Math.ceil((stats.reviews_count || 0) / REVIEWS_PER_PAGE) : 0;

  return {
    // Estado
    reviews,
    stats,
    myReview,
    currentUser,
    loading,
    refreshing,
    submitting,
    hasMore,
    error,
    
    // Acciones
    loadReviews,
    loadStats,
    loadMyReview,
    submitReview,
    deleteMyReview,
    refresh,
    
    // Utils
    canSubmitReview,
    totalPages,
  };
};

// Hook simplificado para solo estadísticas
export const useRestaurantStats = (restaurantId: string) => {
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!restaurantId) return;

    try {
      setLoading(true);
      setError(null);
      const statsData = await obtenerEstadisticasRestaurante(restaurantId);
      setStats(statsData);
    } catch (err: any) {
      console.error('Error loading stats:', err);
      setError(err.message || 'Error cargando estadísticas');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    reload: loadStats
  };
};