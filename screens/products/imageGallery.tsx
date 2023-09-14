import React, {useState,useCallback} from 'react';
import {
  View,
  Image,
  Modal,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {ParamListBase, ProductItem} from '../../types/navigationType';
import {RouteProp} from '@react-navigation/native';
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
  CLOUDFLARE_R2_PUBLIC_URL,
  CLOUDFLARE_WORKER_GALLERY,
  CLOUDFLARE_DIRECT_UPLOAD_URL,
} from '@env';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faExpand, faExpandArrowsAlt} from '@fortawesome/free-solid-svg-icons';
import CustomCheckbox from '../../components/CustomCheckbox';
import useImagesQuery from '../../hooks/utils/useImageQuery';
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

const fetchImagesByEmail = async email => {
  const response = await fetch('YOUR_ENDPOINT_URL', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      email: email, // Assuming email is sent as a header
    },
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
};

const mockData: ImageData[] = [
  {
    id: 1,
    url: 'https://pub-7f0b34261a8942cfba2688d40fd2f27d.r2.dev/Rectangle 45 (1).png',
    defaultChecked: false,
  },
  {
    id: 2,
    url: 'https://pub-7f0b34261a8942cfba2688d40fd2f27d.r2.dev/Rectangle 45 (1).png',
    defaultChecked: false,
  },
  {
    id: 1,
    url: 'https://pub-7f0b34261a8942cfba2688d40fd2f27d.r2.dev/Rectangle 45 (1).png',
    defaultChecked: false,
  },
  {
    id: 3,
    url: 'https://pub-7f0b34261a8942cfba2688d40fd2f27d.r2.dev/Rectangle 45 (1).png',
    defaultChecked: false,
  },
  {
    id: 4,
    url: 'https://pub-7f0b34261a8942cfba2688d40fd2f27d.r2.dev/Rectangle 45 (1).png',
    defaultChecked: false,
  },
  {
    id: 5,
    url: 'https://pub-7f0b34261a8942cfba2688d40fd2f27d.r2.dev/Rectangle 45 (1).png',
    defaultChecked: false,
  },
];

const GalleryScreen = ({navigation, route}: Props) => {
  const [data, setData] = useState(mockData);
  const {code} = route.params;
  const [isImageUpload, setIsImageUpload] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  // const {data: images, isLoading, isError} = useImagesQuery(email);
  const handleCheckbox = (id: number) => {
    const updatedData = data.map(img => {
      if (img.id === id) {
        return {...img, defaultChecked: !img.defaultChecked};
      }
      return img;
    });
    setData(updatedData);
  };
  const slugifyString = (str: string) => {
    return str
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/\./g, '-')
      .replace(/-+/g, '-')
      .replace(/[^a-z0-9-]/g, '-');
  };
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

  // const uploadImageToCloudflare = async (imagePath: string, email: string) => {
  //   if (!imagePath) {
  //     console.log('No image path provided');
  //     return;
  //   }

  //   const filename = imagePath.substring(imagePath.lastIndexOf('/') + 1);
  //   const fileType = imagePath.substring(imagePath.lastIndexOf('.') + 1);
  //   const blob = (await uriToBlob(imagePath)) as Blob;
  //   const CLOUDFLARE_ENDPOINT = __DEV__
  //     ? CLOUDFLARE_WORKER_DEV
  //     : CLOUDFLARE_WORKER_GALLERY;

  //   let contentType = '';
  //   switch (fileType.toLowerCase()) {
  //     case 'jpg':
  //     case 'jpeg':
  //       contentType = 'image/jpeg';
  //       break;
  //     case 'png':
  //       contentType = 'image/png';
  //       break;
  //     default:
  //       console.error('Unsupported file type:', fileType);
  //       return;
  //   }

  //   try {

  //     const folderListing = await fetch(`${CLOUDFLARE_ENDPOINT}`, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         email: email,
  //       },
  //     });

  //     if (!folderListing.ok) {
  //       throw new Error(`Error fetching folder listing. Server responded with status: ${folderListing.status}`);
  //     }
      
  //     const JSON_CONTENT_TYPE = 'application/json; charset=UTF-8';
  //     const STATUS_BAD_REQUEST = 400;      
  //     const folderData = await folderListing.json();

  //     if (folderData && folderData.message) {
  //       console.error('Server responded with:', folderData.message);
  //       throw new Error(folderData.message);
  //     }

  //     if (
  //       folderData &&
  //       folderData.objects &&
  //       folderData.objects.some(obj => obj.name && obj.name.startsWith(email))
  //     ) {
  //       console.log('Folder with email name exists');
  //       await uploadImage(blob, `${email}/${filename}`, contentType, email);
  //     } else {
  //       console.log('Folder with email name does not exist');
  //       // Logic to create a new folder and then upload the image
  //       await uploadImage(blob, `${email}/${filename}`, contentType, email);
  //     }
  //   } catch (error) {
  //     console.error(
  //       'There was a problem with the fetch operation:',
  //       error.message,
  //     );
  //   }
  // };



  // const handleUploadMoreImages = () => {
  //   const options: ImageLibraryOptions = {
  //     mediaType: 'photo' as MediaType,
  //   };

  //   launchImageLibrary(options, async (response: ImagePickerResponse) => {
  //     if (response.didCancel) {
  //     } else if (response.errorMessage) {
  //     } else if (response.assets && response.assets.length > 0) {
  //       const source = {uri: response.assets[0].uri ?? null};
  //       console.log('Image source:', source);

  //       if (source.uri) {
  //         try {
  //           await uploadImageToCloudflare(source.uri, code);
  //           // You might want to refetch the images after successful upload
  //           // to reflect the newly uploaded image in the gallery
  //         } catch (error) {
  //           console.error('Error uploading image to Cloudflare:', error);
  //         }
  //       }
  //     }
  //   });
  // };


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
      const filename = slugifyString(name);

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
            // setLogo(cloudflareUrl ?? '');
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
    slugifyString,
    uriToBlob,
    CLOUDFLARE_WORKER_DEV,
    CLOUDFLARE_WORKER,
    code,
    CLOUDFLARE_R2_PUBLIC_URL,
    launchImageLibrary,
  ]);

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
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
        keyExtractor={item => item.id.toString()}
      />

      <TouchableOpacity
        style={styles.uploadButton}
        onPress={handleUploadMoreImages}>
        <Text style={styles.uploadButtonText}>Upload more image</Text>
      </TouchableOpacity>
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
  saveButton: {
    backgroundColor: '#3498DB',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  imageContainer: {
    flex: 1,
    flexDirection: 'column',
    margin: 5,
    position: 'relative',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
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
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 15,
    borderRadius: 5,
    backgroundColor: '#3498DB', // You can use a gradient here for a more modern look
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  uploadButtonText: {
    marginLeft: 10,
    color: 'white',
    fontWeight: 'bold',
  },
});
