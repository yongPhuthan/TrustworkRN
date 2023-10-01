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
  faImages,
} from '@fortawesome/free-solid-svg-icons';
import { useForm, Controller, set } from 'react-hook-form';
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

type Props = {
  navigation: StackNavigationProp<ParamListBase, 'EditProductForm'>;
  route: RouteProp<ParamListBase, 'EditProductForm'>;
};
const {width, height} = Dimensions.get('window');
const imageContainerWidth = width / 3 - 10;
const EditProductForm = ({navigation, route}: Props) => {
  const {control, handleSubmit, formState} = useForm<FormData>();
  const {isDirty} = formState;
  const {item} = route.params;
  const [qty, setQuantity] = useState(item.qty);
  const [count, setCount] = useState(0);
  const [unitPrice, setPrice] = useState(item.unitPrice);
  const [total, setTotalCost] = useState(item.total);
  const [serviceImages,setServicesImages] = useState<string[]>(item.serviceImages);
  const [serviceListState, setServiceList] = useState<ServiceList[]>([]);
  const {isImageUpload, imageUrl, handleLogoUpload} = useImageUpload();
  const [materials, setMaterials] = useState<SelectedMaterialData[]>(item.materials);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalMaterialsVisible, setIsModalMaterialsVisible] = useState(false);
  const [isModalImagesVisible, setModalImagesVisible] = useState(false);

  const [audits, setAudits] = useState<Audit[]>(item.audits);
  const {
    state: {serviceList, selectedAudit, code, selectedMaterials},
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
      materials,
      serviceImages,
      audits,
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
  }
  const handleSelectAudit = (data: FormData) => {
    navigation.navigate('SelectAudit', {
      title: data.title,
      description: data.description,
      serviceID: data.id,
    });
  };

  useEffect(() => {
    setTotalCost(qty * unitPrice);
    if (imageUrl) {
      item.serviceImage = imageUrl;
    }
  }, [qty, unitPrice]);


  return (
    <>
      <SafeAreaView>
        <HeaderRNE
          backgroundColor="#ffffff"
          containerStyle={{
            borderBottomColor: '#ccc',
            borderBottomWidth: 1,

          }}
          leftComponent={{
            onPress: ()=>onGoback(),
            icon: 'arrow-back',
            color: 'black',
          }}
          rightComponent={
            <TouchableOpacity
              onPress={handleSubmit(handleFormSubmit)}
              style={styles.headerRight}>
              <Text style={styles.headingRight}>บันทึก</Text>
            </TouchableOpacity>
          }
          centerComponent={{text: 'แก้ไขรายการ', style: styles.heading}}
        />
      </SafeAreaView>
      <ScrollView style={styles.container}>
        <View style={styles.subContainer}>
        <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            {isImageUpload ? (
              <ActivityIndicator size="small" color="gray" />
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
                        navigation.navigate('GalleryScreen', {code});
                      }}>
                      <FontAwesomeIcon icon={faPlus} size={32} color="gray" />
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
                        borderColor: 'gray',
                        borderWidth: imageUrl == null ? 1 : 0,
                        borderRadius: 10,
                        borderStyle: 'dotted',
                        // marginHorizontal: 100,
                        padding: 10,
                        height: imageUrl == null ? 100 : 150,
                        width: imageUrl == null ? 200 : 'auto',
                      }}
                      onPress={() => {
                        navigation.navigate('GalleryScreen', {code});
                      }}>
                      <FontAwesomeIcon
                        icon={faImages}
                        style={{marginVertical: 5, marginHorizontal: 50}}
                        size={32}
                        color="gray"
                      />
                      <Text style={{textAlign: 'center', color: 'gray'}}>
                        ภาพตัวอย่างผลงาน
                      </Text>
                    </TouchableOpacity>
                  </View>
                }
              />
            )}
          </View>
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
              defaultValue={Number(item.unitPrice)
                .toFixed(2)
                .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
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
                defaultValue={String(item.qty)}
                render={({field: {onChange, value}}) => (
                  <TextInput
                    style={styles.counter}
                    placeholder="0"
                    keyboardType="number-pad"
                    onChangeText={value => {
                      onChange(value);
                      setQuantity(parseInt(value, 1));
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
          <Divider />
          <View style={styles.summary}>
            <Text style={styles.price}>รวมเป็นเงิน:</Text>

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
                    isValidNumber(qty) && isValidNumber(unitPrice)
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
            {audits?.length > 0 ? (
              <View style={styles.cardContainer}>
                <Text
                  style={{
                    marginBottom: 20,
                    marginTop: 20,

                    fontSize: 16,
                    fontWeight: 'bold',
                    color: '#333',
                  }}>
                  มาตรฐานของบริการนี้:
                </Text>
                {audits?.map((item: any) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.card}
                    onPress={() => setModalVisible(true)}
                    >
                    <Text style={styles.cardTitle}>{item.auditShowTitle}</Text>
                    <Icon name="chevron-right" size={24} color="gray" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View>
                {audits.length === 0 && (
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => setModalVisible(true)}
                    >
                    <Text style={styles.selectButtonText}>
                      เลือกมาตรฐานการทำงาน
                    </Text>
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
            {materials?.length > 0 ? (
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
                {materials?.map((item: any,index:number) => (
                  <TouchableOpacity
                    key={index}
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
                {materials?.length === 0 && (
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => setIsModalMaterialsVisible(true)}
                    >
                    <Text style={styles.selectButtonText}>
                      เลือกวัสดุอุปกรณ์
                    </Text>
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
        </View>
        <SelectAudit
          isVisible={isModalVisible}
          onClose={() => setModalVisible(false)}
          selectedAudits={audits}
          setSelectedAudits={setAudits}
          title="Some Title"
          description="Some Description"
          onPress={() => {
            /* Handle onPress here if needed */
          }}
        />
        <ExistingMaterials
          isVisible={isModalMaterialsVisible}
          onClose={() => setIsModalMaterialsVisible(false)}
          selectedMaterialArray={materials}
          setSelectedMaterialArray={setMaterials}
          onPress={() => {
            /* Handle onPress here if needed */
          }}
        />
        <GalleryScreen
          isVisible={isModalImagesVisible}
          onClose={() => setModalImagesVisible(false)}
          serviceImages={serviceImages}
          setServiceImages={setServicesImages}
        />
      </ScrollView>
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
  priceHead: {
    fontSize: 18,
    color: 'black',
    marginTop: 10,
  },
  containerPrice: {
    alignSelf: 'center',
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
  },
  price: {
    fontSize: 18,
    color: 'black',
  },
  counter: {
    fontSize: 18,
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
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },

  selectButton: {
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 1,
    borderStyle: 'dotted',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 5,
    marginTop: 20,
  },
  selectButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  imageContainer: {
    width: imageContainerWidth,
    flexDirection: 'column',
    margin: 5,
    position: 'relative',
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
    flexDirection: 'row',
    width: '100%',
    marginBottom: 10,
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
  btn: {
    backgroundColor: '#007BFF', // A shade of blue.
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 5,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    elevation: 5,
  },
  buttonLabel: {
    color: 'red',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
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
  headerRight: {
    display: 'flex',
    flexDirection: 'row',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 0,
    resizeMode: 'cover',
  },
  headingRight: {
    fontSize: 16,
    fontFamily: 'Sukhumvit Set Bold',
    color: '#397af8',
  },
  addButtonContainer: {
    width: 100,
    margin: 5,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'gray',
    borderStyle: 'dotted',
    borderWidth: 1,
    borderRadius: 4, // Optional, for rounded edges
  },
});
