// useActiveFilter.ts
import { useState } from 'react';
import { QuotationStatus, QuotationStatusKey } from '../../models/QuotationStatus';

export const useActiveFilter = () => {
  const [activeFilter, setActiveFilter] = useState<QuotationStatusKey>(QuotationStatus.ALL);

  const updateActiveFilter = (filter: QuotationStatusKey) => {
    setActiveFilter(filter);
  };

  return { activeFilter, updateActiveFilter };
};
