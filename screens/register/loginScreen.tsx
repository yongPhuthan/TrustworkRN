// LoginScreen.tsx
import {faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {yupResolver} from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useState} from 'react';
import {Controller, useForm, useWatch} from 'react-hook-form';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Button, TextInput, ActivityIndicator} from 'react-native-paper';
import * as yup from 'yup';
import {ParamListBase} from '../../types/navigationType';

interface Props {
  navigation: StackNavigationProp<ParamListBase, 'LoginScreen'>;
}
const schema = yup.object().shape({
  email: yup
    .string()
    .email('รูปแบบอีเมลล์ไม่ถูกต้อง')
    .required('กรุณากรอกอีเมลล์'),
  password: yup.string().required('กรุณากรอกรหัสผ่าน'),
});
const LoginScreen = ({navigation}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const {
    handleSubmit,
    control,
    formState: {isValid, isDirty, errors},
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: yupResolver(schema),
  });
  const email = useWatch({control, name: 'email'});
  const password = useWatch({control, name: 'password'});
  const handleLogin = async () => {
    setIsLoading(true);

    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password,
      );
      const user = userCredential.user;
      const token = await user.getIdToken();
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
      Alert.alert('Login Error', 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');

      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{marginTop: 10, paddingHorizontal: 10}}>
      {/* Back Arrow Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <FontAwesomeIcon icon={faArrowLeft} size={26} color="#5C5F62" />
      </TouchableOpacity>
      <View
        style={{marginTop: 40, paddingHorizontal: 20, alignContent: 'center'}}>
        <Text style={styles.title}>TRUSTH</Text>
        <Text style={styles.subtitle}>เข้าสู่ระบบ</Text>

        <Controller
          name="email"
          control={control}
          render={({field: {onBlur, onChange, value}, fieldState: {error}}) => (
            <View style={{marginBottom: 20}}>
              <TextInput
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                error={!!error}
                label={'อีเมล'}
                mode="outlined"
              />
            </View>
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({field: {onBlur, onChange, value}, fieldState: {error}}) => (
            <View style={{marginBottom: 20}}>
              <TextInput
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={!!error}
                secureTextEntry={!passwordVisible}
                autoCapitalize="none"
                keyboardType="default"
                label={'รหัสผ่าน'}
                mode="outlined"
                right={
                  <TextInput.Icon
                    icon={passwordVisible ? 'eye-off' : 'eye'}
                    onPress={togglePasswordVisibility}
                  />
                }
              />
              {error && <Text style={styles.errorText}>{error.message}</Text>}
            </View>
          )}
        />

        <Button
          mode="contained"
          style={{
            marginTop: 20,
            borderRadius: 4,
          }}
          
          // style={[
          //   styles.pressable,
          //   styles.getStartedButton,
          //   !isValid && styles.disabledButton,
          // ]}
          loading={isLoading}
          onPress={handleLogin}
          disabled={!isValid || isLoading}>
                      <Text style={styles.pressableText}>เข้าสู่ระบบ</Text>

        </Button>
      </View>
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
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
  pressable: {
    width: '100%',
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
