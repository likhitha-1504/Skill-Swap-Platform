/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'rgb(15 23 42)',
            '[class~="lead"]': {
              color: 'rgb(71 85 105)',
            },
            a: {
              color: 'rgb(37 99 235)',
              textDecoration: 'underline',
              fontWeight: '500',
            },
            strong: {
              color: 'rgb(15 23 42)',
              fontWeight: '600',
            },
            'ol > li::marker': {
              fontWeight: '400',
            },
            'ul > li::marker': {
              color: 'rgb(71 85 105)',
            },
            hr: {
              borderColor: 'rgb(226 232 240)',
              borderTopWidth: 1,
            },
            blockquote: {
              color: 'rgb(71 85 105)',
              borderLeftWidth: '0.25rem',
              borderLeftColor: 'rgb(203 213 225)',
              quotes: '"\\201C""\\201D""\\2018""\\2019"',
            },
            h1: {
              color: 'rgb(15 23 42)',
            },
            h2: {
              color: 'rgb(15 23 42)',
            },
            h3: {
              color: 'rgb(15 23 42)',
            },
            h4: {
              color: 'rgb(15 23 42)',
            },
            'figure figcaption': {
              color: 'rgb(107 114 128)',
            },
            code: {
              color: 'rgb(31 41 55)',
              fontWeight: '600',
            },
            'code::before': {
              content: '"`"',
            },
            'code::after': {
              content: '"`"',
            },
            'a code': {
              color: 'rgb(37 99 235)',
            },
            pre: {
              color: 'rgb(226 232 240)',
              backgroundColor: 'rgb(15 23 42)',
            },
            'pre code': {
              backgroundColor: 'transparent',
              borderWidth: '0',
              borderRadius: '0',
              padding: '0',
              fontWeight: '400',
              color: 'inherit',
              fontSize: 'inherit',
              fontFamily: 'inherit',
              lineHeight: 'inherit',
            },
            'pre code::before': {
              content: 'none',
            },
            'pre code::after': {
              content: 'none',
            },
            table: {
              fontSize: '0.875rem',
              lineHeight: '1.7142857',
            },
            'thead th': {
              color: 'rgb(15 23 42)',
              fontWeight: '600',
              borderBottomWidth: '1px',
              borderBottomColor: 'rgb(226 232 240)',
            },
            'tbody tr': {
              borderBottomWidth: '1px',
              borderBottomColor: 'rgb(243 244 246)',
            },
            'tbody tr:last-child': {
              borderBottomWidth: '0',
            },
          },
        },
        dark: {
          css: {
            color: 'rgb(241 245 249)',
            '[class~="lead"]': {
              color: 'rgb(148 163 184)',
            },
            a: {
              color: 'rgb(96 165 250)',
            },
            strong: {
              color: 'rgb(241 245 249)',
            },
            'ol > li::marker': {
              color: 'rgb(148 163 184)',
            },
            'ul > li::marker': {
              color: 'rgb(148 163 184)',
            },
            hr: {
              borderColor: 'rgb(51 65 85)',
            },
            blockquote: {
              color: 'rgb(148 163 184)',
              borderLeftColor: 'rgb(51 65 85)',
            },
            h1: {
              color: 'rgb(241 245 249)',
            },
            h2: {
              color: 'rgb(241 245 249)',
            },
            h3: {
              color: 'rgb(241 245 249)',
            },
            h4: {
              color: 'rgb(241 245 249)',
            },
            'figure figcaption': {
              color: 'rgb(156 163 175)',
            },
            code: {
              color: 'rgb(241 245 249)',
            },
            'a code': {
              color: 'rgb(96 165 250)',
            },
            pre: {
              color: 'rgb(226 232 240)',
              backgroundColor: 'rgb(15 23 42)',
            },
            'thead th': {
              color: 'rgb(241 245 249)',
              borderBottomColor: 'rgb(51 65 85)',
            },
            'tbody tr': {
              borderBottomColor: 'rgb(30 41 59)',
            },
          },
        },
      },
    },
  },
  plugins: [],
}
