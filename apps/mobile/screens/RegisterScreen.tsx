import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert, } from 'react-native'

import { useNavigation } from '@react-navigation/native';
import { authService } from '../src/services/authService';
// Migrado a Design System
import { SpoonButton } from '../src/design-system/components/buttons';
import { SpoonCard } from '../src/design-system/components/cards';
import { AuthLayout } from '../src/design-system/components';
import { SpoonTextField, SpoonTextFieldType } from '../src/design-system/components/inputs';
import { SpoonCheckbox } from '../src/design-system/components';
import { useColors, SpoonShadows } from '../src/design-system';

export default function RegisterScreen() {
  const colors = useColors();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const validateEmail = (email: string) => {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    };

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(formData.email)) {
  newErrors.email = 'Ingresa un email válido';
    }

    if (!formData.phone.trim()) {
  newErrors.phone = 'El teléfono es requerido';
    } else if (formData.phone.length < 10) {
  newErrors.phone = 'Ingresa un número de teléfono válido';
    }

    if (!formData.password) {
  newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
  newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
  newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.confirmPassword !== formData.password) {
  newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    if (!acceptTerms) {
  Alert.alert('Error', 'Debes aceptar los términos y condiciones');
      return;
    }

    setIsLoading(true);
    
    // ? USAR SUPABASE REAL
    const result = await authService.signUp(
      formData.email,
      formData.password,
      formData.name,
      formData.phone
    );
    
    setIsLoading(false);

    if (result.success) {
      Alert.alert(
  '¡Registro exitoso!', 
        `Bienvenido ${result.user?.name}\nRevisa tu email para verificar tu cuenta`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home' as never),
          },
        ]
      );
    } else {
      Alert.alert('Error', result.error || 'Error al crear cuenta');
    }
  };

  return (
    <AuthLayout title="Crear Cuenta" subtitle="Únete a Spoon y disfruta del mejor delivery">
      <View style={{ marginBottom:24 }}>
        <TouchableOpacity 
          style={{ width:40, height:40, justifyContent:'center', alignItems:'center' }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ fontSize:24, color:colors.secondary /* secondary */ }}>←</Text>
        </TouchableOpacity>
      </View>

  <View style={{ backgroundColor:colors.surface, borderRadius:12, padding:24, marginBottom:24, ...SpoonShadows.card() }}>
          {/* Nombre Completo */}
          <SpoonTextField 
            label="Nombre Completo" 
            hint="Tu nombre completo" 
            isRequired 
            value={formData.name}
            onChangeText={(v) => handleInputChange('name', v)}
            validator={(v) => v.trim().length < 2 ? 'El nombre debe tener al menos 2 caracteres' : null}
            testID="register-name"
          />

          {/* Email */}
          <SpoonTextField.email 
            label="Email" 
            hint="ejemplo@correo.com" 
            isRequired 
            value={formData.email}
            onChangeText={(v) => handleInputChange('email', v)}
            validator={(v) => !validateEmail(v) ? 'Ingresa un email válido' : null}
            testID="register-email"
          />

          {/* Teléfono */}
          <SpoonTextField.phone 
            label="Teléfono" 
            hint="3001234567" 
            isRequired 
            value={formData.phone}
            onChangeText={(v) => handleInputChange('phone', v)}
            validator={(v) => v.replace(/\D/g,'').length < 10 ? 'Ingresa un número de teléfono válido' : null}
            testID="register-phone"
          />

          {/* Contraseña */}
            <SpoonTextField.password 
              label="Contraseña" 
              hint="Mínimo 6 caracteres" 
              isRequired 
              value={formData.password}
              onChangeText={(v) => handleInputChange('password', v)}
              validator={(v) => v.length < 6 ? 'La contraseña debe tener al menos 6 caracteres' : null}
              testID="register-password"
            />

          {/* Confirmar Contraseña */}
            <SpoonTextField.password 
              label="Confirmar Contraseña" 
              hint="Repite la contraseña" 
              isRequired 
              value={formData.confirmPassword}
              onChangeText={(v) => handleInputChange('confirmPassword', v)}
              validator={(v) => v !== formData.password ? 'Las contraseñas no coinciden' : null}
              testID="register-confirm-password"
            />

          <View style={{ marginBottom:24 }}>
            <SpoonCheckbox
              checked={acceptTerms}
              onChange={setAcceptTerms}
              label={
                <Text style={{ fontSize:14, color:colors.secondary, lineHeight:20 }}>
                  Acepto los <Text style={{ color:colors.primaryDark, textDecorationLine:'underline' }}>Términos y Condiciones</Text> y la{' '}
                  <Text style={{ color:colors.primaryDark, textDecorationLine:'underline' }}>Política de Privacidad</Text>
                </Text>
              }
            />
          </View>

          <SpoonButton.primary 
            text={isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            onPress={handleRegister}
            isLoading={isLoading}
            fullWidth
            testID="register-submit"
          />
  </View>

      <View style={{ flexDirection:'row', justifyContent:'center' }}>
  <Text style={{ color:colors.secondary }}>¿Ya tienes cuenta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
          <Text style={{ color:colors.primaryDark, fontWeight:'bold' }}>Inicia Sesión</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
}

