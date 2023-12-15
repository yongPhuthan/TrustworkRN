import React, {useState, useContext, useEffect, useRef} from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Button,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {useForm, Controller,useFormContext} from 'react-hook-form';

import {Store} from '../../redux/store';
import * as stateAction from '../../redux/actions';
import {StackNavigationProp} from '@react-navigation/stack';
import {ParamListBase} from '../../types/navigationType';

import {RouteProp} from '@react-navigation/native';

import {CustomerForm, ServiceList, CompanyUser} from '../../types/docType';
import SaveButton from '../../components/ui/Button/SaveButton';

interface Props {
  navigation: StackNavigationProp<ParamListBase, 'EditCustomerForm'>;
  route: RouteProp<ParamListBase, 'EditCustomerForm'>;
}

const EditCustomer = ({navigation, route}: Props) => {
  const {
    state: {client_name, client_address, client_tel, client_tax},
    dispatch,
  }: any = useContext(Store);
  const {
    control,
    handleSubmit,
    getValues,
    formState: {errors},
  } = useForm<CustomerForm>({
    defaultValues: {
      name: client_name,
      address: client_address,
      phone: client_tel,
      taxId: client_tax,
    },
  });


  const onSubmit = (data: CustomerForm) => {
    // Send form data to backend API to add client
    dispatch(stateAction.client_name(data.name));
    dispatch(stateAction.client_address(data.address));
    dispatch(stateAction.client_tel(data.phone));
    dispatch(stateAction.client_tax(data.taxId));
    navigation.goBack();
  };
  return (
    <ScrollView style={styles.container}>
      <View style={styles.subContainer}>
  
        <Text style={styles.label}>ชื่อลูกค้า</Text>
        <Controller
          control={control}
          name="name"
          rules={{required: true}}
          render={({field: {onChange, onBlur, value}}) => (
            <TextInput
              style={styles.inputName}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.name && <Text style={styles.errorText}>ต้องใส่ชื่อลูกค้า</Text>}
  
        <Text style={styles.label}>ที่อยู่</Text>
        <Controller
          control={control}
          rules={{required: true}}
          render={({field: {onChange, onBlur, value}}) => (
            <TextInput
              // placeholder="ที่อยู่"
              keyboardType="name-phone-pad"
              multiline
              textAlignVertical="top"
              numberOfLines={4}
              style={styles.inputAddress}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="address"
        />
        {errors.address && <Text style={styles.errorText}>ต้องใส่ที่อยู่ลูกค้า</Text>}
  
        <Text style={styles.label}>เบอร์โทรศัพท์</Text>
        <Controller
          control={control}
          render={({field: {onChange, onBlur, value}}) => (
            <TextInput
              // placeholder="เบอร์โทรศัพท์"
              keyboardType="phone-pad"
              style={styles.inputName}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="phone"
        />
  
        <Text style={styles.label}>เลขทะเบียนภาษี (ถ้ามี)</Text>
        <Controller
          control={control}
          render={({field: {onChange, onBlur, value}}) => (
            <TextInput
              // placeholder="เลขทะเบียนภาษี(ถ้ามี)"
              keyboardType="number-pad"
              style={styles.inputName}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="taxId"
        />
  
      </View>
      <View style={styles.containerBtn}>
        <TouchableOpacity
          disabled={!getValues('name') || !getValues('address')}
          onPress={handleSubmit(onSubmit)}
          style={[
            styles.button,
            (!getValues('name') || !getValues('address')) && styles.buttonDisabled
          ]}
        >
          <Text style={styles.buttonText}>{`บันทึก`}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
  
};

export default EditCustomer;

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
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  containerBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    shadowColor: 'black',
    shadowOffset: {width: 1, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 4,
    bottom: 0,
    width: '100%',

    paddingBottom: 30,
  },
  label: {
    fontWeight: 'bold',

    // ... other label styles ...
  },
  errorText: {
    color: 'red',
    // ... other error text styles ...
  },
  button: {
    width: '90%',
    top: '30%',
    height: 50,
    backgroundColor: '#012b20',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: '#CCCCCC',
  },
});
