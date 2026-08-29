import { brand } from '@/constants/Colors';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
//import DropdownComponent2 from '@/components/list_categories';
import Calendar from '@/components/Calendar+';
import CustomButton from '@/components/CustomButton';
import FormField from '@/components/FormField';
import ListOfStatusNotes from '@/components/ListOfStatusNotes';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useColorGray, useColorText } from '@/hooks/useColorText';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import * as SecureStore from 'expo-secure-store';
import * as Sharing from 'expo-sharing';
import { Dimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  clamp,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { API_BASE_URL } from '../../config/api';

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
  const {lastViewedNote} = useLocalSearchParams();//получение Id замечания

  console.log(post, 'commentId post');
  const [inputHeight, setInputHeight] = useState(42);

  const [accessToken, setAccessToken] = useState<any>('');

  const fontScale = useWindowDimensions().fontScale;

  const ts = (fontSize: number) => {
    return (fontSize / fontScale)};

  const [serNumber, setSerNumber] = useState<string>('');
  const [numberII, setNumberII] = useState<string>('');
  const [subObj, setSubObj] = useState<string>('');//подобъект
  const [systemN, setSystemN] = useState<string>('');//система
  const [comment, setComment] = useState<string>('');//содержание замечания
  const [commentStat, setCommentStat] = useState<string>('');//статус замечания
  const bufCommentStat = commentStat;//хранит статус замечания из бд, чтобы вывести его в случае отмены выбранной даты устранения (изначально пустой)
  const [startD, setStartD] = useState<string>('');//дата выдачи замечания
  const [planD, setPlanD] = useState<string>('');//плановая дата устранения
  const [factD, setFactD] = useState<string>('');//фактическая дата устранения
  const [category, setCategory] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');//комментарий
  const [code, setCode] = useState<string>('');
  const [execut, setExecut] = useState<string>('');//исполнитель
  const [statusReq, setStatusReq] = useState<boolean>(false);//для передачи даты после запроса
  const [startReq, setStartReq] = useState<boolean>(true);//для вызова getComment только при первом получении post
  const [statusReqPhoto, setStatusReqPhoto] = useState<boolean>(false);//для вызова getComment только при первом получении post
    const [role, setRole] = useState<string>('');

  //для чтения фото и его сборки
  const [uriPhoto, setUriPhoto] = useState<string>('');
  const [contentType, setContentType] = useState<string>('');
  const [bytes, setBytes] = useState();
  const [statusActivityIndicator, setStatusActivityIndicator] = useState(true);

  const [commentStat1, setCommentStat1] = useState('Устранено')//измененный после перевыбора
  const [commentStat2, setCommentStat2] = useState('Устранено')//оригинальный

  const [modalVisible, setModalVisible] = useState(false);//для открытия фото полностью
  
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

console.log('statusReqPhoto',statusReqPhoto);
  useEffect(() => {
    //вызов getComment при получении id Замечания - post
      if (post && startReq && accessToken) {
        setStartReq(false);
        getComment();
        //getPhoto();
        console.log(post, 'commentID')

      }
    //смена статуса при изменении даты
      if (factD) {
        if(factD != ' '){
          setCommentStat('Устранено');   
        } else {
          setCommentStat('Не устранено');
        }
    }
    if(statusReqPhoto ){
      //const base64String = Buffer.from(bytes).toString('base64');
      //console.log(`data:image/png;base64,${bytes}`);
      setUriPhoto(`data:image/*;base64,${bytes}`)
        console.log(uriPhoto,'uriPhoto');
        console.log(3);
       // 
    }
    }, [accessToken, post, factD, statusReqPhoto, startReq]);

  useEffect(() => {
    getToken('accessToken', setAccessToken);
    getToken('role', setRole);
    //вызов getComment при получении id Замечания - post
      if (post && startReq && accessToken) {
        setStartReq(false);
        getComment();
        //getPhoto();
        console.log(post, 'commentID')

      }
    //смена статуса при изменении даты
      if (factD) {
        if(factD != ' '){
          setCommentStat('Устранено');   
        } else {
          setCommentStat('Не устранено');
        }
    }
    if(statusReqPhoto ){
      //const base64String = Buffer.from(bytes).toString('base64');
      //console.log(`data:image/png;base64,${bytes}`);
      setUriPhoto(`data:image/*;base64,${bytes}`)
        console.log(uriPhoto,'uriPhoto');
        console.log(3);
       // 
    }
    }, [accessToken, post, factD, statusReqPhoto, startReq]);

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
        const response = await fetch(`${API_BASE_URL}/comments/getCommentById/`+post,
          {method: 'GET',
            headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }}
        );
        
        console.log('ResponseGetComment:', response);
        
        if (!response.ok) {
      // Для 401 ошибки обычно пустое тело, но проверяем
      let errorText = '';
      try {
        errorText = await response.text();
      } catch {
        errorText = 'Нет тела ответа';
      }
      
      console.log(errorText,'Error response text:' );
      
      if (response.status === 401) {
        throw new Error('Требуется авторизация. Проверьте токен.');
      }
      
      // Если в теле есть сообщение об ошибке (например, о блокировке)
      if (errorText.includes('Замечание заблокировано') || errorText.includes('заблоктрованно')) {
        throw new Error(errorText);
      }
      
      throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
    }

      const json = await response.json();
        if (response.ok){
        setSerNumber(''+json.serialNumber.toString());
        setNumberII(''+json.iiNumber.toString());
        setSubObj(json.subObject);
        setSystemN(json.systemName);
        setComment(json.description);
        setCommentStat(json.commentStatus);
        setStartD(json.startDate); console.log('json.startDate',json.startDate);
        setPlanD(json.endDatePlan); console.log('json.endDatePlan',json.endDatePlan);
        setFactD(json.endDateFact)//.replace(/(\d{4})\-(\d{2})\-(\d{2})/, '$3.$2.$1')); console.log(json.endDateFact.replace(/(\d{4})\-(\d{2})\-(\d{2})/, '$1.$2.$3'));
        setCategory(json.commentCategory);
        setExplanation(json.commentExplanation);
        setCode(json.codeCCS);
        setExecut(json.executor);
        //console.log(json.systemName, 'json.systemName');
        }
        console.log('ResponseGetComment json:', json);
        setStatusReq(true);
      } catch (error) {
        console.log('error text: ', error)
        console.log(error === '[TypeError: Already read]')
        if (error === '[TypeError: Already read]'){console.log('Заблокировано')}
        console.error('Ошибка при получении данных:', error);
        setStatusReq(false);
      } finally {
        //
      }

      //getPhoto
      try {
        const response = await fetch(`${API_BASE_URL}/comments/getPhoto/` + post,
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

        // 4️⃣ Можно сохранить в состоянии (если нужно)
        setBytes(base64Data);
        setContentType(contentType);
        if (response.status===200){setStatusReqPhoto(true);}
        setStatusActivityIndicator(false); // Останавливаем индикатор загрузки

      } catch (error) {
        console.error('Ошибка при получении фото:', error);
        setStatusActivityIndicator(false);//чтобы не крутился индикатор загрузки у фото
        //setStatusReqPhoto(true);
        //setStatusReq(false);
      } finally {
        //const src = `data:,${contentType}${bytes}`;
       // setUriPhoto(`data:,${contentType}${bytes}`)
        //console.log(uriPhoto);
      }
    };

    const putComment = async () => {
      try {
        const body = new FormData();
      //data.append('name', 'Image Upload');
       const dateFD = factD.toString()//.replace(/(\d{2})\.(\d{2})\.(\d{4})/, '$3-$2-$1')
      body.append("date", dateFD);
        let response = await fetch(`${API_BASE_URL}/comments/comment_elimination/`+post, {
          method: 'PUT',
          headers: {
           'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          },
          body: body,
        });
        console.log('ResponsePutComment:', response);
       
        if (response.ok) {
          
          //alert('Данные успешно сохранены!');
        } else {
          //throw new Error('Не удалось сохранить данные.');
        }
      } catch (error) {
        console.error('Ошибка при сохранении данных:', error);
      }  finally{
        router.replace({pathname: '/(tabs)/two', params: { codeCCS: code, capitalCSName: capitalCSName, lastViewedNoteN: lastViewedNote}});
      }
    };
    

    if (startReq && accessToken) {
      setStartReq(false);
      getComment();   
      console.log(post, 'commentID')
    }

    useEffect(() => {
      if(statusReqPhoto ){
        //const base64String = Buffer.from(bytes).toString('base64');
        //console.log(`data:image/png;base64,${bytes}`);
        setUriPhoto(`data:image/*;base64,${bytes}`)
         // 
         setContentType(detectImageType(bytes));
         console.log('contentType', contentType);
      }
      }, [statusReqPhoto]);
    

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

// Функция показа уведомления об успешном скачивании
{/*async function showDownloadNotification(filename: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Скачивание завершено',
      body: `Файл ${filename} сохранен в галерею`,
      sound: true, // Звуковое сопровождение
      data: { type: 'download-complete' }, // Дополнительные данные
    },
    trigger: null, // Отправить немедленно
  });
}

// Функция показа уведомления об ошибке
async function showErrorNotification(error: Error) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Ошибка скачивания',
      body: error.message || 'Не удалось сохранить файл',
      sound: true,
    },
    trigger: null,
  });
}
  */}

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

    <ScrollView>
      <View style={[styles.container]}>
        
        <View style={{flex: 1, alignItems: 'center'}}>

          <View style={{flexDirection: 'row', width: '98%', marginBottom: 0 }}>
            <View style={{width: '20%', alignItems: 'center'}}>
            <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>№</Text>
            </View>

            <View style={{width: '20%', alignItems: 'center'}}>
            <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center'}}>№ АИИ</Text>
            </View>

            <View style={{width: '60%', alignItems: 'center'}}>
            <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center'}}>Подобъект</Text>
            </View>
          </View>

          <View style={{flexDirection: 'row', width: '98%', marginBottom: 0 }}>
             
            <View style={{width: '20%', alignItems: 'center'}}>
            <TextInput
            style={[styles.input, {fontSize: ts(14), marginTop: 6, borderColor: colorGray, color: colorGray}]}
            //placeholder="№ акта ИИ"
            placeholderTextColor={brand.textPrimary}
            value={serNumber}
            editable={false}
            />
            </View>

            <View style={{width: '20%', alignItems: 'flex-end'}}>
            <TextInput
            style={[styles.input, {fontSize: ts(14), marginTop: 6, borderColor: colorGray, color: colorGray}]}
            placeholderTextColor={brand.textPrimary}
            value={numberII}
            editable={false}
            />
            </View>

            <View style={{width: '60%', alignItems: 'center'}}>
            <TextInput
            style={[styles.input, {fontSize: ts(14), marginTop: 6, lineHeight: ts(19), borderColor: colorGray, color: colorGray}]}
            placeholderTextColor={brand.textPrimary}
            value={subObj}
            multiline
            editable={false}
            maxLength={45}
            />
            </View>

          </View>  
            
          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Система</Text>
          <TextInput
            style={[styles.input, {fontSize: ts(14), lineHeight: 19, borderColor: colorGray, color: colorGray }]}
            placeholderTextColor={brand.textPrimary}
            value={systemN}
            multiline
            editable={false}
          />     
          
          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Содержание замечания</Text>
          <TextInput
           // style={[styles.input,  {flex: 1, height: Math.max(42, inputHeight), fontSize: ts(14) }]} // Минимальная высота 42
           /*style={[
            styles.input, 
            {
              height: Math.max(42, inputHeight),
              minHeight: 42, // Минимальная высота
              maxHeight: 100, // Максимальная высота
              fontSize: ts(14)
            }
          ]} */
                  style={[
            styles.input, 
            {
              height: 'auto',
              minHeight: 42,
              maxHeight: 100,
              fontSize: ts(14), borderColor: colorGray, color: colorGray
             // textAlignVertical: 'top'
            }
          ]}
           placeholderTextColor={brand.textPrimary}
            multiline
           // onChangeText={setComment}
          /*  onContentSizeChange={e=>{
              let inputH = Math.max(e.nativeEvent.contentSize.height, 35)
              if(inputH>120) inputH =100
              setInputHeight(inputH)}}*/
            value={comment}
            //editable={false}
          />

          

          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Статус</Text>
          <TextInput
            style={[styles.input, {fontSize: ts(14), borderColor: colorGray, color: colorGray }]}
            placeholderTextColor={brand.textPrimary}
            value={commentStat}
            editable={false}
          />

          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Исполнитель</Text>
          <TextInput
            style={[styles.input, {fontSize: ts(14), borderColor: colorGray, color: colorGray }]}
            placeholderTextColor={brand.textPrimary}
            value={execut}
            editable={false}
          />

          <View style={{flexDirection: 'row',width: '100%',}}>{/* Объявление заголовков в строку для дат плана и факта ИИ */}
                <View style={{width: '50%', }}>
                  <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>Дата выдачи</Text>
                 </View>
          
                 <View style={{width: '50%', }}>
                  <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>Плановая дата</Text>
                 </View>
          </View>

          <View  style={{flexDirection: 'row', width: '96%', justifyContent: 'space-between'}}>{/* Дата выдачи и Плановая дата устранения */}
              <View style={{width: '49%', justifyContent: 'center'}}>
                <TextInput
                  style={[styles.input, {fontSize: ts(14), width: '100%', marginTop: 6, borderColor: colorGray, color: colorGray }]}
                  placeholderTextColor={brand.textPrimary}
                  value={startD}
                  editable={false}
                />
              </View>
          
              <View style={{width: '49%', flexDirection: 'row', justifyContent: 'flex-end'}}>
              <TextInput
                  style={[styles.input, {fontSize: ts(14), width: '100%', marginTop: 6, alignContent: 'flex-end', borderColor: colorGray, color: colorGray}]}
                  placeholderTextColor={brand.textPrimary}
                  value={planD}
                  editable={false}
                />
                
              </View>

            {/*<Calendar theme='min' statusreq={statusReq} post={startD} diseditable={true}/>
            <Calendar theme='min' statusreq={statusReq} post={planD} diseditable={true}/>*/}
          </View>

          <View style={{flexDirection: 'row',width: '100%',}}>{/* Объявление заголовков в строку для дат плана и факта ИИ */}
                <View style={{width: '50%', }}>
                  <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>Дата устранения</Text>
                 </View>
          
                 <View style={{width: '50%', }}>
                  <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>Фото</Text>
                 </View>
          </View>

          

          <View  style={{flexDirection: 'row', width: '96%', justifyContent: 'space-between'}}>
            <PermissionGuard required='COMMENT_ELIMINATION'
              fallback={
                <View style={{paddingTop: 12, width: '51%'}}>
                  <FormField post={factD}  editable={false}/>
                </View>
              }>
              <Calendar theme='min' statusreq={statusReq} post={factD} diseditable={false} onChange={(dateString) => setFactD(dateString)}/>
            </PermissionGuard>
            
            <View style={{width: '49%'}}>
            {statusReqPhoto === true ? (
              
              <View style={{width: '100%', paddingTop: 12}}>
                    <TouchableOpacity style = {{alignSelf: 'flex-end', width: '100%'}} onPress={() => setModalVisible(true)}> 
                      <Image
                      source = {{uri: `data:${contentType};base64,${bytes}`}}
                      style={styles.image}
                     // placeholder="Фотография загружается или отсутствует"
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
                                onPress={() => downloadBase64Image( contentType, bytes)}
                                style={{alignItems: 'center', width: '33%', }}
                              >
                                 <Ionicons name='download-outline' size={30} color={colorGray} />
                              </TouchableOpacity>

                              <TouchableOpacity 
                                onPress={() => shareImage(`data:${contentType};base64,${bytes}`)}
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
                                  source={{uri: `data:${contentType};base64,${bytes}`}}
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
              ):
              statusActivityIndicator === true ? (<ActivityIndicator size={'large'} style={{paddingTop: 10}}/>):''
              }
            </View>
            
              
          </View>

          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: 400, marginBottom: 8 }}>Категория замечания</Text>
          <TextInput
             style={[styles.input, {fontSize: ts(14), borderColor: colorGray, color: colorGray }]}
            placeholderTextColor={brand.textPrimary}
            value={category}
            editable={false}
          />

          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: 400, marginBottom: 8 }}>Комментарий</Text>
          <TextInput
             style={[styles.input, {fontSize: ts(14), borderColor: colorGray, color: colorGray }]}
            placeholderTextColor={brand.textPrimary}
            value={explanation}
            editable={false}
          />

          <ListOfStatusNotes originalPost={commentStat2} post={commentStat1} status={statusReq} title='Статус' label='Статус' userRole={role} onChange={value=>setCommentStat1(value)}/>

          <View style={{justifyContent: 'center', alignContent: 'center', paddingBottom: BOTTOM_SAFE_AREA + 20}}>
           {/**изменить для кнопки сохранить ограничение */}
           <PermissionGuard required='COMMENT_ELIMINATION'>
            <CustomButton title='Сохранить' handlePress ={ putComment } />
           </PermissionGuard>
           
           <PermissionGuard required="COMMENT_EDIT">
            <CustomButton title='Редактировать' handlePress ={() => router.replace({pathname: '/notes/change_note', 
              params: {
                serialNumb: serNumber,
                numberii: numberII,
                subobj: subObj,
                system: systemN,
                comment: comment,
                status: commentStat,
                executor: execut,
                startD: startD,
                planD: planD,
                factD: factD,
                category: category,
                explan: explanation,
                id: post,
                codeCCS: code, 
                capitalCSName: capitalCSName,
                lastViewedNote: lastViewedNote
              }})} />
           </PermissionGuard>
          </View>

        </View>
      </View>
    </ScrollView>


  );
}
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brand.white,
  },
  input: {
    backgroundColor: brand.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: brand.bgBlue,
    width: '96%',
    height: 42,
    paddingVertical: 'auto',
    color: brand.bgBlue,
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