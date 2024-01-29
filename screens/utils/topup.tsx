import React, {useState} from 'react';
import {View, StyleSheet, Alert, TouchableOpacity, Platform} from 'react-native';
import {Button, Text, Card, Avatar} from 'react-native-paper';
import {IconButton, MD3Colors} from 'react-native-paper';

import ApplePayButton from '../../components/ui/Button/ApplePayButton';
import GooglePayButton from '../../components/ui/Button/GooglePayButton';
import Decimal from 'decimal.js-light';
import {StackNavigationProp} from '@react-navigation/stack';
import {ParamListBase} from '../../types/navigationType';
import type {RouteProp} from '@react-navigation/native';

const TopUpOptions = [
  {amount: 2000, icon: 'credit-card-plus', balance: 2499},
  {amount: 4000, icon: 'credit-card-plus', balance: 4499},
  {amount: 6000, icon: 'credit-card-plus', balance: 6499},
];
interface Props {
    navigation: StackNavigationProp<ParamListBase, 'TopUpScreen'>;
    route: RouteProp<ParamListBase, 'TopUpScreen'>;
  }


const TopUpScreen = ({route}:Props) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(0);

const initiateApplePay = async (amount: number) => {
    // Initiate Apple Pay

  }


  const handlePayment = async (amount: number) => {
    try {
      if (Platform.OS === 'ios') {
        // Initiate Apple Pay
        const applePayResponse = await initiateApplePay(amount);
        handleApplePaySuccess(applePayResponse);
      } else if (Platform.OS === 'android') {
        // Initiate Google Pay
        // const googlePayResponse = await initiateGooglePay(amount);
        // handleGooglePaySuccess(googlePayResponse);
      }
    } catch (error) {
      handlePaymentError(error);
    }
  };

  const handleTopUpSelect = (amount: number) => {
    setSelectedAmount(amount);
    handlePayment(amount);
  };


  const handleApplePaySuccess = (paymentResponse: any) => {
    // Handle successful Apple Pay
    
  };

  const handleGooglePaySuccess = (paymentResponse: any) => {
    // Handle successful Google Pay
  };

  const handlePaymentError = (error: Error) => {
    Alert.alert('Payment Error', error.message);
  };
console.log(route?.params.balance)
  return (
    <View style={styles.container}>
      <Text variant="titleMedium">เครดิตของคุณ</Text>

      <Text variant="displayMedium" style={{marginTop: 10}}>
      {new Intl.NumberFormat('th-TH', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                }).format(new Decimal(`${ route?.params.balance || 0}`).toNumber())}
        
      </Text>
      <View style={styles.topUpOptions}>
        {TopUpOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.topUpOption,
              selectedAmount === option.amount && styles.selectedOption,
            ]}
            onPress={() => handleTopUpSelect(option.amount)}>
            <View style={{flexDirection:'row'}}>
              <Text
                style={{fontSize: 16, fontWeight: 'bold', color: '#1b72e8'}}>
                +{' '}
                {new Intl.NumberFormat('th-TH', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                }).format(new Decimal(`${option.amount}`).toNumber())}
              </Text>
            </View>
            <Avatar.Icon
              size={40}
              icon={option.icon}
              style={{marginVertical: 20}}
            />
            <Text style={{fontSize: 14, fontWeight: 'bold'}}>
              {new Intl.NumberFormat('th-TH', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              }).format(new Decimal(`${option.balance}`).toNumber())}
              ฿{' '}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* <Card>
        <Card.Content>
          <Text>{`Amount: $${selectedAmount}`}</Text>
        </Card.Content>
      </Card>
      <ApplePayButton
        amount={selectedAmount}
        onSuccess={handleApplePaySuccess}
        onError={handlePaymentError}
      />
      <GooglePayButton
        amount={selectedAmount}
        onSuccess={handleGooglePaySuccess}
        onError={handlePaymentError}
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,

    
  },
  topUpOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 10,
    marginTop: 50,
  },
  topUpOption: {
    alignItems: 'center',
    padding: 10,
    borderWidth: 0.5,
    borderRadius: 5,
    width: '30%',
    flexDirection: 'column',
  },
  selectedOption: {
    backgroundColor: '#e0e0e0', // Or any highlight color
  },
  // Additional styles...
});

export default TopUpScreen;
