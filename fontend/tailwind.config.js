/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F6F6FB',
        surface: '#FFFFFF',
        // primary green (kept under the `teal` name so existing usages reskin)
        teal: {
          900: '#0A4023',
          800: '#0F5C2E',
          700: '#147A3D',
          600: '#1B9C4C',
          500: '#29B85E',
          200: '#BDEFCF',
          100: '#E1FAEA',
        },
        coral: {
          700: '#D94A1D',
          600: '#F15A29',
          500: '#FF8452',
          200: '#FFD3BC',
          100: '#FFEEE4',
        },
        sun: { 500: '#F7C600', 200: '#FCE988', 100: '#FFF7D6' },
        sky: { 600: '#2740B8', 500: '#2F4FDE', 200: '#C9D2FA', 100: '#ECEFFD' },
        aqua: { 700: '#0E8577', 600: '#1BB39E', 100: '#E1F7F3' },
        pink: { 700: '#C24A78', 600: '#F0729A', 200: '#FFD3E2', 100: '#FDEAF0' },
        ink: {
          primary: '#2A2740',
          secondary: '#69637C',
          muted: '#9E97AF',
        },
        line: '#EBE8F5',
        cam: '#231E36',
        danger: '#E5234F',
        warn: { bg: '#FFF7D6', fg: '#8A6400' },
        ok: { bg: '#E4F6E9', fg: '#147A3D' },
      },
      fontFamily: {
        heading: ['Mitr', 'Poppins', 'Sarabun', 'sans-serif'],
        body: ['Sarabun', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '18px',
        btn: '12px',
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
