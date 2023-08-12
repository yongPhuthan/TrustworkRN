import React, {useState, useEffect} from 'react';

import {StyleSheet} from 'react-native';
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

  ];

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      setUser(user);
      setLoadingUser(false);
    });

    return unsubscribe;
  }, []);

  const initialRouteName: ScreenName = user
    ? 'RegisterScreen'
    : 'HomeScreen';

  return (
    <NavigationContainer theme={Theme}>
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
