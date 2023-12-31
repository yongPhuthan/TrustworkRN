import React, {useState, useContext, useCallback, useRef} from 'react';
import {
  Button,
  SafeAreaView,
  KeyboardAvoidingView,
  StyleSheet,
  Alert,
  TextInput,
  Platform,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {HOST_URL, PROJECT_FIREBASE, BACK_END_SERVER_URL} from '@env';
import {v4 as uuidv4} from 'uuid';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Store} from '../../redux/store';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  Contract,
  Quotation,
  Customer,
  DefaultContractType,
} from '../../types/docType';
import {useForm, Controller} from 'react-hook-form';
import {useUser} from '../../providers/UserContext';
import SmallDivider from '../../components/styles/SmallDivider';
import ContractFooter from '../../components/styles/ContractFooter';
import CreateContractScreen from './createContractScreen';
import Lottie from 'lottie-react-native';
import EditInstallment from '../../components/editInstallment';
import {ParamListBase} from '../../types/navigationType';
import FooterBtn from '../../components/styles/FooterBtn';
type Props = {
  navigation: StackNavigationProp<ParamListBase, 'DefaultContract'>;
  route: RouteProp<ParamListBase, 'DefaultContract'>;
};
interface MyError {
  response: object;
}

const DefaultContract = ({navigation}: Props) => {
  const route = useRoute();
  const [defaultContractValues, setDefaultContractValues] =
    useState<DefaultContractType>();
  const id: any = route?.params;
  const [fcnToken, setFtmToken] = useState('');
  const user = useUser();
  const [isLoadingMutation, setIsLoadingMutation] = useState(false);
  const [step, setStep] = useState(1);
  const [contract, setContract] = useState<DefaultContractType>();
  const [customer, setCustomer] = useState<Customer>();
  const textRequired = 'จำเป็นต้องระบุ';
  const {data: dataProps}: any = route?.params;
  const quotation = dataProps;
  const queryClient = useQueryClient();
console.log('quotation',quotation)
  async function fetchContractByEmail() {
    if (!user || !user.email) {
      console.error('User or user email is not available');
      return;
    }

    try {
      const token = await user.getIdToken(true);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/documents/queryDefaultContracts?email=${encodeURIComponent(
          user.email,
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
      if (data && Array.isArray(data[1])) {
        data[1].sort((a, b) => {
          const dateA = new Date(a.dateOffer);
          const dateB = new Date(b.dateOffer);
          return dateB.getTime() - dateA.getTime();
        });
      }

      console.log('data after', data);
      return data;
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      throw err;
    }
  }
  const createQuotation = async (data: any) => {
    if (!user || !user.email) {
      throw new Error('User or user email is not available');
    }
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/documents/createQuotation?email=${encodeURIComponent(
          user.email,
        )}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({data}),
        },
      );

      if (response.status === 200) {
        // Assuming you want to return the response for successful operations
        return response.json();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Network response was not ok.');
      }
    } catch (err) {
      throw new Error(err);

    }
  };

  const createContractAndQuotation = async (data: any) => {
    if (!user || !user.email) {
      console.error('User or user email is not available');
      return;
    }
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/documents/createContractAndQuotation?email=${encodeURIComponent(
          user.email,
        )}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({data}),
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
    } catch (err) {
      throw new Error(err);
    }
  };

  const updateDefaultContractAndCreateQuotation = async (data: any) => {
    if (!user || !user.email) {
      console.error('User or user email is not available');
      return;
    }
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/documents/updateDefaultContractAndCreateQuotation?email=${encodeURIComponent(
          user.email,
        )}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({data}),
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
    } catch (err) {
      throw new Error(err);
    }
  };
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
      warantyTimeWork: 0,
      workCheckEnd: 0,
      workCheckDay: 0,
      installingDay: 0,
      adjustPerDay: 0,
      workAfterGetDeposit: 0,
      prepareDay: 0,
      finishedDay: 0,
      productWarantyYear: 0,
      skillWarantyYear: 0,
    },
  });
  const {data, isLoading, isError} = useQuery({
    queryKey: ['ContractByEmail'],
    queryFn: fetchContractByEmail,
    enabled: !!user,
    onSuccess: data => {
      if (data) {
        setContract(data as any);

        const defaultValues = {
          warantyTimeWork: data.warantyTimeWork,
          workCheckEnd: data.workCheckEnd,
          workCheckDay: data.workCheckDay,
          installingDay: data.installingDay,
          adjustPerDay: data.adjustPerDay,
          workAfterGetDeposit: data.workAfterGetDeposit,
          prepareDay: data.prepareDay,
          finishedDay: data.finishedDay,
          productWarantyYear: data.productWarantyYear,
          skillWarantyYear: data.skillWarantyYear,
        };
        setDefaultContractValues(defaultValues);
        reset(defaultValues);
      }
    },
  });

  const {mutate: createContractAndQuotationMutation} = useMutation(
    createContractAndQuotation,
    {
      onSuccess: data => {
        queryClient.invalidateQueries(['dashboardData']);
        const newId = quotation.id.slice(0, 8);
        navigation.navigate('DocViewScreen', {id: newId});
      },
      onError: (error: MyError) => {
        Alert.alert(
          'เกิดข้อผิดพลาด',
          `Server-side user creation failed:, ${error}`, 
          [{text: 'OK', }],
        
          {cancelable: false},
        );
      },
    },
  );

  const {mutate: createQuotationMutation} = useMutation(createQuotation, {
    onSuccess: data => {
      queryClient.invalidateQueries(['dashboardData']);
      const newId = quotation.id.slice(0, 8);
      navigation.navigate('DocViewScreen', {id: newId});
    },
    onError: (error: MyError) => {
      Alert.alert(
        'เกิดข้อผิดพลาด',
        `Server-side user creation failed:, ${error}`, 
        [{text: 'OK', }],
      
        {cancelable: false},
      );
    },
  });

  const {mutate: updateContractMutation} = useMutation(
    updateDefaultContractAndCreateQuotation,
    {
      onSuccess: data => {
        queryClient.invalidateQueries(['dashboardData']);
        const newId = quotation.id.slice(0, 8);
        navigation.navigate('DocViewScreen', {id: newId});
      },
      onError: (error: MyError) => {
        Alert.alert(
          'เกิดข้อผิดพลาด',
          `Server-side user creation failed:, ${error}`, 
          [{text: 'OK', }],
        
          {cancelable: false},
        );
      },
    },
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }
  if (isError) {
    return (
      <View style={styles.loadingContainer}>
        <Text>เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง</Text>
      </View>
    );
  }
  const watchedValues: DefaultContractType = watch();
  const dirtyValues = Object.keys(dirtyFields).reduce((acc, key) => {
    if (key in watchedValues) {
      acc[key] = watchedValues[key as keyof DefaultContractType];
    }
    return acc;
  }, {} as DefaultContractType);

  const handleDonePress = async () => {
    setIsLoadingMutation(true);

    try {
      const apiData = {
        data: quotation,
        contract: dirtyValues,
      };
      console.log('apiData before mutation', JSON.stringify(apiData));

      if (!contract) {
        createContractAndQuotationMutation(apiData);
      } else if (isDirty) {
        updateContractMutation({...apiData});
      } else {
        const newData = {
          data: quotation,
          contract: defaultContractValues,
        };
        // console.log('newData before mutation' ,JSON.stringify(newData))
        createQuotationMutation(newData);
      }

      setIsLoadingMutation(false);
    } catch (error: Error | MyError | any) {
      console.error('There was a problem calling the function:', error);
      console.log(error.response);
      setIsLoadingMutation(false);
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
                textAlign="center"
                textAlignVertical="center"
                defaultValue={defaultValue}
                onBlur={onBlur}
                onChangeText={val => {
                  const numericValue = Number(val);
                  if (!isNaN(numericValue)) {
                    onChange(numericValue);
                  }
                }}
                style={{
                  width: 30,
                  // height: 45,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
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
      <View style={styles.divider} />
    </>
  );
  return (
    <>
      {contract ? (
        <SafeAreaView style={{flex: 1}}>
          <KeyboardAvoidingView
            style={{flex: 1}}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
            <ScrollView style={styles.containerForm}>
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
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
          <FooterBtn
            btnText="บันทึก"
            disabled={!isValid}
            onPress={handleDonePress}
          />
        </SafeAreaView>
      ) : (
        // ... Same for the other part of the ternary operator ...
        <SafeAreaView style={{flex: 1}}>
          <KeyboardAvoidingView
            style={{flex: 1}}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
            <ScrollView style={styles.containerForm}>
              <View style={styles.formInput}>
                <SmallDivider />

                {renderTextInput(
                  'productWarantyYear',
                  'รับประกันวัสดุอุปกรณ์กี่ปี',
                )}
                {renderTextInput(
                  'skillWarantyYear',
                  'รับประกันงานติดตั้งกี่ปี',
                )}
                {renderTextInput('installingDay', 'Installing Day')}
                {renderTextInput(
                  'workAfterGetDeposit',
                  'Work After Get Deposit',
                )}
                {renderTextInput('prepareDay', 'Prepare Days')}
                {renderTextInput('finishedDay', 'Finished Days')}
                {renderTextInput('workCheckDay', 'Work Check Day')}
                {renderTextInput('workCheckEnd', 'Work Check End')}
                {renderTextInput('adjustPerDay', 'Adjust Per Days')}
              </View>
            </ScrollView>
            <FooterBtn
              btnText="บันทึกใบเสนอราคา"
              disabled={!isValid || !isDirty}
              onPress={handleDonePress}
            />

            {/* <ContractFooter
              finalStep={false}
              onBack={handleBackPress}
              onNext={handleDonePress}
              isLoading={isLoading}
              disabled={!isValid || !isDirty}
            /> */}
          </KeyboardAvoidingView>
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
    paddingTop: 0,
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
  inputContainerForm1: {
    marginBottom: 10,
    borderWidth: 0.5,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    backgroundColor: '#FAFAFA', // A light color for odd rows

    width: 80,
    height: Platform.OS === 'android' ? 50 : 50, // Adjust height based on platform
    paddingVertical: Platform.OS === 'android' ? 0 : 15, // Remove padding for Android
  },
  inputContainerForm: {
    marginBottom: 10,
    borderWidth: 0.5,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF', // Keep even rows white

    width: 80,
    height: Platform.OS === 'android' ? 50 : 50, // Adjust height based on platform
    paddingVertical: Platform.OS === 'android' ? 0 : 15, // Remove padding for Android
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

    height: 10,

    // paddingHorizontal: 10,
  },
  inputPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputSuffix: {
    // flexDirection: 'row',
    alignSelf: 'center',
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
  rowOdd: {
    backgroundColor: '#FAFAFA', // A light color for odd rows
  },
  rowEven: {
    backgroundColor: '#FFFFFF', // Keep even rows white
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
  divider: {
    borderBottomWidth: 1,
    borderColor: '#E0E0E0', // A light grey color for the divider
    marginTop: 1,
    marginBottom: 1, // Adjust spacing as needed
  },
});

export default DefaultContract;
