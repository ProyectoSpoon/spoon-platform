// Global declarations for the mobile app (editor/TS server helpers)
// Declares __DEV__ and the devtools hook used at runtime by our shim.

declare var __DEV__: boolean;

declare namespace NodeJS {
  interface Global {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: any;
  }
}

declare var __REACT_DEVTOOLS_GLOBAL_HOOK__: any;

declare global {
  var __DEV__: boolean;
  var __REACT_DEVTOOLS_GLOBAL_HOOK__: any;
}

declare global {
  interface Global {
    __DEV__?: boolean;
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: any;
  }
}

export {};
