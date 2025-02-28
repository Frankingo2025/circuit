import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function PreviewScreen() {
  const router = useRouter();

  const handleNavigateToLogin = () => {
    router.push('/login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Benvenuto in Itinerario</Text>
        <Text style={styles.subtitle}>
          Pianifica il tuo viaggio perfetto con la nostra app. Scopri le funzionalità principali!
        </Text>
      </View>

      <View style={styles.featureSection}>
        <Image
          source={{ uri: 'https://via.placeholder.com/300x200.png?text=Screenshot+1' }}
          style={styles.featureImage}
        />
        <Text style={styles.featureTitle}>Organizza le tue destinazioni</Text>
        <Text style={styles.featureDescription}>
          Aggiungi, modifica e riorganizza le tappe del tuo viaggio con facilità.
        </Text>
      </View>

      <View style={styles.featureSection}>
        <Image
          source={{ uri: 'https://via.placeholder.com/300x200.png?text=Screenshot+2' }}
          style={styles.featureImage}
        />
        <Text style={styles.featureTitle}>Ottimizza il tuo itinerario</Text>
        <Text style={styles.featureDescription}>
          Calcola il percorso più efficiente per risparmiare tempo e goderti il viaggio.
        </Text>
      </View>

      <View style={styles.featureSection}>
        <Image
          source={{ uri: 'https://via.placeholder.com/300x200.png?text=Screenshot+3' }}
          style={styles.featureImage}
        />
        <Text style={styles.featureTitle}>Esporta e condividi</Text>
        <Text style={styles.featureDescription}>
          Esporta il tuo itinerario in formato Excel e condividilo con i tuoi compagni di viaggio.
        </Text>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleNavigateToLogin}>
        <Text style={styles.loginButtonText}>Accedi per iniziare</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
  },
  featureSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
