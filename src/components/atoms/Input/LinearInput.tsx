import React, { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import './LinearInput.styles.css';

export interface LinearInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export const LinearInput = forwardRef<HTMLInputElement, LinearInputProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      variant = 'default',
      leftIcon,
      rightIcon,
      loading = false,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClass = 'linear-input';
    const sizeClass = `linear-input--${size}`;
    const variantClass = `linear-input--${variant}`;
    const errorClass = error ? 'linear-input--error' : '';
    const disabledClass = disabled ? 'linear-input--disabled' : '';
    const fullWidthClass = fullWidth ? 'linear-input--full-width' : '';
    const hasIconClass = (leftIcon || rightIcon) ? 'linear-input--has-icon' : '';
    const loadingClass = loading ? 'linear-input--loading' : '';

    const inputClasses = [
      baseClass,
      sizeClass,
      variantClass,
      errorClass,
      disabledClass,
      fullWidthClass,
      hasIconClass,
      loadingClass,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const inputId = props.id || `linear-input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="linear-input-wrapper">
        {label && (
          <label htmlFor={inputId} className="linear-input-label">
            {label}
          </label>
        )}
        
        <div className="linear-input-container">
          {leftIcon && (
            <div className="linear-input-icon linear-input-icon--left">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            disabled={disabled || loading}
            {...props}
          />
          
          {loading && (
            <div className="linear-input-icon linear-input-icon--right">
              <div className="linear-input-spinner" />
            </div>
          )}
          
          {rightIcon && !loading && (
            <div className="linear-input-icon linear-input-icon--right">
              {rightIcon}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <div className={`linear-input-help ${error ? 'linear-input-help--error' : ''}`}>
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

LinearInput.displayName = 'LinearInput';

export default LinearInput;