import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View
} from 'react-native';
import { useUser } from '../providers/UserContext';
import DefaultContract from '../screens/contract/defaultContract';
import AddCustomer from '../screens/customer/addCustomer';
import AddProductForm from '../screens/products/addProduct';
import ExistingProducts from '../screens/products/existingProducts';
import Quotation from '../screens/quotation/create';
import DocViewScreen from '../screens/quotation/webview';
import CreateCompanyScreen from '../screens/register/createcompanyScreen';
import {
  ParamListBase,
  ScreenItem
} from '../types/navigationType';

import ContractOption from '../screens/contract/contractOptions';
import AddExistProduct from '../screens/products/addExistProduct';
import EditQuotation from '../screens/quotation/edit';
import EditSetting from '../screens/setting/editSetting';

import EditDefaultContract from '../screens/contract/edit/editDefaultContract';
import ExistingContract from '../screens/contract/existingContract';
import FirstAppScreen from '../screens/register/firstAppScreen';
import LoginScreen from '../screens/register/loginScreen';
import RegisterScreen from '../screens/register/registerScreen';
import SettingsScreen from '../screens/setting/setting';
import Selectworks from '../screens/submit/selectworks';
import SendWorks from '../screens/submit/sendWorks';
import Installment from '../screens/utils/installment';
import TopUpScreen from '../screens/utils/topup';
import DashboardDrawer from './dashboardDrawer';
// import BootSplash from "react-native-bootsplash";
import ContractViewScreen from '../screens/contract/webview';


const Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'white',
  },
};

const Navigation = ({initialRouteName}: any) => {
  const Stack = createNativeStackNavigator<ParamListBase>();
  const user = useUser();

  const screens: ScreenItem[] = [
    {name: 'CreateCompanyScreen', component: CreateCompanyScreen},
    {name: 'RegisterScreen', component: RegisterScreen}, // {name: 'HomeScreen',  component: HomeScreen},
    {name: 'DocViewScreen', component: DocViewScreen},
    {name: 'FirstAppScreen', component: FirstAppScreen},
    {name: 'LoginScreen', component: LoginScreen},
    {name: 'DashboardQuotation', component: DashboardDrawer},
  ];

  const commonScreenOptions = {
    headerTitleStyle: {
      fontFamily: 'Sukhumvit Set Bold',
    },
    headerStyle: {
      backgroundColor: '#ffffff',
    },
    headerTintColor: 'black',
  };
  if (!initialRouteName) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={Theme}>
     {/* <NavigationContainer  onReady={() => {
      BootSplash.hide();
     }} theme={Theme}> */}
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          ...commonScreenOptions,
          headerShown: false,
        }}>
        {screens.map(({name, component}) => (
          <Stack.Screen key={name} name={name} component={component} />
        ))}
        <Stack.Screen
          name="CreateQuotation"
          component={Quotation}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'สร้างใบเสนอราคา',
            headerBackTitle: '',

            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
                <Stack.Screen
          name="ContractViewScreen"
          component={ContractViewScreen}
          options={{
            ...commonScreenOptions,
            headerShown: false,
           

            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />

        <Stack.Screen
          name="AddProduct"
          component={AddProductForm}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'เพิ่มรายการ-สินค้า',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
       
         <Stack.Screen
          name="SelectWorks" 
          component={Selectworks}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'แจ้งส่งงานลูกค้า',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
         <Stack.Screen
          name="TopUpScreen" 
          component={TopUpScreen}
          options={{
            ...commonScreenOptions,
            headerShown: true,
            title: 'เติมเครดิต',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
         <Stack.Screen
          name="SendWorks" 
          component={SendWorks}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'แจ้งส่งงานลูกค้า',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
        <Stack.Screen
          name="Installment"
          component={Installment}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'แบ่งงวดชำระ',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />

        <Stack.Screen
          name="AddExistProduct"
          component={AddExistProduct}
          options={{
            ...commonScreenOptions,
            headerShown: true,
            title: 'เพิ่มรายการ-สินค้า',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
        
        <Stack.Screen
          name="EditSetting"
          component={EditSetting}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'แก้ไขข้อมูลธุรกิจ',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
        <Stack.Screen
          name="SettingsScreen"
          component={SettingsScreen}
          options={{
            ...commonScreenOptions,
            headerShown: true,
            title: 'ตั้งค่า',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
        <Stack.Screen
          name="ExistingProduct"
          component={ExistingProducts}
          options={{
            ...commonScreenOptions,
            headerShown: true,
            title: 'เพิ่มรายการ-สินค้า',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
        
       
      
         <Stack.Screen
          name="ExistingContract"
          component={ExistingContract}
          options={{
            ...commonScreenOptions,
            headerShown: true,
            title: 'ตั้งค่าสัญญา',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
      
        <Stack.Screen
          name="AddCustomer"
          component={AddCustomer}
          options={{
            ...commonScreenOptions,
            headerShown: true,
            title: 'เพิ่มลูกค้า',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
       
     
       
        <Stack.Screen
          name="EditQuotation"
          component={EditQuotation}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'แก้ไขเอกสาร',
            headerBackTitleVisible: false,

            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
        {/* <Stack.Screen
          name="DocViewScreen"
          component={DocViewScreen}
          
          options={{
            headerShown: false,
            title: '',
            headerBackTitleVisible: false,

            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        /> */}
        <Stack.Screen
          name="DefaultContract"
          component={DefaultContract}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'รายละเอียดสัญญา',
            headerBackTitleVisible: false,

            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
        <Stack.Screen
          name="EditDefaultContract"
          component={EditDefaultContract}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'แก้ไขรายละเอียดสัญญา',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
        <Stack.Screen
          name="ContractOptions"
          component={ContractOption}
          options={{
            ...commonScreenOptions,
            headerShown: false,
            title: 'รายละเอียดสัญญา',
            headerBackTitleVisible: false,

            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
        


       
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;

const styles = StyleSheet.create({});
