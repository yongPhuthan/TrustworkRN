import {useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useTokenAndEmail from '../user/useTokenAndEmail';
import {HOST_URL} from '@env';
import {Quotation} from '../../types/docType';

export const useFetchDashboardContract = (isEmulator: boolean) => {
  const fetchDashboardContract = useCallback(async () => {
    let url;
    if (isEmulator) {
      url = `http://${HOST_URL}:5001/workerfirebase-f1005/asia-southeast1/queryContractDashBoard`;
    } else {
      url = `https://asia-southeast1-workerfirebase-f1005.cloudfunctions.net/queryContractDashBoard`;
    }
    const user = await useTokenAndEmail();
    if (user) {
      const {token, email} = user;

      if (email) {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
          }),
        });
        const data = await response.json();
        await AsyncStorage.setItem('dashboardContract', JSON.stringify(data));
        if (data && data[1]) {
          data[1].sort((a: Quotation, b: Quotation) => {
            const dateA = new Date(a.dateOffer);
            const dateB = new Date(b.dateOffer);
            return dateB.getTime() - dateA.getTime();
          });
        }
        return data;
      }
    }
  }, [isEmulator]);

  return fetchDashboardContract;
};
