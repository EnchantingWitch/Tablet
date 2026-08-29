import { brand } from '@/constants/Colors';
import DateInputWithPicker from '@/components/CalendarOnWrite';
import CustomButton from '@/components/CustomButton';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Platform, StatusBar, Text, TextInput, useWindowDimensions, View } from 'react-native';
//import { Video } from 'react-native-video';
import ListOfSubobj from '@/components/ListOfOrganizations';
//import ListOfSubobj from '@/components/ListOfSubobj';
import ListOfSystem from '@/components/ListOfSystem';
import { Structure } from '../(tabs)/structure';
import { API_BASE_URL } from '../../config/api';
//import { setSeconds } from 'date-fns';
import { useColorGray, useColorText } from '@/hooks/useColorText';
import * as SecureStore from 'expo-secure-store';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { styles } from '../notes/create_note';
export type ListToDrop = {
  label: string;
  value: string; 
};
const { width, height } = Dimensions.get('window');

export default function CreateNote() {
  const BOTTOM_SAFE_AREA = Platform.OS === 'android' ? StatusBar.currentHeight : 0;
  const colorText = useColorText();
  const colorGray = useColorGray();
  const [listSubObj, setListSubObj] = useState<ListToDrop[]>([]);
  const [listSystem, setListSystem] = useState<ListToDrop[]>([]);
  const [dateWork, setDateWork] = useState<string>('');
  const [upLoading, setUpLoading] = useState(false);
  const [array, setArray] = useState<Structure[]>([]);//данные по структуре
  const [noteListSubobj, setNoteListSubobj] = useState<boolean>(true);//ограничение на получение листа подобъектов только единожды 
  const [noteListSystem, setNoteListSystem] = useState<boolean>(false);//ограничение на отправку листа систем в компонент
  const [exit, setExit] = useState<boolean>(false);//если true нельзя создать замечание, проверка на наличие структуры - работает ли?
  const [statusReq, setStatusReq] = useState(false);//для выпадающих списков, передача данных, когда True
  const [req, setReq] = useState<boolean>(true);//ограничение на получение запроса только единожды 
  const [numberII, setNumber] = useState('');//прописать useEffect
  const [subObject, setSubObject] = useState('');
  const [systemName, setSystemName] = useState(' ');
  const [description, setDescription] = useState('');
  const [disabled, setDisabled] = useState(false); //для кнопки

  const [inputHeight, setInputHeight] = useState(40);
  
  const [bufsystem, setBufsystem] = useState('');
  
  const [accessToken, setAccessToken] = useState<any>('');
  const [fullNameFrAsync, setFullNameFrAsync] = useState<any>('');//переделала на userID

  const fontScale = useWindowDimensions().fontScale;

  const ts = (fontSize: number) => {
    return (fontSize / fontScale)
  };

  console.log(systemName, 'systemName every');

  const {codeCCS} = useLocalSearchParams();//получение codeCCS объекта
  const {capitalCSName} = useLocalSearchParams();
  
  const getToken = async (keyToken, setF) => {
    try {
        const token = await SecureStore.getItemAsync(keyToken);
        //setAccessToken(token);
        if (token !== null) {
            console.log('Retrieved token:', keyToken, '-', token);
            setF(token);
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

  const TwoFunction = () => {
    submitData();
  };

  const getStructure = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/commons/getStructureCommonInf/`+codeCCS,
            {method: 'GET',
              headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }}
          );
          const json = await response.json();
          setArray(json);
          console.log('ResponseSeeStructure:', response);
          console.log(typeof(json));
          console.log('array of subobj',array);
          if (response.status === 200){
            setStatusReq(true);//для выпадающего списка
          }
          if(response.status != 200){setExit(true); }
        } catch (error) {
          console.error(error);
        } 
      };
/*console.log('accessToken', accessToken );
console.log('req', req );
console.log('codeCCS', codeCCS );
console.log('codeCCS && req&& accessToken', codeCCS && req&& accessToken );*/
  useEffect(() => {
    getToken('accessToken', setAccessToken); 
    getToken('userID', setFullNameFrAsync); 
   // getToken('organisation', setOrganisationFrAsync);
    //запрос на структура для получение данных на выпадающие списки и прочее
    if(codeCCS && req&& accessToken){getStructure(); setReq(false); }//вызов происходит только один раз
    if (systemName){
      setBufsystem(systemName);
    }
      if(systemName != bufsystem){
        setBufsystem(systemName);
      console.log(systemName, 'systemName: use if(systemName )');
      if (systemName != ' ' ){
        const filtered = array.filter(item => item.subObjectName === subObject);
        const filteredS = filtered[0].data.filter(item => item.systemName === systemName);
        if(filteredS.length != 0){
          setNumber(filteredS[0].numberII);
        }
        else{
          setNumber('');
          setSystemName(' ');
        }
        setNoteListSystem(false);
      }
      }  
  }, [accessToken, codeCCS, req, noteListSubobj, systemName ]);

 // Формирование списка подобъектов
 useEffect(() => {
  if (array.length > 0) {
    const subObjList = array.map(item => ({
      label: item.subObjectName,
      value: item.subObjectName
    }));
    setListSubObj(subObjList);
  }
}, [array]);

// Формирование списка систем при изменении подобъекта
useEffect(() => {
  if (subObject && array.length > 0) {
    const filtered = array.find(item => item.subObjectName === subObject);
    if (filtered) {
      const systemList = filtered.data.map(system => ({
        label: system.systemName,
        value: system.systemName
      }));
      setListSystem(systemList);
      setSystemName(' '); // Сброс выбранной системы при изменении подобъекта
      setNumber('');
    }
  }
}, [subObject, array]);

console.log(JSON.stringify({
          subObject: subObject,
          system: systemName,
          description: description,
          user: fullNameFrAsync.toString(), //id пользователя
          capitalCS: capitalCSName,
          date: dateWork.replace(/(\d{2})\.(\d{2})\.(\d{4})/, '$3-$2-$1')
        }))

// Обновление номера АИИ и исполнителя при изменении системы
useEffect(() => {
  if (systemName !== ' ' && systemName !== bufsystem && subObject) {
    setBufsystem(systemName);
    const filtered = array.find(item => item.subObjectName === subObject);
    if (filtered) {
      const systemData = filtered.data.find(item => item.systemName === systemName);
      if (systemData) {
        setNumber(systemData.numberII);
      }
    }
  }
}, [systemName, subObject, array]);


  const handleSubObjectChange = (selectedSubObject: string) => {
    setSubObject(selectedSubObject);
    setSystemName(' '); // Явный сброс системы
  }


  const submitData = async () => {
    setDisabled(true);
    if(subObject ==='' && systemName===' '){
      Alert.alert('', 'Заполните поля подобъекта, системы. Если выпадающий список пустой, загрузите структуру.', [
                              {text: 'OK', onPress: () => console.log('OK Pressed')}])
                setDisabled(false);
                 return;
               }

    if(subObject ==='' && systemName===' ' &&  description==='' ){
       Alert.alert('', 'Заполните поля подобъекта, системы, краткое описание и условия выполненных работ.', [
                               {text: 'OK', onPress: () => console.log('OK Pressed')}])
                  setDisabled(false);
                  return;
                }
     // const user = fullNameFrAsync +',' + ' ' +organisationFrAsync;
    try {
      console.log(JSON.stringify({
          subObject: subObject,
          system: systemName,
          description: description,
          user: fullNameFrAsync.toString(), //id пользователя
          capitalCS: capitalCSName,
          date: dateWork//.replace(/(\d{2})\.(\d{2})\.(\d{4})/, '$3-$2-$1')
        }))

      let response = await fetch(`${API_BASE_URL}/journal/createEntry`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subObject: subObject,
          system: systemName,
          description: description,
          user: fullNameFrAsync.toString(), //id пользователя
          capitalCS: codeCCS,
          date: dateWork//.replace(/(\d{2})\.(\d{2})\.(\d{4})/, '$3-$2-$1')
        }),
      });
      console.log('ResponseCreateEntry:', response );

      if(response.status === 200){
        Alert.alert('', 'Краткое описание работ добавлено', [
             {text: 'OK', onPress: () => console.log('OK Pressed')},
          ])
      }
    } catch (error) {
      console.error('Error:', error);
      setDisabled(false);
      Alert.alert('', 'Произошла ошибка при создании краткого описания работ в базу данных: ' + error, [
             {text: 'OK', onPress: () => console.log('OK Pressed')},
          ])
    } finally {
      setDisabled(false);
      setUpLoading(false);
      //  alert(id);
      router.replace({pathname: '/(tabs)/jour', params: { codeCCS: codeCCS, capitalCSName: capitalCSName}});
    }
  }
  console.log(description.length % 10);
  console.log(description.length );

  return (
    <KeyboardAwareScrollView
          style={styles.container}
          enableOnAndroid={true}
          extraScrollHeight={100}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
      <View style={styles.container}>
        <View style={{ flex: 1, alignItems: 'center' }}>

            <View style={{flexDirection: 'column',width: '100%'}}>
                <View style={{width: '50%', alignSelf: 'flex-end' }}>
                    <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>Дата работы</Text>
                </View>
            
                <View style={{width: '65%', alignSelf: 'flex-end' }}>
                    <DateInputWithPicker onChange={(value) => setDateWork(value) }/>
                </View>
            </View>

            <View style={{width: '100%', alignItems: 'center'}}>
              <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8, textAlign: 'center' }}>Подобъект</Text>
              <ListOfSubobj 
                  data={listSubObj} 
                  post={subObject} 
                  title=''
                  label={'Подобъект'}
                  status={statusReq} 
                  onChange={(subobj) => handleSubObjectChange(subobj)}
              />
              
            </View>

          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8, paddingTop: 6 }}>Система</Text>
          <ListOfSystem 
            list={listSystem} 
          /*  title=''
            status={statusReq} 
            label={'Система'}*/
            buf={bufsystem} 
            post={systemName} 
            onChange={(system) => setSystemName(system)}/>

          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Краткое описание и условия выполнения работ</Text>
          <TextInput
            multiline
            onContentSizeChange={e=>{
                setInputHeight(e.nativeEvent.contentSize.height);
            /*  let inputH = Math.max(e.nativeEvent.contentSize.height, 35)
              if(inputH>120) inputH =100
              setInputHeight(inputH)*/
          }}
          maxLength={1000}
          style={[
              styles.input, 
              {
                height: Math.max(42, inputHeight),
               // minHeight: 42, // Минимальная высота
               // maxHeight: 100, // Максимальная высота
                fontSize: ts(14), color: colorGray, borderColor: colorGray
              }
            ]}
            placeholderTextColor={brand.textPrimary}
            onChangeText={setDescription}
            value={description}
          />
          {description.length >=900? 
            <Text style={{ fontSize: ts(11),  color: colorGray, fontWeight: '400', marginTop: -14.6, marginBottom: 16}}>
              Можете ввести еще {1000-description.length}{' '}
              {(1000-description.length) % 10 === 1? <Text>символ</Text>
              : (1000-description.length) % 10 === 2 || (1000-description.length) % 10 === 3 || (1000-description.length) % 10 === 4? <Text>символа</Text>
              : <Text>символов</Text>}
            </Text>
          : '' }

        </View>
      </View>
      <View style={{ paddingBottom: BOTTOM_SAFE_AREA + 20 }}>
            <CustomButton
              title="Сохранить"
              disabled={disabled}
              handlePress={TwoFunction} // Вызов функции отправки данных
            />
      </View>
      
      </KeyboardAwareScrollView>
  );
}