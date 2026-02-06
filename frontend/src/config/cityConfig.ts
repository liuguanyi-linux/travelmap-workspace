// City Configuration
// You can customize the default map view for each city here.
// 'zoom' controls the initial map size/zoom level when the city is selected.
// Higher zoom value means more detailed view (larger map scale).

export interface CityConfig {
  name: string;
  center: [number, number];
  zoom: number;
}

export const CITIES: CityConfig[] = [
  { 
    name: '上海', 
    center: [121.473701, 31.230416], 
    zoom: 9 
  },
  { 
    name: '青岛', 
    center: [120.32, 36.18], 
    zoom: 10 
  },
  { 
    name: '北京', 
    center: [116.397428, 39.90923], 
    zoom: 10 
  },
  { 
    name: '广州', 
    center: [113.264434, 23.129162], 
    zoom: 10 
  },
];

// Default city to show on initial load if location is unavailable
export const DEFAULT_CITY = CITIES.find(c => c.name === '青岛') || CITIES[0];
