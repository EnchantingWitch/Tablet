import DateInputWithPicker2 from '@/components/Calendar+';
import CalendarWithoutDel from '@/components/CalendarWithoutDel';
import CustomButton from '@/components/CustomButton';
import DropdownComponent2 from '@/components/ListOfCategories';
import ListOfSubobj from '@/components/ListOfOrganizations';
import ListOfSystem from '@/components/ListOfSystem';
import { database } from '@/DB/database'; // Импортируем WatermelonDB
import { useColorGray, useColorText } from '@/hooks/useColorText';
import { Ionicons } from '@expo/vector-icons';
import { Q } from '@nozbe/watermelondb';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const { width, height } = Dimensions.get('window');

type Note = {
  id: string;
  commentId?: number;
  serialNumber: number;
  subobject: string;
  system_name: string;
  description: string;
  comment_status: string;
  comment_category: string;
  start_date: string;
  end_date_plan: string;
  end_date_fact: string;
  comment_explanation: string;
  ii_number: number;
  object_id: string;
  user_name?: string;
  executor?: string;
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

const DetailsScreen = () => {
  const BOTTOM_SAFE_AREA = Platform.OS === 'android' ? StatusBar.currentHeight : 0;
  const colorText = useColorText();
  const colorGray = useColorGray();
  
  const { codeCCS } = useLocalSearchParams();
  const { capitalCSName } = useLocalSearchParams();
  const { post } = useLocalSearchParams(); // ID из WatermelonDB
  const { lastViewedNote } = useLocalSearchParams();
  const { noteData } = useLocalSearchParams(); // Данные заметки в JSON (опционально)

  console.log('Note ID from params:', post);
  console.log('Object codeCCS:', codeCCS);

  const [accessToken, setAccessToken] = useState<any>('');
  const [role, setRole] = useState<string>('');
  
  const fontScale = useWindowDimensions().fontScale;
  const ts = (fontSize: number) => fontSize / fontScale;

  // Состояния для данных заметки
  const [serNumber, setSerNumber] = useState<string>('');
  const [numberII, setNumberII] = useState<string>('');
  const [subObj, setSubObj] = useState<string>('');
  const [systemN, setSystemN] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [commentStat, setCommentStat] = useState<string>('');
  const [startD, setStartD] = useState<string>('');
  const [planD, setPlanD] = useState<string>('');
  const [factD, setFactD] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [execut, setExecut] = useState<string>('');
  const [flagDate, setFlagDate] = useState<boolean>(false);
  const [flagFromServer, setFlagFromServer] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false); // Режим определяется по флагу

  // Состояния для структуры (подобъекты, системы, исполнители)
  const [structure, setStructure] = useState<StructureItem[]>([]);
  const [listSubObj, setListSubObj] = useState<ListToDrop[]>([]);
  const [listSystem, setListSystem] = useState<ListToDrop[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [originalNote, setOriginalNote] = useState<Note | null>(null);

  const getToken = async (key: string, setF: (value: any) => void) => {
    try {
      const token = await SecureStore.getItemAsync(key);
      if (token !== null) {
        console.log('Retrieved token:', token);
        setF(token);
      } else {
        console.log('No token found');
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
    }
  };

  // Получение заметки из локальной базы данных
  const getNoteFromDB = async () => {
    try {
      if (!database) {
        console.error('Database is not initialized');
        throw new Error('База данных не инициализирована');
      }

      const notesCollection = database.collections.get('notes');
      let note;

      // Пытаемся найти по ID (если post - это ID из WatermelonDB)
      if (post && typeof post === 'string') {
        note = await notesCollection.find(post);
      }

      // Если не нашли по ID, ищем по object_id и ii_number
      if (!note && codeCCS) {
        const notes = await notesCollection
          .query(
            Q.where('object_id', codeCCS as string),
            Q.where('ii_number', post as string)
          )
          .fetch();
        
        if (notes.length > 0) {
          note = notes[0];
        }
      }

      // Если переданы данные в параметрах
      if (!note && noteData && typeof noteData === 'string') {
        try {
          const parsedData = JSON.parse(noteData);
          return parsedData;
        } catch (e) {
          console.error('Error parsing noteData:', e);
        }
      }

      if (!note) {
        throw new Error('Замечание не найдено в локальной базе данных');
      }
      return {
        id: note.id,
        serialNumber: parseInt(note.ii_number) || 0,
        ii_number: note.ii_number || '',
        subobject: note.subobject || '',
        system_name: note.system_name || '',
        description: note.description || '',
        comment_status: note.comment_status || '',
        comment_category: note.comment_category || '',
        start_date: note.start_date || '',
        end_date_plan: note.end_date_plan || '',
        end_date_fact: note.end_date_fact || '',
        comment_explanation: note.comment_explanation || '',
        object_id: note.object_id || '',
        executor: note.executor || '',
        user_name: note.user_name || '',
        flag_from_server: note.flag_from_server 
      };
    } catch (error) {
      console.error('Error loading note from database:', error);
      throw error;
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
        await getToken('accessToken', setAccessToken);
        await getToken('role', setRole);
        
        setIsOnline(!!accessToken);

        // Загружаем данные заметки
        const noteData = await getNoteFromDB();
        
        if (noteData) {
          setSerNumber(noteData.serialNumber.toString());
          setNumberII(noteData.ii_number.toString());
          setSubObj(noteData.subobject);
          setSystemN(noteData.system_name);
          setComment(noteData.description);
          setCommentStat(noteData.comment_status);
          setStartD(noteData.start_date);
          setPlanD(noteData.end_date_plan);
          setFactD(noteData.end_date_fact);
          setCategory(noteData.comment_category);
          setExplanation(noteData.comment_explanation);
          setCode(noteData.object_id);
          setExecut(noteData.executor || '');
          setFlagFromServer(noteData.flag_from_server );
          setOriginalNote(noteData);
          setFlagDate(true);
          // Автоматически устанавливаем режим редактирования по флагу
          setIsEditing(!noteData.flag_from_server);
        }

        // Загружаем структуру (только в режиме редактирования или для заполнения списков)
        const structureData = await getStructureFromDB();
        setStructure(structureData);

        // Формируем список подобъектов
        if (structureData.length > 0) {
          const subObjList = structureData.map(item => ({
            label: item.subobject_name,
            value: item.subobject_name
          }));
          setListSubObj(subObjList);

          // Если есть выбранный подобъект, формируем список систем
          if (noteData && noteData.subobject) {
            const filteredSubObj = structureData.find(item => item.subobject_name === noteData.subobject);
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
          'Не удалось загрузить данные замечания. Проверьте подключение или загрузите данные заново.',
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
      setCommentStat('Устранено');
    } else {
      setCommentStat('Не устранено');
    }
  }, [factD]);

  // Обработчик сохранения изменений (только для локальных записей)
  const saveNoteLocally = async () => {
    if (flagFromServer) {
      Alert.alert(
        'Ограничение',
        'Нельзя сохранять изменения для замечаний с сервера в оффлайн-режиме'
      );
      return;
    }

    try {
      if (!database) {
        throw new Error('База данных не инициализирована');
      }

      // Проверка обязательных полей
      if (!subObj.trim() || !systemN.trim() || !comment.trim() || !category.trim()) {
        Alert.alert(
          'Ошибка',
          'Заполните обязательные поля: Подобъект, Система, Содержание, Категория'
        );
        return;
      }

      await database.write(async () => {
        const notesCollection = database.collections.get('notes');
        
        // Находим запись
        let note;
        if (post && typeof post === 'string') {
          note = await notesCollection.find(post);
        } else if (originalNote && originalNote.id) {
          note = await notesCollection.find(originalNote.id);
        }

        if (note) {
          // Обновляем запись
          await note.update((record: any) => {
            record.subobject = subObj;
            record.system_name = systemN;
            record.description = comment;
            record.comment_status = commentStat;
            record.comment_category = category;
            record.comment_explanation = explanation;
            record.end_date_fact = factD;
            record.end_date_plan = planD;
            record.start_date = startD;
            record.executor = execut;
            record.ii_number = numberII;
            // Локальные записи всегда имеют flag_from_server = false
            record.flag_from_server = false;
          });

          Alert.alert(
            'Успешно',
            'Изменения сохранены локально',
            [{ text: 'OK', onPress: () => router.push('/offline/notes') }]
          );
        } else {
          throw new Error('Запись не найдена');
        }
      });
    } catch (error) {
      console.error('Error saving note locally:', error);
      Alert.alert(
        'Ошибка',
        'Не удалось сохранить изменения локально'
      );
    }
  };

  // Удаление заметки
  const handleDeleteNote = async () => {
    Alert.alert(
      'Подтверждение',
      'Удалить это замечание?',
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
                const notesCollection = database.collections.get('notes');
                
                let note;
                if (post && typeof post === 'string') {
                  note = await notesCollection.find(post);
                } else if (originalNote && originalNote.id) {
                  note = await notesCollection.find(originalNote.id);
                }

                if (note) {
                  await note.markAsDeleted();
                  Alert.alert(
                    'Успешно',
                    'Замечание удалено',
                    [{ text: 'OK', onPress: () => router.push('/offline/notes') }]
                  );
                }
              });
            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Ошибка', 'Не удалось удалить замечание');
            }
          }
        }
      ]
    );
  };

  // Проверка, доступно ли редактирование даты устранения
  const isDateEditable = () => {
    return !flagFromServer; // Только локальные записи можно редактировать
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" style={{ flex: 1 }} />
      </View>
    );
  }

  console.log('flagFromServer',flagFromServer)

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      enableOnAndroid={true}
      extraScrollHeight={100}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={[styles.container]}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          {/* Индикатор режима */}
          {!isOnline && (
            <View style={styles.offlineIndicator}>
              <Ionicons name="cloud-offline" size={16} color="#FF9500" />
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
              color={flagFromServer ? "#007AFF" : "#34C759"} 
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
              color="#8E8E93" 
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

          <View style={{ flexDirection: 'row', width: '98%', marginBottom: 0 }}>
            <View style={{ width: '20%', alignItems: 'center' }}>
              <TextInput
                style={[styles.input, { 
                  fontSize: ts(14), 
                  marginTop: 6, 
                  borderColor:  colorGray, 
                  color:  colorGray,
                  backgroundColor: '#F9F9F9'
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
                  backgroundColor: '#F9F9F9'
                }]}
                value={numberII}
                editable={false}
              />
            </View>

            <View style={{ width: '60%', alignContent: 'flex-end' }}>
              {isEditing ? (
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
                    borderColor: colorGray, 
                    color: colorGray,
                    backgroundColor: '#F9F9F9'
                  }]}
                  value={subObj}
                  multiline
                  editable={false}
                  maxLength={45}
                />
              )}
            </View>
          </View>

          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Система</Text>
          {isEditing ? (
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
                borderColor: colorGray, 
                color: colorGray,
                backgroundColor: '#F9F9F9'
              }]}
              value={systemN}
              multiline
              editable={false}
            />
          )}

          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Содержание замечания</Text>
          <TextInput
            style={[styles.input, {
              height: 'auto',
              minHeight: 42,
              maxHeight: 100,
              fontSize: ts(14),
              borderColor:  colorGray,
              color:  colorGray,
              backgroundColor: isEditing ? '#FFFFFF' : '#F9F9F9',
              textAlignVertical: 'top'
            }]}
            multiline
            value={comment}
            editable={isEditing}
            onChangeText={setComment}
          />

          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Статус</Text>
          <TextInput
            style={[styles.input, { 
              fontSize: ts(14), 
              borderColor: colorGray, 
              color: colorGray,
              backgroundColor: '#F9F9F9'
            }]}
            value={commentStat}
            editable={false}
          />

          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Исполнитель</Text>
          <TextInput
            style={[styles.input, { 
              fontSize: ts(14), 
              borderColor: colorGray, 
              color: colorGray,
              backgroundColor: '#F9F9F9'
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

          <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
            
              {isEditing ? (
                <CalendarWithoutDel 
                  theme='min' 
                  post={startD}
                  statusreq={flagDate}
                  onChange={(dateString) => setStartD(dateString)}
                />
              ) : (
              <View style={{ width: '49%', justifyContent: 'center' }}>
                <TextInput
                  style={[styles.input, { 
                    fontSize: ts(14), 
                    width: '100%', 
                    marginTop: 6, 
                    borderColor: colorGray, 
                    color: colorGray,
                    backgroundColor: '#F9F9F9'
                  }]}
                  value={startD}
                  editable={false}
                /> </View>
              )}
           
            
            <View style={{ width: '49%', justifyContent: 'center' }}>
              {isEditing ? (
                <DateInputWithPicker2  
                theme='min'
                  post={planD || ' '} 
                  statusreq={flagDate}
                  onChange={(dateString) => setPlanD(dateString)}
                />
              ) : (
                <TextInput
                  style={[styles.input, { 
                    fontSize: ts(14), 
                    width: '100%', 
                    marginTop: 6, 
                    borderColor: colorGray, 
                    color: colorGray,
                    backgroundColor: '#F9F9F9'
                  }]}
                  value={planD}
                  editable={false}
                />
              )}
            </View>
          </View>

          
              <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>Категория</Text>

            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
              {isEditing ? (
                <DropdownComponent2 
                  post={category} 
                  onChange={(newCategory) => setCategory(newCategory)}
                />
              ) : (
                <TextInput
                  style={[styles.input, { 
                    fontSize: ts(14), 
                    width: '100%', 
                    marginTop: 6, 
                    borderColor: colorGray, 
                    color: colorGray,
                    backgroundColor: '#F9F9F9'
                  }]}
                  value={category}
                  editable={false}
                />
              )}
            </View>
          </View>

          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: 400, marginBottom: 8 , alignSelf: 'center'}}>Комментарий</Text>
          <TextInput
            style={[styles.input, { 
              fontSize: ts(14), 
              borderColor: colorGray, 
              color: colorGray,
              backgroundColor: isEditing ? '#FFFFFF' : '#F9F9F9',
              textAlignVertical: 'top', alignSelf: 'center'
            }]}
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
                handlePress={saveNoteLocally}
                buttonStyle={styles.saveButton}
              />
              
              <View style={{ marginTop: 12 }}>
                <CustomButton
                  title="Удалить замечание"
                  handlePress={handleDeleteNote}
                  buttonStyle={styles.deleteButton}
                />
              </View>
            </View>
          )}

          {/* Для серверных записей - только просмотр, кнопок нет */}
          {flagFromServer && (
            <View style={styles.viewOnlyMessage}>
              <Ionicons name="information-circle-outline" size={20} color="#8E8E93" />
              <Text style={styles.viewOnlyText}>
                Это замечание загружено с сервера. Для редактирования перейдите в онлайн-режим.
              </Text>
            </View>
          )}

          <View style={{ 
            paddingBottom: BOTTOM_SAFE_AREA + 20,
            width: '100%'
          }}>
            {/* Пустой элемент для отступа */}
          </View>
        </View>
    </KeyboardAwareScrollView>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    width: '96%',
    height: 42,
    paddingVertical: 'auto',
    color: '#B3B3B3',
    textAlign: 'center',
    marginBottom: 20,
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E5',
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
    backgroundColor: '#F0F8FF',
  },
  localIndicator: {
    backgroundColor: '#F0FFF4',
  },
  offlineText: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '500',
  },
  sourceText: {
    fontSize: 14,
    fontWeight: '500',
  },
  serverText: {
    color: '#007AFF',
  },
  localText: {
    color: '#34C759',
  },
  modeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    gap: 6,
    width: '96%',
  },
  modeInfoText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '400',
  },
  actionButtons: {
    width: '96%',
    marginTop: 20,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  viewOnlyMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F2F2F7',
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
    color: '#8E8E93',
    lineHeight: 16,
  },
});

export default DetailsScreen;