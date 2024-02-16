// useFilteredQuotationData.ts
import { useMemo } from 'react';
import { QuotationStatus, QuotationStatusKey } from '../../models/QuotationStatus';
import { Quotation } from '../../types/docType';

export const useFilteredData = (originalData: Quotation[] | null, activeFilter: QuotationStatusKey) => {
  const filteredData = useMemo(() => {
    if (!originalData) return null;

    return activeFilter === QuotationStatus.ALL
      ? originalData
      : originalData.filter(q => q.status === activeFilter);
  }, [originalData, activeFilter]);

  return filteredData;
};
