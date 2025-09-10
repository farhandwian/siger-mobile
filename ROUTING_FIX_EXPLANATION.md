# Routing Fix for Splash Screen Issue

## 🎯 **Problem Identified**
The app was showing the React Native welcome page because:

1. **Expo Router Auto-Discovery**: Expo Router automatically finds the first available route
2. **Conflicting Routes**: The `(tabs)/index.tsx` was being treated as the main entry point
3. **Ignored initialRouteName**: The `initialRouteName="splash"` was being ignored by Expo Router

## ✅ **Fix Applied**

### **Created Root Index Route**
```tsx
// app/index.tsx (NEW FILE)
import { Redirect } from "expo-router";

export default function App() {
  return <Redirect href="/splash" />;
}
```

### **Updated Layout Navigation**
```tsx
// app/_layout.tsx
<Stack>
  <Stack.Screen name="index" options={{ headerShown: false }} />
  <Stack.Screen name="splash" options={{ headerShown: false }} />
  // ... other routes
</Stack>
```

## 🔄 **New Flow**
```
App Launch → app/index.tsx → Redirect to /splash → splash.tsx (2s) → login.tsx
```

## 📱 **Expected Behavior Now**
1. **App opens** → Immediately redirects to splash
2. **Native splash** shows (configured in app.json)
3. **Custom splash** shows for 2 seconds with SIGER logo
4. **Login screen** appears

## 🧪 **Testing Steps**
1. Force close the app completely
2. Reopen the app
3. Should see: Native splash → Custom splash → Login
4. No more React Native welcome screen

## 🔍 **Why This Works**
- **Expo Router** looks for `app/index.tsx` as the entry point
- **Redirect component** immediately sends user to `/splash`
- **No interference** from tabs or other routes
- **Clean routing** follows Expo Router conventions

## 📚 **Technical Details**

### Before Fix:
```
App Launch → Expo Router finds (tabs)/index.tsx → Welcome Screen
```

### After Fix:
```
App Launch → app/index.tsx → <Redirect href="/splash" /> → splash.tsx
```

### Route Priority in Expo Router:
1. `app/index.tsx` (highest priority) ✅
2. `app/(tabs)/index.tsx` (secondary)
3. Other named routes

The key insight is that Expo Router uses file-based routing and the root `index.tsx` takes precedence over nested index files.
