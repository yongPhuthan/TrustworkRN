import { useState, useContext } from 'react';
import { useFormContext } from 'react-hook-form';
interface UseSignatureReturnType {
    pickerVisible: boolean;
    toggleSignatureModal: () => void;
    handleSignatureSuccess: (newSignature: string) => void;
    setSignature: (signature: string | null) => void;
  }
export const useSignature = (): UseSignatureReturnType => {
  const { setValue } = useFormContext();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);

  // Function to toggle the signature modal visibility
  const toggleSignatureModal = () => {
    setPickerVisible(prev => {
      const isVisible = !prev;
      // Update the form value based on modal visibility
      if (!isVisible) {
        // If modal is closing without a signature, ensure the field is cleared
        setValue('sellerSignature', '', { shouldDirty: true });
      } else {
        // If modal is opening and there is a signature, set the current signature
        if (signature) {
          setValue('sellerSignature', signature, { shouldDirty: true });
        }
      }
      return isVisible;
    });
  };

  // Function to handle successful signature
  const handleSignatureSuccess = (newSignature: string) => {
    setSignature(newSignature); // Save the new signature
    setValue('sellerSignature', newSignature, { shouldDirty: true }); // Update the form with the new signature
    setPickerVisible(false); // Close the modal
  };

  return {
    pickerVisible,
    toggleSignatureModal,
    handleSignatureSuccess,
    setSignature, // Expose setSignature in case you need to update it from outside
  };
};
