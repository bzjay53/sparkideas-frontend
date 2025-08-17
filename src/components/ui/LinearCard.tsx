import React, { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export interface LinearCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'interactive' | 'image';
  padding?: 'none' | 'sm' | 'md' | 'lg';
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
    width?: number;
    height?: number;
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
  const baseClasses = [
    'rounded-lg',
    'border',
    'border-border-primary',
    'transition-all',
    'duration-fast',
    'overflow-hidden',
  ];

  const variantClasses = {
    default: ['bg-background-primary'],
    gradient: [
      'bg-gradient-to-br',
      'from-background-primary',
      'to-background-secondary',
    ],
    interactive: [
      'bg-background-primary',
      'cursor-pointer',
      'hover:shadow-md',
      'hover:-translate-y-1',
    ],
    image: ['bg-background-primary'],
  };

  const paddingClasses = {
    none: [],
    sm: ['p-3'],
    md: ['p-4'],
    lg: ['p-6'],
  };

  const shadowClasses = {
    none: [],
    sm: ['shadow-sm'],
    md: ['shadow-md'],
    lg: ['shadow-lg'],
  };

  const hoverableClasses = hoverable ? [
    'hover:shadow-md',
    'hover:-translate-y-1',
    'cursor-pointer',
  ] : [];

  const aspectRatioClasses = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
    'auto': '',
  };

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    !image || image.position === 'background' ? paddingClasses[padding] : [],
    shadowClasses[shadow],
    hoverableClasses,
    className
  );

  const renderImage = () => {
    if (!image) return null;

    const imageClasses = cn(
      'relative',
      image.position === 'background' ? 'absolute inset-0 z-0' : '',
      image.position === 'top' ? 'w-full' : '',
      image.position === 'left' || image.position === 'right' ? 'flex-shrink-0' : '',
      image.aspectRatio ? aspectRatioClasses[image.aspectRatio] : ''
    );

    return (
      <div className={imageClasses}>
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width || 400}
          height={image.height || 300}
          className={cn(
            'object-cover',
            image.position === 'background' ? 'w-full h-full' : 'w-full h-auto'
          )}
        />
        {image.position === 'background' && (
          <div className="absolute inset-0 bg-black bg-opacity-20 z-10" />
        )}
      </div>
    );
  };

  const renderContent = () => (
    <>
      {header && (
        <div className={cn(
          'border-b border-border-primary pb-3 mb-3',
          image?.position === 'background' ? 'relative z-20' : ''
        )}>
          {header}
        </div>
      )}
      <div className={cn(
        'flex-1',
        image?.position === 'background' ? 'relative z-20' : ''
      )}>
        {children}
      </div>
      {footer && (
        <div className={cn(
          'border-t border-border-primary pt-3 mt-3',
          image?.position === 'background' ? 'relative z-20' : ''
        )}>
          {footer}
        </div>
      )}
    </>
  );

  if (image?.position === 'background') {
    return (
      <div className={classes} {...props}>
        {renderImage()}
        <div className={cn('relative z-20', paddingClasses[padding])}>
          {renderContent()}
        </div>
      </div>
    );
  }

  if (image?.position === 'left' || image?.position === 'right') {
    return (
      <div className={classes} {...props}>
        <div className={cn(
          'flex',
          image.position === 'left' ? 'flex-row' : 'flex-row-reverse',
          'gap-4'
        )}>
          {renderImage()}
          <div className={cn('flex-1', paddingClasses[padding])}>
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={classes} {...props}>
      {image?.position === 'top' && renderImage()}
      <div className={cn(image?.position === 'top' ? paddingClasses[padding] : '')}>
        {renderContent()}
      </div>
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
    return <div className="flex items-center justify-between">{children}</div>;
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {avatar && <div className="flex-shrink-0">{avatar}</div>}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="text-lg font-semibold text-text-primary truncate">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-text-secondary truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex-shrink-0">{actions}</div>}
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
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div className={cn('flex items-center gap-2', justifyClasses[justify])}>
      {children}
    </div>
  );
};

export default LinearCard;