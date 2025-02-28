/**
 * Validates an address to ensure it has the required components
 * @param address The address string to validate
 * @returns Promise that resolves to true if the address is valid, false otherwise
 */
export const validateAddress = async (address: string): Promise<boolean> => {
  // Basic validation - check if address is not empty and has a reasonable length
  if (!address || address.trim().length < 5) {
    return false;
  }
  
  // Check if the address contains a street number
  // This is a simple check for digits after a comma or space
  const hasStreetNumber = /[,\s]\d+/.test(address);
  
  // In a real app, we might use a geocoding service to validate the address
  // For now, we'll just do basic validation
  
  // Check if the address has at least two parts (street and city)
  const parts = address.split(',');
  if (parts.length < 2) {
    return false;
  }
  
  return true;
};

/**
 * Formats an address to ensure it includes a street number if missing
 * @param address The address to format
 * @param streetNumber Optional street number to add if missing
 * @returns The formatted address
 */
export const formatAddress = (address: string, streetNumber?: string): string => {
  // If address already has a street number, return it as is
  if (/[,\s]\d+/.test(address)) {
    return address;
  }
  
  // If street number is provided, add it to the address
  if (streetNumber) {
    // Find the first comma or end of string
    const commaIndex = address.indexOf(',');
    if (commaIndex > 0) {
      // Insert street number before the first comma
      return `${address.substring(0, commaIndex)}, ${streetNumber}${address.substring(commaIndex)}`;
    } else {
      // No comma found, append street number
      return `${address}, ${streetNumber}`;
    }
  }
  
  return address;
};

/**
 * Geocodes an address to get coordinates
 * @param address The address to geocode
 * @returns Promise that resolves to coordinates or null if geocoding fails
 */
export const geocodeAddress = async (address: string): Promise<{lat: number, lng: number} | null> => {
  try {
    // Use Nominatim OpenStreetMap API for geocoding
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`);
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};