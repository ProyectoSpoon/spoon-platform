import React from 'react';
import { Modal, View, TouchableOpacity, FlatList, Text, ViewStyle } from 'react-native';
import { useColors, useRadii, useSpacing, useTypography, useShadows } from '../../context/ThemeContext';

export interface SpoonIndexItem {
  id: string;
  label: string;
  description?: string;
}

export interface SpoonIndexModalProps {
  visible: boolean;
  items: SpoonIndexItem[];
  onSelect: (id: string) => void;
  onClose: () => void;
  title?: string;
  testID?: string;
  style?: ViewStyle;
  searchable?: boolean; // futuro
}

export const SpoonIndexModal: React.FC<SpoonIndexModalProps> = ({
  visible,
  items,
  onSelect,
  onClose,
  title = 'Índice',
  testID = 'spoon-index-modal',
  style,
}) => {
  const colors = useColors();
  const radii = useRadii();
  const spacing = useSpacing();
  const typo = useTypography();
  const shadows = useShadows();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex:1, backgroundColor: colors.overlay, justifyContent:'flex-end' }}>
        <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, padding: spacing.lg, maxHeight: '70%', ...(style as object) }} testID={testID}>
          <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom: spacing.md }}>
            <Text style={{ ...typo.titleSmall, fontWeight:'700', color: colors.textPrimary }}>{title}</Text>
            <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar índice">
              <Text style={{ fontSize:18, color: colors.textSecondary }}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={items}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight }}
                onPress={() => { onClose(); setTimeout(() => onSelect(item.id), 150); }}
              >
                <Text style={{ ...typo.bodyMedium, color: colors.textPrimary }}>{item.label}</Text>
                {item.description && (
                  <Text style={{ ...typo.bodySmall, color: colors.textSecondary, marginTop: 2 }}>{item.description}</Text>
                )}
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={{ marginTop: spacing.md, backgroundColor: colors.info, padding: spacing.md, borderRadius: radii.md, alignItems:'center' }} onPress={onClose}>
            <Text style={{ ...typo.labelSmall, fontWeight:'600', color: colors.textOnPrimary }}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SpoonIndexModal;
