import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {
  onPress: Function;
  WebView : Function;
};

const FooterBtnEdit = (props: Props) => {
  return (
    <>
    <View style={styles.containerBtn}>
      {/* Your main content here */}
      <TouchableOpacity style={styles.button} onPress={() => props.onPress()}>
        <View style={styles.header}>
          <Text style={styles.buttonText}>ไปหน้าสัญญา</Text>

          <Icon
            style={styles.icon}
            name="arrow-right-thin"
            size={28}
            color="#19232e"
          />
        </View>
      </TouchableOpacity>
    </View>

    </>
    
  );
};

export default FooterBtnEdit;

const styles = StyleSheet.create({
  containerBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    shadowColor: 'black',
    shadowOffset: {width: 1, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 4,
    bottom: 0,

    width: '100%',

    paddingBottom: 30,
  },
  button: {
    width: '90%',
    top: '30%',
    height: 50,
    // backgroundColor: '#0073BA',
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
    marginTop: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  icon: {
    color: 'white',
    marginLeft: 10,
  },
});
