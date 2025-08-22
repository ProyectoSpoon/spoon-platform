import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';

export default function HomeScreen() {
  const [controladorBusqueda, setControladorBusqueda] = useState('');
  const [ubicacionActual, setUbicacionActual] = useState('Cra. 46 # 123-61, Chapinero');
  const [ubicacionUsuario, setUbicacionUsuario] = useState(null);
  const [permisoUbicacion, setPermisoUbicacion] = useState(null);
  
  const navegacion = useNavigation();

  useEffect(() => {
    solicitarPermisoUbicacion();
  }, []);

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
      const ubicacion = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setUbicacionUsuario(ubicacion);
      console.log('📍 Ubicación obtenida:', ubicacion.coords);
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
    }
  };

  const mostrarModalUbicacion = () => {
    Alert.alert(
      'Cambiar Ubicación',
      '¿Deseas actualizar tu ubicación actual?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Actualizar', onPress: obtenerUbicacionActual }
      ]
    );
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

  const irAPerfil = () => {
    console.log('👤 Perfil presionado desde header');
    // Cuando tengas ProfileScreen, descomenta:
    // navegacion.navigate('Profile');
    Alert.alert('Perfil', 'Navegación a perfil en desarrollo');
  };

  const irAFavoritos = () => {
    console.log('💝 Navegando a favoritos');
    navegacion.navigate('Favorites');
  };

  const irARestaurante = (restauranteId) => {
    console.log('🏪 Navegando a restaurante:', restauranteId);
    navegacion.navigate('RestaurantDetail', { restaurantId: restauranteId });
  };

  const irAPlato = (platoId) => {
    console.log('🍛 Navegando a plato:', platoId);
    navegacion.navigate('DishDetail', { dishId: platoId });
  };

  return (
    <SafeAreaView style={estilos.contenedor}>
      <ScrollView 
        style={estilos.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header con ubicación y perfil */}
        <View style={estilos.headerUbicacion}>
          <TouchableOpacity 
            style={estilos.seccionUbicacion}
            onPress={mostrarModalUbicacion}
          >
            <View style={estilos.contenedorIconoUbicacion}>
              <Text style={estilos.iconoUbicacion}>📍</Text>
            </View>
            
            <View style={estilos.infoUbicacion}>
              <Text style={estilos.etiquetaUbicacion}>Tu ubicación</Text>
              <Text style={estilos.textoUbicacion}>{ubicacionActual}</Text>
            </View>
            
            <Text style={estilos.iconoFlecha}>⌄</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={estilos.botonPerfil}
            onPress={irAPerfil}
          >
            <Text style={estilos.iconoPerfil}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Contenido principal de descubrimiento */}
        <View style={estilos.contenidoPrincipal}>
          {/* Barra de búsqueda optimizada para descubrimiento */}
          <View style={estilos.contenedorBusqueda}>
            <View style={estilos.barraBusqueda}>
              <Text style={estilos.iconoBusqueda}>🔍</Text>
              <TextInput
                style={estilos.inputBusqueda}
                placeholder="¿Qué antojo tienes hoy?"
                placeholderTextColor="#8B7355"
                value={controladorBusqueda}
                onChangeText={setControladorBusqueda}
                onSubmitEditing={() => manejarBusqueda(controladorBusqueda)}
                returnKeyType="search"
              />
              <TouchableOpacity 
                style={estilos.botonFiltros}
                onPress={mostrarFiltrosDescubrimiento}
              >
                <Text style={estilos.iconoFiltros}>⚙️</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Categorías Tradicionales */}
          <View style={estilos.seccion}>
            <Text style={estilos.tituloSeccion}>Categorías Tradicionales</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={estilos.scrollHorizontal}
            >
              {['Desayunos', 'Almuerzos', 'Cenas', 'Postres', 'Bebidas'].map((categoria, indice) => (
                <TouchableOpacity 
                  key={indice} 
                  style={estilos.categoriaItem}
                  onPress={() => navegacion.navigate('Search', { consultaInicial: categoria })}
                >
                  <View style={estilos.categoriaIcono}>
                    <Text style={estilos.categoriaEmoji}>
                      {categoria === 'Desayunos' ? '🍳' : 
                       categoria === 'Almuerzos' ? '🍽️' : 
                       categoria === 'Cenas' ? '🌮' : 
                       categoria === 'Postres' ? '🍰' : '☕'}
                    </Text>
                  </View>
                  <Text style={estilos.categoriaNombre}>{categoria}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Restaurantes Cercanos */}
          <View style={estilos.seccion}>
            <View style={estilos.headerSeccion}>
              <Text style={estilos.tituloSeccion}>Cerca a Ti</Text>
              <TouchableOpacity onPress={() => navegacion.navigate('Search', { consultaInicial: 'restaurantes cercanos' })}>
                <Text style={estilos.verTodos}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={estilos.scrollHorizontal}
            >
              {[
                { id: '1', nombre: 'Bon Appetit', distancia: '0.1km', rating: '4.8' },
                { id: '2', nombre: 'Doña Carmen', distancia: '0.2km', rating: '4.6' },
                { id: '3', nombre: 'El Fogón', distancia: '0.3km', rating: '4.5' },
                { id: '4', nombre: 'Casa Vieja', distancia: '0.4km', rating: '4.7' }
              ].map((restaurante, indice) => (
                <TouchableOpacity 
                  key={indice} 
                  style={estilos.restauranteCard}
                  onPress={() => irARestaurante(restaurante.id)}
                >
                  <View style={estilos.restauranteImagen}>
                    <Text style={estilos.restauranteEmoji}>🏪</Text>
                  </View>
                  <Text style={estilos.restauranteNombre}>{restaurante.nombre}</Text>
                  <Text style={estilos.restauranteDistancia}>{restaurante.distancia} • Abierto</Text>
                  <Text style={estilos.restauranteRating}>⭐ {restaurante.rating}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Especialidades del Día */}
          <View style={estilos.seccion}>
            <Text style={estilos.tituloSeccion}>Especialidades del Día</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={estilos.scrollHorizontal}
            >
              {[
                { id: '1', nombre: 'Bandeja Paisa', precio: '$15,000 - $25,000' },
                { id: '2', nombre: 'Ajiaco', precio: '$12,000 - $18,000' },
                { id: '3', nombre: 'Sancocho', precio: '$14,000 - $20,000' },
                { id: '4', nombre: 'Arepa Rellena', precio: '$8,000 - $12,000' }
              ].map((especialidad, indice) => (
                <TouchableOpacity 
                  key={indice} 
                  style={estilos.especialidadCard}
                  onPress={() => irAPlato(especialidad.id)}
                >
                  <View style={estilos.especialidadImagen}>
                    <Text style={estilos.especialidadEmoji}>🍲</Text>
                  </View>
                  <Text style={estilos.especialidadNombre}>{especialidad.nombre}</Text>
                  <Text style={estilos.especialidadPrecio}>{especialidad.precio}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Lugares Favoritos */}
          <View style={estilos.seccion}>
            <View style={estilos.headerSeccion}>
              <Text style={estilos.tituloSeccion}>Tus Lugares Favoritos</Text>
              <TouchableOpacity onPress={irAFavoritos}>
                <Text style={estilos.verTodos}>Gestionar</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={estilos.botonFavoritos} onPress={irAFavoritos}>
              <Text style={estilos.textoVacio}>
                Agrega restaurantes a favoritos para verlos aquí
              </Text>
            </TouchableOpacity>
          </View>

          {/* Descubre Algo Nuevo */}
          <View style={estilos.seccion}>
            <Text style={estilos.tituloSeccion}>Descubre Algo Nuevo</Text>
            <TouchableOpacity 
              style={estilos.descubreCard}
              onPress={() => navegacion.navigate('Search', { consultaInicial: 'sorpresa' })}
            >
              <Text style={estilos.descubreEmoji}>🎲</Text>
              <Text style={estilos.descubreTitulo}>Sorpréndeme</Text>
              <Text style={estilos.descubreSubtitulo}>
                Encuentra nuevos sabores cerca de ti
              </Text>
            </TouchableOpacity>
          </View>

          <View style={estilos.espacioFinal} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F8F6F0',
  },
  scrollView: {
    flex: 1,
  },
  headerUbicacion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  seccionUbicacion: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contenedorIconoUbicacion: {
    padding: 8,
    backgroundColor: 'rgba(230, 126, 34, 0.1)',
    borderRadius: 8,
    marginRight: 12,
  },
  iconoUbicacion: {
    fontSize: 20,
  },
  infoUbicacion: {
    flex: 1,
  },
  etiquetaUbicacion: {
    fontSize: 12,
    color: '#8B7355',
    marginBottom: 2,
  },
  textoUbicacion: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
  },
  iconoFlecha: {
    fontSize: 16,
    color: '#8B7355',
    marginLeft: 8,
  },
  botonPerfil: {
    padding: 8,
    backgroundColor: 'rgba(230, 126, 34, 0.1)',
    borderRadius: 8,
    marginLeft: 16,
  },
  iconoPerfil: {
    fontSize: 24,
  },
  contenidoPrincipal: {
    padding: 16,
  },
  contenedorBusqueda: {
    marginBottom: 24,
  },
  barraBusqueda: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  iconoBusqueda: {
    fontSize: 20,
    marginRight: 12,
  },
  inputBusqueda: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
  },
  botonFiltros: {
    padding: 4,
    marginLeft: 8,
  },
  iconoFiltros: {
    fontSize: 18,
  },
  seccion: {
    marginBottom: 32,
  },
  headerSeccion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tituloSeccion: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  verTodos: {
    fontSize: 14,
    color: '#E67E22',
    fontWeight: '600',
  },
  scrollHorizontal: {
    paddingLeft: 0,
  },
  categoriaItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  categoriaIcono: {
    width: 60,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoriaEmoji: {
    fontSize: 24,
  },
  categoriaNombre: {
    fontSize: 12,
    color: '#2C3E50',
    textAlign: 'center',
    fontWeight: '500',
  },
  restauranteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 16,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restauranteImagen: {
    height: 80,
    backgroundColor: '#F8F6F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  restauranteEmoji: {
    fontSize: 32,
  },
  restauranteNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  restauranteDistancia: {
    fontSize: 12,
    color: '#8B7355',
    marginBottom: 4,
  },
  restauranteRating: {
    fontSize: 12,
    color: '#E67E22',
    fontWeight: '500',
  },
  especialidadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 16,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  especialidadImagen: {
    height: 70,
    backgroundColor: '#F8F6F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  especialidadEmoji: {
    fontSize: 28,
  },
  especialidadNombre: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  especialidadPrecio: {
    fontSize: 11,
    color: '#E67E22',
    fontWeight: '500',
  },
  botonFavoritos: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E67E22',
    borderStyle: 'dashed',
  },
  textoVacio: {
    fontSize: 14,
    color: '#8B7355',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  descubreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descubreEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  descubreTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  descubreSubtitulo: {
    fontSize: 14,
    color: '#8B7355',
    textAlign: 'center',
  },
  espacioFinal: {
    height: 100,
  },
});
