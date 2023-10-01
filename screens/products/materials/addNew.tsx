import React, {useState, useCallback,useContext,useEffect} from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import {ParamListBase, ProductItem} from '../../../types/navigationType';
import {useUriToBlob} from '../../../hooks/utils/image/useUriToBlob';
import {useSlugify} from '../../../hooks/utils/useSlugify';
import {v4 as uuidv4} from 'uuid';
import {useQuery, useQueryClient, useMutation} from '@tanstack/react-query';

import {RouteProp} from '@react-navigation/native';
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
  import {Store} from '../../../redux/store';
  import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
  import firebase, {
    testFirebaseConnection,
    testFunctionsConnection,
  } from '../../../firebase';
import {StackNavigationProp} from '@react-navigation/stack';
type Props = {
    navigation: StackNavigationProp<ParamListBase, 'AddNewMaterial'>;
    route: RouteProp<ParamListBase, 'AddNewMaterial'>;
  };


  const createMaterial = async ( data: any) => {
    const user = auth().currentUser;
    if(!user) return; 
    const idToken = await user.getIdToken();

    let url;
    if (__DEV__) {
      url = `http://${HOST_URL}:5001/${PROJECT_FIREBASE}/asia-southeast1/appAddNewMaterials`;
    } else {
      url = `https://asia-southeast1-${PROJECT_FIREBASE}.cloudfunctions.net/appAddNewMaterials`;
    }
  
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
  };

const AddNewMaterial = ({navigation}: Props) => {
  const [title, setTitle] = useState<string>('');
  const [isImageUpload, setIsImageUpload] = useState(false);
  const [description, setDescription] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const uriToBlobFunction = useUriToBlob();
  const slugify = useSlugify();
  const queryClient = useQueryClient();

  const {
    state: { code,},
    dispatch,
  }: any = useContext(Store);
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
              setImage(source.uri)
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
          materials: 'true',
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

  const handleSave = useCallback(async () => {
    if (!title || !description || !image) {
      return;
    }
    setIsImageUpload(true);
   const imageUrl = await uploadImageToCloudflare(image);
    setIsImageUpload(false);
    const data = {
      id:uuidv4() ,
      name:title,
      description,
      image:imageUrl,
      code,
    };
    await createMaterial(data);
    queryClient.invalidateQueries(['existingProduct', code]);

    navigation.goBack();
  }
  , [title, description, image, code, navigation])



  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.imageUploader}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
            <FontAwesomeIcon
            icon={faCamera}
            size={40}
            color="gray"
          />
        )}
      </TouchableOpacity>
      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        multiline
      />
      <TouchableOpacity style={styles.addButton} onPress={()=>handleSave( )} >
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
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default AddNewMaterial;
