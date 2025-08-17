import React, { HTMLAttributes, ReactNode } from 'react';
import './LinearCard.styles.css';

export interface LinearCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'interactive' | 'image';
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  hoverable?: boolean;
  image?: {
    src: string;
    alt: string;
    position?: 'top' | 'left' | 'right' | 'background';
    aspectRatio?: '16:9' | '4:3' | '1:1' | 'auto';
  };
}

export const LinearCard: React.FC<LinearCardProps> = ({
  variant = 'default',
  padding = 'md',
  shadow = 'none',
  header,
  footer,
  children,
  hoverable = false,
  image,
  className = '',
  ...props
}) => {
  const baseClass = 'linear-card';
  const variantClass = `linear-card--${variant}`;
  const paddingClass = `linear-card--padding-${padding}`;
  const shadowClass = shadow !== 'none' ? `linear-card--shadow-${shadow}` : '';
  const hoverableClass = hoverable ? 'linear-card--hoverable' : '';
  const imagePositionClass = image?.position ? `linear-card--image-${image.position}` : '';

  const classes = [
    baseClass,
    variantClass,
    paddingClass,
    shadowClass,
    hoverableClass,
    imagePositionClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const renderImage = () => {
    if (!image) return null;

    const aspectRatioClass = image.aspectRatio ? `linear-card__image--${image.aspectRatio.replace(':', '-')}` : '';
    
    return (
      <div className={`linear-card__image linear-card__image--${image.position || 'top'} ${aspectRatioClass}`}>
        <img src={image.src} alt={image.alt} />
        {image.position === 'background' && (
          <div className="linear-card__image-overlay" />
        )}
      </div>
    );
  };

  const renderContent = () => (
    <>
      {header && <div className="linear-card__header">{header}</div>}
      <div className="linear-card__content">{children}</div>
      {footer && <div className="linear-card__footer">{footer}</div>}
    </>
  );

  return (
    <div className={classes} {...props}>
      {image?.position === 'background' && renderImage()}
      {image?.position === 'top' && renderImage()}
      
      <div className={`linear-card__body ${image?.position === 'background' ? 'linear-card__body--overlay' : ''}`}>
        {(image?.position === 'left' || image?.position === 'right') && renderImage()}
        <div className="linear-card__main">
          {renderContent()}
        </div>
      </div>
      
      {!image && renderContent()}
    </div>
  );
};

// Card Header Component
export interface LinearCardHeaderProps {
  title?: string;
  subtitle?: string;
  avatar?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}

export const LinearCardHeader: React.FC<LinearCardHeaderProps> = ({
  title,
  subtitle,
  avatar,
  actions,
  children,
}) => {
  if (children) {
    return <div className="linear-card-header">{children}</div>;
  }

  return (
    <div className="linear-card-header">
      {avatar && <div className="linear-card-header__avatar">{avatar}</div>}
      <div className="linear-card-header__content">
        {title && <h3 className="linear-card-header__title">{title}</h3>}
        {subtitle && <p className="linear-card-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="linear-card-header__actions">{actions}</div>}
    </div>
  );
};

// Card Footer Component
export interface LinearCardFooterProps {
  children: ReactNode;
  justify?: 'start' | 'center' | 'end' | 'between';
}

export const LinearCardFooter: React.FC<LinearCardFooterProps> = ({
  children,
  justify = 'end',
}) => {
  const justifyClass = `linear-card-footer--${justify}`;

  return (
    <div className={`linear-card-footer ${justifyClass}`}>
      {children}
    </div>
  );
};

export default LinearCard;