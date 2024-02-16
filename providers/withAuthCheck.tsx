// withAuthCheck.tsx
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import React, {ComponentType, useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import UserContext from './UserContext';

function withAuthCheck<T>(WrappedComponent: ComponentType<T>) {
  return (props: T) => {
    const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
    const [loading, setLoading] = useState(true);
    const [initialRouteName, setInitialRouteName] = useState(''); // Default initial route

    useEffect(() => {
      console.log('Setting up auth state listener');
      const unsubscribe = auth().onAuthStateChanged(currentUser => {
        if (currentUser) {
          setUser(currentUser);
          setLoading(false);
          // setInitialRouteName(currentUser ? 'CreateCompanyScreen' : 'FirstAppScreen');

          setInitialRouteName(
            currentUser ? 'DashboardQuotation' : 'FirstAppScreen',
          );
        } else {
          setUser(null);
          setInitialRouteName('FirstAppScreen');
          setLoading(false);
        }
      });

      return () => {
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
