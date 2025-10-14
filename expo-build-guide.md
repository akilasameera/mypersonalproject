# 📱 Expo Cloud Build Guide for Project Manager

## 🚀 Quick Start - Build APK in Cloud

### 1. **Install Expo CLI**
```bash
npm install -g @expo/cli eas-cli
```

### 2. **Navigate to Expo App**
```bash
cd expo-app
```

### 3. **Login to Expo**
```bash
npx expo login
```

### 4. **Configure EAS Build**
```bash
eas build:configure
```

### 5. **Build APK in Cloud**
```bash
# For development/testing
eas build --platform android --profile preview

# For production
eas build --platform android --profile production
```

## 📋 Build Profiles

### **Preview Build (APK)**
- Creates installable APK file
- Good for testing and sharing
- Faster build time
- Command: `eas build --platform android --profile preview`

### **Production Build**
- Optimized for Google Play Store
- Creates AAB (Android App Bundle)
- Command: `eas build --platform android --profile production`

## 🔧 Configuration Files

### **app.json**
- App metadata and configuration
- Icons, splash screens, permissions
- Bundle identifiers and app name

### **eas.json**
- Build configuration for EAS
- Different build profiles
- Platform-specific settings

## 📱 Build Process

1. **Code Upload** - Your code is uploaded to Expo's servers
2. **Cloud Build** - Built on Expo's infrastructure
3. **Download Link** - Get download link when complete
4. **Install APK** - Install directly on Android device

## 🎯 Key Features

### **✅ Advantages:**
- **No Android Studio Required** - Build entirely in the cloud
- **Fast Setup** - Ready to build in minutes
- **Professional Builds** - Optimized and signed
- **Easy Sharing** - Direct download links
- **Multiple Profiles** - Development, preview, production

### **📦 What You Get:**
- **Installable APK** - Ready to install on Android
- **Signed App** - Properly signed for distribution
- **Optimized Build** - Production-ready performance
- **Easy Updates** - Simple update process

## 🚀 Commands Reference

```bash
# Install tools
npm install -g @expo/cli eas-cli

# Login to Expo
npx expo login

# Configure build
eas build:configure

# Build APK (preview)
eas build --platform android --profile preview

# Build for production
eas build --platform android --profile production

# Check build status
eas build:list

# Submit to Google Play
eas submit --platform android
```

## 📱 Installation

1. **Download APK** from the build completion email/dashboard
2. **Enable Unknown Sources** on your Android device
3. **Install APK** by tapping the downloaded file
4. **Launch App** from your app drawer

## 🔄 Updates

To update your app:
1. Make changes to your code
2. Run `eas build` again
3. Download and install the new APK

## 💡 Tips

- **First Build** takes longer (10-15 minutes)
- **Subsequent Builds** are faster (5-10 minutes)
- **Check Email** for build completion notifications
- **Use Preview Profile** for testing
- **Use Production Profile** for store submission

## 🆘 Troubleshooting

### **Build Fails:**
- Check `app.json` configuration
- Verify bundle identifier is unique
- Check for syntax errors in code

### **APK Won't Install:**
- Enable "Install from Unknown Sources"
- Check Android version compatibility
- Clear download cache and re-download

### **App Crashes:**
- Check Expo logs in development
- Test on multiple devices
- Verify all dependencies are compatible

## 🎉 Success!

Once your build completes, you'll have a professional Android APK ready to install and share! The entire process happens in the cloud, so you don't need any local Android development tools.