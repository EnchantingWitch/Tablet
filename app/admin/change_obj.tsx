import CustomButton from '@/components/CustomButton';
import FormField from '@/components/FormField';
import ListOfOrganizations from '@/components/ListOfOrganizations';
import ListOfRegion from '@/components/ListOfRegion';
import { } from '@/components/Themed';
import { useColorGray, useColorText } from '@/hooks/useColorText';
import { useToken } from '@/hooks/useToken';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { default as React, useEffect, useState } from 'react';
import { Alert, Platform, StatusBar, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { API_BASE_URL } from '../../config/api';

type Object = {

};

export default function TabOneScreen() {
  const BOTTOM_SAFE_AREA = Platform.OS === 'android' ? StatusBar.currentHeight : 0;
  const { deleteArrayToSecureStore,getTokenFrAsync,saveTokenFrAsync, removeTokenFrAsync} = useToken();
  const colorText = useColorText();
  const colorGray = useColorGray();
  const fontScale = useWindowDimensions().fontScale;

  const ts = (fontSize: number) => {
    return (fontSize / fontScale)};

  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState<Object[]>([]);

  const {capitalCSId} = useLocalSearchParams(); 
  const {codeCCS} = useLocalSearchParams(); 
  const {capitalCSName} = useLocalSearchParams(); 
  const {ciwexecutor} = useLocalSearchParams(); 
  const {ciwsupervisor} = useLocalSearchParams(); 
  const {customer} = useLocalSearchParams(); 
  const {customerSupervisor} = useLocalSearchParams(); 
  const {cwexecutor} = useLocalSearchParams(); 
  const {cwsupervisor} = useLocalSearchParams();  
  const {locationRegion} = useLocalSearchParams();  
  const {objectType} = useLocalSearchParams();  

  const [oks, setOks] = useState<string>('');//наименование окс
  const [key, setKey] = useState<string>('');//код ОКС
  const [region, setRegion] = useState<string>();//регион
  const [typeObj, setTypeObj] = useState<string>();//тип окс
  const [charterer, setCharterer] = useState<string>();//заказчик
  const [cuCharterer, setCuCharterer] = useState<string>();//куратор от заказчика
  const [executorPnr, setExecutorPnr] = useState<string>();//исполнитель пнр
  const [dirPnr, setDirPnr] = useState<string>();//руководитель пнр
  const [executorCmr, setExecutorCmr] = useState<string>();//исполнитель смр
  const [cuCmr, setCuCmr] = useState<string>();//куратор смр
  const [accessToken, setAccessToken] = useState<any>('');
  const [status, setStatus] = useState<boolean>(false);
  const [disabled, setDisabled] = useState(false); //для кнопки

  useEffect(() => {
    if(codeCCS){setOks(capitalCSName);
    setKey(codeCCS);}
    if(ciwexecutor){
    setRegion(locationRegion);
    setTypeObj(objectType);
    setCharterer(customer);
    setCuCharterer(customerSupervisor);
    setExecutorPnr(ciwexecutor);
    setDirPnr(ciwsupervisor);
    setExecutorCmr(cwexecutor);
    setCuCmr(cwsupervisor);
    setStatus(true);
    }
    
  }, [codeCCS, ciwexecutor]);
  
    
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
  const request = async () => {
    setDisabled(true);
    if((oks==' ' ||  oks=='') || (key==' '  || key=='')){
              Alert.alert('', 'Заполните поля наименования объекта и кода ОКС.', [
                                      {text: 'OK', onPress: () => console.log('OK Pressed')}])
                         setDisabled(false);
                         return;
                       }
    try {
    let response = await fetch(`${API_BASE_URL}/capitals/updateCapitalCS/` + capitalCSId, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        capitalCSName: oks,
        codeCCS: key,
        locationRegion: region,
        objectType: typeObj,
        customer: charterer,//заказчик
        ciwexecutor: executorPnr,//исполнитель СМР
        cwexecutor: executorCmr,//исполнитель ПНР
        customerSupervisor: cuCharterer,// Куратор заказчика
        cwsupervisor: dirPnr, // Куратор ПНР
        ciwsupervisor: cuCmr, // куратор СМР 
      }),
    });
    console.log(JSON.stringify({
        capitalCSName: oks,
        codeCCS: key,
        locationRegion: region,
        objectType: typeObj,
        customer: charterer,//заказчик
        ciwexecutor: executorPnr,//исполнитель СМР
        cwexecutor: executorCmr,//исполнитель ПНР
        customerSupervisor: cuCharterer,// Куратор заказчика
        cwsupervisor: dirPnr, // Куратор ПНР
        ciwsupervisor: cuCmr, // куратор СМР 
      }));
    console.log('ResponseUpdateObj:', response);
    if (response.status == 200){
      Alert.alert('', 'Данные по объекту обновлены.', [
        {text: 'OK', onPress: () => console.log('OK Pressed')}])
    }
    else{
      Alert.alert('', 'Данные по объекту не обновлены.', [
             {text: 'OK', onPress: () => console.log('OK Pressed')}])
    };
  } catch (error) {
    setDisabled(false);
    console.error('Error:', error);
  } finally {
    setDisabled(false);
    router.replace('./objs');
  }

};

const deleteObject = async () => {
  setDisabled(true);
    try {
      let response = await fetch(`${API_BASE_URL}/capitals/deleteCapitalCS/`+capitalCSId, {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
      });
    console.log('deleteObject', response);
    if (response.status === 200) {
      Alert.alert('', 'Объект удален.', [
        {text: 'OK', onPress: () => console.log('OK Pressed')}])
    }
    else {
      Alert.alert('', 'Произошла ошибка при удалении.', [
        {text: 'OK', onPress: () => console.log('OK Pressed')}])
    }
  } catch (err) {
    setDisabled(false);
  } finally {
    setDisabled(false);
    router.replace({pathname: './objs'});
  }
  }

useEffect(() => {
    getToken();  
  }, []);
  
   const [statusOrg, setStatusOrg] = useState(false);
  const [statusTypeObj, setStatusTypeObj] = useState(false);
  const [statusRegion, setStatusRegion] = useState(false);

  const [listOrganization, setListOrganization] = useState<[]>();
  const [listTypeObj, setListTypeObj] = useState<[]>();
  const [listRegion, setListRegion] = useState<[]>();

  useEffect(() => {
      if (accessToken) {
        getOrganisations();
        getRegions();
        getTypeObjs();
      }
    }, [accessToken]);

  useEffect(() => {
    if (listOrganization) {
      setStatusOrg(true);    
    }
    if (listTypeObj) {
      setStatusTypeObj(true);    
    }
    if (listRegion) {
      setStatusRegion(true);    
    }
  }, [listOrganization, listTypeObj, listRegion]);



  const getOrganisations = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const response = await fetch(`${API_BASE_URL}/organisations/getAll`,
        {method: 'GET',
          headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }}
      );
      console.log('responseGetOrganisations', response);
      const json = await response.json();
      const transformedData = json.map(item => ({
            label: item.organisationName,
            value: item.organisationName,
        }));
        setListOrganization(transformedData);
      console.log(json);
    } catch (error) {
      console.error(error);
    } finally {
    }
  };

  const getTypeObjs = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const response = await fetch(`${API_BASE_URL}/directories/getObjectTypes`,
        {method: 'GET',
          headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }}
      );
      console.log('responseGetOrganisations', response);
      const json = await response.json();
      const transformedData = json.map(item => ({
            label: item,
            value: item,
        }));
        setListTypeObj(transformedData);
        
      console.log(json);
    } catch (error) {
      console.error(error);
    } finally {
    }
  };
  
  const getRegions = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const response = await fetch(`${API_BASE_URL}/directories/getRegions`,
        {method: 'GET',
          headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }}
      );
      console.log('responseGetOrganisations', response);
      const json = await response.json();
      console.log(json);
     const result = Object.entries(json).map(([value, label]) => ({
        label,
        value
      }));
        setListRegion(result);
        console.log('transformedData', result)
      
    } catch (error) {
      console.error(error);
    } finally {
    }
  };

  return (
    <KeyboardAwareScrollView
     style={{ flex: 1 }}
  enableOnAndroid={true}
  extraScrollHeight={100}
  keyboardShouldPersistTaps="handled"
  contentContainerStyle={{ 
    flexGrow: 1,
    alignItems: 'center',  // ← Перенесено сюда
    justifyContent: 'center',  // ← Перенесено сюда
  }}
        >
    <View style={styles.container}>
      {/** value={} для динамической подгрузки, передавать в компонент и через useEffect изменять, запрос нужен ли? */}
       <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center', marginBottom: 8  }}>Объект капитального строительства</Text>
        <TextInput
            style={[ {fontSize: ts(14),  backgroundColor: '#FFFFFF', borderRadius: 8,borderWidth: 1, borderColor: colorGray, width: '96%', height: 42, paddingVertical: 'auto', color: colorGray, textAlign: 'center', marginBottom: 20,}]}
            placeholderTextColor="#111"
            onChangeText={setOks}
            value={oks}
            // editable={false}
        />
        
        <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center', marginBottom: 8  }}>Код ОКС</Text>
        <TextInput
            style={[ {fontSize: ts(14),  backgroundColor: '#FFFFFF', borderRadius: 8,borderWidth: 1, borderColor: colorGray, width: '96%', height: 42, paddingVertical: 'auto', color: colorGray, textAlign: 'center', marginBottom: 20,}]}
            placeholderTextColor="#111"
            onChangeText={setKey}
            value={key}
            // editable={false}
        />
     <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Регион</Text>
        <ListOfRegion items={listRegion} modalTitle='Регион'  selectedValue={region} isEnabled={statusRegion} onValueChange={(value) => setRegion(value)}/>
    
       <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Тип объекта</Text>
        <ListOfOrganizations label='Тип объекта' data={listTypeObj} title={typeObj!=''? typeObj:'Тип объекта'} post={typeObj} status={statusTypeObj} onChange={(value) => setTypeObj(value)}/>
      <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Заказчик</Text>
      <ListOfOrganizations label='Заказчик' data={listOrganization} title={charterer!=''? charterer:''} post={charterer} status={statusOrg} onChange={(value) => setCharterer(value)}/>
      <FormField title='Куратор от заказчика' post={cuCharterer} onChange={(value) => setCuCharterer(value)}/>
      <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Исполнитель ПНР</Text>
      <ListOfOrganizations label='Исполнитель ПНР' data={listOrganization} title={executorPnr!=''? executorPnr:''} post={executorPnr} status={statusOrg} onChange={(value) => setExecutorPnr(value)}/>
      <FormField title='Руководитель ПНР' post={dirPnr} onChange={(value) => setDirPnr(value)}/>
      <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Исполнитель СМР</Text>
      <ListOfOrganizations label='Исполнитель СМР' data={listOrganization} title={executorCmr!=''? executorCmr:''} post={executorCmr} status={statusOrg} onChange={(value) => setExecutorCmr(value)}/>
      <FormField title='Куратор СМР' post={cuCmr} onChange={(value) => setCuCmr(value)}/>
    </View>
    
    <View style={{ paddingBottom: BOTTOM_SAFE_AREA + 20, backgroundColor: 'white', width: '100%' }}>
        <CustomButton disabled={disabled} title='Сохранить' handlePress={request}/>
        <CustomButton disabled={disabled} title='Удалить объект' handlePress={deleteObject}/>
        <CustomButton disabled={disabled} title='В объект' handlePress={()=>{saveTokenFrAsync('selectedCodeCSS', codeCCS),
                          saveTokenFrAsync('selectedNameCSS', capitalCSName);router.push('../(tabs)/object')}}/>
    </View>
    </KeyboardAwareScrollView>
  ); 
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 1000,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',

  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
