import React from 'react';
import { clsx } from 'clsx';

export interface LinearInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  label?: string;
  helperText?: string;
}

export const LinearInput = React.forwardRef<HTMLInputElement, LinearInputProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    error = false,
    label,
    helperText,
    id,
    ...props 
  }, ref) => {
    const inputId = id || React.useId();
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        
        <input
          id={inputId}
          ref={ref}
          className={clsx(
            // Base styles
            'block w-full border rounded-md transition-colors focus:outline-none focus:ring-2',
            
            // Size variants
            {
              'px-2 py-1 text-sm': size === 'sm',
              'px-3 py-2 text-base': size === 'md',
              'px-4 py-3 text-lg': size === 'lg',
            },
            
            // Variant styles
            {
              'border-gray-300 bg-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20': variant === 'default',
              'border-gray-200 bg-gray-50 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20 focus:bg-white': variant === 'filled',
              'border-2 border-gray-300 bg-transparent placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20': variant === 'outlined',
            },
            
            // Error state
            {
              'border-red-300 focus:border-red-500 focus:ring-red-500/20': error,
            },
            
            // Disabled state
            'disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200',
            
            className
          )}
          {...props}
        />
        
        {helperText && (
          <p className={clsx(
            'mt-1 text-sm',
            error ? 'text-red-600' : 'text-gray-600'
          )}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

LinearInput.displayName = 'LinearInput';

export default LinearInput;