// /hooks/useFetchCompanyUser.js
import {useQuery} from '@tanstack/react-query';
import {useUser} from '../../../providers/UserContext';
import {CompanyUser} from '../../../types/docType';
import {BACK_END_SERVER_URL} from '@env';
const useFetchDashboard = () => {
  const user = useUser();

  const fetchDashboard = async (): Promise<any> => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    console.log('BACK_END_SERVER_URL22', BACK_END_SERVER_URL);

    const {email} = user;
    if (!email) {
      throw new Error('Email not found');
    }
    const token = await user.getIdToken(true);
    console.log('url', `${BACK_END_SERVER_URL}/api/dashboard/dashboard?email=${encodeURIComponent(email)}`);

    const response = await fetch(
      `${BACK_END_SERVER_URL}/api/dashboard/dashboard?email=${encodeURIComponent(
        email,
      )}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    console.log('url33', `${BACK_END_SERVER_URL}/api/dashboard/dashboard?email=${encodeURIComponent(email)}`);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    if (data && Array.isArray(data[1])) {
      data[1].sort((a, b) => {
        const dateA = new Date(a.dateOffer);
        const dateB = new Date(b.dateOffer);
        return dateB.getTime() - dateA.getTime();
      });
    }
    return data;
  };

  const {data, isLoading, isError, error} = useQuery({
    queryKey: ['dashboardQuotation', user?.email],
    queryFn: fetchDashboard,
  });

  return {data, isLoading, isError, error};
};

export default useFetchDashboard;
