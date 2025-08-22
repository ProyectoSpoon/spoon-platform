import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function SearchScreen() {
  const navegacion = useNavigation();
  const ruta = useRoute();
  const consultaInicial = ruta.params?.consultaInicial || '';

  const [controladorBusqueda, setControladorBusqueda] = useState(consultaInicial);
  const [consultaBusqueda, setConsultaBusqueda] = useState(consultaInicial);
  const [pestanaActiva, setPestanaActiva] = useState(0); // 0=Todo, 1=Restaurantes, 2=Platos
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [historialBusqueda, setHistorialBusqueda] = useState([
    'Frijolada tradicional',
    'Ajiaco bogotano',
    'Hamburguesa vegana',
    'Lentejas caseras',
    'Arroz con pollo',
  ]);
  const [busquedasTendencia] = useState([
    'Comida vegana Chapinero',
    'Ajiaco cerca',
    'Bandeja paisa',
    'Desayunos típicos',
    'Sopas tradicionales',
    'Comida casera',
  ]);
  const [sugerenciasRapidas] = useState([
    { texto: 'Frijoles con garra', tipo: 'plato', icono: '🍛' },
    { texto: 'Bon Appetit', tipo: 'restaurante', icono: '🏪' },
    { texto: 'Comida vegana', tipo: 'categoria', icono: '🥗' },
    { texto: 'Chapinero', tipo: 'ubicacion', icono: '📍' },
  ]);

  useEffect(() => {
    if (consultaInicial) {
      realizarBusqueda(consultaInicial);
    }
  }, [consultaInicial]);

  const generarResultadosBusqueda = (consulta) => {
    const todosResultados = [
      {
        id: '1',
        titulo: 'Bon Appetit',
        subtitulo: 'Restaurante • Comida tradicional colombiana',
        tipo: 'restaurante',
        calificacion: 4.2,
        distancia: '184m',
        imagen: '🏪',
      },
      {
        id: '2',
        titulo: 'Frijolada Tradicional',
        subtitulo: 'Bon Appetit • Legumbres',
        tipo: 'plato',
        calificacion: 4.8,
        distancia: '184m',
        precio: '$15.900',
        imagen: '🍛',
      },
      {
        id: '3',
        titulo: 'Verde Natural',
        subtitulo: 'Restaurante • Comida vegana',
        tipo: 'restaurante',
        calificacion: 4.5,
        distancia: '280m',
        imagen: '🥗',
      },
      {
        id: '4',
        titulo: 'Ajiaco Santafereño',
        subtitulo: 'Doña Carmen • Sopas tradicionales',
        tipo: 'plato',
        calificacion: 4.6,
        distancia: '320m',
        precio: '$18.500',
        imagen: '🍲',
      },
      {
        id: '5',
        titulo: 'Chapinero',
        subtitulo: 'Zona gastronómica • 45 restaurantes',
        tipo: 'ubicacion',
        imagen: '📍',
      },
    ];

    return todosResultados.filter((resultado) =>
      resultado.titulo.toLowerCase().includes(consulta.toLowerCase()) ||
      (resultado.subtitulo?.toLowerCase().includes(consulta.toLowerCase()) ?? false)
    );
  };

  const realizarBusqueda = (consulta = consultaBusqueda) => {
    if (!consulta.trim()) {
      setResultadosBusqueda([]);
      return;
    }

    const resultados = generarResultadosBusqueda(consulta);
    setResultadosBusqueda(resultados);
    console.log(`🔍 Búsqueda realizada: "${consulta}" - ${resultados.length} resultados`);
  };

  const seleccionarSugerencia = (sugerencia) => {
    setControladorBusqueda(sugerencia);
    setConsultaBusqueda(sugerencia);
    agregarAlHistorial(sugerencia);
    realizarBusqueda(sugerencia);
  };

  const agregarAlHistorial = (consulta) => {
    if (!historialBusqueda.includes(consulta)) {
      const nuevoHistorial = [consulta, ...historialBusqueda.slice(0, 9)];
      setHistorialBusqueda(nuevoHistorial);
    }
  };

  const alPresionarResultado = (resultado) => {
    console.log(`Resultado seleccionado: ${resultado.titulo} (${resultado.tipo})`);
    
    switch (resultado.tipo) {
      case 'restaurante':
        navegacion.navigate('RestaurantDetail', { restaurantId: resultado.id });
        break;
      case 'plato':
        navegacion.navigate('DishDetail', { dishId: resultado.id });
        break;
      case 'ubicacion':
        Alert.alert('Ubicación', `Explorando: ${resultado.titulo}`);
        break;
    }
  };

  const obtenerResultadosRestaurantes = () => {
    return resultadosBusqueda.filter(r => r.tipo === 'restaurante');
  };

  const obtenerResultadosPlatos = () => {
    return resultadosBusqueda.filter(r => r.tipo === 'plato');
  };

  const renderizarItemHistorial = ({ item }) => (
    <TouchableOpacity 
      style={estilos.itemHistorial}
      onPress={() => seleccionarSugerencia(item)}
    >
      <Text style={estilos.iconoHistorial}>🕒</Text>
      <Text style={estilos.textoHistorial}>{item}</Text>
      <Text style={estilos.iconoFlecha}>↗️</Text>
    </TouchableOpacity>
  );

  const renderizarChipTendencia = (tendencia, indice) => (
    <TouchableOpacity 
      key={indice}
      style={estilos.chipTendencia}
      onPress={() => seleccionarSugerencia(tendencia)}
    >
      <Text style={estilos.iconoTendencia}>📈</Text>
      <Text style={estilos.textoChip}>{tendencia}</Text>
    </TouchableOpacity>
  );

  const renderizarSugerenciaRapida = ({ item }) => (
    <TouchableOpacity 
      style={estilos.itemSugerencia}
      onPress={() => seleccionarSugerencia(item.texto)}
    >
      <Text style={estilos.iconoSugerencia}>{item.icono}</Text>
      <View style={estilos.infoSugerencia}>
        <Text style={estilos.textoSugerencia}>{item.texto}</Text>
        <Text style={estilos.tipoSugerencia}>{item.tipo}</Text>
      </View>
      <Text style={estilos.iconoFlecha}>↗️</Text>
    </TouchableOpacity>
  );

  const renderizarResultado = ({ item }) => (
    <TouchableOpacity 
      style={estilos.tarjetaResultado}
      onPress={() => alPresionarResultado(item)}
    >
      <View style={estilos.contenidoResultado}>
        <View style={estilos.imagenResultado}>
          <Text style={estilos.emojiResultado}>{item.imagen}</Text>
        </View>
        
        <View style={estilos.infoResultado}>
          <View style={estilos.headerResultado}>
            <View style={estilos.tipoChip}>
              <Text style={estilos.textoTipoChip}>{item.tipo.toUpperCase()}</Text>
            </View>
            {item.calificacion && (
              <View style={estilos.calificacionContainer}>
                <Text style={estilos.estrella}>⭐</Text>
                <Text style={estilos.textoCalificacion}>{item.calificacion}</Text>
              </View>
            )}
          </View>
          
          <Text style={estilos.tituloResultado}>{item.titulo}</Text>
          
          {item.subtitulo && (
            <Text style={estilos.subtituloResultado}>{item.subtitulo}</Text>
          )}
          
          <View style={estilos.detallesResultado}>
            {item.distancia && (
              <View style={estilos.distanciaContainer}>
                <Text style={estilos.iconoUbicacion}>📍</Text>
                <Text style={estilos.textoDistancia}>{item.distancia}</Text>
              </View>
            )}
            
            {item.precio && (
              <Text style={estilos.precioResultado}>{item.precio}</Text>
            )}
          </View>
        </View>
        
        <Text style={estilos.iconoFlecha}>→</Text>
      </View>
    </TouchableOpacity>
  );

  const renderizarSinResultados = (mensaje = 'No encontramos resultados') => (
    <View style={estilos.contenedorVacio}>
      <Text style={estilos.iconoVacio}>🔍</Text>
      <Text style={estilos.tituloVacio}>{mensaje}</Text>
      <Text style={estilos.mensajeVacio}>
        Intenta con otros términos o ajusta los filtros
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={estilos.contenedor}>
      {/* Header con búsqueda */}
      <View style={estilos.headerBusqueda}>
        <TouchableOpacity onPress={() => navegacion.goBack()}>
          <Text style={estilos.iconoAtras}>←</Text>
        </TouchableOpacity>
        
        <View style={estilos.barraBusquedaExpandida}>
          <Text style={estilos.iconoBusqueda}>🔍</Text>
          <TextInput
            style={estilos.inputBusqueda}
            placeholder="Busca comida, restaurantes o lugares..."
            placeholderTextColor="#8B7355"
            value={controladorBusqueda}
            onChangeText={(valor) => {
              setControladorBusqueda(valor);
              setConsultaBusqueda(valor);
              realizarBusqueda(valor);
            }}
            onSubmitEditing={() => {
              if (consultaBusqueda.trim()) {
                agregarAlHistorial(consultaBusqueda);
                realizarBusqueda();
              }
            }}
            autoFocus={!consultaInicial}
          />
          {consultaBusqueda && (
            <TouchableOpacity 
              onPress={() => {
                setControladorBusqueda('');
                setConsultaBusqueda('');
                setResultadosBusqueda([]);
              }}
            >
              <Text style={estilos.iconoLimpiar}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity style={estilos.botonFiltros}>
          <Text style={estilos.iconoFiltros}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {consultaBusqueda ? (
        <View style={estilos.contenidoResultados}>
          {/* Tabs de resultados */}
          <View style={estilos.contenedorTabs}>
            <TouchableOpacity 
              style={[estilos.tab, pestanaActiva === 0 && estilos.tabActiva]}
              onPress={() => setPestanaActiva(0)}
            >
              <Text style={[estilos.textoTab, pestanaActiva === 0 && estilos.textoTabActivo]}>
                Todo ({resultadosBusqueda.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[estilos.tab, pestanaActiva === 1 && estilos.tabActiva]}
              onPress={() => setPestanaActiva(1)}
            >
              <Text style={[estilos.textoTab, pestanaActiva === 1 && estilos.textoTabActivo]}>
                Restaurantes ({obtenerResultadosRestaurantes().length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[estilos.tab, pestanaActiva === 2 && estilos.tabActiva]}
              onPress={() => setPestanaActiva(2)}
            >
              <Text style={[estilos.textoTab, pestanaActiva === 2 && estilos.textoTabActivo]}>
                Platos ({obtenerResultadosPlatos().length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Contenido de resultados */}
          <View style={estilos.contenidoTab}>
            {pestanaActiva === 0 && (
              resultadosBusqueda.length > 0 ? (
                <FlatList
                  data={resultadosBusqueda}
                  renderItem={renderizarResultado}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={estilos.listaResultados}
                />
              ) : renderizarSinResultados()
            )}
            
            {pestanaActiva === 1 && (
              obtenerResultadosRestaurantes().length > 0 ? (
                <FlatList
                  data={obtenerResultadosRestaurantes()}
                  renderItem={renderizarResultado}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={estilos.listaResultados}
                />
              ) : renderizarSinResultados('No se encontraron restaurantes')
            )}
            
            {pestanaActiva === 2 && (
              obtenerResultadosPlatos().length > 0 ? (
                <FlatList
                  data={obtenerResultadosPlatos()}
                  renderItem={renderizarResultado}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={estilos.listaResultados}
                />
              ) : renderizarSinResultados('No se encontraron platos')
            )}
          </View>
        </View>
      ) : (
        <ScrollView style={estilos.contenidoVacio} showsVerticalScrollIndicator={false}>
          {/* Historial de búsquedas */}
          {historialBusqueda.length > 0 && (
            <View style={estilos.seccion}>
              <Text style={estilos.tituloSeccion}>Búsquedas recientes</Text>
              <FlatList
                data={historialBusqueda}
                renderItem={renderizarItemHistorial}
                keyExtractor={(item, index) => index.toString()}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* Tendencias */}
          <View style={estilos.seccion}>
            <Text style={estilos.tituloSeccion}>Tendencias en tu zona</Text>
            <View style={estilos.gridTendencias}>
              {busquedasTendencia.map(renderizarChipTendencia)}
            </View>
          </View>

          {/* Sugerencias rápidas */}
          <View style={estilos.seccion}>
            <Text style={estilos.tituloSeccion}>Sugerencias rápidas</Text>
            <FlatList
              data={sugerenciasRapidas}
              renderItem={renderizarSugerenciaRapida}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
            />
          </View>

          {/* Categorías populares */}
          <View style={estilos.seccion}>
            <Text style={estilos.tituloSeccion}>Categorías populares</Text>
            <View style={estilos.gridCategorias}>
              {[
                { nombre: 'Legumbres', icono: '🫘', color: '#8B4513' },
                { nombre: 'Sopas', icono: '🍲', color: '#3498DB' },
                { nombre: 'Arroces', icono: '🍚', color: '#F39C12' },
                { nombre: 'Vegano', icono: '🥗', color: '#27AE60' },
              ].map((categoria, indice) => (
                <TouchableOpacity 
                  key={indice}
                  style={estilos.categoriaItem}
                  onPress={() => seleccionarSugerencia(categoria.nombre)}
                >
                  <View style={[estilos.iconoCategoria, { backgroundColor: categoria.color + '20' }]}>
                    <Text style={estilos.emojiCategoria}>{categoria.icono}</Text>
                  </View>
                  <Text style={estilos.nombreCategoria}>{categoria.nombre}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F8F6F0',
  },
  headerBusqueda: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  iconoAtras: {
    fontSize: 24,
    color: '#2C3E50',
    marginRight: 16,
  },
  barraBusquedaExpandida: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F6F0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 115, 85, 0.3)',
    marginRight: 12,
  },
  iconoBusqueda: {
    fontSize: 16,
    marginRight: 12,
  },
  inputBusqueda: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
  },
  iconoLimpiar: {
    fontSize: 16,
    color: '#8B7355',
    marginLeft: 8,
  },
  botonFiltros: {
    width: 48,
    height: 48,
    backgroundColor: '#F8F6F0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 115, 85, 0.3)',
  },
  iconoFiltros: {
    fontSize: 18,
  },
  contenidoResultados: {
    flex: 1,
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
    fontSize: 14,
    color: '#8B7355',
  },
  textoTabActivo: {
    color: '#E67E22',
    fontWeight: '600',
  },
  contenidoTab: {
    flex: 1,
  },
  listaResultados: {
    padding: 16,
  },
  tarjetaResultado: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  contenidoResultado: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  imagenResultado: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(230, 126, 34, 0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emojiResultado: {
    fontSize: 24,
  },
  infoResultado: {
    flex: 1,
  },
  headerResultado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tipoChip: {
    backgroundColor: 'rgba(230, 126, 34, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  textoTipoChip: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#E67E22',
  },
  calificacionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estrella: {
    fontSize: 12,
    marginRight: 2,
  },
  textoCalificacion: {
    fontSize: 12,
    color: '#8B7355',
  },
  tituloResultado: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  subtituloResultado: {
    fontSize: 14,
    color: '#8B7355',
    marginBottom: 4,
  },
  detallesResultado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distanciaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconoUbicacion: {
    fontSize: 10,
    marginRight: 2,
  },
  textoDistancia: {
    fontSize: 12,
    color: '#8B7355',
  },
  precioResultado: {
    fontSize: 14,
    color: '#E67E22',
    fontWeight: 'bold',
  },
  iconoFlecha: {
    fontSize: 16,
    color: '#8B7355',
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
  contenidoVacio: {
    flex: 1,
  },
  seccion: {
    padding: 16,
  },
  tituloSeccion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  itemHistorial: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconoHistorial: {
    fontSize: 16,
    marginRight: 12,
  },
  textoHistorial: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
  },
  gridTendencias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipTendencia: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 115, 85, 0.3)',
  },
  iconoTendencia: {
    fontSize: 12,
    marginRight: 4,
  },
  textoChip: {
    fontSize: 12,
    color: '#2C3E50',
  },
  itemSugerencia: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconoSugerencia: {
    fontSize: 20,
    marginRight: 12,
  },
  infoSugerencia: {
    flex: 1,
  },
  textoSugerencia: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 2,
  },
  tipoSugerencia: {
    fontSize: 12,
    color: '#8B7355',
    textTransform: 'capitalize',
  },
  gridCategorias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 115, 85, 0.3)',
    width: '48%',
  },
  iconoCategoria: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  emojiCategoria: {
    fontSize: 20,
  },
  nombreCategoria: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
    flex: 1,
  },
});
