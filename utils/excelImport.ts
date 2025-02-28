import * as XLSX from 'xlsx';
import { Destination } from '../types';
import { validateAddress, geocodeAddress } from './addressValidation';

export const parseExcelFile = async (fileUri: string): Promise<Destination[]> => {
  try {
    // Read the file
    const response = await fetch(fileUri);
    const blob = await response.blob();
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });

    // Parse the Excel file
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Convert to Destination objects and validate addresses
    const destinations: Destination[] = [];
    
    // Process each row with geocoding
    for (let i = 0; i < data.length; i++) {
      const row: any = data[i];
      
      // Extract address information
      const address = row.address || row.Address || row.indirizzo || row.Indirizzo || '';
      
      // Skip entries with empty addresses
      if (!address.trim()) {
        console.warn(`Skipping row ${i + 1}: Missing address`);
        continue;
      }
      
      // Validate the address
      const isValid = await validateAddress(address);
      if (!isValid) {
        console.warn(`Skipping row ${i + 1}: Invalid address format - ${address}`);
        continue;
      }
      
      // Try to extract coordinates from the data
      let latitude = parseFloat(row.latitude || row.Latitude || row.lat || row.Lat || '0');
      let longitude = parseFloat(row.longitude || row.Longitude || row.lng || row.Lng || '0');
      
      // If coordinates are missing or invalid, geocode the address
      if (isNaN(latitude) || isNaN(longitude) || (latitude === 0 && longitude === 0)) {
        try {
          const coordinates = await geocodeAddress(address);
          if (coordinates) {
            latitude = coordinates.lat;
            longitude = coordinates.lng;
            console.log(`Geocoded address for row ${i + 1}: ${address} -> (${latitude}, ${longitude})`);
          } else {
            console.warn(`Could not geocode address for row ${i + 1}: ${address}`);
          }
        } catch (error) {
          console.error(`Error geocoding address for row ${i + 1}:`, error);
        }
      }

      destinations.push({
        id: `imported-${i}-${Date.now()}`,
        name: row.name || row.Name || row.location || row.Location || `Destinazione ${i + 1}`,
        address: address,
        latitude: isNaN(latitude) ? 0 : latitude,
        longitude: isNaN(longitude) ? 0 : longitude,
        notes: row.notes || row.Notes || row.note || row.Note || undefined,
        visitDuration: row.duration || row.Duration || row.durata || row.Durata || undefined,
        isRequired: row.required || row.Required || row.obbligatorio || row.Obbligatorio || false,
      });
    }
    
    return destinations;
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error('Impossibile leggere il file Excel. Verifica che il formato sia corretto.');
  }
};

export const generateExcelTemplate = (): string => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Sample data with column headers
  const data = [
    {
      name: 'Milano Duomo',
      address: 'Piazza del Duomo, 1, Milano',
      latitude: 45.4642,
      longitude: 9.1900,
      notes: 'Visita al Duomo',
      duration: 120,
      required: true
    },
    {
      name: 'Bologna Piazza Maggiore',
      address: 'Piazza Maggiore, 6, Bologna',
      latitude: 44.4938,
      longitude: 11.3426,
      notes: 'Pranzo in centro',
      duration: 90,
      required: true
    },
    {
      name: 'Firenze Duomo',
      address: 'Piazza del Duomo, 8, Firenze',
      latitude: 43.7731,
      longitude: 11.2566,
      notes: 'Visita agli Uffizi',
      duration: 180,
      required: true
    }
  ];
  
  // Create a worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Destinazioni');
  
  // Generate a data URL for the Excel file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  
  // Create a Blob and URL
  if (typeof window !== 'undefined') {
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    return URL.createObjectURL(blob);
  }
  
  // Fallback for non-browser environments
  return '';
};