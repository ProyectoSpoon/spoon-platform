// src/design-system/types/index.ts

/**
 * Design System Types para Spoon
 * Definiciones de tipos TypeScript para todo el design system
 */

import * as ReactNative from 'react-native';

// Type aliases para los estilos de React Native
export type ViewStyle = any;
export type TextStyle = any;
export type ImageStyle = any;

// ============================================================================
// BASE TYPES
// ============================================================================

export interface BaseComponentProps {
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export type ResponsiveValue<T> = T | { xs?: T; sm?: T; md?: T; lg?: T; xl?: T };

// ============================================================================
// COMPONENT TYPES
// ============================================================================

// Card Types
export type SpoonCardType = 'elevated' | 'outlined' | 'filled';

export interface SpoonCardProps extends BaseComponentProps {
  children: React.ReactNode;
  type?: SpoonCardType;
  onPress?: () => void;
  padding?: number | string;
  margin?: number | string;
  elevation?: number;
  backgroundColor?: string;
  borderRadius?: number;
  width?: number | string;
  height?: number | string;
  style?: ViewStyle;
}

// Button Types
export type SpoonButtonType = 'primary' | 'secondary' | 'outlined' | 'text' | 'danger';
export type SpoonButtonSize = 'small' | 'medium' | 'large';

export interface SpoonButtonProps extends BaseComponentProps {
  text: string;
  onPress?: () => void;
  type?: SpoonButtonType;
  size?: SpoonButtonSize;
  isLoading?: boolean;
  icon?: SpoonIconName;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

// TextField Types
export type SpoonTextFieldType = 'text' | 'email' | 'password' | 'phone' | 'number' | 'multiline';

export interface SpoonTextFieldProps extends BaseComponentProps {
  label: string;
  hint?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmitEditing?: () => void;
  type?: SpoonTextFieldType;
  isRequired?: boolean;
  enabled?: boolean;
  readOnly?: boolean;
  obscureText?: boolean;
  validator?: (value: string) => string | null;
  prefixIcon?: SpoonIconName;
  suffixIcon?: SpoonIconName;
  onSuffixIconPress?: () => void;
  maxLines?: number;
  maxLength?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  error?: string;
}

// Icon Types
export type SpoonIconName = 
  // Navigation
  | 'back-arrow' | 'forward-arrow' | 'menu' | 'close' | 'search' | 'filter'
  // Location
  | 'location' | 'gps' | 'map'
  // User
  | 'user' | 'heart' | 'heart-filled' | 'profile'
  // Delivery
  | 'delivery' | 'pickup' | 'time' | 'fast'
  // Ratings
  | 'star' | 'star-filled' | 'star-half'
  // Food Categories
  | 'pizza' | 'burger' | 'sushi' | 'tacos' | 'pasta' | 'salad' | 'dessert' | 'drinks' | 'coffee'
  // States
  | 'open' | 'closed' | 'busy'
  // Actions
  | 'add' | 'remove' | 'edit' | 'delete' | 'share'
  // Communication
  | 'phone' | 'message' | 'email'
  // Information
  | 'info' | 'help' | 'warning' | 'error' | 'success'
  // Feather Icons (cualquier icono de Feather)
  | string;

export type SpoonIconSize = number | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface SpoonIconProps extends BaseComponentProps {
  name: SpoonIconName;
  size?: SpoonIconSize;
  color?: string;
  style?: TextStyle;
}

// ============================================================================
// SPECIALIZED FOOD DELIVERY TYPES
// ============================================================================

// Restaurant Card Types
export interface SpoonRestaurantCardProps extends BaseComponentProps {
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: string;
  imageUrl: string;
  onTap?: () => void;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  distance?: string;
  isOpen?: boolean;
  style?: ViewStyle;
}

// Food Card Types
export interface SpoonFoodCardProps extends BaseComponentProps {
  name: string;
  restaurant: string;
  price: string;
  rating: number;
  imageUrl: string;
  onTap?: () => void;
  onAddToCart?: () => void;
  isPopular?: boolean;
  isAvailable?: boolean;
  tags?: string[];
  style?: ViewStyle;
}

// Category Card Types
export interface SpoonCategoryCardProps extends BaseComponentProps {
  name: string;
  imageUrl: string;
  onTap: () => void;
  width?: number;
  height?: number;
  style?: ViewStyle;
}

// Special Card Types
export interface SpoonSpecialCardProps extends BaseComponentProps {
  name: string;
  rating: number;
  distance: string;
  price: string;
  imageUrl: string;
  onTap: () => void;
  width?: number;
  style?: ViewStyle;
}

// Recommended Card Types
export interface SpoonRecommendedCardProps extends BaseComponentProps {
  name: string;
  category: string;
  rating: number;
  price: string;
  imageUrl: string;
  onTap: () => void;
  style?: ViewStyle;
}

// Search Field Types
export interface SpoonSearchFieldProps extends BaseComponentProps {
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
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

// ============================================================================
// THEME TYPES
// ============================================================================

export interface SpoonThemeColors {
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Secondary colors
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  
  // Semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Base colors
  white: string;
  black: string;
  surface: string;
  surfaceVariant: string;
  background: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  textOnPrimary: string;
  textOnSecondary: string;
  
  // Border and divider colors
  border: string;
  borderLight: string;
  divider: string;
  outline: string;
  
  // Special colors
  shimmer: string;
  cardShadow: string;
  overlay: string;
  
  // Grays (Material Design scale)
  grey50: string;
  grey100: string;
  grey200: string;
  grey300: string;
  grey400: string;
  grey500: string;
  grey600: string;
  grey700: string;
  grey800: string;
  grey900: string;
}

export interface SpoonThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface SpoonThemeTypography {
  // Material Design 3 Typography Scale
  displayLarge: TextStyle;
  displayMedium: TextStyle;
  displaySmall: TextStyle;
  headlineLarge: TextStyle;
  headlineMedium: TextStyle;
  headlineSmall: TextStyle;
  titleLarge: TextStyle;
  titleMedium: TextStyle;
  titleSmall: TextStyle;
  labelLarge: TextStyle;
  labelMedium: TextStyle;
  labelSmall: TextStyle;
  bodyLarge: TextStyle;
  bodyMedium: TextStyle;
  bodySmall: TextStyle;
}

export interface SpoonThemeRadii {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface SpoonThemeShadows {
  none: ViewStyle;
  sm: ViewStyle;
  md: ViewStyle;
  lg: ViewStyle;
  xl: ViewStyle;
}

export interface SpoonTheme {
  colors: SpoonThemeColors;
  spacing: SpoonThemeSpacing;
  typography: SpoonThemeTypography;
  radii: SpoonThemeRadii;
  shadows: SpoonThemeShadows;
}

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

// App Bar Types
export type SpoonAppBarType = 'primary' | 'secondary' | 'transparent' | 'gradient';

export interface SpoonAppBarProps extends BaseComponentProps {
  title?: string;
  titleWidget?: React.ReactNode;
  type?: SpoonAppBarType;
  actions?: React.ReactNode[];
  leading?: React.ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
  backgroundColor?: string;
  foregroundColor?: string;
  elevation?: number;
  style?: ViewStyle;
}

// Bottom Sheet Types
export type SpoonBottomSheetType = 'modal' | 'persistent' | 'draggable' | 'fullScreen';

export interface SpoonBottomSheetProps extends BaseComponentProps {
  children: React.ReactNode;
  title?: string;
  type?: SpoonBottomSheetType;
  showHandle?: boolean;
  isDismissible?: boolean;
  enableDrag?: boolean;
  height?: number;
  onClose?: () => void;
  style?: ViewStyle;
}

// ============================================================================
// DIALOG TYPES
// ============================================================================

export type SpoonDialogType = 
  | 'alert' 
  | 'confirmation' 
  | 'success' 
  | 'error' 
  | 'warning' 
  | 'info' 
  | 'loading' 
  | 'custom';

export interface SpoonDialogProps extends BaseComponentProps {
  title?: string;
  message?: string;
  content?: React.ReactNode;
  actions?: React.ReactNode[];
  type?: SpoonDialogType;
  icon?: React.ReactNode;
  visible: boolean;
  onDismiss: () => void;
  dismissible?: boolean;
}

// ============================================================================
// FORM TYPES
// ============================================================================

// Toggle Switch Types
export type SpoonToggleSwitchSize = 'small' | 'medium' | 'large';

export interface SpoonToggleSwitchProps extends BaseComponentProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  size?: SpoonToggleSwitchSize;
  activeColor?: string;
  inactiveColor?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

// Chip Types
export type SpoonChipType = 'filter' | 'choice' | 'action' | 'input';
export type SpoonChipSize = 'small' | 'medium' | 'large';

export interface SpoonChipProps extends BaseComponentProps {
  label: string;
  type?: SpoonChipType;
  size?: SpoonChipSize;
  selected?: boolean;
  onPress?: () => void;
  onDelete?: () => void;
  icon?: SpoonIconName;
  avatar?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

// Style Generator Types
export interface StyleGeneratorOptions {
  theme: SpoonTheme;
  type?: string;
  size?: string;
  variant?: string;
  disabled?: boolean;
  selected?: boolean;
  error?: boolean;
  customProps?: Record<string, any>;
}

export type StyleGenerator<T = ViewStyle> = (options: StyleGeneratorOptions) => T;

// Validation Types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

// Event Types
export type SpoonEventHandler<T = void> = () => T;
export type SpoonChangeHandler<T> = (value: T) => void;
export type SpoonPressHandler = () => void;

// Animation Types
export interface SpoonAnimationConfig {
  duration?: number;
  delay?: number;
  easing?: string;
  useNativeDriver?: boolean;
}

// ============================================================================
// CONTEXT TYPES
// ============================================================================

export interface SpoonThemeContextType {
  theme: SpoonTheme;
  updateTheme: (newTheme: Partial<SpoonTheme>) => void;
  resetTheme: () => void;
}

export interface SpoonThemeProviderProps {
  children: React.ReactNode;
  customTheme?: Partial<SpoonTheme>;
  persistTheme?: boolean;
}

// ============================================================================
// HOOK TYPES
// ============================================================================

export interface UseSpoonValidationOptions {
  rules: ValidationRules;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseSpoonValidationReturn {
  errors: Record<string, string>;
  validate: (field?: string) => boolean;
  validateAll: () => boolean;
  clearErrors: (field?: string) => void;
  isValid: boolean;
}

// ============================================================================
// COMPONENT COMPOSITION TYPES
// ============================================================================

// Para constructores especializados como SpoonCard.elevated()
export interface SpoonCardStaticMethods {
  elevated: (props: Omit<SpoonCardProps, 'type'>) => React.ReactElement;
  outlined: (props: Omit<SpoonCardProps, 'type'>) => React.ReactElement;
  filled: (props: Omit<SpoonCardProps, 'type'>) => React.ReactElement;
}

export interface SpoonButtonStaticMethods {
  primary: (props: Omit<SpoonButtonProps, 'type'>) => React.ReactElement;
  secondary: (props: Omit<SpoonButtonProps, 'type'>) => React.ReactElement;
  outlined: (props: Omit<SpoonButtonProps, 'type'>) => React.ReactElement;
  text: (props: Omit<SpoonButtonProps, 'type'>) => React.ReactElement;
  danger: (props: Omit<SpoonButtonProps, 'type'>) => React.ReactElement;
}

export interface SpoonIconStaticMethods {
  primary: (props: Omit<SpoonIconProps, 'color'>) => React.ReactElement;
  secondary: (props: Omit<SpoonIconProps, 'color'>) => React.ReactElement;
  success: (props: Omit<SpoonIconProps, 'color'>) => React.ReactElement;
  warning: (props: Omit<SpoonIconProps, 'color'>) => React.ReactElement;
  error: (props: Omit<SpoonIconProps, 'color'>) => React.ReactElement;
  onPrimary: (props: Omit<SpoonIconProps, 'color'>) => React.ReactElement;
  navigation: (props: Omit<SpoonIconProps, 'color'>) => React.ReactElement;
}

// ============================================================================
// COMPONENT REFS
// ============================================================================

export interface SpoonTextFieldRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
}

export interface SpoonBottomSheetRef {
  open: () => void;
  close: () => void;
  toggle: () => void;
}

// ============================================================================
// DATA TYPES (para componentes especializados)
// ============================================================================

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: string;
  imageUrl: string;
  isOpen: boolean;
  distance?: string;
  isFavorite?: boolean;
}

export interface Food {
  id: string;
  name: string;
  restaurant: string;
  restaurantId: string;
  price: number;
  rating: number;
  imageUrl: string;
  isPopular?: boolean;
  isAvailable?: boolean;
  tags?: string[];
  description?: string;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
  iconName?: SpoonIconName;
  count?: number;
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

// Export utility type helpers
export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;


