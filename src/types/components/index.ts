/**
 * UI Component Types
 * Contains prop interfaces for UI components and design system elements
 */

import React from 'react';

// ============================================================================
// Base Component Types
// ============================================================================

export interface LinearComponentProps {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// ============================================================================
// Button Component Types
// ============================================================================

export interface LinearButtonProps extends LinearComponentProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  href?: string;
  target?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

// ============================================================================
// Card Component Types
// ============================================================================

export interface LinearCardProps extends LinearComponentProps {
  title?: string;
  description?: string;
  image?: string;
  footer?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

// ============================================================================
// Table Component Types
// ============================================================================

export interface LinearTableProps<T = any> {
  data: T[];
  columns: Array<{
    key: keyof T;
    title: string;
    width?: string;
    render?: (value: any, record: T) => React.ReactNode;
  }>;
  loading?: boolean;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number, pageSize: number) => void;
  };
  rowKey?: keyof T | ((record: T) => string);
  onRowClick?: (record: T) => void;
}

// ============================================================================
// Form Component Types
// ============================================================================

export interface LinearInputProps extends LinearComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'url' | 'tel';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  required?: boolean;
  error?: string;
  label?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export interface LinearTextareaProps extends LinearComponentProps {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  required?: boolean;
  error?: string;
  label?: string;
  rows?: number;
  maxLength?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

export interface LinearSelectProps extends LinearComponentProps {
  options: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
  }>;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  error?: string;
  label?: string;
  multiple?: boolean;
  searchable?: boolean;
}

// ============================================================================
// Navigation Component Types
// ============================================================================

export interface LinearNavbarProps extends LinearComponentProps {
  brand?: string | React.ReactNode;
  logo?: string;
  navigation?: Array<{
    label: string;
    href: string;
    active?: boolean;
    children?: Array<{
      label: string;
      href: string;
    }>;
  }>;
  actions?: React.ReactNode;
  fixed?: boolean;
  transparent?: boolean;
}

export interface LinearSidebarProps extends LinearComponentProps {
  title?: string;
  navigation: Array<{
    icon?: React.ReactNode;
    label: string;
    href: string;
    active?: boolean;
    badge?: string | number;
    children?: Array<{
      label: string;
      href: string;
      active?: boolean;
    }>;
  }>;
  collapsed?: boolean;
  onToggle?: () => void;
  footer?: React.ReactNode;
}

// ============================================================================
// Layout Component Types
// ============================================================================

export interface LinearContainerProps extends LinearComponentProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  centered?: boolean;
}

export interface LinearGridProps extends LinearComponentProps {
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export interface LinearStackProps extends LinearComponentProps {
  direction?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
}

// ============================================================================
// Feedback Component Types
// ============================================================================

export interface LinearAlertProps extends LinearComponentProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
}

export interface LinearModalProps extends Omit<LinearComponentProps, 'size'> {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  centered?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscapeKey?: boolean;
}

export interface LinearTooltipProps extends LinearComponentProps {
  content: string | React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  delay?: number;
  arrow?: boolean;
}

// ============================================================================
// Data Display Component Types
// ============================================================================

export interface LinearBadgeProps extends LinearComponentProps {
  count?: number;
  text?: string;
  dot?: boolean;
  status?: 'default' | 'processing' | 'success' | 'error' | 'warning';
  showZero?: boolean;
  overflowCount?: number;
}

export interface LinearTagProps extends LinearComponentProps {
  color?: string;
  closable?: boolean;
  onClose?: () => void;
  icon?: React.ReactNode;
  checkable?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export interface LinearProgressProps extends LinearComponentProps {
  percent: number;
  type?: 'line' | 'circle';
  status?: 'normal' | 'exception' | 'active' | 'success';
  strokeWidth?: number;
  showInfo?: boolean;
  format?: (percent: number) => string;
}

// ============================================================================
// Chart Component Types
// ============================================================================

export interface LinearChartProps extends LinearComponentProps {
  data: Array<{
    name: string;
    value: number;
    [key: string]: any;
  }>;
  type?: 'line' | 'area' | 'bar' | 'pie' | 'donut';
  colors?: string[];
  height?: number;
  responsive?: boolean;
  legend?: boolean;
  grid?: boolean;
  tooltip?: boolean;
  animation?: boolean;
}

// ============================================================================
// Export Collections
// ============================================================================

// Component props for UI library
export type ComponentProps = 
  | LinearButtonProps 
  | LinearCardProps 
  | LinearTableProps 
  | LinearInputProps
  | LinearNavbarProps
  | LinearModalProps
  | LinearChartProps;