import {
  StyleSheet,
  Dimensions,
  Text,
  View,
  Touchable,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useContext, useEffect, useRef} from 'react';
import {Store} from '../redux/store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useForm, Controller,useFormContext} from 'react-hook-form';

import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faPeopleCarry,
} from '@fortawesome/free-solid-svg-icons';
type Props = {
  handleEditClient: Function
};
const windowWidth = Dimensions.get('window').width;

const CardClient = (props: Props) => {
  const {
    state: {client_name, client_address, client_tel, client_tax},
    dispatch,
  }: any = useContext(Store);
  const context= useFormContext();
  const {  register,control,getValues } = context;
  return (
    <View >
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          <Icon style={styles.icon} name="account" size={20} color="#19232e" />
          <Text style={styles.label}>ลูกค้า</Text>
        </View>
        <TouchableOpacity onPress={() => props.handleEditClient()}>
          <View style={styles.editButton}>
            <Icon name="pencil" size={20} color="#19232e" />
            <Text style={styles.editButtonText}>แก้ไข</Text>
          </View>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.subContainer}>
        <View style={styles.summary}>
          <Text style={styles.summaryText}>{getValues('customer.name')}</Text>
          <Text style={styles.summaryPrice}></Text>
        </View>
        <View style={styles.description}>
          <Text>{client_address}</Text>
        </View>
        <View style={styles.telAndTax}>
          <Text>โทร.{client_tel}</Text>
          <Text>{client_tax}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CardClient;

const styles = StyleSheet.create({
  subContainer: {
    backgroundColor: '#ffffff',
    padding: 50,
    marginBottom: 10,
    marginTop: 10,
    height: 'auto',
    borderRadius: 10,
    marginVertical: 10,
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  description: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  telAndTax: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  unitPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: windowWidth * 0.2,
    marginTop: 10,
  },
  subummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryText: {
    fontSize: 16,
  },
  summaryPrice: {
    fontSize: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 4,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  editButtonText: {
    fontSize: 14,
    color: '#19232e',
    marginLeft: 4,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    color: '#19232e',
    fontWeight: 'bold',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});