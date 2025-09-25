import React, { useEffect, useRef } from 'react'
import { View, Text, StatusBar, Dimensions, Animated, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Location from 'expo-location'
import { SpoonPage, SpoonButton, SpoonText } from '../src/design-system/components'
import { useColors, useSpacing, useTypography, useRadii, useShadows } from '../src/design-system'

const { width, height } = Dimensions.get('window')

interface LocationPermissionScreenProps {
  onPermissionComplete: () => void
}

export default function LocationPermissionScreen({ onPermissionComplete }: LocationPermissionScreenProps) {
  const colors = useColors()
  const spacing = useSpacing()
  const type = useTypography()
  const radii = useRadii()
  const shadows = useShadows()

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();
    // Comprobar si ya existe una decisión previa o si el permiso ya está otorgado a nivel del SO
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('location_permission_decision')
  // Compatibilidad: algunas versiones usan getPermissionsAsync
  // Intento de obtener estado actual (requestForegroundPermissionsAsync devuelve estado sin re-preguntar si ya fue decidido)
  const perm = await Location.requestForegroundPermissionsAsync();
  if (perm.status === 'granted') {
          // Asegurar que guardamos la decisión para futuros inicios
          if (stored !== 'granted') await AsyncStorage.setItem('location_permission_decision', 'granted')
          onPermissionComplete()
          return
        }
        if (stored === 'granted') {
          // Usuario ya había aceptado anteriormente (el SO puede haber revocado manualmente)
          onPermissionComplete()
          return
        }
        if (stored === 'denied') {
          // Decisión previa: no volver a mostrar pantalla; continuar flujo en modo limitado
            onPermissionComplete()
          return
        }
        // Si no hay decisión almacenada, se muestra la UI normal
      } catch (err) {
        console.log('[LocationPermission] Error comprobando estado previo', err)
      }
    })()
  }, [])

  const handlePermission = async (permissionType: 'always' | 'once' | 'deny') => {
    let message = ''

    try {
      switch (permissionType) {
        case 'always':
          const { status } = await Location.requestForegroundPermissionsAsync()
          if (status === 'granted') {
            message = 'Permiso concedido: Siempre'
            console.log('📍 Permisos de ubicación concedidos')
            await AsyncStorage.setItem('location_permission_decision', 'granted')
          } else {
            message = 'Permisos denegados'
            await AsyncStorage.setItem('location_permission_decision', 'denied')
          }
          break
        case 'once':
          const { status: onceStatus } = await Location.requestForegroundPermissionsAsync()
          if (onceStatus === 'granted') {
            message = 'Permiso concedido: Una vez'
            console.log('📍 Permisos de ubicación concedidos (una vez)')
            // Lo tratamos como concedido persistente para no volver a mostrar pantalla; se puede refinar
            await AsyncStorage.setItem('location_permission_decision', 'granted')
          } else {
            message = 'Permisos denegados'
            await AsyncStorage.setItem('location_permission_decision', 'denied')
          }
          break
        case 'deny':
          message = 'Permiso denegado'
          console.log('📍 Usuario denegó permisos de ubicación')
          await AsyncStorage.setItem('location_permission_decision', 'denied')
          break
      }

      // Mostrar resultado
      Alert.alert('Permisos de Ubicación', message)

      // Llamar al callback para continuar el flujo
      setTimeout(() => {
        onPermissionComplete()
      }, 1500)

    } catch (error) {
      console.error('Error solicitando permisos:', error)
      Alert.alert('Error', 'No se pudieron solicitar los permisos')
      // Aún así continuar el flujo
      setTimeout(() => {
        onPermissionComplete()
      }, 2000)
    }
  }

  const tintedBg = colors.primaryLight + '12' // suavizar fondo usando variante clara

  return (
    <SpoonPage scroll={false} padded={false} background={tintedBg}>
      <StatusBar barStyle="dark-content" backgroundColor={tintedBg} />

      {/* Área simulada del mapa */}
      <View style={{ flex: 1, position: 'relative' }}>
        <MapBackground colors={colors} />

        {/* Marcadores */}
        <LocationMarker top={height * 0.25} right={30} icon="🏪" color={colors.error} />
        <LocationMarker bottom={height * 0.25} left={40} icon="🛒" color={colors.error} />
        <LocationMarker bottom={height * 0.18} right={80} icon="🍔" color={colors.error} />

        {/* Header flotante */}
        <View style={{ position: 'absolute', top: 50, left: spacing.md, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ ...type.titleMedium, marginRight: spacing.xs }}>📍</Text>
          <Text style={{ ...type.bodyMedium, color: colors.textSecondary }}>Permitir Localización</Text>
        </View>
      </View>

      {/* Modal de permisos */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg }}>
        <Animated.View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            padding: spacing.lg,
            ...shadows.lg,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <View style={{ width: 60, height: 60, backgroundColor: colors.primaryLight + '33', borderRadius: 30, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: spacing.lg }}>
            <Text style={{ fontSize: 30 }}>📍</Text>
          </View>

          <SpoonText style={{ ...type.headlineSmall, textAlign: 'center', lineHeight: 24, marginBottom: spacing.md }}>
            ¿Permitir que "Spoon"{'\n'}acceda a tu ubicación{'\n'}mientras usas la app?
          </SpoonText>

          <SpoonText style={{ ...type.bodyMedium, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg * 2 }}>
            Tu ubicación actual se mostrará en el mapa y se usará para las indicaciones, los resultados de búsqueda cercana y la hora aproximada de llegada.
          </SpoonText>

          <View style={{ gap: spacing.sm }}>
            <SpoonButton.primary text="Permitir al usar la app" onPress={() => handlePermission('always')} />
            <SpoonButton.primary text="Permitir una vez" onPress={() => handlePermission('once')} />
            <SpoonButton.text text="No permitir" onPress={() => handlePermission('deny')} />
          </View>
        </Animated.View>
      </View>
    </SpoonPage>
  )
}

// Marcador usando tokens
function LocationMarker({ top, bottom, left, right, icon, color }: { top?: number; bottom?: number; left?: number; right?: number; icon: string; color: string }) {
  const type = useTypography();
  const colors = useColors();
  const shadows = useShadows();
  return (
    <View style={{ position: 'absolute', width: 40, height: 50, alignItems: 'center', top, bottom, left, right }}>
      <View style={{ position: 'absolute', bottom: 0, width: 20, height: 8, backgroundColor: colors.black + '33', borderRadius: 10 }} />
      <View style={{ width: 35, height: 35, borderRadius: 17.5, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: colors.white, backgroundColor: color, ...shadows.lg }}>
        <Text style={{ ...type.titleLarge, textAlign: 'center' }}>{icon}</Text>
      </View>
      <View style={{ position: 'absolute', bottom: 8, width: 12, height: 12, transform: [{ rotate: '45deg' }], borderRightWidth: 2, borderBottomWidth: 2, borderColor: colors.white, backgroundColor: color }} />
    </View>
  );
}

// Componente para el fondo del mapa (placeholder decorativo)
function MapBackground({ colors }: { colors: any }) {
  const neutralLine = colors.textSecondary + '40'
  const parkBg = colors.success + '33'
  const waterBg = colors.info + '33'
  return (
    <View style={{ flex: 1, position: 'relative' }}>
      {Array.from({ length: 8 }, (_, i) => (
        <View key={`h-${i}`} style={{ position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: neutralLine, top: (height / 8) * i }} />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <View key={`v-${i}`} style={{ position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: neutralLine, left: (width / 6) * i }} />
      ))}
      <View style={{ position: 'absolute', left: width * 0.1, top: height * 0.15, width: width * 0.25, height: height * 0.2, backgroundColor: parkBg, borderRadius: 12 }} />
      <View style={{ position: 'absolute', right: width * 0.1, top: height * 0.4, width: width * 0.3, height: height * 0.15, backgroundColor: parkBg, borderRadius: 12 }} />
      <View style={{ position: 'absolute', left: width * 0.3, top: height * 0.05, width: width * 0.4, height: height * 0.1, backgroundColor: waterBg, borderRadius: 20 }} />
      <Text style={{ position: 'absolute', left: width * 0.05, top: height * 0.25, fontSize: 16, fontWeight: 'bold', color: colors.textSecondary + '99', letterSpacing: 2 }}>ENGATIVÁ</Text>
      <Text style={{ position: 'absolute', left: width * 0.4, top: height * 0.35, fontSize: 14, fontWeight: '500', color: colors.textSecondary + '99', letterSpacing: 1 }}>SALITRE</Text>
      <Text style={{ position: 'absolute', left: width * 0.05, bottom: height * 0.15, fontSize: 12, fontWeight: '500', color: colors.info, textAlign: 'left' }}>Plaza Mercado{ '\n'}Restrepo</Text>
    </View>
  )
}
