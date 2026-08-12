import CustomButton from '@/components/CustomButton';
import FloatingScrollToTop from "@/components/FloatingScrollToTop";
import MonoSizeText from '@/components/FontSize';
import HeaderForTabs from '@/components/HeaderForTabs';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useColorBlue, useColorSkyBlueCarpet, useColorText } from '@/hooks/useColorText';
import useDevice from '@/hooks/useDevice';
import { useToken } from '@/hooks/useToken';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { default as React, useCallback, useEffect, useState } from 'react';
import { Modal, SectionList, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, useWindowDimensions, View } from 'react-native';
import { API_BASE_URL } from '../../config/api';
import { useScrollToLastViewedSectionList } from '../../hooks/useScrollToLastViewedSectionList';

export type Structure = {
  id: number;
  numberKO: string;
  subObjectName: string;
  comments: number;
  status: string;
  data: Array<{
    numberII: string;
    systemName: string;
    comments: number;
    status: string;
    statusList: any[];
    pnrfactDate: string;
    iiplanDate: string;
    iifactDate: string;
    koplanDate: string;
    kofactDate: string;
    ciwexecutor: string;
    cwexecutor: string;
    pnrplanDate: string;
    pnrsystemId: number;
    ccsnumber: string;
  }>;
};

const Struct = () => {
  const {
    sectionListRef,
    viewabilityConfig,
    onViewableItemsChanged,
    scrollToSelectedItem,
    lastViewedItem,
    setLastViewedItem,
    lastSectionId,
    setLastSectionId,
    lastItemInSection,
    setLastItemInSection
  } = useScrollToLastViewedSectionList<Structure['data'][0]>({
    idField: 'pnrsystemId',
    sectionIdField: 'id',
    scrollToPosition: 0.5
  });
  const { isMobile, isDesktopWeb, isMobileWeb, screenWidth, screenHeight } = useDevice();

  const { getTokenFrAsync } = useToken();
  const router = useRouter();
  const [role, setRole] = useState('');
  const [codeCCS, setCodeCCS] = useState('');
  const [capitalCSName, setCapitalCSName] = useState('');
  const [accessToken, setAccessToken] = useState<any>('');
  const [visible, setVisible] = useState<boolean>(false);
  const colorText = useColorText();
  const colorSkyBlue = useColorSkyBlueCarpet(0.4);
  const colorBlue = useColorBlue();
  const fontScale = useWindowDimensions().fontScale;

  const ts = (fontSize: number) => {
    return fontSize / fontScale;
  };

  const [isLoading, setLoading] = useState(true);
  const [data_, setData] = useState<Structure[]>([]);
  const [expandedSections, setExpandedSections] = useState(new Set<number>());
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const EXPANDED_SECTIONS_KEY = `expandedSections`;

  // Сохраняем раскрытые секции в AsyncStorage
  const saveExpandedSections = async (sections: Set<number>) => {
    try {
      const sectionsArray = Array.from(sections);
      await AsyncStorage.setItem(EXPANDED_SECTIONS_KEY, JSON.stringify(sectionsArray));
    } catch (error) {
      console.error('Error saving expanded sections:', error);
    }
  };

  // Загружаем раскрытые секции из AsyncStorage
  const loadExpandedSections = async (): Promise<Set<number>> => {
    try {
      const savedSections = await AsyncStorage.getItem(EXPANDED_SECTIONS_KEY);
      if (savedSections) {
        const sectionsArray = JSON.parse(savedSections) as number[];
        return new Set(sectionsArray);
      }
    } catch (error) {
      console.error('Error loading expanded sections:', error);
    }
    return new Set<number>();
  };

  const getStructure = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/commons/getStructureCommonInf/${codeCCS}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      const json = await response.json();
      setData(json);
      setIsDataLoaded(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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

const initializeData = async () => {
      await getToken('accessToken', setAccessToken);
      await getToken('role', setRole);
      const name = await getTokenFrAsync('selectedNameCSS');
      const code = await getTokenFrAsync('selectedCodeCSS');
      
      setCapitalCSName(name || '');
      setCodeCCS(code || '');
      
      console.log("capitalCSName:", name);
      console.log("codeCCS:", code);

    };

    useEffect(() => {
      initializeData();
    }, []);
  

  useEffect(() => {
    if (isDataLoaded && data_.length > 0) {
      // Загружаем сохраненные раскрытые секции после загрузки данных
      const loadSavedSections = async () => {
        const savedExpandedSections = await loadExpandedSections();
        setExpandedSections(savedExpandedSections);
        
        // Вызываем прокрутку после небольшой задержки для гарантии рендеринга
        setTimeout(() => {
          scrollToSelectedItem(data_);
        }, 100);
      };
      loadSavedSections();
    }
  }, [isDataLoaded, data_]);

  // Сохраняем раскрытые секции при их изменении
  useEffect(() => {
    if (expandedSections.size > 0) {
      saveExpandedSections(expandedSections);
    }
  }, [expandedSections]);

  // Запрос данных при фокусе
  useFocusEffect(
    useCallback(() => {
      if (accessToken !='' && codeCCS !='') {
        getStructure();
        console.log('CCS', codeCCS)
      }
      return () => {};
    }, [accessToken, codeCCS])
  );

  // Восстанавливаем lastViewedItem при монтировании
  useEffect(() => {
    const loadLastViewed = async () => {
      try {
        const savedSection = await AsyncStorage.getItem('lastViewedStructureSection');
        const savedItem = await AsyncStorage.getItem('lastViewedStructureItem');
        
        if (savedSection) {
          const sectionId = parseInt(savedSection);
          setLastSectionId(sectionId);
          
          if (savedItem) {
            const itemId = parseInt(savedItem);
            setLastItemInSection(sectionId, itemId);
            setLastViewedItem(itemId);
            
            // Автоматически раскрываем секцию, которую нужно прокрутить
            /*setExpandedSections(prev => {
              const next = new Set(prev);
              next.add(sectionId);
              return next;
            });*/
          }
        }
      } catch (error) {
        console.error('Error loading last viewed:', error);
      }
    };
    loadLastViewed();
  }, []);

  // Сохраняем lastViewedItem при уходе с экрана
  useEffect(() => {
    return () => {
      if (lastSectionId && lastItemInSection[lastSectionId]) {
        AsyncStorage.setItem('lastViewedStructureSection', lastSectionId.toString());
        AsyncStorage.setItem('lastViewedStructureItem', lastItemInSection[lastSectionId]!.toString());
      }
    };
  }, [lastSectionId, lastItemInSection]);

  const handleToggle = (id: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // ИКОНКА ДЛЯ СКРОЛА ВВЕРХ
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Определение достаточно ли было прокручено для показа иконки скрола вверх
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > screenHeight * 0.1);
  };

  const renderSectionHeader = ({ section }: { section: Structure }) => (
    <TouchableWithoutFeedback onPress={() => handleToggle(section.id)}>
      <View style={[styles.sectionHeader, {backgroundColor: colorSkyBlue}]}>
        <View style={{width: '10%', alignItems: 'center' }}>
          <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'center', lineHeight: ts(18), includeFontPadding: false }} numberOfLines={2}>{section.numberKO}</Text>
        </View>

        <View style={{width: '55%'}}>
          <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'center', lineHeight: ts(18), includeFontPadding: false }} numberOfLines={2}>{section.subObjectName}</Text>
        </View>

        <View style={{width: '21%'}}>
          <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'center', lineHeight: ts(18), includeFontPadding: false }} numberOfLines={2}>{section.comments}</Text>
        </View>

        <View style={{width: '14%'}}>
          {(section.status =='Ведутся СМР') ? ( <TouchableWithoutFeedback><View style={{width: '92%', height: '25', justifyContent: 'center', backgroundColor: 'white', borderRadius: 8}}>
          <Text style={{ fontSize: ts(14), color: colorBlue, textAlign: 'center'  }}>СМР</Text></View></TouchableWithoutFeedback>): ''} 
          {(section.status =='Завершены СМР') ? ( <View style={{width: '92%', height: '25',justifyContent: 'center', backgroundColor: colorBlue, borderRadius: 8}}>
          <Text style={{ fontSize: ts(14), color: 'white', textAlign: 'center'  }}>СМР</Text></View>): ''} 

          {(section.status =='Предъявлено в ПНР') ? ( <View style={{width: '92%', height: '25', justifyContent: 'center', backgroundColor: 'white', borderRadius: 8}}>
          <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'center'  }}>ПНР</Text></View>): ''} 
          {(section.status =='Принято в ПНР') ? ( <View style={{width: '92%', height: '25', justifyContent: 'center', backgroundColor: 'white', borderRadius: 8}}>
          <Text style={{ fontSize: ts(14), color: colorBlue, textAlign: 'center'  }}>ПНР</Text></View>): ''} 
          {(section.status =='Ведутся ПНР') ? ( <View style={{width: '92%', height: '25', justifyContent: 'center', backgroundColor: colorBlue, borderRadius: 8}}>
          <Text style={{ fontSize: ts(14), color: 'white', textAlign: 'center'  }}>ПНР</Text></View>): ''} 

          {(section.status =='Проведены ИИ') ? ( <View style={{width: '92%', height: '25', justifyContent: 'center', backgroundColor: colorBlue, borderRadius: 8}}>
          <Text style={{ fontSize: ts(14), color: 'white', textAlign: 'center'  }}>ИИ</Text></View>): ''} 
          {(section.status =='Акт ИИ на подписи') ? ( <View style={{width: '92%', height: '25', justifyContent: 'center', backgroundColor: 'white', borderRadius: 8}}>
          <Text style={{ fontSize: ts(14), color: '#16a34a', textAlign: 'center'  }}>ИИ</Text></View>): ''} 
          {(section.status =='Акт ИИ подписан') ? ( <View style={{width: '92%', height: '25', justifyContent: 'center', backgroundColor: '#16a34a', borderRadius: 8}}>
          <Text style={{ fontSize: ts(14), color: 'white', textAlign: 'center'  }}>ИИ</Text></View>): ''} 

          {(section.status =='Проводится КО') ? ( <View style={{width: '92%', height: '25', justifyContent: 'center', backgroundColor: 'white', borderRadius: 8}}>
          <Text style={{ fontSize: ts(14), color: colorBlue, textAlign: 'center'  }}>КО</Text></View>): ''}
          {(section.status =='Проведено КО') ? ( <View style={{width: '92%', height: '25', justifyContent: 'center', backgroundColor: colorBlue, borderRadius: 8}}>
          <Text style={{ fontSize: ts(14), color: 'white', textAlign: 'center'  }}>КО</Text></View>): ''}
          {(section.status =='Акт КО на подписи') ? ( <View style={{width: '92%', height: '25', justifyContent: 'center', backgroundColor: 'white', borderRadius: 8}}>
          <Text style={{ fontSize: ts(14), color: '#16a34a', textAlign: 'center'  }}>КО</Text></View>): ''}
          {(section.status =='Акт КО подписан') ? ( <View style={{width: '92%', height: '25', justifyContent: 'center', backgroundColor: '#16a34a', borderRadius: 8}}>
          <Text style={{ fontSize: ts(14), color: 'white', textAlign: 'center'  }}>КО</Text></View>): ''}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );

  const renderItem = ({ item, section }: { item: Structure['data'][0]; section: Structure }) => {
    const isExpanded = expandedSections.has(section.id);
    if (!isExpanded) return null;

    return (
      <TouchableOpacity 
        onPress={() => {
          // Сохраняем текущую позицию перед переходом
          setLastSectionId(section.id);
          setLastItemInSection(section.id, item.pnrsystemId);
          setLastViewedItem(item.pnrsystemId);
          
          router.push({
            pathname: '/structures/system', 
            params: { 
              post: item.pnrsystemId, 
              codeCCS: codeCCS, 
              capitalCSName: capitalCSName, 
              ii: item.numberII 
            }
          });
        }} 
        style={styles.itemContainer}
      >
        <View style={{flexDirection: 'row',borderWidth: 2, borderColor: colorSkyBlue, alignSelf: 'flex-end',   width: '96%', height: 37, marginBottom: '2.5%', marginLeft: '1%', borderRadius: 8}}>

        <View style={{width: '11%',  justifyContent: 'center',alignSelf: 'center'}}>
        <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'center', lineHeight: ts(16),includeFontPadding: false,}}  numberOfLines={2} >{item.numberII}</Text>
        </View>
        
        <View style={{width: '53%',  justifyContent: 'center',alignSelf: 'center',  height: 37}}>
        <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'left', lineHeight: ts(16), includeFontPadding: false, }}  numberOfLines={2}>{item.systemName}</Text>
        </View>
        
        <View style={{width: '22%', justifyContent: 'center',alignSelf: 'center' }}>
        <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'center', lineHeight: ts(16), includeFontPadding: false, }}  numberOfLines={2}>{item.comments}</Text>
        </View>

        <View style={{width: '14%',  justifyContent: 'center'}}>
        {(item.status =='Ведутся СМР') ? ( <TouchableWithoutFeedback><View style={{width: '92%', height: '25', justifyContent: 'center', backgroundColor: 'white', borderRadius: 8}}>
        <Text style={{ fontSize: ts(14), color: colorBlue, textAlign: 'center'  }}>СМР</Text></View></TouchableWithoutFeedback>): ''} 
        {(item.status =='Завершены СМР') ? ( <View style={{width: '92%', height: '25',justifyContent: 'center', backgroundColor: colorBlue, borderRadius: 8}}>
        <Text style={{ fontSize: ts(14), color: 'white', textAlign: 'center'  }}>СМР</Text></View>): ''} 

        {(item.status =='Предъявлено в ПНР') ? ( <View style={{width: '92%', height: '25', justifyContent: 'center', backgroundColor: 'white', borderRadius: 8}}>
        <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'center'  }}>ПНР</Text></View>): ''} 
        {(item.status =='Принято в ПНР') ? ( <View style={{width: '92%', height: '25', justifyContent: 'center', backgroundColor: 'white', borderRadius: 8}}>
        <Text style={{ fontSize: ts(14), color: colorBlue, textAlign: 'center'  }}>ПНР</Text></View>): ''} 
        {(item.status =='Ведутся ПНР') ? ( <View style={{width: '92%', height: '25', justifyContent: 'center', backgroundColor: colorBlue, borderRadius: 8}}>
        <Text style={{ fontSize: ts(14), color: 'white', textAlign: 'center'  }}>ПНР</Text></View>): ''} 

        {(item.status =='Проведены ИИ') ? ( <View style={{width: '92%', height: '25', justifyContent: 'center', backgroundColor: colorBlue, borderRadius: 8}}>
        <Text style={{ fontSize: ts(14), color: 'white', textAlign: 'center'  }}>ИИ</Text></View>): ''} 
        {(item.status =='Акт ИИ на подписи') ? ( <View style={{width: '92%', height: '25', justifyContent: 'center', backgroundColor: 'white', borderRadius: 8}}>
        <Text style={{ fontSize: ts(14), color: '#16a34a', textAlign: 'center'  }}>ИИ</Text></View>): ''} 
        {(item.status =='Акт ИИ подписан') ? ( <View style={{width: '92%', height: '25', justifyContent: 'center', backgroundColor: '#16a34a', borderRadius: 8}}>
        <Text style={{ fontSize: ts(14), color: 'white', textAlign: 'center'  }}>ИИ</Text></View>): ''} 

        {(item.status =='Проводится КО') ? ( <View style={{width: '92%', height: '25', justifyContent: 'center', backgroundColor: 'white', borderRadius: 8}}>
        <Text style={{ fontSize: ts(14), color: colorBlue, textAlign: 'center'  }}>КО</Text></View>): ''}
        {(item.status =='Проведено КО') ? ( <View style={{width: '92%', height: '25', justifyContent: 'center', backgroundColor: colorBlue, borderRadius: 8}}>
        <Text style={{ fontSize: ts(14), color: 'white', textAlign: 'center'  }}>КО</Text></View>): ''}
        {(item.status =='Акт КО на подписи') ? ( <View style={{width: '92%', height: '25', justifyContent: 'center', backgroundColor: 'white', borderRadius: 8}}>
        <Text style={{ fontSize: ts(14), color: '#16a34a', textAlign: 'center'  }}>КО</Text></View>): ''}
        {(item.status =='Акт КО подписан') ? ( <View style={{width: '92%', height: '25', justifyContent: 'center', backgroundColor: '#16a34a', borderRadius: 8}}>
        <Text style={{ fontSize: ts(14), color: 'white', textAlign: 'center'  }}>КО</Text></View>): ''}
        </View>
    </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ backgroundColor: 'white', flex: 1 }}>
      <HeaderForTabs nameTab='Структура' capitalCSName={capitalCSName} role={role}/>
      
      <View style={styles.container}>
        <View style={{width: '96%', alignSelf: 'center',  flexDirection: 'row', height: 40,}}>
            <View style={{width: '10%', }}>
            <Text style={{ fontSize: MonoSizeText(14), color: colorText, textAlign: 'center' }}>№ акта</Text>
            </View>

            <View style={{width: '55%', }}>
            <Text style={{ fontSize: MonoSizeText(14), color: colorText, textAlign: 'center' }}>Подобъект/Система</Text>
            </View>

            <View style={{width: '21%', }}>
            <Text style={{ fontSize: MonoSizeText(14), color: colorText, textAlign: 'center' }}>Замеч</Text>
            </View>

            <View style={{width: '14%', flexDirection: 'column'}}>
            <Text style={{ fontSize: MonoSizeText(14), color: colorText, textAlign: 'center' }}>Статус</Text>
            <TouchableOpacity onPress={()=>setVisible(true)}>
            <Ionicons name='help-circle-outline' size={20} style={{alignSelf: 'center', width: 22, color: colorBlue}} /></TouchableOpacity>
            </View>
        </View>

        <SectionList
          ref={sectionListRef}
          sections={data_}
          onScroll={handleScroll}
          extraData={[expandedSections, lastSectionId, lastItemInSection]}
          keyExtractor={(item, index) => item.pnrsystemId?.toString() || index.toString()}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onScrollToIndexFailed={(info) => {
            console.log('Scroll to index failed:', info);
            setTimeout(() => {
              if (sectionListRef.current && data_.length > 0) {
                sectionListRef.current.scrollToLocation({
                  sectionIndex: Math.min(info.index, data_.length - 1),
                  itemIndex: 0,
                  animated: true,
                });
              }
            }, 500);
          }}
        />

        <Modal
          animationType="fade"
          transparent={true}
          visible={visible}
          onRequestClose={() => setVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity onPress={() => setVisible(false)} style = {{alignSelf: 'flex-end', }}>
                <Ionicons name='close-outline' size={30} />
              </TouchableOpacity>
              <View style={{flexDirection: 'row', justifyContent: 'center'}}      >       
                <View style={{width: '20%'}}>   
                  <View style={{width: '80%', height: '25', justifyContent: 'center', backgroundColor: 'white', borderRadius: 8, marginBottom: 5}}>
                    <Text style={{ fontSize: ts(14), color: colorBlue, textAlign: 'center'  }}>СМР</Text></View>
                  <View style={{width: '80%', height: '25',justifyContent: 'center', backgroundColor: colorBlue, borderRadius: 8, marginBottom: 5}}>
                    <Text style={{ fontSize: ts(14), color: 'white', textAlign: 'center'  }}>СМР</Text></View>

                  <View style={{width: '80%', height: '25', justifyContent: 'center', backgroundColor: 'white', borderRadius: 8, marginBottom: 5}}>
                    <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'center'  }}>ПНР</Text></View>
                  <View style={{width: '80%', height: '25', justifyContent: 'center', backgroundColor: 'white', borderRadius: 8, marginBottom: 5}}>
                    <Text style={{ fontSize: ts(14), color: colorBlue, textAlign: 'center'  }}>ПНР</Text></View>
                  <View style={{width: '80%', height: '25', justifyContent: 'center', backgroundColor: colorBlue, borderRadius: 8, marginBottom: 5}}>
                    <Text style={{ fontSize: ts(14), color: 'white', textAlign: 'center'  }}>ПНР</Text></View>

                  <View style={{width: '80%', height: '25', justifyContent: 'center', backgroundColor: colorBlue, borderRadius: 8, marginBottom: 5}}>
                    <Text style={{ fontSize: ts(14), color: 'white', textAlign: 'center'  }}>ИИ</Text></View>
                  <View style={{width: '80%', height: '25', justifyContent: 'center', backgroundColor: 'white', borderRadius: 8, marginBottom: 5}}>
                    <Text style={{ fontSize: ts(14), color: '#16a34a', textAlign: 'center'  }}>ИИ</Text></View>
                  <View style={{width: '80%', height: '25', justifyContent: 'center', backgroundColor: '#16a34a', borderRadius: 8, marginBottom: 5}}>
                    <Text style={{ fontSize: ts(14), color: 'white', textAlign: 'center'  }}>ИИ</Text></View> 

                  <View style={{width: '80%', height: '25', justifyContent: 'center', backgroundColor: 'white', borderRadius: 8, marginBottom: 5}}>
                    <Text style={{ fontSize: ts(14), color: colorBlue, textAlign: 'center'  }}>КО</Text></View>
                  <View style={{width: '80%', height: '25', justifyContent: 'center', backgroundColor: colorBlue, borderRadius: 8, marginBottom: 5}}>
                    <Text style={{ fontSize: ts(14), color: 'white', textAlign: 'center'  }}>КО</Text></View>
                  <View style={{width: '80%', height: '25', justifyContent: 'center', backgroundColor: 'white', borderRadius: 8, marginBottom: 5}}>
                    <Text style={{ fontSize: ts(14), color: '#16a34a', textAlign: 'center'  }}>КО</Text></View>
                  <View style={{width: '80%', height: '25', justifyContent: 'center', backgroundColor: '#16a34a', borderRadius: 8, marginBottom: 5}}>
                    <Text style={{ fontSize: ts(14), color: 'white', textAlign: 'center'  }}>КО</Text></View>
                  </View>  

                  <View style={{width: '50%'}}>   
                    <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'left', marginBottom: 11.2  }}>Ведутся СМР</Text>
                    <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'left', marginBottom: 11.2  }}>Завершены СМР</Text>

                    <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'left' , marginBottom: 11.2 }}>Предъявлено в ПНР</Text>
                    <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'left', marginBottom: 11.2 }}>Принято в ПНР</Text>
                    <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'left' , marginBottom: 11.2 }}>Ведутся ПНР</Text>
                    
                    <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'left' , marginBottom: 11.2 }}>Проведены ИИ</Text>
                    <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'left' , marginBottom: 11.2 }}>Акт ИИ на подписи</Text>
                    <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'left' , marginBottom: 11.2 }}>Акт ИИ подписан</Text>

                    <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'left' , marginBottom: 11.2 }}>Проводится КО</Text>
                    <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'left'  , marginBottom: 11.2}}>Проведено КО</Text>
                    <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'left' , marginBottom: 11.2 }}>Акт КО на подписи</Text>
                    <Text style={{ fontSize: ts(14), color: colorText, textAlign: 'left' , marginBottom: 11.2 }}>Акт КО подписан</Text>

                  </View> 
                </View>  
              </View>
            </View>
          </Modal>
            <FloatingScrollToTop
            visible={showScrollTop}
            onPress={() => {
              if (sectionListRef.current) {
                sectionListRef.current.scrollToLocation({
              sectionIndex: 0,
              itemIndex: 0,
              animated: true,
              viewPosition: 0
            });
              }
            }}
            position={{ bottom: 40, right: 20 }}
          />
      </View>
      <PermissionGuard required='IIACTS_UPLOAD'>
        <CustomButton
          title="Загрузить"
          handlePress={() => router.push({
            pathname: '/structures/load_registry', 
            params: { codeCCS: codeCCS, capitalCSName: capitalCSName }
          })} 
        />
      </PermissionGuard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    backgroundColor: '#E0F2FE',
    width: '96%',
    height: 37,
    marginBottom: '3%',
    marginTop: '2%',
    alignItems: 'center',
    borderRadius: 8,
    alignSelf: 'center'
  },
  itemContainer: {
    width: '98.5%'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    height: 400,
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'center',
  },
});

export default Struct;