import { fontFamily } from '@/constants/Fonts';
import { brand } from '@/constants/Colors';
import CustomButton from '@/components/CustomButton';
import FloatingScrollToTop from "@/components/FloatingScrollToTop";
import HeaderForTabs from "@/components/HeaderForTabs";
import { PermissionGuard } from '@/components/PermissionGuard';
import SystemsForTwo from '@/components/SystemsForTwo';
import { useColorBlue, useColorSkyBlueCarpet, useColorText } from '@/hooks/useColorText';
import useDevice from '@/hooks/useDevice';
import { useScrollToLastViewedWithState } from '@/hooks/useScrollToLastViewedWithState';
import { useToken } from '@/hooks/useToken';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import type { PropsWithChildren } from 'react';
import React, { useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, useWindowDimensions, View } from 'react-native';
import { API_BASE_URL } from '../../config/api';
import type { Structure } from './structure';
const Defacts = () => {
    // Добавьте ref для отслеживания инициализации
  const initialScrollDone = useRef(false);
  const { tokenFrAsync,getTokenFrAsync,saveTokenFrAsync} = useToken();
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
 // const { codeCCS } = useGlobalSearchParams(); //получение наименование ОКС
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
    return (fontSize / fontScale)};

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

  const getNotes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/defectiveActs/getAllDefActs/`+codeCCS,
        {method: 'GET',
          headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }}
      );
      const json = await response.json();
      setData(json);
      setOriginalData(json);
      console.log('ResponseGetDefacts:', response);
      console.log('ResponseGetDefacts:', json);
      
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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
      setStructure(json);
      console.log('ResponseSeeStructure:', response);
    } catch (error) {
      console.error(error);
    }
  }

  const getLastViewed = async (key: string, setF) => {
    try {
      const token = await getTokenFrAsync(key);
      // Более надежная проверка
      if (token && token !== '' && token !== 'undefined') {
        const lastViewedNumber = parseInt(token, 10);
        if (!isNaN(lastViewedNumber)) {
          setF(lastViewedNumber); // Используем число, а не строку
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
    if(codeCCS && accessToken && status){
     getNotes();
      setStatus(false);
    }
   
    //формирование выпадающего списка для подобъекта
    if (structure.length > 0) {
      const buf = structure.map(item => ({label: item.subObjectName, value: item.subObjectName}));
      setListSubObj(buf);
      
      const allSystemNames = structure.flatMap(structure => 
        structure.data.map(item => item.systemName)
      );
      const uniqueSystemNames = [...new Set(allSystemNames)];
      const systemList = uniqueSystemNames.map(system => ({
        label: system,
        value: system
      }));     
      setListSystem(systemList);
    }
    
  }, [codeCCS, accessToken, structure, status]);

  // Добавление сброса выбранного значения в выпадающий список
  useEffect(() => {
    if (chooseSystem !== '' && chooseSystem !== 'Все системы' && !listSystem.some(item => item.value === 'Все системы')) { 
      const item = {label: 'Все системы', value: 'Все системы'};
      setListSystem(prev => [item, ...prev]);
    }
    if (chooseSubobject !== '' && chooseSubobject !== 'Все подобъекты' && !listSubObj.some(item => item.value === 'Все подобъекты')) { 
      const item = {label: 'Все подобъекты', value: 'Все подобъекты'};
      setListSubObj(prev => [item, ...prev]);
    }
  }, [chooseSystem, listSystem, chooseSubobject, listSubObj]);

  const filteredData = useMemo(() => {
  let result = originalData;

  // Фильтрация по подобъекту
  if (chooseSubobject && chooseSubobject !== 'Все подобъекты') {
    result = result.filter(item => item.subObject === chooseSubobject);
  }

  // Фильтрация по системе
  if (chooseSystem && chooseSystem !== 'Все системы') {
    result = result.filter(item => item.systemName === chooseSystem);
  }

  // Фильтрация по статусу
  if (chooseStatus && chooseStatus !== 'Все') {
    result = result.filter(item => item.defectiveActStatus === chooseStatus);
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
    
         console.log('DEFACTS scrollToSelectedItem called with:', {
    dataLength: data.length,
    lastViewedItem,
    firstItemId: data[0]?.id
  });

    // Сохраняем lastViewedItem при уходе с экрана
 useEffect(() => {
    return () => {
      if (lastViewedItem) {
        // Сохраняем в AsyncStorage или контекст
        AsyncStorage.setItem('lastViewedDefect', lastViewedItem.toString());
      }
    };
  }, [lastViewedItem]);


  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <HeaderForTabs capitalCSName={capitalCSName} nameTab='Дефекты' role={role}/>
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
            ) : (
              <FlatList
                ref={flatListRef}
                data={data}
                style={{ width: "96%" }}
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
                renderItem={({item}) => (
                  <TouchableWithoutFeedback onPress={() =>{ 
                    [saveTokenFrAsync('lastViewedDefect', lastViewedItem?.toString()),router.push({pathname: '/defacts/see_defact', params: { capitalCSName: capitalCSName, post: item.id, codeCCS: codeCCS }})]}  }>
                  <View style={{ backgroundColor: colorSkyBlue, flexDirection: 'row', width: '100%', height: 37, justifyContent: 'center', marginBottom: 17, borderRadius: 8}}>
          
                      <View style={{width: '15%', justifyContent: 'center'}}>
                      <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'left' }}>{item.serialNumber}</Text>
                      </View>
          
                      <View style={{width: '75%', marginStart: 2, justifyContent: 'center'}}>
                      <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'left' }}>{item.description}</Text>
                      </View>
                      
                      <View style={{width: '7%', marginStart: 2, justifyContent: 'center'}}>
                      
                       {(item.defectiveActStatus =='Устранено') ? ( <Ionicons name="checkbox" size={25} color={colorBlue} />): ''} 
                        
                       {(item.defectiveActStatus =='Не устранено') ? <Ionicons name="square" size={25} color="#ffffffff" />:''}
                       
                      
                      {/**checkmark-circle-outline , close-circle-outline, square-outline*/}
                     {/*} <Text style={{ fontSize: ts(16), color: brand.textPrimary, textAlign: 'center'  }}>{item.commentStatus} </Text>*/}
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

          <PermissionGuard required='DEFACT_CREATE'>
            <CustomButton
              title="Добавить дефект"
              handlePress={() =>router.push({pathname: '/defacts/create_defact', params: { codeCCS: codeCCS, capitalCSName: capitalCSName }})} />
          </PermissionGuard>
        
      </View >
    </View >

  );
};


type PreviewLayoutProps = PropsWithChildren<{
  // label: string;
 // values: string[];
  selectedValue: string;
  setSelectedValue: (value: string) => void;
}>;

type PreviewNameProps = PropsWithChildren<{
  values: string[];
}>;

const PreviewName = (
  {
    //childern,
    values,
  }: PreviewNameProps) => (

  <View style={styles.row}>
    {values.map(value => (
      <Text key={value} style={styles.title}>
        {value}
      </Text>

    ))}
  </View>
);

const PreviewLayout = ({
  //  label,
  children,
  values,
  selectedValue,
  setSelectedValue,
}: PreviewLayoutProps) => (
  <View style={{ padding: 6, flex: 1 }}>

    <View style={styles.row}>
      {values.map(value => (
        <TouchableOpacity
          key={value}
          onPress={() => setSelectedValue(value)}
          style={[styles.button, selectedValue === value && styles.selected]}>
          <Text
            style={[
              styles.buttonLabel , 
              selectedValue === value && styles.selectedLabel,
            ]}>
            {value}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
    <View style={styles.separator} lightColor={brand.bgBlue} darkColor="rgba(255,255,255,0.1)" />
    <View style={[styles.container,]}>{children}</View>
  </View>
);


const styles = StyleSheet.create(
  
  
  {
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    fontWeight: 'normal',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  separator: {
    marginVertical: 5,

    height: 1,
    width: '100%',
  },
  box: {
    width: 50,
    height: 50,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    //alignItems: 'center',
  },
  button: {
   /* paddingVertical: 6,
    paddingBottom: 6,
    paddingRight: 8,
    paddingLeft: 8,*/
    backgroundColor: brand.bgBlueLight,
    marginHorizontal: '10%',
    marginBottom: 16,
    width: 103,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',

  },
  //background: brand.bgBlueLight;

  selected: {
    backgroundColor: brand.bgBlueLight,
   // justifyContent: 'center',
    borderWidth: 0,
  },
  buttonLabel: {
    fontFamily,
    fontSize: 14,
    fontWeight: '400',
    color: brand.textPrimary,
    textAlign: 'center',
  },
  selectedLabel: {
    color: brand.textPrimary,
    //textAlign: 'center',
  },
  label: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 24,
  },
});

export default Defacts;

