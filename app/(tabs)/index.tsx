import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useItinerary } from '../../context/ItineraryContext';
import DestinationCard from '../../components/DestinationCard';
import RoutePreferencesForm from '../../components/RoutePreferencesForm';
import MapView from '../../components/MapView';
import { Plus, RotateCcw, MapPin, Navigation, Flag, Target, FileDown } from 'lucide-react-native';
import DestinationForm from '../../components/DestinationForm';

export default function ItineraryScreen() {
  const {
    state,
    updateDestination,
    removeDestination,
    clearDestinations,
    setOptimizedRoute,
    updatePreferences,
    setTotalDistance,
    setTotalDuration,
    reorderDestinations,
    addDestination,
    setStartingPoint,
    setEndPoint,
    createItinerary,
    exportItinerary,
  } = useItinerary();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDestination, setEditingDestination] = useState<null | any>(null);

  const handleAddDestination = (destination: any) => {
    addDestination(destination);
    setShowAddForm(false);
  };

  const handleEditDestination = (destination: any) => {
    setEditingDestination(destination);
    setShowAddForm(true);
  };

  const handleUpdateDestination = (destination: any) => {
    updateDestination(destination);
    setShowAddForm(false);
    setEditingDestination(null);
  };

  const handleSetStartingPoint = (id: string) => {
    // If this destination is already the starting point, unset it
    if (state.startingPointId === id) {
      setStartingPoint(null);
    } else {
      setStartingPoint(id);
    }
  };

  const handleSetEndPoint = (id: string) => {
    // If this destination is already the end point, unset it
    if (state.endPointId === id) {
      setEndPoint(null);
    } else {
      setEndPoint(id);
    }
  };

  const handleCreateItinerary = () => {
    if (state.destinations.length < 2) {
      Alert.alert(
        'Impossibile creare itinerario',
        'Aggiungi almeno due destinazioni per creare un itinerario.'
      );
      return;
    }
    
    createItinerary();
    
    Alert.alert(
      'Itinerario creato',
      'Il tuo itinerario è stato creato con successo!',
      [{ text: 'OK' }]
    );
  };

  const handleExportItinerary = async () => {
    if (state.destinations.length === 0) {
      Alert.alert(
        'Impossibile esportare',
        'Aggiungi almeno una destinazione per esportare l\'itinerario.'
      );
      return;
    }
    
    try {
      const result = await exportItinerary();
      
      if (result) {
        if (Platform.OS === 'web') {
          Alert.alert(
            'Esportazione completata',
            'Il file Excel è stato scaricato con successo.'
          );
        }
      } else {
        Alert.alert(
          'Errore di esportazione',
          'Si è verificato un errore durante l\'esportazione dell\'itinerario.'
        );
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        'Errore di esportazione',
        'Si è verificato un errore durante l\'esportazione dell\'itinerario.'
      );
    }
  };

  const confirmClearAll = () => {
    Alert.alert(
      'Conferma eliminazione',
      'Sei sicuro di voler eliminare tutte le destinazioni?',
      [
        { text: 'Annulla', style: 'cancel' },
        { text: 'Elimina tutto', style: 'destructive', onPress: clearDestinations },
      ]
    );
  };

  const formatDistance = (distance: number) => {
    return distance < 1 
      ? `${Math.round(distance * 1000)} m` 
      : `${distance.toFixed(1)} km`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} h`;
    }
    
    return `${hours} h ${remainingMinutes} min`;
  };

  if (showAddForm) {
    return (
      <SafeAreaView style={styles.container}>
        <DestinationForm
          initialValues={editingDestination || {}}
          onSubmit={editingDestination ? handleUpdateDestination : handleAddDestination}
          onCancel={() => {
            setShowAddForm(false);
            setEditingDestination(null);
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Il tuo itinerario</Text>
          <View style={styles.headerButtons}>
            {state.destinations.length > 0 && (
              <>
                <TouchableOpacity style={styles.headerButton} onPress={handleExportItinerary}>
                  <FileDown size={20} color="#3498db" />
                  <Text style={styles.headerButtonText}>Esporta</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.clearButton} onPress={confirmClearAll}>
                  <RotateCcw size={20} color="#e74c3c" />
                  <Text style={styles.clearButtonText}>Cancella</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <MapView 
          destinations={state.destinations} 
          optimizedRoute={state.optimizedRoute} 
        />

        {state.destinations.length > 0 && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Distanza totale</Text>
              <Text style={styles.statValue}>{formatDistance(state.totalDistance)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Durata stimata</Text>
              <Text style={styles.statValue}>{formatDuration(state.totalDuration)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Tappe</Text>
              <Text style={styles.statValue}>{state.destinations.length}</Text>
            </View>
          </View>
        )}

        {state.destinations.length > 0 && (
          <View style={styles.routePointsContainer}>
            <View style={styles.routePointInfo}>
              <Flag size={20} color="#27ae60" style={styles.routePointIcon} />
              <Text style={styles.routePointText}>
                {state.startingPointId 
                  ? 'Punto di partenza selezionato' 
                  : 'Seleziona un punto di partenza toccando il pulsante bandiera su una destinazione'}
              </Text>
            </View>
            
            <View style={styles.routePointInfo}>
              <Target size={20} color="#e74c3c" style={styles.routePointIcon} />
              <Text style={styles.routePointText}>
                {state.endPointId 
                  ? 'Punto di arrivo selezionato' 
                  : 'Seleziona un punto di arrivo toccando il pulsante target su una destinazione'}
              </Text>
            </View>
          </View>
        )}

        {state.destinations.length > 1 && (
          <TouchableOpacity 
            style={styles.createItineraryButton}
            onPress={handleCreateItinerary}
          >
            <Navigation size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles .createItineraryButtonText}>Crea Itinerario</Text>
          </TouchableOpacity>
        )}

        <RoutePreferencesForm
          preferences={state.preferences}
          onUpdate={updatePreferences}
        />

        {state.destinations.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Tappe del viaggio</Text>
            {state.optimizedRoute.length > 0 ? (
              // Show optimized route if available
              state.optimizedRoute.map((destination, index) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  onEdit={handleEditDestination}
                  onDelete={removeDestination}
                  onSetStartingPoint={handleSetStartingPoint}
                  onSetEndPoint={handleSetEndPoint}
                  isStartingPoint={destination.id === state.startingPointId}
                  isEndPoint={destination.id === state.endPointId}
                  index={index}
                />
              ))
            ) : (
              // Otherwise show all destinations
              state.destinations.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  onEdit={handleEditDestination}
                  onDelete={removeDestination}
                  onSetStartingPoint={handleSetStartingPoint}
                  onSetEndPoint={handleSetEndPoint}
                  isStartingPoint={destination.id === state.startingPointId}
                  isEndPoint={destination.id === state.endPointId}
                />
              ))
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <MapPin size={48} color="#95a5a6" />
            <Text style={styles.emptyStateTitle}>Nessuna destinazione</Text>
            <Text style={styles.emptyStateText}>
              Aggiungi le tappe del tuo viaggio per creare un itinerario ottimizzato
            </Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setEditingDestination(null);
          setShowAddForm(true);
        }}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginRight: 8,
  },
  headerButtonText: {
    color: '#3498db',
    marginLeft: 4,
    fontWeight: '500',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  clearButtonText: {
    color: '#e74c3c',
    marginLeft: 4,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    color: '#2c3e50',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  routePointsContainer: {
    marginBottom: 16,
  },
  routePointInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f9f5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  routePointIcon: {
    marginRight: 12,
  },
  routePointText: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  createItineraryButton: {
    backgroundColor: '#27ae60',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  createItineraryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
  },
  addButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    right: 20,
    backgroundColor: '#3498db',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});