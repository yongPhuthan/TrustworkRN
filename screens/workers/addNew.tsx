import React, {useState, useCallback, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
} from 'react-native';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faCamera} from '@fortawesome/free-solid-svg-icons';
import {ParamListBase, ProductItem} from '../../types/navigationType';
import {RouteProp} from '@react-navigation/native';
import {useUriToBlob} from '../../hooks/utils/image/useUriToBlob';
import {Store} from '../../redux/store';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {BACK_END_SERVER_URL} from '@env';
import {useUser} from '../../providers/UserContext';
import {useSlugify} from '../../hooks/utils/useSlugify';
import {StackNavigationProp} from '@react-navigation/stack';
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
type Props = {
  navigation: StackNavigationProp<ParamListBase, 'AddNewWorker'>;
  route: RouteProp<ParamListBase, 'AddNewWorker'>;
};

const AddNewWorker = ({navigation}: Props) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const queryClient = useQueryClient();
  const [image, setImage] = useState<string | null>(null);
  const uriToBlobFunction = useUriToBlob();
  const [isImageUpload, setIsImageUpload] = useState(false);
  const user = useUser();
  const createWorker = async () => {
    if (!user || !user.email || !image || !title || !description) {
      console.error('User or user email or Image is not available');
      return;
    }
    const imageUrl = await uploadImageToFbStorage(image);
    const data = {
      title,
      description,
      image: imageUrl,
    };
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/company/createWorker`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({data}),
        },
      );
      if (!response.ok) {
        if (response.status === 401) {
          const errorData = await response.json();
          if (
            errorData.message ===
            'Token has been revoked. Please reauthenticate.'
          ) {
          }
          throw new Error(errorData.message);
        }
        throw new Error('Network response was not ok.');
      }
    } catch (err) {
      console.log(err);
    }
  };
  const {mutate, isLoading} = useMutation(createWorker, {
    onSuccess: () => {
      queryClient.invalidateQueries(['workers', code]);
      navigation.goBack();
    },
    onError: () => {
      console.log('onError');
    },
  });

  const {
    state: {code},
    dispatch,
  }: any = useContext(Store);
  const slugify = useSlugify();
  const pickImage = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo' as MediaType,
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
            setImage(source.uri);
            setIsImageUpload(false);
          } catch (error) {
            console.error('Error uploading image to Cloudflare:', error);
            setIsImageUpload(false);
          }
        }
      }
    });
  };
  const uploadImageToFbStorage = async (imagePath: string) => {
    if (!imagePath) {
      console.log('No image path provided');
      return;
    }
    if (!user || !user.email) {
      throw new Error('User or user email is not available');
    }

    const name = imagePath.substring(imagePath.lastIndexOf('/') + 1);
    const fileType = imagePath.substring(imagePath.lastIndexOf('.') + 1);
    const filename = slugify(name);

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

    const blob = (await uriToBlobFunction(imagePath)) as Blob;
    const filePath = __DEV__
      ? `Test/${code}/workers/${filename}`
      : `${code}/workers/${filename}`;
    try {
      const token = await user.getIdToken(true);

      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/upload/postImageApprove`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            filePath,
            contentType: contentType,
          }),
        },
      );

      if (!response.ok) {
        const text = await response.text();
        console.error('Server responded with:', text);
        throw new Error('Server error');
      }

      const {signedUrl, publicUrl} = await response.json();

      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: blob,
      });

      if (!uploadResponse.ok) {
        console.error('Failed to upload file to Firebase Storage');
        return;
      }
      console.log('Upload to Firebase Storage success');

      // publicUrl is the URL of the uploaded image
      return publicUrl;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const onDisbledButton = () => {
    if (!image || !title || !description) {
      return true;
    }
    return false;
  };

  if (isLoading || isImageUpload) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.imageUploader}>
        {image ? (
          <Image source={{uri: image}} style={styles.image} />
        ) : (
          <FontAwesomeIcon icon={faCamera} size={40} color="gray" />
        )}
      </TouchableOpacity>
      <Text style={styles.label}>ชื่อช่าง</Text>

      <TextInput
        placeholder="ชื่อจริง นามสกุล ช่าง"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <Text style={styles.label}>เป็นช่างอะไร</Text>

      <TextInput
        placeholder="เช่น ช่างอลูมิเนียม"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />
      <TouchableOpacity
        disabled={!onDisbledButton}
        style={styles.addButton}
        onPress={() => mutate()}>
        <Text style={styles.addButtonText}>บันทึก</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  imageUploader: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    backgroundColor: '#f0f0f0',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  addButton: {
    backgroundColor: 'blue',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default AddNewWorker;
