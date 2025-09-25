// Minimal module declaration for @react-navigation/native to silence TS in the editor
declare module '@react-navigation/native' {
  export function useNavigation<T = any>(): T;
  export function useRoute(): any;
  export type NavigationContainerProps = any;
  const NavigationContainer: any;
  export { NavigationContainer };
}

declare module '@react-navigation/stack' {
  export function createStackNavigator(): any;
  export type StackNavigationProp<ParamList, RouteName extends keyof ParamList = string> = any;
}

declare module '@react-navigation/bottom-tabs' {
  export function createBottomTabNavigator(): any;
}
