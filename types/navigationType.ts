import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {StackNavigationProp} from '@react-navigation/stack';

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

export type ParamListBase = {
  Quotation: undefined;
  RegisterScreen: undefined;
  AddCustomer: undefined;
  AuditCategory: Audit;
  AddProduct: undefined;
  TopUpScreen: undefined;
  LayoutScreen: undefined;
  CreateContractScreen: {id: string};
  HomeScreen: undefined;
  CreateQuotation:undefined;
  Dashboard: undefined;
  ContractCard: undefined;
  SelectAudit: Audit;
  DefaultContract: undefined;
  SelectContract: {id: string};
  EditProductForm: {item: ProductItem};
  EditClientForm: undefined;
  WebViewScreen: {id: string};
  DocViewScreen: {id: any};
  SignUpScreen: undefined;
  LoginScreen: undefined;
  CompanyUserFormScreen: undefined;
  ContactInfoScreen: undefined;
  SettingCompany: undefined;
  EditQuotation: {id: string};
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
  InstallmentScreen: {apiData: object[]};
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
  | 'RegisterScreen';
