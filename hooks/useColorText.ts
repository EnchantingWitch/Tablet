import { brand, withAlpha } from '@/constants/Colors';

export function useColorText(opacity?: string | number): string {//самый темный синий
  return withAlpha(brand.navyDark, opacity ?? 1);
}
export function useColorBlue(opacity?: string | number): string {//для кнопки
  return withAlpha(brand.bluePrimary, opacity ?? 1);
}

export function useColorSkyBlueCarpet(opacity?: string | number): string {//для подложки
  return withAlpha(brand.bgBlue, opacity ?? 1);
}
export function useColorSkyBlueText(opacity?: string | number): string {//для текста голубого на дашборде
  return withAlpha(brand.blueLight, opacity ?? 1);
}
export function useColorLightGray(opacity?: string | number): string {//светлая подложка
  return withAlpha(brand.bgBlueLight, opacity ?? 1);
}
export function useColorGray(opacity?: string | number): string {
  return withAlpha(brand.bgBlue, opacity ?? 1);
}
export function useColorRed(opacity?: string | number): string {
  return withAlpha(brand.red, opacity ?? 1);
}
export function useColorOrange(opacity?: string | number): string {
  return withAlpha(brand.yellow, opacity ?? 1);
}
export function useColorGreen(opacity?: string | number): string {
  return withAlpha(brand.green, opacity ?? 1);
}
