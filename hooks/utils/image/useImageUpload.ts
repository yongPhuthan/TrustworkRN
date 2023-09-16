// useImageUpload.ts

import {useState} from 'react';
import {
  ImageLibraryOptions,
  MediaType,
  ImagePickerResponse,
  launchImageLibrary,
} from 'react-native-image-picker';
import {
  HOST_URL,
  CLOUDFLARE_WORKER_DEV,
  PROJECT_FIREBASE,
  CLOUDFLARE_WORKER,
  CLOUDFLARE_R2_BUCKET_BASE_URL,
  CLOUDFLARE_DIRECT_UPLOAD_URL,
} from '@env';
export const useImageUpload = () => {
  const [isImageUpload, setIsImageUpload] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

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
  const handleLogoUpload = () => {
    console.log('POADIND')
    setIsImageUpload(true);
    const options: ImageLibraryOptions = {
      mediaType: 'photo' as MediaType,
    };
    const uploadImageToCloudflare = async (imagePath: string) => {
      if (!imagePath) {
        console.log('No image path provided');
        return;
      }

      const filename = imagePath.substring(imagePath.lastIndexOf('/') + 1);
      const fileType = imagePath.substring(imagePath.lastIndexOf('.') + 1);
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
            'Content-Type': contentType,
          },
          body: blob,
        });

        if (!response.ok) {
          const text = await response.text();
          console.error('Server responded with:', text);
          throw new Error('Server error');
        }
        let data;
        try {
          const imageUrl = response.url;
          console.log('Image uploaded successfully. URL:', imageUrl);
          return imageUrl;
        } catch (error) {
          console.error('Failed to parse JSON:', error);
          throw new Error('Failed to parse response');
        }
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
      }
    };

    launchImageLibrary(options, async (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        setIsImageUpload(false)
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
        setIsImageUpload(false)

      } else if (response.assets && response.assets.length > 0) {
        const source = {uri: response.assets[0].uri ?? null};
        console.log('Image source55:', source);
        setIsImageUpload(false)


        if (source.uri) {
          try {
            const cloudflareUrl: string | undefined =
              await uploadImageToCloudflare(source.uri);
            setImageUrl(cloudflareUrl || null);
            setIsImageUpload(false);
          } catch (error) {
            console.error('Error uploading image to Cloudflare:', error);
            setIsImageUpload(false);
          }
        }
      }
    });
  };


  return {
    isImageUpload,
    imageUrl,
    handleLogoUpload,
  };
};
