import { Tabs, useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { MapPin, Route, Settings, Upload, LogOut } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';

export default function TabLayout() {
  const { signOut, session } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!session) {
      router.replace('/login');
    }
  }, [session, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      console.log("Error in handleSignOut:", error);
      // Force navigation to login even if there's an error
      router.replace('/login');
    }
  };

  // If not authenticated, don't render the tabs
  if (!session) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          height: Platform.OS === 'ios' ? 100 : 70, // Increased height for better visibility
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '500',
          marginBottom: Platform.OS === 'ios' ? 5 : 8,
          marginTop: 5,
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Itinerario',
          tabBarIcon: ({ color, size }) => <Route color={color} size={size + 2} />,
        }}
      />
      <Tabs.Screen
        name="destinations"
        options={{
          title: 'Destinazioni',
          tabBarIcon: ({ color, size }) => <MapPin color={color} size={size + 2} />,
        }}
      />
      <Tabs.Screen
        name="import"
        options={{
          title: 'Importa',
          tabBarIcon: ({ color, size }) => <Upload color={color} size={size + 2} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Impostazioni',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size + 2} />,
          headerShown: true,
          headerTitle: 'Impostazioni',
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleSignOut}
              style={{ marginRight: 16 }}
            >
              <LogOut color="#e74c3c" size={24} />
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}