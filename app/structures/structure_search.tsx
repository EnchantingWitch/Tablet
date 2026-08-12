import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
//import Search_Input from '@/components/Search_Input';



export default function structure_search() {
    return (
        <ScrollView style={{ backgroundColor: 'white' }}>
            <View style={styles.container}>

              {/*  <Search_Input />*/}

                <View>
                    <Text>
                    Пустая форма, заготовка для поиска форм реестров.
                    </Text>
                </View>

            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignSelf: 'center',
        //  alignItems: 'center',
        width: '96%',

    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
});
