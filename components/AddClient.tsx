import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import React from 'react';
// import Icon from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


type Props = {
  handleAddClient: Function;
};

const AddClient = (props: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon style={styles.icon} name="account" size={20} color="#19232e" />

        <Text style={styles.label}>ลูกค้า</Text>
        
      </View>
      <TouchableOpacity
        onPress={() => props.handleAddClient()}
        style={styles.button}>
        <Image
          source={require('../assets/images/baseline_add_circle_outline_black_24dp.png')}
          style={styles.icon}
        />
        <Text style={styles.label}>เพิ่มลูกค้า</Text>
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
    borderColor: '#19232e',
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
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    color: '#19232e',
  },
});

export default AddClient;
