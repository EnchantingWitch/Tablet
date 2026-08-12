import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TextInput, SafeAreaView, ScrollView, TouchableOpacity, useWindowDimensions, Image, Modal } from 'react-native';
import { Link, Tabs, useLocalSearchParams, router } from 'expo-router';
import { styles } from '../notes/create_note';
import CustomButton from '@/components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';


export type SystemGET = {
 
}

const DetailsScreen = () => {

  const [accessToken, setAccessToken] = useState<any>('');
  const fontScale = useWindowDimensions().fontScale;

  const ts = (fontSize: number) => {
    return (fontSize / fontScale)};

  const [modalVisible, setModalVisible] = useState(false);//для открытия фото полностью
  
  const getToken = async () => {
    try {
        const token = await AsyncStorage.getItem('accessToken');
        //setAccessToken(token);
        if (token !== null) {
            console.log('Retrieved token:', token);
            setAccessToken(token);
            //вызов getAuth для проверки актуальности токена
            //authUserAfterLogin();
        } else {
            console.log('No token found');
            router.push('/sign/sign_in');
        }
    } catch (error) {
        console.error('Error retrieving token:', error);
    }
};


  useEffect(() => {
    //вызов getComment при получении id Замечания - post
      
    }, [accessToken]);
  
    const getUserInfo = async () => {
      try {
        const response = await fetch('https://xn----7sbpwlcifkq8d.xn--p1ai:8443/comments/getCommentById/'+post);
        const json = await response.json();
        setData(json);
        //console.log(json.systemName, 'json.systemName');
        console.log('ResponseGetComment:', response);
        console.log('ResponseGetComment json:', json);
      } catch (error) {
        console.error('Ошибка при получении данных:', error);
      } finally {
        //
      }

    };

  return (

    <ScrollView>
      <View style={[styles.container]}>
        
        <View style={{flex: 1, alignItems: 'center'}}>

          <Text style={{ fontSize: ts(14), color: '#1E1E1E', fontWeight: 400, marginBottom: 8 }}>Категория замечания</Text>
          <TextInput
             style={[styles.input, {fontSize: ts(14) }]}
            placeholderTextColor="#111"
            value={category}
            editable={false}
          />

          <Text style={{ fontSize: ts(14), color: '#1E1E1E', fontWeight: 400, marginBottom: 8 }}>Комментарий</Text>
          <TextInput
             style={[styles.input, {fontSize: ts(14) }]}
            placeholderTextColor="#111"
            value={explanation}
            editable={false}
          />

          <View style={{justifyContent: 'center', alignContent: 'center', }}>
           <CustomButton title='Сохранить' handlePress ={ putComment } />
          
          </View>

        </View>
      </View>
    </ScrollView>


  );
}

export default DetailsScreen;