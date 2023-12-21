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
// import HomeScreen from '../screens/homeScreen';
import Quotation from '../screens/quotation/create';
import AddProductForm from '../screens/products/addProduct';
import AddCustomer from '../screens/customer/addCustomer';
import SelectAudit from '../screens/products/audits/selectAudits';
import SelectContract from '../screens/contract/selectContract';
import DocViewScreen from '../screens/quotation/webview';
import DefaultContract from '../screens/contract/defaultContract';
import ExistingProducts from '../screens/products/existingProducts';
import EditProductForm from '../screens/products/editProduct';
import EditCustomer from '../screens/customer/editCustomer';

import AddExistProduct from '../screens/products/addExistProduct';
import EditSetting from '../screens/setting/editSetting';
import EditQuotation from '../screens/quotation/edit';
import ContractOption from '../screens/contract/contractOptions';
import SignatureScreen from '../screens/utils/signature';
import ExistingSignature from '../screens/utils/existingSignature';
import Installment from '../screens/utils/installment';
import FirstAppScreen from '../screens/register/firstAppScreen';
import LoginScreen from '../screens/register/loginScreen';
import GalleryUploadScreen from '../screens/products/gallary/create';
import ExistingCategories from '../screens/products/gallary/existing';
import GalleryScreen from '../screens/products/imageGallery';
import SettingsScreen from '../screens/setting/setting';
import Dashboard from '../screens/quotation/dashboard';
import ExistingMaterials from '../screens/products/materials/existing';
import ExistingWorkers from '../screens/workers/existing';
import AddNewWorker from '../screens/workers/addNew';
import AddNewMaterial from '../screens/products/materials/addNew';
import RegisterScreen from '../screens/register/registerScreen';
import EditDefaultContract from '../screens/contract/edit/editDefaultContract';
import CreateContractScreen from '../screens/contract/createContractScreen';
import Selectworks from '../screens/submit/selectworks';
import SendWorks from '../screens/submit/sendWorks';

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
    {name: 'DashboardQuotation', component: Dashboard},
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
            headerShown: true,
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
          name="Signature"
          component={SignatureScreen}
          options={{
            ...commonScreenOptions,
            headerShown: true,
            title: 'เพิ่มลายเซ็นเอกสาร',
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
          name="EditProductForm"
          component={EditProductForm}
          options={{
            ...commonScreenOptions,
            headerShown: true,
            title: 'แก้ไขรายการ-สินค้า',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
        <Stack.Screen
          name="EditCustomerForm"
          component={EditCustomer}
          options={{
            ...commonScreenOptions,
            headerShown: true,
            title: 'แก้ไขลูกค้า',
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
          name="ExistingCategories"
          component={ExistingCategories}
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
          name="GalleryScreen"
          component={GalleryScreen}
          options={{
            ...commonScreenOptions,
            headerShown: true,
            title: 'อัลบั้มผลงาน',
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
        <Stack.Screen
          name="ExistingMaterials"
          component={ExistingMaterials}
          options={{
            ...commonScreenOptions,
            headerShown: true,
            title: 'เลือกวัสดุ-อุปกรณ์ที่ใช้ในงาน',
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
          name="AddNewMaterial"
          component={AddNewMaterial}
          options={{
            ...commonScreenOptions,
            headerShown: true,
            title: 'เพิ่มวัสดุอุปกรณ์ใหม่',
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
          name="ExistingSignature"
          component={ExistingSignature}
          options={{
            ...commonScreenOptions,
            headerShown: true,
            title: 'เซ็นเอกสาร',
            headerBackTitleVisible: false,

            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
        <Stack.Screen
          name="SelectAudit"
          component={SelectAudit}
          options={{
            ...commonScreenOptions,
            headerShown: true,
            title: 'เลือกมาตรฐานการทำงาน',
            headerBackTitleVisible: false,

            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: 'black',
          }}
        />
        <Stack.Screen
          name="SelectContract"
          component={SelectContract}
          options={{
            ...commonScreenOptions,
            headerShown: true,
            title: 'รับทราบข้อกำหนดสัญญา',
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
            headerShown: true,
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

        <Stack.Screen
          name="GalleryUploadScreen"
          component={GalleryUploadScreen}
          options={{
            ...commonScreenOptions,
            headerShown: true,
            title: 'อัพโหลดอัลบั้ม',
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
