import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert, } from 'react-native'

import { useNavigation } from '@react-navigation/native';
import { authService } from '../src/services/authService';
// Migrado a Design System
import { SpoonButton } from '../src/design-system/components/buttons';
import { SpoonTextField } from '../src/design-system/components/inputs';
import { SpoonNoticeCard } from '../src/design-system/components';
import { AuthLayout } from '../src/design-system/components';
import { useColors } from '../src/design-system';

export default function LoginScreen() {
  const colors = useColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const validateEmail = (email: string) => {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) setEmailError('');
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) setPasswordError('');
  };

  const validateForm = () => {
    let isValid = true;

    if (!email.trim()) {
      setEmailError('El email es requerido');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Ingresa un email válido');
      isValid = false;
    }

    if (!password) {
      setPasswordError('La contraseña es requerida');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Mínimo 6 caracteres');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    const result = await authService.signIn(email, password);
    setIsLoading(false);
    if (result.success) {
      Alert.alert(
        '¡Login exitoso!',
        `Bienvenido ${result.user?.name || ''}`.trim(),
        [{ text: 'OK', onPress: () => navigation.navigate('Home' as never) }]
      );
    } else {
      Alert.alert('Error', result.error || 'No se pudo iniciar sesión');
    }
  };

  // Eliminado: funciones de credenciales de prueba y acceso directo

  return (
  <AuthLayout title="Iniciar Sesión">
          {/* Título manejado por AuthLayout */}

          <SpoonTextField.email
            label="Email"
            hint="ejemplo@correo.com"
            isRequired
            value={email}
            onChangeText={handleEmailChange}
            validator={(v) => !validateEmail(v) ? 'Ingresa un email válido' : null}
            testID="login-email"
          />

          <SpoonTextField.password
            label="Contraseña"
            hint="Tu contraseña"
            isRequired
            value={password}
            onChangeText={handlePasswordChange}
            validator={(v) => v.length < 6 ? 'Mínimo 6 caracteres' : null}
            testID="login-password"
          />

          <SpoonButton.primary
            text={isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            onPress={handleLogin}
            isLoading={isLoading}
            fullWidth
            testID="login-submit"
          />
  <View style={{ flexDirection:'row', justifyContent:'center', marginBottom:16 }}>
    <Text style={{ color: colors.secondary }}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
            <Text style={{ color: colors.primaryDark, fontWeight:'bold' }}>Regístrate</Text>
          </TouchableOpacity>
        </View>

  {/* Eliminado bloque de credenciales de prueba y botón de atajo al Home */}
    </AuthLayout>
  );
}

