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
import {HOST_URL, PROJECT_FIREBASE, PROD_API_URL} from '@env';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {CompanyUser, Service, Workers} from '../../types/docType';
import {ParamListBase, ProductItem} from '../../types/navigationType';
import * as stateAction from '../../redux/actions';

import {Store} from '../../redux/store';
type Props = {
  navigation: StackNavigationProp<ParamListBase, 'ExistingWorkers'>;
  route: RouteProp<ParamListBase, 'ExistingWorkers'>;
  // onGoBack: (data: string) => void;
};

const fetchExistingMaterials = async (company: CompanyUser) => {
  const user = auth().currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  const idToken = await user.getIdToken();
  const companyID = company.id;
  const url = __DEV__
    ? `http://${HOST_URL}:5001/${PROJECT_FIREBASE}/asia-southeast1/appQueryExistingProduct`
    : `https://asia-southeast1-${PROJECT_FIREBASE}.cloudfunctions.net/appQueryExistingProduct`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },

    body: JSON.stringify({id: companyID}),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();
  return data;
};

const ExistingWorkers = ({navigation}: Props) => {
  const [workers, setWorkers] = useState<Workers[]>([]);
  const route = useRoute();
  const {width, height} = Dimensions.get('window');
  const companyID = route.params;
  const {
    state: {serviceList, selectedAudit, code, serviceImages},
    dispatch,
  }: any = useContext(Store);
  const {data, isLoading, isError} = useQuery(
    ['workers', companyID],
    () => fetchExistingMaterials(companyID as CompanyUser).then(res => res),
    {
      onSuccess: data => {
        setWorkers(data);
        console.log('workers data', JSON.stringify(data));
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
    navigation.navigate('AddNewWorker');
  };

  return (
    <View style={styles.container}>
      {workers.length > 0 && (
        <Text style={styles.titleText}>เลือกจากรายการเดิม</Text>
      )}
      <FlatList
        data={workers.slice(-5)}
        renderItem={({item}) => (
          <>
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
               {  }}>
              <Image
                source={{uri: item.image}}
                style={styles.productImage}
              />
              <View style={styles.textContainer}>
                <Text style={styles.productTitle}>{item.name}</Text>
                <Text style={styles.description}>{item.mainSkill}</Text>
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
              <Text style={styles.emptyListText}>+ เพิ่มรายการใหม่</Text>
            </TouchableOpacity>
          </View>
        }
        keyExtractor={item => item.id}
      />
      {workers.length > 0 && (
        <TouchableOpacity
          onPress={handleAddNewProduct}
          style={styles.emptyListButton}>
          <Text style={styles.emptyListText}>+ เพิ่มรายการใหม่</Text>
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: 'gray',
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
  emptyListText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ExistingWorkers;
