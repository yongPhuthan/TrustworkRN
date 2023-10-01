import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faPlus, faDrawPolygon, faCog, faBell,faChevronRight, faCashRegister, faCoins} from '@fortawesome/free-solid-svg-icons';
type Props = {
  onPress: Function;
  disabled: boolean;
  btnText: string;
};

const FooterBtn = (props: Props) => {
  const {onPress, disabled} = props;
  if (disabled) {
    return (
      <View style={styles.containerBtn}>
        <TouchableOpacity style={styles.disabledButton} disabled>
          <View style={styles.header}>
            <Text style={styles.buttonText}>{props.btnText}</Text>
            {/* <FontAwesomeIcon style={styles.icon} icon={faChevronRight} size={20} color="white" /> */}
          </View>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View style={styles.containerBtn}>
    <TouchableOpacity style={styles.button} onPress={() => props.onPress()}>
    <Text style={styles.buttonText}>{props.btnText}</Text>

    </TouchableOpacity>
  </View>
  );
};

export default FooterBtn;

const styles = StyleSheet.create({
  containerBtn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center', 
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingBottom: 30,
    shadowColor: '#000', // สีเงา
    shadowOffset: {
      width: 0, // ตำแหน่งแนวนอนของเงา
      height: 10, // ตำแหน่งแนวตั้งของเงา
    },
    shadowOpacity: 0.10, // ความโปร่งใสของเงา
    shadowRadius: 20, // รัศมีของเงา
    elevation: 5, // สำหรับ Android เพื่อให้มีเงา
  },
  button: {
    width: '90%',
    height: 50,
    top: '30%',
    backgroundColor: '#0073BA',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center', // Aligns content of the button to the right
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    // fontWeight: 'bold',
    fontFamily: 'Sukhumvit Set Bold',
    marginRight: 8,
    marginTop: 1,
    alignSelf: 'center', // Aligns text horizontally in the center
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center', // Aligns items vertically in the center
    justifyContent: 'center', // Aligns items to the right
  },
  icon: {
    color: 'white',
    marginLeft: 8, // Added some space between text and icon
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
