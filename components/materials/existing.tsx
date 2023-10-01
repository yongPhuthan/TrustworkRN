import React, {useState, useContext, useEffect, useRef} from 'react';
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
import {
  faCloudUpload,
  faEdit,
  faPlus,
  faImages,
  faClose,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import {HOST_URL, PROJECT_FIREBASE, PROD_API_URL} from '@env';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {CompanyUser, Service} from '../../types/docType';
import {ParamListBase, ProductItem} from '../../types/navigationType';
import * as stateAction from '../../redux/actions';
import Modal from 'react-native-modal';

import {Store} from '../../redux/store';
import AddNewMaterial from './addNew';
type Props = {
  navigation: StackNavigationProp<ParamListBase, 'ExistingMaterials'>;
  route: RouteProp<ParamListBase, 'ExistingProduct'>;
  // onGoBack: (data: string) => void;
};
interface ExistingModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedMaterialArray: any[];
  setSelectedMaterialArray: React.Dispatch<React.SetStateAction<any[]>>;
  onPress?: () => void;
}
const fetchExistingMaterials = async (code: CompanyUser) => {
  const user = auth().currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  const idToken = await user.getIdToken();
  const url = __DEV__
    ? `http://${HOST_URL}:5001/${PROJECT_FIREBASE}/asia-southeast1/appQueryExistingMaterials`
    : `https://asia-southeast1-${PROJECT_FIREBASE}.cloudfunctions.net/appQueryExistingMaterials`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },

    body: JSON.stringify({code}),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data;
};
const ExistingMaterials = ({
  isVisible,
  onClose,
  selectedMaterialArray,
  setSelectedMaterialArray,
  onPress,
}: ExistingModalProps) => {
  const [products, setProducts] = useState<Service[]>([]);
const [isOpenModal, setIsOpenModal] = useState(false);
  const route = useRoute();
  const {width, height} = Dimensions.get('window');

  const companyID = route.params;
  const {
    state: {serviceList, selectedMaterials, code, serviceImages},
    dispatch,
  }: any = useContext(Store);
  const {data, isLoading, isError} = useQuery(
    ['existingMaterials', code],
    () => fetchExistingMaterials(code).then(res => res),
    {
      onSuccess: data => {
        setProducts(data);
        console.log('audit data', JSON.stringify(data));
      },
    },
  );
  const handleSelectAudit = (material: any) => {
    const existingIndex = selectedMaterialArray.findIndex(
      a => a.title === material.title,
    );
    if (existingIndex !== -1) {
      // if the audit is already selected, remove it
      setSelectedMaterialArray(
        selectedMaterialArray.filter(a => a.title !== material.title),
      );
    } else {
      // if the audit is not selected, add it
      setSelectedMaterialArray([...selectedMaterialArray, material]);
    }
  };
  //   const handleSelectAudit = (material: any) => {
  //     const existingIndex = selectedMaterials.findIndex(
  //       a => a.name === material.name,
  //     );
  //     if (existingIndex !== -1) {
  //       setSelectedMaterialArray(
  //         selectedMaterialArray.filter(a => a.name !== material.name),
  //       );
  //       dispatch(stateAction.remove_selected_materials(material));
  //     } else {
  //       setSelectedMaterialArray([...selectedMaterialArray, material]);
  //       dispatch(stateAction.selected_materials(material));
  //     }
  //   };
  useEffect(() => {
    if (selectedMaterials.length > 0) {
      setSelectedMaterialArray(selectedMaterials);
    }
  }, [selectedMaterials]);
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }
  const handleDonePress = () => {
    if (selectedMaterialArray.length > 0) {
      // dispatch here
      onClose();
    }
  };
  const handleAddNewProduct = () => {
    onClose();
  };

  return (
    <Modal isVisible={isVisible} style={styles.modal} onBackdropPress={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <FontAwesomeIcon icon={faClose} size={32} color="gray" />
          </TouchableOpacity>
        </View>
        {products.length > 0 && (
          <Text style={styles.titleText}>เลือกจากรายการเดิม</Text>
        )}
        <FlatList
          data={products.slice(-5)}
          renderItem={({item}) => (
            <>
              <TouchableOpacity
                style={styles.card}
                onPress={() => {
                  handleSelectAudit(item);
                }}>
                <Image
                  source={{uri: item.serviceImage}}
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
                onPress={() => setIsOpenModal(true)}
                style={styles.emptyListButton}>
                <Text style={styles.emptyListText}>+ เพิ่มรายการใหม่</Text>
              </TouchableOpacity>
            </View>
          }
          keyExtractor={item => item.id}
        />
        {products.length > 0 && (
          <TouchableOpacity
            onPress={() => setIsOpenModal(true)}
            style={styles.emptyListButton}>
            <Text style={styles.emptyListText}>+ เพิ่มรายการใหม่</Text>
          </TouchableOpacity>
        )}
        {selectedMaterialArray.length > 0 && (
          <View style={styles.containerBtn}>
            <TouchableOpacity onPress={handleDonePress} style={styles.button}>
              <Text
                style={
                  styles.buttonText
                }>{`บันทึก ${selectedMaterialArray.length} มาตรฐาน`}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <AddNewMaterial 
      isVisible={isOpenModal}
      onClose={()=>setIsOpenModal(false)}
      />
    </Modal>
  );
};
const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F7F7F7',
    width
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
  button: {
    width: '90%',
    top: '30%',
    height: 50,
    backgroundColor: '#0073BA',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  closeButton: {
    paddingVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 10,

    backgroundColor: '#f5f5f5',
  },
});

export default ExistingMaterials;
