import React, {useState, useContext, useEffect, useRef} from 'react';
import {
  View,
  TextInput,
  Text,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  FlatList,
  Image,
} from 'react-native';
import Divider from '../../components/styles/Divider';
import {Header as HeaderRNE, HeaderProps} from '@rneui/themed';
import {
  faCloudUpload,
  faEdit,
  faPlus,
  faPlusCircle,
  faImages,
} from '@fortawesome/free-solid-svg-icons';
import {useForm, Controller, set} from 'react-hook-form';
import {Store} from '../../redux/store';
import * as stateAction from '../../redux/actions';
import SelectAudit from '../../components/audits/selectAudit';
import ExistingMaterials from '../../components/materials/existing';
import GalleryScreen from '../../components/gallery/existing';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {v4 as uuidv4} from 'uuid';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  FormData,
  ServiceList,
  EditProductList,
  Service,
  SelectedMaterialData,
  AuditData,
  Audit,
  SelectedAuditData,
} from '../../types/docType';
import {ParamListBase} from '../../types/navigationType';
import SmallDivider from '../../components/styles/SmallDivider';
import {useImageUpload} from '../../hooks/utils/image/useImageUpload';
import SaveButton from '../../components/ui/Button/SaveButton';

type Props = {
  navigation: StackNavigationProp<ParamListBase, 'EditProductForm'>;
  route: RouteProp<ParamListBase, 'EditProductForm'>;
};
const {width, height} = Dimensions.get('window');
const imageContainerWidth = width / 3 - 10;
const EditProductForm = ({navigation, route}: Props) => {
  const {control, handleSubmit, formState,watch} = useForm<FormData>();
  const {isDirty} = formState;
  const {item} = route.params;
  const [qty, setQuantity] = useState(item.qty);
  const [count, setCount] = useState(0);
  const [unitPrice, setPrice] = useState(item.unitPrice);
  const [total, setTotalCost] = useState(item.total);
  const [serviceImages, setServiceImages] = useState<string[]>(
    item.serviceImages,
  );
  const [serviceListState, setServiceList] = useState<ServiceList[]>([]);
  const {isImageUpload, imageUrl, handleLogoUpload} = useImageUpload();
  const [materials, setMaterials] = useState<SelectedMaterialData[]>(
    item.materials,
  );
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalMaterialsVisible, setIsModalMaterialsVisible] = useState(false);
  const [isModalImagesVisible, setModalImagesVisible] = useState(false);
  const serviceID = uuidv4();
  const [selectedMaterialArray, setSelectedMaterialArray] = useState<any[]>([]);
  const [selectedAudits, setSelectedAudits] = useState<Audit[]>([]);



  const [audits, setAudits] = useState<Audit[]>(item.audits);
  const {
    state: {serviceList, selectedAudit, code, companyID},
    dispatch,
  }: any = useContext(Store);

  const handleFormSubmit = (data: FormData) => {
    //     if (!isDirty) {
    // navigation.goBack();
    //       return;
    //     }

    const newServiceItem = {
      id: item.id,
      title: data.title ? data.title : item.title,
      description: data.description ? data.description : item.description,
      materials: selectedMaterialArray,
      serviceImages,
      audits: item.audits,
      unitPrice: data.unitPrice
        ? Number(data.unitPrice.replace(/,/g, ''))
        : Number(item.unitPrice),
      qty,
      total: Number(qty * unitPrice),
    };

    const index = serviceList.findIndex(
      (serviceItem: any) => serviceItem.id === item.id,
    );

    if (index !== -1) {
      const updatedServiceList = [...serviceList];
      updatedServiceList[index] = {
        ...updatedServiceList[index],
        ...newServiceItem,
      };
      dispatch(stateAction.update_service_list(updatedServiceList));
      navigation.goBack();
    }
  };

  const handleDelete = () => {
    // Find the index of the item in the serviceList array
    const index = serviceList.findIndex(
      (serviceItem: any) => serviceItem.id === item.id,
    );

    if (index !== -1) {
      // Remove the item from the serviceList array
      const updatedServiceList = [...serviceList];
      updatedServiceList.splice(index, 1);

      // Dispatch the action to update the serviceList state
      dispatch(stateAction.update_service_list(updatedServiceList));

      // Navigate back to the previous screen
      navigation.goBack();
    }
  };
  function isValidNumber(value) {
    return (
      !isNaN(value) && value !== '' && value !== null && value !== undefined
    );
  }
  const onGoback = () => {
    dispatch(stateAction.reset_audit());
    dispatch(stateAction.reset_service_images());
    navigation.goBack();
  };
  const handleSelectAudit = (data: FormData) => {
    navigation.navigate('SelectAudit', {
      title: data.title,
      description: data.description,
      serviceID: data.id,
    });
  };

  useEffect(() => {
    setTotalCost(qty * unitPrice);
  setSelectedAudits(item.audits);
    if (imageUrl) {
      item.serviceImage = imageUrl;
    }
  }, [qty, unitPrice,selectedAudit]);
  console.log('selectedAudits', selectedAudits);
  return (
    <>
      <View style={{flex: 1}}>
        <ScrollView style={styles.container}>
          <View style={styles.subContainer}>
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              {isImageUpload ? (
                <ActivityIndicator size="small" color="#0073BA" />
              ) : (
                <FlatList
                  data={serviceImages}
                  horizontal={true}
                  renderItem={({item, index}) => {
                    return (
                      <View style={styles.imageContainer}>
                        <Image source={{uri: item}} style={styles.image} />
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
            <Text style={styles.priceTitle}>ชื่อรายการ</Text>
            <Controller
              control={control}
              name="title"
              defaultValue={item.title}
              render={({field: {onChange, value}}) => (
                <TextInput
                  placeholder="ชื่อสินค้า-บริการ.."
                  style={styles.inputName}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            <Text style={styles.priceTitle}>รายละเอียด</Text>

            <Controller
              control={control}
              name="description"
              defaultValue={item.description}
              render={({field: {onChange, value}}) => (
                <TextInput
                  placeholder="รายละเอียด..."
                  keyboardType="name-phone-pad"
                  multiline
                  textAlignVertical="top"
                  numberOfLines={4}
                  style={styles.inputAddress}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />

            <View style={styles.summary}>
              <Text style={styles.priceHead}>ราคา:</Text>
              <Controller
                control={control}
                name="unitPrice"
                defaultValue={unitPrice.toString()}
                render={({field: {onChange, value}}) => (
                  <TextInput
                    style={[styles.input, {textAlign: 'right'}]}
                    placeholder="0"
                    keyboardType="number-pad"
                    onChangeText={value => {
                      onChange(value);
                      setPrice(parseFloat(value));
                    }}
                    value={value}
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
                    if (count > 0) {
                      setCount(count - 1);
                      setQuantity(qty - 1);
                    }
                  }}>
                  <Text style={styles.buttonText}>-</Text>
                </TouchableOpacity>
                <Controller
                  control={control}
                  name="qty"
                  render={({field: {onChange, value}}) => (
                    <TextInput
                      style={styles.counter}
                      placeholder="10"
                      keyboardType="number-pad"
                      onChangeText={value => {
                        onChange(value);
                        setQuantity(parseInt(value, 10));
                      }}
                      value={qty.toString()}
                    />
                  )}
                />
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    setCount(count + 1);
                    setQuantity(qty + 1);
                  }}>
                  <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>
              </View>

              {/* END COUNTER BUTTON */}
            </View>
            <View style={styles.summary}>
              <Text style={styles.price}>หน่วย:</Text>
              <Controller
                control={control}
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
            {/* ปิดส่วนลดแยกรายการ */}
            {/* <View style={styles.summary}>
          <Text style={styles.price}>ส่วนลด(%):</Text>
          <Controller
  control={control}
  name="discountPercent"
  defaultValue=""
  render={({field: {onChange, value}}) => (
    <TextInput
      style={styles.price}
      placeholder="0"
      keyboardType="number-pad"
      onChangeText={value => {
        onChange(value);
        setDiscountPercent(parseFloat(value));
      }}
      value={value}
    />
  )}
/>

        </View> */}
            <SmallDivider />
            <View style={styles.summary}>
              <Text style={styles.priceSum}>รวมเป็นเงิน:</Text>

              <Controller
                control={control}
                name="total"
                defaultValue=""
                render={({field: {value}}) => (
                  <TextInput
                    style={styles.priceSummary}
                    placeholder="0"
                    keyboardType="number-pad"
                    value={
                      qty > 0
                        ? Number(qty * unitPrice)
                            .toFixed(2)
                            .replace(/\d(?=(\d{3})+\.)/g, '$&,')
                        : '0'
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
              {selectedAudits?.length > 0 ? (
                <View style={styles.cardContainer}>
                  <Text
                    style={{
                      marginBottom: 20,
                      marginTop: 20,
                      fontFamily: 'Sukhumvit Set Bold',

                      fontSize: 16,

                      color: '#333',
                    }}>
                    มาตรฐานของบริการนี้:
                  </Text>
                  {selectedAudits?.map((item: any) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.card}
                      onPress={() => setModalVisible(true)}>
                      <Text style={styles.cardTitle}>
                        {item.auditShowTitle}
                      </Text>
                      <Icon name="chevron-right" size={24} color="gray" />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View>
                  {selectedAudits.length === 0 && (
                    <TouchableOpacity
                      style={styles.selectButton}
                      onPress={() => setModalVisible(true)}

                      // onPress={handleSubmit(handleSelectAudit)}
                    >
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
              )}
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
              {selectedMaterialArray?.length > 0 ? (
                <View style={styles.cardContainer}>
                  <Text
                    style={{
                      marginBottom: 20,
                      marginTop: 20,
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: '#333',
                    }}>
                    วัสดุอุปกรณ์ที่นำเสนอ:
                  </Text>
                  {selectedMaterialArray?.map((item: any) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.card}
                      onPress={() => setIsModalMaterialsVisible(true)}             
                    >
                      <Text style={styles.cardTitle}>{item.name}</Text>
                      <Icon name="chevron-right" size={24} color="gray" />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View>
                  {selectedMaterialArray.length === 0 && (
                    <TouchableOpacity
                      style={styles.selectButton}
                      onPress={() => setIsModalMaterialsVisible(true)}
                      // onPress={() =>
                      //   navigation.navigate('ExistingMaterials', {id: serviceID})
                      // }
                    >
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
                  )}
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
                    paddingVertical: 0,
                  },
                }),
              }}></View>
            <SmallDivider />

            {/* <TouchableOpacity
          style={[
            styles.btn,
            selectedAudit.length === 0 ? styles.btnDisabled : null,
          ]}
          onPress={handleSubmit(handleFormSubmit)}
          disabled={selectedAudit.length === 0}>
          <Text style={styles.label}>บันทึก</Text>
        </TouchableOpacity> */}
          </View>
          <SelectAudit
            isVisible={isModalVisible}
            serviceId=''
            onClose={() => setModalVisible(false)}
            selectedAudits={selectedAudits}
            setSelectedAudits={setSelectedAudits}
            title={watch('title')}
            description={watch('description')}
            onPress={() => {
              /* Handle onPress here if needed */
            }}
          />
          <ExistingMaterials
            isVisible={isModalMaterialsVisible}
            onClose={() => setIsModalMaterialsVisible(false)}
            selectedMaterialArray={selectedMaterialArray}
            setSelectedMaterialArray={setSelectedMaterialArray}
            onPress={() => {
              /* Handle onPress here if needed */
            }}
          />
          <GalleryScreen
            isVisible={isModalImagesVisible}
            onClose={() => setModalImagesVisible(false)}
            serviceImages={serviceImages}
            setServiceImages={setServiceImages}
          />
        </ScrollView>
        <SaveButton
          disabled={selectedAudit.length === 0}
          onPress={handleSubmit(handleFormSubmit)}
        />
      </View>
    </>
  );
};
export default EditProductForm;

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
        paddingVertical: 0,
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
    fontWeight: 'bold',
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

