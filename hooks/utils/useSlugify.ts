import { useCallback } from 'react';

export const useSlugify = () => {
  const slugifyString = useCallback((str: string) => {
    return str
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/\./g, '-')
      .replace(/-+/g, '-')
      .replace(/[^a-z0-9-]/g, '-');
  }, []);

  return slugifyString;
};