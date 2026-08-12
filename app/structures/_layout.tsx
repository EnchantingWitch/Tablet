import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorText } from '@/hooks/useColorText';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useGlobalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorText = useColorText();
  const {systemName} = useGlobalSearchParams();//получение кода ОКС 
  const {ii} = useGlobalSearchParams();//получение кода ОКС 
  console.log(systemName, 'systemName');
  const [system, setSystem] = useState(' ');
  const [syst, setSyst] = useState(' ');
  const [ai, setAi] = useState(' ');
   const fontScale = useWindowDimensions().fontScale;

   const ts = (fontSize: number) => {
    return (Math.round(fontSize / fontScale))};

  useEffect(() => {
    if (systemName!== undefined){setSyst(systemName);};

  }, [systemName, ii]);
  useEffect(() => {

    if (ii!== undefined){setAi(ii)};
  }, [ ii]);
  useEffect(() => {

    const str = ai+' '+syst+'           ';
    setSystem(str);
  }, [syst, ai]);

  console.log('system', system);

  return (

    <Stack
      screenOptions={{

        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),

      }}>
      <Stack.Screen
        name="load_registry"
        options={{
          title: 'Загрузка реестра',
          
          headerTitleAlign: 'center',
          headerTintColor: colorText,
          headerShadowVisible: false,

          headerStyle: { backgroundColor: '#FFFFFF' },
        }}
      />
      <Stack.Screen
        name="system" 
        options={{
          title: system? system : ' ',
          headerTitleAlign: 'center',
          
          headerTintColor: colorText,
          headerShadowVisible: false,
          //headerTitle: systemName, 
          headerStyle: { backgroundColor: '#FFFFFF',  },
          headerTitleStyle: {
            fontSize: ts(20), // Укажите нужный размер шрифта
            //fontWeight: 'bold', // Опционально: можно добавить жирность
            // Другие стили для заголовка, если нужно
          },
          
        }}
      />
      <Stack.Screen
        name="structure_search"
        options={{
          title: 'Структура',

          headerTitleAlign: 'center',
          headerTintColor: colorText,
          headerShadowVisible: false,

          headerStyle: { backgroundColor: '#FFFFFF' 
          },
        }}
      />

    </Stack>
  )
}