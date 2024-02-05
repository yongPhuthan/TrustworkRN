import {BACK_END_SERVER_URL} from '@env';
import {yupResolver} from '@hookform/resolvers/yup';
import {RouteProp, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useQuery} from '@tanstack/react-query';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Modal from 'react-native-modal';
import SignatureComponent from '../../components/utils/signature';

import React, {useEffect, useState} from 'react';
import {Controller, useForm,FormProvider, useWatch} from 'react-hook-form';
import {
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  Switch,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Appbar,
  Button,
  ProgressBar,
  ActivityIndicator,
  TextInput,
} from 'react-native-paper';
import DatePickerButton from '../../components/styles/DatePicker';
import SaveButton from '../../components/ui/Button/SaveButton';
import {useUser} from '../../providers/UserContext';
import {Contract} from '../../types/docType';
import {ParamListBase} from '../../types/navigationType';
import {signContractValidationSchema} from '../utils/validationSchema';

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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [singatureModal, setSignatureModal] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [signDate, setDateSign] = useState('');
  const [servayDate, setDateServay] = useState('');

  const [showPicker, setShowPicker] = useState(false);

  const [contract, setContract] = useState<Contract>();
  const user = useUser();

  const methods  = useForm({
    mode: 'onChange',
    defaultValues: {
      projectName: '',
      companyUser: undefined,
      sellerSignature: '',
      signDate: '',
      sellerId: '',
      servayDate: '',
      warantyTimeWork: 0,
      customer: {
        name: '',
        address: '',
        phone: '',
      },
      allTotal: 0,
      signAddress: '',
      contractId: '',
    },
    resolver: yupResolver(signContractValidationSchema),
  });
  const thaiDateFormatter = new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const onCloseSignature = () => {
    setPickerVisible(false);
    setSignatureModal(false);
    methods.setValue('sellerSignature', '', {shouldDirty: true});
  };
  const handleSignatureSuccess = () => {
    setSignatureModal(false);
  };
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

  const sellerSignature = useWatch({
    control: methods.control,
    name: 'sellerSignature',
  });
  const useSignature = () => {
    // Toggle the state of the picker and accordingly set the modal visibility
    setPickerVisible(prevPickerVisible => {
      const newPickerVisible = !prevPickerVisible;
      setSignatureModal(newPickerVisible);
      if (!newPickerVisible) {
       methods.setValue('sellerSignature', '', {shouldDirty: true});
      } else {
       methods.setValue('sellerSignature', signature? signature:'', {shouldDirty: true});
      }
      return newPickerVisible;
    });
  };
  const handleDateChange = (event: any, date?: Date) => {
    setShowPicker(false);
    if (date) {
    }
  };
  const {data, isLoading, isError} = useQuery(
    ['ContractID', id],
    () => queryContractByQuotation(),
    {
      onSuccess: data => {
        if (data) {
          setContract(data.contract as Contract);
          console.log(data);
          methods.reset({
            projectName: data.projectName,
            companyUser: data.companyUser,
            signDate: data.signDate,
            servayDate: data.servayDate,
            customer: data.customer,
            allTotal: data.allTotal,
            sellerId: data.companyUser.id,
            contractId: data.contract?.id,
            sellerSignature,
          });
        }
      },
    },
  );

  const handleDateSigne = (date: Date) => {
    const formattedDate = thaiDateFormatter.format(date);
    setDateSign(formattedDate);
  };

  const handleDateServay = (date: Date) => {
    const formattedDate = thaiDateFormatter.format(date);
    setDateServay(formattedDate);
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
        projectName: methods.getValues('projectName'),
        signDate,
        servayDate,
        total: Number(methods.getValues('allTotal')),
        signAddress: methods.watch('signAddress'),
        quotationId: data.id,
        sellerId: methods.getValues('sellerId'),
        contractID: contract?.id,
        sellerSignature: methods.getValues('sellerSignature'),
      },
    });
  };

  if (isError) return <Text>{'errors'}</Text>;
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
          title="ทำสัญญา"
          titleStyle={{
            fontSize: 18,
            fontWeight: 'bold',
            fontFamily: 'Sukhumvit Set Bold',
          }}
        />
        <Button
          // loading={postLoading}
          disabled={!methods.formState.isValid}
          mode="contained"
          icon={'arrow-right'}
          contentStyle={{
            flexDirection: 'row-reverse',
          }}
          buttonColor={'#1b72e8'}
          onPress={handleNextPress}>
          {'ไปต่อ'}
        </Button>
      </Appbar.Header>
      <ProgressBar progress={0.5} color={'#1b52a7'} />
      {data && (
        <>
              <FormProvider {...methods}>
        <SafeAreaView style={{flex: 1}}>
          <View style={styles.formInput}>
            <KeyboardAwareScrollView>
              <ScrollView style={styles.containerForm}>
                <View style={styles.card}>
                  
                    <Text style={styles.title}>รายละเอียดโครงการ</Text>
                  <View style={styles.inputContainer}>
                    <Controller
                      control={methods.control}
                      render={({
                        field: {onChange, onBlur, value},
                        fieldState: {error},
                      }) => (
                        <View>
                          <TextInput
                            onBlur={onBlur}
                            style={{
                              width: '100%',
                              marginBottom: 10,
                              height: 70,
                            }}
                            multiline
                            textAlign='left'
                            textAlignVertical='top'
                            textBreakStrategy='highQuality'
                            mode="outlined"
                            label={'ตั้งชื่อโครงการ'}
                            error={!!error}
                            onChangeText={onChange}
                            value={value}
                            // placeholder="โครงการติดตั้ง..."
                            placeholderTextColor="#A6A6A6"
                          />
                          {error && (
                            <Text style={{color: 'red'}}>{error.message}</Text>
                          )}
                        </View>
                      )}
                      name="projectName"
                      rules={{required: true}} // This line sets the field to required
                    />
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
                      {methods.getValues('customer.name')}
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
                      {Number(methods.getValues('allTotal'))
                        .toFixed(2)
                        .replace(/\d(?=(\d{3})+\.)/g, '$&,')}{' '}
                      บาท
                    </Text>
                  </View>
                </View>

                <View style={styles.stepContainer}>
                  {/* <SmallDivider /> */}
                  <View style={{marginTop: 10}}>
                    <DatePickerButton
                      label="วันที่ทำสัญญา"
                      title="วันที่ทำสัญญา"
                      date="today"
                      onDateSelected={handleDateSigne}
                    />
                  </View>
                  <View style={{marginTop: 10}}>
                    <DatePickerButton
                      label="วันที่ดูหน้างาน"
                      title="วันที่ดูหน้างาน"
                      date="today"
                      onDateSelected={handleDateServay}
                    />
                  </View>
                  <View style={{marginTop: 20}}></View>
                  {/* <SmallDivider /> */}
                  <Controller
                    control={methods.control}
                    name="signAddress"
                    render={({
                      field: {onChange, onBlur, value},
                      fieldState: {error},
                    }) => (
                      <View>
                        <TextInput
                          multiline
                          error={!!error}
                          textAlignVertical="top"
                          mode="outlined"
                          label={'ที่อยู่ติดตั้งงาน'}
                          numberOfLines={4}
                          style={{
                            width: '100%',
                            marginBottom: 10,
                            height: 100,
                          }}
                          // style={styles.input}
                          placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด..."
                          onBlur={onBlur}
                          keyboardType="default"
                          onChangeText={onChange}
                          value={value}
                        />
                        {error && (
                          <Text style={{color: 'red'}}>{error.message}</Text>
                        )}
                      </View>
                    )}
                  />
                </View>
                <View style={styles.signatureRow}>
                <Text style={styles.signHeader}>เพิ่มลายเซ็น</Text>
                <Switch
                  trackColor={{false: '#767577', true: '#81b0ff'}}
                  thumbColor={pickerVisible ? '#ffffff' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={useSignature}
                  value={pickerVisible}
                  style={Platform.select({
                    ios: {
                      transform: [{scaleX: 0.7}, {scaleY: 0.7}],
                      marginTop: 5,
                    },
                    android: {},
                  })}
                />
              </View>
              
              </ScrollView>
            </KeyboardAwareScrollView>
          </View>
        </SafeAreaView>
        <Modal
          isVisible={singatureModal}
          style={styles.modal}
          onBackdropPress={onCloseSignature}>
          <Appbar.Header
            mode="center-aligned"
            style={{
              backgroundColor: 'white',
              width: Dimensions.get('window').width,
            }}>
            <Appbar.Action icon={'close'} onPress={onCloseSignature} />
            <Appbar.Content
              title="ลายเซ็นผู้เสนอราคา"
              titleStyle={{fontSize: 18, fontWeight: 'bold'}}
            />
          </Appbar.Header>
          <SafeAreaView style={styles.containerModal}>
            <SignatureComponent
              onClose={() => setSignatureModal(false)}
              setSignatureUrl={setSignature}
              onSignatureSuccess={handleSignatureSuccess}
            />
          </SafeAreaView>
        </Modal>
        </FormProvider>
        
        </>
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
  containerModal: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    width: Dimensions.get('window').width,
  },
  modal: {
    marginTop: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 10,
    height: Dimensions.get('window').height*0.2,
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
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddindHorizontal: 50,
    marginHorizontal: 20,
  },
  signHeader: {
    flexDirection: 'row',
    marginTop: 10,
    fontSize: 16,
    color: '#19232e',
  },  signText: {
    fontSize: 18,
    marginVertical: 10,
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
    width: '100%',
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
    paddingTop: Platform.OS === 'ios' ? 10 : 0,
    minHeight: Platform.OS === 'ios' ? 80 : 40, // Adjust as needed
    textAlignVertical: 'top', // Ensure text aligns to the top
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
