import CustomButton from "@/components/CustomButton";
import FormField from '@/components/FormField';
import { router } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { API_BASE_URL } from '../../config/api';

//const UploadFile =  ()  => {
  export default function UploadFile (){
  const [load, setLoad]= useState<boolean>(false);
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [org, setOrg] = useState('');
  const fontScale = useWindowDimensions().fontScale;

  const ts = (fontSize: number) => {
    return (fontSize / fontScale)};

        useEffect(() => {
          getToken();
            
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

      console.log('acTok', accessToken);

      const createOrg = async () => {
        //  if (accessToken!=''){
          try {
             // console.log(accessToken);
              //const str = `Bearer ${accessToken}`;
              const res = {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                organisationName: org})
              };
                  
              console.log(res);
                  //if(str!=''){
              const response2 = await fetch(`${API_BASE_URL}/organisations/create`,
                res
              );
              console.log('Response/createOrg:', response2);
             
             
              
              } catch (error) {
                  console.error(error);
              }
              finally{
                router.push('./menu');
              }
              //    }
      }

  return (
    <View style={styles.background}>
        <FormField title='Организация' onChange={(value) => setOrg(value)}/>{/** value={} для динамической подгрузки, передавать в компонент и через useEffect изменять, запрос нужен ли? */}



        <CustomButton
                      title="Добавить организацию"
                      handlePress={()=>createOrg()} 
                  //   isLoad={load} // Можно добавить индикатор загрузки, если нужно
        />

    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: "white",
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
    },
});


