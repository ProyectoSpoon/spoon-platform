import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, SafeAreaView, FlatList, Alert, } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  SpoonPage, 
  SpoonSearchHeader, 
  SpoonSearchTabs, 
  SpoonSearchResultItem, 
  SpoonText,
  SpoonSearchHistoryItem,
  SpoonSearchSuggestionItem,
  SpoonSearchTrendChip,
  SpoonCategoryGrid,
  SpoonSearchEmptyState,
} from '../src/design-system/components';
import { useColors } from '../src/design-system';

export default function SearchScreen() {
  const colors = useColors();
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

  // Datos para categorías populares (migrado a DS)
  const categoriasPopulares = [
    { nombre: 'Legumbres', icono: '🫘', color: colors.secondary },
    { nombre: 'Sopas', icono: '🍲', color: colors.info },
    { nombre: 'Arroces', icono: '🍚', color: colors.warning },
    { nombre: 'Vegano', icono: '🥗', color: colors.success },
  ];

  const tabs = [
    { key: 'all', label: 'Todo', count: resultadosBusqueda.length },
    { key: 'rest', label: 'Restaurantes', count: obtenerResultadosRestaurantes().length },
    { key: 'dish', label: 'Platos', count: obtenerResultadosPlatos().length },
  ];

  const mapTabKeyToIndex = (key: string) => key === 'all' ? 0 : key === 'rest' ? 1 : 2;
  const mapIndexToKey = (i: number) => i === 0 ? 'all' : i === 1 ? 'rest' : 'dish';

  // Reemplazar evento de pestañas
  const setPestanaActivaKey = (key: string) => setPestanaActiva(mapTabKeyToIndex(key));

  const renderizarResultado = ({ item }) => (
    <SpoonSearchResultItem
      id={item.id}
      title={item.titulo}
      subtitle={item.subtitulo}
      type={item.tipo}
      rating={item.calificacion}
      distance={item.distancia}
      price={item.precio}
      icon={item.imagen}
      onPress={() => alPresionarResultado(item)}
    />
  );

  const renderizarSinResultados = (mensaje = 'No encontramos resultados') => (
    <SpoonSearchEmptyState 
      title={mensaje}
      message="Intenta con otros términos o ajusta los filtros"
    />
  );

  return (
    <SpoonPage scroll={false} padded={false}>
      <SpoonSearchHeader
        value={controladorBusqueda}
        onChange={(valor) => {
          setControladorBusqueda(valor);
          setConsultaBusqueda(valor);
          realizarBusqueda(valor);
        }}
        onSubmit={() => {
          if (consultaBusqueda.trim()) {
            agregarAlHistorial(consultaBusqueda);
            realizarBusqueda();
          }
        }}
        onBack={() => navegacion.goBack()}
        onClear={() => { setControladorBusqueda(''); setConsultaBusqueda(''); setResultadosBusqueda([]); }}
        onFilters={() => Alert.alert('Filtros', 'Funcionalidad de filtros en desarrollo')}
        placeholder="Busca comida, restaurantes o lugares..."
        autoFocus={!consultaInicial}
      />

      {consultaBusqueda ? (
        <View style={{ flex: 1, padding: 16 }}>
          <SpoonSearchTabs
            tabs={tabs}
            activeKey={mapIndexToKey(pestanaActiva)}
            onChange={setPestanaActivaKey}
          />
          <View style={{ flex: 1 }}>
            {pestanaActiva === 0 && (
              resultadosBusqueda.length > 0 ? (
                <FlatList
                  data={resultadosBusqueda}
                  renderItem={renderizarResultado}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 80 }}
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
                  contentContainerStyle={{ paddingBottom: 80 }}
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
                  contentContainerStyle={{ paddingBottom: 80 }}
                />
              ) : renderizarSinResultados('No se encontraron platos')
            )}
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
          {historialBusqueda.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <SpoonText variant="titleSmall" weight="semibold" style={{ marginBottom: 8 }}>Búsquedas recientes</SpoonText>
              {historialBusqueda.map((h, i) => (
                <SpoonSearchHistoryItem key={i} text={h} onPress={() => seleccionarSugerencia(h)} />
              ))}
            </View>
          )}
          <View style={{ marginBottom: 24 }}>
            <SpoonText variant="titleSmall" weight="semibold" style={{ marginBottom: 8 }}>Tendencias en tu zona</SpoonText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {busquedasTendencia.map((t, i) => (
                <SpoonSearchTrendChip key={i} text={t} onPress={() => seleccionarSugerencia(t)} />
              ))}
            </View>
          </View>
          <View style={{ marginBottom: 24 }}>
            <SpoonText variant="titleSmall" weight="semibold" style={{ marginBottom: 8 }}>Sugerencias rápidas</SpoonText>
            {sugerenciasRapidas.map((s, i) => (
              <SpoonSearchSuggestionItem key={i} icon={s.icono} text={s.texto} type={s.tipo} onPress={() => seleccionarSugerencia(s.texto)} />
            ))}
          </View>
          <View style={{ marginBottom: 24 }}>
            <SpoonText variant="titleSmall" weight="semibold" style={{ marginBottom: 8 }}>Categorías populares</SpoonText>
            <SpoonCategoryGrid categories={categoriasPopulares} onSelect={seleccionarSugerencia} />
          </View>
        </ScrollView>
      )}
    </SpoonPage>
  );
}

