/**
 * Utility Types
 * Contains helper types, state management, and common utility interfaces
 */

// ============================================================================
// State Management Types
// ============================================================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type AsyncState<T> = {
  data: T | null;
  loading: LoadingState;
  error: string | null;
  lastUpdated: string | null;
};

export interface RequestState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

// ============================================================================
// Sorting and Filtering Types
// ============================================================================

export type SortDirection = 'asc' | 'desc';

export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains' | 'starts_with' | 'ends_with';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
  label?: string;
}

export interface SortCondition {
  field: string;
  direction: SortDirection;
  label?: string;
}

export interface SearchCondition {
  query: string;
  fields: string[];
  exact_match?: boolean;
  case_sensitive?: boolean;
}

// ============================================================================
// Table State Management
// ============================================================================

export interface TableState<T = any> {
  loading: LoadingState;
  data: T[];
  filters: FilterCondition[];
  sort: SortCondition[];
  search?: SearchCondition;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  selection: {
    selectedRows: T[];
    selectedRowKeys: string[];
    selectAll: boolean;
  };
}

export interface TableActions<T = any> {
  setLoading: (loading: LoadingState) => void;
  setData: (data: T[]) => void;
  addFilter: (filter: FilterCondition) => void;
  removeFilter: (field: string) => void;
  clearFilters: () => void;
  setSort: (sort: SortCondition) => void;
  setSearch: (search: SearchCondition | undefined) => void;
  setPagination: (pagination: Partial<TableState['pagination']>) => void;
  setSelection: (selection: Partial<TableState['selection']>) => void;
  refresh: () => void;
}

// ============================================================================
// Form State Management
// ============================================================================

export interface FormField<T = any> {
  value: T;
  error: string | null;
  touched: boolean;
  required: boolean;
  disabled: boolean;
  loading: boolean;
}

export interface FormState<T extends Record<string, any> = Record<string, any>> {
  fields: {
    [K in keyof T]: FormField<T[K]>;
  };
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  submitCount: number;
  errors: Record<string, string>;
}

export interface FormActions<T extends Record<string, any> = Record<string, any>> {
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setError: <K extends keyof T>(field: K, error: string | null) => void;
  setTouched: <K extends keyof T>(field: K, touched: boolean) => void;
  setFieldState: <K extends keyof T>(field: K, state: Partial<FormField<T[K]>>) => void;
  reset: () => void;
  submit: () => Promise<void>;
  validate: () => boolean;
}

// ============================================================================
// Validation Types
// ============================================================================

export type ValidationRule<T = any> = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
  message?: string;
};

export type ValidationRules<T extends Record<string, any> = Record<string, any>> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

// ============================================================================
// Date and Time Utilities
// ============================================================================

export type DateFormat = 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD HH:mm' | 'DD/MM/YYYY HH:mm' | 'relative';

export interface DateRange {
  start: string;
  end: string;
  label?: string;
}

export type TimeUnit = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

export interface DurationConfig {
  value: number;
  unit: TimeUnit;
  label?: string;
}

// ============================================================================
// Color and Theme Types
// ============================================================================

export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ColorPalette {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  neutral: string;
  background: string;
  surface: string;
  text: string;
}

export interface ThemeConfig {
  mode: ThemeMode;
  colors: ColorPalette;
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// ============================================================================
// Event Handling Types
// ============================================================================

export interface EventHandler<T = any> {
  (event: T): void;
}

export interface AsyncEventHandler<T = any> {
  (event: T): Promise<void>;
}

export type EventSubscription = {
  unsubscribe: () => void;
};

// ============================================================================
// Storage Types
// ============================================================================

export type StorageType = 'localStorage' | 'sessionStorage' | 'memory';

export interface StorageItem<T = any> {
  key: string;
  value: T;
  expiresAt?: number;
  version?: string;
}

export interface StorageConfig {
  type: StorageType;
  prefix?: string;
  encrypt?: boolean;
  compress?: boolean;
}

// ============================================================================
// Network and API Utilities
// ============================================================================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface RequestConfig {
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  retries?: number;
  cache?: boolean;
}

export interface ResponseInfo {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  timestamp: string;
  duration: number;
}

// ============================================================================
// File and Upload Types
// ============================================================================

export type FileType = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  url?: string;
  preview?: string;
}

export interface UploadConfig {
  maxSize: number;
  allowedTypes: string[];
  multiple: boolean;
  autoUpload: boolean;
  compress?: boolean;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed: number;
  timeRemaining: number;
}

// ============================================================================
// Performance and Monitoring
// ============================================================================

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  apiCalls: number;
  errors: number;
}

export interface MonitoringConfig {
  enabled: boolean;
  sampleRate: number;
  maxEvents: number;
  bufferTime: number;
  endpoints: string[];
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface AppSettings {
  theme: ThemeConfig;
  language: string;
  timezone: string;
  dateFormat: DateFormat;
  notifications: {
    enabled: boolean;
    email: boolean;
    push: boolean;
    telegram: boolean;
  };
  privacy: {
    analytics: boolean;
    cookies: boolean;
    tracking: boolean;
  };
}

export interface DebugConfig {
  enabled: boolean;
  level: 'error' | 'warn' | 'info' | 'debug';
  console: boolean;
  network: boolean;
  performance: boolean;
  storage: boolean;
}

// ============================================================================
// Generic Utility Types
// ============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type KeyValuePair<K extends string | number = string, V = any> = {
  key: K;
  value: V;
};

export type Dictionary<T = any> = Record<string, T>;

export type Nullable<T> = T | null;

export type Undefinable<T> = T | undefined;

export type Maybe<T> = T | null | undefined;

// ============================================================================
// Export Collections
// ============================================================================

// Utility types for common operations
export type UtilityTypes = 
  | LoadingState 
  | FilterCondition 
  | SortCondition 
  | TableState 
  | FormState 
  | ValidationRule;