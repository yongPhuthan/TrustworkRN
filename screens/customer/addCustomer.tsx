import React, {useState, useContext, useEffect, useRef} from 'react';
import {
  Text,
  View,
  TextInput,
  Button,
  Pressable,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';

import {Store} from '../../redux/store';
import * as stateAction from '../../redux/actions';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, ParamListBase} from '@react-navigation/native';
import {CustomerForm, ServiceList, CompanyUser} from '../../types/docType';
import SaveButton from '../../components/ui/Button/SaveButton';

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
  const name = watch('name');
  const address = watch('address');

  const isButtonDisabled = !name || !address;

  return (
    <View style={{flex: 1}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={20}
        style={styles.container}>
        <ScrollView style={styles.subContainer}>
        <Text style={styles.priceTitle}>ชื่อลูกค้า</Text>

          {/* <Text>{client_name}</Text> */}
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
          <Text style={styles.priceTitle}>ที่อยู่</Text>

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
          <Text style={styles.priceTitle}>เบอร์โทร</Text>

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
          <Text style={styles.priceTitle}>เลขภาษี (ถ้ามี)</Text>

          <Controller
            control={control}
            render={({field: {onChange, onBlur, value}}) => (
              <TextInput
                placeholder="เลขทะเบียนภาษี(ถ้ามี)"
                keyboardType="numeric"
                style={styles.inputLast}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
            name="companyId"
          />
          {/* <Pressable
            disabled={isButtonDisabled}
            style={[styles.btn, isButtonDisabled && styles.disabledBtn]}
            onPress={handleSubmit(onSubmit)}>
            <Text style={styles.label}>บันทึก</Text>
          </Pressable> */}
        </ScrollView>
        <SaveButton
          onPress={handleSubmit(onSubmit)}
          disabled={isButtonDisabled}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

export default AddCustomer;

const styles = StyleSheet.create({
  container: {
    height: '100%',
    paddingBottom: 150,

  },
  subContainer: {
    backgroundColor: '#ffffff',
    padding: 30,
    height: '100%',
  
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
    marginBottom: 100,
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
    marginVertical: 5,
    fontSize: 16,
    height: 40,
  },
  inputLast: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 5,
    fontSize: 16,
    height: 40,
    marginBottom: 100,
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
    marginVertical: 5,
    fontSize: 16,
    height: 100,
  },
  label: {
    fontSize: 16,
    color: 'white',
  },
  priceTitle: {
    fontSize: 14,
    color: 'black',
marginTop: 15,
    fontFamily: 'Sukhumvit Set Bold',

  },
});