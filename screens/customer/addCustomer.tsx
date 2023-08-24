import React, {useState, useContext, useEffect, useRef} from 'react';
import {
  Text,
  View,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';

import {Store} from '../../redux/store';
import * as stateAction from '../../redux/actions';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, ParamListBase} from '@react-navigation/native';
import{ CustomerForm, ServiceList,CompanyUser} from '../../types/docType'

type WatchedValues = {
  name: string;
  address: string;
};


interface Props {
  navigation: StackNavigationProp<ParamListBase, 'AddCustomer'>;
  route: RouteProp<ParamListBase, 'AddCustomer'>;
}

const AddCustomer = ({navigation, route}: Props) => {
  const {
    state: {client_name},
    dispatch,
  }: any = useContext(Store);
  const {
    control,
    handleSubmit,
    watch,
    formState: {errors},
  } = useForm<CustomerForm>({
    defaultValues: {
      name: '',
      address: '',
      mobilePhone: '',
      companyId: '',
    },
  });

  const onSubmit = (data: CustomerForm) => {
    // Send form data to backend API to add client
    console.log(data);
    dispatch(stateAction.client_name(data.name));
    dispatch(stateAction.client_address(data.address));
    dispatch(stateAction.client_tel(data.mobilePhone));
    dispatch(stateAction.client_tax(data.companyId));
    navigation.goBack();
  };
  const name = watch("name");
  const address = watch("address");
  
  const isButtonDisabled = !name || !address; 

  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        <Text>{client_name}</Text>
        <Controller
          control={control}
          rules={{required: true}}
          render={({field: {onChange, onBlur, value}}) => (
            <TextInput
              placeholder="ชื่อลูกค้า"
              style={styles.inputName}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="name"
        />
        {errors.name && <Text>This is required.</Text>}

        <Controller
          control={control}
          render={({field: {onChange, onBlur, value}}) => (
            <TextInput
              placeholder="ที่อยู่"
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

        <Controller
          control={control}
          render={({field: {onChange, onBlur, value}}) => (
            <TextInput
              placeholder="เบอร์โทรศัพท์"
              keyboardType="phone-pad"
              style={styles.inputName}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="mobilePhone"
        />

        <Controller
          control={control}
          render={({field: {onChange, onBlur, value}}) => (
            <TextInput
              placeholder="เลขทะเบียนภาษี(ถ้ามี)"
              keyboardType="number-pad"
              style={styles.inputName}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="companyId"
        />

        {/* <Button title="บันทึก" onPress={handleSubmit(onSubmit)} /> */}
        <TouchableOpacity         disabled={isButtonDisabled}
             style={[styles.btn, isButtonDisabled && styles.disabledBtn]} 
             onPress={handleSubmit(onSubmit)}>
          <Text style={styles.label}>บันทึก</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddCustomer;

const styles = StyleSheet.create({
  container: {},
  subContainer: {
    backgroundColor: '#ffffff',
    padding: 30,
    marginBottom: 10,
    height: 'auto',
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
  disabledBtn: {
    backgroundColor: 'gray', 
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
});
