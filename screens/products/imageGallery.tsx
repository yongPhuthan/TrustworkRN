import React, {useState, useCallback,useContext} from 'react';
import {
  View,
  Image,
  Modal,
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
import {set} from 'react-hook-form';
type ImageData = {
  id: number;
  url: string;
  defaultChecked: boolean;
};

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
        'code': code, 
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
const GalleryScreen = ({navigation, route}: Props) => {
  const {code} = route.params;
  const [isImageUpload, setIsImageUpload] = useState(false);
  const [galleryImages, setGalleryImages] = useState<ImageData[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [responseLog, setResponseLog] = useState<string | null>(null);
  const {
    state: {serviceList, selectedAudit,serviceImages},
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

    const urls = updatedData.filter(img => img.defaultChecked).map(img => img.url);
    dispatch(stateAction.service_images(urls));
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
            console.log('Cloudflare URL:', cloudflareUrl);
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
  if (isLoading) {
    return (

      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }
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
          <ActivityIndicator  size="small" color="white" />
        ) :(
          <Text style={styles.uploadButtonTextGalleryButton}>
          อัพโหลดภาพตัวอย่างผลงาน
        </Text>
        )}
      
      </TouchableOpacity>
    </View>
    )
  }


  // thubnail upload to cloudflare
  // const handleUploadMoreImages = useCallback(() => {
  //   setIsImageUpload(true);
  //   const options: ImageLibraryOptions = {
  //     mediaType: 'photo' as MediaType,
  //   };
  //   const uploadImageToCloudflare = async (imagePath: string) => {
  //     if (!imagePath) {
  //       console.log('No image path provided');
  //       return;
  //     }
  //     const name = imagePath.substring(imagePath.lastIndexOf('/') + 1);
  //     const fileType = imagePath.substring(imagePath.lastIndexOf('.') + 1);
  //     const filename = slugify(name);

  //     const blob = (await uriToBlobFunction(imagePath)) as Blob;
  //     const CLOUDFLARE_ENDPOINT = __DEV__
  //       ? CLOUDFLARE_WORKER_DEV
  //       : CLOUDFLARE_WORKER;

  //     let contentType = '';
  //     switch (fileType.toLowerCase()) {
  //       case 'jpg':
  //       case 'jpeg':
  //         contentType = 'image/jpeg';
  //         break;
  //       case 'png':
  //         contentType = 'image/png';
  //         break;
  //       default:
  //         console.error('Unsupported file type:', fileType);
  //         return;
  //     }

  //     try {
  //       const response = await fetch(`${CLOUDFLARE_ENDPOINT}${filename}`, {
  //         method: 'POST',
  //         headers: {
  //           gallery: 'true',
  //         },
  //         body: JSON.stringify({
  //           fileName: name,
  //           fileType: contentType,
  //           code,
  //         }),
  //       });

  //       if (!response.ok) {
  //         const text = await response.text();
  //         console.error('Server responded with:', text);
  //         throw new Error('Server error');
  //       }

  //       const {presignedUrl} = await response.json();

  //       const uploadToR2Response = await fetch(presignedUrl, {
  //         method: 'PUT',
  //         headers: {
  //           'Content-Type': contentType,
  //         },
  //         body: blob,
  //       });

  //       if (!uploadToR2Response.ok) {
  //         console.error('Failed to upload file to R2');
  //       }
  //       console.log('Upload to R2 success');
  //       const url = `${CLOUDFLARE_R2_PUBLIC_URL}${code}/gallery/${filename}`;
  //       return url;
  //     } catch (error) {
  //       console.error('There was a problem with the fetch operation:', error);
  //     }
  //   };

  //   launchImageLibrary(options, async (response: ImagePickerResponse) => {
  //     if (response.didCancel) {
  //       console.log('User cancelled image picker');
  //       setIsImageUpload(false);
  //     } else if (response.errorMessage) {
  //       console.log('ImagePicker Error: ', response.errorMessage);
  //       setIsImageUpload(false);
  //     } else if (response.assets && response.assets.length > 0) {
  //       const source = {uri: response.assets[0].uri ?? null};
  //       console.log('Image source:', source);

  //       if (source.uri) {
  //         try {
  //           // Resize for thumbnail:
  //           const thumbnailWidth = width / 3 - 10; // As per your specification
  //           const thumbnailUri = await resizeImageForUpload(
  //             source.uri,
  //             thumbnailWidth,
  //             thumbnailWidth,
  //           );

  //           // Resize for original (assuming you want to keep its original aspect ratio but limit its max dimension to some value):
  //           const maxOriginalDimension = 1024; // Or whatever value you want
  //           if (
  //             response.assets &&
  //             response.assets.length > 0 &&
  //             response.assets[0].width &&
  //             response.assets[0].height
  //           ) {
  //             const aspectRatio =
  //               response.assets[0].width / response.assets[0].height;
  //             const originalWidth =
  //               aspectRatio > 1
  //                 ? maxOriginalDimension
  //                 : maxOriginalDimension * aspectRatio;
  //             const originalHeight =
  //               aspectRatio > 1
  //                 ? maxOriginalDimension / aspectRatio
  //                 : maxOriginalDimension;
  //             const originalUri = await resizeImageForUpload(
  //               source.uri,
  //               originalWidth,
  //               originalHeight,
  //             );

  //             // Now upload both:
  //             const cloudflareThumbnailUrl = await uploadImageToCloudflare(
  //               thumbnailUri,
  //             );
  //             const cloudflareOriginalUrl = await uploadImageToCloudflare(
  //               originalUri,
  //             );

  //             queryClient.invalidateQueries(['gallery', code]);

  //             console.log('Cloudflare Thumbnail URL:', cloudflareThumbnailUrl);
  //             console.log('Cloudflare Original URL:', cloudflareOriginalUrl);

  //             setIsImageUpload(false);
  //           } else {
  //             console.error('Image dimensions not found');
  //             setIsImageUpload(false);
  //           }
  //         } catch (error) {
  //           console.error('Error uploading image to Cloudflare:', error);
  //           setIsImageUpload(false);
  //         }
  //       }
  //     }
  //   });
  // }, [
  //   setIsImageUpload,
  //   slugify,
  //   uriToBlobFunction,
  //   CLOUDFLARE_WORKER_DEV,
  //   CLOUDFLARE_WORKER,
  //   code,
  //   CLOUDFLARE_R2_PUBLIC_URL,
  //   launchImageLibrary,
  // ]);
  return (
    <View style={styles.container}>
      <FlatList
        data={galleryImages}
        numColumns={3}
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
            <Text style={styles.uploadButtonText}>เพิ่มรูปภาพ55</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.uploadButton, styles.saveButton]}
            onPress={()=>navigation.goBack()}>
            <Text style={styles.uploadButtonText}>บันทึก</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
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
  );
};

export default GalleryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
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
});
