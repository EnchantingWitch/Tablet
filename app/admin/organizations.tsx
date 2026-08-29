import { brand } from '@/constants/Colors';
import CustomButton from '@/components/CustomButton';
import FloatingScrollToTop from "@/components/FloatingScrollToTop";
import HeaderForTabs from '@/components/HeaderForTabs';
import { useColorSkyBlueCarpet, useColorText } from '@/hooks/useColorText';
import useDevice from "@/hooks/useDevice";
import { useScrollToLastViewedWithState } from '@/hooks/useScrollToLastViewedWithState';
import { useToken } from '@/hooks/useToken';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Platform, StatusBar, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, useWindowDimensions, View } from 'react-native';
import { API_BASE_URL } from '../../config/api';

type Reqs = {
  id: number;//айди заявки
  userId: number;
  fullName: string;
  username: string;
  description: string;
  organisation: string;
  role: string;
  creationTime:string; 
  objectToAdd:[{
      capitalCSName: string,
      codeCCS: string,
}],
};

const DirectionLayout = () => {
  const { isMobile, isDesktopWeb, isMobileWeb, screenWidth, screenHeight } = useDevice();
    const initialScrollDone = useRef(false);// Добавьте ref для отслеживания инициализации
    const { tokenFrAsync,getTokenFrAsync,saveTokenFrAsync} = useToken();
    const BOTTOM_SAFE_AREA = Platform.OS === 'android' ? StatusBar.currentHeight : 0;
  const router = useRouter();
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
  const colorText = useColorText();
  const fontScale = useWindowDimensions().fontScale;

  const ts = (fontSize: number) => {
    return (fontSize / fontScale)};

  const navigation = useNavigation();
    
  useEffect(() => {
        navigation.setOptions({
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.replace('/admin/menu')}>
              <Ionicons name='home-outline' size={25} style={{alignSelf: 'center'}}/>
            </TouchableOpacity>
          ),
        });
  }, [navigation]);

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


  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState<Reqs[]>([]);

  const getReqs = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const response = await fetch(`${API_BASE_URL}/organisations/getAll`,
      //const response = await fetch('https://xn----7sbpwlcifkq8d.xn--p1ai:8443/organisations/getAll',directories/getRegions
        {method: 'GET',
          headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }}
      );
      console.log('responseGetOrganisations', response);
      const json = await response.json();
      setData(json);
      setFilteredData(json); // Инициализируем отфильтрованные данные
      //console.log(json);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

 
  useEffect(() => {
    getReqs();
  }, []);

   useEffect(() => {
    return () => {
      if (lastViewedItem) {
        // Сохраняем в AsyncStorage или контекст
        AsyncStorage.setItem('lastViewedAdminOrg', lastViewedItem.toString());
      }
    };
  }, [lastViewedItem]);

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

    const getLastViewedNote = async () => {
      try {
        const token = await getTokenFrAsync('lastViewedAdminOrg');
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
        await getLastViewedNote();
      };
      
      initializeData();
    }, []);
    

  //ИКОНКА ДЛЯ СКРОЛА ВВЕРХ
      const [showScrollTop, setShowScrollTop] = useState(false);
      //определение достаточно ли было прокручено для показа иконки скрола вверх
      const handleScroll = (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setShowScrollTop(offsetY > screenHeight*0.1);
      };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <HeaderForTabs capitalCSName='Организации' path='/admin/menu'/>

          <View style={{paddingTop: 8, justifyContent: 'center', alignItems: 'center', minHeight: Dimensions.get('window').height-BOTTOM_SAFE_AREA-54}}>
          <TextInput 
            style={{ borderWidth: 1, borderColor: brand.bgBlue, borderRadius: 8,  width: '96%', fontSize: ts(14) }}
            placeholder="Поиск по организации"
            placeholderTextColor={brand.bgBlue}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          { isLoading ? (
              <ActivityIndicator />
            ) : (
            <View style={{paddingVertical: 158}}>
              <FlatList
                ref={flatListRef}
                onScroll={handleScroll}//показывает иконку при скроле, когда он сколько то занимает места уже
                style={{width: '96%', marginTop: 15, }}
                data={filteredData}
                keyExtractor={({id}) => id}
                scrollEventThrottle={16}
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
             
                  <TouchableWithoutFeedback onPress={() =>{ router.push({pathname: '/admin/organization', params: {id: item.id, organisation: item.organisationName }})}  }>
                  <View style={{ backgroundColor: useColorSkyBlueCarpet(0.4), flexDirection: 'row', width: '100%', height: 37, justifyContent: 'center', marginBottom: '5%', borderRadius: 8}}>
          
                      <View style={{width: '100%', justifyContent: 'center', paddingLeft: 5}}>
                      <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'left' }}>{item.organisationName}</Text>
                      </View>
                      
                  </View>
                  </TouchableWithoutFeedback>
              )}
              />
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
          )}
            
         <View style={{ paddingBottom: BOTTOM_SAFE_AREA + 320 }}>
          <CustomButton
                      title="Добавить организацию"
                      handlePress={()=>{router.push('./create_organization')}} 
                  //   isLoad={load} // Можно добавить индикатор загрузки, если нужно
        />
          </View>
          
        </View>
      </View >


  );
};

export default DirectionLayout;

