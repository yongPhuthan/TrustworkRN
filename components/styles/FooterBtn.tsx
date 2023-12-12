import {StyleSheet, Text, View, TouchableOpacity,ActivityIndicator} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faPlus, faDrawPolygon, faCog, faBell,faChevronRight, faCashRegister, faCoins} from '@fortawesome/free-solid-svg-icons';
type Props = {
  onPress: Function;
  disabled: boolean;
  btnText: string;
  loading?: boolean;
};

const FooterBtn = (props: Props) => {
  const {onPress, disabled,loading,btnText} = props;
  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="small" color="white" />;
    }
    return <Text style={styles.buttonText}>{btnText}</Text>;
  };

  if (disabled || loading) {
    return (
      <View style={styles.containerBtn}>
        <TouchableOpacity style={disabled ? styles.disabledButton : styles.button} disabled>
          <View style={styles.header}>
            {renderContent()}
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.containerBtn}>
      <TouchableOpacity style={styles.button} onPress={() => onPress()}>
        <View style={styles.header}>
          {renderContent()}
        </View>
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
