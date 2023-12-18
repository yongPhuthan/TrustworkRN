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
  Dimensions,
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
import {HOST_URL, PROJECT_FIREBASE, BACK_END_SERVER_URL} from '@env';
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
import Installment from '../utils/installment';
import {useUser} from '../../providers/UserContext';
import SaveButton from '../../components/ui/Button/SaveButton';

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

const ContractOption = ({navigation}: Props) => {
  const route = useRoute();
  const {id} = route?.params as any;

  const [signDate, setDateSign] = useState('');
  const [servayDate, setDateServay] = useState('');
  const [step, setStep] = useState(1);
  const [stepData, setStepData] = useState({});
  const textRequired = 'จำเป็นต้องระบุ';

  const [contract, setContract] = useState<Contract>();
  const user = useUser();

  const [showSecondPage, setShowSecondPage] = useState(false);
  // const {updatedData, contract}: any = route.params;
  const {
    handleSubmit,
    control,
    watch,
    getValues,
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
      customer: {
        name: '',
        address: '',
        phone: '',
      },
      allTotal: 0,
      signAddress: '',
    },
  });
  async function queryContractByQuotation() {
    if (!user || !user.email) {
      console.error('User or user email is not available');
      return;
    }

    try {
      const token = await user.getIdToken(true);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/documents/getQuotation?quotationId=${encodeURIComponent(
          id,
        )}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          const errorData = await response.json();
          if (
            errorData.message ===
            'Token has been revoked. Please reauthenticate.'
          ) {
          }
          throw new Error(errorData.message);
        }
        throw new Error('Network response was not ok.');
      }

      const data = await response.json();

      return data;
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      throw err;
    }
  }

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
    () => queryContractByQuotation(),
    {
      onSuccess: data => {
        console.log('data Query', data);

        if (data) {
          setContract(data.contract as Contract);
          console.log(data);
          reset({
            projectName: data.projectName,
            signDate: data.signDate,
            servayDate: data.servayDate,
            customer: data.customer,
            allTotal: data.allTotal,
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
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setDateServay(`${day}-${month}-${year}`);
    setDateSign(`${day}-${month}-${year}`);
  }, []);

  const handleNextPress = () => {
    navigation.navigate('Installment', {
      data: {
        projectName: getValues('projectName'),
        signDate,
        servayDate,
        total: Number(getValues('allTotal')),
        signAddress: watch('signAddress'),
        quotationId: data.id,
        sellerId: data.sellerId,
        contract: dirtyData,
        contractID: contract?.id,
      },
    });
  };

  const handleBackPress = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      reset({
        projectName: '',
        signDate: '',
        servayDate: '',
        customer: {
          name: '',
          address: '',
          phone: '',
        },
        allTotal: 0,
        signAddress: '',
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
    }).filter(([key]) => dirtyFields[key]),
  );

  console.log('step', step);
  if (isLoading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (isError) return <Text>{'errors'}</Text>;
  return (
    <>
      {data && (
        <SafeAreaView style={{flex: 1}}>
          <View style={styles.formInput}>
            <KeyboardAvoidingView
              style={{flex: 1}}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={
                Platform.OS === 'ios' ? 0 : -Dimensions.get('window').height
              }
              
              >
              <ScrollView style={styles.containerForm}>
                <View style={styles.card}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.title}>ตั้งชื่อโครงการ</Text>
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
                  <View style={{flexDirection: 'row'}}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        marginTop: 10,
                      }}>
                      ลูกค้า:
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '400',
                        marginTop: 10,
                        marginLeft: 40,
                      }}>
                      {getValues('customer.name')}
                    </Text>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        marginTop: 10,
                      }}>
                      ยอดรวม:
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '400',
                        marginTop: 10,
                        marginLeft: 22,
                      }}>
                      {Number(getValues('allTotal'))
                        .toFixed(2)
                        .replace(/\d(?=(\d{3})+\.)/g, '$&,')}{' '}
                      บาท
                    </Text>
                  </View>
                </View>

                <View style={styles.stepContainer}>
                  <SmallDivider />
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      width: '70%',
                    }}>
                    <Text style={styles.titleDate}>วันที่ทำสัญญา:</Text>
                    <View style={{marginTop: 10}}>
                      <DatePickerButton
                        label=""
                        date="today"
                        onDateSelected={handleDateSigne}
                      />
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      width: '70%',
                    }}>
                    <Text style={styles.titleDate}>วันที่วัดหน้างาน:</Text>

                    <View style={{marginTop: 10}}>
                      <DatePickerButton
                        label=""
                        date="today"
                        onDateSelected={handleDateServay}
                      />
                    </View>
                  </View>
                  <View style={{marginTop: 10}}></View>
                  <SmallDivider />
                  <View style={{alignSelf: 'flex-start'}}>
                    <Text style={styles.title}>สถาณที่ติดตั้งงาน:</Text>
                    <Controller
                      control={control}
                      name="signAddress"
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
                </View>

                <View
                  style={{
                    width: '90%',
                    marginTop: 20,
                    alignSelf: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <SaveButton onPress={handleNextPress} disabled={!isValid} />
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>

          {/* {step !== 2 && (
            <ContractFooter
              finalStep={false}
              onBack={handleBackPress}
              onNext={handleNextPress}
              isLoading={false}
              disabled={
                step === 1 ? !isDirty || !isValid : watch('signAddress') === ''
              }
            />
          )} */}
        </SafeAreaView>
      )}
    </>
  );
};
const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  containerForm: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 5,
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    // elevation: 3,
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.3,
    // shadowRadius: 3,
    padding: 20,
    width: '80%',
    alignSelf: 'baseline',
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
    borderRadius: 5,
    padding: 10,
    backgroundColor: 'white',
    width: width * 0.85,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  titleDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 20,
  },
});

export default ContractOption;
