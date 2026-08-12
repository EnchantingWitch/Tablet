// hooks/useToken.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from 'react';

export const useToken = () => {
  const [tokenFrAsync, setTokenFrAsync] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Получение токена
  const getTokenFrAsync = useCallback(async (tokenKey) => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem(tokenKey);
      if (token !== null) {
        console.log("Retrieved token:", tokenKey, " - ", token);
   //     setTokenFrAsync(token);
        return token; // Возвращаем токен
      } else {
        console.log("No token found");
  //      setTokenFrAsync(null);
        return null;
      }
    } catch (error) {
      console.error("Error retrieving token:", error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Сохранение токена
  const saveTokenFrAsync = useCallback(async (tokenKey, tokenValue) => {
    setLoading(true);
    setError(null);
    try {
      await AsyncStorage.setItem(tokenKey, tokenValue);
      console.log("Token - ", tokenKey, " - saved successfully - ", tokenValue);
    //  setTokenFrAsync(tokenValue);
      return true;
    } catch (error) {
      console.error("Error saving token:", error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Удаление токена
  const removeTokenFrAsync = useCallback(async (tokenKey) => {
    setLoading(true);
    setError(null);
    try {
      await AsyncStorage.removeItem(tokenKey);
      console.log('Token - ', tokenKey, '- removed successfully!');
     // setTokenFrAsync(null);
      return true;
    } catch (error) {
      console.error('Error removing token:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Проверка наличия токена
  const hasTokenFrAsync = useCallback(async (tokenKey) => {
    try {
      const token = await AsyncStorage.getItem(tokenKey);
      return token !== null;
    } catch (error) {
      console.error("Error checking token:", error);
      return false;
    }
  }, []);

 const saveArrayToSecureStore = useCallback(async (key, array) => {
  try {
    const jsonValue = JSON.stringify(array);
    await SecureStore.setItemAsync(key, jsonValue);
    console.log('Массив успешно сохранен');
  } catch (error) {
    console.error('Ошибка сохранения:', error);
  }
  }, []);

  const deleteArrayToSecureStore = useCallback(async (key) => {
  try {
   // const jsonValue = JSON.stringify(array);
    await SecureStore.deleteItemAsync(key);
    console.log('Массив успешно удален');
  } catch (error) {
    console.error('Ошибка сохранения:', error);
  }
  }, []);

  return {
    tokenFrAsync,
    loading,
    error,
    getTokenFrAsync,
    saveTokenFrAsync,
    removeTokenFrAsync,
    hasTokenFrAsync,
    saveArrayToSecureStore,
    deleteArrayToSecureStore
   // setTokenFrAsync // На случай ручной установки
  };
};