import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import React from 'react';
// import Icon from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import { useForm, FormProvider, useFormContext } from "react-hook-form"

import {
  faBell,
  faCog,
  faCogs,
  faPeopleCarry,
  faPerson,
  faPlus,
  faPlusCircle,
  faSheetPlastic,
  faUser,
  faUserCircle,
  faUserCog,
} from '@fortawesome/free-solid-svg-icons';

type Props = {
  handleAddClient: Function;
};

const AddClient = (props: Props) => {
  const context = useFormContext();
  const { handleSubmit, register } = context;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <FontAwesomeIcon icon={faUser} style={styles.icon} size={20} color="#19232e" />

        <Text style={styles.label}>ลูกค้า</Text>
      </View>

      <TouchableOpacity
        onPress={() => props.handleAddClient()}
        style={styles.button}>
        <View style={styles.containerButton}>
          <FontAwesomeIcon style={styles.icon2} icon={faPlusCircle} color="#0073BA" size={18} />
          <Text style={styles.labelButton}>เพิ่มลูกค้า</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  containerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
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
    borderColor: '#0073BA',
    borderStyle: 'dashed',
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
    marginRight: 15,
  },
  icon2: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    color: '#19232e',
    fontFamily: 'Sukhumvit Set Bold',
  },
  labelButton: {
    fontSize: 16,
    color: '#0073BA',
    fontFamily: 'Sukhumvit set',
  },
});

export default AddClient;
