import React, {useState, useEffect} from 'react';

import {StyleSheet,ActivityIndicator,View} from 'react-native';
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
  const initialRouteName: ScreenName = user ? 'HomeScreen' : 'RegisterScreen';
console.log('user',user)
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;

const styles = StyleSheet.create({});
