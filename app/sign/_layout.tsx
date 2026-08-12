import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorText } from '@/hooks/useColorText';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack } from 'expo-router';
import React from 'react';
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
    const fontScale = useWindowDimensions().fontScale;

    const ts = (fontSize: number) => {
        return (Math.round(fontSize / fontScale))};
    return (

        <Stack
            screenOptions={{
                headerShown: useClientOnlyValue(false, true),

            }}>

            <Stack.Screen
                name="sign_in"
                options={{
                    title: 'Вход',
                    //  headerTitleStyle: {fontSize: ts(20)},
                    headerShown: false,
                    headerTitleAlign: 'center',
                    headerTintColor: colorText,
                    headerShadowVisible: false,

                    headerStyle: { backgroundColor: '#FFFFFF', },
                    headerTitleStyle: {
                        fontSize: ts(20), // Укажите нужный размер шрифта
                        //fontWeight: 'bold', // Опционально: можно добавить жирность
                        // Другие стили для заголовка, если нужно
                      },
                }}
            />
            <Stack.Screen
                name="register"
                options={{
                    title: 'Регистрация',
                    //headerTitleStyle: {fontSize: ts(20)},

                    headerTitleAlign: 'center',

                    headerTintColor: colorText,
                    headerShadowVisible: false,

                    headerTitleStyle: {
                        fontSize: ts(20), // Укажите нужный размер шрифта
                        //fontWeight: 'bold', // Опционально: можно добавить жирность
                        // Другие стили для заголовка, если нужно
                      },
                    headerStyle: { backgroundColor: '#FFFFFF' },
                }}
            />
        </Stack>
    )
}