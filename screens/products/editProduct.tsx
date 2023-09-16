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
  Image
} from 'react-native';
import Divider from '../../components/styles/Divider';
import {useForm, Controller} from 'react-hook-form';
import {Store} from '../../redux/store';
import * as stateAction from '../../redux/actions';
import {faCloudUpload, faArrowLeft} from '@fortawesome/free-solid-svg-icons';

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
} from '../../types/docType';
import {ParamListBase} from '../../types/navigationType';
import SmallDivider from '../../components/styles/SmallDivider';
import {useImageUpload} from '../../hooks/utils/image/useImageUpload';

type Props = {
  navigation: StackNavigationProp<ParamListBase, 'EditProductForm'>;
  route: RouteProp<ParamListBase, 'EditProductForm'>;
  // onGoBack: (data: string) => void;
};

const EditProductForm = ({navigation, route}: Props) => {
  const {control, handleSubmit, formState} = useForm<FormData>();
  const {isDirty} = formState;
  const {item} = route.params;
  const [qty, setQuantity] = useState(item.qty);
  const [count, setCount] = useState(0);
  const [unitPrice, setPrice] = useState(item.unitPrice);
  const [total, setTotalCost] = useState(item.total);
  const [serviceListState, setServiceList] = useState<ServiceList[]>([]);
  const {isImageUpload, imageUrl, handleLogoUpload} = useImageUpload();

  const {
    state: {serviceList, selectedAudit},
    dispatch,
  }: any = useContext(Store);

  const handleFormSubmit = (data: FormData) => {
    if (!isDirty) {
      // If the form data hasn't been modified, you might want to show a message
      // or simply return without processing the form further.
      navigation.goBack();

      return;
    } else {
      const newServiceItem = {
        id: item.id,
        title: data.title ? data.title : item.title,
        description: data.description ? data.description : item.description,
        unitPrice: data.unitPrice ? Number(data.unitPrice.replace(/,/g, '')) : Number(item.unitPrice),
        qty: data.qty ? Number(data.qty) : Number(item.qty),
        total: Number(qty * unitPrice),
      };
      console.log('newServiceItem unit', newServiceItem.unitPrice);
      const index = serviceList.findIndex(
        (serviceItem: any) => serviceItem.id === item.id,
      );

      if (index !== -1) {
        const updatedServiceList = [...serviceList];
        updatedServiceList[index] = {
          ...updatedServiceList[index],
          ...newServiceItem,
        };
        console.log('updatedServiceList', updatedServiceList);

        dispatch(stateAction.update_service_list(updatedServiceList));
        navigation.goBack();
      }
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

  const handleSelectAudit = (data: FormData) => {
    navigation.navigate('SelectAudit', {
      title: data.title,
      description: data.description,
      serviceID: data.id,

    });
  };

  useEffect(() => {
    // Calculate the total cost based on the quantity and price values
    setTotalCost(qty * unitPrice);
    if(imageUrl){
      item.serviceImage = imageUrl;
    }
  }, [qty, unitPrice]);

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
            ) : item.serviceImage ? (
              <Image
              source={{uri: item.serviceImage}}
              style={{width: 300, aspectRatio: 2, resizeMode: 'contain'}}
            />
            ):(<View>
              <FontAwesomeIcon
                icon={faCloudUpload}
                style={{marginVertical: 5, marginHorizontal: 50}}
                size={32}
                color="gray"
              />
              <Text style={{textAlign: 'center', color: 'gray'}}>
                ภาพตัวอย่างสินค้า
              </Text>
            </View>)}
          </TouchableOpacity>
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
        {/* <View style={styles.summary}>
          <Text style={styles.price}>ราคา:</Text>
          <Controller
            control={control}
            name="unitPrice"
            defaultValue={String(item.unitPrice)}
            render={({field: {onChange, value}}) => (
              <TextInput
                style={styles.price}
                placeholder="0"
                keyboardType="number-pad"
                onChangeText={value => {
                  onChange(value);
                  setPrice(parseInt(value, 1));
                }}
                value={value}
              />
            )}
          />
        </View> */}
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
        {/* <View style={styles.summary}>
          <Text style={styles.price}>หน่วย:</Text>
          <Controller
            control={control}
            name="unit"
            defaultValue={item.unit }
            render={({field: {onChange, value}}) => (
              <TextInput
                style={styles.price}
                placeholder="ชุด"
                keyboardType="number-pad"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </View>
        <View style={styles.summary}>
          <Text style={styles.price}>ส่วนลด(%):</Text>
          <Controller
            control={control}
            name="discountPercent"
            defaultValue={String(item.discountPercent)}
            render={({field: {onChange, value}}) => (
              <TextInput
                style={styles.price}
                placeholder="0"
                keyboardType="number-pad"
                onChangeText={onChange}
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
        <TouchableOpacity
          style={styles.btn}
          onPress={handleSubmit(handleFormSubmit)}>
          <Text style={styles.label}>บันทึก</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonContainer} onPress={handleDelete}>
          <Icon name="close" size={24} color="red" />
          <Text style={styles.buttonLabel}>ลบรายการ</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
});
