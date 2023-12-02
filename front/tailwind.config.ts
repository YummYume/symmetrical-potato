import { radixThemePreset } from 'radix-themes-tw';

import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  plugins: [
    require('tailwindcss-radix')(),
    require('tailwindcss-convert-px-to-rem'),
    require('tailwindcss-animated'),
  ],
  presets: [radixThemePreset],
  darkMode: 'class',
} satisfies Config;
