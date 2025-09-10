# iOS Splash Screen Fix Guide

## Issue: iOS shows React Native welcome page instead of custom splash screen

### Root Cause
The issue occurs because:
1. Expo's native splash screen and custom splash screen are conflicting
2. Missing proper splash screen configuration in app.json
3. The app routing isn't properly handling the initial route

## ✅ **Fixes Applied**

### 1. **Added Proper Splash Screen Configuration**
```json
// Added to app.json
"splash": {
  "image": "./assets/images/splash-icon.png",
  "resizeMode": "contain", 
  "backgroundColor": "#1A365D"
},
"ios": {
  "splash": {
    "image": "./assets/images/splash-icon.png",
    "resizeMode": "contain",
    "backgroundColor": "#1A365D",
    "tabletImage": "./assets/images/splash-icon.png"
  }
}
```

### 2. **Updated App Layout with Proper Splash Handling**
```tsx
// Added to _layout.tsx
import * as SplashScreen from "expo-splash-screen";

// Keep splash visible while loading
SplashScreen.preventAutoHideAsync();

// Hide splash when fonts loaded
useEffect(() => {
  if (loaded) {
    SplashScreen.hideAsync();
  }
}, [loaded]);
```

### 3. **Added Missing Route**
Added `locationForm` route to the Stack navigation.

## 🔧 **Additional Steps Needed**

### 1. **Clear Expo Cache**
```bash
npx expo start --clear
```

### 2. **Rebuild for iOS (if using Development Build)**
```bash
npx expo run:ios
```

### 3. **Check Splash Image**
Make sure `./assets/images/splash-icon.png` exists and is properly sized:
- **iOS**: 1242x2208px (iPhone 6+ landscape)
- **Universal**: 1284x2778px (iPhone 12 Pro Max)

## 🎯 **Expected Behavior**

### Before Fix:
1. iOS shows React Native welcome screen
2. Custom splash screen doesn't appear
3. App goes directly to welcome page

### After Fix:
1. **Native splash** appears first (with splash-icon.png)
2. **Custom splash screen** (splash.tsx) appears for 2 seconds
3. **Login screen** appears after 2 seconds

## 🚨 **Common Issues & Solutions**

### Issue 1: Still showing React Native welcome
**Solution**: Make sure you're not in debug mode and clear all caches:
```bash
npx expo start --clear --no-dev --minify
```

### Issue 2: Splash image not showing
**Solution**: Check image path and create proper splash images:
```bash
# Make sure this file exists:
assets/images/splash-icon.png
```

### Issue 3: App crashes on launch
**Solution**: Check that all routes are properly defined:
- splash.tsx ✅
- login.tsx ✅  
- locationForm.tsx ✅

## 📱 **iOS Specific Configuration**

### For Development (Expo Go):
- Native splash should work automatically
- Custom splash will show after native splash

### For Production Build:
- Both native and custom splash will work seamlessly
- iOS Launch Screen will use the configured splash image

## 🔄 **Splash Screen Flow**

```
iOS App Launch
     ↓
Native Splash (splash-icon.png) - 1-2 seconds
     ↓
Custom Splash (splash.tsx) - 2 seconds  
     ↓
Login Screen
```

## ⚡ **Quick Test**

1. Close the app completely
2. Restart Expo dev server: `npx expo start --clear`
3. Open app on iOS device
4. Should see: Native splash → Custom splash → Login

The key fix was adding the proper `splash` configuration to app.json and handling the native splash screen properly in the layout.
