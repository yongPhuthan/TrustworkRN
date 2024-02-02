import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import CreateCompanyScreen from '../screens/register/createcompanyScreen';
import {useNavigation} from '@react-navigation/native';
import {useUser} from '../providers/UserContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {HeaderBackButton} from '@react-navigation/elements';
import firebase from '../firebase';
import {
  Audit,
  ProductItem,
  ParamListBase,
  ScreenItem,
  ScreenName,
} from '../types/navigationType';
import Quotation from '../screens/quotation/create';
import AddProductForm from '../screens/products/addProduct';
import AddCustomer from '../screens/customer/addCustomer';
import DocViewScreen from '../screens/quotation/webview';
import DefaultContract from '../screens/contract/defaultContract';
import ExistingProducts from '../screens/products/existingProducts';

import AddExistProduct from '../screens/products/addExistProduct';
import EditSetting from '../screens/setting/editSetting';
import EditQuotation from '../screens/quotation/edit';
import ContractOption from '../screens/contract/contractOptions';

import Installment from '../screens/utils/installment';
import FirstAppScreen from '../screens/register/firstAppScreen';
import LoginScreen from '../screens/register/loginScreen';
import SettingsScreen from '../screens/setting/setting';
import Dashboard from '../screens/quotation/dashboard';
import ExistingWorkers from '../screens/workers/existing';
import AddNewWorker from '../screens/workers/addNew';
import RegisterScreen from '../screens/register/registerScreen';
import EditDefaultContract from '../screens/contract/edit/editDefaultContract';
import CreateContractScreen from '../screens/contract/createContractScreen';
import Selectworks from '../screens/submit/selectworks';
import SendWorks from '../screens/submit/sendWorks';
import DashboardDrawer from './dashboardDrawer';
import ExistingContract from '../screens/contract/existingContract';
import DashboardContract from '../screens/contract/dashboard';
import TopUpScreen from '../screens/utils/topup';
// import BootSplash from "react-native-bootsplash";


const Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'white',
  },
};

const Navigation = ({initialRouteName}) => {
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
            headerShown: true,
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
            headerShown: true,
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
            headerShown: true,
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
            headerShown: true,
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
          name="ExistingWorkers"
          component={ExistingWorkers}
          options={{
            ...commonScreenOptions,
            headerShown: true,
            title: 'เลือกทีมผู้ติดตั้ง',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
        <Stack.Screen
          name="AddNewWorker"
          component={AddNewWorker}
          options={{
            ...commonScreenOptions,
            headerShown: true,
            title: 'เลือกทีมผู้ติดตั้ง',
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
            headerShown: true,
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
            headerShown: true,
            title: 'รายละเอียดสัญญา',
            headerBackTitleVisible: false,

            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
         <Stack.Screen
          name="DashboardContract"
          component={DashboardContract}
          options={{
            ...commonScreenOptions,
            headerShown: true,
            title: 'รายการสัญญา',
            headerBackTitleVisible: false,

            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
        <Stack.Screen name="CreateContractScreen" 
         options={{
          ...commonScreenOptions,
          headerShown: true,
          title: 'เริ่มทำสัญญา',
          headerBackTitleVisible: false,

          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: 'black',
        }}
        component={CreateContractScreen} />

       
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;

const styles = StyleSheet.create({});
