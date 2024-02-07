import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  Dimensions,
  StyleSheet,
  View,
  Platform
} from 'react-native';
import { v4 as uuidv4 } from 'uuid';

import { Appbar, Button, TextInput } from 'react-native-paper';

interface Props {
  onClose: Function;
}

const AddCustomer = ({onClose}: Props) => {
  const context = useFormContext();

  const {
    register,
    control,
    getValues,
    setValue,
    watch,
    formState: {errors},
  } = context as any;

  const onSubmit = () => {
    // setValue('customer.id', uuidv4());
    onClose();
  };

  return (
    <>
      <Appbar.Header
        mode="center-aligned"
        style={{
          backgroundColor: 'white',
          width: Dimensions.get('window').width,
        }}>
        <Appbar.Action icon={'close'} onPress={() => onClose()} />
        <Appbar.Content
          title="เพิ่มลูกค้า"
          titleStyle={{fontSize: 20, fontWeight: 'bold'}}
        />
        
      </Appbar.Header>
      <View style={styles.subContainer}>
        <View>
          <Controller
            control={control}
            name="customer.name"
            rules={{required: true}}
            render={({
              field: {onChange, onBlur, value},
              fieldState: {error},
            }) => (
              <TextInput
                label={'ชื่อลูกค้า'}
                style={{
                  marginTop: 10,
                }}
                error={!!error}
                textContentType="name"
                onBlur={onBlur}
                mode="outlined"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {/* {errors && (
      <Text style={styles.errorText}>
        {' '}
        {errors?.customer?.name?.message}
      </Text>
    )} */}

          <Controller
            control={control}
            name="customer.address"
            rules={{required: true}}
            render={({
              field: {onChange, onBlur, value},
              fieldState: {error},
            }) => (
              <TextInput
                keyboardType="name-phone-pad"
                multiline
                
                label={'ที่อยู่'}
                textAlignVertical="top"
                style={
                  Platform.OS === 'ios'
                    ? {height: 80, textAlignVertical: 'top',marginTop:10}
                    : {marginTop:10}
                }
                error={!!error}
                numberOfLines={4}
                mode="outlined"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                textContentType="fullStreetAddress"
              />
            )}
          />
          {/* {errors && (
      <Text style={styles.errorText}>
        {' '}
        {errors?.customer?.address?.message}
      </Text>
    )} */}

          <Controller
            control={control}
            name="customer.phone"
            render={({
              field: {onChange, onBlur, value},
              fieldState: {error},
            }) => (
              <TextInput
                // placeholder="เบอร์โทรศัพท์"
                keyboardType="phone-pad"
                style={{
                  marginTop: 10,
                }}
                label={'เบอร์โทรศัพท์'}
                mode="outlined"
                textAlignVertical="top"
                error={!!error}
                onBlur={onBlur}
                onChangeText={onChange}
                textContentType="telephoneNumber"
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            render={({field: {onChange, onBlur, value}}) => (
              <TextInput
                label={'เลขทะเบียนภาษี (ถ้ามี)'}
                style={{
                  marginTop: 10,
                }}
                keyboardType="number-pad"
                mode="outlined"
                textAlignVertical="top"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
            name="customer.companyId"
          />
          {/* <TouchableOpacity
          disabled={!watch('customer.name') || !watch('customer.address')}
          onPress={onSubmit}
          style={[
            styles.button,
            (!watch('customer.name') || !watch('customer.address')) &&
              styles.buttonDisabled,
          ]}>
          <Text style={styles.buttonText}>{`บันทึก`}</Text>
        </TouchableOpacity> */}
        <Button
          // loading={postLoading}
          disabled={!watch('customer.name') || !watch('customer.address')}
          mode="contained"
          style={{
            marginTop: 50,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          buttonColor={'#1b52a7'}
          onPress={onSubmit}>
          {'บันทึก'}
        </Button>
        </View>
      </View>
    </>
  );
};

export default AddCustomer;

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
