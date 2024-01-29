import React, {useState, useCallback, useContext} from 'react';
import {
  View,
  Text,

  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Alert,
  Image,
  StyleSheet,
} from 'react-native';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Checkbox,TextInput} from 'react-native-paper';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faCamera, faClose} from '@fortawesome/free-solid-svg-icons';
import {ParamListBase, ProductItem} from '../../types/navigationType';
import {RouteProp} from '@react-navigation/native';
import {useForm, useWatch, Controller, set} from 'react-hook-form';
import firebase from '../../firebase';
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
import SaveButton from '../ui/Button/SaveButton';

interface ExistingModalProps {
  isVisible: boolean;
  onClose: () => void;
}
enum WorkerStatus {
  MAINWORKER = 'MAINWORKER',
  OUTSOURCE = 'OUTSOURCE',
}

const AddNewWorker = ({isVisible, onClose}: ExistingModalProps) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const queryClient = useQueryClient();
  const uriToBlobFunction = useUriToBlob();
  const [isImageUpload, setIsImageUpload] = useState(false);
  const user = useUser();
  const {
    register,
    handleSubmit,
    control,
    getValues,
    watch,
    setValue,
    formState: {errors, isValid, isDirty},
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      mainSkill: '',
      image: '',
      workerStatus: WorkerStatus.OUTSOURCE,
    },
  });
  const image = watch('image');
  const {
    state: {code},
    dispatch,
  }: any = useContext(Store);
  const slugify = useSlugify();
  const pickImage = async onChange => {
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
            onChange(source.uri); // Update the form field with the new image URI
            setIsImageUpload(false);
          } catch (error) {
            console.error('Error uploading image to Cloudflare:', error);
            setIsImageUpload(false);
          }
        }
      }
    });
  };

  const createWorker = async () => {
    if (!user || !user.email || !isValid) {
      console.error('User or user email or Image is not available');
      return;
    }
  
    try {
      // Start the image upload and wait for it to finish
      const imageUrl = await uploadImageToFbStorage(image);
      if (!imageUrl) {
        // Handle the case where the image upload fails
        Alert.alert(
          'Upload Failed',
          'Failed to upload the image. Please try again.', 
          [{text: 'OK'}],
          {cancelable: false},
        );
        return;
      }
  
      // Prepare the data with the URL of the uploaded image
      const data = {
        name: getValues('name'),
        mainSkill: getValues('mainSkill'),
        workerStatus: getValues('workerStatus'),
        code,
        image: imageUrl,
      };
  
      // Proceed with creating the worker using the image URL
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
        const errorData = await response.json();
        const errorMessage = errorData.message || 'An unexpected error occurred.';
        throw new Error(errorMessage);
      }
  
      // Handle successful worker creation here, if necessary
  
    } catch (err) {
      // Handle errors from image upload or worker creation
      console.error('An error occurred:', err);
      Alert.alert(
        'เกิดข้อผิดพลาด',
        'An error occurred while creating the worker. Please try again.', 
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    }
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
    const filePath = __DEV__
      ? `Test/${code}/workers/${filename}`
      : `${code}/workers/${filename}`;
    try {
      const reference = firebase.storage().ref(filePath);
      const task = reference.putFile(imagePath, { contentType });

    return new Promise((resolve, reject) => {
      task.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress.toFixed(2) + '% done');
          switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
              console.log('Upload is paused');
              break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
              console.log('Upload is running');
              break;
          }        },
        (error) => {
          // Handle unsuccessful uploads
          console.error('Upload failed:', error);
          reject(error);
        },
        async () => {
          // Upload completed successfully, now we can get the download URL
          const url = await reference.getDownloadURL();
          console.log('Upload to Firebase Storage success', url);
          resolve(url);
        }
      );
    });
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };
  const {mutate, isLoading} = useMutation(createWorker, {
    onSuccess: () => {
      queryClient.invalidateQueries(['workers', code]);
      onClose();
    },
    onError: error => {
      console.log('onError', error);
      
    },
  });

  if (isLoading || isImageUpload) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <FontAwesomeIcon icon={faClose} size={32} color="gray" />
        </TouchableOpacity>
      
      </View>
      <Controller
        control={control}
        
        name="image"
        rules={{required: 'Image is required'}} // Add required rule here
        render={({field: {onChange, value}}) => (
          <TouchableOpacity
            onPress={() => pickImage(onChange)}
            style={styles.imageUploader}>
            {value ? (
              <Image source={{uri: value}} style={styles.image} />
            ) : (
              <FontAwesomeIcon icon={faCamera} size={40} color="gray" />
            )}
          </TouchableOpacity>
        )}
      />


      <Controller
        control={control}
        name="name"
        rules={{required: true}}
        render={({field: {onChange, onBlur, value},fieldState:{error}}) => (
          <TextInput
          mode='outlined'
          label={'ชื่อ-นามสกุลช่าง'}
          error={!!error}
            style={{marginBottom: 20}}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />

      {/* Description Input */}
  
      <Controller
        control={control}
        name="mainSkill"
        rules={{required: true}}
        render={({field: {onChange, onBlur, value},fieldState:{error}}) => (
          <TextInput
          mode='outlined'
          label={'เป็นช่างอะไร ?'}
          error={!!error}
            placeholder="เช่น ช่างอลูมิเนียม..."
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            // style={styles.input}
          />
        )}
      />
                  <Text style={{marginTop:30, fontSize:16,alignItems: 'center'}}>สถาณะ</Text>

      <Controller
        control={control}
        name="workerStatus"
        render={({field: {onChange, value}}) => (
          <View style={styles.checkBoxContainer}>
            <View style={{flexDirection:'row',alignItems: 'center'}}>
            <Checkbox.Android
              status={value === WorkerStatus.MAINWORKER ? 'checked' : 'unchecked'}
              onPress={() => onChange(WorkerStatus.MAINWORKER)}
            />
            <Text style={{fontSize:16}}>ช่างหลักประจำทีม</Text>
            </View>
            <View style={{flexDirection:'row',alignItems: 'center'}}>

            <Checkbox.Android
            
              status={value === WorkerStatus.OUTSOURCE ? 'checked' : 'unchecked'}
              onPress={() => onChange(WorkerStatus.OUTSOURCE)}
            />
            <Text style={{fontSize:16}}>ช่างทั่วไป</Text>
            </View>
          </View>
        )}
      />

      <SaveButton disabled={!isValid} onPress={() => mutate()} />
    </View>
  );
};
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const styles = StyleSheet.create({
  container: {
    margin: 50,
    paddingHorizontal: 20,

    backgroundColor: '#ffffff',
    width: windowWidth,
    height: windowHeight,
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
    borderRadius: 8,
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
  header: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingVertical: 10,
  },
  closeButton: {
    paddingVertical: 10,
  },
  modal: {
    margin: 0,
    marginTop: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  button: {
    width: '90%',
    top: '30%',
    height: 50,
    backgroundColor: '#012b20',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 10,
    marginBottom: 20,
  },
});

export default AddNewWorker;
