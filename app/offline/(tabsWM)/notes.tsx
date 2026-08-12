import CustomButton from "@/components/CustomButton";
import FloatingScrollToTop from "@/components/FloatingScrollToTop";
import HeaderForTabs from "@/components/HeaderForTabs";
import { PermissionGuard } from "@/components/PermissionGuard";
import SystemsForTwo from "@/components/SystemsForTwo";
import { database } from '@/DB/database'; // Импортируем WatermelonDB
import { useColorBlue, useColorGreen, useColorOrange, useColorRed, useColorSkyBlueCarpet, useColorText } from "@/hooks/useColorText";
import useDevice from '@/hooks/useDevice';
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { Q } from '@nozbe/watermelondb';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View
} from "react-native";
import { styles } from '../../../constants/Colors';
import { useScrollToLastViewedWithState } from '../../../hooks/useScrollToLastViewedWithState';
import { useToken } from '../../../hooks/useToken';

type Note = {
  id: string; // ID из WatermelonDB
  commentId?: number; // ID замечания с сервера
  serialNumber: number; // номер замечания
  subobject: string; // исправлено с subObject
  system_name: string; // исправлено с systemName
  description: string;
  comment_status: string; // исправлено с commentStatus
  comment_category: string; // исправлено с commentCategory
  start_date: string; // исправлено с startDate
  end_date_plan: string; // исправлено с endDatePlan
  end_date_fact: string; // исправлено с endDateFact
  comment_explanation: string; // исправлено с commentExplanation
  ii_number: number; // номер акта ИИ (исправлено с iinumber)
  object_id: string; // код CCS объекта
  user_name?: string; // имя пользователя
  executor?: string; // исполнитель
};

type ListToDrop = {
  label: string;
  value: string;
};

const DirectionLayout = () => {
  const { isMobile, isDesktopWeb, isMobileWeb, screenWidth, screenHeight } = useDevice();
  const { tokenFrAsync, getTokenFrAsync, saveTokenFrAsync } = useToken();
  const colorText = useColorText();
  const colorSkyBlue = useColorSkyBlueCarpet(0.4);
  const colorBlue = useColorBlue();
  const router = useRouter();
  
  // Добавьте ref для отслеживания инициализации
  const initialScrollDone = useRef(false);
  
  const [accessToken, setAccessToken] = useState<any>("");
  const [role, setRole] = useState('');
  const [codeCCS, setCodeCCS] = useState('');
  const [capitalCSName, setCapitalCSName] = useState('');
  
  const [chooseSubobject, setChooseSubobject] = useState("");
  const [chooseSystem, setChooseSystem] = useState("");
  const [chooseStatus, setChooseStatus] = useState<string>("Все");
  const [listSubObj, setListSubObj] = useState<ListToDrop[]>([]);
  const [listSystem, setListSystem] = useState<ListToDrop[]>([]);
  const [status, setStatus] = useState(true);
  const [statusStructure, setStatusStructure] = useState(true);
  const [visibleLegend, setVisibleLegend] = useState(false);
  
  const statusList = [
    { label: "Все", value: "Все" },
    { label: "Устранено", value: "Устранено" },
    { label: "Не устранено", value: "Не устранено" },
  ];
  
  const fontScale = useWindowDimensions().fontScale;

  const ts = (fontSize: number) => {
    return fontSize / fontScale;
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
    idField: 'serialNumber', // Используем serialNumber для идентификации
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
  const [data, setData] = useState<Note[]>([]);
  const [originalData, setOriginalData] = useState<Note[]>([]);
  const [structure, setStructure] = useState<any[]>([]);

  // Получение заметок из локальной базы данных
 const getNotesFromDB = async () => {
  try {
    if (!database) {
      console.error('Database is not initialized');
      setLoading(false);
      return;
    }

    console.log(`🔍 Looking for notes with object_id = "${codeCCS}"`);
    
    const notesCollection = database.collections.get('notes');
    
    // Пытаемся найти разными способами
    let notes = [];
    
    // Способ 1: По object_id (основной)
    notes = await notesCollection
      .query(
        Q.where('object_id', codeCCS),
        Q.sortBy('ii_number', Q.asc)
      )
      .fetch();
    
    console.log(`Found ${notes.length} notes by object_id`);
    
    // Если не нашли, пробуем по code_ccs
    if (notes.length === 0) {
      notes = await notesCollection
        .query(
          Q.where('code_ccs', codeCCS),
          Q.sortBy('ii_number', Q.asc)
        )
        .fetch();
      
      console.log(`Found ${notes.length} notes by code_ccs`);
    }
    
    // Если все еще не нашли, проверяем все заметки
    if (notes.length === 0) {
      const allNotes = await notesCollection.query().fetch();
      console.log(`Total notes in database: ${allNotes.length}`);
      
      // Фильтруем вручную
      notes = allNotes.filter(note => 
        note.object_id === codeCCS || note.code_ccs === codeCCS
      );
      
      console.log(`Found ${notes.length} notes by manual filtering`);
      
      // Логируем все заметки для отладки
      allNotes.slice(0, 5).forEach((note, index) => {
        console.log(`${index + 1}. object_id: "${note.object_id}", code_ccs: "${note.code_ccs}", ii_number: "${note.ii_number}"`);
      });
    }
    
    console.log(`✅ Total notes found for object ${codeCCS}: ${notes.length}`);
    
    // Преобразуем в нужный формат
    const formattedNotes: Note[] = notes.map(note => {
      const iiNumber = note.ii_number ? parseInt(note.ii_number) || 0 : 0;
      
      return {
        id: note.id,
        commentId: iiNumber,
        serialNumber: iiNumber,
        subobject: note.subobject || '',
        system_name: note.system_name || '',
        description: note.description || '',
        comment_status: note.comment_status || '',
        comment_category: note.comment_category || '',
        start_date: note.start_date || '',
        end_date_plan: note.end_date_plan || '',
        end_date_fact: note.end_date_fact || '',
        comment_explanation: note.comment_explanation || '',
        ii_number: iiNumber,
        object_id: note.object_id || '',
        user_name: note.user_name || '',
        executor: note.executor || ''
      };
    });
    
    setData(formattedNotes);
    setOriginalData(formattedNotes);
    setLoading(false);
    
  } catch (error) {
    console.error('Error loading notes from database:', error);
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
    
    // Логируем найденные системы
    systems.slice(0, 5).forEach((system, index) => {
      console.log(`${index + 1}. system_name: "${system.system_name}", subobject_name: "${system.subobject_name}"`);
    });
    
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

  const getLastViewedNote = async () => {
    try {
      const token = await getTokenFrAsync('lastViewedNote');
      if (token && token !== '' && token !== 'undefined') {
        const lastViewedNumber = parseInt(token, 10);
        if (!isNaN(lastViewedNumber)) {
          setLastViewedItem(lastViewedNumber);
        }
      }
    } catch (error) {
      console.error('Error getting last viewed note:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await getToken('accessToken', setAccessToken);
      await getToken('role', setRole);
      await getLastViewedNote();
      
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
  }, [statusStructure, codeCCS]);

  useEffect(() => {
    if (codeCCS && status) {
      getNotesFromDB();
      setStatus(false);
    }
  }, [codeCCS, status]);

    useEffect(() => {
    // Формирование выпадающего списка для подобъекта
    if (structure.length > 0) {
      // Извлекаем уникальные названия подобъектов
      const subobjectNames = [...new Set(structure.map(item => item.subObjectName))];
      const buf = subobjectNames.map((item) => ({
        label: item,
        value: item,
      }));
      setListSubObj(buf);

      // Извлекаем уникальные названия систем
      const allSystemNames = structure.flatMap((item) =>
        item.data.map((sys) => sys.systemName)
      );
      const uniqueSystemNames = [...new Set(allSystemNames)];
      const systemList = uniqueSystemNames.map((system) => ({
        label: system,
        value: system,
      }));
      setListSystem(systemList);
    }
  }, [structure])

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
        result = result.filter((item) => item.comment_status === "Устранено");
      } else if (chooseStatus === "Не устранено") {
        result = result.filter((item) => 
          item.comment_status === "Не устранено" || 
          item.comment_status === "Выдано" ||
          item.comment_status === "Принято" ||
          item.comment_status === "Предъявлено на устранение" ||
          item.comment_status === "Просрочено" ||
          item.comment_status === "Отклонено"
        );
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

  console.log('TWO scrollToSelectedItem called with:', {
    dataLength: data.length,
    lastViewedItem,
    firstItemId: data[0]?.serialNumber
  });

  // Сохраняем lastViewedItem при уходе с экрана
  useEffect(() => {
    return () => {
      if (lastViewedItem) {
        AsyncStorage.setItem('lastViewedNote', lastViewedItem.toString());
      }
    };
  }, [lastViewedItem]);

  // Функция для отображения статуса с иконками
  const renderStatusIcon = (status: string) => {
    switch (status) {
      case "Выдано":
        return <Ionicons name="square-outline" size={25} color={colorText} />;
      case "Отклонено":
        return <AntDesign name="minussquare" size={23} color={useColorOrange()} />;
      case "Принято":
        return <Ionicons name="square" size={25} color={colorBlue} />;
      case "Предъявлено на устранение":
        return <AntDesign name="rightsquare" size={23} color={colorBlue} />;
      case "Не устранено":
        return <AntDesign name="closesquare" size={23} color={useColorRed()} />;
      case "Устранено":
        return <AntDesign name="checksquare" size={23} color={useColorGreen()} />;
      case "Просрочено":
        return <Ionicons name="square" size={25} color={useColorOrange()} />;
      default:
        return <Ionicons name="square-outline" size={25} color={colorText} />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <HeaderForTabs nameTab="Замечания" capitalCSName={capitalCSName} role={role} path='../load_objs_WM'/>
      
      <View style={{ flex: 1, alignItems: "center" }}>
        <View style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "96%",
        }}>
          <SystemsForTwo
            list={listSubObj}
            nameFilter="Все подобъекты"
            width={135}
            onChange={(system) => setChooseSubobject(system)}
          />
          <SystemsForTwo
            list={listSystem}
            nameFilter="Все системы"
            width={100}
            onChange={(system) => setChooseSystem(system)}
          />
          <SystemsForTwo
            list={statusList}
            nameFilter="Все"
            width={100}
            onChange={(status) => setChooseStatus(status)}
          />
        </View>

        <View style={{
          flexDirection: "row",
          width: "96%",
          height: 32,
          paddingTop: 6,
        }}>
          <View style={{ width: '12%' }}>
            <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'center' }}>№</Text>
          </View>
          <View style={{ width: '73%' }}>
            <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'center' }}>Содержание</Text>
          </View>
          <View style={{ width: '14%', flexDirection: 'column' }}>
            <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'center' }}>Статус</Text>
            <TouchableOpacity onPress={() => setVisibleLegend(true)}>
              <Ionicons name='help-circle-outline' size={20} style={{ alignSelf: 'center', width: 22, color: colorBlue }} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={{ flex: 5, alignItems: 'center' }}>
        {isLoading ? (
          <ActivityIndicator />
        ) : data.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: ts(16), color: colorText, textAlign: 'center' }}>
              Нет сохраненных замечаний для этого объекта
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
            renderItem={({ item }) => (
              <TouchableWithoutFeedback
                onPress={() => {
                  saveTokenFrAsync('lastViewedNote', lastViewedItem?.toString());
                  router.push({
                    pathname: "../notes/see_note",
                    params: {
                      capitalCSName: capitalCSName,
                      post: item.id || item.serialNumber.toString(),
                      codeCCS: codeCCS,
                      lastViewedNote: lastViewedItem,
                      // Передаем данные заметки для оффлайн режима
                      noteData: JSON.stringify({
                        serialNumber: item.serialNumber,
                        subobject: item.subobject,
                        system_name: item.system_name,
                        description: item.description,
                        comment_status: item.comment_status,
                        comment_category: item.comment_category,
                        start_date: item.start_date,
                        end_date_plan: item.end_date_plan,
                        end_date_fact: item.end_date_fact,
                        comment_explanation: item.comment_explanation,
                        ii_number: item.ii_number,
                        executor: item.executor,
                        user_name: item.user_name,
                        flag_from_server: item.flag_from_server
                      })
                    },
                  });
                }}
              >
                <View style={{
                  backgroundColor: colorSkyBlue,
                  flexDirection: "row",
                  width: "100%",
                  height: 37,
                  justifyContent: "center",
                  marginBottom: 17,
                  borderRadius: 8,
                }}>
                  <View style={{ width: "15%", justifyContent: "center" }}>
                    <Text style={{
                      fontSize: ts(14),
                      color: colorText,
                      textAlign: "left",
                    }}>
                      {item.serialNumber}
                    </Text>
                  </View>

                  <View style={{
                    width: "75%",
                    marginStart: 2,
                    justifyContent: "center",
                  }}>
                    <Text style={{
                      fontSize: ts(14),
                      color: colorText,
                      textAlign: "left",
                    }} numberOfLines={2}>
                      {item.description}
                    </Text>
                  </View>

                  <View style={{
                    width: "7%",
                    marginStart: 2,
                    justifyContent: "center",
                  }}>
                    {renderStatusIcon(item.comment_status)}
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

      {/* Кнопка добавления замечания (только для онлайн режима или для создания локально) */}
      <PermissionGuard required="COMMENT_CREATE">
        <CustomButton
          title="Добавить замечание"
          handlePress={() => {
            // Проверяем, есть ли доступ к интернету
            // Если нет - можно показать сообщение или сохранять локально
            router.push({
              pathname: "../notes/create_note",
              params: { 
                codeCCS: codeCCS, 
                capitalCSName: capitalCSName,
                isOfflineMode: "true" // Флаг оффлайн режима
              },
            });
          }}
        />
      </PermissionGuard>

      {visibleLegend && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={visibleLegend}
          onRequestClose={() => setVisibleLegend(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { height: 300 }]}>
              <TouchableOpacity onPress={() => setVisibleLegend(false)} style={{ alignSelf: 'flex-end' }}>
                <Ionicons name='close-outline' size={30} />
              </TouchableOpacity>
              <View style={{ justifyContent: 'center', width: '100%' }}>
                <View style={{ flexDirection: 'row' }}>
                  <Ionicons name="square-outline" size={25} color={colorText} style={{ marginRight: 20 }} />
                  <Text style={{ alignContent: 'center', fontSize: ts(14), height: 25, color: colorText, textAlign: 'left', marginBottom: 11.2 }}>Выдано</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <AntDesign name="minussquare" size={23} color={useColorOrange()} style={{ marginRight: 20, paddingLeft: 1 }} />
                  <Text style={{ alignContent: 'center', fontSize: ts(14), height: 25, color: colorText, textAlign: 'left', marginBottom: 11.2 }}>Отклонено</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Ionicons name="square" size={25} color={colorBlue} style={{ marginRight: 20 }} />
                  <Text style={{ alignContent: 'center', fontSize: ts(14), height: 25, color: colorText, textAlign: 'left', marginBottom: 11.2 }}>Принято</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <AntDesign name="rightsquare" size={23} color={colorBlue} style={{ marginRight: 20, paddingLeft: 1 }} />
                  <Text style={{ alignContent: 'center', fontSize: ts(14), height: 25, color: colorText, textAlign: 'left', marginBottom: 11.2 }}>Предъявлено на устранение</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <AntDesign name="closesquare" size={23} color={useColorRed()} style={{ marginRight: 20, paddingLeft: 1 }} />
                  <Text style={{ alignContent: 'center', fontSize: ts(14), height: 25, color: colorText, textAlign: 'left', marginBottom: 11.2 }}>Не устранено</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <AntDesign name="checksquare" size={23} color={useColorGreen()} style={{ marginRight: 20, paddingLeft: 1 }} />
                  <Text style={{ alignContent: 'center', fontSize: ts(14), height: 25, color: colorText, textAlign: 'left', marginBottom: 11.2 }}>Устранено</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Ionicons name="square" size={25} color={useColorOrange()} style={{ marginRight: 20 }} />
                  <Text style={{ alignContent: 'center', fontSize: ts(14), height: 25, color: colorText, textAlign: 'left', marginBottom: 11.2 }}>Просрочено</Text>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default DirectionLayout;