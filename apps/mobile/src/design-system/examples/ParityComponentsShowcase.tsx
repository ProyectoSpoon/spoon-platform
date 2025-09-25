// src/design-system/examples/ParityComponentsShowcase.tsx

/**
 * Showcase de los componentes de paridad Flutter (Fase 5.5)
 * Ejemplo de SpoonAppBar, SpoonChip, SpoonSearchField, SpoonToggleSwitch, SpoonDialog
 */

import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import {
  // Provider
  ThemeProvider,
  
  // Componentes básicos
  SpoonCard,
  SpoonButton,
  
  // Componentes de paridad (Fase 5.5)
  SpoonAppBar,
  SpoonAppBarType,
  SpoonChip,
  SpoonChipType,
  SpoonChipSize,
  SpoonSearchField,
  SpoonToggleSwitch,
  SpoonLabeledToggle,
  SpoonToggleGroup,
  SpoonToggleSwitchSize,
  SpoonDialog,
  SpoonDialogType,
  
  // Hooks
  useColors,
  useSpacing,
  useDarkMode,
  useResponsive,
} from '../index';

const ParityComponentsShowcase: React.FC = () => {
  const colors = useColors();
  const spacing = useSpacing();
  const { toggleTheme, isDark } = useDarkMode();
  const { isTablet } = useResponsive();

  // States for components
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [toggle1, setToggle1] = useState(false);
  const [toggle2, setToggle2] = useState(true);
  const [toggle3, setToggle3] = useState(false);
  
  // Dialog states
  const [showAlert, setShowAlert] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: spacing.md,
      paddingBottom: spacing.xxl,
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
    subsection: {
      marginBottom: spacing.lg,
    },
    subsectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    buttonRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    buttonContainer: {
      flex: 1,
      minWidth: isTablet ? 200 : 150,
    },
    demoCard: {
      padding: spacing.md,
      marginBottom: spacing.md,
    },
  });

  // Mock data
  const foodCategories = ['Pizza', 'Hamburguesa', 'Sushi', 'Tacos', 'Pasta', 'Ensalada'];
  const searchSuggestions = ['Pizza Margherita', 'Hamburguesa BBQ', 'Sushi Roll', 'Tacos al Pastor'];

  const toggleItems = [
    { key: 'notifications', label: 'Notificaciones Push', subtitle: 'Recibe alertas en tiempo real', value: toggle1 },
    { key: 'location', label: 'Ubicación', subtitle: 'Permite acceso a tu ubicación', value: toggle2 },
    { key: 'darkmode', label: 'Modo Oscuro', subtitle: 'Cambia el tema de la app', value: toggle3 },
  ];

  const handleChipPress = (chip: string) => {
    setSelectedChips(prev => 
      prev.includes(chip) 
        ? prev.filter(c => c !== chip)
        : [...prev, chip]
    );
  };

  const handleToggleGroupChange = (key: string, value: boolean) => {
    switch (key) {
      case 'notifications':
        setToggle1(value);
        break;
      case 'location':
        setToggle2(value);
        break;
      case 'darkmode':
        setToggle3(value);
        break;
    }
  };

  const simulateLoading = () => {
    setShowLoading(true);
    setTimeout(() => {
      setShowLoading(false);
      setShowSuccess(true);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      {/* App Bar */}
      <SpoonAppBar.primary
        title="Componentes de Paridad"
        showBackButton
        onBackPress={() => console.log('Back pressed')}
        actions={[
          <SpoonButton.text
            key="theme"
            text={isDark ? '☀️' : '🌙'}
            onPress={toggleTheme}
          />,
        ]}
      />

      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <SpoonCard.filled style={styles.demoCard}>
          <Text style={{
            fontSize: 24,
            fontWeight: '700',
            color: colors.primary,
            textAlign: 'center',
            marginBottom: spacing.sm,
          }}>
            🎯 Paridad Flutter Completa
          </Text>
          <Text style={{
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
            marginBottom: spacing.md,
          }}>
            Fase 5.5: 5 nuevos componentes agregados
          </Text>
          <Text style={{
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: 'center',
          }}>
            Total: 12 componentes • 7 categorías
          </Text>
        </SpoonCard.filled>

        {/* Search Field */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔍 Search Field</Text>
          
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Búsqueda básica:</Text>
            <SpoonSearchField
              placeholder="Buscar restaurantes..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => console.log('Search:', searchQuery)}
            />
          </View>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Con sugerencias:</Text>
            <SpoonSearchField
              placeholder="Buscar comida..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              suggestions={searchSuggestions}
              onSuggestionPress={(suggestion) => {
                setSearchQuery(suggestion);
                console.log('Selected:', suggestion);
              }}
              clearable
            />
          </View>
        </View>

        {/* Chips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏷️ Chips</Text>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Filter Chips:</Text>
            <View style={styles.chipContainer}>
              {foodCategories.map((category) => (
                <SpoonChip.filter
                  key={category}
                  label={category}
                  isSelected={selectedChips.includes(category)}
                  onPress={() => handleChipPress(category)}
                />
              ))}
            </View>
          </View>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Choice Chips:</Text>
            <View style={styles.chipContainer}>
              <SpoonChip.choice
                label="Rápido"
                isSelected={selectedChips.includes('fast')}
                onPress={() => handleChipPress('fast')}
              />
              <SpoonChip.choice
                label="Económico"
                isSelected={selectedChips.includes('cheap')}
                onPress={() => handleChipPress('cheap')}
              />
              <SpoonChip.choice
                label="Premium"
                isSelected={selectedChips.includes('premium')}
                onPress={() => handleChipPress('premium')}
              />
            </View>
          </View>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Action & Tag Chips:</Text>
            <View style={styles.chipContainer}>
              <SpoonChip.action
                label="Añadir filtro"
                avatar={<Text style={{ color: colors.primary }}>+</Text>}
                onPress={() => console.log('Add filter')}
              />
              <SpoonChip.input
                label="Italiana"
                onDelete={() => console.log('Remove italiana')}
              />
              <SpoonChip.tag
                label="Popular"
                size={SpoonChipSize.SMALL}
              />
              <SpoonChip.tag
                label="Nuevo"
                size={SpoonChipSize.SMALL}
              />
            </View>
          </View>
        </View>

        {/* Toggle Switches */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔄 Toggle Switches</Text>

          <SpoonCard.outlined style={styles.demoCard}>
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Toggles básicos:</Text>
              
              <SpoonLabeledToggle
                label="Notificaciones"
                subtitle="Recibe alertas importantes"
                value={toggle1}
                onValueChange={setToggle1}
              />

              <SpoonLabeledToggle
                label="Modo Oscuro"
                value={toggle2}
                onValueChange={setToggle2}
                size={SpoonToggleSwitchSize.LARGE}
              />
            </View>

            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Grupo de toggles:</Text>
              <SpoonToggleGroup
                title="Configuración de la App"
                items={toggleItems}
                onToggleChange={handleToggleGroupChange}
              />
            </View>
          </SpoonCard.outlined>
        </View>

        {/* Dialogs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 Dialogs</Text>

          <SpoonCard.outlined style={styles.demoCard}>
            <View style={styles.buttonRow}>
              <View style={styles.buttonContainer}>
                <SpoonButton.primary
                  text="Alert"
                  onPress={() => setShowAlert(true)}
                  fullWidth
                />
              </View>
              
              <View style={styles.buttonContainer}>
                <SpoonButton.secondary
                  text="Confirm"
                  onPress={() => setShowConfirmation(true)}
                  fullWidth
                />
              </View>
            </View>

            <View style={styles.buttonRow}>
              <View style={styles.buttonContainer}>
                <SpoonButton.text
                  text="Success"
                  onPress={() => setShowSuccess(true)}
                  fullWidth
                />
              </View>
              
              <View style={styles.buttonContainer}>
                <SpoonButton.danger
                  text="Error"
                  onPress={() => setShowError(true)}
                  fullWidth
                />
              </View>
            </View>

            <SpoonButton.outlined
              text="Loading Demo"
              onPress={simulateLoading}
              fullWidth
            />
          </SpoonCard.outlined>
        </View>

        {/* App Bar Variants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 App Bar Variants</Text>
          
          <SpoonCard.outlined style={styles.demoCard}>
            <Text style={styles.subsectionTitle}>Different App Bar styles:</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              • Primary: Color principal con sombra{'\n'}
              • Secondary: Fondo claro con borde{'\n'}
              • Transparent: Fondo transparente{'\n'}
              • Gradient: Con gradiente de colores
            </Text>
          </SpoonCard.outlined>
        </View>
      </ScrollView>

      {/* Dialogs */}
      <SpoonDialog.alert
        visible={showAlert}
        title="Información"
        message="Este es un ejemplo de dialog de alerta con información importante."
        onClose={() => setShowAlert(false)}
        primaryAction={{
          text: 'Entendido',
          onPress: () => setShowAlert(false)
        }}
      />

      <SpoonDialog.confirmation
        visible={showConfirmation}
        title="Confirmar acción"
        message="¿Estás seguro de que quieres realizar esta acción? No se puede deshacer."
        onClose={() => setShowConfirmation(false)}
        primaryAction={{
          text: 'Confirmar',
          onPress: () => {
            setShowConfirmation(false);
            console.log('Confirmed');
          },
          type: 'primary'
        }}
        secondaryAction={{
          text: 'Cancelar',
          onPress: () => setShowConfirmation(false),
          type: 'secondary'
        }}
      />

      <SpoonDialog.success
        visible={showSuccess}
        title="¡Éxito!"
        message="La operación se completó correctamente."
        onClose={() => setShowSuccess(false)}
      />

      <SpoonDialog.error
        visible={showError}
        title="Error"
        message="Ocurrió un error inesperado. Por favor, inténtalo de nuevo."
        onClose={() => setShowError(false)}
      />

      <SpoonDialog.loading
        visible={showLoading}
        title="Procesando..."
        message="Por favor espera mientras completamos la operación."
        onClose={() => setShowLoading(false)}
      />
    </View>
  );
};

/**
 * App wrapper con ThemeProvider
 */
const ParityComponentsApp: React.FC = () => {
  return (
    <ThemeProvider>
      <ParityComponentsShowcase />
    </ThemeProvider>
  );
};

export default ParityComponentsApp;
