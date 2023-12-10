import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  Platform,
  Pressable,
} from 'react-native';
import React, {useState, useContext, useEffect, useMemo} from 'react';
import CardDashBoard from '../../components/CardDashBoard';
import {HOST_URL, BACK_END_SERVER_URL, PROJECT_FIREBASE} from '@env';
import {Store} from '../../redux/store';
import Modal from 'react-native-modal';
import firebase, {
  testFirebaseConnection,
  testFunctionsConnection,
} from '../../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Header as HeaderRNE, HeaderProps, Icon, FAB} from '@rneui/themed';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faBell,
  faCog,
  faCogs,
  faPlus,
  faSheetPlastic,
  faUserCog,
} from '@fortawesome/free-solid-svg-icons';
import {useQuery} from '@tanstack/react-query';
import Lottie from 'lottie-react-native';
import messaging from '@react-native-firebase/messaging';
import {User, Quotation, CompanyUser} from '../../types/docType';
import * as stateAction from '../../redux/actions';
import {DashboardScreenProps} from '../../types/navigationType';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {useUser} from '../../providers/UserContext';

const Dashboard = ({navigation}: DashboardScreenProps) => {
  const [showModal, setShowModal] = useState(false);
  const user = useUser();
  const {width, height} = Dimensions.get('window');
  const [email, setEmail] = useState<String>('');
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [token, setToken] = useState<String>('');
  const [selectedItem, setSelectedItem] = useState(null) as any;
  const [originalQuotationData, setOriginalQuotationData] = useState<
    Quotation[] | null
  >(null);

  const {
    state: {isEmulator, client_name, client_address, client_tax, client_tel},
    dispatch,
  }: any = useContext(Store);

  const [companyData, setCompanyData] = useState<CompanyUser | null>(null);
  const [quotationData, setQuotationData] = useState<Quotation[] | null>(null);
  const slideAnim = useState(new Animated.Value(-100))[0];
  const [filters, setFilters] = useState([
    'ทั้งหมด',
    'รออนุมัติ',
    'อนุมัติแล้ว',
    'สัญญา',
    'กำลังทำงาน',
  ]);
  const [activeFilter, setActiveFilter] = useState('ทั้งหมด');
  const filteredQuotationData = useMemo(() => {
    if (!originalQuotationData) return null;

    if (activeFilter === 'ทั้งหมด') return originalQuotationData;

    return originalQuotationData.filter(q => q.status === activeFilter);
  }, [originalQuotationData, activeFilter]);
  async function fetchDashboardData() {
    if (!user || !user.email) {
      console.error('User or user email is not available');
      return;
    }
  
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/dashboard?email=${encodeURIComponent(user.email)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (!response.ok) {
        if (response.status === 401) {
          const errorData = await response.json();
          if (errorData.message === 'Token has been revoked. Please reauthenticate.') {
            // Decide how you want to handle reauthentication
            // Possibly recall fetchDashboardData or handle reauthentication differently
          }
          throw new Error(errorData.message);
        }
        throw new Error('Network response was not ok.');
      }
  
      const data = await response.json();
      if (data && Array.isArray(data[1])) {
        data[1].sort((a, b) => {
          const dateA = new Date(a.dateOffer);
          const dateB = new Date(b.dateOffer);
          return dateB.getTime() - dateA.getTime();
        });
      }
  
      console.log('data after', data);
      return data;
    } catch (err) {
      // Handle or throw the error depending on your error handling strategy
      console.error('Error fetching dashboard data:', err);
      throw err;
    }
  }
  

  const updateContractData = (filter: string) => {
    setActiveFilter(filter);

    if (quotationData) {
      let filteredData = quotationData;

      if (filter !== 'ALL') {
        filteredData = quotationData.filter(
          (quotation: Quotation) => quotation.status === filter,
        );
      }

      setQuotationData(filteredData);
    }
  };

  const { isLoading, error, data } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: fetchDashboardData,
    enabled: !!user, 
    onSuccess: (data) => {
      console.log('success', data);
      setCompanyData(data[0]);
      setQuotationData(data[1]);
      setOriginalQuotationData(data[1]);
      dispatch(stateAction.code_company(data[0].code));
    },
  });
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    if (user) {
      if (!companyData) {
        navigation.navigate('CreateCompanyScreen');
      }
    } else {
      navigation.navigate('FirstAppScreen');
    }
  }
  const handleModal = () => {
    console.log('SHOW');
    setShowModal(true);
  };
  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleModalOpen = item => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleFilterClick = filter => {
    setActiveFilter(filter);
  };
  // versionแรก ยังไม่มีการแก้ไข

  const editQuotation = async (services, customer, quotation) => {
    setIsLoadingAction(true);
    await dispatch(stateAction.reset_service_list());
    await dispatch(stateAction.reset_contract());
    await dispatch(stateAction.reset_audit());
    await dispatch(stateAction.client_name(''));
    await dispatch(stateAction.client_address(''));
    await dispatch(stateAction.client_tel(''));
    await dispatch(stateAction.client_tax(''));
    await dispatch(stateAction.client_name(customer.name));
    await dispatch(stateAction.client_address(customer.address));
    await dispatch(stateAction.client_tel(customer.mobilePhone));
    await dispatch(stateAction.client_tax(customer.companyId));
    await dispatch(stateAction.service_list(services[0]));
    dispatch(stateAction.get_companyID(data[0].id));
    setIsLoadingAction(false);

    navigation.navigate('EditQuotation', {quotation, company: data[0]});
  };

  const FilterButton = ({filter, isActive, onPress}) => {
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive ? styles.activeFilter : null]}
        onPress={onPress}>
        <Text style={isActive ? {color: 'white'} : null}>{filter}</Text>
      </TouchableOpacity>
    );
  };
  const renderItem = ({item}) => (
    <>
      <View style={{marginTop: 10}}>
        <CardDashBoard
          status={item.status}
          date={item.dateOffer}
          end={item.dateEnd}
          price={item.allTotal}
          customerName={item.customer?.name as string}
          description={'quotation.'}
          unit={'quotation.'}
          // onCardPress={handleModal}
          onCardPress={() => handleModalOpen(item)}
        />
      </View>

      {Platform.OS === 'android' ? (
        <Modal
          backdropOpacity={0.1}
          backdropTransitionOutTiming={100}
          style={styles.modalContainer}
          isVisible={showModal}
          onBackdropPress={handleModalClose}>
          {/* <Pressable
            onPress={() => {
              setShowModal(false);
              editQuotation(item.services, item.customer, item);
            }}>
            <Text style={styles.closeButtonText}>แก้ไขเอกสาร</Text>
          </Pressable>
          <View
            style={{
              width: '100%',
              alignSelf: 'center',
              borderBottomWidth: 1,
              borderBottomColor: '#cccccc',
            }}></View> */}
          <Pressable
            onPress={() => {
              setShowModal(false);
              navigation.navigate('DocViewScreen', {id: item.id});
            }}>
            <Text style={styles.closeButtonText}>ดูตัวอย่าง</Text>
          </Pressable>
          <View
            style={{
              width: '100%',
              alignSelf: 'center',
              borderBottomWidth: 1,
              borderBottomColor: '#cccccc',
            }}></View>
          <Pressable
            onPress={() => {
              // setShowModal(false); // Step 4
            }}>
            <Text style={styles.deleteButtonText}>ลบเอกสาร</Text>
          </Pressable>
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
          onBackdropPress={() => setShowModal(false)}

          // onBackdropPress={handleModalClose}
        >
          {/* <TouchableOpacity
            onPress={() => {
              setShowModal(false);
              editQuotation(
                selectedItem?.services,
                selectedItem?.customer,
                selectedItem,
              );
            }}>
            <Text style={styles.closeButtonText}>แก้ไขเอกสาร</Text>
          </TouchableOpacity>
          <View
            style={{
              width: '100%',
              alignSelf: 'center',
              borderBottomWidth: 1,
              borderBottomColor: '#cccccc',
            }}></View> */}
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
    // navigation.navigate('GalleryScreen', {code: companyData?.code});
    navigation.navigate('CreateQuotation');
  };

  return (
    <>
      <View>
        <HeaderRNE
          containerStyle={{
            backgroundColor: '#ffffffff',
            borderBottomColor: 'white',
          }}
          leftComponent={
            <Text
              style={{
                color: '#000000',
                fontSize: 18,
                fontWeight: 'bold',
                width: 100,
              }}
              onPress={() => {}}>
              Saletrusth
            </Text>
          }
          rightComponent={
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('SettingsScreen');
              }}>
              <FontAwesomeIcon icon={faCog} color="#1f303cff" size={22} />
            </TouchableOpacity>
          }
        />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          // data={filteredData}

          data={filters}
          renderItem={({item}) => (
            <FilterButton
              filter={item}
              isActive={item === activeFilter}
              onPress={() => {
                updateContractData(item);
              }}
            />
          )}
          keyExtractor={item => item}
        />
        {/* <View style={{height: 0.5, backgroundColor: 'gray', width: '100%'}} /> */}
      </View>
      {isLoadingAction ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          {/* Replace this with your preferred loading indicator */}
          <ActivityIndicator size="large" />
        </View>
      ) : (
        companyData &&
        quotationData && (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#f5f5f5',
            }}>
            <FlatList
              data={filteredQuotationData}
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
          </View>
        )
      )}

      <FAB
        icon={{name: 'add', color: 'white'}}
        color="#012b20"
        // color="#0073BA"
        style={{
          backgroundColor: '#1f303cff',
          position: 'absolute',
          right: 16,
          bottom: 25,
        }}
        onPress={() => createNewQuotation()}
      />
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
    backgroundColor: '#012b20',
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
    // backgroundColor: '#0050f0',
    backgroundColor: '#012b20',

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
  filterButton: {
    padding: 10,
    marginHorizontal: 5,
    marginVertical: 20,
    backgroundColor: '#E5E5E5',
    borderRadius: 8,
    height: 40,
  },
  activeFilter: {
    backgroundColor: '#1f303cff',
    color: 'white',
  },
});
