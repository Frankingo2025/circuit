import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Platform, Dimensions, Linking, TouchableOpacity } from 'react-native';
import { Destination } from '../types';
import { MapPin, ExternalLink, Navigation } from 'lucide-react-native';

// Web-specific imports for Leaflet
let MapContainer: any = null;
let TileLayer: any = null;
let Marker: any = null;
let Popup: any = null;
let Polyline: any = null;
let Icon: any = null;
let useMap: any = null;

// Only import Leaflet on web platform
if (Platform.OS === 'web') {
  // Dynamic imports for web
  const ReactLeaflet = require('react-leaflet');
  const Leaflet = require('leaflet');
  
  MapContainer = ReactLeaflet.MapContainer;
  TileLayer = ReactLeaflet.TileLayer;
  Marker = ReactLeaflet.Marker;
  Popup = ReactLeaflet.Popup;
  Polyline = ReactLeaflet.Polyline;
  useMap = ReactLeaflet.useMap;
  Icon = Leaflet.Icon;
  
  // Import Leaflet CSS
  require('leaflet/dist/leaflet.css');
  
  // Fix for default marker icons in Leaflet
  delete Leaflet.Icon.Default.prototype._getIconUrl;
  Leaflet.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// Component to fit map bounds to markers
const FitBounds = ({ destinations }: { destinations: Destination[] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (destinations.length > 0) {
      const bounds = destinations.map(dest => [dest.latitude, dest.longitude]);
      map.fitBounds(bounds);
    }
  }, [destinations, map]);
  
  return null;
};

// Web map component using Leaflet
const WebMap = ({ destinations, optimizedRoute }: { destinations: Destination[], optimizedRoute: Destination[] }) => {
  const routeToShow = optimizedRoute.length > 0 ? optimizedRoute : destinations;
  
  // Calculate center point from destinations
  const getMapCenter = () => {
    if (routeToShow.length === 0) {
      return [45.4642, 9.1900]; // Default: Milan, Italy
    }
    
    // Use the first destination as center
    return [routeToShow[0].latitude, routeToShow[0].longitude];
  };
  
  // Create polyline for the route
  const getRoutePolyline = () => {
    if (routeToShow.length < 2) return [];
    return routeToShow.map(dest => [dest.latitude, dest.longitude]);
  };
  
  // Custom marker icons
  const startIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  
  const endIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  
  const regularIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  
  const openGoogleMapsDirections = () => {
    if (routeToShow.length < 2) {
      alert('Aggiungi almeno due destinazioni per navigare');
      return;
    }

    // Create waypoints string for Google Maps
    const origin = encodeURIComponent(routeToShow[0].address);
    const destination = encodeURIComponent(routeToShow[routeToShow.length - 1].address);
    
    // Add waypoints (Google Maps supports up to 10 waypoints in the free tier)
    let waypoints = '';
    if (routeToShow.length > 2) {
      const waypointsArray = routeToShow.slice(1, routeToShow.length - 1)
        .slice(0, 8) // Limit to 8 waypoints (plus origin and destination = 10 total)
        .map(dest => encodeURIComponent(dest.address));
      waypoints = `&waypoints=${waypointsArray.join('|')}`;
    }
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints}&travelmode=driving`;
    window.open(url, '_blank');
  };
  
  return (
    <View style={styles.container}>
      <MapContainer 
        center={getMapCenter()} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {routeToShow.map((dest, index) => (
          <Marker 
            key={dest.id} 
            position={[dest.latitude, dest.longitude]}
            icon={index === 0 ? startIcon : 
                 index === routeToShow.length - 1 ? endIcon : 
                 regularIcon}
          >
            <Popup>
              <div>
                <strong>{dest.name}</strong>
                <p>{dest.address}</p>
                {dest.visitDuration && <p>Durata visita: {dest.visitDuration} min</p>}
                {dest.notes && <p>Note: {dest.notes}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
        
        {routeToShow.length > 1 && (
          <Polyline 
            positions={getRoutePolyline()} 
            color="#3498db" 
            weight={4} 
            opacity={0.7} 
            dashArray="10, 10"
          />
        )}
        
        <FitBounds destinations={routeToShow} />
      </MapContainer>
      
      {optimizedRoute.length > 1 && (
        <TouchableOpacity 
          style={styles.mapNavigationButton}
          onPress={openGoogleMapsDirections}
        >
          <Navigation size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.navigationButtonText}>Naviga con Google Maps</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Fallback component for non-web platforms or when no destinations
const MapFallback = ({ destinations, optimizedRoute }: { destinations: Destination[], optimizedRoute: Destination[] }) => {
  const openGoogleMapsDirections = () => {
    if (optimizedRoute.length < 2) {
      alert('Aggiungi almeno due destinazioni per navigare');
      return;
    }

    // Create waypoints string for Google Maps
    const origin = encodeURIComponent(optimizedRoute[0].address);
    const destination = encodeURIComponent(optimizedRoute[optimizedRoute.length - 1].address);
    
    // Add waypoints (Google Maps supports up to 10 waypoints in the free tier)
    let waypoints = '';
    if (optimizedRoute.length > 2) {
      const waypointsArray = optimizedRoute.slice(1, optimizedRoute.length - 1)
        .slice(0, 8) // Limit to 8 waypoints (plus origin and destination = 10 total)
        .map(dest => encodeURIComponent(dest.address));
      waypoints = `&waypoints=${waypointsArray.join('|')}`;
    }
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints}&travelmode=driving`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.emptyContainer}>
      <MapPin size={32} color="#95a5a6" style={styles.fallbackIcon} />
      <Text style={styles.emptyText}>
        {destinations.length === 0
          ? 'Aggiungi destinazioni per visualizzare la mappa'
          : 'Mappa interattiva'}
      </Text>
      
      {destinations.length > 0 && (
        <>
          <View style={styles.destinationsList}>
            {(optimizedRoute.length > 0 ? optimizedRoute : destinations).map((dest, index) => (
              <View key={dest.id} style={styles.destinationItem}>
                <View style={[
                  styles.destinationMarker,
                  index === 0 ? styles.startMarker : 
                  index === (optimizedRoute.length > 0 ? optimizedRoute.length - 1 : destinations.length - 1) ? 
                  styles.endMarker : styles.destinationMarker
                ]}>
                  <Text style={styles.destinationMarkerText}>{index + 1}</Text>
                </View>
                <View style={styles.destinationInfo}>
                  <Text style={styles.destinationName}>{dest.name}</Text>
                  <Text style={styles.destinationAddress}>{dest.address}</Text>
                </View>
              </View>
            ))}
          </View>
          
          {optimizedRoute.length > 1 && (
            <TouchableOpacity 
              style={styles.navigationButton}
              onPress={openGoogleMapsDirections}
            >
              <Navigation size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.navigationButtonText}>Naviga con Google Maps</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

interface RouteMapProps {
  destinations: Destination[];
  optimizedRoute: Destination[];
}

export default function RouteMap({ destinations, optimizedRoute }: RouteMapProps) {
  // If no destinations, show empty state
  if (destinations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MapPin size={48} color="#95a5a6" />
        <Text style={styles.emptyText}>Aggiungi destinazioni per visualizzare la mappa</Text>
      </View>
    );
  }

  // For web platform with valid coordinates, use the Leaflet map
  if (Platform.OS === 'web' && MapContainer && destinations.some(d => d.latitude && d.longitude)) {
    return <WebMap destinations={destinations} optimizedRoute={optimizedRoute} />;
  }
  
  // Fallback for native platforms or when coordinates are missing
  return <MapFallback destinations={destinations} optimizedRoute={optimizedRoute} />;
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  emptyContainer: {
    height: 300,
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
  },
  emptyText: {
    color: '#2c3e50',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  fallbackIcon: {
    marginBottom: 8,
  },
  fallbackSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 16,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  linkIcon: {
    marginRight: 8,
  },
  linkText: {
    color: '#3498db',
    fontWeight: '500',
  },
  destinationsList: {
    width: '100%',
    paddingHorizontal: 16,
    maxHeight: 180,
  },
  destinationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  destinationMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  startMarker: {
    backgroundColor: '#27ae60',
  },
  endMarker: {
    backgroundColor: '#e74c3c',
  },
  destinationMarkerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  destinationInfo: {
    flex: 1,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  destinationAddress: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  mapNavigationButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    zIndex: 1000,
  },
  navigationButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonIcon: {
    marginRight: 8,
  },
  marker: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    borderWidth: 2,
    borderColor: 'white',
  },
  markerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  }
});