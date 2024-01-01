import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {StackNavigationProp} from '@react-navigation/stack';
import {CompanyUser, Service, Quotation, AuditData} from './docType';

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
  };
  TopUpScreen: undefined;
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
  ExistingSignature: any;
  ContactInfoScreen: undefined;
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
  Installment: any;
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
