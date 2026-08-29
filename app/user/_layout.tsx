import { fontFamily } from '@/constants/Fonts';
import { brand } from '@/constants/Colors';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack } from 'expo-router';
import React from 'react';
import { useWindowDimensions } from 'react-native';


// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3}} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const fontScale = useWindowDimensions().fontScale;

  const ts = (fontSize: number) => {
    return (Math.round(fontSize / fontScale))};

  return (

    <Stack
      screenOptions={{

        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),

      }}>
      
      <Stack.Screen
        name="update_user_inf"
        options={{
            title: 'Подробная информация',
          //  headerTitleStyle: {fontSize: ts(20)},
    
          headerTitleAlign: 'center',
          headerTintColor: brand.textPrimary,
          headerShadowVisible: false,
         
        headerStyle: { backgroundColor: brand.white,  },
        headerTitleStyle: {
          fontFamily,
          fontSize: ts(20), // Укажите нужный размер шрифта
          //fontWeight: 'bold', // Опционально: можно добавить жирность
          // Другие стили для заголовка, если нужно
        },
        }}
      />
      
    </Stack>
  )}