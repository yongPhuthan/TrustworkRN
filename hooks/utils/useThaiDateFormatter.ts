import { useCallback } from 'react';

function useThaiDateFormatter() {
  const thaiDateFormatter = new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const formatThaiDate = useCallback(
    (date: Date | number | string) => thaiDateFormatter.format(new Date(date)),
    [thaiDateFormatter]
  );

  return formatThaiDate;
}

export default useThaiDateFormatter;
