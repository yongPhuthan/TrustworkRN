// /hooks/useFetchCompanyUser.js
import {useQuery} from '@tanstack/react-query';
import {useUser} from '../../../providers/UserContext';
import {CompanyUser} from '../../../types/docType';
import {BACK_END_SERVER_URL} from '@env';

const useFetchCompanyUser = () => {
  const user = useUser();

  const fetchCompanyUser = async (): Promise<CompanyUser> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const idToken = await user.getIdToken(true);
    const {email} = user;
    if (!email) {
      throw new Error('Email not found');
    }

    const url = `${BACK_END_SERVER_URL}/api/company/getCompanySeller?email=${encodeURIComponent(
      email,
    )}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    // Optionally handle Firebase Messaging token logic here if needed

    return data;
  };

  const {data, isLoading, isError, error} = useQuery({
    queryKey: ['companyUser', user?.email],
    queryFn: fetchCompanyUser,
  });

  return {data, isLoading, isError, error};
};

export default useFetchCompanyUser;
