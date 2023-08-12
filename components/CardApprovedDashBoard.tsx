import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Platform,
  TouchableNativeFeedback,
} from 'react-native';
import Modal from 'react-native-modal';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {
  NavigationContainer,
  NavigationContext,
  useNavigation,
} from '@react-navigation/native';
import React, {useState, useContext, useEffect, useMemo} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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
  onPress: Function;
  description: string;
  date: string;
  status: any;
};

const windowWidth = Dimensions.get('window').width;
const CardApprovedDashBoard = (props: Props) => {
  const [showModal, setShowModal] = useState(false);
  const navigation = useNavigation();
  const [isModalVisible, setModalVisible] = useState(false);

  const handleModal = () => {
    setShowModal(true);
  };
  const handleModalClose = () => {
    setShowModal(false); // Step 4
  };

  const handleShowModalClose = () => {
    setShowModal(false);
  };
  const handleCloseResponse = () => {
    setModalVisible(false);
  };
  const handleNoResponse = () => {
    setModalVisible(false);
  };
  const handleYesResponse = () => {
    // navigation.navigate('CreateContractScreen', {
    //   id: selectedItemId,
    // });
  };

  return (
    <>
      {props.status === 'approved' && (
        <View style={styles.subContainer}>
          <View style={styles.summary}>
            <Text style={styles.summaryText}>{props.customerName}</Text>
            <Text style={styles.summaryPrice}>
              {Number(props.price)
                .toFixed(2)
                .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
            </Text>
          </View>

          <View style={styles.telAndTax}>
            <View
              style={{
                backgroundColor:
                  props.status === 'pending'
                    ? '#ccc'
                    : props.status === 'approved'
                    ? '#43a047'
                    : props.status === 'signed'
                    ? '#2196f3'
                    : props.status === 'contract'
                    ? '#ccc'
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
                  : props.status === 'signed'
                  ? 'เซ็นเอกสารแล้ว'
                  : props.status === 'contract'
                  ? 'ทำสัญญาแล้ว'
                  : 'รออนุมัติ'}
              </Text>
            </View>
            {props.status === 'approved' && (
              <View style={{marginTop: 8}}>
                <Text>วันที่อนุมัติ {props.date}</Text>
              </View>
            )}
          </View>
          {props.status === 'approved' && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => props.onPress()}>
              <View style={styles.container}>
                <Text style={styles.buttonText}>เริ่มทำสัญญา</Text>
              </View>
            </TouchableOpacity>
          )}
          {props.status === 'contract' && ''}
        </View>
      )}

      {props.status === 'contract' && (
        <>
          <TouchableOpacity onPress={() => handleModal()}>
            <View style={styles.subContainer}>
              <View style={styles.summary}>
                <Text style={styles.summaryText}>{props.customerName}</Text>
                <Text style={styles.summaryPrice}>
                  {Number(props.price)
                    .toFixed(2)
                    .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                </Text>
              </View>

              <View style={styles.telAndTax}>
                <View
                  style={{
                    backgroundColor:
                      props.status === 'pending'
                        ? '#ccc'
                        : props.status === 'approved'
                        ? '#43a047'
                        : props.status === 'signed'
                        ? '#2196f3'
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
                      : props.status === 'signed'
                      ? 'เซ็นเอกสารแล้ว'
                      : props.status === 'contract'
                      ? 'ทำสัญญาแล้ว'
                      : 'รออนุมัติ'}
                  </Text>
                </View>
                {props.status === 'approved' && (
                  <View style={{marginTop: 8}}>
                    <Text>วันที่อนุมัติ {props.date}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>

        </>
      )}
    </>
  );
};

export default CardApprovedDashBoard;

const styles = StyleSheet.create({
  subContainer: {
    backgroundColor: '#ffffff',
    marginBottom: 10,
    marginTop: 10,
    width:windowWidth,
    height: 'auto',
    borderColor: '#ccc',
    marginVertical: 10,
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
    justifyContent: 'space-between',
  },
  description: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  telAndTax: {
    flexDirection: 'row',
    width: '90%',
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
    fontSize: 18,
    width: '30%',
  },
  icon: {
    width: '10%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
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
  button: {
    width: '99%',
    marginTop: 30,
    height: 40,
    backgroundColor: '#988a42',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginRight: 5,
  },
  iconButton: {
    color: 'white',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // adjust this as needed
  },
  closeButtonText: {
    fontSize: 20,
    borderBottomWidth: 1,
    borderColor: 'white',
    paddingBottom: 10,
    paddingTop: 10,
    fontWeight: 'bold',
    fontFamily: 'Sukhumvit set',
  },
  modalContainer2: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    width: '90%',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    // bottom: '40%',
    left: 0,
  },
  whiteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    alignSelf: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  RedText: {
    marginTop: 10,
    fontSize: 14,
    alignSelf: 'center',
  },
});
