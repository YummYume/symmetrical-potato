import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  reporter: process.env.CI ? 'dot' : 'list',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://symmetrical-potato.com',
    video: 'retain-on-failure',
  },
};

export default config;
