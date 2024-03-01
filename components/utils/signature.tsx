// SignatureComponent.js
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import FastImage from 'react-native-fast-image';
import firebase from '../../firebase';
import {v4 as uuidv4} from 'uuid';

import {
  BACK_END_SERVER_URL
} from '@env';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useFormContext,
  useWatch
} from 'react-hook-form';
import {
  Appbar,
  Button,
  List,
  Checkbox,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import {
  
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Signature from 'react-native-signature-canvas';
import { useSlugify } from '../../hooks/utils/useSlugify';
import { useUser } from '../../providers/UserContext';
import { Store } from '../../redux/store';
interface SignaturePadProps {
  setSignatureUrl: React.Dispatch<React.SetStateAction<string | null>>;
  onSignatureSuccess?: () => void;
  onClose: () => void;
}

const SignatureComponent = ({
  onSignatureSuccess,
  setSignatureUrl,

  onClose,
}: SignaturePadProps) => {
  const ref = useRef<any>();
  const [isImageUpload, setIsImageUpload] = useState(false);
  const [isSigned, setIsSigned] = useState(false); 

  const [createNewSignature, setCreateNewSignature] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const slugify = useSlugify();
const imageId = uuidv4();
  const user = useUser();
  const [isSignatureUpload, setIsSignatureUpload] = useState<boolean>(false);
  const context = useFormContext();
  const {
    register,
    control,
    getValues,
    setValue,
    watch,
    formState: {errors},
  } = context;
  const {
    state: {code},
    dispatch,
  }: any = useContext(Store);

  const updateCompanySignature = async (data: any) => {
    if (!user || !user.email) {
      throw new Error('User or user email is not available');
    }
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/company/updateCompanySignature?code=${encodeURIComponent(
          code,
        )}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({data}),
        },
      );

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          const errorData = await response.json(); // Parse the error response only if it's JSON
          throw new Error(errorData.message || 'Network response was not ok.');
        } else {
          throw new Error('Network response was not ok and not JSON.');
        }
      }

      if (response.status === 200) {
        return response.json();
      } else {
        const errorData = await response.json();
        console.error('Response:', await response.text());
        throw new Error(errorData.message || 'Network response was not ok.');
      }
    } catch (err) {
      console.error('Error in updateContractAndQuotation:', err);
      throw new Error(err as any);
    }
  };

  const { mutate, isLoading } = useMutation(updateCompanySignature, {
    onError: (error : any) => {
      Alert.alert(
        'Update Error',
        `Server-side user creation failed: ${error.message}`,
        [{ text: 'OK' }],
        { cancelable: false }
      );
    },
  });
  const companySignature = useWatch({
    control: control,
    name: 'companyUser.signature',
  });



  const sellerSignature = useWatch({
    control: control,
    name: 'sellerSignature',
  });

  const uploadFileToFirebase = async (imageUri: string): Promise<string | null> => {
    setIsSignatureUpload(true);
  
    if (!user) {
      console.error('User is not authenticated');
      setIsSignatureUpload(false);
      return null;
    }
  
    if (!user.email) {
      console.error('User email is not available');
      setIsSignatureUpload(false);
      return null; 
    }
  
    const filename = `signature${code}.png`;
    const storagePath = `${code}/signature/${filename}${imageId}`
  
    try {
      const storageRef = firebase.storage().ref(storagePath);
      const base64String = imageUri.split(',')[1];
      console.log('base64String', base64String);
  
      const snapshot = await storageRef.putString(base64String, 'base64', {
        contentType: 'image/png',
      });
  
      if (!snapshot.metadata) {
        console.error('Snapshot metadata is undefined');
        return null; 
      }
  
      console.log('Uploaded a base64 string!', snapshot);
  
      // Use getDownloadURL to get the URL for the uploaded file
      const downloadUrl = await storageRef.getDownloadURL();
      console.log('File uploaded successfully. URL:', downloadUrl);
  
      return downloadUrl;
    } catch (error) {
      console.error('Error uploading file to Firebase:', error);
      return null; 
    } finally {
      setIsSignatureUpload(false);
    }
  };
  

  const handleUploadNewSignatureAndSave = useCallback(
    async (signature:string) => {
      if (!signature) {
        return;
      }
  
      try {
        setIsImageUpload(true);
        const imageUrl = await uploadFileToFirebase(signature);
  
        if (!imageUrl) {
          throw new Error("Image upload failed");
        }
  
        await mutate(imageUrl);
        setValue('companyUser.signature', imageUrl, { shouldDirty: true });
        setValue('sellerSignature', imageUrl, { shouldDirty: true });
        setCreateNewSignature(false);
      } catch (error:any) {
        Alert.alert(
          'Upload Error',
          `An error occurred during the upload: ${error.message}`,
          [{ text: 'OK' }],
          { cancelable: false }
        );
      } finally {
        setIsImageUpload(false);
        onClose();
      }
    },
    [mutate, setValue, setCreateNewSignature, onClose]
  );
  const handleBegin = () => {
    setIsSigned(true);
  };
  const handleSave = (signatureUrl: string) => {
    setValue('sellerSignature', signatureUrl, {shouldDirty: true});
    setCreateNewSignature(false);
    onClose();
  };

  useEffect(() => {
    if (companySignature === 'none' || null || '' || !companySignature) {
      setCreateNewSignature(true);
    }
  }, [companySignature, setValue, sellerSignature]);

  useEffect(() => {
    if (companySignature) {
      Image.prefetch(companySignature)
        .then(() => console.log('Image prefetched!'))
        .catch(error => console.error('Error prefetching image:', error));
    }
  }, [companySignature]);
  const style = `.m-signature-pad--footer {display: none; margin: 0px;}`;
  const handleClear = () => {
    setIsSigned(false);

    ref.current.clearSignature();

  };

  const handleConfirm = () => {
    ref.current.readSignature();
  };
  return (
    <>
      {isSignatureUpload || isLoading ? (
        <ActivityIndicator style={styles.loadingContainer} size="large" />
      ) : !createNewSignature ? (
        <>
          <View style={styles.containerExist}>
            <View style={styles.textContainer}>
              <View style={styles.underline} />

              {companySignature  && (
                <FastImage
                  style={styles.image}
                  source={{
                    uri: companySignature,
                    priority: FastImage.priority.normal,
                    cache: FastImage.cacheControl.web,
                  }}
                />
              )}

              <TouchableOpacity
                onPress={() => handleSave(companySignature)}
                style={styles.btn}>
                <Text style={styles.label}>ใช้ลายเซ็นเดิม</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.orContainer}>
            <Text style={styles.orText}>หรือ</Text>

            <TouchableOpacity
              onPress={
                () => setCreateNewSignature(true)
                // setValue('companyUser.signature', '', {shouldDirty: true})
              }>
              <Text style={styles.textLink}>เปลี่ยนลายเซ็นใหม่</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.container}>
          <View>
          <Signature
            penColor="#0000FF"
            webStyle={style}
            onBegin={handleBegin}
            style={{ width: 300}}
            ref={ref}
            onOK={img => handleUploadNewSignatureAndSave(img)}
            onEmpty={() => console.log('Empty')}
            descriptionText="เซ็นเอกสารด้านบน"
          />
          </View>
         
          <View style={styles.row}>
          <Button mode='outlined' icon="autorenew" onPress={handleClear} >เซ็นใหม่</Button>
        <Button mode='contained' disabled={!isSigned} icon="check-bold"  onPress={handleConfirm} >บันทึก</Button>
        </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  containerExist: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 2,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    height: 400,
    padding: 10,
  },
  underline: {
    height: 1,
    flex: 1,
    backgroundColor: 'grey',
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  image: {
    width: 230,
    height: 250,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 40,
    backgroundColor: '#0073BA',
  },
  textLink: {
    color: '#0073BA',
    // textDecorationLine: 'underline',

    fontSize: 16,
  },
  label: {
    fontSize: 16,
    color: 'white',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    alignItems: "center",
  },
});

export default SignatureComponent;
