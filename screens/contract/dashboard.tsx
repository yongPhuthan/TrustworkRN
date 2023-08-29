import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Platform,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  TouchableNativeFeedback,
} from 'react-native';
import React, {useState, useContext, useCallback, useMemo} from 'react';

import auth from '@react-native-firebase/auth';
import {HOST_URL,PROJECT_FIREBASE} from '@env';
import {StackNavigationProp} from '@react-navigation/stack';
import {Store} from '../../redux/store';
import * as stateAction from '../../redux/actions';
import Modal from 'react-native-modal';
import CardApprovedDashBoard from '../../components/CardApprovedDashBoard';
import {useQuery} from '@tanstack/react-query';
import Lottie from 'lottie-react-native';
import {Contract, Quotation, Customer, CompanyUser} from '../../types/docType';
import {useFetchDashboardContract} from '../../hooks/contract/useFetchDashboard';
import useTokenAndEmail from '../../hooks/user/useTokenAndEmail';
import {DashboardScreenProps} from '../../types/navigationType';
type Props = {};

const ContractDashBoard = ({navigation}: DashboardScreenProps) => {
  const [isExtended, setIsExtended] = React.useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<any | null>(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const {width, height} = Dimensions.get('window');

  const handleModalClose = () => {
    setShowModal(false); // Step 4
  };
  const {
    state: {isEmulator},
    dispatch,
  }: any = useContext(Store);
  const [companyData, setCompanyData] = useState<CompanyUser | null>(null);
  const [quotationData, setQuotationData] = useState<Quotation[] | null>(null);

  const handleSelectScreen = (id: string) => {
    setSelectedItemId(id);
    setModalVisible(true);
  };
  const handleYesResponse = () => {
    if (companyData && quotationData && quotationData.length > 0) {
      navigation.navigate('ContractOptions', {
        id: quotationData[0].id,
        sellerId: companyData.id,
        allTotal: quotationData[0].allTotal,
        customerName: quotationData[0].customer?.name as string,
      });
    }
    setModalVisible(false);
  };

  const handleModal = (id: any) => {
    setSelectedItemId(id);
    setShowModal(true);
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
  const sortedData = useMemo(() => {
    if (!quotationData) {
      return null;
    }
    return [...quotationData].sort((a, b) =>
      a.status === 'approved' && b.status !== 'approved' ? -1 : 1,
    );
  }, [quotationData]);
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
    console.log('FETCHER')

    let url;
    if (isEmulator) {
      url = `http://${HOST_URL}:5001/${PROJECT_FIREBASE}/asia-southeast1/queryContractDashBoard`;
    } else {
      url = `https://asia-southeast1-${PROJECT_FIREBASE}.cloudfunctions.net/queryContractDashBoard`;
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
    ['contractDashboardData'],
    fetchDashboardData,
    {
      enabled: !!user,
      onSuccess: data => {
        console.log('data contract', data);
        setCompanyData(data[0]);
        setQuotationData(data[1]);
      },
    },
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator></ActivityIndicator>
      </View>
    );
  }

  if (error) {
    console.log('error', error);
  }

  // useEffect(() => {
  // messaging().onNotificationOpenedApp(remoteMessage => {
  //   console.log(
  //     'Notification caused app to open from background state:',
  //     remoteMessage.notification,
  //   );
  // })
  // messaging()
  // .getInitialNotification()
  // .then(remoteMessage => {
  //   if (remoteMessage) {
  //     console.log(
  //       'Notification caused app to open from quit state:',
  //       remoteMessage.notification,
  //     );
  //   }
  // }
  // )
  // async function requestUserPermission() {
  //   const authStatus = await messaging().requestPermission();
  //   const enabled =
  //     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  //   if (enabled) {
  //     console.log('Authorization status:', authStatus);
  //     getFCMToken();
  //   }
  // }

  // async function getFCMToken() {
  //   const fcmToken = await messaging().getToken();
  //   if (fcmToken) {
  //     console.log('Your Firebase Token is 5555:', fcmToken);
  //   } else {
  //     console.log('Failed to get Firebase Token');
  //   }
  // }

  // requestUserPermission();
  // }, []);

  // const requestUserPermission = async () => {
  //   const authStatus = await messaging().requestPermission();
  //   const enabled =
  //     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  //   if (enabled) {
  //     console.log('Authorization status:', authStatus);
  //   }
  // };

  const renderItem = ({item}: {item: Quotation}) => (
    <>
      {item.status === 'approved' ? (
        <View>
          <CardApprovedDashBoard
            onPress={() => handleSelectScreen(item.id)}
            status={item.status}
            date={item.dateApproved}
            price={item.allTotal}
            customerName={item.customer?.name as string}
            description={'quotation.'}
            unit={'quotation.'}
          />
        </View>
      ) : (
        <View>
          <TouchableOpacity onPress={() => handleModal(item.id)}>
            <CardApprovedDashBoard
              onPress={() => handleSelectScreen(selectedItemId?.id)}
              status={item.status}
              date={item.dateApproved}
              price={item.allTotal}
              customerName={item.customer?.name as string}
              description={'quotation.'}
              unit={'quotation.'}
            />
          </TouchableOpacity>
        </View>
      )}

      <Modal
        style={styles.modalContainer}
        onBackdropPress={handleShowModalClose}
        isVisible={isModalVisible}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={styles.modalText}>
            ท่านได้นัดลูกค้าเข้าดูพื้นที่หน้างานโครงการนี้แล้วหรือยัง ?
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleYesResponse}>
            <Text style={styles.whiteText}> ดูหน้างานแล้ว</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleNoResponse}>
            <Text style={styles.whiteText}>ยังไม่ได้ดูหน้างาน</Text>
          </TouchableOpacity>

          <Text style={styles.RedText}>
            {' '}
            *จำเป็นต้องดูหน้างานก่อนเริ่มทำสัญญา
          </Text>
        </View>
      </Modal>
      {Platform.OS === 'android' ? (
        <Modal
          backdropOpacity={0.1}
          backdropTransitionOutTiming={100}
          style={styles.modalContainer2}
          isVisible={showModal}
          onBackdropPress={handleModalClose}>
          <TouchableNativeFeedback
            onPress={() => {
              setShowModal(false);
              navigation.navigate('EditContractOption', {id: item.id});
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
          style={styles.modalContainer2}
          isVisible={showModal}
          onBackdropPress={handleModalClose}>
          <TouchableOpacity
            onPress={() => {
              setShowModal(false); // Step 4

              navigation.navigate('EditContractOption', {id: selectedItemId});
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

  return (
    <>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center',backgroundColor: '#f5f5f5'}}>
        <FlatList
          data={sortedData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                height: height * 0.5,
              }}>
              <Text>ลูกค้าอนุมัติเอกสารก่อนเริ่มต้นทำสัญญา</Text>
            </View>
          }
          contentContainerStyle={sortedData?.length === 0 && {flex: 1}}
        />
      </View>
    </>
  );
};

export default ContractDashBoard;

const styles = StyleSheet.create({
  container: {
    padding: 30,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
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
  button: {
    backgroundColor: '#0073BA',
    paddingVertical: 12,
    paddingHorizontal: 32,
    height: 50,
    width: 250,
    borderRadius: 5,
    marginTop: 20,
  },
  whiteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    alignSelf: 'center',
  },
  RedText: {
    marginTop: 10,
    fontSize: 14,
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
});
