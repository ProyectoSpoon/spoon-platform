import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Alert, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Modal, Pressable, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
// If useFocusEffect is available in project setup, it can be reintroduced. For now we'll simulate focus reload via navigation listener.
import { SpoonPage, SpoonText, SpoonStatusChip, SpoonActionGrid, SpoonFeaturedDishCard, SpoonMapPlaceholder } from '../src/design-system/components';
import { SpoonReviewStats, SpoonReviewCard } from '../src/design-system/components/reviews';
import { useColors, useSpacing } from '../src/design-system';
import { WebAdminAPI, obtenerEstadisticasRestaurante, obtenerReviewsRestaurante, obtenerMiReview, type ApiReview as RestaurantReview, type RestaurantStats as Stats } from '../src/lib/supabasewebadmin';
import { fetchRestaurantProgressive, getRestaurantByIdDirect } from '../src/lib/webadminSupabase';
import { getUserProfile, deleteReview } from '../src/lib/supabase';
import { normalizeBusinessHours, isOpenNow as isOpenNowUtil, formatTodayHours as formatTodayHoursUtil } from '../src/utils/businessHours';

export default function RestaurantDetailScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const horizontalPad = (spacing as any).page || (spacing as any).xl || spacing.lg || spacing.md || 16;
  const navigation: any = useNavigation();
  const route: any = useRoute();
  const { restaurantId } = route.params || {};
  const [stats, setStats] = useState<Stats | null>(null);
  const [reviews, setReviews] = useState<RestaurantReview[]>([]);
  const [myReview, setMyReview] = useState<RestaurantReview | null>(null);
  const [info, setInfo] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [hoursVisible, setHoursVisible] = useState(false);
  const [heroError, setHeroError] = useState(false);

  // Single effect: initial load + refetch on focus, avoiding double trigger
  useEffect(() => {
    if (!restaurantId) return;
    load();
    const unsubscribe = navigation.addListener('focus', () => {
      load();
    });
    return unsubscribe;
  }, [navigation, restaurantId]);

  const normalizeStats = (s: any): { rating_average: number; reviews_count: number } | null => {
    if (!s) return null;
    return {
      rating_average: s.rating_average ?? s.averageRating ?? 0,
      reviews_count: s.reviews_count ?? s.totalReviews ?? 0
    };
  };

  const inFlightRef = useRef(false);
  const lastLoadRef = useRef<number>(0);
  const restDisabledUntilRef = useRef<number>(0); // timestamp hasta el cual saltar REST tras timeout
  const lastRestFailRef = useRef<number>(0);
  const REST_BACKOFF_MS = 5 * 60 * 1000; // 5 minutos

  const load = async () => {
    // Debounce rapid re-entries (e.g., fast focus events) & prevent concurrent calls
    if (inFlightRef.current) return;
    const now = Date.now();
    if (now - lastLoadRef.current < 1200) return; // 1.2s debounce
    inFlightRef.current = true;
    lastLoadRef.current = now;
    try {
  if (__DEV__) console.log('[@RestaurantDetail] load() start', { restaurantId, prevInfo: !!info });
      setError(null);
      setLoading(true);
      let base: any = null;
      let gotAbort = false;
      const nowTs = Date.now();
      const skipRest = nowTs < restDisabledUntilRef.current;
      if (skipRest && __DEV__) console.log('[@RestaurantDetail] Saltando REST (backoff activo)');
      if (!skipRest) {
        try {
          if (__DEV__) console.log('[@RestaurantDetail] Intentando REST restaurantId=', restaurantId);
          base = await WebAdminAPI.getRestaurantDetails(restaurantId);
          if (__DEV__) console.log('[@RestaurantDetail] REST base OK, early setInfo');
          // Mostrar inmediatamente datos básicos
          setInfo(prev => prev || base);
        } catch (e:any) {
          const aborted = e?.name === 'AbortError' || /Abort|tiempo de espera/i.test(e?.message || '');
          gotAbort = aborted;
            if (!aborted) lastRestFailRef.current = nowTs;
          if (__DEV__) console.log('[@RestaurantDetail] REST fallo, aborted=', aborted, e?.message || e);
          // Activar backoff si timeout/abort
          if (aborted) {
            restDisabledUntilRef.current = Date.now() + REST_BACKOFF_MS;
            if (__DEV__) console.log('[@RestaurantDetail] Activando backoff REST por timeout/abort hasta', new Date(restDisabledUntilRef.current).toLocaleTimeString());
          }
          // Fallback directo
          try {
            base = await fetchRestaurantProgressive(restaurantId) || await getRestaurantByIdDirect(restaurantId);
            if (__DEV__) console.log('[@RestaurantDetail] Fallback directo OK', base);
            setInfo(prev => prev || base); // early show fallback
          } catch (d:any) {
            if (__DEV__) console.log('[@RestaurantDetail] Fallback directo fallo', d?.message || d);
            if (!aborted) throw d; // Solo propagar si no fue simplemente un aborto de timeout
          }
        }
      }
      if (!base && skipRest) {
        // Intentar directo inmediatamente porque REST está deshabilitado
        try {
          base = await fetchRestaurantProgressive(restaurantId) || await getRestaurantByIdDirect(restaurantId);
          if (__DEV__) console.log('[@RestaurantDetail] (Backoff) Directo OK', base);
          setInfo(prev => prev || base);
        } catch (e:any) {
          if (__DEV__) console.log('[@RestaurantDetail] (Backoff) Directo fallo', e?.message || e);
        }
      }
      if (!base) {
        if (__DEV__) console.log('[@RestaurantDetail] Sin base tras intentos');
        throw new Error('No se pudo obtener el restaurante');
      }
      if (__DEV__) console.log('[@RestaurantDetail] Obteniendo datos secundarios (stats, reviews, user)');
      const currentUser = await getUserProfile();
      const [statsData, listData, my] = await Promise.all([
        obtenerEstadisticasRestaurante(restaurantId).catch(() => null),
        obtenerReviewsRestaurante({ restaurantId, limit: 5, offset: 0 }).catch(() => ({ reviews: [] })),
        currentUser ? obtenerMiReview(restaurantId, currentUser.id, 'auth') : Promise.resolve(null)
      ]);
      setStats(statsData as any);
      setReviews(((listData as any)?.reviews) || []);
      setMyReview(my as any);
      setInfo(b => b || base); // asegurar que no se haya sobreescrito
      setUser(currentUser);
  if (__DEV__) console.log('[@RestaurantDetail] load() completed', { gotBase: !!base, stats: !!statsData, reviewsCount: (listData as any)?.reviews?.length || 0 });
    } catch (e:any) {
      // Si ya tenemos info base (fallback) y el error fue por timeout/abort, no mostramos error UI
      if (info || /tiempo de espera|abort/i.test(e.message || '')) {
        if (__DEV__) console.log('[@RestaurantDetail] Ignorando error no fatal:', e.message);
      } else {
        setError(e.message || 'No se pudo cargar');
      }
  } finally { setLoading(false); inFlightRef.current = false; }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  // Utilidades de horarios (estructura: dia -> { abierto: bool, turnos: [ { horaApertura, horaCierre } ] })
  const getTodayKey = () => new Date().toLocaleDateString('es-CO', { weekday: 'long' }).toLowerCase();
  const normalizedHours = normalizeBusinessHours(info?.business_hours);
  const isOpenNow = () => isOpenNowUtil(normalizedHours);
  const formatTodayHours = () => formatTodayHoursUtil(normalizedHours);

  const openStatus = isOpenNow();
  const ratingSummary = normalizeStats(stats);

  const callPhone = () => {
    if (!info?.contact_phone) return Alert.alert('Teléfono','No disponible');
    try { const formatted = String(info.contact_phone).replace(/[^+\d]/g,''); Alert.alert('Llamar', formatted); } catch {}
  };
  const showHours = () => {
    if (!info?.business_hours) return Alert.alert('Horarios','No disponibles');
    setHoursVisible(true);
  };
  const closeHours = () => setHoursVisible(false);
  const openMap = () => {
    if (!info?.address) return Alert.alert('Mapa','Dirección no disponible');
    Alert.alert('Mapa', info.address);
  };
  const shareRestaurant = () => Alert.alert('Compartir', info?.name || 'Restaurante');
  const toggleFavorite = () => setFavorite(f => !f);

  return (
  <SpoonPage scroll padded={false}>
  {/* Eliminado espacio superior para que la imagen ocupe el área disponible */}
      {loading && !info && (
        <View style={{ paddingVertical:40 }}><ActivityIndicator color={colors.primary} /></View>
      )}
      {!loading && !info && !error && (
        <View style={{ paddingVertical:40 }}>
          <SpoonText style={{ textAlign:'center', color:'#666' }}>No se encontró el restaurante.</SpoonText>
        </View>
      )}
      {error && (
        <View style={{ backgroundColor:'#fee', padding:12, borderRadius:8, marginBottom:16 }}>
          <SpoonText style={{ color:'#900' }}>{error}</SpoonText>
        </View>
      )}
      {info && (
        <>
          {/* Header / Hero */}
          <View style={{ height: 340, position:'relative', marginBottom:24, marginHorizontal: -horizontalPad }}>
            <View style={{ flex:1, backgroundColor: colors.surface, justifyContent:'center', alignItems:'center', overflow:'hidden' }}>
              {info.logo_url && !heroError ? (
                <Image
                  source={{ uri: info.logo_url }}
                  resizeMode="cover"
                  onError={() => { if (__DEV__) console.log('[@RestaurantDetail] Hero remote image error, usando fallback'); setHeroError(true); }}
                  style={{ position:'absolute', top:0, left:0, right:0, bottom:0, width:'100%', height:'100%' }}
                />
              ) : (
                <Image
                  source={require('../assets/restaurantes/restaurante.png')}
                  resizeMode="cover"
                  style={{ position:'absolute', top:0, left:0, right:0, bottom:0, width:'100%', height:'100%' }}
                />
              )}
              {/* Overlay ligera para legibilidad de iconos (más transparente) */}
              <View style={{ position:'absolute', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.18)' }} />
            </View>
            <View style={{ position:'absolute', top:10, left:0, right:0, flexDirection:'row', justifyContent:'flex-end', paddingHorizontal:16 }}>
              <View style={{ flexDirection:'row', gap:12 }}>
                <TouchableOpacity style={{ width:40, height:40, backgroundColor:'#0005', borderRadius:8, justifyContent:'center', alignItems:'center' }} onPress={toggleFavorite}>
                  <SpoonText style={{ fontSize:20 }}>{favorite ? '❤️' : '🤍'}</SpoonText>
                </TouchableOpacity>
                <TouchableOpacity style={{ width:40, height:40, backgroundColor:'#0005', borderRadius:8, justifyContent:'center', alignItems:'center' }} onPress={shareRestaurant}>
                  <SpoonText style={{ fontSize:20 }}>📤</SpoonText>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Padding manual tras hero */}
          <View style={{ paddingHorizontal: horizontalPad }}>
          {/* Info Card */}
          <View style={{ backgroundColor:colors.surface, borderRadius:16, padding:20, marginBottom:24 }}>
            <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <SpoonText variant="titleMedium" weight="bold" style={{ flex:1, marginRight:12 }}>{info.name || 'Restaurante'}</SpoonText>
              <SpoonStatusChip open={openStatus ?? false} />
            </View>
            <SpoonText variant="bodySmall" style={{ color:colors.secondary, marginBottom:16 }}>{info.cuisine_type || 'Categoria'}</SpoonText>
            <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <View style={{ flexDirection:'row', alignItems:'center' }}>
                <SpoonText style={{ fontSize:16, marginRight:4 }}>⭐</SpoonText>
                <SpoonText variant="bodyMedium" weight="bold" style={{ marginRight:6 }}>{ratingSummary?.rating_average?.toFixed(1) || '0.0'}</SpoonText>
                <SpoonText variant="labelSmall" style={{ color:colors.secondary }}>({ratingSummary?.reviews_count || 0} reseñas)</SpoonText>
              </View>
              {!!info.distance && (
                <View style={{ flexDirection:'row', alignItems:'center' }}>
                  <SpoonText style={{ fontSize:14, marginRight:4 }}>📍</SpoonText>
                  <SpoonText variant="labelSmall" style={{ color:colors.secondary }}>{info.distance.toFixed(0)} m</SpoonText>
                </View>
              )}
            </View>
            <View style={{ flexDirection:'row', alignItems:'center' }}>
              <SpoonText style={{ fontSize:14, marginRight:4 }}>📍</SpoonText>
              <SpoonText variant="labelSmall" style={{ flex:1, color:colors.secondary }}>{info.address || 'Dirección no disponible'}</SpoonText>
            </View>
          </View>

          {/* Fila Horario (diseño compacto) */}
          {(() => {
            const hasHours = normalizedHours.length > 0;
            const isOpen = openStatus;
            const unavailable = !hasHours;
            const bgColor = unavailable
              ? `${colors.error}14`
              : isOpen
                ? `${colors.success}14`
                : `${colors.error}14`;
            const borderColor = unavailable
              ? `${colors.error}40`
              : isOpen
                ? `${colors.success}40`
                : `${colors.error}40`;
            const stateColor = unavailable ? colors.error : (isOpen ? colors.success : colors.error);
            return (
              <TouchableOpacity onPress={showHours} style={{ backgroundColor:bgColor, borderRadius:12, padding:14, flexDirection:'row', alignItems:'center', borderWidth:1, borderColor, marginBottom:24 }}>
                <SpoonText style={{ fontSize:18, marginRight:10 }}>🕒</SpoonText>
                <SpoonText variant="labelSmall" weight="bold" style={{ color:stateColor, marginRight:10 }}>Horario</SpoonText>
                <SpoonText variant="labelSmall" style={{ color:colors.textSecondary, flex:1 }} numberOfLines={1}>
                  {unavailable ? 'No disponible' : `${formatTodayHours()} (${isOpen ? 'Abierto' : 'Cerrado'})`}
                </SpoonText>
                <SpoonText style={{ fontSize:14 }}>ℹ️</SpoonText>
              </TouchableOpacity>
            );
          })()}

          {/* Featured dish placeholder (could map a special) */}
          <SpoonFeaturedDishCard
            name={info.featured_dish_name || 'Platillo destacado'}
            price={info.featured_dish_price || '—'}
            icon={'🍛'}
            imageSource={require('../assets/especiales/costillasbbq.png')}
          />

          <SpoonActionGrid
            actions={[
              { key:'llamar', label:'Llamar', icon:'📞', onPress: callPhone },
              { key:'mapa', label:'Direcciones', icon:'🗺️', onPress: openMap },
        { key:'horarios', label:'Horarios', icon:'🕒', onPress: showHours },
              { key:'compartir', label:'Compartir', icon:'📤', onPress: shareRestaurant }
            ]}
          />

          {(() => {
            const lat = typeof info.latitude === 'string' ? parseFloat(info.latitude) : info.latitude;
            const lng = typeof info.longitude === 'string' ? parseFloat(info.longitude) : info.longitude;
            const valid = typeof lat === 'number' && typeof lng === 'number' && Math.abs(lat) > 0.0001 && Math.abs(lng) > 0.0001;
            return (
              <SpoonMapPlaceholder
                latitude={valid ? lat : undefined}
                longitude={valid ? lng : undefined}
                address={info.address}
              />
            );
          })()}

          <View style={{ backgroundColor:colors.surface, borderRadius:16, padding:20, marginBottom:24 }}>
            {!!info.accepted_payments && (
              <View style={{ flexDirection:'row', alignItems:'flex-start', marginBottom:16 }}>
                <SpoonText style={{ fontSize:20, marginRight:12, marginTop:2 }}>💳</SpoonText>
                <View style={{ flex:1 }}>
                  <SpoonText variant="labelSmall" weight="bold" style={{ marginBottom:2 }}>Métodos de pago</SpoonText>
                  <SpoonText variant="bodySmall" style={{ color:colors.secondary }}>{Array.isArray(info.accepted_payments) ? info.accepted_payments.join(' • ') : info.accepted_payments}</SpoonText>
                </View>
              </View>
            )}
            {info.contact_phone && (
              <View style={{ flexDirection:'row', alignItems:'flex-start' }}>
                <SpoonText style={{ fontSize:20, marginRight:12, marginTop:2 }}>📞</SpoonText>
                <View style={{ flex:1 }}>
                  <SpoonText variant="labelSmall" weight="bold" style={{ marginBottom:2 }}>Teléfono</SpoonText>
                  <TouchableOpacity onPress={callPhone}>
                    <SpoonText variant="bodySmall" weight="bold" style={{ color:colors.primaryDark }}>{info.contact_phone}</SpoonText>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Reviews short section */}
          {reviews.length > 0 && (
            <View style={{ marginBottom:16 }}>
              <SpoonText style={{ fontWeight:'600', marginBottom:8 }}>Reseñas recientes</SpoonText>
              {reviews.slice(0,3).map(r => <SpoonReviewCard key={r.id} review={r as any} />)}
              <TouchableOpacity onPress={() => navigation.navigate('ReviewsScreen', { restaurantId, restaurantName: info?.name })} style={{ backgroundColor: colors.primary, padding:12, borderRadius:8, marginTop:8 }}>
                <SpoonText style={{ color: colors.textOnPrimary, textAlign:'center' }}>Ver todas</SpoonText>
              </TouchableOpacity>
            </View>
          )}

          {/* CTA Buttons */}
          <View style={{ flexDirection:'row', gap:16, marginBottom:40 }}>
            <TouchableOpacity style={{ flex:1, backgroundColor:colors.primaryDark, borderRadius:12, padding:16, flexDirection:'row', alignItems:'center', justifyContent:'center' }} onPress={() => navigation.navigate('RestaurantMenu', { restaurantId, restaurantName: info?.name })}>
              <SpoonText style={{ fontSize:18, marginRight:8 }}>📋</SpoonText>
              <SpoonText variant="labelMedium" weight="bold" style={{ color:colors.textOnPrimary }}>Ver Menú</SpoonText>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex:1, backgroundColor:'transparent', borderWidth:2, borderColor:colors.primaryDark, borderRadius:12, padding:16, flexDirection:'row', alignItems:'center', justifyContent:'center' }} onPress={() => Alert.alert('Pedido','Pendiente de implementación')}>
              <SpoonText style={{ fontSize:18, marginRight:8 }}>🛒</SpoonText>
              <SpoonText variant="labelMedium" weight="bold" style={{ color:colors.primaryDark }}>Pedir Ya</SpoonText>
            </TouchableOpacity>
          </View>

          {/* Modal Horarios Extendidos */}
          </View>
          <Modal
            visible={hoursVisible}
            animationType="slide"
            transparent
            onRequestClose={closeHours}
          >
            <Pressable onPress={closeHours} style={{ flex:1, backgroundColor:'#0006' }}>
              <View style={{ marginTop:'auto', backgroundColor:colors.surface, borderTopLeftRadius:24, borderTopRightRadius:24, paddingTop:12, maxHeight:'70%' }}>
                <View style={{ alignItems:'center', paddingBottom:8 }}>
                  <View style={{ width:50, height:5, backgroundColor:'#ccc', borderRadius:3 }} />
                </View>
                <View style={{ flexDirection:'row', alignItems:'center', paddingHorizontal:20, paddingBottom:12 }}>
                  <SpoonText style={{ fontSize:20, marginRight:8 }}>🕒</SpoonText>
                  <SpoonText variant="titleSmall" weight="bold" style={{ flex:1 }}>Horarios</SpoonText>
                  <TouchableOpacity onPress={closeHours} style={{ padding:4 }}>
                    <SpoonText style={{ fontSize:18 }}>✕</SpoonText>
                  </TouchableOpacity>
                </View>
                <ScrollView style={{ paddingHorizontal:20 }} showsVerticalScrollIndicator={false}>
                  {normalizedHours.length === 0 && (
                    <SpoonText variant="labelSmall" style={{ color:colors.textSecondary, marginBottom:16 }}>No disponibles</SpoonText>
                  )}
                  {normalizedHours.map(d => (
                    <View key={d.key} style={{ flexDirection:'row', paddingVertical:6, borderBottomWidth:1, borderColor:'rgba(0,0,0,0.05)' }}>
                      <SpoonText variant="labelSmall" weight={d.isToday ? 'bold' : 'regular'} style={{ width:54, color:d.isToday ? colors.primaryDark : colors.textSecondary }}>
                        {d.label}
                      </SpoonText>
                      {d.closed ? (
                        <SpoonText variant="labelSmall" style={{ color:colors.textSecondary }}>Cerrado</SpoonText>
                      ) : (
                        <View style={{ flex:1 }}>
                          {d.shifts.map((s,i) => (
                            <SpoonText key={i} variant="labelSmall" style={{ color:colors.textPrimary }}>
                              {s.start} - {s.end}
                            </SpoonText>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                  {normalizedHours.length > 0 && (
                    <SpoonText variant="labelSmall" style={{ marginTop:16, marginBottom:8, color:openStatus ? colors.success : colors.error }}>
                      Estado ahora: {openStatus ? 'Abierto' : 'Cerrado'}
                    </SpoonText>
                  )}
                  <View style={{ height:20 }} />
                </ScrollView>
              </View>
            </Pressable>
          </Modal>
        </>
      )}
    </SpoonPage>
  );
}