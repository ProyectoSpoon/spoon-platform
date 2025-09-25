import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, } from 'react-native'

import Icon from '../Icon'
import { useColors, SpoonColors } from '../../design-system'

type Props = {
  id: string
  name: string
  avatar?: string
  location?: string
  gustos?: string[]
  fecha?: string
  mensaje?: string | null
  onAccept?: (id: string) => void
  onReject?: (id: string) => void
  onPress?: () => void
}

export default function RequestCard({ id, name, location, gustos = [], fecha, mensaje, onAccept, onReject, onPress }: Props) {
  const colors = useColors()
  return (
    <View style={[styles.card, { borderColor: colors.borderLight, backgroundColor: colors.surface }]}> 
      <View style={styles.requestHeader}>
        <View style={[styles.avatarCircle, { backgroundColor: SpoonColors.withOpacity(colors.primaryDark, 0.12) }]}><Text style={[styles.avatarLetter, { color: colors.primaryDark }]}>{name?.[0]?.toUpperCase() ?? '?'}</Text></View>
        <View style={{flex:1, marginLeft:12}}>
          <Text style={styles.itemTitle}>{name}</Text>
          <View style={styles.row}>
            <Icon name="location-on" size={12} color={colors.textSecondary} />
            <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>{location}</Text>
          </View>
        </View>
        <Text style={styles.smallText}>{fecha}</Text>
      </View>

      <View style={{marginTop:12}}>
        <View style={styles.tagsRow}>
          {gustos.slice(0,4).map((g) => (
            <View key={g} style={[styles.tag, { backgroundColor: SpoonColors.withOpacity(colors.info, 0.15) }]}><Text style={[styles.tagText, { color: colors.info }]}>{g}</Text></View>
          ))}
        </View>
        {mensaje ? (
          <View style={[styles.messageBox, { backgroundColor: SpoonColors.withOpacity(colors.primary, 0.05) }]}><Text style={{ color: colors.textSecondary }}>{mensaje}</Text></View>
        ) : null}

        <View style={styles.requestActions}>
          <TouchableOpacity style={[styles.outlinedButton, { borderColor: colors.borderLight }]} onPress={() => onReject?.(id)}>
            <Icon name="close" size={16} color={colors.textSecondary} />
            <Text style={[styles.outlinedLabel, { color: colors.textSecondary }]}>Rechazar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.warning }]} onPress={() => onAccept?.(id)}>
            <Icon name="check" size={16} color={colors.textOnPrimary} />
            <Text style={[styles.primaryLabel, { color: colors.textOnPrimary }]}>Aceptar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { marginBottom:12, borderRadius:12, padding:12, borderWidth:1 },
  requestHeader: { flexDirection:'row', alignItems:'center' },
  avatarCircle: { width:48, height:48, borderRadius:24, justifyContent:'center', alignItems:'center' },
  avatarLetter: { fontWeight:'700' },
  itemTitle: { fontWeight:'600', fontSize:16 },
  row: { flexDirection:'row', alignItems:'center', marginTop:4 },
  itemSubtitle: { marginLeft:4, fontSize:12 },
  tagsRow: { flexDirection:'row', flexWrap:'wrap', marginTop:8 },
  tag: { paddingHorizontal:8, paddingVertical:4, borderRadius:12, marginRight:6, marginTop:4 },
  tagText: { fontSize:12, fontWeight:'500' },
  messageBox: { marginTop:12, padding:12, borderRadius:8 },
  requestActions: { flexDirection:'row', marginTop:12 },
  outlinedButton: { flex:1, borderWidth:1, padding:10, borderRadius:8, flexDirection:'row', alignItems:'center', justifyContent:'center', marginRight:8 },
  outlinedLabel: { marginLeft:6 },
  primaryButton: { flex:1, padding:10, borderRadius:8, flexDirection:'row', alignItems:'center', justifyContent:'center' },
  primaryLabel: { marginLeft:6 },
  smallText: { fontSize:12, marginTop:0 },
})

