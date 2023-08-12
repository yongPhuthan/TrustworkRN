import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Platform,
  TouchableNativeFeedback,
} from 'react-native';
import React, {useState, useContext, useEffect, useMemo} from 'react';
import CardDashBoard from '../../components/CardDashBoard';
import {HOST_URL} from '@env';
import {Store} from '../../redux/store';
import Modal from 'react-native-modal';
import {FAB} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useQuery} from '@tanstack/react-query';
import Lottie from 'lottie-react-native';
import messaging from '@react-native-firebase/messaging';
import {User, Quotation} from '../../types/docType';
import * as stateAction from '../../redux/actions';
import {DashboardScreenProps} from '../../types/navigationType';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';

const Dashboard = ({navigation}: DashboardScreenProps) => {
  const [showModal, setShowModal] = useState(false);
  const {width, height} = Dimensions.get('window');

  const [selectedQuotation, setSelectedQuotation] = useState(null);

  const {
    state: {isEmulator},
    dispatch,
  }: any = useContext(Store);

  const [companyData, setCompanyData] = useState(null);
  const [quotationData, setQuotationData] = useState<Quotation[] | null>(null);
  const fabStyle = {width: 50};
  const handleFABPress = () => {
    // Do something when FAB is pressed
  };

  const handleModal = () => {
    setShowModal(true);
  };
  const handleModalClose = () => {
    setShowModal(false); // Step 4
  };
  const getTokenAndEmail = async () => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      const email = currentUser.email;
      return {token, email};
    } else {
      // User is not logged in
      return null;
    }
  };
  const fetchDashboardData = async () => {
    let url;
    if (isEmulator) {
      url = `http://${HOST_URL}:5001/workerfirebase-f1005/asia-southeast1/queryDashBoard`;
    } else {
      url = `https://asia-southeast1-workerfirebase-f1005.cloudfunctions.net/queryDashBoard`;
    }
    const user = await getTokenAndEmail();
    if (user) {
      console.log('user', user);
      const {token, email} = user;

      if (email) {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
          }),
        });
        const data = await response.json();
        await AsyncStorage.setItem('dashboardData', JSON.stringify(data));
        if (data && data[1]) {
          data[1].sort((a: Quotation, b: Quotation) => {
            const dateA = new Date(a.dateOffer);
            const dateB = new Date(b.dateOffer);
            return dateB.getTime() - dateA.getTime();
          });
        }
        return data;
      }
    }
  };
  const user = getTokenAndEmail();

  const {isLoading, error, data} = useQuery(
    ['dashboardData'],
    fetchDashboardData,
    {
      enabled: !!user,
      onSuccess: data => {
        setCompanyData(data[0]);
        setQuotationData(data[1]);
      },
    },
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Lottie
          style={{width: '10%'}}
          source={require('../../assets/animation/lf20_rwq6ciql.json')}
          autoPlay
          loop
        />
      </View>
    );
  }
  if (error) {
    console.log('error', error);
  }

  const renderItem = ({item}: {item: Quotation}) => (
    <>
      <TouchableOpacity onPress={() => handleModal()}>
        <View>
          <CardDashBoard
            status={item.status}
            date={item.dateOffer}
            end={item.dateEnd}
            price={item.allTotal}
            customerName={item.customer?.name as string}
            description={'quotation.'}
            unit={'quotation.'}
          />
        </View>
      </TouchableOpacity>
      {Platform.OS === 'android' ? (
        <Modal
          backdropOpacity={0.1}
          backdropTransitionOutTiming={100}
          style={styles.modalContainer}
          isVisible={showModal}
          onBackdropPress={handleModalClose}>
          <TouchableNativeFeedback
            onPress={() => {
              setShowModal(false); // Step 4
              // console.log('modal');
              navigation.navigate('EditQuotationScreen', {id: item.id});
            }}>
            <Text style={styles.closeButtonText}>แก้ไขเอกสาร</Text>
          </TouchableNativeFeedback>
          <View
            style={{
              width: '100%',
              alignSelf: 'center',
              borderBottomWidth: 1,
              borderBottomColor: '#cccccc',
            }}></View>
          <TouchableNativeFeedback
            onPress={() => {
              setShowModal(false);
              navigation.navigate('WebViewScreen', {id: item.id});
            }}>
            <Text style={styles.closeButtonText}>ดูตัวอย่าง</Text>
          </TouchableNativeFeedback>
          <View
            style={{
              width: '100%',
              alignSelf: 'center',
              borderBottomWidth: 1,
              borderBottomColor: '#cccccc',
            }}></View>
          <TouchableNativeFeedback
            onPress={() => {
              // setShowModal(false); // Step 4
            }}>
            <Text style={styles.deleteButtonText}>ลบเอกสาร</Text>
          </TouchableNativeFeedback>
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
          isVisible={showModal}
          onBackdropPress={handleModalClose}>
          <TouchableOpacity
            onPress={() => {
              setShowModal(false); // Step 4
              // console.log('modal');
              navigation.navigate('EditQuotationScreen', {id: item.id});
            }}>
            <Text style={styles.closeButtonText}>แก้ไขเอกสาร</Text>
          </TouchableOpacity>
          <View
            style={{
              width: '100%',
              alignSelf: 'center',
              borderBottomWidth: 1,
              borderBottomColor: '#cccccc',
            }}></View>
          <TouchableOpacity
            onPress={() => {
              setShowModal(false);
              navigation.navigate('WebViewScreen', {id: item.id});
            }}>
            <Text style={styles.closeButtonText}>ดูตัวอย่าง</Text>
          </TouchableOpacity>
          <View
            style={{
              width: '100%',
              alignSelf: 'center',
              borderBottomWidth: 1,
              borderBottomColor: '#cccccc',
            }}></View>
          <TouchableOpacity
            onPress={() => {
              // setShowModal(false); // Step 4
            }}>
            <Text style={styles.deleteButtonText}>ลบเอกสาร</Text>
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
    </>
  );

  const createNewQuotation = () => {
    dispatch(stateAction.reset_service_list());
    dispatch(stateAction.reset_contract());
    dispatch(stateAction.reset_audit());
    dispatch(stateAction.client_name(''));
    dispatch(stateAction.client_address(''));
    dispatch(stateAction.client_tel(''));
    dispatch(stateAction.client_tax(''));

    navigation.navigate('QuotationScreen');
  };

  return (
    <>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <FlatList
          data={quotationData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                height: height * 0.5,

                alignItems: 'center',
              }}>
              <Text style={{marginTop: 10}}>
                กดปุ่ม + ด้านล่างเพื่อสร้างใบเสนอราคา
              </Text>
            </View>
          }
          contentContainerStyle={quotationData?.length === 0 && {flex: 1}}
        />
        <FAB
          style={styles.fab}
          icon="plus"
          color="white"
          onPress={() => createNewQuotation()}
          theme={{colors: {accent: 'white'}}}
        />
      </View>
    </>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    // padding: 30,
  },
  fabStyle: {
    bottom: 20,
    right: 20,
    position: 'absolute',
    color: 'white',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 10,
    backgroundColor: '#0050f0',
    borderRadius: 28,
    height: 56,
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    color: 'white',
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
  selectedQuotationText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
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
    fontSize: 18,
    borderBottomWidth: 1,
    fontWeight: 'bold',
    textDecorationColor: 'red',
    color: 'red',
    borderColor: 'white',
    paddingBottom: 10,
    fontFamily: 'Sukhumvit set',
    paddingTop: 10,
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
  customFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 10,
    backgroundColor: '#0050f0',
    borderRadius: 28,
    height: 56,
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
