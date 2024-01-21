import React, {useRef, useContext, useState} from 'react';
import {StackScreenProps} from '@react-navigation/stack';
import {ParamListBase} from '../../types/navigationType';
import {StackNavigationProp} from '@react-navigation/stack';
import {View, Text, StyleSheet, Image, Alert} from 'react-native';
import Signature from 'react-native-signature-canvas';
import SignatureScreen from 'react-native-signature-canvas';
import {useUser} from '../../providers/UserContext';
import {BACK_END_SERVER_URL} from '@env';
import {useSignatureUpload} from '../../hooks/utils/image/useSignatureUpload';
import {ActivityIndicator} from 'react-native-paper';
import {useUpdateContract} from '../../hooks/contract/useUpdateContract';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {Store} from '../../redux/store';
import base64 from 'react-native-base64';
import firebase from '../../firebase';
type SignatureScreenProps = StackNavigationProp<ParamListBase, 'Signature'>;

type Props = SignatureScreenProps &
  StackScreenProps<ParamListBase, 'Signature'>;

const SignaturePage: React.FC<Props> = ({route, navigation}) => {
  const ref = useRef<any>();
  const {
    state: {code},
    dispatch,
  }: any = useContext(Store);
  const user = useUser();
  const { data} = route.params;
  // const {updateContract, dataApi, error} = useUpdateContract();
  const queryClient = useQueryClient();
  const [isSignatureUpload, setIsSignatureUpload] = useState<boolean>(false);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  // const {isSignatureUpload, signatureUrl, handleSignatureUpload} =
  //   useSignatureUpload();

  const updateQuotation = async (data: any) => {
    if (!user || !user.email) {
      console.error('User or user email is not available');
      return;
    }
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(
        `${BACK_END_SERVER_URL}/api/documents/updateQuotationPeriod`,
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
        if (response.status === 401) {
          const errorData = await response.json();
          if (
            errorData.message ===
            'Token has been revoked. Please reauthenticate.'
          ) {
          }
        }
        throw new Error('Network response was not ok.');
      }
    } catch (err) {
      Alert.alert('Error', err.message); 
      throw err;


    }
  };

  const {mutate, isLoading} = useMutation(updateQuotation, {
    onSuccess: () => {
      queryClient.invalidateQueries(['dashboardData']);
      const newId = data?.id.slice(0, 8) as string;
      console.log('SUCCESS');
      navigation.navigate('DocViewScreen', {id: data?.id});
    },
    onError: (error: any) => {
      console.error('There was a problem calling the function:', error);
      let errorMessage = 'An unexpected error occurred';

      if (error.response && error.response.status === 401) {
        errorMessage = 'Authentication error. Please re-login.';
      } else if (error.response) {
        errorMessage = error.response.data.error || errorMessage;
      }

      Alert.alert('Error', errorMessage);
    },
  });

  const uploadFileToFirebase = async (imageUri: string) => {
    setIsSignatureUpload(true);

    if (!user) {
      console.error('User is not authenticated');
      setIsSignatureUpload(false);
      return;
    }

    if (!user.email) {
      console.error('User email is not available');
      setIsSignatureUpload(false);
      return;
    }

    const filename = `signature${code}.png`;
    const storagePath = __DEV__
      ? `Test/${code}/signature/${filename}`
      : `${code}/signature/${filename}`;
    try {
      const storageRef = firebase.storage().ref(storagePath);
      const base64String = imageUri.split(',')[1];
      const snapshot = await storageRef.putString(base64String, 'base64', {
        contentType: 'image/png',
      });

      if (!snapshot.metadata) {
        console.error('Snapshot metadata is undefined');
        return;
      }

      console.log('Uploaded a base64 string!', snapshot);

      // Construct the download URL manually
      const bucket = snapshot.metadata.bucket;
      const path = encodeURIComponent(snapshot.metadata.fullPath);
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${path}?alt=media`;

      console.log('File uploaded successfully. URL:', publicUrl);
      setSignatureUrl(publicUrl);
      data.sellerSignature = publicUrl;
      if (publicUrl) {
        console.log('data sellerSignature', data);
        console.log('signatureUrlJAA', signatureUrl);

        await mutate(data);
      }
      return publicUrl;
    } catch (error) {
      console.error('Error uploading file to Firebase:', error);
    } finally {
      setIsSignatureUpload(false);
    }
  };

  const handleOkAction = async signature => {
    try {
      setSignatureUrl(signature);
      const publicUrl = await uploadFileToFirebase(signature);
      if (publicUrl) {
        setSignatureUrl(publicUrl);
      }
    } catch (error) {
      console.error('Failed to upload the signature:', error);
    }
  };

  // const uploadFileToFirebase = async (imageUri: string) => {
  //   console.log('imageUri', imageUri);
  //   setIsSignatureUpload(true);
  //   if (!user || !user.email) {
  //     console.error('User or user email is not available');
  //     setIsSignatureUpload(false);
  //     return;
  //   }

  //   const filename = `signature${code}.png`;
  //   const storagePath = __DEV__
  //     ? `Test/${code}/signature/${filename}`
  //     : `${code}/signature/${filename}`;

  //   try {
  //     const token = await user.getIdToken(true);
  //     const signedUrlResponse = await fetch(
  //       `${BACK_END_SERVER_URL}/api/upload/getSignedUrl`,
  //       {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify({
  //           filename: storagePath,
  //           contentType: 'image/png',
  //         }),
  //       },
  //     );

  //     if (!signedUrlResponse.ok) {
  //       throw new Error('Unable to get signed URL');
  //     }

  //     const {signedUrl} = await signedUrlResponse.json();
  //     console.log('got signed url', signedUrl);

  //     const blob = base64ToBlob(imageUri, 'image/png');

  //     console.log('blob', blob);
  //     const uploadResponse = await fetch(signedUrl, {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'image/png',
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: blob,
  //     });

  //     if (!uploadResponse.ok) {
  //       throw new Error(
  //         `Failed to upload image. Status: ${uploadResponse.status}`,
  //       );
  //     }
  //     const getUrl = await fetch(
  //       `${BACK_END_SERVER_URL}/api/upload/getPublicSignatureUrlSeller`,
  //       {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify({
  //           filePath: storagePath,
  //           contentType: 'image/png',
  //         }),
  //       },
  //     );
  //     if (!getUrl.ok) {
  //       throw new Error('Unable to get public URL');
  //     }
  //     const {publicUrl} = await getUrl.json();
  //     console.log('publicUrl', publicUrl);
  //     setSignatureUrl(publicUrl);

  //     setIsSignatureUpload(false);
  //     return publicUrl;
  //   } catch (error) {
  //     console.error('Error uploading image:', error);
  //     setIsSignatureUpload(false);
  //   }
  // };

  return (
    <>
      {isSignatureUpload || isLoading ? (
        <ActivityIndicator />
      ) : (
        <>
          <View style={styles.container}>
            <SignatureScreen
              ref={ref}
              onOK={img => handleOkAction(img)}
              onEmpty={() => console.log('Empty')}
              clearText="เซ็นใหม่"
              confirmText="ยืนยันลายเซ็น"
            />
          </View>
          <Text
            style={{
              textAlign: 'center',
              marginTop: 10,
            }}>
            เขียนลายเซ็นด้านบนเพื่อเพิ่มลายเซ็นในสัญญา
          </Text>
          {signatureUrl && (
            // Show image after upload complete
            <View style={{alignItems: 'center'}}>
              <Text>ลายเซ็นของคุณ</Text>
              <Image
                source={{uri: signatureUrl}}
                style={{
                  width: 200,
                  height: 200,
                  resizeMode: 'contain',
                  marginTop: 10,
                }}
              />
            </View>
          )}
        </>
      )}
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});
export default SignaturePage;
