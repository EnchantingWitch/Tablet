import { useAuth } from '../providers/AuthProvider';

export const usePermissions = () => {
  const { hasPermission, isLoading } = useAuth();
  
  const checkPermission = (permission: string): boolean => {
    // Если еще идет загрузка, возвращаем false
    if (isLoading) return false;
    // Используем функцию из AuthProvider
    return hasPermission(permission);
  };

  return { 
    checkPermission, 
    isLoading 
    // Убираем permissionsChecked так как он не нужен
  };
};