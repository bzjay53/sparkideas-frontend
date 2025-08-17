import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import './LinearButton.styles.css';

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
  const baseClass = 'linear-btn';
  const variantClass = `linear-btn--${variant}`;
  const sizeClass = `linear-btn--${size}`;
  const loadingClass = loading ? 'linear-btn--loading' : '';
  const fullWidthClass = fullWidth ? 'linear-btn--full-width' : '';
  const disabledClass = disabled || loading ? 'linear-btn--disabled' : '';

  const classes = [
    baseClass,
    variantClass,
    sizeClass,
    loadingClass,
    fullWidthClass,
    disabledClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    // Add ripple effect
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('linear-btn__ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
    
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
      {loading && <span className="linear-btn__spinner" />}
      {icon && !loading && <span className="linear-btn__icon">{icon}</span>}
      {children && <span className="linear-btn__text">{children}</span>}
    </button>
  );
};

export default LinearButton;