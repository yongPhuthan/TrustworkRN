import {StyleSheet, Text, View} from 'react-native';
import {
  NavigationContainer,
  NavigationContext,
  useNavigation,
  DefaultTheme,
} from '@react-navigation/native';
import React, {useState, useContext, useEffect, useCallback} from 'react';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import RegisterScreen from '../screens/register/RegisterScreen';
import firebase from '../firebase';
type ParamListBase = {
  Quotation: undefined;
  RegisterScreen1: undefined;
  AddClient: undefined;
  // EditCompanyForm: {dataProps?: Company};
  AuditCategory: {title: string; description: string; serviceID: string};
  AddProductForm: undefined;
  TopUpScreen: undefined;
  LayoutScreen: undefined;
  CreateContractScreen: {id: string};
  RootTab: undefined;
  QuotationScreen: undefined;
  Dashboard: undefined;
  ContractCard: undefined;
  SelectAudit: {title: string; description: string; serviceID: string};
  SelectContract: {id: string};
  EditProductForm: {
    item: {
      title: string;
      id: string;
      description: string;
      qty: number;
      unit: string;
      total: number;
      unitPrice: number;
      discountPercent: number;
      audits: {
        id: string;
        title: string;
      }[];
    };
  };
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
  EditContract: undefined;
  ContractOption: undefined;
  NavigationScreen: undefined;
  InstallmentScreen: {
    apiData: object[];
  };
};
type ScreenName =
  | 'SignUpScreen'
  | 'CompanyUserFormScreen'
  | 'RootTab'
  | 'RegisterScreen1';

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'white',
  },
};
const Navigation = () => {
  const Stack = createNativeStackNavigator<ParamListBase>();
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const screens = [{name: 'RegisterScreen', component: RegisterScreen}];
  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        setUser(user);
      }
      setLoadingUser(false);
    });

    return unsubscribe;
  }, []);
  let initialRouteName: ScreenName = 'RootTab';
  if (!user) {
    initialRouteName = 'RegisterScreen1';
  }
  return (
    <NavigationContainer theme={MyTheme}>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{headerShown: false}}>
        {screens.map(({name, component}) => (
          <Stack.Screen key={name} name={name} component={component} />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;

const styles = StyleSheet.create({});
