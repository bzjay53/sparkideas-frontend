/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // CSS Variables from UI_COMPONENT_ARCHIVE mapped to Tailwind
        accent: {
          primary: '#3b82f6',      // var(--color-accent-primary)
          hover: '#2563eb',        // var(--color-accent-hover)
          light: '#dbeafe',        // var(--color-accent-light)
        },
        background: {
          primary: '#ffffff',      // var(--color-background-primary)
          secondary: '#f8fafc',    // var(--color-background-secondary)
          tertiary: '#f1f5f9',     // var(--color-background-tertiary)
          elevated: '#ffffff',     // var(--color-background-elevated)
        },
        text: {
          primary: '#1e293b',      // var(--color-text-primary)
          secondary: '#64748b',    // var(--color-text-secondary)
          tertiary: '#94a3b8',     // var(--color-text-tertiary)
          inverse: '#ffffff',      // var(--color-text-inverse)
        },
        border: {
          primary: '#e2e8f0',      // var(--color-border-primary)
          secondary: '#cbd5e1',    // var(--color-border-secondary)
          focus: '#3b82f6',        // var(--color-border-focus)
        },
      },
      spacing: {
        // CSS Variables spacing mapped to Tailwind
        '1': '0.25rem',            // var(--space-1)
        '2': '0.5rem',             // var(--space-2)
        '3': '0.75rem',            // var(--space-3)
        '4': '1rem',               // var(--space-4)
        '6': '1.5rem',             // var(--space-6)
      },
      borderRadius: {
        'sm': '0.25rem',           // var(--radius-sm)
        'md': '0.375rem',          // var(--radius-md)
        'lg': '0.5rem',            // var(--radius-lg)
        'xl': '0.75rem',           // var(--radius-xl)
      },
      fontSize: {
        'small': '0.875rem',       // var(--small-size)
        'text': '1rem',            // var(--text-size)
        'title-5': '1.125rem',     // var(--title-5-size)
      },
      fontWeight: {
        'medium': '500',           // var(--font-weight-medium)
      },
      transitionDuration: {
        'fast': '150ms',           // var(--transition-fast)
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',  // var(--shadow-sm)
      },
    },
  },
  plugins: [],
}