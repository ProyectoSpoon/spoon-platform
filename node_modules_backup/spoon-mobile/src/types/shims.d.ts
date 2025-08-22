// Shims for native/external packages used by the mobile app (editor-only)

declare module '@react-native-async-storage/async-storage' {
  const AsyncStorage: any;
  export default AsyncStorage;
}

declare module '@supabase/supabase-js' {
  export function createClient(...args: any[]): any;
}

declare module 'expo-location' {
  export function requestForegroundPermissionsAsync(): Promise<any>;
  export function getCurrentPositionAsync(options?: { accuracy?: Accuracy }): Promise<LocationObject>;
  export enum Accuracy {
    Lowest = 0,
    Low = 1,
    Balanced = 2,
    High = 3,
    Highest = 4,
    BestForNavigation = 5,
  }

  export type LocationObject = {
    coords: {
      latitude: number;
      longitude: number;
      altitude?: number | null;
      accuracy?: number | null;
      heading?: number | null;
      speed?: number | null;
    };
    timestamp: number;
  };

  const Location: {
    requestForegroundPermissionsAsync(): Promise<{ status: string }>;
    getCurrentPositionAsync(options?: { accuracy?: Accuracy }): Promise<LocationObject>;
    watchPositionAsync(
      options: { accuracy?: Accuracy },
      callback: (loc: LocationObject) => void
    ): Promise<{ remove(): void }>;
  };

  export default Location;
}
