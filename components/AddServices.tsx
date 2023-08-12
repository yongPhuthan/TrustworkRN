import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import React, {useState, useContext, useEffect, useRef} from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import CardProject from './CardProject';
import {Store} from '../redux/store';
type Props = {
  handleAddProductFrom: Function;
};

const AddServices = (props: Props) => {
  const {
    state: {client_name, serviceList},
    dispatch,
  }: any = useContext(Store);
  return (
    <View style={styles.container}>


      <TouchableOpacity
        onPress={() => props.handleAddProductFrom()}
        style={styles.button}>
        <Image
          source={require('../assets/images/baseline_add_circle_outline_black_24dp.png')}
          style={styles.icon}
        />
        <Text style={styles.label}>เพิ่มบริการ-สินค้า</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    paddingVertical: 13,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderStyle: 'dashed',

    // borderColor: '#19232e',
  },
  header: {
    flexDirection: 'row',
    paddingBottom: 10,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    color: '#19232e',
  },
});

export default AddServices;
