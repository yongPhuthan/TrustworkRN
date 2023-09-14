import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  Modal,
} from 'react-native';
import {ParamListBase} from '../../../types/navigationType';
import {MultipleSelectList} from 'react-native-dropdown-select-list';
import {useQuery, useMutation} from '@tanstack/react-query';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {launchImageLibrary} from 'react-native-image-picker';
import {
  HOST_URL,
  CLOUDFLARE_WORKER_DEV,
  PROJECT_FIREBASE,
  CLOUDFLARE_WORKER,
  CLOUDFLARE_R2_BUCKET_BASE_URL,
  CLOUDFLARE_DIRECT_UPLOAD_URL,
} from '@env';
type ImageType = {
  uri: string;
};

type Props = {
  navigation: StackNavigationProp<ParamListBase, 'GalleryUploadScreen'>;

  route: RouteProp<ParamListBase, 'GalleryUploadScreen'>;
};

const mockCategories: object[] = [
  {key: '1', value: 'Mobiles', disabled: true},
  {key: '2', value: 'อลูมิเนียม'},
  {key: '3', value: 'ฝ้าซีลาย'},
  {key: '4', value: 'Computers', disabled: true},
  {key: '5', value: 'งานเหล็กลังคา'},
  {key: '6', value: 'งานกระเบื้อง'},
  {key: '7', value: 'งานปูน'},
];
const fetchCategories = async () => {
  // ในตัวอย่างนี้เราจะใช้ setTimeout เพื่อจำลองการ delay ของ network request
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockCategories);
    }, 1000); // จำลอง delay 1 วินาที
  });
};
const GalleryUploadScreen = ({navigation, route}: Props) => {
  const [galleryName, setGalleryName] = useState<string>('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [categories, setCategories] = useState(mockCategories);
  const [newCategory, setNewCategory] = useState('');
  const [images, setImages] = useState<ImageType[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<object[]>([]);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);

  const {data} = useQuery(['categories'], fetchCategories);

  async function uriToBlob(uri) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        // Return the blob
        resolve(xhr.response);
      };
      xhr.onerror = function () {
        // Reject with error
        reject(new Error('URI to Blob failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
  }
  const uploadImageToCloudflare = async (imagePath: string) => {
    if (!imagePath) {
      console.log('No image path provided');
      return;
    }

    const filename = imagePath.substring(imagePath.lastIndexOf('/') + 1);
    const fileType = imagePath.substring(imagePath.lastIndexOf('.') + 1);
    const blob = (await uriToBlob(imagePath)) as Blob;
    const CLOUDFLARE_ENDPOINT = __DEV__
      ? CLOUDFLARE_WORKER_DEV
      : CLOUDFLARE_WORKER;

    let contentType = '';
    switch (fileType.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      default:
        console.error('Unsupported file type:', fileType);
        return;
    }

    try {
      const response = await fetch(`${CLOUDFLARE_ENDPOINT}${filename}`, {
        method: 'POST',
        headers: {
          'Content-Type': contentType,
        },
        body: blob,
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Server responded with:', text);
        throw new Error('Server error');
      }
      let data;
      try {
        const imageUrl = response.url;
        console.log('Image uploaded successfully. URL:', imageUrl);
        return imageUrl;
      } catch (error) {
        console.error('Failed to parse JSON:', error);
        throw new Error('Failed to parse response');
      }
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };
  const handleUpload = () => {
    launchImageLibrary({mediaType: 'photo', selectionLimit: 0}, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.assets) {
        const newImages = response.assets
          .filter(asset => asset.uri)
          .map(asset => ({uri: asset.uri as string}));
        setImages(prevImages => [...prevImages, ...newImages]);
      }
    });
  };
  const handleImagePress = (uri: string) => {
    setSelectedImage(uri);
    setModalVisible(true);
  };

  const showCategoryModal = () => {
    setCategoryModalVisible(true);
  };

  const hideCategoryModal = () => {
    setCategoryModalVisible(false);
  };
  const handleSaveCategory = () => {
    if (newCategory) {
      setCategories([
        ...categories,
        {key: (categories.length + 1).toString(), value: newCategory},
      ]);
      setNewCategory('');
      hideCategoryModal();
    }
  };

  useEffect(() => {
    if (data) {
      setCategories(data);
    }
  }, [data]);

  const handleAddCategory = () => {
    // บันทึก category ใหม่ลงใน array
    setCategories([...categories, {label: newCategory, value: newCategory}]);
    setNewCategory(''); // รีเซ็ต input
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  const handleDelete = (uri: string) => {
    setImages(images.filter(image => image.uri !== uri));
  };

  const handleBulkUpload = async () => {
    for (const image of images) {
      await uploadImageToCloudflare(image.uri);
    }
  };
  const renderItem = ({item}: {item: ImageType}) => (
    <View style={styles.imageContainer}>
      <Image source={{uri: item.uri}} style={styles.image} />
      <TouchableOpacity
        style={styles.closeIcon}
        onPress={() => handleDelete(item.uri)}>
        <Text style={styles.closeText}>X</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <MultipleSelectList
        setSelected={(val: object[]) => setSelectedCategories(val)}
        data={categories}
        
        save="value"
        placeholder={'เลือกหมวดหมู่ธุรกิจ'}
      />

      <TouchableOpacity style={styles.addButton} onPress={showCategoryModal}>
        <Text style={styles.buttonText}>เพิ่มหมวดหมู่</Text>
      </TouchableOpacity>

      <FlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
      />
      <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
        <Text style={styles.buttonText}>Select Images</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.uploadButton} onPress={handleBulkUpload}>
        <Text style={styles.buttonText}>Upload All Images</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <Image source={{uri: selectedImage}} style={styles.fullImage} />
          <TouchableOpacity style={styles.modalCloseIcon} onPress={closeModal}>
            <Text style={styles.closeText}>X</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <Modal
  visible={isCategoryModalVisible}
  transparent={true}
  animationType="slide"
  onRequestClose={hideCategoryModal}>
  <TouchableOpacity style={styles.modalContainer} onPress={hideCategoryModal}>
    <View style={styles.modalContent}>
      <TextInput
        style={styles.textInput}
        placeholder="ใส่หมวดหมู่ใหม่"
        value={newCategory}
        onChangeText={setNewCategory}
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveCategory}>
        <Text style={styles.buttonText}>บันทึก</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
</Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7F7F7',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  imageContainer: {
    width: '33%',
    padding: 5,
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  uploadButton: {
    backgroundColor: '#3498DB',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  fullImage: {
    width: '90%',
    height: '80%',
    resizeMode: 'contain',
  },
  modalCloseIcon: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // ensures the close icon is always on top
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#2ECC71',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    width: '50%',
  },
  saveButton: {
    backgroundColor: '#3498DB',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // สีพื้นหลัง semi-transparent
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  
});

export default GalleryUploadScreen;
