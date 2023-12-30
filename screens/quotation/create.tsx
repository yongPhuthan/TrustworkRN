import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
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
import DocNumber from '../../components/DocNumber';
import AddClient from '../../components/AddClient';
import AddServices from '../../components/AddServices';
import Summary from '../../components/Summary';
import Divider from '../../components/styles/Divider';
import {NavigationContainer} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import EditCustomer from '../../components/edit/customer/EditCustomer';
import {
  useForm,
  Controller,
  FormProvider,
  useFieldArray,
} from 'react-hook-form';
import {
  HOST_URL,
  PROJECT_FIREBASE,
  PROD_API_URL,
  BACK_END_SERVER_URL,
} from '@env';
import Modal from 'react-native-modal';
import firebase from '../../firebase';
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
import axios, {AxiosResponse, AxiosError} from 'axios';
import {useUser} from '../../providers/UserContext';
import messaging from '../../firebase';
import {Audit, CompanyUser, Service} from '../../types/docType';
import {ParamListBase} from '../../types/navigationType';
import useThaiDateFormatter from '../../hooks/utils/useThaiDateFormatter';
import SignatureComponent from '../../components/utils/signature';
import EditProductForm from '../../components/edit/products/EditProduct';
import SmallDivider from '../../components/styles/SmallDivider';
import {
  quotationsValidationSchema,
  customersValidationSchema,
} from '../utils/validationSchema';
import Addservices from '../../components/add/AddServices';
interface Props {
  navigation: StackNavigationProp<ParamListBase, 'Quotation'>;
}

const Quotation = ({navigation}: Props) => {
  const {
    state: {
      client_name,
      selectedContract,
      serviceList,
      client_address,
      client_tel,
      client_tax,
      isEmulator,
      companyID,
    },
    dispatch,
  }: any = useContext(Store);
  // const { data, isLoading } = useQuery('data', fetchData);
  const [email, setEmail] = useState('');
  const [isLoadingMutation, setIsLoadingMutation] = useState(false);

  const [total, setTotal] = useState(0);
  const [companyUser, setCompanyUser] = useState<CompanyUser>();
  const [discountValue, setDiscountValue] = useState(0);
  const [summaryAfterDiscount, setSumAfterDiscount] = useState(0);
  const [vat7Amount, setVat7Amount] = useState(0);
  const [addCustomerModal, setAddCustomerModal] = useState(false);
  const [editCustomerModal, setEditCustomerModal] = useState(false);
  const [vat5Amount, setVat5Amount] = useState(0);
  const thaiDateFormatter = useThaiDateFormatter();
  const [addServicesModal, setAddServicesModal] = useState(false);
  const user = useUser();
  const [vat3Amount, setVat3Amount] = useState(0);
  // const {fetchCompanyUser} = useFetchCompanyUser();
  const [productWarantyYear, setProductWarantyYear] = useState(0);
  const [skillWarantyYear, setSkillWarantyYear] = useState(0);
  const [editServicesModal, setEditServicesModal] = useState(false);

  // const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [docNumber, setDocnumber] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [token, setToken] = useState<FirebaseAuthTypes.User | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [singatureModal, setSignatureModal] = useState(false);
  const [signature, setSignature] = useState('');
  const [serviceIndex, setServiceIndex] = useState(0);
  const quotationId = uuidv4();
  const [fcmToken, setFtmToken] = useState('');
  const id = uuidv4();
  const [discount, setDiscount] = useState('0');

  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [visibleModalIndex, setVisibleModalIndex] = useState<number | null>(
    null,
  );
  const dataSignature = {};
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
        console.log('fcmToken', fcmToken);
        setFtmToken(fcmToken);
      }

      return data;
    }
  };
  const {docnumber: initialDocnumber, initialDateOffer, initialDateEnd} = useMemo(() => {
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
    quotationId: id,
    audits: [defaultAudit],
    materials: [defaultMaterial],
  };
  

  const quotationDefaultValues = {
    id: id,
    services: [],
    customer: defalutCustomer,
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

  const customer = methods.getValues('customer');
  const services = methods.getValues('services');
  const isCustomerDisabled = useMemo(() => {
    return customer.name === '' && customer.address === '';
  }, [customer.name, customer.address]);
  const isServicesDisbled = useMemo(() => {
    return services[0]?.title === '' || services[0]?.unitPrice === '';
  }, [services]);

  const totalPrice = useMemo(() => {
    let total = 0;
    for (let i = 0; i < methods.watch('services').length; i++) {
      total += Number(methods.watch(`services[${i}].total`));
    }
    return methods.setValue
  }, [ methods.watch('services')]);

  const isDisabled = !client_name || serviceList.length === 0;

  const {data, isLoading, isError} = useQuery(
    ['companyUser', email],
    () => fetchCompanyUser().then(res => res),
    {
      onSuccess: data => {
        setCompanyUser(data);

        dispatch(stateAction.get_companyID(data.user.id));
      },
    },
  );
  const handleValuesChange = (
    total: number,
    discountValue: number,
    sumAfterDiscount: number,
    vat7Amount: number,
    vat3Amount: number,
  ) => {
    setTotal(total);
    setDiscountValue(discountValue);
    setSumAfterDiscount(sumAfterDiscount);
    setVat7Amount(vat7Amount);
    setVat3Amount(vat3Amount);
  };

  // const handleCustomerNameChange = (value: string) => {
  //   setCustomerName(value);
  // };

  const useSignature = () => {
    if (companyUser?.signature) {
      setPickerVisible(!pickerVisible);
      setSignature(companyUser?.signature);
    } else {
      setSignatureModal(!singatureModal);
      setPickerVisible(!pickerVisible);
    }
  };
  const handleSignatureSuccess = () => {
    setSignatureModal(false);
  };
  const handleAddClientForm = () => {
    navigation.navigate('AddCustomer');
  };

  const handleModal = () => {
    console.log('SHOW');
    setShowEditServiceModal(true);
  };
  const handleModalClose = () => {
    setVisibleModalIndex(null);
  };

  const handleAddProductForm = async () => {
    if (companyUser?.user) {
      // setAddServicesModal(!addServicesModal);
      dispatch(stateAction.reset_audit());
      navigation.navigate('AddProduct', {
        onAddService: newProduct => append(newProduct),
        quotationId: quotationId,
      });
      // navigation.navigate('ExistingProduct', {id: companyUser.user?.id});
    } else {
      await firebase.auth().signOut();
    }
  };
  const handleEditServiceCallback = useCallback(
    index => {
      setServiceIndex(index);
      handleModalClose();
      setEditServicesModal(true);
    },
    [setServiceIndex, handleModalClose, setEditServicesModal],
  );
  const handleEditService = (index: number, currentValue) => {
    setShowEditServiceModal(!showEditServiceModal);
    handleModalClose();
    navigation.navigate('EditProductForm', {index, currentValue, update});
  };

  const handleEditClient = () => {
    navigation.navigate('EditClientForm');
  };
  const handleCustomerAddressChange = (value: string) => {
    setCustomerAddress(value);
  };
  const handleButtonPress = async () => {
    setIsLoadingMutation(true);
    try {
      const clientData = {
        id: uuidv4(),
        name: client_name,
        address: client_address,
        companyId: client_tax,
        phone: client_tel,
      };
      const apiData = {
        data: {
          id: quotationId,
          summary: totalPrice,
          services: serviceList,
          customer: clientData,
          vat7: vat7Amount,
          taxValue: vat3Amount,
          taxName: '',
          dateEnd,
          discountValue: discountValue ? discountValue : 0,
          discountName: 'percent',
          dateOffer,
          FCMToken: fcmToken,
          docNumber,
          skillWarantyYear,
          productWarantyYear,
          summaryAfterDiscount,
          allTotal: totalPrice,
          sellerSignature: '',
          offerContract: idContractList,
          userId: companyID,
        },
      };
      if (vat3Amount > 0) {
        apiData.data.taxName = 'vat3';
        apiData.data.taxValue = vat3Amount;
      } else if (vat5Amount > 0) {
        apiData.data.taxName = 'vat5';
        apiData.data.taxValue = vat5Amount;
      } else {
        apiData.data.taxName = 'none';
        apiData.data.taxValue = 0;
      }
      navigation.navigate('DefaultContract', {data: apiData} as any);

      setIsLoadingMutation(false);
    } catch (error: Error | AxiosError | any) {
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


  const [dateOffer, setDateOffer] = useState<String>(initialDateOffer);
  const [dateEnd, setDateEnd] = useState<String>(initialDateEnd);



  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }
  const idContractList = selectedContract.map((obj: any) => obj.id);

  const handleRemoveService = (index: number) => {
    setVisibleModalIndex(null);

    // Remove the field at the specified index using the remove method
    remove(index);
  };
  return (
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
              <CardClient handleEditClient={() => setEditCustomerModal(true)} />
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
            <View>
          <Pressable
            onPress={() => navigation.navigate('ExistingWorkers', {id:companyID})}
            style={styles.btn}>
            <Text style={{color:'white'}}>เลือกทีมงานติดตั้ง</Text>
          </Pressable>
        </View>
            {/* <Divider /> */}
            <Summary
              title={'ยอดรวม'}
              price={200}
              onValuesChange={handleValuesChange}
            />
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
              <View style={styles.containerModal}>
                <Text style={styles.modalTitle}>ลายเซ็นผู้เสนอราคา</Text>
                <SignatureComponent
                  onClose={() => setSignatureModal(false)}
                  setSignatureUrl={setSignature}
                  onSignatureSuccess={handleSignatureSuccess}
                />
              </View>
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
          isVisible={editCustomerModal}
          style={styles.modalFull}
          onBackdropPress={() => setEditCustomerModal(false)}>
          <EditCustomer onClose={() => setEditCustomerModal(false)} />
        </Modal>

        <Modal
          isVisible={editServicesModal}
          style={styles.modalServiceFull}
          onBackdropPress={() => setEditServicesModal(false)}>
          <EditProductForm
            quotationId={quotationId}
            onClose={() => setEditServicesModal(false)}
            serviceIndex={serviceIndex}
          />
        </Modal>
        <View>
          <FooterBtn
            btnText="ดำเนินการต่อ"
            disabled={isDisabled}
            onPress={handleButtonPress}
          />
        </View>
      </View>
    </FormProvider>
  );
};

export default Quotation;
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
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
    marginTop: 50,
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
  header: {
    flexDirection: 'row',
    marginTop: 40,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
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
    marginTop: 100,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 10,
    height: windowHeight * 0.2,
  },
  closeButton: {
    paddingVertical: 10,
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
    marginLeft: 20,

    fontFamily: 'Sukhumvit set',
  },
});
