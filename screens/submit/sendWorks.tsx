import React, {
  useState,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import {
  Button,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TextInput,
  Text,
  Alert,
  Image,
  Platform,
  View,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useUser} from '../../providers/UserContext';
import SmallDivider from '../../components/styles/SmallDivider';
import DatePickerButton from '../../components/styles/DatePicker';
import {useForm, Controller, set} from 'react-hook-form';
import {ParamListBase, ProductItem} from '../../types/navigationType';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Store} from '../../redux/store';
import {BACK_END_SERVER_URL} from '@env';
import {useSlugify} from '../../hooks/utils/useSlugify';
import {useUriToBlob} from '../../hooks/utils/image/useUriToBlob';
import {
  launchImageLibrary,
  MediaType,
  ImageLibraryOptions,
  ImagePickerResponse,
} from 'react-native-image-picker';
import {
  faCloudUpload,
  faEdit,
  faExpand,
  faPlus,
  faImages,
  faClose,
  faClosedCaptioning,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import SaveButton from '../../components/ui/Button/SaveButton';
import {Divider} from '@rneui/base';
import {useImageUpload} from '../../hooks/utils/image/useUploadToFirebase';
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
  const {control, getValues} = useForm({
    defaultValues: {
      installationAddress: contract.signAddress,
      workDescription: '',
    },
  });
  const [selectedImage, setSelectedImage] = useState<string>('');
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
  console.log('route.params', route.params);
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
          setIsImageUpload(false);
        }
    
      }
    });
    
  }, [setServiceImages, serviceImages]);
  const {mutate, isLoading } = useMutation({
    mutationFn: createWorkDelivery,

    onSuccess: () => {
      queryClient.invalidateQueries(['dashboardData']);
      const newId = id.slice(0, 8) as string;
      console.log('SUCCESS');
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
    uri => {
      setServiceImages(serviceImages.filter(image => image !== uri));
    },
    [serviceImages],
  );
  const handleDone = useCallback(async () => {
    // let uploadedImageUrls: string[] = [];

    // for (const imageUri of serviceImages) {
    //   const uploadedUrl = await uploadImageToFbStorage(imageUri);
    //   if (uploadedUrl) {
    //     uploadedImageUrls.push(uploadedUrl);
    //   }
    // }
    // setServiceImages(uploadedImageUrls);
    const modifiedData = {
      id,
      workStatus,
      companyUserId: companyUser.id,
      customerId: customer.id,
      description: getValues('workDescription'),
      dateOffer,
      services,
      installationAddress: getValues('installationAddress'),
      serviceImages: [
        'https://firebasestorage.googleapis.com/v0/b/workerfirebase-f1005.appspot.com/o/Test%2F122772%2Fprojects%2F88bb5838-98eb-43bb-91d0-c895a44a7030%2Fworkdelivery%2F3c7ec00a-0f6d-4ebe-9cf7-e66ac5b76a61-png?alt=media',
        'https://firebasestorage.googleapis.com/v0/b/workerfirebase-f1005.appspot.com/o/Test%2F122772%2Fprojects%2F88bb5838-98eb-43bb-91d0-c895a44a7030%2Fworkdelivery%2Fc89f6dd6-efd5-4a0e-bc30-1acf6e96051c-jpg?alt=media',
        'https://firebasestorage.googleapis.com/v0/b/workerfirebase-f1005.appspot.com/o/Test%2F122772%2Fprojects%2F88bb5838-98eb-43bb-91d0-c895a44a7030%2Fworkdelivery%2Ffef5e1ba-1759-4eb9-b689-c552936b88a0-png?alt=media'
      ],
      // serviceImages: uploadedImageUrls,
    };
    console.log('All data  updated', modifiedData);
    await mutate(modifiedData);
  }, [serviceImages, uploadImageToFbStorage]);
  const {initialDateOffer} = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const dateOffer = `${day}-${month}-${year}`;

    return {initialDateOffer: dateOffer};
  }, []) as any;

  const [dateOffer, setDateOffer] = useState<String>(initialDateOffer);

  useEffect(() => {
    setDateOffer(dateOffer);
  }, [dateOffer]);
  const handleDateSigne = (date: Date) => {
    const formattedDate = thaiDateFormatter.format(date);
    setDateOffer(formattedDate);
  };

  if(isLoading || isImageUpload) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#0073BA" />
      </View>
    );
  }
  console.log('route.params', route.params)
  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={
            Platform.OS === 'ios' ? 0 : -Dimensions.get('window').height
          }>
          <ScrollView>
            <View style={styles.card}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  width: '100%',
                  marginVertical: 15,
                }}>
                <Text style={styles.title}>โครงการ: </Text>
                <Text style={{marginTop: 2, marginLeft: 10}}>
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
                  label=""
                  date="today"
                  onDateSelected={handleDateSigne}
                />
              </View>
            </View>

            <View style={{marginTop: 10}}></View>
            <SmallDivider />
            <View style={{alignSelf: 'flex-start', marginVertical: 10}}>
              <Text style={styles.title}>หนังสือส่งงานทำขึ้นที่:</Text>
              <Controller
                control={control}
                name="installationAddress"
                render={({field: {onChange, onBlur, value}}) => (
                  <TextInput
                    multiline
                    numberOfLines={4}
                    style={styles.input}
                    placeholder="เช่นบ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด"
                    onBlur={onBlur}
                    keyboardType="default"
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
            <Divider style={{marginVertical: 20}} />

            <View>
              <Text style={styles.title}>งานที่แจ้งส่ง</Text>
              {services.map((service, index) => (
                <View key={`service-${service.id || index}`}>
                  <Text style={styles.listTitle}>
                    {index + 1}. {service.title}
                  </Text>
                  <Text style={styles.listDescription}>
                    {service.description}
                  </Text>
                </View>
              ))}
            </View>
            <View style={{marginVertical: 20}}></View>

            {/* <Divider style={{marginVertical: 20}} /> */}
            <View>
              <Text style={styles.title}>รูปผลงานที่ส่งมอบ</Text>
              {services.map((service, index) => (
                <>
                  {/* Image Card section */}
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
                            handleUploadMoreImages();

                            // navigation.navigate('GalleryScreen', {code});
                          }}>
                          <FontAwesomeIcon
                            icon={faPlus}
                            size={32}
                            color="#0073BA"
                          />
                        </TouchableOpacity>
                      ) : null
                    }
                    ListEmptyComponent={
                      <View>
                        <TouchableOpacity
                          style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: 20,

                            marginBottom: 20,
                            borderColor: '#0073BA',
                            borderWidth: 1,
                            borderRadius: 5,
                            borderStyle: 'dashed',
                            // marginHorizontal: 100,
                            padding: 20,
                            height: 50,
                            width: 'auto',
                          }}
                          onPress={() => {
                            handleUploadMoreImages();
                          }}>
                          <FontAwesomeIcon
                            icon={faImages}
                            style={{marginVertical: 15, marginHorizontal: 10}}
                            size={24}
                            color="#0073BA"
                          />
                        </TouchableOpacity>
                      </View>
                    }
                  />
                </>
              ))}
            </View>
            <View style={{alignSelf: 'flex-start', marginVertical: 10}}>
              <Text style={styles.title}>รายละเอียดงานที่ส่ง:</Text>
              <Controller
                control={control}
                name="workDescription"
                render={({field: {onChange, onBlur, value}}) => (
                  <TextInput
                    multiline
                    numberOfLines={4}
                    style={styles.input}
                    placeholder="อธิบายภาพรวมของงานที่ส่งมอบ เช่นคุณได้ทำอะไรบ้างในงวดงานนี้.."
                    onBlur={onBlur}
                    keyboardType="default"
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
            <Divider style={{marginVertical: 20}} />
            <View
              style={{
                width: '100%',
                marginTop: 40,
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <SaveButton onPress={handleDone} disabled={false} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default SendWorks;

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  containerForm: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 5,
  },
  container: {
    flex: 1,
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
  },
});
