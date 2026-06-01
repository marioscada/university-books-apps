/// <reference types="vite/client" />

/**
 * Vite Environment Variables Type Definitions
 *
 * Extends ImportMeta interface to include Vite's env object.
 * This provides TypeScript autocompletion and type safety for environment variables.
 *
 * @see https://vitejs.dev/guide/env-and-mode.html#intellisense-for-typescript
 */

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_BASE_URL: string;
  readonly VITE_DEV_API_KEY: string;

  // AWS Cognito Configuration
  readonly VITE_COGNITO_USER_POOL_ID: string;
  readonly VITE_COGNITO_CLIENT_ID: string;
  readonly VITE_COGNITO_REGION?: string;

  // Feature Flags
  readonly VITE_ENABLE_DEBUG_LOGGING?: string;
  readonly VITE_ENABLE_SCHEMA_CACHE?: string;

  // Vite built-in
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
