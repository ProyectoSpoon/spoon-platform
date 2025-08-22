import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function FavoritesScreen() {
  const [pestanaActiva, setPestanaActiva] = useState(0); // 0=Restaurantes, 1=Platos
  const [consultaBusqueda, setConsultaBusqueda] = useState('');
  const navegacion = useNavigation();

  const restaurantesFavoritos = [
    {
      id: 'bon-appetit',
      nombre: 'Bon Appetit',
      cocina: 'Comida tradicional colombiana',
      calificacion: 4.8,
      distancia: '120m',
      visitas: 5,
      imagen: '🏪',
    },
    {
      id: 'dona-carmen',
      nombre: 'Doña Carmen',
      cocina: 'Sopas y caldos tradicionales',
      calificacion: 4.6,
      distancia: '230m',
      visitas: 3,
      imagen: '🍲',
    },
  ];

  const platosFavoritos = [
    {
      id: 'frijolada-tradicional',
      nombre: 'Frijolada Tradicional',
      restaurante: 'Bon Appetit',
      precio: '$15.900',
      calificacion: 4.8,
      imagen: '🍛',
    },
    {
      id: 'ajiaco-santafereno',
      nombre: 'Ajiaco Santafereño',
      restaurante: 'Doña Carmen',
      precio: '$18.500',
      calificacion: 4.6,
      imagen: '🍲',
    },
  ];

  const filtrarRestaurantes = () => {
    return restaurantesFavoritos.filter(restaurante =>
      restaurante.nombre.toLowerCase().includes(consultaBusqueda.toLowerCase()) ||
      restaurante.cocina.toLowerCase().includes(consultaBusqueda.toLowerCase())
    );
  };

  const filtrarPlatos = () => {
    return platosFavoritos.filter(plato =>
      plato.nombre.toLowerCase().includes(consultaBusqueda.toLowerCase()) ||
      plato.restaurante.toLowerCase().includes(consultaBusqueda.toLowerCase())
    );
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
    Alert.alert(
      'Ordenar por',
      '',
      [
        { text: 'Recientes' },
        { text: 'Nombre' },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const renderizarRestaurante = ({ item }) => (
    <TouchableOpacity 
      style={estilos.tarjetaItem}
      onPress={() => navegacion.navigate('RestaurantDetail', { restaurantId: item.id })}
    >
      <View style={estilos.contenidoTarjeta}>
        <View style={estilos.imagenItem}>
          <Text style={estilos.emojiImagen}>{item.imagen}</Text>
        </View>
        
        <View style={estilos.infoItem}>
          <Text style={estilos.nombreItem}>{item.nombre}</Text>
          <Text style={estilos.descripcionItem}>{item.cocina}</Text>
          <View style={estilos.detallesItem}>
            <Text style={estilos.calificacionItem}>⭐ {item.calificacion}</Text>
            <Text style={estilos.distanciaItem}>{item.distancia}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={estilos.botonFavorito}
          onPress={() => eliminarRestauranteFavorito(item)}
        >
          <Text style={estilos.iconoCorazon}>❤️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderizarPlato = ({ item }) => (
    <TouchableOpacity 
      style={estilos.tarjetaItem}
      onPress={() => navegacion.navigate('DishDetail', { dishId: item.id })}
    >
      <View style={estilos.contenidoTarjeta}>
        <View style={estilos.imagenItem}>
          <Text style={estilos.emojiImagen}>{item.imagen}</Text>
        </View>
        
        <View style={estilos.infoItem}>
          <Text style={estilos.nombreItem}>{item.nombre}</Text>
          <Text style={estilos.descripcionItem}>{item.restaurante} • {item.precio}</Text>
          <View style={estilos.detallesItem}>
            <Text style={estilos.calificacionItem}>⭐ {item.calificacion}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={estilos.botonFavorito}
          onPress={() => eliminarPlatoFavorito(item)}
        >
          <Text style={estilos.iconoCorazon}>❤️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderizarEstadoVacio = (tipo) => (
    <View style={estilos.contenedorVacio}>
      <Text style={estilos.iconoVacio}>💝</Text>
      <Text style={estilos.tituloVacio}>No tienes {tipo} favoritos</Text>
      <Text style={estilos.mensajeVacio}>Explora y guarda tus {tipo} favoritos</Text>
    </View>
  );

  return (
    <SafeAreaView style={estilos.contenedor}>
      {/* Header */}
      <View style={estilos.header}>
        <TouchableOpacity onPress={() => navegacion.goBack()}>
          <Text style={estilos.iconoAtras}>←</Text>
        </TouchableOpacity>
        <Text style={estilos.tituloHeader}>Tus Favoritos</Text>
        <View style={estilos.accionesHeader}>
          <TouchableOpacity onPress={mostrarOpcionesOrden}>
            <Text style={estilos.iconoHeader}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Búsqueda */}
      <View style={estilos.contenedorBusqueda}>
        <View style={estilos.barraBusqueda}>
          <Text style={estilos.iconoBusqueda}>🔍</Text>
          <TextInput
            style={estilos.inputBusqueda}
            placeholder="Buscar en favoritos..."
            placeholderTextColor="#8B7355"
            value={consultaBusqueda}
            onChangeText={setConsultaBusqueda}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={estilos.contenedorTabs}>
        <TouchableOpacity 
          style={[estilos.tab, pestanaActiva === 0 && estilos.tabActiva]}
          onPress={() => setPestanaActiva(0)}
        >
          <Text style={[estilos.textoTab, pestanaActiva === 0 && estilos.textoTabActivo]}>
            Restaurantes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[estilos.tab, pestanaActiva === 1 && estilos.tabActiva]}
          onPress={() => setPestanaActiva(1)}
        >
          <Text style={[estilos.textoTab, pestanaActiva === 1 && estilos.textoTabActivo]}>
            Platos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido */}
      <View style={estilos.contenido}>
        {pestanaActiva === 0 ? (
          filtrarRestaurantes().length > 0 ? (
            <FlatList
              data={filtrarRestaurantes()}
              renderItem={renderizarRestaurante}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={estilos.lista}
            />
          ) : renderizarEstadoVacio('restaurantes')
        ) : (
          filtrarPlatos().length > 0 ? (
            <FlatList
              data={filtrarPlatos()}
              renderItem={renderizarPlato}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={estilos.lista}
            />
          ) : renderizarEstadoVacio('platos')
        )}
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F8F6F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconoAtras: {
    fontSize: 24,
    color: '#2C3E50',
  },
  tituloHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  accionesHeader: {
    flexDirection: 'row',
  },
  iconoHeader: {
    fontSize: 20,
    marginLeft: 16,
  },
  contenedorBusqueda: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  barraBusqueda: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F6F0',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 115, 85, 0.3)',
  },
  iconoBusqueda: {
    fontSize: 16,
    marginRight: 12,
  },
  inputBusqueda: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
  },
  contenedorTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabActiva: {
    borderBottomWidth: 2,
    borderBottomColor: '#E67E22',
  },
  textoTab: {
    fontSize: 16,
    color: '#8B7355',
  },
  textoTabActivo: {
    color: '#E67E22',
    fontWeight: '600',
  },
  contenido: {
    flex: 1,
  },
  lista: {
    padding: 16,
  },
  tarjetaItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  contenidoTarjeta: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  imagenItem: {
    width: 64,
    height: 64,
    backgroundColor: '#F8F6F0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emojiImagen: {
    fontSize: 32,
  },
  infoItem: {
    flex: 1,
  },
  nombreItem: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  descripcionItem: {
    fontSize: 14,
    color: '#8B7355',
    marginBottom: 8,
  },
  detallesItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calificacionItem: {
    fontSize: 12,
    color: '#E67E22',
    fontWeight: '500',
    marginRight: 12,
  },
  distanciaItem: {
    fontSize: 12,
    color: '#8B7355',
  },
  botonFavorito: {
    padding: 8,
  },
  iconoCorazon: {
    fontSize: 24,
  },
  contenedorVacio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconoVacio: {
    fontSize: 80,
    marginBottom: 24,
  },
  tituloVacio: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8B7355',
    marginBottom: 12,
  },
  mensajeVacio: {
    fontSize: 16,
    color: '#8B7355',
    textAlign: 'center',
  },
});
