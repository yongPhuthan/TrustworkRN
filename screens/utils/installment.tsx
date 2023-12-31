import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import {Button} from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';
import {useForm, Controller, useFieldArray} from 'react-hook-form';
import {StackNavigationProp} from '@react-navigation/stack';
import {HOST_URL, BACK_END_SERVER_URL} from '@env';
import {useRoute} from '@react-navigation/native';
import {faChevronDown} from '@fortawesome/free-solid-svg-icons';
import Icon from 'react-native-vector-icons/FontAwesome'; // Or another library of your choice
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useUser} from '../../providers/UserContext';
import SmallDivider from '../../components/styles/SmallDivider';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import ContractFooter from '../../components/styles/ContractFooter';
import {ParamListBase} from '../../types/navigationType';
import {RouteProp} from '@react-navigation/native';
import {useSignatureUpload} from '../../hooks/utils/image/useSignatureUpload';
import SaveButton from '../../components/ui/Button/SaveButton';

interface InstallmentDetail {
  installment: number;
  percentage: number;
  amount: number;
}

type Props = {
  navigation: StackNavigationProp<ParamListBase, 'Installment'>;
  route: RouteProp<ParamListBase, 'Installment'>;

  data: any;
};
interface MyError {
  response: object;
}
type UpdateContractInput = {
  data: any;
};
// const updateContract = async (input: UpdateContractInput): Promise<any> => {
//   const {data} = input;
//   const user = auth().currentUser;
//   console.log('data PUT', JSON.stringify(data));
//   let url;
//   if (__DEV__) {
//     url = `http://${HOST_URL}:5001/${PROJECT_FIREBASE}/asia-southeast1/appUpdateFinalContract`;
//   } else {
//     url = `https://asia-southeast1-${PROJECT_FIREBASE}.cloudfunctions.net/appUpdateFinalContract`;
//   }

//   const response = await fetch(url, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${user?.uid}`,
//     },
//     body: JSON.stringify({data}),
//   });
//   if (!response.ok) {
//     throw new Error('Network response was not ok');
//   }
//   const responseData = await response.json();
//   return responseData;
// };

const Installment = ({navigation}: Props) => {
  const route = useRoute();
  const dataProps: any = route.params?.data;
  const totalPrice = dataProps.total;
  const [installments, setInstallments] = useState<number>(0);
  const user = useUser();
  const queryClient = useQueryClient();

  const {isSignatureUpload, signatureUrl, handleSignatureUpload} =
    useSignatureUpload();

  const [percentages, setPercentages] = useState<{[key: number]: number}>({});
  const [isPercentagesValid, setIsPercentagesValid] = useState<boolean>(true);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateQuotation = async (data: any) => {
    if (!user || !user.email) {
      console.error('User or user email is not available');
      return;
    }
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/documents/updateQuotationPeriod`,
        {
          method: 'PUT',
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
      console.log(err);
    }
  };

  const [installmentDetailsText, setInstallmentDetailsText] = useState<{
    [key: number]: string;
  }>({});
  const {
    handleSubmit,
    control,
    formState: {errors},
    watch,
    formState: {isDirty, dirtyFields, isValid},
    getValues,
    setValue,
  } = useForm({
    defaultValues: {
      installments: [
        {
          amount: 0,
          percentage: 0,
          details: '',
        },
      ],
    },
  });

  const {fields, append, remove} = useFieldArray({
    control,
    name: 'installments',
  });

  const {mutate, isLoading, isError} = useMutation({
    mutationFn: updateQuotation,
    onSuccess: data => {
      const newId = dataProps.quotationId.slice(0, 8);
      queryClient.invalidateQueries(['dashboardData']);
      navigation.navigate('Signature', {
        text: 'signature',
        data: dataProps,
      });
      // navigation.navigate('DocViewScreen', {
      //   id: newId,
      // });
    },
    onError: (error: any) => {
      console.error('There was a problem calling the function:', error);
      let errorMessage = 'An unexpected error occurred';

      if (error.response && error.response.status === 401) {
        errorMessage = 'Authentication error. Please re-login.';
      } else if (error.response) {
        errorMessage = error.response.data.error || errorMessage;
      }

      Alert.alert('Error', errorMessage);
    },
  });
  useEffect(() => {
    const totalPercentage = Object.values(percentages).reduce(
      (acc, percentage) => acc + percentage,
      0,
    );

    if (totalPercentage < 100) {
      setIsPercentagesValid(false);
      setErrorMessage(`ผลรวมคือ${totalPercentage} ควรแบ่งงวดให้ครบ 100%`);
    } else if (totalPercentage > 100) {
      setIsPercentagesValid(false);
      setErrorMessage(`ผลรวมคือ${totalPercentage} ควรแบ่งงวดไม่เกิน 100%`);
    } else {
      setIsPercentagesValid(true);
      setErrorMessage('');
    }
  }, [percentages]);

  const handleSave = useCallback(async () => {
    if (!isPercentagesValid) {
      Alert.alert('Error', errorMessage?.toString() || 'Error');
      return;
    }

    const newInstallmentDetails = Object.entries(percentages).map(
      ([key, value]) => ({
        installment: Number(key) + 1,
        percentage: value,
        amount: (totalPrice * value) / 100,
        details: installmentDetailsText[Number(key)],
      }),
    );
    dataProps.periodPercent = newInstallmentDetails;
    dataProps.contract.projectName = dataProps.projectName;
    dataProps.contract.signAddress = dataProps.signAddress;
    dataProps.contract.signDate = dataProps.signDate;
    dataProps.contract.servayDate = dataProps.servayDate;
    dataProps.contract.id = dataProps.contractID;
    if (dataProps.sellerSignature) {
      navigation.navigate('ExistingSignature', {
        data: dataProps,
      });
    } else {
      // await mutate({data: dataProps});
      navigation.navigate('Signature', {
        text: 'signature',
        data: dataProps,
      });
    }

    // await mutate({data: dataProps});
  }, [
    isPercentagesValid,
    errorMessage,
    percentages,
    installmentDetailsText,
    dataProps,
  ]);

  const DropdownIcon = () => (
    <Icon
      name="chevron-down"
      style={{marginRight: 20, marginTop: 15}}
      size={18}
      color="gray"
    />
  );
  const handlePercentageChange = useCallback((value: string, index: number) => {
    setPercentages(prevState => ({
      ...prevState,
      [index]: parseFloat(value),
    }));
  }, []);

  const handleInstallmentDetailsTextChange = useCallback(
    (value: string, index: number) => {
      setInstallmentDetailsText(prevState => ({
        ...prevState,
        [index]: value,
      }));
    },
    [],
  );

  const pickerItems = [2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => ({
    label: `แบ่งชำระ ${value} งวด`,
    value,
  }));
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <ActivityIndicator />
      </View>
    );
  }

  const renderItem = ({item, index}: {item: any; index: number}) => (
    <View style={styles.card}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <View style={styles.inputContainerForm}>
          <TextInput
            style={{fontWeight: 'bold'}}
            textAlign="center"
            aria-disabled>
            งวดที่ {index + 1}
          </TextInput>
          <Controller
            control={control}
            render={({field}) => (
              <TextInput
                style={{width: 40, textAlign: 'center'}}
                placeholder="0"
                onChangeText={value => {
                  field.onChange(value);
                  handlePercentageChange(value, index);
                }}
                keyboardType="numeric"
              />
            )}
            name={`installments.${index}.percentage`}
            rules={{required: true}}
          />

          <TextInput textAlign="center">%</TextInput>
        </View>
        {/* <View style={styles.inputContainerForm}>
          <Text
            style={{
              width: 30,
              height: 45,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            งวดที่ {index + 1}
          </Text>
          <Controller
            control={control}
            render={({field}) => (
              <TextInput
                style={{width: 40, textAlign: 'center'}}
                placeholder="0"
                onChangeText={value => {
                  field.onChange(value);
                  handlePercentageChange(value, index);
                }}
                keyboardType="numeric"
              />
            )}
            name={`installments[${index}].percentage`}
            rules={{required: true}}
          />

          <Text style={styles.inputSuffix}>%</Text>
        </View> */}
        <Text style={styles.amountText}>
          {(!isNaN(totalPrice * percentages[index])
            ? (totalPrice * percentages[index]) / 100
            : 0
          ).toFixed(2)}{' '}
          บาท
        </Text>
      </View>
      <View style={styles.cardContent}>
        <View style={{alignSelf: 'flex-start'}}>
          <Text style={styles.title}>{`รายละเอียดงวดที่ ${index + 1}`}</Text>
          <Controller
            control={control}
            name={`installments.${index}.details`}
            render={({field}) => (
              <TextInput
                multiline
                style={styles.Multilines}
                placeholder={
                  index === 0
                    ? `ตัวอย่าง. ชำระมัดจำเพื่อเริ่มผลิตงาน...`
                    : `ตัวอย่าง. ชำระเมื่อส่งงานติดตั้งรายการที่ ${index} แล้วเสร็จ...`
                }
                onChangeText={value => {
                  field.onChange(value);
                  handleInstallmentDetailsTextChange(value, index);
                }}
              />
            )}
            rules={{required: true}}
          />

          {/* {errors && (
            <Text
              style={{
                color: 'red',
                fontSize: 12,
              }}>
              กรุณาใส่ข้อมูล
            </Text>
          )} */}
        </View>
      </View>

      <View style={{marginTop: 5}}>
        <SmallDivider />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{flex: 1, marginTop: 5}}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={
            Platform.OS === 'ios' ? 0 : -Dimensions.get('window').height
          }
          style={styles.container}>
          <ScrollView
            style={{flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 5}}>
            <View style={styles.innerContainer}>
              {installments < 1 && (
                <Text style={styles.header}>โครงการนี้แบ่งจ่ายกี่งวด</Text>
              )}
              <Text style={styles.subHeader}>
                ยอดรวม:{' '}
                {Number(totalPrice)
                  .toFixed(2)
                  .replace(/\d(?=(\d{3})+\.)/g, '$&,')}{' '}
                บาท
              </Text>
              <RNPickerSelect
                onValueChange={value => setInstallments(value)}
                items={pickerItems}
                placeholder={{label: 'เลือกจำนวนงวด', value: null}}
                style={pickerSelectStyles}
                useNativeAndroidPickerStyle={false}
                Icon={DropdownIcon as any}
              />
              {installments > 0 && (
                <>
                  <FlatList
                    data={Array.from({length: installments})}
                    renderItem={renderItem}
                    keyExtractor={(_, index) => index.toString()}
                  />
                  <View
                    style={{
                      width: '100%',
                      alignSelf: 'center',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <SaveButton
                      onPress={handleSave}
                      disabled={!isPercentagesValid || !isValid}
                    />
                  </View>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};
const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  innerContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  subHeader: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '400',
  },
  header: {
    fontSize: 22,
    marginBottom: 30,
    fontWeight: 'bold',
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 10,
    verticalAlign: 'middle',
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
  icon: {
    color: 'white',
    marginTop: 3,
  },
  saveButton: {
    backgroundColor: '#0073BA',
    marginTop: 16,
    borderRadius: 8,
  },
  card: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  cardHeader: {
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    marginTop: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    verticalAlign: 'middle',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailsInput: {
    flex: 1,
    borderWidth: 0.5,
    marginBottom: 8,
    backgroundColor: 'white',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    marginRight: 8,
    borderWidth: 0.5,
    width: '90%',
    backgroundColor: 'white',
  },
  Multilines: {
    borderWidth: 0.5,
    borderRadius: 8,
    padding: 10,
    backgroundColor: 'white',
    width: width * 0.8,
    marginBottom: 20,
    height: 100,
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
  label: {
    // fontFamily: 'sukhumvit set',
    fontSize: 16,
    fontWeight: '400',
    marginTop: 15,
    marginBottom: 10,
  },
  inputSuffix: {
    // alignSelf: 'flex-end',
    alignItems: 'flex-end',
    fontWeight: 'bold',
  },

  inputPrefix: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    fontWeight: 'bold',
  },
  inputContainerForm: {
    marginBottom: 10,
    borderWidth: 0.5,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF', // Keep even rows white

    width: 170,
    height: Platform.OS === 'android' ? 50 : 50,
    paddingVertical: Platform.OS === 'android' ? 0 : 15,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    borderRadius: 4,
    paddingRight: 30, // ensure icon does not overlay text
    marginBottom: 16,
    verticalAlign: 'middle',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: '#009EDB',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // ensure icon does not overlay text
    marginBottom: 16,
    backgroundColor: '#F0F0F0',
  },

  installmentDetailContainer: {
    backgroundColor: '#e3f3ff',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  installmentDetailText: {
    fontSize: 16,
  },
  errors: {
    color: 'red',
    fontSize: 12,
  },
});
export default Installment;
