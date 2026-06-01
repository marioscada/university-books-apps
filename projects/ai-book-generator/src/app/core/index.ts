/**
 * Core Module Barrel Export
 *
 * Exports all core functionality including:
 * - Domain Models (business logic)
 * - Configurations
 *
 * Note: API Client (generated code) is now in @university-books/backend-api-client library
 *
 * Following Angular best practices for clean imports.
 *
 * @see https://angular.dev/style-guide
 */

// Domain Models (business logic)
export * from './models';

// Configuration
export * from './config/amplify.config';
export * from './config/api-client.config';

// Re-export API Client from shared library for convenience
export * from '@university-books/backend-api-client';
