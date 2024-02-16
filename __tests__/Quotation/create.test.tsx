import {
  renderHook,
  fireEvent,
  waitFor,
  render,
} from '@testing-library/react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import mockAxios from 'jest-mock-axios';
import React from 'react';
import {useUser} from '../../providers/UserContext';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import useFetchCompanyUser from '../../hooks/quotation/create/useFetchCompanyUser';
import {CompanyUser} from 'types/docType';
import {useForm, FormProvider} from 'react-hook-form';
import Quotation from '../../screens/quotation/create';
import {yupResolver} from '@hookform/resolvers/yup';
import {quotationsValidationSchema} from '../../screens/utils/validationSchema';
import {StackNavigationProp} from '@react-navigation/stack';
import {ParamListBase} from '@react-navigation/native';
import AddCustomer from '../../components/add/AddCustomer';
interface Props {
  navigation: StackNavigationProp<ParamListBase, 'Quotation'>;
}
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  // Add other navigation methods as needed
};
// Setup a new QueryClient for testing
const queryClient = new QueryClient();
const quotationDefaultValues = {
  services: [
    {
      title: 'หน้าต่างกระจกบานเลื่อน',
      description: 'ขนาดกว้าง 500cm x สูง 250cm',
      unit: 'ชุด',
      qty: 2,
      unitPrice: 48870,
      total: 97740,
      materials: [],
      serviceImages: [],
      standards: [],
    },
    {
      title: 'หน้าต่างกระจกบานเลื่อน2',
      description: 'ขนาดกว้าง 500cm x สูง 250cm',
      unit: 'ชุด',
      qty: 2,
      unitPrice: 5000,
      total: 97740,
      materials: [],
      serviceImages: [],
      standards: [],
    },
  ],
  customer: {
    name: 'custoerm name',
    address: ' customer address',
    phone: '    1234567890',
    companyId: '    1234567890',
  },
  companyUser: null,
  vat7: 0,
  taxType: 'NOTAX',
  taxValue: 0,
  summary: 0,
  summaryAfterDiscount: 0,
  discountType: 'PERCENT',
  discountPercentage: 0,
  discountValue: 0,
  allTotal: 0,
  dateOffer: '11-11-2021',
  dateEnd: '17-11-2021',
  docNumber: '213243536363543',
  workers: [],
  FCMToken: 'FCMToken',
  sellerSignature: '',
};

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}));

jest.mock('../../providers/UserContext', () => ({
  useUser: jest.fn(),
}));

describe('useFetchCompanyUser', () => {
  afterEach(() => {
    mockAxios.reset();
    queryClient.clear(); // Clear the query cache after each test
  });

  it('should fetch company user data successfully', async () => {
    // Mock user and company user data
    const mockCompanyUserData: CompanyUser = {
      id: 'mock_company_user_id',
      bizName: 'Mock Business Name',
      code: 'mock_code',
      userName: 'John',
      userLastName: 'Doe',
      address: '123 Main Street',
      officeTel: '555-123-4567',
      mobileTel: '555-987-6543',
      userPosition: 'Manager',
      bizType: 'Retail',
      logo: 'https://via.placeholder.com/150', // Placeholder for logo
      signature: 'https://via.placeholder.com/300x100', // Placeholder for signature
      companyNumber: '1234567890',
      user: null, // Or mock a User object if needed
      userEmail: 'john.doe@example.com',
      rules: ['admin', 'sales'],
      quotation: [], // Mock quotations if needed
      customers: [], // Mock customers if needed
      services: [], // Mock services if needed
      contracts: [], // Mock contracts if needed    };
    };
    const mockUser = {
      getIdToken: jest.fn().mockResolvedValue('id_token'),
      email: 'test@example.com',
    };

    (useQuery as jest.Mock).mockImplementation(() => ({
      data: mockCompanyUserData,
      isLoading: false,
      isError: false,
      error: null,
    }));

    (useUser as jest.Mock).mockReturnValue(mockUser);

    const wrapper = ({children}: any) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const {result} = renderHook(() => useFetchCompanyUser(), {wrapper});

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockCompanyUserData);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
  });
});

describe('AddCustomer', () => {
  it('should display required error when value is invalid', async () => {
    const {getByTestId, findByText} = render(
      <SafeAreaProvider>
        <Quotation navigation={mockNavigation as any} />
      </SafeAreaProvider>,
    );

    const button = getByTestId('submited-button');

    expect(button).toBeDisabled();
  });
});
