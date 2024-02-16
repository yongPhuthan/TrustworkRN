import { BACK_END_SERVER_URL } from '@env';
import messaging from '@react-native-firebase/messaging';
import { DrawerActions } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Modal from 'react-native-modal';
import { FilterButton } from '../../components/ui/Dashboard/FilterButton'; // Adjust the import path as necessary
import firebase from '../../firebase';
import { useActiveFilter } from '../../hooks/dashboard/useActiveFilter';
import { useFilteredData } from '../../hooks/dashboard/useFilteredData';
import {
  QuotationStatus,
  QuotationStatusKey
} from '../../models/QuotationStatus';

import CardDashBoard from '../../components/CardDashBoard';
import { useUser } from '../../providers/UserContext';
import * as stateAction from '../../redux/actions';
import { Store } from '../../redux/store';
import { CompanyUser, Quotation } from '../../types/docType';
import { DashboardScreenProps } from '../../types/navigationType';

import {
  ActivityIndicator,
  Appbar,
  Dialog,
  Divider,
  List,
  PaperProvider,
  Portal
} from 'react-native-paper';
import {
  requestNotifications
} from 'react-native-permissions';

const DashboardContract = ({navigation}: DashboardScreenProps) => {
  const [showModal, setShowModal] = useState(true);
  const user = useUser();
  const {width, height} = Dimensions.get('window');
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const email = user?.email;

  const [isModalSignContract, setIsModalSignContract] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null) as any;
  const [selectedIndex, setSelectedIndex] = useState(null) as any;
  const [originalData, setOriginalData] = useState<Quotation[] | null>(null);
  const {activeFilter, updateActiveFilter} = useActiveFilter();

  const filteredData = useFilteredData(originalData, activeFilter);

  const {dispatch}: any = useContext(Store);

  const requestNotificationPermission = async () => {
    try {
      const {status} = await requestNotifications(['alert', 'badge', 'sound']);
      console.log('Notification permission request status:', status);
    } catch (error) {
      console.error('Error requesting notifications permission:', error);
    }
  };

  const [companyData, setCompanyData] = useState<CompanyUser | null>(null);
  const [quotationData, setQuotationData] = useState<Quotation[] | null>(null);

  const approvedQuotation = useMemo(() => {
    return quotationData?.filter(
      quotation => quotation.status === QuotationStatus.APPROVED,
    );
  }, [quotationData]);

  const filtersToShow: QuotationStatusKey[] = [
    QuotationStatus.ALL,
    QuotationStatus.APPROVED,
    QuotationStatus.CONTRACT,
    QuotationStatus.ONPROCESS,
  ];
  const handleNoResponse = () => {
    setIsModalSignContract(false);
  };

  async function fetchDashboardContract() {
    if (!user || !email) {
      console.error('User or user email is not available');
      return;
    }
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/dashboard/contractDashboard?email=${encodeURIComponent(
          email,
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
        throw new Error(`Network response was not ok., ${response.status}`);
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

  const {
    isLoading: isQuery,
    error,
    data,
    refetch,
  } = useQuery({
    queryKey: ['dashboardContract', email],
    queryFn: fetchDashboardContract,
    // enabled: !!user,
    onSuccess: data => {
      setCompanyData(data[0]);
      setQuotationData(data[1]);
      setOriginalData(data[1]);
      dispatch(stateAction.code_company(data[0].code));
      if (user) {
        if (data[0] === null) {
          navigation.navigate('CreateCompanyScreen');
        }
      }
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

  if (isQuery || isLoadingAction) {
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
          onPress: () => {
            firebase
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
                {selectedItem?.status === QuotationStatus.APPROVED && (
                  <>
                    <List.Item
                      onPress={() => {
                        handleSignContractModal(selectedItem, index);
                      }}
                      centered={true}
                      title="เริ่มทำสัญญา"
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
                  : activeFilter === QuotationStatus.APPROVED
                  ? 'รอทำสัญญาทั้งหมด'
                  : activeFilter === QuotationStatus.CONTRACT
                  ? 'ทำสัญญาแล้วทั้งหมด'
                  : activeFilter === QuotationStatus.ONPROCESS
                  ? 'รายการกำลังดำเนินการ'
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
                      filter={item as QuotationStatusKey}
                      isActive={item === activeFilter}
                      onPress={() => {
                        updateActiveFilter(item);
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
                  {activeFilter === QuotationStatus.APPROVED &&
                    approvedQuotation &&
                    approvedQuotation.length > 0 && (
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: 'Sukhumvit Set',
                          marginTop: 10,
                        }}>
                        เลือกรายการเพื่อทำสัญญา
                      </Text>
                    )}

                  <FlatList
                    data={filteredData}
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
                          ลูกค้าอนุมัติใบเสนอราคาก่อนเริ่มทำสัญญา
                        </Text>
                      </View>
                    }
                    contentContainerStyle={
                      quotationData?.length === 0 && {flex: 1}
                    }
                  />
                </View>
              )}
              {/* <FAB
                style={styles.fabStyle}
                icon="file-document-edit-outline"
                onPress= {() => setActiveFilter('APPROVED')}
                color="white"
              /> */}
              {/* <FAB.Group
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
                    size: "medium",
                    label: 'สร้างใบเสนอราคา',

                    onPress: () => createNewQuotation(),
                  },
                  {
                    icon: 'file-document-edit-outline',
                    size: "medium",

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
              /> */}
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

export default DashboardContract;
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
