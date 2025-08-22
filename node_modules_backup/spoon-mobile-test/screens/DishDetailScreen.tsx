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

export default function DishDetailScreen() {
  const ruta = useRoute();
  const navegacion = useNavigation();
  const { dishId } = ruta.params;

  const obtenerImagenPlato = (id) => {
    const imagenes = {
      '1': '🍛',
      '2': '🍲',
      '3': '🥗',
      '4': '🍝',
    };
    return imagenes[id] || '🍽️';
  };

  const manejarAccionLlamar = () => {
    Alert.alert('Llamar', 'Llamando al restaurante...');
  };

  const manejarAccionCalificar = () => {
    Alert.alert('Calificar', 'Función de calificación en desarrollo');
  };

  const manejarAccionFoto = () => {
    Alert.alert('Foto', 'Función de cámara en desarrollo');
  };

  const manejarAccionVisitado = () => {
    Alert.alert('Visitado', 'Marcado como visitado');
  };

  const mostrarHorariosExpandidos = () => {
    Alert.alert(
      'Horarios',
      'Lunes - Viernes: 11:00am - 9:00pm\n' +
      'Sábados: 10:00am - 10:00pm\n' +
      'Domingos: 12:00pm - 8:00pm',
      [{ text: 'Cerrar' }]
    );
  };

  const abrirUbicacionMapas = () => {
    Alert.alert('Mapas', 'Abriendo ubicación en Google Maps...');
  };

  const manejarReportarError = () => {
    Alert.alert(
      'Reportar Error',
      '¿Qué información es incorrecta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Reportar', 
          onPress: () => {
            Alert.alert('Gracias', 'Gracias por tu reporte.');
          }
        }
      ]
    );
  };

  const irPerfilRestaurante = () => {
    console.log('Navegando al perfil del restaurante: Bon Appetit');
    navegacion.navigate('RestaurantDetail', { restaurantId: 'bon-appetit' });
  };

  return (
    <SafeAreaView style={estilos.contenedor}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header con imagen */}
        <View style={estilos.contenedorHeader}>
          <View style={estilos.imagenHeader}>
            <Text style={estilos.emojiImagen}>{obtenerImagenPlato(dishId)}</Text>
          </View>
          
          <TouchableOpacity 
            style={estilos.botonAtras}
            onPress={() => navegacion.goBack()}
          >
            <Text style={estilos.iconoAtras}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={estilos.contenidoPrincipal}>
          {/* Información del plato */}
          <View style={estilos.seccionInfo}>
            <Text style={estilos.nombreRestaurante}>Bon Appetit</Text>
            <Text style={estilos.nombrePlato}>Frijolada</Text>
            <Text style={estilos.descripcionPlato}>
              Es una especialidad colombiana con trozos de chicharrón crujiente y chorizo en su interior. 
              Tradicionalmente se acompaña de arroz blanco y patacones, pero puedes elegir el side que 
              prefieras 😊 o plátanos maduros ¿antojados? ¡Los esperamos!
            </Text>
          </View>

          {/* Acciones rápidas mejoradas */}
          <View style={estilos.accionesRapidas}>
            <TouchableOpacity style={estilos.itemAccion} onPress={manejarAccionLlamar}>
              <View style={[estilos.iconoAccion, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                <Text style={estilos.emojiAccion}>📞</Text>
              </View>
              <Text style={estilos.etiquetaAccion}>Llamar</Text>
              <Text style={estilos.valorAccion}>4.8</Text>
              <Text style={estilos.subtituloAccion}>Comida</Text>
            </TouchableOpacity>

            <TouchableOpacity style={estilos.itemAccion} onPress={manejarAccionCalificar}>
              <View style={[estilos.iconoAccion, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Text style={estilos.emojiAccion}>⭐</Text>
              </View>
              <Text style={estilos.etiquetaAccion}>Calificar</Text>
              <Text style={estilos.valorAccion}>4.3</Text>
              <Text style={estilos.subtituloAccion}>Servicio</Text>
            </TouchableOpacity>

            <TouchableOpacity style={estilos.itemAccion} onPress={manejarAccionFoto}>
              <View style={[estilos.iconoAccion, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Text style={estilos.emojiAccion}>📷</Text>
              </View>
              <Text style={estilos.etiquetaAccion}>Foto</Text>
              <Text style={estilos.valorAccion}>4.4</Text>
              <Text style={estilos.subtituloAccion}>Ambiente</Text>
            </TouchableOpacity>

            <TouchableOpacity style={estilos.itemAccion} onPress={manejarAccionVisitado}>
              <View style={[estilos.iconoAccion, { backgroundColor: 'rgba(230, 126, 34, 0.1)' }]}>
                <Text style={estilos.emojiAccion}>✅</Text>
              </View>
              <Text style={estilos.etiquetaAccion}>Visitado</Text>
              <Text style={estilos.valorAccion}>$15.700</Text>
              <Text style={estilos.subtituloAccion}>Precio</Text>
            </TouchableOpacity>
          </View>

          {/* Información del restaurante simplificada con enlace al perfil */}
          <View style={estilos.seccionRestaurante}>
            <TouchableOpacity style={estilos.tarjetaRestaurante} onPress={irPerfilRestaurante}>
              <View style={estilos.iconoRestaurante}>
                <Text style={estilos.emojiRestaurante}>🏪</Text>
              </View>
              
              <View style={estilos.infoRestaurante}>
                <Text style={estilos.nombreRestauranteCard}>Bon Appetit</Text>
                <Text style={estilos.enlacePerfilRestaurante}>Ver perfil del restaurante</Text>
                <View style={estilos.calificacionRestaurante}>
                  <Text style={estilos.estrellas}>⭐⭐⭐⭐⭐</Text>
                  <Text style={estilos.textoCalificacion}>4.5 • 127 reseñas</Text>
                </View>
              </View>
              
              <Text style={estilos.flechaRestaurante}>→</Text>
            </TouchableOpacity>

            {/* Horarios */}
            <TouchableOpacity style={estilos.infoHorarios} onPress={mostrarHorariosExpandidos}>
              <Text style={estilos.iconoHorarios}>🕒</Text>
              <Text style={estilos.estadoAbierto}>Abierto</Text>
              <Text style={estilos.horarioTexto}>11:00am a 4:00pm</Text>
              <Text style={estilos.iconoInfo}>ℹ️</Text>
            </TouchableOpacity>

            {/* Dirección */}
            <TouchableOpacity style={estilos.infoDireccion} onPress={abrirUbicacionMapas}>
              <Text style={estilos.iconoDireccion}>📍</Text>
              <View style={estilos.textoDireccion}>
                <Text style={estilos.direccionPrincipal}>Carrera 46 # 123 - 61 - Botan</Text>
                <Text style={estilos.direccionSecundaria}>Chapinero • 850m</Text>
              </View>
              <Text style={estilos.iconoMapa}>🗺️</Text>
            </TouchableOpacity>
          </View>

          {/* Mapa de ubicación */}
          <View style={estilos.seccionMapa}>
            <View style={estilos.contenedorMapa}>
              <Text style={estilos.iconoMapaGrande}>🗺️</Text>
              <View style={estilos.marcadorMapa}>
                <Text style={estilos.iconoMarcador}>📍</Text>
              </View>
            </View>
          </View>

          {/* Métodos de pago */}
          <View style={estilos.seccionPago}>
            <Text style={estilos.tituloSeccion}>Medios de Pago</Text>
            <Text style={estilos.textoSeccion}>Efectivo - Debito - Credito</Text>
          </View>

          {/* Enlace reportar error */}
          <TouchableOpacity onPress={manejarReportarError}>
            <Text style={estilos.enlaceError}>
              ¿La información es errónea? <Text style={estilos.textoError}>Reportar el error</Text>
            </Text>
          </TouchableOpacity>

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
  contenedorHeader: {
    height: 300,
    position: 'relative',
  },
  imagenHeader: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiImagen: {
    fontSize: 120,
  },
  botonAtras: {
    position: 'absolute',
    top: 10,
    left: 16,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconoAtras: {
    fontSize: 20,
    color: '#2C3E50',
  },
  contenidoPrincipal: {
    padding: 16,
  },
  seccionInfo: {
    marginBottom: 24,
  },
  nombreRestaurante: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  nombrePlato: {
    fontSize: 20,
    color: '#8B7355',
    marginBottom: 16,
  },
  descripcionPlato: {
    fontSize: 16,
    color: '#8B7355',
    lineHeight: 24,
  },
  accionesRapidas: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  itemAccion: {
    alignItems: 'center',
  },
  iconoAccion: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emojiAccion: {
    fontSize: 20,
  },
  etiquetaAccion: {
    fontSize: 12,
    color: '#8B7355',
    marginBottom: 4,
  },
  valorAccion: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  subtituloAccion: {
    fontSize: 10,
    color: '#8B7355',
  },
  seccionRestaurante: {
    marginBottom: 24,
  },
  tarjetaRestaurante: {
    backgroundColor: 'rgba(230, 126, 34, 0.05)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(230, 126, 34, 0.2)',
    marginBottom: 16,
  },
  iconoRestaurante: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(230, 126, 34, 0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emojiRestaurante: {
    fontSize: 20,
  },
  infoRestaurante: {
    flex: 1,
  },
  nombreRestauranteCard: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E67E22',
    marginBottom: 2,
  },
  enlacePerfilRestaurante: {
    fontSize: 12,
    color: '#8B7355',
    marginBottom: 4,
  },
  calificacionRestaurante: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estrellas: {
    fontSize: 12,
    marginRight: 8,
  },
  textoCalificacion: {
    fontSize: 12,
    color: '#8B7355',
  },
  flechaRestaurante: {
    fontSize: 16,
    color: '#E67E22',
  },
  infoHorarios: {
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    marginBottom: 12,
  },
  iconoHorarios: {
    fontSize: 16,
    marginRight: 8,
  },
  estadoAbierto: {
    fontSize: 14,
    color: '#059669',
    fontWeight: 'bold',
    marginRight: 8,
  },
  horarioTexto: {
    fontSize: 14,
    color: '#8B7355',
    flex: 1,
  },
  iconoInfo: {
    fontSize: 14,
  },
  infoDireccion: {
    backgroundColor: 'rgba(230, 126, 34, 0.05)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(230, 126, 34, 0.2)',
  },
  iconoDireccion: {
    fontSize: 16,
    marginRight: 8,
  },
  textoDireccion: {
    flex: 1,
  },
  direccionPrincipal: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
    marginBottom: 2,
  },
  direccionSecundaria: {
    fontSize: 12,
    color: '#8B7355',
  },
  iconoMapa: {
    fontSize: 14,
  },
  seccionMapa: {
    marginBottom: 16,
  },
  contenedorMapa: {
    height: 200,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  iconoMapaGrande: {
    fontSize: 64,
    color: '#8B7355',
  },
  marcadorMapa: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
  },
  iconoMarcador: {
    fontSize: 32,
  },
  seccionPago: {
    marginBottom: 24,
  },
  tituloSeccion: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  textoSeccion: {
    fontSize: 14,
    color: '#8B7355',
  },
  enlaceError: {
    fontSize: 12,
    color: '#8B7355',
    textAlign: 'center',
    marginBottom: 24,
  },
  textoError: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  espacioFinal: {
    height: 32,
  },
});
