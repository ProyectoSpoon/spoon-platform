import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, Modal } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { SpoonPage, SpoonText, SpoonFoodCard, SpoonChip } from '../src/design-system/components';
import { getOverlay } from '../src/design-system/utils/overlays';
import { useColors, useSpacing, useTypography, useRadii } from '../src/design-system/context/ThemeContext';

function FavoritesScreen() {
  const [pestanaActiva, setPestanaActiva] = useState(0); // 0=Restaurantes, 1=Platos
  const [consultaBusqueda, setConsultaBusqueda] = useState('');
  const [sortOption, setSortOption] = useState('recent'); // 'recent', 'name', 'rating'
  const [showSortModal, setShowSortModal] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const navegacion = useNavigation();
  const colors = useColors();
  const spacing = useSpacing();
  const typo = useTypography();
  const radii = useRadii();

  const restaurantesFavoritos = [
    {
      id: 'bon-appetit',
      nombre: 'Bon Appetit',
      cocina: 'Comida tradicional colombiana',
      calificacion: 4.8,
      distancia: '120m',
      visitas: 5,
      imagen: '🏪', // Para futuro: require('../assets/images/frijoles.jpg'),
      dateAdded: '2025-08-20',
    },
    {
      id: 'dona-carmen',
      nombre: 'Doña Carmen',
      cocina: 'Sopas y caldos tradicionales',
      calificacion: 4.6,
      distancia: '230m',
      visitas: 3,
      imagen: '🍲', // Para futuro: require('../assets/images/Ajiaco.jpg'),
      dateAdded: '2025-08-19',
    },
  ];

  const platosFavoritos = [
    {
      id: 'frijolada-tradicional',
      nombre: 'Frijolada Tradicional',
      restaurante: 'Bon Appetit',
      precio: '$15.900',
      calificacion: 4.8,
      imagen: '🍛', // Para futuro: require('../assets/images/frijoles.jpg'),
      dateAdded: '2025-08-20',
    },
    {
      id: 'ajiaco-santafereno',
      nombre: 'Ajiaco Santafereño',
      restaurante: 'Doña Carmen',
      precio: '$18.500',
      calificacion: 4.6,
      imagen: '🍲', // Para futuro: require('../assets/images/Ajiaco.jpg'),
      dateAdded: '2025-08-19',
    },
  ];

  const filtrarRestaurantes = () => {
    let filtered = restaurantesFavoritos.filter(restaurante =>
      restaurante.nombre.toLowerCase().includes(consultaBusqueda.toLowerCase()) ||
      restaurante.cocina.toLowerCase().includes(consultaBusqueda.toLowerCase())
    );

    // Apply sorting
    switch (sortOption) {
      case 'name':
        filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'rating':
        filtered.sort((a, b) => b.calificacion - a.calificacion);
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        break;
    }

    return filtered;
  };

  const filtrarPlatos = () => {
    let filtered = platosFavoritos.filter(plato =>
      plato.nombre.toLowerCase().includes(consultaBusqueda.toLowerCase()) ||
      plato.restaurante.toLowerCase().includes(consultaBusqueda.toLowerCase())
    );

    // Apply sorting
    switch (sortOption) {
      case 'name':
        filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'rating':
        filtered.sort((a, b) => b.calificacion - a.calificacion);
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        break;
    }

    return filtered;
  };

  const eliminarRestauranteFavorito = (restaurante) => {
    Alert.alert(
      'Eliminar favorito',
      `¿Eliminar "${restaurante.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', onPress: () => console.log('Eliminado') }
      ]
    );
  };

  const eliminarPlatoFavorito = (plato) => {
    Alert.alert(
      'Eliminar favorito',
      `¿Eliminar "${plato.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', onPress: () => console.log('Eliminado') }
      ]
    );
  };

  const mostrarOpcionesOrden = () => {
    setShowSortModal(true);
  };

  const mostrarMasOpciones = () => {
    setShowMoreModal(true);
  };

  const aplicarOrden = (opcion) => {
    setSortOption(opcion);
    setShowSortModal(false);
  };

  const compartirFavoritos = () => {
    Alert.alert(
      'Compartir Favoritos',
      'Funcionalidad de compartir será implementada pronto',
      [{ text: 'OK' }]
    );
    setShowMoreModal(false);
  };

  const limpiarTodosFavoritos = () => {
    Alert.alert(
      'Limpiar Todos',
      '¿Estás seguro de que quieres eliminar todos tus favoritos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar Todo', 
          style: 'destructive',
          onPress: () => {
            // Implementar lógica de limpieza
            console.log('Todos los favoritos eliminados');
            setShowMoreModal(false);
          }
        }
      ]
    );
  };

  const cardWrapper = { marginBottom: spacing.lg };
  const overlayStrong = getOverlay('strong', colors);
  const overlayUnavailable = { position:'absolute' as const, top:0, left:0, right:0, bottom:0, backgroundColor:overlayStrong, borderRadius:12, justifyContent:'center' as const, alignItems:'center' as const };
  const heartBtn = { position:'absolute' as const, top:8, right:8, zIndex:2 };
  const heartTxt = { fontSize:22 };

  const renderizarRestaurante = ({ item }) => (
    <View style={cardWrapper}>
      <SpoonFoodCard
        name={item.nombre}
        restaurant={item.cocina}
        price={item.distancia}
        rating={item.calificacion}
        imageUrl={''}
        isPopular={item.calificacion >= 4.7}
        tags={[`Visitas ${item.visitas}`]}
        onPress={() => navegacion.navigate('RestaurantDetail', { restaurantId: item.id })}
        testID={`fav-rest-${item.id}`}
      />
      <TouchableOpacity style={heartBtn} onPress={() => eliminarRestauranteFavorito(item)}>
        <Text style={heartTxt}>❤️</Text>
      </TouchableOpacity>
    </View>
  );

  const renderizarPlato = ({ item }) => (
    <View style={cardWrapper}>
      <SpoonFoodCard
        name={item.nombre}
        restaurant={item.restaurante}
        price={item.precio}
        rating={item.calificacion}
        imageUrl={''}
        onPress={() => navegacion.navigate('DishDetail', { dishId: item.id })}
        testID={`fav-dish-${item.id}`}
      />
      <TouchableOpacity style={heartBtn} onPress={() => eliminarPlatoFavorito(item)}>
        <Text style={heartTxt}>❤️</Text>
      </TouchableOpacity>
    </View>
  );

  const renderizarEstadoVacio = (tipo) => (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center', padding: spacing.xl }}>
      <Text style={{ fontSize:80, marginBottom: spacing.lg }}>💝</Text>
      <SpoonText variant="titleMedium" weight="bold" style={{ color: colors.textSecondary, marginBottom: spacing.sm }}>No tienes {tipo} favoritos</SpoonText>
      <SpoonText variant="bodyMedium" style={{ color: colors.textSecondary, textAlign:'center' }}>Explora y guarda tus {tipo} favoritos</SpoonText>
    </View>
  );

  const headerStyle = { flexDirection:'row' as const, alignItems:'center' as const, justifyContent:'space-between' as const, padding: spacing.md, backgroundColor: colors.surface };
  const headerTitle = { ...typo.titleLarge, fontWeight:'700', color: colors.textPrimary };
  const headerAction = { marginLeft: spacing.sm };
  const tabBar = { flexDirection:'row' as const, backgroundColor: colors.surface };
  const tab = (active:boolean) => ({ flex:1, paddingVertical: spacing.md, alignItems:'center' as const, borderBottomWidth:2, borderBottomColor: active ? colors.primary : 'transparent' });
  const tabText = (active:boolean) => ({ ...typo.bodyMedium, color: active ? colors.primary : colors.textSecondary, fontWeight: active ? '600':'400' });
  const searchWrap = { padding: spacing.md, backgroundColor: colors.surface };
  const searchBar = { flexDirection:'row' as const, alignItems:'center' as const, backgroundColor: colors.surfaceVariant, borderRadius: 24, paddingHorizontal: spacing.md, paddingVertical: spacing.sm };
  const searchInputStyle = { flex:1, ...typo.bodySmall, color: colors.textPrimary };

  return (
    // Eliminado scroll del SpoonPage para evitar FlatList dentro de ScrollView (warning VirtualizedLists)
    <SpoonPage scroll={false} padded>
      <View style={headerStyle}>
        <TouchableOpacity onPress={() => navegacion.goBack()}><Text style={{ fontSize:24 }}>←</Text></TouchableOpacity>
        <Text style={headerTitle}>Tus Favoritos</Text>
        <View style={{ flexDirection:'row' }}>
          <TouchableOpacity onPress={mostrarOpcionesOrden} style={headerAction}><Text style={{ fontSize:20 }}>⚙️</Text></TouchableOpacity>
          <TouchableOpacity onPress={mostrarMasOpciones} style={headerAction}><Text style={{ fontSize:20 }}>⋮</Text></TouchableOpacity>
        </View>
      </View>
      <View style={searchWrap}>
        <View style={searchBar}>
          <Text style={{ fontSize:16, marginRight:8 }}>🔍</Text>
          <TextInput
            style={searchInputStyle}
            placeholder="Buscar en favoritos..."
            placeholderTextColor={colors.textSecondary}
            value={consultaBusqueda}
            onChangeText={setConsultaBusqueda}
          />
        </View>
      </View>
      <View style={tabBar}>
        <TouchableOpacity style={tab(pestanaActiva===0)} onPress={() => setPestanaActiva(0)}>
          <Text style={tabText(pestanaActiva===0)}>Restaurantes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tab(pestanaActiva===1)} onPress={() => setPestanaActiva(1)}>
          <Text style={tabText(pestanaActiva===1)}>Platos</Text>
        </TouchableOpacity>
      </View>
      <View style={{ padding: spacing.md, flex:1 }}>
        {pestanaActiva === 0 ? (
          filtrarRestaurantes().length > 0 ? (
            <FlatList
              style={{ flex:1 }}
              data={filtrarRestaurantes()}
              renderItem={renderizarRestaurante}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: spacing.xl }}
            />
          ) : renderizarEstadoVacio('restaurantes')
        ) : (
          filtrarPlatos().length > 0 ? (
            <FlatList
              style={{ flex:1 }}
              data={filtrarPlatos()}
              renderItem={renderizarPlato}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: spacing.xl }}
            />
          ) : renderizarEstadoVacio('platos')
        )}
      </View>

      {/* Modal de Opciones de Ordenamiento */}
      <Modal visible={showSortModal} transparent animationType="slide" onRequestClose={() => setShowSortModal(false)}>
  <View style={{ flex:1, backgroundColor:overlayStrong, justifyContent:'flex-end' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, padding: spacing.lg }}>
            <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom: spacing.md, paddingBottom: spacing.sm, borderBottomWidth:1, borderBottomColor: colors.outline }}>
              <SpoonText variant="titleSmall" weight="bold">Ordenar por</SpoonText>
              <TouchableOpacity onPress={() => setShowSortModal(false)}><Text style={{ fontSize:18, color: colors.textSecondary }}>✕</Text></TouchableOpacity>
            </View>
            {['recent','name','rating'].map(opt => (
              <TouchableOpacity key={opt} style={{ flexDirection:'row', alignItems:'center', paddingVertical: spacing.md }} onPress={() => aplicarOrden(opt)}>
                <SpoonText variant="bodyMedium" style={{ flex:1, color: sortOption===opt ? colors.primary : colors.textPrimary, fontWeight: sortOption===opt ? '600':'400' }}>
                  {opt==='recent'?'Más Recientes': opt==='name'?'Nombre A-Z':'Mejor Calificación'}
                </SpoonText>
                {sortOption===opt && <Text style={{ fontSize:16, color: colors.primary, fontWeight:'700' }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Modal de Más Opciones */}
      <Modal visible={showMoreModal} transparent animationType="slide" onRequestClose={() => setShowMoreModal(false)}>
  <View style={{ flex:1, backgroundColor:overlayStrong, justifyContent:'flex-end' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, padding: spacing.lg }}>
            <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom: spacing.md, paddingBottom: spacing.sm, borderBottomWidth:1, borderBottomColor: colors.outline }}>
              <SpoonText variant="titleSmall" weight="bold">Más Opciones</SpoonText>
              <TouchableOpacity onPress={() => setShowMoreModal(false)}><Text style={{ fontSize:18, color: colors.textSecondary }}>✕</Text></TouchableOpacity>
            </View>
            <TouchableOpacity style={{ flexDirection:'row', alignItems:'center', paddingVertical: spacing.md }} onPress={compartirFavoritos}>
              <Text style={{ fontSize:20, marginRight: spacing.md }}>📤</Text>
              <SpoonText variant="bodyMedium" style={{ flex:1 }}>Compartir Favoritos</SpoonText>
            </TouchableOpacity>
            <TouchableOpacity style={{ flexDirection:'row', alignItems:'center', paddingVertical: spacing.md }} onPress={limpiarTodosFavoritos}>
              <Text style={{ fontSize:20, marginRight: spacing.md }}>🗑️</Text>
              <SpoonText variant="bodyMedium" style={{ flex:1, color: colors.error || colors.warning, fontWeight:'600' }}>Limpiar Todos</SpoonText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SpoonPage>
  );
}

export default FavoritesScreen;
