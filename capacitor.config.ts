import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fatihdisci.cobill',
  appName: 'CoBill',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      backgroundColor: "#000000",
      launchShowDuration: 2000,
    }
  }
};

export default config;
