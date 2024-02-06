import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {StackNavigationProp} from '@react-navigation/stack';
import {CompanyUser, Service, Quotation, Standard} from './docType';
type InstallmentParams = {
  data: {
    projectName: string;
    signDate: string; // Adjust the type based on your actual data structure
    servayDate: string; // Same here, ensure the type matches your data
    total: number;
    signAddress: string;
    quotationId: string; // Adjust based on actual ID type (string or number)
    sellerId: string; // Adjust as needed
    contractID: string | undefined; // Assuming contract?.id can be undefined
    sellerSignature: string; // Adjust as needed
  };
};
export type Audit = {
  title: string;
  description: string;

  serviceID: string;
};

export type ProductItem = {
  title: string;
  id: string;
  description: string;
  qty: number;
  unit: string;
  total: number;
  unitPrice: number;
  discountPercent: number;
  audits: Audit[];
};
type OnAddService = (service: Service) => void;


export type ParamListBase = {
  Quotation: undefined;
  RegisterScreen: undefined;
  AddCustomer: undefined;
  AuditCategory: Audit;
  AddProduct: {
    onAddService: OnAddService;
    quotationId: string;
    currentValue:Service | null
  };
  ExistingContract: undefined;
  TopUpScreen: {balance:number};
  LayoutScreen: undefined;
  CreateContractScreen: {id: string};
  HomeScreen: undefined;
  CreateQuotation: undefined;
  Dashboard: undefined;
  ContractCard: undefined;
  SelectAudit: Audit;
  DefaultContract: {
    data : Quotation
  };
  EditDefaultContract: {
    data : Quotation
    quotationId: string;  
  };
  DashboardQuotation: undefined;
  DashboardContract: undefined;

  SelectContract: {id: string};
  EditProductForm: {
    index: number;
    currentValue: Service;
    update: any;
  };
  AddExistProduct: {item: Service};
  EditClientForm: undefined;
  EditCustomerForm: undefined;
  SettingsScreen: undefined;
  WebViewScreen: {id: string};
  DocViewScreen: {id: any};
  EditSetting: {company: CompanyUser};
  SignUpScreen: undefined;
  LoginScreen: undefined;
  CompanyUserFormScreen: undefined;
  ExistingSignature: {
    company: CompanyUser
  }
  ContactInfoScreen: undefined;
  Installment: InstallmentParams
  ExistingCategories: undefined;
  GalleryScreen: {code: string | undefined};
  SettingCompany: undefined;
  GalleryUploadScreen: undefined;
  ExistingProduct: {id: string};
  ExistingMaterials: {id: string};
  AddNewMaterial: undefined;
  ExistingWorkers: {id: string};
  AddNewWorker: undefined;
  CreateCompanyScreen: undefined;
  FirstAppScreen: undefined;
  SelectWorks: {quotationId: string};
  SendWorks: {
    id: string;
    companyUser: CompanyUser;
    workStatus: string;
    title: string;
    signAddress:string;
    contract:{
      id:string;
      projectName:string;
      description:string;
      signAddress:string;
    }
    customer :{
      id:string;
      name:string;
      email:string;
      phone:string;
      address:string;
    }
    description: string;
    services: {
      id: string;
      title: string;
      description: string;
    }[];
  };
  Signature: {
    text: string;
    data: Quotation;
  };
  EditQuotation: {quotation: Quotation; company: CompanyUser,services:Service[]};
  EditQuotationScreen: {id: string};
  EditContractOption: {id: string};
  QuotationScreen: undefined;
  ContractOptions: {
    id: string;
    customerName: string;
    allTotal: number;
    sellerId: string;
  };
  NavigationScreen: undefined;
};

export type ScreenItem = {
  name: keyof ParamListBase;
  component: React.ComponentType<any>;
};

export interface NavigationScreen {
  navigation: NativeStackNavigationProp<ParamListBase, 'NavigationScreen'>;
}

export interface DashboardScreenProps {
  navigation: StackNavigationProp<ParamListBase, 'Dashboard'>;
}

export type ScreenName =
  | 'SignUpScreen'
  | 'CompanyUserFormScreen'
  | 'RootTab'
  | 'HomeScreen'
  | 'RegisterScreen'
  | 'FirstAppScreen'
  | 'LoginScreen'
  | 'DashboardQuotation'
  | 'CreateCompanyScreen'
  | 'SelectWorks';
