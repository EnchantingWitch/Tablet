import { brand } from '@/constants/Colors';
import React, { useState } from "react";
import { StyleSheet, Text, View, Button, TouchableOpacity, ActivityIndicator, useWindowDimensions,} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";

//const UploadFile =  ()  => {
  export default function UploadFile (){
  const [singleFile, setSingleFile] = useState<any>('');
  const [load, setLoad]= useState<boolean>(false);
  const fontScale = useWindowDimensions().fontScale;

  const ts = (fontSize: number) => {
    return (fontSize / fontScale)};

  const upload = async () => {
    
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
        'https://xn----7sbpwlcifkq8d.xn--p1ai:8443/files/uploadStructure/051-2004430.0012',
        {
          method: 'post',
          body: data,
          headers: {
            'Content-Type': 'multipart/form-data; ',
          },
        }
      );
      console.log('ResponseLoadRegistry:', res);
      console.log('FormData:', data);
      //Обратная связь пользователю по загрузке дока
      if (res.status == 200){
        alert('Объекты загружены');
      }
      if (res.status == 400) {
        alert('Объекты не загружены');
      }
      } catch (error) {
        console.error('Error:', error);
      }
      finally{router.push('/(tabs)/structure'); setLoad(false);}  
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

  return (
    <View style={styles.background}>
      <View style={styles.button}>
       
          <CustomButton
                    title="Выбрать файл"
                    handlePress={selectFile} 
                   // isLoading={upLoading} // Можно добавить индикатор загрузки, если нужно
                  />
        <View >
        {singleFile ? (<Text style={{fontSize: ts(14), color: brand.textPrimary, fontWeight: '400', marginBottom: 8, textAlign: 'center', paddingTop: 15}}>
          Выбран файл: {singleFile.name}</Text>):(
            <Text style={{fontSize: ts(14), color: brand.textPrimary, fontWeight: '400', marginBottom: 8, textAlign: 'center', paddingTop: 15}}>Файл не выбран</Text>)
        }
        </View>     
        
      </View>
      <View>
        <CustomButton
                      title="Загрузить"
                      handlePress={upload} // Вызов функции отправки данных
                  //   isLoad={load} // Можно добавить индикатор загрузки, если нужно
        />
        <View>
          {load ? ( <ActivityIndicator size={'large'} style={{paddingTop: 10, }}/>):(<View/>)
          }
        </View>
      </View>
    </View>
  );
};

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

