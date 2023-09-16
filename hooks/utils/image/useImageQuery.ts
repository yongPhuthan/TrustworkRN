import { useQuery } from '@tanstack/react-query';
import {
  CLOUDFLARE_WORKER_GALLERY,
  CLOUDFLARE_WORKER_DEV
} from '@env';

const fetchImagesByEmail = async (email) => {
  // Construct the URL to target the specific folder in the bucket
  const CLOUDFLARE_ENDPOINT = __DEV__
    ? CLOUDFLARE_WORKER_DEV
    : CLOUDFLARE_WORKER_GALLERY;
  const url = `${CLOUDFLARE_ENDPOINT}${email}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'email': email  
    }
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();

  // Check if the folder exists
  if (!data.objects || data.objects.length === 0) {
    throw new Error('Folder not found or no images in the folder');
  }

  // Extract the keys (image names) from the response
  const imageKeys = data.objects.map(obj => obj.key);

  // Construct the full URLs for the images
  const imageUrls = imageKeys.map(key => `${CLOUDFLARE_ENDPOINT}/${email}/${key}`);

  return imageUrls;
};

const useImagesQuery = (email) => {
  return useQuery(['images', email], () => fetchImagesByEmail(email));
};

export default useImagesQuery;



