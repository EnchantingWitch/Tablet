import CustomButton from "@/components/CustomButton";
import FloatingScrollToTop from "@/components/FloatingScrollToTop";
import HeaderForTabs from "@/components/HeaderForTabs";
import { PermissionGuard } from "@/components/PermissionGuard";
import SystemsForTwo from "@/components/SystemsForTwo";
import { useColorBlue, useColorSkyBlueCarpet, useColorText } from "@/hooks/useColorText";
import useDevice from "@/hooks/useDevice";
import { useScrollToLastViewedWithState } from "@/hooks/useScrollToLastViewedWithState";
import { useToken } from "@/hooks/useToken";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View
} from "react-native";
import { API_BASE_URL } from '../../config/api';
import type { Structure } from "./structure";

const DirectionLayout = () => {
    const { isMobile, isDesktopWeb, isMobileWeb, screenWidth, screenHeight } = useDevice();
  const { tokenFrAsync,getTokenFrAsync,saveTokenFrAsync} = useToken();
  const initialScrollDone = useRef(false);// Добавьте ref для отслеживания инициализации
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<any>("");
  const [role, setRole] = useState('');
  const [codeCCS, setCodeCCS] = useState('');
  const [capitalCSName, setCapitalCSName] = useState('');
  const [chooseSubobject, setChooseSubobject] = useState("");
  const [chooseSystem, setChooseSystem] = useState("");
  const [chooseUser, setChooseUser] = useState<string>("");
  const [listSubObj, setListSubObj] = useState<ListToDrop[]>([]);
  const [listSystem, setListSystem] = useState<ListToDrop[]>([]);
  const [listUsers, setListUsers] = useState<ListToDrop[]>([]);
  const [status, setStatus] = useState(true);
  const colorText = useColorText();
  const colorSkyBlue = useColorSkyBlueCarpet(0.4);
  const colorBlue = useColorBlue();
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
                router.push('/sign/sign_in');
            }
        } catch (error) {
            console.error('Error retrieving token:', error);
        }
    };

  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState<[]>([]);
  const [originalData, setOriginalData] = useState<[]>([]);
  const [structure, setStructure] = useState<Structure[]>([]);
  const [users, setUsers] = useState<[]>([]);

  const getNotes = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/journal/getEntryList/` +
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
      setData(json.journal);
      setOriginalData(json.journal);
      setUsers(json.users);
      console.log("ResponsegetEntryList:", response);
      console.log("ResponsegetEntryList:", json);
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

  useEffect(() => {
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
  }, [structure]); 
  
  useEffect(() => {
    if (users.length > 0) {
      setListUsers([...new Set(users)].map(user => ({
        label: user,
        value: user
      })));
    }
  }, [users]);

const getLastViewedNote = async () => {
  try {
    const token = await getTokenFrAsync('lastViewedJour');
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

  useEffect(() => {
    if (codeCCS && accessToken && status) {
      getNotes();
      getStructure();
      setStatus(false);
    }
  }, [codeCCS, accessToken, status]); 
/*
  useEffect(() => {
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
  }, [structure]); 

  useEffect(() => {
    if (users.length > 0) {
      setListUsers([...new Set(users)].map(user => ({
        label: user,
        value: user
      })));
    }
  }, [users]); */

  // Отдельный эффект для добавления "Все варианты" в списки
  useEffect(() => {
    if (chooseSystem !== "" && chooseSystem !== "Все системы" && !listSystem.some((item) => item.value === "Все системы")) {
      setListSystem(prev => [ { label: "Все системы", value: "Все системы" }, ...prev]);
    }
  }, [chooseSystem, listSystem]);

  useEffect(() => {
    if (chooseSubobject !== "" && chooseSubobject !== "Все подобъекты" && !listSubObj.some((item) => item.value === "Все подобъекты")) {
      setListSubObj(prev => [ { label: "Все подобъекты", value: "Все подобъекты" }, ...prev]);
    }
  }, [chooseSubobject, listSubObj]);

  useEffect(() => {
    if (chooseUser !== "" && chooseUser !== "Все специалисты" && !listUsers.some((item) => item.value === "Все специалисты")) {
      setListUsers(prev => [{ label: "Все специалисты", value: "Все специалисты" }, ...prev]);
    }
  }, [chooseUser, listUsers]);

  const filteredData = useMemo(() => {
    let result = originalData;

    // Фильтрация по подобъекту
    if (chooseSubobject && chooseSubobject !== "Все подобъекты") {
      result = result.filter((item) => item.subObject === chooseSubobject);
    }

    // Фильтрация по системе
    if (chooseSystem && chooseSystem !== "Все системы") {
      result = result.filter((item) => item.system === chooseSystem);
    }

    // Фильтрация по статусу
    if (chooseUser && chooseUser !== "Все специалисты") {
      result = result.filter((item) => item.user === chooseUser); {/**изменить поле по которому сравниваю */}
    }

    return result;
  }, [originalData, chooseSubobject, chooseSystem, chooseUser]);

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
        //setStatusStructure(true);
  
        return () => {
          isActive = false; // Отмена запроса при уходе с экрана
        };
      }, [])
    );

     console.log('JOUR scrollToSelectedItem called with:', {
    dataLength: data.length,
    lastViewedItem,
    firstItemId: data[0]?.id
  });

      // Сохраняем lastViewedItem при уходе с экрана
 useEffect(() => {
    return () => {
      if (lastViewedItem) {
        // Сохраняем в AsyncStorage или контекст
        AsyncStorage.setItem('lastViewedJour', lastViewedItem.toString());
      }
    };
  }, [lastViewedItem]);


  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <HeaderForTabs nameTab="Журнал ПНР" capitalCSName={capitalCSName} role={role}/>
      <View
        style={{
          flex: 1,
          alignItems: "center",}}
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
            nameFilter={`Все ${'\n'}подобъекты`}
            width={118}
            onChange={(system) => setChooseSubobject(system)}
          />
          <SystemsForTwo
            list={listSystem}
            nameFilter="Все системы"
            width={100}
            onChange={(system) => setChooseSystem(system)}
          />
          <SystemsForTwo
            list={listUsers}
            nameFilter={`Все ${'\n'}специалисты`}
            width={118}
            onChange={(status) => setChooseUser(status)}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            width: "98%",
            height: 32,
            paddingTop: 6,
          }}
        >
            <View style = {{width: '25%'}}>
          <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'center' }}>Дата</Text></View>
          <View style = {{width: '75%'}}>
          <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'center' }}>Краткое описание работ</Text></View>
        </View>

        <View style={{ flex: 15, marginTop: 12 }}>
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <FlatList
               ref={flatListRef}
              data={data}
              style={{ width: "100%" }}
              onScroll={handleScroll}//показывает иконку при скроле, когда он сколько то занимает места уже
              scrollEventThrottle={16}
              keyExtractor={({ id }) => id}
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
                     [saveTokenFrAsync('lastViewedJour', lastViewedItem?.toString()), //сохранение последнего просмотренного замечания
                    router.push({
                      pathname: "/jour/see_jour",
                      params: {
                        capitalCSName: capitalCSName,
                        post: item.id,
                        codeCCS: codeCCS,
                      },
                    })];
                  }}
                >
                  <View
                    style={{
                      backgroundColor: colorSkyBlue,
                      flexDirection: "row",
                      width: "98%",
                      height: 37,
                      alignSelf: 'center',
                      justifyContent: "center",
                      marginBottom: 17,
                      borderRadius: 8,
                    }}
                  >
                    <View style={{ width: "25%", justifyContent: "center" }}>
                      <Text
                        style={{
                          fontSize: ts(14),
                          color: colorText, textAlign: 'center' 
                        }}
                      >
                        
                        {item.date}{/**это должна быть дата */}
                      </Text>
                    </View>

                    <View
                      style={{
                        width: '75%',
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
        <PermissionGuard required="JOURNAL_CREATE">
          <CustomButton
            title="Добавить краткое описание работ"
            handlePress={() =>
              router.push({
                pathname: "/jour/create_jour",
                params: { codeCCS: codeCCS, capitalCSName: capitalCSName },
              })
            }
          />
        </PermissionGuard>
      </View>
    </View>
  );
};

export default DirectionLayout;
