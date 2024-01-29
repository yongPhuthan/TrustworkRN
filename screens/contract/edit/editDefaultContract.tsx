import React, {useState, useContext, useCallback, useMemo} from 'react';
import {
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  StyleSheet,
  Platform,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {ProgressBar, Appbar, Button} from 'react-native-paper';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {TextInput,Divider} from 'react-native-paper';

import {HOST_URL, PROJECT_FIREBASE, BACK_END_SERVER_URL} from '@env';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {defaultContractSchema} from '../../utils/validationSchema';
import {
  Contract,
  Quotation,
  Customer,
  DefaultContractType,
} from '../../../types/docType';
import {useForm, Controller} from 'react-hook-form';
import {useUser} from '../../../providers/UserContext';
import SmallDivider from '../../../components/styles/SmallDivider';

import {ParamListBase} from '../../../types/navigationType';
import FooterBtn from '../../../components/styles/FooterBtn';
type Props = {
  navigation: StackNavigationProp<ParamListBase, 'EditDefaultContract'>;
  route: RouteProp<ParamListBase, 'EditDefaultContract'>;
};
interface MyError {
  response: object;
}
type QuotationRouteParams = {
  quotationId: string;
};

const EditDefaultContract = ({navigation, route}: Props) => {


  const [defaultContractValues, setDefaultContractValues] =
    useState<DefaultContractType>();
  const id: any = route?.params;
  const user = useUser();
  const [isLoadingMutation, setIsLoadingMutation] = useState(false);
  const [step, setStep] = useState(1);
  const [contract, setContract] = useState<DefaultContractType>();
  const textRequired = 'จำเป็นต้องระบุ';
  const {data: dataProps}: any = route?.params;
  const dirtyQuotation = route?.params?.data;
  const quotationId = route?.params?.quotationId;
  const queryClient = useQueryClient();

  async function fetchContractByQuotation() {
    if (!user || !user.email) {
      console.error('User or user email is not available');
      return;
    }

    try {
      const token = await user.getIdToken(true);
      console.log('dataProps', dataProps);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/documents/getContract?quotationId=${encodeURIComponent(
          quotationId,
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

      console.log('data after', data);
      return data;
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      throw err;
    }
  }

  const updateContractAndQuotation = async (data: any) => {
    if (!user || !user.email) {
      console.error('User or user email is not available');
      return;
    }
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/documents/updateQuotationAndContract`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ data }),
        },
      );
  
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json(); // Parse the error response only if it's JSON
          throw new Error(errorData.message || 'Network response was not ok.');
        } else {
          throw new Error('Network response was not ok and not JSON.');
        }
      }
  
      // Check if the response is JSON before parsing
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const responseData = await response.json();
        return responseData; // Return the response data for successful requests
      } else {
        console.error('Received non-JSON response');
        return null;
      }
    } catch (err) {
      console.error('Error in updateContractAndQuotation:', err);
      throw err; // Rethrow the error to be caught by useMutation's onError
    }
  };
  
  const defaultValues = {
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
    defaultValues,
    resolver: yupResolver(defaultContractSchema),
  });
  const {data, isLoading, isError} = useQuery({
    queryKey: ['ContractByQuotationId', quotationId],
    queryFn: fetchContractByQuotation,
    // enabled: !!user,
    onSuccess: data => {
      if (data) {
        setContract(data.contract as any);

        const defaultValues = {
          warantyTimeWork: Number(data.warantyTimeWork),
          workCheckEnd: Number(data.workCheckEnd),
          workCheckDay: Number(data.workCheckDay),
          installingDay: Number(data.installingDay),
          adjustPerDay: Number(data.adjustPerDay),
          workAfterGetDeposit: Number(data.workAfterGetDeposit),
          prepareDay: Number(data.prepareDay),
          finishedDay: Number(data.finishedDay),
          productWarantyYear: Number(data.productWarantyYear),
          skillWarantyYear: Number(data.skillWarantyYear),
        };
        setDefaultContractValues(defaultValues);
        reset(defaultValues);
      }
    },
  });

  const {mutate, isLoading:isMuatationLoading} = useMutation(
    updateContractAndQuotation,
    {
      onSuccess: data => {
        queryClient.invalidateQueries(['dashboardData']);
        const newId = quotationId.slice(0, 8);
        navigation.navigate('DocViewScreen', {id: newId});
      },
      onError: (error:any) => {
        console.error('There was a problem calling the function:', error);
        let errorMessage = 'An unexpected error occurred';
  
        if (error.response && error.response.status === 401) {
          errorMessage = 'Authentication error. Please re-login.';
        } else if (error.response) {
          errorMessage = error.response.data.error || errorMessage;
        }
  
        Alert.alert('Error', errorMessage);
    },
   } );

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
  const watchedValues: any = watch();
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
        dirtyQuotation,
        dirtyContract: dirtyValues,
        quotationId,
      };

      mutate(apiData);

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

        <Controller
            control={control}
            rules={{required: 'This field is required'}}
            render={({
              field: {onChange, onBlur, value},
              fieldState: {error},
            }) => (
              <>
                <TextInput
                  keyboardType="number-pad"
                  textAlign="center"
                  error={!!error}
                  mode="outlined"
                  textAlignVertical="center"
                  defaultValue={defaultValue}
                  onBlur={onBlur}
                  right={<TextInput.Affix text="วัน" />}
                  value={value}
                  onChangeText={val => {
                    const numericValue = Number(val);
                    if (!isNaN(numericValue)) {
                      onChange(numericValue);
                    }
                  }}
                 
                />
              </>
            )}
            name={name}
          />

      </View>
      <Divider style={{marginTop:10}} />

    </>
  );

  return (
    <>
      <Appbar.Header  style={{
          backgroundColor: 'white',
        }} elevated mode='center-aligned'>
        <Appbar.BackAction
          onPress={() => {
            navigation.goBack();
          }}
        />
        <Appbar.Content title="แก้ไขสัญญา" titleStyle={{
          fontSize:18,
          fontWeight:'bold'
        }} />
        <Button
          loading={isMuatationLoading}
          disabled={!isValid || isMuatationLoading }
          mode="contained"
          buttonColor={'#1b72e8'}
          onPress={handleDonePress}
          style={{marginRight: 5}}>
          {'บันทึก'}
        </Button>
      </Appbar.Header>
      <ProgressBar progress={1} color={'#1b52a7'} />

      <KeyboardAwareScrollView>
      {contract ? (
        <SafeAreaView style={{flex: 1}}>
          <KeyboardAvoidingView
            style={{flex: 1}}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
            <View style={styles.containerForm}>
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
            </View>
          </KeyboardAvoidingView>
        
        </SafeAreaView>
      ) : (
        <SafeAreaView style={{flex: 1}}>
        <View style={styles.containerForm}>
          <View style={styles.formInput}>
            <SmallDivider />

            {renderTextInput('productWarantyYear', 'productWarantyYear')}
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
        </View>

     
      </SafeAreaView>
      )}
      </KeyboardAwareScrollView>
     
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

export default EditDefaultContract;
