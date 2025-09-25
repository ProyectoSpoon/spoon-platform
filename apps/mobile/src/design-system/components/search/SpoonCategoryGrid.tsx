import React from 'react';
import { View } from 'react-native';
import { SpoonCategoryCard } from '../cards/SpoonCategoryCard';
import { useSpacing } from '../../context/ThemeContext';

export interface CategoryItem { nombre: string; icono: string; color?: string; }

export interface SpoonCategoryGridProps {
  categories: CategoryItem[];
  onSelect?: (nombre: string) => void;
  testID?: string;
}

export const SpoonCategoryGrid: React.FC<SpoonCategoryGridProps> = ({ categories, onSelect, testID='category-grid' }) => {
  const spacing = useSpacing();
  return (
    <View style={{ flexDirection:'row', flexWrap:'wrap' }} testID={testID}>
      {categories.map((c, idx) => (
        <View key={idx} style={{ marginRight: spacing.md, marginBottom: spacing.lg }}>
          <SpoonCategoryCard label={c.nombre} icon={c.icono} onPress={() => onSelect?.(c.nombre)} />
        </View>
      ))}
    </View>
  );
};

export default SpoonCategoryGrid;
