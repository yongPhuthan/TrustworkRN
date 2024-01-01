import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  FlatList,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Switch,
} from 'react-native';
import React, {useState, useContext, useEffect, useRef} from 'react';
import Modal from 'react-native-modal';
import Decimal from 'decimal.js';
import Icon from 'react-native-vector-icons/FontAwesome';
import AddServices from './AddServices';
import {Store} from '../redux/store';

type Props = {
  serviceList: {
    title: string;
    description: string;
    unitPrice: number;
    discountPercent: number;
    qty: number;
    total: number;
  };
  index: number;
  handleEditService: () => void;
  visibleModalIndex: boolean;
  setVisibleModalIndex: () => void;
  handleModalClose: () => void;
  handleRemoveService: () => void;
  
};
const windowWidth = Dimensions.get('window').width;

const CardProject = (props: Props) => {
  const {
    serviceList,
    handleRemoveService,
    index,
    handleEditService,
    setVisibleModalIndex,
    visibleModalIndex,
    handleModalClose,
  } = props;  
  
  console.log('serviceList FORM', serviceList)

  return (
    <View>
      <TouchableOpacity
        style={styles.subContainer}
        onPress={setVisibleModalIndex}>
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {props.index + 1}. {serviceList.title}
          </Text>
        </View>
        <View style={styles.description}>
          <Text>{serviceList.description}</Text>
          <Text></Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={styles.unitPrice}>
            <Text>
              {serviceList.unitPrice ? new Intl.NumberFormat().format(serviceList.unitPrice) : '0'}
             
            </Text>
            <Text> x</Text>
            <Text> {serviceList.qty}</Text>
          </View>
          <Text style={styles.summaryPrice}>
          {serviceList.total ? new Intl.NumberFormat().format(serviceList.total) : '0'}

          
          </Text>
        </View>
        {/* {serviceList?.discountPercent   ? (
               <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
               <Text>
                    ลด {Number(serviceList.discountPercent)
                     } %
                   </Text>
       
               </View>
        ):('')} */}
      </TouchableOpacity>
      {Platform.OS === 'android' ? (
        <Modal
        backdropTransitionOutTiming={100}
        style={styles.modalContainer}
        isVisible={visibleModalIndex}
        onBackdropPress={handleModalClose}>
        <Text style={styles.title}>
          รายการที่{index + 1}. {serviceList.title}
        </Text>
        <TouchableOpacity onPress={handleEditService}>
          <Text style={styles.closeButtonText}>แก้ไขรายการ</Text>
        </TouchableOpacity>
        <View
          style={{
            width: '100%',
            alignSelf: 'center',
            borderBottomWidth: 1,
            borderBottomColor: '#cccccc',
          }}></View>
     
        <TouchableOpacity onPress={handleRemoveService}>
          <Text style={styles.deleteButtonText}>ลบ</Text>
        </TouchableOpacity>
        <View
          style={{
            width: '100%',
            alignSelf: 'center',
            borderBottomWidth: 1,
            borderBottomColor: '#cccccc',
          }}></View>
      </Modal>
      ) : (
        <Modal
          backdropTransitionOutTiming={100}
          style={styles.modalContainer}
          isVisible={visibleModalIndex}
          onBackdropPress={handleModalClose}>
          <Text style={styles.title}>
            รายการที่{index + 1}. {serviceList.title}
          </Text>
          <TouchableOpacity onPress={handleEditService}>
            <Text style={styles.closeButtonText}>แก้ไขรายการ</Text>
          </TouchableOpacity>
          <View
            style={{
              width: '100%',
              alignSelf: 'center',
              borderBottomWidth: 1,
              borderBottomColor: '#cccccc',
            }}></View>
          <View
            style={{
              width: '100%',
              alignSelf: 'center',
              borderBottomWidth: 1,
              borderBottomColor: '#cccccc',
            }}></View>
          <TouchableOpacity onPress={handleRemoveService}>
            <Text style={styles.deleteButtonText}>ลบ</Text>
          </TouchableOpacity>
          <View
            style={{
              width: '100%',
              alignSelf: 'center',
              borderBottomWidth: 1,
              borderBottomColor: '#cccccc',
            }}></View>
        </Modal>
      )}
    </View>
  );
};

export default CardProject;

const styles = StyleSheet.create({
  subContainer: {
    backgroundColor: '#ffffff',
    padding: 50,
    marginBottom: 20,

    height: 'auto',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginVertical: 10,
    paddingHorizontal: 30,
    paddingVertical: 30,
  },
  title: {
    marginBottom: 20,
    fontSize: 14,
    fontFamily: 'Sukhumvit Set Bold',
    color: 'gray',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  description: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  },
  summaryPrice: {
    marginTop: 5,
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginTop: 30,
  },
  modalContainer: {
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
  closeButtonText: {
    fontSize: 20,
    borderBottomWidth: 1,
    borderColor: 'white',
    paddingBottom: 10,
    paddingTop: 10,
    fontWeight: 'bold',
    fontFamily: 'Sukhumvit set',
  },
  deleteButtonText: {
    fontSize: 20,
    borderBottomWidth: 1,
    fontWeight: 'bold',
    textDecorationColor: 'red',
    color: 'red',
    borderColor: 'white',
    paddingBottom: 10,
    fontFamily: 'Sukhumvit set',
    paddingTop: 10,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  closeButton: {
    paddingVertical: 10,
  },
  headerModal: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: '#ffffff',
  },
  label: {
    fontSize: 16,
    color: '#19232e',
  },
  containerModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 5,
    width: '80%',
    height: '80%',
  },
});
