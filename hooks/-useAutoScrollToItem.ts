// hooks/useAutoScrollToItem.ts
import { useCallback, useEffect } from 'react';
import { scrollToSelectedItem } from '../utils/scrollHelpers';

export const useAutoScrollToItem = (
  data: any[],
  lastViewedItem: number | null,
  scrollToIndex: (index: number, animated: boolean, viewPosition: number) => void,
  autoScroll: boolean = true // Флаг для автоматического скролла
) => {
  const handleScrollToSelected = useCallback(() => {
    scrollToSelectedItem(data, lastViewedItem, scrollToIndex);
  }, [data, lastViewedItem, scrollToIndex]);

  // Автоматический скролл при изменении lastViewedItem
  useEffect(() => {
    if (autoScroll && lastViewedItem !== null) {
      handleScrollToSelected();
    }
  }, [lastViewedItem, autoScroll, handleScrollToSelected]);

  return {
    handleScrollToSelected,
  };
};