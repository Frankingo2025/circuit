export interface Destination {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  notes?: string;
  visitDuration?: number; // in minutes
  isRequired?: boolean;
  isStartingPoint?: boolean; // New property to mark a destination as starting point
  isEndPoint?: boolean; // New property to mark a destination as end point
}

export interface RoutePreferences {
  routeType: 'fastest' | 'scenic';
  avoidTolls: boolean;
  avoidHighways: boolean;
  transportMode: 'driving' | 'walking' | 'bicycling' | 'transit';
}

export interface ItineraryState {
  destinations: Destination[];
  optimizedRoute: Destination[];
  preferences: RoutePreferences;
  totalDistance: number;
  totalDuration: number;
  startingPointId: string | null; // Property to store the starting point ID
  endPointId: string | null; // New property to store the end point ID
}