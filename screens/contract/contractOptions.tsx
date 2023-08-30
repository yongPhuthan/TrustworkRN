import React, {useState, useContext, useEffect, useRef} from 'react';
import {
  Button,
  SafeAreaView,
  StyleSheet,
  TextInput,
  Text,
  Platform,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import DatePickerButton from '../../components/styles/DatePicker';
import messaging from '@react-native-firebase/messaging';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Contract} from '../../types/docType';

import axios, {AxiosResponse, AxiosError} from 'axios';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {HOST_URL, PROJECT_FIREBASE} from '@env';
import {v4 as uuidv4} from 'uuid';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import {ParamListBase} from '../../types/navigationType';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Store} from '../../redux/store';
import {useForm, Controller} from 'react-hook-form';

import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faChevronRight,
  faCashRegister,
  faCoins,
} from '@fortawesome/free-solid-svg-icons';
import SmallDivider from '../../components/styles/SmallDivider';
import ContractFooter from '../../components/styles/ContractFooter';
import CreateContractScreen from './createContractScreen';
import Installment from '../../components/installment';
type Props = {
  navigation: StackNavigationProp<ParamListBase, 'ContractOptions'>;
  route: RouteProp<ParamListBase, 'ContractOptions'>;
};

const thaiDateFormatter = new Intl.DateTimeFormat('th-TH', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

interface MyError {
  response: object;
  // add other properties if necessary
}
const fetchContractByID = async (id: string) => {
  const user = auth().currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  const idToken = await user.getIdToken();
  let url;
  if (__DEV__) {
    url = `http://${HOST_URL}:5001/${PROJECT_FIREBASE}/asia-southeast1/appQueryContract`;
  } else {
    url = `https://asia-southeast1-${PROJECT_FIREBASE}.cloudfunctions.net/appQueryContract`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({id}),
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return data;
};
const ContractOption = ({navigation}: Props) => {
  const route = useRoute();
  const {id, sellerId, allTotal, customerName} = route?.params;

  const [projectName, setProjectName] = useState('');
  const [signDate, setDateSign] = useState('');
  const [servayDate, setDateServay] = useState('');
  const [warantyTimeWork, setWarantyTimeWork] = useState(0);
  const [workingDays, setWorkingDays] = useState(0);
  const [workCheckEnd, setWorkCheckEnd] = useState(0);
  const [workCheckDay, setWorkCheckDay] = useState(0);
  const [installingDay, setInstallingDay] = useState(0);
  const [fcnToken, setFtmToken] = useState('');
  const [isLoadingMutation, setIsLoadingMutation] = useState(false);
  const [step, setStep] = useState(1);
  const [stepData, setStepData] = useState({});
  const textRequired = 'จำเป็นต้องระบุ';
  const [workAfterGetDeposit, setWorkAfterGetDeposit] = useState(0);
  const [prepareDay, setPrepareDay] = useState(0);
  const [finishedDay, setFinishedDay] = useState(0);
  const [adjustPerDay, setAdjustPerDay] = useState(0);
  const [contract, setContract] = useState<Contract>();

  const [showSecondPage, setShowSecondPage] = useState(false);
  // const {updatedData, contract}: any = route.params;
  const [address, setAddress] = useState('');
  const {
    handleSubmit,
    control,
    watch,
    register,
    setValue,
    reset,
    formState: {errors, isDirty, dirtyFields, isValid},
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      projectName: '',
      signDate: '',
      servayDate: '',
      warantyTimeWork: 0,
      workingDays: 0,
      workCheckEnd: 0,
      workCheckDay: 0,
      installingDay: 0,
      adjustPerDay: 0,
      workAfterGetDeposit: 0,
      productWarantyYear: 0,
      prepareDay: 0,
      finishedDay: 0,
      signAddress: 0,
      skillWarantyYear: 0,
    },
  });

  const handleAddressChange = (newAddress: string) => {
    setValue('signAddress', newAddress);
  };
  const updateInstallmentData = (
    percentage: number,
    details: string,
    index: number,
  ) => {
    setStepData(prevState => ({
      ...prevState,
      [`percentage_${index}`]: percentage,
      [`details_${index}`]: details,
    }));
  };
  const {data, isLoading, isError} = useQuery(
    ['ContractID', id],
    () => fetchContractByID(id),
    {
      onSuccess: data => {
        console.log('data Query', data);

        if (data) {
          setContract(data.contract as Contract);
          console.log(data);
          reset({
            warantyTimeWork: data.contract.warantyTimeWork,
            workCheckEnd: data.contract.workCheckEnd,
            workCheckDay: data.contract.workCheckDay,
            installingDay: data.contract.installingDay,
            adjustPerDay: data.contract.adjustPerDay,
            workAfterGetDeposit: data.contract.workAfterGetDeposit,
            prepareDay: data.contract.prepareDay,
            finishedDay: data.contract.finishedDay,
            productWarantyYear: data.contract.productWarantyYear,
            skillWarantyYear: data.contract.skillWarantyYear,
          });
        }
      },
    },
  );
  const {
    state: {selectedContract, isEmulator},
    dispatch,
  }: any = useContext(Store);

  const handleStartDateSelected = (date: Date) => {
    const formattedDate = thaiDateFormatter.format(date);
    // setServayDate(formattedDate);
    console.log(servayDate);
  };
  // const {mutate} = useMutation(createContract, {
  //   onSuccess: data => {
  //     navigation.navigate('WebViewScreen', {id: data?.data.id});
  //   },
  //   onError: (error: MyError) => {
  //     console.error('There was a problem calling the function:', error);
  //     console.log(error.response);
  //   },
  // });

  const handleShowSecondPage = () => {
    setShowSecondPage(true);
  };

  const handleDateSigne = (date: Date) => {
    const formattedDate = thaiDateFormatter.format(date);
    setDateSign(formattedDate);
  };

  const handleDateServay = (date: Date) => {
    const formattedDate = thaiDateFormatter.format(date);
    setDateServay(formattedDate);
  };

  const handleHideSecondPage = () => {
    setShowSecondPage(false);
  };

  useEffect(() => {
    async function requestUserPermission() {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
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
  }, [selectedContract]);

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setDateServay(`${day}-${month}-${year}`);
    setDateSign(`${day}-${month}-${year}`);
  }, []);

  const handleNextPress = () => {
    if (step < 3) {
      setStep(step + 1);
    }
    // Validate the inputs for step 2 and step 3 here in a similar way.
  };

  const handleBackPress = () => {
    // If it's not the first step, decrement the step.
    if (step > 1) {
      setStep(step - 1);
    } else {
      reset({
        projectName: '',
        signDate: '',
        servayDate: '',
        warantyTimeWork: 0,
        workingDays: 0,
        workCheckEnd: 0,
        workCheckDay: 0,
        installingDay: 0,
        fcnToken: '',
        adjustPerDay: 0,
        workAfterGetDeposit: 0,
        prepareDay: 0,
        finishedDay: 0,
        address: '',
      });
      navigation.goBack();
    }
  };
  function safeToString(value) {
    return value !== undefined && value !== null ? value.toString() : '';
  }

  const renderTextInput = (
    name: any,
    label: string,
    defaultValue: string = '',
  ) => (
    <>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
        }}>
        <Text style={styles.label}>{label}</Text>

        <View style={styles.inputContainerForm}>
          <Controller
            control={control}
            render={({field: {onChange, onBlur, value}}) => (
              <TextInput
                keyboardType="number-pad"
                defaultValue={defaultValue}
                onBlur={onBlur}
                onChangeText={val => {
                  const numericValue = Number(val);
                  if (!isNaN(numericValue)) {
                    onChange(numericValue);
                  }
                }}
                value={
                  value !== undefined && value !== null
                    ? value.toString()
                    : defaultValue
                }
                style={{width: 30}}
                placeholderTextColor="#A6A6A6"
              />
            )}
            name={name}
            rules={{required: true}}
          />

          <Text style={styles.inputSuffix}>วัน</Text>
        </View>
      </View>
      {errors[name] && (
        <Text
          style={{
            alignSelf: 'flex-end',
          }}>
          {textRequired}
        </Text>
      )}
    </>
  );
  const dirtyData = Object.fromEntries(
    Object.entries({
      productWarantyYear: Number(watch('productWarantyYear')),
      warantyTimeWork: Number(watch('warantyTimeWork')),
      workingDays: Number(watch('workingDays')),
      installingDay: Number(watch('installingDay')),
      adjustPerDay: Number(watch('adjustPerDay')),
      workAfterGetDeposit: Number(watch('workAfterGetDeposit')),
      prepareDay: Number(watch('prepareDay')),
      finishedDay: Number(watch('finishedDay')),
      workCheckDay: Number(watch('workCheckDay')),
      workCheckEnd: Number(watch('workCheckEnd')),
    }).filter(([key]) => dirtyFields[key])
  );
  console.log('contractID', contract?.id);
  return (
    <>
      {contract && (
        <SafeAreaView style={{flex: 1}}>
          {step === 1 && (
            <View style={styles.formInput}>
              <KeyboardAvoidingView
                style={{flex: 1}}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
                <ScrollView style={styles.containerForm}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>ชื่อโครงการ</Text>
                    <Controller
                      control={control}
                      render={({field: {onChange, onBlur, value}}) => (
                        <TextInput
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          style={styles.inputForm}
                          placeholder="โครงการติดตั้ง..."
                          placeholderTextColor="#A6A6A6"
                        />
                      )}
                      name="projectName"
                      rules={{required: true}} // This line sets the field to required
                    />
                    {errors.projectName && <Text>{textRequired}</Text>}
                  </View>
                  <View style={styles.formInput}>
                    {renderTextInput(
                      'productWarantyYear',
                      'รับประกันวัสดุอุปกรณ์กี่ปี',
                      safeToString(contract.productWarantyYear),
                    )}
                    {renderTextInput(
                      'skillWarantyYear',
                      'รับประกันงานติดตั้งกี่ปี',
                      safeToString(contract.skillWarantyYear),
                    )}
                    {renderTextInput(
                      'installingDay',
                      'Installing Day',
                      safeToString(contract.installingDay),
                    )}
                    {renderTextInput(
                      'workAfterGetDeposit',
                      'Work After Get Deposit',
                      safeToString(contract.workAfterGetDeposit),
                    )}
                    {renderTextInput(
                      'prepareDay',
                      'Prepare Days',
                      safeToString(contract.prepareDay),
                    )}
                    {renderTextInput(
                      'finishedDay',
                      'Finished Days',
                      safeToString(contract.finishedDay),
                    )}
                    {renderTextInput(
                      'workCheckDay',
                      'Work Check Day',
                      safeToString(contract.workCheckDay),
                    )}
                    {renderTextInput(
                      'workCheckEnd',
                      'Work Check End',
                      safeToString(contract.workCheckEnd),
                    )}
                    {renderTextInput(
                      'adjustPerDay',
                      'Adjust Per Days',
                      safeToString(contract.adjustPerDay),
                    )}

                    <SmallDivider />
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>

              <SmallDivider />
            </View>
          )}
          {step === 2 && (
            <>
              <CreateContractScreen
                handleAddressChange={handleAddressChange}
                handleDateServay={handleDateServay}
                handleDateSigne={handleDateSigne}
                signDate={servayDate}
                servayDate={servayDate}
                projectName={watch('projectName')}
                customerName={data.customer.name}
                allTotal={data.allTotal}
                address={watch('address')}
              />
            </>
          )}
          {step === 3 && (
            <>
              <Installment
                handleBackPress={handleBackPress}
                data={{
                  projectName: watch('projectName'),
                  signDate,
                  servayDate,
                  total: Number(data.allTotal),
                  signAddress: watch('signAddress'),
                  quotationId: data.id,
                  sellerId: data.sellerId,
                  contract:dirtyData,
                  contractID: contract.id,

                }}
              />
            </>
          )}
          {step !== 3 && (
            <ContractFooter
              finalStep={false}
              // finalStep={step === 3}
              onBack={handleBackPress}
              onNext={handleNextPress}
              isLoading={false}
              disabled={
                step === 1 ? !isDirty || !isValid : watch('signAddress') === ''
              }
            />
          )}
        </SafeAreaView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  containerForm: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
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
    marginTop: 30,
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
    marginTop: 40,
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
    width: 80,
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
    borderRadius: 8,
    borderWidth: 0.5,

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
    height: 500,

    width: 50,
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
});

export default ContractOption;
