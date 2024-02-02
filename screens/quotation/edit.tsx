import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  ScrollView,
  FlatList,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Switch,
} from 'react-native';
import {v4 as uuidv4} from 'uuid';
import React, {
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import {ProgressBar, MD3Colors, Appbar, Button} from 'react-native-paper';

import DocNumber from '../../components/DocNumber';
import AddClient from '../../components/AddClient';
import AddServices from '../../components/AddServices';
import Summary from '../../components/Summary';
import Divider from '../../components/styles/Divider';
import {NavigationContainer} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faCloudUpload,
  faEdit,
  faPlus,
  faImages,
  faPlusCircle,
} from '@fortawesome/free-solid-svg-icons';
import EditCustomer from '../../components/edit/customer/EditCustomer';
import {
  useForm,
  Controller,
  FormProvider,
  useWatch,
  useFieldArray,
  set,
} from 'react-hook-form';
import {
  HOST_URL,
  PROJECT_FIREBASE,
  PROD_API_URL,
  BACK_END_SERVER_URL,
} from '@env';
import Modal from 'react-native-modal';
import firebase from '../../firebase';
import {useRoute} from '@react-navigation/native';
import {faCamera, faClose} from '@fortawesome/free-solid-svg-icons';
import CardProject from '../../components/CardProject';
import CardClient from '../../components/CardClient';
import FooterBtn from '../../components/styles/FooterBtn';
import DatePickerButton from '../../components/styles/DatePicker';
import {Store} from '../../redux/store';
import * as stateAction from '../../redux/actions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useQuery} from '@tanstack/react-query';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import Signature from 'react-native-signature-canvas';
import {yupResolver} from '@hookform/resolvers/yup';
import AddCustomer from '../../components/add/AddCustomer';
import AddProductForm from '../../components/edit/products/addProduct';
import {useUser} from '../../providers/UserContext';
import messaging from '../../firebase';
import {Audit, CompanyUser, Quotation, Service} from '../../types/docType';
import {ParamListBase} from '../../types/navigationType';
import useThaiDateFormatter from '../../hooks/utils/useThaiDateFormatter';
import SignatureComponent from '../../components/utils/signature';
import EditProductForm from '../../components/edit/products/EditProduct';
import SmallDivider from '../../components/styles/SmallDivider';
import {RouteProp} from '@react-navigation/native';

import {
  quotationsValidationSchema,
  customersValidationSchema,
} from '../utils/validationSchema';
import ExistingWorkers from '../../components/workers/existing';
import ServiceContext from '../../providers/ServiceContext';

interface Props {
  navigation: StackNavigationProp<ParamListBase, 'EditQuotation'>;
  route: RouteProp<ParamListBase, 'EditQuotation'>;
}
interface MyError {
  response: object;
}

const EditQuotation = ({navigation, route}: Props) => {
  const {dispatch}: any = useContext(Store);
  const [isLoadingMutation, setIsLoadingMutation] = useState(false);
  const companyUser = route.params.company;
  const quotation = route.params.quotation;
  const servicesParams = route.params.services;
  const [addCustomerModal, setAddCustomerModal] = useState(false);
  const [editCustomerModal, setEditCustomerModal] = useState(false);
  const thaiDateFormatter = useThaiDateFormatter();
  const [editServicesModal, setEditServicesModal] = useState(false);
  const [workerModal, setWorkerModal] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [workerPicker, setWorkerpicker] = useState(false);
  const [singatureModal, setSignatureModal] = useState(false);
  const [signature, setSignature] = useState('');
  const [serviceIndex, setServiceIndex] = useState(0);
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [visibleModalIndex, setVisibleModalIndex] = useState<number | null>(
    null,
  );
  const quotationDefaultValues = {
    id: quotation.id,
    services: servicesParams,
    customer: quotation.customer,
    companyUser,
    vat7: quotation.vat7 ? quotation.vat7 : 0,
    taxType: quotation.taxType ? quotation.taxType : 'NOTAX',
    taxValue: quotation.taxValue ? quotation.taxValue : 0,
    summary: quotation.summary,
    summaryAfterDiscount: quotation.summaryAfterDiscount,
    discountType: quotation.discountType,
    discountPercentage: quotation.discountPercentage,
    discountValue: quotation.discountValue,
    allTotal: quotation.allTotal,
    dateOffer: quotation.dateOffer,
    dateEnd: quotation.dateEnd,
    docNumber: quotation.docNumber,
    workers: quotation.workers?  quotation.workers.map((item: any) => item.worker):'',
    sellerSignature: quotation.sellerSignature,
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

  const quotationId = useWatch({
    control: methods.control,
    name: 'id',
  });
  const isCustomerDisabled = useMemo(() => {
    return customer.name === '' && customer.address === '';
  }, [customer.name, customer.address]);

  const isDisabled = !customer.name || services.length === 0;

  const useSignature = () => {
    if (companyUser?.signature) {
      setPickerVisible(!pickerVisible);
      setSignature(companyUser?.signature);
    } else {
      setSignatureModal(!singatureModal);
      setPickerVisible(!pickerVisible);
    }
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
    if (companyUser) {
      navigation.navigate('AddProduct', {
        onAddService: newProduct => append(newProduct),
        quotationId: quotationId,
        currentValue:null
      });
      // navigation.navigate('ExistingProduct', {id: companyUser.user?.id});
    } else {
      console.log('companyUser', companyUser);
      // await firebase.auth().signOut();
    }
  };

  const handleEditService = (index: number, currentValue:Service) => {
    setShowEditServiceModal(!showEditServiceModal);
    handleModalClose();
    navigation.navigate('AddProduct', {
      onAddService: newProduct => update(index,newProduct),
      currentValue,
      quotationId: quotationId,
    });
    // navigation.navigate('EditProductForm', {index, currentValue, update});
  };

  const handleButtonPress = async () => {
    setIsLoadingMutation(true);
    const currentValues = methods.getValues();
    // const defaultValues = methods.formState.defaultValues as Quotation;
    // const changedValues = Object.keys(defaultValues).reduce((acc, key) => {
    //   if (currentValues[key] !== defaultValues[key]) {
    //     acc[key] = currentValues[key];
    //   }
    //   return acc;
    // }, {}) as Quotation;

    // console.log('changedValues', changedValues);

    try {
      navigation.navigate('EditDefaultContract', {
        data: currentValues,
        quotationId,
      });

      setIsLoadingMutation(false);
    } catch (error) {
      console.error('There was a problem calling the function:', error);
      console.log(error.response ? error.response : error);
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

  const handleRemoveService = (index: number) => {
    setVisibleModalIndex(null);
    remove(index);
  };
  console.log('services', services);
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
          title="แก้ไขใบเสนอราคา"
          titleStyle={{fontSize: 18, fontWeight: 'bold'}}
        />
        <Button
          // loading={postLoading}
          disabled={isDisabled}
          mode="contained"
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
                  onValueChange={() => useSignature()}
                  value={signature ? true : false}
                  style={Platform.select({
                    ios: {
                      transform: [{scaleX: 0.7}, {scaleY: 0.7}],
                      marginTop: 5,
                    },
                    android: {},
                  })}
                />
              </View>
              <Modal
                isVisible={singatureModal}
                style={styles.modal}
                onBackdropPress={() => setSignatureModal(false)}>
                <SafeAreaView style={styles.containerModal}>
                  <View style={styles.header}>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setSignatureModal(false)}>
                      <FontAwesomeIcon icon={faClose} size={24} color="gray" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.modalTitle}>ลายเซ็นผู้เสนอราคา</Text>
                  <SignatureComponent
                    onClose={() => setSignatureModal(false)}
                    setSignatureUrl={setSignature}
                    onSignatureSuccess={handleSignatureSuccess}
                  />
                </SafeAreaView>
              </Modal>
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
      </FormProvider>
    </>
  );
};

export default EditQuotation;
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
    marginTop: 10,
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
