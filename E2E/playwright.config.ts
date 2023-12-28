import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  use: {
    baseURL: process.env.BASE_URL ?? 'http://symmetrical-potato.com',
  },
};

export default config;
