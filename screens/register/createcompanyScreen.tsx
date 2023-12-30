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
import React, {useState, useEffect, useCallback} from 'react';
import {
  MultipleSelectList,
  SelectList,
} from 'react-native-dropdown-select-list';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faCloudUpload, faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import {
  launchImageLibrary,
  MediaType,
  ImageLibraryOptions,
  ImagePickerResponse,
  Asset,
} from 'react-native-image-picker';
import {useMutation} from '@tanstack/react-query';

import storage from '@react-native-firebase/storage';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {v4 as uuidv4} from 'uuid';

import {
  HOST_URL,
  CLOUDFLARE_WORKER_DEV,
  PROJECT_FIREBASE,
  CLOUDFLARE_WORKER,
  CLOUDFLARE_R2_BUCKET_BASE_URL,
  FIREBASE_STORAGE_PUBLIC_URL,
  CLOUDFLARE_R2_PUBLIC_URL,
  BACK_END_SERVER_URL,
} from '@env';
import {ParamListBase} from '../../types/navigationType';
import {StackNavigationProp} from '@react-navigation/stack';
import {useUser} from '../../providers/UserContext';

interface Props {
  navigation: StackNavigationProp<ParamListBase, 'RegisterScreen'>;
}
interface ImageResponse extends ImagePickerResponse {
  assets?: Asset[];
}
const screenWidth = Dimensions.get('window').width;

const createCompanySeller = async ({data, token}) => {
  if (!token) {
    throw new Error('Auth token is not provided.');
  }

  const API_URL = `${BACK_END_SERVER_URL}/api/company/createCompanySeller`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    console.log('Response:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Network response was not ok: ${errorText}`);
    }
    

    // return await response.json(); // Assuming the response is JSON
  } catch (error) {
    console.error('Error:', error);
    throw new Error('There was an error processing the request');
  }
};

const CreateCompanyScreen = ({navigation}: Props) => {
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
  const [logo, setLogo] = useState<string>('');
  const [bizType, setBizType] = useState('individual');
  const [selectedCategories, setSelectedCategories] = useState<object[]>([]);
  const [isImageUpload, setIsImageUpload] = useState(false);
  const [userPosition, setUserPosition] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [userLastName, setUserLastName] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [companyNumber, setCompanyNumber] = useState<string>('');
  const [responseLog, setResponseLog] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const windowWidth = Dimensions.get('window').width;
  const [userLoading, setUserLoading] = useState(false);
  const user = useUser();
  const [error, setError] =
    useState<FirebaseAuthTypes.NativeFirebaseAuthError | null>(null);
  const isNextDisabledPage1 =
    !bizName || !userName || !userLastName || !selectedCategories.length;
  const isNextDisabledPage2 = !address || !mobileTel;
  const isNextDisabledPage3 =
    !email || !password || !confirmPassword || !registrationCode;

  const CLOUDFLARE_ENDPOINT = __DEV__
    ? CLOUDFLARE_WORKER_DEV
    : CLOUDFLARE_WORKER;

  const categories: object[] = [
    {key: '2', value: 'อลูมิเนียม'},
    {key: '3', value: 'ฝ้าซีลาย'},
    {key: '5', value: 'งานเหล็กลังคา'},
    {key: '6', value: 'งานกระเบื้อง'},
    {key: '7', value: 'งานปูน'},
  ];

  useEffect(() => {
    setCode(Math.floor(100000 + Math.random() * 900000).toString());

  }, []);
  const handleNextPage = () => {
    setPage(page + 1);
  };
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  const slugifyString = (str: string) => {
    return str
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/\./g, '-')
      .replace(/-+/g, '-')
      .replace(/[^a-z0-9-]/g, '-');
  };
  const {mutate, isLoading, isError} = useMutation(createCompanySeller, {
    onSuccess: () => {
      navigation.navigate('DashboardQuotation');
    },
    onError: (error: any) => {
      console.error('There was a problem calling the function:', error);
      console.log(error.response);
    },
  });
  async function getSignedUrl(filename) {
    try {
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/storage/getLogoSignedUrl`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Include authorization headers if required
          },
          body: JSON.stringify({filename}),
        },
      );

      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }

      const data = await response.json();
      return data.signedUrl;
    } catch (error) {
      console.error('Error fetching signed URL:', error);
      throw error;
    }
  }

  async function uploadFileToFirebase(file, signedUrl) {
    try {
      const response = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to upload file to Firebase.');
      }

      console.log('File uploaded successfully.');
    } catch (error) {
      console.error('Error uploading file to Firebase:', error);
      throw error;
    }
  }
  async function handleFileUpload(file) {
    try {
      const filename = 'uploads/' + file.name; // Example path in Firebase storage
      const signedUrl = await getSignedUrl(filename);

      await uploadFileToFirebase(file, signedUrl);
      console.log('File uploaded successfully to Firebase.');
    } catch (error) {
      console.error('Error in file upload process:', error);
    }
  }
  const selectImage = (): void => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo' as MediaType,
      quality: 1,
    };

    launchImageLibrary(options, (response: ImageResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const source = response.assets[0].uri;
        if (source) {
          uploadImageToServer(source);
        }
      } else {
        // Handle the case where assets are undefined
        console.log('No image selected');
      }
    });
  };

  const uploadImageToServer = async (imageUri: string): Promise<void> => {
    setIsImageUpload(true);
  
    // Determine storage path based on development or production mode
    const storagePath = __DEV__
      ? `Test/${code}/logo/${imageUri.substring(imageUri.lastIndexOf('/') + 1)}`
      : `${code}/logo/${imageUri.substring(imageUri.lastIndexOf('/') + 1)}`;
  
    try {
      // Fetch the signed URL from your backend
      const signedUrlResponse: Response = await fetch(
        `${BACK_END_SERVER_URL}/api/storage/getSignedUrl`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Include authentication headers if needed
          },
          body: JSON.stringify({
            filename: storagePath,
            contentType: 'image/jpeg', // or 'image/png' based on your image type
          }),
        },
      );
  
      if (!signedUrlResponse.ok) {
        throw new Error('Unable to get signed URL');
      }
  
      const {signedUrl} = await signedUrlResponse.json();
  
      // Fetch the image and convert to blob
      const image: Response = await fetch(imageUri);
      const blob: Blob = await image.blob();
  
      // Upload the image blob to the signed URL
      const uploadResponse: Response = await fetch(signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'image/jpeg', 
          
        },
        body: blob,
      });
  
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }
  
      console.log('Image uploaded successfully');
  
      // Construct the access URL
      const accessUrl =  `https://firebasestorage.googleapis.com/v0/b/workerfirebase-f1005.appspot.com/o/${encodeURIComponent(storagePath)}?alt=media`;
      
      setLogo(accessUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsImageUpload(false);
    }
  };
  

  const handleFunction = async () => {
    const data = {
      bizName,
      userName,
      userLastName,
      code,
      userPosition,
      rules: [selectedCategories],
      address,
      officeTel,
      mobileTel,
      email:user?.email,
      bizType,
      logo: logo ? logo : 'NONE',
      companyNumber: taxID,
    };
    console.log(data);
    mutate({data, token: user?.uid});
  };

  async function uriToBlob(uri) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        // Log the blob type and size for debugging
        console.log(
          `Blob created with type: ${xhr.response.type} and size: ${xhr.response.size} bytes`,
        );
        resolve(xhr.response);
      };
      xhr.onerror = function () {
        reject(new Error('URI to Blob failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
  }
  const handlePress = async () => {
    try {
      const response = await fetch(
        `${CLOUDFLARE_ENDPOINT}gallery?code=` + code,
      );

      if (!response.ok) {
        throw new Error('Server responded with status: ' + response.status);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        const data = await response.json();
        console.log(data);
        setResponseLog(JSON.stringify(data));
      } else {
        throw new Error('Received non-JSON response');
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };
console.log('userPosition',userPosition)
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
              onPress={selectImage}>
              {isImageUpload ? (
                <ActivityIndicator size="small" color="gray" />
              ) : logo ? (
                <Image
                source={{ uri: logo }}
                style={{ width: 100, aspectRatio: 1, resizeMode: 'contain' }}
                onError={(e) => console.log('Failed to load image:', e.nativeEvent.error)}
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
            <TextInput
              placeholder="ตำแหน่ง"
              style={styles.input}
              value={userPosition}
              onChangeText={setUserPosition}
            />
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
                onPress={handleFunction}
                disabled={isNextDisabledPage2}
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
                {isLoading || userLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>บันทึก</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
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

export default CreateCompanyScreen;

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
