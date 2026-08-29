import { brand } from '@/constants/Colors';
import HeaderForTabs from '@/components/HeaderForTabs';
import { useColorSkyBlueCarpet, useColorText } from '@/hooks/useColorText';
//import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../config/api';
//import { useNavigation, useRouter } from 'expo-router';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, StatusBar, Text, TouchableWithoutFeedback, useWindowDimensions, View } from 'react-native';
 
type Reqs = {
  id: number;//айди заявки
  userId: number;
  fullName: string;
  username: string;
  description: string;
  organisation: string;
  role: string;
  creationTime:string; 
  objectToAdd:[{
      capitalCSName: string,
      codeCCS: string,
}],
};

const DirectionLayout = () => {
 const BOTTOM_SAFE_AREA =
    Platform.OS === "android" ? StatusBar.currentHeight : 0;
  const router = useRouter();
  const colorText = useColorText();
  const colorSkyBlue = useColorSkyBlueCarpet(0.4);
  const fontScale = useWindowDimensions().fontScale;

  const ts = (fontSize: number) => {
    return (fontSize / fontScale)};
{/*}
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
  */}

  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState<Reqs[]>([]);

  const getReqs = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const response = await fetch(`${API_BASE_URL}/admin/getApplications`,
        {method: 'GET',
          headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }}
      );
      console.log('responseGetApplications', response);
      const json = await response.json();
      setData(json);
      console.log(json);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getReqs();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <HeaderForTabs capitalCSName='Заявки на допуск к объектам' path='/admin/menu'/>
      <View style={{
        flex: 1, alignItems: 'center'
        // justifyContent: 'center', flexDirection: 'row', height: 80, padding: 20, alignSelf: 'flex-start', alignItems: 'stretch', justifyContent: 'space-around',
      }}>
          
          <View style={{ flexDirection: 'row', width: '100%', height: 32, paddingTop: 6, justifyContent: 'space-between' }}>
            <View style={{width: '43%', justifyContent: 'center'}}>
                                  <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'center' }}>ФИО пользователя</Text>
                                  </View>
                                  <View style={{width: '35%', justifyContent: 'center'}}>
                                  <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'center' }}>Организация</Text>
                                  </View>
                                  <View style={{width: '22%', justifyContent: 'center'}}>
                                  <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'center' }}>Дата</Text>
                                  </View>
           {/*} <Text style={{ fontSize: ts(14), color: brand.textPrimary }}>Дата заявки</Text>*/}
          </View>

          <View style={{ flex: 15, marginTop: 12}}>

               { isLoading ? (
              <ActivityIndicator />
            ) : (
<View style={{paddingBottom: BOTTOM_SAFE_AREA + 20, alignItems: 'center'}}>
              <FlatList
                      style={{width: '98%'}}
                      data={data}
                      keyExtractor={({id}) => id}
                      renderItem={({item}) => (
             
                  <TouchableWithoutFeedback onPress={() =>{ router.push({pathname: '/admin/acpt_req', params: {idReq: item.id }})}  }>
                  <View style={{ backgroundColor: colorSkyBlue, flexDirection: 'row', width: '100%', height: 37, justifyContent: 'center', marginBottom: '5%', borderRadius: 8}}>
          
                      <View style={{width: '43%', justifyContent: 'center', paddingLeft: 5}}>
                      <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'left' }}>{item.fullName}</Text>
                      </View>
          
                      <View style={{width: '35%', marginStart: 0, justifyContent: 'center'}}>
                      <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'center' }}>{item.organisation}</Text>
                      </View>
                      
                      <View style={{width: '22%', marginStart: 0, justifyContent: 'center'}}>
                      <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'center' }}>{item.creationTime}</Text>
                      
                      </View>
                  </View>
                  </TouchableWithoutFeedback>
 )}
 />
 </View>
       
            )}
        
          </View>

      </View >
    </View >

  );
};

export default DirectionLayout;

