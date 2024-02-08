import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Appbar,
  Button,
  ProgressBar,
  ActivityIndicator,
  
} from 'react-native-paper';

import {BACK_END_SERVER_URL} from '@env';
import {faPlus} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {yupResolver} from '@hookform/resolvers/yup';
import {StackNavigationProp} from '@react-navigation/stack';
import {useQuery} from '@tanstack/react-query';
import React, {useContext, useMemo, useState} from 'react';
import {FormProvider, useFieldArray, useForm, useWatch} from 'react-hook-form';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {v4 as uuidv4} from 'uuid';
import AddClient from '../../components/AddClient';
import AddServices from '../../components/AddServices';
import CardClient from '../../components/CardClient';
import CardProject from '../../components/CardProject';
import DocNumber from '../../components/DocNumber';
import Summary from '../../components/Summary';
import AddCustomer from '../../components/add/AddCustomer';
import DatePickerButton from '../../components/styles/DatePicker';
import Divider from '../../components/styles/Divider';
import SmallDivider from '../../components/styles/SmallDivider';
import SignatureComponent from '../../components/utils/signature';
import ExistingWorkers from '../../components/workers/existing';
import firebase from '../../firebase';
import useThaiDateFormatter from '../../hooks/utils/useThaiDateFormatter';
import {useUser} from '../../providers/UserContext';
import * as stateAction from '../../redux/actions';
import {Store} from '../../redux/store';
import {CompanyUser, Service} from '../../types/docType';
import {ParamListBase} from '../../types/navigationType';
import {quotationsValidationSchema} from '../utils/validationSchema';
interface Props {
  navigation: StackNavigationProp<ParamListBase, 'Quotation'>;
}

const Quotation = ({navigation}: Props) => {
  const {dispatch}: any = useContext(Store);
  // const { data, isLoading } = useQuery('data', fetchData);
  const [email, setEmail] = useState('');
  const [isLoadingMutation, setIsLoadingMutation] = useState(false);

  const [total, setTotal] = useState(0);
  const [companyUser, setCompanyUser] = useState<CompanyUser>();

  const [addCustomerModal, setAddCustomerModal] = useState(false);

  const thaiDateFormatter = useThaiDateFormatter();
  const user = useUser();
  // const {fetchCompanyUser} = useFetchCompanyUser();

  const [workerModal, setWorkerModal] = useState(false);
  // const [customerName, setCustomerName] = useState('');

  const [pickerVisible, setPickerVisible] = useState(false);
  const [workerPicker, setWorkerpicker] = useState(false);

  const [singatureModal, setSignatureModal] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [serviceIndex, setServiceIndex] = useState(0);
  const quotationId = uuidv4();
  const [fcmToken, setFtmToken] = useState('');
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [visibleModalIndex, setVisibleModalIndex] = useState<number | null>(
    null,
  );
  const dataSignature = {};

  const {
    docnumber: initialDocnumber,
    initialDateOffer,
    initialDateEnd,
  } = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 900) + 100;
    const docnumber = `${year}${month}${day}${randomNum}`;

    const dateOffer = `${day}-${month}-${year}`;

    const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const endYear = endDate.getFullYear();
    const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
    const endDay = String(endDate.getDate()).padStart(2, '0');
    const dateEnd = `${endDay}-${endMonth}-${endYear}`;

    return {initialDateOffer: dateOffer, initialDateEnd: dateEnd, docnumber};
  }, []) as any;
  const defaultAudit = {
    AuditData: {
      id: 0,
      number: 0,
      image: '',
      title: '',
      content: '',
      auditEffectDescription: '',
      auditEffectImage: '',
      auditShowTitle: '',
      category: '',
      subCategory: '',
      defaultChecked: false,
    },
  };
  const defaultMaterial = {
    materialData: {
      id: 0,
      name: '',
      description: '',
      image: '',
    },
  };

  const defalutCustomer = {
    id: '',
    name: '',
    address: '',
    companyId: '',
    phone: '',
  };

  const defaultService = {
    id: '',
    title: '',
    description: '',
    unitPrice: 0,
    qty: 1,
    discountPercent: 0,
    total: 0,
    unit: 'ชุด',
    serviceImage: '',
    serviceImages: [],
    // quotationId,
    audits: [defaultAudit],
    materials: [defaultMaterial],
  };

  const quotationDefaultValues = {
    // id: quotationId,
    services: [],
    customer: defalutCustomer,
    companyUser: null,
    vat7: 0,
    taxType: 'NOTAX',
    taxValue: 0,
    summary: 0,
    summaryAfterDiscount: 0,
    discountType: 'PERCENT',
    discountPercentage: 0,
    discountValue: 0,
    allTotal: 0,
    dateOffer: initialDateOffer,
    dateEnd: initialDateEnd,
    docNumber: initialDocnumber,
    workers: [],
    FCMToken: fcmToken,
    sellerSignature: '',
  };

  const methods = useForm<any>({
    mode: 'all',
    defaultValues: quotationDefaultValues,
    resolver: yupResolver(quotationsValidationSchema),
  });
  const {fields, append, remove, update} = useFieldArray({
    control: methods.control,
    name: 'services',
  });

  const fetchCompanyUser = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    } else {
      const idToken = await user.getIdToken(true);
      const {email} = user;
      if (!email) {
        throw new Error('Email not found');
      }

      let url = `${BACK_END_SERVER_URL}/api/company/getCompanySeller?email=${encodeURIComponent(
        email,
      )}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      // Register the device for remote messages
      await firebase.messaging().requestPermission();

      // Now, get the FCM token
      const fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        methods.setValue('FCMToken', fcmToken);
      }

      return data;
    }
  };

  const customer = useWatch({
    control: methods.control,
    name: 'customer',
  });

  const workers = useWatch({
    control: methods.control,
    name: 'workers',
  });
  const services = useWatch({
    control: methods.control,
    name: 'services',
  });
  const isCustomerDisabled = useMemo(() => {
    return customer.name === '' && customer.address === '';
  }, [customer.name, customer.address]);

  const isDisabled = !customer.name || services.length === 0;

  const {data, isLoading, isError} = useQuery(
    // ['companyUser', email],

    {
      queryKey: ['companyUser', email],
      queryFn: fetchCompanyUser,

      onSuccess: data => {
        setCompanyUser(data);
        methods.setValue('companyUser', data.user);
        dispatch(stateAction.get_companyID(data.user.id));
      },
    },
  );

  const useSignature = () => {
    // Toggle the state of the picker and accordingly set the modal visibility
    setPickerVisible(prevPickerVisible => {
      const newPickerVisible = !prevPickerVisible;
      setSignatureModal(newPickerVisible);
      if (!newPickerVisible) {
        methods.setValue('sellerSignature', '', {shouldDirty: true});
      } else {
        methods.setValue('sellerSignature', signature, {shouldDirty: true});
      }
      return newPickerVisible;
    });
  };

  const useWorkers = () => {
    if (!workerPicker) {
      if (workers.length > 0) {
        setWorkerModal(false);
        setWorkerpicker(!workerPicker);
      } else {
        setWorkerModal(true);
        setWorkerpicker(!workerPicker);
      }
    } else {
      methods.setValue('workers', []);
      setWorkerpicker(!workerPicker);
    }
  };
  const handleSignatureSuccess = () => {
    setSignatureModal(false);
  };
  const handleModalClose = () => {
    setVisibleModalIndex(null);
  };

  const handleAddProductForm = async () => {
    if (companyUser?.user) {
      navigation.navigate('AddProduct', {
        onAddService: newProduct => append(newProduct),
        quotationId: quotationId,
        currentValue: null,
      });
      // navigation.navigate('ExistingProduct', {id: companyUser.user?.id});
    } else {
      console.log('no user');
      // await firebase.auth().signOut();
    }
  };

  const handleEditService = (index: number, currentValue: Service) => {
    setShowEditServiceModal(!showEditServiceModal);
    handleModalClose();
    navigation.navigate('AddProduct', {
      onAddService: newProduct => update(index, newProduct),
      currentValue,
      quotationId: quotationId,
    });
    // navigation.navigate('EditProductForm', {index, currentValue, update});
  };

  const handleButtonPress = async () => {
    setIsLoadingMutation(true);
    try {
      navigation.navigate('DefaultContract', {
        data: methods.getValues(),
      } as any);

      setIsLoadingMutation(false);
    } catch (error: Error | any) {
      console.error('There was a problem calling the function:', error);
      console.log(error.response);
    }
  };

  const handleInvoiceNumberChange = (text: string) => {
    methods.setValue('docNumber', text);
  };

  const handleStartDateSelected = (date: Date) => {
    const formattedDate = thaiDateFormatter(date);
    methods.setValue('dateOffer', formattedDate);
  };
  const handleEndDateSelected = (date: Date) => {
    const formattedEndDate = thaiDateFormatter(date);
    methods.setValue('dateEnd', formattedEndDate);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={'large'} />
      </View>
    );
  }

  const handleRemoveService = (index: number) => {
    setVisibleModalIndex(null);
    remove(index);
  };

  const onCloseSignature = () => {
    setPickerVisible(false);
    setSignatureModal(false);
    methods.setValue('sellerSignature', '', {shouldDirty: true});
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
          title="สร้างใบเสนอราคา"
          titleStyle={{
            fontSize: 18,
            fontWeight: 'bold',
            fontFamily: 'Sukhumvit Set Bold',
          }}
        />
        <Button
          // loading={postLoading}
          disabled={isDisabled}
          mode="contained"
          icon={'arrow-right'}
          contentStyle={{
            flexDirection: 'row-reverse',
          }}
          buttonColor={'#1b72e8'}
          onPress={handleButtonPress}>
          {'ไปต่อ'}
        </Button>
      </Appbar.Header>
      <ProgressBar progress={0.5} color={'#1b52a7'} />

      <FormProvider {...methods}>
        <View style={{flex: 1}}>
          <ScrollView style={styles.container}>
            <View style={styles.subContainerHead}>
              <DatePickerButton
                label="วันที่เสนอราคา"
                title="วันที่เสนอราคา"
                date="today"
                onDateSelected={handleStartDateSelected}
              />
              <DocNumber
                label="เลขที่เอกสาร"
                onChange={handleInvoiceNumberChange}
                value={methods.watch('docNumber')}
              />
              <DatePickerButton
                label="ยืนราคาถึงวันที่ี"
                title="ยืนราคาถึงวันที่ี"
                date="sevenDaysFromNow"
                onDateSelected={handleEndDateSelected}
              />
            </View>
            <View style={styles.subContainer}>
              {!isCustomerDisabled ? (
                <CardClient
                  handleEditClient={() => setAddCustomerModal(true)}
                />
              ) : (
                <AddClient handleAddClient={() => setAddCustomerModal(true)} />
              )}

              <View style={styles.header}>
                <Icon
                  style={styles.icon}
                  name="briefcase"
                  size={20}
                  color="#19232e"
                />
                <Text style={styles.label}>บริการ-สินค้า</Text>
              </View>
              {fields.length > 0 &&
                fields.map((field: any, index: number) => (
                  <CardProject
                    handleModalClose={handleModalClose}
                    visibleModalIndex={visibleModalIndex === index}
                    setVisibleModalIndex={() => setVisibleModalIndex(index)}
                    index={index}
                    handleRemoveService={() => handleRemoveService(index)}
                    handleEditService={() => handleEditService(index, field)}
                    serviceList={field}
                    key={field.id}
                  />
                ))}

              <AddServices handleAddProductFrom={handleAddProductForm} />
              <Divider />

              {/* <Divider /> */}
              <Summary
                vat7Props={Number(methods.watch('vat7')) === 0 ? false : true}
                taxProps={
                  methods.watch('taxType') !== 'NOTAX'
                    ? methods.watch('taxType') === 'TAX3'
                      ? 3
                      : 5
                    : 0
                }
                pickerTaxProps={
                  methods.watch('taxType') !== 'NOTAX' ? true : false
                }
              />
              <SmallDivider />
              <View style={styles.signatureRow}>
                <Text style={styles.signHeader}>เพิ่มทีมงานติดตั้ง</Text>
                <Switch
                  trackColor={{false: '#767577', true: '#81b0ff'}}
                  thumbColor={workerPicker ? '#ffffff' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => useWorkers()}
                  value={workers.length > 0 ? true : false}
                  style={Platform.select({
                    ios: {
                      transform: [{scaleX: 0.7}, {scaleY: 0.7}],
                      marginTop: 5,
                    },
                    android: {},
                  })}
                />
              </View>
              {/* workers */}
              {workers.length > 0 && (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 10,
                  }}>
                  <FlatList
                    data={workers}
                    horizontal={true}
                    renderItem={({item, index}) => {
                      return (
                        <View style={styles.imageContainer}>
                          <TouchableOpacity
                            onPress={() => setWorkerModal(true)}>
                            <Image
                              source={{uri: item.image}}
                              style={styles.image}
                            />
                            <Text>{item.name}</Text>
                          </TouchableOpacity>
                        </View>
                      );
                    }}
                    keyExtractor={(item, index) => index.toString()}
                    ListFooterComponent={
                      workers.length > 0 ? (
                        <TouchableOpacity
                          style={styles.addButtonContainer}
                          onPress={() => {
                            setWorkerModal(true);
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
                    // ListEmptyComponent={
                    //   <View>
                    //     <TouchableOpacity
                    //       style={{
                    //         justifyContent: 'center',
                    //         alignItems: 'center',
                    //         marginBottom: 20,
                    //         borderColor: '#0073BA',
                    //         borderWidth: 1,
                    //         borderRadius: 5,
                    //         borderStyle: 'dashed',
                    //         // marginHorizontal: 100,
                    //         padding: 10,
                    //         height: 150,
                    //         width: 200,
                    //       }}
                    //       onPress={() => {
                    //         setWorkerModal(true);
                    //       }}>
                    //       <FontAwesomeIcon
                    //         icon={faImages}
                    //         style={{marginVertical: 5, marginHorizontal: 50}}
                    //         size={32}
                    //         color="#0073BA"
                    //       />
                    //       <Text
                    //         style={{
                    //           textAlign: 'center',
                    //           color: '#0073BA',
                    //           fontFamily: 'Sukhumvit set',
                    //         }}>
                    //         เลือกภาพตัวอย่างผลงาน
                    //       </Text>
                    //     </TouchableOpacity>
                    //   </View>
                    // }
                  />
                </View>
              )}
              <SmallDivider />
              <View style={styles.signatureRow}>
                <Text style={styles.signHeader}>เพิ่มลายเซ็น</Text>
                <Switch
                  trackColor={{false: '#767577', true: '#81b0ff'}}
                  thumbColor={pickerVisible ? '#ffffff' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={useSignature}
                  value={pickerVisible}
                  style={Platform.select({
                    ios: {
                      transform: [{scaleX: 0.7}, {scaleY: 0.7}],
                      marginTop: 5,
                    },
                    android: {},
                  })}
                />
              </View>
            </View>
          </ScrollView>
          <Modal
            isVisible={addCustomerModal}
            style={styles.modalFull}
            onBackdropPress={() => setAddCustomerModal(false)}>
            <AddCustomer onClose={() => setAddCustomerModal(false)} />
          </Modal>

          <Modal
            isVisible={workerModal}
            onBackdropPress={() => setWorkerModal(false)}
            style={styles.modal}>
            <Appbar.Header
              mode="center-aligned"
              style={{
                backgroundColor: 'white',
                width: Dimensions.get('window').width,
              }}>
              <Appbar.Action
                icon={'close'}
                onPress={() => {
                  setWorkerpicker(!workerPicker);
                  setWorkerModal(false);
                }}
              />
              <Appbar.Content
                title="เลือกทีมงานติดตั้ง"
                titleStyle={{fontSize: 18, fontWeight: 'bold'}}
              />
            </Appbar.Header>
            <ExistingWorkers
              onClose={() => {
                setWorkerpicker(!workerPicker);
                setWorkerModal(false);
              }}
              isVisible={workerModal}
            />
          </Modal>
          {/* <View>
          <FooterBtn
            btnText="ดำเนินการต่อ"
            disabled={isDisabled}
            onPress={handleButtonPress}
          />
        </View> */}
        </View>
        <Modal
          isVisible={singatureModal}
          style={styles.modal}
          onBackdropPress={onCloseSignature}>
          <Appbar.Header
            mode="center-aligned"
            style={{
              backgroundColor: 'white',
              width: Dimensions.get('window').width,
            }}>
            <Appbar.Action icon={'close'} onPress={onCloseSignature} />
            <Appbar.Content
              title="ลายเซ็นผู้เสนอราคา"
              titleStyle={{fontSize: 18, fontWeight: 'bold'}}
            />
          </Appbar.Header>
          <SafeAreaView style={styles.containerModal}>
            <SignatureComponent
              onClose={() => setSignatureModal(false)}
              setSignatureUrl={setSignature}
              onSignatureSuccess={handleSignatureSuccess}
            />
          </SafeAreaView>
        </Modal>
      </FormProvider>
    </>
  );
};

export default Quotation;
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const imageContainerWidth = windowWidth / 3 - 10;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e9f7ff',
  },
  subContainerHead: {
    padding: 30,
    marginBottom: 10,
    backgroundColor: '#e9f7ff',
    height: 'auto',
  },
  modalFull: {
    margin: 0,
    marginTop: 40,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: windowWidth,
    height: windowHeight,
  },
  subContainer: {
    backgroundColor: '#ffffff',
    padding: 30,
    marginBottom: 10,
    height: 'auto',
  },
  form: {
    border: '1px solid #0073BA',
    borderRadius: 10,
  },
  imageContainer: {
    width: imageContainerWidth,
    borderWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'column',
    margin: 5,
    position: 'relative',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    width: '90%',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    // bottom: '40%',
    left: 0,
  },
  closeButtonText: {
    fontSize: 20,
    borderBottomWidth: 1,
    borderColor: 'white',
    paddingBottom: 10,
    paddingTop: 10,
    fontWeight: 'bold',
    fontFamily: 'Sukhumvit set',
  },
  deleteButtonText: {
    fontSize: 18,
    borderBottomWidth: 1,
    fontWeight: 'bold',
    textDecorationColor: 'red',
    color: 'red',
    borderColor: 'white',
    paddingBottom: 10,
    fontFamily: 'Sukhumvit set',
    paddingTop: 10,
  },

  date: {
    textAlign: 'right',
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
  button: {
    width: '90%',
    top: '30%',
    height: 50,
    backgroundColor: '#0073BA',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 15,
  },
  label: {
    fontSize: 16,
    color: '#19232e',
    fontWeight: 'bold',
    fontFamily: 'Sukhumvit Set Bold',
  },
  closeButton: {
    paddingVertical: 10,
  },
  header: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingVertical: 5,
  },
  selectButton: {
    backgroundColor: '#0073BA',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 5,
    marginTop: 20,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },

  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    flexDirection: 'row',
    width: '100%',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainerForm: {
    marginBottom: 10,
    borderWidth: 0.5,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 15,
    width: 80,
  },
  inputSuffix: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  labelWaranty: {
    // fontFamily: 'sukhumvit set',
    fontSize: 16,
    fontWeight: '400',
    marginTop: 15,
    marginBottom: 10,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 40,
    backgroundColor: '#0073BA',
  },
  signHeader: {
    flexDirection: 'row',
    marginTop: 10,
    fontSize: 16,
    color: '#19232e',
  },
  summaryTotal: {
    flexDirection: 'row',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  pickerWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  pickerAndroidContainer: {
    borderWidth: 0.2,
    borderColor: 'gray',
    height: 40,
    borderRadius: 5,
    backgroundColor: 'white',
    width: 120,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  signText: {
    fontSize: 18,
    marginVertical: 10,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'gray',
    width: '100%',
  },
  modal: {
    marginTop: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 10,
    height: windowHeight * 0.2,
  },

  headerModal: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: '#ffffff',
  },
  containerModal: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    width: windowWidth,
  },
  modalServiceFull: {
    margin: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: windowWidth,
    height: windowHeight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#19232e',
    alignSelf: 'center',
    fontFamily: 'Sukhumvit set',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 0,
    resizeMode: 'cover',
  },
  addButtonContainer: {
    width: 100,
    margin: 5,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#0073BA',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderRadius: 4, // Optional, for rounded edges
  },
});
