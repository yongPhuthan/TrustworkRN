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
  Dimensions,
  TextInput,
} from 'react-native';
import {CheckBox} from '@rneui/themed';
import CryptoJS from 'crypto-js';
import React, {useState, useEffect} from 'react';
import {
  MultipleSelectList,
  SelectList,
} from 'react-native-dropdown-select-list';
import firestore from '@react-native-firebase/firestore';
import firebase, {
  testFirebaseConnection,
  testFunctionsConnection,
} from '../../firebase';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faCloudUpload, faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import {
  launchImageLibrary,
  MediaType,
  ImageLibraryOptions,
  ImagePickerResponse,
} from 'react-native-image-picker';
import {useMutation} from '@tanstack/react-query';
import {S3Client} from '@aws-sdk/client-s3';

import storage from '@react-native-firebase/storage';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {v4 as uuidv4} from 'uuid';

import {
  HOST_URL,
  CLOUDFLARE_WORKER_DEV,
  PROJECT_FIREBASE,
  CLOUDFLARE_WORKER,
  CLOUDFLARE_R2_BUCKET_BASE_URL,
  CLOUDFLARE_DIRECT_UPLOAD_URL,
} from '@env';
import {ParamListBase} from '../../types/navigationType';
import RNFS from 'react-native-fs';

import {StackNavigationProp} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  navigation: StackNavigationProp<ParamListBase, 'RegisterScreen'>;
}

const screenWidth = Dimensions.get('window').width;
const createCompanySeller = async ({data, uid}) => {
  if (!uid) {
    throw new Error('User UID is not provided.');
  }
  try {
    const response = await fetch(
      `http://${HOST_URL}:5001/${PROJECT_FIREBASE}/asia-southeast1/createCompanySeller`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${uid}`,
        },
        body: JSON.stringify({data}),
      },
    );
    console.log('Response:', response.status);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return;
  } catch (error) {
    console.error(error);
    throw new Error('There was an error processing the request');
  }
};

const RegisterScreen = ({navigation}: Props) => {
  const [bizName, setBizName] = useState('');
  const [companyName, setCompanyName] = useState<string>('');
  const [officeTel, setOfficeTel] = useState<string>('');
  const [mobileTel, setMobileTel] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [taxID, setTaxID] = useState<string>('');
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registrationCode, setRegistrationCode] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [bizType, setBizType] = useState('individual');
  const [selectedCategories, setSelectedCategories] = useState<object[]>([]);
  const [isImageUpload, setIsImageUpload] = useState(false);
  const [userPosition, setUserPosition] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [userLastName, setUserLastName] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [companyNumber, setCompanyNumber] = useState<string>('');
  const windowWidth = Dimensions.get('window').width;
  const [userLoading, setUserLoading] = useState(false);
  const [error, setError] =
    useState<FirebaseAuthTypes.NativeFirebaseAuthError | null>(null);
  const isNextDisabledPage1 =
    !bizName || !userName || !userLastName || !selectedCategories.length;
  const isNextDisabledPage2 = !address || !mobileTel;
  const isNextDisabledPage3 =
    !email || !password || !confirmPassword || !registrationCode;

  const categories: object[] = [
    {key: '1', value: 'Mobiles', disabled: true},
    {key: '2', value: 'อลูมิเนียม'},
    {key: '3', value: 'ฝ้าซีลาย'},
    {key: '4', value: 'Computers', disabled: true},
    {key: '5', value: 'งานเหล็กลังคา'},
    {key: '6', value: 'งานกระเบื้อง'},
    {key: '7', value: 'งานปูน'},
  ];
  const handleNextPage = () => {
    setPage(page + 1);
  };
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const {mutate, isLoading, isError} = useMutation(createCompanySeller, {
    onSuccess: () => {
      navigation.navigate('HomeScreen');
    },
    onError: (error: any) => {
      console.error('There was a problem calling the function:', error);
      console.log(error.response);
    },
  });

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

    await docRef.update({used: true});

    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        const user = userCredential.user;
        if (!user && !userCredential) {
          setUserLoading(false);

          throw new Error(
            'User creation was successful, but no user data was returned.',
          );

        }else{
          const flagRef = firebase.firestore().collection('completionFlags').doc(user.uid);
          flagRef.onSnapshot((snapshot) => {
              if (snapshot.exists && snapshot.data()?.completed) {
                  handleFunction(user.uid);
                  setUserLoading(false);
                  flagRef.onSnapshot(() => {});
              }
          });

        }

      })
      .catch(error => {
        let errorMessage = '';
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'อีเมลล์นี้ถูกสมัครสมาชิกไปแล้ว';
        }

        if (error.code === 'auth/invalid-email') {
          errorMessage = 'กรอกอีเมลล์ไม่ถูกต้อง';
        }

        setError({...error, message: errorMessage});
      });
    setUserLoading(false);
  };

  const handleFunction = async uid => {
    const data = {
      id: uuidv4(),
      bizName,
      userName,
      userLastName,
      userPosition: userPosition === '' ? 'individual' : userPosition,
      rules: [selectedCategories],
      address,
      officeTel,
      mobileTel,
      bizType,
      logo: logo || 'logo',
      companyNumber,
    };
    console.log(data);
    mutate({data, uid});
  };



  async function uriToBlob(uri) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        // Return the blob
        resolve(xhr.response);
      };
      xhr.onerror = function () {
        // Reject with error
        reject(new Error('URI to Blob failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
  }
  const handleLogoUpload = () => {
    console.log('POADIND')
    setIsImageUpload(true);
    const options: ImageLibraryOptions = {
      mediaType: 'photo' as MediaType,
    };
    const uploadImageToCloudflare = async (imagePath: string) => {
      if (!imagePath) {
        console.log('No image path provided');
        return;
      }

      const filename = imagePath.substring(imagePath.lastIndexOf('/') + 1);
      const fileType = imagePath.substring(imagePath.lastIndexOf('.') + 1);
      const blob = (await uriToBlob(imagePath)) as Blob;
      const CLOUDFLARE_ENDPOINT = __DEV__
        ? CLOUDFLARE_WORKER_DEV
        : CLOUDFLARE_WORKER;

      let contentType = '';
      switch (fileType.toLowerCase()) {
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg';
          break;
        case 'png':
          contentType = 'image/png';
          break;
        default:
          console.error('Unsupported file type:', fileType);
          return;
      }

      try {
        const response = await fetch(`${CLOUDFLARE_ENDPOINT}${filename}`, {
          method: 'POST',
          headers: {
            'Content-Type': contentType,
          },
          body: blob,
        });

        if (!response.ok) {
          const text = await response.text();
          console.error('Server responded with:', text);
          throw new Error('Server error');
        }
        let data;
        try {
          const imageUrl = response.url;
          console.log('Image uploaded successfully. URL:', imageUrl);
          return imageUrl;
        } catch (error) {
          console.error('Failed to parse JSON:', error);
          throw new Error('Failed to parse response');
        }
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
      }
    };

    launchImageLibrary(options, async (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        setIsImageUpload(false);

      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
        setIsImageUpload(false);

      } else if (response.assets && response.assets.length > 0) {
        const source = {uri: response.assets[0].uri ?? null};
        console.log('Image source:', source);


        if (source.uri) {
          try {
            const cloudflareUrl: string | undefined =
              await uploadImageToCloudflare(source.uri);
            setLogo(cloudflareUrl || null);
            setIsImageUpload(false);
          } catch (error) {
            console.error('Error uploading image to Cloudflare:', error);
            setIsImageUpload(false);
          }
        }
      }
    });
  };
  console.log('logo', logo);
  useEffect(() => {
    testFunctionsConnection();
  }, []);
  const renderPage = () => {
    switch (page) {
      case 1:
        return (
          <ScrollView style={{marginTop: 10, paddingHorizontal: 10}}>
            <Text style={styles.title}> ลงทะเบียนธุรกิจ</Text>
            <TouchableOpacity
              style={{
                alignItems: 'center',
                marginBottom: 20,
                borderColor: 'gray',
                borderWidth: 1,
                borderRadius: 10,
                borderStyle: 'dotted',
                marginHorizontal: 100,
                padding: 10,
              }}
              onPress={handleLogoUpload}>
              {isImageUpload ? (
                <ActivityIndicator size="small" color="gray" />
              ) : logo ? (
                <Image
                  source={{uri: logo}}
                  style={{width: 100, aspectRatio: 2, resizeMode: 'contain'}}
                />
              ) : (
                <View>
                  <FontAwesomeIcon
                    icon={faCloudUpload}
                    style={{marginVertical: 5, marginHorizontal: 50}}
                    size={32}
                    color="gray"
                  />
                  <Text style={{textAlign: 'center', color: 'gray'}}>
                    อัพโหลดโลโก้
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <Text>ชื่อธุรกิจ - บริษัท</Text>

            <TextInput
              placeholder="ชื่อธุรกิจ - ชื่อบริษัท"
              style={styles.input}
              value={bizName}
              onChangeText={setBizName}
            />

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <View style={{flex: 0.45}}>
                <Text>ชื่อจริง</Text>
                <TextInput
                  placeholder="ชื่อจริง"
                  style={styles.input}
                  value={userName}
                  onChangeText={setUserName}
                />
              </View>
              <View style={{flex: 0.45}}>
                <Text>นามสกุล</Text>
                <TextInput
                  placeholder="นามสกุล"
                  style={styles.input}
                  value={userLastName}
                  onChangeText={setUserLastName}
                />
              </View>
            </View>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <CheckBox
                title="บุคคลธรรมดา"
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                checked={bizType === 'individual'}
                onPress={() => setBizType('individual')}
              />

              <CheckBox
                title="บริษัท-หจก"
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                checked={bizType === 'business'}
                onPress={() => setBizType('business')}
              />
            </View>
            {bizType === 'business' && (
              <TextInput
                placeholder="ตำแหน่งในบริษัท"
                style={styles.input}
                value={userPosition}
                onChangeText={setUserPosition}
              />
            )}
            <SelectList
              setSelected={(val: object[]) => setSelectedCategories(val)}
              data={categories}
              save="value"
              placeholder={'เลือกหมวดหมู่ธุรกิจ'}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: 10,
              }}>
              <TouchableOpacity
                disabled={isNextDisabledPage1}
                onPress={handleNextPage}
                style={[
                  styles.button,
                  {
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: isNextDisabledPage1
                      ? '#D3D3D3'
                      : '#005751',
                  },
                ]}>
                <Text style={styles.buttonText}>ไปต่อ</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );
      case 2:
        return (
          <ScrollView style={{marginTop: 10, paddingHorizontal: 10}}>
            {/* Add your input fields... */}
            <Text style={styles.title}> ลงทะเบียนธุรกิจ</Text>
            <Text>ที่อยู่ร้าน</Text>
            <TextInput
              placeholder="ที่อยู่ร้าน"
              style={[styles.input, {height: 100}]} // Set height as needed
              numberOfLines={3}
              value={address}
              onChangeText={setAddress}
            />
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text>เบอร์โทรบริษัท</Text>
              <Text style={{marginRight: 80}}>เบอร์มือถือ</Text>
            </View>

            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <View style={{flex: 0.45}}>
                <TextInput
                  keyboardType="number-pad"
                  placeholder="02-000-0000"
                  style={styles.input}
                  value={officeTel}
                  onChangeText={setOfficeTel}
                />
              </View>
              <View style={{flex: 0.45}}>
                <TextInput
                  placeholder="090-000-0000"
                  keyboardType="number-pad"
                  style={styles.input}
                  value={mobileTel}
                  onChangeText={setMobileTel}
                />
              </View>
            </View>
            <Text>เลขภาษี(ถ้ามี)</Text>
            <TextInput
              placeholder="xxx-xxx-xxx-xxx"
              keyboardType="number-pad"
              style={styles.input}
              value={taxID}
              onChangeText={setTaxID}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 50,
              }}>
              <TouchableOpacity
                onPress={handlePrevPage}
                style={[
                  styles.button,
                  {
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'white',
                  },
                ]}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <FontAwesomeIcon icon={faArrowLeft} color="#005751" />
                  <Text style={{color: '#005751', marginLeft: 10}}>
                    ย้อนกลับ
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={isNextDisabledPage2}
                onPress={handleNextPage}
                style={[
                  styles.button,
                  {
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: isNextDisabledPage2
                      ? '#D3D3D3'
                      : '#005751',
                  },
                ]}>
                <Text style={styles.buttonText}>ไปต่อ</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );
      case 3:
        return (
          <SafeAreaView style={{marginTop: 10, paddingHorizontal: 10}}>
            {/* Add your input fields... */}
            <Text style={styles.title}> ลงทะเบียนธุรกิจ</Text>
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

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 50,
              }}>
              <TouchableOpacity
                onPress={handlePrevPage}
                style={[
                  styles.button,
                  {
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'white',
                  },
                ]}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <FontAwesomeIcon icon={faArrowLeft} color="#005751" />
                  <Text style={{color: '#005751', marginLeft: 10}}>
                    ย้อนกลับ
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={signUpEmail}
                // disabled={isNextDisabledPage3}
                style={[
                  styles.button,
                  {
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: isNextDisabledPage3
                      ? '#D3D3D3'
                      : '#005751',
                  },
                ]}>
                {isLoading || userLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>บันทึก</Text>
                )}
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        );
      default:
        return null;
    }
  };
  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <View style={{marginTop: 40, paddingHorizontal: 20}}>{renderPage()}</View>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

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
    borderRadius: 10,
    marginVertical: 10,
    height: 50,
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
});
