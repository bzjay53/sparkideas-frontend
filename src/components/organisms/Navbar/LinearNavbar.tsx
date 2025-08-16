import React, { useState, ReactNode } from 'react';

export interface NavItem {
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}

export interface LinearNavbarProps {
  brand?: {
    logo?: ReactNode;
    text?: string;
    href?: string;
  };
  items?: NavItem[];
  actions?: ReactNode;
  className?: string;
}

export const LinearNavbar: React.FC<LinearNavbarProps> = ({
  brand,
  items = [],
  actions,
  className = '',
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand */}
          <div className="flex items-center">
            {brand && (
              <div className="flex-shrink-0">
                {brand.href ? (
                  <a
                    href={brand.href}
                    className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {brand.logo && <span>{brand.logo}</span>}
                    {brand.text && <span>{brand.text}</span>}
                  </a>
                ) : (
                  <div className="flex items-center space-x-2 text-xl font-bold text-gray-900">
                    {brand.logo && <span>{brand.logo}</span>}
                    {brand.text && <span>{brand.text}</span>}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {items.map((item, index) => (
              <div key={index}>
                {item.href ? (
                  <a
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      item.active
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </a>
                ) : (
                  <button
                    onClick={item.onClick}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      item.active
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          {actions && (
            <div className="hidden md:flex md:items-center">
              {actions}
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {items.map((item, index) => (
                <div key={index}>
                  {item.href ? (
                    <a
                      href={item.href}
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        item.active
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <button
                      onClick={item.onClick}
                      className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                        item.active
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  )}
                </div>
              ))}
              {actions && (
                <div className="pt-4 border-t border-gray-200">
                  {actions}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default LinearNavbar;