import React, { useState, useContext, useEffect, useMemo } from 'react';
import { View, StyleSheet, Text,TouchableOpacity,ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { ThemeProvider, Icon, Button } from '@rneui/themed';
import { Share } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Store } from '../../redux/store';
import { HOST_URL } from '@env';
import{ParamListBase} from '../../types/navigationType'


interface Props {
  navigation: StackNavigationProp<ParamListBase, 'DocViewScreen'>;
  route: RouteProp<ParamListBase, 'DocViewScreen'>;

}



const DocViewScreen = ({ navigation, route }: Props) => {
  const {
    state: { isEmulator },
    dispatch,
  }: any = useContext(Store);
  const { id } = route.params;
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const firstPart = id?.substring(0, 8);

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: url,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error || 'เกิดข้อผิดพลาด');
    }
  };
  const backHome =()=>{
    navigation.navigate('HomeScreen')
  }

  useEffect(() => {
    if (isEmulator) {
      setUrl(`http://${HOST_URL}:3000/doc/${firstPart}`);
    } else {
      setUrl(`https://www.trustwork.co/doc/${firstPart}`);
    }
    setIsLoading(false);
  }, []);

  return (
    <>
      {isLoading ? (
    <ActivityIndicator/>
      ) : (
        
        <View style={{ flex: 1 }}>
          <WebView source={{ uri: url }} />
          <View style={styles.buttonRow}>
          <Button 
              buttonStyle={styles.homeButtonWhite}
              title="กลับหน้าแรก"
              onPress={backHome}
              titleStyle={styles.buttonHomeText}
              icon={<Icon name="home" type="font-awesome" size={20} color="black" />}
              iconPosition='left'
            />
            <Button 
              buttonStyle={styles.button} 
              onPress={handleShare}
              title="ส่งให้ลูกค้า"
              titleStyle={styles.buttonText}
              icon={<Icon name="send" type="font-awesome" size={22} color="white" />}
              iconRight
            />
          </View>
          {/* <View style={styles.shareButtonContainer}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleShare}>
                <View style={styles.header}>
                  <Text style={styles.buttonText}>ส่งเอกสารให้ลูค้า</Text>
                  <Icon
                    style={styles.icon}
                    name="send"
                    type="font-awesome"
                    size={22}
                    color="white"
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View> */}
        </View>
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
    width: '90%',
    height: 50,
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
    marginHorizontal:5,
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
    color:'black'
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
    letterSpacing:10
  },
  
  homeButton: {
    backgroundColor: '#0c5caa',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 5,
    width:200,
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
    marginHorizontal:5,
    borderRadius: 5,
    borderWidth:0.5,
    elevation: 2, // for Android
    shadowColor: '#000', // for iOS
    shadowOffset: {width: 0, height: 2}, // for iOS
    shadowOpacity: 0.25, // for iOS
    shadowRadius: 3.84, // for iOS
  },
});
export default DocViewScreen;

