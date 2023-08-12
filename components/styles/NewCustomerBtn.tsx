import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {
  handlePress: () => void;
};

const NewCustomerBtn = (props: Props) => {
  return (
    <View style={styles.containerBtn}>
      {/* Your main content here */}
      <TouchableOpacity onPress={props.handlePress} style={styles.button}>
        <View style={styles.header}>
          <Icon style={styles.icon} name="plus" size={28} color="#19232e" />

          <Text style={styles.buttonText}>เสนอราคาลูกค้าใหม่</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default NewCustomerBtn;

const styles = StyleSheet.create({
  containerBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',

    bottom: 0,

    width: '100%',

    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    width: '90%',
    top: '30%',
    height: 50,
    backgroundColor: '#ec7211',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    marginTop: '1%',
    marginLeft: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  icon: {
    color: 'white',
  },
});
