import React, {useState, useContext, useEffect, useMemo} from 'react';
import {
  View,
  StyleSheet,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {Text} from 'react-native-paper';

import {WebView} from 'react-native-webview';
import {ThemeProvider, Icon} from '@rneui/themed';
import {Share} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {Store} from '../../redux/store';
import {HOST_URL} from '@env';
import {ParamListBase} from '../../types/navigationType';
import {
  FAB,
  IconButton,
  Button,
  BottomNavigation,
  AnimatedFAB,
  Appbar,
} from 'react-native-paper';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faBell,
  faCog,
  faCogs,
  faPlus,
  faSheetPlastic,
  faBars,
  faSeedling,
  faPaperPlane,
} from '@fortawesome/free-solid-svg-icons';
interface Props {
  navigation: StackNavigationProp<ParamListBase, 'DocViewScreen'>;
  route: RouteProp<ParamListBase, 'DocViewScreen'>;
}

// ... rest of your DocViewScreen component ...

const DocViewScreen = ({navigation, route}: Props) => {
  const QuotationWebView = ({url}) => {
    return <WebView source={{uri: url}} />;
  };

  const ContractWebView = ({url}) => {
    return (
      <ScrollView onScroll={onScroll}>
        <WebView source={{uri: url}} />
        {/* Additional content if any */}
      </ScrollView>
    );
  };
  const {
    state: {isEmulator},
    dispatch,
  }: any = useContext(Store);
  const [index, setIndex] = React.useState(0);
  const QuotationRoute = () => (
    <QuotationWebView url={`https://www.google.com`} />
  );
  const ContractRoute = () => (
    <ContractWebView url={`https://www.google.com`} />
  );

  const [routes] = React.useState([
    {key: 'quotation', title: 'เพจ', focusedIcon: 'web'},
    {
      key: 'contracts',
      title: 'เอกสาร',
      focusedIcon: 'file-document-outline',
    },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    quotation: QuotationRoute,
    contracts: ContractRoute,
  });

  const handlePress = route => {
    route.onPress();
    setIndex(route.findIndex(r => r === route));
  };
  const [isExtended, setIsExtended] = React.useState(true);

  const {id} = route.params;
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const firstPart = id?.substring(0, 8);

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: url,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
        } else {
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error || 'เกิดข้อผิดพลาด');
    }
  };
  const backHome = () => {
    navigation.navigate('DashboardQuotation');
  };

  const onScroll = ({nativeEvent}) => {
    const currentScrollPosition =
      Math.floor(nativeEvent?.contentOffset?.y) ?? 0;

    setIsExtended(currentScrollPosition <= 0);
  };

  return (
    <>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <>
          <Appbar.Header elevated style={{
            backgroundColor:'white'
          }} mode='center-aligned' >
            <Appbar.BackAction onPress={backHome} />
            <Appbar.Content  mode='center-aligned' titleStyle={{
              fontSize:18
            }} title="" />
          </Appbar.Header>
          <View style={{flex: 1}}>
            {/* <ScrollView onScroll={onScroll}> */}

            <BottomNavigation
              navigationState={{index, routes}}
              onIndexChange={setIndex} // Function to handle changing tabs
              renderScene={renderScene} // Function to render tab content
            />
            <AnimatedFAB
              icon="navigation-variant"
              label="ส่งให้ลูกค้า"
              color="white"
              onPress={handleShare}
              extended={isExtended}
              style={[styles.fabStyle]}
              animateFrom="right"
            />
            {/* </ScrollView> */}
          </View>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  shareButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#0c5caa',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 5,
    elevation: 2, // for Android
    shadowColor: '#000', // for iOS
    shadowOffset: {width: 0, height: 2}, // for iOS
    shadowOpacity: 0.25, // for iOS
    shadowRadius: 3.84, // for iOS
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    marginTop: 1,
  },
  buttonHomeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: 'black',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: 'white',
    marginLeft: 10,
  },
  buttonRow: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    height: 70,
    backgroundColor: 'white',
    letterSpacing: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  cardStyle: {
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
    // Shadow for iOS
    shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    shadowOpacity: 0.25,
    // shadowRadius: 3.84,
  },
  homeButton: {
    backgroundColor: '#0c5caa',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 5,
    width: 200,
    elevation: 2, // for Android
    shadowColor: '#000', // for iOS
    shadowOffset: {width: 0, height: 2}, // for iOS
    shadowOpacity: 0.25, // for iOS
    shadowRadius: 3.84, // for iOS
  },
  shareButton: {
    backgroundColor: '#0c5caa',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 5,
    elevation: 2, // for Android
    shadowColor: '#000', // for iOS
    shadowOffset: {width: 0, height: 2}, // for iOS
    shadowOpacity: 0.25, // for iOS
    shadowRadius: 3.84, // for iOS
  },
  homeButtonWhite: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 30,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    borderWidth: 0.5,
    elevation: 2, // for Android
    shadowColor: '#000', // for iOS
    shadowOffset: {width: 0, height: 2}, // for iOS
    shadowOpacity: 0.25, // for iOS
    shadowRadius: 3.84, // for iOS
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  outlinedButton: {
    borderColor: '#1b52a7', // Border color
    borderWidth: 1, // Border width
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5, // Vertical padding
  },
  buttonTextOutlined: {
    color: '#1b52a7', // Text color matching the border
    fontSize: 18,
  },
  fabStyle: {
    bottom: 100,
    right: 20,
    position: 'absolute',
    backgroundColor: '#1b52a7',
  },
});
export default DocViewScreen;
