import { renderHook, act, waitFor } from '@testing-library/react-native';
import mockAxios from 'jest-mock-axios'; 
import { useUser } from '../../providers/UserContext';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import useFetchDashboard from '../../hooks/quotation/dashboard/useFetchDashboard';
import { CompanyUser } from 'types/docType';
// Setup a new QueryClient for testing
const queryClient = new QueryClient();

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
      const mockDashboardData: any =[{
        "bizName": "Double door engineering",
        "code": "477827",
        "companyTax": "1100800667422",
        "id": "65c245363b26b43829493ac8",
        "userLastName": "Kantabusabong",
        "userName": "Phuthan"
    }, [{
        "allTotal": 97740,
        "customer":{"address": "7/44 หมู่5 ต.สามพราน อ้อมใหญ่", "companyId": "", "name": "คุณ สุกัญญา ยาคำ", "phone": "053306426"},
        "dateEnd": "15-02-2024",
        "dateOffer": "08-02-2024",
        "discountType": "PERCENT",
        "discountValue": 0,
        "docNumber": "20240208178",
        "id": "65c49bddbaeff0d2df1c02e1",
        "services": [{"description": "ขนาดกว้าง 500cm x สูง 250cm", "materials": [], "qty": 2, "serviceImages": [], "standards": [], "title": "หน้าต่างกระจกบานเลื่อน", "total": 97740, "unit": "ชุด", "unitPrice": 48870}],
        "status": "APPROVED",
        "summaryAfterDiscount": 97740,
        "taxType": "NOTAX",
        "taxValue": 0,
        "vat7": 0
    }]]
      const mockUser = {
        getIdToken: jest.fn().mockResolvedValue('id_token'),
        email: 'test@example.com',
      };
  
      (useQuery as jest.Mock).mockImplementation(() => ({
              data: mockDashboardData,
              isLoading: false,
              isError: false,
              error: null,
      }));
  
      (useUser as jest.Mock).mockReturnValue(mockUser);
  
      const wrapper = ({ children  }:any) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );
  
      const { result }  = renderHook(() => useFetchDashboard(), { wrapper });
  
      await waitFor(() => expect(result.current.isLoading).toBe(false));
  
      expect(result.current.data).toEqual(mockDashboardData);
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBeNull();
    });  
  });
  
  