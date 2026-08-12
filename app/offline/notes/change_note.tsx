import Calendar from '@/components/Calendar+';
import CalendarWithoutDel from '@/components/CalendarWithoutDel';
import CustomButton from '@/components/CustomButton';
import DropdownComponent2 from '@/components/ListOfCategories';
import ListOfSubobj from '@/components/ListOfOrganizations';
import ListOfStatusNotes from '@/components/ListOfStatusNotes';
//import ListOfSubobj from '@/components/ListOfSubobj';
import ListOfSystem from '@/components/ListOfSystem';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useColorGray, useColorText } from '@/hooks/useColorText';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Modal, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Animated, {
  clamp,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { Structure } from '../../(tabs)/structure';
import { API_BASE_URL } from '../../../config/api';
import { styles } from './create_note';

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
    const colorText = useColorText();
    const colorGray = useColorGray();
    const {serialNumb} = useLocalSearchParams();
    const {numberii} = useLocalSearchParams();
    const {subobj} = useLocalSearchParams();
    const {system} = useLocalSearchParams();
    const {comment} = useLocalSearchParams();
    const {status} = useLocalSearchParams();
    const {executor} = useLocalSearchParams();
    const {startD} = useLocalSearchParams();
    const {planD} = useLocalSearchParams();
    const {factD} = useLocalSearchParams();
    const {category} = useLocalSearchParams();
    const {explan} = useLocalSearchParams();
    const {id} = useLocalSearchParams();
    const {codeCCS} = useLocalSearchParams();
    const {capitalCSName} = useLocalSearchParams();
    const {lastViewedNote} = useLocalSearchParams();

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
    const [statusReqPhoto, setStatusReqPhoto] = useState(false);//для определения метода put или delete для фото, было ли фото уже в бд или нет
    const [changePhoto, setChangePhoto] = useState(false);//для определения метода post на фото, равен true, если было выбрано фото через selectPhoto
    const [req, setReq] = useState<boolean>(true);//ограничение на получение запроса только единожды 
    const [statusDel, setStatusDel] = useState<boolean>(false);//
    const [inputHeight, setInputHeight] = useState(42);
    const [bufsubobj, setBufsubobj] = useState(subobj);
    const [bufsystem, setBufsystem] = useState('');
    const [idPhoto, setIdPhoto] = useState();

  const [data, setData] = useState<Data | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState<boolean>(false);
  const [editedSerialNumber, setEditedSerialNumber] = useState<number>(0);
  const [editedSubObject, setEditedSubObject] = useState<string>('');
  const [editedSystemName, setEditedSystemName] = useState<string>('');
  const [editedDescription, setEditedDescription] = useState<string>('');
  const [editedCommentStatus, setEditedCommentStatus] = useState<string>('');
  const [editedCommentCategory, setEditedCommentCategory] = useState<string>('');
  const [editedStartDate, setEditedStartDate] = useState<string>('');
  const [editedEndDatePlan, setEditedEndDatePlan] = useState<string>('');
  const [editedEndDateFact, setEditedEndDateFact] = useState<string>('');
  const [editedCommentExplanation, setEditedCommentExplanation] = useState<string>('');
  const [editedUserName, setEditedUserName] = useState<string>('editedUserName');
  const [editedIinumber, setEditedIinumber] = useState<string>('');
  const [editedExecut, setExecut] = useState<string>('');//исполнитель
  const [noteData, setNoteData] = useState<boolean>(true);
  const [updateCom, setUpdateCom] = useState<boolean>(false);//вызов функции запроса после изменения АИИ и исполнителя
  const bufCommentStat = status;//хранит статус замечания из бд, чтобы вывести его в случае отмены выбранной даты устранения (изначально пустой)
  const [wayToGetPhoto, setWayToGetPhoto] = useState<number>(0); //2- фото, 1 - камера
  const [modalVisible, setModalVisible] = useState(false);//для открытия фото полностью
  const [statusActivityIndicator, setStatusActivityIndicator] = useState(true);
  const [disabled, setDisabled] = useState(false); //для кнопки
  const [role, setRole] = useState<string>('');

  const [commentStat1, setCommentStat1] = useState('Устранено')//измененный после перевыбора
  const [commentStat2, setCommentStat2] = useState('Устранено')//оригинальный

  const fontScale = useWindowDimensions().fontScale;

  const ts = (fontSize: number) => {
    return (fontSize / fontScale)};

    const BOTTOM_SAFE_AREA = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

    useEffect(() => {
      if (codeCCS) {
          setEditedSerialNumber(serialNumb);
          setEditedIinumber(numberii);
          setEditedSubObject(subobj);
          setBufsubobj(subobj);
          setEditedSystemName(system);
          setBufsystem(system);
          setEditedDescription(comment);
          setEditedCommentStatus(status);
          setExecut(executor);
          setEditedStartDate(startD);
          setEditedEndDatePlan(planD);
          setEditedEndDateFact(factD);
          setEditedCommentCategory(category);
          setEditedCommentExplanation(explan);
          // ... остальные setState
      }
  }, [codeCCS]);

  console.log('startD дата выдачи',startD)
  console.log('editedStartDate дата выдачи',editedStartDate)

 
  const [singlePhoto, setSinglePhoto] = useState<any>('');

  useEffect(() => {
      if (wayToGetPhoto === 1) {
        selectCamera();
      }
      if (wayToGetPhoto === 2) {
        selectPhoto();
      }
    }, [wayToGetPhoto]);
  
      useEffect(() => {
      if (singlePhoto === '') {
        setWayToGetPhoto(0);
      }
    }, [singlePhoto]);

  const getToken = async (key: string, setF) => {
      try {
          const token = await SecureStore.getItemAsync(key);
          //setAccessToken(token);
          if (token !== null) {
              console.log('Retrieved token:', token);
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

  const selectPhoto = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({});
      console.log('res : ' + JSON.stringify(res));
      if (!res.canceled && res.assets[0].uri) {
        setSinglePhoto(res.assets[0].uri);
        setChangePhoto(true);
      }
    } catch (err) {
      setSinglePhoto('');
      setChangePhoto(false);
      if (ImagePicker.Cancel(err)) {
        alert('Canceled');
      } else {
        alert('Unknown Error: ' + JSON.stringify(err));
        throw err;
      }
    }
  };

  const selectCamera = async () => {
      // Opening Document Picker to select one file
      try {
        const res = await ImagePicker.launchCameraAsync({
        });
  
        // Printing the log realted to the file
        console.log('res : ' + JSON.stringify(res));
        if (res.assets && res.assets[0].uri) {
          setSinglePhoto(res.assets[0].uri)
          setChangePhoto(true);
        }
        // Setting the state to show single file attributes
  
      } catch (err) {
        setSinglePhoto('');
        setChangePhoto(false);
        // Handling any exception (If any)
        if (ImagePicker.Cancel(err)) {
          // If user canceled the document selection
          alert('Canceled');
        } else {
          // For Unknown Error
          alert('Unknown Error: ' + JSON.stringify(err));
          throw err;
        }
      }
  
  
    };

  const cancelPhoto = async () => {
    setSinglePhoto('');
    setWayToGetPhoto(0);
  };

   const chooseCameraOrPhoto =  () => {
         Alert.alert('', 'С помощью чего хотите добавить фотографию?', [
               //{text: 'Отмена', onPress: () => console.log('OK Pressed')},
               {text: 'Камера', onPress: () => setWayToGetPhoto(1)}, 
               {text: 'Альбом', onPress: () => setWayToGetPhoto(2)}
            ],)
    };

  console.log(statusReqPhoto === false && singlePhoto != '', 'statusReqPhoto === false && singlePhoto != ');
  console.log(statusReqPhoto === true && singlePhoto === '', 'statusReqPhoto === true && singlePhoto === ');
  console.log(changePhoto === true && statusReqPhoto === true, 'changePhoto === true && statusReqPhoto === true');
  console.log(statusDel === true, 'statusDel === true');
  console.log(updateCom, 'UpdateCom');
  console.log(statusReqPhoto, 'statusReqPhoto');
  console.log(singlePhoto, 'singlePhoto');
  console.log(changePhoto, 'changePhoto');

  const handleSaveClick = async () => {
    
    if (statusReqPhoto === false && singlePhoto != ''){postPhoto();}
    if (statusReqPhoto === true && singlePhoto === ''){deletePhoto();}
    if (changePhoto === true && statusReqPhoto === true){
        deletePhoto();
        //if (statusDel === true){postPhoto;}//скорее всего надо в useEffect перенести
    }
    updateComment();
  }

const json = JSON.stringify({
        commentId: parseInt(id, 10),
        serialNumber: parseInt(editedSerialNumber, 10),
        subObject: editedSubObject,
        systemName: editedSystemName,
        description: editedDescription,
        commentStatus: editedCommentStatus,
        commentCategory: editedCommentCategory,
        startDate: editedStartDate,
        endDatePlan: editedEndDatePlan,
        endDateFact: editedEndDateFact,
        commentExplanation: editedCommentExplanation,
        iiNumber: editedIinumber,
        executor: editedExecut,
      });
      console.log(json);

console.log('if',editedSubObject ==='' || (editedSystemName===''|| editedSystemName===' ') ||  editedDescription==='' || category==='')
  const updateComment = async () => {

    setDisabled(true);
    if(editedSubObject ==='' || (editedSystemName===''|| editedSystemName===' ') ||  editedDescription==='' || category===''){
          Alert.alert('', 'Заполните поля подобъекта, системы, содержания замечания, категории.', [
                                  {text: 'OK', onPress: () => console.log('OK Pressed')}])
                     setDisabled(false);
                     return;
                   }

    try {
      let response = await fetch(`${API_BASE_URL}/comments/updateComment/`+id, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: json,
      });
      console.log('updateComment', response);
      if (response.ok) {
        const jsonData: Data = await response.json();
        setData(jsonData);
        setEditing(false);
        //alert('Данные успешно сохранены!');
         Alert.alert('', 'Данные по замечанию обновлены', [
                                      {text: 'OK', onPress: () => console.log('OK Pressed')}])
      } else {
        throw new Error('Не удалось сохранить данные.');
      }
    } catch (error) { setDisabled(false);
      console.error('Ошибка при сохранении данных:', error);
    } finally{ setDisabled(false);
    //  if (statusReqPhoto === false && singlePhoto === ''){
      router.replace({pathname: '/(tabs)/two', params: {codeCCS: codeCCS, capitalCSName: capitalCSName, lastViewedItemN: lastViewedNote }});}
 //   }

  };

  /*if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }*/

    async function convertBlobToBase64(blob) {
      const reader = new FileReader();
      const dataPromise = new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);
      return await dataPromise;
    }

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

    //getPhoto
    try {
      const response = await fetch(`${API_BASE_URL}/comments/getPhoto/` + id,
        {method: 'GET',
          headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }}
      );
      
      console.log('ResponseGetPhoto:', response);
        // 1️⃣ Получаем MIME-тип (например, "image/jpeg")
  const contentType = response.headers.get('content-type');
  console.log('Content-Type:', contentType);

  const blob = await response.blob();
  const base64 = await convertBlobToBase64(blob);
  const base64Data = base64.split(',')[1];
   /*  const byteArray = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));*/
  //console.log(base64);

if (contentType != null){
      setSinglePhoto(`data:${contentType};base64,${base64Data}`);
      console.log(singlePhoto);
      setStatusReqPhoto(true);}
      setStatusActivityIndicator(false);//чтобы не крутился индикатор загрузки у фото
      
    } catch (error) {
      console.error('Ошибка при получении фото:', error);
      setStatusActivityIndicator(false);//чтобы не крутился индикатор загрузки у фото
      //setStatusReq(false);
    } finally {

    }
  };

   const deletePhoto = async () => {
    setDisabled(true);
    try {
      let response = await fetch(`${API_BASE_URL}/comments/removePhoto/`+id, {
          method: "DELETE",
          //redirect: "follow",
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          //без headers 404
           // 'Content-Type': 'application/json', //404
           // 'Content-Type': 'multipart/form-data' //401
           // 'Content-Type': 'text/plain' //404
        },
      });
    console.log('deletePhoto', response);
    if (response.status === 200) {setStatusDel(true);}
  } catch (err) { setDisabled(false);
  } finally { 
    if (changePhoto === false){router.replace({pathname: '/(tabs)/two', params: {codeCCS: codeCCS, capitalCSName: capitalCSName, lastViewedNoteN: lastViewedNote }});}
    else{postPhoto();}setDisabled(false);
  }
}

  const postPhoto = async () => {
    setDisabled(true);
    try{
    const photoToUpload = singlePhoto;
    const body = new FormData();
          //data.append('name', 'Image Upload');
    const photoObj = { uri: singlePhoto, type: 'image/*', name: 'photoToUpload' };
    console.log('photoObj:', photoObj);
    body.append("photo", photoObj);
    let str = String(`${API_BASE_URL}/comments/addPhoto/` + id);
    console.log(str);
    
    let res = await fetch(
      str,
      {
        method: 'post',
        body: body,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    console.log('postPhoto:', res);
          
          //до сюда
          /*if(response.status === 200){
            Alert.alert('', 'Замечание добавлено', [
                 {text: 'OK', onPress: () => console.log('OK Pressed')},
              ])
          }*/
    } catch (error) { setDisabled(false);
      console.error('Error:', error);
    } finally {
      router.replace({pathname: '/(tabs)/two', params: {codeCCS: codeCCS, capitalCSName: capitalCSName, lastViewedNoteN: lastViewedNote }});
      setDisabled(false);
    }
  }

  const deleteNote = async () => {
    setDisabled(true);
    try {
      let response = await fetch(`${API_BASE_URL}/comments/deleteComment/`+id, {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
      });
    console.log('deleteNote', response);
    if (response.status === 200) {
      Alert.alert('', 'Замечание удалено', [
        {text: 'OK', onPress: () => console.log('OK Pressed')}])
    }
  } catch (err) { setDisabled(false);
  } finally {
    router.replace({pathname: '/(tabs)/two', params: {codeCCS: codeCCS, capitalCSName: capitalCSName, lastViewedNoteN: lastViewedNote }});
    setDisabled(false);
  }
  }

  useEffect(() => {
    getToken('accessToken', setAccessToken);
    getToken('role', setRole);
      //смена статуса при изменении даты
        if (editedEndDateFact) {
          if(editedEndDateFact != ' '){
            setEditedCommentStatus('Устранено');   
          } else {
            setEditedCommentStatus(bufCommentStat);
          }
      }
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
            setExecut(filteredS[0].ciwexecutor);
          }
          else{
            setEditedIinumber('');
            setExecut('');
            setEditedSystemName(' ');
            setEditedSubObject('');
          }
        // if(filteredS[0].ciwexecutor){
          setNoteListSystem(false);
      }
        //}
      }
      }  
     
    }
      }, [ accessToken, editedEndDateFact, codeCCS, req, statusReq, noteListSubobj, editedSubObject, editedSystemName, updateCom, editedSystemName]);

      useEffect(() => {
        if (statusDel === true){postPhoto();}
      }, [statusDel]);

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

  const handleSubObjectChange = (selectedSubObject: string) => {
    setEditedSubObject(selectedSubObject);
    setEditedSystemName(' '); // Явный сброс системы
    setEditedIinumber('');
    setExecut('');
};


    //зумирование фото
  
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
  
  
    const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      scale.value = withSpring(Math.min(Math.max(scale.value, 1), 3));
    });
  
    const panGesture = Gesture.Pan()
      .onUpdate((e) => {
        translateX.value = e.translationX/3;
        translateY.value = e.translationY/3;
      })
      .onEnd(() => {//возвращает в центр изображение
        if (scale.value <= 1) {
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
  
        translateX.value = withSpring(clamp(translateX.value, -0.5, 0.5));
        translateY.value = withSpring(clamp(translateY.value, -0.5, 0.5));
        }
      });
  
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { scale: scale.value },
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    }));
  
  //определение контента типа фотографии
    function detectImageType(base64: string) {
      const signature = base64.substring(0, 30);
      if (signature.startsWith('/9j')) return 'image/jpeg';
      if (signature.startsWith('iVBOR')) return 'image/png';
      if (signature.startsWith('R0lGOD')) return 'image/gif';
      return 'image/jpeg'; // default
    }
  
  
    //скачивание фото
    async function downloadBase64Image(contentType = 'image/jpeg', bytes) {
      try {
        // 1. Запрашиваем разрешения
        if (Platform.OS === 'android') {
          const { status } = await MediaLibrary.requestPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Ошибка', 'Необходимо разрешение на доступ к медиафайлам');
            return;
          }
        }
  
        // 2. Создаем имя файла
        const fileExtension = contentType.split('/')[1] || 'jpeg';
        const fileName = `photo_${Date.now()}.${fileExtension}`;
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
        // 3. Записываем base64 в файл (без префикса data:...)
        const base64Data = bytes.startsWith('data:') 
          ? bytes.split(',')[1] 
          : bytes;
        
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64
        });
    
        // 4. Сохраняем в галерею
        if (Platform.OS === 'ios') {
          await MediaLibrary.saveToLibraryAsync(fileUri);
        } else {
          const asset = await MediaLibrary.createAssetAsync(fileUri);
          await MediaLibrary.createAlbumAsync('Download', asset, false);
        }
  
        //await showDownloadNotification(filename);
        Alert.alert('Успех', 'Фото сохранено в галерею');
      } catch (error) {
        console.error('Ошибка сохранения:', error);
        //await showErrorNotification(error);
        Alert.alert('Ошибка', 'Не удалось сохранить фото');
      }
    }
  
    //перессылка фотографии
    async function shareImage(imageUri: string) {
      let tempUri = imageUri;
    
      try {
        if (!(await Sharing.isAvailableAsync())) {
          alert('Sharing не доступен');
          return;
        }
    
        // Обработка base64
        if (imageUri.startsWith('data:')) {
          const mimeType = imageUri.match(/^data:(image\/\w+);/)?.[1] || 'image/jpeg';
          const ext = mimeType.split('/')[1] || 'jpg';
          const base64Data = imageUri.split(',')[1];
    
          if (base64Data.length > 10 * 1024 * 1024) {
            alert('Изображение должно быть меньше 10MB');
            return;
          }
    
          tempUri = `${FileSystem.cacheDirectory}image_${Date.now()}.${ext}`;
          await FileSystem.writeAsStringAsync(tempUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });
        }
    
        await Sharing.shareAsync(tempUri, {
          mimeType: 'image/*',
          dialogTitle: 'Поделиться изображением',
          UTI: 'public.image',
        });
    
      } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось отправить');
      } finally {
        if (tempUri !== imageUri) {
          await FileSystem.deleteAsync(tempUri).catch(console.warn);
        }
      }
    }

  return (
     <KeyboardAwareScrollView
      style={styles.container}
      enableOnAndroid={true}
      extraScrollHeight={100}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
        <View style={[styles.container]}>


          <>
            <View style={[styles.container]}>

              <View style={{ flex: 1, alignItems: 'center' }}>

              <View style={{flexDirection: 'row', width: '98%', marginBottom: 0 }}>
            <View style={{width: '20%', alignItems: 'center'}}>
            <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>№</Text>
            </View>

           {/*} <View style={{width: '20%', alignItems: 'center'}}>
            <Text style={{ fontSize: ts(14), color: '#1E1E1E', fontWeight: '400', textAlign: 'center'}}>№ АИИ</Text>
            </View>*/}

            <View style={{width: '80%', alignItems: 'center'}}>
            <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center'}}>Подобъект</Text>
            </View>
          </View>

          <View style={{flexDirection: 'row', width: '98%', marginBottom: 0 }}>
             
            <View style={{width: '20%', alignItems: 'center'}}>
            <TextInput
            style={[styles.input, {fontSize: ts(14), marginTop: 6, borderColor: colorGray, color: colorGray}]}
            //placeholder="№ акта ИИ"
            placeholderTextColor="#111"
            value={editedSerialNumber.toString()}
            editable={false}
            />
            </View>

           {/*} <View style={{width: '20%', alignItems: 'flex-end'}}>
            <TextInput
            style={[styles.input, {fontSize: ts(14),marginTop: 6}]}
            placeholderTextColor="#111"
            value={editedIinumber}
            editable={false}
            />
            </View>*/}

            <View style={{width: '80%', alignItems: 'center', paddingTop: 6}}>
            {/*<TextInput
            style={[styles.input, ]}
            placeholderTextColor="#111"
            value={editedSubObject}
            editable={false}
            />*/}
            <ListOfSubobj 
                label='Подобъект'
                title=''
                data={listSubObj} 
                post={editedSubObject} 
                status={statusReq} 
                onChange={(subobj) => handleSubObjectChange(subobj)}
            />
              </View>

          </View>  
            
          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Система</Text>
          <ListOfSystem 
              list={listSystem} 
              /*label='Система'
              title=''
              status={statusReq} */
              buf={bufsystem} 
              post={editedSystemName} 
              onChange={(system) => setEditedSystemName(system)}
          />
          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Содержание замечания</Text>
          <TextInput
            style={[styles.input,  {flex: 1, height: Math.max(42, inputHeight), fontSize: ts(14), borderColor: colorGray, color: colorGray }]} // Минимальная высота 40
                        
            placeholderTextColor="#111"
            value={editedDescription}
            onChangeText={setEditedDescription}
            multiline
            maxLength={250}
            onContentSizeChange={e=>{
              let inputH = Math.max(e.nativeEvent.contentSize.height, 35)
              if(inputH>120) inputH =100
              setInputHeight(inputH)}}
          />
          {editedDescription.length >=200? 
                                  <Text style={{ fontSize: ts(11),  color: colorGray, fontWeight: '400', marginTop: -14.6}}>
                                    Можете ввести еще {250-editedDescription.length}{' '}
                                    {(250-editedDescription.length) % 10 === 1? <Text>символ</Text>
                                    : (250-editedDescription.length) % 10 === 2 || (250-editedDescription.length) % 10 === 3 || (250-editedDescription.length) % 10 === 4? <Text>символа</Text>
                                    : <Text>символов</Text>}
                                  </Text>
                                : '' }

          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Статус</Text>
          <TextInput
            style={[styles.input, {fontSize: ts(14), borderColor: colorGray, color: colorGray}]}
            placeholderTextColor="#111"
            value={editedCommentStatus}
            editable={false}
          />

          {/*<Text style={{ fontSize: ts(14), color: '#1E1E1E', fontWeight: '400', marginBottom: 8 }}>Исполнитель</Text>
          <TextInput
            style={[styles.input, {fontSize: ts(14)}]}
            placeholderTextColor="#111"
            value={editedExecut}
            editable={false}
          />*/}

          <View style={{flexDirection: 'row',width: '100%',}}>{/* Объявление заголовков в строку для дат плана и факта ИИ */}
                <View style={{width: '50%', }}>
                  <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>Дата выдачи</Text>
                 </View>
          
                 <View style={{width: '50%', }}>
                  <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>Плановая дата</Text>
                 </View>
          </View>

          <View  style={{flexDirection: 'row', width: '100%'}}>{/* Дата выдачи и Плановая дата устранения */}
            <CalendarWithoutDel theme='min' statusreq={true} post={startD} onChange={(dateString) => setEditedStartDate(dateString)}/>
            {/*<CalendarWithoutDel theme='min' statusreq={true} post={editedStartDate} onChange={(dateString) => setEditedStartDate(dateString)}/>*/}
            <Calendar theme='min' statusreq={true} post={editedEndDatePlan} onChange={(dateString) => setEditedEndDatePlan(dateString)}/>
          </View>

          <View style={{flexDirection: 'row',width: '100%',}}>{/* Объявление заголовков в строку для дат плана и факта ИИ */}
                <View style={{width: '50%', }}>
                  <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>Дата устранения</Text>
                 </View>
          
                 <View style={{width: '50%', }}>
                  <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>Фото</Text>
                 </View>
          </View>

          

          <View  style={{flexDirection: 'row', width: '100%'}}>{/* Дата факта устранения и фото */}
            
            <Calendar theme='min' statusreq={true} post={editedEndDateFact} onChange={(dateString) => setEditedEndDateFact(dateString)}/>
            <View style={{width: '50%', paddingTop: 12}}>
            {singlePhoto  ? (
                <View style={{ flexDirection: 'row', marginBottom: 8, alignSelf: 'center', width: '90%'}}> 
                  <View style={{width: '73%'}}>
                    <TouchableOpacity onPress={() => setModalVisible(true)}> 
                      <Image
                      source={{ uri: singlePhoto }}
                      style={{
                        height: 42,
                        borderRadius: 8,}}
                      //style={styles.image}
                      />
                    </TouchableOpacity>
                    <Modal
                      animationType="slide"
                      transparent={true}
                      visible={modalVisible}
                      onRequestClose={() => setModalVisible(false)}
                    >
                      <GestureHandlerRootView style={{ flex: 1 }}>
                        <View style={styles.modalContainer}>
                          <View style={styles.modalContent}>

                            <View style={{flexDirection: 'row', }}>
                              <TouchableOpacity 
                                onPress={() => downloadBase64Image( 'image/jpeg', singlePhoto)}
                                style={{alignItems: 'center', width: '33%', }}
                              >
                                 <Ionicons name='download-outline' size={30} color={colorGray} />
                              </TouchableOpacity>

                              <TouchableOpacity 
                                onPress={() => shareImage(singlePhoto)}
                                style={{alignItems: 'center', width: '33%' }}
                              >
                                 <Ionicons name='share-social-outline' size={30} color={colorGray} />
                              </TouchableOpacity>

                              <TouchableOpacity 
                                onPress={() => setModalVisible(false)} 
                                style={{alignItems: 'center', width: '33%' }}
                              >
                                <Ionicons name='close-outline' size={30} color={colorGray} />
                              </TouchableOpacity>
                            </View>
                            
                            <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, panGesture)}>
                              <Animated.View style={animatedStyle}>
                                <Image
                                  source={{uri: singlePhoto}}
                                  style={styles.imageModal}
                                  contentFit="contain"
                                  transition={200}
                                />
                              </Animated.View>
                            </GestureDetector>
                          </View>
                        </View>
                      </GestureHandlerRootView>
                    </Modal>

                    </View>
                  <View style={{width: '24%' ,alignSelf: 'center'}}>
                    <TouchableOpacity onPress={cancelPhoto} style={{alignItems: 'flex-end'}}>
                      <Ionicons name='close-outline' size={30} color={colorText}/>
                    </TouchableOpacity>
                  </View>
                
              </View>
              ) : (
               statusActivityIndicator === true ? (<ActivityIndicator size={'large'} style={{paddingTop: 2}}/>): 
                (
                <View style={{ marginBottom: 8}}>
                  <View style={{width: '100%'}}>
                    <TouchableOpacity onPress={chooseCameraOrPhoto} style={{alignSelf: 'flex-end', width: '20%'}}>
                      <Ionicons name='image-outline' size={30} color={colorText}></Ionicons>
                    </TouchableOpacity> 
                    </View>
                </View>
                )
              )
              }
            </View>

          </View>

                <Text style={{ fontSize: ts(14), color: colorText, fontWeight: 400, marginBottom: 8 }}>Категория замечания</Text>
                <DropdownComponent2 post = {editedCommentCategory} onChange={(category) => setEditedCommentCategory(category)}/>

          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Комментарий</Text>
          <TextInput
            style={[styles.input, {fontSize: ts(14), borderColor: colorGray, color: colorGray}]}
            placeholderTextColor="#111"
            value={editedCommentExplanation}
            onChangeText={setEditedCommentExplanation}
          />

          <ListOfStatusNotes post={commentStat1} originalPost={commentStat2} status={statusReq} title='Статус' label='Статус' userRole={role} onChange={value=>setCommentStat1(value)}/>
          
          <View style={{ paddingBottom: BOTTOM_SAFE_AREA + 20 }}>

                <CustomButton
                  disabled={disabled}
                  title="Сохранить изменения"
                  handlePress={handleSaveClick} />
                  <PermissionGuard required='COMMENT_DELETE'>
                    <CustomButton
                    disabled={disabled}
                    title="Удалить замечание"
                    handlePress={deleteNote} />
                  </PermissionGuard>
                </View>
              </View>
            </View>
          </>

        </View>
      </KeyboardAwareScrollView>
  );
};
const stylHead = StyleSheet.create({
  container: {
    marginLeft: 8,
    marginRight: 8,
    paddingVertical: 8,
    flex: 1,
    //  rowGap: 30,
    //   flexDirection: 'column',
    //   justifyContent: 'flex-start',
    backgroundColor: '#708fff',
    alignItems: 'center',
    // alignContent: 'space-around',
    justifyContent: 'center',
    // minWidth: 120, 
    // flexWrap: 'wrap',
  },
});

export default EditDataScreen;