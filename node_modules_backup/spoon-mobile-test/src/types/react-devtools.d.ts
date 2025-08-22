// Provide global/type declarations used by the entry shim and by runtime
export {};

declare global {
  // Development flag used by React Native
  var __DEV__: boolean | undefined;

  // Minimal shape for the React DevTools global hook we stub at runtime
  interface ReactDevtoolsHook {
    inject?: (...args: any[]) => void;
    on?: (...args: any[]) => void;
    off?: (...args: any[]) => void;
    supportsFiber?: boolean;
    [key: string]: any;
  }

  var __REACT_DEVTOOLS_GLOBAL_HOOK__: ReactDevtoolsHook | undefined;

  // Allow access via global properties
  interface Global {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: ReactDevtoolsHook;
    __DEV__?: boolean;
  }
}
