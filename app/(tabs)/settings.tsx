import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  SafeAreaView,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { useItinerary } from '../../context/ItineraryContext';
import { 
  Settings as SettingsIcon, 
  Map, 
  Info, 
  ExternalLink, 
  Mail, 
  Github,
  Trash2
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { clearDestinations } = useItinerary();
  const [darkMode, setDarkMode] = React.useState(false);
  const [useMetricSystem, setUseMetricSystem] = React.useState(true);
  const [saveHistory, setSaveHistory] = React.useState(true);
  const appVersion = '1.0.0';

  const confirmClearData = () => {
    Alert.alert(
      'Conferma eliminazione',
      'Sei sicuro di voler eliminare tutti i dati? Questa azione non può essere annullata.',
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Elimina tutto', 
          style: 'destructive', 
          onPress: () => {
            clearDestinations();
            Alert.alert('Dati eliminati', 'Tutti i dati sono stati eliminati con successo.');
          } 
        },
      ]
    );
  };

  const openWebsite = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Errore', `Non è possibile aprire l'URL: ${url}`);
      }
    });
  };

  const sendEmail = () => {
    Linking.openURL('mailto:support@itineraryplanner.com?subject=Feedback%20App%20Itinerario');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Impostazioni</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferenze</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Tema scuro</Text>
              <Text style={styles.settingDescription}>Attiva il tema scuro per l'app</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#ecf0f1', true: '#3498db' }}
              thumbColor={darkMode ? '#2980b9' : '#bdc3c7'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Sistema metrico</Text>
              <Text style={styles.settingDescription}>Usa km invece di miglia</Text>
            </View>
            <Switch
              value={useMetricSystem}
              onValueChange={setUseMetricSystem}
              trackColor={{ false: '#ecf0f1', true: '#3498db' }}
              thumbColor={useMetricSystem ? '#2980b9' : '#bdc3c7'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Salva cronologia</Text>
              <Text style={styles.settingDescription}>Mantieni la cronologia degli itinerari</Text>
            </View>
            <Switch
              value={saveHistory}
              onValueChange={setSaveHistory}
              trackColor={{ false: '#ecf0f1', true: '#3498db' }}
              thumbColor={saveHistory ? '#2980b9' : '#bdc3c7'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dati</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={confirmClearData}>
            <Trash2 size={20} color="#e74c3c" style={styles.actionIcon} />
            <Text style={[styles.actionText, { color: '#e74c3c' }]}>Elimina tutti i dati</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informazioni</Text>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => openWebsite('https://itineraryplanner.com')}
          >
            <ExternalLink size={20} color="#3498db" style={styles.actionIcon} />
            <Text style={styles.actionText}>Visita il sito web</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={sendEmail}>
            <Mail size={20} color="#3498db" style={styles.actionIcon} />
            <Text style={styles.actionText}>Invia feedback</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => openWebsite('https://github.com/itineraryplanner')}
          >
            <Github size={20} color="#3498db" style={styles.actionIcon} />
            <Text style={styles.actionText}>GitHub</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Versione {appVersion}</Text>
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
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionIcon: {
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '500',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  versionText: {
    fontSize: 14,
    color: '#95a5a6',
  },
});