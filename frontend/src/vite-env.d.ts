/// <reference types="vite/client" />

// Build identity, injected by vite.config.ts `define`. Declared here so the
// badge reads typed constants instead of a literal — see src/lib/buildInfo.ts.
declare const __BUILD_VERSION__: string;
declare const __BUILD_SHA__: string;
declare const __BUILD_TIME__: string;
declare const __BUILD_NETWORK__: string;
