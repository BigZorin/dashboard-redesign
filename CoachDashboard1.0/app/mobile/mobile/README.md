# Evotion Mobile App 📱

React Native app voor iOS en Android met Supabase Auth.

## 🚀 Development

### Vereisten
- Node.js 18+
- Expo Go app op je telefoon (download uit App Store / Play Store)

### App starten

```bash
# In de root van het project
cd apps/mobile

# Start de development server
pnpm start
# of
npm start

# Scan de QR code met:
# - iPhone: Camera app
# - Android: Expo Go app
```

## 📱 Screens

### Auth Screens (Nederlands)
- **Login** - Inloggen met email/wachtwoord
- **Register** - Account aanmaken

### App Screens (Nederlands)
- **Home** - Dashboard met welkomstbericht
- **Trainingen** - Workout schema's (komt binnenkort)
- **Cursussen** - E-learning platform (komt binnenkort)
- **Profiel** - Account instellingen

## 🔐 Authenticatie

- Gebruikt Supabase Auth
- Zelfde login als website
- Automatische sessie management
- Token wordt veilig opgeslagen met AsyncStorage

## 🏗️ Architectuur

```
mobile/
├── src/
│   ├── screens/
│   │   ├── auth/           # Login/Register screens
│   │   ├── Home/           # Home screen
│   │   ├── Workouts/       # Trainingen screen
│   │   ├── Courses/        # Cursussen screen
│   │   └── Profile/        # Profiel screen
│   ├── navigation/
│   │   ├── AuthNavigator.tsx    # Auth flow
│   │   ├── AppNavigator.tsx     # Tab navigation
│   │   └── RootNavigator.tsx    # Switch tussen auth/app
│   └── lib/
│       └── supabase.ts     # Supabase client config
```

## 📦 Build voor Production

### iOS (App Store)
```bash
eas build --platform ios
```

### Android (Play Store)
```bash
eas build --platform android
```

## 🎨 Design System

- Kleuren: iOS native blue (#007AFF)
- Font sizes: 14-32px
- Border radius: 12px
- Spacing: 8px grid
- Alles in het Nederlands!
