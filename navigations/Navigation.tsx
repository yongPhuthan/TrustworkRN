import React, {useState, useEffect} from 'react';
import {StyleSheet, ActivityIndicator, View} from 'react-native';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import RegisterScreen from '../screens/register/registerScreen';
import firebase from '../firebase';
import {
  Audit,
  ProductItem,
  ParamListBase,
  ScreenItem,
  ScreenName,
} from '../types/navigationType';
import HomeScreen from '../screens/homeScreen';
import Quotation from '../screens/quotation/create';
import AddProductForm from '../screens/products/addProduct';
import AddCustomer from '../screens/customer/addCustomer';
import SelectAudit from '../screens/products/audits/selectAudits';
import SelectContract from '../screens/contract/selectContract';
import DocViewScreen from '../screens/quotation/webview';
import DefaultContract from '../screens/contract/defaultContract';
import ExistingProducts from '../screens/products/existingProducts';
import EditProductForm from '../screens/products/editProduct';
import AddExistProduct from '../screens/products/addExistProduct';
import EditSetting from '../screens/setting/editSetting';
import EditQuotation from '../screens/quotation/edit';
import ContractOption from '../screens/contract/contractOptions';
import SignatureScreen from '../screens/utils/signature';
import ExistingSignature from '../screens/utils/existingSignature';
import Installment from '../screens/utils/installment';
import FirstAppScreen from '../screens/register/firstAppScreen';
import LoginScreen from '../screens/register/loginScreen';

const Theme = {
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

  const screens: ScreenItem[] = [
    {name: 'RegisterScreen', component: RegisterScreen},
    {name: 'HomeScreen', component: HomeScreen},
    {name: 'DocViewScreen', component: DocViewScreen},
    {name: 'FirstAppScreen', component: FirstAppScreen},
    {name: 'LoginScreen', component: LoginScreen},



  ];

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      setUser(user);
      setLoadingUser(false);
    });

    return unsubscribe;
  }, []);
  if (loadingUser) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  const initialRouteName: ScreenName = user ? 'HomeScreen' : 'FirstAppScreen';
  console.log('USER',user)
  return (
    <NavigationContainer theme={Theme}>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{headerShown: false}}>
        {screens.map(({name, component}) => (
          <Stack.Screen key={name} name={name} component={component} />
        ))}
        <Stack.Screen
          name="CreateQuotation"
          component={Quotation}
          options={{
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
          name="Installment"
          component={Installment}
          options={{
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
          name="ExistingProduct"
          component={ExistingProducts}
          options={{
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
          name="AddCustomer"
          component={AddCustomer}
          options={{
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
          name="ContractOptions"
          component={ContractOption}
          options={{
            headerShown: true,
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
