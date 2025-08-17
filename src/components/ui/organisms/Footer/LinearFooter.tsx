import React, { ReactNode } from 'react';
import './LinearFooter.styles.css';

export interface FooterLink {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  name: string;
  href: string;
  icon: ReactNode;
  ariaLabel?: string;
}

export interface LinearFooterProps {
  brand?: {
    logo?: ReactNode;
    text?: string;
    description?: string;
  };
  sections?: FooterSection[];
  socialLinks?: SocialLink[];
  bottomLinks?: FooterLink[];
  copyright?: string;
  variant?: 'default' | 'minimal' | 'rich';
  className?: string;
}

export const LinearFooter: React.FC<LinearFooterProps> = ({
  brand,
  sections = [],
  socialLinks = [],
  bottomLinks = [],
  copyright,
  variant = 'default',
  className = ''
}) => {
  const baseClass = 'linear-footer';
  const variantClass = `linear-footer--${variant}`;

  const classes = [
    baseClass,
    variantClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const renderLink = (link: FooterLink, index: number) => {
    const linkProps = {
      className: 'linear-footer__link',
      key: `${link.label}-${index}`,
      ...(link.external && { 
        target: '_blank', 
        rel: 'noopener noreferrer',
        'aria-label': `${link.label} (새 탭에서 열림)`
      })
    };

    return link.href ? (
      <a href={link.href} {...linkProps}>
        {link.icon && <span className="linear-footer__link-icon">{link.icon}</span>}
        <span>{link.label}</span>
        {link.external && (
          <svg className="linear-footer__external-icon" width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M18 13V19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V8C3 7.46957 3.21071 6.96086 3.58579 6.58579C3.96086 6.21071 4.46957 6 5 6H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 3H21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </a>
    ) : (
      <button {...linkProps} onClick={link.onClick}>
        {link.icon && <span className="linear-footer__link-icon">{link.icon}</span>}
        <span>{link.label}</span>
      </button>
    );
  };

  return (
    <footer className={classes} role="contentinfo">
      {variant !== 'minimal' && (
        <div className="linear-footer__main">
          <div className="linear-footer__container">
            {/* Brand Section */}
            {brand && (
              <div className="linear-footer__brand">
                {(brand.logo || brand.text) && (
                  <div className="linear-footer__brand-header">
                    {brand.logo && (
                      <span className="linear-footer__logo">{brand.logo}</span>
                    )}
                    {brand.text && (
                      <span className="linear-footer__brand-text">{brand.text}</span>
                    )}
                  </div>
                )}
                {brand.description && (
                  <p className="linear-footer__brand-description">
                    {brand.description}
                  </p>
                )}
                {socialLinks.length > 0 && (
                  <div className="linear-footer__social">
                    {socialLinks.map((social, index) => (
                      <a
                        key={`${social.name}-${index}`}
                        href={social.href}
                        className="linear-footer__social-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.ariaLabel || `${social.name} (새 탭에서 열림)`}
                      >
                        {social.icon}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Footer Sections */}
            {sections.length > 0 && (
              <div className="linear-footer__sections">
                {sections.map((section, index) => (
                  <div key={`${section.title}-${index}`} className="linear-footer__section">
                    <h3 className="linear-footer__section-title">{section.title}</h3>
                    <ul className="linear-footer__section-links">
                      {section.links.map((link, linkIndex) => (
                        <li key={`${link.label}-${linkIndex}`}>
                          {renderLink(link, linkIndex)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <div className="linear-footer__bottom">
        <div className="linear-footer__container">
          <div className="linear-footer__bottom-content">
            {/* Copyright */}
            {copyright && (
              <div className="linear-footer__copyright">
                {copyright}
              </div>
            )}

            {/* Bottom Links */}
            {bottomLinks.length > 0 && (
              <nav className="linear-footer__bottom-nav" aria-label="Footer navigation">
                <ul className="linear-footer__bottom-links">
                  {bottomLinks.map((link, index) => (
                    <li key={`${link.label}-${index}`}>
                      {renderLink(link, index)}
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};