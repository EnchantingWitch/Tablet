import { ReactNode } from 'react';
import { useAuth } from '../providers/AuthProvider';

type PermissionGuardProps = {
  children: ReactNode;
  required: string;
  fallback?: ReactNode;
};

export const PermissionGuard = ({
  children,
  required,
  fallback = null, // лучше использовать null вместо пустой строки
}: PermissionGuardProps) => {
  const { hasPermission, isLoading } = useAuth();

  // Пока загружаются права, можно показать ничего или loader
  if (isLoading) {
    return null; // или <ActivityIndicator /> если нужен индикатор загрузки
  }

  //if (!required) {
  //  return <>{children}</>;
//  }

  const hasAccess = hasPermission(required);
  console.log('hasAccess for', required ,hasAccess)
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};


