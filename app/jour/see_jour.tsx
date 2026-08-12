import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
//import DropdownComponent2 from '@/components/list_categories';
//import Calendar from '@/components/Calendar+';
import CustomButton from '@/components/CustomButton';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../config/api';
//import * as FileSystem from 'expo-file-system';
//import { Image } from 'expo-image';
//import * as MediaLibrary from 'expo-media-library';
//import * as Sharing from 'expo-sharing';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useColorGray, useColorText } from '@/hooks/useColorText';
import { Dimensions } from 'react-native';

export type SystemGET = {
  serialNumber: number;
  iiNumber: string;
  subObject: string;
  systemName: string;
  description: string;
  commentStatus: string; 
  startDate: string;
  endDatePlan: string;
  endDateFact: string;
  commentCategory: string;
  commentExplanation: string;
  codeCCS: string;
  executor: string;//исполнитель 
}
const { width, height } = Dimensions.get('window');
const DetailsScreen = () => {
  const BOTTOM_SAFE_AREA = Platform.OS === 'android' ? StatusBar.currentHeight : 0;
  const colorText = useColorText();
  const colorGray = useColorGray();
  const {codeCCS} = useLocalSearchParams();//получение кода ОКС 
  const {capitalCSName} = useLocalSearchParams();//получение наименование ОКС 
  const {post} = useLocalSearchParams();//получение Id замечания
  console.log(post, 'commentId post');
  const [inputHeight, setInputHeight] = useState(42);

  const [accessToken, setAccessToken] = useState<any>('');

  const fontScale = useWindowDimensions().fontScale;

  const ts = (fontSize: number) => {
    return (fontSize / fontScale)};
const textInputRef = useRef<TextInput>(null);
  const [serNumber, setSerNumber] = useState<string>('');
  const [subObj, setSubObj] = useState<string>('');//подобъект
  const [systemN, setSystemN] = useState<string>('');//система
  const [comment, setComment] = useState<string>('');//содержание замечания
  const [commentStat, setCommentStat] = useState<string>('');//статус замечания
  const [organisation, setOrganisation] = useState<string>('');//organisation где работает сотрудник
  const [fullName, setFullName] = useState<string>('');//фио сотрудника

  const bufCommentStat = commentStat;//хранит статус замечания из бд, чтобы вывести его в случае отмены выбранной даты устранения (изначально пустой)
  const [date, setDate] = useState<string>('');

  const [statusReq, setStatusReq] = useState<boolean>(false);//для передачи даты после запроса
  const [startReq, setStartReq] = useState<boolean>(true);//для вызова getComment только при первом получении post
  
  const getToken = async () => {
    try {
        const token = await SecureStore.getItemAsync('accessToken');
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
    getToken();
    //вызов getComment при получении id Замечания - post
      if (post && startReq && accessToken) {
        setStartReq(false);
        getComment();
      }
    }, [accessToken, post, startReq]);

    async function convertBlobToBase64(blob) {
      const reader = new FileReader();
      const dataPromise = new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);
      return await dataPromise;
    }

  
    const getComment = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/journal/getEntry/`+post,
          {method: 'GET',
            headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }}
        );
        console.log('responseGetEntry:', response)
        const json = await response.json();
        setSerNumber(''+json.serialNumber.toString());
        console.log('responseGetEntry:',json)
        setDate(json.date);
        setSubObj(json.subObject);
        setSystemN(json.system);
        setComment(json.description);
        setOrganisation(json.organisation);
        setFullName(json.user);
       // setCode(json.capitalCS);{/**Если это код окс */}
        
      } catch (error) {
        console.error('Ошибка при получении данных:', error);
        setStatusReq(false);
      } finally {
        setStatusReq(true);
      }
    };


  return (

    <ScrollView>
      <View style={[styles.container, {minHeight: Dimensions.get('window').height-BOTTOM_SAFE_AREA-54}]}>
        
        <View style={{flex: 1, alignItems: 'center'}}>

          <View style={{flexDirection: 'row', width: '98%', marginBottom: 0 }}>
            <View style={{width: '40%', alignItems: 'center'}}>
            <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>№</Text>
            </View>

            <View style={{width: '60%', alignItems: 'center'}}>
            <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center'}}>Дата работы</Text>
            </View>
          </View>

          <View style={{flexDirection: 'row', width: '98%', marginBottom: 0 }}>
             
            <View style={{width: '40%', alignItems: 'center'}}>
            <TextInput
            style={[styles.input, {fontSize: ts(14), marginTop: 6, width: '50%', color: colorGray, borderColor: colorGray}]}
            //placeholder="№ акта ИИ"
            placeholderTextColor="#111"
            value={serNumber}
            editable={false}
            />
            </View>

          {/*}  <View style={{width: '20%', alignItems: 'flex-end'}}>
            <TextInput
            style={[styles.input, {fontSize: ts(14), marginTop: 6}]}
            placeholderTextColor="#111"
            value={numberII}
            editable={false}
            />
            </View>*/}

            <View style={{width: '60%', alignItems: 'center'}}>
            <TextInput
            style={[styles.input, {fontSize: ts(14), marginTop: 6, lineHeight: ts(19), color: colorGray, borderColor: colorGray}]}
            placeholderTextColor="#111"
            value={date}//должна быть дата
            multiline
            editable={false}
            maxLength={45}
            />
            </View>

          </View>  

           <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Подобъект</Text>
            <TextInput
            style={[styles.input, {fontSize: ts(14), marginTop: 6, lineHeight: ts(19), color: colorGray, borderColor: colorGray}]}
            placeholderTextColor="#111"
            value={subObj}
            multiline
            editable={false}
            maxLength={45}
            />
            
            
          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Система</Text>
          <TextInput
            style={[styles.input, {fontSize: ts(14), lineHeight: 19, color: colorGray, borderColor: colorGray }]}
            placeholderTextColor="#111"
            value={systemN}
            multiline
            editable={false}
          />     
          
          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Краткое описание работ и условия выполнения</Text>
          <TextInput
          ref={textInputRef}
                  style={[
            styles.input, 
            {
              height: 'auto',
              minHeight: 42,
              maxHeight: 250,
              fontSize: ts(14), color: colorGray, borderColor: colorGray,
              
           //   textAlignVertical: 'top'
            }
            
          ]}
      /*    autoFocus
            onFocus={() => {
                textInputRef.current?.setNativeProps({
                selection: { start: 0, end: 0 }
                });
            }}*/
           placeholderTextColor="#111"
            multiline
            value={comment}
          />

          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Ответственное лицо</Text>
          <TextInput
            style={[styles.input, {fontSize: ts(14), lineHeight: ts(22),
                alignContent: 'center',
                textAlignVertical: 'center', color: colorGray, borderColor: colorGray, }]}
            placeholderTextColor="#111"
            value={fullName}
            multiline
            editable={false}
          />  
          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Организация</Text>
          <TextInput
            style={[styles.input, {fontSize: ts(14), lineHeight: ts(22),
                alignContent: 'center',
                textAlignVertical: 'center', color: colorGray, borderColor: colorGray, }]}
            placeholderTextColor="#111"
            value={organisation}
            multiline
            editable={false}
          />  
       
        </View> 
        <View style={{ paddingBottom: BOTTOM_SAFE_AREA + 20}}>
          <PermissionGuard required='JOURNAL_EDIT'>
           <CustomButton title='Редактировать' handlePress ={() => router.replace({pathname: '/jour/change_jour', 
            params: {
              serialNumb: serNumber,
              subobj: subObj,
              system: systemN,
              comment: comment,
              date: date,
              id: post,
              codeCCS: codeCCS, 
              capitalCSName: capitalCSName,
              name: fullName,
              org: organisation
            }})} />
           </PermissionGuard>
        </View>
      </View>
    </ScrollView>
  );
}
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    width: '96%',
    height: 42,
    paddingVertical: 'auto',
    color: '#B3B3B3',
    textAlign: 'center',
    marginBottom: 20,
  },
  image: {
    //width: '100%',
    height: 42,
    borderRadius: 8,
    //justifyContent: 'center'
    //alignItems: 'center',
    //left: 38
  },
  imageModal: {
    height: height,
    width: width,
    borderRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Полупрозрачный фон
    
  },
  modalContent: {
    width: '100%',
    height: '100%',
    padding: 5,
    //backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    
  },
});

export default DetailsScreen;