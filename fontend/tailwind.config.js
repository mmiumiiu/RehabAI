/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // "RehabAI Colorful" palette
        bg: '#F7F6FD',
        surface: '#FFFFFF',
        // BIG / primary green (kept under the `teal` name so existing usages reskin)
        teal: {
          900: '#14522B',
          800: '#1E7A40',
          700: '#1E7A40',
          600: '#2FA65A',
          500: '#2FA65A',
          200: '#BDEFCF',
          100: '#E3F6E9',
        },
        // LOUD / red
        coral: {
          700: '#B33630',
          600: '#E8554D',
          500: '#E8554D',
          200: '#FBC0BA',
          100: '#FDE8E4',
        },
        indigo: { 700: '#473CC7', 600: '#5B50E0', 100: '#EFEBFE' },
        sun: { 700: '#B8860B', 600: '#D9A616', 500: '#F7C132', 200: '#FCE988', 100: '#FFF4D6', text: '#3A2C00' },
        sky: { 600: '#1D5FBF', 500: '#3D87E8', 200: '#C9D2FA', 100: '#E7F0FE' },
        pink: { 700: '#B03A76', 600: '#D9538F', 200: '#FFD3E2', 100: '#FBE7F1' },
        ink: {
          primary: '#2B2650',
          secondary: '#6B6590',
          muted: '#9B95BD',
        },
        line: '#E9E6F7',
        cam: '#231E36',
        danger: '#E5234F',
        warn: { bg: '#FFF4D6', fg: '#B8860B' },
        ok: { bg: '#E3F6E9', fg: '#1E7A40' },
      },
      fontFamily: {
        heading: ['Mitr', 'Poppins', 'Sarabun', 'sans-serif'],
        body: ['Sarabun', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '22px',
        btn: '16px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 3px 10px rgba(15,70,45,0.07)',
        soft: '0 14px 34px rgba(15,70,45,0.12)',
      },
    },
  },
  plugins: [],
}
