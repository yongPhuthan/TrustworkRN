import React, {useState, useContext, useCallback, useRef} from 'react';
import {
  Button,
  SafeAreaView,
  KeyboardAvoidingView,
  StyleSheet,
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
import firebase, {
  testFirebaseConnection,
  testFunctionsConnection,
} from '../../firebase';
import {HOST_URL, PROJECT_FIREBASE} from '@env';
import {v4 as uuidv4} from 'uuid';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Store} from '../../redux/store';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {Contract, Quotation, Customer} from '../../types/docType';
import {useForm, Controller} from 'react-hook-form';
import {PeriodPercentType} from '../../types/docType';

import SmallDivider from '../../components/styles/SmallDivider';
import ContractFooter from '../../components/styles/ContractFooter';
import CreateContractScreen from './createContractScreen';
import Lottie from 'lottie-react-native';
import EditInstallment from '../../components/editInstallment';
import {DefaultContractType} from '../../types/docType';
import {ParamListBase} from '../../types/navigationType';
type Props = {
  navigation: StackNavigationProp<ParamListBase, 'DefaultContract'>;
  route: RouteProp<ParamListBase, 'DefaultContract'>;
};
interface MyError {
  response: object;
}
const db = firebase.firestore();

const fetchContractByEmail = async ( email: string) => {
  const user = auth().currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  if (user.email !== email) {
    throw new Error('Email mismatch with authenticated user.');
  }
console.log('EMAIL',{email})
  const idToken = await user.getIdToken();
  let url;
  if (__DEV__) {
    url = `http://${HOST_URL}:5001/${PROJECT_FIREBASE}/asia-southeast1/appQueryDefaultContract`;
  } else {
    url = `https://asia-southeast1-${PROJECT_FIREBASE}.cloudfunctions.net/appQueryDefaultContract`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ email}),
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return data;
};

const createContractAndQuotation = async (data: any) => {
  const user = auth().currentUser;

  if (!user) {
    console.error('No user authenticated');
    return;
  }

  let url;
  if (__DEV__) {
    url = `http://${HOST_URL}:5001/${PROJECT_FIREBASE}/asia-southeast1/appCreateContractAndQuotation`;
  } else {
    url = `https://asia-southeast1-${PROJECT_FIREBASE}.cloudfunctions.net/appCreateContractAndQuotation`;
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

const createQuotation = async ({data}: {data: any}) => {
  const user = auth().currentUser;
  let url;

  if (__DEV__) {
    url = `http://${HOST_URL}:5001/${PROJECT_FIREBASE}/asia-southeast1/appCreateQuotation`;
  } else {
    url = `https://asia-southeast1-${PROJECT_FIREBASE}.cloudfunctions.net/appCreateQuotation`;
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

const updateDefaultContractAndCreateQuotation = async ({data}: {data: any}) => {
  const user = firebase.auth().currentUser;

  if (user) {
    console.log(user.uid);
    try {
      const contractsRef = db.collection('defaultContracts');
      const snapshot = await contractsRef.where('user', '==', user.uid).get();

      if (snapshot.empty) {
        console.log('No matching contract found.');
        return;
      }

      // Update the first matching contract (since each user has only one)
      const contractId = snapshot.docs[0].id;
      await contractsRef.doc(contractId).update(data);

      console.log('Contract updated successfully');
    } catch (error) {
      console.error('Error updating contract: ', error);
    }
  } else {
    console.log('No user is signed in');
  }
  let url;
  if (__DEV__) {
    url = `http://${HOST_URL}:5001/${PROJECT_FIREBASE}/asia-southeast1/appUpdateContractAndCreateQuotation`;
  } else {
    url = `https://asia-southeast1-${PROJECT_FIREBASE}.cloudfunctions.net/appUpdateContractAndCreateQuotation`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user?.uid}`,
    },
    body: JSON.stringify({data: data.data}),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
};
const getContractForUser = async () => {
  const user = firebase.auth().currentUser;
  if (!user) {
    console.error('No user authenticated');
    return;
  } else {
    try {
      const contractsRef = db.collection('defaultContracts');
      const snapshot = await contractsRef.where('user', '==', user.uid).get();

      if (snapshot.empty) {
        console.log('No matching contract found.');
        return null;
      }

      // Return the first matching contract (since each user has only one)
      return snapshot.docs[0].data();
    } catch (error) {
      console.error('Error querying contract: ', error);
      return null;
    }
  }
};

const DefaultContract = ({navigation}: Props) => {
  const route = useRoute();
  const id: any = route?.params;
  const [fcnToken, setFtmToken] = useState('');
  const [isLoadingMutation, setIsLoadingMutation] = useState(false);
  const [step, setStep] = useState(1);
  const [contract, setContract] = useState<DefaultContractType>();
  const [customer, setCustomer] = useState<Customer>();
  const textRequired = 'จำเป็นต้องระบุ';
  const {data: dataProps}: any = route?.params;
  const quotation = dataProps.data;
  const queryClient = useQueryClient();
  console.log('data props', dataProps);
  const email = auth().currentUser?.email;  // Assuming you're using Firebase authentication

if (!email) {
    throw new Error('Email is missing');
}
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
      warantyTimeWork: '',
      workCheckEnd: '',
      workCheckDay: '',
      installingDay: '',
      adjustPerDay: '',
      workAfterGetDeposit: '',
      prepareDay: '',
      finishedDay: '',
      productWarantyYear:'',
      skillWarantyYear:'',
    },
  });
  const {data, isLoading, isError} = useQuery(
    ['ContractByEmail', email], 
    () => fetchContractByEmail(email), 
    {
      onSuccess: data => {
        console.log('data Query',data);

        if (data) {
          setContract(data as any);
          console.log(data);
          reset({
            warantyTimeWork: data.warantyTimeWork,
            workCheckEnd: data.workCheckEnd,
            workCheckDay: data.workCheckDay,
            installingDay: data.installingDay,
            adjustPerDay: data.adjustPerDay,
            workAfterGetDeposit: data.workAfterGetDeposit,
            prepareDay: data.prepareDay,
            finishedDay: data.finishedDay,
            productWarantyYear:data.productWarantyYear,
            skillWarantyYear:data.skillWarantyYear,
          });
        }
      },
    }
);

  const {mutate: createContractAndQuotationMutation} = useMutation(
    createContractAndQuotation,
    {
      onSuccess: data => {
        queryClient.invalidateQueries(['dashboardData']);
        const newId = quotation.id.slice(0, 8);
        navigation.navigate('DocViewScreen', {id: newId});
      },
      onError: (error: MyError) => {
        console.error('There was a problem calling the function:', error);
        console.log(error.response);
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
      console.error('There was a problem calling the function:', error);
      console.log(error.response);
    },
  });

  // Mutation for updating an existing contract
  const {mutate: updateContractMutation} = useMutation(
    updateDefaultContractAndCreateQuotation,
    {
      // Assuming you have an updateContract function
      onSuccess: data => {
        queryClient.invalidateQueries(['dashboardData']);
        const newId = quotation.id.slice(0, 8);
        navigation.navigate('DocViewScreen', {id: newId});
      },
      onError: (error: MyError) => {
        console.error('There was a problem calling the function:', error);
        console.log(error.response);
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

      console.log('api data', JSON.stringify(apiData));

      if (!contract) {
        createContractAndQuotationMutation(apiData);
      } else if (isDirty) {
        updateContractMutation({...apiData});
      } else {
        createQuotationMutation(apiData);
      }

      setIsLoadingMutation(false);
    } catch (error: Error | MyError | any) {
      console.error('There was a problem calling the function:', error);
      console.log(error.response);
      setIsLoadingMutation(false);
    }
  };

  const handleBackPress = () => {
    // If it's not the first step, decrement the step.
    if (step > 1) {
      setStep(step - 1);
    } else {
      ('');
      //   reset({
      //     warantyTimeWork: '',
      //     workCheckEnd: '',
      //     workCheckDay: '',
      //     installingDay: '',
      //     adjustPerDay: '',
      //     workAfterGetDeposit: '',
      //     prepareDay: '',
      //     finishedDay: '',
      //   });
      navigation.goBack();
    }
  };
  function safeToString(value) {
    return value !== undefined && value !== null ? value.toString() : "";
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
           
                // value={value !== undefined && value !== null ? value.toString() : defaultValue}
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
                 safeToString( contract.productWarantyYear),
                )}
                              {renderTextInput(
                  'skillWarantyYear',
                  'รับประกันงานติดตั้งกี่ปี',
                 safeToString( contract.skillWarantyYear),
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
                 safeToString( contract.prepareDay),
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
                 safeToString( contract.adjustPerDay),
                )}

                <SmallDivider />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
          <ContractFooter
              finalStep={false}
              onBack={handleBackPress}
              onNext={handleDonePress}
              isLoading={isLoading}
              disabled={!isValid }
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

                {renderTextInput('productWarantyYear', 'รับประกันวัสดุอุปกรณ์กี่ปี')}
                {renderTextInput('skillWarantyYear', 'รับประกันงานติดตั้งกี่ปี')}
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

                <SmallDivider />
              </View>
            </ScrollView>
            <ContractFooter
              finalStep={false}
              onBack={handleBackPress}
              onNext={handleDonePress}
              isLoading={isLoading}
              disabled={!isValid || !isDirty}
            />
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

export default DefaultContract;
