import { Destination } from '../types';

// Enhanced implementation of the Nearest Neighbor algorithm for route optimization
// with support for fixed starting and ending points
export const optimizeRoute = (
  destinations: Destination[],
  startingPointIndex: number = 0,
  endPointIndex: number | null = null
): Destination[] => {
  if (destinations.length <= 1) {
    return [...destinations];
  }

  // If starting and ending points are the same, use a circular route
  const isCircularRoute = startingPointIndex === endPointIndex;
  
  // Create a copy of destinations to work with
  const allDestinations = [...destinations];
  const optimizedRoute: Destination[] = [];
  
  // Extract the starting point
  const startingPoint = allDestinations.splice(startingPointIndex, 1)[0];
  optimizedRoute.push(startingPoint);
  
  // Extract the ending point if specified and different from starting point
  let endingPoint: Destination | null = null;
  if (endPointIndex !== null && !isCircularRoute && endPointIndex !== startingPointIndex) {
    // Adjust index if needed after removing starting point
    const adjustedEndIndex = endPointIndex > startingPointIndex 
      ? endPointIndex - 1 
      : endPointIndex;
    
    endingPoint = allDestinations.splice(adjustedEndIndex, 1)[0];
  }
  
  // While there are unvisited destinations
  let currentDestination = startingPoint;
  while (allDestinations.length > 0) {
    // Find the nearest unvisited destination
    let nearestIndex = 0;
    let minDistance = calculateDistance(
      currentDestination.latitude,
      currentDestination.longitude,
      allDestinations[0].latitude,
      allDestinations[0].longitude
    );
    
    for (let i = 1; i < allDestinations.length; i++) {
      const distance = calculateDistance(
        currentDestination.latitude,
        currentDestination.longitude,
        allDestinations[i].latitude,
        allDestinations[i].longitude
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }
    
    // Move to the nearest destination
    currentDestination = allDestinations.splice(nearestIndex, 1)[0];
    optimizedRoute.push(currentDestination);
  }
  
  // Add the ending point if specified
  if (endingPoint) {
    optimizedRoute.push(endingPoint);
  }
  
  // For circular routes, add the starting point at the end
  if (isCircularRoute) {
    optimizedRoute.push(startingPoint);
  }
  
  return optimizedRoute;
};

// Calculate the distance between two points using the Haversine formula
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  return distance;
};

// Convert degrees to radians
const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

// Calculate the total distance of a route
export const calculateTotalDistance = (route: Destination[]): number => {
  if (route.length <= 1) {
    return 0;
  }
  
  let totalDistance = 0;
  
  for (let i = 0; i < route.length - 1; i++) {
    totalDistance += calculateDistance(
      route[i].latitude,
      route[i].longitude,
      route[i + 1].latitude,
      route[i + 1].longitude
    );
  }
  
  return totalDistance;
};

// Estimate the total duration of a route in minutes
export const estimateTotalDuration = (route: Destination[]): number => {
  if (route.length <= 1) {
    return 0;
  }
  
  // Assume average speed of 60 km/h for driving
  const averageSpeedKmPerHour = 60;
  
  // Calculate travel time between destinations
  let travelTimeMinutes = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const distanceKm = calculateDistance(
      route[i].latitude,
      route[i].longitude,
      route[i + 1].latitude,
      route[i + 1].longitude
    );
    
    // Convert distance to travel time in minutes
    travelTimeMinutes += (distanceKm / averageSpeedKmPerHour) * 60;
  }
  
  // Add visit durations for each destination
  const visitDurationMinutes = route.reduce((total, dest) => {
    return total + (dest.visitDuration || 0);
  }, 0);
  
  return Math.round(travelTimeMinutes + visitDurationMinutes);
};