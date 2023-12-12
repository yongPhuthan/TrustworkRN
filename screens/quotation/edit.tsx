import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  FlatList,
  Switch,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {v4 as uuidv4} from 'uuid';
import React, {useState, useContext, useEffect, useMemo} from 'react';
import Modal from 'react-native-modal';
import DocNumber from '../../components/DocNumber';
import AddClient from '../../components/AddClient';
import AddServices from '../../components/AddServices';
import Summary from '../../components/Summary';
import Divider from '../../components/styles/Divider';
import {StackNavigationProp} from '@react-navigation/stack';
import CardProject from '../../components/CardProject';
import CardClient from '../../components/CardClient';
import{ParamListBase} from '../../types/navigationType'
import DatePickerButton from '../../components/styles/DatePicker';
import {Store} from '../../redux/store';
import * as stateAction from '../../redux/actions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useQuery, useMutation} from '@tanstack/react-query';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import axios, {AxiosResponse, AxiosError} from 'axios';
import {useRoute} from '@react-navigation/native';
import {HOST_URL,PROJECT_NAME,BACK_END_SERVER_URL} from '@env';
import FooterBtnEdit from '../../components/styles/FooterBtnEdit';
import SignatureComponent from '../../components/utils/signature';
import SmallDivider from '../../components/styles/SmallDivider';
import {
  Audit,
  Quotation,
  IdContractList,
  CompanyUser,
  Service,
} from '../../types/docType';
import type { RouteProp } from '@react-navigation/native';

import useThaiDateFormatter from '../../hooks/utils/useThaiDateFormatter';
import {useFetchDocument} from '../../hooks/quotation/useFetchDocument'; 
import FooterBtn from '../../components/styles/FooterBtn';
interface Props {
  navigation: StackNavigationProp<ParamListBase, 'EditQuotation'>;
  route: RouteProp<ParamListBase, 'EditQuotation'>;

}
interface MyError {
  response: object;
}

const updateQuotation = async (data: any) => {
  const user = auth().currentUser;
  const {
    state: {isEmulator},
    dispatch,
  }: any = useContext(Store);
  let url;
  if (isEmulator) {
    url = `http://${HOST_URL}:5001/${PROJECT_NAME}/asia-southeast1/updateQuotation`;
  } else {
    url = `https://asia-southeast1-${PROJECT_NAME}.cloudfunctions.net/updateQuotation`;
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user?.uid}`,
    },
    body: JSON.stringify({data}),
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
};

const EditQuotation = ({navigation}: Props) => {
  const {
    state: {
      client_name,
      selectedContract,
      serviceList,
      client_address,
      client_tel,
      client_tax,
      selectedAudit,
    },
    dispatch,
  }: any = useContext(Store);
  // const { data, isLoading } = useQuery('data', fetchData);
  const [email, setEmail] = useState('');
  const route = useRoute();
  const [quotation, setQuotation] = useState<Quotation>((route.params as any)?.quotation);
  const [companyUser, setCompanyUser] = useState<CompanyUser>((route.params as any)?.company)
  const [isLoadingMutation, setIsLoadingMutation] = useState(false);
  const [total, setTotal] = useState(quotation.allTotal);
  const thaiDateFormatter = useThaiDateFormatter();
  const [discountValue, setDiscountValue] = useState(quotation.discountValue || 0);
  const [summaryAfterDiscount, setSumAfterDiscount] = useState(quotation.summaryAfterDiscount || 0);
  const [vat7Amount, setVat7Amount] = useState(quotation.vat7 || 0);
  const [vat3Amount, setVat3Amount] = useState(quotation.taxValue === 3  || 0);
  const [customerName, setCustomerName] = useState(quotation.customer?.name);
  const [customerAddress, setCustomerAddress] = useState(quotation.customer?.address);
  const [docNumber, setDocnumber] = useState(quotation.docNumber);
  const [dateOffer, setDateOffer] = useState<String>(quotation.dateOffer);
  const [dateEnd, setDateEnd] = useState<String>(quotation.dateEnd);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [singatureModal, setSignatureModal] = useState(false);
  const quotationId = quotation.id;
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const { fetchDocument} = useFetchDocument();
  const [discount, setDiscount] = useState(quotation.discountValue  || 0);
  const [vat7, setVat7] = useState(Boolean(quotation.vat7))
  const [visibleModalIndex, setVisibleModalIndex] = useState<number | null>(null);
  const isDisabled = !client_name || serviceList.length === 0;
  const [signature, setSignature] = useState('');

  const {mutate} = useMutation(updateQuotation, {
    onSuccess: data => {
      navigation.navigate('WebViewScreen', {id: quotationId});

      // navigation.navigate('WebViewScreen', {id: quotationId});
    },
    onError: (error: MyError) => {
      console.error('There was a problem calling the function:', error);
      console.log(error.response);
    },
  });
  const handleModalClose = () => {
    setVisibleModalIndex(null);
  };

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
  const handleCustomerNameChange = (value: string) => {
    setCustomerName(value);
  };

  const totalPrice = useMemo(() => {
    let total = 0;
    for (let i = 0; i < serviceList.length; i++) {
      total += Number(serviceList[i]?.total || quotation.allTotal);
    }
    return total;
  }, [serviceList]);

  const handleAddClientForm = () => {
    // TODO: Add client to quotation
    navigation.navigate('AddCustomer');
  };

  const handleAddProductForm = () => {
    // TODO: Add client to quotation
    navigation.navigate('AddProduct');
  };
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
  const handleEditService = (index: number) => {
    setShowEditServiceModal(!showEditServiceModal);
    handleModalClose();
    navigation.navigate('EditProductForm', {item: serviceList[index]});
  };
  const handleCustomerAddressChange = (value: string) => {
    setCustomerAddress(value);
  };

  const handleButtonPress = async () => {
    setIsLoadingMutation(true);
    try {
      // Perform mutation
      const resultArray: Service[] = [];
      serviceList.forEach((obj: Service) => {
        const newObj: any = {...obj};
        newObj.audits = obj.audits.map((audit: any) => audit.id);
        resultArray.push(newObj);
      });
      const clientData = {
        id: uuidv4(),
        name: client_name,
        address: client_address,
        companyId: client_tax,
        officePhone: client_tel,
        mobilePhone: client_tel,
      };
      const apiData = {
        data: {
          id: quotationId,
          summary: totalPrice,
          services: resultArray,
          customer: clientData,
          vat7: vat7Amount,
          taxValue: vat3Amount,
          taxName: 'vat3',
          dateEnd,
          discountValue,
          discountName: 'percent',
          dateOffer,
          docNumber,
          
          summaryAfterDiscount,
          allTotal: totalPrice,
          sellerSignature: signature? signature : '',
          offerContract: idContractList,
          conditions: [],
          userId: companyUser?.id,
        },
      };
      console.log('apiData', JSON.stringify(apiData.data.services));

    } catch (error: Error | AxiosError | any) {
      console.error('There was a problem calling the function:', error);
      console.log(error.response);
    }
  };

  const handleInvoiceNumberChange = (text: string) => {
    setDocnumber(text);
  };


  const handleStartDateSelected = (date: Date) => {
    const formattedDate = thaiDateFormatter(date);
    setDateOffer(formattedDate);
    console.log(dateOffer);
  };
  const handleEndDateSelected = (date: Date) => {
    const formattedEndDate = thaiDateFormatter(date);
    setDateEnd(formattedEndDate);
  };

  const handleRemoveService = (index: number) => {
    setVisibleModalIndex(null);
    dispatch(stateAction.remove_serviceList(index));
  };

  const idContractList = selectedContract.map((obj: IdContractList) => obj.id);

  const handleEditClient = () => {
    navigation.navigate('EditClientForm');
  };
  console.log('serviceList Editquoatation', JSON.stringify(serviceList))
  return (
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
            value={docNumber}
          />
          <DatePickerButton
            label="ยืนราคาถึงวันที่ี"
            date="sevenDaysFromNow"
            onDateSelected={handleEndDateSelected}
          />
        </View>
        <View style={styles.subContainer}>
          {client_name ? (
            <CardClient handleEditClient={handleEditClient} />
          ) : (
            <AddClient handleAddClient={handleAddClientForm} />
          )}

          <View style={styles.header}>
            <Icon
              style={styles.icon}
              name="briefcase"
              size={20}
              color="#19232e"
            />
            <Text style={styles.label}>บริการ-สินค้า00</Text>
          </View>
          {serviceList.map((item: any, index: number) => (
            <CardProject
              handleModalClose={handleModalClose}
              visibleModalIndex={visibleModalIndex === index}
              setVisibleModalIndex={()=>setVisibleModalIndex(index)}
              index={index}
              handleRemoveService={() => handleRemoveService(index)}
              handleEditService={() => handleEditService(index)}
              serviceList={item}
              key={index}
            /> 
          ))}

          <AddServices handleAddProductFrom={handleAddProductForm} />
          <Divider />
          {/* <View>
          <Pressable
            onPress={() => navigation.navigate('ExistingWorkers', {id:companyID})}
            style={styles.btn}>
            <Text style={{color:'white'}}>เลือกทีมงานติดตั้ง</Text>
          </Pressable>
        </View> */}
          {/* <Divider /> */}
          <Summary
            title={'ยอดรวม'}
            price={totalPrice}
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
      <View>
        <FooterBtn btnText='ดำเนินการต่อ' disabled={isDisabled} onPress={handleButtonPress} />
      </View>
    </View>
  );
};

export default EditQuotation;
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
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    color: '#19232e',
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
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#323232',
    marginLeft: 20,

    fontFamily: 'Sukhumvit set',
  },
});
