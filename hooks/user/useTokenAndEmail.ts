// useTokenAndEmail.ts
import { useState, useEffect } from 'react';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';

interface TokenAndEmail {
  token: string | null;
  email: string | null;
}

const useTokenAndEmail = (): TokenAndEmail => {
  const [data, setData] = useState<TokenAndEmail>({ token: null, email: null });

  useEffect(() => {
    const fetchTokenAndEmail = async () => {
      const currentUser = auth().currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken();
        const email = currentUser.email || null;
        setData({ token, email });
      }
    };

    fetchTokenAndEmail();
  }, []);

  return data;
};

export default useTokenAndEmail;
