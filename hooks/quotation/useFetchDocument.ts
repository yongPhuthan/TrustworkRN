import { useState, useCallback } from 'react';
import {HOST_URL,PROJECT_NAME} from "@env"
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';

export const useFetchDocument = () => {
  // State to hold fetched data
  const [data, setData] = useState<any>(null);
  // State to hold any error
  const [error, setError] = useState<Error | null>(null);
  // State for loading status
  const [loading, setLoading] = useState<boolean>(false);

  const fetchDocument = useCallback(async ({ id, isEmulator }: { id: string; isEmulator: boolean }) => {
    setLoading(true);
    setError(null);

    try {
      const user = auth().currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      const idToken = await user.getIdToken();

      let url;
      if (isEmulator) {
        url = `http://${HOST_URL}:5001/${PROJECT_NAME}/asia-southeast1/queryDocument`;
      } else {
        url = `https://asia-southeast1-${PROJECT_NAME}.cloudfunctions.net/queryDocument`;
      }
      const response = await fetch(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ id }),
          credentials: 'include',
        },
      );
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setData(responseData);
    } catch (err) {
        setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {  fetchDocument, data, error, loading };
};
