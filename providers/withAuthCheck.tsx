// withAuthCheck.tsx
import React, {useState, useEffect, ComponentType} from 'react';
import {View, ActivityIndicator} from 'react-native';
import firebase from '../firebase';
import {NavigationContainer} from '@react-navigation/native';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import UserContext from './UserContext';

function withAuthCheck<T>(WrappedComponent: ComponentType<T>) {
  return (props: any) => {
    const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
    const [loading, setLoading] = useState(true);
    const [initialRouteName, setInitialRouteName] = useState(''); // Default initial route

    useEffect(() => {
        console.log("Setting up auth state listener");
        const unsubscribe = auth().onAuthStateChanged(currentUser => {
          console.log('Auth State Changed: ', currentUser);
          if(currentUser){
            console.log('currentUser:333 ', currentUser);
            setUser(currentUser);
            setLoading(false);
            setInitialRouteName(currentUser ? 'DashboardQuotation' : 'FirstAppScreen');
          }
          else{
            setUser(null);
            setInitialRouteName('FirstAppScreen');
            setLoading(false);

          }
     
        });
      
        return () => {
          console.log("Cleaning up auth state listener");
          unsubscribe();
        };
      }, []);
      

    if (loading) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    return (
      <UserContext.Provider value={user}>
        <WrappedComponent
          {...(props as T)}
          initialRouteName={initialRouteName}
        />
      </UserContext.Provider>
    );
  };
}

export default withAuthCheck;
