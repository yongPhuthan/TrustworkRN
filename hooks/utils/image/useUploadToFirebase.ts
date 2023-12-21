import {useState} from 'react';
import {
  ImageLibraryOptions,
  MediaType,
  ImagePickerResponse,
  launchImageLibrary,
} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import {v4 as uuidv4} from 'uuid';
import ImageResizer from '@bam.tech/react-native-image-resizer';

export const useImageUpload = () => {
  const [isImageUpload, setIsImageUpload] = useState(false);
  const [imageUrl, setImageUrl] = useState<string[]>([]);

  async function uriToBlob(uri: string) {
    return new Promise<Blob>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function () {
        reject(new Error('URI to Blob failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
  }

  const handleLogoUpload = async (code: string) => {
    setIsImageUpload(true);

    if (imageUrl.length >= 10) {
      console.log('Upload limit reached (10 images)');
      setIsImageUpload(false);
      return;
    }

    const options: ImageLibraryOptions = {
      mediaType: 'photo',
    };

    launchImageLibrary(options, async (response: ImagePickerResponse) => {
      // Handle cancel and error as before

      if (response.assets && response.assets.length > 0) {
        const source = {uri: response.assets[0].uri ?? null};
        console.log('Image source:', source);
        setIsImageUpload(false);
        if (
          response.assets &&
          response.assets.length > 0 &&
          response.assets[0].uri
        ) {
          const sourceUri = response.assets[0].uri; // Guaranteed not to be null
          // ... rest of your code
        }
        if (source.uri) {
          try {
            // Resize image
            const resizedImage = await ImageResizer.createResizedImage(
              source.uri,
              800,
              600,
              'PNG',
              80,
              0,
              undefined,
            );

            const blob = await uriToBlob(resizedImage.uri);
            const filename = `workdelivery${uuidv4}.png`;
            const storagePath = __DEV__
              ? `Test/${code}/workdelivery/${filename}`
              : `${code}/workdelivery/${filename}`;
            const storageRef = storage().ref(storagePath);

            const uploadTask = storageRef.put(blob);

            uploadTask.on(
              'state_changed',
              snapshot => {
                // Handle progress
                const progress =
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress.toFixed(2) + '% done');

                // Handle pause and resume
                switch (snapshot.state) {
                  case storage.TaskState.PAUSED: // or 'paused'
                    console.log('Upload is paused');
                    break;
                  case storage.TaskState.RUNNING: // or 'running'
                    console.log('Upload is running');
                    break;
                }
              },
              error => {
                // Handle errors here
                console.error('Error uploading image to Firebase:', error);
                setIsImageUpload(false);
              },
              () => {
                // Successful completion logic
                uploadTask.snapshot?.ref.getDownloadURL().then(downloadURL => {
                  console.log('Image uploaded successfully. URL:', downloadURL);
                  setImageUrl(prevUrls => [...prevUrls, downloadURL]);
                  setIsImageUpload(false);
                });
              },
            );
          } catch (error) {
            console.error('Error uploading image:', error);
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
