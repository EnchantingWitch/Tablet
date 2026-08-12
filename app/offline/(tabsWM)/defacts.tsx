import CustomButton from '@/components/CustomButton';
import FloatingScrollToTop from "@/components/FloatingScrollToTop";
import HeaderForTabs from "@/components/HeaderForTabs";
import { PermissionGuard } from '@/components/PermissionGuard';
import SystemsForTwo from '@/components/SystemsForTwo';
import { database } from '@/DB/database'; // Импортируем WatermelonDB
import { useColorBlue, useColorSkyBlueCarpet, useColorText } from '@/hooks/useColorText';
import useDevice from '@/hooks/useDevice';
import { useScrollToLastViewedWithState } from '@/hooks/useScrollToLastViewedWithState';
import { useToken } from '@/hooks/useToken';
import { Ionicons } from '@expo/vector-icons';
import { Q } from '@nozbe/watermelondb';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableWithoutFeedback, useWindowDimensions, View } from 'react-native';

type Defect = {
  id: string; // ID из WatermelonDB
  serialNumber: number; // номер дефекта
  ii_number: string; // номер акта ИИ
  subobject: string; // подобъект
  system_name: string; // система
  description: string; // содержание
  defective_act_status: string; // статус дефекта
  executor: string; // исполнитель
  start_date: string; // дата выдачи
  end_date_plan: string; // плановая дата устранения
  end_date_fact: string; // фактическая дата устранения
  defective_act_explanation: string; // комментарий
  equipment: string; // оборудование
  manufacturer: string; // производитель
  manufacturer_number: string; // номер производителя
  object_id: string; // код CCS объекта
};

type ListToDrop = {
  label: string;
  value: string;
};

const Defacts = () => {
  // Добавьте ref для отслеживания инициализации
  const initialScrollDone = useRef(false);
  const { tokenFrAsync, getTokenFrAsync, saveTokenFrAsync } = useToken();
  const { isMobile, isDesktopWeb, isMobileWeb, screenWidth, screenHeight } = useDevice();
  const colorSkyBlue = useColorSkyBlueCarpet(0.4);
  const colorBlue = useColorBlue();
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<any>('');
  const [chooseSubobject, setChooseSubobject] = useState('');
  const [chooseSystem, setChooseSystem] = useState('');
  const [chooseStatus, setChooseStatus] = useState<string>('Все');
  const [listSubObj, setListSubObj] = useState<ListToDrop[]>([]);
  const [listSystem, setListSystem] = useState<ListToDrop[]>([]);
  const [status, setStatus] = useState(true);
  const [statusStructure, setStatusStructure] = useState(true);
  const [capitalCSName, setCapitalCSName] = useState('');
  const [codeCCS, setCodeCCS] = useState('');
  const [role, setRole] = useState('');
  
  const statusList = [
    { label: 'Все', value: 'Все' },
    { label: 'Устранено', value: 'Устранено' },
    { label: 'Не устранено', value: 'Не устранено' },
  ];
  
  const colorText = useColorText();
  const fontScale = useWindowDimensions().fontScale;
 
  const ts = (fontSize: number) => {
    return (fontSize / fontScale);
  };

  // Используем кастомный хук
  const { 
    flatListRef, 
    viewabilityConfig, 
    onViewableItemsChanged, 
    scrollToSelectedItem,
    lastViewedItem,
    setLastViewedItem,
    viewableItems
  } = useScrollToLastViewedWithState({
    idField: 'id',
    scrollToPosition: 1
  });

  const getToken = async (keyT: string, setF) => {
    try {
      const token = await SecureStore.getItemAsync(keyT);
      if (token !== null) {
        console.log('Retrieved token:', token);
        setF(token);
      } else {
        console.log('No token found');
        // Не перенаправляем на авторизацию в оффлайн режиме
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
    }
  };

  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState<Defect[]>([]);
  const [originalData, setOriginalData] = useState<Defect[]>([]);
  const [structure, setStructure] = useState<any[]>([]);

  // Получение дефектов из локальной базы данных
  const getDefectsFromDB = async () => {
    try {
      if (!database) {
        console.error('Database is not initialized');
        setLoading(false);
        return;
      }

      console.log(`🔍 Looking for defects with object_id = "${codeCCS}"`);
      
      const defactsCollection = database.collections.get('defacts');
      
      // Пытаемся найти разными способами
      let defects = [];
      
      // Способ 1: По object_id (основной)
      defects = await defactsCollection
        .query(
          Q.where('object_id', codeCCS),
          Q.sortBy('ii_number', Q.asc)
        )
        .fetch();
      
      console.log(`Found ${defects.length} defects by object_id`);
      
      // Если не нашли, пробуем по code_ccs
      if (defects.length === 0) {
        defects = await defactsCollection
          .query(
            Q.where('code_ccs', codeCCS),
            Q.sortBy('ii_number', Q.asc)
          )
          .fetch();
        
        console.log(`Found ${defects.length} defects by code_ccs`);
      }
      
      // Если все еще не нашли, проверяем все дефекты
      if (defects.length === 0) {
        const allDefects = await defactsCollection.query().fetch();
        console.log(`Total defects in database: ${allDefects.length}`);
        
        // Фильтруем вручную
        defects = allDefects.filter(defect => 
          defect.object_id === codeCCS || defect.code_ccs === codeCCS
        );
        
        console.log(`Found ${defects.length} defects by manual filtering`);
      }
      
      console.log(`✅ Total defects found for object ${codeCCS}: ${defects.length}`);
      
      // Преобразуем в нужный формат
      const formattedDefects: Defect[] = defects.map(defect => {
        const serialNumber = defect.ii_number ? parseInt(defect.ii_number) || 0 : 0;
        
        return {
          id: defect.id,
          serialNumber: serialNumber,
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
          object_id: defect.object_id || ''
        };
      });
      
      console.log(defects);
      setData(formattedDefects);
      setOriginalData(formattedDefects);
      setLoading(false);
      
    } catch (error) {
      console.error('Error loading defects from database:', error);
      setLoading(false);
    }
  };

  // Получение структуры из локальной базы данных
  const getStructureFromDB = async () => {
    try {
      if (!database) {
        console.error('Database is not initialized');
        return;
      }

      console.log(`🔍 Looking for systems with object_id = "${codeCCS}"`);
      
      const systemsCollection = database.collections.get('systems');
      
      // Пытаемся найти разными способами
      let systems = [];
      
      // Способ 1: По object_id
      systems = await systemsCollection
        .query(Q.where('object_id', codeCCS))
        .fetch();
      
      console.log(`Found ${systems.length} systems by object_id`);
      
      // Способ 2: По code_ccs
      if (systems.length === 0) {
        systems = await systemsCollection
          .query(Q.where('code_ccs', codeCCS))
          .fetch();
        
        console.log(`Found ${systems.length} systems by code_ccs`);
      }
      
      // Способ 3: Фильтрация вручную
      if (systems.length === 0) {
        const allSystems = await systemsCollection.query().fetch();
        console.log(`Total systems in database: ${allSystems.length}`);
        
        systems = allSystems.filter(system => 
          system.object_id === codeCCS || system.code_ccs === codeCCS
        );
        
        console.log(`Found ${systems.length} systems by manual filtering`);
      }
      
      console.log(`✅ Total systems found for object ${codeCCS}: ${systems.length}`);
      
      if (systems.length === 0) {
        console.log('⚠️ No systems found for this object');
        setStructure([]);
        return;
      }
      
      // Группируем по подобъектам
      const groupedBySubobject = {};
      
      systems.forEach(system => {
        const subObjectName = system.subobject_name || 'Не указан';
        const systemName = system.system_name || 'Не указана';
        
        if (!groupedBySubobject[subObjectName]) {
          groupedBySubobject[subObjectName] = {
            subObjectName: subObjectName,
            data: []
          };
        }
        
        groupedBySubobject[subObjectName].data.push({
          systemName: systemName,
          iiNumber: system.ii_number || '',
          ciwexecutor: system.ciwexecutor || '',
          pnrsystemId: system.id_pnrsystem_from_db || ''
        });
      });
      
      const formattedStructure = Object.values(groupedBySubobject);
      setStructure(formattedStructure);
      
      // Обновляем фильтры
      const subobjectNames = formattedStructure.map(item => item.subObjectName);
      const subObjList = subobjectNames.map((name) => ({
        label: name,
        value: name,
      }));
      setListSubObj([{ label: "Все подобъекты", value: "Все подобъекты" }, ...subObjList]);
      
      const allSystemNames = formattedStructure.flatMap((item) =>
        item.data.map((sys) => sys.systemName)
      );
      const uniqueSystemNames = [...new Set(allSystemNames)];
      const systemList = uniqueSystemNames.map((system) => ({
        label: system,
        value: system,
      }));
      setListSystem([{ label: "Все системы", value: "Все системы" }, ...systemList]);
      
    } catch (error) {
      console.error('❌ Error loading structure from database:', error);
    }
  };

  const getLastViewed = async (key: string, setF) => {
    try {
      const token = await getTokenFrAsync(key);
      if (token && token !== '' && token !== 'undefined') {
        setF(token);
      }
    } catch (error) {
      console.error('Error getting last viewed defect:', error);
    }
  };
  
  useEffect(() => {
    const initializeData = async () => {
      await getToken('accessToken', setAccessToken);
      await getToken('role', setRole);
      await getLastViewed('lastViewedDefect', setLastViewedItem);
      const name = await getTokenFrAsync('selectedNameCSS');
      const code = await getTokenFrAsync('selectedCodeCSS');
      
      setCapitalCSName(name || '');
      setCodeCCS(code || '');
      
      console.log("capitalCSName:", name);
      console.log("codeCCS:", code);
    };
    
    initializeData();
  }, []);

  // Отдельный эффект только для скролла
  useEffect(() => {
    if (data.length > 0 && lastViewedItem !== null && lastViewedItem !== undefined && !initialScrollDone.current) {
      console.log('Выполняем скролл к lastViewedItem:', lastViewedItem);
      
      setTimeout(() => {
        scrollToSelectedItem(data);
        initialScrollDone.current = true;
      });
    }
  }, [data, lastViewedItem, scrollToSelectedItem]);
  
  // Отдельный эффект для загрузки структуры
  useEffect(() => {
    if (statusStructure && codeCCS) {
      getStructureFromDB();
      setStatusStructure(false);
    }
  }, [statusStructure, codeCCS, accessToken]);

  useEffect(() => {
    if (codeCCS && status && accessToken) {
      console.log('ЗАПРОС К ЛБД НА ДЕФЕКТЫ !!!')
      getDefectsFromDB();
      setStatus(false);
    }
    // Формирование выпадающего списка для подобъекта
    if (structure.length > 0) {
      // Извлекаем уникальные названия подобъектов
      const subobjectNames = [...new Set(structure.map(item => item.subObjectName))];
      const buf = subobjectNames.map((item) => ({
        label: item,
        value: item,
      }));
      setListSubObj([{ label: "Все подобъекты", value: "Все подобъекты" }, ...buf]);

      // Извлекаем уникальные названия систем
      const allSystemNames = structure.flatMap((item) =>
        item.data.map((sys) => sys.systemName)
      );
      const uniqueSystemNames = [...new Set(allSystemNames)];
      const systemList = uniqueSystemNames.map((system) => ({
        label: system,
        value: system,
      }));
      setListSystem([{ label: "Все системы", value: "Все системы" }, ...systemList]);
    }
  }, [codeCCS, structure, status, accessToken]);

  // Добавление сброса выбранного значения в выпадающий список
  useEffect(() => {
    if (
      chooseSystem !== "" &&
      chooseSystem !== "Все системы" &&
      !listSystem.some((item) => item.value === "Все системы")
    ) {
      const item = { label: "Все системы", value: "Все системы" };
      setListSystem((prev) => [item, ...prev]);
    }
    
    if (
      chooseSubobject !== "" &&
      chooseSubobject !== "Все подобъекты" &&
      !listSubObj.some((item) => item.value === "Все подобъекты")
    ) {
      const item = { label: "Все подобъекты", value: "Все подобъекты" };
      setListSubObj((prev) => [item, ...prev]);
    }
  }, [chooseSystem, listSystem, chooseSubobject, listSubObj]);

  const filteredData = useMemo(() => {
    let result = originalData;

    // Фильтрация по подобъекту
    if (chooseSubobject && chooseSubobject !== "Все подобъекты") {
      result = result.filter((item) => item.subobject === chooseSubobject);
    }

    // Фильтрация по системе
    if (chooseSystem && chooseSystem !== "Все системы") {
      result = result.filter((item) => item.system_name === chooseSystem);
    }

    // Фильтрация по статусу
    if (chooseStatus && chooseStatus !== "Все") {
      if (chooseStatus === "Устранено") {
        result = result.filter((item) => item.defective_act_status === "Устранено");
      } else if (chooseStatus === "Не устранено") {
        result = result.filter((item) => item.defective_act_status === "Не устранено");
      }
    }

    return result;
  }, [originalData, chooseSubobject, chooseSystem, chooseStatus]);

  // Обновление данных при изменении фильтров
  useEffect(() => {
    setData(filteredData);
  }, [filteredData]);

  // ИКОНКА ДЛЯ СКРОЛА ВВЕРХ
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Определение достаточно ли было прокручено для показа иконки скрола вверх
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > screenHeight * 0.1);
  };
  
  // Запрос по новой при фокусе
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      setStatus(true); // стоят ограничения по ним на запрос к данным
      setStatusStructure(true);

      return () => {
        isActive = false; // Отмена запроса при уходе с экрана
      };
    }, [])
  );

  console.log('DEFACTS scrollToSelectedItem called with:', {
    dataLength: data.length,
    lastViewedItem,
    firstItemId: data[0]?.id
  });

  // Сохраняем lastViewedItem при уходе с экрана
  useEffect(() => {
    return () => {
      if (lastViewedItem) {
        AsyncStorage.setItem('lastViewedDefect', lastViewedItem.toString());
      }
    };
  }, [lastViewedItem]);

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <HeaderForTabs capitalCSName={capitalCSName} nameTab='Дефекты' role={role} path='../load_objs_WM'/>
      <View style={{
        flex: 1, alignItems: 'center'}}>
        
        <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '96%'}}>
          <SystemsForTwo list={listSubObj} nameFilter='Все подобъекты' width={135} onChange={(system) => setChooseSubobject(system)}/>
          <SystemsForTwo list={listSystem} nameFilter='Все системы' width={100} onChange={(system) => setChooseSystem(system)}/>
          <SystemsForTwo list={statusList} nameFilter='Все' width={100} onChange={(status) => setChooseStatus(status)}/>
        </View>

        <View style={{ flexDirection: 'row', width: '96%', height: 32, paddingTop: 6, justifyContent: 'space-between' }}>
          <Text style={{ fontSize: ts(14), color: colorText }}>№</Text>
          <Text style={{ fontSize: ts(14), color: colorText }}>Содержание</Text>
          <Text style={{ fontSize: ts(14), color: colorText }}>Статус</Text>
        </View>

        <View style={{ flex: 15, marginTop: 12}}>
          { isLoading ? (
            <ActivityIndicator />
          ) : data.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: ts(16), color: colorText, textAlign: 'center' }}>
                Нет сохраненных дефектов для этого объекта
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={data}
              style={{ width: "96%" }}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              keyExtractor={(item) => item.id || item.serialNumber.toString()}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              getItemLayout={(_, index) => ({
                length: 54,
                offset: 54 * index,
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
              renderItem={({item}) => (
                <TouchableWithoutFeedback onPress={() => { 
                  saveTokenFrAsync('lastViewedDefect', lastViewedItem?.toString());
                  router.push({
                    pathname: '../defacts/see_defact', 
                    params: { 
                      capitalCSName: capitalCSName, 
                      post: item.id || item.serialNumber.toString(), 
                      codeCCS: codeCCS,
                      // Передаем данные дефекта для оффлайн режима
                      defectData: JSON.stringify({
                        serialNumber: item.serialNumber,
                        subobject: item.subobject,
                        system_name: item.system_name,
                        description: item.description,
                        defective_act_status: item.defective_act_status,
                        executor: item.executor,
                        start_date: item.start_date,
                        end_date_plan: item.end_date_plan,
                        end_date_fact: item.end_date_fact,
                        defective_act_explanation: item.defective_act_explanation,
                        equipment: item.equipment,
                        manufacturer: item.manufacturer,
                        manufacturer_number: item.manufacturer_number,
                        ii_number: item.ii_number
                      })
                    }
                  });
                }}>
                  <View style={{ backgroundColor: colorSkyBlue, flexDirection: 'row', width: '100%', height: 37, justifyContent: 'center', marginBottom: 17, borderRadius: 8}}>
                    <View style={{width: '15%', justifyContent: 'center'}}>
                      <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'left' }}>{item.serialNumber}</Text>
                    </View>
                    <View style={{width: '75%', marginStart: 2, justifyContent: 'center'}}>
                      <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'left' }} numberOfLines={2}>
                        {item.description}
                      </Text>
                    </View>
                    <View style={{width: '7%', marginStart: 2, justifyContent: 'center'}}>
                      {(item.defective_act_status === 'Устранено') ? ( 
                        <Ionicons name="checkbox" size={25} color={colorBlue} />
                      ) : ( 
                        <Ionicons name="square" size={25} color="#ffffffff" />
                      )}
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              )}
            />
          )}
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

        {/* Кнопка добавления дефекта (только для онлайн режима или для создания локально) */}
        <PermissionGuard required='DEFACT_CREATE'>
          <CustomButton
            title="Добавить дефект"
            handlePress={() => {
              // Проверяем, есть ли доступ к интернету
              // Если нет - можно показать сообщение или сохранять локально
              router.push({
                pathname: '../defacts/create_defact', 
                params: { 
                  codeCCS: codeCCS, 
                  capitalCSName: capitalCSName,
                  isOfflineMode: "true" // Флаг оффлайн режима
                }
              });
            }} 
          />
        </PermissionGuard>
      </View>
    </View>
  );
};

export default Defacts;