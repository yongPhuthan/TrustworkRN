import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import {HOST_URL, PROJECT_FIREBASE, BACK_END_SERVER_URL} from '@env';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {CompanyUser, Service} from '../../types/docType';
import {ParamListBase, ProductItem} from '../../types/navigationType';
import * as stateAction from '../../redux/actions';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {useUser} from '../../providers/UserContext';
import {
  faPlus,
  faDrawPolygon,
  faCog,
  faBell,
  faChevronRight,
  faCashRegister,
  faCoins,
} from '@fortawesome/free-solid-svg-icons';
import {Store} from '../../redux/store';
type Props = {
  navigation: StackNavigationProp<ParamListBase, 'ExistingProduct'>;
  route: RouteProp<ParamListBase, 'ExistingProduct'>;
  // onGoBack: (data: string) => void;
};

const ExistingProducts = ({navigation}: Props) => {
  const [products, setProducts] = useState<Service[]>([]);
  const route = useRoute();
  const user = useUser();
  const {width, height} = Dimensions.get('window');
  const companyID = route.params;
  const {
    state: {serviceList, selectedAudit, code, serviceImages},
    dispatch,
  }: any = useContext(Store);
  const fetchExistingServices = async (company: CompanyUser) => {
    if (!user) {
      throw new Error('User not authenticated');
    } else {
      const idToken = await user.getIdToken(true);

      const companyID = company.id;
      let url = `${BACK_END_SERVER_URL}/api/services/getExistingServices?id=${encodeURIComponent(
        companyID,
      )}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      console.log('dataSetting', data);
      return data;
    }
  };
  const {data, isLoading, isError} = useQuery(
    ['existingProduct', companyID],
    () => fetchExistingServices(companyID as CompanyUser).then(res => res),
    {
      onSuccess: data => {
        setProducts(data);
        console.log('existing data', JSON.stringify(data));
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
  const handleAddNewProduct = () => {
    navigation.navigate('AddProduct');
  };

  return (
    <View style={styles.container}>
      {/* {products.length > 0 && (
        <Text style={styles.titleText}>เลือกจากรายการเดิม</Text>
      )} */}

      <FlatList
        data={products}
        renderItem={({item}) => (
          <>
            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                dispatch(stateAction.service_images(item.serviceImages));
                navigation.navigate('AddExistProduct', {item: item});
              }}>
              <Image
                source={{uri: item.serviceImages[0] || ''}}
                style={styles.productImage}
              />
              <View style={styles.textContainer}>
                <Text style={styles.productTitle}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          </>
        )}
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              height: height * 0.5,

              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={handleAddNewProduct}
              style={styles.emptyListButton}>
              <Text style={styles.emptyListText}>เพิ่มรายการใหม่</Text>
            </TouchableOpacity>
          </View>
        }
        keyExtractor={item => item.id}
      />
      {products.length > 0 && (
        <TouchableOpacity
          onPress={handleAddNewProduct}
          style={styles.emptyListButton}>
          <View style={styles.header}>
            <FontAwesomeIcon
              style={styles.icon}
              icon={faPlus}
              size={20}
              color="white"
            />
            <Text style={styles.emptyListText}>เพิ่มรายการใหม่</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F7F7F7',
  },
  titleText: {
    fontSize: 16,
    //   fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  productTitle: {
    fontSize: 14,
    fontFamily: 'Sukhumvit Set Bold',
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: 'gray',
    fontFamily: 'Sukhumvit set',
  },
  emptyListButton: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#012b20',
    // backgroundColor: '#0073BA',
    alignItems: 'center',
    justifyContent: 'center',

    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  emptyListText: {
    fontSize: 16,
    color: '#FFFFFF',
    // fontWeight: 'bold',
    fontFamily: 'Sukhumvit Set Bold',
    marginLeft: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: 'white',
    marginLeft: 8,
  },
});

export default ExistingProducts;
