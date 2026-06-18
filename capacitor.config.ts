import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wissal.lubriocp',
  appName: 'LubriOCP',
  webDir: 'public',
  server: {
    url: 'https://lubriocp.vercel.app',
    cleartext: false
  }
};

export default config;