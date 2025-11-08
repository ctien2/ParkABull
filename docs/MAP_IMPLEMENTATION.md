# Map Implementation Documentation

## Overview
This project uses Mapbox GL JS to display an interactive map of the University at Buffalo North Campus. The map is integrated into the main landing page and serves as the primary interface for visualizing parking lot locations.

## Technology Stack
- **Mapbox GL JS** v3.16.0 - Core mapping library
- **React** - UI framework
- **Next.js 15** (App Router) - Framework
- **TypeScript** - Type safety

## Architecture

### Component Location
```
components/map/mapbox-map.tsx
```

### Usage in Application
The map is currently integrated into the home page:
```
app/page.tsx
```

## Setup & Configuration

### Environment Variables
The Mapbox API token is stored as an environment variable:

**File:** `.env` (local only, not committed to git)
```bash
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

**Important Notes:**
- The `NEXT_PUBLIC_` prefix makes this variable accessible in client-side code
- Never commit your `.env` file to version control
- Get your token from: https://account.mapbox.com/access-tokens/

### Current Map Settings

| Setting | Value | Description |
|---------|-------|-------------|
| Center Longitude | -78.7884 | UB North Campus longitude |
| Center Latitude | 43.0015 | UB North Campus latitude |
| Initial Zoom | 15 | Good level for campus overview |
| Map Style | streets-v12 | Mapbox's street view style |
| Map Dimensions | 600px height, responsive width | Max-width: 6xl (1152px) |

## Component Structure

### State Management
```typescript
const mapContainer = useRef<HTMLDivElement>(null);  // Reference to DOM container
const map = useRef<mapboxgl.Map | null>(null);      // Reference to Mapbox instance
```

### Initialization
The map initializes once on component mount using React's `useEffect` hook:
- Prevents duplicate initialization with `if (map.current) return`
- Sets the Mapbox access token
- Creates a new Map instance with configuration
- Adds navigation controls (zoom buttons)
- Includes cleanup on unmount

## Customization Guide

### Changing Map Center
To center the map on a different location:

```typescript
center: [-78.7884, 43.0015], // [longitude, latitude]
```

**Example Locations:**
- UB North Campus: `[-78.7884, 43.0015]`
- UB South Campus: `[-78.8264, 42.9507]`
- Downtown Buffalo: `[-78.8784, 42.8864]`

### Adjusting Zoom Level
```typescript
zoom: 15  // Range: 0 (world) to 22 (building level)
```

**Recommended Zoom Levels:**
- 10-12: City view
- 13-15: Campus/neighborhood view (current)
- 16-18: Street/building view
- 19-22: Building interior level

### Changing Map Style
Mapbox provides several pre-built styles:

```typescript
style: 'mapbox://styles/mapbox/streets-v12'
```

**Available Styles:**
- `streets-v12` - Standard street map (current)
- `outdoors-v12` - Topographic style with terrain
- `light-v11` - Minimal light theme
- `dark-v11` - Dark theme
- `satellite-v9` - Satellite imagery
- `satellite-streets-v12` - Satellite with street labels
- `navigation-day-v1` - Optimized for navigation
- `navigation-night-v1` - Dark navigation theme

**Custom Styles:**
You can also create custom styles in Mapbox Studio:
```typescript
style: 'mapbox://styles/YOUR_USERNAME/YOUR_STYLE_ID'
```

### Adjusting Map Dimensions

**Height:**
```typescript
className="... h-[600px] ..."  // Tailwind arbitrary value
```

**Width:**
```typescript
className="w-full max-w-6xl ..."  // Full width, max 1152px
```

**Available Tailwind max-width classes:**
- `max-w-xl` - 576px
- `max-w-2xl` - 672px
- `max-w-4xl` - 896px
- `max-w-6xl` - 1152px (current)
- `max-w-full` - No limit

## Adding Features

### Adding Markers
To add a marker at a specific location:

```typescript
// After map initialization
const marker = new mapboxgl.Marker()
  .setLngLat([-78.7884, 43.0015])
  .setPopup(new mapboxgl.Popup().setHTML('<h3>Location Name</h3>'))
  .addTo(map.current!);
```

### Adding Custom Controls
The map currently includes navigation controls. To add more:

```typescript
// Fullscreen control
map.current.addControl(new mapboxgl.FullscreenControl());

// Geolocate control (user location)
map.current.addControl(new mapboxgl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true
  },
  trackUserLocation: true
}));

// Scale control
map.current.addControl(new mapboxgl.ScaleControl());
```

### Adding Polygons/Overlays
To add parking lot boundaries or other polygon overlays:

```typescript
map.current.on('load', () => {
  map.current!.addSource('parking-lot', {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-78.7884, 43.0015],
          [-78.7874, 43.0015],
          [-78.7874, 43.0005],
          [-78.7884, 43.0005],
          [-78.7884, 43.0015]
        ]]
      }
    }
  });

  map.current!.addLayer({
    id: 'parking-lot-fill',
    type: 'fill',
    source: 'parking-lot',
    paint: {
      'fill-color': '#088',
      'fill-opacity': 0.4
    }
  });
});
```

### Click Events
To handle map click events:

```typescript
map.current.on('click', (e) => {
  console.log('Clicked at:', e.lngLat);
  // e.lngLat.lng - longitude
  // e.lngLat.lat - latitude
});
```

## Performance Considerations

### Bundle Size
- Mapbox GL JS is ~500KB minified
- The CSS file adds ~30KB
- Consider code splitting for production

### Initial Load
The map initializes only once thanks to the guard:
```typescript
if (map.current) return;
```

### Cleanup
The component properly cleans up the map instance on unmount:
```typescript
return () => {
  map.current?.remove();
};
```

## Styling

### Current Styling
The map container uses Tailwind CSS classes:
- `w-full max-w-6xl mx-auto` - Responsive width, centered
- `h-[600px]` - Fixed height
- `rounded-lg` - Rounded corners
- `overflow-hidden` - Clips content to rounded corners
- `shadow-lg` - Drop shadow
- `border border-gray-200` - Subtle border

### Customizing Appearance
All visual styling can be adjusted via Tailwind classes or custom CSS.

## Troubleshooting

### Map Not Displaying
1. **Check API Token:** Ensure `NEXT_PUBLIC_MAPBOX_TOKEN` is set in `.env`
2. **Restart Server:** Environment variables require server restart
3. **Check Console:** Look for Mapbox errors in browser console
4. **Verify Network:** Mapbox requires internet connection

### TypeScript Errors
If you encounter type errors, ensure `@types/mapbox-gl` is installed:
```bash
npm install --save-dev @types/mapbox-gl
```

### Turbopack Compatibility
This implementation uses `mapbox-gl` directly (not `react-map-gl`) for better compatibility with Next.js 15's Turbopack bundler.

## API Reference

### Official Documentation
- [Mapbox GL JS Docs](https://docs.mapbox.com/mapbox-gl-js/api/)
- [Mapbox Examples](https://docs.mapbox.com/mapbox-gl-js/example/)
- [Mapbox Style Spec](https://docs.mapbox.com/mapbox-gl-js/style-spec/)

### Common Methods

```typescript
// Pan to location
map.current?.flyTo({
  center: [-78.7884, 43.0015],
  zoom: 15,
  duration: 2000 // Animation duration in ms
});

// Get current bounds
const bounds = map.current?.getBounds();

// Fit to bounds
map.current?.fitBounds([
  [-78.79, 43.00], // Southwest coordinates
  [-78.78, 43.01]  // Northeast coordinates
], {
  padding: 20
});

// Add/remove layers
map.current?.addLayer(layerObject);
map.current?.removeLayer('layer-id');

// Get map center
const center = map.current?.getCenter();
```

## Future Enhancements

### Planned Features (For Consideration)
1. **Parking Lot Markers** - Visual indicators for each parking lot
2. **Real-time Availability** - Color-coded markers based on occupancy
3. **User Location** - Show user's current position
4. **Search Functionality** - Search for specific buildings/lots
5. **Custom Parking Lot Polygons** - Draw lot boundaries
6. **Click Interactions** - Show lot details on click
7. **Mobile Optimization** - Touch gestures and responsive sizing
8. **Directions** - Route to selected parking lot

### Database Integration
When connecting to Supabase for parking lot data:

```typescript
// Example structure
useEffect(() => {
  async function loadParkingLots() {
    const { data } = await supabase
      .from('parking_lots')
      .select('*');
    
    // Add markers for each lot
    data?.forEach(lot => {
      new mapboxgl.Marker()
        .setLngLat([lot.longitude, lot.latitude])
        .addTo(map.current!);
    });
  }
  
  if (map.current) {
    loadParkingLots();
  }
}, []);
```

## Best Practices

1. **Always cleanup** - Remove map instance on unmount
2. **Guard initialization** - Prevent duplicate map instances
3. **Use refs** - Store map reference in useRef, not state
4. **Wait for load** - Use `map.on('load', ...)` for data operations
5. **Type safety** - Use TypeScript types from `@types/mapbox-gl`
6. **Environment variables** - Never hardcode API tokens
7. **Error handling** - Handle network failures gracefully
8. **Accessibility** - Add ARIA labels for interactive elements

## Support

### Getting Help
- Mapbox Community: https://community.mapbox.com/
- GitHub Issues: https://github.com/mapbox/mapbox-gl-js/issues
- Stack Overflow: Tag `mapbox-gl-js`

### Account Management
- Dashboard: https://account.mapbox.com/
- Token Management: https://account.mapbox.com/access-tokens/
- Usage Stats: https://account.mapbox.com/statistics/

---

**Last Updated:** November 8, 2025  
**Component Version:** 1.0.0  
**Mapbox GL JS Version:** 3.16.0

