const ENVIRONMENTS = {
  production: {
    baseUrl: 'https://xn----7sbpwlcifkq8d.xn--p1ai:8441',
  },
  preview: {
    baseUrl: 'https://pnr-tablet-test.ru:8443',//'https://xn----7sbpwlcifkq8d.xn--p1ai:8443', 
  },
  development: {
    baseUrl: 'https://pnr-tablet-test.ru:8443', // или ваш dev сервер
  }
};

const getCurrentEnvironment = () => {
  // 1. В режиме разработки (Metro) - всегда development
  if (__DEV__) {
    return 'development';
  }
  
  // 3. По умолчанию для готовых сборок
  return 'preview';
};

// Динамический config, который может меняться
export const getApiConfig = () => {
  const currentEnv = getCurrentEnvironment();
  return ENVIRONMENTS[currentEnv];
};

// Или статический, если предпочитаете
export const API_BASE_URL = getApiConfig().baseUrl;
export const CURRENT_ENV = getCurrentEnvironment();
export const IS_DEVELOPMENT = __DEV__;

// Для отладки
if (__DEV__) {
  console.log('🚀 Текущее окружение:', CURRENT_ENV);
  console.log('🔗 API сервер:', API_BASE_URL);
}