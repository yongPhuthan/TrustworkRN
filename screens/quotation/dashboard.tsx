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
import {HOST_URL, PROJECT_NAME, PROJECT_FIREBASE} from '@env';
import {Store} from '../../redux/store';
import Modal from 'react-native-modal';
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

const Dashboard = ({navigation}: DashboardScreenProps) => {
  const [showModal, setShowModal] = useState(false);
  const {width, height} = Dimensions.get('window');
  const [email, setEmail] = useState('');
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  const {
    state: {isEmulator},
    dispatch,
  }: any = useContext(Store);

  const [companyData, setCompanyData] = useState<CompanyUser | null>(null);
  const [quotationData, setQuotationData] = useState<Quotation[] | null>(null);
  const slideAnim = useState(new Animated.Value(-100))[0];
  const [filters, setFilters] = useState([
    'Filter 1',
    'Filter 2',
    'Filter 3',
    'Filter 4',
    // Add more as needed
  ]);
  const [activeFilter, setActiveFilter] = useState('Filter 1');
  const getTokenAndEmail = async () => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      const email = currentUser.email;
      setEmail(email);
      return {token, email};
    } else {
      // User is not logged in
      return null;
    }
  };
  const fetchDashboardData = async () => {
    const url = __DEV__
      ? `http://${HOST_URL}:5001/${PROJECT_FIREBASE}/asia-southeast1/queryDashBoard`
      : `https://asia-southeast1-${PROJECT_FIREBASE}.cloudfunctions.net/queryDashBoard`;

    const user = await getTokenAndEmail();
    if (user) {
      console.log('user5', user);
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
        <ActivityIndicator />
      </View>
    );
  }
  if (error) {
    console.log('error', error);
  }
  const handleModal = () => {
    console.log('SHOW');
    setShowModal(true);
  };
  const handleModalClose = () => {
    setShowModal(false);
  };

  const editQuotation = async (services, customer, quotation) => {
    const allAuditData = services.reduce((acc, service) => {
      const auditDataForService = service.audits.map(audit => audit.AuditData);
      return acc.concat(auditDataForService);
    }, []);
    console.log('SERVICE0', services[0]);
    await dispatch(stateAction.reset_service_list());
    await dispatch(stateAction.reset_contract());
    await dispatch(stateAction.reset_audit());
    await dispatch(stateAction.client_name(''));
    await dispatch(stateAction.client_address(''));
    await dispatch(stateAction.client_tel(''));
    await dispatch(stateAction.client_tax(''));

    await dispatch(stateAction.client_name(customer.name));
    await dispatch(stateAction.client_address(customer.address));
    await dispatch(stateAction.client_tel(customer.tel));
    await dispatch(stateAction.client_tax(customer.tax));
    await dispatch(stateAction.service_list(services[0]));
    await dispatch(stateAction.existing_audit_array(allAuditData));
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
      <View>
        <CardDashBoard
          status={item.status}
          date={item.dateOffer}
          end={item.dateEnd}
          price={item.allTotal}
          customerName={item.customer?.name as string}
          description={'quotation.'}
          unit={'quotation.'}
          onCardPress={handleModal}
        />
      </View>

      {Platform.OS === 'android' ? (
        <Modal
          backdropOpacity={0.1}
          backdropTransitionOutTiming={100}
          style={styles.modalContainer}
          isVisible={showModal}
          onBackdropPress={handleModalClose}>
          <Pressable
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
            }}></View>
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
          onBackdropPress={handleModalClose}>
          <TouchableOpacity
            onPress={() => {
              setShowModal(false);
              editQuotation(item.services, item.customer, item);
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
    navigation.navigate('GalleryScreen', {code: companyData?.code});
    // navigation.navigate('CreateQuotation');
  };

  console.log('COMPANY DATA', companyData)
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
                color: '#042d60',
                fontSize: 18,
                fontWeight: 'bold',
                width: 100,
              }}
              onPress={() => {}}>
              Trustwork
            </Text>
          }
          rightComponent={
            <TouchableOpacity onPress={() => {     navigation.navigate('SettingsScreen');
            }}>
              <FontAwesomeIcon icon={faCog} color="#1f303cff" size={22} />
            </TouchableOpacity>
          }
        />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          renderItem={({item}) => (
            <FilterButton
              filter={item}
              isActive={item === activeFilter}
              onPress={() => {
                setActiveFilter(item);
              }}
            />
          )}
          keyExtractor={item => item}
        />
        {/* <View style={{height: 0.5, backgroundColor: 'gray', width: '100%'}} /> */}
      </View>

      {companyData && quotationData && (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f5f5f5',
          }}>
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

        </View>
      )}
      <FAB
        icon={{name: 'add', color: 'white'}}
        color="#1f303cff"
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
    backgroundColor: '#591dc4ff',
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
