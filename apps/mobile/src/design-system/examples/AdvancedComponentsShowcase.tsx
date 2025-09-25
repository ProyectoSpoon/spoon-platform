// src/design-system/examples/AdvancedComponentsShowcase.tsx

/**
 * Showcase de los componentes avanzados (Fase 5)
 * Ejemplo de SpoonModal, SpoonBottomSheet, SpoonTabs, SpoonToast
 */

import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import {
  // Provider
  ThemeProvider,
  
  // Componentes básicos
  SpoonCard,
  SpoonButton,
  SpoonTextField,
  
  // Componentes avanzados (Fase 5)
  SpoonModal,
  SpoonBottomSheet,
  SpoonTabs,
  SpoonToast,
  SpoonToastType,
  
  // Hooks
  useColors,
  useSpacing,
  useDarkMode,
  useResponsive,
} from '../index';

const AdvancedComponentsShowcase: React.FC = () => {
  const colors = useColors();
  const spacing = useSpacing();
  const { toggleTheme, isDark } = useDarkMode();
  const { isTablet } = useResponsive();

  // Modal states
  const [showDialog, setShowDialog] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);
  
  // Toast states
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [showWarningToast, setShowWarningToast] = useState(false);
  
  // Tabs state
  const [activeTab, setActiveTab] = useState('modals');

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
    tabContent: {
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: 8,
      marginTop: spacing.md,
    },
    modalContent: {
      padding: spacing.md,
    },
    modalText: {
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
  });

  // Datos para las tabs
  const tabsData = [
    {
      key: 'modals',
      title: 'Modals',
      icon: '📋',
      content: (
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Modal Examples</Text>
          
          <View style={styles.buttonRow}>
            <View style={styles.buttonContainer}>
              <SpoonButton.primary
                text="Show Dialog"
                onPress={() => setShowDialog(true)}
                fullWidth
              />
            </View>
            
            <View style={styles.buttonContainer}>
              <SpoonButton.secondary
                text="Bottom Sheet"
                onPress={() => setShowBottomSheet(true)}
                fullWidth
              />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <View style={styles.buttonContainer}>
              <SpoonButton.outlined
                text="Fullscreen"
                onPress={() => setShowFullscreenModal(true)}
                fullWidth
              />
            </View>
          </View>

          <Text style={{ color: colors.textSecondary, marginTop: spacing.md }}>
            Tap the buttons above to see different modal types in action.
          </Text>
        </View>
      ),
    },
    {
      key: 'toasts',
      title: 'Toasts',
      icon: '📢',
      badge: 3,
      content: (
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Toast Examples</Text>
          
          <View style={styles.buttonRow}>
            <View style={styles.buttonContainer}>
              <SpoonButton.primary
                text="Success Toast"
                onPress={() => setShowSuccessToast(true)}
                fullWidth
              />
            </View>
            
            <View style={styles.buttonContainer}>
              <SpoonButton.danger
                text="Error Toast"
                onPress={() => setShowErrorToast(true)}
                fullWidth
              />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <View style={styles.buttonContainer}>
              <SpoonButton.outlined
                text="Warning Toast"
                onPress={() => setShowWarningToast(true)}
                fullWidth
              />
            </View>
            
            <View style={styles.buttonContainer}>
              <SpoonButton.text
                text="Global Toast"
                onPress={() => {
                  SpoonToast.show({
                    id: 'global-toast',
                    message: 'Global toast message!',
                    type: SpoonToastType.INFO,
                    duration: 3000,
                  });
                }}
                fullWidth
              />
            </View>
          </View>

          <Text style={{ color: colors.textSecondary, marginTop: spacing.md }}>
            Toasts provide quick feedback for user actions.
          </Text>
        </View>
      ),
    },
    {
      key: 'navigation',
      title: 'Navigation',
      icon: '🧭',
      content: (
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Tab Variants</Text>

          {/* Pills Tabs */}
          <Text style={{ color: colors.textPrimary, fontWeight: '600', marginBottom: spacing.sm }}>
            Pills Style:
          </Text>
          <SpoonTabs.pills
            tabs={[
              { key: 'tab1', title: 'Option 1', icon: '🔵' },
              { key: 'tab2', title: 'Option 2', icon: '🟢' },
              { key: 'tab3', title: 'Option 3', icon: '🟡' },
            ]}
            activeTab="tab1"
            onTabChange={(tab) => console.log('Pills tab:', tab)}
            style={{ marginBottom: spacing.lg }}
          />

          {/* Underline Tabs */}
          <Text style={{ color: colors.textPrimary, fontWeight: '600', marginBottom: spacing.sm }}>
            Underline Style:
          </Text>
          <SpoonTabs.underline
            tabs={[
              { key: 'home', title: 'Home', icon: '🏠' },
              { key: 'search', title: 'Search', icon: '🔍' },
              { key: 'profile', title: 'Profile', icon: '👤', badge: 2 },
            ]}
            activeTab="home"
            onTabChange={(tab) => console.log('Underline tab:', tab)}
            style={{ marginBottom: spacing.lg }}
          />

          {/* Segmented Tabs */}
          <Text style={{ color: colors.textPrimary, fontWeight: '600', marginBottom: spacing.sm }}>
            Segmented Style:
          </Text>
          <SpoonTabs.segmented
            tabs={[
              { key: 'list', title: 'List' },
              { key: 'grid', title: 'Grid' },
              { key: 'map', title: 'Map' },
            ]}
            activeTab="list"
            onTabChange={(tab) => console.log('Segmented tab:', tab)}
          />
        </View>
      ),
    },
  ];

  const handleConfirmAction = () => {
    setShowDialog(false);
    setShowSuccessToast(true);
  };

  const handleDeleteAction = () => {
    setShowBottomSheet(false);
    setShowErrorToast(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
      >
        {/* Header */}
        <SpoonCard.filled style={{ padding: spacing.lg, marginBottom: spacing.xl }}>
          <Text style={{
            fontSize: 24,
            fontWeight: '700',
            color: colors.primary,
            textAlign: 'center',
            marginBottom: spacing.sm,
          }}>
            🚀 Advanced Components
          </Text>
          <Text style={{
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
            marginBottom: spacing.md,
          }}>
            Fase 5: Modals, Navigation & Feedback
          </Text>

          <SpoonButton.outlined
            text={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            onPress={toggleTheme}
            fullWidth
          />
        </SpoonCard.filled>

        {/* Main Tabs */}
        <SpoonTabs
          tabs={tabsData}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          showIcons
          showBadges
          animated
        />
      </ScrollView>

      {/* Modals */}
      
      {/* Dialog Modal */}
      <SpoonModal.dialog
        visible={showDialog}
        title="Confirm Action"
        subtitle="Are you sure you want to proceed with this action? This cannot be undone."
        onClose={() => setShowDialog(false)}
        primaryAction={{
          text: 'Confirm',
          onPress: handleConfirmAction,
        }}
        secondaryAction={{
          text: 'Cancel',
          onPress: () => setShowDialog(false),
        }}
        testID="confirm-dialog"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            Esta es una confirmación importante que requiere tu atención.
          </Text>
          <Text style={[styles.modalText, { fontSize: 14, color: colors.textSecondary }]}>
            Por favor, lee cuidadosamente antes de continuar.
          </Text>
        </View>
      </SpoonModal.dialog>

      {/* Bottom Sheet */}
      <SpoonBottomSheet
        visible={showBottomSheet}
        title="Choose Action"
        subtitle="Select one of the options below"
        onClose={() => setShowBottomSheet(false)}
        snapPoints={['30%', '50%']}
        testID="action-bottom-sheet"
      >
        <View style={{ gap: spacing.sm }}>
          <SpoonButton.text
            text="📝 Edit Item"
            onPress={() => {
              setShowBottomSheet(false);
              console.log('Edit action');
            }}
            fullWidth
          />
          <SpoonButton.text
            text="📤 Share Item"
            onPress={() => {
              setShowBottomSheet(false);
              console.log('Share action');
            }}
            fullWidth
          />
          <SpoonButton.danger
            text="🗑️ Delete Item"
            onPress={handleDeleteAction}
            fullWidth
          />
        </View>
      </SpoonBottomSheet>

      {/* Fullscreen Modal */}
      <SpoonModal.fullscreen
        visible={showFullscreenModal}
        onClose={() => setShowFullscreenModal(false)}
        testID="fullscreen-modal"
      >
        <View style={{
          flex: 1,
          backgroundColor: colors.background,
          padding: spacing.lg,
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing.xl,
          }}>
            <Text style={{
              fontSize: 24,
              fontWeight: '700',
              color: colors.textPrimary,
            }}>
              Fullscreen Modal
            </Text>
            <SpoonButton.text
              text="Close"
              onPress={() => setShowFullscreenModal(false)}
            />
          </View>

          {/* Content */}
          <ScrollView style={{ flex: 1 }}>
            <SpoonCard.outlined style={{ marginBottom: spacing.md }}>
              <Text style={{
                color: colors.textPrimary,
                fontSize: 18,
                fontWeight: '600',
                marginBottom: spacing.sm,
              }}>
                Sample Form
              </Text>
              
              <SpoonTextField.email
                label="Email"
                hint="Enter your email"
                style={{ marginBottom: spacing.md }}
              />
              
              <SpoonTextField.password
                label="Password"
                hint="Enter your password"
                style={{ marginBottom: spacing.md }}
              />
              
              <SpoonButton.primary
                text="Submit"
                onPress={() => {
                  setShowFullscreenModal(false);
                  setShowSuccessToast(true);
                }}
                fullWidth
              />
            </SpoonCard.outlined>
          </ScrollView>
        </View>
      </SpoonModal.fullscreen>

      {/* Toasts */}
      <SpoonToast.success
        visible={showSuccessToast}
        message="Success!"
        description="Your action was completed successfully."
        onHide={() => setShowSuccessToast(false)}
        action={{
          text: 'View',
          onPress: () => {
            setShowSuccessToast(false);
            console.log('View action');
          },
        }}
        testID="success-toast"
      />

      <SpoonToast.error
        visible={showErrorToast}
        message="Error occurred"
        description="Something went wrong. Please try again."
        onHide={() => setShowErrorToast(false)}
        showCloseButton
        testID="error-toast"
      />

      <SpoonToast.warning
        visible={showWarningToast}
        message="Warning"
        description="This action requires your attention."
        onHide={() => setShowWarningToast(false)}
        duration={6000}
        testID="warning-toast"
      />
    </View>
  );
};

/**
 * App wrapper con ThemeProvider
 */
const AdvancedComponentsApp: React.FC = () => {
  return (
    <ThemeProvider>
      <AdvancedComponentsShowcase />
    </ThemeProvider>
  );
};

export default AdvancedComponentsApp;
