// hooks/useViewableItems.ts
import { useCallback, useState } from 'react';
import { ViewToken, ViewabilityConfig } from 'react-native';

interface ViewableItemsChangedInfo {
  viewableItems: ViewToken[];
  changed: ViewToken[];
}

export const useViewableItems = (autoDetect: boolean = true) => {
  const [lastViewedItem, setLastViewedItem] = useState<number | null>(null);
  const [viewableItems, setViewableItems] = useState<number[]>([]);

  const viewabilityConfig: ViewabilityConfig = {
    itemVisiblePercentThreshold: 60,
    minimumViewTime: 100,
  };

  const onViewableItemsChanged = useCallback(
    ({ viewableItems: visibleItems }: ViewableItemsChangedInfo) => {
      if (!autoDetect) return;
      
      const visibleIds = visibleItems
        .map(item => item.item?.commentId)
        .filter((commentId): commentId is number => commentId !== undefined);
      
      setViewableItems(visibleIds);
      
      if (visibleIds.length > 0) {
        const lastItemId = Math.max(...visibleIds);
        setLastViewedItem(lastItemId);
      }
    },
    [autoDetect]
  );

  return {
    lastViewedItem,
    viewableItems,
    viewabilityConfig,
    onViewableItemsChanged,
    setLastViewedItem, // Функция для ручной установки
  };
};