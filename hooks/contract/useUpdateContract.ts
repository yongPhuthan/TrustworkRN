import { useState } from 'react';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {HOST_URL, PROJECT_FIREBASE} from '@env';

export const useUpdateContract = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dataApi, setData] = useState(null);
  const [error, setError] = useState(null);

  const updateContract = async (input: any) => {
    setIsLoading(true);
    setError(null);

    const user = auth().currentUser;


    let url;
    if (__DEV__) {
      url = `http://${HOST_URL}:5001/${PROJECT_FIREBASE}/asia-southeast1/appUpdateFinalContract`;
    } else {
      url = `https://asia-southeast1-${PROJECT_FIREBASE}.cloudfunctions.net/appUpdateFinalContract`;
    }

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.uid}`,
        },
        body: JSON.stringify({data:input}),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const responseData = await response.json();
      setData(responseData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateContract,
    isLoading,
    dataApi,
    error
  };
};
