# ROADSoS Mobile App - React Native

A fully-featured React Native Android application for emergency response and roadside assistance, built with Expo for rapid development and easy deployment.

## Overview

ROADSoS is a community-driven emergency response platform that helps users quickly connect with emergency services and nearby helpers for:
- Medical emergencies
- Vehicle fires
- Breakdowns
- Fuel issues
- Flood/water emergencies
- Silent SOS alerts

## ✨ Features

### Core Emergency Flows
- **6 Emergency Types**: Medical, Fire, Breakdown, Fuel, Flood, Silent SOS
- **Smart Triage**: Quick assessment to determine urgency level
- **Real-time Location**: GPS-based incident mapping
- **Service Discovery**: Find nearby hospitals, gas stations, mechanics
- **Incident Sharing**: Shareable incident links for family/emergency contacts

### User Experience
- **Mobile-Optimized UI**: Single-thumb operation, large touch targets
- **Intuitive Navigation**: Bottom tab navigation for quick access
- **Onboarding Flow**: 3-step introduction with permissions
- **Profile Management**: User setup and emergency contact tracking
- **Medical QR ID**: Offline medical information sharing
- **Safe Arrival**: Timer-based check-in system

### Technical Features
- **React Navigation**: Native-feeling stack and tab navigation
- **Expo**: Production-ready build system and CLI tools
- **GPS Integration**: `expo-location` for accurate positioning
- **Notifications**: `expo-notifications` for alerts
- **Zustand State Management**: Lightweight global state
- **TypeScript**: Full type safety throughout

## 📱 Screenshots Flow

```
Splash (2s) → Onboarding (3 slides) → Permissions → Setup → Home Screen
                                                              ↓
                                    ┌─────────┬───────┬──────┴──────┬────────┐
                                    ↓         ↓       ↓             ↓        ↓
                              Medical    Fire  Breakdown  Fuel    Flood    SOS
                                    ↓         ↓       ↓             ↓        ↓
                                Triage    Evacu-  Issues  Station  Safety  Silent
                                    ↓         ↓       ↓             ↓        ↓
                                Details   Services Map   Services  Alert   Alert
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 16+ and npm/yarn
- **Expo CLI**: `npm install -g expo-cli`
- **Android Studio** (for Android emulator) OR physical Android device
- **Git** (optional, for version control)

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Expo development server
npm run start

# Run on Android emulator
npm run android

# Or run on iOS simulator (Mac only)
npm run ios

# Or run on web (for testing UI)
npm run web
```

The app will open in your browser or device. Use Expo Go app on Android for testing.

### Building for Production

#### Android APK/AAB
```bash
# Configure EAS (first time)
eas build:configure

# Build APK
eas build --platform android --local

# Or build for Play Store (AAB)
eas build --platform android --local
```

#### iOS IPA
```bash
# Build for iOS
eas build --platform ios --local
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── screens/              # Screen components
│   │   ├── OnboardingScreens.tsx    # Splash, Onboarding, Permissions, Setup
│   │   ├── HomeScreen.tsx           # Main app with tabs
│   │   ├── EmergencyScreens.tsx     # All 6 emergency types
│   │   └── SupportScreens.tsx       # Incident, Bystander, Medical ID, Safe Arrival
│   ├── components/
│   │   └── Layout.tsx               # Reusable UI components
│   ├── store.ts                     # Zustand state management
│   ├── api.ts                       # Backend API client
│   ├── App.tsx                      # Navigation setup
│   └── main.tsx                     # React Native entry point
├── app.json                         # Expo configuration
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── tailwind.config.js              # (web only, not used in mobile)
├── .env.example                     # Environment template
└── README.md
```

## 🎯 Navigation Stack

```
OnboardingStack (Splash → Onboarding → Permissions → Setup)
    ↓
HomeStack
    ├── HomeScreen (main tab navigation)
    ├── EmergencyFlows (6 emergency screens)
    │   └── IncidentMap (result screen)
    └── SupportFlows (Bystander, Medical ID, Safe Arrival)
```

## 💾 State Management (Zustand)

Global state persisted in store:

```typescript
{
  // Onboarding
  onboardingComplete: boolean
  permissionsGranted: boolean
  
  // User
  userName: string
  userPhone: string
  emergencyContacts: Array<{ name, phone }>
  medicalInfo: string
  
  // Incident
  emergencyType: string
  triageLevel: 'critical' | 'moderate' | 'minor'
  location: { lat, lng }
  kmMarker: string
  currentIncidentId: string
  bystanders: Array<{ id, role }>
  
  // Actions
  setOnboarding(), setPermissions(), setEmergencyType(), etc.
}
```

## 🔌 API Integration

Backend endpoint structure:

```
POST   /api/v1/emergency              - Create emergency
GET    /api/v1/emergency/{id}         - Get details
PUT    /api/v1/emergency/{id}         - Update status
GET    /api/v1/services/nearby        - Find nearby services
GET    /api/v1/users/me               - Get user profile
POST   /api/v1/users/qr-code          - Generate QR
```

## ⚙️ Configuration

### Environment Variables

Create `.env.local`:

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_ENABLE_MAPS=true
VITE_ENABLE_NOTIFICATIONS=true
```

### Expo Configuration (app.json)

Key settings:
- `name`: App name (ROADSoS)
- `package`: Android package ID (com.roadsos.app)
- `bundleIdentifier`: iOS app ID
- `plugins`: Permissions (location, camera, contacts)
- `orientation`: Portrait mode

## 🎨 UI Components

### Reusable Components
- `SafeAreaContainer`: Safe area wrapper
- `Header`: Sticky header with back button
- `EmergencyButton`: Large emergency action button
- `Button`: Primary/secondary button
- `Card`: Information card
- `FormField`: Form field with label
- `BottomTabs`: Navigation tabs
- `Spinner`: Loading indicator

### Color Scheme
- **Red** (#ef4444): Medical, SOS
- **Orange** (#f97316): Fire  
- **Blue** (#3b82f6): Breakdown, General
- **Purple** (#a855f7): Fuel
- **Green** (#22c55e): Bystander

## 🌐 Permissions Required

### Android Manifest
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.CALL_PHONE" />
<uses-permission android:name="android.permission.READ_CONTACTS" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

### Runtime Permissions (Handled by Expo)
- Location (foreground)
- Camera (for QR scanning)
- Contacts (for emergency contacts)
- Notifications

## 📦 Key Dependencies

```json
{
  "react": "18.2.0",
  "react-native": "0.73.2",
  "expo": "^50.0.0",
  "expo-location": "^16.7.0",
  "@react-navigation/native": "^6.1.10",
  "@react-navigation/bottom-tabs": "^6.5.11",
  "@react-navigation/stack": "^6.3.20",
  "zustand": "^4.4.0",
  "axios": "^1.6.0"
}
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Onboarding flow completes
- [ ] All 6 emergency types load
- [ ] Triage questions work
- [ ] Location permission handling
- [ ] GPS location capture
- [ ] Incident creation and display
- [ ] Bottom tab navigation
- [ ] State persistence
- [ ] Back button behavior
- [ ] Medical ID QR display
- [ ] Safe Arrival setup

### Device Testing
- Test on physical Android device
- Test landscape orientation
- Test with low network
- Test location disabled
- Test dark mode (if supported)

## 🚀 Deployment

### Expo Go (Development)
```bash
npm run start
# Scan QR code with Expo Go app
```

### Internal Distribution
```bash
# Create APK for testing
eas build --platform android
```

### App Store Deployment
```bash
# Play Store (Android)
eas submit --platform android

# App Store (iOS)
eas submit --platform ios
```

## 🔐 Security Considerations

1. **API Authentication**: Implement JWT tokens
2. **Location Privacy**: Only collect while incident active
3. **Contact Data**: Encrypted local storage
4. **QR Code**: No sensitive data in QR (URL only)
5. **HTTPS**: Use HTTPS for all API calls

## 🐛 Debugging

### Enable Debugging
```bash
# Show debug menu
Ctrl+M (Android)
Cmd+D (iOS)

# View logs
expo logs
```

### Redux DevTools
Install and use Redux DevTools for state inspection (can integrate with Zustand).

## 📚 Resources

- [React Native Docs](https://reactnative.dev)
- [Expo Documentation](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org)
- [Zustand](https://github.com/pmndrs/zustand)
- [TypeScript React Native](https://www.typescriptlang.org/docs/handbook/react.html)

## 📝 Known Limitations

- Map display is placeholder (integrate Mapbox/Google Maps)
- QR code generation is UI placeholder
- No real-time incident updates (requires WebSocket)
- Location services require permissions
- Some features require backend implementation

## 🎁 Enhancement Opportunities

1. **Real-time Maps**: Mapbox GL Native
2. **WebSocket**: Socket.io for live updates
3. **Push Notifications**: Background alert system
4. **Call Integration**: React Native Phone Call
5. **Voice Messaging**: Agora SDK integration
6. **Offline Support**: Redux Persist
7. **Analytics**: Segment/Firebase
8. **Multi-language**: i18next integration

## 📞 Support

For issues or questions:
1. Check existing issues on GitHub
2. Read Expo and React Navigation docs
3. Run `expo doctor` to diagnose setup issues
4. Check device logs with `expo logs`

## 📄 License

MIT

---

**Built for Impact. Powered by React Native. 🚀**

Last Updated: May 2026
Version: 1.0.0

