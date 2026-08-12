// hooks/useScrollToIndex.ts (расширенная версия)
import { useCallback, useRef } from 'react';
import { FlatList } from 'react-native';

export const useScrollToIndex = () => {
  const flatListRef = useRef<FlatList>(null);

  const scrollToIndex = useCallback((
    index: number, 
    animated: boolean = true, 
    viewPosition: number = 0.5
  ) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated,
      viewPosition,
    });
  }, []);

  const scrollToIndexWithRetry = useCallback((
    index: number,
    animated: boolean = true,
    viewPosition: number = 0.5,
    retryCount: number = 3,
    delay: number = 300
  ) => {
    const attemptScroll = (attempt: number = 0) => {
      try {
        scrollToIndex(index, animated, viewPosition);
      } catch (error) {
        if (attempt < retryCount) {
          setTimeout(() => attemptScroll(attempt + 1), delay);
        }
      }
    };
    
    attemptScroll();
  }, [scrollToIndex]);

  return {
    flatListRef,
    scrollToIndex,
    scrollToIndexWithRetry,
    scrollToOffset: useCallback((offset: number, animated: boolean = true) => {
      flatListRef.current?.scrollToOffset({ offset, animated });
    }, []),
  };
};