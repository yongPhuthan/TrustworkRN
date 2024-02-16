import {useMemo} from 'react';

const useDocumentDetails = () => {
  return useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 900) + 100;
    const docnumber = `${year}${month}${day}${randomNum}`;

    const dateOffer = `${day}-${month}-${year}`;

    const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const endYear = endDate.getFullYear();
    const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
    const endDay = String(endDate.getDate()).padStart(2, '0');
    const dateEnd = `${endDay}-${endMonth}-${endYear}`;

    return {
      initialDocnumber: docnumber,
      initialDateOffer: dateOffer,
      initialDateEnd: dateEnd,
    };
  }, []);
};
export default useDocumentDetails;
