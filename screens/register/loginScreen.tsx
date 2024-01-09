// LoginScreen.tsx
import React, {useState} from 'react';
import {
  View,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  TouchableOpacity,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {HOST_URL, BACK_END_SERVER_URL, PROJECT_FIREBASE} from '@env';
import {StackNavigationProp} from '@react-navigation/stack';
import {ParamListBase} from '../../types/navigationType';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  faAlignLeft,
  faArrowCircleLeft,
  faArrowLeft,
  faArrowLeftLong,
  faArrowRotateBack,
  faBackward,
  faClose,
  faLeftLong,
  faLeftRight,
  faTentArrowTurnLeft,
} from '@fortawesome/free-solid-svg-icons';
interface Props {
  navigation: StackNavigationProp<ParamListBase, 'LoginScreen'>;
}
const LoginScreen = ({navigation}: Props) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Set up a background task or a timer to refresh the token every hour
    const interval = setInterval(async () => {
      const user = auth().currentUser;
      if (user) {
        const newToken = await user.getIdToken(true);
        await AsyncStorage.setItem('userToken', newToken);
      }
    }, 3600000);

    return () => clearInterval(interval);
  }, []);
  const isEmailValid = email => {
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(email);
  };

  const isFormValid = isEmailValid(email) && password.length > 0;
//   const handleLogin = async () => {
//     console.log('Check BaKcEnd', BACK_END_SERVER_URL);

//     setIsLoading(true);

//     try {
//       const response = await fetch(`${BACK_END_SERVER_URL}/api/authservice/login`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({email, password}),
//       });

//       const data = await response.json();
//       if (data.token) {
//         await AsyncStorage.setItem('userToken', data.token);
//         navigation.navigate('DashboardQuotation');
//       } else {
//         console.error('Token is undefined after login');
//       }
//     } catch (error) {
//       Alert.alert('Error', error.message);
//     }

//     setIsLoading(false);
//   };

    const handleLogin = async () => {
      setIsLoading(true);

      try {
        const userCredential = await auth().signInWithEmailAndPassword(
          email,
          password,
        );
        const user = userCredential.user;
        const token = await user.getIdToken();
        console.log('Token after login:', token); // Log the token
        if (token) {
          await AsyncStorage.setItem('userToken', token);
          setIsLoading(false);
          navigation.reset({
            index: 0,
            routes: [{name: 'DashboardQuotation'}],
          });
        } else {
          console.error('Token is undefined after login');
          setIsLoading(false);
        }
      } catch (error) {
        Alert.alert('Error', error.message);
        setIsLoading(false);

      }
    };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Arrow Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <FontAwesomeIcon icon={faArrowLeft} size={26} color="#5C5F62" />
      </TouchableOpacity>

      <Text style={styles.title}>Trusthwork</Text>
      <TextInput
        placeholder="อีเมล"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="รหัสผ่าน"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Pressable
        disabled={!isFormValid || isLoading}
        style={[
          styles.button,
          (!isFormValid || isLoading) && styles.buttonDisabled,
        ]}
        onPress={handleLogin}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text
            style={[
              styles.buttonText,
              (!isFormValid || isLoading) && styles.buttonTextDisabled,
            ]}>
            เข้าสู่ระบบ
          </Text>
        )}
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 16,
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 16,
  },
  buttonDisabled: {
    backgroundColor: '#cacaca',
  },
  buttonTextDisabled: {
    color: 'white',
  },
  title: {
    fontSize: 24,
    color: 'black',
    fontWeight: 'bold',
    marginBottom: 32,
  },
  input: {
    width: '90%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  button: {
    width: '90%',
    paddingVertical: 12,
    borderRadius: 4,
    backgroundColor: '#012b20', // Shopify button color
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
