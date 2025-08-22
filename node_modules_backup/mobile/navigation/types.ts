// Profile Navigation Types
export type ProfileStackParamList = {
  UserProfile: undefined
  EditProfile: undefined
  Security: undefined
  ChangePassword: undefined
  Notifications: undefined
  Privacy: undefined
  Preferences: undefined
  Help: undefined
  ContactSupport: undefined
  About: undefined
  PrivacyPolicy: undefined
  TermsConditions: undefined
  Connections: undefined
}

export type MainStackParamList = {
  Home: undefined
  Search: undefined
  Favorites: undefined
  Profile: undefined
  RestaurantDetail: { restaurantId: string }
  DishDetail: { dishId: string }
  // Profile Stack
  ProfileStack: undefined
}
