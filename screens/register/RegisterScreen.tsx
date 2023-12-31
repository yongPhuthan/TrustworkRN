import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  Image,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Button,
  ActivityIndicator,
  Pressable,
  Dimensions,
  TextInput,
} from 'react-native';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebase from '../../firebase';
import {StackNavigationProp} from '@react-navigation/stack';
import {ParamListBase} from '../../types/navigationType';
import {useUser} from '../../providers/UserContext';
import {
  BACK_END_SERVER_URL,
} from '@env';
const screenWidth = Dimensions.get('window').width;
interface Props {
  navigation: StackNavigationProp<ParamListBase, 'RegisterScreen'>;
}
const RegisterScreen = ({navigation}: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registrationCode, setRegistrationCode] = useState('');
  const [userLoading, setUserLoading] = useState(false);
  const user = useUser();

  const isButtonDisabled =
    !email ||
    !password ||
    !confirmPassword ||
    !registrationCode ||
    password !== confirmPassword;

  const [error, setError] =
    useState<FirebaseAuthTypes.NativeFirebaseAuthError | null>(null);

  const signUpEmail = async () => {
    setUserLoading(true);
    await AsyncStorage.setItem('userEmail', email);
    await AsyncStorage.setItem('userPassword', password);

    if (password !== confirmPassword) {
      setError({
        code: 'auth/passwords-not-matching',
        message: 'รหัสผ่านไม่ตรงกัน',
        userInfo: {
          authCredential: null,
          resolver: null,
        },
        name: 'FirebaseAuthError',
        namespace: '',
        nativeErrorCode: '',
        nativeErrorMessage: '',
      });
      setUserLoading(false);
      return;
    }

    const docRef = firebase
      .firestore()
      .collection('registrationCodes')
      .doc(registrationCode);
    const doc = await docRef.get();
    if (!doc.exists) {
      setError({
        code: 'auth/invalid-registration-code',
        message: 'รหัสลงทะเบียนไม่ถูกต้อง',
        userInfo: {
          authCredential: null,
          resolver: null,
        },
        name: 'FirebaseAuthError',
        namespace: '',
        nativeErrorCode: '',
        nativeErrorMessage: '',
      });
      setUserLoading(false);

      return;
    }

    if (doc.data()?.used) {
      setError({
        code: 'auth/registration-code-used',
        message: 'รหัสลงทะเบียนนี้ถูกใช้แล้ว',
        userInfo: {
          authCredential: null,
          resolver: null,
        },
        name: 'FirebaseAuthError',
        namespace: '',
        nativeErrorCode: '',
        nativeErrorMessage: '',
      });
      setUserLoading(false);

      return;
    }
    try {
      await docRef.update({used: true});
      const userCredential = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      if (!user) {
        throw new Error(
          'User creation was successful, but no user data was returned.',
        );
      }
      if (!user || !user.email) {
        console.error('User or user email is not available');
        return;
      }
      try {
        const token = await user.getIdToken(true);

        const response = await fetch(
          `${BACK_END_SERVER_URL}/api/company/createUser`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({email: user.email, uid: user.uid}),
          },
        );
        console.log('response', response);
        if (!response.ok) {
          throw new Error('Failed to create user on the server');
        }
        console.log('responseOK');

        const responseData = await response.json();
        console.log('Server response:', responseData);
        navigation.navigate('CreateCompanyScreen');

        setUserLoading(false);
        // Proceed with additional client-side logic if needed
      } catch (serverError) {
        Alert.alert(
          'เกิดข้อผิดพลาด',
          `Server-side user creation failed:, ${serverError}`, 
          [{text: 'OK', onPress: () =>         setUserLoading(false)
        }],
          {cancelable: false},
        );
        // Handle server-side error
      }
    } catch (error) {
      let errorMessage = '';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'อีเมลล์นี้ถูกสมัครสมาชิกไปแล้ว';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'กรอกอีเมลล์ไม่ถูกต้อง';
      }
      setError({...error, message: errorMessage});
      setUserLoading(false);
    }
  };

  return (
    <SafeAreaView style={{marginTop: 10, paddingHorizontal: 10}}>
      {/* Add your input fields... */}
      <View style={{marginTop: 40, paddingHorizontal: 40}}>
        <Text style={styles.title}>สมัครสมาชิก</Text>
        <Text>อีเมลล์</Text>
        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <Text>รหัสผ่าน</Text>
        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <Text>ยืนยันรหัสผ่าน</Text>
        <TextInput
          placeholder="Confirm Password"
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <Text>code ลงทะเบียน</Text>

        <TextInput
          placeholder="Code ลงทะเบียน"
          style={styles.input}
          value={registrationCode}
          onChangeText={setRegistrationCode}
        />
        {error && <Text style={styles.errorText}>{error.message}</Text>}

        <Pressable
          style={[
            styles.pressable,
            styles.getStartedButton,
            isButtonDisabled && styles.disabledButton,
          ]}
          onPress={signUpEmail}
          disabled={isButtonDisabled}>
          {userLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.pressableText}>ลงทะเบียน</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  button: {
    color: '#FFFFFF',
    borderRadius: 5,
    marginTop: 20,
    width: 100,
    height: 50, // Adjust as necessary
    padding: 10, // Adjust as necessary
  },

  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    borderRadius: 5,
    marginVertical: 10,
    height: 40,
    borderWidth: 0.5,
    borderColor: 'black',
    paddingHorizontal: 10,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
  loginButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    width: screenWidth - 50,
    height: 48,
    borderRadius: 10,
  },
  pressable: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 4,
    marginVertical: 20,
  },
  getStartedButton: {
    backgroundColor: '#012b20',
  },

  pressableText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  pressableTextLogin: {
    color: '#5C5F62',
    fontSize: 16,
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
export default RegisterScreen;
