import CustomButton from "@/components/CustomButton";
import { useColorText } from '@/hooks/useColorText';
import { useToken } from "@/hooks/useToken";
import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { API_BASE_URL } from '../../config/api';

//const UploadFile =  ()  => {
  export default function UploadFile (){
  const colorText = useColorText();
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const { tokenFrAsync,getTokenFrAsync,saveTokenFrAsync, removeTokenFrAsync} = useToken();
  const fontScale = useWindowDimensions().fontScale;

  const ts = (fontSize: number) => {
    return (fontSize / fontScale)};

    const navigation = useNavigation();
    
        useEffect(() => {
         
              navigation.setOptions({
                
                headerLeft: () => (
                  <TouchableOpacity onPress={getToken}>
                    <Ionicons name='exit-outline' size={25} style={{alignSelf: 'center', color: colorText}}/>
                  </TouchableOpacity>
                ),
              });
              if(accessToken){handleLogout()}
        }, [navigation, accessToken]);
        useEffect(() => {
          getTok();
          removeTokenFrAsync('lastViewedAdminOrg')
            
        }, []);

        const getToken = async () => {
          try {
              const token = await SecureStore.getItemAsync('accessToken');
              if (token !== null) {
                setAccessToken(token);
                  console.log('Retrieved token:', token);
              } else {
                  console.log('No token found');
              }
          } catch (error) {
              console.error('Error retrieving token:', error);
          }
      };

      const getTok = async () => {
        try {
            const token = await SecureStore.getItemAsync('refreshToken');
            if (token !== null) {
              setRefreshToken(token);
                console.log('Retrieved refresh token:', token);
            } else {
                console.log('No token found');
            }
        } catch (error) {
            console.error('Error retrieving token:', error);
        }
    };

      const removeToken = async (tokenKey) => {
        try {
            await SecureStore.deleteItemAsync(tokenKey);
            console.log('Token - ',tokenKey,'- removed successfully!');
        } catch (error) {
            console.error('Error removing token:', error);
        }
    };

        const handleLogout = async () => {
          try{
          
            if (accessToken!== null){
              const str = `Bearer ${accessToken}`;
              console.log(str);
                  
              let response = await fetch(`${API_BASE_URL}/logout`, {
                   method: 'POST',
                   headers: {
                      'Authorization': str,
                     'Content-Type': 'application/json',
                   },
                   
                 });
                 
                 console.log('ResponseLogout:', response);
                 if(response.status === 200){
                  removeToken('accessToken');
                  removeToken('refreshToken');
                  removeToken('userID');
                  removeToken('role');
               //   removeToken('organisation');
                  removeToken('fullName');
               //   removeToken('permissions');
                  router.push('/sign/sign_in');
                 }
  
              }}catch (error) {
                  console.error('Error:', error);
              }finally{  
  
              }
  
      };

      const refreshTok = async () => {
        //  if (accessToken!=''){
          try {
             // console.log(accessToken);
              const str = `Bearer ${refreshToken}`;
              const res = {
              method: 'POST',
              headers: {
                'Authorization': str,
                'Content-Type': 'application/json'
              },
              };
                  
              console.log(res);
                  //if(str!=''){
              const response2 = await fetch(`${API_BASE_URL}/refresh_token`,
                res
              );
              console.log('ResponseRefreshToken:', response2);
             
             
              
              } catch (error) {
                  console.error(error);
              }
              //    }
      }

  return (
    <View style={styles.background}>

        <CustomButton
                    title="Заявки на допуск к объектам"
                    handlePress={()=>{router.push('./requests')}} 
                   // isLoading={upLoading} // Можно добавить индикатор загрузки, если нужно
                  />
        <CustomButton
                      title="Пользователи"
                      handlePress={()=>{router.push('./users')}} 
                  //   isLoad={load} // Можно добавить индикатор загрузки, если нужно
        />
        <CustomButton
                      title="Создать объект"
                      handlePress={()=>{router.push('./create_obj')}} 
                  //   isLoad={load} // Можно добавить индикатор загрузки, если нужно
        />
        <CustomButton
                      title="Объекты"
                      handlePress={()=>{router.push('./objs')}} 
                  //   isLoad={load} // Можно добавить индикатор загрузки, если нужно
        />
        <CustomButton
                      title="Справочник организаций"
                      handlePress={()=>{router.push('./organizations')}} 
                  //   isLoad={load} // Можно добавить индикатор загрузки, если нужно
        />
        <CustomButton
                      title="Тест для оффлайн работы"
                      handlePress={()=>{router.push('./../objs/load_objs_WM')}} 
                  //   isLoad={load} // Можно добавить индикатор загрузки, если нужно
        />
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: "white",
    flex: 1,
    justifyContent: 'center'
    },
});


