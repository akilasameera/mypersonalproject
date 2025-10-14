import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.projectmanager.app',
  appName: 'Project Manager',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3B82F6',
      showSpinner: false
    },
    StatusBar: {
      style: 'default',
      backgroundColor: '#3B82F6'
    }
  }
};

export default config;