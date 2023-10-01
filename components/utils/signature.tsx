// SignatureComponent.js
import React, {
  useState,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import Signature from 'react-native-signature-canvas';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {useSignatureUpload} from '../../hooks/utils/image/useSignatureUpload';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useUpdateContract} from '../../hooks/contract/useUpdateContract';
import {
  HOST_URL,
  CLOUDFLARE_WORKER_DEV,
  PROJECT_FIREBASE,
  CLOUDFLARE_WORKER,
  CLOUDFLARE_R2_BUCKET_BASE_URL,
  CLOUDFLARE_DIRECT_UPLOAD_URL,
  CLOUDFLARE_R2_PUBLIC_URL,
} from '@env';
import {Store} from '../../redux/store';
import {useUriToBlob} from '../../hooks/utils/image/useUriToBlob';
import {useSlugify} from '../../hooks/utils/useSlugify';

interface SignaturePadProps {
  setSignatureUrl: React.Dispatch<React.SetStateAction<string>>;
  onSignatureSuccess?: () => void;
  onClose: () => void;
}

const SignatureComponent = ({
  onSignatureSuccess,
  setSignatureUrl,
  onClose,
}: SignaturePadProps) => {
  const ref = useRef<any>();
  const {isSignatureUpload, signatureUrl, handleSignatureUpload} =useSignatureUpload();
  const [isImageUpload, setIsImageUpload] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const {updateContract} = useUpdateContract();
  const queryClient = useQueryClient();
  const slugify = useSlugify();
  const uriToBlobFunction = useUriToBlob(); 
  const {
    state: {code},
    dispatch,
  }: any = useContext(Store);
  const {mutate, isLoading} = useMutation(updateContract, {
    onSuccess: () => {
      queryClient.invalidateQueries(['contractDashboardData']);
      if (onSignatureSuccess) onSignatureSuccess();
    },
    onError: error => {
      console.error('Failed to upload the signature:', error);
    },
  });


  const uploadImageToCloudflare = async (base64Image: string) => {
    if (!base64Image) {
      console.log('No image provided');
      return;
    }

    const name = 'sellerSignature';
    const filename = slugify(name);

    const blob = await (await fetch(base64Image)).blob();

    const CLOUDFLARE_ENDPOINT = __DEV__
      ? CLOUDFLARE_WORKER_DEV
      : CLOUDFLARE_WORKER;

    let contentType = '';
    switch (blob.type.toLowerCase()) {
      case 'image/png':
        contentType = 'image/png';
        break;
      case 'image/jpeg':
        contentType = 'image/jpeg';
        break;
      default:
        console.log('Unsupported file type');
        return;
    }


    try {
      const response = await fetch(`${CLOUDFLARE_ENDPOINT}${filename}`, {
        method: 'POST',
        headers: {
          signature: 'true',
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

  const handleSave = useCallback(async (signature) => {
    if (!signature) {
      return;
    }
    setIsImageUpload(true);
    const imageUrl = await uploadImageToCloudflare(signature);
    console.log('imageUrl', imageUrl);
    if (!imageUrl) return;
    setIsImageUpload(false);
    setSignatureUrl(imageUrl);
    onClose();
  }, [code]);


  return (
    <>
      {isSignatureUpload ? (
        <ActivityIndicator />
      ) : (
        <View style={styles.container}>
          <Signature
           penColor='#0000FF'
            ref={ref}
            onOK={img => handleSave(img)}
            onEmpty={() => console.log('Empty')}
            descriptionText="เซ็นเอกสารด้านบน"
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});

export default SignatureComponent;
