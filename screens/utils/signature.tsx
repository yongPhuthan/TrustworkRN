import React, { useRef } from "react";
import SignatureScreen, {
  SignatureViewRef,
} from "react-native-signature-canvas";
import { StackScreenProps } from '@react-navigation/stack';
import {ParamListBase} from '../../types/navigationType';
import {StackNavigationProp} from '@react-navigation/stack';
import { View, Button, StyleSheet } from 'react-native';
import Signature from 'react-native-signature-canvas';

type SignatureScreenProps = StackNavigationProp<ParamListBase, 'Signature'>;


type Props = SignatureScreenProps & StackScreenProps<ParamListBase, 'Signature'>;

const SignaturePage: React.FC<Props> = () => {
    const ref = useRef<any>();

  return (
    <View style={styles.container}>
    <Signature
      ref={ref}
      onOK={(img) => console.log(img)}
      onEmpty={() => console.log('Empty')}
      descriptionText="เซ็นเอกสารด้านบน"
    />
   
  </View>
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