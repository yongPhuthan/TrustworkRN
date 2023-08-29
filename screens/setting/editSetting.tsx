import React, {useState, useContext, useEffect, useRef} from 'react';
import {
  Text,
  TouchableOpacity,
  Image,
  View,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {useQueryClient, useMutation} from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {HOST_URL,PROJECT_NAME,PROJECT_FIREBASE} from '@env';

import firebase from '../../firebase';
import storage from '@react-native-firebase/storage';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faUpload, faCloudUpload} from '@fortawesome/free-solid-svg-icons';

import {
  launchImageLibrary,
  MediaType,
  ImageLibraryOptions,
  ImagePickerResponse,
} from 'react-native-image-picker';

import {Store} from '../../redux/store';
import {StackNavigationProp} from '@react-navigation/stack';
import {CheckBox} from '@rneui/themed';
import type { RouteProp } from '@react-navigation/native';
import { CompanyUser } from '../../types/docType';
import {ParamListBase} from '../../types/navigationType';


interface MyError {
  response: object;
  // add other properties if necessary
}
type UpdateCompanySellerArgs = {
  email: string;
  logo: string;

  dataInputForm: CompanyUser;
};
type Company = {
  id: string;
};
interface Props {
  navigation: StackNavigationProp<ParamListBase, 'EditSetting'>;
  route: RouteProp<ParamListBase, 'EditSetting'>;
}

const saveDataToAsyncStorage = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.log('Error saving data to AsyncStorage:', error);
  }
};

const updateCompanySellerAPI = async ({
  dataInputForm,
}: UpdateCompanySellerArgs): Promise<void> => {
  const user = auth().currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  console.log('email', JSON.stringify(dataInputForm));
 
  const url = __DEV__
  ? `http://${HOST_URL}:5001/${PROJECT_FIREBASE}/asia-southeast1/updateCompanySeller`
  : `https://asia-southeast1-${PROJECT_FIREBASE}.cloudfunctions.net/updateCompanySeller`;


  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user?.uid}`,
    },
    body: JSON.stringify({data: dataInputForm}),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
};

const EditSetting = ({navigation, route}: Props) => {
  const userEmail = auth().currentUser?.email ?? '';
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { company}: any = route.params || {};
  const [isImageUpload, setIsImageUpload] = useState(false);
  const errorText = 'กรุณากรอกข้อมูล';
  const [logo, setLogo] = useState<string | undefined>(company.logo);
//   const [company, setCompany] = useState(dataProps.company);
  const {
    state: {client_name, isEmulator, client_tel, client_tax},
    dispatch,
  }: any = useContext(Store);
  const {
    control,
    handleSubmit,
    setValue,
    formState: {errors, isDirty, isValid},
  } = useForm<CompanyUser>({
    defaultValues: {
      bizName: company.bizName,
      userName: company.userName,
      userLastName: company.userLastName,
      officeTel: company.officeTel,
      address: company.address,
      mobileTel: company.mobileTel,
      companyNumber: company.TaxId,
      userPosition: company.userPosition,
      id: company.id,
    },
  });
  const handleLogoUpload = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      maxWidth: 300,
      maxHeight: 300,
      quality: 0.7,
    };

    try {
      const response = await launchImageLibrary(options);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const source = {uri: response.assets[0].uri ?? null};
        console.log('Image source:', source);

        if (source.uri) {
          try {
            const firebaseUrl = await uploadImageToFirebase(source.uri);
            setLogo(firebaseUrl);
            setValue('logo', firebaseUrl as string);
          } catch (error) {
            console.error('Error uploading image to Firebase:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error selecting image:', error);
    }
  };

  const {mutate} = useMutation(updateCompanySellerAPI, {
    onSuccess: data => {
      navigation.goBack();
    },
    onError: (error: MyError) => {
      console.error('There was a problem calling the function:', error);
      console.log(error.response);
    },
  });

  const uploadImageToFirebase = async (imagePath: string) => {
    setIsImageUpload(true);
    if (!imagePath) {
      console.log('No image path provided');
      return;
    }

    const filename = imagePath.substring(imagePath.lastIndexOf('/') + 1);
    const storageRef = storage().ref(`images/${filename}`);
    await storageRef.putFile(imagePath);

    const downloadUrl = await storageRef.getDownloadURL();
    setIsImageUpload(false);
    return downloadUrl;
  };

  const onSubmit = async (data: CompanyUser) => {
    setIsLoading(true)
    await mutate({dataInputForm: data, isEmulator} as any, {

      onSuccess: async () => {
        queryClient.invalidateQueries(['companySetting']);
        setIsLoading(false)

        // await removeDataFromAsyncStorage('companyData');
        // await saveDataToAsyncStorage('companyData', data);
        
        navigation.goBack();
      },
    });
  };


  const renderPage = () => {
    return (
      <View >
        {/* <Text style={styles.title}>หัวเอกสาร</Text> */}
        <TouchableOpacity
          style={{
            alignItems: 'center',
            marginBottom: 10,

            borderColor: 'gray',
            borderWidth: 1,
            borderRadius: 5,
            borderStyle: 'dotted',
            padding: 10,
          }}
          onPress={handleLogoUpload}>
          {isImageUpload ? (
            <ActivityIndicator size="small" color="gray" />
          ) : logo ? (
            <Image
              source={{
                uri: logo,
              }}
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
                อัพโหลดโลโก้ธุรกิจ
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <Controller
          control={control}
          name="bizName"
          rules={{required: true}}
          render={({field: {onChange, onBlur, value}}) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.bizName && <Text>{errorText}</Text>}

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 10,
          }}>
          <View style={{flex: 0.45}}>
            <Controller
              control={control}
              name="userName"
              rules={{required: true}}
              render={({field: {onChange, onBlur, value}}) => (
                <TextInput
                  placeholder="ชื่อจริง"
                  multiline
                  textAlignVertical="top"
                  numberOfLines={1}
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.userName && <Text>This is required.</Text>}
          </View>
          <View style={{flex: 0.45}}>
            <Controller
              control={control}
              name="userLastName"
              rules={{required: true}}
              render={({field: {onChange, onBlur, value}}) => (
                <TextInput
                  placeholder="นามสกุล"
                  multiline
                  textAlignVertical="top"
                  numberOfLines={1}
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.userLastName && <Text>This is required.</Text>}
          </View>
        </View>
        {company.bizType === 'business' && (
          <Controller
            control={control}
            name="userPosition"
            rules={{required: true}}
            render={({field: {onChange, onBlur, value}}) => (
              <TextInput
                placeholder="คำแหน่งในบริษัท"
                multiline
                textAlignVertical="top"
                numberOfLines={1}
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        )}
        <Controller
          control={control}
          name="address"
          rules={{required: true}}
          render={({field: {onChange, onBlur, value}}) => (
            <TextInput
              placeholder="ที่อยู่"
              keyboardType="name-phone-pad"
              multiline
              textAlignVertical="top"
              numberOfLines={4}
              style={[styles.input, {height: 100}]} 
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.address && <Text>This is required.</Text>}

        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={{flex: 0.45}}>
            <Controller
              control={control}
              name="officeTel"
              render={({field: {onChange, onBlur, value}}) => (
                <TextInput
                  placeholder="เบอร์โทรศัพท์"
                  keyboardType="phone-pad"
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.officeTel && <Text>This is required.</Text>}
          </View>
          <View style={{flex: 0.45}}>
            <Controller
              control={control}
              name="mobileTel"
              render={({field: {onChange, onBlur, value}}) => (
                <TextInput
                  placeholder="เบอร์โทรศัพท์"
                  keyboardType="phone-pad"
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.mobileTel && <Text>This is required.</Text>}
          </View>
        </View>
        <Controller
          control={control}
          name="companyNumber"
          render={({field: {onChange, onBlur, value}}) => (
            <TextInput
              placeholder="เลขทะเบียนภาษี(ถ้ามี)"
              keyboardType="number-pad"
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        <View style={{marginBottom: 50}}></View>
      </View>
    );
  };
  const isButtonDisabled = !{isValid} || !{isDirty};

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView style={styles.container}>{renderPage()}</ScrollView>
      <View style={styles.containerBtn}>
        <TouchableOpacity
          style={[styles.previousButton, styles.outlinedButton]}
          onPress={() => navigation.goBack()}>
          <Text style={[styles.buttonText, styles.outlinedButtonText]}>
            ย้อนกลับ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={isButtonDisabled}
          style={[
            styles.submitedButton,
            isButtonDisabled ? styles.disabledButton : styles.enabledButton,
            {justifyContent: 'center', alignItems: 'center'},
          ]}
          onPress={handleSubmit(onSubmit)}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>บันทึก</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EditSetting;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  label: {
    color: '#444444',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderRadius: 5,
    marginVertical: 5,
    borderWidth: 0.5,
    
    borderColor: 'black',
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#0066C0',
    color: '#FFFFFF',
    borderRadius: 5,

    width: 100,

  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  enabledButton: {
    backgroundColor: '#0066C0',
    borderRadius: 5,
    marginTop: 10,
    width: '50%',
    alignSelf: 'center',


    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    borderRadius: 5,
    marginTop: 10,
    width: '70%',
    alignSelf: 'center',
    height: 40,
    padding: 10,
  },
  title: {
    textAlign: 'center',
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
  },
  containerBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5FCFF',
    shadowColor: 'black',
    shadowOffset: {width: 1, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 4,
    padding: 20,
    bottom: 0,
  },
  outlinedButton: {
    backgroundColor: 'transparent',
  },
  outlinedButtonText: {
    color: '#0073BA',
    textDecorationLine: 'underline',
  },
  previousButton: {
    borderColor: '#0073BA',
    backgroundColor: 'white',
    marginTop: 20,
  },
  submitedButton: {
    backgroundColor: '#0073BA',
    paddingVertical: 12.5,
    paddingHorizontal: 20,
    borderRadius: 5,
    height: 50,
    width: 200,
  },
});
