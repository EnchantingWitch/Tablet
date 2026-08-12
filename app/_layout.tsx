import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider } from '../providers/AuthProvider';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    HeliosCondC: require('../assets/fonts/helioscondc.otf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {

  return (
   // <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
   <AuthProvider>
      <Stack>
        
       <Stack.Screen name="index"  options={{ headerShown: false, title: 'Стартовая страница'}} />
       <Stack.Screen name="objs"  options={{ headerShown: false}} />
        <Stack.Screen name="(tabs)"  options={{ headerShown: false}} />
        <Stack.Screen name="offline"  options={{ headerShown: false}} />
        <Stack.Screen name="notes"  options={{ headerShown: false}} />
        <Stack.Screen name="structures"  options={{ headerShown: false}} />
        <Stack.Screen name="sign"  options={{ headerShown: false}} />
        <Stack.Screen name="admin"  options={{ headerShown: false}} />
        <Stack.Screen name="user"  options={{ headerShown: false}} />
        <Stack.Screen name="defacts"  options={{ headerShown: false}} />
        <Stack.Screen name="jour"  options={{ headerShown: false}} />
        <Stack.Screen name="modal" options={{ presentation: 'modal'}} />

      </Stack>
    </AuthProvider>
   // </ThemeProvider>
   // //<Stack.Screen name="objects"  options={{ headerShown: false}} />
  );
}

