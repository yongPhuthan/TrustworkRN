import {View, Text, TextInput, StyleSheet, Dimensions,Platform} from 'react-native';
import React from 'react';

type Props = {
  label: string;
  value: string;
  onChange: Function;
};

const windowWidth = Dimensions.get('window').width;

const DocNumber = (props: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        style={styles.input}
        value={props.value}
        onChangeText={() => props.onChange()}
      />
    </View>
  );
};

export default DocNumber;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor:'white',
    marginVertical: 10,
    alignItems: 'center',
    paddingHorizontal: 10,
    height:40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,

    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  input: {
    justifyContent: 'flex-end',

    fontSize: 14,
  },
});
