import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Alert,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const { width: anchoContalla } = Dimensions.get('window');

export default function RestaurantDetailScreen() {
  const ruta = useRoute();
  const navegacion = useNavigation();
  const { restaurantId } = ruta.params;
  
  const [esFavorito, setEsFavorito] = useState(false);

  const obtenerDatosRestaurante = (id) => {
    const restaurantes = {
      '1': {
        nombre: 'Bon Appetit',
        categoria: 'Comida Tradicional Colombiana',
        calificacion: '4.8',
        resenas: '127',
        tiempoEntrega: '15-25 min',
        distancia: '120m',
        direccion: 'Calle 72 #10-15, Chapinero, Bogotá',
        estaAbierto: true,
        imagen: '🏪',
        platoDestacado: 'Frijolada Tradicional',
        precioDestacado: '$15.900',
        imagenDestacada: '🍛',
        telefono: '601-234-5678',
        horarios: {
          lunesViernes: '11:00 AM - 9:00 PM',
          sabado: '10:00 AM - 10:00 PM',
          domingo: '12:00 PM - 8:00 PM',
        },
        mediosPago: ['Efectivo', 'Débito', 'Crédito'],
      },
      '2': {
        nombre: 'Doña Carmen',
        categoria: 'Cocina Santafereña',
        calificacion: '4.6',
        resenas: '89',
        tiempoEntrega: '20-30 min',
        distancia: '230m',
        direccion: 'Carrera 13 #45-67, Centro, Bogotá',
        estaAbierto: true,
        imagen: '🍲',
        platoDestacado: 'Ajiaco Santafereño',
        precioDestacado: '$18.500',
        imagenDestacada: '🍲',
        telefono: '601-345-6789',
        horarios: {
          lunesViernes: '10:00 AM - 8:00 PM',
          sabado: '9:00 AM - 9:00 PM',
          domingo: '11:00 AM - 7:00 PM',
        },
        mediosPago: ['Efectivo', 'Débito', 'Crédito', 'Nequi'],
      },
    };

    return restaurantes[id] || {
      nombre: 'Restaurante No Encontrado',
      categoria: 'N/A',
      calificacion: '0.0',
      resenas: '0',
      tiempoEntrega: 'N/A',
      distancia: 'N/A',
      direccion: 'Dirección no disponible',
      estaAbierto: false,
      imagen: '❓',
      platoDestacado: 'No disponible',
      precioDestacado: '$0',
      imagenDestacada: '❓',
      telefono: null,
      horarios: {
        lunesViernes: 'No disponible',
        sabado: 'No disponible',
        domingo: 'No disponible',
      },
      mediosPago: [],
    };
  };

  const datosRestaurante = obtenerDatosRestaurante(restaurantId);

  const alternarFavorito = () => {
    setEsFavorito(!esFavorito);
    Alert.alert(
      esFavorito ? 'Eliminado de favoritos' : 'Agregado a favoritos',
      `${datosRestaurante.nombre} ${esFavorito ? 'eliminado de' : 'agregado a'} tus favoritos`
    );
  };

  const llamarRestaurante = () => {
    if (datosRestaurante.telefono) {
      const url = `tel:${datosRestaurante.telefono}`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'No se pudo realizar la llamada');
      });
    } else {
      Alert.alert('Error', 'Número de teléfono no disponible');
    }
  };

  const abrirMapa = () => {
    Alert.alert('Navegación', `Abriendo direcciones a: ${datosRestaurante.direccion}`);
  };

  const compartirRestaurante = () => {
    Alert.alert('Compartir', `Compartiendo ${datosRestaurante.nombre}`);
  };

  const mostrarHorarios = () => {
    Alert.alert(
      'Horarios de atención',
      `Lunes - Viernes: ${datosRestaurante.horarios.lunesViernes}\n` +
      `Sábado: ${datosRestaurante.horarios.sabado}\n` +
      `Domingo: ${datosRestaurante.horarios.domingo}`,
      [{ text: 'Cerrar' }]
    );
  };

  const irAlMenu = () => {
    Alert.alert('Menú', 'Navegando al menú completo...');
  };

  const hacerPedido = () => {
    Alert.alert('Pedido', 'Iniciando proceso de pedido...');
  };

  return (
    <SafeAreaView style={estilos.contenedor}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header con imagen principal */}
        <View style={estilos.contenedorImagen}>
          <View style={estilos.imagenPrincipal}>
            <Text style={estilos.emojiImagen}>{datosRestaurante.imagen}</Text>
          </View>
          
          {/* Botones header */}
          <View style={estilos.botonesHeader}>
            <TouchableOpacity 
              style={estilos.botonHeader}
              onPress={() => navegacion.goBack()}
            >
              <Text style={estilos.iconoBoton}>←</Text>
            </TouchableOpacity>
            
            <View style={estilos.botonesDerechos}>
              <TouchableOpacity 
                style={estilos.botonHeader}
                onPress={alternarFavorito}
              >
                <Text style={estilos.iconoBoton}>{esFavorito ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={estilos.botonHeader}
                onPress={compartirRestaurante}
              >
                <Text style={estilos.iconoBoton}>📤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={estilos.contenidoPrincipal}>
          {/* Información básica */}
          <View style={estilos.seccionInfo}>
            <View style={estilos.headerInfo}>
              <Text style={estilos.nombreRestaurante}>{datosRestaurante.nombre}</Text>
              <View style={[
                estilos.estadoChip,
                { backgroundColor: datosRestaurante.estaAbierto ? '#10B981' : '#EF4444' }
              ]}>
                <Text style={estilos.textoEstado}>
                  {datosRestaurante.estaAbierto ? 'Abierto' : 'Cerrado'}
                </Text>
              </View>
            </View>
            
            <Text style={estilos.categoriaRestaurante}>{datosRestaurante.categoria}</Text>
            
            <View style={estilos.detallesRestaurante}>
              <View style={estilos.calificaciones}>
                <Text style={estilos.iconoEstrella}>⭐</Text>
                <Text style={estilos.textoCalificacion}>{datosRestaurante.calificacion}</Text>
                <Text style={estilos.textoResenas}>({datosRestaurante.resenas} reseñas)</Text>
              </View>
              
              <View style={estilos.tiempoEntrega}>
                <Text style={estilos.iconoTiempo}>🕒</Text>
                <Text style={estilos.textoTiempo}>{datosRestaurante.tiempoEntrega}</Text>
              </View>
            </View>
            
            <View style={estilos.ubicacionInfo}>
              <Text style={estilos.iconoUbicacion}>📍</Text>
              <Text style={estilos.textoUbicacion}>{datosRestaurante.direccion}</Text>
              <Text style={estilos.distanciaTexto}>{datosRestaurante.distancia}</Text>
            </View>
          </View>

          {/* Plato destacado */}
          <View style={estilos.platoDestacado}>
            <View style={estilos.imagenPlato}>
              <Text style={estilos.emojiPlato}>{datosRestaurante.imagenDestacada}</Text>
            </View>
            
            <View style={estilos.infoPlato}>
              <Text style={estilos.etiquetaDestacado}>Plato destacado</Text>
              <Text style={estilos.nombrePlato}>{datosRestaurante.platoDestacado}</Text>
              <Text style={estilos.precioPlato}>{datosRestaurante.precioDestacado}</Text>
            </View>
          </View>

          {/* Acciones rápidas */}
          <View style={estilos.accionesRapidas}>
            <TouchableOpacity style={estilos.accionItem} onPress={llamarRestaurante}>
              <Text style={estilos.iconoAccion}>📞</Text>
              <Text style={estilos.textoAccion}>Llamar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={estilos.accionItem} onPress={abrirMapa}>
              <Text style={estilos.iconoAccion}>🗺️</Text>
              <Text style={estilos.textoAccion}>Direcciones</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={estilos.accionItem} onPress={mostrarHorarios}>
              <Text style={estilos.iconoAccion}>🕒</Text>
              <Text style={estilos.textoAccion}>Horarios</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={estilos.accionItem} onPress={compartirRestaurante}>
              <Text style={estilos.iconoAccion}>📤</Text>
              <Text style={estilos.textoAccion}>Compartir</Text>
            </TouchableOpacity>
          </View>

          {/* Mapa */}
          <View style={estilos.seccionMapa}>
            <View style={estilos.contenedorMapa}>
              <View style={estilos.mapa}>
                <Text style={estilos.iconoMapa}>🗺️</Text>
                <Text style={estilos.textoMapa}>Ver en Google Maps</Text>
              </View>
              <View style={estilos.marcadorMapa}>
                <Text style={estilos.iconoMarcador}>📍</Text>
              </View>
            </View>
          </View>

          {/* Información adicional */}
          <View style={estilos.infoAdicional}>
            <View style={estilos.filaInfo}>
              <Text style={estilos.iconoInfo}>💳</Text>
              <View style={estilos.contenidoInfo}>
                <Text style={estilos.tituloInfo}>Métodos de pago</Text>
                <Text style={estilos.textoInfo}>
                  {datosRestaurante.mediosPago.join(' • ')}
                </Text>
              </View>
            </View>
            
            {datosRestaurante.telefono && (
              <View style={estilos.filaInfo}>
                <Text style={estilos.iconoInfo}>📞</Text>
                <View style={estilos.contenidoInfo}>
                  <Text style={estilos.tituloInfo}>Teléfono</Text>
                  <TouchableOpacity onPress={llamarRestaurante}>
                    <Text style={estilos.telefonoTexto}>{datosRestaurante.telefono}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Botones principales */}
          <View style={estilos.botonesAccion}>
            <TouchableOpacity style={estilos.botonPrimario} onPress={irAlMenu}>
              <Text style={estilos.iconoBotonAccion}>📋</Text>
              <Text style={estilos.textoBotonPrimario}>Ver Menú</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={estilos.botonSecundario} onPress={hacerPedido}>
              <Text style={estilos.iconoBotonAccion}>🛒</Text>
              <Text style={estilos.textoBotonSecundario}>Pedir Ya</Text>
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
  contenedorImagen: {
    height: 250,
    position: 'relative',
  },
  imagenPrincipal: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  emojiImagen: {
    fontSize: 80,
  },
  botonesHeader: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  botonHeader: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonesDerechos: {
    flexDirection: 'row',
    gap: 8,
  },
  iconoBoton: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  contenidoPrincipal: {
    padding: 20,
  },
  seccionInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nombreRestaurante: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  estadoChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  textoEstado: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoriaRestaurante: {
    fontSize: 16,
    color: '#8B7355',
    marginBottom: 12,
  },
  detallesRestaurante: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calificaciones: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconoEstrella: {
    fontSize: 16,
    marginRight: 4,
  },
  textoCalificacion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginRight: 8,
  },
  textoResenas: {
    fontSize: 14,
    color: '#8B7355',
  },
  tiempoEntrega: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconoTiempo: {
    fontSize: 14,
    marginRight: 4,
  },
  textoTiempo: {
    fontSize: 14,
    color: '#8B7355',
  },
  ubicacionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconoUbicacion: {
    fontSize: 14,
    marginRight: 4,
  },
  textoUbicacion: {
    fontSize: 14,
    color: '#8B7355',
    flex: 1,
  },
  distanciaTexto: {
    fontSize: 14,
    color: '#E67E22',
    fontWeight: 'bold',
  },
  platoDestacado: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(230, 126, 34, 0.2)',
    marginBottom: 20,
  },
  imagenPlato: {
    width: 80,
    height: 80,
    backgroundColor: '#F8F6F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emojiPlato: {
    fontSize: 40,
  },
  infoPlato: {
    flex: 1,
  },
  etiquetaDestacado: {
    fontSize: 12,
    color: '#E67E22',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nombrePlato: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  precioPlato: {
    fontSize: 14,
    color: '#E67E22',
    fontWeight: 'bold',
  },
  accionesRapidas: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  accionItem: {
    alignItems: 'center',
  },
  iconoAccion: {
    fontSize: 24,
    marginBottom: 8,
  },
  textoAccion: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '600',
  },
  seccionMapa: {
    marginBottom: 20,
  },
  contenedorMapa: {
    height: 200,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    position: 'relative',
    overflow: 'hidden',
  },
  mapa: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconoMapa: {
    fontSize: 48,
    marginBottom: 8,
  },
  textoMapa: {
    fontSize: 14,
    color: '#8B7355',
    fontWeight: '500',
  },
  marcadorMapa: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    backgroundColor: '#E67E22',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconoMarcador: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  infoAdicional: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  filaInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconoInfo: {
    fontSize: 20,
    marginRight: 8,
    marginTop: 2,
  },
  contenidoInfo: {
    flex: 1,
  },
  tituloInfo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  textoInfo: {
    fontSize: 14,
    color: '#8B7355',
  },
  telefonoTexto: {
    fontSize: 14,
    color: '#E67E22',
    fontWeight: '600',
  },
  botonesAccion: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  botonPrimario: {
    flex: 1,
    backgroundColor: '#E67E22',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonSecundario: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E67E22',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoBotonAccion: {
    fontSize: 16,
    marginRight: 8,
  },
  textoBotonPrimario: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textoBotonSecundario: {
    color: '#E67E22',
    fontSize: 16,
    fontWeight: 'bold',
  },
  espacioFinal: {
    height: 40,
  },
});
