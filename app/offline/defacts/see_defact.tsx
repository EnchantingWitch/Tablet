import { brand } from '@/constants/Colors';
import { database } from '@/DB/database';
import DateInputWithPicker2 from '@/components/Calendar+';
import DateInputWithPicker from '@/components/CalendarOnWrite';
import CustomButton from '@/components/CustomButton';
import { default as ListOfOrganizations, default as ListOfSubobj } from '@/components/ListOfOrganizations';
import ListOfSystem from '@/components/ListOfSystem';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useColorGray, useColorText } from '@/hooks/useColorText';
import { Ionicons } from '@expo/vector-icons';
import { Q } from '@nozbe/watermelondb';
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  clamp,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

type Defect = {
  id: string;
  serialNumber: number;
  ii_number: string;
  subobject: string;
  system_name: string;
  description: string;
  defective_act_status: string;
  executor: string;
  start_date: string;
  end_date_plan: string;
  end_date_fact: string;
  defective_act_explanation: string;
  equipment: string;
  manufacturer: string;
  manufacturer_number: string;
  object_id: string;
  flag_from_server?: boolean;
};

type ListToDrop = {
  label: string;
  value: string;
};

type StructureItem = {
  subobject_name: string;
  data: Array<{
    system_name: string;
    ii_number: string;
    ciwexecutor: string;
    id_pnrsystem_from_db: string;
  }>;
};

type Organisation = {
  id: string;
  organisation: string;
};

const SeeDefact = () => {
  const BOTTOM_SAFE_AREA = Platform.OS === 'android' ? StatusBar.currentHeight : 0;
  const colorText = useColorText();
  const colorGray = useColorGray();
  
  const { capitalCSName } = useLocalSearchParams();
  const { post } = useLocalSearchParams();
  const { codeCCS } = useLocalSearchParams();
  const { defectData } = useLocalSearchParams();
  
  console.log('Defect ID from params:', post);
  console.log('Object codeCCS:', codeCCS);

  const [accessToken, setAccessToken] = useState<any>('');
  const fontScale = useWindowDimensions().fontScale;

  const ts = (fontSize: number) => {
    return (fontSize / fontScale);
  };

  // Состояния для данных дефекта
  const [serNumber, setSerNumber] = useState<string>('');
  const [numberII, setNumberII] = useState<string>('');
  const [subObj, setSubObj] = useState<string>('');
  const [systemN, setSystemN] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [defectiveActStatus, setDefectiveActStatus] = useState<string>('');
  const [startD, setStartD] = useState<string>('');
  const [planD, setPlanD] = useState<string>('');
  const [factD, setFactD] = useState<string>('');
  const [equipment, setEquipment] = useState<string>('');
  const [manufacturerNumber, setManufacturerNumber] = useState<string>('');
  const [manufacturer, setManufacturer] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [execut, setExecut] = useState<string>('');
  const [flagFromServer, setFlagFromServer] = useState<boolean>();
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Состояния для структуры
  const [structure, setStructure] = useState<StructureItem[]>([]);
  const [listSubObj, setListSubObj] = useState<ListToDrop[]>([]);
  const [listSystem, setListSystem] = useState<ListToDrop[]>([]);
  const [isLoadingStructure, setIsLoadingStructure] = useState<boolean>(true);

  // Состояния для изготовителя
  const [listOrganizations, setListOrganizations] = useState<ListToDrop[]>([]);
  const [statusOrg, setStatusOrg] = useState<boolean>(false);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState<boolean>(true);

  // Состояния для фото
  const [bytes, setBytes] = useState<string>('');
  const [contentType, setContentType] = useState<string>('');
  const [hasPhoto, setHasPhoto] = useState<boolean>(false);
  const [photoLoading, setPhotoLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>();
  const [originalDefect, setOriginalDefect] = useState<Defect | null>(null);
  const [statusPressDefAct, setStatusPressDefAct] = useState<any>(false);
  const [flagDate, setFlagDate] = useState<boolean>(false);

  // Зумирование фото
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const getToken = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token !== null) {
        console.log('Retrieved token:', token);
        setAccessToken(token);
      } else {
        console.log('No token found');
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
    }
  };

  // Получение списка организаций (изготовителей) из локальной базы данных
  // Получение списка организаций (изготовителей) из локальной базы данных
  const getOrganizationsFromDB = async () => {
    console.log('🔄 В ЗАПРОСЕ НА ОРГАНИЗАЦИИ');
    
    try {
      if (!database) {
        console.error('❌ Database is not initialized');
        return [];
      }

      // Пробуем оба варианта имени таблицы
      let organisationsCollection;
      try {
        // Сначала пробуем 'organisations' (согласно вашей схеме)
        organisationsCollection = database.collections.get('organisations');
      } catch (error) {
        console.log('⚠️ Таблица "organisations" не найдена, пробуем "organisation"');
        try {
          organisationsCollection = database.collections.get('organisation');
        } catch (error2) {
          console.error('❌ Ни одна таблица с организациями не найдена');
          return [];
        }
      }

      console.log('📊 Таблица организаций:', organisationsCollection);
      
      // Получаем все записи из таблицы
      const organisations = await organisationsCollection
        .query()
        .fetch();
      
      console.log(`📊 Найдено ${organisations.length} организаций в локальной базе`);
      
      // Логируем первые несколько записей для отладки
      if (organisations.length > 0) {
        organisations.slice(0, 3).forEach((org, index) => {
          console.log(`  ${index + 1}. id: ${org.id}, данные:`, {
            organisation: org.organisation,
            organisationName: org.organisationName,
            // Логируем все поля для отладки
            ...org._raw
          });
        });
      } else {
        console.log('⚠️ Таблица организаций пустая!');
      }
      
      // Преобразуем данные в нужный формат
      const transformedData = organisations.map((org) => {
        // Используем разные возможные поля
        const orgName = org.organisation || 'Неизвестная организация';
        
        return {
          label: orgName,
          value: orgName,
          id: org.id
        };
      });
      
      console.log('🔄 Преобразовано данных:', transformedData);
      
      // Сортируем по алфавиту
      const sortedData = transformedData.sort((a, b) => 
        a.label.localeCompare(b.label, 'ru', { sensitivity: 'base' })
      );
      
      // Добавляем опцию "Не выбрано"
      const finalData = [
        { label: 'Не выбрано', value: '' },
        ...sortedData
      ];
      
      console.log('✅ Итоговый список организаций:', finalData.length, 'записей');
      
      return finalData;
    } catch (error) {
      console.error('❌ Ошибка загрузки организаций из базы данных:', error);
      console.error('Детали ошибки:', error.message);
      
      // Для отладки выводим список всех доступных коллекций
      try {
        const collections = database.collections;
        console.log('📋 Доступные коллекции:', Object.keys(collections));
      } catch (e) {
        console.error('Не удалось получить список коллекций');
      }
      
      return [{ label: 'Не выбрано', value: '' }];
    }
  };

  // Получение структуры из локальной базы данных
  const getStructureFromDB = async () => {
    try {
      if (!database) {
        console.error('Database is not initialized');
        return [];
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

      return Object.values(groupedBySubobject);
    } catch (error) {
      console.error('Error loading structure from database:', error);
      return [];
    }
  };

  // Получение дефекта из локальной базы данных
  const getDefectFromDB = async () => {
    try {
      if (!database) {
        console.error('Database is not initialized');
        throw new Error('База данных не инициализирована');
      }

      const defactsCollection = database.collections.get('defacts');
      let defect;

      // Пытаемся найти по ID
      if (post && typeof post === 'string') {
        defect = await defactsCollection.find(post);
      }

      // Если не нашли по ID, ищем по object_id и ii_number
      if (!defect && codeCCS) {
        const defects = await defactsCollection
          .query(
            Q.where('object_id', codeCCS as string),
            Q.where('ii_number', post as string)
          )
          .fetch();
        
        if (defects.length > 0) {
          defect = defects[0];
        }
      }

      // Если переданы данные в параметрах
      if (!defect && defectData && typeof defectData === 'string') {
        try {
          const parsedData = JSON.parse(defectData);
          return parsedData;
        } catch (e) {
          console.error('Error parsing defectData:', e);
        }
      }

      if (!defect) {
        throw new Error('Дефект не найден в локальной базе данных');
      }

      return {
        id: defect.id,
        serialNumber: parseInt(defect.ii_number) || 0,
        ii_number: defect.ii_number || '',
        subobject: defect.subobject || '',
        system_name: defect.system_name || '',
        description: defect.description || '',
        defective_act_status: defect.defective_act_status || '',
        executor: defect.executor || '',
        start_date: defect.start_date || '',
        end_date_plan: defect.end_date_plan || '',
        end_date_fact: defect.end_date_fact || '',
        defective_act_explanation: defect.defective_act_explanation || '',
        equipment: defect.equipment || '',
        manufacturer: defect.manufacturer || '',
        manufacturer_number: defect.manufacturer_number || '',
        object_id: defect.object_id || '',
        flag_from_server: defect.flag_from_server 
      };
    } catch (error) {
      console.error('Error loading defect from database:', error);
      throw error;
    }
  };

  // Обновление списка систем при выборе подобъекта
  const handleSubObjectChange = (selectedSubObject: string) => {
    setSubObj(selectedSubObject);
    
    // Сбрасываем систему и связанные данные
    setSystemN(' ');
    setNumberII('');
    setExecut('');
    
    // Обновляем список систем для выбранного подобъекта
    if (selectedSubObject && structure.length > 0) {
      const filtered = structure.find(item => item.subobject_name === selectedSubObject);
      if (filtered) {
        const systemList = filtered.data.map(system => ({
          label: system.system_name,
          value: system.system_name
        }));
        setListSystem(systemList);
      } else {
        setListSystem([]);
      }
    }
  };

  // Обновление АИИ и исполнителя при выборе системы
  const handleSystemChange = (selectedSystem: string) => {
    setSystemN(selectedSystem);
    
    if (selectedSystem && subObj && structure.length > 0) {
      const filteredSubObj = structure.find(item => item.subobject_name === subObj);
      if (filteredSubObj) {
        const filteredSystem = filteredSubObj.data.find(item => item.system_name === selectedSystem);
        if (filteredSystem) {
          setNumberII(filteredSystem.ii_number || '');
          setExecut(filteredSystem.ciwexecutor || '');
        } else {
          setNumberII('');
          setExecut('');
        }
      }
    }
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const initializeData = async () => {
      try {
        await getToken();
        setIsOnline(!!accessToken);

         // Загружаем список организаций (изготовителей)
        const organizationsData = await getOrganizationsFromDB();
        setListOrganizations(organizationsData);
        setStatusOrg(organizationsData.length > 0);
        setIsLoadingOrganizations(false);

        // Загружаем структуру объекта
        const structureData = await getStructureFromDB();
        setStructure(structureData);
        
        // Формируем список подобъектов
        if (structureData.length > 0) {
          const subObjList = structureData.map(item => ({
            label: item.subobject_name,
            value: item.subobject_name
          }));
          setListSubObj(subObjList);
        }
        
        setIsLoadingStructure(false);

        // Загружаем данные дефекта
        const defectData = await getDefectFromDB();
        
        if (defectData) {
          setSerNumber(defectData.serialNumber.toString());
          setNumberII(defectData.ii_number.toString());
          setSubObj(defectData.subobject);
          setSystemN(defectData.system_name);
          setComment(defectData.description);
          setDefectiveActStatus(defectData.defective_act_status);
          setStartD(defectData.start_date);
          setPlanD(defectData.end_date_plan);
          setFactD(defectData.end_date_fact);
          setEquipment(defectData.equipment);
          setManufacturerNumber(defectData.manufacturer_number);
          setManufacturer(defectData.manufacturer);
          setExplanation(defectData.defective_act_explanation);
          setCode(defectData.object_id);
          setExecut(defectData.executor || '');
          setFlagFromServer(defectData.flag_from_server);
          setOriginalDefect(defectData);
          setFlagDate(true);
          
          // Автоматически устанавливаем режим редактирования по флагу
          setIsEditing(!defectData.flag_from_server);
          
          // Если есть выбранный подобъект, формируем список систем
          if (defectData.subobject && structureData.length > 0) {
            const filteredSubObj = structureData.find(item => item.subobject_name === defectData.subobject);
            if (filteredSubObj) {
              const systemList = filteredSubObj.data.map(system => ({
                label: system.system_name,
                value: system.system_name
              }));
              setListSystem(systemList);
            }
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing data:', error);
        Alert.alert(
          'Ошибка',
          'Не удалось загрузить данные дефекта. Проверьте подключение или загрузите данные заново.',
          [
            { text: 'OK', onPress: () => router.back() }
          ]
        );
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Обновление статуса при изменении даты устранения
  useEffect(() => {
    if (factD && factD.trim() !== '' && factD !== ' ') {
      setDefectiveActStatus('Устранено');
    } else {
      setDefectiveActStatus('Не устранено');
    }
  }, [factD]);

  // Обработчик сохранения изменений (только для локальных записей)
  const saveDefectLocally = async () => {
    if (flagFromServer) {
      Alert.alert(
        'Ограничение',
        'Нельзя сохранять изменения для дефектов с сервера в оффлайн-режиме'
      );
      return;
    }

    try {
      if (!database) {
        throw new Error('База данных не инициализирована');
      }

      // Проверка обязательных полей
      if (!subObj.trim() || !systemN.trim() || !comment.trim() || !equipment.trim()) {
        Alert.alert(
          'Ошибка',
          'Заполните обязательные поля: Подобъект, Система, Дефект, Оборудование'
        );
        return;
      }

      await database.write(async () => {
        const defactsCollection = database.collections.get('defacts');
        
        // Находим запись
        let defect;
        if (post && typeof post === 'string') {
          defect = await defactsCollection.find(post);
        } else if (originalDefect && originalDefect.id) {
          defect = await defactsCollection.find(originalDefect.id);
        }

        if (defect) {
          // Обновляем запись
          await defect.update((record: any) => {
            record.subobject = subObj;
            record.system_name = systemN;
            record.description = comment;
            record.defective_act_status = defectiveActStatus;
            record.defective_act_explanation = explanation;
            record.end_date_fact = factD;
            record.end_date_plan = planD;
            record.start_date = startD;
            record.executor = execut;
            record.ii_number = numberII;
            record.equipment = equipment;
            record.manufacturer = manufacturer;
            record.manufacturer_number = manufacturerNumber;
            // Локальные записи всегда имеют flag_from_server = false
            record.flag_from_server = false;
          });

          Alert.alert(
            'Успешно',
            'Изменения сохранены локально',
            [{ text: 'OK', onPress: () => router.push('/offline/(tabsWM)/defacts') }]
          );
        } else {
          throw new Error('Запись не найдена');
        }
      });
    } catch (error) {
      console.error('Error saving defect locally:', error);
      Alert.alert(
        'Ошибка',
        'Не удалось сохранить изменения локально'
      );
    }
  };

  // Удаление дефекта
  const handleDeleteDefect = async () => {
    Alert.alert(
      'Подтверждение',
      'Удалить этот дефект?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (!database) {
                throw new Error('База данных не инициализирована');
              }

              await database.write(async () => {
                const defactsCollection = database.collections.get('defacts');
                
                let defect;
                if (post && typeof post === 'string') {
                  defect = await defactsCollection.find(post);
                } else if (originalDefect && originalDefect.id) {
                  defect = await defactsCollection.find(originalDefect.id);
                }

                if (defect) {
                  await defect.markAsDeleted();
                  Alert.alert(
                    'Успешно',
                    'Дефект удален',
                    [{ text: 'OK', onPress: () => router.push('/offline/(tabsWM)/defacts') }]
                  );
                }
              });
            } catch (error) {
              console.error('Error deleting defect:', error);
              Alert.alert('Ошибка', 'Не удалось удалить дефект');
            }
          }
        }
      ]
    );
  };

  // Функции для работы с фото (остаются без изменений)
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

  function detectImageType(base64: string) {
    const signature = base64.substring(0, 30);
    if (signature.startsWith('/9j')) return 'image/jpeg';
    if (signature.startsWith('iVBOR')) return 'image/png';
    if (signature.startsWith('R0lGOD')) return 'image/gif';
    return 'image/jpeg';
  }

  async function downloadBase64Image(contentType = 'image/jpeg', bytes: string) {
    try {
      if (Platform.OS === 'android') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Ошибка', 'Необходимо разрешение на доступ к медиафайлам');
          return;
        }
      }

      const fileExtension = contentType.split('/')[1] || 'jpeg';
      const fileName = `photo_${Date.now()}.${fileExtension}`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      const base64Data = bytes.startsWith('data:') 
        ? bytes.split(',')[1] 
        : bytes;
      
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64
      });

      if (Platform.OS === 'ios') {
        await MediaLibrary.saveToLibraryAsync(fileUri);
      } else {
        const asset = await MediaLibrary.createAssetAsync(fileUri);
        await MediaLibrary.createAlbumAsync('Download', asset, false);
      }

      Alert.alert('Успех', 'Фото сохранено в галерею');
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить фото');
    }
  }

  async function shareImage(imageUri: string) {
    let tempUri = imageUri;
    
    try {
      if (!(await Sharing.isAvailableAsync())) {
        alert('Sharing не доступен');
        return;
      }

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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" style={{ flex: 1 }} />
      </View>
    );
  }

  return (
    <ScrollView>
      <View style={[styles.container]}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          {/* Индикатор режима */}
          {!isOnline && (
            <View style={styles.offlineIndicator}>
              <Ionicons name="cloud-offline" size={16} color={brand.yellow} />
              <Text style={styles.offlineText}>Оффлайн режим</Text>
            </View>
          )}

          {/* Индикатор источника данных */}
          <View style={[
            styles.sourceIndicator,
            flagFromServer ? styles.serverIndicator : styles.localIndicator
          ]}>
            <Ionicons 
              name={flagFromServer ? "cloud" : "save-outline"} 
              size={16} 
              color={flagFromServer ? brand.bluePrimary : brand.green} 
            />
            <Text style={[
              styles.sourceText,
              flagFromServer ? styles.serverText : styles.localText
            ]}>
              {flagFromServer ? "С сервера" : "Локальная запись"}
            </Text>
          </View>

          {/* Информация о режиме */}
          <View style={styles.modeInfo}>
            <Ionicons 
              name={isEditing ? "create-outline" : "eye-outline"} 
              size={14} 
              color={brand.gray} 
            />
            <Text style={styles.modeInfoText}>
              {isEditing ? "Режим редактирования" : "Режим просмотра"}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', width: '98%', marginBottom: 0 }}>
            <View style={{ width: '20%', alignItems: 'center' }}>
              <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>№</Text>
            </View>
            <View style={{ width: '20%', alignItems: 'center' }}>
              <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>№ АИИ</Text>
            </View>
            <View style={{ width: '60%', alignItems: 'center' }}>
              <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>Подобъект</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', width: '98%', marginBottom: 0, justifyContent: 'space-around'}}>
            <View style={{ width: '20%', alignItems: 'center' }}>
              <TextInput
                style={[styles.input, { 
                  fontSize: ts(14), 
                  marginTop: 6, 
                  borderColor: colorGray, 
                  color:  colorGray,
                  backgroundColor: brand.bgBlueLight
                }]}
                value={serNumber}
                editable={false}
                onChangeText={setSerNumber}
              />
            </View>
            
            <View style={{ width: '20%', alignItems: 'center' }}>
              <TextInput
                style={[styles.input, { 
                  fontSize: ts(14), 
                  marginTop: 6, 
                  borderColor: colorGray, 
                  color: colorGray,
                  backgroundColor: brand.bgBlueLight
                }]}
                value={numberII}
                editable={false}
              />
            </View>

            <View style={{ width: '60%', alignContent: 'flex-end' }}>
              {isEditing && listSubObj.length > 0 ? (
                <View style={{ width: '103%', paddingTop: 6 }}>
                  <ListOfSubobj 
                    data={listSubObj} 
                    post={subObj} 
                    status={listSubObj.length > 0}
                    label=''
                    title='' 
                    onChange={handleSubObjectChange}
                  />
                </View>
              ) : (
                <TextInput
                  style={[styles.input, { 
                    fontSize: ts(14), 
                    marginTop: 6, 
                    lineHeight: ts(19), 
                    borderColor: isEditing ? colorText : colorGray, 
                    color: isEditing ? colorText : colorGray,
                    backgroundColor: isEditing ? brand.white : brand.bgBlueLight
                  }]}
                  placeholderTextColor={brand.textPrimary}
                  value={subObj}
                  multiline
                  editable={isEditing}
                  onChangeText={setSubObj}
                  maxLength={45}
                />
              )}
            </View>
          </View>

          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Система</Text>
          
          {isEditing && listSystem.length > 0 ? (
            <View style={{ width: '100%', alignItems: 'center' }}>
              <ListOfSystem 
                list={listSystem}
                buf={systemN}
                post={systemN} 
                onChange={handleSystemChange}
              />
            </View>
          ) : (
            <TextInput
              style={[styles.input, { 
                fontSize: ts(14), 
                lineHeight: 19, 
                borderColor: isEditing ? colorText : colorGray, 
                color: isEditing ? colorText : colorGray,
                backgroundColor: isEditing ? brand.white : brand.bgBlueLight
              }]}
              placeholderTextColor={brand.textPrimary}
              value={systemN}
              multiline
              editable={isEditing}
              onChangeText={setSystemN}
            />
          )}

          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Оборудование</Text>
          <TextInput
            style={[styles.input, { 
              fontSize: ts(14), 
              lineHeight: 19, 
              borderColor:  colorGray, 
              color:  colorGray,
              backgroundColor: isEditing ? brand.white : brand.bgBlueLight
            }]}
            placeholderTextColor={brand.textPrimary}
            value={equipment}
            multiline
            editable={isEditing}
            onChangeText={setEquipment}
          />

          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Дефект</Text>
          <TextInput
            style={[styles.input, {
              height: 'auto',
              minHeight: 42,
              maxHeight: 100,
              fontSize: ts(14),
              borderColor: colorGray,
              color: colorGray,
              backgroundColor: isEditing ? brand.white : brand.bgBlueLight,
              textAlignVertical: 'top'
            }]}
            placeholderTextColor={brand.textPrimary}
            multiline
            value={comment}
            editable={isEditing}
            onChangeText={setComment}
          />

          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Заводской номер</Text>
          <TextInput
            style={[styles.input, { 
              fontSize: ts(14), 
              borderColor: colorGray, 
              color: colorGray,
              backgroundColor: isEditing ? brand.white : brand.bgBlueLight
            }]}
            placeholderTextColor={brand.textPrimary}
            value={manufacturerNumber}
            editable={isEditing}
            onChangeText={setManufacturerNumber}
          />

          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Статус</Text>
          <TextInput
            style={[styles.input, { 
              fontSize: ts(14), 
              borderColor: colorGray, 
              color: colorGray,
              backgroundColor: brand.bgBlueLight
            }]}
            placeholderTextColor={brand.textPrimary}
            value={defectiveActStatus}
            editable={false}
          />

          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Изготовитель</Text>
          
          {isEditing && statusOrg ? (
            <View style={{ width: '100%', alignItems: 'center' }}>
              <ListOfOrganizations 
                data={listOrganizations} 
                label='Изготовитель' 
                title={manufacturer ? manufacturer : 'Не выбрано'} 
                status={statusOrg} 
                post={manufacturer}
                onChange={setManufacturer}
              />
            </View>
          ) : (
            <TextInput
              style={[styles.input, { 
                fontSize: ts(14), 
                borderColor: isEditing ? colorText : colorGray, 
                color: isEditing ? colorText : colorGray,
                backgroundColor: isEditing ? brand.white : brand.bgBlueLight
              }]}
              placeholderTextColor={brand.textPrimary}
              value={manufacturer}
              editable={isEditing}
              onChangeText={setManufacturer}
            />
          )}

          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Исполнитель</Text>
          <TextInput
            style={[styles.input, { 
              fontSize: ts(14), 
              borderColor: colorGray, 
              color: colorGray,
              backgroundColor: brand.bgBlueLight
            }]}
            value={execut}
            editable={false}
          />

          <View style={{ flexDirection: 'row', width: '100%' }}>
            <View style={{ width: '50%' }}>
              <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>Дата выдачи</Text>
            </View>
            <View style={{ width: '50%' }}>
              <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>Плановая дата</Text>
            </View>
          </View>

          <View style={{flexDirection: 'row', width: isEditing ? '100%' : '96%', justifyContent: 'space-between'}}>
            {isEditing ? ( 
              <DateInputWithPicker theme='min' statusreq={true} post={startD} onChange={(dateString) => setStartD(dateString)}/>
            ) : (
                <TextInput
                  style={[styles.input, { 
                    fontSize: ts(14), 
                    width: '49%', 
                    marginTop: 6, 
                    borderColor: colorGray, 
                    color: colorGray,
                    backgroundColor: brand.bgBlueLight
                  }]}
                  value={startD}
                  editable={false}
                />
              )}
            
            {isEditing ? (
              <DateInputWithPicker2 theme='min' statusreq={true} post={planD || ' '} onChange={(dateString) => setPlanD(dateString)}/>
              ) : (
                <TextInput
                  style={[styles.input, { 
                    fontSize: ts(14), 
                    width: '49%', 
                    marginTop: 6, 
                    borderColor: colorGray, 
                    color: colorGray,
                    backgroundColor: brand.bgBlueLight
                  }]}
                  value={planD}
                  editable={false}
                />
              )}
          </View>

          <View style={{ flexDirection: 'row', width: '100%' }}>
            <View style={{ width: '50%' }}>
              <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>Дата устранения</Text>
            </View>
            <View style={{ width: '50%' }}>
              <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>Фото</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', width: '96%' }}>
            <View style={{ width: '49%', justifyContent: 'center' }}>
              {isEditing ? (
               <Text style={{ fontSize: ts(12), color: colorGray, textAlign: 'center', paddingVertical: 8 }}>
                  Не реализована работа с датой в оффлайн-режиме
                </Text>
              ) : (
                <TextInput
                  style={[styles.input, { 
                    fontSize: ts(14), 
                    width: '100%', 
                    marginTop: 6, 
                    borderColor: colorGray, 
                    color: colorGray,
                    backgroundColor: brand.bgBlueLight
                  }]}
                  value={factD}
                  editable={false}
                />
              )}
            </View>
            
            <View style={{ width: '49%' }}>
              {hasPhoto ? (
                <View style={{ width: '100%', paddingTop: 12 }}>
                  <TouchableOpacity style={{ alignSelf: 'flex-end', width: '94.5%' }} onPress={() => setModalVisible(true)}>
                    <Image
                      source={{ uri: `data:${contentType};base64,${bytes}` }}
                      style={styles.image}
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
                          <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity
                              onPress={() => downloadBase64Image(contentType, bytes)}
                              style={{ alignItems: 'center', width: '33%' }}
                            >
                              <Ionicons name='download-outline' size={30} color={colorGray} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => shareImage(`data:${contentType};base64,${bytes}`)}
                              style={{ alignItems: 'center', width: '33%' }}
                            >
                              <Ionicons name='share-social-outline' size={30} color={colorGray} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => setModalVisible(false)}
                              style={{ alignItems: 'center', width: '33%' }}
                            >
                              <Ionicons name='close-outline' size={30} color={colorGray} />
                            </TouchableOpacity>
                          </View>

                          <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, panGesture)}>
                            <Animated.View style={animatedStyle}>
                              <Image
                                source={{ uri: `data:${contentType};base64,${bytes}` }}
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
              ) : photoLoading ? (
                <ActivityIndicator size={'large'} style={{ paddingTop: 10 }} />
              ) : (
                <Text style={{ fontSize: ts(12), color: colorGray, textAlign: 'center', paddingVertical: 8 }}>
                  Не реализована работа с фото в оффлайн-режиме
                </Text>
              )}
            </View>
          </View>

          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: 400, marginBottom: 8 }}>Комментарий</Text>
          <TextInput
            style={[styles.input, { 
              fontSize: ts(14), 
              borderColor: colorGray, 
              color: colorGray,
              backgroundColor: isEditing ? brand.white : brand.bgBlueLight,
              textAlignVertical: 'top'
            }]}
            placeholderTextColor={brand.textPrimary}
            value={explanation}
            editable={isEditing}
            onChangeText={setExplanation}
            multiline
          />

          {/* Кнопки действий (только для локальных записей) */}
          {!flagFromServer && isEditing && (
            <View style={styles.actionButtons}>
              <CustomButton
                title="Сохранить локально"
                handlePress={saveDefectLocally}
                buttonStyle={styles.saveButton}
              />
              
              <View style={{ marginTop: 12 }}>
                <CustomButton
                  title="Удалить дефект"
                  handlePress={handleDeleteDefect}
                  buttonStyle={styles.deleteButton}
                />
              </View>
            </View>
          )}

          {/* Для серверных записей - только просмотр, кнопок нет */}
          {flagFromServer && (
            <View style={styles.viewOnlyMessage}>
              <Ionicons name="information-circle-outline" size={20} color={brand.gray} />
              <Text style={styles.viewOnlyText}>
                Этот дефект загружен с сервера. Для редактирования перейдите в онлайн-режим.
              </Text>
            </View>
          )}

          {/* Кнопка дефектного акта (только для серверных записей) */}
          {flagFromServer && isOnline && (
            <PermissionGuard required="JOURNAL_DOWNLOAD">
              <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 20 }}>
                {statusPressDefAct === false ? (
                  <TouchableOpacity
                    onPress={() => {
                      // Оригинальная логика скачивания дефектного акта
                      // handleDownloadAct(...)
                    }}
                    style={{ alignItems: 'center', flexDirection: 'row' }}
                  >
                    <Text
                      style={{
                        fontSize: ts(14),
                        fontWeight: "500",
                        textAlign: "center",
                        marginLeft: 7,
                        color: colorText,
                        borderBottomWidth: 1.5,
                        borderColor: colorText,
                      }}
                    >
                      Дефектный акт
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                    <Text
                      style={{
                        fontSize: ts(14),
                        fontWeight: "500",
                        textAlign: "center",
                        marginLeft: 7,
                        color: colorGray,
                        borderBottomWidth: 1.5,
                        borderColor: colorGray,
                      }}
                    >
                      Дефектный акт
                    </Text>
                  </View>
                )}
              </View>
            </PermissionGuard>
          )}

          <View style={{ 
            paddingBottom: BOTTOM_SAFE_AREA + 20,
            width: '100%'
          }}>
            {/* Пустой элемент для отступа */}
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
    backgroundColor: brand.yellowPale,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
    width: '96%',
  },
  sourceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
    width: '96%',
  },
  serverIndicator: {
    backgroundColor: brand.bgBlueLight,
  },
  localIndicator: {
    backgroundColor: brand.bgGreen,
  },
  offlineText: {
    fontSize: 14,
    color: brand.yellow,
    fontWeight: '500',
  },
  sourceText: {
    fontSize: 14,
    fontWeight: '500',
  },
  serverText: {
    color: brand.bluePrimary,
  },
  localText: {
    color: brand.green,
  },
  modeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brand.bgBlueLight,
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    gap: 6,
    width: '96%',
  },
  modeInfoText: {
    fontSize: 12,
    color: brand.gray,
    fontWeight: '400',
  },
  actionButtons: {
    width: '96%',
    marginTop: 20,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: brand.green,
  },
  deleteButton: {
    backgroundColor: brand.red,
  },
  viewOnlyMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: brand.bgBlueLight,
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 20,
    gap: 10,
    width: '96%',
  },
  viewOnlyText: {
    flex: 1,
    fontSize: 12,
    color: brand.gray,
    lineHeight: 16,
  },
});

export default SeeDefact;