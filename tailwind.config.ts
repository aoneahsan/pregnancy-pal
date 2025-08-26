import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        'pregnancy-pink': {
          50: 'var(--color-pregnancy-pink-50)',
          100: 'var(--color-pregnancy-pink-100)',
          200: 'var(--color-pregnancy-pink-200)',
          300: 'var(--color-pregnancy-pink-300)',
          400: 'var(--color-pregnancy-pink-400)',
          500: 'var(--color-pregnancy-pink-500)',
          600: 'var(--color-pregnancy-pink-600)',
          700: 'var(--color-pregnancy-pink-700)',
          800: 'var(--color-pregnancy-pink-800)',
          900: 'var(--color-pregnancy-pink-900)',
        },
        'pregnancy-purple': {
          50: 'var(--color-pregnancy-purple-50)',
          100: 'var(--color-pregnancy-purple-100)',
          200: 'var(--color-pregnancy-purple-200)',
          300: 'var(--color-pregnancy-purple-300)',
          400: 'var(--color-pregnancy-purple-400)',
          500: 'var(--color-pregnancy-purple-500)',
          600: 'var(--color-pregnancy-purple-600)',
          700: 'var(--color-pregnancy-purple-700)',
          800: 'var(--color-pregnancy-purple-800)',
          900: 'var(--color-pregnancy-purple-900)',
        },
        'pregnancy-peach': {
          50: 'var(--color-pregnancy-peach-50)',
          100: 'var(--color-pregnancy-peach-100)',
          200: 'var(--color-pregnancy-peach-200)',
          300: 'var(--color-pregnancy-peach-300)',
          400: 'var(--color-pregnancy-peach-400)',
          500: 'var(--color-pregnancy-peach-500)',
          600: 'var(--color-pregnancy-peach-600)',
          700: 'var(--color-pregnancy-peach-700)',
          800: 'var(--color-pregnancy-peach-800)',
          900: 'var(--color-pregnancy-peach-900)',
        }
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
      },
      fontFamily: {
        sans: ['var(--font-family-sans)'],
        display: ['var(--font-family-display)'],
      },
      animation: {
        'accordion-down': 'var(--animate-accordion-down)',
        'accordion-up': 'var(--animate-accordion-up)',
        'fade-in': 'var(--animate-fade-in)',
        'fade-out': 'var(--animate-fade-out)',
        'slide-in': 'var(--animate-slide-in)',
        'slide-out': 'var(--animate-slide-out)',
      },
    },
  },
  plugins: [forms, typography],
} satisfies Config;