// useRemoveQuotation.ts
import {useState} from 'react';
import {Alert} from 'react-native';
import {useQueryClient} from '@tanstack/react-query';
import {useUser} from '../../../providers/UserContext';
import {BACK_END_SERVER_URL} from '@env';

export const useRemoveQuotation = () => {
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const user = useUser();
  const email = user?.email as string;
  const queryClient = useQueryClient();

  const removeQuotation = async (id: string) => {
    if (!user) {
      console.error('User is not available');
      return;
    }

    setIsLoadingAction(true);
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/documents/removeQuotation?id=${encodeURIComponent(
          id,
        )}&email=${encodeURIComponent(email)}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      setIsLoadingAction(false);
      if (!response.ok) throw new Error('Failed to delete quotation');

      queryClient.invalidateQueries(['dashboardQuotation', user.email]);
    } catch (error) {
      console.error('An error occurred:', error);
      Alert.alert('Error', 'Failed to delete quotation. Please try again.');
    }
  };
  return {removeQuotation, isLoadingAction};
};
