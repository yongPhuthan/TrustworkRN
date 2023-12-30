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
  Pressable,
} from 'react-native';
import {CheckBox} from '@rneui/themed';
import {StackNavigationProp} from '@react-navigation/stack';
import {
  faCloudUpload,
  faEdit,
  faExpand,
  faPlus,
  faImages,
  faClose,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import {HOST_URL, PROJECT_FIREBASE, BACK_END_SERVER_URL} from '@env';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {CompanyUser, Service, Material, Workers} from '../../types/docType';
import {ParamListBase, ProductItem} from '../../types/navigationType';
import * as stateAction from '../../redux/actions';
import Modal from 'react-native-modal';
import CustomCheckbox from '../../components/CustomCheckbox';
import {useUser} from '../../providers/UserContext';
import {Store} from '../../redux/store';
import AddNewMaterial from '../materials/addNew';
import {
  useForm,
  FormProvider,
  useWatch,
  useFormContext,
  Controller,
  set,
} from 'react-hook-form';
interface ExistingModalProps {
  isVisible: boolean;
  onClose: () => void;
  serviceId: string;

}

const numColumns = 2;
const {width, height} = Dimensions.get('window');
const imageContainerWidth = width / 3 - 10;
const ExistingWorkers = ({
  isVisible,
  onClose,
  serviceId,
}: ExistingModalProps) => {
  const [workers, setWorkers] = useState<Workers[]>([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const context = useFormContext();
  const {
    register,
    control,
    getValues,
    setValue,
    watch,
    formState: {errors},
  } = context as any;
  const route = useRoute();
  const user = useUser();

  const {
    state: {serviceList, selectedMaterials, code, serviceImages},
    dispatch,
  }: any = useContext(Store);
  const servicListIndex = serviceList.findIndex(service => service.id === serviceId);

  const fetchExistingMaterials = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    } else {
      const idToken = await user.getIdToken(true);
      let url = `${BACK_END_SERVER_URL}/api/services/queryMaterials?code=${encodeURIComponent(
        code,
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
      return data;
    }
  };

  const {data, isLoading, isError} = useQuery(
    ['workers'],
    () => fetchExistingMaterials().then(res => res),
    {
      onSuccess: data => {
        setWorkers(data);
      },
    },
  );
  

  const currentWorkers = useWatch({
    control,
    name: 'workers',
  });

  const handleSelectWorker = (workers: Workers) => {
    const workerIndex = currentWorkers.findIndex(worker => worker.id === workers.id);
    if (workerIndex !== -1) {
      const updatedWorkers = [...currentWorkers];
      updatedWorkers.splice(workerIndex, 1);
      setValue('workers', updatedWorkers);
    } else {
      const updatedWorkers = [...currentWorkers, workers];
      setValue('workers', updatedWorkers);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }
  if(isError) {
    return (
      <View style={styles.loadingContainer}>
        <Text>เกิดข้อผิดพลาด Worker</Text>
      </View>
    );
  }
  const handleDonePress = () => {
    if (currentWorkers.length > 0) {
      onClose();
    }
  };
  const handleAddNewProduct = () => {
    setIsOpenModal(true);
  };
  return (
    <Modal isVisible={isVisible} style={styles.modal} onBackdropPress={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <FontAwesomeIcon icon={faClose} size={32} color="gray" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={workers}
          renderItem={({item, index}) => (
            <>
              <TouchableOpacity
                style={[
                  styles.card,
                  currentWorkers.some(m => m.id === item.id)
                    ? styles.cardChecked
                    : null,
                ]}
                onPress={() => handleSelectWorker(item)}>
                <CheckBox
                  center
                  checked={currentWorkers.some( worker => worker.id === item.id)}
                  onPress={() => handleSelectWorker(item)}
                  containerStyle={styles.checkboxContainer}
                  checkedColor="#012b20"
                />
                <View style={styles.textContainer}>
                  <Text style={styles.productTitle}>{item.name}</Text>
                  <Text style={styles.description}>{item.mainSkill}</Text>
                </View>
                <Image source={{uri: item.image}} style={styles.productImage} />
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

        {currentWorkers?.length > 0 && (
          <TouchableOpacity onPress={handleDonePress} style={styles.saveButton}>
            <Text style={styles.saveText}>
              {`บันทึก ${currentWorkers.length} รายการ`}{' '}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <AddNewMaterial
        isVisible={isOpenModal}
        onClose={() => setIsOpenModal(false)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F7F7F7',
    width,
  },
  titleText: {
    fontSize: 16,
    //   fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 16,
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

    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
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
    width: imageContainerWidth,
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

export default ExistingWorkers;
