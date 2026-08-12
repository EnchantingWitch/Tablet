import { useEffect, useState } from 'react';
import { Dimensions, Platform } from 'react-native';

export default function useDevice() {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  // Определяем, является ли веб-версия мобильной
  const isMobileWeb = Platform.OS === 'web' && dimensions.width < 768; // 768px - обычный брейкпоинт для планшетов
  const isDesktopWeb = Platform.OS === 'web' && dimensions.width >= 768;
  const isNativeMobile = Platform.OS !== 'web';

  return {
    isWeb: Platform.OS === 'web',
    isMobile: isNativeMobile || isMobileWeb,
    isDesktopWeb,
    isMobileWeb,
    screenWidth: dimensions.width,
    screenHeight: dimensions.height,
    orientation: dimensions.width > dimensions.height ? 'landscape' : 'portrait'
  };
}