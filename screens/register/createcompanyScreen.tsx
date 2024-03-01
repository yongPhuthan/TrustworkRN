import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Appbar,
  Button,
  Checkbox,
  ProgressBar,
  TextInput,
} from 'react-native-paper';
import RNFS from 'react-native-fs';
import React, {useEffect, useState} from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import {faCloudUpload} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {useMutation} from '@tanstack/react-query';
import {
  Asset,
  ImageLibraryOptions,
  ImagePickerResponse,
  MediaType,
  launchImageLibrary,
} from 'react-native-image-picker';
import firebase from '../../firebase';
import {Controller, useForm, useWatch} from 'react-hook-form';

import {BACK_END_SERVER_URL} from '@env';
import {yupResolver} from '@hookform/resolvers/yup';
import {StackNavigationProp} from '@react-navigation/stack';
import {useUser} from '../../providers/UserContext';
import {ParamListBase} from '../../types/navigationType';
import {companyValidationSchema} from '../utils/validationSchema';
interface Props {
  navigation: StackNavigationProp<ParamListBase, 'RegisterScreen'>;
}
interface ImageResponse extends ImagePickerResponse {
  assets?: Asset[];
}

interface Category {
  key: string;
  value: string;
}

const screenWidth = Dimensions.get('window').width;
const checkboxStyle = {
  borderRadius: 5, // Rounded corners
  borderWidth: 1, // Border width
  borderColor: 'grey', // Border color
  backgroundColor: 'white', // Background color
};

const createCompanySeller = async ({data, token} : any) => {
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
  const [page, setPage] = useState<number>(1);
  const [isImageUpload, setIsImageUpload] = useState(false);

  const [categories, setCategories] = useState([]);
  const [code, setCode] = useState<string | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const user = useUser();

  const {
    handleSubmit,
    setValue,
    control,
    formState: {isValid, isDirty, errors},
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      bizName: '',
      userName: '',
      userLastName: '',
      userPosition: '',
      categoryId: '',
      address: '',
      officeTel: '',
      mobileTel: '',
      bizType: '',
      logo: '',
      companyTax: '',
    },
    resolver: yupResolver(companyValidationSchema),
  });


  const logo = useWatch({
    control,
    name: 'logo',
  });
  const bizName = useWatch({
    control,
    name: 'bizName',
  });
  const userName = useWatch({
    control,

    name: 'userName',
  });
  const userLastName = useWatch({
    control,

    name: 'userLastName',
  });

  const bizType = useWatch({
    control,

    name: 'bizType',
  });
  const companyTax = useWatch({
    control,

    name: 'companyTax',
  });
  const categoryId = useWatch({
    control,
    name: 'categoryId',
  });

  const userPosition = useWatch({
    control,

    name: 'userPosition',
  });
  const address = useWatch({
    control,

    name: 'address',
  });
  const mobileTel = useWatch({
    control,

    name: 'mobileTel',
  });
  const officeTel = useWatch({
    control,

    name: 'officeTel',
  });
  const isNextDisabledPage1 =
    !bizName || !userName || !userLastName || !userPosition || !bizType;

  // !bizName || !userName || !userLastName || !selectedCategories.length;
  const isNextDisabledPage2 = !address || !mobileTel;
  useEffect(() => {

    setCode(Math.floor(100000 + Math.random() * 900000).toString());
    const API_URL = `${BACK_END_SERVER_URL}/api/company/getCategories`;

    fetch(API_URL)
      .then(response => response.json())
      .then(data =>
        setCategories(
          data.map((category : any) => ({
            key: category.id.toString(),
            value: category.name,
          })),
        ),
      )
      .catch(error => console.error('Error fetching categories:', error));
  }, []);
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
      //clear navigation stack
      navigation.reset({
        index: 0,
        routes: [{name: 'DashboardQuotation'}],
      });
      // navigation.navigate('DashboardQuotation');
    },
    onError: (error: any) => {
      console.error('There was a problem calling the function:', error);
      console.log(error.response);
    },
  });

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
          setValue('logo', source);
        }
      } else {
        // Handle the case where assets are undefined
        console.log('No image selected');
      }
    });
  };
  const uploadImageToServer = async (imageUri: string): Promise<void> => {
    setIsImageUpload(true);
    if (!user || !user.email) {
      console.error('User or user email is not available');
      return;
    }
  
    const storagePath = `${code}/logo/${imageUri.substring(imageUri.lastIndexOf('/') + 1)}`;
  
    try {
      // Create a reference to the Firebase Storage location
      const reference = firebase.storage().ref(storagePath);
  
      // Upload the image file directly from the client
      console.log('Uploading image to Firebase Storage', imageUri);
      await reference.putFile(imageUri); // For React Native, use putFile with the local file URI
  
      console.log('Image uploaded successfully');
  
      // Get the download URL
      const accessUrl = await reference.getDownloadURL();
      console.log('Download URL:', accessUrl);
  
      setValue('logo', accessUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsImageUpload(false);
    }
  };

  const handleSave = async () => {
    const data = {
      bizName,
      userName,
      userLastName,
      platform: Platform.OS,
      code,
      userPosition,
      categoryId,
      address,
      officeTel,
      mobileTel,
      email: user?.email,
      bizType,
      logo: logo ? logo : '',
      companyTax,
    };
    mutate({data, token: user?.uid});
  };

  const renderPage = () => {
    switch (page) {
      case 1:
        return (
          <ScrollView style={{marginTop: 10, paddingHorizontal: 10}}>
            <Controller
              control={control}
              name="logo"
              render={({field: {onChange, value}}) => (
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
                  onPress={selectImage}
                  >
                  {isImageUpload ? (
                    <ActivityIndicator size="small" color="gray" />
                  ) : value ? (
                    <Image
                      source={{uri: value}}
                      style={{
                        width: 100,
                        aspectRatio: 1,
                        resizeMode: 'contain',
                      }}
                      onError={e =>
                        console.log(
                          'Failed to load image:',
                          e.nativeEvent.error,
                        )
                      }
                    />
                  ) : (
                    <View>
                      <FontAwesomeIcon
                        icon={faCloudUpload}
                        size={32}
                        color="gray"
                        style={{marginVertical: 5, marginHorizontal: 50}}
                      />
                      <Text style={{textAlign: 'center', color: 'gray'}}>
                        อัพโหลดโลโก้
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />

            <Controller
              control={control}
              name="bizName"
              render={({
                field: {onChange, value, onBlur},
                fieldState: {error},
              }) => (
                <View style={{marginBottom: 20}}>
                  <TextInput
                    mode="outlined"
                    onBlur={onBlur}
                    error={!!error}
                    label="ชื่อธุรกิจ - ชื่อบริษัท"
                    value={value}
                    onChangeText={onChange}
                  />
                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}
                </View>
              )}
            />

            <View
              style={{
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
              <View style={{flex: 0.45}}>
                <Controller
                  control={control}
                  name="userName"
                  render={({
                    field: {onChange, value, onBlur},
                    fieldState: {error},
                  }) => (
                    <View style={{marginBottom: 20}}>
                      <TextInput
                        mode="outlined"
                        onBlur={onBlur}
                        error={!!error}
                        label="ชื่อจริง"
                        value={value}
                        onChangeText={onChange}
                      />
                      {error && (
                        <Text style={styles.errorText}>{error.message}</Text>
                      )}
                    </View>
                  )}
                />
              </View>
              <View style={{flex: 0.45}}>
                <Controller
                  control={control}
                  name="userLastName"
                  render={({
                    field: {onChange, value, onBlur},
                    fieldState: {error},
                  }) => (
                    <View style={{marginBottom: 20}}>
                      <TextInput
                        mode="outlined"
                        onBlur={onBlur}
                        error={!!error}
                        label="นามสกุล"
                        value={value}
                        onChangeText={onChange}
                      />
                      {error && (
                        <Text style={styles.errorText}>{error.message}</Text>
                      )}
                    </View>
                  )}
                />
              </View>
            </View>
            <Controller
              control={control}
              name="userPosition"
              render={({
                field: {onChange, value, onBlur},
                fieldState: {error},
              }) => (
                <View style={{marginBottom: 20}}>
                  <TextInput
                    mode="outlined"
                    onBlur={onBlur}
                    error={!!error}
                    label="ตำแหน่ง"
                    value={value}
                    onChangeText={onChange}
                  />
                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}
                </View>
              )}
            />
            <Text style={{marginBottom: 10, fontSize: 14}}>
              เลือกประเภทธุรกิจ
            </Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                marginBottom: 10,
                gap: 10,
              }}>
              <Controller
                control={control}
                name="bizType"
                render={({field: {value}}) => (
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Checkbox.Android
                      style={{...checkboxStyle, flexDirection: 'row-reverse'}}
                      uncheckedColor="grey"
                      status={value === 'individual' ? 'checked' : 'unchecked'}
                      onPress={() => setValue('bizType', 'individual')}
                    />
                    <Text>บุคคลธรรมดา</Text>
                  </View>
                )}
              />
              <Controller
                control={control}
                name="bizType"
                render={({field: {value}}) => (
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Checkbox.Android
                      // label="บริษัท-หจก"
                      style={{...checkboxStyle, flexDirection: 'row-reverse'}}
                      uncheckedColor="grey"
                      status={value === 'business' ? 'checked' : 'unchecked'}
                      onPress={() => setValue('bizType', 'business')}
                    />
                    <Text>บริษัท-หจก</Text>
                  </View>
                )}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: 30,
              }}>
              <Button
                mode="contained"
                shouldRasterizeIOS
                contentStyle={{flexDirection: 'row-reverse'}}
                icon={'arrow-right'}
                buttonColor="#1b72e8"
                disabled={isNextDisabledPage1}
                onPress={handleNextPage}>
                <Text>ไปต่อ</Text>
              </Button>
            </View>
          </ScrollView>
        );
      case 2:
        return (
          <View style={{marginTop: 10, paddingHorizontal: 10}}>
            <Controller
              control={control}
              name="address"
              render={({
                field: {onChange, value, onBlur},
                fieldState: {error},
              }) => (
                <View style={{marginBottom: 20}}>
                  <TextInput
                    mode="outlined"
                    onBlur={onBlur}
                    error={!!error}
                    style={
                      Platform.OS === 'ios'
                        ? {height: 80, textAlignVertical: 'top'}
                        : {}
                    }
                    numberOfLines={3}
                    multiline={true}
                    textAlignVertical="top"
                    label="ที่อยู่ร้าน"
                    value={value}
                    onChangeText={onChange}
                  />
                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}
                </View>
              )}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <View style={{flex: 0.45}}>
                <Controller
                  control={control}
                  name="officeTel"
                  render={({
                    field: {onChange, value, onBlur},
                    fieldState: {error},
                  }) => (
                    <View style={{marginBottom: 20}}>
                      <TextInput
                        mode="outlined"
                        onBlur={onBlur}
                        error={!!error}
                        label="เบอร์โทรบริษัท"
                        keyboardType="number-pad"
                        value={value}
                        onChangeText={onChange}
                      />
                      {error && (
                        <Text style={styles.errorText}>{error.message}</Text>
                      )}
                    </View>
                  )}
                />
              </View>
              <View style={{flex: 0.45}}>
                <Controller
                  control={control}
                  name="mobileTel"
                  render={({
                    field: {onChange, value, onBlur},
                    fieldState: {error},
                  }) => (
                    <View style={{marginBottom: 20}}>
                      <TextInput
                        mode="outlined"
                        onBlur={onBlur}
                        error={!!error}
                        label="เบอร์มือถือ"
                        keyboardType="number-pad"
                        value={value}
                        onChangeText={onChange}
                      />
                      {error && (
                        <Text style={styles.errorText}>{error.message}</Text>
                      )}
                    </View>
                  )}
                />
              </View>
            </View>
            <Controller
              control={control}
              name="companyTax"
              render={({
                field: {onChange, value, onBlur},
                fieldState: {error},
              }) => (
                <View style={{marginBottom: 20}}>
                  <TextInput
                    mode="outlined"
                    onBlur={onBlur}
                    error={!!error}
                    keyboardType="number-pad"
                    label="เลขภาษี(ถ้ามี)"
                    value={value}
                    onChangeText={onChange}
                  />
                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}
                </View>
              )}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 50,
              }}>
              <Button onPress={handlePrevPage} icon={'arrow-left'} mode="text">
                <Text>ย้อนกลับ</Text>
              </Button>

              <Button
                contentStyle={{flexDirection: 'row-reverse'}}
                onPress={handleNextPage}
                disabled={isNextDisabledPage2}
                buttonColor="#1b72e8"
                mode="contained"
                icon={'arrow-right'}
                loading={isLoading || userLoading}>
                ไปต่อ
              </Button>
            </View>
          </View>
        );
      case 3:
        return (
          <View style={{paddingHorizontal: 10}}>
            <Text style={{marginBottom: 10, fontSize: 16, fontWeight: 'bold'}}>
              เลือกหมวดหมู่ธุรกิจของคุณ
            </Text>
            <View>
              {categories.map((category: Category, index: number) => (
                <Controller
                  control={control}
                  name="categoryId"
                  key={index}
                  render={({field: {onChange, value}}) => (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 20,
                      }}>
                      <Checkbox.Android
                        status={
                          value === category.key ? 'checked' : 'unchecked'
                        }
                        onPress={() => {
                          onChange(category.key);
                          setValue('categoryId', category.key, {
                            shouldDirty: true,
                          });
                        }}
                      />
                      <Text style={{fontSize: 16}}>{category.value}</Text>
                    </View>
                  )}
                />
              ))}
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 50,
              }}>
              <Button onPress={handlePrevPage} icon={'arrow-left'} mode="text">
                <Text>ย้อนกลับ</Text>
              </Button>

              <Button
                onPress={handleSave}
                disabled={!categoryId}
                buttonColor="#1b72e8"
                mode="contained"
                style={{width: 120}}
                loading={isLoading || userLoading}>
                บันทึก
              </Button>
            </View>
          </View>
        );

      default:
        return null;
    }
  };
  const progress = page / 3;

  return (
    <>
      <Appbar.Header
        elevated
        mode="center-aligned"
        style={{
          backgroundColor: 'white',
        }}>
        <Appbar.Content title="ลงทะเบียนธุรกิจ" titleStyle={{fontSize: 18}} />
      </Appbar.Header>
      <ProgressBar progress={progress} color={'#1b52a7'} />

      <KeyboardAwareScrollView
        style={{flex: 1}}
        resetScrollToCoords={{x: 0, y: 0}}
        scrollEnabled={true}
        extraHeight={200} // Adjust this value as needed
        enableOnAndroid={true}>
        <View style={{marginTop: 40, paddingHorizontal: 20}}>
          {renderPage()}
        </View>
      </KeyboardAwareScrollView>
    </>
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
    borderRadius: 4,
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
