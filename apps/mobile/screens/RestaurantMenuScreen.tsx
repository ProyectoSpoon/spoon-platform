import React, { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SpoonPage, SpoonText, SpoonChip } from '../src/design-system/components';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useColors, useSpacing, useTypography } from '../src/design-system';
import { getTodayMenuCombinationsExpandedDirect, type WA_TodayMenuCombinationExpanded } from '../src/lib/webadminSupabase';
import SimpleMenuCard from './SimpleMenuCard';

interface MenuItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  category?: string; // Podríamos derivar en el futuro (ej: primer palabra)
  available?: boolean;
  imageUrl?: string;
}

export default function RestaurantMenuScreen() {
  const route: any = useRoute();
  const navigation: any = useNavigation();
  const { restaurantId, restaurantName } = route.params || {};
  const colors = useColors();
  const spacing = useSpacing();
  const type = useTypography();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    navigation.setOptions?.({ title: restaurantName ? `Menú · ${restaurantName}` : 'Menú' });
  }, [restaurantName, navigation]);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    setError(null);
    try {
  const data = await getTodayMenuCombinationsExpandedDirect({ restaurantId });
  if (__DEV__) console.log('[RestaurantMenuScreen] combos recibidos', data.length, data);
      // Map combos -> MenuItem
      const mapped: MenuItem[] = data.map(c => ({
        id: c.id || c.combination_name,
        name: c.combination_name,
        description: buildDescription(c),
        price: c.combination_price || 0,
        available: c.is_available,
        category: deriveCategory(c.combination_name),
        imageUrl: (c as any).image_url || (c as any).photo_url || (c as any).thumbnail || ''
      }));
      setItems(mapped);
      if (mapped.length === 0 && restaurantId) {
        if (__DEV__) console.log('[RestaurantMenuScreen] vacío con restaurantId, probando sin filtro');
        try {
          const dataAll = await getTodayMenuCombinationsExpandedDirect({});
          const mappedAll: MenuItem[] = dataAll.map(c => ({
            id: c.id || c.combination_name,
            name: c.combination_name,
            description: buildDescription(c),
            price: c.combination_price || 0,
            available: c.is_available,
            category: deriveCategory(c.combination_name),
            imageUrl: (c as any).image_url || (c as any).photo_url || (c as any).thumbnail || ''
          }));
          if (mappedAll.length) setItems(mappedAll);
        } catch {}
      }
    } catch (e:any) {
      setError(e.message || 'Error cargando menú');
    } finally {
      if (!opts?.silent) setLoading(false);
      setRefreshing(false);
    }
  }, [restaurantId]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load({ silent: true });
  };

  const categories = Array.from(new Set(items.map(i => i.category).filter(Boolean))) as string[];
  const filtered = categoryFilter ? items.filter(i => i.category === categoryFilter) : items;

  function deriveCategory(name: string | undefined): string | undefined {
    if (!name) return undefined;
    // Tomar primera palabra significativa (sin preposiciones) o la parte antes de " con "
    const lower = name.toLowerCase();
    const base = lower.split(' con ')[0];
    return base.replace(/(^\s+|\s+$)/g,'').replace(/\b(de|del|la|el|los|las|con|y|al)\b/gi,'').trim().replace(/\s{2,}/g,' ');
  }

  function buildDescription(c: WA_TodayMenuCombinationExpanded): string {
    // Fallback heurístico: si faltan principio/proteína intentar derivar del combination_name 'X con Y'
    let principio = c.principio;
    let proteina = c.proteina;
    if ((!principio || !proteina) && c.combination_name?.includes(' con ')) {
      const [left, right] = c.combination_name.split(' con ');
      if (!principio) principio = left?.trim();
      if (!proteina) proteina = right?.trim();
    }
    const entrada = c.entrada || '-';
    const bebida = c.bebida || '-';
    const acompanamientos = (c.acompanamientos && c.acompanamientos.length)
      ? c.acompanamientos.join(', ')
      : '-';
    
    // Debug: ver qué valores estamos obteniendo
    if (__DEV__) {
      console.log('[buildDescription] Procesando:', {
        entrada: c.entrada,
        principio: c.principio,
        proteina: c.proteina,
        acompanamientos: c.acompanamientos,
        bebida: c.bebida,
        combination_name: c.combination_name
      });
      console.log('[buildDescription] Valores finales:', {
        entrada,
        principio: principio || '-',
        proteina: proteina || '-',
        acompanamientos,
        bebida
      });
    }
    
    // Asegurar las 5 categorías siempre presentes (una por línea)
    const description = [
      `Entrada: ${entrada}`,
      `Principio: ${principio || '-'}`,
      `Proteína: ${proteina || '-'}`,
      `Acompañamientos: ${acompanamientos}`,
      `Bebida: ${bebida}`
    ].join('\n');
    
    if (__DEV__) {
      console.log('[buildDescription] Descripción final:', description);
    }
    
    return description;
  }

  // Configuración UX: ocultar imágenes hasta tener assets reales
  // Mostrar imagen solo cuando exista URL. Si no hay, se verá solo contenido textual.
  const hideImagesGlobal = false; // permitir imágenes si existen

  const renderItem = ({ item }: { item: MenuItem }) => {
    if (__DEV__) {
      console.log('[RestaurantMenuScreen] Renderizando item:', {
        name: item.name,
        description: item.description?.substring(0, 50) + '...',
        price: item.price,
        category: item.category
      });
    }
    
    return (
      <SimpleMenuCard
        name={item.name}
        category={(item.category && !item.name.toLowerCase().includes(item.category.toLowerCase())) ? item.category : 'Combinación'}
        price={`$${item.price.toLocaleString('es-CO')}`}
        description={item.description || ''}
        onPress={() => Alert.alert(item.name, item.description || '')}
      />
    );
  };

  if (loading) {
    return (
      <SpoonPage padded>
        <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
          <ActivityIndicator color={colors.primary} size="large" />
          <SpoonText variant="labelSmall" style={{ marginTop:spacing.md, color:colors.textSecondary }}>Cargando menú...</SpoonText>
        </View>
      </SpoonPage>
    );
  }

  return (
    <SpoonPage scroll={false} padded>
      {error && (
        <View style={{ backgroundColor:'#fee', padding:12, borderRadius:8, marginBottom:spacing.md }}>
          <SpoonText variant="labelSmall" style={{ color:colors.error }}>{error}</SpoonText>
          <TouchableOpacity onPress={() => load()} style={{ marginTop:6 }}>
            <SpoonText variant="labelSmall" weight="bold" style={{ color:colors.primaryDark }}>Reintentar</SpoonText>
          </TouchableOpacity>
        </View>
      )}
      {/* Categorías */}
      {categories.length > 0 && (
        <View style={{ flexDirection:'row', flexWrap:'wrap', marginBottom:spacing.lg }}>
          <View style={{ marginRight: spacing.sm, marginBottom: spacing.sm }}>
            <SpoonChip.choice
              label={'Todos'}
              isSelected={!categoryFilter}
              onPress={() => setCategoryFilter(null)}
            />
          </View>
          {categories.map(cat => (
            <View key={cat} style={{ marginRight: spacing.sm, marginBottom: spacing.sm }}>
              <SpoonChip.choice
                label={cat}
                isSelected={categoryFilter === cat}
                onPress={() => setCategoryFilter(cat)}
              />
            </View>
          ))}
        </View>
      )}
    {filtered.length === 0 && !loading && (
        <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
          <SpoonText variant="titleSmall" weight="bold" style={{ color:colors.textSecondary, marginBottom:8 }}>Sin platos</SpoonText>
          <SpoonText variant="labelSmall" style={{ color:colors.textSecondary }}>No hay ítems en esta categoría.</SpoonText>
      <SpoonText variant="labelSmall" style={{ color:colors.textDisabled, marginTop:6 }}>Total combos cargados: {items.length}</SpoonText>
        </View>
      )}
      {filtered.length > 0 && (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListHeaderComponent={categories.length === 0 ? null : <View style={{ height:4 }} />}
        />
      )}
    </SpoonPage>
  );
}