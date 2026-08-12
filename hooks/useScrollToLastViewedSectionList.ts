// hooks/useScrollToLastViewedSectionList.ts
import { MutableRefObject, useCallback, useRef, useState } from 'react';
import { SectionList, ViewToken } from 'react-native';

interface ViewableItemsChangedInfo {
  viewableItems: ViewToken[];
  changed: ViewToken[];
}

interface ScrollToLastViewedConfig {
  itemVisiblePercentThreshold?: number;
  minimumViewTime?: number;
}

interface UseScrollToLastViewedSectionListReturn<T> {
  sectionListRef: MutableRefObject<SectionList<T> | null>;
  viewabilityConfig: ScrollToLastViewedConfig;
  onViewableItemsChanged: (info: ViewableItemsChangedInfo) => void;
  scrollToSelectedItem: (sections: Array<{ data: T[]; id: string | number }>) => void;
  lastViewedItem: number | null;
  setLastViewedItem: (id: number | null) => void;
  viewableItems: number[];
  // Новые свойства
  lastSectionId: string | number | null;
  setLastSectionId: (id: string | number | null) => void;
  lastItemInSection: Record<string | number, number | null>;
  setLastItemInSection: (sectionId: string | number, itemId: number | null) => void;
}

interface UseScrollToLastViewedOptions {
  idField?: string;
  sectionIdField?: string;
  scrollToPosition?: number;
}

export const useScrollToLastViewedSectionList = <T>(
  options: UseScrollToLastViewedOptions = {}
): UseScrollToLastViewedSectionListReturn<T> => {
  const {
    idField = 'pnrsystemId',
    sectionIdField = 'id',
    scrollToPosition = 1
  } = options;

  const [lastViewedItem, setLastViewedItem] = useState<number | null>(null);
  const [lastSectionId, setLastSectionId] = useState<string | number | null>(null);
  const [lastItemInSection, setLastItemInSectionState] = useState<Record<string | number, number | null>>({});
  const [viewableItems, setViewableItemsState] = useState<number[]>([]);
  const sectionListRef = useRef<SectionList<T> | null>(null);
  const isScrollingProgrammatically = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setLastItemInSection = useCallback((sectionId: string | number, itemId: number | null) => {
    setLastItemInSectionState(prev => ({
      ...prev,
      [sectionId]: itemId
    }));
  }, []);

  const scrollToLocation = useCallback((
    sectionIndex: number,
    itemIndex: number,
    animated: boolean = true,
    viewPosition: number = 0.5
  ) => {
    // Очищаем предыдущий таймаут
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    isScrollingProgrammatically.current = true;
    
    // Используем setTimeout для обеспечения корректного выполнения скролла
    setTimeout(() => {
      sectionListRef.current?.scrollToLocation({
        sectionIndex,
        itemIndex,
        animated,
        viewPosition
      });
      
      if (animated) {
        scrollTimeoutRef.current = setTimeout(() => {
          isScrollingProgrammatically.current = false;
        }, 500);
      } else {
        isScrollingProgrammatically.current = false;
      }
    }, 50);
  }, []);

  const scrollToSelectedItem = useCallback((sections: Array<{ data: T[]; id: string | number }>) => {
    if (!sections.length || !sections.some(section => section.data.length)) return;

    const getItemId = (item: T): number => {
      return (item as any)[idField];
    };

    const getSectionId = (section: { id: string | number }): string | number => {
      return section.id;
    };

    // Приоритет 1: Используем сохраненные данные о секции и элементе
    if (lastSectionId !== null && lastItemInSection[lastSectionId] !== null && lastItemInSection[lastSectionId] !== undefined) {
      const targetItemId = lastItemInSection[lastSectionId];
      
      const sectionIndex = sections.findIndex(section => getSectionId(section) === lastSectionId);
      
      if (sectionIndex !== -1 && targetItemId !== null) {
        const section = sections[sectionIndex];
        const itemIndex = section.data.findIndex(item => getItemId(item) === targetItemId);
        
        if (itemIndex !== -1) {
          scrollToLocation(sectionIndex, itemIndex, true, scrollToPosition);
          return;
        }
      }
    }

    // Приоритет 2: Используем старую логику с lastViewedItem
    if (lastViewedItem) {
      let foundSectionIndex = -1;
      let foundItemIndex = -1;

      outerLoop: for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
        const section = sections[sectionIndex];
        
        for (let itemIndex = 0; itemIndex < section.data.length; itemIndex++) {
          const item = section.data[itemIndex];
          if (getItemId(item) === lastViewedItem) {
            foundSectionIndex = sectionIndex;
            foundItemIndex = itemIndex;
            break outerLoop;
          }
        }
      }

      if (foundSectionIndex !== -1 && foundItemIndex !== -1) {
        scrollToLocation(foundSectionIndex, foundItemIndex, true, scrollToPosition);
        return;
      }

      // Приоритет 3: Ищем ближайший элемент
      let nearestSectionIndex = -1;
      let nearestItemIndex = -1;
      let nearestId = -1;

      for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
        const section = sections[sectionIndex];
        
        section.data.forEach((item, itemIndex) => {
          const itemId = getItemId(item);
          if (itemId <= lastViewedItem && itemId > nearestId) {
            nearestId = itemId;
            nearestSectionIndex = sectionIndex;
            nearestItemIndex = itemIndex;
          }
        });
      }

      if (nearestSectionIndex !== -1 && nearestItemIndex !== -1) {
        scrollToLocation(nearestSectionIndex, nearestItemIndex, true, scrollToPosition);
        return;
      }
    }

    // Приоритет 4: Скроллим к началу
    scrollToLocation(0, 0, true, 0);
  }, [lastViewedItem, lastSectionId, lastItemInSection, scrollToLocation, idField, scrollToPosition]);

  const onViewableItemsChanged = useCallback(({ viewableItems: visibleItems }: ViewableItemsChangedInfo) => {
    if (isScrollingProgrammatically.current) return;

    const visibleIds = visibleItems
      .map(item => {
        const itemData = item.item as T;
        return itemData ? (itemData as any)[idField] : undefined;
      })
      .filter((id): id is number => id !== undefined);
    
    setViewableItemsState(visibleIds);
    
    if (visibleItems.length > 0) {
      // Находим максимальный ID среди видимых элементов
      const lastItemId = Math.max(...visibleIds);
      setLastViewedItem(lastItemId);
      
      // Сохраняем информацию о последней видимой секции и элементе
      const lastVisibleItem = visibleItems[visibleItems.length - 1];
      if (lastVisibleItem && lastVisibleItem.section) {
        const sectionId = (lastVisibleItem.section as any)[sectionIdField];
        if (sectionId !== undefined) {
          setLastSectionId(sectionId);
          
          if (lastVisibleItem.item) {
            const itemId = (lastVisibleItem.item as any)[idField];
            setLastItemInSection(sectionId, itemId);
          }
        }
      }
    }
  }, [idField, sectionIdField, setLastItemInSection]);

  const viewabilityConfig: ScrollToLastViewedConfig = {
    itemVisiblePercentThreshold: 60,
    minimumViewTime: 100,
  };
  console.log('lastViewedItem',lastViewedItem)
  console.log( 'lastSectionId', lastSectionId, )
  console.log('lastItemInSection', lastItemInSection)
  console.log('viewableItems', viewableItems)

  return {
    sectionListRef,
    viewabilityConfig,
    onViewableItemsChanged,
    scrollToSelectedItem,
    lastViewedItem,
    setLastViewedItem,
    viewableItems,
    lastSectionId,
    setLastSectionId,
    lastItemInSection,
    setLastItemInSection
  };
};