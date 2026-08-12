import CustomButton from "@/components/CustomButton";
import { useColorText } from "@/hooks/useColorText";
import * as DocumentPicker from "expo-document-picker";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, StatusBar, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { API_BASE_URL } from '../../config/api';


//const UploadFile =  ()  => {
export default function UploadFile (){
  const BOTTOM_SAFE_AREA = Platform.OS === 'android' ? StatusBar.currentHeight : 0;
  const colorText = useColorText();
  const [singleFile, setSingleFile] = useState<any>('');
  const [load, setLoad]= useState<boolean>(false);
  
  const [accessToken, setAccessToken] = useState<any>('');
  const [objname, setObjname] = useState<any>('');
  const [disabled, setDisabled] = useState(false); //для кнопки

  const fontScale = useWindowDimensions().fontScale;

  const ts = (fontSize: number) => {
    return (fontSize / fontScale)};

    const getToken = async () => {
      try {
          const token = await SecureStore.getItemAsync('accessToken');
          //setAccessToken(token);
          if (token !== null) {
              console.log('Retrieved token:', token);
              setAccessToken(token);
              //вызов getAuth для проверки актуальности токена
              //authUserAfterLogin();
          } else {
              console.log('No token found');
              router.push('/sign/sign_in');
          }
      } catch (error) {
          console.error('Error retrieving token:', error);
      }
  };

  const {codeCCS} = useLocalSearchParams();//получение id объекта
  const {capitalCSName} = useLocalSearchParams();//получение id объекта
  //console.log(codeCCS, 'ID load_reistry');

  const uploadImage = async () => {
    setDisabled(true);
      try {
    // Check if any file is selected or not
      setLoad(true);
      // If file selected then create FormData
      const fileToUpload = singleFile;
      const data = new FormData();
      //data.append('name', 'Image Upload');
      data.append("file", {
        uri: fileToUpload.uri,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        name: 'fileToUpload'
      });
      //data.append("file", fileToUpload )
      // Please change file upload URL
      let res = await fetch(
        `${API_BASE_URL}/files/uploadStructure/`+codeCCS,
        {
          method: 'post',
          body: data,
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data; ',
          },
        }
      );
      console.log('ResponseLoadRegistry:', res);
      console.log('FormData:', data);
     // console.log('fileToUpload:', fileToUpload);
      //alert(res.status);
      //Обратная связь пользователю по загрузке дока
      if (res.status == 200){
       Alert.alert('', 'Структура загружена.', [
             {text: 'OK', onPress: () => console.log('OK Pressed')}])
      }
      
      } catch (error) {
        Alert.alert('', 'Произошла ошибка: ' + error, [
                     {text: 'OK', onPress: () => console.log('OK Pressed')},
                  ])
        console.error('Error:', error);
        setDisabled(false);
      }
      finally{
        router.replace({pathname: '/(tabs)/structure', params: { codeCCS: codeCCS, capitalCSName: objname}})
        setDisabled(false);
      }  
  };

  const selectFile = async () => {
    // Opening Document Picker to select one file
    try {
      const res = await DocumentPicker.getDocumentAsync({
        // Provide which type of file you want user to pick
        //type: "*/*",
        //Ограничение загружаемых типов файлов (mime type)
        type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel' ],
        // There can me more options as well
        // DocumentPicker.types.allFiles
        // DocumentPicker.types.images
        // DocumentPicker.types.plainText
        // DocumentPicker.types.audio
        // DocumentPicker.types.pdf
        copyToCacheDirectory: true, 
        
      });
      // Printing the log realted to the file
      console.log('res of DocumentPicker : ' + JSON.stringify(res));
      // Setting the state to show single file attributes
      if (!res.canceled) {
      setSingleFile(res.assets[0]); }
    } catch (err) {
      setSingleFile('');
      // Handling any exception (If any)
     if (DocumentPicker.Cancel(err)) {
        // If user canceled the document selection
        alert('Canceled');
      } else {
        // For Unknown Error
        alert('Unknown Error: ' + JSON.stringify(err));
        throw err;
      }
    }
  };

  useEffect(() => {
      getToken();
      if(capitalCSName){setObjname(capitalCSName);}
    }, [capitalCSName]);

  return (
    <View style={styles.background}>
      <View style={styles.button}>
       
          <CustomButton
                    title="Выбрать файл"
                    handlePress={selectFile} // Вызов функции отправки данных
                   // isLoading={upLoading} // Можно добавить индикатор загрузки, если нужно
                  />
        <View >
        {singleFile ? (<Text style={{fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8, textAlign: 'center', paddingTop: 15}}>
          Выбран файл: {singleFile.name}</Text>):(
            <Text style={{fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8, textAlign: 'center', paddingTop: 15}}>Файл не выбран</Text>)
        }
        </View>     
        
      </View>
      <View style={{ paddingBottom: BOTTOM_SAFE_AREA + 20 }}>
        <CustomButton
                      disabled={disabled}
                      title="Отправить"
                      handlePress={uploadImage} // Вызов функции отправки данных
                  //   isLoad={load} // Можно добавить индикатор загрузки, если нужно
        />
        <View>
          {load ? ( <ActivityIndicator size={'large'} style={{paddingTop: 10, }}/>):('')
          }
        </View>
      </View>
    </View>
  );
};
//router.push('./see_note');
const styles = StyleSheet.create({
  background: {
    backgroundColor: "white",
    flex: 1,
    //  "radial-gradient(ellipse at left bottom,    rgb(217, 248, 255) 0%,    rgb(255, 255, 255) 59%,    rgb(255, 255, 255) 100% )",
  },
  file: {
    color: "black",
    marginHorizontal: 145,
  },
  button: {

    flex: 2/8,
    marginTop: 30,
   
  },
});


