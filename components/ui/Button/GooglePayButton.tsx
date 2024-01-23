// GooglePayButton.tsx
import React from 'react';
import { Button } from 'react-native-paper';

const GooglePayButton = ({ amount, onSuccess, onError }) => {
  const handlePress = () => {
    // Implement Google Pay logic
  };

  return <Button onPress={handlePress}>Pay with Google Pay</Button>;
};

export default GooglePayButton;
