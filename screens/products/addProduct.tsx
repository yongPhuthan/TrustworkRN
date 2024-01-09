import React, {
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import {
  View,
  TextInput,
  Text,
  Platform,
  ScrollView,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {Header as HeaderRNE, HeaderProps} from '@rneui/themed';
import Divider from '../../components/styles/Divider';
import {
  useForm,
  FormProvider,
  useFormContext,
  Controller,
  useWatch,
  set,
} from 'react-hook-form';

import {Store} from '../../redux/store';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faCloudUpload,
  faEdit,
  faPlus,
  faImages,
  faPlusCircle,
} from '@fortawesome/free-solid-svg-icons';
import * as stateAction from '../../redux/actions';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {v4 as uuidv4} from 'uuid';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SmallDivider from '../../components/styles/SmallDivider';
import {FormData, ServiceList, CompanyUser, Audit} from '../../types/docType';
import {ParamListBase} from '../../types/navigationType';
import {useImageUpload} from '../../hooks/utils/image/useImageUpload';
import SelectAudit from '../../components/audits/selectAudit';
import ExistingMaterials from '../../components/materials/existing';
import GalleryScreen from '../../components/gallery/existing';
import SaveButton from '../../components/ui/Button/SaveButton';
import {yupResolver} from '@hookform/resolvers/yup';
import {serviceValidationSchema} from '../utils/validationSchema';
import CurrencyInput from 'react-native-currency-input';
import Decimal from 'decimal.js';

type Props = {
  navigation: StackNavigationProp<ParamListBase, 'AddProduct'>;
  route: RouteProp<ParamListBase, 'AddProduct'>;
};

const {width, height} = Dimensions.get('window');
const imageContainerWidth = width / 3 - 10;
const AddProductForm = ({navigation, route}: Props) => {
  // const {control, handleSubmit, watch} = useForm<FormData>();
  const {quotationId,onAddService} = route.params;
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalMaterialsVisible, setIsModalMaterialsVisible] = useState(false);
  const [serviceImages, setServiceImages] = useState<string[]>([]);
  const [isModalImagesVisible, setModalImagesVisible] = useState(false);
  const {isImageUpload, imageUrl, handleLogoUpload} = useImageUpload();
  const [serviceID, setServiceID] = useState<string>('');
  const {
    state: {serviceList, selectedAudit, code},
    dispatch,
  }: any = useContext(Store);

  const handleDone = data => {
    onAddService(methods.watch());
    navigation.goBack();
  };
  const defaultService = {
    id: uuidv4(),
    title: null,
    description: null,
    unitPrice: 0,
    qty: 1,
    discountPercent: 0,
    total: 0,
    unit: 'ชุด',
    serviceImage: '',
    serviceImages: [],
    quotationId,
    audits: [],
    materials: [],
  };
  const methods = useForm<any>({
    mode: 'all',
    defaultValues: defaultService,
    resolver: yupResolver(serviceValidationSchema),
  });
  const audits = useWatch({
    control: methods.control,
    name: 'audits',
    defaultValue: [],
  });
  const title = useWatch({
    control: methods.control,
    name: 'title',
    defaultValue: '',
  });

  const materials = useWatch({
    control: methods.control,
    name: 'materials',
    defaultValue: [],
  });
  const [unitPrice, quantity] = useWatch({
    control: methods.control,
    name: ['unitPrice', 'qty'], // Watching multiple fields
  });

  useEffect(() => {
    const unitPrice = new Decimal(methods.watch('unitPrice') || 0);
    const quantity = new Decimal(methods.watch('qty') || 0);
  
    if (unitPrice.isFinite() && quantity.isFinite()) {
      const total = unitPrice.times(quantity);
      methods.setValue('total', total.toString());
    }
  }, [methods.watch('unitPrice'), methods.watch('qty'), methods.setValue]);

  const isButtonDisbled = useMemo(() => {
    return (
      (materials.length > 0 && audits?.length > 0 && title !== null) ||
      ('' && unitPrice !== null) ||
      ''
    );
  }, [audits, materials, title, unitPrice]);

  return (
    <>
      <FormProvider {...methods}>
      <KeyboardAwareScrollView
      style={{ flex: 1 }}
      resetScrollToCoords={{ x: 0, y: 0 }}
      scrollEnabled={true}
      extraHeight={200} // Adjust this value as needed
      enableOnAndroid={true}
    >
        <View style={{flex: 1}}>
          <ScrollView style={styles.container}>
            <View style={styles.subContainer}>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                {isImageUpload ? (
                  <ActivityIndicator size="small" color="#0073BA" />
                ) : (
                  <FlatList
                    data={methods.watch('serviceImages')}
                    horizontal={true}
                    renderItem={({item, index}) => {
                      return (
                        <View style={styles.imageContainer}>
                          <TouchableOpacity
                            onPress={() => setModalImagesVisible(true)}>
                            <Image source={{uri: item}} style={styles.image} />
                          </TouchableOpacity>
                        </View>
                      );
                    }}
                    keyExtractor={(item, index) => index.toString()}
                    ListFooterComponent={
                      serviceImages.length > 0 ? (
                        <TouchableOpacity
                          style={styles.addButtonContainer}
                          onPress={() => {
                            setModalImagesVisible(true);
                            // navigation.navigate('GalleryScreen', {code});
                          }}>
                          <FontAwesomeIcon
                            icon={faPlus}
                            size={32}
                            color="#0073BA"
                          />
                        </TouchableOpacity>
                      ) : null
                    }
                    ListEmptyComponent={
                      <View>
                        <TouchableOpacity
                          style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 20,
                            borderColor: '#0073BA',
                            borderWidth: imageUrl == null ? 1 : 0,
                            borderRadius: 5,
                            borderStyle: 'dashed',
                            // marginHorizontal: 100,
                            padding: 10,
                            height: imageUrl == null ? 100 : 150,
                            width: imageUrl == null ? 200 : 'auto',
                          }}
                          onPress={() => {
                            setModalImagesVisible(true);

                            // navigation.navigate('GalleryScreen', {code});
                          }}>
                          <FontAwesomeIcon
                            icon={faImages}
                            style={{marginVertical: 5, marginHorizontal: 50}}
                            size={32}
                            color="#0073BA"
                          />
                          <Text
                            style={{
                              textAlign: 'center',
                              color: '#0073BA',
                              fontFamily: 'Sukhumvit set',
                            }}>
                            เลือกภาพตัวอย่างผลงาน
                          </Text>
                        </TouchableOpacity>
                      </View>
                    }
                  />
                )}
              </View>
              <View style={styles.rowContainer}>
                <Text style={styles.priceTitle}>ชื่อรายการ</Text>
                {methods.formState.errors?.title?.message && (
                  <Text style={styles.errorText}>
                    {typeof methods.formState.errors.title.message === 'string'
                      ? methods.formState.errors.title.message
                      : ''}
                  </Text>
                )}
              </View>

              <Controller
                control={methods.control}
                name="title"
                rules={{required: true}}
                render={({field: {onChange, onBlur, value}}) => (
                  <TextInput
                    style={styles.inputName}
                    multiline
                    onBlur={onBlur}
                    onChangeText={onChange}
                    numberOfLines={2}
                    textAlignVertical="top"
                    value={value}
                  />
                )}
              />

              <Text style={styles.priceTitle}>รายละเอียด</Text>

              <Controller
                control={methods.control}
                name="description"
                defaultValue=""
                render={({field: {onChange, value}}) => (
                  <TextInput
                    placeholder="รายละเอียด..."
                    keyboardType="name-phone-pad"
                    multiline
                    textAlignVertical="top"
                    numberOfLines={2}
                    style={styles.inputAddress}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {methods.formState.errors?.unitPrice?.message && (
                <Text style={{color: 'red', alignSelf: 'flex-end'}}>
                  {typeof methods.formState.errors.unitPrice.message ===
                  'string'
                    ? methods.formState.errors.unitPrice.message
                    : ''}
                </Text>
              )}
              <View style={styles.summary}>
                <Text style={styles.priceHead}>ราคา:</Text>
                <Controller
                  control={methods.control}
                  name="unitPrice"
                  rules={{required: true}}
                  defaultValue=""
                  render={({field: {onChange, onBlur, value}}) => (
                    <CurrencyInput
                      style={[styles.input, {textAlign: 'right'}]}
                      placeholder="0"
                      onBlur={onBlur}
                      keyboardType="number-pad"
                      onChangeValue={value => {
                        onChange(value);
                      }}
                      value={value}
                      delimiter=","
                      suffix=" บาท"
                      separator="."
                      precision={0}
                      minValue={0}
                    />
                  )}
                />
              </View>
              <View style={styles.summary}>
                <Text style={styles.price}>จำนวน:</Text>

                {/* START COUNTER BUTTON */}
                <View style={styles.containerCounter}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      const newQty = Math.max(0, methods.watch('qty') - 1);
                      methods.setValue('qty', newQty);
                    }}>
                    <Text style={styles.buttonText}>-</Text>
                  </TouchableOpacity>
                  <Controller
                    control={methods.control}
                    name="qty"
                    render={({field: {value}}) => (
                      <TextInput
                        style={styles.counter}
                        placeholder="10"
                        keyboardType="number-pad"
                        onChangeText={text => {
                          const newQty = parseInt(text, 10);
                          if (!isNaN(newQty)) {
                            methods.setValue('qty', newQty);
                          }
                        }}
                        value={methods.watch('qty').toString()}
                      />
                    )}
                  />
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      const newQty = methods.watch('qty') + 1;
                      methods.setValue('qty', newQty);
                    }}>
                    <Text style={styles.buttonText}>+</Text>
                  </TouchableOpacity>
                </View>

                {/* END COUNTER BUTTON */}
              </View>
              <View style={styles.summary}>
                <Text style={styles.price}>หน่วย:</Text>
                <Controller
                  control={methods.control}
                  name="unit"
                  defaultValue="ชุด"
                  render={({field: {onChange, value}}) => (
                    <TextInput
                      style={styles.price}
                      keyboardType="default"
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
              <SmallDivider />
              <View style={styles.summary}>
                <Text style={styles.priceSum}>รวมเป็นเงิน:</Text>

                <Controller
                  control={methods.control}
                  name="total"
                  defaultValue={0}
                  render={({field: {value}}) => (
                    <TextInput
                      style={styles.priceSummary}
                      placeholder="0"
                      value={
                        value ? new Intl.NumberFormat().format(value) : '0'
                      }
                      editable={false}
                    />
                  )}
                />
              </View>
              <View
                style={{
                  ...Platform.select({
                    ios: {
                      paddingVertical: 10,
                    },
                    android: {
                      paddingVertical: 0,
                    },
                  }),
                }}></View>
              <SmallDivider />

              <View>
                {audits.length > 0 ? (
                  <View style={styles.cardContainer}>
                    <Text
                      style={{
                        marginBottom: 5,
                        marginTop: 20,
                        fontFamily: 'Sukhumvit Set Bold',

                        fontSize: 16,

                        color: '#333',
                      }}>
                      มาตรฐานของบริการนี้:
                    </Text>
                    {audits?.map((item: any) => (
                      <TouchableOpacity
                        key={item.AuditData.id}
                        style={styles.card}
                        onPress={() => setModalVisible(true)}>
                        <Text style={styles.cardTitle}>
                          {item.AuditData.auditShowTitle}
                        </Text>
                        <Icon name="chevron-right" size={24} color="gray" />
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => setModalVisible(true)}>
                    <View style={styles.containerButton}>
                      <FontAwesomeIcon
                        icon={faPlusCircle}
                        color="#0073BA"
                        size={14}
                      />
                      <Text style={styles.selectButtonText}>
                        เลือกมาตรฐานการทำงาน
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
              <View
                style={{
                  ...Platform.select({
                    ios: {
                      paddingVertical: 10,
                    },
                    android: {
                      paddingVertical: 10,
                    },
                  }),
                }}></View>
              <SmallDivider />
              <View>
                {materials?.length > 0 ? (
                  <View style={styles.cardContainer}>
                    <Text
                      style={{
                        marginBottom: 5,
                        marginTop: 20,
                        fontSize: 16,
                        fontFamily: 'Sukhumvit Set Bold',
                        fontWeight: 'bold',
                        color: '#333',
                      }}>
                      วัสดุอุปกรณ์ที่ใช้
                    </Text>
                    {materials?.map((item: any, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.card}
                        onPress={() => setIsModalMaterialsVisible(true)}>
                        <Text style={styles.cardTitle}>
                          {item.materialData.name}
                        </Text>
                        <Icon name="chevron-right" size={24} color="gray" />
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View>
                    <TouchableOpacity
                      style={styles.selectButton}
                      onPress={() => setIsModalMaterialsVisible(true)}>
                      <View style={styles.containerButton}>
                        <FontAwesomeIcon
                          icon={faPlusCircle}
                          color="#0073BA"
                          size={14}
                        />

                        <Text style={styles.selectButtonText}>
                          เลือกวัสดุอุปกรณ์
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <View
                style={{
                  ...Platform.select({
                    ios: {
                      paddingVertical: 10,
                    },
                    android: {
                      paddingVertical: 10,
                    },
                  }),
                }}></View>
              <SmallDivider />
              <View
                style={{
                  width: '100%',
                  alignSelf: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                                  <SaveButton disabled={false} onPress={handleDone} />

                {/* <SaveButton disabled={!isButtonDisbled} onPress={handleDone} /> */}
              </View>
            </View>
            <SelectAudit
              isVisible={isModalVisible}
              serviceId={methods.watch('id')}
              onClose={() => setModalVisible(false)}
              title={methods.watch('title')}
              description={methods.watch('description')}
            />
            <ExistingMaterials
              serviceId={serviceID}
              isVisible={isModalMaterialsVisible}
              onClose={() => setIsModalMaterialsVisible(false)}
            />
            <GalleryScreen
              isVisible={isModalImagesVisible}
              onClose={() => setModalImagesVisible(false)}
              serviceImages={serviceImages}
              setServiceImages={setServiceImages}
            />
          </ScrollView>
        </View>
        </KeyboardAwareScrollView>
      </FormProvider>
    </>
  );
};
export default AddProductForm;

const styles = StyleSheet.create({
  container: {},
  subContainer: {
    backgroundColor: '#ffffff',
    padding: 30,
    marginBottom: 10,
    height: 'auto',
  },

  form: {
    border: '1px solid #0073BA',
    borderRadius: 10,
  },
  date: {
    textAlign: 'right',
  },
  containerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 40,
    backgroundColor: '#0073BA',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 10,
    fontSize: 16,
    width: 150,
    textAlign: 'right', // Add textAlign property
  },

  inputName: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 10,
    fontSize: 16,
    height: 40,
  },
  inputAddress: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 10,
    fontSize: 16,
    height: 100,
  },
  label: {
    fontSize: 16,
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',

    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 10,
    fontSize: 16,
    height: 40,
  },
  prefix: {
    paddingHorizontal: 5,
    paddingVertical: 5,

    fontWeight: 'bold',
    color: 'black',
  },
  containerPrice: {
    alignSelf: 'center',
  },
  imageContainer: {
    width: imageContainerWidth,
    borderWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'column',
    margin: 5,
    position: 'relative',
  },
  addButtonContainer: {
    width: 100,
    margin: 5,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#0073BA',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderRadius: 4, // Optional, for rounded edges
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        paddingVertical: 10,
      },
      android: {
        paddingVertical: 10,
      },
    }),
  },
  priceSummary: {
    fontSize: 18,
    marginTop: -10,
    color: 'black',
    fontWeight: 'bold',
    fontFamily: 'Sukhumvit Set Bold',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    color: 'black',
    fontFamily: 'Sukhumvit Set Bold',
  },
  priceSum: {
    fontSize: 18,
    color: 'black',
    fontFamily: 'Sukhumvit Set Bold',
  },
  priceHead: {
    fontSize: 16,
    color: 'black',
    marginTop: 10,
    fontFamily: 'Sukhumvit Set Bold',
  },
  priceTitle: {
    fontSize: 16,
    color: 'black',
    marginTop: 5,
    fontFamily: 'Sukhumvit Set Bold',
  },
  counter: {
    fontSize: 16,
    paddingHorizontal: 20,
  },
  containerCounter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#e9f4f9',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  selectButton: {
    // backgroundColor: '#0073BA',
    backgroundColor: 'white',
    borderColor: '#0073BA',
    borderWidth: 1,
    borderStyle: 'dotted',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 5,
    marginTop: 20,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 0,
    resizeMode: 'cover',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#0073BA',
    fontFamily: 'Sukhumvit set',
    marginLeft: 10,
  },
  btnDisabled: {
    backgroundColor: '#ccc',
  },

  count: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    // ... other error text styles ...
  },
  button: {
    width: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },

  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    // fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#0073BA',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageWrapper: {
    position: 'relative',
  },
  editIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 4,
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'row',
  },
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    paddingVertical: 15,
  },
  heading: {
    fontSize: 16,
    fontFamily: 'Sukhumvit Set Bold',
    color: 'black',
  },
  headingRight: {
    fontSize: 16,
    fontFamily: 'Sukhumvit Set Bold',
    color: '#397af8',
  },
});
