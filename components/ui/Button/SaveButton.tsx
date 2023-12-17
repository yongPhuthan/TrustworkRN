import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';

type Props = {
  onPress: Function;
  disabled: boolean;
};

const SaveButton = (props: Props) => {
  const {onPress, disabled} = props;
  if (disabled) {
    return (
      <View style={styles.containerBtn}>
        <TouchableOpacity style={styles.disabledButton} disabled>
          <View style={styles.header}>
            <Text style={styles.buttonText}>บันทึก</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View style={styles.containerBtn}>
      <TouchableOpacity style={styles.button} onPress={() => props.onPress()}>
        <View style={styles.header}>
          <Text style={styles.buttonText}>บันทึก</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default SaveButton;

const styles = StyleSheet.create({
  containerBtn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingBottom: 30,
  },
  button: {
    width: '100%',
    height: 50,
    top: '30%',
    backgroundColor: '#0073BA',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginRight: 8,
    marginTop: 1,
    alignSelf: 'center',
    fontFamily: 'Sukhumvit Set Bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: 'white',
    marginLeft: 8,
  },
  disabledButton: {
    width: '100%',
    top: '30%',
    height: 50,
    backgroundColor: '#d9d9d9',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
