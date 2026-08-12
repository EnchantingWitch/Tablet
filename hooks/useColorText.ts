export function useColorText(opacity?: string | number): string {//самый темный синий
  return `rgba(0, 51, 102, ${opacity ?? 1})`;
}
export function useColorBlue(opacity?: string | number): string {//для кнопки
  return `rgba(0, 120, 193, ${opacity ?? 1})`;
}

export function useColorSkyBlueCarpet(opacity?: string | number): string {//для подложки
  return `rgba(160, 225, 255, ${opacity ?? 1})`; //"#0072C8"
}

export function useColorSkyBlueText(opacity?: string | number): string {//для текста голубого на дашборде
  return `rgba(47, 180, 233, ${opacity ?? 1})`;//'#2FB4E9'
}

export function useColorLightGray(opacity?: string | number): string {//'rgba(242, 242, 242, 1)' - original
  return `rgba(242, 242, 242, ${opacity ?? 1})`;//`rgba(231, 230, 230, ${opacity ?? 1})` - корп
}

export function useColorGray(opacity?: string | number): string {
  return `rgba(184, 189, 192, ${opacity ?? 1})`;
}

export function useColorRed(opacity?: string | number): string {//'rgba(226, 72, 49, 1)' 'rgba(205, 34, 44, 1)'
  return `rgba(205, 34, 44, ${opacity ?? 1})`;
}

export function useColorOrange(opacity?: string | number): string {//'rgba(254, 106, 12, 1)'
  return `rgba(254, 106, 12, ${opacity ?? 1})`;
}

export function useColorGreen(opacity?: string | number): string {// rgba(22, 163, 74, 1)
  return `rgba(22, 163, 74, ${opacity ?? 1})`;
}