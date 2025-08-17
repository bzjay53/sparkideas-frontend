import React, { ReactNode } from 'react';
import Link from 'next/link';

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
  media?: {
    type: 'image' | 'video' | 'component';
    src?: string;
    alt?: string;
    component?: ReactNode;
    autoPlay?: boolean;
    loop?: boolean;
    muted?: boolean;
  };
  variant?: 'default' | 'centered' | 'split' | 'minimal' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  backgroundImage?: {
    src: string;
    alt?: string;
    overlay?: boolean;
    parallax?: boolean;
  };
  badge?: {
    text: string;
    variant?: 'default' | 'success' | 'warning' | 'info';
    icon?: ReactNode;
  };
  features?: Array<{
    icon: ReactNode;
    title: string;
    description: string;
  }>;
  className?: string;
}

export const LinearHero: React.FC<LinearHeroProps> = ({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  media,
  variant = 'gradient',
  size = 'xl',
  backgroundImage,
  badge,
  features = [],
  className = ''
}) => {
  const sizeClasses = {
    sm: 'py-12 px-4',
    md: 'py-16 px-4', 
    lg: 'py-20 px-4',
    xl: 'py-24 px-4'
  };

  const variantClasses = {
    default: 'bg-white',
    centered: 'bg-gray-50 text-center',
    split: 'bg-white',
    minimal: 'bg-white',
    gradient: 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900'
  };

  const renderAction = (action: typeof primaryAction, isPrimary = false) => {
    if (!action) return null;

    const buttonClasses = isPrimary 
      ? 'inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl'
      : 'inline-flex items-center gap-2 px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all duration-200';

    const content = (
      <>
        {action.icon && <span>{action.icon}</span>}
        <span>{action.label}</span>
      </>
    );

    return action.href ? (
      <Link href={action.href} className={buttonClasses}>
        {content}
      </Link>
    ) : (
      <button className={buttonClasses} onClick={action.onClick}>
        {content}
      </button>
    );
  };

  const renderMedia = () => {
    if (!media) return null;

    switch (media.type) {
      case 'image':
        return (
          <div className="flex-1 flex justify-center items-center">
            <img 
              src={media.src} 
              alt={media.alt || ''} 
              className="max-w-full h-auto rounded-lg shadow-2xl"
            />
          </div>
        );
      
      case 'video':
        return (
          <div className="flex-1 flex justify-center items-center">
            <video 
              src={media.src}
              className="max-w-full h-auto rounded-lg shadow-2xl"
              autoPlay={media.autoPlay}
              loop={media.loop}
              muted={media.muted}
              playsInline
            />
          </div>
        );
      
      case 'component':
        return (
          <div className="flex-1 flex justify-center items-center">
            {media.component}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <section className={`relative overflow-hidden ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <img 
            src={backgroundImage.src} 
            alt={backgroundImage.alt || ''} 
            className={`w-full h-full object-cover ${backgroundImage.parallax ? 'transform scale-110' : ''}`}
          />
          {backgroundImage.overlay && (
            <div className="absolute inset-0 bg-black bg-opacity-50" />
          )}
        </div>
      )}

      <div className={`relative z-10 max-w-7xl mx-auto ${variant === 'split' ? 'flex items-center gap-12' : ''}`}>
        <div className={`${variant === 'split' ? 'flex-1' : 'text-center max-w-4xl mx-auto'}`}>
          {/* Badge */}
          {badge && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 ${
              badge.variant === 'success' ? 'bg-green-100 text-green-800' :
              badge.variant === 'warning' ? 'bg-yellow-100 text-yellow-800' :
              badge.variant === 'info' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {badge.icon && <span>{badge.icon}</span>}
              <span>{badge.text}</span>
            </div>
          )}

          {/* Text Content */}
          <div className="space-y-6">
            {subtitle && (
              <p className="text-lg font-medium text-blue-600 dark:text-blue-400">{subtitle}</p>
            )}
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent dark:from-white dark:via-blue-200 dark:to-purple-200">
              {title}
            </h1>
            
            {description && (
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
                {description}
              </p>
            )}
          </div>

          {/* Actions */}
          {(primaryAction || secondaryAction) && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              {renderAction(primaryAction, true)}
              {renderAction(secondaryAction, false)}
            </div>
          )}

          {/* Features */}
          {features.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              {features.map((feature, index) => (
                <div key={index} className="text-center group hover:scale-105 transition-transform duration-200">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Media for split variant */}
        {variant === 'split' && renderMedia()}
      </div>

      {/* Media for non-split variants */}
      {variant !== 'split' && media && (
        <div className="mt-12">
          {renderMedia()}
        </div>
      )}
    </section>
  );
};