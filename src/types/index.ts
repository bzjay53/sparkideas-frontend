/**
 * IdeaSpark Type Definitions - Modular Architecture
 * Consolidated exports from domain-based type modules
 */

// ============================================================================
// Core Domain Types
// ============================================================================
export * from './core';

// ============================================================================
// Component Types
// ============================================================================
export * from './components';

// ============================================================================
// API Types
// ============================================================================
export * from './api';

// ============================================================================
// Utility Types
// ============================================================================
export * from './utils';

// ============================================================================
// Legacy Compatibility - Deprecated (for backward compatibility)
// ============================================================================
// Note: These will be removed in next major version
// Please use the modular imports above instead

// @deprecated - Use imports from './core' instead
export type { CoreTypes } from './core';

// @deprecated - Use imports from './components' instead  
export type { ComponentProps } from './components';

// @deprecated - Use imports from './api' instead
export type { ApiTypes } from './api';

// @deprecated - Use imports from './utils' instead
export type { UtilityTypes } from './utils';

// ============================================================================
// Module Information
// ============================================================================

export const TYPE_MODULE_INFO = {
  version: '2.0.0',
  architecture: 'modular',
  modules: {
    core: {
      description: 'Core business domain types and entities',
      path: './core',
      exports: 25
    },
    components: {
      description: 'UI component prop interfaces and design system types',
      path: './components',
      exports: 20
    },
    api: {
      description: 'API request/response types and endpoint interfaces',
      path: './api',
      exports: 18
    },
    utils: {
      description: 'Utility types, state management, and helper interfaces',
      path: './utils',
      exports: 35
    }
  },
  totalTypes: 98,
  migrationDate: '2025-08-18',
  previousVersion: '1.0.0-monolithic'
} as const;