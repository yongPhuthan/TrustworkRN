import React, {useState, useContext, useEffect, useRef} from 'react';
import {
  View,
  TextInput,
  Text,
  Platform,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {HOST_URL, PROJECT_FIREBASE, PROD_API_URL} from '@env';

import Divider from '../../components/styles/Divider';
import {useForm, Controller} from 'react-hook-form';
import {Store} from '../../redux/store';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faCloudUpload, faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import * as stateAction from '../../redux/actions';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {v4 as uuidv4} from 'uuid';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SmallDivider from '../../components/styles/SmallDivider';
import {FormData, ServiceList, CompanyUser} from '../../types/docType';
import {ParamListBase} from '../../types/navigationType';
import {
  launchImageLibrary,
  MediaType,
  ImageLibraryOptions,
  ImagePickerResponse,
} from 'react-native-image-picker';
import {useImageUpload} from '../../hooks/utils/useImageUpload';

type Props = {
  navigation: StackNavigationProp<ParamListBase, 'AddProduct'>;
  route: RouteProp<ParamListBase, 'AddProduct'>;
};

interface ImageForm {
  image: FileList;
}
const onValid = async ({image}: ImageForm) => {
  if (image && image.length > 0) {
    // Create a form data object with the image file.
    const formData = new FormData();
    formData.append('file', image[0]);

    // Create a URL for the Direct Creator Upload API.
    const url = `https://api.cloudflare.com/images/v1/creator/upload`;

    // Make the request to the API.
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    // If the request is successful, get the image URL from the response.
    if (response.ok) {
      const imageUrl = await response.json();
      console.log(imageUrl);
    }
  }
};

const AddProductForm = ({navigation, route}: Props) => {
  const {control, handleSubmit} = useForm<FormData>();
  const [count, setCount] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [qty, setQuantity] = useState(1);
  const [serviceImageUri, setServiceImage] = useState<string | null>(null);
  const [unitPrice, setPrice] = useState(0);
  const [total, setTotalCost] = useState(0);
  const [serviceListState, setServiceList] = useState<ServiceList[]>([]);
  const {isImageUpload, imageUrl, handleLogoUpload} = useImageUpload();

  const serviceID = uuidv4();
  const {
    state: {serviceList, selectedAudit},
    dispatch,
  }: any = useContext(Store);

  const handleFormSubmit = (data: FormData) => {
    const selectedAudits = selectedAudit.map((obj: any) => {
      return {
        ...obj,
        serviceID,
      };
    });

    const newServiceItem = {
      id: serviceID,
      title: data.title,
      description: data.description,
      unitPrice: data.unitPrice,
      serviceImage: imageUrl,
      qty: qty,
      discountPercent,
      total: (qty * unitPrice).toString(),
      audits: selectedAudits,
    };

    dispatch(stateAction.service_list(newServiceItem as any));
    dispatch(stateAction.reset_audit());
    navigation.pop(2);

    // navigation.goBack();
  };

  // const handleSelectAudit = (data: FormData) => {
  //   navigation.navigate('AuditCategory', {
  //     title: data.title,
  //     description: data.description,
  //     serviceID: serviceID,

  //   });
  // };
  const handleSelectAudit = (data: FormData) => {
    navigation.navigate('SelectAudit', {
      title: data.title,
      description: data.description,
      serviceID: serviceID,
    });
  };
  useEffect(() => {
    if (qty > 0) {
      const total = qty * unitPrice;
      // const discountedTotal = total - (total * discountPercent / 100);
      setTotalCost(total);
    } else {
      setTotalCost(0);
    }
  }, [qty, unitPrice, discountPercent]);
  console.log('imageUrl', imageUrl);
  console.log('PROJECT_FIREBASE', PROJECT_FIREBASE);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.subContainer}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
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
            onPress={handleLogoUpload}>
            {isImageUpload ? (
              <ActivityIndicator size="small" color="gray" />
            ) : imageUrl ? (
              <Image
                source={{uri: imageUrl}}
                style={{width: 300, aspectRatio: 2, resizeMode: 'contain'}}
              />
            ) : (
              <View>
                <FontAwesomeIcon
                  icon={faCloudUpload}
                  style={{marginVertical: 5, marginHorizontal: 50}}
                  size={32}
                  color="gray"
                />
                <Text style={{textAlign: 'center', color: 'gray'}}>
                  ภาพตัวอย่างสินค้า
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Controller
          control={control}
          name="title"
          defaultValue=""
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
          defaultValue=""
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
            defaultValue=""
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
          {selectedAudit?.length > 0 ? (
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
              {selectedAudit?.map((item: any) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  onPress={handleSubmit(handleSelectAudit)}>
                  <Text style={styles.cardTitle}>{item.auditShowTitle}</Text>
                  <Icon name="chevron-right" size={24} color="gray" />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View>
              {selectedAudit.length === 0 && (
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={handleSubmit(handleSelectAudit)}>
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
        <TouchableOpacity
          style={[
            styles.btn,
            selectedAudit.length === 0 ? styles.btnDisabled : null,
          ]}
          onPress={handleSubmit(handleFormSubmit)}
          disabled={selectedAudit.length === 0}>
          <Text style={styles.label}>บันทึก</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  priceHead: {
    fontSize: 18,
    color: 'black',
    marginTop: 10,
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
  selectButton: {
    // backgroundColor: '#0073BA',
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
    // color: '#fff',
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
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
});
