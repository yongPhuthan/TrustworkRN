import React, {useState, useContext, useEffect, useRef} from 'react';
import {Text, View, TextInput, Button, StyleSheet} from 'react-native';
import {useForm, Controller} from 'react-hook-form';

import {Store} from '../../redux/store';
import * as stateAction from '../../redux/actions';
import {StackNavigationProp} from '@react-navigation/stack';

import {RouteProp, ParamListBase} from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import{ CustomerForm, ServiceList,CompanyUser} from '../../types/docType'


interface Props {
  navigation: StackNavigationProp<ParamListBase, 'EditCustomer'>;
  route: RouteProp<ParamListBase, 'EditCustomer'>;
}

const EditCustomer = ({navigation, route}: Props) => {
  const {
    state: {client_name,client_address,client_tel,client_tax},
    dispatch,
  }: any = useContext(Store);
  const {
    control,
    handleSubmit,
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
    console.log(data);
    dispatch(stateAction.client_name(data.name));
    dispatch(stateAction.client_address(data.address));
    dispatch(stateAction.client_tel(data.phone));
    dispatch(stateAction.client_tax(data.taxId));
    navigation.goBack();
  };
  return (
    <ScrollView style={styles.container}>
      <View style={styles.subContainer}>
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
        {errors.name && <Text>This is required.</Text>}

        <Controller
          control={control}
          rules={{required: true}}
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
        {errors.address && <Text>This is required.</Text>}

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
          name="phone"
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
          name="taxId"
        />

        <Button title="บันทึก" onPress={handleSubmit(onSubmit)} />
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
