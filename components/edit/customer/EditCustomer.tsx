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
import {useForm, Controller, useFormContext} from 'react-hook-form';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';

import {
  faCloudUpload,
  faEdit,
  faPlus,
  faImages,
  faPlusCircle,
  faClose,
  faCamera,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import {Store} from '../../../redux/store';
import * as stateAction from '../../../redux/actions';
import {CustomerForm, ServiceList, CompanyUser} from '../../../types/docType';
import SaveButton from '../../ui/Button/SaveButton';

interface Props {
  onClose: Function;
}

const EditCustomer = ({onClose}: Props) => {
  const context = useFormContext();
  const {register, control, getValues} = context;
  const {
    state: {client_name, client_address, client_tel, client_tax},
    dispatch,
  }: any = useContext(Store);
  const {
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
    onClose();
  };

  return (
    <ScrollView style={{width: '100%'}}>
      <View style={styles.subContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.onCloseButton}
            onPress={() => onClose()}>
            <FontAwesomeIcon icon={faClose} size={24} color="gray" />
          </TouchableOpacity>
        </View>
        <Text
          style={{
            alignSelf: 'center',
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 20,
            marginTop: 20,
          }}>
          แก้ไขลูกค้า
        </Text>
        <Text style={styles.label}>ชื่อลูกค้า</Text>
        <Controller
          control={control}
          name="customer.name"
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
          name="customer.address"
          rules={{required: true}}
          render={({field: {onChange, onBlur, value}}) => (
            <TextInput
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
        />
        {errors.address && (
          <Text style={styles.errorText}>ต้องใส่ที่อยู่ลูกค้า</Text>
        )}

        <Text style={styles.label}>เบอร์โทรศัพท์</Text>
        <Controller
          control={control}
          name="customer.phone"
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
          name="customer.companyId"
        />
        <TouchableOpacity
          disabled={
            !getValues('customer.name') || !getValues('customer.address')
          }
          onPress={handleSubmit(onSubmit)}
          style={[
            styles.button,
            (!getValues('customer.name') || !getValues('customer.address')) &&
              styles.buttonDisabled,
          ]}>
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
    height: '100%',
    width: '100%',
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
  onCloseButton: {
    paddingVertical: 0,
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
    width: '100%',
    height: 50,
    backgroundColor: '#0073BA',
    borderRadius: 5,
    justifyContent: 'center',
    marginTop: 20,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: '#CCCCCC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 10,
    position: 'relative',
    backgroundColor: 'white',
    // backgroundColor: '#f5f5f5',
  },
});
