import React, {useContext, useState,useEffect} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
  NativeSyntheticEvent,
  NativeScrollEvent,
  View,
} from 'react-native';
import PDFView from 'react-native-view-pdf';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Share} from 'react-native';
import {AnimatedFAB, Appbar, BottomNavigation, FAB} from 'react-native-paper';
import {WebView} from 'react-native-webview';
import {Store} from '../../redux/store';
import {ParamListBase} from '../../types/navigationType';
interface Props {
  navigation: StackNavigationProp<ParamListBase, 'DocViewScreen'>;
  route: RouteProp<ParamListBase, 'DocViewScreen'>;
}

// ... rest of your DocViewScreen component ...

const DocViewScreen = ({navigation, route}: Props) => {
  const QuotationWebView = ({url}: any) => {
    return (
      <SafeAreaView style={{flex: 1}}>
        <WebView source={{uri: url}} />
      </SafeAreaView>
    );
  };

  const ContractWebView = ({ url }: any) => {
    // เลือกคอมโพเนนต์ตามแพลตฟอร์ม
    const Content = Platform.select({
      ios: () => (
        <PDFView
          resource={url}
          resourceType={'url'}
          onLoad={() => console.log(`PDF rendered from URL`)}
          onError={(error) => console.log('Cannot render PDF', error)}
          style={{ flex: 1 }}
        />
      ),
      android: () => (
        <WebView source={{ uri: url }} style={{ flex: 1 }} />
      ),
    });
  
    return (
      <SafeAreaView style={{ flex: 1 }}>
        {Content ? <Content /> : null}
      </SafeAreaView>
    );
  };

  const {
    state: {isEmulator,code},
    dispatch,
  }: any = useContext(Store);

  const [index, setIndex] = React.useState(0);
  const backHome = () => {
    navigation.navigate('DashboardQuotation');
  };
  
  const QuotationRoute = () => (
    <QuotationWebView url={`https://www.trusth.co/preview/${id}?seller=${code}`} />
  );
  const ContractRoute = () => (
    <ContractWebView url={`https://www.trusth.co/preview/doc/${id}?seller=${code}`} />
  );
const HomeRoute = () => {
  useEffect(() => {
    navigation.reset({
      index: 0,
      routes: [{name: 'DashboardQuotation'}],
    })  }, [navigation]);

  // Return null หรือ component ว่างๆ เพื่อป้องกัน warning/error ขณะที่ navigation กำลังทำงาน
  return null;
};

  const [routes] = React.useState([
    {key: 'quotation', title: 'เว็บเพจ', focusedIcon: 'web'},
    {
      key: 'contracts',
      title: 'เอกสาร',
      focusedIcon: 'file-document-outline',
    },
    {
      key: 'home',
      title: 'กลับหน้าแรก',
      focusedIcon: 'home',
    },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    quotation: QuotationRoute,
    contracts: ContractRoute,
    home: HomeRoute,
  });

  const [isExtended, setIsExtended] = React.useState(true);

  const {id} = route.params;
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const firstPart = id?.substring(0, 8);
  React.useEffect(() => {
    // กำหนด URL ตาม tab ที่เลือก
    const baseUrl = 'https://www.trusth.co/preview/';
    const newUrl = index === 0 ? `${baseUrl}${id}` : `${baseUrl}doc/${id}`;
    setUrl(newUrl);
  }, [index, id]);

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `${url}`, // ใช้ URL ที่กำหนดไว้
      });
      // ตรวจสอบผลลัพธ์ของการแชร์...
    } catch (error) {
      console.error(error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถแชร์ได้');
    }
  };

  const onScroll = ({nativeEvent}: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollPosition = Math.floor(nativeEvent.contentOffset.y) ?? 0;

    setIsExtended(currentScrollPosition <= 0);
  };

  return (
    <>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <>
          {/* <Appbar.Header elevated style={{
            backgroundColor:'white'
          }} mode='center-aligned' >
            <Appbar.BackAction onPress={backHome}  />

            <Appbar.Content  mode='center-aligned' titleStyle={{
              fontSize:18
            }} title={
              routes[index].title
            } />
          </Appbar.Header> */}
          <BottomNavigation
            navigationState={{index, routes}}
            onIndexChange={setIndex} // Function to handle changing tabs
            renderScene={renderScene} // Function to render tab content
          />
          <FAB
            style={styles.fabStyle}
            icon="share-variant"
            onPress={handleShare}
            color="white"
          />
        </>
      )}
    </>
  );
};
const {width, height} = Dimensions.get('window');

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
    bottom: height * 0.2,
    right: width * 0.05,
    position: 'absolute',
    backgroundColor: '#1b52a7',
  },
});

export default DocViewScreen;
