import React, { createContext, useContext, useState, useEffect } from 'react';
import { Destination, RoutePreferences, ItineraryState } from '../types';
import { optimizeRoute, calculateTotalDistance, estimateTotalDuration } from '../utils/routeOptimization';
import { Platform } from 'react-native';

interface ItineraryContextType {
  state: ItineraryState;
  addDestination: (destination: Destination) => void;
  removeDestination: (id: string) => void;
  updateDestination: (destination: Destination) => void;
  clearDestinations: () => void;
  setOptimizedRoute: (route: Destination[]) => void;
  updatePreferences: (preferences: Partial<RoutePreferences>) => void;
  setTotalDistance: (distance: number) => void;
  setTotalDuration: (duration: number) => void;
  reorderDestinations: (startIndex: number, endIndex: number) => void;
  importDestinations: (destinations: Destination[]) => void;
  setStartingPoint: (id: string | null) => void;
  setEndPoint: (id: string | null) => void;
  createItinerary: () => void;
  exportItinerary: () => Promise<string | null>;
}

const defaultPreferences: RoutePreferences = {
  routeType: 'fastest',
  avoidTolls: false,
  avoidHighways: false,
  transportMode: 'driving',
};

const defaultState: ItineraryState = {
  destinations: [],
  optimizedRoute: [],
  preferences: defaultPreferences,
  totalDistance: 0,
  totalDuration: 0,
  startingPointId: null,
  endPointId: null,
};

const ItineraryContext = createContext<ItineraryContextType | undefined>(undefined);

export const ItineraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ItineraryState>(defaultState);

  // Load state from storage on mount
  useEffect(() => {
    // In a real app, you would load from AsyncStorage here
    // For now, we'll just use the default state
  }, []);

  // Save state to storage when it changes
  useEffect(() => {
    // In a real app, you would save to AsyncStorage here
  }, [state]);

  const addDestination = (destination: Destination) => {
    setState((prev) => ({
      ...prev,
      destinations: [...prev.destinations, destination],
    }));
  };

  const removeDestination = (id: string) => {
    setState((prev) => {
      // If we're removing the starting point or end point, clear the respective ID
      const newState = {
        ...prev,
        destinations: prev.destinations.filter((dest) => dest.id !== id),
      };
      
      if (prev.startingPointId === id) {
        newState.startingPointId = null;
      }
      
      if (prev.endPointId === id) {
        newState.endPointId = null;
      }
      
      return newState;
    });
  };

  const updateDestination = (destination: Destination) => {
    setState((prev) => ({
      ...prev,
      destinations: prev.destinations.map((dest) =>
        dest.id === destination.id ? destination : dest
      ),
    }));
  };

  const clearDestinations = () => {
    setState((prev) => ({
      ...prev,
      destinations: [],
      optimizedRoute: [],
      totalDistance: 0,
      totalDuration: 0,
      startingPointId: null,
      endPointId: null,
    }));
  };

  const setOptimizedRoute = (route: Destination[]) => {
    setState((prev) => ({
      ...prev,
      optimizedRoute: route,
    }));
  };

  const updatePreferences = (preferences: Partial<RoutePreferences>) => {
    setState((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, ...preferences },
    }));
  };

  const setTotalDistance = (distance: number) => {
    setState((prev) => ({
      ...prev,
      totalDistance: distance,
    }));
  };

  const setTotalDuration = (duration: number) => {
    setState((prev) => ({
      ...prev,
      totalDuration: duration,
    }));
  };

  const reorderDestinations = (startIndex: number, endIndex: number) => {
    const result = Array.from(state.destinations);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    setState((prev) => ({
      ...prev,
      destinations: result,
    }));
  };

  const importDestinations = (destinations: Destination[]) => {
    setState((prev) => ({
      ...prev,
      destinations: [...prev.destinations, ...destinations],
    }));
  };

  const setStartingPoint = (id: string | null) => {
    setState((prev) => {
      // Update the destinations to mark the starting point
      const updatedDestinations = prev.destinations.map(dest => ({
        ...dest,
        isStartingPoint: dest.id === id,
        // If this destination was the end point and is now the starting point, it can't be both
        isEndPoint: dest.id === id ? false : dest.isEndPoint
      }));
      
      // If the new starting point was previously the end point, clear the end point ID
      const newEndPointId = id === prev.endPointId ? null : prev.endPointId;
      
      return {
        ...prev,
        startingPointId: id,
        endPointId: newEndPointId,
        destinations: updatedDestinations
      };
    });
  };

  const setEndPoint = (id: string | null) => {
    setState((prev) => {
      // Update the destinations to mark the end point
      const updatedDestinations = prev.destinations.map(dest => ({
        ...dest,
        isEndPoint: dest.id === id,
        // If this destination was the starting point and is now the end point, it can't be both
        isStartingPoint: dest.id === id ? false : dest.isStartingPoint
      }));
      
      // If the new end point was previously the starting point, clear the starting point ID
      const newStartingPointId = id === prev.startingPointId ? null : prev.startingPointId;
      
      return {
        ...prev,
        endPointId: id,
        startingPointId: newStartingPointId,
        destinations: updatedDestinations
      };
    });
  };

  const createItinerary = () => {
    if (state.destinations.length === 0) {
      return;
    }

    // Find the starting point index, or use 0 if none is set
    let startingPointIndex = 0;
    if (state.startingPointId) {
      const index = state.destinations.findIndex(dest => dest.id === state.startingPointId);
      if (index !== -1) {
        startingPointIndex = index;
      }
    }

    // Find the end point index, or use the last destination if none is set
    let endPointIndex = null;
    if (state.endPointId) {
      const index = state.destinations.findIndex(dest => dest.id === state.endPointId);
      if (index !== -1) {
        endPointIndex = index;
      }
    }

    // Optimize the route starting from the selected point and ending at the end point
    const optimized = optimizeRoute(state.destinations, startingPointIndex, endPointIndex);
    setOptimizedRoute(optimized);
    
    // Calculate distance and duration
    const totalDistance = calculateTotalDistance(optimized);
    setTotalDistance(totalDistance);
    
    const totalDuration = estimateTotalDuration(optimized);
    setTotalDuration(totalDuration);
  };

  const exportItinerary = async (): Promise<string | null> => {
    try {
      const XLSX = require('xlsx');
      
      // Determine which route to export
      const routeToExport = state.optimizedRoute.length > 0 ? state.optimizedRoute : state.destinations;
      
      if (routeToExport.length === 0) {
        throw new Error('Nessuna destinazione da esportare');
      }
      
      // Create worksheet data
      const wsData = routeToExport.map((dest, index) => ({
        'Ordine': index + 1,
        'Nome': dest.name,
        'Indirizzo': dest.address,
        'Latitudine': dest.latitude,
        'Longitudine': dest.longitude,
        'Note': dest.notes || '',
        'Durata Visita (min)': dest.visitDuration || '',
        'Tappa Obbligatoria': dest.isRequired ? 'Sì' : 'No',
        'Punto di Partenza': dest.id === state.startingPointId ? 'Sì' : 'No',
        'Punto di Arrivo': dest.id === state.endPointId ? 'Sì' : 'No'
      }));
      
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Create a worksheet with the data
      const ws = XLSX.utils.json_to_sheet(wsData);
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Itinerario');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      
      // For web platform, create a download link
      if (Platform.OS === 'web') {
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        
        // Create a link element and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = 'itinerario.xlsx';
        link.click();
        
        return url;
      } else {
        // For native platforms, save to file and share
        const FileSystem = require('expo-file-system');
        const Sharing = require('expo-sharing');
        
        const fileUri = `${FileSystem.documentDirectory}itinerario.xlsx`;
        
        // Write the file
        await FileSystem.writeAsStringAsync(fileUri, excelBuffer.toString(), {
          encoding: FileSystem.EncodingType.Base64
        });
        
        // Share the file
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            dialogTitle: 'Condividi il tuo itinerario'
          });
        }
        
        return fileUri;
      }
    } catch (error) {
      console.error('Error exporting itinerary:', error);
      return null;
    }
  };

  return (
    <ItineraryContext.Provider
      value={{
        state,
        addDestination,
        removeDestination,
        updateDestination,
        clearDestinations,
        setOptimizedRoute,
        updatePreferences,
        setTotalDistance,
        setTotalDuration,
        reorderDestinations,
        importDestinations,
        setStartingPoint,
        setEndPoint,
        createItinerary,
        exportItinerary
      }}
    >
      {children}
    </ItineraryContext.Provider>
  );
};

export const useItinerary = () => {
  const context = useContext(ItineraryContext);
  if (context === undefined) {
    throw new Error('useItinerary must be used within an ItineraryProvider');
  }
  return context;
};