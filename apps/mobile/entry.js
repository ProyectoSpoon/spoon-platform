// Early entry shim to neutralize React DevTools and similar backends during dev
// This file executes before the app and ensures any import of devtools returns a safe no-op.
// Install a defensive console wrapper early to prevent runtime crashes when
// code reads internal properties (Hermes can throw on unexpected shapes).
try {
  if (typeof global !== 'undefined') {
    const origConsole = global.console || {};
    const safeConsole = {};
    const methods = ['log','debug','info','warn','error','trace','group','groupCollapsed','groupEnd'];
    methods.forEach(m => {
      const fn = origConsole[m];
      safeConsole[m] = function () {
        try {
          if (typeof fn === 'function') {
            return fn.apply(origConsole, arguments);
          }
        } catch (e) {
          // swallow any console-time errors to avoid cascading failures
        }
      };
    });
    // expose some flags that code may check
    try { safeConsole._isPolyfilled = !!origConsole._isPolyfilled; } catch (e) { safeConsole._isPolyfilled = false; }
    try { safeConsole._errorOriginal = origConsole._errorOriginal || origConsole.error; } catch (e) { safeConsole._errorOriginal = origConsole.error; }
    // preserve other props safely
    Object.keys(origConsole || {}).forEach(k => { if (!(k in safeConsole)) safeConsole[k] = origConsole[k]; });
    // Assign the safe console globally
    global.console = safeConsole;
  }
} catch (e) {
  // noop
}
try {
  // Prevent React DevTools daemon attempts
  if (typeof process !== 'undefined' && process.env) {
    process.env.REACT_DEVTOOLS_NO_DAEMON = '1';
  }
} catch (e) {
  // noop
}

try {
  if (typeof global !== 'undefined') {
    if (!global.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      global.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
        inject() {},
        on() {},
        off() {},
        supportsFiber: false,
      };
    }

    // Monkey-patch require to short-circuit react-devtools-core where possible.
    // Metro may not provide Node's 'module' core; guard the lookup.
    let ModuleImpl = null;
    try {
      // This will throw under Metro/React Native if 'module' isn't available.
      ModuleImpl = require('module');
    } catch (e) {
      ModuleImpl = null;
    }
    if (ModuleImpl && ModuleImpl.prototype && ModuleImpl.prototype.require) {
      const origRequire = ModuleImpl.prototype.require;
      ModuleImpl.prototype.require = function (name) {
        try {
          const re = /^react-devtools(-core)?(\/.*)?$/;
          if (typeof name === 'string' && re.test(name)) {
            // return a minimal no-op module shape
            return {
              initialize: function () {},
              connectToDevTools: function () {},
              connectWithCustomMessagingProtocol: function () {
                return function () {};
              },
            };
          }
        } catch (e) {
          // noop
        }
        return origRequire.apply(this, arguments);
      };
    }
  }
} catch (e) {
  // noop
}

// Load the real app
module.exports = require('./App');
// Entry point shim: ensure React DevTools global hook is present before
// expo/AppEntry runs. This prevents errors in Hermes where react-devtools-core
// attempts to access properties on an undefined hook.
// Ensure environment variable that disables the devtools daemon is set early
try {
  if (typeof process !== 'undefined' && !process.env.REACT_DEVTOOLS_NO_DAEMON) {
    process.env.REACT_DEVTOOLS_NO_DAEMON = '1';
  }
} catch (e) {
  // ignore
}

// Ensure global/window/navigator exist to avoid assumptions from devtools code
if (typeof global !== 'undefined') {
  try {
    if (typeof global.window === 'undefined') global.window = global;
  } catch (e) {}
  try {
    if (typeof global.navigator === 'undefined') global.navigator = { product: 'ReactNative' };
  } catch (e) {}
  try {
    if (!global.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      global.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
        inject: function() {},
        on: function() {},
        off: function() {},
        supportsFiber: false,
      };
    }
  } catch (e) {
    // ignore
  }
}

// Delegate to Expo's AppEntry
// Intercept require to prevent loading react-devtools-core which can execute
// problematic code under Hermes in some environments.
  try {
    const Module = require('module');
    const originalRequire = Module.prototype.require;
    Module.prototype.require = function (path) {
      if (path === 'react-devtools-core' || path === 'react-devtools-core/dist/backend') {
        // return a harmless stub module exposing the functions used by RN
        return {
          initialize: function () {},
          connectToDevTools: function () {},
          connectWithCustomMessagingProtocol: function () { return function() { return { disconnect: function() {} }; }; },
        };
      }
      return originalRequire.apply(this, arguments);
    };
  } catch (e) {
    // ignore if require monkey-patching is not allowed
  }

module.exports = require('expo/AppEntry');
