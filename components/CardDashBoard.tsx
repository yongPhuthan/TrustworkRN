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
};

const windowWidth = Dimensions.get('window').width;

const CardDashBoard = (props: Props) => {
  return (
    <TouchableOpacity style={styles.subContainer}>
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
            props.status === 'pending'
              ? '#ccc'
              : props.status === 'approved'
              ? '#43a047'
              : props.status === 'contract'
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
          {props.status === 'pending'
            ? 'รออนุมัติ'
            : props.status === 'approved'
            ? 'อนุมัติแล้ว'
            : props.status === 'contract'
            ? 'ทำสัญญาแล้ว'
            : props.status === 'signed'
            ? 'เซ็นเอกสารแล้ว'
            : 'รออนุมัติ'}
        </Text>
      </View>

      <View style={styles.telAndTax}>
        <Text>เสนอราคา {props.date}</Text>
        <Text>สิ้นสุด {props.end}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default CardDashBoard;

const styles = StyleSheet.create({
  subContainer: {
    backgroundColor: '#ffffff',
    marginBottom: 10,
    marginTop: 10,
    height: 'auto',
    borderColor: '#ccc',
    marginVertical: 10,
    width:windowWidth,
    paddingHorizontal: 10,
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
    width: windowWidth * 0.2,
    marginTop: 10,
  },
  subummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryText: {
    fontSize: 16,
    width: '60%',
  },
  summaryPrice: {
    fontSize: 16,
    alignSelf: 'flex-end',

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
