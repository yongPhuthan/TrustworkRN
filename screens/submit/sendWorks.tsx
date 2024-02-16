import { yupResolver } from '@hookform/resolvers/yup';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { BACK_END_SERVER_URL } from '@env';
import { faClose, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ImageLibraryOptions,
  ImagePickerResponse,
  MediaType,
  launchImageLibrary,
} from 'react-native-image-picker';
import {
  Appbar,
  Button,
  Divider,
  ProgressBar,
  TextInput
} from 'react-native-paper';
import DatePickerButton from '../../components/styles/DatePicker';
import SmallDivider from '../../components/styles/SmallDivider';
import { useUriToBlob } from '../../hooks/utils/image/useUriToBlob';
import { useSlugify } from '../../hooks/utils/useSlugify';
import { useUser } from '../../providers/UserContext';
import { Store } from '../../redux/store';
import { ParamListBase } from '../../types/navigationType';
import { sendWorkValidationSchema } from '../utils/validationSchema';
type Props = {
  navigation: StackNavigationProp<ParamListBase>;
  route: RouteProp<ParamListBase, 'SendWorks'>;
};

const SendWorks = (props: Props) => {
  const {route, navigation} = props;

  const thaiDateFormatter = new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const {id, services, title, companyUser, customer, workStatus, contract} =
    route.params;

  const [isImageUpload, setIsImageUpload] = useState(false);
  const slugify = useSlugify();
  const queryClient = useQueryClient();
  const user = useUser();
  const uriToBlobFunction = useUriToBlob();
  const [serviceImages, setServiceImages] = useState<string[]>([]);

  const {
    state: {code},
    dispatch,
  }: any = useContext(Store);
  const createWorkDelivery = async (data: any) => {
    if (!user || !user.email) {
      throw new Error('User or user email is not available');
    }
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/documents/workDeliveyCreated`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({data}),
        },
      );

      if (response.status === 200) {
        return response.json();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Network response was not ok.');
      }
    } catch (err) {
      throw err;
    }
  };

  const uploadImageToFbStorage = async (imagePath: string) => {
    setIsImageUpload(true);
    if (!imagePath) {
      console.log('No image path provided');
      return;
    }
    if (!user || !user.email) {
      console.error('User or user email is not available');
      return;
    }

    const name = imagePath.substring(imagePath.lastIndexOf('/') + 1);
    const fileType = imagePath.substring(imagePath.lastIndexOf('.') + 1);
    const filename = slugify(name);

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

    const blob = (await uriToBlobFunction(imagePath)) as Blob;
    const filePath = __DEV__
      ? `Test/${code}/projects/${id}/workdelivery/${filename}`
      : `${code}/projects/${id}/workdelivery/${filename}`;

    try {
      const token = await user.getIdToken(true);

      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/upload/postImageApprove`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            filePath,
            contentType: contentType,
          }),
        },
      );

      if (!response.ok) {
        const text = await response.text();
        console.error('Server responded with:', text);
        throw new Error('Server error');
      }

      const {signedUrl, publicUrl} = await response.json();

      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: blob,
      });

      if (!uploadResponse.ok) {
        console.error('Failed to upload file to Firebase Storage');
        return;
      }
      console.log('Upload to Firebase Storage success');

      setIsImageUpload(false);
      return publicUrl;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };
  const {initialDateOffer} = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const dateOffer = `${day}-${month}-${year}`;

    return {initialDateOffer: dateOffer};
  }, []) as any;
  const {
    control,
    getValues,
    setValue,
    watch,
    formState: {isValid, errors},
  } = useForm({
    mode: 'all',
    defaultValues: {
      installationAddress: contract.signAddress,
      workDescription: '',
      dateOffer: initialDateOffer,
      services: services,
      serviceImages: [],
    },
    resolver: yupResolver(sendWorkValidationSchema),
  });

  const dateOffer = useWatch({control, name: 'dateOffer'});
  useEffect(() => {
   setValue('dateOffer', dateOffer, {shouldValidate: true, shouldDirty: true});
  }, [])
  
  const handleUploadMoreImages = useCallback(() => {
    setIsImageUpload(true);

    const options: ImageLibraryOptions = {
      mediaType: 'photo' as MediaType,
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
        if (source.uri) {
          // Directly add the URI to serviceImages without uploading
          setServiceImages([...serviceImages, source.uri]);
          setValue('serviceImages', [...serviceImages, source.uri], {shouldDirty: true, shouldValidate: true});
          setIsImageUpload(false);
        }
      }
    });
  }, [setServiceImages, serviceImages]);
  const {mutate, isLoading} = useMutation({
    mutationFn: createWorkDelivery,

    onSuccess: () => {
      queryClient.invalidateQueries(['dashboardData']);
      const newId = id.slice(0, 8) as string;
      navigation.navigate('DocViewScreen', {id: newId});
    },
    onError: (error: any) => {
      console.error('There was a problem calling the function:', error);
      let errorMessage = 'An unexpected error occurred';

      if (error.response && error.response.status === 401) {
        errorMessage = 'Authentication error. Please re-login.';
      } else if (error.response) {
        errorMessage = error.response.data.error || errorMessage;
      }

      Alert.alert('Error', errorMessage);
    },
  });

  const removeImage = useCallback(
    (uri: string) => {
      // Filter out the image URI from the current state
      const updatedImages = serviceImages.filter(image => image !== uri);
      
      // Update the local state with the filtered images
      setServiceImages(updatedImages);
      
      // Update the form state to reflect the change and optionally re-validate
      setValue('serviceImages', updatedImages, { shouldValidate: true });
    },
    [serviceImages, setValue],
  );
  
  const handleDone = useCallback(async () => {
    let uploadedImageUrls: string[] = [];

    for (const imageUri of serviceImages) {
      const uploadedUrl = await uploadImageToFbStorage(imageUri);
      if (uploadedUrl) {
        uploadedImageUrls.push(uploadedUrl);
      }
    }
    setServiceImages(uploadedImageUrls);
    
    const modifiedData = {
      id,
      workStatus,
      companyUserId: companyUser.id,
      customerId: customer.id,
      description: getValues('workDescription'),
      dateOffer : getValues('dateOffer'),
      services : getValues('services'),
      installationAddress: getValues('installationAddress'),
      serviceImages:uploadedImageUrls,
      // serviceImages: uploadedImageUrls,
    };
    await mutate(modifiedData);
  }, [serviceImages, uploadImageToFbStorage]);



  const handleDateSigne = (date: Date) => {
    const formattedDate = thaiDateFormatter.format(date);
    setValue('dateOffer', formattedDate, {shouldValidate: true, shouldDirty: true});
  };

  return (
    <>
      <Appbar.Header
        elevated
        mode="center-aligned"
        style={{
          backgroundColor: 'white',
        }}>
        <Appbar.BackAction
          onPress={() => {
            navigation.goBack();
          }}
        />
        <Appbar.Content
          title="แจ้งส่งงานลูกค้า"
          titleStyle={{
            fontSize: 18,
            fontWeight: 'bold',
            fontFamily: 'Sukhumvit Set Bold',
          }}
        />
        <Button
          loading={isLoading}
          disabled={!isValid}
          mode="contained"
          buttonColor={'#1b72e8'}
          onPress={handleDone}>
          {'บันทึก'}
        </Button>
      </Appbar.Header>
      <ProgressBar progress={1} color={'#1b52a7'} />
      <KeyboardAwareScrollView>
        <ScrollView
          style={{
            backgroundColor: '#FFFFFF',
            marginBottom: 100,
            paddingHorizontal: 20,
          }}>
          <View style={styles.card}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                width: '100%',
                marginVertical: 15,
              }}>
              <Text style={styles.title}>โครงการ: </Text>
              <Text style={{marginTop: 2, marginLeft: 10, height: 'auto'}}>
                {contract.projectName}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                width: '100%',
                marginVertical: 15,
              }}>
              <Text style={styles.title}>ลูกค้า: </Text>
              <Text style={{marginTop: 2, marginLeft: 10}}>
                {customer.name}
              </Text>
            </View>
          </View>

          <View style={styles.stepContainer} />
          <SmallDivider />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              width: '70%',
            }}>
            <Text style={styles.titleDate}>วันที่ส่งงาน:</Text>
            <View style={{marginTop: 10, marginLeft: 10}}>
              <DatePickerButton
                title="วันที่ส่งงาน"
                label=""
                date="today"
                onDateSelected={handleDateSigne}
              />
            </View>
          </View>

          <SmallDivider />
          <View style={{alignSelf: 'flex-start', marginVertical: 10}}>
            <Text style={styles.title}>หนังสือส่งงานทำขึ้นที่:</Text>
            <Controller
              control={control}
              name="installationAddress"
              rules={{required: true}}
              render={({
                field: {onChange, onBlur, value},
                fieldState: {error},
              }) => (
                <View>
                  <TextInput
                    multiline
                    error={!!error}
                    mode="outlined"
                    numberOfLines={4}
                    placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด...."
                    onBlur={onBlur}
                    placeholderTextColor={'#A6A6A6'}
                    keyboardType="default"
                    onChangeText={onChange}
                    textAlignVertical="top"
                    value={value}
                  />
                  {error && (
                    <Text style={{color: 'red', marginTop: 5}}>
                      {error.message}
                    </Text>
                  )}
                </View>
              )}
            />
          </View>
          <Divider style={{marginVertical: 20}} />

          <View>
            <Text style={styles.title}>งานที่แจ้งส่ง</Text>
            {services.map((service, index) => (
              <View key={index}>
                <Text style={styles.listTitle}>
                  {index + 1}. {service.title}
                </Text>
                <Text style={styles.listDescription}>
                  {service.description}
                </Text>
              </View>
            ))}
          </View>

          <Divider style={{marginVertical: 20}} />
          <View>
            <Text style={styles.title}>เพิ่มรูปผลงาน</Text>
            {services.map((service, index) => (
             
                <FlatList
                  key={service.id}
                  data={serviceImages}
                  horizontal={true}
                  renderItem={({item, index}) => {
                    return (
                      <View key={index} style={styles.imageContainer}>
                        <Image source={{uri: item}} style={styles.image} />
                        <TouchableOpacity
                          style={styles.closeIcon}
                          onPress={() => removeImage(item)}>
                          <FontAwesomeIcon
                            icon={faClose}
                            size={15}
                            color="white"
                          />
                        </TouchableOpacity>
                      </View>
                    );
                  }}
                  keyExtractor={(item, index) => index.toString()}
                  ListFooterComponent={
                    serviceImages.length > 0 ? (
                      <TouchableOpacity
                        style={styles.addButtonContainer}
                        onPress={() => {
                          handleUploadMoreImages(); // navigation.navigate('GalleryScreen', {code});
                        }}>
                        <FontAwesomeIcon
                          icon={faPlus}
                          size={32}
                          // color="#0073BA"
                        />
                      </TouchableOpacity>
                    ) : null
                  }
                  ListEmptyComponent={
                    <TouchableOpacity
                    style={styles.addButtonContainer}
                    onPress={() => {
                      handleUploadMoreImages(); // navigation.navigate('GalleryScreen', {code});
                    }}>
                    <FontAwesomeIcon
                      icon={faPlus}
                      size={32}
                      // color="#0073BA"
                    />
                  </TouchableOpacity>
                  }
                />
       
            ))}
          </View>
          <Divider style={{marginVertical: 10}} />

          <View style={{alignSelf: 'flex-start', marginVertical: 10}}>
            <Text style={styles.title}>รายละเอียดงานที่ส่ง:</Text>
            <Controller
              control={control}
              rules={{required: true}}
              name="workDescription"
              render={({
                field: {onChange, onBlur, value},
                fieldState: {error},
              }) => (
                <TextInput
                  error={!!error}
                  multiline
                  numberOfLines={4}
                  mode="outlined"
                  placeholder="อธิบายภาพรวมของงานที่ส่งมอบ เช่นคุณได้ทำอะไรบ้างในงวดงานนี้.."
                  onBlur={onBlur}
                  keyboardType="default"
                  onChangeText={onChange}
                  value={value}
                  placeholderTextColor={'#A6A6A6'}
                />
              )}
            />
          </View>
          {/* <Divider style={{marginVertical: 20}} />
            <View
              style={{
                width: '100%',
                marginTop: 40,
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <SaveButton onPress={handleDone} disabled={false} />
            </View> */}
        </ScrollView>
      </KeyboardAwareScrollView>
    </>
  );
};

export default SendWorks;

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  containerForm: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 5,
  },
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  headerForm: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -1,
  },
  headerTextForm: {
    fontFamily: 'sukhumvit set',
    fontSize: 20,
    fontWeight: 'bold',
  },
  formInput: {
    flex: 1,
    marginTop: 5,
  },
  rowForm: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelSuffix: {
    fontFamily: 'sukhumvit set',
    fontSize: 16,
    marginLeft: 5,
  },
  outlinedButtonForm: {
    backgroundColor: 'transparent',
  },
  outlinedButtonTextForm: {
    color: '#0073BA',
  },
  roundedButton: {
    marginTop: 10,
  },
  whiteText: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#0073BA',
    borderRadius: 5,
    height: 50,
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollViewForm: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputContainerForm: {
    marginBottom: 10,
    borderWidth: 0.5,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 15,
    width: 100,
  },
  label: {
    // fontFamily: 'sukhumvit set',
    fontSize: 16,
    fontWeight: '400',
    marginTop: 15,
    marginBottom: 10,
  },
  inputForm: {
    // backgroundColor: '#F5F5F5',
    borderRadius: 5,
    borderWidth: 0.5,
    width: width * 0.85,

    height: 50,

    paddingHorizontal: 10,
  },
  inputPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputSuffix: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  inputFormRight: {
    flex: 1,
    // backgroundColor: '#F5F5F5',
    borderRadius: 5,
    borderWidth: 1,
    minHeight: 50,
    minWidth: 200,

    width: 50,
  },
  imageContainer: {
    width: width / 3 - 10,
    position: 'relative',
    borderWidth: 1,
    marginTop: 20,
    borderColor: '#ccc',
    flexDirection: 'column',
    margin: 5,
  },
  closeIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
    padding: 5,
    backgroundColor: 'red', // Set the background color to red
    borderRadius: 50, // Make it circular
    width: 20, // Set a fixed width
    height: 20, // Set a fixed height
    justifyContent: 'center', // Center the icon horizontally
    alignItems: 'center', // Center the icon vertically
  },
  buttonContainerForm: {
    marginTop: 20,
    // backgroundColor: '#007AFF',
    borderRadius: 5,
    height: 40,
    justifyContent: 'center',
  },
  submitedButtonForm: {
    backgroundColor: '#0073BA',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonPrevContainerForm: {
    marginTop: 20,
    borderColor: '#0073BA',
    borderWidth: 1,
    backgroundColor: 'white',
    borderRadius: 5,
    height: 40,
    justifyContent: 'center',
  },
  buttonTextForm: {
    color: '#FFFFFF',
    // fontFamily: 'sukhumvit set',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  containerBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    shadowColor: 'black',
    shadowOffset: {width: 1, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 4,
    bottom: 0,

    width: '100%',

    paddingBottom: 30,
  },
  divider: {
    borderBottomWidth: 1,
    borderColor: '#A6A6A6',
    marginTop: 1,
  },

  buttonForm: {
    backgroundColor: '#0073BA',
    paddingVertical: 12,
    paddingHorizontal: 32,
    height: 40,
    borderRadius: 5,
    marginTop: 20,
  },
  previousButtonForm: {
    borderColor: '#0073BA',
    backgroundColor: 'white',
  },
  smallInput: {
    width: '30%',
  },
  stepContainer: {
    paddingHorizontal: 20,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 0,
    resizeMode: 'cover',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    // elevation: 3,
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.3,
    // shadowRadius: 3,

    width: '80%',
    alignSelf: 'baseline',
    marginTop: 20,
  },
  iconForm: {
    color: 'white',
    marginLeft: 10,
    marginTop: 2,
  },
  iconPrevForm: {
    // color: '#007AFF',
    color: '#0073BA',

    marginLeft: 10,
  },
  input: {
    borderWidth: 0.5,
    paddingTop: Platform.OS === 'ios' ? 10 : 0,
    minHeight: Platform.OS === 'ios' ? 80 : 40, // Adjust as needed
    textAlignVertical: 'top', // Ensure text aligns to the top
    borderRadius: 5,
    padding: 10,
    backgroundColor: 'white',
    width: width * 0.85,
    marginTop: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#19232e',
  },
  listTitle: {
    fontSize: 16,
    marginTop: 20,
  },
  listDescription: {
    fontSize: 14,

    marginLeft: 10,
  },
  addButtonContainer: {
    width: 100,
    margin: 5,
    marginTop: 20,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#0073BA',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderRadius: 4, // Optional, for rounded edges
  },
  titleDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#19232e',
  },
});
