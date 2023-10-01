import React, {useState, useCallback, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faCamera} from '@fortawesome/free-solid-svg-icons';
import {ParamListBase, ProductItem} from '../../types/navigationType';
import {RouteProp} from '@react-navigation/native';
import {useUriToBlob} from '../../hooks/utils/image/useUriToBlob';
import {Store} from '../../redux/store';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';

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
const createWorker = async (data: any) => {
  const user = auth().currentUser;
  if(!user) return; // return if user is null
  
  let url;
  
  if (__DEV__) {
    url = `http://${HOST_URL}:5001/${PROJECT_FIREBASE}/asia-southeast1/appAddNewWorker`;
  } else {
    url = `https://asia-southeast1-${PROJECT_FIREBASE}.cloudfunctions.net/appAddNewWorker`;
  }
  
  try {
    const idToken = await user.getIdToken(); 
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`, 
      },
      body: JSON.stringify({data}),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

  } catch(err) {
    console.error(err);
  }
};




const AddNewWorker = ({navigation}: Props) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const uriToBlobFunction = useUriToBlob();
  const [isImageUpload, setIsImageUpload] = useState(false);

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
          workers: 'true',
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
      return `${CLOUDFLARE_R2_PUBLIC_URL}${filename}`;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const addNewWorker = async () => {
    if (!title || !description || !image) {
      console.log('Missing required fields');
      return;
    }
    setIsImageUpload(true);
    const imageUrl = await uploadImageToCloudflare(image);
    const data = {
      title,
      description,
      image: imageUrl,
    };
    await createWorker(data);
    setIsImageUpload(false);
    navigation.goBack();
  };

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
      <TouchableOpacity style={styles.addButton} onPress={() => addNewWorker()}>
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
