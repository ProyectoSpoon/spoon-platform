import React from 'react';
import { View, Text, Linking, TouchableOpacity } from 'react-native';
import { useColors, useSpacing, useTypography, useRadii } from '../../context/ThemeContext';

export interface SpoonMapPlaceholderProps {
  height?: number;
  onPress?: () => void;
  testID?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  interactive?: boolean; // si true, permite interacción con el mapa
}

let MapView: any = null;
let Marker: any = null;
try {
  // Optional dependency (react-native-maps)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const maps = require('react-native-maps');
  MapView = maps.default || maps.MapView || null;
  Marker = maps.Marker || (maps.default && maps.default.Marker) || null;
} catch {}

export const SpoonMapPlaceholder: React.FC<SpoonMapPlaceholderProps> = ({
  height=200,
  testID='map-placeholder',
  latitude,
  longitude,
  address,
  interactive=false,
}) => {
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();
  const radii = useRadii();
  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number';
  const openExternal = () => {
    let url: string | null = null;
    if (hasCoords) {
      url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    } else if (address) {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    }
    if (url) Linking.openURL(url).catch(()=>{});
  };

  if (MapView && hasCoords) {
    return (
      <View style={{ height, borderRadius: radii.md, overflow:'hidden', marginBottom: spacing.lg }} testID={testID}>
        <MapView
          style={{ flex:1 }}
          initialRegion={{ latitude, longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 }}
          pointerEvents={interactive ? 'auto' : 'none'}
        >
          {Marker ? <Marker coordinate={{ latitude, longitude }} /> : null}
        </MapView>
        {/* Overlay superior derecha botón */}
        <TouchableOpacity onPress={openExternal} style={{ position:'absolute', top:12, right:12, backgroundColor: colors.primary, paddingHorizontal:10, paddingVertical:6, borderRadius:8 }}>
          <Text style={{ color: colors.white, fontSize:12 }}>Google Maps</Text>
        </TouchableOpacity>
        {/* Overlay inferior dirección */}
        {!!address && (
          <TouchableOpacity activeOpacity={0.85} onPress={openExternal} style={{ position:'absolute', left:0, right:0, bottom:0, backgroundColor: colors.surface + 'CC', paddingHorizontal:12, paddingVertical:8 }}>
            <Text style={{ color: colors.textPrimary, fontSize:12 }} numberOfLines={2}>{address}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <TouchableOpacity
  activeOpacity={hasCoords || address ? 0.8 : 1}
  onPress={hasCoords || address ? openExternal : undefined}
      style={{ height, borderRadius: radii.md, backgroundColor: colors.border, alignItems:'center', justifyContent:'center', marginBottom: spacing.lg, position:'relative', paddingHorizontal: spacing.md }}
      testID={testID}
    >
      <Text style={{ fontSize:48, marginBottom: spacing.sm }}>🗺️</Text>
      <Text style={{ ...typography.bodySmall, color: colors.textSecondary, fontWeight:'500', textAlign:'center' }} numberOfLines={2}>
        {hasCoords ? (address || 'Ver en Google Maps') : 'Mapa no disponible'}
      </Text>
      {hasCoords && (
        <View style={{ position:'absolute', top:20, right:20, width:32, height:32, backgroundColor: colors.primary, borderRadius: 8, alignItems:'center', justifyContent:'center' }}>
          <Text style={{ fontSize:18, color: colors.white }}>📍</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default SpoonMapPlaceholder;
