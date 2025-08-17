'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import './LinearNavbar.styles.css';

export interface NavItem {
  label: string;
  href?: string;
  onClick?: () => void;
  children?: NavItem[];
  icon?: ReactNode;
  badge?: string | number;
}

export interface LinearNavbarProps {
  brand?: {
    logo?: ReactNode;
    text?: string;
    href?: string;
  };
  items?: NavItem[];
  actions?: ReactNode;
  variant?: 'default' | 'transparent' | 'dark';
  position?: 'static' | 'sticky' | 'fixed';
  size?: 'sm' | 'md' | 'lg';
  showMenuButton?: boolean;
  onMenuToggle?: (isOpen: boolean) => void;
  className?: string;
}

export const LinearNavbar: React.FC<LinearNavbarProps> = ({
  brand,
  items = [],
  actions,
  variant = 'default',
  position = 'static',
  size = 'md',
  showMenuButton = true,
  onMenuToggle,
  className = ''
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleMenuToggle = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    onMenuToggle?.(newState);
  };

  const handleDropdownToggle = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  const handleItemClick = (item: NavItem) => {
    if (item.onClick) {
      item.onClick();
    }
    if (!item.children) {
      setIsMenuOpen(false);
      setActiveDropdown(null);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };

    if (activeDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
    
    // Return empty cleanup function when activeDropdown is false
    return () => {};
  }, [activeDropdown]);

  const baseClass = 'linear-navbar';
  const variantClass = `linear-navbar--${variant}`;
  const positionClass = `linear-navbar--${position}`;
  const sizeClass = `linear-navbar--${size}`;

  const classes = [
    baseClass,
    variantClass,
    positionClass,
    sizeClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const renderNavItem = (item: NavItem, index: number) => {
    const hasChildren = item.children && item.children.length > 0;
    const isDropdownOpen = activeDropdown === item.label;

    return (
      <li key={`${item.label}-${index}`} className="linear-navbar__item">
        {hasChildren ? (
          <div className="linear-navbar__dropdown">
            <button
              className={`linear-navbar__link linear-navbar__dropdown-trigger ${isDropdownOpen ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleDropdownToggle(item.label);
              }}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              {item.icon && <span className="linear-navbar__icon">{item.icon}</span>}
              <span>{item.label}</span>
              {item.badge && (
                <span className="linear-navbar__badge">{item.badge}</span>
              )}
              <svg
                className={`linear-navbar__dropdown-arrow ${isDropdownOpen ? 'rotated' : ''}`}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {isDropdownOpen && item.children && (
              <ul className="linear-navbar__dropdown-menu">
                {item.children.map((child, childIndex) => (
                  <li key={`${child.label}-${childIndex}`}>
                    {child.href ? (
                      <a
                        href={child.href}
                        className="linear-navbar__dropdown-link"
                        onClick={() => handleItemClick(child)}
                      >
                        {child.icon && <span className="linear-navbar__dropdown-icon">{child.icon}</span>}
                        <span>{child.label}</span>
                        {child.badge && (
                          <span className="linear-navbar__badge">{child.badge}</span>
                        )}
                      </a>
                    ) : (
                      <button
                        className="linear-navbar__dropdown-link"
                        onClick={() => handleItemClick(child)}
                      >
                        {child.icon && <span className="linear-navbar__dropdown-icon">{child.icon}</span>}
                        <span>{child.label}</span>
                        {child.badge && (
                          <span className="linear-navbar__badge">{child.badge}</span>
                        )}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : item.href ? (
          <a
            href={item.href}
            className="linear-navbar__link"
            onClick={() => handleItemClick(item)}
          >
            {item.icon && <span className="linear-navbar__icon">{item.icon}</span>}
            <span>{item.label}</span>
            {item.badge && (
              <span className="linear-navbar__badge">{item.badge}</span>
            )}
          </a>
        ) : (
          <button
            className="linear-navbar__link"
            onClick={() => handleItemClick(item)}
          >
            {item.icon && <span className="linear-navbar__icon">{item.icon}</span>}
            <span>{item.label}</span>
            {item.badge && (
              <span className="linear-navbar__badge">{item.badge}</span>
            )}
          </button>
        )}
      </li>
    );
  };

  return (
    <nav className={classes} role="navigation" aria-label="메인 네비게이션">
      <div className="linear-navbar__container">
        {/* Brand */}
        {brand && (
          <div className="linear-navbar__brand">
            {brand.href ? (
              <a href={brand.href} className="linear-navbar__brand-link">
                {brand.logo && <span className="linear-navbar__logo">{brand.logo}</span>}
                {brand.text && <span className="linear-navbar__brand-text">{brand.text}</span>}
              </a>
            ) : (
              <div className="linear-navbar__brand-link">
                {brand.logo && <span className="linear-navbar__logo">{brand.logo}</span>}
                {brand.text && <span className="linear-navbar__brand-text">{brand.text}</span>}
              </div>
            )}
          </div>
        )}

        {/* Navigation Items */}
        <div className={`linear-navbar__nav ${isMenuOpen ? 'open' : ''}`}>
          <ul className="linear-navbar__menu">
            {items.map(renderNavItem)}
          </ul>
        </div>

        {/* Actions */}
        {actions && (
          <div className="linear-navbar__actions">
            {actions}
          </div>
        )}

        {/* Mobile Menu Button */}
        {showMenuButton && (
          <button
            className={`linear-navbar__menu-button ${isMenuOpen ? 'active' : ''}`}
            onClick={handleMenuToggle}
            aria-label="메뉴 토글"
            aria-expanded={isMenuOpen}
          >
            <span className="linear-navbar__menu-icon">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        )}
      </div>
    </nav>
  );
};