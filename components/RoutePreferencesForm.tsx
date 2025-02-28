import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { RoutePreferences } from '../types';

interface RoutePreferencesFormProps {
  preferences: RoutePreferences;
  onUpdate: (preferences: Partial<RoutePreferences>) => void;
}

export default function RoutePreferencesForm({
  preferences,
  onUpdate,
}: RoutePreferencesFormProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Preferenze di percorso</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tipo di percorso</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.routeTypeButton,
              preferences.routeType === 'fastest' && styles.routeTypeButtonActive,
            ]}
            onPress={() => onUpdate({ routeType: 'fastest' })}
          >
            <Text
              style={[
                styles.routeTypeButtonText,
                preferences.routeType === 'fastest' && styles.routeTypeButtonTextActive,
              ]}
            >
              Più veloce
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.routeTypeButton,
              preferences.routeType === 'scenic' && styles.routeTypeButtonActive,
            ]}
            onPress={() => onUpdate({ routeType: 'scenic' })}
          >
            <Text
              style={[
                styles.routeTypeButtonText,
                preferences.routeType === 'scenic' && styles.routeTypeButtonTextActive,
              ]}
            >
              Panoramico
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Modalità di trasporto</Text>
        <View style={styles.transportModeContainer}>
          <TouchableOpacity
            style={[
              styles.transportModeButton,
              preferences.transportMode === 'driving' && styles.transportModeButtonActive,
            ]}
            onPress={() => onUpdate({ transportMode: 'driving' })}
          >
            <Text
              style={[
                styles.transportModeText,
                preferences.transportMode === 'driving' && styles.transportModeTextActive,
              ]}
            >
              Auto
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.transportModeButton,
              preferences.transportMode === 'walking' && styles.transportModeButtonActive,
            ]}
            onPress={() => onUpdate({ transportMode: 'walking' })}
          >
            <Text
              style={[
                styles.transportModeText,
                preferences.transportMode === 'walking' && styles.transportModeTextActive,
              ]}
            >
              A piedi
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.transportModeButton,
              preferences.transportMode === 'bicycling' && styles.transportModeButtonActive,
            ]}
            onPress={() => onUpdate({ transportMode: 'bicycling' })}
          >
            <Text
              style={[
                styles.transportModeText,
                preferences.transportMode === 'bicycling' && styles.transportModeTextActive,
              ]}
            >
              Bicicletta
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.transportModeButton,
              preferences.transportMode === 'transit' && styles.transportModeButtonActive,
            ]}
            onPress={() => onUpdate({ transportMode: 'transit' })}
          >
            <Text
              style={[
                styles.transportModeText,
                preferences.transportMode === 'transit' && styles.transportModeTextActive,
              ]}
            >
              Trasporto pubblico
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Opzioni aggiuntive</Text>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Evita pedaggi</Text>
          <Switch
            value={preferences.avoidTolls}
            onValueChange={(value) => onUpdate({ avoidTolls: value })}
            trackColor={{ false: '#ecf0f1', true: '#3498db' }}
            thumbColor={preferences.avoidTolls ? '#2980b9' : '#bdc3c7'}
          />
        </View>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Evita autostrade</Text>
          <Switch
            value={preferences.avoidHighways}
            onValueChange={(value) => onUpdate({ avoidHighways: value })}
            trackColor={{ false: '#ecf0f1', true: '#3498db' }}
            thumbColor={preferences.avoidHighways ? '#2980b9' : '#bdc3c7'}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#34495e',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  routeTypeButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  routeTypeButtonActive: {
    backgroundColor: '#3498db',
  },
  routeTypeButtonText: {
    fontWeight: '600',
    color: '#7f8c8d',
  },
  routeTypeButtonTextActive: {
    color: '#fff',
  },
  transportModeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  transportModeButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  transportModeButtonActive: {
    backgroundColor: '#3498db',
  },
  transportModeText: {
    fontWeight: '500',
    color: '#7f8c8d',
  },
  transportModeTextActive: {
    color: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#34495e',
  },
});