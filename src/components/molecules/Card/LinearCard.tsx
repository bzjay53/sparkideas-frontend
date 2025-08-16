import React, { HTMLAttributes, ReactNode } from 'react';

export interface LinearCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'interactive' | 'image';
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  hoverable?: boolean;
}

export const LinearCard: React.FC<LinearCardProps> = ({
  variant = 'default',
  padding = 'md',
  shadow = 'md',
  header,
  footer,
  children,
  hoverable = false,
  className = '',
  ...props
}) => {
  const getPaddingClass = () => {
    switch (padding) {
      case 'sm': return 'p-4';
      case 'lg': return 'p-8';
      default: return 'p-6';
    }
  };

  const getShadowClass = () => {
    switch (shadow) {
      case 'sm': return 'shadow-sm';
      case 'md': return 'shadow-md';
      case 'lg': return 'shadow-lg';
      default: return '';
    }
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'gradient': return 'bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200';
      case 'interactive': return 'bg-white border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50';
      default: return 'bg-white border border-gray-200';
    }
  };

  const classes = [
    'rounded-lg',
    getVariantClass(),
    getPaddingClass(),
    getShadowClass(),
    hoverable ? 'transition-all duration-200 hover:shadow-lg cursor-pointer transform hover:-translate-y-1' : 'transition-shadow duration-200',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {header && (
        <div className="mb-4 pb-4 border-b border-gray-100">
          {header}
        </div>
      )}
      <div className="flex-1">
        {children}
      </div>
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
};

export default LinearCard;