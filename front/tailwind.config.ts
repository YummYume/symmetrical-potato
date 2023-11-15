import { radixThemePreset } from 'radix-themes-tw';

import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('tailwindcss-radix')()],
  presets: [radixThemePreset],
  darkMode: 'class',
} satisfies Config;
