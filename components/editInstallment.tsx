import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Dimensions,
  Platform,
} from 'react-native';
import {Button} from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';
import {useForm, Controller, useFieldArray} from 'react-hook-form';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, ParamListBase} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import {faChevronDown} from '@fortawesome/free-solid-svg-icons';
import Icon from 'react-native-vector-icons/FontAwesome'; // Or another library of your choice
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {useQuery, useMutation} from 'react-query';
import {useNavigation} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {v4 as uuidv4} from 'uuid';
import {Contract, Quotation, Customer, CompanyUser} from '../types/docType';

import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faChevronRight,
  faCashRegister,
  faCoins,
} from '@fortawesome/free-solid-svg-icons';
import SmallDivider from './styles/SmallDivider';
import ContractFooter from './styles/ContractFooter';
import {HOST_URL} from '@env';
import {PeriodPercentType} from '../types/docType';

interface InstallmentDetail {
  installment: number;
  percentage: number;
  amount: number;
}
type StackNavigatorParams = {
  DocViewScreen: {id: string};
  // Define other screens here
};

type Props = {
  data: any;
  handleBackPress: () => void;
  periodPercent: PeriodPercentType[];
  total: number;
  quotationId: string;
  contractId: string;
  sellerId: string;
};
interface MyError {
  response: object;
  // add other properties if necessary
}
type UpdateContractInput = {
  contract: Contract;
  isEmulator: boolean;
  quotationId: string;
  contractId: string;
  sellerId: string;
  newInstallmentDetails:any
};
const updateContract = async (input: UpdateContractInput): Promise<any> => {
  const {contract, isEmulator, quotationId, contractId, sellerId,newInstallmentDetails} = input;
  const user = auth().currentUser;
  console.log('data PUT', JSON.stringify(contract));

  let url;
  if (isEmulator) {
    url = `http://${HOST_URL}:5001/workerfirebase-f1005/asia-southeast1/updateContractAndLog`;
  } else {
    url = `https://asia-southeast1-workerfirebase-f1005.cloudfunctions.net/updateContractAndLog`;
  }
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user?.uid}`,
    },
    body: JSON.stringify({quotationId, contractId, sellerId, contract, newInstallmentDetails}),
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const responseData = await response.json(); 
  return responseData; 
};

const EditInstallment = (props: Props) => {
  const route = useRoute();
  const dataProps: any = props.data;
  const quotationId: string = props.quotationId;
  const contractId: string = props.contractId;
  const sellerId: string = props.sellerId;
  const totalPrice = props.total;
  const [installments, setInstallments] = useState<number>(0);
  const [installmentDetails, setInstallmentDetails] = useState<
    InstallmentDetail[]
  >([]);
  const percentagesProps = Object.values(props.periodPercent).map(
    installment => installment.percentage,
  );

  const [percentages, setPercentages] = useState<{[key: number]: number}>(
    percentagesProps,
  );
  const [isPercentagesValid, setIsPercentagesValid] = useState<boolean>(true);
  const [percentageValid, setPercentageValid] = useState<{
    [key: number]: number;
  }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigation = useNavigation();
  const Stack = createStackNavigator<StackNavigatorParams>();

  const [installmentDetailsText, setInstallmentDetailsText] = useState<{
    [key: number]: string;
  }>({});
  const {
    handleSubmit,
    control,
    formState: {errors},
    watch,
    reset,
    formState: {isDirty, dirtyFields, isValid},
    getValues,
    setValue,
  } = useForm({
    defaultValues: {
      installments: props.periodPercent,
    },
  });


  useEffect(() => {
    setInstallments(Object.values(watch('installments')).length);

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

  const {mutate, isLoading} = useMutation(updateContract, {
    onSuccess: data => {
      const newId = quotationId.slice(0, 8);
      navigation.navigate('DocViewScreen', {
        id: newId,
      });
    },
    onError: (error: MyError) => {
      console.error('There was a problem calling the function:', error);
      console.log(error.response);
    },
  });

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
console.log('MV',dataProps)
    await mutate({
      contract: dataProps,
      isEmulator: false,
      quotationId,
      contractId,
      sellerId,
    newInstallmentDetails
    });

    // Update periodPercent in data
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

  const renderItem = ({item, index}: {item: any; index: number}) => (
    <View style={styles.card}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
        }}>
        <View style={styles.inputContainerForm}>
          <Text style={styles.inputPrefix}>งวดที่ {index + 1}</Text>
          <Controller
            control={control}
            render={({field}) => (
              <TextInput
                style={{width: 40, textAlign: 'center'}}
                placeholder="0"
                value={field.value ? field.value.toString() : ''}
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
        </View>
        <Text style={styles.amountText}>
          {(!isNaN(totalPrice * Number(percentages[index]))
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
            render={({field}) => (
              <TextInput
                multiline
                style={styles.Multilines}
                placeholder="Address"
                value={field.value ? field.value.toString() : ''}
                onChangeText={value => {
                  field.onChange(value);
                  handleInstallmentDetailsTextChange(value, index);
                }}
              />
            )}
            name={`installments[${index}].details`}
            rules={{required: true}}
          />
          {errors.address && (
            <Text style={styles.error}>This field is required.</Text>
          )}
        </View>
      </View>

      <View style={{marginTop: 20}}>
        <SmallDivider />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
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
          value={installments}
          onValueChange={value => setInstallments(value)}
          items={pickerItems}
          placeholder={{label: 'เลือกจำนวนงวด', value: null}}
          style={pickerSelectStyles}
          useNativeAndroidPickerStyle={false} // this is necessary to style placeholder and inputText
          Icon={DropdownIcon}
        />
        {installments > 0 && (
          <FlatList
            data={Array.from({length: installments})}
            renderItem={renderItem}
            keyExtractor={(_, index) => index.toString()}
          />
        )}
      </View>
      <ContractFooter
        isLoading={isLoading}
        finalStep={true}
        // finalStep={step === 3}
        onBack={props.handleBackPress}
        onNext={handleSave}
        disabled={false}
      />
    </KeyboardAvoidingView>
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
    marginVertical: 20,
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
    alignSelf: 'flex-end',
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
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    width: 180,
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
    backgroundPosition: 'right', // Place it on the right
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
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right', // Place it on the right
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
});
export default EditInstallment;
