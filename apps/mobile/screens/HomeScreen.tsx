import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useColors } from '../src/design-system';
import { LocationService } from '../utils/locationUtils';
import { SpoonSection, SpoonText, SpoonRestaurantCard, SpoonSpecialtyCard, SpoonFavoritesEmptyCard, SpoonDiscoverCard, SpoonSearchBar, SpoonLocationHeader, SpoonPage } from '../src/design-system/components';
import { SpoonCategoryCard } from '../src/design-system/components/cards/SpoonCategoryCard';
import { WebAdminAPI, formatPrice, obtenerEstadisticasRestaurante, verificarSaludAPI } from '../src/lib/supabasewebadmin';
// Fallback directo al proyecto WebAdmin (cuando el endpoint REST no devuelve datos)
import { getTodaySpecialsDirect } from '../src/lib/webadminSupabase';
import { getUserProfile, isRestaurantFavorite, addToFavorites, removeFromFavorites } from '../src/lib/supabase';

async function getStats(restaurantId: string): Promise<{ avg: string | null; count: number }> {
  try {
    const stats = await obtenerEstadisticasRestaurante(restaurantId);
    if (!stats) return { avg: null, count: 0 };
    const avg = (stats as any).rating_average ?? (stats as any).averageRating ?? 0;
    const count = (stats as any).reviews_count ?? (stats as any).totalReviews ?? 0;
    return { avg: count > 0 ? avg.toFixed(1) : null, count };
  } catch {
    return { avg: null, count: 0 };
  }
}
async function checkFavorite(userId: string, restaurantId: string): Promise<boolean> {
  return isRestaurantFavorite(userId, restaurantId);
}

export default function HomeScreen() {
  const colors = useColors();
  const [controladorBusqueda, setControladorBusqueda] = useState('');
  const [ubicacionActual, setUbicacionActual] = useState('Obteniendo ubicación...');
  const [ubicacionUsuario, setUbicacionUsuario] = useState(null);
  const [permisoUbicacion, setPermisoUbicacion] = useState(null);
  // Datos dinámicos desde WebAdmin API
  const [restaurantesCercanos, setRestaurantesCercanos] = useState<any[]>([]);
  const [cargandoRestaurantes, setCargandoRestaurantes] = useState(false);
  const [errorRestaurantes, setErrorRestaurantes] = useState<string | null>(null);
  const [especialidadesDia, setEspecialidadesDia] = useState<any[]>([]);
  const [cargandoEspeciales, setCargandoEspeciales] = useState(false);
  // Estado de salud de la API
  const [apiEstado, setApiEstado] = useState<'checking' | 'ok' | 'error'>('checking');
  const [apiMensaje, setApiMensaje] = useState<string | null>(null);
  
  const navegacion = useNavigation();

  useEffect(() => {
    solicitarPermisoUbicacion();
  verificarApiSalud();
  }, []);

  // Cuando hay ubicación, cargar restaurantes y especiales
  useEffect(() => {
    if (ubicacionUsuario?.coords && apiEstado === 'ok') {
      obtenerRestaurantesReales();
      obtenerEspecialidades();
    }
  }, [ubicacionUsuario, apiEstado]);

  const verificarApiSalud = async () => {
    try {
      setApiEstado('checking');
      const result = await verificarSaludAPI();
      if (result.status === 'ok') {
        setApiEstado('ok');
        setApiMensaje(null);
      } else {
        setApiEstado('error');
        setApiMensaje(result.message);
      }
    } catch (e: any) {
      setApiEstado('error');
      setApiMensaje(e?.message || 'Error desconocido');
    }
  };

  const solicitarPermisoUbicacion = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermisoUbicacion(status);
      
      if (status === 'granted') {
        obtenerUbicacionActual();
      }
    } catch (error) {
      console.error('Error solicitando permisos de ubicación:', error);
    }
  };

  const obtenerUbicacionActual = async () => {
    try {
      setUbicacionActual('🔄 Localizando...');
      
      const userLocation = await LocationService.getCurrentLocation();
      
      if (userLocation) {
        setUbicacionUsuario({
          coords: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            accuracy: userLocation.accuracy,
            altitude: 0,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        });
        
        console.log('📍 Ubicación obtenida:', userLocation);
        
        // Mostrar coordenadas y precisión mientras se obtiene la dirección
        const precisión = userLocation.accuracy ? `±${Math.round(userLocation.accuracy)}m` : '';
        const coordenadas = `📍 ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)} ${precisión}`;
        setUbicacionActual(coordenadas);
        
        // Debug temporal - analizar datos completos de la API
        await LocationService.debugAddressData(
          userLocation.latitude, 
          userLocation.longitude
        );
        
        // Obtener dirección legible en tiempo real
        setUbicacionActual('🔄 Obteniendo dirección...');
        const address = await LocationService.getDetailedColombianAddress(
        userLocation.latitude, 
        userLocation.longitude,
        'full'  // <-- Agregar este parámetro
      );
        
        if (address) {
          setUbicacionActual(address);
          console.log('🏠 Dirección obtenida:', address);
        } else {
          // Mantener coordenadas si no se puede obtener dirección
          setUbicacionActual(coordenadas);
          console.log('⚠️ No se pudo obtener dirección, mostrando coordenadas');
        }
      } else {
        setUbicacionActual('❌ No se pudo obtener ubicación');
      }
    } catch (error) {
      console.error('❌ Error obteniendo ubicación:', error);
      setUbicacionActual('❌ Error de ubicación');
    }
  };

  const mostrarModalUbicacion = () => {
    const ubicacionInfo = ubicacionUsuario 
      ? `${ubicacionActual}\n\n📊 Información técnica:\nLatitud: ${ubicacionUsuario.coords.latitude.toFixed(6)}\nLongitud: ${ubicacionUsuario.coords.longitude.toFixed(6)}\nPrecisión: ±${Math.round(ubicacionUsuario.coords.accuracy || 0)}m\n\n🎯 Nivel de precisión: ${ubicacionUsuario.coords.accuracy <= 5 ? 'Máxima (≤5m)' : ubicacionUsuario.coords.accuracy <= 10 ? 'Alta (≤10m)' : ubicacionUsuario.coords.accuracy <= 50 ? 'Media (≤50m)' : 'Baja (>50m)'}\n\n⚡ Modo: Precisión Máxima Activada`
      : ubicacionActual;
    
    Alert.alert(
      'Información de Ubicación',
      ubicacionInfo,
      [
        { text: 'Actualizar', onPress: obtenerUbicacionActual },
        { text: 'Cerrar', style: 'cancel' }
      ]
    );
  };

  // --- Integración WebAdmin: obtener restaurantes cercanos ---
  const obtenerRestaurantesReales = async () => {
    if (!ubicacionUsuario?.coords) return;
    try {
      setCargandoRestaurantes(true);
      setErrorRestaurantes(null);
      const { latitude, longitude } = ubicacionUsuario.coords;
      const apiRestaurantes = await WebAdminAPI.getNearbyRestaurants({ lat: latitude, lng: longitude, radius: 10 });
      const currentUser = await getUserProfile();
      const enriquecidos = await Promise.all(apiRestaurantes.map(async (r) => {
        const { avg, count } = await getStats(r.id);
        const favorito = currentUser ? await checkFavorite(currentUser.id, r.id) : false;
        // Distancia: usar proporcionada o calcular
        let distanciaStr = 'N/D';
        if (typeof r.distance === 'number') distanciaStr = `${r.distance.toFixed(1)}km`;
        else distanciaStr = LocationService.formatDistance(LocationService.calculateDistance(latitude, longitude, r.latitude, r.longitude));
        return {
          id: r.id,
          nombre: r.name,
          rating: avg || 'Nuevo',
          reviewCount: count || 0,
          distancia: distanciaStr,
          categoria: r.cuisine_type,
          direccion: r.address,
          telefono: r.contact_phone,
          estaAbierto: r.isOpen || false,
          horarios: r.business_hours,
          imagen: r.logo_url || '🏪',
          isFavorite: favorito,
          latitude: r.latitude,
          longitude: r.longitude,
          description: r.description,
        };
      }));
      setRestaurantesCercanos(enriquecidos);
    } catch (e: any) {
      console.error('Error cargando restaurantes:', e);
      setErrorRestaurantes(e?.message || 'Error desconocido');
    } finally {
      setCargandoRestaurantes(false);
    }
  };

  // --- Integración WebAdmin: especialidades del día ---
  const obtenerEspecialidades = async () => {
    let isActive = true;
    setCargandoEspeciales(true);
    try {
      const { latitude, longitude } = ubicacionUsuario?.coords || ({} as any);
      console.log('[Home] Solicitando especiales (REST)', { latitude, longitude });
      let especiales: any[] = [];
      try {
        const resp = await WebAdminAPI.getTodaysSpecials(
          latitude && longitude ? { lat: latitude, lng: longitude } : undefined
        );
        if (resp && resp.length) {
          especiales = resp;
          console.log('[Home] Especiales REST recibidos:', resp.length);
        } else {
          console.log('[Home] REST sin resultados, intentando fallback directo...');
        }
      } catch (err) {
        console.log('[Home] Error REST especiales, intentando fallback directo:', (err as any)?.message);
      }

      // Fallback directo a Supabase WebAdmin si no hay resultados
      if (!especiales.length) {
        try {
          const direct = await getTodaySpecialsDirect({ includeRestaurant: true, onlyActive: true });
          if (direct && direct.length) {
            especiales = direct;
            console.log('[Home] Especiales (fallback directo) recibidos:', direct.length);
          } else {
            console.log('[Home] Fallback directo tampoco devolvió resultados');
            // Segundo intento: sin filtro onlyActive (por si la columna/valor bloquea)
            try {
              const secondDirect = await getTodaySpecialsDirect({ includeRestaurant: true, onlyActive: false });
              if (secondDirect && secondDirect.length) {
                especiales = secondDirect;
                console.log('[Home] Especiales obtenidos en segundo intento (sin onlyActive):', secondDirect.length);
              } else {
                console.log('[Home] Segundo intento sin resultados. Posible causa: políticas RLS restringen acceso público a special_dishes.');
              }
            } catch (err3) {
              console.log('[Home] Error segundo intento especiales sin onlyActive:', (err3 as any)?.message);
            }
          }
        } catch (err2) {
          console.log('[Home] Error fallback directo especiales:', (err2 as any)?.message);
        }
      }

      // Formateo resiliente (estructuras REST vs directo pueden variar)
      const formateados = (especiales || []).map((s: any) => {
        const restauranteObj = s.restaurant || s.restaurante || {};
        const precioNumber = typeof s.price === 'number' ? s.price : parseFloat(s.price) || 0;
        return {
          id: s.id,
            // Nombre del plato
          nombre: s.name || s.nombre || s.title || 'Especial',
          precio: formatPrice(precioNumber),
          restaurante: restauranteObj.name || restauranteObj.nombre || s.restaurant_name || 'Restaurante',
          imagen: restauranteObj.logo_url || s.restaurant_logo_url || '🍛'
        };
      });
      if (isActive) setEspecialidadesDia(formateados);
    } catch (e) {
      console.error('Error obteniendo especiales (proceso completo):', e);
      if (isActive) setEspecialidadesDia([]);
    } finally {
      if (isActive) setCargandoEspeciales(false);
    }
    return () => { isActive = false; };
  };

  const mostrarFiltrosDescubrimiento = () => {
    Alert.alert('Filtros', 'Función de filtros en desarrollo');
  };

  const manejarBusqueda = (valor) => {
    if (valor.trim()) {
      console.log('🔍 Navegando a búsqueda:', valor);
      navegacion.navigate('Search', { consultaInicial: valor });
    }
  };

  const realizarBusqueda = (valor) => {
    if (valor.trim()) {
      console.log('🔍 Navegando a búsqueda (acción secundaria):', valor);
      navegacion.navigate('SearchTab' as never, { consultaInicial: valor });
    }
  };

  const irAPerfil = () => {
    console.log('👤 Perfil presionado desde header');
    navegacion.navigate('ProfileTab' as never);
  };

  const irAFavoritos = () => {
    console.log('💝 Navegando a favoritos');
    navegacion.navigate('FavoritesTab' as never);
  };

  const irARestaurante = (restauranteId) => {
    console.log('🏪 Navegando a restaurante:', restauranteId);
    navegacion.navigate('RestaurantDetail' as never, { restaurantId: restauranteId });
  };

  const toggleFavorito = async (restaurantId: string) => {
    try {
      const perfil = await getUserProfile();
      if (!perfil) return;
      const esFav = await isRestaurantFavorite(perfil.id, restaurantId);
      if (esFav) await removeFromFavorites(perfil.id, restaurantId); else await addToFavorites(perfil.id, restaurantId);
      // refrescar listado en memoria
      setRestaurantesCercanos(prev => prev.map(r => r.id === restaurantId ? { ...r, isFavorite: !esFav } : r));
    } catch (e) {
      console.error('Error toggling favorito', e);
    }
  };

  const irAPlato = (platoId) => {
    console.log('🍛 Navegando a plato:', platoId);
    navegacion.navigate('DishDetail' as never, { dishId: platoId });
  };

  return (
    <SpoonPage scroll={true} padded={false}>
      <SpoonLocationHeader
        locationLabel="Tu ubicación"
        locationValue={ubicacionActual}
        onLocationPress={mostrarModalUbicacion}
        onRefresh={obtenerUbicacionActual}
        onProfile={irAPerfil}
      />
      <View style={{ paddingHorizontal: 16 }}>
        {/* Banner estado API */}
        {apiEstado !== 'ok' && (
          <View style={{
            backgroundColor: apiEstado === 'error' ? colors.error + '22' : colors.warning + '22',
            borderRadius: 12,
            padding: 12,
            marginTop: 12,
            marginBottom: 4,
            borderWidth: 1,
            borderColor: apiEstado === 'error' ? colors.error + '55' : colors.warning + '55'
          }}>
            <SpoonText variant="labelSmall" color={apiEstado === 'error' ? 'error' : 'warning'} weight="medium">
              {apiEstado === 'checking' ? 'Verificando conexión con el servidor...' : `API inaccesible: ${apiMensaje || 'sin detalles'}`}
            </SpoonText>
            {apiEstado === 'error' && (
              <TouchableOpacity style={{ marginTop: 4 }} onPress={verificarApiSalud}>
                <SpoonText variant="labelSmall" color="accent">Reintentar</SpoonText>
              </TouchableOpacity>
            )}
          </View>
        )}
        <SpoonSection inset={false} spacingTop="md" spacingBottom="md">
          <SpoonSearchBar
            value={controladorBusqueda}
            placeholder="¿Qué antojo tienes hoy?"
            onChange={setControladorBusqueda}
            onSubmit={manejarBusqueda}
            onActionPress={mostrarFiltrosDescubrimiento}
            actionIcon="⚙️"
          />
        </SpoonSection>

        <SpoonSection title="Categorías Tradicionales" inset={false} spacingTop="xs" spacingBottom="md">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(() => {
              // Mapeo estático de imágenes (require debe ser estático)
              const categoryImages: Record<string, any> = {
                Frijoles: require('../assets/categorias/frijoles.png'),
                Lentejas: require('../assets/categorias/lentejas.png'),
                Garbanzos: require('../assets/categorias/garbanzos.png'),
                Carnes: require('../assets/categorias/carnes.png'),
                Pollo: require('../assets/categorias/pollo.png'),
                Pescado: require('../assets/categorias/pescado.png'),
                Arroz: require('../assets/categorias/arroz.png'),
                Pasta: require('../assets/categorias/pasta.png'),
              };
              const fallbackEmoji: Record<string,string> = {
                Frijoles:'🫘', Lentejas:'🟤', Garbanzos:'🟡', Carnes:'🥩', Pollo:'🐔', Pescado:'🐟', Arroz:'🍚', Pasta:'🍝'
              };
              const categorias = Object.keys(categoryImages);
              return categorias.map((categoria, idx) => (
                <SpoonCategoryCard
                  key={idx}
                  label={categoria}
                  imageSource={categoryImages[categoria]}
                  icon={fallbackEmoji[categoria]}
                  onPress={() => navegacion.navigate('CategoryProducts' as never, { categoria })}
                />
              ));
            })()}
          </ScrollView>
        </SpoonSection>

        {/* Restaurantes Cercanos */}
        <SpoonSection 
          title="Cerca a Ti" inset={false} spacingTop="xs" spacingBottom="md"
          rightAction={(<TouchableOpacity onPress={() => navegacion.navigate('SearchTab' as never, { consultaInicial: 'restaurantes cercanos' })}><SpoonText variant="labelSmall" color="accent" weight="medium">Ver todos</SpoonText></TouchableOpacity>)}
        >
          {apiEstado !== 'ok' ? (
            <SpoonText variant="labelSmall" color="secondary">Servidor no disponible</SpoonText>
          ) : cargandoRestaurantes && restaurantesCercanos.length === 0 ? (
            <ActivityIndicator color={colors.primaryDark} />
          ) : restaurantesCercanos.length === 0 ? (
            <SpoonText variant="labelSmall" color="secondary">No hay restaurantes cercanos</SpoonText>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {restaurantesCercanos.map(r => (
                <SpoonRestaurantCard key={r.id} name={r.nombre} distance={r.distancia} rating={r.rating} favorite={r.isFavorite} onPress={() => irARestaurante(r.id)} onFavoritePress={() => toggleFavorito(r.id)} />
              ))}
            </ScrollView>
          )}
        </SpoonSection>

        {/* Especialidades del Día */}
        <SpoonSection title="Especialidades del Día" inset={false} spacingTop="xs" spacingBottom="md">
          {apiEstado !== 'ok' ? (
            <SpoonText variant="labelSmall" color="secondary">Servidor no disponible</SpoonText>
          ) : cargandoEspeciales && especialidadesDia.length === 0 ? (
            <ActivityIndicator color={colors.primaryDark} />
          ) : especialidadesDia.length === 0 ? (
            <SpoonText variant="labelSmall" color="secondary">No hay especiales hoy</SpoonText>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {especialidadesDia.map(e => (
                <SpoonSpecialtyCard
                  key={e.id}
                  name={e.nombre}
                  price={e.precio}
                  imageSource={require('../assets/especiales/costillasbbq.png')}
                  onPress={() => irAPlato(e.id)}
                />
              ))}
            </ScrollView>
          )}
        </SpoonSection>

        {/* Favoritos */}
        <SpoonSection title="Tus Lugares Favoritos" inset={false} spacingTop="xs" spacingBottom="md" rightAction={(<TouchableOpacity onPress={irAFavoritos}><SpoonText variant="labelSmall" color="accent" weight="medium">Gestionar</SpoonText></TouchableOpacity>)}>
          <SpoonFavoritesEmptyCard message="Agrega restaurantes a favoritos para verlos aquí" onPress={irAFavoritos} />
        </SpoonSection>

        {/* Descubre Algo Nuevo */}
        <SpoonSection title="Descubre Algo Nuevo" inset={false} spacingTop="xs" spacingBottom="xl">
          <SpoonDiscoverCard title="Sorpréndeme" subtitle="Encuentra nuevos sabores cerca de ti" onPress={() => navegacion.navigate('SearchTab' as never, { consultaInicial: 'sorpresa' })} />
        </SpoonSection>
      </View>
    </SpoonPage>
  );
}
