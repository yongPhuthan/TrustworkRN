import messaging from '@react-native-firebase/messaging';
import {DrawerActions} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';
import {
  QuotationStatus,
  FilterLabels,
  QuotationStatusKey,
} from '../../models/QuotationStatus';
import firebase from '../../firebase';
import useFetchDashboard from '../../hooks/submit/dashboard/useFetchDashboard'; // adjust the path as needed

import React, {useContext, useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
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
  ActivityIndicator,
  Appbar,
  Dialog,
  Divider,
  List,
  PaperProvider,
  Portal,
} from 'react-native-paper';
import {
  checkNotifications,
  requestNotifications,
} from 'react-native-permissions';
type FilterButtonProps = {
  filter: QuotationStatusKey;
  isActive: boolean;
  onPress: () => void;
};
const DashboardSubmit = ({navigation}: DashboardScreenProps) => {
  const [showModal, setShowModal] = useState(true);
  const user = useUser();
  const {width, height} = Dimensions.get('window');
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const queryClient = useQueryClient();
  const email = user?.email;
  const [visible, setVisible] = useState(false);
  const [isModalSignContract, setIsModalSignContract] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null) as any;
  const [selectedIndex, setSelectedIndex] = useState(null) as any;
  const [originalDashboardData, setOriginalQuotationData] = useState<
    Quotation[] | null
  >(null);
  const [state, setState] = React.useState({open: false});
  const {data, isLoading, isError, error} = useFetchDashboard();
  console.log('data SUbmit', data);
  const onStateChange = ({open}: any) => setState({open});

  const {open} = state;

  const {dispatch}: any = useContext(Store);

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
  const filtersToShow: QuotationStatusKey[] = [
    QuotationStatus.ALL,
    QuotationStatus.ONPROCESS,
    QuotationStatus.WAITING_FOR_CUSTOMER_APPROVAL,
    QuotationStatus.CUSTOMER_APPROVAL_SOMECOMPLETED,
    QuotationStatus.CUSTOMER_NOTAPPROVAL,
    QuotationStatus.CUSTOMER_APPROVAL_ALLCOMPLETED,

  ];
  const [companyData, setCompanyData] = useState<CompanyUser | null>(null);
  const [quotationData, setQuotationData] = useState<Quotation[] | null>(null);

  const approvedQuotation = useMemo(() => {
    return quotationData?.filter(
      quotation => quotation.status === QuotationStatus.APPROVED,
    );
  }, [quotationData]);


  const handleNoResponse = () => {
    setIsModalSignContract(false);
  };

  const [activeFilter, setActiveFilter] = useState<
    keyof typeof QuotationStatus
  >(QuotationStatus.ALL);
  const filteredDashboardData = useMemo(() => {
    if (!originalDashboardData) return null;

    if (activeFilter === QuotationStatus.ALL) return originalDashboardData;

    return originalDashboardData.filter(
      (q: Quotation) => q.status === activeFilter,
    );
  }, [originalDashboardData, activeFilter]);

  const updateContractData = (filter: keyof typeof QuotationStatus) => {
    setActiveFilter(filter);
    if (quotationData) {
      let filteredData = quotationData;

      if (filter !== QuotationStatus.ALL) {
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
  const handleSelectWork = (quotationId: string) => {
    navigation.navigate('SelectWorks', {quotationId});
  };

  useEffect(() => {
    if (data) {
      setCompanyData(data[0]);
      setQuotationData(data[1]);
      setOriginalQuotationData(data[1]);
      dispatch(stateAction.code_company(data[0].code));
      if (user) {
        if (data[0] === null) {
          navigation.navigate('CreateCompanyScreen');
        }
      }
    }
  }, [data]);
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

  if (isLoading || isLoadingAction) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={'large'} />
      </View>
    );
  }

  if (error instanceof Error) {
    {
      Alert.alert('seesion หมดอายุ', 'ลงทะเบียนเข้าใช้งานใหม่อีกครั้ง', [
        {
          text: 'ตกลง',
          onPress: async () => {
            await firebase
              .auth()
              .signOut()
              .then(() => {
                navigation.reset({
                  index: 0,
                  routes: [{name: 'FirstAppScreen'}],
                });
              })
              .catch(signOutError => {
                console.error('Sign out error: ', signOutError);
              });
          },
        },
      ]);
    }
  }

  const handleCreateContract = (index: number) => {
    if (companyData && quotationData && quotationData.length > 0) {
      console.log('quotationSelected', selectedItem);
      navigation.navigate('ContractOptions', {
        id: selectedItem.id,
        sellerId: selectedItem.id,
        allTotal: selectedItem.allTotal,
        customerName: selectedItem.customer?.name as string,
      });
    }
    setIsModalSignContract(false);
  };

  const handleSignContractModal = (item: Quotation, index: number) => {
    setSelectedItem(item);
    setSelectedIndex(index);
    setShowModal(false);
    setIsModalSignContract(true);
  };
  const handleModalOpen = (item: Quotation, index: number) => {
    setSelectedItem(item);
    setSelectedIndex(index);
    // handleModal(item, index);
    setShowModal(true);
  };

  const handleModalClose = () => {
    // setSelectedItem(null);
    setSelectedIndex(null);
    setShowModal(false);
  };

  const FilterButton = ({filter, isActive, onPress}: FilterButtonProps) => {
    const displayText = FilterLabels[filter]; // This is now safely typed
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive ? styles.activeFilter : null]}
        onPress={onPress}>
        <Text style={isActive ? {color: 'white'} : null}>{displayText}</Text>
      </TouchableOpacity>
    );
  };
  const renderItem = ({item, index}: any) => (
    <>
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

      {selectedIndex === index && (
        <Portal>
          <PaperProvider>
            <Modal
              backdropOpacity={0.1}
              backdropTransitionOutTiming={100}
              onBackdropPress={handleModalClose}
              isVisible={showModal}
              style={styles.modalContainer}
              onDismiss={handleModalClose}>
              <List.Section
                style={{
                  width: '100%',
                }}>
                <List.Subheader
                  style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontFamily: 'Sukhumvit Set Bold',
                    color: 'gray',
                  }}>
                  {item.customer?.name}
                </List.Subheader>
                <Divider />
                {selectedItem?.status === QuotationStatus.ONPROCESS && (
                  <>
                    <List.Item
                      onPress={() => {
                        handleModalClose();

                        handleSelectWork(selectedItem.id);
                      }}
                      centered={true}
                      title="แจ้งส่งงาน"
                      titleStyle={{textAlign: 'center', color: 'black'}} // จัดให้ข้อความอยู่ตรงกลาง
                    />
                    <Divider />
                  </>
                )}
                <List.Item
                  onPress={() => {
                    handleModalClose();
                    navigation.navigate('DocViewScreen', {id: item.id});
                  }}
                  centered={true}
                  title="พรีวิวเอกสาร"
                  titleStyle={{textAlign: 'center', color: 'black'}} // จัดให้ข้อความอยู่ตรงกลาง
                />

                <Divider />
              </List.Section>
            </Modal>
          </PaperProvider>
        </Portal>
      )}
    </>
  );

  return (
    <>
      <PaperProvider>
        <Portal>
          <Appbar.Header
            // elevated
            mode="center-aligned"
            style={{
              backgroundColor: 'white',
            }}>
            <Appbar.Action
              icon={'menu'}
              onPress={() => {
                navigation.dispatch(DrawerActions.openDrawer());
              }}
            />
            <Appbar.Content
              title={
                activeFilter == QuotationStatus.ALL
                  ? 'รายการทั้งหมด'
                  : activeFilter === QuotationStatus.ONPROCESS
                  ? 'กำลังทำงาน'
                  : activeFilter === QuotationStatus.WAITING_FOR_CUSTOMER_APPROVAL
                  ? 'รอตรวจงาน'
                  : activeFilter === QuotationStatus.CUSTOMER_APPROVAL_SOMECOMPLETED
                  ? 'รายการที่ต้องแก้ไขบางส่วน'
                  : activeFilter ===
                    QuotationStatus.CUSTOMER_APPROVAL_ALLCOMPLETED
                  ? 'รายการที่แล้วเสร็จทั้งหมด'
                  : activeFilter === QuotationStatus.REJECTED || activeFilter === QuotationStatus.CUSTOMER_NOTAPPROVAL
                  ? 'รายการที่ต้องแก้ไขทั้งหมด'
                  : ''
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
          {isLoadingAction ? (
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <>
              <View>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={filtersToShow}
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
                    data={filteredDashboardData}
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
                          ลูกค้าอนุมัติสัญญาก่อนเริ่มแจ้งส่งงาน
                        </Text>
                      </View>
                    }
                    contentContainerStyle={
                      quotationData?.length === 0 && {flex: 1}
                    }
                  />
                </View>
              )}
            </>
          )}

          {/* modal popup */}
          <Dialog
            style={styles.modalContainer}
            // backdropTransitionOutTiming={100}
            onDismiss={handleNoResponse}
            visible={isModalSignContract}>
            <Dialog.Content>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text>เริ่มทำสัญญากับลูกค้า</Text>
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
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleNoResponse}>
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

export default DashboardSubmit;
const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    // padding: 30,
  },
  fabStyle: {
    bottom: height * 0.1,
    right: width * 0.05,
    position: 'absolute',
    backgroundColor: '#1b52a7',
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
