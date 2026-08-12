import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  refreshPermissions: () => Promise<void>;
  permissions: string[]; // Добавим для отладки
};

// Исправляем значение по умолчанию
const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  hasPermission: () => false,
  refreshPermissions: async () => {},
  permissions: [],
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [arrayPermission, setArrayPermission] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка прав при старте
  useEffect(() => {
    console.log('AuthProvider mounted');
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      console.log('Loading permissions from SecureStore...');
      const permissionsJson = await SecureStore.getItemAsync('permissions');
      console.log('Raw permissions from storage:', permissionsJson);
      
      if (permissionsJson) {
        try {
          const permissions = JSON.parse(permissionsJson);
          console.log('Parsed permissions:', permissions);
          
          // Убеждаемся, что это массив строк
          if (Array.isArray(permissions)) {
            setArrayPermission(permissions);
            console.log('Permissions set successfully');
          } else {
            console.warn('Permissions is not an array:', permissions);
            setArrayPermission([]);
          }
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          setArrayPermission([]);
        }
      } else {
        console.log('No permissions found in SecureStore');
        setArrayPermission([]);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      setArrayPermission([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Проверка конкретного права
  const hasPermission = (permission: string): boolean => {
    return arrayPermission.includes(permission);
  };
  
  // Функция для обновления разрешений
  const refreshPermissions = async () => {
    try {
      console.log('Manual refresh triggered...');
      setIsLoading(true);
      await loadPermissions();
    } catch (error) {
      console.error('Error in refreshPermissions:', error);
    }
  };

  // Создаем значение контекста
  const contextValue: AuthContextType = {
    isLoading,
    hasPermission,
    refreshPermissions,
    permissions: arrayPermission, // для отладки
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};