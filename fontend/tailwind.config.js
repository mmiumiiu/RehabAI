/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── "BRIDGE" palette (design/bridge-mockup.html) ──────────────────
        // Sky-blue surfaces, deep navy ink, red for the primary action.
        // The old token NAMES are kept (teal / coral / sun / …) so every
        // existing page reskins without being touched.
        bg: '#F3F9FC',
        surface: '#FFFFFF',

        // Blue accent — the BRIDGE brand colour.
        // (Still named `teal` so existing `bg-teal-700` usages pick it up.)
        teal: {
          900: '#0B2E45',
          800: '#0B3550',
          700: '#157AB5',
          600: '#157AB5',
          500: '#3E9AD0',
          200: '#B4DCEC',
          100: '#E0F1FA',
          50: '#F5FAFD',
        },
        // Red — the primary button colour in BRIDGE.
        coral: {
          800: '#9E1F1F', // 3D bottom edge / pressed
          700: '#B3261E', // mockup's danger text
          600: '#D32F2F', // primary button fill
          500: '#D32F2F',
          200: '#EDB3AD',
          100: '#FBE3E0',
        },
        indigo: { 700: '#4B2A86', 600: '#6D3FC0', 100: '#EEE8FA' },
        sun: { 700: '#6B4A00', 600: '#8E5F2C', 500: '#E6CF86', 200: '#FFF1C7', 100: '#FFF6E3', text: '#4A2E0F' },
        sky: { 600: '#157AB5', 500: '#3E9AD0', 200: '#B4DCEC', 100: '#E0F1FA' },
        pink: { 700: '#4B2A86', 600: '#6D3FC0', 200: '#DDC9F5', 100: '#EEE8FA' },
        ink: {
          primary: '#0B2E45',
          secondary: '#3A5468',
          muted: '#6C8699',
        },
        line: '#CDE3EE',
        cam: '#0B2E45',
        danger: '#D32F2F',
        warn: { bg: '#FFF6E3', fg: '#6B4A00' },
        ok: { bg: '#E3F1DC', fg: '#24661A' },
      },
      fontFamily: {
        // BRIDGE uses the looped Thai face (มีหัว); Sarabun stays as fallback.
        heading: ['"IBM Plex Sans Thai Looped"', 'Sarabun', 'Inter', 'sans-serif'],
        body: ['"IBM Plex Sans Thai Looped"', 'Sarabun', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      // Mockup type scale. The mockup is drawn at zoom 1; the app runs at
      // body zoom 1.3–1.4 (App.jsx), so each value is the mockup px ÷ 1.4 —
      // i.e. these render at the size the mockup shows.
      fontSize: {
        'b-xs': ['14px', '1.5'],   // 20px in mockup
        'b-sm': ['16px', '1.55'],  // 22px
        'b-label': ['17px', '1.5'], // 24px — field labels
        'b-base': ['18px', '1.6'], // 26px — body copy, inputs
        'b-btn': ['20px', '1.3'],  // 28px — buttons
        'b-h3': ['24px', '1.35'],  // 34px
        'b-h2': ['31px', '1.3'],   // 44px
        'b-h1': ['36px', '1.25'],  // 50px
        'b-hero': ['39px', '1.3'], // 54px
      },
      borderRadius: {
        card: '26px',
        btn: '22px',
        field: '20px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 10px 28px rgba(21,122,181,0.08)',
        soft: '0 6px 18px rgba(21,122,181,0.10)',
      },
    },
  },
  plugins: [],
}
