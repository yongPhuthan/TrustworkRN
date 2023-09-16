import React, {useRef} from 'react';
import SignatureScreen, {SignatureViewRef} from 'react-native-signature-canvas';
import {StackScreenProps} from '@react-navigation/stack';
import {ParamListBase} from '../../types/navigationType';
import {StackNavigationProp} from '@react-navigation/stack';
import {View, Button, StyleSheet} from 'react-native';
import Signature from 'react-native-signature-canvas';
import {useSignatureUpload} from '../../hooks/utils/image/useSignatureUpload';
import {ActivityIndicator} from 'react-native-paper';
import {useUpdateContract} from '../../hooks/contract/useUpdateContract';
import {useMutation,useQueryClient} from '@tanstack/react-query';

type SignatureScreenProps = StackNavigationProp<ParamListBase, 'Signature'>;

type Props = SignatureScreenProps &
  StackScreenProps<ParamListBase, 'Signature'>;

const SignaturePage: React.FC<Props> = ({route, navigation}) => {
  const ref = useRef<any>();
  const {text, data} = route.params;
  const {updateContract, dataApi, error} = useUpdateContract();
  const queryClient = useQueryClient();

  const {isSignatureUpload, signatureUrl, handleSignatureUpload} =
    useSignatureUpload();
  const {mutate, isLoading} = useMutation(updateContract, {
    onSuccess: () => {
      queryClient.invalidateQueries(['contractDashboardData']);
      const newId = data?.quotationId.slice(0, 8) as string;
      navigation.navigate('DocViewScreen', {id: newId});
    },
    onError: error => {
      console.error('Failed to upload the signature:', error);
    },
  });
  const handleOkAction = async signature => {
    try {
      await handleSignatureUpload(signature).then(async () => {
        if (signatureUrl && signatureUrl !== undefined) {
          data.sellerSignature = signatureUrl
          await mutate(data);
        }
      });
    } catch (error) {
      console.error('Failed to upload the signature:', error);
    }
  };

  console.log('signatureUrl', signatureUrl);

  return (
    <>
      {isSignatureUpload ? (
        <ActivityIndicator />
      ) : (
        <View style={styles.container}>
          <Signature
            ref={ref}
            onOK={img => handleOkAction(img)}
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});
export default SignaturePage;
