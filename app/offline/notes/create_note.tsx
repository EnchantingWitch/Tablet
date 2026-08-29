import { brand } from '@/constants/Colors';
import DateInputWithPicker2 from '@/components/Calendar+';
import DateInputWithPicker from '@/components/CalendarOnWrite';
import CustomButton from '@/components/CustomButton';
import DropdownComponent2 from '@/components/ListOfCategories';
import ListOfSubobj from '@/components/ListOfOrganizations';
import ListOfSystem from '@/components/ListOfSystem';
import { database } from '@/DB/database'; // Импортируем WatermelonDB
import { useColorGray, useColorText } from '@/hooks/useColorText';
import { Q } from '@nozbe/watermelondb';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Platform, StatusBar, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export type ListToDrop = {
  label: string;
  value: string; 
};

const { width, height } = Dimensions.get('window');

type StructureItem = {
  subObjectName: string;
  data: {
    systemName: string;
    numberII: string;
    ciwexecutor: string;
    pnrsystemId?: string;
  }[];
};

export default function CreateNote() {
  const BOTTOM_SAFE_AREA = Platform.OS === 'android' ? StatusBar.currentHeight : 0;
  const colorText = useColorText();
  const colorGray = useColorGray();
  const [listSubObj, setListSubObj] = useState<ListToDrop[]>([]);
  const [listSystem, setListSystem] = useState<ListToDrop[]>([]);
  const [upLoading, setUpLoading] = useState(false);
  const [array, setArray] = useState<StructureItem[]>([]);//данные по структуре из локальной БД
  
  const [exit, setExit] = useState<boolean>(false);//если true нельзя создать замечание
  const [statusReq, setStatusReq] = useState(false);//для выпадающих списков
  const [req, setReq] = useState<boolean>(true);//ограничение на получение запроса только единожды 
  
  const [numberII, setNumber] = useState('');
  const [subObject, setSubObject] = useState('');
  const [systemName, setSystemName] = useState(' ');
  const [description, setDescription] = useState('');
  const [execut, setExecut] = useState('');
  const [userName, setUserName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [category, setCategory] = useState('');
  const [comExp, setComExp] = useState('');
  const [planDate, setPlanDate] = useState(' ');
  const [inputHeight, setInputHeight] = useState(40);
  const [bufsystem, setBufsystem] = useState('');

  const [accessToken, setAccessToken] = useState<any>('');
  const [organisationFrAsync, setOrganisationFrAsync] = useState<any>('');
  const [fullNameFrAsync, setFullNameFrAsync] = useState<any>('');
  const [disabled, setDisabled] = useState(false); //для кнопки
  const fontScale = useWindowDimensions().fontScale;

  const ts = (fontSize: number) => {
    return (fontSize / fontScale)
  };

  const {codeCCS} = useLocalSearchParams();//получение codeCCS объекта
  const {capitalCSName} = useLocalSearchParams();

  const getToken = async (keyToken, setF) => {
    try {
      const token = await SecureStore.getItemAsync(keyToken);
      if (token !== null) {
        console.log('Retrieved token:', keyToken, '-', token);
        setF(token);
      } else {
        console.log('No token found');
        // В оффлайн режиме не перенаправляем на авторизацию
        console.log('Оффлайн режим: токен не найден');
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
        setExit(true);
        return;
      }

      console.log(`🔍 Loading structure from DB for object: ${codeCCS}`);
      
      const systemsCollection = database.collections.get('systems');
      
      // Получаем системы для текущего объекта
      const systems = await systemsCollection
        .query(
          Q.where('code_ccs', codeCCS)
        )
        .fetch();
      
      console.log(`✅ Found ${systems.length} systems for object ${codeCCS}`);
      
      if (systems.length === 0) {
        console.log('⚠️ No systems found in database');
        Alert.alert(
          'Внимание', 
          'Для этого объекта нет сохраненной структуры. Пожалуйста, загрузите структуру при наличии интернета.',
          [{ text: 'OK' }]
        );
        setExit(true);
        return;
      }
      
      // Группируем системы по подобъектам
      const groupedBySubobject = {};
      
      systems.forEach(system => {
        const subObjectName = system.subobject_name || 'Не указан';
        const systemName = system.system_name || 'Не указана';
        const numberII = system.ii_number || '';
        const ciwexecutor = system.ciwexecutor || '';
        
        if (!groupedBySubobject[subObjectName]) {
          groupedBySubobject[subObjectName] = {
            subObjectName: subObjectName,
            data: []
          };
        }
        
        groupedBySubobject[subObjectName].data.push({
          systemName: systemName,
          numberII: numberII,
          ciwexecutor: ciwexecutor,
          pnrsystemId: system.id_pnrsystem_from_db || ''
        });
      });
      
      const formattedStructure = Object.values(groupedBySubobject);
      setArray(formattedStructure);
      setStatusReq(true);
      
      // Логируем структуру
      console.log('📊 Formatted structure:', {
        subobjects: formattedStructure.length,
        totalSystems: formattedStructure.reduce((acc, item) => acc + item.data.length, 0)
      });
      
    } catch (error) {
      console.error('❌ Error loading structure from database:', error);
      setExit(true);
      Alert.alert(
        'Ошибка', 
        'Не удалось загрузить структуру из базы данных',
        [{ text: 'OK' }]
      );
    }
  };

  // Сохранение заметки в локальную базу данных
  const saveNoteToDB = async () => {
    try {
      if (!database) {
        throw new Error('Database is not initialized');
      }

      // Генерируем уникальный ID для заметки
      const noteId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await database.write(async () => {
        const notesCollection = database.collections.get('notes');
        
        // Сохраняем заметку
        const noteData = {
          object_id: codeCCS as string,
          code_ccs: codeCCS as string,
          id_from_server: '', // Локальный ID
          ii_number: numberII || '',
          subobject: subObject || '',
          system_name: systemName || '',
          description: description || '',
          comment_status: "Не устранено",
          executor: execut || '',
          user_name: fullNameFrAsync || '',
          start_date: startDate || '',
          comment_category: category || '',
          comment_explanation: comExp || '',
          end_date_plan: planDate || '',
          end_date_fact: ' ',
          flag_from_server: false,
        };
        
        console.log('📝 Saving note to local database:', noteData);
        
        await notesCollection.create((record: any) => {
          Object.keys(noteData).forEach(key => {
            record[key] = noteData[key];
          });
        });
        
        console.log('✅ Note saved successfully to local database');
      });
      
      return { success: true, noteId };
      
    } catch (error) {
      console.error('❌ Error saving note to database:', error);
      throw error;
    }
  };

  // Основная функция отправки данных
  const submitData = async () => {
    setDisabled(true);
    setUpLoading(true);

    try {
      // Валидация
      if (subObject === '' || systemName === ' ' || systemName === '' || description === '' || category === '') {
        Alert.alert('', 'Заполните поля подобъекта, системы, содержания замечания, категории', [
          { text: 'OK' }
        ]);
        setDisabled(false);
        setUpLoading(false);
        return;
      }

      // Проверяем, есть ли интернет (опционально)
      const hasInternet = false; // Замените на реальную проверку
      
      if (hasInternet) {
        // Режим онлайн - отправляем на сервер
        //await submitToServer();
      } else {
        // Режим оффлайн - сохраняем локально
        await submitLocally();
      }
      
    } catch (error) {
      console.error('Error in submitData:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить замечание', [{ text: 'OK' }]);
    } finally {
      setDisabled(false);
      setUpLoading(false);
    }
  };


  // Сохранение локально (оффлайн режим)
  const submitLocally = async () => {
    try {
      // Сохраняем заметку в локальную БД
      await saveNoteToDB();
      
      Alert.alert(
        'Сохранено локально', 
        'Замечание сохранено в локальную базу данных. Оно будет отправлено на сервер при наличии интернета.',
        [{ 
          text: 'OK', 
          onPress: () => {
            router.replace({ 
              pathname: '../(tabsWM)/notes', 
              params: { 
                codeCCS: codeCCS, 
                capitalCSName: capitalCSName,
                offlineMode: 'true' 
              }
            });
          }
        }]
      );
      
    } catch (error) {
      console.error('Error saving locally:', error);
      throw error;
    }
  };

  const handleSubObjectChange = (selectedSubObject: string) => {
    setSubObject(selectedSubObject);
    setSystemName(' ');
    setNumber('');
    setExecut('');
  };

  // Инициализация
  useEffect(() => {
    getToken('accessToken', setAccessToken);
    getToken('userID', setFullNameFrAsync);
    getToken('organisation', setOrganisationFrAsync);
    
    if (codeCCS && req) {
      getStructureFromDB();
      setReq(false);
    }
  }, [codeCCS, req]);

  // Формирование списка подобъектов
  useEffect(() => {
    if (array.length > 0) {
      const subObjList = array.map(item => ({
        label: item.subObjectName,
        value: item.subObjectName
      }));
      setListSubObj(subObjList);
    }
  }, [array]);

  // Формирование списка систем при изменении подобъекта
  useEffect(() => {
    if (subObject && array.length > 0) {
      const filtered = array.find(item => item.subObjectName === subObject);
      if (filtered) {
        const systemList = filtered.data.map(system => ({
          label: system.systemName,
          value: system.systemName
        }));
        setListSystem(systemList);
        setSystemName(' ');
        setNumber('');
        setExecut('');
      }
    }
  }, [subObject, array]);

  // Обновление номера АИИ и исполнителя при изменении системы
  useEffect(() => {
    if (systemName !== ' ' && systemName !== bufsystem && subObject) {
      setBufsystem(systemName);
      const filtered = array.find(item => item.subObjectName === subObject);
      if (filtered) {
        const systemData = filtered.data.find(item => item.systemName === systemName);
        if (systemData) {
          setNumber(systemData.numberII);
          setExecut(systemData.ciwexecutor);
        }
      }
    }
  }, [systemName, subObject, array]);

  if (exit) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: ts(16), color: colorText, textAlign: 'center', marginBottom: 20 }}>
            Нет данных о структуре объекта
          </Text>
          <Text style={{ fontSize: ts(14), color: colorGray, textAlign: 'center', marginBottom: 30 }}>
            Для создания замечания необходимо загрузить структуру объекта при наличии интернета
          </Text>
          <CustomButton
            title="Вернуться к списку замечаний"
            handlePress={() => router.back()}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      enableOnAndroid={true}
      extraScrollHeight={100}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={styles.container}>
        <View style={{ flex: 1, alignItems: 'center' }}>

          <View style={{width: '100%', alignItems: 'center'}}>
            <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8, textAlign: 'center' }}>
              Подобъект
            </Text>
            <ListOfSubobj 
              data={listSubObj} 
              post={subObject} 
              status={statusReq}
              label='Подобъект'
              title='' 
              onChange={(subobj) => handleSubObjectChange(subobj)}
            />
          </View>

          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8, paddingTop: 6 }}>
            Система
          </Text>
          <ListOfSystem 
            list={listSystem}
            buf={bufsystem}
            post={systemName} 
            onChange={(system) => setSystemName(system)}
          />

          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>
            Содержание замечания
          </Text>
          <TextInput
            multiline
            onContentSizeChange={(e) => {
              let inputH = Math.max(e.nativeEvent.contentSize.height, 35);
              if (inputH > 120) inputH = 100;
              setInputHeight(inputH);
            }}
            style={[
              styles.input, 
              {
                height: Math.max(42, inputHeight),
                minHeight: 42,
                maxHeight: 100,
                fontSize: ts(14),
                borderColor: colorGray,
                color: colorGray
              }
            ]}
            maxLength={250}
            placeholderTextColor={brand.textPrimary}
            onChangeText={setDescription}
            value={description}
          />
          {description.length >= 200 && (
            <Text style={{ fontSize: ts(11), color: colorGray, fontWeight: '400', marginTop: -14.6 }}>
              Можете ввести еще {250 - description.length}{' '}
              {(250 - description.length) % 10 === 1 ? 'символ' :
               (250 - description.length) % 10 >= 2 && (250 - description.length) % 10 <= 4 ? 'символа' : 'символов'}
            </Text>
          )}

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
            <DateInputWithPicker 
              theme='min' 
              onChange={(dateString) => setStartDate(dateString)}
            />
            <DateInputWithPicker2 
              statusreq={true} 
              post={planDate} 
              theme='min' 
              onChange={(dateString) => setPlanDate(dateString)}
            />
          </View>
         

          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>
            Категория замечания
          </Text>
          <DropdownComponent2 onChange={(category) => setCategory(category)} />

          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>
            Комментарий
          </Text>
          <TextInput
            style={[styles.input, { fontSize: ts(14), color: colorGray, borderColor: colorGray }]}
            placeholderTextColor={brand.textPrimary}
            onChangeText={setComExp}
            value={comExp} 
          />
        </View>
      </View>
      
      <View style={{ paddingBottom: BOTTOM_SAFE_AREA + 20 }}>
        <CustomButton
          disabled={disabled || upLoading}
          title={upLoading ? "Сохранение..." : "Добавить замечание"}
          handlePress={submitData}
        />
      </View>
    </KeyboardAwareScrollView>
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
});