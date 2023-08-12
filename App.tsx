import {View, Text} from 'react-native';
import React, {useState, useEffect} from 'react';
import Navigation from './navigations/navigation';
import {QueryClient, QueryClientProvider, useQuery} from '@tanstack/react-query';
import { Provider } from 'react-native-paper';

type Props = {};

const queryClient = new QueryClient();


const App = () => {
  return (
    <Provider>
    <QueryClientProvider client={queryClient}>
      <Navigation />
    </QueryClientProvider>
    </Provider>
  );
};

export default App;
