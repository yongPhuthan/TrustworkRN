import {useQuery, useQueryClient} from '@tanstack/react-query';
import firebase from '../../firebase';
import React, {useCallback, useContext, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useUser} from '../../providers/UserContext';
import {
  Appbar,
  Button,
  List,
  Checkbox,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';

import {BACK_END_SERVER_URL} from '@env';
import {faCamera, faClose, faExpand} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {useFormContext} from 'react-hook-form';
import {
  ImageLibraryOptions,
  ImagePickerResponse,
  MediaType,
  launchImageLibrary,
} from 'react-native-image-picker';
import Modal from 'react-native-modal';
import CustomCheckbox from '../../components/CustomCheckbox';
import {useUriToBlob} from '../../hooks/utils/image/useUriToBlob';
import {useSlugify} from '../../hooks/utils/useSlugify';
import {Store} from '../../redux/store';
type ImageData = {
  id: number;
  url: string;
  defaultChecked: boolean;
};

interface ImageModalProps {
  isVisible: boolean;
  onClose: () => void;
  serviceImages: string[];
  setServiceImages: any;
}

const {width, height} = Dimensions.get('window');
const imageContainerWidth = width / 3 - 10;

const GalleryScreen = ({
  isVisible,
  onClose,
  serviceImages,
  setServiceImages,
}: ImageModalProps) => {
  const [isImageUpload, setIsImageUpload] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const user = useUser();
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [responseLog, setResponseLog] = useState<string | null>(null);
  const initialGalleryImages = serviceImages?.map((url, index) => ({
    id: index + 1, // Assuming IDs should be unique and start from 1
    url: url,
    defaultChecked: true, // Set to true as initial value
  }));
  const [galleryImages, setGalleryImages] =
    useState<ImageData[]>(initialGalleryImages);
  const context = useFormContext();
  const {
    register,
    control,
    getValues,
    setValue,
    watch,
    formState: {errors},
  } = context as any;
  const {
    state: {serviceList, code},
    dispatch,
  }: any = useContext(Store);
  const slugify = useSlugify();
  const uriToBlobFunction = useUriToBlob();
  const queryClient = useQueryClient();

  const handleCheckbox = (id: number) => {
    const updatedData = galleryImages.map(img => {
      if (img.id === id) {
        return {...img, defaultChecked: !img.defaultChecked};
      }
      return img;
    });
    setGalleryImages(updatedData);

    const urls = updatedData
      .filter(img => img.defaultChecked)
      .map(img => img.url);
    // setServiceImages(urls);
    setValue('serviceImages', urls);
  };
  // const getGallery = async () => {
  //   if (!user) {
  //     throw new Error('User not authenticated');
  //   } else {
  //     const idToken = await user.getIdToken(true);
  //     const email = user?.email as string;
  //     const filePath =  `${code}/gallery`;
  //     try {
  //       let url = `${BACK_END_SERVER_URL}/api/services/getGallery?filePath=${encodeURIComponent(
  //         filePath,
  //       )}&email=${encodeURIComponent(email)}`;

  //       const response = await fetch(url, {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${idToken}`,
  //         },
  //       });

  //       if (!response.ok) {
  //         throw new Error('Server responded with status: ' + response.status);
  //       }

  //       const imageUrls = await response.json();
  //       return imageUrls;
  //     } catch (error) {
  //       console.error('Error fetching images:', error);
  //       return [];
  //     }
  //   }
  // };
  const getGallery = async () => {
    const storageRef = firebase.storage().ref(`${code}/gallery`);
    const result = [];

    try {
      // List all items (files) and prefixes (folders) under this directory.
      const listResult = await storageRef.listAll();
      for (const itemRef of listResult.items) {
        // For each item (file), get its download URL and add it to the result array.
        const url = await itemRef.getDownloadURL();
        result.push(url);
      }
      return result;
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      throw new Error('Could not fetch gallery images');
    }
  };

  const {data, isLoading, error} = useQuery({
    queryKey: ['gallery', code],
    queryFn: () => getGallery(),
    onSuccess: data => {
      if (data && Array.isArray(data)) {
        if (watch('serviceImages').length > 0) {
          const imageData = data.map((url, index) => ({
            id: index + 1, // Assigning an ID
            url: url,
            defaultChecked: watch('serviceImages').includes(url), // Check if the URL is in serviceImages
          }));
          setGalleryImages(imageData);
        } else {
          const imageData = data.map((url, index) => ({
            id: index + 1, // Assigning an ID
            url: url,
            defaultChecked: false,
          }));
          setGalleryImages(imageData);
        }
      } else {
        console.warn('Data is undefined or not in expected format');
      }
    },
  });

  // const filePath = `${code}/gallery/${filename}`

  const handleUploadMoreImages = useCallback(() => {
    setIsImageUpload(true);
    const options: ImageLibraryOptions = {
      mediaType: 'photo' as MediaType,
    };

    const uploadImageToFbStorage = async (
      imagePath: string,
    ): Promise<string | undefined> => {
      if (!imagePath) {
        console.log('No image path provided');
        return;
      }
      if (!user) {
        console.error('User not authenticated');
        return; // Explicitly return undefined for consistency
      }

      const name = imagePath.substring(imagePath.lastIndexOf('/') + 1);
      const fileType = imagePath.substring(imagePath.lastIndexOf('.') + 1);
      const filename = slugify(name) + '.' + fileType;

      let contentType = '';
      switch (fileType.toLowerCase()) {
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg';
          break;
        case 'png':
          contentType = 'image/png';
          break;
        case 'webp':
          contentType = 'image/webp';
          break;
        default:
          console.error('Unsupported file type:', fileType);
          return; // Explicitly return undefined for consistency
      }

      const filePath = `${code}/gallery/${filename}`;
      try {
        const reference = firebase.storage().ref(filePath);
        await reference.putFile(imagePath, {contentType}); // putFile is used for direct file paths
        const publicUrl = await reference.getDownloadURL();
        console.log('Upload to Firebase Storage success', publicUrl);
        return publicUrl;
      } catch (error) {
        console.error(
          'There was a problem with the Firebase Storage operation:',
          error,
        );
        return; // Explicitly return undefined in case of error
      }
    };

    launchImageLibrary(options, async (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        setIsImageUpload(false);
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
        setIsImageUpload(false);
      } else if (response.assets && response.assets.length > 0) {
        const source = {uri: response.assets[0].uri ?? null};
        console.log('Image source:', source);
        if (source.uri) {
          try {
            const uploadedImageUrl = await uploadImageToFbStorage(source.uri);
            if (uploadedImageUrl) {
              console.log('Image uploaded successfully:', uploadedImageUrl);
              // Here you can invalidate queries or update your state with the new image URL
              queryClient.invalidateQueries(['gallery', code]);
            }
            setIsImageUpload(false);
          } catch (error) {
            console.error('Error uploading image:', error);
            setIsImageUpload(false);
          }
        }
      }
    });
  }, [setIsImageUpload, queryClient, code]);

  // if (error) {
  //   return (
  //     <View
  //       style={{
  //         flex: 1,
  //         justifyContent: 'center',
  //         height: height * 0.5,

  //         alignItems: 'center',
  //       }}>
  //       <TouchableOpacity
  //         style={styles.uploadGalleryButton}
  //         onPress={handleUploadMoreImages}>
  //         {isImageUpload ? (
  //           <ActivityIndicator size="small" color="white" />
  //         ) : (
  //           <Text style={styles.uploadButtonTextGalleryButton}>
  //             อัพโหลดภาพตัวอย่างผลงาน
  //           </Text>
  //         )}
  //       </TouchableOpacity>
  //     </View>
  //   );
  // }
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Modal isVisible={isVisible} style={styles.modal} onBackdropPress={onClose}>
      {isImageUpload ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="white" />
        </View>
      ) : (
        <>
          <Appbar.Header
            mode="center-aligned"
            elevated
            style={{
              backgroundColor: 'white',
              width: Dimensions.get('window').width,
            }}>
            <Appbar.Action icon={'close'} onPress={() => onClose()} />
            <Appbar.Content
              title={`เลือกภาพผลงานที่เคยทำ`}
              titleStyle={{fontSize: 16}}
            />
            {galleryImages && galleryImages.length > 0 && (
              <Appbar.Action icon={'plus'} onPress={handleUploadMoreImages} />
            )}
          </Appbar.Header>
          <SafeAreaView style={styles.container}>
            <FlatList
              data={galleryImages}
              numColumns={3}
              ListEmptyComponent={
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={handleUploadMoreImages}
                    style={styles.selectButton}>
                    <View style={styles.containerButton}>
                      <FontAwesomeIcon
                        icon={faCamera}
                        color="#0073BA"
                        size={14}
                      />

                      <Text style={styles.selectButtonText}>
                        เลือกจากอัลบั้ม
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              }
              renderItem={({item}) => (
                <View
                  style={[
                    styles.imageContainer,
                    item.defaultChecked && styles.selected,
                  ]}>
                  <Image source={{uri: item.url}} style={styles.image} />
                  <View style={styles.checkboxContainer}>
                    <CustomCheckbox
                      checked={item.defaultChecked}
                      onPress={() => handleCheckbox(item.id)}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.expandButton}
                    onPress={() => {
                      setSelectedImage(item.url);
                      setModalVisible(true);
                    }}>
                    <FontAwesomeIcon
                      icon={faExpand}
                      style={{marginVertical: 5}}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              )}
              keyExtractor={item => item?.id?.toString()}
            />
            {data && data.length > 0 && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.uploadButton,
                    styles.saveButton,
                    !watch('serviceImages') ||
                    watch('serviceImages').length === 0
                      ? styles.disabledButton
                      : null,
                  ]}
                  onPress={() => {
                    if (serviceImages) onClose();
                  }}
                  disabled={
                    !watch('serviceImages') ||
                    watch('serviceImages').length === 0
                  }>
                  <Text style={styles.uploadButtonText}>บันทึก {watch('serviceImages').length} รูป</Text>
                </TouchableOpacity>
              </View>
            )}
            <Modal
              isVisible={modalVisible}
              onBackdropPress={() => setModalVisible(false)}>
              <View style={styles.modalContainer}>
                <Image
                  source={{uri: selectedImage}}
                  style={styles.modalImage}
                />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}>
                  <Text>Close</Text>
                </TouchableOpacity>
              </View>
            </Modal>
          </SafeAreaView>
        </>
      )}
    </Modal>
  );
};

export default GalleryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    width,
  },
  imageContainer: {
    width: imageContainerWidth,
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: 'gray',
    margin: 5,
    position: 'relative',
  },

  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 0,
    resizeMode: 'cover',
  },
  checkboxContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  expandButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    borderRadius: 15,
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  ViewButton: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    // backgroundColor: 'white',

    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 15,
    padding: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  selected: {
    backgroundColor: '#F2F2F2',
  },
  buttonContainer: {
    flexDirection: 'row',

    paddingHorizontal: 20,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
    height: 90,
  },
  buttonContainerEmpty: {
    flexDirection: 'column',

    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 90,
  },

  uploadButton: {
    flex: 1, // Take up half the width
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    padding: 3,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  uploadMoreButton: {
    backgroundColor: '#3498DB',
  },
  uploadGalleryButton: {
    backgroundColor: '#3498DB',
    width: '60%',
    padding: 15,
    borderRadius: 5,
    shadowColor: '#000',
  },
  uploadButtonTextGalleryButton: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Sukhumvit Set Bold',
  },

  saveButton: {
    height: 50,
    backgroundColor: '#1f303cff',
  },

  uploadButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: 'white',
    fontFamily: 'Sukhumvit Set Bold',
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  addButtonContainer: {
    width: 100,
    margin: 5,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#0073BA',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderRadius: 4, // Optional, for rounded edges
  },
  onCloseButton: {
    paddingVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    // backgroundColor: '#f5f5f5',
  },

  selectButtonText: {
    fontSize: 16,
    color: '#0073BA',
    fontFamily: 'Sukhumvit set',
    marginLeft: 10,
  },

  containerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectButton: {
    // backgroundColor: '#0073BA',
    backgroundColor: 'white',
    borderColor: '#0073BA',
    borderWidth: 1,
    borderStyle: 'dotted',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 5,
    marginTop: 20,
  },
  onPlusButton: {
    paddingVertical: 10,
  },
  disabledButton: {
    backgroundColor: '#cccccc', // Example: gray color for disabled state
    // Other styles for disabled state, if necessary
  },
});
