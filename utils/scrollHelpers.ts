export const scrollToSelectedItem = (
  data: any[],
  lastViewedItem: number | null,
  scrollToIndex: (index: number, animated: boolean, viewPosition: number) => void
) => {
  if (!data.length) return;

  // Если lastViewedItem существует в data
  const selectedIndex = data.findIndex(item => item.commentId === lastViewedItem);
  if (selectedIndex !== -1) {
    scrollToIndex(selectedIndex, true, 0.5);
    return;
  }

  // Если lastViewedItem не найден
  if (data.length > 0 && lastViewedItem) {
    const firstKey = data[0].commentId;
    
    if (firstKey + 2 < lastViewedItem) {
      const itemsWithIndex = data.map((item, index) => ({
        id: item.commentId,
        index: index
      }));
      
      const suitableItems = itemsWithIndex.filter(item => item.id <= lastViewedItem);
      
      if (suitableItems.length > 0) {
        const nearestItem = suitableItems.reduce((prev, current) => 
          (prev.id > current.id) ? prev : current
        );
        scrollToIndex(nearestItem.index, true, 0.5);
        return;
      }
    }
  }

  // Если ничего не найдено - переходим на начало списка
  scrollToIndex(0, true, 0);
};