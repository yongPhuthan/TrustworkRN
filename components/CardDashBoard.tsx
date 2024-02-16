import React from 'react';
import {QuotationStatus} from '../models/QuotationStatus';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
type Props = {
  customerName: string;
  price: number;
  date: string;
  end: string;
  status: string;
  onCardPress?: () => void;
};

const windowWidth = Dimensions.get('window').width;

const CardDashBoard = (props: Props) => {
  return (
    <TouchableOpacity onPress={props.onCardPress} style={styles.subContainer}>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>{props.customerName}</Text>
        <Text style={styles.summaryText}>
          {Number(props.price)
            .toFixed(2)
            .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
        </Text>

        {/* <FontAwesomeIcon icon={faChevronRight} size={24} color="#19232e" /> */}
      </View>
      <View
        style={{
          backgroundColor:
            props.status === QuotationStatus.PENDING &&
            QuotationStatus.WAITING_FOR_CUSTOMER_APPROVAL
              ? '#ccc'
              : props.status === QuotationStatus.APPROVED &&
                QuotationStatus.SIGNED_CONTRACT
              ? '#43a047'
              : props.status === QuotationStatus.CONTRACT
              ? '#1079ae'
              : props.status === QuotationStatus.ONPROCESS
              ? 'orange'
              : '#ccc',
          borderRadius: 4,
          paddingHorizontal: 8,
          paddingVertical: 4,
          marginTop: 8,
          alignSelf: 'flex-start',
        }}>
        <Text
          style={{
            color: props.status === QuotationStatus.PENDING ? '#000' : '#fff',
            fontSize: 12,
            fontWeight: 'bold',
            textTransform: 'uppercase',
          }}>
          {props.status === QuotationStatus.PENDING
            ? 'รออนุมัติ'
            : props.status === QuotationStatus.APPROVED
            ? 'อนุมัติแล้ว'
            : props.status === QuotationStatus.CONTRACT
            ? 'ทำสัญญาแล้ว'
            : props.status === QuotationStatus.SIGNED_CONTRACT
            ? 'เซ็นเอกสารแล้ว'
            : props.status === QuotationStatus.ONPROCESS
            ? 'กำลังทำงาน'
            : props.status === QuotationStatus.WAITING_FOR_CUSTOMER_APPROVAL
            ? 'ส่งงานแล้ว-รอลูกค้าตรวจงาน'
            : props.status === QuotationStatus.CUSTOMER_APPROVAL_SOMECOMPLETED
            ? 'ลูกค้าอนุมัติงานบางส่วน-รอแก้ไขเพิ่มเติม'
            : props.status === QuotationStatus.CUSTOMER_NOTAPPROVAL
            ? 'ลูกค้าไม่อนุมัติงาน-แก้ไขงานใหม่และส่งงานอีกครั้ง'
            : props.status === QuotationStatus.CUSTOMER_APPROVAL_ALLCOMPLETED
            ? 'ลูกค้าอนุมัติงานทั้งหมดเรียบร้อย'
            : ''}
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
    width: windowWidth,
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
    fontSize: 14,
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
