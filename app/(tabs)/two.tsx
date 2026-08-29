//последний вариант к середине списка

import CustomButton from "@/components/CustomButton";
import FloatingScrollToTop from "@/components/FloatingScrollToTop";
import HeaderForTabs from "@/components/HeaderForTabs";
import { PermissionGuard } from "@/components/PermissionGuard";
import SystemsForTwo from "@/components/SystemsForTwo";
import { useColorBlue, useColorGreen, useColorOrange, useColorRed, useColorSkyBlueCarpet, useColorText } from "@/hooks/useColorText";
import useDevice from '@/hooks/useDevice';
import { AntDesign, Ionicons } from "@expo/vector-icons";
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
import { API_BASE_URL } from '../../config/api';
import { styles, brand } from '../../constants/Colors';
import { useScrollToLastViewedWithState } from '../../hooks/useScrollToLastViewedWithState';
import { useToken } from '../../hooks/useToken';
import type { Structure } from "./structure";

type Note = {
  commentId: number; //id замечания , генерируется на сервере
  serialNumber: number; //номер замечания
  subObject: string;
  systemName: string;
  description: string;
  commentStatus: string;
  commentCategory: string;
  startDate: string;
  endDatePlan: string;
  endDateFact: string;
  commentExplanation: string; //комментарий к замечанию
  iinumber: number; //номер акта ИИ
};

const DirectionLayout = () => {
  const { isMobile, isDesktopWeb, isMobileWeb, screenWidth, screenHeight } = useDevice();
  const { tokenFrAsync,getTokenFrAsync,saveTokenFrAsync} = useToken();
  const colorText = useColorText();
  const colorSkyBlue = useColorSkyBlueCarpet(0.4);
  const colorBlue = useColorBlue();
  const router = useRouter();
  // Добавьте ref для отслеживания инициализации
const initialScrollDone = useRef(false);
// const flatListRef = useRef<FlatList>(null);//для перехода в спсике к просмотренной записи
  //const [lastViewedItem, setLastViewedItem] = useState<number | null>();//для видимых элементов
// const [viewableItems, setViewableItems] = useState<number[]>([]);//для видимых элементов
  const [accessToken, setAccessToken] = useState<any>("");
  const [role, setRole] = useState('');
  const [codeCCS, setCodeCCS] = useState('');
  const [capitalCSName, setCapitalCSName] = useState('');
 // const { codeCCS } = useGlobalSearchParams(); //получение кода ОКС
  //const { capitalCSName } = useGlobalSearchParams(); //получение наименование ОКС
//  const { lastViewedNoteN } = useGlobalSearchParams(); //получение наименование ОКС
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
  idField: 'commentId',
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
              router.push('/sign/sign_in');
          }
      } catch (error) {
          console.error('Error retrieving token:', error);
      }
  };

  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState<Note[]>([]);
  const [originalData, setOriginalData] = useState<Note[]>([]);
  const [structure, setStructure] = useState<Structure[]>([]);

  const getNotes = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/comments/getAllComments/` +
          codeCCS,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const json = await response.json();
      setData(json);
      setOriginalData(json);
      console.log("ResponseGetNotes:", response);
      console.log("ResponseGetNotes:", json);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStructure = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/commons/getStructureCommonInf/` +
          codeCCS,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const json = await response.json();
      setStructure(json);
      console.log("ResponseSeeStructure:", response);
    } catch (error) {
      console.error(error);
    }
  };

const getLastViewedNote = async () => {
  try {
    const token = await getTokenFrAsync('lastViewedNote');
    // Более надежная проверка
    if (token && token !== '' && token !== 'undefined') {
      const lastViewedNumber = parseInt(token, 10);
      if (!isNaN(lastViewedNumber)) {
        setLastViewedItem(lastViewedNumber); // Используем число, а не строку
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
    
    // Небольшая задержка для гарантии рендера
    setTimeout(() => {
      scrollToSelectedItem(data);
      initialScrollDone.current = true; // Помечаем, что скролл выполнен
    });//  }, 100);
  }
}, [data, lastViewedItem, scrollToSelectedItem]);

// Отдельный эффект для загрузки структуры
useEffect(() => {
  if (statusStructure && accessToken && codeCCS) {
    getStructure();
    setStatusStructure(false);
  }
}, [statusStructure, accessToken, codeCCS]);

  useEffect(() => {
    if (codeCCS && accessToken && status)  {
      getNotes();
      setStatus(false);
    }
   
    //формирование выпадающего списка для подобъекта
    if (structure.length > 0) {
      const buf = structure.map((item) => ({
        label: item.subObjectName,
        value: item.subObjectName,
      }));
      setListSubObj(buf);

      const allSystemNames = structure.flatMap((structure) =>
        structure.data.map((item) => item.systemName)
      );
      const uniqueSystemNames = [...new Set(allSystemNames)];
      const systemList = uniqueSystemNames.map((system) => ({
        label: system,
        value: system,
      }));
      setListSystem(systemList);
    }
  }, [codeCCS, accessToken, structure,status]);

  // Добавление сброса выбранного значения в выпадающий список
  useEffect(() => {
    if (
      chooseSystem !== "" &&
      chooseSystem !== "Все системы" &&
      !listSystem.some((item) => item.value === "Все системы")
    ) {
      const item = { label: "Все системы", value: "Все системы" };
      setListSystem((prev) => [item, ...prev]);
     // console.log("new ListSystem", listSystem);
    }
    if (
      chooseSubobject !== "" &&
      chooseSubobject !== "Все подобъекты" &&
      !listSubObj.some((item) => item.value === "Все подобъекты")
    ) {
      const item = { label: "Все подобъекты", value: "Все подобъекты" };
      setListSubObj((prev) => [item, ...prev]);
     // console.log("new ListSystem", listSubObj);
    }
  }, [chooseSystem, listSystem, chooseSubobject, listSubObj]);

  const filteredData = useMemo(() => {
    let result = originalData;

    // Фильтрация по подобъекту
    if (chooseSubobject && chooseSubobject !== "Все подобъекты") {
      result = result.filter((item) => item.subObject === chooseSubobject);
    }

    // Фильтрация по системе
    if (chooseSystem && chooseSystem !== "Все системы") {
      result = result.filter((item) => item.systemName === chooseSystem);
    }

    // Фильтрация по статусу
    if (chooseStatus && chooseStatus !== "Все") {
      result = result.filter((item) => item.commentStatus === chooseStatus);
    }

    return result;
  }, [originalData, chooseSubobject, chooseSystem, chooseStatus]);

  // Обновление данных при изменении фильтров
  useEffect(() => {
    setData(filteredData);
  }, [filteredData]);

  //ИКОНКА ДЛЯ СКРОЛА ВВЕРХ
  const [showScrollTop, setShowScrollTop] = useState(false);
  //определение достаточно ли было прокручено для показа иконки скрола вверх
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > screenHeight*0.1);
  };
  
//запрос по новой
    useFocusEffect(
    useCallback(() => {
      let isActive = true;

      setStatus(true);//стоят ограничения по ним на запрос к данным
      setStatusStructure(true);

      return () => {
        isActive = false; // Отмена запроса при уходе с экрана
      };
    }, [])
  );

       console.log('TWO scrollToSelectedItem called with:', {
    dataLength: data.length,
    lastViewedItem,
    firstItemId: data[0]?.commentId
  });

    // Сохраняем lastViewedItem при уходе с экрана
 useEffect(() => {
    return () => {
      if (lastViewedItem) {
        // Сохраняем в AsyncStorage или контекст
        AsyncStorage.setItem('lastViewedNote', lastViewedItem.toString());
      }
    };
  }, [lastViewedItem]);

  
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
       <HeaderForTabs nameTab="Замечания" capitalCSName={capitalCSName} role={role}/>
      <View
        style={{
          flex: 1,
          alignItems: "center"}}
      >
       

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            width: "96%",
          }}
        >
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

        <View
          style={{
            flexDirection: "row",
            width: "96%",
            height: 32,
            paddingTop: 6,
          
          }}
        >
           <View style = {{width: '12%', }}>
          <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'center'}}>№</Text>
          </View>
          <View style = {{width: '73%'}}>
          <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'center' }}>Содержание</Text>
          </View>
          <View style = {{width: '14%', flexDirection: 'column' }}>
            <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'center' }}>Статус</Text>
            <TouchableOpacity onPress={()=>setVisibleLegend(true)}>
                  <Ionicons name='help-circle-outline' size={20} style={{alignSelf: 'center', width: 22, color: colorBlue}} />
            </TouchableOpacity>
          </View>
        </View>
        </View>

        <View style={{ flex: 5, alignItems: 'center',}}>
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <FlatList
              ref={flatListRef}
              data={data}
              style={{ width: "96%" }}
              onScroll={handleScroll}//показывает иконку при скроле, когда он сколько то занимает места уже
              scrollEventThrottle={16}
              keyExtractor={({ commentId }) => commentId}
              onViewableItemsChanged={onViewableItemsChanged}//отслеживает какие элементы видны на экране
              viewabilityConfig ={viewabilityConfig}//настраивает критерии видимости элементов
              getItemLayout={(_, index) => ({//переопределение layout элементов, вычисление видимо расстояния
                length: 54,//высота элемента в пикселях: 37(view height)+17(mariginBottom)
                offset: 54 * index,// Суммарное смещение от начала списка
                index,// Индекс элемента
              })}
              onScrollToIndexFailed={(info) => {//если не получилось сделать скрол, ждет 500 милисекунд и пытается это сделать снова
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
                    [saveTokenFrAsync('lastViewedNote', lastViewedItem?.toString()), //сохранение последнего просмотренного замечания
                    router.push({
                      pathname: "/notes/see_note",
                      params: {
                        capitalCSName: capitalCSName,
                        post: item.commentId,
                        codeCCS: codeCCS,
                        lastViewedNote: lastViewedItem
                      },
                    })];
                  }}
                >
                  <View
                    style={{
                      backgroundColor: colorSkyBlue,
                      flexDirection: "row",
                      width: "100%",
                      height: 37,
                      justifyContent: "center",
                      marginBottom: 17,
                      borderRadius: 8,
                    }}
                  >
                    <View style={{ width: "15%", justifyContent: "center" }}>
                      <Text
                        style={{
                          fontSize: ts(14),
                          color: colorText,
                          textAlign: "left",
                        }}
                      >
                        {item.serialNumber}
                      </Text>
                    </View>

                    <View
                      style={{
                        width: "75%",
                        marginStart: 2,
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: ts(14),
                          color: colorText,
                          textAlign: "left",
                        }}
                      >
                        {item.description}
                      </Text>
                    </View>

                    <View
                      style={{
                        width: "7%",
                        marginStart: 2,
                        justifyContent: "center",
                      }}
                    >
                      {item.commentStatus == "Выдано" ? (
                        <Ionicons name="square" size={25} color={brand.white} />
                      ) : (
                        ""
                      )}
                      {item.commentStatus == "Отклонено" ? (
                        <AntDesign name="minussquare" size={23} color={useColorOrange()} />
                      ) : (
                        ""
                      )}
                      {item.commentStatus == "Принято" ? (
                        <Ionicons name="square" size={25} color={colorBlue} />
                      ) : (
                        ""
                      )}
                      {item.commentStatus == "Предъявлено на устранение" ? (
                        <AntDesign name="rightsquare" size={23} color={colorBlue} />
                      ) : (
                        ""
                      )}
                      {item.commentStatus == "Не устранено" ? (
                        <AntDesign name="closesquare" size={23} color={useColorRed()} />
                      ) : (
                        ""
                      )}    
                      
                      {item.commentStatus == "Устранено" ? (
                        <AntDesign name="checksquare" size={23} color={useColorGreen()} />
                      ) : (
                        ""
                      )}
                      {item.commentStatus == "Просрочено" ? (
                        <Ionicons name="square" size={25} color={useColorOrange()} />
                      ) : (
                        ""
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
                  viewPosition: 0 // или 0.5 в зависимости от желаемого поведения
                });
              }
            }}
            position={{ bottom: 40, right: 20 }}
          />
        </View>
        <PermissionGuard required="COMMENT_CREATE">
          <CustomButton
            title="Добавить замечание"
            handlePress={() =>
              router.push({
                pathname: "/notes/create_note",
                params: { codeCCS: codeCCS, capitalCSName: capitalCSName },
              })
            }
          />
        </PermissionGuard>

        {visibleLegend?
        <Modal
          animationType="fade" // Можно использовать 'slide', 'fade' или 'none'
          transparent={true} // Установите true, чтобы сделать фон полупрозрачным
          visible={visibleLegend}
          onRequestClose={() => setVisibleLegend(false)} // Для Android
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { height: 300,}]}>
              <TouchableOpacity onPress={() => setVisibleLegend(false)} style = {{alignSelf: 'flex-end', }}>
                <Ionicons name='close-outline' size={30} />
              </TouchableOpacity>
              <View style={{justifyContent: 'center', width: '100%'}}>     
                <View style={{flexDirection: 'row'}}>
                  <Ionicons name="square-outline" size={25} color={colorText} style={{ marginRight: 20}}/>
                  <Text style={{ alignContent: 'center', fontSize: ts(14), height: 25, color: colorText, textAlign: 'left', marginBottom: 11.2  }}>Выдано</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <AntDesign name="minussquare" size={23} color={useColorOrange()} style={{ marginRight: 20, paddingLeft:1}}/>
                  <Text style={{ alignContent: 'center', fontSize: ts(14), height: 25, color: colorText, textAlign: 'left', marginBottom: 11.2  }}>Отклонено</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <Ionicons name="square" size={25} color={colorBlue} style={{ marginRight: 20}}/>
                  <Text style={{ alignContent: 'center', fontSize: ts(14), height: 25, color: colorText, textAlign: 'left', marginBottom: 11.2  }}>Принято</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <AntDesign name="rightsquare" size={23} color={colorBlue} style={{ marginRight: 20, paddingLeft:1}}/>
                  <Text style={{ alignContent: 'center', fontSize: ts(14), height: 25, color: colorText, textAlign: 'left', marginBottom: 11.2  }}>Предъявлено на устранение</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <AntDesign name="closesquare" size={23} color={useColorRed()} style={{ marginRight: 20, paddingLeft:1}}/>
                  <Text style={{ alignContent: 'center', fontSize: ts(14), height: 25, color: colorText, textAlign: 'left', marginBottom: 11.2  }}>Не устранено</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <AntDesign name="checksquare" size={23} color={useColorGreen()} style={{ marginRight: 20, paddingLeft:1}}/>
                  <Text style={{ alignContent: 'center', fontSize: ts(14), height: 25, color: colorText, textAlign: 'left', marginBottom: 11.2  }}>Устранено</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <Ionicons name="square" size={25} color={useColorOrange()} style={{ marginRight: 20}}/>
                  <Text style={{ alignContent: 'center', fontSize: ts(14), height: 25, color: colorText, textAlign: 'left', marginBottom: 11.2  }}>Просрочено</Text>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      :
      ''}
      </View>

  );
};

export default DirectionLayout;
