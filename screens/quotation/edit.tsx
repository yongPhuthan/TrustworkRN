import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {v4 as uuidv4} from 'uuid';
import React, {useState, useContext, useEffect, useMemo} from 'react';
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
import {HOST_URL,PROJECT_NAME} from '@env';
import FooterBtnEdit from '../../components/styles/FooterBtnEdit';
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [dateOffer, setDateOffer] = useState<String>(quotation.dateOffer);
  const [dateEnd, setDateEnd] = useState<String>(quotation.dateEnd);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [token, setToken] = useState<FirebaseAuthTypes.User | null>(null);
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
      total += Number(serviceList[i].total);
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
  const handleEditService = (index: number) => {
    handleModalClose()
    // setShowEditServiceModal(false);
    // navigation.navigate('EditProductForm', {item: serviceList[index]});

    navigation.navigate('EditProductForm', {item: serviceList[index]});
  };
  const handleCustomerAddressChange = (value: string) => {
    setCustomerAddress(value);
  };

  const handlewWebView = () => {
    console.log('id quotation', quotationId);
    navigation.navigate('WebViewScreen', {id });
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
      // await mutate(apiData);
      // setIsLoadingMutation(false);
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

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(newUser => {
      if (newUser && newUser.email) {
        console.log('User is authenticated:', newUser.email);

        setUser(newUser);
        setEmail(newUser.email);
      } else {
        console.log('User is not authenticated, navigating to login page...');
        navigation.navigate('SignUpScreen');
      }

    });
    return unsubscribe;
  }, [serviceList, navigation]);

  const handleRemoveService = (index: number) => {
    setVisibleModalIndex(null);
    dispatch(stateAction.remove_serviceList(index));
  };

  const idContractList = selectedContract.map((obj: IdContractList) => obj.id);

  const handleEditClient = () => {
    navigation.navigate('EditClientForm');
  };
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
            <CardClient handleEditClient={() => handleEditClient()} />
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

            <Text style={styles.label}>บริการ-สินค้า</Text>
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
              // index={index}
              // handleEditService={() => handleEditService(index)}
              // serviceList={item}
              // key={index}
            />
          ))}

          <AddServices handleAddProductFrom={handleAddProductForm} />

          <Divider />
          <Summary
            title={'ยอดรวม'}
            price={totalPrice}
            onValuesChange={handleValuesChange}
          />
        </View>
      </ScrollView>

      <View>
      <FooterBtn btnText='ดำเนินการต่อ' disabled={isDisabled} onPress={handleButtonPress} />
        {/* <FooterBtnEdit onPress={handleButtonPress} WebView={handlewWebView} /> */}
      </View>
    </View>
  );
};

export default EditQuotation;

const styles = StyleSheet.create({
  container: {},
  subContainerHead: {
    padding: 30,
    marginBottom: 10,
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
});
