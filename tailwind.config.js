/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#00d4aa',
          dim: 'rgba(0, 212, 170, 0.15)',
          dark: '#00b894',
          light: '#55fcd0',
        },
        accent: {
          DEFAULT: '#ff6b6b',
          dim: 'rgba(255, 107, 107, 0.15)',
          dark: '#ee5a24',
          light: '#ff8f8f',
        },
        surface: {
          DEFAULT: '#16161f',
          hover: '#1e1e2e',
          elevated: '#10101a',
        },
        bg: {
          DEFAULT: '#08080f',
          elevated: '#10101a',
        },
        text: {
          DEFAULT: '#f0f0f5',
          secondary: '#9898b0',
          muted: '#5a5a72',
        },
      },
      animation: {
        'mesh-move': 'meshMove 20s ease-in-out infinite',
        'orb-float-1': 'orbFloat1 15s ease-in-out infinite',
        'orb-float-2': 'orbFloat2 18s ease-in-out infinite',
        'orb-float-3': 'orbFloat3 12s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-out infinite',
        'rotate-slow': 'rotate-slow 30s linear infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        meshMove: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.1)' },
        },
        orbFloat1: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '33%': { transform: 'translate(40px, -30px)' },
          '66%': { transform: 'translate(-20px, 20px)' },
        },
        orbFloat2: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '33%': { transform: 'translate(-30px, 40px)' },
          '66%': { transform: 'translate(20px, -20px)' },
        },
        orbFloat3: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(30px, -40px)' },
        },
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(30px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        scaleIn: {
          'from': { opacity: '0', transform: 'scale(0.92)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          'from': { opacity: '0', transform: 'translateX(30px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%': { 'box-shadow': '0 0 0 0 rgba(0, 212, 170, 0.4)' },
          '70%': { 'box-shadow': '0 0 0 10px rgba(0, 212, 170, 0)' },
          '100%': { 'box-shadow': '0 0 0 0 rgba(0, 212, 170, 0)' },
        },
        'rotate-slow': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': '200% 0' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.4)',
        'primary-glow': '0 4px 20px rgba(0, 212, 170, 0.3)',
        'primary-glow-lg': '0 8px 30px rgba(0, 212, 170, 0.4)',
        'accent-glow': '0 4px 20px rgba(255, 107, 107, 0.3)',
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
