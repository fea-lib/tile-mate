const debounceMap = new Map<string, number>();

export const debounce = (key: string, fn: () => void, delay: number = 300) => {
  if (debounceMap.has(key)) {
    clearTimeout(debounceMap.get(key)!);
  }

  const timeoutId = setTimeout(() => {
    fn();
    debounceMap.delete(key);
  }, delay);

  debounceMap.set(key, timeoutId);
};
