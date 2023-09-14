import { useMutation } from '@tanstack/react-query';
import {
  CLOUDFLARE_WORKER_GALLERY,
} from '@env';

// Function to upload image by email
const uploadImageByEmail = async (email, file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(CLOUDFLARE_WORKER_GALLERY, {
    method: 'POST',
    headers: {
      'email': email
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  return response.json();
};

// Define the useUploadImagesByEmail hook
const useUploadImagesByEmail = () => {
  return useMutation((data) => uploadImageByEmail(data.email, data.file));
};

export default useUploadImagesByEmail;
