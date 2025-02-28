import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, LogIn } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, session } = useAuth();
  const router = useRouter();

  // Redirect to main app if already authenticated
  useEffect(() => {
    if (session) {
      router.replace('/(tabs)');
    }
  }, [session, router]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Errore', 'Inserisci email e password');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        Alert.alert('Errore di accesso', 'Credenziali non valide. Contatta l\'amministratore per ottenere un account.');
      } else {
        // Navigation will happen automatically due to the useEffect
      }
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore durante l\'accesso');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=300&auto=format&fit=crop' }}
            style={styles.logo}
          />
          <Text style={styles.appName}>Itinerario</Text>
          <Text style={styles.tagline}>Pianifica il tuo viaggio perfetto</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Mail size={20} color="#95a5a6" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#95a5a6" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <LogIn size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.loginButtonText}>Accedi</Text>
              </>
            )}
          </TouchableOpacity>
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Questa è un'applicazione ad accesso riservato.
            </Text>
            <Text style={styles.infoText}>
              Contatta l'amministratore per ottenere le credenziali di accesso.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>APP CREATA DA VALERIO S.</Text>
          <Text style={styles.copyrightText}>© 2025 Itinerario App</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 100 : 80,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
  },
  tagline: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 8,
  },
  formContainer: {
    paddingHorizontal: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#2c3e50',
  },
  loginButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
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
  infoContainer: {
    marginTop: 24,
    backgroundColor: '#ecf0f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  infoText: {
    color: '#7f8c8d',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    color: '#2c3e50',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  copyrightText: {
    color: '#95a5a6',
    fontSize: 12,
  },
});