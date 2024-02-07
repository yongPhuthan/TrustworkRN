import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {Provider} from 'react-native-paper';
import Navigation from './navigations/navigation';
import withAuthCheck from './providers/withAuthCheck';

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
