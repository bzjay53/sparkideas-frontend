import React, { ReactNode } from 'react';

export interface LinearHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: ReactNode;
  };
  backgroundImage?: {
    src: string;
    alt: string;
  };
  variant?: 'default' | 'gradient' | 'centered';
  className?: string;
}

export const LinearHero: React.FC<LinearHeroProps> = ({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  backgroundImage,
  variant = 'default',
  className = '',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-r from-blue-600 to-purple-600 text-white';
      case 'centered':
        return 'bg-gray-50 text-center';
      default:
        return 'bg-white';
    }
  };

  const renderAction = (action: { label: string; onClick?: () => void; href?: string; icon?: ReactNode }, isPrimary = true) => {
    const buttonClasses = isPrimary
      ? 'inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors'
      : 'inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors';

    if (action.href) {
      return (
        <a href={action.href} className={buttonClasses}>
          {action.icon && <span className="mr-2">{action.icon}</span>}
          {action.label}
        </a>
      );
    }

    return (
      <button onClick={action.onClick} className={buttonClasses}>
        {action.icon && <span className="mr-2">{action.icon}</span>}
        {action.label}
      </button>
    );
  };

  return (
    <div className={`relative py-16 sm:py-24 lg:py-32 ${getVariantClasses()} ${className}`}>
      {backgroundImage && (
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src={backgroundImage.src}
            alt={backgroundImage.alt}
          />
          <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
        </div>
      )}
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`max-w-4xl ${variant === 'centered' ? 'mx-auto text-center' : ''}`}>
          {subtitle && (
            <p className="text-sm font-medium uppercase tracking-wide text-blue-600 mb-4">
              {subtitle}
            </p>
          )}
          
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6">
            {title}
          </h1>
          
          {description && (
            <p className="text-xl text-gray-600 mb-8 max-w-3xl">
              {description}
            </p>
          )}
          
          {(primaryAction || secondaryAction) && (
            <div className="flex flex-col sm:flex-row gap-4">
              {primaryAction && renderAction(primaryAction, true)}
              {secondaryAction && renderAction(secondaryAction, false)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinearHero;