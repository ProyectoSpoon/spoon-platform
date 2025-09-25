import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Linking, Modal, Pressable, ScrollView, Image } from 'react-native';
import { SpoonPage, SpoonText, SpoonDishQuickActions, SpoonMapPlaceholder } from '../src/design-system/components';
import { useColors, SpoonColors, SpoonShadows, useSpacing } from '../src/design-system';
import { useRoute, useNavigation } from '@react-navigation/native';
import { formatPrice } from '../src/lib/supabasewebadmin';
import { getSpecialDishDetailsDirect, getRestaurantByIdDirect, fetchRestaurantProgressive } from '../src/lib/webadminSupabase';
import { WebAdminAPI } from '../src/lib/supabasewebadmin';
import { normalizeBusinessHours, formatTodayHours, isOpenNow as isOpenNowUtil } from '../src/utils/businessHours';

function DishDetailScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const horizontalPad = (spacing as any).page || (spacing as any).xl || spacing.lg || spacing.md || 16;
  const ruta = useRoute();
  const navegacion = useNavigation();
  const { dishId } = ruta.params || { dishId: '1' };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dish, setDish] = useState<any>(null);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [hoursVisible, setHoursVisible] = useState(false);

  const formatCOP = (value: number) => formatPrice(typeof value === 'number' ? value : Number(value) || 0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Intento directo (ya que specials los estamos trayendo directo); si en el futuro hay endpoint REST se puede añadir.
      const detalle = await getSpecialDishDetailsDirect(dishId, { includeItems: true, includeRestaurant: true });
      if (!detalle) {
        setError('Plato no encontrado');
        setLoading(false);
        return;
      }
      setDish(detalle);
      let restData = detalle.restaurant || null;
      // Fallback: si no llegó restaurante pero hay restaurant_id, intento consulta mínima
      if (!restData && detalle.restaurant_id) {
        // Intento progresivo
        try {
          const prog = await fetchRestaurantProgressive(detalle.restaurant_id);
          restData = prog || null;
          if (__DEV__) console.log('[DishDetail] Progressive restaurant fetch', prog);
        } catch (e:any) {
          if (__DEV__) console.log('[DishDetail] Error progressive fetch', e?.message || e);
        }
        // Fallback final directo minimal
        if (!restData) {
          try {
            const minimal = await getRestaurantByIdDirect(detalle.restaurant_id);
            restData = minimal || null;
            if (__DEV__) console.log('[DishDetail] Direct minimal restaurant fetch', minimal);
          } catch (e:any) {
            if (__DEV__) console.log('[DishDetail] Error direct minimal', e?.message || e);
          }
        }
      }
      setRestaurant(restData);
      if (__DEV__) console.log('[DishDetail] Loaded dish detail', { dish: detalle, restaurant: restData });
    } catch (e: any) {
      console.error('Error cargando plato especial:', e);
      setError(e?.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [dishId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getTodayHours = () => {
    if (!restaurant?.business_hours) return null;
    try {
      const now = new Date();
      const currentDay = now.toLocaleDateString('es-CO', { weekday: 'long' }).toLowerCase();
      const today = restaurant.business_hours[currentDay];
      if (!today?.open || !today?.close) return null;
      return today;
    } catch { return null; }
  };

  const isRestaurantOpen = useCallback(() => {
    const today = getTodayHours();
    if (!today) return null;
    try {
      const now = new Date();
      const [oh, om] = today.open.split(':').map(Number);
      const [ch, cm] = today.close.split(':').map(Number);
      const minutes = now.getHours() * 60 + now.getMinutes();
      const openM = oh * 60 + om;
      const closeM = ch * 60 + cm;
      return minutes >= openM && minutes <= closeM;
    } catch { return null; }
  }, [restaurant]);

  const obtenerImagenPlato = (id: string) => {
    const imagenes: Record<string, string> = {
      '1': '🍛',
      '2': '🍲',
      '3': '🥗',
      '4': '🍝',
    };
    return imagenes[id] || '🍽️';
  };

  const manejarAccionLlamar = () => {
    if (restaurant?.contact_phone) {
      const phone = String(restaurant.contact_phone).replace(/[^+\d]/g, '');
      Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Llamar', 'No se pudo iniciar la llamada'));
    } else {
      Alert.alert('Llamar', 'Teléfono no disponible');
    }
  };
  const manejarAccionCalificar = () => Alert.alert('Calificar', 'Función de calificación en desarrollo');
  const manejarAccionFoto = () => Alert.alert('Foto', 'Función de cámara en desarrollo');
  const manejarAccionVisitado = () => Alert.alert('Visitado', 'Marcado como visitado');

  const irPerfilRestaurante = () => {
    const rid = restaurant?.id || dish?.restaurant_id;
    if (!rid) {
      if (__DEV__) console.log('[DishDetail] No restaurant id available for navigation');
      Alert.alert('Restaurante', 'No se encontró el identificador del restaurante');
      return;
    }
    try {
      // Forzamos any por ausencia de tipos completos en este archivo.
      (navegacion as any).navigate('RestaurantDetail', { restaurantId: rid, restaurantName: restaurant?.name });
    } catch (e:any) {
      if (__DEV__) console.log('[DishDetail] Error navigate RestaurantDetail', e?.message || e);
      Alert.alert('Navegación', 'No se pudo abrir el detalle del restaurante');
    }
  };
  const mostrarHorariosExpandidos = () => setHoursVisible(true);
  const cerrarHorarios = () => setHoursVisible(false);
  const abrirUbicacionMapas = () => Alert.alert('Ubicación', 'Abrir mapas (pendiente)');
  const manejarReportarError = () => Alert.alert('Reporte', 'Gracias por tu reporte');

  if (loading) {
    return (
      <SpoonPage scroll={false} padded>
        <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
          <ActivityIndicator color={colors.primaryDark} />
          <SpoonText variant="labelSmall" style={{ marginTop:12 }}>Cargando plato...</SpoonText>
        </View>
      </SpoonPage>
    );
  }

  if (error) {
    return (
      <SpoonPage scroll={false} padded>
        <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
          <SpoonText variant="labelSmall" color="error" weight="bold">{error}</SpoonText>
          <TouchableOpacity onPress={loadData} style={{ marginTop:16 }}>
            <SpoonText variant="labelSmall" color="accent">Reintentar</SpoonText>
          </TouchableOpacity>
        </View>
      </SpoonPage>
    );
  }

  const abierto = isRestaurantOpen();
  const todayHours = getTodayHours();
  const normalizedHours = normalizeBusinessHours(restaurant?.business_hours);
  const openNowShared = isOpenNowUtil(normalizedHours);
  const todayShared = formatTodayHours(normalizedHours);
  const composition = (dish?.items || []).reduce((acc: Record<string,string[]>, item: any) => {
    acc[item.category_name] = acc[item.category_name] || [];
    acc[item.category_name].push(item.product_name);
    return acc;
  }, {});

  return (
    <SpoonPage scroll padded={false}>
      {/* Header */}
      <View style={{ height:320, position:'relative', marginBottom:24, marginHorizontal:-horizontalPad }}>
        <View style={{ flex:1, backgroundColor:colors.surface, justifyContent:'center', alignItems:'center', overflow:'hidden' }}>
          {dish?.image_url ? (
            <Image source={{ uri: dish.image_url }} resizeMode="cover" style={{ position:'absolute', top:0, left:0, right:0, bottom:0, width:'100%', height:'100%' }} />
          ) : (
            <Image source={require('../assets/especiales/costillasbbq.png')} resizeMode="cover" style={{ position:'absolute', top:0, left:0, right:0, bottom:0, width:'100%', height:'100%' }} />
          )}
          <View style={{ position:'absolute', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.15)' }} />
        </View>
      </View>
      <View style={{ paddingHorizontal: horizontalPad }}>

      {/* Info plato */}
      <View style={{ marginBottom:24 }}>
        <SpoonText variant="titleLarge" weight="bold" style={{ color:colors.primaryDark, marginBottom:4 }}>{dish?.name || 'Especial'}</SpoonText>
        <SpoonText variant="titleMedium" weight="semibold" style={{ color:colors.textPrimary, marginBottom:8 }}>{formatCOP(dish?.price || 0)}</SpoonText>
        {!!dish?.description && (
          <SpoonText variant="bodyMedium" style={{ color:colors.textSecondary, lineHeight:22 }}>{dish.description}</SpoonText>
        )}
      </View>

      <SpoonDishQuickActions
        actions={[
          { key:'llamar', icon:'📞', label:'Llamar', value: restaurant?.contact_phone || '--', subtitle:'Teléfono', color:SpoonColors.withOpacity(colors.success, 0.12), onPress: manejarAccionLlamar },
          { key:'calificar', icon:'⭐', label:'Calificar', value:'--', subtitle:'Rating', color:SpoonColors.withOpacity(colors.warning, 0.12), onPress: manejarAccionCalificar },
          { key:'foto', icon:'📷', label:'Foto', value:'', subtitle:'Añadir', color:SpoonColors.withOpacity(colors.info, 0.12), onPress: manejarAccionFoto },
          { key:'precio', icon:'💲', label:'Precio', value: formatCOP(dish?.price || 0), subtitle:'COP', color:SpoonColors.withOpacity(colors.primaryDark, 0.12), onPress: () => {} },
        ]}
      />

      {/* Restaurante */}
  {restaurant && (
        <View style={{ marginBottom:24 }}>
          <TouchableOpacity onPress={irPerfilRestaurante} style={{ backgroundColor:SpoonColors.withOpacity(colors.primaryDark,0.06), borderRadius:16, padding:16, flexDirection:'row', alignItems:'center', borderWidth:1, borderColor:SpoonColors.withOpacity(colors.primaryDark,0.2), marginBottom:16 }}>
            <View style={{ width:44, height:44, backgroundColor:SpoonColors.withOpacity(colors.primaryDark,0.12), borderRadius:10, justifyContent:'center', alignItems:'center', marginRight:14 }}>
              <Text style={{ fontSize:22 }}>🏪</Text>
            </View>
            <View style={{ flex:1 }}>
              <SpoonText variant="titleSmall" weight="bold" style={{ color:colors.primaryDark, marginBottom:2 }}>{restaurant.name}</SpoonText>
              <SpoonText variant="labelSmall" style={{ color:colors.textSecondary, marginBottom:4 }}>Ver perfil del restaurante</SpoonText>
              <View style={{ flexDirection:'row', alignItems:'center' }}>
                <SpoonText variant="labelSmall" style={{ color:colors.textSecondary }}>Sin reseñas</SpoonText>
              </View>
            </View>
            <Text style={{ fontSize:18, color:colors.primaryDark }}>→</Text>
          </TouchableOpacity>
          {(() => {
            const hasNormalized = normalizedHours.length > 0;
            const isOpen = openNowShared;
            const unavailable = !hasNormalized;
            const bgColor = unavailable
              ? SpoonColors.withOpacity(colors.error, 0.08)
              : SpoonColors.withOpacity(isOpen ? colors.success : colors.error, 0.08);
            const borderColor = unavailable
              ? SpoonColors.withOpacity(colors.error, 0.25)
              : SpoonColors.withOpacity(isOpen ? colors.success : colors.error, 0.25);
            const stateColor = unavailable ? colors.error : (isOpen ? colors.success : colors.error);
            return (
              <TouchableOpacity onPress={mostrarHorariosExpandidos} style={{ backgroundColor:bgColor, borderRadius:12, padding:12, flexDirection:'row', alignItems:'center', borderWidth:1, borderColor, marginBottom:12 }}>
                <Text style={{ fontSize:16, marginRight:8 }}>🕒</Text>
                <SpoonText variant="labelSmall" weight="bold" style={{ color:stateColor, marginRight:8 }}>Horario</SpoonText>
                <SpoonText variant="labelSmall" style={{ color:colors.textSecondary, flex:1 }} numberOfLines={1}>
                  {unavailable ? 'No disponible' : `${todayShared} (${isOpen ? 'Abierto' : 'Cerrado'})`}
                </SpoonText>
                <Text style={{ fontSize:14 }}>ℹ️</Text>
              </TouchableOpacity>
            );
          })()}
          {/* Datos de contacto y tipo de cocina ocultados según solicitud del usuario */}
          {(restaurant?.city || restaurant?.state || restaurant?.country) && (
            <View style={{ flexDirection:'row', alignItems:'center', marginBottom:12 }}>
              <Text style={{ fontSize:16, marginRight:6 }}>🌎</Text>
              <SpoonText variant="labelSmall" style={{ color:colors.textSecondary }}>{[restaurant.city, restaurant.state, restaurant.country].filter(Boolean).join(', ')}</SpoonText>
            </View>
          )}
          {restaurant?.average_rating != null && (
            <View style={{ flexDirection:'row', alignItems:'center', marginBottom:12 }}>
              <Text style={{ fontSize:16, marginRight:6 }}>⭐</Text>
              <SpoonText variant="labelSmall" style={{ color:colors.textSecondary }}>{restaurant.average_rating?.toFixed ? restaurant.average_rating.toFixed(1) : restaurant.average_rating} ({restaurant.reviews_count || 0} reseñas)</SpoonText>
            </View>
          )}
          {restaurant?.payment_methods && Array.isArray(restaurant.payment_methods) && restaurant.payment_methods.length > 0 && (
            <View style={{ marginBottom:12 }}>
              <SpoonText variant="labelSmall" weight="bold" style={{ color:colors.primaryDark, marginBottom:4 }}>Medios de Pago</SpoonText>
              <SpoonText variant="labelSmall" style={{ color:colors.textSecondary }}>{restaurant.payment_methods.join(' • ')}</SpoonText>
            </View>
          )}
          <TouchableOpacity onPress={abrirUbicacionMapas} style={{ backgroundColor:SpoonColors.withOpacity(colors.info,0.08), borderRadius:8, padding:12, flexDirection:'row', alignItems:'center', borderWidth:1, borderColor:SpoonColors.withOpacity(colors.info,0.22) }}>
            <Text style={{ fontSize:16, marginRight:6 }}>📍</Text>
            <View style={{ flex:1 }}>
              <SpoonText variant="labelSmall" weight="bold" style={{ color:colors.textPrimary }}>{restaurant.address || 'Dirección no disponible'}</SpoonText>
              <SpoonText variant="labelSmall" style={{ color:colors.textSecondary }}>Ubicación aproximada</SpoonText>
            </View>
            <Text style={{ fontSize:16, marginLeft:8 }}>🗺️</Text>
          </TouchableOpacity>
        </View>
      )}
      {restaurant && __DEV__ && (!restaurant.address || (!restaurant.contact_phone && !restaurant.cuisine_type)) && (
        <View style={{ backgroundColor:SpoonColors.withOpacity(colors.info,0.06), borderRadius:10, padding:10, marginBottom:24, borderWidth:1, borderColor:SpoonColors.withOpacity(colors.info,0.2) }}>
          <SpoonText variant="labelSmall" weight="bold" style={{ color:colors.info, marginBottom:4 }}>Info parcial del restaurante</SpoonText>
          <SpoonText variant="labelSmall" style={{ color:colors.textSecondary }}>
            Se obtuvo sólo un subconjunto de columnas (ej. nombre). Ajusta RLS o columnas faltantes para mostrar más datos.
          </SpoonText>
        </View>
      )}
      {!restaurant && dish?.restaurant_id && (
        <View style={{ backgroundColor:SpoonColors.withOpacity(colors.warning,0.08), borderRadius:12, padding:12, marginBottom:24, borderWidth:1, borderColor:SpoonColors.withOpacity(colors.warning,0.25) }}>
          <SpoonText variant="labelSmall" weight="bold" style={{ color:colors.warning, marginBottom:4 }}>No pudimos cargar el restaurante</SpoonText>
          <SpoonText variant="labelSmall" style={{ color:colors.textSecondary, marginBottom:6 }}>ID: {dish.restaurant_id}</SpoonText>
          <SpoonText variant="labelSmall" style={{ color:colors.textSecondary, marginBottom:6 }}>
            Causas probables:
          </SpoonText>
          <SpoonText variant="labelSmall" style={{ color:colors.textSecondary, marginBottom:2 }}>1. Falta una policy RLS de SELECT para rol anon en tabla restaurants.</SpoonText>
          <SpoonText variant="labelSmall" style={{ color:colors.textSecondary, marginBottom:2 }}>2. Algunas columnas solicitadas (p.ej. payment_methods, business_hours) no existen.</SpoonText>
          <SpoonText variant="labelSmall" style={{ color:colors.textSecondary, marginBottom:2 }}>3. restaurant_id no coincide o está vacío.</SpoonText>
          <SpoonText variant="labelSmall" style={{ color:colors.textSecondary, marginTop:4 }}>
            Verifica rápido con REST mínima:
          </SpoonText>
          <SpoonText variant="labelSmall" style={{ color:colors.textSecondary }}>/rest/v1/restaurants?id=eq.{dish.restaurant_id}&select=id,name,address</SpoonText>
          {__DEV__ && (
            <SpoonText variant="labelSmall" style={{ color:colors.textSecondary, marginTop:8 }}>
              DEBUG tiers: intentos incrementales (id,name) → básicos → extendidos. Revisa consola para logs fetchRestaurantProgressive.
            </SpoonText>
          )}
          <TouchableOpacity onPress={loadData} style={{ marginTop:12, alignSelf:'flex-start', backgroundColor:SpoonColors.withOpacity(colors.primaryDark,0.12), paddingHorizontal:12, paddingVertical:8, borderRadius:8 }}>
            <SpoonText variant="labelSmall" weight="bold" style={{ color:colors.primaryDark }}>Reintentar cargar restaurante</SpoonText>
          </TouchableOpacity>
        </View>
      )}

      {/* Composición del plato */}
      {Object.keys(composition).length > 0 && (
        <View style={{ backgroundColor:colors.surface, borderRadius:16, padding:16, marginBottom:24, ...SpoonShadows.card() }}>
          <SpoonText variant="titleSmall" weight="bold" style={{ marginBottom:8 }}>Composición</SpoonText>
          {Object.entries(composition).map(([cat, items]) => (
            <View key={cat} style={{ marginBottom:12 }}>
              <SpoonText variant="labelSmall" weight="bold" style={{ color:colors.primaryDark, marginBottom:4 }}>{cat}</SpoonText>
              <SpoonText variant="labelSmall" style={{ color:colors.textSecondary }}>{(items as string[]).join(', ')}</SpoonText>
            </View>
          ))}
        </View>
      )}

  {(() => {
    const latRaw = restaurant?.latitude;
    const lngRaw = restaurant?.longitude;
    const lat = typeof latRaw === 'string' ? parseFloat(latRaw) : latRaw;
    const lng = typeof lngRaw === 'string' ? parseFloat(lngRaw) : lngRaw;
    const valid = typeof lat === 'number' && typeof lng === 'number' && Math.abs(lat) > 0.0001 && Math.abs(lng) > 0.0001;
    return (
      <SpoonMapPlaceholder
        latitude={valid ? lat : undefined}
        longitude={valid ? lng : undefined}
        address={restaurant?.address}
      />
    );
  })()}

      <View style={{ backgroundColor:colors.surface, borderRadius:16, padding:16, marginBottom:24, ...SpoonShadows.card() }}>
        <SpoonText variant="titleSmall" weight="bold" style={{ marginBottom:4 }}>Medios de Pago</SpoonText>
        <SpoonText variant="labelSmall" style={{ color:colors.textSecondary }}>Efectivo - Débito - Crédito</SpoonText>
      </View>

  <TouchableOpacity onPress={manejarReportarError}>
        <SpoonText variant="labelSmall" style={{ color:colors.textSecondary, textAlign:'center', marginTop:24 }}>
          ¿La información es errónea? <Text style={{ color:colors.primaryDark, fontWeight:'600' }}>Reportar el error</Text>
        </SpoonText>
      </TouchableOpacity>

      <View style={{ height:60 }} />

      {/* Modal Horarios */}
  <Modal
        visible={hoursVisible}
        animationType="slide"
        transparent
        onRequestClose={cerrarHorarios}
      >
        <Pressable onPress={cerrarHorarios} style={{ flex:1, backgroundColor:'#0006' }}>
          <View style={{ marginTop:'auto', backgroundColor:colors.surface, borderTopLeftRadius:24, borderTopRightRadius:24, paddingTop:12, maxHeight:'70%' }}>
            <View style={{ alignItems:'center', paddingBottom:8 }}>
              <View style={{ width:50, height:5, backgroundColor:'#ccc', borderRadius:3 }} />
            </View>
            <View style={{ flexDirection:'row', alignItems:'center', paddingHorizontal:20, paddingBottom:12 }}>
              <Text style={{ fontSize:20, marginRight:8 }}>🕒</Text>
              <SpoonText variant="titleSmall" weight="bold" style={{ flex:1 }}>Horarios del Restaurante</SpoonText>
              <TouchableOpacity onPress={cerrarHorarios} style={{ padding:4 }}>
                <Text style={{ fontSize:18 }}>✕</Text>
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
                <SpoonText variant="labelSmall" style={{ marginTop:16, marginBottom:8, color:openNowShared ? colors.success : colors.error }}>
                  Estado ahora: {openNowShared ? 'Abierto' : 'Cerrado'}
                </SpoonText>
              )}
              <View style={{ height:20 }} />
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
      </View>
    </SpoonPage>
  );
}

export default DishDetailScreen;
