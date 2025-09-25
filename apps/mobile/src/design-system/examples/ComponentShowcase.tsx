// src/design-system/examples/ComponentShowcase.tsx

/**
 * Showcase de todos los componentes del Design System
 * Ejemplo completo de uso de todos los componentes creados
 */

import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import {
  // Provider
  ThemeProvider,
  
  // Components
  SpoonCard,
  SpoonButton,
  SpoonButtonSize,
  SpoonTextField,
  SpoonFoodCard,
  
  // Hooks
  useTheme,
  useColors,
  useSpacing,
  useDarkMode,
  useResponsive,
} from '../index';

const ComponentShowcase: React.FC = () => {
  const colors = useColors();
  const spacing = useSpacing();
  const { toggleTheme, isDark } = useDarkMode();
  const { isTablet, width } = useResponsive();
  
  const [textValue, setTextValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.md,
    },
    scrollView: {
      flexGrow: 1,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    cardContainer: {
      width: isTablet ? '48%' : '100%',
      marginBottom: spacing.sm,
    },
    buttonContainer: {
      marginBottom: spacing.sm,
    },
    inputContainer: {
      marginBottom: spacing.md,
    },
    foodCardContainer: {
      width: 200,
      marginRight: spacing.sm,
    },
    headerCard: {
      padding: spacing.lg,
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    headerSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    deviceInfo: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
      >
        {/* Header */}
        <SpoonCard.filled style={styles.headerCard}>
          <Text style={styles.headerTitle}>
            🥄 Spoon Design System
          </Text>
          <Text style={styles.headerSubtitle}>
            Flutter-style components for React Native
          </Text>
          <Text style={styles.deviceInfo}>
            {isDark ? '🌙 Dark' : '☀️ Light'} • {isTablet ? '📱 Tablet' : '📱 Phone'} • {width}px
          </Text>
        </SpoonCard.filled>

        {/* Theme Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Theme Controls</Text>
          <SpoonButton.outlined
            text={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            onPress={toggleTheme}
            fullWidth
            style={styles.buttonContainer}
          />
        </View>

        {/* Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Cards</Text>
          
          <View style={styles.row}>
            <View style={styles.cardContainer}>
              <SpoonCard.elevated onPress={() => console.log('Elevated card pressed')}>
                <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                  Elevated Card
                </Text>
                <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
                  Card with shadow elevation
                </Text>
              </SpoonCard.elevated>
            </View>

            <View style={styles.cardContainer}>
              <SpoonCard.outlined onPress={() => console.log('Outlined card pressed')}>
                <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                  Outlined Card
                </Text>
                <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
                  Card with border outline
                </Text>
              </SpoonCard.outlined>
            </View>

            <View style={styles.cardContainer}>
              <SpoonCard.filled onPress={() => console.log('Filled card pressed')}>
                <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                  Filled Card
                </Text>
                <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
                  Card with filled background
                </Text>
              </SpoonCard.filled>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔘 Buttons</Text>
          
          <SpoonButton.primary
            text="Primary Button"
            onPress={() => console.log('Primary pressed')}
            fullWidth
            style={styles.buttonContainer}
          />
          
          <SpoonButton.secondary
            text="Secondary Button"
            onPress={() => console.log('Secondary pressed')}
            fullWidth
            style={styles.buttonContainer}
          />
          
          <SpoonButton.outlined
            text="Outlined Button"
            onPress={() => console.log('Outlined pressed')}
            fullWidth
            style={styles.buttonContainer}
          />
          
          <SpoonButton.text
            text="Text Button"
            onPress={() => console.log('Text pressed')}
            fullWidth
            style={styles.buttonContainer}
          />
          
          <SpoonButton.danger
            text="Danger Button"
            onPress={() => console.log('Danger pressed')}
            fullWidth
            style={styles.buttonContainer}
          />

          <View style={styles.row}>
            <SpoonButton.primary
              text="With Icon"
              icon="💾"
              onPress={() => console.log('Icon button pressed')}
              size={SpoonButtonSize.SMALL}
            />
            
            <SpoonButton.outlined
              text="Loading..."
              isLoading={true}
              onPress={() => console.log('Loading button pressed')}
              size={SpoonButtonSize.SMALL}
            />
          </View>
        </View>

        {/* Text Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Text Fields</Text>
          
          <View style={styles.inputContainer}>
            <SpoonTextField
              label="Basic Text Field"
              hint="Enter some text..."
              value={textValue}
              onChangeText={setTextValue}
              isRequired={true}
            />
          </View>

          <View style={styles.inputContainer}>
            <SpoonTextField.email
              label="Email Field"
              hint="your@email.com"
              value={emailValue}
              onChangeText={setEmailValue}
              isRequired={true}
            />
          </View>

          <View style={styles.inputContainer}>
            <SpoonTextField.password
              label="Password Field"
              hint="Enter your password"
              value={passwordValue}
              onChangeText={setPasswordValue}
              isRequired={true}
            />
          </View>

          <View style={styles.inputContainer}>
            <SpoonTextField.phone
              label="Phone Field"
              hint="Enter phone number"
            />
          </View>

          <View style={styles.inputContainer}>
            <SpoonTextField.multiline
              label="Multiline Field"
              hint="Enter multiple lines of text..."
            />
          </View>
        </View>

        {/* Food Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🍔 Food Cards</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: spacing.md }}
          >
            <View style={styles.foodCardContainer}>
              <SpoonFoodCard
                name="Hamburguesa Clásica"
                restaurant="Burger Palace"
                price="$15.900"
                rating={4.5}
                imageUrl="https://example.com/burger.jpg"
                isPopular={true}
                tags={["Popular", "Rápido"]}
                onPress={() => console.log('Food card pressed')}
                onAddToCart={() => console.log('Add to cart pressed')}
              />
            </View>

            <View style={styles.foodCardContainer}>
              <SpoonFoodCard
                name="Pizza Margarita"
                restaurant="Italian Bistro"
                price="$18.500"
                rating={4.8}
                imageUrl="https://example.com/pizza.jpg"
                tags={["Vegetariano", "Clásico"]}
                onPress={() => console.log('Pizza card pressed')}
                onAddToCart={() => console.log('Add pizza to cart')}
              />
            </View>

            <View style={styles.foodCardContainer}>
              <SpoonFoodCard
                name="Sushi Roll"
                restaurant="Tokyo Sushi"
                price="$22.000"
                rating={4.9}
                imageUrl="https://example.com/sushi.jpg"
                isPopular={true}
                tags={["Premium", "Saludable"]}
                onPress={() => console.log('Sushi card pressed')}
                onAddToCart={() => console.log('Add sushi to cart')}
              />
            </View>
          </ScrollView>
        </View>

        {/* Usage Examples */}
        <SpoonCard.outlined style={{ padding: spacing.md }}>
          <Text style={[styles.sectionTitle, { marginBottom: spacing.sm }]}>
            📚 Usage Examples
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 20 }}>
            • SpoonCard.elevated() - Cards with shadow{'\n'}
            • SpoonButton.primary() - Main action buttons{'\n'}
            • SpoonTextField.email() - Email input with validation{'\n'}
            • SpoonFoodCard - Specialized food display{'\n'}
            • useTheme(), useColors(), useResponsive() - Powerful hooks{'\n'}
            • Automatic dark mode support{'\n'}
            • Flutter-inspired constructor patterns
          </Text>
        </SpoonCard.outlined>
      </ScrollView>
    </View>
  );
};

/**
 * App wrapper con ThemeProvider
 */
const AppWithTheme: React.FC = () => {
  return (
    <ThemeProvider>
      <ComponentShowcase />
    </ThemeProvider>
  );
};

export default AppWithTheme;
