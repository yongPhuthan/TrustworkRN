import React, {useState, useContext, useCallback, useRef} from 'react';
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
import messaging from '@react-native-firebase/messaging';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {HOST_URL} from '@env';
import {v4 as uuidv4} from 'uuid';
import {useQuery, useMutation} from '@tanstack/react-query';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, ParamListBase} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Store} from '../../../redux/store';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {Contract, Quotation, Customer} from '../../../types/docType';
import {useForm, Controller} from 'react-hook-form';
import {PeriodPercentType} from '../../../types/docType';

import SmallDivider from '../../../components/styles/SmallDivider';
import ContractFooter from '../../../components/styles/ContractFooter';
import CreateContractScreen from '../createContractScreen';
import Lottie from 'lottie-react-native';
import EditInstallment from '../../../components/editInstallment';

type Props = {
  navigation: StackNavigationProp<ParamListBase, 'ContractOption'>;
  route: RouteProp<ParamListBase, 'ContractOption'>;
};

const thaiDateFormatter = new Intl.DateTimeFormat('th-TH', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

type WatchedValuesType = {
  projectName: string;
  signDate: string;
  servayDate: string;
  warantyTimeWork: string;
  workCheckEnd: string;
  workCheckDay: string;
  installingDay: string;
  adjustPerDay: string;
  workAfterGetDeposit: string;
  prepareDay: string;
  finishedDay: string;
  signAddress: string;
  [key: string]: string;
};

const fetchContract = async ({
  id,
  isEmulator,
}: {
  id: string;
  isEmulator: boolean;
}) => {
  const user = auth().currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  const idToken = await user.getIdToken();
  console.log('ID', id);

  let url;
  if (isEmulator) {
    url = `http://${HOST_URL}:5001/workerfirebase-f1005/asia-southeast1/appQueryDocAndContract`;
  } else {
    url = `https://asia-southeast1-workerfirebase-f1005.cloudfunctions.net/appQueryDocAndContract`;
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(id),
    credentials: 'include',
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return data;
};

const EditContractOption = ({navigation}: Props) => {
  const route = useRoute();
  const id: any = route?.params;
  const [fcnToken, setFtmToken] = useState('');
  const [isLoadingMutation, setIsLoadingMutation] = useState(false);
  const [step, setStep] = useState(1);
  const [contract, setContract] = useState<Contract>();
  const [quotation, setQuotation] = useState<Quotation>();
  const [customer, setCustomer] = useState<Customer>();
  const [stepData, setStepData] = useState({});
  const textRequired = 'จำเป็นต้องระบุ';
  const [defaultValues, setDefaultValues] = useState(null);
  const [periodPercent, setPeriodPercent] = useState<PeriodPercentType[]>([]);
  const [showSecondPage, setShowSecondPage] = useState(false);
  const [signDate, setDateSign] = useState('');
  const [servayDate, setDateServay] = useState('');
  // const {updatedData, contract}: any = route.params;
  const [address, setAddress] = useState('');

  const {
    handleSubmit,
    control,
    watch,
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

  const handleAddressChange = useCallback(
    (newAddress: string) => {
      setValue('signAddress', newAddress, {shouldDirty: true});
    },
    [setValue],
  );

  const {data, isLoading, isError} = useQuery(
    ['Contract', id],
    () => fetchContract({id, isEmulator}).then(res => res),
    {
      onSuccess: data => {
        console.log(data);
        setPeriodPercent(data[0].periodPercent);
        setContract(data[3]);
        setQuotation(data[0]);
        setDateSign(data[3].signDate);
        setDateServay(data[3].servayDate);
        setCustomer(data[1]);
        setAddress(data[3].signAddress);
        reset({
          projectName: data[3].projectName,
          warantyTimeWork: data[3].warantyTimeWork,
          workCheckEnd: data[3].workCheckEnd,
          workCheckDay: data[3].workCheckDay,
          installingDay: data[3].installingDay,
          adjustPerDay: data[3].adjustPerDay,
          workAfterGetDeposit: data[3].workAfterGetDeposit,
          prepareDay: data[3].prepareDay,
          finishedDay: data[3].finishedDay,
          signAddress: data[3].signAddress,
        });
      },
    },
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Lottie
          style={{width: '10%'}}
          source={require('../../../assets/animation/lf20_rwq6ciql.json')}
          autoPlay
          loop
        />
      </View>
    );
  }
  const watchedValues: WatchedValuesType = watch();
  const dirtyValues = Object.keys(dirtyFields).reduce((acc, key) => {
    if (key in watchedValues) {
      acc[key] = watchedValues[key as keyof WatchedValuesType];
    }
    return acc;
  }, {} as WatchedValuesType);

  const {
    state: {selectedContract, isEmulator},
    dispatch,
  }: any = useContext(Store);

  const handleDateSigne = (date: Date) => {
    const formattedDate = thaiDateFormatter.format(date);
    setDateSign(formattedDate);
  };

  const handleDateServay = (date: Date) => {
    const formattedDate = thaiDateFormatter.format(date);
    setDateServay(formattedDate);
  };

  const handleNextPress = () => {
    if (step < 3) {
      setStep(step + 1);
    }
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
        warantyTimeWork: '',
        workCheckEnd: '',
        workCheckDay: '',
        installingDay: '',
        adjustPerDay: '',
        workAfterGetDeposit: '',
        prepareDay: '',
        finishedDay: '',
        signAddress: '',
      });
      navigation.goBack();
    }
  };
  return (
    <>
      {quotation && customer && contract ? (
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
                        value={value ? value.toString() : ''}
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
                          onChangeText={val => onChange(Number(val))}
                          value={value ? value.toString() : ''}
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
                  <Text style={styles.label}>Installing Day</Text>

                  <View style={styles.inputContainerForm}>
                    <Controller
                      control={control}
                      render={({field: {onChange, onBlur, value}}) => (
                        <TextInput
                          onBlur={onBlur}
                          onChangeText={val => onChange(Number(val))}
                          value={value ? value.toString() : ''}
                          style={{width: 30}}
                          placeholderTextColor="#A6A6A6"
                        />
                      )}
                      name="installingDay"
                      rules={{required: true}}
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
                          onChangeText={val => onChange(Number(val))}
                          value={value.toString()}
                          style={{width: 30}}
                          placeholderTextColor="#A6A6A6"
                        />
                      )}
                      name="workAfterGetDeposit"
                      rules={{required: true}}
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
                          onChangeText={val => onChange(Number(val))}
                          value={value.toString()}
                          style={{width: 30}}
                          placeholderTextColor="#A6A6A6"
                        />
                      )}
                      name="prepareDay"
                      rules={{required: true}}
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
                          onChangeText={val => onChange(Number(val))}
                          value={value.toString()}
                          style={{width: 30}}
                          placeholderTextColor="#A6A6A6"
                        />
                      )}
                      name="finishedDay"
                      rules={{required: true}}
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
                          onChangeText={val => onChange(Number(val))}
                          value={value.toString()}
                          style={{width: 30}}
                          placeholderTextColor="#A6A6A6"
                        />
                      )}
                      name="workCheckDay"
                      rules={{required: true}}
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
                          onChangeText={val => onChange(Number(val))}
                          value={value.toString()}
                          style={{width: 30}}
                          placeholderTextColor="#A6A6A6"
                        />
                      )}
                      name="workCheckEnd"
                      rules={{required: true}}
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
                          onChangeText={val => onChange(Number(val))}
                          value={value.toString()}
                          style={{width: 30}}
                          placeholderTextColor="#A6A6A6"
                        />
                      )}
                      name="adjustPerDay"
                      rules={{required: true}}
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
                customerName={customer.name}
                allTotal={Number(quotation.allTotal)}
                signAddress={watch('signAddress')}
              />
            </>
          )}
          {step === 3 && (
            <>
              <EditInstallment
                handleBackPress={handleBackPress}
                periodPercent={periodPercent}
                total={Number(quotation.allTotal)}
                data={{
                  ...dirtyValues,
                }}
                quotationId={quotation.id}
                contractId={contract.id}
                sellerId={contract.sellerId}
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
              disabled={step === 1 ? !isValid : address === ''}
            />
          )}
        </SafeAreaView>
      ) : (
        <>
          <View style={styles.loadingContainer}>
            <Lottie
              style={{width: '10%'}}
              source={require('../../../assets/animation/lf20_rwq6ciql.json')}
              autoPlay
              loop
            />
          </View>
        </>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default EditContractOption;
