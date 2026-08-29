// Единый источник цветов приложения — палитра брендбука ГСП / Оргэнергогаз
// (источник: «Цвета ГСП ОЭГ.xlsx»). Все цвета в коде импортируются отсюда.

const tintColorLight = '#086EB6';
const tintColorDark = '#4AAFE4';

export const brand = {
  // Тёмные / текст
  textPrimary: '#333F4F', // основной текст (брендбук)
  navyDark: '#18365E', // тёмно-синий (заголовки)
  navyDarkest: '#081830', // почти чёрный синий
  blueMid: '#305496', // синий таблиц/заголовков

  // Брендовые синие
  bluePrimary: '#086EB6', // основной синий (кнопки, ссылки, акценты)
  blueLight: '#4AAFE4', // светлый синий (акцентный текст)
  bluePale: '#6EADD9', // приглушённый голубой (графики)

  // Бирюза (графики/диаграммы)
  teal: '#38B7B3',
  tealLight: '#6CEAE4',

  // Акценты
  yellow: '#FABE0D',
  yellowPale: '#FCE29A',
  gold: '#BF8F00',
  greenBright: '#1ED14B',
  green: '#2E8B57', // корпоративный зелёный (успех/статусы)
  lime: '#A4C716',
  red: '#D32F2F', // корпоративный красный (ошибки/дефекты)
  redLight: '#FF8A80',

  // Фоны (в т.ч. строки таблиц)
  bgBlueLight: '#DBEFFA', // светлая подложка
  bgBlue: '#C5DEF0', // границы/разделители, строки таблиц
  bgGreen: '#C8E6C9',
  bgRed: '#FFCDD2',

  // Нейтральные
  gray: '#7F7F7F',
  white: '#FFFFFF',
  black: '#000000',
} as const;

// rgba-представление брендового цвета с прозрачностью: withAlpha(brand.bluePrimary, 0.1)
export function withAlpha(hex: string, alpha: number | string = 1): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const styles = {
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    height: 400,
    padding: 5,
    backgroundColor: brand.white,
    borderRadius: 10,
    justifyContent: 'center',
  },
};

export default {
  light: {
    text: brand.textPrimary,
    background: brand.white,
    tint: tintColorLight,
    tabIconDefault: brand.gray,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: brand.white,
    background: brand.navyDarkest,
    tint: tintColorDark,
    tabIconDefault: brand.gray,
    tabIconSelected: tintColorDark,
  },
};
