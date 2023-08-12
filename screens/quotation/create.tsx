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
import {NavigationContainer} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import CardProject from '../../components/CardProject';
import CardClient from '../../components/CardClient';
import FooterBtn from '../../components/styles/FooterBtn';
import DatePickerButton from '../../components/styles/DatePicker';
import {Store} from '../../redux/store';
import * as stateAction from '../../redux/actions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useQuery} from '@tanstack/react-query';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';

import axios, {AxiosResponse, AxiosError} from 'axios';
import {HOST_URL} from '@env';
import messaging from '@react-native-firebase/messaging';
import Lottie from 'lottie-react-native';
import{ Audit, IdContractList,CompanyUser} from '../../types/docType'
import{ParamListBase} from '../../types/navigationType'
import useThaiDateFormatter from '../../hooks/utils/useThaiDateFormatter'
import {useFetchCompanyUser} from '../../hooks/company/useFetchCompany'; 


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
  const [showAddClient, setShowAddClient] = useState(true);
  const [allDiscount, setAllDiscount] = useState(0);
  const [status, setStatus] = useState('');
  const [total, setTotal] = useState(0);
  const [companyUser, setCompanyUser] = useState<CompanyUser>();
  const [discountValue, setDiscountValue] = useState(0);
  const [summaryAfterDiscount, setSumAfterDiscount] = useState(0);
  const [vat7Amount, setVat7Amount] = useState(0);
  const [vat5Amount, setVat5Amount] = useState(0);
  const thaiDateFormatter = useThaiDateFormatter();
  const [vat3Amount, setVat3Amount] = useState(0);
  const {fetchCompanyUser} = useFetchCompanyUser();
  const [productWarantyYear, setProductWarantyYear] = useState(0);
  const [skillWarantyYear, setSkillWarantyYear] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [docNumber, setDocnumber] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [dateOffer, setDateOffer] = useState<String>('');
  const [dateEnd, setDateEnd] = useState<String>('');
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [token, setToken] = useState<FirebaseAuthTypes.User | null>(null);
  const quotationId = uuidv4();
  const [fcnToken, setFtmToken] = useState('');
  const [discount, setDiscount] = useState('0');
  const [vat7, setVat7] = useState(false);
  const totalPrice = useMemo(() => {
    let total = 0;
    for (let i = 0; i < serviceList.length; i++) {
      total += Number(serviceList[i].total);
    }
    return total;
  }, [serviceList]);

  const isDisabled = !client_name || serviceList.length === 0;
  
  const {data, isLoading, isError} = useQuery(
    ['companyUser', email],
    () => fetchCompanyUser({email, isEmulator}).then(res => res),
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
  const handleCustomerNameChange = (value: string) => {
    setCustomerName(value);
  };

  const handleAddClientForm = () => {
    // TODO: Add client to quotation
    navigation.navigate('AddClient');
  };

  const handleAddProductForm = () => {
    // TODO: Add client to quotation
    dispatch(stateAction.reset_audit());

    navigation.navigate('AddProductForm');
  };
  const handleEditService = (index: number) => {
    navigation.navigate('EditProductForm', {item: serviceList[index]});
  };

  const handleEditClient = () => {
    navigation.navigate('EditClientForm');
  };
  const handleCustomerAddressChange = (value: string) => {
    setCustomerAddress(value);
  };
  const handleButtonPress = async () => {
    // navigation.navigate('SelectContract', {id: quotationId, totalPrice, sellerId: companyUser.id});

    setIsLoadingMutation(true);
    try {
      // Perform mutation
      // const resultArray: MyObject[] = [];
      // serviceList.forEach((obj: MyObject) => {
      //   const newObj: any = {...obj};
      //   newObj.audits = obj.audits.map((audit: Audit) => audit.id);
      //   resultArray.push(newObj);
      // });
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
          services: serviceList,
          customer: clientData,
          vat7: vat7Amount,
          taxValue: vat3Amount,
          taxName: 'vat3',
          dateEnd,
          discountValue,
          discountName: 'percent',
          dateOffer,
          FCMToken: fcnToken,
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
      }
      // await mutate(apiData);
      // navigation.navigate('InstallmentScreen', {data: apiData});
      navigation.navigate('SelectContract', {data: apiData} as any ) 

      setIsLoadingMutation(false);
    } catch (error: Error | AxiosError | any) {
      console.error('There was a problem calling the function:', error);
      console.log(error.response);
    }
  };

  const handleInvoiceNumberChange = (text: string) => {
    setDocnumber(text);
  };
  const signOutPage = () => {
    auth()
      .signOut()
      .then(() => console.log('User signed out!'));
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
        // User is authenticated, show their email
        console.log('User is authenticated:', newUser.email);
        setUser(newUser);
        setEmail(newUser.email);
      } else {
        // User is not authenticated, navigate to login page
        console.log('User is not authenticated, navigating to login page...');
        navigation.navigate('LoginScreen');
      }
    });
    async function requestUserPermission() {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        await messaging().registerDeviceForRemoteMessages(); // Register device for remote messages
        getFCMToken();
      }
    }

    async function getFCMToken() {
      const fcmToken = await messaging().getToken();

      if (fcmToken) {
        console.log('Your Firebase Token  document:', fcmToken);
        setFtmToken(fcmToken);
      } else {
        console.log('Failed to get Firebase Token');
      }
    }
    requestUserPermission();

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 900) + 100; // generates a random 3-digit number
    setDocnumber(`${year}${month}${day}${randomNum}`);
    setDateOffer(`${day}-${month}-${year}`);
    const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const endYear = endDate.getFullYear();
    const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
    const endDay = String(endDate.getDate()).padStart(2, '0');
    setDateEnd(`${endDay}-${endMonth}-${endYear}`);
    return unsubscribe;
  }, [serviceList, navigation]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Lottie
          style={{width: '25%'}}
          source={require('../assets/animation/lf20_rwq6ciql.json')}
          autoPlay
          loop
        />
      </View>
    );
  }
  const idContractList = selectedContract.map((obj: IdContractList) => obj.id);

  // console.log('company user' + JSON.stringify(companyUser));
  // console.log('serviceList' + JSON.stringify(serviceList));
  // console.log('fcmToken', fcnToken);
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
            <Text style={styles.label}>บริการ-สินค้า</Text>
          </View>
          {serviceList.map((item: any, index: number) => (
            <CardProject
              index={index + 1}
              handleEditService={() => handleEditService(index)}
              serviceList={item}
              key={index}
            />
          ))}

          <AddServices handleAddProductFrom={handleAddProductForm} />
          <Divider />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 10,
            }}>
            <Text style={styles.labelWaranty}>รับประกันงานติดตั้งกี่ปี</Text>
            <View style={styles.inputContainerForm}>
              <TextInput
                style={{width: 30}}
                value={String(skillWarantyYear)} 
                onChangeText={text => setSkillWarantyYear(Number(text))}
                placeholderTextColor="#A6A6A6"
                keyboardType="numeric"
              />
              <Text style={styles.inputSuffix}>ปี</Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 10,
            }}>
            <Text style={styles.labelWaranty}>รับประกันวัสดุอุปกรณ์กี่ปี</Text>
            <View style={styles.inputContainerForm}>
              <TextInput
                style={{width: 30}}
                value={String(productWarantyYear)}
                onChangeText={text => setProductWarantyYear(Number(text))}
                placeholderTextColor="#A6A6A6"
                keyboardType="numeric"
              />
              <Text style={styles.inputSuffix}>ปี</Text>
            </View>
          </View>
          <Divider />

          <Summary
            title={'ยอดรวม'}
            price={totalPrice}
            onValuesChange={handleValuesChange}
          />
        </View>

        {/* {selectedContract.length > 0 ? (
            <View style={styles.cardContainer}>
              {selectedContract.map((item: selectedContract) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  onPress={handleSelectContract}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Icon name="chevron-right" size={24} color="gray" />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.subContainer}>
              {selectedContract.length === 0 && (
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={handleSelectContract}>
                  <Text style={styles.selectButtonText}>Select Audit</Text>
                </TouchableOpacity>
              )}
            </View>
          )} */}
      </ScrollView>
      <View>
        {/* <TouchableOpacity style={styles.button} onPress={signOutPage}>
            <Text style={styles.buttonText}>sign out page</Text>
          </TouchableOpacity> */}
        <FooterBtn disabled={isDisabled} onPress={handleButtonPress} />
      </View>
    </View>
  );
};

export default Quotation;

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
});
