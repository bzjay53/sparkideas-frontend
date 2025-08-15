import React from 'react';

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'ghost' 
  | 'link';

export type ButtonSize = 'small' | 'medium' | 'large';

export type IconPosition = 'left' | 'right';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  /**
   * Visual style variant of the button
   * @default 'primary'
   */
  variant?: ButtonVariant;
  
  /**
   * Size of the button
   * @default 'medium'
   */
  size?: ButtonSize;
  
  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Whether the button is in loading state
   * @default false
   */
  loading?: boolean;
  
  /**
   * Icon to display within the button
   */
  icon?: React.ReactNode;
  
  /**
   * Position of the icon relative to text
   * @default 'left'
   */
  iconPosition?: IconPosition;
  
  /**
   * Whether the button should take full width of container
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * Button content (text, elements)
   */
  children: React.ReactNode;
  
  /**
   * Click handler
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}