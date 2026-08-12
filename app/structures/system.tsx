import DateInputWithPicker from '@/components/Calendar+';
import CustomButton from '@/components/CustomButton';
import FormField from '@/components/FormField';
import ListOfOrganizations from '@/components/ListOfOrganizations';
import DropdownComponent from '@/components/ListStatusSystem';
import { PermissionGuard } from '@/components/PermissionGuard';
import SubcontractorsSMR from '@/components/SubcontractorsSMR';
import { } from '@/components/Themed';
import { useColorBlue, useColorGray, useColorText } from '@/hooks/useColorText';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { API_BASE_URL } from '../../config/api';

export type SystemPUT = {
  pnrsystemStatus: string;
  ciwexecutor: string;//исполнитель СМР
  cwexecutor: string;//исполнитель ПНР
  pnrplanDate: string; 
  pnrfactDate: string;
  iiplanDate: string;
  iifactDate: string;
  koplanDate: string;
  kofactDate: string;
};

export type SystemGET = {
  numberII: string;
  systemName: string;
  comments: number;
  status: string;
  PNRPlanDate: string; 
  PNRFactDate: string;
  pnrsystemId: number;
  KOFactDate: string;
  CIWExecutor: string;//исполнитель СМР
  IIFactDate: string;
  KOPlanDate: string;
  IIPlanDate: string;
  CWExecutor: string;//исполнитель ПНР
}

export default function TabOneScreen() {
  const BOTTOM_SAFE_AREA = Platform.OS === 'android' ? StatusBar.currentHeight : 0;
  const colorText = useColorText();
  const colorGray = useColorGray();
  const router = useRouter();
  const {post} = useLocalSearchParams();//получение id системы
 // const post = 256;
//  console.log(post);
  const {codeCCS} = useLocalSearchParams();//получение id объекта
  const {capitalCSName} = useLocalSearchParams();
//  console.log(capitalCSName, 'capitalCSName system');

  const [click, setclick] = useState<boolean>(false);
  const [data, setData] = useState<SystemPUT | undefined>(undefined);
  const [systemStat, setSystemStat] = useState<string>('');
  const [ciwexecut, setCiwexecut] = useState<string>('');
  const [cwexecut, setCwexecut] = useState<string>('');
  const [pnrplan, setPnrplan] = useState<string | null>('');
  const [pnrfact, setPnrfact] = useState<string | null>('');
  const [iiplan, setIiplan] = useState<string | null>('');
  const [iifact, setIifact] = useState<string | null>('');
  const [koplan, setKoplan] = useState<string | null>('');
  const [kofact, setKofact] = useState<string | null>('');
  const [comment, setComments] = useState<string>('');
  const [defect, setDefect] = useState<string>('');
  const [system, setSystem] = useState<string>('');//наименование системы
  const [rd, setRd] = useState<string>('');//наименование системы
  const [statusRequest, setstatusRequest] = useState<boolean>(false);//ограничение на передачу дат пока запрос не выполнен
  const [conditionKO, setConditionKO] = useState<boolean>(false);//выбрана дата факта или нет
  const [conditionII, setConditionII] = useState<boolean>(false);
  const [disabled, setDisabled] = useState(false); //для кнопки

  const [accessToken, setAccessToken] = useState<any>('');
  const [listOrganization, setListOrganization] = useState<[]>();

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

const postSubConstractors = async () => {
    setDisabled(true);
    try {
      const body = new FormData();
      subcontractors.forEach((subcontractor) => {
        console.log(subcontractor);
        body.append("subConstractors", subcontractor);
    })
    
      const response = await fetch(`${API_BASE_URL}/systems/addSubContractors/`+post, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data'},
        body: body
      });
      console.log('ResponseaAddSubContractors:', response);
    } catch (error) {
      console.error(error);
      setDisabled(false);
            Alert.alert('', 'Произошла ошибка при обновлении данных: ' + error, [
                   {text: 'OK', onPress: () => console.log('OK Pressed')},
                ])
    } finally {
      router.replace({pathname: '/(tabs)/structure', params: { codeCCS: codeCCS, capitalCSName: capitalCSName}})
      setDisabled(false);
    }
  };

  const putSystem = async () => {
    setDisabled(true);
    try {
    const js = JSON.stringify({ 
      pnrsystemStatus: systemStat, 
      ciwexecutor: ciwexecut,
      cwexecutor: cwexecut,
      pnrplanDate: pnrplan,
      pnrfactDate: pnrfact,
      iiplanDate: iiplan,
      iifactDate: iifact,
      koplanDate: koplan,
      kofactDate: kofact,
    });
      const response = await fetch(`${API_BASE_URL}/systems/updateSystemInfo/`+post, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json' },
        body: js
      }
      );
        console.log(js);
      if (response.ok) {
        Alert.alert('', 'Данные по системе обновлены', [
             {text: 'OK', onPress: () => console.log('OK Pressed')}])
      } 
      //else {
      //  throw new Error('Не удалось сохранить данные.');
      //}
      console.log('ResponseUpdateSystem:', response);
    } catch (error) {
      console.error(error);
      setDisabled(false);
            Alert.alert('', 'Произошла ошибка при обновлении данных: ' + error, [
                   {text: 'OK', onPress: () => console.log('OK Pressed')},
                ])
    } finally {
      //postSubConstractors()

    }
  };

  const getSystem = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/commons/getSystemCommonInfo/`+post,
        {method: 'GET',
          headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }}
      );
      const json = await response.json();
      setSystem(json.systemName);
      setSystemStat(json.status);
      setCiwexecut(json.ciwexecutor);
      setCwexecut(json.cwexecutor);
      setPnrplan(json.pnrplanDate);
      setPnrfact(json.pnrfactDate);
      setIiplan(json.iiplanDate);
      setIifact(json.iifactDate);
      setKoplan(json.koplanDate);
      setKofact(json.kofactDate);
      setRd(json.systemRD);
      setComments(''+json.comments.toString());
      setDefect(''+json.defectiveActs.toString());
      
   //   console.log(json.systemName, 'json.systemName');
      console.log('ResponseSeeSystem:', response);
      console.log('ResponseSeeSystem json:', json);
      setstatusRequest(true);
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
      setstatusRequest(false);
    } finally {
      router.setParams({systemName: system});
    //  console.log(system, 'sytemN in system.tsx');

     // setLoading(false);
    }
  };

  useEffect(() => {
    getToken();
   
  }, []);

    useEffect(() => {
    if (post && accessToken) {
      //putSystem();
      getSystem();//вызов функции при получении значения post
      //router.setParams({systemName: systemN});
      //console.log(systemN, 'systemN in system.tsx');
      getOrganisations();
    }
    if (statusRequest){
      router.setParams({systemName: system});
   //   console.log(system, 'sytemN in system.tsx');
    }
   
  }, [accessToken, post, statusRequest]);

  const [statusOrg, setStatusOrg] = useState(false);

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
     // console.log(json);
    } catch (error) {
      console.error(error);
    } finally {
    }
  };

  useEffect(() => {
    if (click) {
    //  putSystem();    
    //  postSubConstractors
    }
  }, []);

   useEffect(() => {
    if (listOrganization) {
      setStatusOrg(true);    
    }
  }, [listOrganization]);

  const fontScale = useWindowDimensions().fontScale;

  const ts = (fontSize: number) => {
    return (fontSize / fontScale)};
    
const [subcontractors, setSubcontractors] = useState([]);
    //ПЕРЕПИСАТЬ, ЧТОБЫ БЫЛО ДИНАМИЧЕСКИ И ИСПОЛЬЗОВАТЬ В ЗАПРОСАХ
  const [selectedValues, setSelectedValues] = useState(['org1', 'org2']);//значения, которые должны приходить для субподрядчиков с бд
  const setValues = [//видимо обновление для субподрядчиков по изменению
    (value) => setSelectedValues(prev => [value, prev[1]]),
    (value) => setSelectedValues(prev => [prev[0], value]),
  ];
  const [subcontractorsVisible, setSubcontractorsVisible] = useState(false); //открытие модального окна субподрядчиков

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
      
    <View style={styles.container}>
   {/* <Text style={{ fontSize: ts(20), color: '#1E1E1E', fontWeight: '500', textAlign: 'center', marginBottom: '23' }}>{system}</Text> */}

      <View style={styles.separator}/>
      <PermissionGuard required='SYSTEM_EDIT' 
      fallback={
        <View style={{width: '100%', alignItems: 'center'}}>
          <View style={{width: '100%', alignItems: 'center'}}>
            <FormField title={'Статус системы'} post={systemStat} editable={false}/>
          </View>
          <View style={{flexDirection: 'row',width: '96%', justifyContent: 'space-between'}}>
            <FormField title='План в ПНР' post={pnrplan} width='49%'editable={false}/>
            <FormField title='Факт в ПНР' post={pnrfact} width='49%'editable={false}/>
          </View>
          <View style={{flexDirection: 'row',width: '96%', justifyContent: 'space-between'}}>
            <FormField title='План ИИ' post={iiplan} width='49%'editable={false}/>
            <FormField title='Факт ИИ' post={iifact} width='49%'editable={false}/>
          </View>
          <View style={{flexDirection: 'row',width: '96%', justifyContent: 'space-between'}}>
            <FormField title='План КО' post={koplan} width='49%'editable={false}/>
            <FormField title='Факт КО' post={kofact} width='49%' editable={false}/>
          </View>
        </View>
      }>
      <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8  }}>Статус системы</Text>
      <DropdownComponent post = {systemStat} statusreq={statusRequest} pnrPlan={pnrplan} pnrFact={pnrfact} iiPlan={iiplan} iiFact={iifact} koPlan={koplan} koFact={kofact} onChange={(status) => setSystemStat(status)}/>

      <View style={{flexDirection: 'row',width: '100%',}}>{/* Объявление заголовков в строку для дат плана и факта передачи в ПНР */}
        <View style={{width: '50%', }}>
          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>План в ПНР</Text>
        </View>

        <View style={{width: '50%', }}>
          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>Факт в ПНР</Text>
        </View>
      </View>

      <View style={{flexDirection: 'row',}}>
        <DateInputWithPicker theme = 'min' post={pnrplan} statusreq={statusRequest} onChange={(dateString) => setPnrplan(dateString)}/>{/* Дата плана передачи в ПНР*/}
        <DateInputWithPicker theme = 'min'post={pnrfact} statusreq={statusRequest} onChange={(dateString) => setPnrfact(dateString)}/>{/* Дата факта передачи в ПНР*/}
      </View>

      <View style={{flexDirection: 'row',width: '100%',}}>{/* Объявление заголовков в строку для дат плана и факта ИИ */}
        <View style={{width: '50%', }}>
          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>План ИИ</Text>
        </View>

        <View style={{width: '50%', }}>
          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>Факт ИИ</Text>
        </View>
      </View>

      <View style={{flexDirection: 'row',}}>
        <DateInputWithPicker theme = 'min' post = {iiplan} statusreq={statusRequest} onChange={(dateString) => setIiplan(dateString)}/>{/* Дата плана ИИ*/}
        <DateInputWithPicker theme = 'min' post = {iifact} statusreq={statusRequest} diseditable = {conditionII} onChange={(dateString) => setIifact(dateString)}/>{/* Дата факта ИИ*/}
      </View>

      <View style={{flexDirection: 'row',width: '100%',}}>{/* Объявление заголовков в строку для дат плана и факта передачи КО */}
        <View style={{width: '50%', }}>
          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>План КО</Text>
        </View>

        <View style={{width: '50%', }}>
          <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', textAlign: 'center' }}>Факт КО</Text>
        </View>
      </View>

      <View style={{flexDirection: 'row',}}>
        <DateInputWithPicker theme = 'min' post = {koplan} statusreq={statusRequest} onChange={(dateString) => setKoplan(dateString)}/>{/* Дата плана КО*/}
        <DateInputWithPicker theme = 'min' post = {kofact} statusreq={statusRequest} diseditable = {conditionKO} onChange={(dateString) => setKofact(dateString)}/>{/* Дата факта КО*/}
      </View>
      </PermissionGuard>

      <View style={{ alignSelf: 'center',  flexDirection: 'row', width: '96%', justifyContent: 'space-between' }}>
        <FormField title='Не устранено замечаний' post={comment} editable={false} width='49%'/>
        <FormField title='Не устранено дефектов' post={defect} editable={false} width='49%'/>             
      </View>
      
      <FormField title='Шифр РД' post={rd} editable={false}/>

      <PermissionGuard required='SYSTEM_EDIT'
        fallback={
          <View style={{width: '100%', alignItems: 'center'}}>
            <FormField title='Исполнитель СМР' post={ciwexecut} editable={false}/>
            <FormField title='Исполнитель ПНР' post={cwexecut} editable={false}/>
          </View>
        }>
          <View style={{flexDirection: 'row', width: '100%', justifyContent: 'center'}}>
            <View style={{alignItems: 'center', width: '75%', paddingLeft: '15%'}}>
            <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Исполнитель СМР</Text>
            </View>
            <TouchableOpacity onPress={() => setSubcontractorsVisible(true)} style={{alignItems: 'flex-end', width: '15%'}}>
              <Ionicons name="person-add-outline"
                    size={20}
                    color={useColorBlue()}/>
            </TouchableOpacity>
          </View>
        <ListOfOrganizations data={listOrganization} label='Исполнитель СМР' title={ciwexecut} post={ciwexecut} status={statusOrg} onChange={(value) => setCiwexecut(value)}/>

        <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8 }}>Исполнитель ПНР</Text>
        <ListOfOrganizations data={listOrganization} label='Исполнитель ПНР' title={cwexecut} post={cwexecut} status={statusOrg} onChange={(value) => setCwexecut(value)}/>
      </PermissionGuard>
     
      
      <View style={{ paddingBottom: BOTTOM_SAFE_AREA + 20 }}>
        <PermissionGuard required='SYSTEM_EDIT'>
          <CustomButton title='Подтвердить' disabled={disabled} handlePress={() => {putSystem(); postSubConstractors();} }/>
          <CustomButton title='Отменить'  handlePress={() => router.push({pathname: '/(tabs)/structure', params: { codeCCS: codeCCS, capitalCSName: capitalCSName}})} />
        </PermissionGuard>
      </View>
      <SubcontractorsSMR
        visible={subcontractorsVisible}
        onClose={() => setSubcontractorsVisible(false)}
        values={subcontractors}
        setValues={setSubcontractors}
        dropdownData={listOrganization}
        dataLoaded={statusOrg}

      />
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {

    height: 1,
    width: '80%',
  },
  input: {
    backgroundColor: '#FFFFFF',
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
});
