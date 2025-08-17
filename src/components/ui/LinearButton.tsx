'use client';

import React, { ButtonHTMLAttributes, ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface LinearButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
  fullWidth?: boolean;
}

export const LinearButton: React.FC<LinearButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  fullWidth = false,
  className = '',
  disabled,
  onClick,
  ...props
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'gap-2',
    'border',
    'border-transparent',
    'rounded-md',
    'font-medium',
    'leading-6',
    'no-underline',
    'cursor-pointer',
    'transition-all',
    'duration-fast',
    'whitespace-nowrap',
    'select-none',
    'relative',
    'overflow-hidden',
  ];

  const sizeClasses = {
    sm: ['px-3', 'py-1', 'text-small', 'min-h-[32px]'],
    md: ['px-4', 'py-2', 'text-text', 'min-h-[40px]'],
    lg: ['px-6', 'py-3', 'text-title-5', 'min-h-[48px]'],
  };

  const variantClasses = {
    primary: [
      'bg-accent-primary',
      'text-white',
      'border-accent-primary',
      'hover:bg-accent-hover',
      'hover:border-accent-hover',
      'hover:-translate-y-px',
      'shadow-sm',
    ],
    secondary: [
      'bg-background-tertiary',
      'text-text-primary',
      'border-border-primary',
      'hover:bg-background-elevated',
      'hover:-translate-y-px',
      'shadow-sm',
    ],
    outline: [
      'bg-transparent',
      'text-text-primary',
      'border-border-primary',
      'hover:bg-background-secondary',
      'hover:border-border-primary',
    ],
    icon: [
      'p-2',
      'min-w-auto',
      'aspect-square',
    ],
  };

  const iconSizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3',
  };

  const stateClasses = [
    disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
    loading ? 'cursor-wait pointer-events-none' : '',
    fullWidth ? 'w-full' : '',
  ];

  const classes = cn(
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    variant === 'icon' ? iconSizeClasses[size] : '',
    stateClasses,
    'focus-visible:outline-2',
    'focus-visible:outline-accent-primary',
    'focus-visible:outline-offset-2',
    'active:translate-y-0',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:pointer-events-none',
    // Mobile touch targets
    'md:min-h-auto',
    size === 'sm' ? 'min-h-[36px] md:min-h-[32px]' : '',
    size === 'md' ? 'min-h-[44px] md:min-h-[40px]' : '',
    size === 'lg' ? 'min-h-[52px] md:min-h-[48px]' : '',
    // High contrast mode
    'contrast-more:border-2',
    // Reduced motion
    'motion-reduce:transition-none',
    className
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    // SSR-safe ripple effect
    if (isClient) {
      const button = event.currentTarget;
      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.className = 'absolute rounded-full bg-white bg-opacity-30 scale-0 animate-pulse pointer-events-none';
      
      button.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    }
    
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-transparent border-t-current rounded-full animate-spin" />
      )}
      {icon && !loading && (
        <span className="flex items-center justify-center flex-shrink-0">
          {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, {
            className: cn(
              'fill-current',
              size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-4.5 h-4.5' : 'w-4 h-4'
            )
          })}
        </span>
      )}
      {children && <span className="flex-1 text-center">{children}</span>}
    </button>
  );
};

export default LinearButton;