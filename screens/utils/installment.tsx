import {BACK_END_SERVER_URL} from '@env';
import {RouteProp, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import React, {useCallback, useEffect, useState} from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Decimal from 'decimal.js-light';
import SignatureComponent from '../../components/utils/signature';
import {installmentValidationSchema} from '../utils/validationSchema';
import {yupResolver} from '@hookform/resolvers/yup';
import Modal from 'react-native-modal';

import {Controller, useFieldArray, useForm} from 'react-hook-form';
import {
  Alert,
  Dimensions,
  FlatList,
  Switch,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Appbar,
  Button,
  ProgressBar,
  Card,
  ActivityIndicator,
  TextInput,
} from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';
import Icon from 'react-native-vector-icons/FontAwesome'; // Or another library of your choice
import SmallDivider from '../../components/styles/SmallDivider';
import SaveButton from '../../components/ui/Button/SaveButton';
import {useSignatureUpload} from '../../hooks/utils/image/useSignatureUpload';
import {useUser} from '../../providers/UserContext';
import {ParamListBase} from '../../types/navigationType';

type Props = {
  navigation: StackNavigationProp<ParamListBase, 'Installment'>;
  route: RouteProp<ParamListBase, 'Installment'>;

  data: any;
};

const Installment = ({navigation}: Props) => {
  const route = useRoute();
  const dataProps: any = route.params?.data;
  const [singatureModal, setSignatureModal] = useState(false);
  const totalPrice = dataProps.total;
  const [installments, setInstallments] = useState<number>(0);
  const user = useUser();
  const queryClient = useQueryClient();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);

  const {isSignatureUpload, signatureUrl, handleSignatureUpload} =
    useSignatureUpload();

  const [percentages, setPercentages] = useState<{[key: number]: number}>({});
  const [isPercentagesValid, setIsPercentagesValid] = useState<boolean>(true);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const onCloseSignature = () => {
    setPickerVisible(false);
    setSignatureModal(false);
    setValue('sellerSignature', '', {shouldDirty: true});
  };
  const handleSignatureSuccess = () => {
    setSignatureModal(false);
  };
  const updateQuotation = async (data: any) => {
    if (!user || !user.email) {
      throw new Error('User or user email is not available');
    }
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/documents/updateQuotationPeriod?email=${encodeURIComponent(
          user.email,
        )}`,
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Network response was not ok.');
      }
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } catch (err) {
      throw new Error(err);
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
      sellerSignature: '',
      installments: [
        {
          amount: 0,
          percentage: 0,
          details: '',
        },
      ],
    },
    resolver: yupResolver(installmentValidationSchema),
  });

  const {fields, append, remove} = useFieldArray({
    control,
    name: 'installments',
  });

  const {mutate, isLoading, isError} = useMutation({
    mutationFn: updateQuotation,
    onSuccess: data => {
      const newId = dataProps.quotationId.slice(0, 8);
      queryClient.invalidateQueries(['contractDashboard']);
      navigation.navigate('DocViewScreen', {
        id: newId,
      });
    },
    onError: (error: any) => {
      Alert.alert(
        'เกิดข้อผิดพลาด',
        `Server-side user creation failed:, ${error}`,
        [{text: 'OK'}],

        {cancelable: false},
      );
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
    if (!dataProps.contract) {
      dataProps.contract = {};
  }
    dataProps.periodPercent = newInstallmentDetails;
    dataProps.contract.projectName = dataProps.projectName;
    dataProps.contract.signAddress = dataProps.signAddress;
    dataProps.contract.signDate = dataProps.signDate;
    dataProps.contract.servayDate = dataProps.servayDate;

    await mutate({data: dataProps});
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
        <ActivityIndicator size={'large'} />
      </View>
    );
  }
console.log('dataProps.projectName', dataProps)
  const renderItem = ({item, index}: {item: any; index: number}) => (
    <Card
      mode="outlined"
      style={{
        borderRadius: 8,
        width: '100%',
        // paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: 'white',
        marginBottom: 10,
      }}
      testID="installmentCard">
      <Card.Title title={`งวดที่ ${index + 1}`} />
      <Card.Content>
        <Controller
          control={control}
          render={({field: {onBlur, onChange, value}, fieldState: {error}}) => (
            <View>
              <TextInput
                left={<TextInput.Affix text={`จำนวน`} />}
                right={<TextInput.Affix text="%" />}
                style={{width: '70%', textAlign: 'center'}}
                mode="outlined"
                error={!!error}
                placeholder="0"
                onBlur={onBlur}
                value={value ? String(value) : '0'}
                onChangeText={value => {
                  const formattedValue = String(parseFloat(value));
                  onChange(formattedValue);
                  handlePercentageChange(formattedValue, index);
                }}
                keyboardType="numeric"
              />
              {error && <Text style={{color: 'red'}}>{error.message}</Text>}
            </View>
          )}
          name={`installments.${index}.percentage`}
          rules={{required: true}}
        />
        <Text style={styles.amountText}>
          เป็นเงิน{' '}
          {!isNaN(totalPrice * percentages[index])
            ? new Intl.NumberFormat('th-TH', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              }).format(
                new Decimal((totalPrice * percentages[index]) / 100).toNumber(),
              )
            : 0}{' '}
          บาท
        </Text>

        <View style={{alignSelf: 'flex-start', marginTop: 30}}>
          <Text style={styles.title}>{`รายละเอียดงวดที่ ${index + 1}`}</Text>
          <Controller
            control={control}
            name={`installments.${index}.details`}
            render={({field, fieldState: {error}}) => (
              <View>
                <TextInput
                  error={!!error}
                  multiline
                  mode="outlined"
                  style={{
                    width: Dimensions.get('window').width * 0.75,
                    marginBottom: 10,
                    height: 100,
                  }}
                  placeholder={
                    index === 0
                      ? `เช่น ชำระมัดจำเพื่อเริ่มผลิตงาน...`
                      : `เช่น ชำระเมื่อส่งงานติดตั้งรายการที่ ${index} แล้วเสร็จ...`
                  }
                  onChangeText={value => {
                    field.onChange(value);
                    handleInstallmentDetailsTextChange(value, index);
                  }}
                />
                {error && <Text style={{color: 'red'}}>{error.message}</Text>}
              </View>
            )}
            rules={{required: true}}
          />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <>
      <Appbar.Header
        elevated
        mode="center-aligned"
        style={{
          backgroundColor: 'white',
        }}>
        <Appbar.BackAction
          onPress={() => {
            navigation.goBack();
          }}
        />
        <Appbar.Content
          title="แบ่งงวดชำระ"
          titleStyle={{
            fontSize: 18,
            fontWeight: 'bold',
            fontFamily: 'Sukhumvit Set Bold',
          }}
        />
        <Button
          // loading={postLoading}
          disabled={!isPercentagesValid || !isValid}
          mode="contained"
          buttonColor={'#1b72e8'}
          onPress={handleSave}>
          {'ไปต่อ'}
        </Button>
      </Appbar.Header>
      <SafeAreaView style={{flex: 1}}>
        <View style={{flex: 1, marginTop: 5}}>
          <KeyboardAwareScrollView style={styles.container}>
            <ScrollView
              style={{
                flex: 1,
                backgroundColor: '#FFFFFF',
                paddingHorizontal: 5,
              }}>
              <View style={styles.innerContainer}>
                {installments < 1 && (
                  <Text style={styles.header}>โครงการนี้แบ่งจ่ายกี่งวด</Text>
                )}
                <Text style={styles.subHeader}>
                  ยอดรวม{' '}
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
                    {/* <View
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
                  </View> */}
                  </>
                )}
              </View>
            </ScrollView>
          </KeyboardAwareScrollView>
        </View>
      </SafeAreaView>
    </>
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
    // fontWeight: '500',
    marginTop: 10,
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
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signHeader: {
    flexDirection: 'row',
    marginTop: 10,
    fontSize: 16,
    color: '#19232e',
  },
  signText: {
    fontSize: 18,
    marginVertical: 10,
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
  modal: {
    marginTop: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 10,
    height: Dimensions.get('window').height * 0.2,
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
  containerModal: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    width: Dimensions.get('window').width,
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
