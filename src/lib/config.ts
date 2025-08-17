/**
 * Environment Configuration with TypeScript
 * Type-safe environment variable management for frontend
 */

import type { EnvironmentConfig, FeatureFlags } from '@/types';

// ============================================================================
// Environment Variables Validation
// ============================================================================

function getEnvVar(key: string, defaultValue?: string): string {
  // First try process.env (build time)
  let value = process.env[key];
  
  // For client-side, try window.location for deployment URL detection
  if (!value && typeof window !== 'undefined' && key === 'NEXT_PUBLIC_API_BASE_URL') {
    const hostname = window.location.hostname;
    if (hostname.includes('vercel.app') || hostname.includes('ideaspark')) {
      value = `https://${hostname}/api`;
      console.log(`[Config] Auto-detected API URL from hostname: ${value}`);
    }
  }
  
  if (!value && !defaultValue) {
    console.warn(`Environment variable ${key} is not defined`);
    return '';
  }
  
  return value || defaultValue || '';
}

function getBooleanEnv(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];
  
  if (!value) return defaultValue;
  
  return value.toLowerCase() === 'true';
}

// ============================================================================
// Feature Flags Configuration
// ============================================================================

const featureFlags: FeatureFlags = {
  enableAnalytics: getBooleanEnv('NEXT_PUBLIC_ENABLE_ANALYTICS', true),
  enableCommunity: getBooleanEnv('NEXT_PUBLIC_ENABLE_COMMUNITY', true),
  enablePRDGenerator: getBooleanEnv('NEXT_PUBLIC_ENABLE_PRD_GENERATOR', true),
  enableDarkMode: getBooleanEnv('NEXT_PUBLIC_ENABLE_DARK_MODE', true),
  showPerformanceMetrics: getBooleanEnv('NEXT_PUBLIC_SHOW_PERFORMANCE_METRICS', true),
  enableDebug: getBooleanEnv('NEXT_PUBLIC_ENABLE_DEBUG', false),
  enableSocialLogin: getBooleanEnv('NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN', false),
};

// ============================================================================
// Environment Configuration
// ============================================================================

const config: EnvironmentConfig = {
  // API Configuration (smart environment-based URL)
  apiBaseUrl: (() => {
    const explicitUrl = getEnvVar('NEXT_PUBLIC_API_BASE_URL');
    const vercelUrl = getEnvVar('VERCEL_URL');
    
    // If explicit URL is set, use it
    if (explicitUrl) return explicitUrl;
    
    // If on Vercel, construct API URL from Vercel URL
    if (vercelUrl) {
      return `https://${vercelUrl}/api`;
    }
    
    // Fallback to localhost for local development
    return 'http://localhost:8000';
  })(),
  
  // Supabase Configuration
  supabaseUrl: getEnvVar('NEXT_PUBLIC_SUPABASE_URL', 'https://your-project.supabase.co'),
  supabaseAnonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'your-anon-key-here'),
  
  // Deployment Configuration
  vercelUrl: getEnvVar('NEXT_PUBLIC_VERCEL_URL', 'https://ideaSpark-frontend.vercel.app'),
  
  // Environment Detection (with smart Vercel deployment detection)
  environment: (() => {
    const explicitEnv = getEnvVar('NEXT_PUBLIC_ENVIRONMENT');
    const vercelEnv = getEnvVar('VERCEL_ENV');
    const nodeEnv = getEnvVar('NODE_ENV');
    const vercelUrl = getEnvVar('VERCEL_URL');
    
    // If we're on Vercel (has VERCEL_URL), default to production unless explicitly development
    if (vercelUrl && !explicitEnv) {
      if (vercelEnv === 'preview') return 'staging';
      return 'production'; // Default to production on Vercel
    }
    
    // Priority: explicit setting > Vercel env > Node env > development
    if (explicitEnv) return explicitEnv as 'development' | 'staging' | 'production';
    if (vercelEnv === 'production') return 'production';
    if (vercelEnv === 'preview') return 'staging';
    if (nodeEnv === 'production') return 'production';
    return 'development';
  })(),
  
  // Feature Flags
  featureFlags,
};

// ============================================================================
// Application Configuration
// ============================================================================

const appConfig = {
  name: getEnvVar('NEXT_PUBLIC_APP_NAME', 'IdeaSpark v2.0'),
  version: getEnvVar('NEXT_PUBLIC_APP_VERSION', '2.0.0'),
  description: getEnvVar('NEXT_PUBLIC_APP_DESCRIPTION', 'Real-time Pain Point Analysis & Business Idea Generation'),
  
  // UI Configuration
  defaultTheme: getEnvVar('NEXT_PUBLIC_DEFAULT_THEME', 'blue') as 'blue' | 'green' | 'purple' | 'red',
  
  // API Configuration
  apiVersion: getEnvVar('NEXT_PUBLIC_API_VERSION', 'v1'),
  
  // Performance Configuration
  enableServiceWorker: config.environment === 'production',
  enableAnalytics: featureFlags.enableAnalytics && config.environment === 'production',
  
  // Development Configuration
  enableDevTools: config.environment === 'development' || featureFlags.enableDebug,
  showPerformanceMetrics: featureFlags.showPerformanceMetrics,
};

// ============================================================================
// API Endpoints Configuration
// ============================================================================

const apiEndpoints = {
  // Base URLs
  api: config.apiBaseUrl,
  supabase: config.supabaseUrl,
  
  // Health & System
  health: `${config.apiBaseUrl}/health`,
  root: `${config.apiBaseUrl}/`,
  
  // Pain Points
  painPoints: `${config.apiBaseUrl}/api/pain-points`,
  painPointsStats: `${config.apiBaseUrl}/api/pain-points/stats`,
  painPointsCollect: `${config.apiBaseUrl}/api/pain-points/collect`,
  
  // Business Ideas
  businessIdeas: `${config.apiBaseUrl}/api/business-ideas`,
  businessIdeasGenerate: `${config.apiBaseUrl}/api/business-ideas/generate`,
  
  // Analytics
  analyticsOverview: `${config.apiBaseUrl}/api/analytics/overview`,
  analyticsTrendingKeywords: `${config.apiBaseUrl}/api/analytics/trending-keywords`,
  analyticsPerformance: `${config.apiBaseUrl}/api/analytics/performance`,
  
  // Telegram
  telegramSendDigest: `${config.apiBaseUrl}/api/telegram/send-digest`,
  telegramDigestPreview: `${config.apiBaseUrl}/api/telegram/digest/preview`,
  telegramTest: `${config.apiBaseUrl}/api/telegram/test`,
  telegramStats: `${config.apiBaseUrl}/api/telegram/stats`,
  
  // Community (Future)
  community: `${config.apiBaseUrl}/api/community`,
  communityHealth: `${config.apiBaseUrl}/api/community/health`,
};

// ============================================================================
// Theme Configuration
// ============================================================================

const themeConfig = {
  colors: {
    blue: {
      primary: '#3b82f6',
      secondary: '#1d4ed8',
      accent: '#60a5fa',
    },
    green: {
      primary: '#10b981',
      secondary: '#047857',
      accent: '#34d399',
    },
    purple: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#a78bfa',
    },
    red: {
      primary: '#ef4444',
      secondary: '#dc2626',
      accent: '#f87171',
    },
  },
  fonts: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Fira Code', 'monospace'],
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

export function isDevelopment(): boolean {
  return config.environment === 'development';
}

export function isProduction(): boolean {
  return config.environment === 'production';
}

export function isStaging(): boolean {
  return config.environment === 'staging';
}

export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return featureFlags[feature];
}

export function getApiUrl(endpoint: string): string {
  return `${config.apiBaseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}

export function getSupabaseConfig() {
  return {
    url: config.supabaseUrl,
    anonKey: config.supabaseAnonKey,
  };
}

// ============================================================================
// Configuration Validation
// ============================================================================

export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required environment variables
  const requiredVars = [
    'NEXT_PUBLIC_API_BASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }
  
  // URL validation
  try {
    new URL(config.apiBaseUrl);
  } catch {
    errors.push(`Invalid API base URL: ${config.apiBaseUrl}`);
  }
  
  try {
    new URL(config.supabaseUrl);
  } catch {
    errors.push(`Invalid Supabase URL: ${config.supabaseUrl}`);
  }
  
  // Environment validation
  const validEnvironments = ['development', 'staging', 'production'];
  if (!validEnvironments.includes(config.environment)) {
    errors.push(`Invalid environment: ${config.environment}. Must be one of: ${validEnvironments.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Debug Information
// ============================================================================

export function getDebugInfo() {
  if (!isDevelopment() && !featureFlags.enableDebug) {
    return null;
  }
  
  return {
    config,
    featureFlags,
    appConfig,
    apiEndpoints,
    validation: validateConfig(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      vercelUrl: process.env.VERCEL_URL,
    },
  };
}


// Log critical configuration for production debugging
if (isProduction()) {
  console.group('🚀 IdeaSpark Production Configuration');
  console.log('Environment:', config.environment);
  console.log('API Base URL:', config.apiBaseUrl);
  console.log('Explicit Environment:', process.env.NEXT_PUBLIC_ENVIRONMENT);
  console.log('Vercel Environment:', process.env.VERCEL_ENV);
  console.log('Node Environment:', process.env.NODE_ENV);
  console.log('Current hostname:', typeof window !== 'undefined' ? window.location.hostname : 'server-side');
  
  const validation = validateConfig();
  if (!validation.valid) {
    console.error('❌ Production Configuration Errors:', validation.errors);
  } else {
    console.log('✅ Production configuration valid');
  }
  console.groupEnd();
}

// Log in any environment for debugging (will show in both dev and production)
console.group(`🔧 IdeaSpark Configuration (${config.environment})`);
console.log('Environment:', config.environment);
console.log('API Base URL:', config.apiBaseUrl);
console.log('Current hostname:', typeof window !== 'undefined' ? window.location.hostname : 'server-side');
console.log('Environment Variables:');
console.log('- NEXT_PUBLIC_ENVIRONMENT:', process.env.NEXT_PUBLIC_ENVIRONMENT);
console.log('- NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
console.log('- VERCEL_ENV:', process.env.VERCEL_ENV);
console.log('- VERCEL_URL:', process.env.VERCEL_URL);
console.log('- NODE_ENV:', process.env.NODE_ENV);

const validation = validateConfig();
if (!validation.valid) {
  console.warn('Configuration Errors:', validation.errors);
} else {
  console.log('✅ Configuration valid');
}
console.groupEnd();

// ============================================================================
// Exports
// ============================================================================

export default config;

export {
  config,
  appConfig,
  featureFlags,
  apiEndpoints,
  themeConfig,
};