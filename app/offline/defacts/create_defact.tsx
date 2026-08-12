import DateInputWithPicker2 from '@/components/Calendar+';
import DateInputWithPicker from '@/components/CalendarOnWrite';
import CustomButton from '@/components/CustomButton';
import ListOfOrganizations from '@/components/ListOfOrganizations';
import ListOfSystem from '@/components/ListOfSystem';
import { database } from '@/DB/database';
import { useColorGray, useColorText } from '@/hooks/useColorText';
import { Ionicons } from '@expo/vector-icons';
import { Q } from '@nozbe/watermelondb';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View
} from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  clamp,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

export type ListToDrop = {
  label: string;
  value: string; 
};

const { width, height } = Dimensions.get('window');

type StructureItem = {
  subobject_name: string;
  data: Array<{
    system_name: string;
    ii_number: string;
    ciwexecutor: string;
    id_pnrsystem_from_db: string;
  }>;
};

export default function CreateDefact() {
  const BOTTOM_SAFE_AREA = Platform.OS === 'android' ? StatusBar.currentHeight : 0;
  const colorText = useColorText();
  const colorGray = useColorGray();
  
  const [listSubObj, setListSubObj] = useState<ListToDrop[]>([]);
  const [listSystem, setListSystem] = useState<ListToDrop[]>([]);
  const [listOrganizations, setListOrganizations] = useState<ListToDrop[]>([]);
  const [statusOrg, setStatusOrg] = useState<boolean>(false);
  const [upLoading, setUpLoading] = useState(false);
  const [structure, setStructure] = useState<StructureItem[]>([]);
  const [statusReq, setStatusReq] = useState(false);
  const [req, setReq] = useState<boolean>(true);
  
  // Данные формы
  const [numberII, setNumber] = useState<string>('');
  const [subObject, setSubObject] = useState<string>('');
  const [systemName, setSystemName] = useState<string>(' ');
  const [description, setDescription] = useState<string>('');
  const [execut, setExecut] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [equipment, setEquipment] = useState<string>('');
  const [comExp, setComExp] = useState<string>('');
  const [manufacturerNumber, setManufacturerNumber] = useState<string>('');
  const [manufacturer, setManufacturer] = useState<string>('');
  const [planDate, setPlanDate] = useState<string>(' ');
  const [inputHeight, setInputHeight] = useState(40);
  const [bufsystem, setBufsystem] = useState<string>('');
  
  // Фото
  const [modalVisible, setModalVisible] = useState(false);
  const [wayToGetPhoto, setWayToGetPhoto] = useState<number>(0);
  const [singlePhoto, setSinglePhoto] = useState<string>('');
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [disabled, setDisabled] = useState(false);
  
  // Данные пользователя
  const [accessToken, setAccessToken] = useState<any>('');
  const [organisationFrAsync, setOrganisationFrAsync] = useState<any>('');
  const [fullNameFrAsync, setFullNameFrAsync] = useState<any>('');
  
  const fontScale = useWindowDimensions().fontScale;
  const ts = (fontSize: number) => fontSize / fontScale;

  const { codeCCS } = useLocalSearchParams();
  const { capitalCSName } = useLocalSearchParams();
  const { isOfflineMode } = useLocalSearchParams();

  const getToken = async (keyToken: string, setF: (value: any) => void) => {
    try {
      const token = await SecureStore.getItemAsync(keyToken);
      if (token !== null) {
        console.log('Retrieved token:', keyToken, '-', token);
        setF(token);
      } else {
        console.log('No token found');
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
    }
  };

  // Получение структуры из локальной базы данных
  const getStructureFromDB = async () => {
    try {
      if (!database) {
        console.error('Database is not initialized');
        return;
      }

      const systemsCollection = database.collections.get('systems');
      
      let systems = await systemsCollection
        .query(Q.where('object_id', codeCCS as string))
        .fetch();
      
      if (systems.length === 0) {
        systems = await systemsCollection
          .query(Q.where('code_ccs', codeCCS as string))
          .fetch();
      }

      console.log(`✅ Found ${systems.length} systems for object ${codeCCS}`);

      // Группируем по подобъектам
      const groupedBySubobject = {};
      
      systems.forEach(system => {
        const subObjectName = system.subobject_name || 'Не указан';
        const systemName = system.system_name || 'Не указана';
        
        if (!groupedBySubobject[subObjectName]) {
          groupedBySubobject[subObjectName] = {
            subobject_name: subObjectName,
            data: []
          };
        }
        
        groupedBySubobject[subObjectName].data.push({
          system_name: systemName,
          ii_number: system.ii_number || '',
          ciwexecutor: system.ciwexecutor || '',
          id_pnrsystem_from_db: system.id_pnrsystem_from_db || ''
        });
      });

      const formattedStructure = Object.values(groupedBySubobject);
      setStructure(formattedStructure);

      // Формируем список подобъектов
      if (formattedStructure.length > 0) {
        const subObjList = formattedStructure.map(item => ({
          label: item.subobject_name,
          value: item.subobject_name
        }));
        setListSubObj(subObjList);
      }

      setStatusReq(true);
    } catch (error) {
      console.error('Error loading structure from database:', error);
    }
  };

  // Получение организаций из локальной базы
  const getOrganisationsFromDB = async () => {
    try {
      console.log('🔄 Загрузка организаций из базы данных...');
      
      if (!database) {
        console.error('Database is not initialized');
        return [];
      }

      // Пробуем разные имена таблиц
      let organisationsCollection;
      try {
        organisationsCollection = database.collections.get('organisations');
        console.log('✅ Используем таблицу "organisations"');
      } catch (error) {
        try {
          organisationsCollection = database.collections.get('organisation');
          console.log('✅ Используем таблицу "organisation"');
        } catch (error2) {
          console.error('❌ Таблица организаций не найдена');
          return [];
        }
      }

      const organisations = await organisationsCollection.query().fetch();
      console.log(`📊 Найдено ${organisations.length} организаций в базе данных`);
      
      // Логируем первые несколько организаций для отладки
      if (organisations.length > 0) {
        organisations.slice(0, 3).forEach((org, index) => {
          console.log(`  ${index + 1}. ${org.organisation || org.organisationName || 'Без названия'}`);
        });
      }

      // Преобразуем в формат для выпадающего списка
      const orgList = organisations.map(org => {
        const orgName = org.organisation || org.organisationName || 'Неизвестная организация';
        return {
          label: orgName,
          value: orgName
        };
      });

      // Сортируем по алфавиту
      const sortedOrgList = orgList.sort((a, b) => 
        a.label.localeCompare(b.label, 'ru', { sensitivity: 'base' })
      );

      // Добавляем опцию "Не выбрано" в начало
      const finalOrgList = [
        { label: 'Не выбрано', value: '' },
        ...sortedOrgList
      ];

      console.log(`✅ Подготовлено ${finalOrgList.length} организаций для выбора`);
      return finalOrgList;
    } catch (error) {
      console.error('❌ Ошибка загрузки организаций из базы данных:', error);
      return [];
    }
  };

  useEffect(() => {
    getToken('accessToken', setAccessToken);
    getToken('userID', setFullNameFrAsync);
    getToken('organisation', setOrganisationFrAsync);
  }, []);

  useEffect(() => {
    // Загрузка структуры и организаций
    const loadData = async () => {
      if (codeCCS && req) {
        await getStructureFromDB();
        
        // Загружаем организации для выпадающего списка
        const orgs = await getOrganisationsFromDB();
        setListOrganizations(orgs);
        setStatusOrg(orgs.length > 0);
        
        setReq(false);
      }
    };
    
    loadData();
  }, [codeCCS, req]);

  // Формирование списка систем при изменении подобъекта
  useEffect(() => {
    if (subObject && structure.length > 0) {
      const filtered = structure.find(item => item.subobject_name === subObject);
      if (filtered) {
        const systemList = filtered.data.map(system => ({
          label: system.system_name,
          value: system.system_name
        }));
        setListSystem(systemList);
        setSystemName(' ');
        setNumber('');
        setExecut('');
      }
    }
  }, [subObject, structure]);

  // Обновление номера АИИ и исполнителя при изменении системы
  useEffect(() => {
    if (systemName !== ' ' && systemName !== bufsystem && subObject) {
      setBufsystem(systemName);
      const filtered = structure.find(item => item.subobject_name === subObject);
      if (filtered) {
        const systemData = filtered.data.find(item => item.system_name === systemName);
        if (systemData) {
          setNumber(systemData.ii_number);
          setExecut(systemData.ciwexecutor);
        }
      }
    }
  }, [systemName, subObject, structure]);

  const handleSubObjectChange = (selectedSubObject: string) => {
    setSubObject(selectedSubObject);
    setSystemName(' ');
    setNumber('');
    setExecut('');
  };

  // Функции для работы с фото
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

  const selectPhoto = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
      });

      console.log('Photo selection result:', res);
      if (res.assets && res.assets[0].uri) {
        setSinglePhoto(res.assets[0].uri);
        if (res.assets[0].base64) {
          setPhotoBase64(res.assets[0].base64);
        }
      }
    } catch (err) {
      setSinglePhoto('');
      console.error('Error selecting photo:', err);
    }
  };

  const selectCamera = async () => {
    try {
      const res = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        base64: true,
      });

      console.log('Camera result:', res);
      if (res.assets && res.assets[0].uri) {
        setSinglePhoto(res.assets[0].uri);
        if (res.assets[0].base64) {
          setPhotoBase64(res.assets[0].base64);
        }
      }
    } catch (err) {
      setSinglePhoto('');
      console.error('Error using camera:', err);
    }
  };

  const cancelPhoto = () => {
    setSinglePhoto('');
    setPhotoBase64('');
    setWayToGetPhoto(0);
  };

  const chooseCameraOrPhoto = () => {
    Alert.alert('', 'С помощью чего хотите добавить фотографию?', [
      { text: 'Камера', onPress: () => setWayToGetPhoto(1) }, 
      { text: 'Альбом', onPress: () => setWayToGetPhoto(2) }
    ]);
  };

  // Сохранение дефекта в локальную базу данных
  const saveDefectToDB = async () => {
    try {
      if (!database) {
        throw new Error('База данных не инициализирована');
      }

      // Проверка обязательных полей
      if (!subObject.trim() || systemName.trim() === '' || !description.trim() || 
          !equipment.trim() || !manufacturerNumber.trim() || !manufacturer.trim()) {
        Alert.alert(
          'Ошибка',
          'Заполните обязательные поля: Подобъект, Система, Дефект, Оборудование, Заводской номер, Изготовитель'
        );
        return;
      }

      // Генерируем уникальный ID для локальной записи
      const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await database.write(async () => {
        const defactsCollection = database.collections.get('defacts');
        
        // Создаем запись дефекта
        await defactsCollection.create((record: any) => {
          record.id_from_server = localId; // Для локальных записей используем сгенерированный ID
          record.ii_number = numberII || '';
          record.subobject = subObject;
          record.system_name = systemName;
          record.equipment = equipment;
          record.description = description;
          record.defective_act_status = 'Не устранено';
          record.executor = execut || '';
          record.user_name = fullNameFrAsync || '';
          record.start_date = startDate || '';
          record.end_date_plan = planDate || ' ';
          record.end_date_fact = ' ';
          record.defective_act_explanation = comExp || '';
          record.manufacturer = manufacturer;
          record.manufacturer_number = manufacturerNumber;
          record.object_id = codeCCS;
          record.code_ccs = codeCCS;
          record.flag_from_server = false; // Важный флаг - запись создана локально
          
          // Если есть фото, сохраняем его в отдельное поле (если в схеме есть)
          if (photoBase64) {
            // Если в схеме есть поле для фото, сохраняем его
            // record.photo_base64 = photoBase64;
            // record.photo_content_type = 'image/jpeg';
          }
        });
      });

      console.log( JSON.stringify({
        localId,
        numberII,
        subObject,
        systemName,
        equipment,
        description,
        execut,
        fullNameFrAsync,
        startDate,
        manufacturer,
        manufacturerNumber,
        codeCCS,
        flag_from_server: false
      }) );

      Alert.alert(
        'Успешно',
        'Дефект сохранен локально',
        [{ text: 'OK', onPress: () => router.push('/offline/defacts') }]
      );
    } catch (error) {
      console.error('Error saving defect to database:', error);
      Alert.alert(
        'Ошибка',
        'Не удалось сохранить дефект'
      );
      setDisabled(false);
    }
  };

  // Создание дефекта (работает в обоих режимах)
  const submitData = async () => {
    setDisabled(true);

    // Проверка обязательных полей
    if (!subObject.trim() || systemName.trim() === '' || systemName.trim() === ' ' || 
        !description.trim() || !manufacturerNumber.trim() || !manufacturer.trim() || !equipment.trim()) {
      Alert.alert(
        'Ошибка',
        'Заполните обязательные поля: Подобъект, Система, Дефект, Оборудование, Заводской номер, Изготовитель.'
      );
      setDisabled(false);
      return;
    }

    // Проверяем, в каком режиме работаем
    const isOffline = isOfflineMode === 'true' || !accessToken;

    if (isOffline) {
      // Оффлайн режим - сохраняем в локальную БД
      await saveDefectToDB();
    } else {
      // Онлайн режим - отправляем на сервер
      await submitToServer();
    }
  };

  // Отправка данных на сервер (оригинальная функция)
  const submitToServer = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/defectiveActs/createDefAct`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          iiNumber: numberII,
          subObject: subObject,
          systemName: systemName,
          equipment: equipment,
          description: description,
          defectiveActStatus: "Не устранено",
          executor: execut,
          userName: fullNameFrAsync,
          startDate: startDate,
          codeCCS: codeCCS,
          endDatePlan: planDate,
          endDateFact: ' ',
          defectiveActExplanation: comExp,
          manufacturer: manufacturer,
          manufacturerNumber: manufacturerNumber
        }),
      });

      console.log('ResponseCreateDefect:', response);

      if (response.status === 200) {
        const id = await response.text();
        console.log('Created defect ID:', id);

        // Если есть фото, загружаем его
        if (singlePhoto) {
          await uploadPhotoToServer(id);
        }

        Alert.alert('', 'Дефект добавлен', [{ text: 'OK' }]);
        router.replace({ 
          pathname: '/(tabs)/defacts', 
          params: { codeCCS: codeCCS, capitalCSName: capitalCSName } 
        });
      } else {
        throw new Error('Ошибка при создании дефекта');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert(
        'Ошибка',
        'Не удалось создать дефект. Сохранить локально?',
        [
          { text: 'Отмена', style: 'cancel' },
          { 
            text: 'Сохранить локально', 
            onPress: async () => {
              await saveDefectToDB();
            }
          }
        ]
      );
    } finally {
      setDisabled(false);
      setUpLoading(false);
    }
  };

  const uploadPhotoToServer = async (defectId: string) => {
    try {
      const photoToUpload = singlePhoto;
      const body = new FormData();
      
      body.append("photo", {
        uri: photoToUpload,
        type: 'image/*',
        name: 'photoToUpload'
      } as any);

      const response = await fetch(
        `${API_BASE_URL}/defectiveActs/addPhoto/${defectId}`,
        {
          method: 'POST',
          body: body,
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Photo upload response:', response);
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };

  // Зумирование фото
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
      translateX.value = e.translationX / 3;
      translateY.value = e.translationY / 3;
    })
    .onEnd(() => {
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

  // Индикатор режима
  const isOffline = isOfflineMode === 'true' || !accessToken;

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      enableOnAndroid={true}
      extraScrollHeight={125}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={{ flex: 1, alignItems: 'center' }}>
        {/* Индикатор режима */}
        {isOffline && (
          <View style={styles.offlineIndicator}>
            <Ionicons name="save-outline" size={16} color="#34C759" />
            <Text style={styles.offlineText}>Сохранение в локальную базу</Text>
          </View>
        )}

        <View style={{ width: '100%', alignItems: 'center' }}>
          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8, textAlign: 'center' }}>
            Подобъект
          </Text>
          <ListOfOrganizations 
            data={listSubObj} 
            post={subObject} 
            status={statusReq} 
            title={subObject || 'Не выбрано'}
            label='Подобъект'
            onChange={handleSubObjectChange}
          />   
        </View>
        
        <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8, paddingTop: 6 }}>
          Система
        </Text>
        <ListOfSystem 
          list={listSystem} 
          buf={bufsystem} 
          post={systemName} 
          onChange={setSystemName}
        />
        
        <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>
          Оборудование
        </Text>
        <TextInput
          style={[styles.input, { fontSize: ts(14), color: colorGray, borderColor: colorGray }]}
          placeholderTextColor="#111"
          onChangeText={setEquipment}
          value={equipment} 
        />
        
        <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>
          Дефект
        </Text>
        <TextInput
          style={[styles.input, { 
            flex: 1, 
            height: Math.max(42, inputHeight), 
            fontSize: ts(14), 
            color: colorGray, 
            borderColor: colorGray 
          }]}
          multiline
          maxLength={250}
          onContentSizeChange={e => {
            let inputH = Math.max(e.nativeEvent.contentSize.height, 35);
            if (inputH > 120) inputH = 100;
            setInputHeight(inputH);
          }}
          placeholderTextColor="#111"
          onChangeText={setDescription}
          value={description}
        />          
        
        {description.length >= 200 && (
          <Text style={{ fontSize: ts(11), color: colorGray, fontWeight: '400', marginTop: -14.6 }}>
            Можете ввести еще {250 - description.length}{' '}
            {(250 - description.length) % 10 === 1 ? 'символ' : 
             (250 - description.length) % 10 === 2 || (250 - description.length) % 10 === 3 || (250 - description.length) % 10 === 4 ? 'символа' : 'символов'}
          </Text>
        )}
        
        <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>
          Заводской номер
        </Text>
        <TextInput
          style={[styles.input, { fontSize: ts(14), color: colorGray, borderColor: colorGray }]}
          placeholderTextColor="#111"
          onChangeText={setManufacturerNumber}
          value={manufacturerNumber} 
        />
        
        <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>
          Изготовитель
        </Text>
        
        {/* Выпадающий список для выбора изготовителя */}
        {statusOrg ? (
          <View style={{ width: '100%', alignItems: 'center' }}>
            <ListOfOrganizations 
              data={listOrganizations} 
              label='Изготовитель' 
              title={manufacturer ? manufacturer : 'Не выбрано'} 
              status={statusOrg} 
              post={manufacturer}
              onChange={(value) => setManufacturer(value)}
            />
          </View>
        ) : (
          // Если организаций нет в базе, показываем обычное текстовое поле
          <TextInput
            style={[styles.input, { fontSize: ts(14), color: colorGray, borderColor: colorGray }]}
            placeholderTextColor="#111"
            placeholder="Введите изготовителя вручную"
            onChangeText={setManufacturer}
            value={manufacturer} 
          />
        )}
        
        {/* Даты */}
        <View style={{ flexDirection: 'row', width: '100%' }}>
          <View style={{ width: '50%' }}>
            <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>
              Дата выдачи
            </Text>
          </View>
          <View style={{ width: '50%' }}>
            <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>
              Плановая дата
            </Text>
          </View>
        </View>
        
        <View style={{ flexDirection: 'row' }}>
          <DateInputWithPicker theme='min' onChange={setStartDate} />
          <DateInputWithPicker2 statusreq={true} post={planDate} theme='min' onChange={setPlanDate} />
        </View>
        
        <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>
          Комментарий
        </Text>
        <TextInput
          style={[styles.input, { fontSize: ts(14), color: colorGray, borderColor: colorGray }]}
          placeholderTextColor="#111"
          onChangeText={setComExp}
          value={comExp} 
        />
      </View>
      
      <View style={{ paddingBottom: BOTTOM_SAFE_AREA + 20 }}>
        <CustomButton
          disabled={disabled}
          title={isOffline ? "Сохранить локально" : "Добавить дефект"}
          handlePress={submitData}
        />
      </View>
    </KeyboardAwareScrollView>
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
    height: 42,
    borderRadius: 8,
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    padding: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFF4',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
    width: '96%',
  },
  offlineText: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '500',
  },
});

// Нужно добавить API_BASE_URL или использовать условный рендеринг
const API_BASE_URL = ''; // Добавьте ваш URL API