/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FAF8F4',
        surface: '#FFFFFF',
        teal: {
          900: '#1F4A40',
          800: '#28584C',
          700: '#2F6F62',
          500: '#4E9484',
          100: '#DCEEE8',
        },
        coral: {
          700: '#B9542A',
          100: '#FBE7D9',
        },
        ink: {
          primary: '#22302C',
          secondary: '#5B6B66',
          muted: '#8E9B96',
        },
        line: '#E6E0D4',
        cam: '#152622',
        danger: '#D9483E',
        // semantic status
        warn: { bg: '#FDF3D9', fg: '#9A6B0A' },
        ok: { bg: '#E6F0E1', fg: '#3B6D11' },
      },
      fontFamily: {
        heading: ['Poppins', 'Sarabun', 'sans-serif'],
        body: ['Inter', 'Sarabun', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '14px',
        btn: '9px',
      },
      boxShadow: {
        card: '0 20px 40px rgba(31,74,64,0.12), 0 2px 8px rgba(31,74,64,0.08)',
      },
    },
  },
  plugins: [],
}
