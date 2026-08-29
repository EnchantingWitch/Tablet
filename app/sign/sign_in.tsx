import { brand } from '@/constants/Colors';
import CustomButton from "@/components/CustomButton";
import { useColorBlue, useColorGray, useColorText } from '@/hooks/useColorText';
import { useToken } from "@/hooks/useToken";
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../config/api';
//import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  // Alert,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View
} from "react-native";
type token = {
  accessToken: string;
  refreshToken: string;
  //role: string;
};

const LoginModal = () => {
  const colorText = useColorText();
  const BOTTOM_SAFE_AREA =
    Platform.OS === "android" ? StatusBar.currentHeight : 0;
    const { refreshPermissions } = useAuth();
  const { tokenFrAsync,getTokenFrAsync,saveTokenFrAsync, removeTokenFrAsync, saveArrayToSecureStore} = useToken();
  const router = useRouter();
  // const role = 'admin'
  const colorTextVersion = useColorBlue();
  const colorTextBorder = useColorGray();
  const [isVisible, setIsVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [roleOfuser, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [savedToken, setSavedToken] = useState(false);
  const [savedRefreshToken, setSavedRefreshToken] = useState(false);
  const [savedId, setSavedId] = useState(false);
  const [savedName, setSavedName] = useState(false);
  const [savedOrg, setSavedOrg] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [disabled, setDisabled] = useState(false); //для кнопки

  const [storageData, setStorageData] = useState([]);

  const fontScale = useWindowDimensions().fontScale;

  const ts = (fontSize: number) => {
    return fontSize / fontScale;
  };

  const saveToken = async (tokenKey, token, setF) => {
    try {
      await SecureStore.setItemAsync(tokenKey, token);
      console.log("Token - ", tokenKey, "- saved successfully!");
    } catch (error) {
      console.error("Error saving token:", error);
    } finally {
      setF(token)
    }
  };
/*
  const fetchAllData = async () => {
    try {
      // Получаем все ключи
      const keys = await AsyncStorage.getAllKeys();

      // Получаем все значения по ключам
      const values = await AsyncStorage.multiGet(keys);

      // Преобразуем массив пар ключ-значение в массив объектов
      const data = values.map(([key, value]) => {
        try {
          // Пытаемся распарсить JSON, если это возможно
          return { key, value: JSON.parse(value) };
        } catch (e) {
          // Если не JSON, возвращаем как есть
          return { key, value };
        }
      });

      setStorageData(data);
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    }
  };*/
  console.log(storageData);

  const handleLogin = async () => {
    setDisabled(true);
    try {
      const body = new FormData();
      //data.append('name', 'Image Upload');
      body.append("username", name)
      body.append("password", password)
      console.log(`${API_BASE_URL}/login`)
      let response = await fetch(
        `${API_BASE_URL}/login`,
        {
          method: "POST",
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          body: body,
        }
      );
      console.log(
        JSON.stringify({
          username: name,
          password: password,
        })
      );

   /*   if (!response.ok) {
        Alert.alert(
          "Ошибка при авторизации",
          "Проверьте корректность введенных почты и пароля.",
          [{ text: "OK", onPress: () => console.log("OK Pressed") }]
        );
      }*/
      console.log("ResponseSignIn:", response);
      const token = await response.json();
      console.log(token);
      if (response.ok) {
        setAccessToken(token.accessToken);
        setRefreshToken(token.refreshToken);
        saveToken("refreshToken", token.refreshToken, setSavedRefreshToken);
        saveToken("accessToken", token.accessToken, setSavedToken);
      } else {
        // Неверные почта/пароль или ошибка сервера — разблокируем кнопки и показываем причину
        setDisabled(false);
        setErrorMessage(token.message || "Проверьте корректность введенных почты и пароля.");
      }
    } catch (error) {
      setErrorMessage("Не удалось подключиться к серверу. Проверьте сеть.");
      setDisabled(false);
    } finally {
      setDisabled(false);
    }
  };

  //функция для парсинга второй секции токена, чтобы вытащить роль пользователя
  function parseJwt(token) {
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  }

  const refreshPerm = async () => {
    try {
       await refreshPermissions();
    } catch (error) {
        console.error('Error saving token:', error);
    } finally{
         
    }
};

  useEffect(() => {
    if (accessToken) {
      const role = parseJwt(accessToken);
      setRole(role.role);
      console.log(role.role);
      console.log(role);
      saveToken("userID", role.userId.toString(), setSavedId);
      saveToken("fullName", role.fullName.toString(), setSavedName);
      saveToken("organisation", role.organisation.toString(), setSavedOrg);
      saveToken("role", role.role, setRole);
      saveArrayToSecureStore("permissions", role.privileges);
      removeTokenFrAsync('lastViewedObj');
      refreshPerm();
    }
  }, [accessToken]);

    useEffect(() => {
    if (savedToken && savedId && savedName && savedOrg && roleOfuser) {
      console.log('зашли в выбор развилки')
      if (roleOfuser === "ADMIN") {
        console.log('зашли в выбор развилки ADMIN')
        router.replace("/admin/menu");
      }
      if (roleOfuser === "USER" || roleOfuser === "CWEXECUTOR" || roleOfuser === "CWSUPERVISOR" || roleOfuser === "CWCURATOR" || roleOfuser === "CIWEXECUTOR" || roleOfuser === "CIWSUPERVISOR" || roleOfuser === "EXPLOITING") {
        console.log("переход на домашнюю страницу");
        console.log(roleOfuser, 'roleOfuser');
        //router.replace("/objs/objects");
        router.replace("./objs/load_objs_WM");
      }
    }
  }, [savedToken, savedId, savedName, savedOrg, roleOfuser]);
  
  console.log(roleOfuser, 'roleOfuser');
console.log(roleOfuser === "USER" || roleOfuser === "CWEXECUTOR" || roleOfuser === "CWSUPERVISOR" || roleOfuser === "CWCURATOR" || roleOfuser === "CIWEXECUTOR" || roleOfuser === "CIWSUPERVISOR" || roleOfuser === "EXPLOITING")
  
return (
    <View
      style={{
        flex: 1,
        alignContent: "center",
        alignItems: 'center',
        backgroundColor: "white",
        width: '100%'
      }}
    >
      <View style={{ alignSelf: "center", paddingTop: BOTTOM_SAFE_AREA + 15 }}>
        <Text
          style={{
            fontSize: ts(20),
            color: colorText,
            fontWeight: "500",
            textAlign: "center",
          }}
        >
          Планшет ПНР
        </Text>
        <Image
          style={{ width: 200, height: 200, alignSelf: "center" }}
          source={require("../../assets/images/logo1.png")}
        />
     
      </View>    
      <View style={[styles.modalContainer, ]}>
        <Text
          style={{
            fontSize: ts(14),
            color: colorText,
            fontWeight: "400",
            marginBottom: 8,
          }}
        >
          Введите почту
        </Text>
        <TextInput
          style={[styles.input, { fontSize: ts(14), color: colorTextBorder, borderColor: colorTextBorder, }]}
          value={name}
          onChangeText={(text) => setName(text)}
        />
        <Text
          style={{
            fontSize: ts(14),
            color: colorText,
            fontWeight: "400",
            marginBottom: 8,
          }}
        >
          Введите пароль
        </Text>
        <TextInput
          style={[styles.input, { fontSize: ts(14), color: colorTextBorder, borderColor: colorTextBorder, }]}
          secureTextEntry
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
        {loading ? (
          <ActivityIndicator size="large" color={useColorText(0.5)} />
        ) : (
          <CustomButton title="Войти" handlePress={handleLogin} />
        )}
        <CustomButton
          title="Зарегистрироваться"
          handlePress={() => router.push("/sign/register")}
        />

      </View>
      <View
        style={{
          alignSelf: "center",
          width: "60%",
          paddingBottom: BOTTOM_SAFE_AREA + 20,
        }}
      >
        <Text
          style={{
            fontSize: ts(12),
            color: colorTextVersion,
            fontWeight: "400",
            textAlign: "center",
          }}
        >
          Версия 1.20, 13.01.2026
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
   // justifyContent: "center",
    alignItems: "center",
   // paddingHorizontal: 20,
    backgroundColor: "white",
    width: 380, alignSelf: 'center'
  },
  image: {
    width: 142,
    height: 71,
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
  },
  input: {
    backgroundColor: brand.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: brand.bgBlue,
    width: "91%",
    height: 42,
    paddingVertical: "auto",
    color: brand.bgBlue,
    textAlign: "center",
    marginBottom: 20,
  },
  error: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
});

export default LoginModal;
