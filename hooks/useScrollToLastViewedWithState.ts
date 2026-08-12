// hooks/useScrollToLastViewedWithState.ts
import { MutableRefObject, useCallback, useRef, useState } from 'react';
import { FlatList, ViewToken } from 'react-native';

interface ViewableItemsChangedInfo {
  viewableItems: ViewToken[];
  changed: ViewToken[];
}

interface ScrollToLastViewedConfig {
  itemVisiblePercentThreshold?: number;
  minimumViewTime?: number;
}

interface UseScrollToLastViewedWithStateReturn<T> {
  flatListRef: MutableRefObject<FlatList<T> | null>;
  viewabilityConfig: ScrollToLastViewedConfig;
  onViewableItemsChanged: (info: ViewableItemsChangedInfo) => void;
  scrollToSelectedItem: (data: T[]) => void;
  lastViewedItem: number | null ;
  setLastViewedItem: (id: number | null) => void;
  viewableItems: number[];
}

interface UseScrollToLastViewedOptions {
  idField?: string; // Поле для идентификации элемента
  scrollToPosition?: number; // Позиция скролла (0 - top, 1 - bottom)
}

export const useScrollToLastViewedWithState = <T>(
  options: UseScrollToLastViewedOptions = {}
): UseScrollToLastViewedWithStateReturn<T> => {
  const {
    idField , // Значение по умолчанию
    scrollToPosition = 1 // По умолчанию скроллим к bottom
  } = options;

  const [lastViewedItem, setLastViewedItem] = useState<number | null>(null);
  const [viewableItems, setViewableItemsState] = useState<number[]>([]);
  const flatListRef = useRef<FlatList<T> | null>(null);
  const isScrollingProgrammatically = useRef(false);

  const scrollToThis = useCallback((index: number, animated: boolean, viewPosition: number) => {
    
    isScrollingProgrammatically.current = true;
    flatListRef.current?.scrollToIndex({
      index,
      animated,
      viewPosition
    });
    
    if (animated) {
      setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 500);
    } else {
      isScrollingProgrammatically.current = false;
    }
  }, []);

  const scrollToSelectedItem = useCallback((data: T[]) => {
     console.log('scrollToSelectedItem called with:', {
    dataLength: data.length,
    lastViewedItem,
    //firstItemId: data[0]?.idField
  });
    if (!data.length) return;

    // Получаем значение ID поля из элемента
    const getItemId = (item: T): number => {
      return(item as any)[idField];
    };

    // Если selectedItem существует в data
    const selectedIndex = data.findIndex(item => getItemId(item) === lastViewedItem);
    if (selectedIndex !== -1) {
      scrollToThis(selectedIndex, true, scrollToPosition);
      return;
    }

    // Если selectedItem не найден
    if (data.length > 0 && lastViewedItem) {
      const firstKey = getItemId(data[0]);
      
      if (firstKey + 2 < lastViewedItem) {
        const itemsWithIndex = data.map((item, index) => ({
          id: getItemId(item),
          index: index
        }));
        
        const suitableItems = itemsWithIndex.filter(item => item.id <= lastViewedItem);
        
        if (suitableItems.length > 0) {
          const nearestItem = suitableItems.reduce((prev, current) => 
            (prev.id > current.id) ? prev : current
          );
          scrollToThis(nearestItem.index, true, scrollToPosition);
          console.log('scrollToThis', nearestItem.index, scrollToPosition)
          return;
        }
      }
    }

    // Если ничего не найдено - переходим на начало списка
    scrollToThis(0, true, 0);
  }, [lastViewedItem, scrollToThis, idField, scrollToPosition]);

  

  const onViewableItemsChanged = useCallback(({ viewableItems: visibleItems }: ViewableItemsChangedInfo) => {
    if (isScrollingProgrammatically.current) return;
 
    // Получаем ID используя указанное поле
    const visibleIds = visibleItems
      .map(item => {
        const itemData = item.item as T;
        return itemData ? (itemData as any)[idField] : undefined;
      })
      .filter((id): id is number => id !== undefined);
    
    setViewableItemsState(visibleIds);
    console.log(visibleIds.length, 'visibleIds.length ' )

    if (visibleIds.length > 0) {
      const lastItemId = Math.max(...visibleIds);
      setLastViewedItem(lastItemId);
      console.log(lastItemId, 'nen lastItemId');
    }
  }, [idField]);

  const viewabilityConfig: ScrollToLastViewedConfig = {
    itemVisiblePercentThreshold: 60,
    minimumViewTime: 100,
  };

  return {
    flatListRef,
    viewabilityConfig,
    onViewableItemsChanged,
    scrollToSelectedItem,
    lastViewedItem,
    setLastViewedItem,
    viewableItems
  };
};