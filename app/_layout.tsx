import { useEffect } from 'react';
import { Stack, Redirect, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ItineraryProvider } from '../context/ItineraryContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

// Auth protection component
function AuthProtection({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)' || segments[0] === 'login';
    
    if (!session && !inAuthGroup) {
      // Redirect to the login page if not authenticated
      router.replace('/login');
    } else if (session && inAuthGroup) {
      // Redirect to the main app if already authenticated
      router.replace('/(tabs)');
    }
  }, [session, segments, isLoading, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  useEffect(() => {
    window.frameworkReady?.();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ItineraryProvider>
          <AuthProtection>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="preview" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </AuthProtection>
        </ItineraryProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}