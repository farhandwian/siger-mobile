# Map Location Picker Implementation

This implementation provides a reusable map-based location picker component that allows users to search places and select coordinates, similar to ride-hailing apps.

## Features

- **Search functionality**: Google Places Autocomplete with search suggestions
- **Map interaction**: Tap or long-press on map to select location
- **Current location**: "My Location" button with GPS positioning
- **Address resolution**: Automatic address lookup from coordinates
- **Form integration**: Easy integration with existing forms
- **TypeScript support**: Fully typed components
- **Platform support**: Works on both Android and iOS

## Components

### 1. MapLocationPicker
The core map component with search and selection functionality.

**Props:**
```typescript
interface MapLocationPickerProps {
  value?: LocationValue;
  onChange: (val: LocationValue) => void;
  errorText?: string;
  initialRegion?: MapRegion;
  showMyLocationButton?: boolean; // default true
  height?: number; // default 300
}
```

### 2. LocationPickerForm
A form-friendly wrapper that opens the map in a modal.

**Props:**
```typescript
interface LocationPickerFormProps {
  value?: LocationValue;
  onChange: (location: LocationValue) => void;
  errorText?: string;
  placeholder?: string;
}
```

## Installation

### 1. Install required packages
```bash
# Install Expo-compatible packages
npx expo install react-native-maps expo-location

# Install Google Places Autocomplete
npm install react-native-google-places-autocomplete
```

### 2. Configure app.json
Add Google Maps API configuration to your `app.json`:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY"
      }
    }
  }
}
```

### 3. Environment variables
Create or update your `.env` file:
```
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 4. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your app's package name/bundle ID

## Usage Examples

### Basic usage with form
```tsx
import React, { useState } from 'react';
import { LocationPickerForm } from '../components/LocationPickerForm';
import { LocationValue } from '../components/MapLocationPicker';

export default function MyForm() {
  const [location, setLocation] = useState<LocationValue | undefined>();

  return (
    <View>
      <Text>Select Location:</Text>
      <LocationPickerForm
        value={location}
        onChange={setLocation}
        placeholder="Tap to select location..."
      />
    </View>
  );
}
```

### Direct map usage
```tsx
import React, { useState } from 'react';
import { MapLocationPicker, LocationValue } from '../components/MapLocationPicker';

export default function MapScreen() {
  const [location, setLocation] = useState<LocationValue | undefined>();

  return (
    <MapLocationPicker
      value={location}
      onChange={setLocation}
      height={400}
      showMyLocationButton={true}
    />
  );
}
```

### Integration with react-hook-form
```tsx
import { useForm, Controller } from 'react-hook-form';
import { LocationPickerForm } from '../components/LocationPickerForm';

interface FormData {
  location: LocationValue;
}

export default function FormWithValidation() {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>();

  return (
    <Controller
      name="location"
      control={control}
      rules={{ required: 'Location is required' }}
      render={({ field: { onChange, value } }) => (
        <LocationPickerForm
          value={value}
          onChange={onChange}
          errorText={errors.location?.message}
          placeholder="Select project location..."
        />
      )}
    />
  );
}
```

## API Key Security

- Never commit API keys to version control
- Use environment variables for all API keys
- Restrict API keys in Google Cloud Console
- Consider using different keys for development and production

## Permissions

The component automatically handles location permissions using `expo-location`. Users will be prompted to grant location access when using the "My Location" feature.

## Customization

### Styling
Both components accept custom styles and can be themed to match your app's design system.

### Default region
The map defaults to Jakarta coordinates. You can customize this by passing an `initialRegion` prop:

```tsx
const customRegion = {
  latitude: -7.2575, // Yogyakarta
  longitude: 110.1775,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

<MapLocationPicker
  initialRegion={customRegion}
  // ... other props
/>
```

### Search configuration
The Google Places Autocomplete can be configured for specific countries or regions by modifying the `query` prop in `MapLocationPicker.tsx`:

```typescript
query={{
  key: GOOGLE_MAPS_API_KEY,
  language: 'en', // Change language
  components: 'country:us', // Restrict to specific country
}}
```

## Troubleshooting

### Map not showing
1. Verify Google Maps API key is correctly set
2. Check that Maps SDK is enabled in Google Cloud Console
3. Ensure API key has proper restrictions

### Places search not working
1. Verify Places API is enabled
2. Check API key permissions
3. Ensure `EXPO_PUBLIC_` prefix is used for environment variable

### Location permission issues
1. Test on physical device (location services don't work in simulator)
2. Check device location settings
3. Verify app has location permissions

## Testing

To test the implementation:

1. Navigate to `/mapDemo` screen for a standalone demo
2. Use the integrated form in `/createTask` screen
3. Test on both Android and iOS devices
4. Verify all features work with network connectivity

## Performance Considerations

- Debounced search (300ms delay)
- Minimum 2 characters for search
- Cached location permissions
- Optimized map rendering with appropriate initial regions

## Dependencies

- `react-native-maps`: Map display and interaction
- `expo-location`: Location services and permissions
- `react-native-google-places-autocomplete`: Search functionality
- `expo`: Core Expo SDK features
