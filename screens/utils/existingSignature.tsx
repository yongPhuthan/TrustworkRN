import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import {HOST_URL, PROJECT_FIREBASE, PROD_API_URL} from '@env';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {CompanyUser, Service} from '../../types/docType';
import {ParamListBase, ProductItem} from '../../types/navigationType';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useUpdateContract} from '../../hooks/contract/useUpdateContract';

type Props = {
  navigation: StackNavigationProp<ParamListBase, 'ExistingSignature'>;
  route: RouteProp<ParamListBase, 'ExistingSignature'>;
  // onGoBack: (data: string) => void;
};

const ExistingSignature = ({navigation}: Props) => {
  const [imageUri, setImageUri] = useState('');
  const route = useRoute();
  const data = route.params?.data;
  const queryClient = useQueryClient();
  const {width, height} = Dimensions.get('window');
  const {updateContract, dataApi, error} = useUpdateContract();
  const {mutate, isLoading} = useMutation(updateContract, {
    onSuccess: () => {
      queryClient.invalidateQueries(['contractDashboardData']);
      const newId = data?.quotationId.slice(0, 8) as string;
      navigation.navigate('DocViewScreen', {id: newId});
    },
    onError: error => {
      console.error('Failed to update:', error);
    },
  });
  const handleOkAction = async signature => {
    try {
      await mutate(data);
    } catch (error) {
      console.error('Failed to upload the signature:', error);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.checkboxContainer}></View>

        <View style={styles.textContainer}>
          <View style={styles.underline} />
          <Image style={styles.image} source={{uri: imageUri}} />

          <TouchableOpacity onPress={handleOkAction} style={styles.btn}>
            {isLoading ? (
              <ActivityIndicator color={'white'} />
            ) : (
              <Text style={styles.label}>ใช้ลายเซ็นเดิม</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.orContainer}>
        <Text style={styles.orText}>หรือ</Text>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Signature', {
              text: 'signature',
              data,
            })
          }>
          <Text style={styles.textLink}>เพิ่มลายเซ็นใหม่</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  textLink: {
    color: '#0073BA',
    // textDecorationLine: 'underline',

    fontSize: 16,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  labelNew: {
    color: 'white',
    fontSize: 16,
  },
  btnNew: {
    padding: 15,
    backgroundColor: 'green',
    borderRadius: 5,
    marginTop: 20,
  },
  selected: {
    backgroundColor: '#F2F2F2',
  },
  checkboxContainer: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginRight: 16,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  image: {
    width: 230,
    height: 250,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6C00',
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    marginTop: 10,
  },
  underline: {
    height: 1,
    flex: 1,
    backgroundColor: 'grey',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 40,
    backgroundColor: '#0073BA',
  },
  label: {
    fontSize: 16,
    color: 'white',
  },
});

export default ExistingSignature;
