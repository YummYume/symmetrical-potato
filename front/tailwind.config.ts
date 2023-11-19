import { radixThemePreset } from 'radix-themes-tw';

import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  plugins: [require('tailwindcss-radix')()],
  presets: [radixThemePreset],
  darkMode: 'class',
} satisfies Config;
