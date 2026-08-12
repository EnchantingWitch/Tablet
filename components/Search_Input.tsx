/*
import { StyleSheet, View, Text, TextInput, Keyboard, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import DropdownComponent1 from '@/components/list_system';
import DateInputWithPicker from '@/components/calendar';
import { router, usePathname } from "expo-router";
import { Router } from "expo-router";
import { Image } from 'react-native';


const Search_Input = ({ initialQuery }) => {
    const pathname = usePathname()
    const [query, setQuery] = useState(initialQuery || '')
    return (

        <View style={{
            alignItems: 'center'
        }}>
            <TextInput style={{
                backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#D9D9D9', width: 272, height: 40, paddingTop: 12, paddingLeft: 16, paddingRight: 16, paddingBottom: 12, color: '#B3B3B3', textAlign: 'center', marginBottom: 20
            }}
                value={query}
                placeholder={'Поисковое окно'}
                onChangeText={(e) => setQuery(e)}
            />

            <TouchableOpacity onPress={() => {
                if (!query) {
                    return Alert.alert('Не найдено', "Введите что-нибудь для поиска")
                }

                if (pathname.startsWith('/search')) router.
                    setParams({ query })
                else router.push(`/search/${query}`)
            }}>
                <Image
                  //  source={require('../../expo-main-2/assets/images/751463.png')}
                    style={{ width: 50, height: 50 }}
                />
            </TouchableOpacity>


        </View>
    )
}




export default Search_Input
*/