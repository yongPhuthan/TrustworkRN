import { BACK_END_SERVER_URL } from '@env';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQuery } from '@tanstack/react-query';
import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useUser } from '../../providers/UserContext';
import { Store } from '../../redux/store';
import { ParamListBase } from '../../types/navigationType';

import { Checkbox, Divider } from 'react-native-paper';
type Props = {
  navigation: StackNavigationProp<ParamListBase>;
  route: RouteProp<ParamListBase, 'SelectWorks'>;
};
const {width, height} = Dimensions.get('window');

type SubmitService = {
  id: string;
  title: string;
  description: string;
};

const Selectworks = (props: Props) => {
  const user = useUser();
  const {navigation, route} = props;
  const {quotationId} = route.params;
  const [selectedServices, setSelectedServices] = useState<SubmitService[]>([]);
  const [selectedAll, setSelectedAll] = useState<boolean>(false);
  const {
    state: {code},
    dispatch,
  }: any = useContext(Store);
  const {control, watch, reset, getValues} = useForm({
    defaultValues: {
      id: quotationId,
      services: [
        {
          id: '',
          title: '',
          description: '',
        },
      ],
      projectName: '',
      signAddress: '',
      companyUserId: '',
      customerId : '',
      customerName: '',
      workStatus: '',
      periodPercent: [],
    
    },
  });
  async function fetchContractByQuotation() {

    if (!user || !user.email) {
      console.error('User or user email is not available');
      return;
    }

    try {
      const token = await user.getIdToken(true);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/documents/getQuotationForSubmitProject?quotationId=${encodeURIComponent(
          quotationId,
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
          }
          throw new Error(errorData.message);
        }
        throw new Error('Network response was not ok.');
      }

      const data = await response.json();

      console.log('data after QUEERYY', data);
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
    queryFn: fetchContractByQuotation,
    queryKey: ['quotation', quotationId],
    enabled: !!user,
    onSuccess: data => {
      reset({
        services: data.services,
        projectName: data.contract.projectName,
        signAddress: data.signAddress,
        customerName: data.customer.name,
        periodPercent: data.periodPercent,
        companyUserId: data.companyUser.id,
        customerId : data.customer.id,
        
      });
    },
  });
  const handleSelectedAll = () => {
    setSelectedAll(!selectedAll);
    if (selectedAll) {
      setSelectedServices([]);
    } else {
      setSelectedServices(getValues('services'));
    }
  };

  const handleSelectedService = (service: SubmitService) => {
    if (selectedServices.some(m => m.id === service.id)) {
      setSelectedServices(selectedServices.filter(m => m.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
      setSelectedAll(false);
    }
  };
  const handleDonePress = () => {
    const modifyData = {
      ...data,
      services: selectedServices,
      workStatus:selectedServices.length === watch('services').length ? 'ALL' : 'PERIOD' ,
    };
    console.log('modifyData', modifyData);

    navigation.navigate('SendWorks', {
      ...modifyData,
    });
  };
  if (isQuery || !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Error </Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.titleText}>
          โครงการติดตั้ง : {getValues('projectName')}
        </Text>
        <Text style={styles.titleText}>
          ลูกค้า : {getValues('customerName')}
        </Text>
        <View style={{marginTop: 10}}></View>
        {/* <TouchableOpacity
          style={[styles.card, selectedAll ? styles.cardChecked : null]}
          onPress={handleSelectedAll}>
          <CheckBox
            center
            checked={selectedAll}
            onPress={() => handleSelectedAll()}
            containerStyle={styles.checkboxContainer}
            checkedColor="#012b20"
          />
          <View style={styles.textContainer}>
            <Text style={styles.productTitle}>ส่งงานทั้งหมด</Text>
          </View>
        </TouchableOpacity> */}
        <Divider style={{marginVertical: 10}} />
        <Text style={styles.titleText}>เลือกรายการที่ต้องการส่งงาน</Text>

        <FlatList
          data={getValues('services')}
          renderItem={({item, index}) => (
            <>
              <TouchableOpacity
                style={[
                  styles.card,
                  selectedServices.some(m => m.id === item.id) && !selectedAll
                    ? styles.cardChecked
                    : null,
                ]}
                onPress={() => handleSelectedService(item)}>
                <Checkbox.Android
                  status={selectedServices.some(m => m.id === item.id ) ? 'checked' : 'unchecked'}
                  onPress={() => handleSelectedService(item)}
                  // containerStyle={styles.checkboxContainer}
                  color="#012b20"
                />
                <View style={styles.textContainer}>
                  <Text style={styles.productTitle}>
                    รายการที่{index + 1}. {item.title}
                  </Text>
                  <Text style={styles.description}>{item.description}</Text>
                </View>
              </TouchableOpacity>
            </>
          )}
          keyExtractor={item => item.id}
        />
      </View>
      <View style={styles.modal}>
        <TouchableOpacity
          onPress={handleDonePress}
          style={
            !selectedServices.length
              ? [styles.saveButton, styles.disabledButton]
              : styles.saveButton
          }
          disabled={!selectedServices.length}>
          <Text style={styles.saveText}>ไปต่อ</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default Selectworks;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F7F7F7',
    width: 'auto',
  },
  titleText: {
    fontSize: 16,
    //   fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 16,
    color: '#012b20',
  },
  emptyListButton: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    marginTop: 20,
  },
  saveButton: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#012b20',
    // backgroundColor: '#0073BA',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    height: 50,
    shadowRadius: 2,
    elevation: 3,
  },
  emptyListText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  saveText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  containerBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    shadowColor: 'black',
    shadowOffset: {width: 1, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 4,
    bottom: 0,
    width: '100%',

    paddingBottom: 30,
  },
  imageContainer: {
    width: 100,
    flexDirection: 'column',
    margin: 5,
    position: 'relative',
  },
  button: {
    width: '90%',
    top: '30%',
    height: 50,
    backgroundColor: '#0073BA',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addNewButton: {
    width: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 15,
    paddingRight: 15,
    borderWidth: 1,
    borderColor: '#012b20',

    height: 50,

    borderRadius: 5,
  },
  modal: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    paddingVertical: 10,
  },
  header: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingVertical: 10,

    backgroundColor: '#f5f5f5',
  },

  selected: {
    backgroundColor: '#F2F2F2',
  },
  disabledButton: {
    backgroundColor: '#cccccc', // A subdued color to indicate disabled state
    shadowOpacity: 0, // Optional: remove shadow when disabled
    elevation: 0, // Optional: remove elevation when disabled
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    borderWidth: 1, // Add border to the card
    borderColor: 'transparent', // Default border color
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    width: width - 32, // Adjust based on your padding
  },
  cardChecked: {
    borderColor: '#012b20', // Color when checked
  },
  checkboxContainer: {
    padding: 0,
    margin: 0,
    marginRight: 10,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
  description: {
    fontSize: 12,
    color: 'gray',
  },
  productImage: {
    width: 100, // Adjust the size according to your design
    height: 100, // Adjust the size according to your design
    borderRadius: 4, // If you want rounded corners
  },
  addNewText: {
    color: '#012b20',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontFamily: 'Sukhumvit Set Bold',
  },
  icon: {
    color: '#012b20',
  },
});
