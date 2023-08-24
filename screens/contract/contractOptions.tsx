import React, {useState, useContext, useEffect, useRef} from 'react';
import {
  Button,
  SafeAreaView,
  StyleSheet,
  TextInput,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import DatePickerButton from '../../components/styles/DatePicker';
import messaging from '@react-native-firebase/messaging';
import {useMutation} from 'react-query';
import axios, {AxiosResponse, AxiosError} from 'axios';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {HOST_URL} from '@env';
import {v4 as uuidv4} from 'uuid';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, ParamListBase} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Store} from '../../redux/Store';
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
  navigation: StackNavigationProp<ParamListBase, 'ContractOption'>;
  route: RouteProp<ParamListBase, 'ContractOption'>;
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
// const ContractOption = ({navigation}: Props) => {
const ContractOption = ({navigation}: Props) => {
  const route = useRoute();
  const data: any = route?.params;

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
      warantyTimeWork: '',
      workingDays: '',
      workCheckEnd: '',
      workCheckDay: '',
      installingDay: '',
      adjustPerDay: '',
      workAfterGetDeposit: '',
      prepareDay: '',
      finishedDay: '',
      signAddress: '',
    },
  });

  const handleAddressChange = (newAddress: string) => {
    setValue("signAddress", newAddress);
  
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

  return (
    <>
      <SafeAreaView style={{flex: 1}}>
        {step === 1 && (
          <ScrollView style={styles.containerForm}>
            <View style={styles.formInput}>
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

              <SmallDivider />

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 10,
                }}>
                <Text style={styles.label}>รับประกันงานติดตั้งกี่ปี</Text>
                <View style={styles.inputContainerForm}>
                  <Controller
                    control={control}
                    render={({field: {onChange, onBlur, value}}) => (
                      <TextInput
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        style={{width: 30}}
                        placeholderTextColor="#A6A6A6"
                      />
                    )}
                    name="warantyTimeWork"
                    rules={{required: true}} // This line sets the field to required
                  />

                  <Text style={styles.inputSuffix}>ปี</Text>
                </View>
              </View>
              {errors.warantyTimeWork && (
                <Text
                  style={{
                    alignSelf: 'flex-end',
                  }}>
                  {textRequired}
                </Text>
              )}

              <SmallDivider />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 10,
                }}>
                <Text style={styles.label}>Working Days</Text>
                <View style={styles.inputContainerForm}>
                  <Controller
                    control={control}
                    render={({field: {onChange, onBlur, value}}) => (
                      <TextInput
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        style={{width: 30}}
                        placeholderTextColor="#A6A6A6"
                      />
                    )}
                    name="workingDays"
                    rules={{required: true}} // This line sets the field to required
                  />
                  <Text style={styles.inputSuffix}>วัน</Text>
                </View>
              </View>
              {errors.workingDays && (
                <Text
                  style={{
                    alignSelf: 'flex-end',
                  }}>
                  {textRequired}
                </Text>
              )}
              <SmallDivider />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 10,
                }}>
                <Text style={styles.label}>Installing Day</Text>

                <View style={styles.inputContainerForm}>
                  <Controller
                    control={control}
                    render={({field: {onChange, onBlur, value}}) => (
                      <TextInput
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        style={{width: 30}}
                        placeholderTextColor="#A6A6A6"
                      />
                    )}
                    name="installingDay"
                    rules={{required: true}} // This line sets the field to required
                  />

                  <Text style={styles.inputSuffix}>วัน</Text>
                </View>
              </View>
              {errors.installingDay && (
                <Text
                  style={{
                    alignSelf: 'flex-end',
                  }}>
                  {textRequired}
                </Text>
              )}
              <SmallDivider />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 10,
                }}>
                <Text style={styles.label}>Work After Get Deposit</Text>

                <View style={styles.inputContainerForm}>
                  <Controller
                    control={control}
                    render={({field: {onChange, onBlur, value}}) => (
                      <TextInput
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        style={{width: 30}}
                        placeholderTextColor="#A6A6A6"
                      />
                    )}
                    name="workAfterGetDeposit"
                    rules={{required: true}} // This line sets the field to required
                  />

                  <Text style={styles.inputSuffix}>วัน</Text>
                </View>
              </View>
              {errors.workAfterGetDeposit && (
                <Text
                  style={{
                    alignSelf: 'flex-end',
                  }}>
                  {textRequired}
                </Text>
              )}
              <SmallDivider />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 10,
                }}>
                <Text style={styles.label}>Prepare Days</Text>

                <View style={styles.inputContainerForm}>
                  <Controller
                    control={control}
                    render={({field: {onChange, onBlur, value}}) => (
                      <TextInput
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        style={{width: 30}}
                        placeholderTextColor="#A6A6A6"
                      />
                    )}
                    name="prepareDay"
                    rules={{required: true}} // This line sets the field to required
                  />

                  <Text style={styles.inputSuffix}>วัน</Text>
                </View>
              </View>
              {errors.prepareDay && (
                <Text
                  style={{
                    alignSelf: 'flex-end',
                  }}>
                  {textRequired}
                </Text>
              )}
              <SmallDivider />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 10,
                }}>
                <Text style={styles.label}>Finished Days</Text>

                <View style={styles.inputContainerForm}>
                  <Controller
                    control={control}
                    render={({field: {onChange, onBlur, value}}) => (
                      <TextInput
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        style={{width: 30}}
                        placeholderTextColor="#A6A6A6"
                      />
                    )}
                    name="finishedDay"
                    rules={{required: true}} // This line sets the field to required
                  />

                  <Text style={styles.inputSuffix}>วัน</Text>
                </View>
              </View>
              {errors.finishedDay && (
                <Text
                  style={{
                    alignSelf: 'flex-end',
                  }}>
                  {textRequired}
                </Text>
              )}
              <SmallDivider />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 10,
                }}>
                <Text style={styles.label}>Work Check Day</Text>

                <View style={styles.inputContainerForm}>
                  <Controller
                    control={control}
                    render={({field: {onChange, onBlur, value}}) => (
                      <TextInput
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        style={{width: 30}}
                        placeholderTextColor="#A6A6A6"
                      />
                    )}
                    name="workCheckDay"
                    rules={{required: true}} // This line sets the field to required
                  />

                  <Text style={styles.inputSuffix}>วัน</Text>
                </View>
              </View>
              {errors.workCheckDay && (
                <Text
                  style={{
                    alignSelf: 'flex-end',
                  }}>
                  {textRequired}
                </Text>
              )}
              <SmallDivider />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 10,
                }}>
                <Text style={styles.label}>Work Check End</Text>

                <View style={styles.inputContainerForm}>
                  <Controller
                    control={control}
                    render={({field: {onChange, onBlur, value}}) => (
                      <TextInput
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        style={{width: 30}}
                        placeholderTextColor="#A6A6A6"
                      />
                    )}
                    name="workCheckEnd"
                    rules={{required: true}} // This line sets the field to required
                  />

                  <Text style={styles.inputSuffix}>วัน</Text>
                </View>
              </View>
              {errors.workCheckEnd && (
                <Text
                  style={{
                    alignSelf: 'flex-end',
                  }}>
                  {textRequired}
                </Text>
              )}
              <SmallDivider />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 10,
                  marginBottom: 30,
                }}>
                <Text style={styles.label}>Adjust Per Days</Text>

                <View style={styles.inputContainerForm}>
                  <Controller
                    control={control}
                    render={({field: {onChange, onBlur, value}}) => (
                      <TextInput
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        style={{width: 30}}
                        placeholderTextColor="#A6A6A6"
                      />
                    )}
                    name="adjustPerDay"
                    rules={{required: true}} // This line sets the field to required
                  />

                  <Text style={styles.inputSuffix}>วัน</Text>
                </View>
              </View>
              {errors.adjustPerDay && (
                <Text
                  style={{
                    alignSelf: 'flex-end',
                  }}>
                  {textRequired}
                </Text>
              )}
              <SmallDivider />
            </View>
          </ScrollView>
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
              customerName={data.customerName}
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
                projectName:watch('projectName') ,
                warantyYear: Number(watch('warantyTimeWork')),
                warantyTimeWork: Number(watch('warantyTimeWork')),
                workingDays,
                installingDay: Number(watch('installingDay')),
                adjustPerDay: Number(watch('adjustPerDay')),
                workAfterGetDeposit: Number(watch('workAfterGetDeposit')),
                signDate,
                servayDate,
                prepareDay: Number(watch('prepareDay')),
                finishedDay: Number(watch('finishedDay')),
                workCheckDay: Number(watch('workCheckDay')),
                workCheckEnd: Number(watch('workCheckEnd')),
                total: Number(data.allTotal),
                signAddress: watch('signAddress'),
                quotationId: data.id,
                sellerId: data.sellerId,
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
            disabled={step === 1 ? !isDirty || !isValid : watch('signAddress') === ''}

          />
        )}
      </SafeAreaView>
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
