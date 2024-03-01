import React, {
  useContext,
  useMemo,
  useState
} from 'react';
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
  View
} from 'react-native';
import { Appbar, Button, ProgressBar } from 'react-native-paper';

import {
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { yupResolver } from '@hookform/resolvers/yup';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  FormProvider,
  useFieldArray,
  useForm,
  useWatch
} from 'react-hook-form';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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
import useThaiDateFormatter from '../../hooks/utils/useThaiDateFormatter';
import { Store } from '../../redux/store';
import { Service } from '../../types/docType';
import { ParamListBase } from '../../types/navigationType';

import ExistingWorkers from '../../components/workers/existing';
import {
  quotationsValidationSchema
} from '../utils/validationSchema';

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
  const [workerPicker, setWorkerpicker] = useState(false);
  const [singatureModal, setSignatureModal] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
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
    workers: quotation.workers
      ? quotation.workers
      : '',
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

  const sellerSignature = useWatch({
    control: methods.control,
    name: 'sellerSignature',
  });

  console.log('customer', customer);

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
  const [pickerVisible, setPickerVisible] = useState(sellerSignature !== ''? true : false);

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
  const onCloseSignature = () => {
    setPickerVisible(false);
    setSignatureModal(false);
    methods.setValue('sellerSignature', '', {shouldDirty: true});
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
        currentValue: null,
      });
      // navigation.navigate('ExistingProduct', {id: companyUser.user?.id});
    } else {
      console.log('companyUser', companyUser);
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
      throw new Error(error as any);
      setIsLoadingMutation(false);
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
  console.log('quotation', quotation);
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
              title='วันที่เสนอราคา'
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
              title='ยืนราคาถึงวันที่ี'
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
                  value={pickerVisible ? true : false}
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
