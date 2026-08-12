//import Calendar from '@/components/Calendar+';
//import CalendarWithoutDel from '@/components/CalendarWithoutDel';
import CustomButton from '@/components/CustomButton';
//import DropdownComponent2 from '@/components/ListOfCategories';
import ListOfSubobj from '@/components/ListOfOrganizations';
//import ListOfSubobj from '@/components/ListOfSubobj';
import ListOfSystem from '@/components/ListOfSystem';
import { API_BASE_URL } from '../../config/api';
//import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
//import * as FileSystem from 'expo-file-system';
//import { Image } from 'expo-image';
//import * as ImagePicker from 'expo-image-picker';
//import * as MediaLibrary from 'expo-media-library';
import { router, useLocalSearchParams } from 'expo-router';
//import * as Sharing from 'expo-sharing';
import { default as React, useEffect, useState } from 'react';
import { Alert, Dimensions, Platform, StatusBar, Text, TextInput, useWindowDimensions, View } from 'react-native';
//import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useColorGray, useColorText } from '@/hooks/useColorText';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Structure } from '../(tabs)/structure';
import { styles } from '../notes/create_note';

const { width, height } = Dimensions.get('window');

interface Data {
  commentId: number;
  serialNumber: number;
  subObject: string;
  systemName: string;
  description: string;
  commentStatus: string;
  commentCategory: string;
  startDate: string;
  endDatePlan: string;
  endDateFact: string;
  commentExplanation: string;
  iinumber: number;
  UserName: string
}

const EditDataScreen: React.FC = () => {
    const {serialNumb} = useLocalSearchParams();
    const {subobj} = useLocalSearchParams();
    const {system} = useLocalSearchParams();
    const {comment} = useLocalSearchParams();
    const {id} = useLocalSearchParams();
    const {codeCCS} = useLocalSearchParams();
    const {capitalCSName} = useLocalSearchParams();
    const {date} = useLocalSearchParams();
    const {name} = useLocalSearchParams();
    const {org} = useLocalSearchParams();
    const colorText = useColorText();
    const colorGray = useColorGray();
    const [accessToken, setAccessToken] = useState<any>('');
 
    const [array, setArray] = useState<Structure[]>([]);//данные по структуре
    const [listSubObj, setListSubObj] = useState<ListToDrop[]>([]);
    const [listSystem, setListSystem] = useState<ListToDrop[]>([]);
   // const listSubObj = [];//список подобъектов из структуры
    const [noteListSubobj, setNoteListSubobj] = useState<boolean>(true);//ограничение на получение листа подобъектов только единожды 
   // const listSystem = [];//список систем из структуры на соответствующий выбранный подобъект
    const [noteListSystem, setNoteListSystem] = useState<boolean>(false);//ограничение на отправку листа систем в компонент
    const [exit, setExit] = useState<boolean>(false);//если true нельзя создать замечание, проверка на наличие структуры - работает ли?
    const [statusReq, setStatusReq] = useState(false);//для выпадающих списков, передача данных, когда True
    const [req, setReq] = useState<boolean>(true);//ограничение на получение запроса только единожды 
    const [inputHeight, setInputHeight] = useState(42);
    const [bufsubobj, setBufsubobj] = useState(subobj);
    const [bufsystem, setBufsystem] = useState('');

  const [data, setData] = useState<Data | undefined>(undefined);
  const [editing, setEditing] = useState<boolean>(false);
  const [editedSerialNumber, setEditedSerialNumber] = useState<number>(0);
  const [editedSubObject, setEditedSubObject] = useState<string>('');
  const [editedSystemName, setEditedSystemName] = useState<string>('');
  const [editedDescription, setEditedDescription] = useState<string>('');
  const [editedIinumber, setEditedIinumber] = useState<string>('');
  const [editedDate, setEditedDate] = useState<string>('');
  const [status, setStatus] = useState<boolean>(false);
  const [disabled, setDisabled] = useState(false); //для кнопки

  const [updateCom, setUpdateCom] = useState<boolean>(false);//вызов функции запроса после изменения АИИ и исполнителя
  const bufCommentStat = status;//хранит статус замечания из бд, чтобы вывести его в случае отмены выбранной даты устранения (изначально пустой)

  const [organisation, setOrganisation] = useState<string>('');//organisation где работает сотрудник
  const [fullName, setFullName] = useState<string>('');//фио сотрудника

  const fontScale = useWindowDimensions().fontScale;

  const ts = (fontSize: number) => {
    return (fontSize / fontScale)};

    const BOTTOM_SAFE_AREA = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

    useEffect(() => {
      if (codeCCS) {
          setEditedSerialNumber(serialNumb);
          setEditedSubObject(subobj);
          setBufsubobj(subobj);
          setEditedSystemName(system);
          setBufsystem(system);
          setEditedDescription(comment);
          setEditedDate(date);
          setOrganisation(org);
          setFullName(name);
      }
  }, [codeCCS]);
   useEffect(() => {
      if (editedDate) {
          setStatus(true)//для передачи даты
      }
  }, [editedDate]);

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


  const handleSubObjectChange = (selectedSubObject: string) => {
    setEditedSubObject(selectedSubObject);
    setEditedSystemName(' '); // Явный сброс системы
  }

console.log(JSON.stringify({
          subObject: editedSubObject,
          system: editedSystemName,
        }))

  const updateComment = async () => {
    setDisabled(true);
    console.log(JSON.stringify({
          id: id,
          description: editedDescription,
          subObject: editedSubObject,
          system: editedSystemName,
          capitalCS: capitalCSName,
          date: editedDate.replace(/(\d{2})\.(\d{2})\.(\d{4})/, '$3-$2-$1')
        }))
    try {
      let response = await fetch(`${API_BASE_URL}/journal/updateEntry`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id,
          description: editedDescription,
          subObject: editedSubObject,
          system: editedSystemName,
          capitalCS: capitalCSName,
          date: editedDate.replace(/(\d{2})\.(\d{2})\.(\d{4})/, '$3-$2-$1')
        }),
      });
      console.log('updateComment', response);
      if (response.ok) {
        const jsonData: Data = await response.json();
        setData(jsonData);
        setEditing(false);
        //alert('Данные успешно сохранены!');
         Alert.alert('', 'Данные обновлены', [
                                      {text: 'OK', onPress: () => console.log('OK Pressed')}])
      } else {
        throw new Error('Не удалось сохранить данные.');
      }
    } catch (error) {
      setDisabled(false);
      console.error('Ошибка при сохранении данных:', error);
      Alert.alert('', 'Произошла ошибка при обновлении данных: ' + error, [
                   {text: 'OK', onPress: () => console.log('OK Pressed')},
                ])
    } finally{
      setDisabled(false);
      router.replace({pathname: '/(tabs)/jour', params: {codeCCS: codeCCS, capitalCSName: capitalCSName }});
    }

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

  const deleteNote = async () => {
    setDisabled(true);
    try {
      let response = await fetch(`${API_BASE_URL}/journal/deleteEntry/`+id, {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
      });
    console.log('ResponseDeleteEntry:', response);
    if (response.status === 200) {
      Alert.alert('', 'Запись удалена.', [
        {text: 'OK', onPress: () => console.log('OK Pressed')}])
    }
  } catch (err) {
    Alert.alert('', 'Произошла ошибка при удалении записи: ' + err, [
                 {text: 'OK', onPress: () => console.log('OK Pressed')},
              ])
    setDisabled(false);
  } finally {
    setDisabled(false);
    router.replace({pathname: '/(tabs)/jour', params: {codeCCS: codeCCS, capitalCSName: capitalCSName }});
  }
  }

  useEffect(() => {
    getToken();
    //запрос на структура для получение данных на выпадающие списки и прочее
    if(codeCCS && req && accessToken){getStructure(); setReq(false); console.log('8'); }//вызов происходит только один раз
    
    
    if (updateCom){
      updateComment();
    }
    if(editedSystemName){
      setBufsystem(editedSystemName);
    }
 
    if(editedSystemName!= ' ' && editedSubObject!= '' ){
      
      if(editedSystemName != bufsystem){
        setBufsystem(editedSystemName);
      console.log(editedSystemName, 'systemName: use if(systemName )');
      if (editedSystemName != ' ' ){
        const filtered = array.filter(item => item.subObjectName === editedSubObject);
        //console.log(filtered[0].data);
        if(filtered.length != 0){
          const filteredS = filtered[0].data.filter(item => item.systemName === editedSystemName);
        // console.log(filteredS[0].numberII, 'filteredS[0].numberII');
          console.log(filteredS.length, 'filteredS.length');
          console.log(filteredS, 'filteredS');
          if(filteredS.length != 0){
            console.log('1');
            setEditedIinumber(filteredS[0].numberII);
          }
          else{
            setEditedIinumber('');
            setEditedSystemName(' ');
            setEditedSubObject('');
          }
          setNoteListSystem(false);
      }
      }
      }  
     
    }
      }, [ accessToken, codeCCS, req, statusReq, noteListSubobj, editedSubObject, editedSystemName, updateCom, editedSystemName]);

   // Для подобъектов
useEffect(() => {
  if (array.length > 0) {
    const buf = array.map(item => ({label: item.subObjectName, value: item.subObjectName}));
    setListSubObj(buf);
    setStatusReq(true);
  }
}, [array]);

// Для систем
useEffect(() => {
  if (editedSubObject && array.length > 0) {
    const filtered = array.find(item => item.subObjectName === editedSubObject);
    if (filtered) {
      const systemList = filtered.data.map(system => ({
        label: system.systemName,
        value: system.systemName
      }));
      setListSystem(systemList);
    }
  }
}, [editedSubObject, array]);

  return (
     <KeyboardAwareScrollView
      style={styles.container}
      enableOnAndroid={true}
      extraScrollHeight={100}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={[styles.container]}>

        <View style={{ flex: 1, alignItems: 'center' }}> 

          <View style={{flexDirection: 'row', width: '98%', marginBottom: 0 }}>
            <View style={{width: '40%', alignItems: 'center'}}>
              <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>№</Text>
            </View>
            <View style={{width: '60%', alignItems: 'center'}}>
              <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center'}}>Дата работы</Text>
            </View>
          </View>

          <View style={{flexDirection: 'row', width: '96%', justifyContent: 'space-between' }}>
             
            <View style={{width: '40%', alignItems: 'center', paddingTop: 4.5}}>
              <TextInput
              style={[styles.input, {fontSize: ts(14),  width: '50%', color: colorGray, borderColor: colorGray}]}
              //placeholder="№ акта ИИ"
              placeholderTextColor="#111"
              value={editedSerialNumber.toString()}
              editable={false}
              />
            </View>

            <View style={{width: '60%',}}>
               <TextInput
            style={[styles.input, {fontSize: ts(14), marginTop: 6, width: '100%', color: colorGray, borderColor: colorGray}]}
            //placeholder="№ акта ИИ"
            placeholderTextColor="#111"
            value={editedDate}
            editable={false}
            />
          {/*}    <DateInputWithPicker diseditable={true} statusReq={status} post={editedDate} onChange={(value)=>setEditedDate(value)}/>*/}

            </View>

          </View>  

          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center', marginBottom: 8 }}>Подобъект</Text>
          <ListOfSubobj 
                data={listSubObj} 
                post={editedSubObject} 
                status={statusReq} 
                title=''
                label={'Подобъект'}
                onChange={(subobj) => handleSubObjectChange(subobj)}
            />
            
          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Система</Text>
          <ListOfSystem
              list={listSystem} 
             /* title=''
              label={'Подобъект'}
              status={statusReq} */
              buf={bufsystem}
              post={editedSystemName} 
              onChange={(system) => setEditedSystemName(system)}
          />
          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Краткое описание и условия выполнения работ</Text>
          {/*}  <TextInput
            style={[styles.input,  {flex: 1, height: Math.max(42, inputHeight), fontSize: ts(14) }]} // Минимальная высота 40
                        
            placeholderTextColor="#111"
            value={editedDescription}
            onChangeText={setEditedDescription}
            multiline
            onContentSizeChange={e=>{
              setInputHeight(e.nativeEvent.contentSize.height);}}
          />*/}  
          <TextInput
            style={[styles.input, { color: colorGray, borderColor: colorGray,
                fontSize: ts(14),
                minHeight: 42, // минимальная высота
                //maxHeight: 100, // максимальная высота (можно увеличить при необходимости)
                height: inputHeight // динамическая высота
            }]}
            maxLength={1000}
            placeholderTextColor="#111"
            value={editedDescription}
            onChangeText={setEditedDescription}
            multiline
            onContentSizeChange={(e) => {
                // Добавляем небольшой отступ к высоте контента
                const newHeight = e.nativeEvent.contentSize.height ;
                setInputHeight(Math.min(Math.max(newHeight, 42), ));
            }}
            />
            {editedDescription.length >=900? 
                        <Text style={{ fontSize: ts(11),  color: colorGray, fontWeight: '400', marginTop: -14.6, marginBottom: 16}}>
                          Можете ввести еще {1000-editedDescription.length}{' '}
                          {(1000-editedDescription.length) % 10 === 1? <Text>символ</Text>
                          : (1000-editedDescription.length) % 10 === 2 || (1000-editedDescription.length) % 10 === 3 || (1000-editedDescription.length) % 10 === 4? <Text>символа</Text>
                          : <Text>символов</Text>}
                        </Text>
                      : '' }

          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Ответственное лицо</Text>
          <TextInput
            style={[styles.input, {fontSize: ts(14), lineHeight: ts(22), color: colorGray, borderColor: colorGray,
                alignContent: 'center',
                textAlignVertical: 'center', }]}
            placeholderTextColor="#111"
            value={fullName}
            multiline
            editable={false}
          />  
          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Организация</Text>
          <TextInput
            style={[styles.input, {fontSize: ts(14), lineHeight: ts(22), color: colorGray, borderColor: colorGray,
                alignContent: 'center',
                textAlignVertical: 'center', }]}
            placeholderTextColor="#111"
            value={organisation}
            multiline
            editable={false}
          />  
        </View>
      </View>
            <View style={{ paddingBottom: BOTTOM_SAFE_AREA + 20 }}>

                <CustomButton
                  disabled={disabled}
                  title="Сохранить изменения"
                  handlePress={updateComment} />
                  
                  <PermissionGuard required='JOURNAL_DELETE'>
                    <CustomButton
                    title="Удалить"
                    disabled={disabled}
                    handlePress={deleteNote} />
                  </PermissionGuard>
                </View>


      </KeyboardAwareScrollView>
  );
};

export default EditDataScreen;