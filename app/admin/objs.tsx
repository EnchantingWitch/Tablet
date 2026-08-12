import HeaderForTabs from '@/components/HeaderForTabs';
import { } from '@/components/Themed';
import { useColorSkyBlueCarpet, useColorText } from '@/hooks/useColorText';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalSearchParams, useNavigation, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { default as React, useEffect, useState } from 'react';
import { FlatList, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { API_BASE_URL } from '../../config/api';

type Object = {
  capitalCSName: string;
  codeCCS: string;
};

export default function TabOneScreen() {
  const BOTTOM_SAFE_AREA =
    Platform.OS === "android" ? StatusBar.currentHeight : 0;
const fontScale = useWindowDimensions().fontScale;
const ts = (fontSize: number) => {
        return (fontSize / fontScale)};
const colorText = useColorText();
const router = useRouter();

const [isLoading, setLoading] = useState(true);
const [accessToken, setAccessToken] = useState('');
const [data, setData] = useState<Object[]>([]);
const {token}=useGlobalSearchParams();

//const [isGetTok, setIsGetTok] = useState(true);
const navigation = useNavigation();
    
  useEffect(() => {
        navigation.setOptions({
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.replace('/admin/menu')}>
              <Ionicons name='home-outline' size={25} style={{alignSelf: 'center'}}/>
            </TouchableOpacity>
          ),
        });
  }, [navigation]);
      
        useEffect(() => {
          if (token){setAccessToken(token);}
        }, [token]);

        useEffect(() => {
            if(accessToken === ''){getToken();}
            if (accessToken){getObjects();}
               
          }, [ accessToken]);

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

  
  const getObjects = async () => {
    try {
      const userID = await SecureStore.getItemAsync('userID');
      const response = await fetch(`${API_BASE_URL}/capitals/getAll`,
        {method: 'GET',
          headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }}
      );
      console.log('getAll',response)
      
      const json = await response.json();
      setData(json);
      console.log('getAll json',json)
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

 
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <HeaderForTabs capitalCSName='Объекты' path='/admin/menu'/>
    <View style={styles.container}>
   
   <View style={{paddingBottom: BOTTOM_SAFE_AREA + 20, alignItems: 'center'}}>
    <FlatList
        style={{width: '100%'}}
        data={data}
        keyExtractor={({codeCCS}) => codeCCS}
        renderItem={({item}) => (
          <TouchableOpacity onPress={() =>{router.push({pathname: '/admin/change_obj', params: 
          { capitalCSId: item.capitalCSId, 
            codeCCS: item.codeCCS, 
            capitalCSName: item.capitalCSName, 
            ciwexecutor: item.ciwexecutor, 
            ciwsupervisor: item.ciwsupervisor, 
            customer: item.customer,
            customerSupervisor: item.customerSupervisor,
            cwexecutor: item.cwexecutor,
            cwsupervisor: item.cwsupervisor,
            locationRegion: item.locationRegion,
            objectType: item.objectType
          }})}}>
                        <View style={{ backgroundColor: useColorSkyBlueCarpet(0.4), flexDirection: 'row', width: '100%', height: 37,  justifyContent: 'center', marginBottom: '5%', borderRadius: 8}}>
                
                            <View style={{width: '98%', justifyContent: 'center',}}>
                            <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'left' }}>{item.capitalCSName}</Text>
                            </View>
                                           
                        </View>
          </TouchableOpacity>             
       )}
       /> 
    </View>
   </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    flex: 1,
    alignSelf: 'center',
    width: '96%',
    height: '100%',
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
