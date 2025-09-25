import React, { useState, useRef, useCallback } from 'react';
// Removed invalid AutoCapitalize named import (not exported by react-native types)
import { TextInput, KeyboardTypeOptions, ReturnKeyTypeOptions, View, Text, TouchableOpacity } from 'react-native';
import { ViewStyle, TextStyle } from '../../types';
import { useTheme, useColors, useTypography, useSpacing } from '../../context/ThemeContext';

/**
 * Tipos de campos de texto disponibles en el design system
 */
export enum SpoonTextFieldType {
  TEXT = 'text',
  EMAIL = 'email',
  PASSWORD = 'password',
  PHONE = 'phone',
  NUMBER = 'number',
  MULTILINE = 'multiline',
}

/**
 * Props para el componente SpoonTextField
 */
export interface SpoonTextFieldProps {
  label: string;
  hint?: string;
  initialValue?: string;
  value?: string;
  type?: SpoonTextFieldType;
  isRequired?: boolean;
  enabled?: boolean;
  readOnly?: boolean;
  obscureText?: boolean;
  validator?: (value: string) => string | null;
  onChangeText?: (value: string) => void;
  onSubmitEditing?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  prefixIcon?: string;
  prefix?: React.ReactNode;
  suffixIcon?: string;
  suffix?: React.ReactNode;
  onSuffixIconPress?: () => void;
  maxLines?: number;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  testID?: string;
}

/**
 * Campo de texto personalizado del design system Spoon
 * 
 * Proporciona una interfaz consistente para todos los campos de texto
 * de la aplicaciÃ³n con validaciÃ³n, diferentes tipos y estilos.
 * 
 * @example
 * ```tsx
 * // Campo bÃ¡sico
 * <SpoonTextField label="Nombre" onChangeText={(text) => {}} />
 * 
 * // Campo de email
 * <SpoonTextField.email label="Email" onChangeText={(text) => {}} />
 * 
 * // Campo de contraseÃ±a
 * <SpoonTextField.password label="ContraseÃ±a" onChangeText={(text) => {}} />
 * 
 * // Campo con validaciÃ³n
 * <SpoonTextField 
 *   label="TelÃ©fono"
 *   type={SpoonTextFieldType.PHONE}
 *   validator={(value) => value.length < 10 ? 'Muy corto' : null}
 * />
 * ```
 */
export const SpoonTextField: React.FC<SpoonTextFieldProps> & {
  email: React.FC<Omit<SpoonTextFieldProps, 'type' | 'prefixIcon'>>;
  password: React.FC<Omit<SpoonTextFieldProps, 'type' | 'prefixIcon' | 'obscureText'>>;
  phone: React.FC<Omit<SpoonTextFieldProps, 'type' | 'prefixIcon'>>;
  number: React.FC<Omit<SpoonTextFieldProps, 'type'>>;
  multiline: React.FC<Omit<SpoonTextFieldProps, 'type' | 'maxLines'>>;
} = ({
  label,
  hint,
  initialValue,
  value,
  type = SpoonTextFieldType.TEXT,
  isRequired = false,
  enabled = true,
  readOnly = false,
  obscureText = false,
  validator,
  onChangeText,
  onSubmitEditing,
  onFocus,
  onBlur,
  prefixIcon,
  prefix,
  suffixIcon,
  suffix,
  onSuffixIconPress,
  maxLines = 1,
  maxLength,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  style,
  inputStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = useColors();
  const typography = useTypography();
  const spacing = useSpacing();

  const [internalValue, setInternalValue] = useState(initialValue || '');
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const currentValue = value !== undefined ? value : internalValue;
  const isControlled = value !== undefined;

  // ValidaciÃ³n
  const validateInput = useCallback((inputValue: string): string | null => {
    // ValidaciÃ³n de campo requerido
    if (isRequired && inputValue.trim().length === 0) {
      return `${label} es requerido`;
    }

    // Si estÃ¡ vacÃ­o y no es requerido, no validar
    if (inputValue.trim().length === 0) {
      return null;
    }

    // ValidaciÃ³n personalizada
    if (validator) {
      const customError = validator(inputValue);
      if (customError) return customError;
    }

    // Validaciones por tipo
    switch (type) {
      case SpoonTextFieldType.EMAIL:
        return validateEmail(inputValue);
      case SpoonTextFieldType.PASSWORD:
        return validatePassword(inputValue);
      case SpoonTextFieldType.PHONE:
        return validatePhone(inputValue);
      default:
        return null;
    }
  }, [type, isRequired, label, validator]);

  const validateEmail = (emailValue: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      return 'Ingresa un email vÃ¡lido';
    }
    return null;
  };

  const validatePassword = (passwordValue: string): string | null => {
    if (passwordValue.length < 6) {
      return 'La contraseÃ±a debe tener al menos 6 caracteres';
    }
    return null;
  };

  const validatePhone = (phoneValue: string): string | null => {
    const cleanPhone = phoneValue.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return 'Ingresa un nÃºmero de telÃ©fono vÃ¡lido';
    }
    return null;
  };

  // Handlers
  const handleChangeText = (text: string) => {
    if (!isControlled) {
      setInternalValue(text);
    }

    // Validar en tiempo real
    const error = validateInput(text);
    setErrorText(error);

    onChangeText?.(text);
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    
    // Validar al perder el foco
    const error = validateInput(currentValue);
    setErrorText(error);
    
    onBlur?.();
  };

  const handleSubmitEditing = () => {
    onSubmitEditing?.(currentValue);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Obtener tipo de teclado
  const getKeyboardType = (): KeyboardTypeOptions => {
    switch (type) {
      case SpoonTextFieldType.EMAIL:
        return 'email-address';
      case SpoonTextFieldType.PHONE:
        return 'phone-pad';
      case SpoonTextFieldType.NUMBER:
        return 'numeric';
      default:
        return 'default';
    }
  };

  // Obtener acciÃ³n del teclado
  const getReturnKeyType = (): ReturnKeyTypeOptions => {
    if (type === SpoonTextFieldType.MULTILINE) {
      return 'default';
    }
    return 'next';
  };

  // Obtener auto capitalizaciÃ³n
  const getAutoCapitalize = (): 'none' | 'sentences' | 'words' | 'characters' => {
    switch (type) {
      case SpoonTextFieldType.EMAIL:
        return 'none';
      case SpoonTextFieldType.PASSWORD:
        return 'none';
      default:
        return autoCapitalize;
    }
  };

  // Estilos
  const containerStyle: ViewStyle = {
    marginVertical: spacing.xs,
    ...style,
  };

  const labelStyle: TextStyle = {
    ...typography.labelMedium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    fontWeight: '500',
  };

  const inputContainerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: errorText ? colors.error : isFocused ? colors.primary : colors.border,
    borderRadius: 8,
    backgroundColor: enabled ? colors.surface : colors.surfaceVariant,
    minHeight: 48,
    paddingHorizontal: spacing.sm,
  };

  const textInputStyle: TextStyle = {
    ...typography.bodyMedium,
    flex: 1,
    color: enabled ? colors.textPrimary : colors.textDisabled,
    paddingVertical: spacing.xs,
    textAlignVertical: type === SpoonTextFieldType.MULTILINE ? 'top' : 'center',
    ...inputStyle,
  };

  const iconStyle: TextStyle = {
    fontSize: 20,
    color: colors.textSecondary,
  };

  const errorStyle: TextStyle = {
    ...typography.bodySmall,
    color: colors.error,
    marginTop: spacing.xs,
  };

  const hintStyle: TextStyle = {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  };

  // Render del prefijo
  const renderPrefix = () => {
    if (prefix) return prefix;
    if (prefixIcon) {
      return (
        <View style={{ marginRight: spacing.xs }}>
          <Text style={iconStyle}>{prefixIcon}</Text>
        </View>
      );
    }
    return null;
  };

  // Render del sufijo
  const renderSuffix = () => {
    if (type === SpoonTextFieldType.PASSWORD) {
      return (
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          style={{ marginLeft: spacing.xs }}
          testID={`${testID}-password-toggle`}
        >
          <Text style={iconStyle}>
            {isPasswordVisible ? '👁️' : '🔒'}
          </Text>
        </TouchableOpacity>
      );
    }

    if (suffix) return suffix;
    
    if (suffixIcon) {
      return (
        <TouchableOpacity
          onPress={onSuffixIconPress}
          style={{ marginLeft: spacing.xs }}
          testID={`${testID}-suffix`}
        >
          <Text style={iconStyle}>{suffixIcon}</Text>
        </TouchableOpacity>
      );
    }
    
    return null;
  };

  return (
    <View style={containerStyle} testID={testID}>
      {/* Etiqueta */}
      <View style={{ flexDirection: 'row' }}>
        <Text style={labelStyle}>
          {label}
        </Text>
        {isRequired && (
          <Text style={[labelStyle, { color: colors.error }]}>
            {' *'}
          </Text>
        )}
      </View>

      {/* Campo de entrada */}
      <View style={inputContainerStyle}>
        {renderPrefix()}
        
        <TextInput
          ref={inputRef}
          style={textInputStyle}
          value={currentValue}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmitEditing}
          placeholder={hint}
          placeholderTextColor={colors.textSecondary}
          editable={enabled && !readOnly}
          secureTextEntry={type === SpoonTextFieldType.PASSWORD && !isPasswordVisible}
          keyboardType={getKeyboardType()}
          returnKeyType={getReturnKeyType()}
          autoCapitalize={getAutoCapitalize()}
          autoCorrect={autoCorrect && type !== SpoonTextFieldType.EMAIL && type !== SpoonTextFieldType.PASSWORD}
          multiline={type === SpoonTextFieldType.MULTILINE}
          numberOfLines={type === SpoonTextFieldType.MULTILINE ? maxLines : 1}
          maxLength={maxLength}
          testID={`${testID}-input`}
        />

        {renderSuffix()}
      </View>

      {/* Mensaje de error */}
      {errorText && (
        <Text style={errorStyle} testID={`${testID}-error`}>
          {errorText}
        </Text>
      )}

      {/* Texto de ayuda */}
      {hint && !errorText && (
        <Text style={hintStyle} testID={`${testID}-hint`}>
          {hint}
        </Text>
      )}
    </View>
  );
};

// Constructores estÃ¡ticos (Flutter-style)
SpoonTextField.email = (props) => (
  <SpoonTextField 
    {...props} 
    type={SpoonTextFieldType.EMAIL} 
    prefixIcon="✉️"
    autoCapitalize="none"
    autoCorrect={false}
  />
);

SpoonTextField.password = (props) => (
  <SpoonTextField 
    {...props} 
    type={SpoonTextFieldType.PASSWORD}
    prefixIcon="🔒"
    obscureText={true}
    autoCapitalize="none"
    autoCorrect={false}
  />
);

SpoonTextField.phone = (props) => (
  <SpoonTextField 
    {...props} 
    type={SpoonTextFieldType.PHONE}
    prefixIcon="📞"
    maxLength={10}
  />
);

SpoonTextField.number = (props) => (
  <SpoonTextField 
    {...props} 
    type={SpoonTextFieldType.NUMBER}
    autoCapitalize="none"
    autoCorrect={false}
  />
);

SpoonTextField.multiline = (props) => (
  <SpoonTextField 
    {...props} 
    type={SpoonTextFieldType.MULTILINE}
    maxLines={3}
  />
);

export default SpoonTextField;

