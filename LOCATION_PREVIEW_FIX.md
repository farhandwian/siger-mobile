# Location Preview Fix - Debugging Guide

## 🐛 **Issue Fixed**
The "Maximum update depth exceeded" error was caused by an infinite loop in the useEffect that handles location parameters.

## ✅ **Solution Applied**

### **Root Cause**
- `params` object reference changes on every render
- useEffect with `[params]` dependency was causing infinite re-renders
- Each re-render triggered the effect, which triggered another re-render

### **Fix Applied**
```tsx
// Before (causing infinite loop):
useEffect(() => {
  // ... location logic
}, [params]); // params reference changes every render

// After (stable dependencies):
const locationParams = useMemo(() => ({
  latitude: params.selectedLatitude,
  longitude: params.selectedLongitude,
  address: params.selectedAddress,
}), [params.selectedLatitude, params.selectedLongitude, params.selectedAddress]);

useEffect(() => {
  // ... location logic  
}, [locationParams]); // stable memoized reference
```

## 🔧 **Changes Made**

1. **Added useMemo** to stabilize parameter dependencies
2. **Fixed navigation** in locationForm to use `router.push()` instead of `router.back()`
3. **Added debugging logs** to track data flow

## 📱 **Expected Flow Now**

1. **Select location** in locationForm
2. **Tap "Simpan Lokasi"** 
3. **Navigate to createTask** with location params
4. **Location preview** should appear in createTask form
5. **No more infinite loop errors**

## 🧪 **Test Steps**

1. Open createTask form
2. Tap "Pilih Lokasi" button
3. Select a location in locationForm
4. Tap "Simpan Lokasi"
5. Should return to createTask with location preview showing

## 📊 **Debug Information**

Check the console logs for:
- "CreateTask params received": Should show location data
- "Setting location from params": Should show parsed coordinates
- "Location state changed": Should show the final location object

If location preview still doesn't show, check:
- Console logs for parameter data
- Network requests in locationForm for address search
- Map rendering in location preview section
