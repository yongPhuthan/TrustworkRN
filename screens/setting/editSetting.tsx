import { BACK_END_SERVER_URL } from '@env';
import { yupResolver } from '@hookform/resolvers/yup';
import auth from '@react-native-firebase/auth';
import React, { useContext, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Appbar, TextInput } from 'react-native-paper';
import { companyValidationSchema } from '../utils/validationSchema';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { faCloudUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import storage from '@react-native-firebase/storage';

import type { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ImageLibraryOptions,
  launchImageLibrary
} from 'react-native-image-picker';
import { Button } from 'react-native-paper';
import { useUser } from '../../providers/UserContext';
import { Store } from '../../redux/store';
import { CompanyUser } from '../../types/docType';
import { ParamListBase } from '../../types/navigationType';

interface MyError {
  response: object;
  // add other properties if necessary
}
interface Props {
  navigation: StackNavigationProp<ParamListBase, 'EditSetting'>;
  route: RouteProp<ParamListBase, 'EditSetting'>;
}

const EditSetting = ({navigation, route}: Props) => {
  const userEmail = auth().currentUser?.email ?? '';
  const user = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const {company}: any = route.params || {};
  const [isImageUpload, setIsImageUpload] = useState(false);
  const errorText = 'กรุณากรอกข้อมูล';
  const [logo, setLogo] = useState<string | undefined>(company.logo);
  //   const [company, setCompany] = useState(dataProps.company);
  const {
    state: {client_name, isEmulator, client_tel, client_tax},
    dispatch,
  }: any = useContext(Store);
  const defaultValues = {
    bizName: company.bizName,
    userName: company.userName,
    userLastName: company.userLastName,
    officeTel: company.officeTel,
    address: company.address,
    mobileTel: company.mobileTel,
    companyNumber: company.TaxId,
    userPosition: company.userPosition,
    id: company.id,
  };
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: {errors, isDirty, dirtyFields, isValid},
  } = useForm<any>({
    mode: 'onChange',
    defaultValues,
    resolver: yupResolver(companyValidationSchema),
  });
  const watchedValues: any = useWatch({
    defaultValue: defaultValues,
    control,
  });
  const dirtyValues = Object.keys(dirtyFields).reduce((acc, key) => {
    if (key in watchedValues) {
      acc[key] = watchedValues[key as keyof CompanyUser];
    }
    return acc;
  }, {} as CompanyUser);

  const updateCompany = async (data: any) => {
    if (!user || !user.email) {
      throw new Error('User or user email is not available');
    }
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/company/updateCompanySeller?id=${encodeURIComponent(
          company.id,
        )}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({data}),
        },
      );

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          const errorData = await response.json(); // Parse the error response only if it's JSON
          throw new Error(errorData.message || 'Network response was not ok.');
        } else {
          throw new Error('Network response was not ok and not JSON.');
        }
      }

      if (response.status === 200) {
        return response.json();
      } else {
        const errorData = await response.json();
        console.error('Response:', await response.text());
        throw new Error(errorData.message || 'Network response was not ok.');
      }
    } catch (err) {
      console.error('Error in updateContractAndQuotation:', err);
      throw new Error(err);
    }
  };

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

  const {mutate, isLoading: isMuatationLoading} = useMutation(updateCompany, {
    onSuccess: data => {
      queryClient.invalidateQueries(['companySetting']);

      Alert.alert(
        'บันทึกข้อมูลสำเร็จ',
        ``,
        [
          {
            text: 'ปิดหน้าต่าง',
            onPress: () => navigation.goBack(),
          },
        ],
        {cancelable: false},
      );
    },
    onError: (error: MyError) => {
      Alert.alert(
        'เกิดข้อผิดพลาด',
        `Server-side user creation failed: ${error}`,
        [{text: 'OK'}],
        {cancelable: false},
      );
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

  const onSubmit = async () => {
    setIsLoading(true);
    await mutate({dataInputForm: dirtyValues, isEmulator} as any, {
      onSuccess: async () => {
        queryClient.invalidateQueries(['companySetting']);
        setIsLoading(false);
        navigation.goBack();
      },
    });
  };

  const handleDonePress = async () => {
    try {
      mutate(dirtyValues);
    } catch (error: Error | MyError | any) {
      console.error('There was a problem calling the function:', error);
      console.log(error.response);
    }
  };

  // React.useEffect(() => {
  //   navigation.setOptions({
  //     headerRight: () => (
  //       <Button
  //         loading={isMuatationLoading}
  //         disabled={!isDirty || !isValid || isMuatationLoading}
  //         mode="contained"
  //         onPress={handleDonePress}
  //         buttonColor={'#1b52a7'}>
  //         {'บันทึก'}
  //       </Button>
  //     ),
  //   });
  // }, [navigation, isDirty, isValid,dirtyValues]);
  const renderPage = () => {
    return (
      <>
      
        <View>
       
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
         ) : logo && logo !== 'NONE' ? (
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
               อัพโหลดโลโก้
             </Text>
           </View>
         )}
       </TouchableOpacity>
       <Controller
         control={control}
         name="bizName"
         rules={{required: true}}
         render={({field: {onChange, onBlur, value}, fieldState: {error}}) => (
           <TextInput
             label="ชื่อบริษัท"
             error={!!error}
             style={styles.input}
             mode="outlined"
             onBlur={onBlur}
             onChangeText={onChange}
             value={value}
           />
         )}
       />
       <View
         style={{
           flexDirection: 'row',
           justifyContent: 'space-between',
         }}>
         <View style={{flex: 0.45, marginVertical: 5}}>
           <Controller
             control={control}
             name="userName"
             rules={{required: true}}
             render={({
               field: {onChange, onBlur, value},
               fieldState: {error},
             }) => (
               <TextInput
                 label="ชื่อจริง"
                 error={!!error}
                 placeholder="ชื่อจริง"
                 multiline
                 textAlignVertical="top"
                 numberOfLines={1}
                 mode="outlined"
                 onBlur={onBlur}
                 onChangeText={onChange}
                 value={value}
               />
             )}
           />
         </View>
         <View style={{flex: 0.45, marginVertical: 5}}>
           <Controller
             control={control}
             name="userLastName"
             rules={{required: true}}
             render={({
               field: {onChange, onBlur, value},
               fieldState: {error},
             }) => (
               <TextInput
                 label="นามสกุล"
                 // placeholder="นามสกุล"
                 multiline
                 error={!!error}
                 textAlignVertical="top"
                 numberOfLines={1}
                 mode="outlined"
                 onBlur={onBlur}
                 onChangeText={onChange}
                 value={value}
               />
             )}
           />
         </View>
       </View>
       <Controller
         control={control}
         name="userPosition"
         rules={{required: true}}
         render={({field: {onChange, onBlur, value}, fieldState: {error}}) => (
           <TextInput
             label="คำแหน่ง"
             error={!!error}
             style={styles.input}
             // placeholder="คำแหน่งในบริษัท"
             multiline
             textAlignVertical="top"
             numberOfLines={1}
             mode="outlined"
             onBlur={onBlur}
             onChangeText={onChange}
             value={value}
           />
         )}
       />
       {/* {company.bizType === 'business' && (
         <Controller
           control={control}
           name="userPosition"
           rules={{required: true}}
           render={({field: {onChange, onBlur, value}}) => (
             <TextInput
             label="คำแหน่งในบริษัท"
style={styles.input}
               // placeholder="คำแหน่งในบริษัท"
               multiline
               textAlignVertical="top"
               numberOfLines={1}
               mode='outlined'
               onBlur={onBlur}
               onChangeText={onChange}
               value={value}
             />
           )}
         />
       )} */}
       <Controller
         control={control}
         name="address"
         rules={{required: true}}
         render={({field: {onChange, onBlur, value}, fieldState: {error}}) => (
           <TextInput
             label="ที่อยู่"
             error={!!error}
             style={styles.input}
             // placeholder="ที่อยู่"
             keyboardType="name-phone-pad"
             multiline
             textAlignVertical="top"
             numberOfLines={4}
             mode="outlined"
             onBlur={onBlur}
             onChangeText={onChange}
             value={value}
           />
         )}
       />
       <View
         style={{
           flexDirection: 'row',
           justifyContent: 'space-between',
           marginVertical: 5,
         }}>
         <View style={{flex: 0.45}}>
           <Controller
             control={control}
             name="officeTel"
             render={({field: {onChange, onBlur, value}}) => (
               <TextInput
                 label="เบอร์โทรศัพท์"
                 // placeholder="เบอร์โทรศัพท์"
                 keyboardType="phone-pad"
                 mode="outlined"
                 onBlur={onBlur}
                 onChangeText={onChange}
                 value={value}
               />
             )}
           />
         </View>
         <View style={{flex: 0.45}}>
           <Controller
             control={control}
             name="mobileTel"
             render={({
               field: {onChange, onBlur, value},
               fieldState: {error},
             }) => (
               <TextInput
                 label="เบอร์มือถือ"
                 error={!!error}
                 // placeholder="เบอร์โทรศัพท์"
                 keyboardType="phone-pad"
                 mode="outlined"
                 onBlur={onBlur}
                 onChangeText={onChange}
                 value={value}
               />
             )}
           />
         </View>
       </View>
       <Controller
         control={control}
         name="companyNumber"
         render={({field: {onChange, onBlur, value}}) => (
           <TextInput
             style={styles.input}
             label="เลขทะเบียนภาษี(ถ้ามี)"
             // placeholder="เลขทะเบียนภาษี(ถ้ามี)"
             keyboardType="number-pad"
             mode="outlined"
             onBlur={onBlur}
             onChangeText={onChange}
             value={value}
           />
         )}
       />
       <View style={{marginBottom: 50}}></View>
     </View>
      </>
    
    );
  };
  const isButtonDisabled = !{isValid} || !{isDirty};

  return (
    <>
     <Appbar.Header
          elevated
          mode="center-aligned"
          style={{
            backgroundColor: 'white',
          }}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content
            title="แก้ไขข้อมูลธุรกิจ"
            titleStyle={{
              fontSize: 18,
              fontFamily: 'Sukhumvit Set Bold',
              fontWeight: 'bold',
            }}
          />
          <Button
            disabled={!isDirty}
            mode="contained"
            loading={isMuatationLoading}
            buttonColor={'#1b52a7'}
            onPress={handleDonePress}>
            {'บันทึก'}
          </Button>
        </Appbar.Header>
      <SafeAreaView style={{flex: 1}}>
     
        <ScrollView style={styles.container}>{renderPage()}</ScrollView>
        {/* <TouchableOpacity
         disabled={!isDirty}
         style={[
           styles.submitedButton,
           !isDirty ? styles.disabledButton : styles.enabledButton,
           {justifyContent: 'center', alignItems: 'center'},
         ]}
         onPress={handleSubmit(onSubmit)}>
         {isLoading ? (
           <ActivityIndicator size="small" color="#ffffff" />
         ) : (
           <Text style={styles.buttonText}>บันทึก</Text>
         )}
       </TouchableOpacity> */}
      </SafeAreaView>
    </>
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
    marginVertical: 5,
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
