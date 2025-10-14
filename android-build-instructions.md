# Building APK with Capacitor

## Prerequisites
1. **Android Studio** - Download from https://developer.android.com/studio
2. **Java Development Kit (JDK)** - Version 11 or higher
3. **Android SDK** - Installed via Android Studio

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Web App
```bash
npm run build
```

### 3. Add Android Platform
```bash
npx cap add android
```

### 4. Sync Web Assets
```bash
npx cap sync android
```

### 5. Open in Android Studio
```bash
npx cap open android
```

## Building APK in Android Studio

### Method 1: Debug APK (Quick)
1. In Android Studio, go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Wait for build to complete
3. Click **locate** to find the APK file
4. APK will be in: `android/app/build/outputs/apk/debug/app-debug.apk`

### Method 2: Release APK (Production)
1. Go to **Build** → **Generate Signed Bundle / APK**
2. Select **APK** and click **Next**
3. Create a new keystore or use existing one
4. Fill in keystore details:
   - **Key store path**: Choose location for new keystore
   - **Password**: Create a strong password
   - **Key alias**: e.g., "projectmanager"
   - **Key password**: Same or different password
   - **Validity**: 25+ years
   - **Certificate info**: Fill in your details
5. Click **Next** → Select **release** → **Finish**
6. APK will be in: `android/app/release/app-release.apk`

## Alternative: Command Line Build

### Debug APK
```bash
cd android
./gradlew assembleDebug
```

### Release APK (after setting up signing)
```bash
cd android
./gradlew assembleRelease
```

## App Configuration

### Update App Info
Edit `android/app/src/main/res/values/strings.xml`:
```xml
<resources>
    <string name="app_name">Project Manager</string>
    <string name="title_activity_main">Project Manager</string>
    <string name="package_name">com.projectmanager.app</string>
    <string name="custom_url_scheme">com.projectmanager.app</string>
</resources>
```

### Update App Icon
Replace files in `android/app/src/main/res/`:
- `mipmap-hdpi/ic_launcher.png` (72x72)
- `mipmap-mdpi/ic_launcher.png` (48x48)
- `mipmap-xhdpi/ic_launcher.png` (96x96)
- `mipmap-xxhdpi/ic_launcher.png` (144x144)
- `mipmap-xxxhdpi/ic_launcher.png` (192x192)

### Permissions
Edit `android/app/src/main/AndroidManifest.xml` to add required permissions:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

## Development Workflow

### 1. Make Changes to Web App
```bash
# Make your changes to React code
npm run build
```

### 2. Sync Changes
```bash
npx cap sync android
```

### 3. Test in Android Studio
```bash
npx cap open android
```

### 4. Build New APK
Follow the APK building steps above

## Troubleshooting

### Common Issues:
1. **Gradle Build Failed**: Update Android Studio and SDK
2. **Java Version Issues**: Ensure JDK 11+ is installed
3. **SDK Not Found**: Set ANDROID_HOME environment variable
4. **Build Tools Missing**: Install via Android Studio SDK Manager

### Environment Variables (Add to ~/.bashrc or ~/.zshrc):
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## Testing
- Test on Android emulator in Android Studio
- Test on physical device via USB debugging
- Use Chrome DevTools for web debugging: `chrome://inspect`

## Distribution
- **Google Play Store**: Use signed release APK
- **Direct Distribution**: Share APK file directly
- **Internal Testing**: Use debug APK for testing