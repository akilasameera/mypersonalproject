# Project Manager Mobile App

A React Native mobile application for the Project Management System, built with Expo.

## Features

- **Cross-Platform**: Runs on both iOS and Android
- **Native Performance**: Built with React Native for smooth performance
- **Supabase Integration**: Real-time data sync with your web app
- **Secure Authentication**: Secure token storage with Expo SecureStore
- **Offline Support**: Basic offline functionality for viewing data
- **Push Notifications**: Get notified about due dates and updates

## Tech Stack

- **React Native** with TypeScript
- **Expo** for development and building
- **React Navigation** for navigation
- **Supabase** for backend services
- **Expo SecureStore** for secure token storage
- **Vector Icons** for consistent iconography

## Installation

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Setup Steps

1. **Install dependencies**:
   ```bash
   cd mobile-app
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Start development server**:
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**:
   - **iOS**: Press `i` in terminal or scan QR code with Camera app
   - **Android**: Press `a` in terminal or scan QR code with Expo Go app

## Building for Production

### Android APK
```bash
# Install EAS CLI
npm install -g @expo/cli eas-cli

# Login to Expo
npx expo login

# Configure build
eas build:configure

# Build APK
eas build --platform android --profile preview
```

### iOS App
```bash
# Build for iOS (requires Apple Developer account)
eas build --platform ios --profile production
```

## App Structure

```
mobile-app/
├── src/
│   ├── contexts/          # React contexts (Auth)
│   ├── lib/              # Utilities (Supabase client)
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # Screen components
│   └── types/            # TypeScript type definitions
├── assets/               # Images and icons
├── app.json             # Expo configuration
└── package.json         # Dependencies
```

## Key Features

### Authentication
- Email/password login and registration
- Secure token storage with Expo SecureStore
- Automatic session management
- Profile creation and management

### Projects
- View all projects with stats and progress
- Project details with notes, tasks, and links
- Color-coded project organization
- Status tracking (Active, Hold, Completed)

### Tasks (Todos)
- View all tasks across projects
- Filter by status (All, Pending, Completed)
- Toggle task completion
- Priority indicators and due dates
- Overdue task highlighting

### Calendar
- Upcoming items view (next 7 days)
- Project overview with progress
- Due date tracking
- Visual indicators for different item types

### Settings
- User profile information
- App preferences
- Sign out functionality
- About information

## Development

### Running the App
```bash
# Start Expo development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run on web (for testing)
npx expo start --web
```

### Debugging
- Use Expo DevTools for debugging
- React Native Debugger for advanced debugging
- Flipper for network inspection

## Deployment

### Expo Application Services (EAS)
1. **Setup EAS**:
   ```bash
   eas build:configure
   ```

2. **Build for stores**:
   ```bash
   # Android
   eas build --platform android

   # iOS
   eas build --platform ios
   ```

3. **Submit to stores**:
   ```bash
   # Google Play Store
   eas submit --platform android

   # Apple App Store
   eas submit --platform ios
   ```

## Environment Variables

Required environment variables in `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Permissions

The app requires the following permissions:

### Android
- `INTERNET` - Network access
- `ACCESS_NETWORK_STATE` - Network state
- `CAMERA` - Camera access for attachments
- `READ_EXTERNAL_STORAGE` - File access
- `WRITE_EXTERNAL_STORAGE` - File storage

### iOS
- Camera usage (for attachments)
- Photo library access
- Network access

## Troubleshooting

### Common Issues

1. **Metro bundler issues**:
   ```bash
   npx expo start --clear
   ```

2. **iOS simulator not opening**:
   ```bash
   npx expo install --fix
   ```

3. **Android build failures**:
   - Ensure Android Studio is properly installed
   - Check Java version (should be 11+)

4. **Supabase connection issues**:
   - Verify environment variables
   - Check network connectivity
   - Ensure Supabase project is active

### Performance Tips

- Use FlatList for large data sets
- Implement proper loading states
- Use React.memo for expensive components
- Optimize images and assets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both iOS and Android
5. Submit a pull request

## License

This project is licensed under the MIT License.