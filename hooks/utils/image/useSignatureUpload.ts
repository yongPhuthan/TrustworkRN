// useSignatureUpload.ts
import { useState } from 'react';
import {
  HOST_URL,
  CLOUDFLARE_WORKER_DEV,
  PROJECT_FIREBASE,
  CLOUDFLARE_WORKER,
  CLOUDFLARE_R2_BUCKET_BASE_URL,
  CLOUDFLARE_DIRECT_UPLOAD_URL,
} from '@env';

export const useSignatureUpload = () => {
  const [isSignatureUpload, setIsSignatureUpload] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);

  const handleSignatureUpload = async (signatureDataUrl: string) => {
    setIsSignatureUpload(true);

    const uploadSignatureToCloudflare = async (dataUrl: string) => {
      const blob = await fetch(dataUrl).then(r => r.blob());

      const CLOUDFLARE_ENDPOINT = __DEV__
        ? CLOUDFLARE_WORKER_DEV
        : CLOUDFLARE_WORKER;

      const filename = 'signature.png'; // Modify as needed
      const contentType = 'image/png';

      try {
        const response = await fetch(`${CLOUDFLARE_ENDPOINT}${filename}`, {
          method: 'POST',
          headers: {
            'Content-Type': contentType,
          },
          body: blob,
        });

        if (!response.ok) {
          const text = await response.text();
          console.error('Server responded with:', text);
          throw new Error('Server error');
        }

        const uploadedUrl = response.url;
        console.log('Signature uploaded successfully. URL:', uploadedUrl);
        return uploadedUrl;
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
      }
    };

    try {
      const cloudflareUrl: string | undefined = await uploadSignatureToCloudflare(signatureDataUrl);
      setSignatureUrl(cloudflareUrl || null);
      setIsSignatureUpload(false);
    } catch (error) {
      console.error('Error uploading signature to Cloudflare:', error);
      setIsSignatureUpload(false);
    }
  };

  return {
    isSignatureUpload,
    signatureUrl,
    handleSignatureUpload,
  };
};
