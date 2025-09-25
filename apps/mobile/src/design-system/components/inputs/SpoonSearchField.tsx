// src/design-system/components/inputs/SpoonSearchField.tsx

import React, { useState, useRef, useEffect } from 'react';
import { TextInput, Text, ActivityIndicator, TouchableOpacity, View, ScrollView, StyleSheet } from 'react-native';
import { ViewStyle, TextStyle } from '../../types';
import { useTheme, useColors, useTypography, useSpacing } from '../../context/ThemeContext';

/**
 * Props para el componente SpoonSearchField
 */
export interface SpoonSearchFieldProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmitEditing?: () => void;
  onTap?: () => void;
  enabled?: boolean;
  autofocus?: boolean;
  suggestions?: string[];
  onSuggestionPress?: (suggestion: string) => void;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  clearable?: boolean;
  showLoading?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  testID?: string;
}

/**
 * Campo de búsqueda especializado para la aplicación Spoon
 * 
 * Proporciona funcionalidad avanzada de búsqueda con sugerencias,
 * iconos personalizables y estados de carga.
 * 
 * @example
 * ```tsx
 * // Búsqueda básica
 * <SpoonSearchField
 *   placeholder="Buscar restaurantes..."
 *   value={searchQuery}
 *   onChangeText={setSearchQuery}
 *   onSubmitEditing={handleSearch}
 * />
 * 
 * // Con sugerencias
 * <SpoonSearchField
 *   placeholder="Buscar comida..."
 *   value={query}
 *   onChangeText={setQuery}
 *   suggestions={['Pizza', 'Hamburguesa', 'Sushi']}
 *   onSuggestionPress={handleSuggestion}
 * />
 * 
 * // Con loading
 * <SpoonSearchField
 *   placeholder="Buscando..."
 *   value={query}
 *   onChangeText={setQuery}
 *   showLoading={isSearching}
 *   clearable
 * />
 * ```
 */
export const SpoonSearchField: React.FC<SpoonSearchFieldProps> = ({
  placeholder = 'Buscar...',
  value = '',
  onChangeText,
  onSubmitEditing,
  onTap,
  enabled = true,
  autofocus = false,
  suggestions = [],
  onSuggestionPress,
  prefixIcon,
  suffixIcon,
  clearable = true,
  showLoading = false,
  style,
  inputStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = useColors();
  const typography = useTypography();
  const spacing = useSpacing();

  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (suggestions.length > 0 && value.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0 && isFocused);
    } else {
      setShowSuggestions(false);
    }
  }, [value, suggestions, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    if (filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay para permitir que el onPress de las sugerencias funcione
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const handleClear = () => {
    onChangeText?.('');
    inputRef.current?.focus();
  };

  const handleSuggestionPress = (suggestion: string) => {
    onChangeText?.(suggestion);
    onSuggestionPress?.(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const getContainerStyle = (): ViewStyle => ({
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: isFocused ? colors.primary : colors.outline,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  });

  const getInputStyle = (): TextStyle => ({
    ...typography.bodyMedium,
    flex: 1,
    color: colors.textPrimary,
    marginHorizontal: spacing.xs,
    includeFontPadding: false,
    textAlignVertical: 'center',
  });

  const renderPrefixIcon = () => {
    if (prefixIcon) {
      return prefixIcon;
    }

    return (
      <Text style={[styles.icon, { color: colors.textSecondary }]}>
        🔍
      </Text>
    );
  };

  const renderSuffixIcon = () => {
    if (showLoading) {
      return (
        <ActivityIndicator
          size="small"
          color={colors.primary}
          testID={`${testID}-loading`}
        />
      );
    }

    if (clearable && value.length > 0) {
      return (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearButton}
          testID={`${testID}-clear`}
        >
          <Text style={[styles.icon, { color: colors.textSecondary }]}>
            ×
          </Text>
        </TouchableOpacity>
      );
    }

    if (suffixIcon) {
      return suffixIcon;
    }

    return null;
  };

  const renderSuggestions = () => {
    if (!showSuggestions || filteredSuggestions.length === 0) {
      return null;
    }

    return (
      <View style={[styles.suggestionsContainer, {
        backgroundColor: colors.surface,
        borderColor: colors.outline,
        shadowColor: colors.black,
      }]}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={styles.suggestionsList}
          showsVerticalScrollIndicator={false}
        >
          {filteredSuggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.suggestionItem, {
                borderBottomColor: colors.outline,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
              }]}
              onPress={() => handleSuggestionPress(suggestion)}
              testID={`${testID}-suggestion-${index}`}
            >
              <Text style={[styles.suggestionText, {
                color: colors.textPrimary,
                ...typography.bodyMedium,
              }]}>
                {suggestion}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const searchFieldContent = (
    <View style={[getContainerStyle(), style]}>
      {renderPrefixIcon()}
      
      <TextInput
        ref={inputRef}
        style={[getInputStyle(), inputStyle]}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoFocus={autofocus}
        editable={enabled}
        returnKeyType="search"
        clearButtonMode="never" // Usamos nuestro botón custom
        testID={`${testID}-input`}
      />
      
      {renderSuffixIcon()}
    </View>
  );

  // Si es solo de lectura (onTap), envolver en TouchableOpacity
  if (onTap && !enabled) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={onTap} testID={testID}>
          {searchFieldContent}
        </TouchableOpacity>
        {renderSuggestions()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {searchFieldContent}
      {renderSuggestions()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  icon: {
    fontSize: 18,
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1001,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    borderBottomWidth: 0.5,
  },
  suggestionText: {
    textAlign: 'left',
  },
});

export default SpoonSearchField;
