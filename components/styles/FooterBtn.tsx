import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faPlus, faDrawPolygon, faCog, faBell,faChevronRight, faCashRegister, faCoins} from '@fortawesome/free-solid-svg-icons';
type Props = {
  onPress: Function;
  disabled: boolean;
};

const FooterBtn = (props: Props) => {
  const {onPress, disabled} = props;
  if (disabled) {
    return (
      <View style={styles.containerBtn}>
        <TouchableOpacity style={styles.disabledButton} disabled>
          <View style={styles.header}>
            <Text style={styles.buttonText}>ดำเนินการต่อ</Text>
            <FontAwesomeIcon style={styles.icon} icon={faChevronRight} size={20} color="white" />


          </View>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View style={styles.containerBtn}>
      {/* Your main content here */}
      <TouchableOpacity style={styles.button} onPress={() => props.onPress()}>
        <View style={styles.header}>
          <Text style={styles.buttonText}>ดำเนินการต่อ</Text>
          <FontAwesomeIcon style={styles.icon} icon={faChevronRight} size={20} color="white" />


        </View>
      </TouchableOpacity>
    </View>
  );
};

export default FooterBtn;

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
    // backgroundColor: '#ec7211',

    backgroundColor: '#0073BA',
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
    marginTop: 3,
  },
  disabledButton: {
    width: '90%',
    top: '30%',
    height: 50,
    backgroundColor: '#d9d9d9',

    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
