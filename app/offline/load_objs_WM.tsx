import { useColorBlue, useColorGray, useColorGreen, useColorText } from '@/hooks/useColorText';
import { useToken } from '@/hooks/useToken';
// import * as Network from 'expo-network';
import { database } from '@/DB/database'; // Импортируем WatermelonDB
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Определяем типы для данных пользователя
interface UserData {
  userId: string;
  fio: string;
  role: string;
  organisation: string;
}

// Определяем тип для объекта
interface SavedObject {
  id: string;
  code_ccs: string;
  code_name_ccs: string;
}

// Определяем состояния проверки
type CheckStatus = 
  | 'checking_network'
  | 'network_unavailable'
  | 'network_available'
  | 'checking_auth'
  | 'auth_not_found'
  | 'invalid_role'
  | 'loading_objects'
  | 'no_objects'
  | 'selecting_object'
  | 'success'
  | 'error';

const OfflineCheckScreen = () => {
  const colorText = useColorText();
  const colorGreen = useColorGreen();
  const colorGreenLight = useColorGreen(0.4);
  const colorGray = useColorGray();
  const colorBlue = useColorBlue();
  const [status, setStatus] = useState<CheckStatus>('checking_network');
  const [userData, setUserData] = useState<UserData | null>(null);
  const { deleteArrayToSecureStore, getTokenFrAsync, saveTokenFrAsync, removeTokenFrAsync } = useToken();
  const [message, setMessage] = useState<string>('Идет проверка интернет соединения...');
  
  // Состояния для списка объектов
  const [savedObjects, setSavedObjects] = useState<SavedObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<SavedObject | null>(null);
  const [isLoadingObjects, setIsLoadingObjects] = useState(false);

  // Функция для сохранения данных в SecureStore
  const saveToSecureStore = async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
      return true;
    } catch (error) {
      console.error('Ошибка сохранения в SecureStore:', error);
      return false;
    }
  };

  // Функция для получения данных из SecureStore
  const getFromSecureStore = async (key: string): Promise<string | null> => {
    try {
      const result = await SecureStore.getItemAsync(key);
      console.log(result);
      return result;
    } catch (error) {
      console.error('Ошибка чтения из SecureStore:', error);
      return null;
    }
  };

  // Получение данных пользователя из SecureStore
  const getUserDataFromStorage = async (): Promise<UserData | null> => {
    try {
      const userId = await getFromSecureStore('userID');
      const fio = await getFromSecureStore('fullName');
      const role = await getFromSecureStore('role');
      const organisation = await getFromSecureStore('organisation');

      if (userId && fio && role) {
        return {
          userId,
          fio,
          role,
          organisation
        };
      }
      return null;
    } catch (error) {
      console.error('Ошибка получения данных пользователя:', error);
      return null;
    }
  };

  // Загрузка сохраненных объектов из WatermelonDB
  const loadSavedObjects = async () => {
    if (!database) {
      console.error('Database is not initialized');
      return [];
    }

    try {
      setIsLoadingObjects(true);
      const objectsCollection = database.collections.get('objects');
      
      // Получаем все объекты, отсортированные по названию
      const objects = await objectsCollection
        .query()
        .fetch();
      
      // Преобразуем в нужный формат
      const formattedObjects: SavedObject[] = objects.map(obj => ({
        id: obj.id,
        code_ccs: obj.code_ccs,
        code_name_ccs: obj.code_name_ccs
      }));
      
      // Сортируем по названию
      formattedObjects.sort((a, b) => 
        a.code_name_ccs.localeCompare(b.code_name_ccs)
      );
      
      setSavedObjects(formattedObjects);
      setIsLoadingObjects(false);
      
      return formattedObjects;
    } catch (error) {
      console.error('Error loading objects from database:', error);
      setIsLoadingObjects(false);
      return [];
    }
  };

  // Основная логика проверок
  const performChecks = async () => {
    // 1. Проверка интернет соединения
    setStatus('checking_network');
    setMessage('Идет проверка интернет соединения...');

    //const hasInternet = await checkNetworkConnection();
    const hasInternet = false;
    
    if (hasInternet) {
      setStatus('network_available');
      setMessage('Интернет соединение обнаружено. Осуществляем переход на форму авторизации...');
      
      // Даем время пользователю увидеть сообщение
      setTimeout(() => {
        router.push('./sign/sign_in');
      }, 2500);
      return;
    }

    // 2. Интернет отсутствует - проверяем авторизацию
    setStatus('network_unavailable');
    setMessage('Интернет соединение отсутствует. Проверяем данные последней авторизации...');

    // Небольшая задержка для UX
    await new Promise(resolve => setTimeout(resolve, 1000));

    setStatus('checking_auth');
    setMessage('Проверяем сохраненные данные авторизации...');

    const userData = await getUserDataFromStorage();
    
    if (!userData) {
      setStatus('auth_not_found');
      setMessage('В приложении не сохранены сведения о последней авторизации. К сожалению, вы сможете продолжить работу только после подключения к сети интернет.');
      return;
    }

    setUserData(userData);
    
    // 3. Проверка роли
    const validRoles = ['CWEXECUTOR', 'CWSUPERVISOR'];
    
    if (!validRoles.includes(userData.role)) {
      setStatus('invalid_role');
      setMessage(`В данной версии приложения для вашей роли (${userData.role}) не предусмотрен функционал для работы в оффлайн режиме. Пожалуйста, подключитесь к сети интернет для продолжения работы.`);
      return;
    }

    // 4. Загрузка сохраненных объектов
    setStatus('loading_objects');
    setMessage('Загружаем список сохраненных объектов...');
    
    const objects = await loadSavedObjects();
    
    if (objects.length === 0) {
      setStatus('no_objects');
      setMessage('У вас нет сохраненных объектов для работы в оффлайн режиме. Пожалуйста, подключитесь к сети интернет и загрузите объекты.');
      return;
    }

    // 5. Переходим к выбору объекта
    setStatus('selecting_object');
    setMessage(`Добро пожаловать, ${userData.fio}! Выберите объект для работы:`);
  };

  // Инициализация проверок
  useEffect(() => {
    performChecks();
  }, []);

  // Обработчик выбора объекта
  const handleObjectSelect = async (object: SavedObject) => {
    setSelectedObject(object);
    
    // Сохраняем выбранный объект в SecureStore
    await saveTokenFrAsync('selectedCodeCSS', object.code_ccs);
    await saveTokenFrAsync('selectedNameCSS', object.code_name_ccs);
    
    // Показываем сообщение и переходим
    setMessage(`Выбран объект: ${object.code_name_ccs}. Переход на вкладку заметок...`);
    
    setTimeout(() => {
      router.push('./(tabsWM)/notes');
    }, 2500);
  };

  // Функция для повторной проверки
  const handleRetry = async () => {
    await performChecks();
  };

  // Функция для выхода
  const handleExit = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Выйти', 
          onPress: () => {
            // В зависимости от требований можно очистить SecureStore
            // SecureStore.deleteItemAsync('userId');
            // SecureStore.deleteItemAsync('fio');
            // SecureStore.deleteItemAsync('role');
            
            // Просто закрываем приложение или переходим на начальный экран
            if (Platform.OS === 'web') {
              window.close();
            }
          }
        }
      ]
    );
  };

  // Рендер списка объектов
  const renderObjectList = () => {
    if (isLoadingObjects) {
      return (
        <View style={styles.objectsContainer}>
          <ActivityIndicator size="large" color={colorText} />
          <Text style={[styles.loadingText, { color: colorText }]}>
            Загрузка объектов...
          </Text>
        </View>
      );
    }

    if (savedObjects.length === 0) {
      return (
        <View style={styles.noObjectsContainer}>
          <Text style={[styles.noObjectsText, { color: colorText }]}>
            Нет сохраненных объектов
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.objectsListContainer}>
        <Text style={[styles.objectsTitle, { color: colorText }]}>
          Сохраненные объекты 
        </Text>{/*({savedObjects.length}):*/}
        
        <FlatList
          data={savedObjects}
          keyExtractor={(item) => item.id}
          style={styles.objectsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.objectItem,
                selectedObject?.id === item.id && styles.objectItemSelected
              ]}
              onPress={() => handleObjectSelect(item)}
            >
              <View style={styles.objectInfo}>
                <Text 
                  style={[
                    styles.objectName,
                    { color: colorText },
                    selectedObject?.id === item.id && [styles.objectNameSelected, ]//{color: colorBlue}
                  ]}
                  numberOfLines={2}
                >
                  {item.code_name_ccs}
                </Text>
                <Text style={[styles.objectCode, { color: colorText }]}>
                  Код: {item.code_ccs}
                </Text>
              </View>
              
              {selectedObject?.id === item.id && (
             <View>
                   {/*} style={styles.selectedIndicator}  <Text style={styles.selectedIcon}>✓</Text>*/}
                </View>
              )}
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
        
       {/*} {selectedObject && (
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: '#2196F3' }]}
            onPress={() => handleObjectSelect(selectedObject)}
          >
            <Text style={styles.continueButtonText}>
              Продолжить с выбранным объектом
            </Text>
          </TouchableOpacity>
        )}
          */}
      </View>
    );
  };

  // Отрисовка статуса
  const renderStatus = () => {
    switch (status) {
      case 'checking_network':
      case 'checking_auth':
      case 'loading_objects':
        return (
          <View style={[styles.statusContainer, {borderColor: colorBlue, borderWidth: 2, borderRadius: 8}]}>
            <ActivityIndicator size="large" color={colorText} />
            <Text style={[styles.message, { color: colorText, marginTop: 20 }]}>{message}</Text>
          </View>
        );

      case 'network_available':
        return (
          <View style={[styles.statusContainer, {borderColor: colorBlue, borderWidth: 2, borderRadius: 8}]}>
            <Text style={[styles.icon, { color: colorGreen }]}>✓</Text>
            <Text style={[styles.message, { color: colorText, marginTop: 20 }]}>{message}</Text>
          </View>
        );

      case 'network_unavailable':
        return (
          <View style={[styles.statusContainer, {borderColor: colorBlue, borderWidth: 2, borderRadius: 8}]}>
            <Text style={[styles.icon, { color: '#FF9800' }]}>⚠</Text>
            <Text style={[styles.message, { color: colorText, marginTop: 20 }]}>{message}</Text>
            <Text style={[styles.hint, { color: colorText }]}>
              Проверьте подключение к Wi-Fi или мобильной сети
            </Text>
          </View>
        );

      case 'auth_not_found':
        return (
          <View style={[styles.statusContainer, {borderColor: colorBlue, borderWidth: 2, borderRadius: 8}]}>
            <Text style={[styles.icon, { color: '#F44336' }]}>✗</Text>
            <Text style={[styles.message, { color: colorText, marginTop: 20 }]}>{message}</Text>
            <Text style={[styles.hint, { color: colorText }]}>
              Для работы в оффлайн режиме необходимо авторизоваться при наличии интернета
            </Text>
            <View style={styles.buttonContainer}>
              <Text style={[styles.retryButton, { color: colorText }]} onPress={handleRetry}>
                Повторить проверку
              </Text>
            </View>
          </View>
        );

      case 'invalid_role':
        return (
          <View style={[styles.statusContainer, {borderColor: colorBlue, borderWidth: 2, borderRadius: 8}]}>
            <Text style={[styles.icon, { color: '#F44336' }]}>🚫</Text>
            <Text style={[styles.message, { color: colorText, marginTop: 20 }]}>{message}</Text>
            <Text style={[styles.hint, { color: colorText }]}>
              Оффлайн режим доступен только для ролей: исполнитель ПНР и руководитель ПНР
            </Text>
            <View style={styles.buttonContainer}>
              <Text style={[styles.retryButton, { color: colorText }]} onPress={handleRetry}>
                Повторить проверку
              </Text>
            </View>
          </View>
        );

      case 'no_objects':
        return (
          <View style={[styles.statusContainer, {borderColor: colorBlue, borderWidth: 2, borderRadius: 8}]}>
            <Text style={[styles.icon, { color: '#FF9800' }]}>📁</Text>
            <Text style={[styles.message, { color: colorText, marginTop: 20 }]}>{message}</Text>
            <Text style={[styles.hint, { color: colorText }]}>
              Подключитесь к интернету и загрузите объекты для работы оффлайн
            </Text>
            <View style={styles.buttonContainer}>
              <Text style={[styles.retryButton, { color: colorText }]} onPress={handleRetry}>
                Повторить проверку
              </Text>
            </View>
          </View>
        );

      case 'selecting_object':
        return (
          <View style={[styles.statusContainer, {borderColor: colorBlue, borderWidth: 2, borderRadius: 8}]}>
            <Text style={[styles.icon, { color: colorGreen }]}>👤</Text>
            <Text style={[styles.message, { color: colorText, marginTop: 20 }]}>{message}</Text>
            {userData && (
              <View style={styles.userInfo}>
                <Text style={[styles.userInfoText, { color: colorText }]}>
                  Пользователь: {userData.fio}
                </Text>
                <Text style={[styles.userInfoText, { color: colorText }]}>
                  Организация: {userData.organisation}
                </Text>
              </View>
            )}
            
            {/* Список объектов */}
            {renderObjectList()}
          </View>
        );

      case 'success':
        return (
          <View style={[styles.statusContainer, {borderColor: colorBlue, borderWidth: 2, borderRadius: 8}]}>
            <Text style={[styles.icon, { color: colorGreen }]}>🎉</Text>
            <Text style={[styles.message, { color: colorText, marginTop: 20 }]}>{message}</Text>
            {userData && (
              <View style={styles.userInfo}>
                <Text style={[styles.userInfoText, { color: colorText }]}>
                  Пользователь: {userData.fio}
                </Text>
                <Text style={[styles.userInfoText, { color: colorText }]}>
                  Организация: {userData.organisation}
                </Text>
              </View>
            )}
          </View>
        );

      case 'error':
        return (
          <View style={[styles.statusContainer, {borderColor: colorBlue, borderWidth: 2, borderRadius: 8}]}>
            <Text style={[styles.icon, { color: '#F44336' }]}>❌</Text>
            <Text style={[styles.message, { color: colorText, marginTop: 20 }]}>
              Произошла ошибка при проверке
            </Text>
            <View style={styles.buttonContainer}>
              <Text style={[styles.retryButton, { color: colorText }]} onPress={handleRetry}>
                Повторить
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
         
          <View style={styles.progressContainer}>
            {/* Индикатор прогресса проверок */}
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    backgroundColor: colorGreen,
                    width: status === 'checking_network' ? '25%' :
                    status === 'network_unavailable' || status === 'network_available' ? '25%' :
                    status === 'checking_auth' ? '50%' :
                    status === 'auth_not_found' || status === 'invalid_role' ? '75%' :
                    status === 'loading_objects' || status === 'no_objects' || status === 'selecting_object' ? '100%' :
                    status === 'success' ? '100%' : '0%'
                  }
                ]} 
              />
            </View>
            
            <View style={styles.progressSteps}>
              <Text style={[styles.step, { color: status !== 'checking_network' ? colorText : colorGray }]}>
                1. Сеть
              </Text>
              <Text style={[styles.step, { 
                color: status === 'checking_auth' || 
                       status === 'auth_not_found' || 
                       status === 'invalid_role' ? colorText : colorGray 
              }]}>
                2. Авторизация
              </Text>
              <Text style={[styles.step, { 
                color: status === 'invalid_role' ? colorText : colorGray 
              }]}>
                3. Роль
              </Text>
              <Text style={[styles.step, { 
                color: status === 'loading_objects' || 
                       status === 'no_objects' || 
                       status === 'selecting_object' || 
                       status === 'success' ? colorText : colorGray 
              }]}>
                4. Объекты
              </Text>
            </View>
          </View>

          {renderStatus()}

          {/* Информационная панель */}
          <View style={styles.infoBox}>
            <Text style={[styles.infoTitle, { color: colorText }]}>
              Информация об оффлайн режиме
            </Text>
            <Text style={[styles.infoText, { color: colorText }]}>
              • Оффлайн режим доступен только для пользователей с ролями руководитель ПНР и куратор ПНР
            </Text>
            <Text style={[styles.infoText, { color: colorText }]}>
              • Для доступа необходимо быть авторизованным при последнем открытии приложении в режиме онлайн
            </Text>
            <Text style={[styles.infoText, { color: colorText }]}>
              • В оффлайн режиме доступны ранее загруженные данные
            </Text>
            <Text style={[styles.infoText, { color: colorText }]}>
              • Для синхронизации данных необходимо подключение к интернету
            </Text>
          </View>

          {/* Кнопки действий (отображаются только в определенных состояниях) */}
          {(status === 'auth_not_found' || status === 'invalid_role' || status === 'no_objects' || status === 'error') && (
            <View style={styles.actionButtons}>
              <Text style={[styles.actionButton, styles.primaryButton]} onPress={handleRetry}>
                Повторить проверку
              </Text>
              <Text style={[styles.actionButton, styles.secondaryButton]} onPress={handleExit}>
                Выйти из приложения
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  progressContainer: {
    marginBottom: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  step: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 40,
    padding: 20,
    //backgroundColor: '#F5F5F5',
    borderRadius: 10,
  },
  icon: {
    fontSize: 60,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  userInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
    width: '100%',
  },
  userInfoText: {
    fontSize: 14,
    marginBottom: 5,
  },
  
  // Стили для списка объектов
  objectsContainer: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  noObjectsContainer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 8,
    marginTop: 20,
  },
  noObjectsText: {
    fontSize: 16,
    textAlign: 'center',
  },
  objectsListContainer: {
    width: '100%',
    marginTop: 20,
  },
  objectsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  objectsList: {
    maxHeight: 300,
  },
  objectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  objectItemSelected: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderColor: '#2196F3',
  },
  objectInfo: {
    flex: 1,
  },
  objectName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  objectNameSelected: {
    fontWeight: 'bold',
  //  color: '#2196F3',
  },
  objectCode: {
    fontSize: 14,
    opacity: 0.7,
  },
  selectedIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  selectedIcon: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  separator: {
    height: 10,
  },
  continueButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  infoBox: {
    backgroundColor: '#F0F8FF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 20,
  },
  retryButton: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#2196F3',
    color: '#FFFFFF',
    borderRadius: 8,
  },
  exitButton: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#F44336',
    color: '#FFFFFF',
    borderRadius: 8,
  },
  actionButtons: {
    marginTop: 20,
    gap: 10,
  },
  actionButton: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    overflow: 'hidden',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#F5F5F5',
    color: '#333333',
    borderWidth: 1,
    borderColor: '#DDD',
  },
});

export default OfflineCheckScreen;