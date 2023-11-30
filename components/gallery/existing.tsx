import React, {useState, useCallback, useContext} from 'react';
import {
  View,
  Image,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Text,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {ParamListBase, ProductItem} from '../../types/navigationType';
import {useQuery, useQueryClient, useMutation} from '@tanstack/react-query';
import {GlobalStyles} from '../../styles/GlobalStyles';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import {RouteProp} from '@react-navigation/native';
import * as stateAction from '../../redux/actions';
import {Store} from '../../redux/store';
import {
  faCloudUpload,
  faEdit,
  faPlus,
  faImages,
  faPlusCircle,
  faClose,
  faCamera,
} from '@fortawesome/free-solid-svg-icons';
import {CheckBox} from '@rneui/themed';
import {
  launchImageLibrary,
  MediaType,
  ImageLibraryOptions,
  ImagePickerResponse,
} from 'react-native-image-picker';

import {
  HOST_URL,
  CLOUDFLARE_WORKER_DEV,
  PROJECT_FIREBASE,
  CLOUDFLARE_WORKER,
  CLOUDFLARE_R2_BUCKET_BASE_URL,
  CLOUDFLARE_DIRECT_UPLOAD_URL,
  CLOUDFLARE_R2_PUBLIC_URL,
} from '@env';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faExpand, faExpandArrowsAlt} from '@fortawesome/free-solid-svg-icons';
import CustomCheckbox from '../../components/CustomCheckbox';
import useImagesQuery from '../../hooks/utils/image/useImageQuery';
import {useSlugify} from '../../hooks/utils/useSlugify';
import {useUriToBlob} from '../../hooks/utils/image/useUriToBlob';
import Modal from 'react-native-modal';

type ImageData = {
  id: number;
  url: string;
  defaultChecked: boolean;
};

interface ImageModalProps {
  isVisible: boolean;
  onClose: () => void;
  serviceImages: string[];
  setServiceImages: React.Dispatch<React.SetStateAction<any[]>>;
}

type Props = {
  navigation: StackNavigationProp<ParamListBase, 'GalleryScreen'>;
  route: RouteProp<ParamListBase, 'GalleryScreen'>;
  code: string;
};
const CLOUDFLARE_ENDPOINT = __DEV__ ? CLOUDFLARE_WORKER_DEV : CLOUDFLARE_WORKER;

const getGallery = async code => {
  try {
    const response = await fetch(`${CLOUDFLARE_ENDPOINT}gallery`, {
      headers: {
        code: code,
      },
    });
    console.log('response', response);

    if (!response.ok) {
      throw new Error('Server responded with status: ' + response.status);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      const data = await response.json();
      return data;
    } else {
      throw new Error('Received non-JSON response');
    }
  } catch (error) {
    console.error('Error fetching images:', error);
    return {};
  }
};

const {width, height} = Dimensions.get('window');
const imageContainerWidth = width / 3 - 10;
const resizeImageForUpload = async (uri, newWidth, newHeight) => {
  const response = await ImageResizer.createResizedImage(
    uri,
    newWidth,
    newHeight,
    'JPEG',
    100,
  );
  return response.uri;
};
const GalleryScreen = ({
  isVisible,
  onClose,
  serviceImages,
  setServiceImages,
}: ImageModalProps) => {
  const [isImageUpload, setIsImageUpload] = useState(false);
  const [galleryImages, setGalleryImages] = useState<ImageData[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [responseLog, setResponseLog] = useState<string | null>(null);
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
    setServiceImages(urls);
    // dispatch(stateAction.service_images(urls));
  };
  const {data, isLoading, error} = useQuery({
    queryKey: ['gallery', code],
    queryFn: () => {
      if (code && code !== 'undefined') {
        return getGallery(code);
      } else {
        console.error('The id is undefined. Skipping the API call.');
        return Promise.resolve({});
      }
    },
    onSuccess: (data: any) => {
      if (data) {
        console.log('data key', data);
        const transformedData = data.map((item: string, index: number) => {
          const completeURL = `${CLOUDFLARE_R2_PUBLIC_URL}${item}`;

          const isMatchedInServiceImages = serviceImages.includes(completeURL);

          return {
            id: index + 1,
            url: completeURL,
            defaultChecked: isMatchedInServiceImages,
          };
        });

        setGalleryImages(transformedData);
      } else {
        console.warn('Data is undefined');
      }
    },
  });

  const handleUploadMoreImages = useCallback(() => {
    setIsImageUpload(true);
    const options: ImageLibraryOptions = {
      mediaType: 'photo' as MediaType,
    };
    const uploadImageToCloudflare = async (imagePath: string) => {
      if (!imagePath) {
        console.log('No image path provided');
        return;
      }
      const name = imagePath.substring(imagePath.lastIndexOf('/') + 1);
      const fileType = imagePath.substring(imagePath.lastIndexOf('.') + 1);
      const filename = slugify(name);

      const blob = (await uriToBlobFunction(imagePath)) as Blob;
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
            gallery: 'true',
          },
          body: JSON.stringify({
            fileName: name,
            fileType: contentType,
            code,
          }),
        });

        if (!response.ok) {
          const text = await response.text();
          console.error('Server responded with:', text);
          throw new Error('Server error');
        }

        const {presignedUrl} = await response.json();

        const uploadToR2Response = await fetch(presignedUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': contentType,
          },
          body: blob,
        });

        if (!uploadToR2Response.ok) {
          console.error('Failed to upload file to R2');
        }
        console.log('Upload to R2 success');
        const url = `${CLOUDFLARE_R2_PUBLIC_URL}${code}/gallery/${filename}`;
        return url;
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
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
            const cloudflareUrl: string | undefined =
              await uploadImageToCloudflare(source.uri);
            queryClient.invalidateQueries(['gallery', code]);
            setIsImageUpload(false);
          } catch (error) {
            console.error('Error uploading image to Cloudflare:', error);
            setIsImageUpload(false);
          }
        }
      }
    });
  }, [
    setIsImageUpload,
    slugify,
    uriToBlobFunction,
    CLOUDFLARE_WORKER_DEV,
    CLOUDFLARE_WORKER,
    code,
    CLOUDFLARE_R2_PUBLIC_URL,
    launchImageLibrary,
  ]);

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          height: height * 0.5,

          alignItems: 'center',
        }}>
        <TouchableOpacity
          style={styles.uploadGalleryButton}
          onPress={handleUploadMoreImages}>
          {isImageUpload ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.uploadButtonTextGalleryButton}>
              อัพโหลดภาพตัวอย่างผลงาน
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }
  console.log('code',code)

  return (
    <Modal isVisible={isVisible} style={styles.modal} onBackdropPress={onClose}>
      {isImageUpload ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator />
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.onCloseButton} onPress={onClose}>
              <FontAwesomeIcon icon={faClose} size={32} color="gray" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={galleryImages}
            numColumns={3}
            ListEmptyComponent={
              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleUploadMoreImages} style={styles.selectButton}>
                  <View style={styles.containerButton}>
                    <FontAwesomeIcon
                      icon={faCamera}
                      color="#0073BA"
                      size={14}
                    />

                    <Text style={styles.selectButtonText}>เลือกจากอัลบั้ม</Text>
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
                style={[styles.uploadButton, styles.uploadMoreButton]}
                onPress={handleUploadMoreImages}>
                <Text style={styles.uploadButtonText}>เพิ่มรูปภาพ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadButton, styles.saveButton]}
                onPress={() => onClose()}>
                <Text style={styles.uploadButtonText}>บันทึก</Text>
              </TouchableOpacity>
            </View>
          )}

          <Modal
            isVisible={modalVisible}
            onBackdropPress={() => setModalVisible(false)}>
            <View style={styles.modalContainer}>
              <Image source={{uri: selectedImage}} style={styles.modalImage} />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}>
                <Text>Close</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      )}
    </Modal>
  );
};

export default GalleryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    width,
  },
  imageContainer: {
    width: imageContainerWidth,
    flexDirection: 'column',
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
    justifyContent: 'space-between',
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
    justifyContent: 'flex-start',
    paddingVertical: 10,
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
});
