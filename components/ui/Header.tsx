// HeaderRNEComponent.js
import React from 'react';
import {Header as HeaderRNE, HeaderProps} from '@rneui/themed';

import {TouchableOpacity, Text, StyleSheet, SafeAreaView} from 'react-native';

const HeaderRNEComponent = ({onLeftPress, onRightPress, title, rightText}) => {
  return (
    <SafeAreaView>
      <HeaderRNE
        placement="center"
        leftComponent={{
          icon: 'arrow-back',
          color: 'black',
          onPress: onLeftPress,
        }}
        centerComponent={{text: title, style: styles.heading}}
        rightComponent={
          <TouchableOpacity style={styles.headerRight} onPress={onRightPress}>
            <Text style={styles.headingRight}>{rightText}</Text>
          </TouchableOpacity>
        }
        containerStyle={{
          backgroundColor: '#ffffff',
          borderBottomColor: '#ccc',
          borderBottomWidth: 1,
        }}
      />
    </SafeAreaView>
  );
};

export default HeaderRNEComponent;
const styles = StyleSheet.create({
  headerRight: {
    display: 'flex',
    flexDirection: 'row',
  },
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    paddingVertical: 15,
  },
  heading: {
    fontSize: 16,
    fontFamily: 'Sukhumvit Set Bold',
    color: 'black',
  },
  headingRight: {
    fontSize: 16,
    fontFamily: 'Sukhumvit Set Bold',
    color: '#397af8',
  },
});
