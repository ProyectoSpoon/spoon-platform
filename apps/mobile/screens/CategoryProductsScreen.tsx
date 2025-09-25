import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
// Migrado a Design System
import { SpoonPage, SpoonText, SpoonFoodCard, SpoonChip } from '../src/design-system/components';
import { getOverlay } from '../src/design-system/utils/overlays';
import { useColors, useSpacing, useTypography, useRadii, useShadows } from '../src/design-system/context/ThemeContext';

// Extender tipos de navegación para incluir CategoryProducts
// RootStack types omitted (no direct usage in this refactor)

type CategoryProductsScreenRouteProp = {
  params: { categoria: string };
};

type CategoryProductsScreenNavigationProp = {
  goBack: () => void;
  navigate: (screen: string, params?: any) => void;
};

interface Props {
  route: CategoryProductsScreenRouteProp;
  navigation: CategoryProductsScreenNavigationProp;
}

interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  restaurante: string;
  calificacion: number;
  tiempoEntrega: string;
  disponible: boolean;
  categoria: string;
  ingredientes: string[];
}

interface FilterOption {
  id: string;
  label: string;
  active: boolean;
}

const CategoryProductsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { categoria } = route.params;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('popularity'); // popularity, price, rating, delivery
  const [filters, setFilters] = useState<FilterOption[]>([
    { id: 'available', label: 'Disponible', active: true },
    { id: 'delivery', label: 'Entrega rápida', active: false },
    { id: 'topRated', label: 'Mejor calificados', active: false },
    { id: 'budget', label: 'Económicos', active: false }
  ]);

  useEffect(() => {
    loadProductsByCategory();
  }, [categoria]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [products, filters, sortBy]);

  const loadProductsByCategory = () => {
    setLoading(true);
    
    // Simulamos carga de datos - aquí iría la llamada a la API
    setTimeout(() => {
      const mockProducts = generateMockProductsByCategory(categoria);
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  };

  const generateMockProductsByCategory = (categoria: string): Product[] => {
    const baseProducts = {
      'Frijoles': [
        {
          id: '1',
          nombre: 'Frijolada Antioqueña',
          descripcion: 'Frijoles rojos con chorizo, chicharrón y arepa',
          precio: 18000,
          imagen: '🫘',
          restaurante: 'Casa Antioquia',
          calificacion: 4.7,
          tiempoEntrega: '25-35 min',
          disponible: true,
          categoria: 'Frijoles',
          ingredientes: ['frijoles rojos', 'chorizo', 'chicharrón', 'arepa']
        },
        {
          id: '2',
          nombre: 'Frijoles con Garra',
          descripcion: 'Frijoles negros con costilla de cerdo y plátano',
          precio: 22000,
          imagen: '🫘',
          restaurante: 'El Fogón Costeño',
          calificacion: 4.5,
          tiempoEntrega: '30-40 min',
          disponible: true,
          categoria: 'Frijoles',
          ingredientes: ['frijoles negros', 'costilla', 'plátano maduro']
        },
        {
          id: '3',
          nombre: 'Frijoles Blancos Gratinados',
          descripcion: 'Frijoles blancos con queso derretido y hierbas',
          precio: 16000,
          imagen: '🫘',
          restaurante: 'Verde & Natural',
          calificacion: 4.3,
          tiempoEntrega: '20-30 min',
          disponible: false,
          categoria: 'Frijoles',
          ingredientes: ['frijoles blancos', 'queso', 'hierbas frescas']
        }
      ],
      'Lentejas': [
        {
          id: '4',
          nombre: 'Lentejas al Curry',
          descripcion: 'Lentejas rojas con especias y leche de coco',
          precio: 15000,
          imagen: '🟤',
          restaurante: 'Spice Garden',
          calificacion: 4.6,
          tiempoEntrega: '20-25 min',
          disponible: true,
          categoria: 'Lentejas',
          ingredientes: ['lentejas rojas', 'curry', 'leche de coco']
        },
        {
          id: '5',
          nombre: 'Lentejas con Chorizo',
          descripcion: 'Lentejas pardinas con chorizo español',
          precio: 19000,
          imagen: '🟤',
          restaurante: 'Ibérico',
          calificacion: 4.4,
          tiempoEntrega: '25-35 min',
          disponible: true,
          categoria: 'Lentejas',
          ingredientes: ['lentejas pardinas', 'chorizo español', 'pimentón']
        }
      ],
      'Garbanzos': [
        {
          id: '6',
          nombre: 'Hummus Tradicional',
          descripcion: 'Puré de garbanzos con tahini y aceite de oliva',
          precio: 12000,
          imagen: '🟡',
          restaurante: 'Mediterráneo',
          calificacion: 4.8,
          tiempoEntrega: '15-20 min',
          disponible: true,
          categoria: 'Garbanzos',
          ingredientes: ['garbanzos', 'tahini', 'aceite oliva', 'limón']
        },
        {
          id: '7',
          nombre: 'Garbanzos al Curry',
          descripcion: 'Garbanzos en salsa de curry con verduras',
          precio: 17000,
          imagen: '🟡',
          restaurante: 'Bombay Express',
          calificacion: 4.5,
          tiempoEntrega: '25-30 min',
          disponible: true,
          categoria: 'Garbanzos',
          ingredientes: ['garbanzos', 'curry', 'cebolla', 'tomate']
        }
      ]
    };

    // Productos por defecto si la categoría no tiene datos específicos
    const defaultProducts = [
      {
        id: `${categoria}-1`,
        nombre: `${categoria} Tradicional`,
        descripcion: `Delicioso plato de ${categoria.toLowerCase()} preparado tradicionalmente`,
        precio: 15000,
        imagen: '🍽️',
        restaurante: 'Casa Tradicional',
        calificacion: 4.5,
        tiempoEntrega: '25-35 min',
        disponible: true,
        categoria: categoria,
        ingredientes: [categoria.toLowerCase()]
      }
    ];

    return baseProducts[categoria as keyof typeof baseProducts] || defaultProducts;
  };

  const applyFiltersAndSort = () => {
    let filtered = [...products];

    // Aplicar filtros
    filters.forEach(filter => {
      if (!filter.active) return;

      switch (filter.id) {
        case 'available':
          filtered = filtered.filter(p => p.disponible);
          break;
        case 'delivery':
          filtered = filtered.filter(p => parseInt(p.tiempoEntrega) <= 30);
          break;
        case 'topRated':
          filtered = filtered.filter(p => p.calificacion >= 4.5);
          break;
        case 'budget':
          filtered = filtered.filter(p => p.precio <= 18000);
          break;
      }
    });

    // Aplicar ordenamiento
    switch (sortBy) {
      case 'price':
        filtered.sort((a, b) => a.precio - b.precio);
        break;
      case 'rating':
        filtered.sort((a, b) => b.calificacion - a.calificacion);
        break;
      case 'delivery':
        filtered.sort((a, b) => parseInt(a.tiempoEntrega) - parseInt(b.tiempoEntrega));
        break;
      default: // popularity
        filtered.sort((a, b) => b.calificacion * Math.random() - a.calificacion * Math.random());
    }

    setFilteredProducts(filtered);
  };

  const toggleFilter = (filterId: string) => {
    setFilters(prev => prev.map(filter => 
      filter.id === filterId 
        ? { ...filter, active: !filter.active }
        : filter
    ));
  };

  const onProductPress = (product: Product) => {
    console.log(`Producto seleccionado: ${product.nombre}`);
    // Aquí navegarías a ProductDetail
    Alert.alert('Producto', `${product.nombre}\n${product.descripcion}\n$${product.precio.toLocaleString()}`);
  };


  // (legacy renderFilterChip/renderSortOption removidos – usando DS chips)

  // THEMED TOKENS
  const colors = useColors();
  const spacing = useSpacing();
  const typo = useTypography();
  const radii = useRadii();
  const shadows = useShadows();
  const overlayStrong = getOverlay('strong', colors);
  const overlayMedium = getOverlay('medium', colors);

  const headerStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
  borderBottomColor: colors.outline,
  };
  const headerIcon = { fontSize: 24, color: colors.primary };
  const headerTitle = { ...typo.titleMedium, fontWeight: '700', color: colors.textPrimary };

  const chipsContainer = {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  borderBottomColor: colors.outline,
  };
  const sortBar = {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  };
  const sortLabel = { ...typo.labelSmall, color: colors.textSecondary, marginRight: spacing.md };
  const resultsBar = { backgroundColor: colors.surface, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm };
  const resultsText = { ...typo.labelSmall, color: colors.textSecondary };

  const emptyContainer = { flex: 1, justifyContent: 'center' as const, alignItems: 'center' as const, padding: spacing.xl };
  const emptyIcon = { fontSize: 64, marginBottom: spacing.lg };
  const emptyTitle = { ...typo.titleLarge, fontWeight: '700', color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm };
  const emptyMsg = { ...typo.bodyMedium, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg };
  const resetBtn = { backgroundColor: colors.primary, paddingHorizontal: spacing.lg + 4, paddingVertical: spacing.sm, borderRadius: 28 };
  const resetTxt = { ...typo.labelSmall, color: colors.white, fontWeight: '600' };

  const renderProductCardDS = ({ item: p }: { item: Product }) => (
    <View style={{ marginBottom: spacing.lg }}>
      <SpoonFoodCard
        name={p.nombre}
        restaurant={p.restaurante}
        price={`$${p.precio.toLocaleString()}`}
        rating={p.calificacion}
        imageUrl={''}
        tags={[p.tiempoEntrega]}
        onPress={() => onProductPress(p)}
        onAddToCart={p.disponible ? () => Alert.alert('Añadido', p.nombre) : undefined}
        testID={`product-${p.id}`}
      />
      {!p.disponible && (
        <View style={{ position:'absolute', top:0, left:0, right:0, bottom:0, backgroundColor:overlayStrong, borderRadius:12, justifyContent:'center', alignItems:'center' }}>
          <SpoonText variant="labelSmall" weight="bold" style={{ color: colors.white, backgroundColor:overlayMedium, paddingHorizontal:12, paddingVertical:6, borderRadius:20 }}>No disponible</SpoonText>
        </View>
      )}
    </View>
  );

  const renderFilterChipDS = (f: FilterOption) => (
    <View key={f.id} style={{ marginRight: spacing.sm }}>
      <SpoonChip.filter
        label={f.label}
        isSelected={f.active}
        onPress={() => toggleFilter(f.id)}
        testID={`filter-${f.id}`}
      />
    </View>
  );

  const renderSortChipDS = (key: string, label: string) => (
    <View key={key} style={{ marginRight: spacing.sm }}>
      <SpoonChip.choice
        label={label}
        isSelected={sortBy === key}
        onPress={() => setSortBy(key)}
        testID={`sort-${key}`}
      />
    </View>
  );

  if (loading) {
    return (
      <SpoonPage padded>
        <View style={headerStyle}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={headerIcon}>←</Text></TouchableOpacity>
          <Text style={headerTitle}>{categoria}</Text>
          <View style={{ width:24 }} />
        </View>
        <View style={{ flex:1, justifyContent:'center', alignItems:'center', padding: spacing.xl }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <SpoonText variant="bodyMedium" style={{ color: colors.textSecondary, marginTop: spacing.md }}>Cargando productos de {categoria.toLowerCase()}...</SpoonText>
        </View>
      </SpoonPage>
    );
  }

  return (
  // Eliminado scroll del SpoonPage para evitar FlatList dentro de ScrollView (warning VirtualizedLists)
  <SpoonPage scroll={false} padded>
      {/* Header */}
      <View style={headerStyle}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={headerIcon}>←</Text></TouchableOpacity>
        <Text style={headerTitle}>{categoria}</Text>
        <TouchableOpacity><Text style={{ fontSize:22 }}>🔍</Text></TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={chipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg }}>
          {filters.map(renderFilterChipDS)}
        </ScrollView>
      </View>

      {/* Sort */}
      <View style={sortBar}>
        <Text style={sortLabel}>Ordenar por:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection:'row' }}>
            {renderSortChipDS('popularity','Popularidad')}
            {renderSortChipDS('price','Precio')}
            {renderSortChipDS('rating','Calificación')}
            {renderSortChipDS('delivery','Tiempo')}
          </View>
        </ScrollView>
      </View>

      {/* Results count */}
      <View style={resultsBar}>
        <Text style={resultsText}>{filteredProducts.length} plato{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* List */}
      <View style={{ flex:1 }}>
        {filteredProducts.length > 0 ? (
          <FlatList
            style={{ flex:1 }}
            data={filteredProducts}
            renderItem={renderProductCardDS}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={emptyContainer}>
            <Text style={emptyIcon}>🍽️</Text>
              <Text style={emptyTitle}>No hay productos disponibles</Text>
              <Text style={emptyMsg}>No encontramos platos de {categoria.toLowerCase()} que coincidan con tus filtros.</Text>
              <TouchableOpacity style={resetBtn} onPress={() => setFilters(prev => prev.map(f => ({ ...f, active: f.id === 'available' })))}>
                <Text style={resetTxt}>Limpiar filtros</Text>
              </TouchableOpacity>
          </View>
        )}
      </View>
    </SpoonPage>
  );
};

export default CategoryProductsScreen;
