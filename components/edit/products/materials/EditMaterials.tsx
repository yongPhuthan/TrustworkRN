import React, {useState, useContext, useEffect, useMemo} from 'react';
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
import {useForm, Controller, useFormContext} from 'react-hook-form';

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
import {CompanyUser, Service, Material} from '../../../../types/docType';

import Modal from 'react-native-modal';
import {useUser} from '../../../../providers/UserContext';
import {Store} from '../../../../redux/store';
import AddNewMaterial from '../../../materials/addNew';

interface ExistingModalProps {
  isVisible: boolean;
  onClose: () => void;
  serviceIndex: number;

}

const numColumns = 2;
const {width, height} = Dimensions.get('window');

const imageContainerWidth = width / 3 - 10;
const ExistingMaterials = ({
  isVisible,
  onClose,
  serviceIndex,
}: ExistingModalProps) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const context = useFormContext();
  const {register, control, getValues,watch,setValue} = context;
  const user = useUser();

  const {
    state: {serviceList, selectedMaterials, code, serviceImages},
    dispatch,
  }: any = useContext(Store);
  const service = useMemo(() => {
    return watch(`services[${serviceIndex}]`);
  }, [watch]);
const serviceMaterials = watch(`services[${serviceIndex}].materials`);

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
    ['existingMaterials'],
    () => fetchExistingMaterials().then(res => res),
    {
      onSuccess: data => {
        setMaterials(data);
      },
    },
  );
  const handleSelectMaterial = (material:any) => {
    const materialsPath = `services[${serviceIndex}].materials`;
    const currentMaterials = getValues(materialsPath) || [];

    const materialIndex = currentMaterials.findIndex(item => item.materialData.id === material.id);
  
    if (materialIndex >= 0) {
      const updatedMaterials = currentMaterials.filter((_, index) => index !== materialIndex);
      setValue(materialsPath, updatedMaterials, {shouldDirty: true});
    } else {
      const newMaterialData = {
        materialData: {
          ...material 
        }
        
      };
      const updatedMaterials = [...currentMaterials, newMaterialData];
      setValue(materialsPath, updatedMaterials,{shouldDirty: true});

    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }
  const handleDonePress = () => {
    if (serviceMaterials?.length > 0) {
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
          data={materials}
          renderItem={({item, index}) => (
            <>
              <TouchableOpacity
                style={[
                  styles.card,
                  (serviceMaterials || []).some(m => m.id === item.id)
                    ? styles.cardChecked
                    : null,
                ]}
                onPress={() => handleSelectMaterial(item)}>
                <CheckBox
                  center
                  checked={(serviceMaterials || []).some( material => material.materialData.id === item.id)}
                  onPress={() => handleSelectMaterial(item)}
                  containerStyle={styles.checkboxContainer}
                  checkedColor="#012b20"
                />
                <View style={styles.textContainer}>
                  <Text style={styles.productTitle}>{item.name}</Text>
                  <Text style={styles.description}>{item.description}</Text>
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

        {serviceMaterials?.length > 0 && (
          <TouchableOpacity onPress={handleDonePress} style={styles.saveButton}>
            <Text style={styles.saveText}>
              {`บันทึก ${serviceMaterials.length} รายการ`}{' '}
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

export default ExistingMaterials;
