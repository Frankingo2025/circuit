import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Destination } from '../types';
import { validateAddress, formatAddress, geocodeAddress } from '../utils/addressValidation';
import { MapPin } from 'lucide-react-native';

interface DestinationFormProps {
  initialValues?: Partial<Destination>;
  onSubmit: (destination: Destination) => void;
  onCancel: () => void;
}

export default function DestinationForm({
  initialValues,
  onSubmit,
  onCancel,
}: DestinationFormProps) {
  const [name, setName] = useState(initialValues?.name || '');
  const [address, setAddress] = useState(initialValues?.address || '');
  const [streetNumber, setStreetNumber] = useState('');
  const [latitude, setLatitude] = useState(
    initialValues?.latitude !== undefined ? String(initialValues.latitude) : ''
  );
  const [longitude, setLongitude] = useState(
    initialValues?.longitude !== undefined ? String(initialValues.longitude) : ''
  );
  const [notes, setNotes] = useState(initialValues?.notes || '');
  const [visitDuration, setVisitDuration] = useState(
    initialValues?.visitDuration !== undefined ? String(initialValues.visitDuration) : ''
  );
  const [isRequired, setIsRequired] = useState(initialValues?.isRequired || false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Extract street number from address if present
  useEffect(() => {
    if (initialValues?.address) {
      const match = initialValues.address.match(/[,\s](\d+)/);
      if (match && match[1]) {
        setStreetNumber(match[1]);
      }
    }
  }, [initialValues?.address]);

  const validate = async () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Il nome è obbligatorio';
    }

    if (!address.trim()) {
      newErrors.address = "L'indirizzo è obbligatorio";
    } else {
      // Validate the address format
      const formattedAddress = formatAddress(address, streetNumber);
      const isValid = await validateAddress(formattedAddress);
      if (!isValid) {
        newErrors.address = "L'indirizzo non è valido. Assicurati di includere via, numero civico e città";
      }
    }

    if (latitude && isNaN(Number(latitude))) {
      newErrors.latitude = 'La latitudine deve essere un numero';
    }

    if (longitude && isNaN(Number(longitude))) {
      newErrors.longitude = 'La longitudine deve essere un numero';
    }

    if (visitDuration && isNaN(Number(visitDuration))) {
      newErrors.visitDuration = 'La durata deve essere un numero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGeocodeAddress = async () => {
    if (!address.trim()) {
      setErrors(prev => ({ ...prev, address: "L'indirizzo è obbligatorio" }));
      return;
    }

    setIsGeocoding(true);
    try {
      const formattedAddress = formatAddress(address, streetNumber);
      const coordinates = await geocodeAddress(formattedAddress);
      
      if (coordinates) {
        setLatitude(String(coordinates.lat));
        setLongitude(String(coordinates.lng));
        Alert.alert(
          'Coordinate trovate',
          `Latitudine: ${coordinates.lat}\nLongitudine: ${coordinates.lng}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Geocodifica fallita',
          'Non è stato possibile trovare le coordinate per questo indirizzo. Prova a inserire un indirizzo più specifico o inserisci le coordinate manualmente.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      Alert.alert(
        'Errore',
        'Si è verificato un errore durante la geocodifica dell\'indirizzo.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = async () => {
    if (await validate()) {
      // Format the address to include street number if provided
      const formattedAddress = formatAddress(address, streetNumber);
      
      // If coordinates are missing, try to geocode the address
      let lat = latitude ? Number(latitude) : 0;
      let lng = longitude ? Number(longitude) : 0;
      
      if ((!lat || !lng) && formattedAddress) {
        setIsGeocoding(true);
        try {
          const coordinates = await geocodeAddress(formattedAddress);
          if (coordinates) {
            lat = coordinates.lat;
            lng = coordinates.lng;
          }
        } catch (error) {
          console.error('Error geocoding address during submit:', error);
        } finally {
          setIsGeocoding(false);
        }
      }
      
      const destination: Destination = {
        id: initialValues?.id || Math.random().toString(36).substring(2, 9),
        name,
        address: formattedAddress,
        latitude: lat,
        longitude: lng,
        notes: notes || undefined,
        visitDuration: visitDuration ? Number(visitDuration) : undefined,
        isRequired,
      };
      onSubmit(destination);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.title}>
          {initialValues?.id ? 'Modifica destinazione' : 'Nuova destinazione'}
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nome *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={name}
            onChangeText={setName}
            placeholder="Es. Milano Duomo"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Indirizzo *</Text>
          <View style={styles.addressInputContainer}>
            <TextInput
              style={[
                styles.input, 
                styles.addressInput, 
                errors.address && styles.inputError
              ]}
              value={address}
              onChangeText={setAddress}
              placeholder="Es. Piazza Duomo, Milano"
              multiline
            />
            <TouchableOpacity 
              style={styles.geocodeButton}
              onPress={handleGeocodeAddress}
              disabled={isGeocoding}
            >
              {isGeocoding ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <MapPin size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Numero civico</Text>
          <TextInput
            style={styles.input}
            value={streetNumber}
            onChangeText={setStreetNumber}
            placeholder="Es. 1"
            keyboardType="numeric"
          />
          <Text style={styles.helperText}>
            Se non incluso nell'indirizzo, specificare il numero civico
          </Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Latitudine</Text>
            <TextInput
              style={[styles.input, errors.latitude && styles.inputError]}
              value={latitude}
              onChangeText={setLatitude}
              placeholder="Es. 45.4642"
              keyboardType="numeric"
            />
            {errors.latitude && <Text style={styles.errorText}>{errors.latitude}</Text>}
          </View>

          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Longitudine</Text>
            <TextInput
              style={[styles.input, errors.longitude && styles.inputError]}
              value={longitude}
              onChangeText={setLongitude}
              placeholder="Es. 9.1900"
              keyboardType="numeric"
            />
            {errors.longitude && <Text style={styles.errorText}>{errors.longitude}</Text>}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Durata visita (minuti)</Text>
          <TextInput
            style={[styles.input, errors.visitDuration && styles.inputError]}
            value={visitDuration}
            onChangeText={setVisitDuration}
            placeholder="Es. 60"
            keyboardType="numeric"
          />
          {errors.visitDuration && <Text style={styles.errorText}>{errors.visitDuration}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Note</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Aggiungi note o dettagli..."
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Tappa obbligatoria</Text>
          <Switch
            value={isRequired}
            onValueChange={setIsRequired}
            trackColor={{ false: '#ecf0f1', true: '#3498db' }}
            thumbColor={isRequired ? '#2980b9' : '#bdc3c7'}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Annulla</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
            disabled={isGeocoding}
          >
            {isGeocoding ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Salva</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#34495e',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  addressInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressInput: {
    flex: 1,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  geocodeButton: {
    backgroundColor: '#3498db',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    padding: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 4,
  },
  helperText: {
    color: '#7f8c8d',
    fontSize: 12,
    marginTop: 4,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#34495e',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    padding: 15,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});