import CustomButton from '@/components/CustomButton';
import ListOfAccessRole from '@/components/ListOfAccessRole';
import { useColorBlue, useColorGray, useColorText } from '@/hooks/useColorText';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { default as React, useEffect, useState } from 'react';
import { Alert, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { API_BASE_URL } from '../../config/api';

export default function TabOneScreen() {
   const fontScale = useWindowDimensions().fontScale;
  const ts = (fontSize: number) => {
    return (fontSize / fontScale);
  };
  const BOTTOM_SAFE_AREA = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

  const [Role, setRole] = useState('');
  const [statusRole, setStatusRole] = useState(false);
  const [startAdminRole, setStartAdminRole] = useState(false);
  const colorText = useColorText();
  const colorGray = useColorGray();
  const {username} = useLocalSearchParams();
  const {organisation} = useLocalSearchParams();
  const {numberPhone} = useLocalSearchParams();
  const {registrationDate} = useLocalSearchParams();
  const {fullName} = useLocalSearchParams();
  const {role} = useLocalSearchParams();
  const {id} = useLocalSearchParams();
  const [accessToken, setAccessToken] = useState<any>('');
  const [userId, setUserId] = useState<any>('');
  const [disabled, setDisabled] = useState(false); //для кнопки

  console.log(Role, 'Role');

  const getToken = async (key, setState) => {
    try {
        const token = await SecureStore.getItemAsync(key);
        if (token !== null) {
            console.log('Retrieved token:', token);
            setState(token);
        } else {
            console.log('No token found');
            router.push('/sign/sign_in');
        }
    } catch (error) {
        console.error('Error retrieving token:', error);
    }
};

  const deleteUser = async () => {
    setDisabled(true);
    try {
      console.log('json',JSON.stringify({
        username : username,
      }));
      const body = new FormData();
      //data.append('name', 'Image Upload');
      body.append("id", id);
      console.log('body', body);
    let response = await fetch(`${API_BASE_URL}/admin/delete_user`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
       'Content-Type': 'multipart/form-data'
      },
      body: body,
    });
    console.log('ResponseDeleteUser:', response);
  if (response.status == 200){
      Alert.alert('', 'Пользователь удален.', [
        {text: 'OK', onPress: () => console.log('OK Pressed')}])
    } 
  } catch (error) {
    console.error('Error:', error);
     Alert.alert('', 'Произошла ошибка при удалении: ' + error, [
                 {text: 'OK', onPress: () => console.log('OK Pressed')},
              ])
    setDisabled(false);
  } finally {
    router.push('/admin/users');
    setDisabled(false);
  }};

  const setAdmin = async () => {
    setDisabled(true);
    try {
      const body = new FormData();
      body.append("id", id);
      body.append("role", Role);
      console.log('body', body);
    let response = await fetch(`${API_BASE_URL}/admin/set_user_role`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
       'Content-Type': 'multipart/form-data'
      }, 
      body: body,
    });
    console.log('ResponseroleOfAdmin:', response);
   if (response.status == 200){
    if (Role === 'USER'){
      Alert.alert('', 'Пользователю предоставлен доступ.', [
        {text: 'OK', onPress: () => console.log('OK Pressed')}])
    }
    if (Role === 'ADMIN'){
      Alert.alert('', 'Пользователю дана роль администратора.', [
        {text: 'OK', onPress: () => console.log('OK Pressed')}])
    }
    if (Role === 'NONE'){
      Alert.alert('', 'Пользователю запрещен доступ.', [
        {text: 'OK', onPress: () => console.log('OK Pressed')}])
    }
  
    }
  } catch (error) {
    Alert.alert('', 'Произошла ошибка: ' + error, [
                 {text: 'OK', onPress: () => console.log('OK Pressed')},
              ])
    console.error('Error:', error);
    setDisabled(false);
  } finally {
    if (userId === id){
      logout();
      setDisabled(false);
    }
    else{router.push('/admin/users');
      setDisabled(false);
    }
    
  }

};

const logout = async () => {
  try{
          
    if (accessToken!== null){
      const str = `Bearer ${accessToken}`;
      console.log(str);
                  
      let response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': str,
          'Content-Type': 'application/json',
        },
                   
      });
                 
      console.log('ResponseLogout:', response);
      if(response.status === 200){
        removeToken('accessToken');
        removeToken('refreshToken');
        removeToken('userID');
                  
      }
  
    }
  }catch (error) {
      console.error('Error:', error);
  }finally{  
    router.push('/sign/sign_in');
  }
  
};

  const removeToken = async (tokenKey) => {
    try {
      await SecureStore.deleteItemAsync(tokenKey);
      console.log('Token - ',tokenKey,'- removed successfully!');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  };

//const setUser = async (role: string) => {
  const getUser = async () => {
  try {
    const body = new FormData();
    console.log('body for GetUser', body);
    let response = await fetch(`${API_BASE_URL}/admin/getUser/`+id, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
      }
  });
  
  
  console.log('ResponseGetUser:', response);
  const json = await response.json()
 console.log(json);
    //if (role === 'Администратор'){setStartAdminRole(true);}
  
} catch (error) {
  console.error('Error:', error);
} finally {
 
}

};
console.log(Role);
console.log(userId, 'userId');


 useEffect(() => {
    getToken('accessToken', setAccessToken);
    getToken('userID', setUserId);
    setRole(role);
    if (startAdminRole){setAdmin();}
    if (id) {getUser();}
  }, [id, role, startAdminRole]);

  useEffect(() => {
    if (Role && Role!=' ')setStatusRole(true);
  }, [Role]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
    <View style={styles.container}>
     
    <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8, textAlign: 'center' }}>ФИО</Text>
      <TextInput
      style={{width: '96%',fontSize: ts(14),backgroundColor: '#FFFFFF',borderRadius: 8,borderWidth: 1,borderColor: colorGray,height: 42,color: colorGray,textAlign: 'center',marginBottom: 20,}}
      placeholderTextColor="#111"
      editable={false}
      value={fullName}
    />
    <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8, textAlign: 'center' }}>Организация</Text>
      <TextInput
      style={{width: '96%',fontSize: ts(14),backgroundColor: '#FFFFFF',borderRadius: 8,borderWidth: 1,borderColor: colorGray,height: 42,color: colorGray,textAlign: 'center',marginBottom: 20,}}
      placeholderTextColor="#111"
      editable={false}
      value={organisation}
    />
     <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8, textAlign: 'center' }}>Почта</Text>
      <TextInput
      style={{width: '96%',fontSize: ts(14),backgroundColor: '#FFFFFF',borderRadius: 8,borderWidth: 1,borderColor: colorGray,height: 42,color: colorGray,textAlign: 'center',marginBottom: 20,}}
      placeholderTextColor="#111"
      editable={false}
      value={username}
    />
    <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8, textAlign: 'center' }}>Роль</Text>
    {id !== '1'? 
      <ListOfAccessRole 
                  post={role as string} 
                  status={statusRole} 
                  onChange={(selectedRole) => setRole(selectedRole)}
      />
      : 
      <TextInput
      style={{width: '96%',fontSize: ts(14),backgroundColor: '#FFFFFF',borderRadius: 8,borderWidth: 1,borderColor: colorGray,height: 42,color: colorGray,textAlign: 'center',marginBottom: 20,}}
      placeholderTextColor="#111"
      editable={false}
      value='Администратор'
      />
    }
    <Text style={{ fontSize: ts(14), color: colorText, fontWeight: '400', marginBottom: 8, textAlign: 'center' }}>Дата заявки</Text>
      <TextInput
      style={{width: '96%',fontSize: ts(14),backgroundColor: '#FFFFFF',borderRadius: 8,borderWidth: 1,borderColor: colorGray,height: 42,color: colorGray,textAlign: 'center',marginBottom: 20,}}
      placeholderTextColor="#111"
      editable={false}
      value={registrationDate}
    />

    {userId === id && userId !== '1'? 
      <Text style={{ fontSize: ts(14), color: useColorBlue(), fontWeight: '400', marginBottom: 8, textAlign: 'center' }}>При сохранении изменений в своей карточки будет выполнен выход и переход на страницу авторизации</Text>
      : ''
    }
        
    </View>
    {id !== '1'? 
      <View style={{ paddingBottom: BOTTOM_SAFE_AREA + 20 }}>
        <CustomButton disabled={disabled} title='Удалить пользователя' handlePress={deleteUser}/>
        <CustomButton disabled={disabled} title='Сохранить' handlePress={setAdmin}/>
      </View>
      : 
      <View style={{ paddingBottom: BOTTOM_SAFE_AREA + 20 }}>
        <Text style={{ fontSize: ts(14), color: useColorBlue(), fontWeight: '400', marginBottom: 8, textAlign: 'center' }}>Изменение карточки данного пользователя невозможно</Text>
      </View>
    }
    </SafeAreaView>
  ); 
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',//alignItems: 'center',
    width: '100%',
    justifyContent: 'center',

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
