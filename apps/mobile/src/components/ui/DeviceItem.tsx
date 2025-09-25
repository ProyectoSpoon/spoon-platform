import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, } from 'react-native'

import Icon from '../Icon'
import { useColors, SpoonColors } from '../../design-system'

type Props = {
  id: string
  name: string
  type?: 'mobile' | 'desktop'
  location?: string
  lastAccess?: string
  current?: boolean
  onRemove?: (id: string, name: string) => void
  onPress?: () => void
}

export default function DeviceItem({ id, name, type = 'mobile', location, lastAccess, current, onRemove, onPress }: Props) {
  const colors = useColors()
  return (
    <View style={[styles.container, { paddingHorizontal: 20, backgroundColor: colors.surface }]}> 
      <TouchableOpacity style={styles.row} onPress={onPress}>
  <View style={[styles.iconWrap, { backgroundColor: SpoonColors.withOpacity(colors.primary, 0.08) }]}>
          <Text style={styles.iconText}>{type === 'mobile' ? 'ðŸ“±' : 'ðŸ’»'}</Text>
        </View>
        <View style={styles.info}>
          <View style={styles.header}>
            <Text style={styles.name}>{name}</Text>
            {current && <View style={[styles.badge, { backgroundColor: colors.success }]}><Text style={[styles.badgeText, { color: colors.textOnPrimary }]}>Actual</Text></View>}
          </View>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>{location} â€¢ {lastAccess}</Text>
        </View>
      </TouchableOpacity>

      {!current && onRemove ? (
        <TouchableOpacity style={styles.remove} onPress={() => onRemove(id, name)}>
          <Icon name="close" size={18} color={colors.error} />
        </TouchableOpacity>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  row: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  iconText: { fontSize: 20 },
  info: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '600' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginLeft: 8 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  meta: { marginTop: 4 },
  remove: { padding: 8 },
})

