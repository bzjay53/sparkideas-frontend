import React, { ReactNode } from 'react';
import './LinearHero.styles.css';

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
  variant = 'default',
  size = 'lg',
  backgroundImage,
  badge,
  features = [],
  className = ''
}) => {
  const baseClass = 'linear-hero';
  const variantClass = `linear-hero--${variant}`;
  const sizeClass = `linear-hero--${size}`;

  const classes = [
    baseClass,
    variantClass,
    sizeClass,
    backgroundImage && 'linear-hero--with-bg',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const renderAction = (action: typeof primaryAction, isPrimary = false) => {
    if (!action) return null;

    const actionClass = `linear-hero__action ${isPrimary ? 'linear-hero__action--primary' : 'linear-hero__action--secondary'}`;

    const content = (
      <>
        {action.icon && <span className="linear-hero__action-icon">{action.icon}</span>}
        <span>{action.label}</span>
      </>
    );

    return action.href ? (
      <a href={action.href} className={actionClass}>
        {content}
      </a>
    ) : (
      <button className={actionClass} onClick={action.onClick}>
        {content}
      </button>
    );
  };

  const renderMedia = () => {
    if (!media) return null;

    const mediaClass = 'linear-hero__media';

    switch (media.type) {
      case 'image':
        return (
          <div className={mediaClass}>
            <img 
              src={media.src} 
              alt={media.alt || ''} 
              className="linear-hero__media-image"
            />
          </div>
        );
      
      case 'video':
        return (
          <div className={mediaClass}>
            <video 
              src={media.src}
              className="linear-hero__media-video"
              autoPlay={media.autoPlay}
              loop={media.loop}
              muted={media.muted}
              playsInline
            />
          </div>
        );
      
      case 'component':
        return (
          <div className={mediaClass}>
            {media.component}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <section className={classes} role="banner">
      {/* Background Image */}
      {backgroundImage && (
        <div className="linear-hero__background">
          <img 
            src={backgroundImage.src} 
            alt={backgroundImage.alt || ''} 
            className={`linear-hero__background-image ${backgroundImage.parallax ? 'parallax' : ''}`}
          />
          {backgroundImage.overlay && (
            <div className="linear-hero__background-overlay" />
          )}
        </div>
      )}

      <div className="linear-hero__container">
        <div className="linear-hero__content">
          {/* Badge */}
          {badge && (
            <div className={`linear-hero__badge linear-hero__badge--${badge.variant || 'default'}`}>
              {badge.icon && <span className="linear-hero__badge-icon">{badge.icon}</span>}
              <span>{badge.text}</span>
            </div>
          )}

          {/* Text Content */}
          <div className="linear-hero__text">
            {subtitle && (
              <p className="linear-hero__subtitle">{subtitle}</p>
            )}
            
            <h1 className="linear-hero__title">{title}</h1>
            
            {description && (
              <p className="linear-hero__description">{description}</p>
            )}
          </div>

          {/* Actions */}
          {(primaryAction || secondaryAction) && (
            <div className="linear-hero__actions">
              {renderAction(primaryAction, true)}
              {renderAction(secondaryAction, false)}
            </div>
          )}

          {/* Features */}
          {features.length > 0 && (
            <div className="linear-hero__features">
              {features.map((feature, index) => (
                <div key={index} className="linear-hero__feature">
                  <div className="linear-hero__feature-icon">
                    {feature.icon}
                  </div>
                  <div className="linear-hero__feature-content">
                    <h3 className="linear-hero__feature-title">{feature.title}</h3>
                    <p className="linear-hero__feature-description">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Media */}
        {variant === 'split' && renderMedia()}
      </div>

      {/* Media for non-split variants */}
      {variant !== 'split' && renderMedia()}
    </section>
  );
};