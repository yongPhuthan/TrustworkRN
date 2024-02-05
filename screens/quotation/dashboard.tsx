import {BACK_END_SERVER_URL} from '@env';
import messaging from '@react-native-firebase/messaging';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import React, {useContext, useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';

import CardDashBoard from '../../components/CardDashBoard';
import {useUser} from '../../providers/UserContext';
import * as stateAction from '../../redux/actions';
import {Store} from '../../redux/store';
import {CompanyUser, Quotation} from '../../types/docType';
import {DashboardScreenProps} from '../../types/navigationType';

import {
  FAB,
  Portal,
  PaperProvider,
  ActivityIndicator,
  Dialog,
  Appbar,
} from 'react-native-paper';
import {
  checkNotifications,
  requestNotifications,
} from 'react-native-permissions';

const Dashboard = ({navigation}: DashboardScreenProps) => {
  const [showModal, setShowModal] = useState(true);
  const [activeMenu, setActiveMenu] = React.useState('');
  const user = useUser();
  const {width, height} = Dimensions.get('window');
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const queryClient = useQueryClient();
  const [visible, setVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null) as any;
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [originalQuotationData, setOriginalQuotationData] = useState<
    Quotation[] | null
  >(null);
  const [state, setState] = React.useState({open: false});

  const onStateChange = ({open}) => setState({open});

  const {open} = state;

  const {dispatch}: any = useContext(Store);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const requestNotificationPermission = async () => {
    try {
      const {status} = await requestNotifications(['alert', 'badge', 'sound']);
      console.log('Notification permission request status:', status);
    } catch (error) {
      console.error('Error requesting notifications permission:', error);
    }
  };

  const checkNotificationPermission = async () => {
    const {status, settings} = await checkNotifications();
    console.log('Notification permission status:', status);
    console.log('Notification settings:', settings);
  };
  const [companyData, setCompanyData] = useState<CompanyUser | null>(null);
  const [quotationData, setQuotationData] = useState<Quotation[] | null>(null);
  const filterLabels = {
    ALL: 'ทั้งหมด',
    PENDING: 'รออนุมัติ',
    APPROVED: 'รอทำสัญญา',
  };

  const [filters, setFilters] = useState(['ALL', 'PENDING', 'APPROVED']);

  const handleShowModalClose = () => {
    setShowModal(false);
  };

  const handleNoResponse = () => {
    setModalVisible(false);
  };
  const [activeFilter, setActiveFilter] = useState('ALL');
  const filteredQuotationData = useMemo(() => {
    if (!originalQuotationData) return null;

    if (activeFilter === 'ALL') return originalQuotationData;

    return originalQuotationData.filter(
      (q: Quotation) => q.status === activeFilter,
    );
  }, [originalQuotationData, activeFilter]);

  const updateContractData = (filter: string) => {
    setActiveFilter(filter);
    if (quotationData) {
      let filteredData = quotationData;

      if (filter !== 'ALL') {
        filteredData = quotationData.filter(
          (quotation: Quotation) => quotation.status === filter,
          setQuotationData(filteredData),
        );
      } else {
        console.log('FILTER', filter);
        filteredData = quotationData;
        setQuotationData(filteredData);
      }
    }
  };
  const handleYesResponse = index => {
    if (companyData && quotationData && quotationData.length > 0) {
      navigation.navigate('ContractOptions', {
        id: quotationData[index].id,
        sellerId: companyData.id,
        allTotal: quotationData[index].allTotal,
        customerName: quotationData[index].customer?.name as string,
      });
    }
    setModalVisible(false);
  };

  async function fetchDashboardData() {
    if (!user || !user.email) {
      console.error('User or user email is not available');
      return;
    }
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/dashboard?email=${encodeURIComponent(
          user.email,
        )}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          const errorData = await response.json();
          if (
            errorData.message ===
            'Token has been revoked. Please reauthenticate.'
          ) {
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
      console.error('Error fetching dashboard data:', err);
      throw err;
    }
  }

  const removeQuotation = async (id: string) => {
    handleModalClose();
    setIsLoadingAction(true);
    if (!user || !user.email) {
      console.error('User or user email is not available');
      return;
    }
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/documents/removeQuotation?id=${encodeURIComponent(
          id,
        )}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          const errorData = await response.json();
          throw new Error(errorData.message);
        }
        throw new Error('Network response was not ok.');
      }
      if (response.ok) {
        queryClient.invalidateQueries(['dashboardData']);
        setIsLoadingAction(false);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      throw err;
    }
  };
  const confirmRemoveQuotation = (id, customer) => {
    setShowModal(false);
    Alert.alert(
      'ยืนยันลบใบเสนอราคา',
      `ลูกค้า ${customer}`,
      [
        {
          text: 'ยกเลิก',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'ตกลง', onPress: () => removeQuotation(id)},
      ],
      {cancelable: false},
    );
  };

  const {
    isLoading: isQuery,
    error,
    data,
    refetch,
  } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: fetchDashboardData,
    // enabled: !!user,
    onSuccess: data => {
      setCompanyData(data[0]);
      setQuotationData(data[1]);
      setOriginalQuotationData(data[1]);
      dispatch(stateAction.code_company(data[0].code));
    },
  });
  useEffect(() => {
    requestNotificationPermission();
  }, []);
  useEffect(() => {
    if (user) {
      const unsubscribe = messaging().setBackgroundMessageHandler(
        async remoteMessage => {
          console.log('Message handled in the background!', remoteMessage);
        },
      );

      return unsubscribe;
    }
  }, [user]);

  if (isQuery) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={'large'} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Error fetching dashboard data</Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }
  const handleCreateContract = index => {
    if (companyData && quotationData && quotationData.length > 0) {
      navigation.navigate('ContractOptions', {
        id: quotationData[index].id,
        sellerId: companyData.id,
        allTotal: quotationData[index].allTotal,
        customerName: quotationData[index].customer?.name as string,
      });
    }
    setModalVisible(false);
  };

  const handleModal = (item, index) => {
    setSelectedItem(item);
    setSelectedIndex(index);
    setShowModal(false);
    setModalVisible(true);
  };
  const handleModalOpen = (item, index) => {
    console.log('item', item);
    console.log('status', selectedItem?.status);

    console.log('index', index);
    setSelectedItem(item);
    setSelectedIndex(index);
    // handleModal(item, index);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setSelectedItem(null);
    setSelectedIndex(null);
    setShowModal(false);
  };
  const handleFilterClick = filter => {
    setActiveFilter(filter);
  };
  const editQuotation = async (services, customer, quotation) => {
    setIsLoadingAction(true);
    dispatch(stateAction.get_companyID(data[0].id));
    setIsLoadingAction(false);

    navigation.navigate('EditQuotation', {
      quotation,
      company: data[0],
      services,
    });
  };
  const FilterButton = ({filter, isActive, onPress}) => {
    const displayText = filterLabels[filter] || filter;
    console.log('companyUser', companyData);
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive ? styles.activeFilter : null]}
        onPress={onPress}>
        <Text style={isActive ? {color: 'white'} : null}>{displayText}</Text>
      </TouchableOpacity>
    );
  };
  const renderItem = ({item, index}) => (
    <>
      {isLoadingAction ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <View style={{marginTop: 10}}>
          <CardDashBoard
            status={item.status}
            date={item.dateOffer}
            end={item.dateEnd}
            price={item.allTotal}
            customerName={item.customer?.name as string}
            // onCardPress={()=>handleModal(item, index)}
            onCardPress={() => handleModalOpen(item, index)}
          />
        </View>
      )}

      {selectedIndex === index &&
        (Platform.OS === 'android' ? (
          <Modal
            backdropOpacity={0.1}
            backdropTransitionOutTiming={100}
            style={styles.modalContainer}
            isVisible={showModal}
            onBackdropPress={handleModalClose}>
            <Text style={styles.title}>
              ลูกค้า {selectedItem?.customer?.name}
            </Text>
            <View
              style={{
                width: '100%',
                alignSelf: 'center',
                borderBottomWidth: 0.5,
                borderBottomColor: '#cccccc',
              }}></View>
            <Pressable
              onPress={() => {
                setShowModal(false);
                navigation.navigate('DocViewScreen', {id: item.id});
              }}>
              <Text style={styles.ModalButtonText}>ดูตัวอย่าง</Text>
            </Pressable>
            <View
              style={{
                width: '100%',
                alignSelf: 'center',
                borderBottomWidth: 0.5,
                borderBottomColor: '#cccccc',
              }}></View>
            {selectedItem?.status === 'PENDING' && (
              <>
                <Pressable
                  onPress={() => {
                    setShowModal(false);
                    editQuotation(
                      selectedItem.services,
                      selectedItem.customer,
                      selectedItem,
                    );
                  }}>
                  <Text style={styles.ModalButtonText}>แก้ไขใบเสนอราคา</Text>
                </Pressable>
                <View
                  style={{
                    width: '100%',
                    alignSelf: 'center',
                    borderBottomWidth: 0.5,
                    borderBottomColor: '#cccccc',
                  }}></View>
                <Pressable
                  onPress={() =>
                    confirmRemoveQuotation(
                      item.id,
                      selectedItem?.customer?.name,
                    )
                  }>
                  <Text style={styles.deleteButtonText}>ลบใบเสนอราคา</Text>
                </Pressable>
                {selectedItem?.status === 'APPROVED' && (
                  <>
                    <View
                      style={{
                        width: '100%',
                        alignSelf: 'center',
                        borderBottomWidth: 0.5,
                        borderBottomColor: '#cccccc',
                      }}></View>
                    <Pressable
                      onPress={() => {
                        handleModal(item, index);
                      }}>
                      <Text style={styles.ModalButtonText}>เริ่มทำสัญญา</Text>
                    </Pressable>
                  </>
                )}

                <View
                  style={{
                    width: '100%',
                    alignSelf: 'center',
                    borderBottomWidth: 0.5,
                    borderBottomColor: '#cccccc',
                  }}></View>
              </>
            )}
          </Modal>
        ) : (
          <Modal
            style={styles.modalContainer}
            isVisible={showModal}
            onBackdropPress={() => setShowModal(false)}

            // onBackdropPress={handleModalClose}
          >
            <Text style={styles.title}>ลูกค้า {item.customer?.name}</Text>
            <View
              style={{
                width: '100%',
                alignSelf: 'center',
                borderBottomWidth: 0.5,
                borderBottomColor: '#cccccc',
              }}></View>
            <Pressable
              onPress={() => {
                setShowModal(false);
                
                navigation.navigate('DocViewScreen', {id: item.id});
              }}>
              <Text style={styles.ModalButtonText}>ดูตัวอย่าง</Text>
            </Pressable>
            {selectedItem?.status === 'APPROVED' && (
                  <>
                    <View
                      style={{
                        width: '100%',
                        alignSelf: 'center',
                        borderBottomWidth: 0.5,
                        borderBottomColor: '#cccccc',
                      }}></View>
                    <Pressable
                      onPress={() => {
                        handleModal(item, index);
                      }}>
                      <Text style={styles.ModalButtonText}>เริ่มทำสัญญา</Text>
                    </Pressable>
                  </>
                )}
            <View
              style={{
                width: '100%',
                alignSelf: 'center',
                borderBottomWidth: 0.5,
                borderBottomColor: '#cccccc',
              }}></View>
            {selectedItem?.status === 'PENDING' && (
              <>
                <Pressable
                  onPress={() => {
                    setShowModal(false);
                    editQuotation(
                      selectedItem.services,
                      selectedItem.customer,
                      selectedItem,
                    );
                  }}>
                  <Text style={styles.ModalButtonText}>แก้ไขใบเสนอราคา</Text>
                </Pressable>
                <View
                  style={{
                    width: '100%',
                    alignSelf: 'center',
                    borderBottomWidth: 0.5,
                    borderBottomColor: '#cccccc',
                  }}></View>
                {selectedItem?.status === 'PENDING' && (
                  <>
                    <Pressable
                      onPress={() =>
                        confirmRemoveQuotation(
                          item.id,
                          selectedItem?.customer?.name,
                        )
                      }>
                      <Text style={styles.deleteButtonText}>ลบใบเสนอราคา</Text>
                    </Pressable>
                    <View
                      style={{
                        width: '100%',
                        alignSelf: 'center',
                        borderBottomWidth: 0.5,
                        borderBottomColor: '#cccccc',
                      }}></View>
                  </>
                )}
                  
              </>
            )}
          </Modal>
        ))}
    </>
  );

  const createNewQuotation = () => {
    if (!companyData) {
      navigation.navigate('CreateCompanyScreen');
    }
    // navigation.navigate('GalleryScreen', {code: companyData?.code});
    navigation.navigate('CreateQuotation');
  };
  return (
    <>
      <PaperProvider>
        <Portal>
          <View>
            <Appbar.Header
              // elevated
              mode="center-aligned"
              style={{
                backgroundColor: 'white',
              }}>
              <Appbar.Action
                icon={'menu'}
                onPress={() => {
                  navigation.openDrawer();
                }}
              />
              <Appbar.Content
                title={
                  activeFilter == 'ALL'
                    ? 'รายการทั้งหมด'
                    : activeFilter === 'PENDING'
                    ? 'รายการรออนุมัติ'
                    : 'รายการรอทำสัญญา'
                }
                titleStyle={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  fontFamily: 'Sukhumvit Set Bold',
                }}
              />
              <Appbar.Action
                icon="bell-outline"
                // onPress={() => {
                //   navigation.navigate('SearchScreen');
                // }}
              />
            </Appbar.Header>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
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
          </View>
          {companyData && (
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
          )}

          <FAB.Group
            open={open}
            visible
            color="white"
            fabStyle={{
              backgroundColor: '#1b52a7',
            }}
            icon={open ? 'minus' : 'plus'}
            actions={[
              {
                icon: 'plus',
                label: 'สร้างใบเสนอราคา',

                onPress: () => createNewQuotation(),
              },
              {
                icon: 'file-document-edit-outline',
                label: 'ทำสัญญา',
                onPress: () => setActiveFilter('APPROVED'),
              },
            ]}
            onStateChange={onStateChange}
            onPress={() => {
              if (open) {
                // do something if the speed dial is open
              }
            }}
          />

          {/* modal popup */}
          <Dialog
        style={styles.modalContainer}
        // backdropTransitionOutTiming={100}
        onDismiss={handleNoResponse}
        visible={isModalVisible}>
        <Dialog.Content>
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={styles.selectedQuotationText}>ทำสัญญากับลูกค้า</Text>
            <Text style={styles.selectedQuotationText}>
              {selectedItem?.customer?.name}
            </Text>
            <Text style={styles.modalText}>
              คุณได้นัดเข้าดูพื้นที่หน้างานโครงการนี้เรียบร้อยแล้วหรือไม่ ?
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleCreateContract(selectedIndex)}>
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
        </Dialog.Content>
      </Dialog>
        </Portal>
      </PaperProvider>
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
    backgroundColor: '#1b52a7',
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
    borderRadius: 5,
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
  ModalButtonText: {
    fontSize: 20,
    borderBottomWidth: 1,
    borderColor: 'white',
    paddingBottom: 10,
    paddingTop: 10,
    fontWeight: 'bold',

    // fontWeight: 'bold',
    fontFamily: 'Sukhumvit set',
  },
  deleteButtonText: {
    fontSize: 18,
    borderBottomWidth: 1,
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
    // backgroundColor:'#1b72e8',
    backgroundColor: '#1f303cff',
    color: 'white',
  },
  title: {
    marginBottom: 20,
    fontSize: 14,
    fontFamily: 'Sukhumvit Set Bold',
    color: 'gray',
  },
  whiteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    alignSelf: 'center',
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
