import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useItinerary } from '../../context/ItineraryContext';
import { parseExcelFile, generateExcelTemplate } from '../../utils/excelImport';
import { FileDown, Upload, FileText, CircleAlert as AlertCircle, CircleCheck as CheckCircle, MapPin } from 'lucide-react-native';

export default function ImportScreen() {
  const { importDestinations } = useItinerary();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importStats, setImportStats] = useState<{
    total: number;
    imported: number;
    skipped: number;
    geocoded: number;
  } | null>(null);

  const handleImportExcel = async () => {
    try {
      setLoading(true);
      setError(null);
      setImportStats(null);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        setLoading(false);
        return;
      }
      
      const fileUri = result.assets[0].uri;
      const destinations = await parseExcelFile(fileUri);
      
      if (destinations.length === 0) {
        setError('Nessuna destinazione valida trovata nel file. Verifica che il formato sia corretto e che gli indirizzi siano validi.');
        setLoading(false);
        return;
      }
      
      // Calculate import statistics
      const totalRows = result.assets[0].name?.includes('.xlsx') ? 
        await countExcelRows(fileUri) : destinations.length;
      
      // Count geocoded destinations (those with non-zero coordinates)
      const geocodedCount = destinations.filter(
        dest => dest.latitude !== 0 && dest.longitude !== 0
      ).length;
      
      const stats = {
        total: totalRows,
        imported: destinations.length,
        skipped: totalRows - destinations.length,
        geocoded: geocodedCount
      };
      
      setImportStats(stats);
      importDestinations(destinations);
      
      Alert.alert(
        'Importazione completata',
        `${destinations.length} destinazioni importate con successo.\n${geocodedCount} indirizzi geocodificati automaticamente.${stats.skipped > 0 ? `\n${stats.skipped} destinazioni ignorate per indirizzi non validi.` : ''}`,
        [{ text: 'OK' }]
      );
      
      setLoading(false);
    } catch (err) {
      console.error('Import error:', err);
      setError('Si è verificato un errore durante l\'importazione. Verifica che il file sia nel formato corretto.');
      setLoading(false);
    }
  };

  // Helper function to count rows in Excel file
  const countExcelRows = async (fileUri: string): Promise<number> => {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      });

      const XLSX = require('xlsx');
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      return data.length;
    } catch (error) {
      console.error('Error counting Excel rows:', error);
      return 0;
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const dataUrl = generateExcelTemplate();
      
      if (Platform.OS === 'web') {
        // For web, create a download link
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'template_destinazioni.xlsx';
        link.click();
      } else {
        // For native, we would need to save the file and then share it
        Alert.alert(
          'Funzionalità limitata',
          'Il download del template è disponibile solo nella versione web dell\'app.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.error('Template download error:', err);
      setError('Si è verificato un errore durante la generazione del template.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Importa destinazioni</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Importa da Excel</Text>
          <Text style={styles.cardDescription}>
            Importa le tue destinazioni da un file Excel. Il file deve contenere almeno le colonne "name" e "address" con numero civico. Le coordinate geografiche verranno trovate automaticamente.
          </Text>
          
          <TouchableOpacity
            style={styles.button}
            onPress={handleImportExcel}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.buttonText}>Importazione in corso...</Text>
              </View>
            ) : (
              <>
                <Upload size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Seleziona file Excel</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleDownloadTemplate}
          >
            <FileDown size={20} color="#3498db" style={styles.buttonIcon} />
            <Text style={styles.secondaryButtonText}>Scarica template</Text>
          </TouchableOpacity>
        </View>
        
        {importStats && (
          <View style={styles.statsCard}>
            <CheckCircle size={24} color="#27ae60" style={styles.statsIcon} />
            <Text style={styles.statsTitle}>Importazione completata</Text>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Totale righe:</Text>
              <Text style={styles.statsValue}>{importStats.total}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Importate:</Text>
              <Text style={styles.statsValue}>{importStats.imported}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Ignorate:</Text>
              <Text style={styles.statsValue}>{importStats.skipped}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Geocodificate:</Text>
              <Text style={styles.statsValue}>{importStats.geocoded}</Text>
            </View>
            {importStats.skipped > 0 && (
              <Text style={styles.statsNote}>
                Alcune destinazioni sono state ignorate perché gli indirizzi non erano validi o mancavano informazioni obbligatorie.
              </Text>
            )}
          </View>
        )}
        
        {error && (
          <View style={styles.errorCard}>
            <AlertCircle size={24} color="#e74c3c" style={styles.errorIcon} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        <View style={styles.infoCard}>
          <FileText size={24} color="#3498db" style={styles.infoIcon} />
          <Text style={styles.infoTitle}>Formato del file</Text>
          <Text style={styles.infoText}>
            Il file Excel deve contenere le seguenti colonne:
          </Text>
          <View style={styles.infoList}>
            <Text style={styles.infoListItem}>• name: Nome della destinazione</Text>
            <Text style={styles.infoListItem}>• address: Indirizzo completo con numero civico</Text>
            <Text style={styles.infoListItem}>• latitude: Latitudine (opzionale)</Text>
            <Text style={styles.infoListItem}>• longitude: Longitudine (opzionale)</Text>
            <Text style={styles.infoListItem}>• notes: Note aggiuntive (opzionale)</Text>
            <Text style={styles.infoListItem}>• duration: Durata visita in minuti (opzionale)</Text>
            <Text style={styles.infoListItem}>• required: Tappa obbligatoria (opzionale)</Text>
          </View>
          
          <View style={styles.geocodingInfoCard}>
            <MapPin size={20} color="#3498db" style={styles.geocodingIcon} />
            <Text style={styles.geocodingInfoText}>
              <Text style={styles.geocodingInfoTitle}>Geocodifica automatica:</Text> Se non specifichi le coordinate (latitude/longitude), l'app tenterà di trovarle automaticamente in base all'indirizzo fornito.
            </Text>
          </View>
          
          <Text style={styles.infoNote}>
            Nota: Gli indirizzi devono includere il numero civico (es. "Via Roma, 10, Milano").
            Gli indirizzi senza numero civico o non validi verranno ignorati durante l'importazione.
          </Text>
        </View>
      </ScrollView>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  secondaryButton: {
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: '#f1f9f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  statsIcon: {
    marginBottom: 12,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statsLabel: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  statsValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  statsNote: {
    fontSize: 14,
    color: '#e67e22',
    marginTop: 8,
    fontStyle: 'italic',
  },
  errorCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorIcon: {
    marginRight: 12,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  infoIcon: {
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 12,
  },
  infoList: {
    marginLeft: 4,
    marginBottom: 12,
  },
  infoListItem: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 6,
    lineHeight: 20,
  },
  geocodingInfoCard: {
    backgroundColor: '#edf7fd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  geocodingIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  geocodingInfoText: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
    lineHeight: 20,
  },
  geocodingInfoTitle: {
    fontWeight: 'bold',
  },
  infoNote: {
    fontSize: 14,
    color: '#e67e22',
    fontStyle: 'italic',
    backgroundColor: '#fef9ef',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
});