import { useColorText } from '@/hooks/useColorText';
import { Ionicons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Modal, Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import RNFetchBlob from 'react-native-blob-util';

const data = [
    { label: 'Без доступа', value: 'NONE' },
    { label: 'Пользователь', value: 'USER' },
    { label: 'Администратор', value: 'ADMIN' },
];

type Props = {
    post: string;
    status?: boolean;
    onChange: (status: string) => void;
    onChangeStatus?: (status: boolean) => void;
};

const Settings = ({ post, status = true, onChange, onChangeStatus }: Props) => {
    const [value, setValue] = useState(post || '');
    const [isFocus, setIsFocus] = useState(false);
    const { StorageAccessFramework } = FileSystem;
    const dropdownRef = useRef<View>(null);
    const fontScale = useWindowDimensions().fontScale;
    const ts = (fontSize: number) => fontSize / fontScale;
    const colorText = useColorText();
    useEffect(() => {
        if (post !== value) {
            setValue(post || '');
        }
    }, [post]);

    useEffect(() => {
        if (value && onChange && value !== post) {
            onChange(value);
        }
        
        if (onChangeStatus) {
            onChangeStatus(!!value);
        }
    }, [value]);

     const handleOpen = () => {
        if (!status) return;
        setIsFocus(true);
    };

     async function saveFile() {
  try {
    // 1. Определяем какой PDF загружать
    const pdfAssetModule = require('../assets/files/guidePNR.pdf');

    const safeFileName = 'Краткий гайд.pdf';

    // 2. Загружаем ассет (Expo way)
    const asset = Asset.fromModule(pdfAssetModule);
    await asset.downloadAsync();

    if (!asset.localUri) {
      throw new Error('Не удалось загрузить файл');
    }

    // 3. Получаем содержимое файла как base64
    const fileContent = await FileSystem.readAsStringAsync(asset.localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (!permissions.granted) {
      Alert.alert('',"Вы должны предоставить разрешение для сохранения файла.",
            [
              { text: 'OK' }
            ]
             );
      return;
    }
    
    const directoryUri = permissions.directoryUri;
    console.log('const directoryUri ', directoryUri);
    
    // Проверяем возможность записи тестовым файлом
    try {
      const testFileUri = await StorageAccessFramework.createFileAsync(
        directoryUri,
        "test_write_check",
        "text/plain"
      );
      
      await FileSystem.writeAsStringAsync(testFileUri, "test", {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      await FileSystem.deleteAsync(testFileUri);
    } catch (testError) {
      Alert.alert('', "Выбранная директория недоступна для записи. Пожалуйста, выберите другую.",
        [{ text: 'OK' }]
      );
      return;
    }

    // 4. Создаем файл и записываем данные
    const fileUri = await StorageAccessFramework.createFileAsync(
      directoryUri,
      safeFileName,
      "application/pdf"
    );

    // Записываем содержимое файла в base64
    await FileSystem.writeAsStringAsync(fileUri, fileContent, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 5. Открываем файл
    if (Platform.OS === 'android') {
      await RNFetchBlob.android.actionViewIntent( fileUri, 'application/pdf');
    } else {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Открыть PDF',
        UTI: 'com.adobe.pdf'
      });
    }

    Alert.alert(
      'Файл сохранён',
      `Файл сохранён по пути: ${fileUri}`,
      [{ text: 'OK' }]
    );

  } catch (error) {
    console.error('Ошибка при сохранении файла:', error);
    Alert.alert(
      'Ошибка', 
      'Не удалось сохранить файл: ' + error,
      [{ text: 'OK' }]
    );
  }
}

    return (             
        <View >
                <View ref={dropdownRef} style={{width: '10%'}}>
                    <TouchableOpacity
                        onPress={handleOpen}
                        style={[
                            {width: 25, },
                            //sstyles.dropdown, 
                            isFocus && { borderColor: 'blue' },
                            !status && { opacity: 0.5 }
                        ]}
                    >
                              <Ionicons name='help-circle-outline' size={25} style={{alignSelf: 'center', width: 25, color: colorText}} />
                    </TouchableOpacity>
                </View>
                <Modal
                    visible={isFocus}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setIsFocus(false)}
                >
                    <TouchableOpacity 
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setIsFocus(false)}
                    >
                        <Animated.View 
                            style={[
                                styles.modalContent,
                                { 
                                    width: '60%',
                                    maxHeight: '100%',
                                    right: 0,
                                    top: 0,
                                    bottom: 0
                                }
                            ]}
                        >
                          <View style={{paddingTop: 16}}>
                            <TouchableOpacity onPress={saveFile} style={styles.modalHeaderText}>
                              <Text style = {{color: colorText, textAlign: 'left', fontSize: ts(14), borderBottomWidth: 1, borderBottomColor: colorText}}>Краткий гайд Планшет ПНР</Text>
                            </TouchableOpacity>
                          </View>
                        </Animated.View>
                    </TouchableOpacity>
                </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingBottom: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 16,
      //  borderTopRightRadius: 16,
        padding: 16,
        position: 'absolute',
    },
    modalHeaderText: {
        fontSize: 14,
        paddingBottom: 2,
        fontWeight: '500',
        color: '#0072C8',
        alignSelf: 'center'
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20
    },
   
});

export default Settings;