// TabOneScreen.tsx (обновленная версия)
import CustomButton from '@/components/CustomButton';
import FloatingScrollToTop from "@/components/FloatingScrollToTop";
import Settings from '@/components/settings';
import { useColorBlue, useColorGray, useColorSkyBlueCarpet, useColorText } from '@/hooks/useColorText';
import useDevice from '@/hooks/useDevice';
import { useAuth } from '@/providers/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import { Q } from '@nozbe/watermelondb';
import { Checkbox } from 'expo-checkbox';
import { useNavigation, useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { default as React, useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View
} from 'react-native';
import { API_BASE_URL } from '../../config/api';
import { database } from '../../DB/database'; // Импортируем WatermelonDB
import { useToken } from '../../hooks/useToken';

type ConstructionObject = {
  capitalCSName: string;
  codeCCS: string;
};

type ViewableItemsChangedInfo = {
  viewableItems: any[];
  changed: any[];
};

export default function TabOneScreen() {
  const { isMobile, isDesktopWeb, isMobileWeb, screenWidth, screenHeight } = useDevice();
  const { deleteArrayToSecureStore, getTokenFrAsync, saveTokenFrAsync, removeTokenFrAsync } = useToken();
  const initialScrollDone = useRef(false);
  
  const colorText = useColorText();
  const colorSkyBlue = useColorSkyBlueCarpet(0.4);
  const colorTextGray = useColorGray();
  const colorBlue = useColorBlue();
  
  const BOTTOM_SAFE_AREA = Platform.OS === 'android' ? StatusBar.currentHeight : 0;
  const flatListRef = useRef<FlatList>(null);
  const [lastViewedItem, setLastViewedItem] = useState<string | null>(null);
  const [viewableItems, setViewableItems] = useState<string[]>([]);
  const fontScale = useWindowDimensions().fontScale;
  
  const ts = (fontSize: number) => {
    return (fontSize / fontScale);
  };

  const router = useRouter();
  const [filteredData, setFilteredData] = useState<ConstructionObject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [role, setRole] = useState('');
  const [data, setData] = useState<ConstructionObject[]>([]);
  const { hasPermission, isLoading } = useAuth();
  
  // Новые состояния для функциональности выбора
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedObjects, setSelectedObjects] = useState<ConstructionObject[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [maxSelectionReached, setMaxSelectionReached] = useState(false);
  
  const navigation = useNavigation();

  useEffect(() => {
  // Проверка инициализации базы данных
  const checkDatabase = async () => {
    try {
      if (!database) {
        console.error('Database is not defined');
        return;
      }
      
      // Проверяем доступность коллекций
      const collections = database.collections;
      console.log('Available collections:', Object.keys(collections));
      
      // Тестовый запрос
      const test = await database.collections
        .get('objects')
        .query()
        .fetchCount();
      
      console.log('Database test successful, objects count:', test);
    } catch (error) {
      console.error('Database check failed:', error);
    }
  };
  
  checkDatabase();
}, []);

  useEffect(() => {
    if (accessToken === '') {
      getToken('accessToken', setAccessToken);
      getToken('role', setRole);
    }
    if (accessToken) {
      getObjects();
    }
    
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name='exit-outline' size={25} style={{ alignSelf: 'center', color: colorText }}/>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={styles.headerRightContainer}>
          {/* Кнопка выбора объектов */}
          {hasPermission('MONITORING_DOWNLOAD') && (
            <TouchableOpacity 
              onPress={handleToggleSelectionMode}
              style={[
                styles.selectionButton,
                { 
                  backgroundColor: isSelectionMode ? colorBlue : 'transparent',
                  borderColor: isSelectionMode ? colorBlue : colorText
                }
              ]}
            >
              <Ionicons 
                name={isSelectionMode ? "checkbox" : "checkbox-outline"} 
                size={20} 
                color={isSelectionMode ? 'white' : colorText} 
              />
              <Text style={[
                styles.selectionButtonText,
                { color: isSelectionMode ? 'white' : colorText }
              ]}>
                {isSelectionMode ? `Выбрано: ${selectedObjects.length}/3` : ''}
              </Text>
            </TouchableOpacity>
          )}
          <Settings/>
        </View>
      ),
    });
  }, [navigation, accessToken, isSelectionMode, selectedObjects]);

  useEffect(() => {
    if (accessToken) {
      getObjects();
    }
  }, [accessToken]);

  const getLastViewedObj = async () => {
    try {
      const lastViewed = await getTokenFrAsync('lastViewedObj');
      if (lastViewed && lastViewed !== '' && lastViewed !== 'undefined') {
        setLastViewedItem(lastViewed);
      }
    } catch (error) {
      console.error('Error getting last viewed object:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await getLastViewedObj();
      await getToken('accessToken', setAccessToken);
      await getToken('role', setRole);
    };
    
    initializeData();
  }, []);

  useEffect(() => {
    if (filteredData.length > 0 && lastViewedItem !== null && !initialScrollDone.current) {
      console.log('Выполняем скролл к lastViewedItem:', lastViewedItem);
      scrollToSelectedItem();
      initialScrollDone.current = true;
    }
  }, [filteredData, lastViewedItem]);

  const getToken = async (key, setF) => {
    try {
      const token = await SecureStore.getItemAsync(key);
      if (token !== null) {
        setF(token);
      } else {
        console.log('No token found');
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
    }
  };

  const removeToken = async (tokenKey) => {
    try {
      await SecureStore.deleteItemAsync(tokenKey);
      console.log('Token - ', tokenKey, '- removed successfully!');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log(accessToken);
      if (accessToken !== null) {
        const str = `Bearer ${accessToken}`;
        console.log(str);
        
        let response = await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': str,
            'Content-Type': 'application/json',
          },
        });
        
        console.log('ResponseLogout:', response);
        if (response.status === 200) {
          removeToken('accessToken');
          removeToken('refreshToken');
          removeToken('userID');
          removeToken('role');
          removeToken('organisation');
          removeToken('fullName');
          deleteArrayToSecureStore('permissions');
          
          router.push('/sign/sign_in');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      router.push('/sign/sign_in');
    } finally {
      removeTokenFrAsync('lastViewedObj');
    }
  };

  const getObjects = async () => {
    console.log(`getObjects object.tsx ${accessToken}`);
    try {
      const userID = await SecureStore.getItemAsync('userID');
      const response = await fetch(`${API_BASE_URL}/user/getAllowedObjects/` + userID,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('responseGetAllowedObjects', response);
      const json = await response.json();
      setData(json);
      setFilteredData(json);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    let result = [...data];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.capitalCSName?.toLowerCase().includes(query)
      );
    }
    
    setFilteredData(result);
  }, [searchQuery, data]);

  const scrollToThis = (index: number, animated: boolean, viewPosition: number) => {
    flatListRef.current?.scrollToIndex({
      index: index,
      animated: animated,
      viewPosition: viewPosition
    });
  };

  const scrollToSelectedItem = () => {
    if (!filteredData.length) return;

    const selectedIndex = filteredData.findIndex(item => item.codeCCS === lastViewedItem);
    console.log('Found index:', selectedIndex, 'for codeCCS:', lastViewedItem);
    
    if (selectedIndex !== -1) {
      scrollToThis(selectedIndex, true, 1);
      return;
    }

    scrollToThis(0, true, 0);
  };

  const onViewableItemsChanged = useCallback(({ viewableItems: visibleItems }: ViewableItemsChangedInfo) => {
    const visibleIds = visibleItems
      .map(item => item.item?.codeCCS)
      .filter((codeCCS): codeCCS is string => codeCCS !== undefined && codeCCS !== null);
    
    setViewableItems(visibleIds);
    
    if (visibleIds.length > 0) {
      const lastItemId = visibleIds[visibleIds.length - 1];
      setLastViewedItem(lastItemId);
      saveTokenFrAsync('lastViewedObj', lastItemId);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 60,
    minimumViewTime: 100,
  };

  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > screenHeight * 0.1);
  };

  // ============ НОВЫЕ ФУНКЦИИ ДЛЯ ВЫБОРА ОБЪЕКТОВ ============

  const handleToggleSelectionMode = () => {
    if (!hasPermission('MONITORING_DOWNLOAD')) {
      Alert.alert('Ошибка', 'У вас нет прав для загрузки данных');
      return;
    }

    if (!isSelectionMode) {
      // Вход в режим выбора
      setShowInstructions(true);
    } else {
      // Выход из режима выбора
      if (selectedObjects.length > 0) {
        Alert.alert(
          'Завершить выбор',
          `Вы выбрали ${selectedObjects.length} объектов. Загрузить данные?`,
          [
            { text: 'Отмена', style: 'cancel' },
            { 
              text: 'Загрузить', 
              onPress: async () => {
                await handleDownloadData();
                setIsSelectionMode(false);
              }
            },
            { 
              text: 'Сбросить', 
              style: 'destructive',
              onPress: () => {
                setSelectedObjects([]);
                setIsSelectionMode(false);
                setMaxSelectionReached(false);
              }
            }
          ]
        );
      } else {
        setIsSelectionMode(false);
      }
    }
  };

  const handleObjectSelect = (item: ConstructionObject) => {
    if (!isSelectionMode) {
      // Обычный переход
      handleNormalNavigation(item);
    } else {
      // Режим выбора объектов
      handleSelectionModeNavigation(item);
    }
  };

  const handleNormalNavigation = (item: ConstructionObject) => {
    saveTokenFrAsync('lastViewedObj', lastViewedItem);
    removeTokenFrAsync('lastViewedDefect');
    removeTokenFrAsync('lastViewedJour');
    removeTokenFrAsync('lastViewedNote');
    removeTokenFrAsync('lastViewedStructureSection');
    removeTokenFrAsync('lastViewedStructureItem');
    removeTokenFrAsync('expandedSections');
    saveTokenFrAsync('selectedCodeCSS', item.codeCCS);
    saveTokenFrAsync('selectedNameCSS', item.capitalCSName);
    
    router.push({
      pathname: (hasPermission('OBJECT_VIEW')? '/(tabs)/object' : 
      hasPermission('MONITORING_DOWNLOAD') || hasPermission('LINKS_VIEW')? '/(tabs)/docs' :
      hasPermission('STRUCTURE_VIEW')? '/(tabs)/structure' :
      hasPermission('COMMENT_VIEW')? '/(tabs)/two' :
      hasPermission('DEFACT_VIEW')? '/(tabs)/defacts' :
      hasPermission('JOURNAL_VIEW')? '/(tabs)/jour' : '/'), 
      params: { codeCCS: item.codeCCS, capitalCSName: item.capitalCSName }
    });
  };

  const handleSelectionModeNavigation = (item: ConstructionObject) => {
    const isSelected = selectedObjects.some(obj => obj.codeCCS === item.codeCCS);
    
    if (isSelected) {
      // Удаление из выбранных
      setSelectedObjects(prev => prev.filter(obj => obj.codeCCS !== item.codeCCS));
      if (maxSelectionReached) setMaxSelectionReached(false);
    } else {
      // Добавление в выбранные (с проверкой ограничения)
      if (selectedObjects.length >= 3) {
        setMaxSelectionReached(true);
        setTimeout(() => setMaxSelectionReached(false), 3000);
        Alert.alert('Ограничение', 'Можно выбрать не более 3 объектов');
        return;
      }
      setSelectedObjects(prev => [...prev, item]);
    }
  };

  const handleDownloadData = async () => {
    if (selectedObjects.length === 0) {
      Alert.alert('Ошибка', 'Выберите хотя бы один объект');
      return;
    }

    setIsDownloading(true);
    try {
      const results = [];
      
      for (const obj of selectedObjects) {
        try {
          await fetchAndSaveObjectData(obj);
          results.push({ obj, success: true });
        } catch (error) {
          console.error(`Error fetching data for ${obj.codeCCS}:`, error);
          results.push({ obj, success: false, error: error.message });
        }
      }

      // Показываем результаты
      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;
      
      if (errorCount === 0) {
        Alert.alert(
          'Успешно',
          `Данные для ${successCount} объектов загружены и сохранены локально`,
          [{ text: 'OK' }]
        );
      } else {
        const errorMessages = results
          .filter(r => !r.success)
          .map(r => `${r.obj.capitalCSName}: ${r.error}`)
          .join('\n');
        
        Alert.alert(
          'Частично успешно',
          `Загружено: ${successCount} объектов\nОшибки:\n${errorMessages}`,
          [{ text: 'OK' }]
        );
      }
      
      // Сбрасываем выбор после загрузки
      setSelectedObjects([]);
    } catch (error) {
      console.error('Error in handleDownloadData:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить данные');
    } finally {
      setIsDownloading(false);
    }
  };

  const fetchAndSaveObjectData = async (obj: ConstructionObject) => {
    if (!accessToken) throw new Error('No access token');
    
    try {
      console.log('🔍 Начинаем загрузку данных для объекта:', obj.codeCCS);
      
      // Загружаем все данные параллельно
      const [notes, defects, structure, organisation] = await Promise.all([
        fetchNotes(obj.codeCCS),
        fetchDefects(obj.codeCCS),
        fetchStructure(obj.codeCCS),
        fetchOrganisation()
      ]);

      console.log('📊 Полученные данные:', {
        notesCount: notes.length,
        defectsCount: defects.length,
        structureCount: structure.length,
        organisationCount: organisation.length,
        organisationSample: organisation.slice(0, 3)
      });

      // Сохраняем в WatermelonDB
      await saveToWatermelonDB(obj, { notes, defects, structure, organisation });
      
    } catch (error) {
      console.error(`Error fetching data for ${obj.codeCCS}:`, error);
      throw error;
    }
  };

  const fetchNotes = async (codeCCS: string) => {
    const response = await fetch(
      `${API_BASE_URL}/comments/getAllComments/${codeCCS}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    console.log(response);
    return await response.json();
  };

  const fetchDefects = async (codeCCS: string) => {
    const response = await fetch(
      `${API_BASE_URL}/defectiveActs/getAllDefActs/${codeCCS}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

   // const dataNotes = await response.json()
   // console.log('data (json) of notes from fetch /defectiveActs/getAllDefActs/${codeCCS}',dataNotes)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    console.log(response);
    return await response.json();
  };
  
  const fetchOrganisation = async () => {
    const response = await fetch(
      `${API_BASE_URL}/organisations/getAll`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📥 Организации с сервера:', {
      count: data.length,
      firstFew: data.slice(0, 3),
      fullData: data // для отладки
    });
    
    return data;
  };

   // const dataNotes = await response.json()
   // console.log('data (json) of notes from fetch /defectiveActs/getAllDefActs/${codeCCS}',dataNotes)
 

  const fetchStructure = async (codeCCS: string) => {
    const response = await fetch(
      `${API_BASE_URL}/commons/getStructureCommonInf/${codeCCS}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    console.log(response);
     
    return await response.json();
  };


const cleanupAllDefectsForObject = async (objectId: string) => {
  try {
    console.log(`🧹 Starting cleanup for defects of object ${objectId}`);
    
    const defactsCollection = database.collections.get('defacts');
    
    // Находим ВСЕ дефекты в базе
    const allDefects = await defactsCollection.query().fetch();
    console.log(`📊 Total defects in database: ${allDefects.length}`);
    
    // Фильтруем дефекты для этого объекта
    const defectsToDelete = allDefects.filter(defect => {
      const matches = defect.object_id === objectId || 
                     defect.code_ccs === objectId ||
                     (!defect.object_id && defect.code_ccs === objectId);
      
      if (matches) {
        console.log(`🔍 Found defect to delete: id=${defect.id}, object_id="${defect.object_id}", code_ccs="${defect.code_ccs}", ii_number="${defect.ii_number}"`);
      }
      
      return matches;
    });
    
    console.log(`🧹 Found ${defectsToDelete.length} defects to delete for object ${objectId}`);
    
    if (defectsToDelete.length > 0) {
      await database.write(async () => {
        for (const defect of defectsToDelete) {
          console.log(`🗑️ Deleting: id=${defect.id}, ii_number="${defect.ii_number}"`);
          await defect.markAsDeleted();
        }
      });
      
      console.log(`✅ Deleted ${defectsToDelete.length} defects`);
    }
    
    return defectsToDelete.length;
  } catch (error) {
    console.error('Error in cleanupAllDefectsForObject:', error);
    return 0;
  }
};

 const cleanupUndefinedRecords = async () => {
  try {
    console.log('🧹 Cleaning up undefined records...');
    
    if (!database) {
      console.error('Database is not initialized');
      return;
    }
    
    let cleanedCount = 0;
    
    await database.write(async () => {
      // Очищаем notes с undefined object_id
      const notesCollection = database.collections.get('notes');
      const undefinedNotes = await notesCollection
        .query(Q.where('object_id', 'undefined'))
        .fetch();
      
      console.log(`Found ${undefinedNotes.length} notes with undefined object_id`);
      await Promise.all(undefinedNotes.map(note => note.markAsDeleted()));
      cleanedCount += undefinedNotes.length;
      
      // Также очищаем notes с пустым object_id
      const emptyNotes = await notesCollection
        .query(Q.where('object_id', ''))
        .fetch();
      
      console.log(`Found ${emptyNotes.length} notes with empty object_id`);
      await Promise.all(emptyNotes.map(note => note.markAsDeleted()));
      cleanedCount += emptyNotes.length;
      
      // Очищаем systems с undefined object_id
      const systemsCollection = database.collections.get('systems');
      const undefinedSystems = await systemsCollection
        .query(Q.where('object_id', 'undefined'))
        .fetch();
      
      console.log(`Found ${undefinedSystems.length} systems with undefined object_id`);
      await Promise.all(undefinedSystems.map(system => system.markAsDeleted()));
      cleanedCount += undefinedSystems.length;
      
      // Очищаем systems с пустым object_id
      const emptySystems = await systemsCollection
        .query(Q.where('object_id', ''))
        .fetch();
      
      console.log(`Found ${emptySystems.length} systems with empty object_id`);
      await Promise.all(emptySystems.map(system => system.markAsDeleted()));
      cleanedCount += emptySystems.length;
    });
    
    console.log(`✅ Cleaned up ${cleanedCount} undefined records`);
    return cleanedCount;
    
  } catch (error) {
    console.error('Error cleaning up undefined records:', error);
    return 0;
  }
};

const verifySavedData = async (objectId: string) => {
  try {
    console.log(`\n🔍 VERIFYING SAVED DATA FOR ${objectId}...`);
    
    // Сначала проверяем объект
    const objectsCollection = database.collections.get('objects');
    const savedObjects = await objectsCollection
      .query(Q.where('code_ccs', objectId))
      .fetch();
    
    console.log(`📦 Objects with code_ccs="${objectId}": ${savedObjects.length}`);
    savedObjects.forEach(obj => {
      console.log(`  - id: ${obj.id}, code_ccs: "${obj.code_ccs}", name: "${obj.code_name_ccs}"`);
    });
    
    // Проверяем системы разными способами
    const systemsCollection = database.collections.get('systems');
    
    // Способ 1: По object_id
    const systemsByObjectId = await systemsCollection
      .query(Q.where('object_id', objectId))
      .fetch();
    
    console.log(`\n⚙️ Systems with object_id="${objectId}": ${systemsByObjectId.length}`);
    
    // Способ 2: По code_ccs
    const systemsByCodeCcs = await systemsCollection
      .query(Q.where('code_ccs', objectId))
      .fetch();
    
    console.log(`⚙️ Systems with code_ccs="${objectId}": ${systemsByCodeCcs.length}`);
    
    // Способ 3: Все системы для анализа
    const allSystems = await systemsCollection.query().fetch();
    console.log(`⚙️ Total systems in database: ${allSystems.length}`);
    
    // Ищем системы с нужным object_id среди всех
    const foundSystems = allSystems.filter(system => 
      system.object_id === objectId || system.code_ccs === objectId
    );
    
    console.log(`⚙️ Found systems by filtering: ${foundSystems.length}`);
    
    if (foundSystems.length > 0) {
      console.log('\n📋 Found systems details:');
      foundSystems.slice(0, 10).forEach((system, index) => {
        console.log(`${index + 1}. object_id: "${system.object_id}", code_ccs: "${system.code_ccs}", system_name: "${system.system_name}", subobject_name: "${system.subobject_name}"`);
      });
      
      // Группируем по object_id для анализа
      const groupedByObjectId = {};
      foundSystems.forEach(system => {
        const objId = system.object_id || 'empty';
        if (!groupedByObjectId[objId]) {
          groupedByObjectId[objId] = [];
        }
        groupedByObjectId[objId].push(system);
      });
      
      console.log('\n📊 Grouped by object_id:');
      Object.keys(groupedByObjectId).forEach(objId => {
        console.log(`  object_id="${objId}": ${groupedByObjectId[objId].length} систем`);
      });
    }
    
    // Проверяем заметки
    const notesCollection = database.collections.get('notes');
    
    // Способ 1: По object_id
    const notesByObjectId = await notesCollection
      .query(Q.where('object_id', objectId))
      .fetch();
    
    console.log(`\n📝 Notes with object_id="${objectId}": ${notesByObjectId.length}`);
    
    // Способ 2: По code_ccs
    const notesByCodeCcs = await notesCollection
      .query(Q.where('code_ccs', objectId))
      .fetch();
    
    console.log(`📝 Notes with code_ccs="${objectId}": ${notesByCodeCcs.length}`);
    
    // Все заметки для анализа
    const allNotes = await notesCollection.query().fetch();
    console.log(`📝 Total notes in database: ${allNotes.length}`);
    
    // Ищем заметки с нужным object_id среди всех
    const foundNotes = allNotes.filter(note => 
      note.object_id === objectId || note.code_ccs === objectId
    );
    
    console.log(`📝 Found notes by filtering: ${foundNotes.length}`);
    
    if (foundNotes.length > 0) {
      console.log('\n📋 Found notes details:');
      foundNotes.forEach((note, index) => {
        console.log(`${index + 1}. object_id: "${note.object_id}", code_ccs: "${note.code_ccs}", ii_number: "${note.ii_number}", description: "${note.description?.substring(0, 50)}..."`);
      });
    }
    
    // Проверяем данные из ResponseGetNotes для сравнения
    console.log('\n📊 Comparing with ResponseGetNotes:');
    console.log('Server data has 1 note with:');
    console.log('- iiNumber: "3"');
    console.log('- subObject: "Линия электропередачи воздушная"');
    console.log('- systemName: "Электротехническое оборудование"');
    console.log('- description: "Мрл"');
    
    // Ищем заметку с ii_number = "3"
    const noteWithIi3 = allNotes.filter(note => note.ii_number === "3");
    console.log(`\n🔍 Notes with ii_number="3": ${noteWithIi3.length}`);
    noteWithIi3.forEach((note, index) => {
      console.log(`${index + 1}. object_id: "${note.object_id}", code_ccs: "${note.code_ccs}"`);
    });

     // Проверяем дефекты
    const defactsCollection = database.collections.get('defacts');
    const savedDefects = await defactsCollection
      .query(Q.where('object_id', objectId))
      .fetch();
    
    console.log(`\n🔍 Verifying defects for ${objectId}:`);
    console.log(`Total defects: ${savedDefects.length}`);
    
    savedDefects.forEach((defect, index) => {
      console.log(`${index + 1}. id: ${defect.id}, flag_from_server: ${defect.flag_from_server}, 
        object_id: "${defect.object_id}", ii_number: "${defect.ii_number}"`);
    });
    
    // Группируем по flag_from_server
    const trueFlags = savedDefects.filter(d => d.flag_from_server === true).length;
    const falseFlags = savedDefects.filter(d => d.flag_from_server === false).length;
    
    console.log(`\n📊 Flag statistics:`);
    console.log(`✅ flag_from_server = true: ${trueFlags}`);
    console.log(`❌ flag_from_server = false: ${falseFlags}`);
    
    
  } catch (error) {
    console.error('❌ Error verifying data:', error);
    console.error('Error details:', error.message);
  }
};

  const clearSelection = () => {
    setSelectedObjects([]);
    if (isSelectionMode && selectedObjects.length === 0) {
      setIsSelectionMode(false);
    }
  };
  

  const saveToWatermelonDB = async (obj: Object, data: any) => {
    if (!database) {
      console.error('Database is not initialized');
      return;
    }

    try {
      console.log('=== SAVING DATA TO WATERMELONDB ===');
      
      // Очищаем старые некорректные записи перед сохранением
      await cleanupUndefinedRecords();
      
      const objectId = obj.codeCCS;
      console.log(`Saving data for object: ${objectId} (${obj.capitalCSName})`);
      
      if (!objectId || objectId === 'undefined') {
        console.error('❌ Invalid objectId:', objectId);
        throw new Error('Invalid objectId');
      }

      // 1. ПОЛНАЯ ОЧИСТКА перед сохранением
      await cleanupAllDefectsForObject(objectId);

      await database.write(async () => {
        console.log(`📝 Starting write transaction for object: "${objectId}"`);
        
        // 1. Сохраняем объект
        const objectsCollection = database.collections.get('objects');
        const existingObjects = await objectsCollection
          .query(Q.where('code_ccs', objectId))
          .fetch();
        
        let objectRecord;
        if (existingObjects.length > 0) {
          objectRecord = existingObjects[0];
          console.log('Updating existing object');
          await objectRecord.update((record: any) => {
            record.code_name_ccs = obj.capitalCSName || '';
          });
        } else {
          console.log('Creating new object');
          objectRecord = await objectsCollection.create((record: any) => {
            record.code_ccs = objectId;
            record.code_name_ccs = obj.capitalCSName || '';
          });
        }

        // 2. Сохраняем замечания
        if (data.notes && Array.isArray(data.notes)) {
          const notesCollection = database.collections.get('notes');
          
          // Удаляем старые заметки для ЭТОГО объекта
          const existingNotes = await notesCollection
            .query(Q.where('object_id', objectId))
            .fetch();
          
          console.log(`Deleting ${existingNotes.length} old notes for object ${objectId}`);
          await Promise.all(existingNotes.map(note => note.markAsDeleted()));
          
          console.log(`Adding ${data.notes.length} new notes`);
          
          for (const note of data.notes) {
            const noteData = {
              object_id: objectId,
              code_ccs: objectId,
              id_from_server: note.commentId,
              ii_number: note.iiNumber?.toString() || '',
              subobject: note.subObject || '',
              system_name: note.systemName || '',
              description: note.description || '',
              comment_status: note.commentStatus || '',
              executor: note.executor || '',
              comment_category: note.commentCategory || '',
              comment_explanation: note.commentExplanation || '',
              start_date: note.startDate || '',
              end_date_plan: note.endDatePlan || '',
              end_date_fact: note.endDateFact || '',
              flag_from_server: true,
            };
            
            if (!noteData.object_id || noteData.object_id === 'undefined') {
              console.error('❌ Skipping note with invalid object_id:', noteData.object_id);
              continue;
            }
            
            await notesCollection.create((record: any) => {
              Object.keys(noteData).forEach(key => {
                record[key] = noteData[key];
              });
            });
          }
        }

        // 3. Сохраняем дефекты - ИСПРАВЛЕННАЯ ВЕРСИЯ
        if (data.defects && Array.isArray(data.defects)) {
          const defactsCollection = database.collections.get('defacts');
          
          console.log(`🔄 Processing ${data.defects.length} defects from server`);
          console.log('ResponseGetDefacts data:', JSON.stringify(data.defects, null, 2));
          
          for (const defect of data.defects) {
            // НОРМАЛИЗАЦИЯ ДАННЫХ - исправлено согласно ResponseGetDefacts
            const defectData = {
              object_id: objectId,
              code_ccs: objectId,
              id_from_server: defect.id?.toString() || '',
              ii_number: defect.iiNumber?.toString() || '',
              subobject: defect.subObject || '',
              system_name: defect.systemName || '',
              equipment: defect.equipment || '',
              description: defect.description || '',
              defective_act_status: defect.defectiveActStatus || '',
              executor: defect.executor || '',
              start_date: defect.startDate || '',
              end_date_plan: defect.endDatePlan || '',
              end_date_fact: defect.endDateFact || '',
              defective_act_explanation: defect.defectiveActExplanation || '',
              manufacturer: defect.manufacturer || '',
              manufacturer_number: defect.manufacturerNumber || '',
              flag_from_server: true, // ВСЕГДА true для данных с сервера
            };
            
            // ВАЛИДАЦИЯ
            if (!defectData.object_id || defectData.object_id === 'undefined') {
              console.error('❌ Skipping defect with invalid object_id');
              console.error('Defect:', defect);
              continue;
            }
            
            console.log(`💾 Creating defect: id_from_server="${defectData.id_from_server}", ii_number="${defectData.ii_number}"`);
            
            await defactsCollection.create((record: any) => {
              Object.keys(defectData).forEach(key => {
                record[key] = defectData[key];
              });
            });
          }
          
          console.log(`✅ Saved ${data.defects.length} defects for object ${objectId}`);
        } else {
          console.log('⚠️ No defects data or data.defects is not an array:', data.defects);
        }

        // 4. Сохраняем структуру
        if (data.structure && Array.isArray(data.structure)) {
          const systemsCollection = database.collections.get('systems');
          
          const existingSystems = await systemsCollection
            .query(Q.where('object_id', objectId))
            .fetch();
          
          console.log(`Deleting ${existingSystems.length} old systems for object ${objectId}`);
          await Promise.all(existingSystems.map(system => system.markAsDeleted()));
          
          let totalSavedSystems = 0;
          
          for (const structureItem of data.structure) {
            const subobjectName = structureItem.subObjectName || '';
            
            if (structureItem.data && Array.isArray(structureItem.data)) {
              for (const systemItem of structureItem.data) {
                const systemData = {
                  object_id: objectId,
                  code_ccs: objectId,
                  id_pnrsystem_from_db: systemItem.pnrsystemId?.toString() || '',
                  ii_number: systemItem.numberII || '',
                  system_name: systemItem.systemName || '',
                  ciwexecutor: systemItem.ciwexecutor || '',
                  subobject_id: structureItem.id?.toString() || '0',
                  subobject_name: subobjectName,
                };
                
                if (!systemData.object_id || systemData.object_id === 'undefined') {
                  console.error('❌ Skipping system with invalid object_id:', systemData.object_id);
                  continue;
                }
                
                await systemsCollection.create((record: any) => {
                  Object.keys(systemData).forEach(key => {
                    record[key] = systemData[key];
                  });
                });
                totalSavedSystems++;
              }
            }
          }
          console.log(`✅ Total systems saved: ${totalSavedSystems}`);
        }
        
        // 5. Сохраняем организации (ВАЖНАЯ ЧАСТЬ - КОТОРАЯ БЫЛА УДАЛЕНА)
        if (data.organisation && Array.isArray(data.organisation)) {
          console.log('🔄 Сохранение организаций...');
          
          // Пробуем разные имена таблиц
          let orgCollection;
          try {
            orgCollection = database.collections.get('organisations');
            console.log('✅ Используем таблицу "organisations"');
          } catch (error) {
            try {
              orgCollection = database.collections.get('organisation');
              console.log('✅ Используем таблицу "organisation"');
            } catch (error2) {
              console.error('❌ Таблица организаций не найдена');
              return;
            }
          }
          
          // Получаем текущие организации
          const existingOrgs = await orgCollection.query().fetch();
          console.log(`📊 Существующие организации: ${existingOrgs.length}`);
          
          // Удаляем старые организации (если нужно)
          if (existingOrgs.length > 0) {
            console.log(`🗑️ Удаление ${existingOrgs.length} старых организаций`);
            await Promise.all(existingOrgs.map(org => org.markAsDeleted()));
          }
          
          console.log(`➕ Добавление ${data.organisation.length} новых организаций`);
          
          // Сохраняем новые организации
          for (const org of data.organisation) {
            // Используем поле из ответа API
            const orgName = org.organisationName || org.organisation || org.name || '';
            
            if (!orgName || orgName.trim() === '') {
              console.log('⚠️ Пропуск пустой организации');
              continue;
            }
            
            await orgCollection.create((record: any) => {
              record.organisation = orgName;
              // Сохраняем в обоих полях для совместимости
              record.organisationName = orgName;
            });
          }
          
          console.log(`✅ Сохранено организаций: ${data.organisation.length}`);
          
          // Проверяем сохранение
          const savedOrgs = await orgCollection.query().fetch();
          console.log(`📊 Проверка: сохранено ${savedOrgs.length} организаций`);
          savedOrgs.forEach((org, index) => {
            console.log(`  ${index + 1}. "${org.organisation}"`);
          });
        } else {
          console.log('⚠️ Нет данных организаций или data.organisation не массив:', data.organisation);
          console.log('Тип data.organisation:', typeof data.organisation);
          console.log('Содержимое data:', Object.keys(data));
        }
      });
      
      console.log(`✅ Data saved successfully for ${objectId}`);
      
      // Даем время на сохранение и проверяем
      await new Promise(resolve => setTimeout(resolve, 1000));
      await verifySavedData(objectId);
      
    } catch (error) {
      console.error('❌ Error saving to WatermelonDB:', error);
      console.error('Error details:', error.message);
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
      throw error;
    }
  };

  // ============ RENDER ФУНКЦИИ ============

  const renderItem = ({ item }: { item: ConstructionObject }) => (
    <TouchableWithoutFeedback onPress={() => handleObjectSelect(item)}>
      <View style={[
        styles.objectItem,
        { 
          backgroundColor: isSelectionMode && selectedObjects.some(obj => obj.codeCCS === item.codeCCS) 
            ? 'rgba(0, 122, 255, 0.1)' 
            : colorSkyBlue 
        }
      ]}>
        {isSelectionMode && (
          <View style={styles.checkboxContainer}>
            <Checkbox
              style={styles.checkbox}
              value={selectedObjects.some(obj => obj.codeCCS === item.codeCCS)}
              onValueChange={() => handleObjectSelect(item)}
              color={colorBlue}
            />
          </View>
        )}
        
        <View style={styles.objectInfo}>
          <Text style={[
            styles.objectName,
            { 
              color: colorText,
              fontWeight: isSelectionMode && selectedObjects.some(obj => obj.codeCCS === item.codeCCS) 
                ? '600' 
                : 'normal'
            }
          ]}>
            {item.capitalCSName}
          </Text>
          
          {isSelectionMode && selectedObjects.some(obj => obj.codeCCS === item.codeCCS) && (
            <Ionicons name="checkmark-circle" size={16} color={colorBlue} style={styles.checkIcon} />
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.container}>
        {/* Панель поиска и информации о выборе */}
        <View style={styles.topPanel}>
          <TextInput 
            style={styles.searchInput}
            placeholder="Поиск по объекту строительства"
            placeholderTextColor={colorTextGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          {isSelectionMode && (
            <View style={styles.selectionInfo}>
              <Text style={styles.selectionInfoText}>
                Выбрано: {selectedObjects.length} из 3
              </Text>
              {selectedObjects.length > 0 && (
                <TouchableOpacity onPress={clearSelection}>
                  <Text style={styles.clearSelectionText}>Очистить</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Предупреждение о максимальном выборе */}
        {maxSelectionReached && (
          <View style={styles.maxSelectionWarning}>
            <Ionicons name="warning" size={16} color="#FF9500" />
            <Text style={styles.maxSelectionText}>
              Можно выбрать не более 3 объектов
            </Text>
          </View>
        )}

        {/* Список объектов */}
        <FlatList
          ref={flatListRef}
          style={styles.list}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          data={filteredData}
          keyExtractor={({ codeCCS }) => codeCCS}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(_, index) => ({
            length: isSelectionMode ? 64 : 40,
            offset: (isSelectionMode ? 64 : 40) * index,
            index,
          })}
          onScrollToIndexFailed={(info) => {
            const wait = new Promise(resolve => setTimeout(resolve, 500));
            wait.then(() => {
              flatListRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
              });
            });
          }}
          renderItem={renderItem}
        />
        
        <FloatingScrollToTop
          visible={showScrollTop}
          onPress={() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToIndex({
                index: 0,
                animated: true,
                viewPosition: 0
              });
            }
          }}
          position={{ bottom: 40, right: 20 }}
        />
      </View>

      {/* Кнопки действий */}
      <View style={[styles.bottomButtons, { paddingBottom: BOTTOM_SAFE_AREA + 20 }]}>
        {isSelectionMode && selectedObjects.length > 0 ? (
          <CustomButton 
            title={isDownloading ? 'Загрузка...' : `Загрузить данные (${selectedObjects.length})`}
            handlePress={handleDownloadData}
            disabled={isDownloading}
          />
        ) : (
          <>
            <CustomButton 
              title='Добавить объект' 
              handlePress={() => {
                router.push({ pathname: '/objs/add_obj', params: { accessToken: accessToken } })
              }}
            />
            <CustomButton 
              title='Проверка оффлайн режима' 
              handlePress={() => {
                router.push({ pathname: '../offline/load_objs_WM' })
              }}
            />
            <CustomButton 
              title='Тест бд на ошибки' 
              handlePress={() => {
                router.push({ pathname: './text' })
              }}
            />
          </>
        )}
      </View>

      {/* Модальное окно с инструкциями */}
      <InstructionsModal
        visible={showInstructions}
        onClose={() => setShowInstructions(false)}
        onConfirm={() => {
          setShowInstructions(false);
          setIsSelectionMode(true);
        }}
      />
    </SafeAreaView>
  );
}

// ============ КОМПОНЕНТ МОДАЛЬНОГО ОКНА ============

interface InstructionsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({
  visible,
  onClose,
  onConfirm
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.content}>
          <Text style={modalStyles.title}>Режим выбора объектов</Text>
          
          <View style={modalStyles.instruction}>
            <Ionicons name="checkbox-outline" size={20} color="#007AFF" />
            <Text style={modalStyles.instructionText}>
              Выберите объекты (максимум 3)
            </Text>
          </View>
          
          <View style={modalStyles.instruction}>
            <Ionicons name="download-outline" size={20} color="#007AFF" />
            <Text style={modalStyles.instructionText}>
              Для выбранных объектов будут загружены: структура, замечания и дефекты
            </Text>
          </View>
          
          <View style={modalStyles.instruction}>
            <Ionicons name="save-outline" size={20} color="#007AFF" />
            <Text style={modalStyles.instructionText}>
              Данные сохраняются локально для оффлайн-доступа
            </Text>
          </View>
          
          <View style={modalStyles.buttons}>
            <TouchableOpacity
              style={[modalStyles.button, modalStyles.cancelButton]}
              onPress={onClose}
            >
              <Text style={modalStyles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[modalStyles.button, modalStyles.confirmButton]}
              onPress={onConfirm}
            >
              <Text style={modalStyles.confirmButtonText}>Ок</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ============ СТИЛИ ============

const styles = StyleSheet.create({
  container: {
    paddingTop: 6,
    flex: 1,
    alignSelf: 'center',
    width: '96%',
    height: '100%',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  selectionButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  topPanel: {
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    fontSize: 14,
    color: '#000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F2F2F7',
  },
  selectionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  selectionInfoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  clearSelectionText: {
    fontSize: 14,
    color: '#FF3B30',
    textDecorationLine: 'underline',
  },
  maxSelectionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  maxSelectionText: {
    fontSize: 14,
    color: '#FF9500',
    flex: 1,
  },
  list: {
    width: "100%",
  },
  objectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    minHeight: 40,
    marginBottom: 12,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
  },
  objectInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  objectName: {
    fontSize: 14,
    flex: 1,
  },
  checkIcon: {
    marginLeft: 8,
  },
  bottomButtons: {
    paddingHorizontal: 16,
    gap: 12,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  instructionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
    color: '#000',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});