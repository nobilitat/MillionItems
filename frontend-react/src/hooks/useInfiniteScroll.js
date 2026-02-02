import { useEffect, useCallback } from 'react';

export function useInfiniteScroll(ref, onLoadMore, isLoading, hasMore) {
  const handleScroll = useCallback(() => {
    if (!ref.current || isLoading || !hasMore) return;
    
    const { scrollTop, scrollHeight, clientHeight } = ref.current;
    const scrollBottom = scrollHeight - scrollTop - clientHeight;
    
    if (scrollBottom < 100) {
      onLoadMore();
    }
  }, [ref, onLoadMore, isLoading, hasMore]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, [ref, handleScroll]);
}