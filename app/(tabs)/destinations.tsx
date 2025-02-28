import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useItinerary } from '../../context/ItineraryContext';
import DestinationCard from '../../components/DestinationCard';
import DestinationForm from '../../components/DestinationForm';
import { Plus, MapPin, Flag, Target } from 'lucide-react-native';

export default function DestinationsScreen() {
  const { state, addDestination, updateDestination, removeDestination, setStartingPoint, setEndPoint } = useItinerary();
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
          <Text style={styles.title}>Le tue destinazioni</Text>
        </View>

        {state.destinations.length > 0 && (
          <View style={styles.routePointsContainer}>
            <View style={styles.routePointInfo}>
              <Flag size={20} color="#27ae60" style={styles.routePointIcon} />
              <Text style={styles.routePointText}>
                {state.startingPointId 
                  ? 'Punto di partenza selezionato. Tocca il pulsante bandiera su una destinazione per cambiarlo.' 
                  : 'Seleziona un punto di partenza toccando il pulsante bandiera su una destinazione.'}
              </Text>
            </View>
            
            <View style={styles.routePointInfo}>
              <Target size={20} color="#e74c3c" style={styles.routePointIcon} />
              <Text style={styles.routePointText}>
                {state.endPointId 
                  ? 'Punto di arrivo selezionato. Tocca il pulsante target su una destinazione per cambiarlo.' 
                  : 'Seleziona un punto di arrivo toccando il pulsante target su una destinazione.'}
              </Text>
            </View>
          </View>
        )}

        {state.destinations.length > 0 ? (
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
        ) : (
          <View style={styles.emptyState}>
            <MapPin size={48} color="#95a5a6" />
            <Text style={styles.emptyStateTitle}>Nessuna destinazione</Text>
            <Text style={styles.emptyStateText}>
              Aggiungi le destinazioni che desideri visitare durante il tuo viaggio
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
    bottom: 20,
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