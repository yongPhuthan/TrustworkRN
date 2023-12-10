import React from 'react';
import { Provider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navigation from './navigations/navigation';
import withAuthCheck from './providers/withAuthCheck'; 
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { quotationsValidationSchema,customersValidationSchema, servicesValidationSchema } from './screens/utils/validationSchema';
import * as yup from 'yup';

const queryClient = new QueryClient();

const AuthCheckedNavigation = withAuthCheck(Navigation); 

const App = () => {

  return (
    <Provider>
      <QueryClientProvider client={queryClient}>
     
        <AuthCheckedNavigation /> 
 
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
