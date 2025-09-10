# Android Maps Fix Guide

## Issue: Maps work on iOS but not on Android

### Root Causes & Solutions

## 1. **Enable Google Maps API for Android**

Your API key needs to have the correct APIs enabled in Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Library"
4. Enable these APIs:
   - ✅ **Maps SDK for Android** (REQUIRED)
   - ✅ **Maps SDK for iOS** (already working)
   - ✅ **Geocoding API** (for address search)
   - ✅ **Places API** (if using Places features)

## 2. **API Key Restrictions**

Check if your API key has restrictions:

1. Go to "APIs & Services" > "Credentials"
2. Click on your API key
3. Under "Application restrictions":
   - Choose "None" for development
   - OR add your Android package name: `com.sigermobile.app`

## 3. **Add Android Permissions**

Create/update the Android permissions configuration:

```json
// In app.json
"android": {
  "package": "com.sigermobile.app",
  "permissions": [
    "ACCESS_COARSE_LOCATION",
    "ACCESS_FINE_LOCATION"
  ],
  "config": {
    "googleMaps": {
      "apiKey": "AIzaSyDJ_su_d2pygaLLlbGmuP7A3ckGwSq-yF8"
    }
  },
  "adaptiveIcon": {
    "foregroundImage": "./assets/images/adaptive-icon.png",
    "backgroundColor": "#ffffff"
  },
  "edgeToEdgeEnabled": true
}
```

## 4. **Verify react-native-maps Plugin**

Make sure the plugin configuration is correct:

```json
[
  "react-native-maps",
  {
    "iosGoogleMapsApiKey": "AIzaSyDJ_su_d2pygaLLlbGmuP7A3ckGwSq-yF8",
    "androidGoogleMapsApiKey": "AIzaSyDJ_su_d2pygaLLlbGmuP7A3ckGwSq-yF8"
  }
]
```

## 5. **Check for Common Errors**

### In Expo Development:
```bash
# Clear Expo cache
npx expo start --clear

# Check for specific Android errors
npx expo run:android
```

### Look for these Android-specific errors:
- "API key not valid for Android apps"
- "The Google Play services version on this device is not supported"
- "Network request failed"
- "Map failed to load"

## 6. **Alternative: Use OSM for Development**

If Google Maps continues to cause issues, you can temporarily use OpenStreetMap:

```typescript
// In MapLocationPicker component, add fallback
const MapView = Platform.OS === 'android' && __DEV__ 
  ? require('react-native-maps').default  // Fallback to basic maps
  : require('react-native-maps').default;
```

## 7. **Debugging Steps**

### Enable Developer Options on Android:
1. Go to Settings > About phone
2. Tap "Build number" 7 times
3. Go to Settings > Developer options
4. Enable "USB debugging"

### Check Logs:
```bash
# Android logs
npx react-native log-android

# Or with adb
adb logcat | grep -i "maps\|google"
```

## 8. **Clean Build Process**

```bash
# Clean everything
npx expo start --clear
cd android && ./gradlew clean && cd ..

# Rebuild
npx expo run:android
```

## 9. **Test API Key**

Test your API key directly:
```
https://maps.googleapis.com/maps/api/geocode/json?address=jakarta&key=AIzaSyDJ_su_d2pygaLLlbGmuP7A3ckGwSq-yF8
```

Should return valid JSON response, not an error.

## 10. **Expo Go vs Development Build**

### If using Expo Go:
- Maps should work with correct API configuration
- Make sure you're using the latest Expo Go app

### If using Development Build:
- You'll need to rebuild after changing native configurations
- Run `npx expo run:android` after any config changes

## Quick Fix Checklist:

- [ ] Enable "Maps SDK for Android" in Google Cloud Console
- [ ] Remove API key restrictions (set to "None")
- [ ] Add Android permissions to app.json
- [ ] Clear Expo cache and restart
- [ ] Test API key in browser
- [ ] Check Android device has Google Play Services
- [ ] Verify internet connection on device
- [ ] Check if using correct package name in restrictions

Most commonly, the issue is **"Maps SDK for Android" not being enabled** in Google Cloud Console.
