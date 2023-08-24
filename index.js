/**
 * @format
 */

import {AppRegistry, StyleSheet} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {StoreProvider} from './redux/store';
import 'react-native-get-random-values'


const Root = () => {
  return (
      <StoreProvider>
          <App />
      </StoreProvider>
  );
};

AppRegistry.registerComponent(appName, () => Root);

