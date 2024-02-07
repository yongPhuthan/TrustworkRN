import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { BACK_END_SERVER_URL } from '@env';
import { yupResolver } from '@hookform/resolvers/yup';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Button, Divider, TextInput, Text as TextPaper } from 'react-native-paper';
import { useUser } from '../../providers/UserContext';
import {
  DefaultContractType
} from '../../types/docType';
import { ParamListBase } from '../../types/navigationType';
import { defaultContractSchema } from '../utils/validationSchema';

type Props = {
  navigation: StackNavigationProp<ParamListBase, 'ExistingContract'>;
  route: RouteProp<ParamListBase, 'ExistingContract'>;
};
interface MyError {
  response: object;
}

const ExistingContract = ({navigation}: Props) => {
  const user = useUser();
  const [isLoadingMutation, setIsLoadingMutation] = useState(true);
  const [step, setStep] = useState(1);
  const [contract, setContract] = useState<DefaultContractType>();
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(true);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const textRequired = '* จำเป็น';
  const queryClient = useQueryClient();
  async function fetchContractByEmail() {
    if (!user || !user.email) {
      console.error('User or user email is not available');
      return;
    }

    try {
      const token = await user.getIdToken(true);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/documents/queryContractByEmail?email=${encodeURIComponent(
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

      return data;
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      throw err;
    }
  }
  const updateDefaultContract = async (data: any) => {
    if (!user || !user.email) {
      throw new Error('User or user email is not available');
    }
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/documents/updateDefaultContract?email=${encodeURIComponent(
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
        const rawResponse = await response.text();
        console.log('Raw response:', rawResponse);
        // Parse and throw error if it's JSON, or throw a generic error
        try {
          const errorData = JSON.parse(rawResponse);
          throw new Error(errorData.message || 'Network response was not ok.');
        } catch (parseError) {
          throw new Error('Server responded with non-JSON data');
        }
      }

      if (response.status === 200) {
        // Assuming you want to return the response for successful operations
        return response.json();
      } else {
        const errorData = await response.json();
        console.error('Response:', await response.text());
        throw new Error(errorData.message || 'Network response was not ok.');
      }
    } catch (err) {
      throw new Error(err as any);
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


  const watchedValues: any = watch();
  const dirtyValues = Object.keys(dirtyFields).reduce((acc, key) => {
    if (key in watchedValues) {
      acc[key] = Number(watchedValues[key as keyof DefaultContractType]);
    }
    return acc;
  }, {} as DefaultContractType);

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          loading={postLoading}
          disabled={!isValid || postLoading || !isDirty}
          mode="contained"
          buttonColor={'#1b52a7'}
          onPress={handleDonePress}>
          {'บันทึก'}
        </Button>
      ),
    });
  }, [navigation, isDirty, isValid, dirtyValues]);
  const {data, isLoading, isError} = useQuery({
    queryKey: ['DefaultContract'],
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
        reset(defaultValues);
      }
    },
  });

  const {mutate: createQuotationMutation, isLoading: postLoading} = useMutation(
    updateDefaultContract,
    {
      onSuccess: data => {
        queryClient.invalidateQueries(['defaultContract']);
        setSnackbarMessage('บันทึกข้อมูลสำเร็จ');
        setIsLoadingMutation(false);
        Alert.alert(
          'บันทึกข้อมูลสำเร็จ',
          ``,
          [
            {
              text: 'ปิดหน้าต่าง',
              onPress: () => navigation.goBack(), // Navigate back when OK is pressed
            },
          ],
          {cancelable: false},
        );
      },
      onError: (error: MyError) => {
        Alert.alert(
          'เกิดข้อผิดพลาด',
          `Server-side user creation failed: ${error}`,
          [{text: 'OK'}],
          {cancelable: false},
        );
        setIsLoadingMutation(false);
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

  const handleDonePress = async () => {
    setIsLoadingMutation(true);
    const apiData = {
      contract: dirtyValues,
    };
    createQuotationMutation(apiData);
  };

  function safeToString(value : any) {
    return value !== undefined && value !== null ? value.toString() : '';
  }

  const renderWanranty = (
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
          render={({field: {onChange, onBlur, value}, fieldState: {error}}) => (
            <>
              <TextInput
                keyboardType="number-pad"
                style={{width: Dimensions.get('window').width *0.3}}
                textAlign="center"
                error={!!error}
                mode="outlined"
                textAlignVertical="center"
                defaultValue={defaultValue}
                onBlur={onBlur}
                right={<TextInput.Affix text="เดือน" />}
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
    </>
  );
  const renderPrepare = (
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
          render={({field: {onChange, onBlur, value}, fieldState: {error}}) => (
            <>
              <TextInput
                keyboardType="number-pad"
                textAlign="center"
                style={{width: Dimensions.get('window').width *0.3,maxHeight: 55}}
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
    </>
  );

  const renderAdjustMents = (
    name: any,
    label: string,
    defaultValue: string = '',
  ) => (
    <>
      <View
        style={{
          flexDirection: 'column',
          justifyContent: 'flex-start',
          marginTop: 10,
        }}>
        <Text style={styles.labelAuditAndAdjustment}>{label}</Text>

        <Controller
          control={control}
          rules={{required: 'This field is required'}}
          render={({field: {onChange, onBlur, value}, fieldState: {error}}) => (
            <>
              <TextInput
                keyboardType="number-pad"
                textAlign="center"
                style={{width: Dimensions.get('window').width *0.3, }}
                error={!!error}
                mode="outlined"
                textAlignVertical="center"
                defaultValue={defaultValue}
                onBlur={onBlur}
                right={<TextInput.Affix text="%" />}
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
    </>
  );
  const renderAudits = (
    name: any,
    label: string,
    defaultValue: string = '',
  ) => (
    <>
      <View
        style={{
          flexDirection: 'column',
          justifyContent: 'flex-start',
          marginTop: 10,
          marginBottom: 30,

        }}>
        <Text style={styles.labelAuditAndAdjustment}>{label}</Text>

        <Controller
          control={control}
          rules={{required: 'This field is required'}}
          render={({field: {onChange, onBlur, value}, fieldState: {error}}) => (
            <>
              <TextInput
                keyboardType="number-pad"
                textAlign="center"
                style={{width: Dimensions.get('window').width *0.3, }}

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
    </>
  );

  return (
    <>
      <KeyboardAwareScrollView>
        {contract ? (
          <SafeAreaView style={{flex: 1}}>
         
              <View style={styles.containerForm}>
                <TextPaper variant="headlineSmall">การรับประกัน</TextPaper>
                <Divider style={{marginTop: 10}} />

                <View style={styles.formInput}>
                  {renderWanranty(
                    'productWarantyYear',
                    'รับประกันวัสดุอุปกรณ์กี่เดือน',
                    safeToString(contract.productWarantyYear),
                  )}
                  {renderWanranty(
                    'skillWarantyYear',
                    'รับประกันงานติดตั้งกี่เดือน',
                    safeToString(contract.skillWarantyYear),
                  )}
                </View>
              </View>

              <View style={styles.containerForm}>
                <TextPaper variant="headlineSmall">การเตรียมงาน</TextPaper>

                <Divider style={{marginTop: 10}} />
                <View style={styles.formInput}>
                  {renderPrepare(
                    'installingDay',
                    'ใช้เวลาติดตั้งที่หน้างานกี่วัน',
                    safeToString(contract.installingDay),
                  )}
                  {renderPrepare(
                    'workAfterGetDeposit',
                    'เริ่มทำงานภายในกี่วันหลังได้รับมัดจำ',
                    safeToString(contract.workAfterGetDeposit),
                  )}
                  {/* {renderWanranty(
                    'prepareDay',
                    'ใช้เวลาเตรียมงานกี่วัน',
                    safeToString(contract.prepareDay),
                  )} */}
                  {renderPrepare(
                    'finishedDay',
                    'ใช้เวลาทำงานทั้งหมดกี่วัน',
                    safeToString(contract.finishedDay),
                  )}
                </View>
              </View>
              <View style={styles.containerForm}>
                <TextPaper variant="headlineSmall">การตรวจงาน</TextPaper>

                <Divider style={{marginTop: 10}} />
                <View style={styles.formInput}>
                  {renderAudits(
                    'workCheckDay',
                    'หลังแจ้งส่งมอบงานผู้ว่าจ้างต้องตรวจงานภายในกี่วัน',
                    safeToString(contract.workCheckDay),
                  )}
                  {renderAudits(
                    'workCheckEnd',
                    'นับจากวันที่ผู้ว่าจ้างได้ตรวจรับความถูกต้องแล้วผู้ว่าจ้างจะต้องชำระเงินภายในกี่วัน',
                    safeToString(contract.workCheckEnd),
                  )}
                </View>
              </View>
              <View style={styles.containerLastForm}>
                <TextPaper variant="headlineSmall">การคิดค่าปรับ</TextPaper>

                <Divider style={{marginTop: 10}} />
                <View style={styles.formInput}>
                  {renderAdjustMents(
                    'adjustPerDay',
                    'หากส่งงานล่าช้าให้ผู้ว่าจ้างคิดค่าปรับเป็นรายวันกี่เปอร์เซ็นต์ของมูลค่างานตามสัญญาต่อวัน',
                    safeToString(contract.adjustPerDay),
                  )}
                  {/* {adjustPerDay >0  &&                   <Text style={{marginTop:5}}>เป็นเงิน: 
                  
                  ${Number(
                quotation.allTotal -
                  Number(quotation.allTotal * (1 - adjustPerDay / 100))
              )
                .toFixed(2)
                .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                   บาท/วัน</Text>
} */}
                </View>
                <View style={{marginBottom:50}}></View>
              </View>
            
          </SafeAreaView>
        ) : (
          <SafeAreaView style={{flex: 1}}>
         
              <View style={styles.containerForm}>
                <TextPaper variant="headlineSmall">การรับประกัน</TextPaper>
                <Divider style={{marginTop: 10}} />

                <View style={styles.formInput}>
                  {renderWanranty(
                    'productWarantyYear',
                    'รับประกันวัสดุอุปกรณ์กี่เดือน',
                  )}
                  {renderWanranty(
                    'skillWarantyYear',
                    'รับประกันงานติดตั้งกี่เดือน',
                  )}
                </View>
              </View>

              <View style={styles.containerForm}>
                <TextPaper variant="headlineSmall">การเตรียมงาน</TextPaper>

                <Divider style={{marginTop: 10}} />
                <View style={styles.formInput}>
                  {renderPrepare(
                    'installingDay',
                    'ใช้เวลาติดตั้งที่หน้างานกี่วัน',
                  )}
                  {renderPrepare(
                    'workAfterGetDeposit',
                    'เริ่มทำงานภายในกี่วันหลังได้รับมัดจำ',
                  )}
                  {/* {renderWanranty(
                    'prepareDay',
                    'ใช้เวลาเตรียมงานกี่วัน',
                    safeToString(contract.prepareDay),
                  )} */}
                  {renderPrepare(
                    'finishedDay',
                    'ใช้เวลาทำงานทั้งหมดกี่วัน',
                  )}
                </View>
              </View>
              <View style={styles.containerForm}>
                <TextPaper variant="headlineSmall">การตรวจงาน</TextPaper>

                <Divider style={{marginTop: 10}} />
                <View style={styles.formInput}>
                  {renderAudits(
                    'workCheckDay',
                    'หลังแจ้งส่งมอบงานผู้ว่าจ้างต้องตรวจงานภายในกี่วัน',
                  )}
                  {renderAudits(
                    'workCheckEnd',
                    'นับจากวันที่ผู้ว่าจ้างได้ตรวจรับความถูกต้องแล้วผู้ว่าจ้างจะต้องชำระเงินภายในกี่วัน',
                  )}
                </View>
              </View>
              <View style={styles.containerLastForm}>
                <TextPaper variant="headlineSmall">การคิดค่าปรับ</TextPaper>

                <Divider style={{marginTop: 10}} />
                <View style={styles.formInput}>
                  {renderAdjustMents(
                    'adjustPerDay',
                    'หากส่งงานล่าช้าให้ผู้ว่าจ้างคิดค่าปรับเป็นรายวันกี่เปอร์เซ็นต์ของมูลค่างานตามสัญญาต่อวัน',
                  )}
                  {/* {adjustPerDay >0  &&                   <Text style={{marginTop:5}}>เป็นเงิน: 
                  
                  ${Number(
                quotation.allTotal -
                  Number(quotation.allTotal * (1 - adjustPerDay / 100))
              )
                .toFixed(2)
                .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                   บาท/วัน</Text>
} */}
                </View>
                <View style={{marginBottom:50}}></View>
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
    paddingTop: 30,
  },
  containerLastForm: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
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
    // marginTop: 30,
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
    marginTop: 10,
    borderWidth: 0.5,
    borderRadius: 5,

    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF', // Keep even rows white

    width: 80,
    height: Platform.OS === 'android' ? 50 : 50, // Adjust height based on platform
    paddingVertical: Platform.OS === 'android' ? 0 : 15, // Remove padding for Android
  },
  label: {
    // fontFamily: 'sukhumvit set',
    fontSize: 16,
    marginTop: 20,
    maxWidth: Dimensions.get('window').width * 0.6,
  },
  labelAuditAndAdjustment: {
    // fontFamily: 'sukhumvit set',
    fontSize: 16,
    // marginTop: 20,
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

export default ExistingContract;
