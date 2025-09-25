import React from 'react'
import { Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

// Importar tipos
// (Tipos específicos de navegación podrían declararse aquí si se agregan en el futuro)

// Imports moved to top

// Pantallas principales
import HomeScreen from '../screens/HomeScreen'
import SearchScreen from '../screens/SearchScreen'
import FavoritesScreen from '../screens/FavoritesScreen'
import LoginScreen from '../screens/LoginScreen'
import RegisterScreen from '../screens/RegisterScreen'
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen'
import ReviewsScreen from '../screens/ReviewsScreen'
import WriteReviewScreen from '../screens/WriteReviewScreen'
import DishDetailScreen from '../screens/DishDetailScreen'
import CategoryProductsScreen from '../screens/CategoryProductsScreen'
import RestaurantMenuScreen from '../screens/RestaurantMenuScreen'
import SplashScreen from '../screens/SplashScreen'
import LocationPermissionScreen from '../screens/LocationPermissionScreen'

// Pantallas de perfil
import UserProfileScreen from '../screens/profile/UserProfileScreen'
import EditProfileScreen from '../screens/profile/EditProfileScreen'
import SecurityScreen from '../screens/profile/SecurityScreen'
import NotificationsScreen from '../screens/profile/NotificationsScreen'
import PrivacyScreen from '../screens/profile/PrivacyScreen'
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen'
import PreferencesScreen from '../screens/profile/PreferencesScreen'
import AboutScreen from '../screens/profile/AboutScreen'
import HelpScreen from '../screens/profile/HelpScreen'
import ContactSupportScreen from '../screens/profile/ContactSupportScreen'
import TermsConditionsScreen from '../screens/profile/TermsConditionsScreen'
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen'
import ConnectionsScreen from '../screens/profile/ConnectionsScreen'
import ActivityLogScreen from '../screens/profile/ActivityLogScreen'
import { useColors } from '../src/design-system'
import { useAuth } from '../src/hooks/useAuth'

const Tab = createBottomTabNavigator()
const MainStack = createStackNavigator()
const ProfileStack = createStackNavigator()

// Stack de perfil con TODAS las pantallas
function ProfileNavigator() {
  const colors = useColors()
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primaryDark },
        headerTintColor: colors.textOnPrimary,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <ProfileStack.Screen 
        name="UserProfile" 
        component={UserProfileScreen}
        options={{ title: 'Mi Perfil' }}
      />
      <ProfileStack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ title: 'Editar Perfil' }}
      />
      <ProfileStack.Screen 
        name="Security" 
        component={SecurityScreen}
        options={{ title: 'Seguridad' }}
      />
      <ProfileStack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen}
        options={{ title: 'Cambiar ContraseÃ±a' }}
      />
      <ProfileStack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ title: 'Notificaciones' }}
      />
      <ProfileStack.Screen 
        name="Privacy" 
        component={PrivacyScreen}
        options={{ title: 'Privacidad' }}
      />
      <ProfileStack.Screen 
        name="Preferences" 
        component={PreferencesScreen}
        options={{ title: 'Preferencias' }}
      />
      <ProfileStack.Screen 
        name="About" 
        component={AboutScreen}
        options={{ title: 'Acerca de' }}
      />
      <ProfileStack.Screen 
        name="Help" 
        component={HelpScreen}
        options={{ title: 'Ayuda' }}
      />
      <ProfileStack.Screen 
        name="ContactSupport" 
        component={ContactSupportScreen}
        options={{ title: 'Soporte' }}
      />
      <ProfileStack.Screen 
        name="TermsConditions" 
        component={TermsConditionsScreen}
        options={{ title: 'TÃ©rminos y Condiciones' }}
      />
      <ProfileStack.Screen 
        name="PrivacyPolicy" 
        component={PrivacyPolicyScreen}
        options={{ title: 'PolÃ­tica de Privacidad' }}
      />
      <ProfileStack.Screen 
        name="Connections" 
        component={ConnectionsScreen}
        options={{ title: 'Conexiones' }}
      />
      <ProfileStack.Screen 
        name="ActivityLog" 
        component={ActivityLogScreen}
        options={{ title: 'Actividad' }}
      />
    </ProfileStack.Navigator>
  )
}

// Tabs principales
function MainTabs() {
  const colors = useColors()
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.secondaryDark,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
        }
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen}
        options={{ 
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18 }}>⌂</Text>
          )
        }}
      />
      <Tab.Screen 
        name="SearchTab" 
        component={SearchScreen}
        options={{ 
          tabBarLabel: 'Buscar',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18 }}>🔍</Text>
          )
        }}
      />
      <Tab.Screen 
        name="FavoritesTab" 
        component={FavoritesScreen}
        options={{ 
          tabBarLabel: 'Favoritos',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18 }}>❤</Text>
          )
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileNavigator}
        options={{ 
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18 }}>👤</Text>
          )
        }}
      />
    </Tab.Navigator>
  )
}

// Stack principal con autenticaciÃ³n y detalles
function RootNavigator() {
  const colors = useColors()
  const { user, loading } = useAuth()
  const [showSplash, setShowSplash] = React.useState(true)
  const [showLocationPermission, setShowLocationPermission] = React.useState(false)
  const [locationPermissionGranted, setLocationPermissionGranted] = React.useState(false)
  const isLoggedIn = !!user
  
  // Ocultar splash despuÃ©s de que termine su animaciÃ³n
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
      setShowLocationPermission(true)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])

  // FunciÃ³n para manejar cuando se completan los permisos
  const handleLocationPermissionComplete = React.useCallback(() => {
    setShowLocationPermission(false)
    setLocationPermissionGranted(true)
  }, [])
  
  // Mostrar splash primero
  if (showSplash) {
    return (
      <MainStack.Navigator screenOptions={{ headerShown: false }}>
        <MainStack.Screen name="Splash" component={SplashScreen} />
      </MainStack.Navigator>
    )
  }
  
  // Mostrar permisos de ubicaciÃ³n despuÃ©s del splash
  if (showLocationPermission) {
    return (
      <MainStack.Navigator screenOptions={{ headerShown: false }}>
        <MainStack.Screen name="LocationPermission">
          {(props) => (
            <LocationPermissionScreen 
              {...props} 
              onPermissionComplete={handleLocationPermissionComplete}
            />
          )}
        </MainStack.Screen>
      </MainStack.Navigator>
    )
  }
  
  // Mientras se carga la sesión mostrar un contenedor vacío (se podría poner splash intermedio)
  if (loading) {
    return (
      <MainStack.Navigator screenOptions={{ headerShown: false }}>
        <MainStack.Screen name="Splash" component={SplashScreen} />
      </MainStack.Navigator>
    )
  }

  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn && (
        <>
          <MainStack.Screen name="Login" component={LoginScreen} />
          <MainStack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
      {isLoggedIn && (
        <>
          <MainStack.Screen name="Main" component={MainTabs} />
          <MainStack.Screen
            name="RestaurantDetail"
            component={RestaurantDetailScreen}
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: colors.primaryDark },
              headerTintColor: colors.textOnPrimary,
              title: 'Restaurante'
            }}
          />
          <MainStack.Screen
            name="DishDetail"
            component={DishDetailScreen}
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: colors.primaryDark },
              headerTintColor: colors.textOnPrimary,
              title: 'Platillo'
            }}
          />
          <MainStack.Screen
            name="CategoryProducts"
            component={CategoryProductsScreen}
            options={{
              headerShown: false
            }}
          />
          <MainStack.Screen
            name="ReviewsScreen"
            component={ReviewsScreen}
            options={{
              headerShown: true,
              title: 'Reseñas'
            }}
          />
          <MainStack.Screen
            name="WriteReview"
            component={WriteReviewScreen}
            options={{
              headerShown: true,
              title: 'Escribir Reseña'
            }}
          />
          <MainStack.Screen
            name="RestaurantMenu"
            component={RestaurantMenuScreen}
            options={{
              headerShown: true,
              title: 'Menú'
            }}
          />
        </>
      )}
    </MainStack.Navigator>
  )
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  )
}