import React, { useEffect, useRef } from 'react'
import { View, Text, Animated, StatusBar, Image } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { SpoonPage, SpoonText } from '../src/design-system/components'
import { useColors, useSpacing, useTypography, SpoonColors, SpoonShadows } from '../src/design-system'


export default function SplashScreen() {
  const navigation = useNavigation()
  
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const spinAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Iniciar animaciones
    startAnimations()
    
  console.log('🚀 SplashScreen iniciada')
  }, [])

  const startAnimations = () => {
  // Animación de fade y escala del logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start()

  // Animación de rotación continua para el indicador
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start()
  }

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const colors = useColors()
  const spacing = useSpacing()
  const type = useTypography()

  return (
    <SpoonPage scroll={false} padded={false} background={'#ffffff'}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Animated.View
        style={{
          flex:1,
          alignItems:'center',
          justifyContent:'center',
          opacity: fadeAnim,
          transform:[{ scale: scaleAnim }]
        }}
      >
        <Image
          source={require('../assets/logo-spoon.png')}
          resizeMode="contain"
          style={{ width:300, height:300, marginBottom:spacing.lg }}
          onError={(e) => console.warn('No se pudo cargar logo-spoon.png', e.nativeEvent.error)}
        />
        
        <Animated.View style={{ width:30,height:30,justifyContent:'center',alignItems:'center', transform:[{ rotate: spin }] }}>
          <Text style={{ fontSize: type.headlineSmall.fontSize, color:SpoonColors.withOpacity(colors.primaryDark,0.5) }}>⟳</Text>
        </Animated.View>
      </Animated.View>
      <View style={{ position:'absolute', bottom:50, alignSelf:'center', alignItems:'center' }}>
        <Text style={{ color:SpoonColors.withOpacity(colors.primaryDark,0.5), fontSize:12, fontWeight:'300' }}>Versión 2.1.0</Text>
      </View>
    </SpoonPage>
  )
}

