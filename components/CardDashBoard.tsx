import {
  StyleSheet,
  Dimensions,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faFile,
  faDrawPolygon,
  faCog,
  faBell,
  faChevronRight,
  faCashRegister,
  faCoins,
} from '@fortawesome/free-solid-svg-icons';
type Props = {
  customerName: string;
  price: number;
  unit: string;
  description: string;
  date: string;
  end:string;
  status: any;
  onCardPress?: () => void; 

};

const windowWidth = Dimensions.get('window').width;

const CardDashBoard = (props: Props) => {
  return (
    <TouchableOpacity onPress={props.onCardPress} style={styles.subContainer}>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>{props.customerName}</Text>
        <Text style={styles.summaryPrice}>
          {Number(props.price)
            .toFixed(2)
            .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
        </Text>

        {/* <FontAwesomeIcon icon={faChevronRight} size={24} color="#19232e" /> */}
      </View>
      <View
        style={{
          backgroundColor:
            props.status === 'PENDING'
              ? '#ccc'
              : props.status === 'APPROVED'
              ? '#43a047'
              : props.status === 'CONTRACT'
              ? '#1079ae'
              : '#ccc',
          borderRadius: 4,
          paddingHorizontal: 8,
          paddingVertical: 4,
          marginTop: 8,
          alignSelf: 'flex-start',
        }}>
        <Text
          style={{
            color: props.status === 'pending' ? '#000' : '#fff',
            fontSize: 12,
            fontWeight: 'bold',
            textTransform: 'uppercase',
          }}>
          {props.status === 'PENDING'
            ? 'รออนุมัติ'
            : props.status === 'APPROVED'
            ? 'อนุมัติแล้ว'
            : props.status === 'CONTRACT'
            ? 'ทำสัญญาแล้ว'
            : props.status === 'signed'
            ? 'เซ็นเอกสารแล้ว'
            : 'รออนุมัติ'}
        </Text>
      </View>

      <View style={styles.telAndTax}>
        <Text style={styles.summaryPrice}>เสนอราคา {props.date}</Text>
        <Text style={styles.summaryPrice}>สิ้นสุด {props.end}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default CardDashBoard;

const styles = StyleSheet.create({
  subContainer: {
    backgroundColor: '#ffffff',

    height: 'auto',
    borderColor: '#ccc',
    width:windowWidth,
    paddingHorizontal: 20,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summary: {
    flexDirection: 'row',
    width: '99%',
    justifyContent: 'space-between',
  },
  description: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  telAndTax: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  unitPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: '#19232e',

    width: windowWidth * 0.2,
    marginTop: 10,
  },
  subummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: '#19232e',

  },
  summaryText: {
    fontSize: 16,

    color: '#19232e',
  },
  summaryPrice: {
    fontSize: 16,
    alignSelf: 'flex-end',
    color: '#19232e',
    


  },
  icon: {
    width: '10%',
  },
  status: {
    backgroundColor: '#43a047',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
