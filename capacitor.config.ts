import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'bj.materiauxexpress.app',
  appName: 'Matériaux Express',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#E07B39',
      showSpinner: false,
    },
  },
};

export default config;
