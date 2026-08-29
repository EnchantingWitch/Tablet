import { fontFamily } from '@/constants/Fonts';
import { brand } from '@/constants/Colors';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorText } from '@/hooks/useColorText';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack } from 'expo-router';
import React from 'react';
import { useWindowDimensions } from 'react-native';


// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/

export default function TabLayout() {
  const colorText = useColorText();
  const fontScale = useWindowDimensions().fontScale;

  const ts = (fontSize: number) => {
    return (Math.round(fontSize / fontScale))};
    
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={ts(20)} style={{ marginBottom: -3}} {...props} />;
}

  return (

    <Stack
      screenOptions={{

        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),

      }}>
      
      <Stack.Screen
      name="menu"
      options={{
        title: 'Администрирование',
        headerTitleAlign: 'center',
        headerTintColor: colorText,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: brand.white },
        headerTitleStyle: {
          fontFamily,
          fontSize: ts(20), // Укажите нужный размер шрифта
          //fontWeight: 'bold', // Опционально: можно добавить жирность
          // Другие стили для заголовка, если нужно
        },
      }}
      />
      <Stack.Screen
        name="create_obj"
        options={{
            title: 'Создание объекта',
          //  headerTitleStyle: {fontSize: ts(20)},
    
          headerTitleAlign: 'center',
          headerTintColor: colorText,
          headerShadowVisible: false,
          headerTitleStyle: {
            fontFamily,
            fontSize: ts(20),// Укажите нужный размер шрифта
            //fontWeight: 'bold', // Опционально: можно добавить жирность
            // Другие стили для заголовка, если нужно
          },
         
        headerStyle: { backgroundColor: brand.white,  },
        }}
      />
      <Stack.Screen
        name="load_objs"
        options={{
            title: 'Загрузка объектов',
          //  headerTitleStyle: {fontSize: ts(20)},
    
          headerTitleAlign: 'center',
          headerTintColor: colorText,
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
      <Stack.Screen
        name="user"
        options={{
            title: 'Пользователь',//редактирование доступа пользователя удалить/изменить
          //  headerTitleStyle: {fontSize: ts(20)},
    
          headerTitleAlign: 'center',
          headerTintColor: colorText,
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
      <Stack.Screen
        name="requests"
        options={{
           headerShown: false,
            title: 'Заявки на допуск к объектам',
          //  headerTitleStyle: {fontSize: ts(20)},
    
          headerTitleAlign: 'center',
          headerTintColor: colorText,
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
      <Stack.Screen
        name="users"
        options={{
           headerShown: false,
            title: 'Пользователи',
          //  headerTitleStyle: {fontSize: ts(20)},
    
          headerTitleAlign: 'center',
          headerTintColor: colorText,
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
      <Stack.Screen
        name="acpt_req"
        options={{
            title: 'Заявка на доступ',
          //  headerTitleStyle: {fontSize: ts(20)},
    
          headerTitleAlign: 'center',
          headerTintColor: colorText,
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
      <Stack.Screen
        name="objs"
        options={{
           headerShown: false,
            title: 'Объекты',
          //  headerTitleStyle: {fontSize: ts(20)},
    
          headerTitleAlign: 'center',
          headerTintColor: colorText,
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
      <Stack.Screen
        name="change_obj"
        options={{
            title: 'Редактирование',
          //  headerTitleStyle: {fontSize: ts(20)},
    
          headerTitleAlign: 'center',
          headerTintColor: colorText,
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
      <Stack.Screen
        name="create_organization"
        options={{
            title: 'Добавление организации',
          //  headerTitleStyle: {fontSize: ts(20)},
    
          headerTitleAlign: 'center',
          headerTintColor: colorText,
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
      <Stack.Screen
        name="organizations"
        options={{
           headerShown: false,
            title: 'Организации',
          //  headerTitleStyle: {fontSize: ts(20)},
    
          headerTitleAlign: 'center',
          headerTintColor: colorText,
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
      <Stack.Screen
        name="organization"
        options={{
            title: 'Организация',
          //  headerTitleStyle: {fontSize: ts(20)},
    
          headerTitleAlign: 'center',
          headerTintColor: colorText,
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