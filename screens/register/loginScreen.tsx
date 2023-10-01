// LoginScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import {StackNavigationProp} from '@react-navigation/stack';
import {ParamListBase} from '../../types/navigationType';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
    navigation: StackNavigationProp<ParamListBase, 'LoginScreen'>;
  }
const LoginScreen = ({navigation}: Props) => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const handleLogin = async () => {
        try {
            const userCredential = await auth().signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            const token = await user.getIdToken();
            console.log('Token after login:', token); // Log the token
            if (token) {
                await AsyncStorage.setItem('userToken', token);
                navigation.navigate('DashboardQuotation');
            } else {
                console.error('Token is undefined after login');
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };
    
    

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                placeholder="Email"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Password"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title="Login" onPress={handleLogin} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        padding: 16,
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
    },
    input: {
        width: '100%',
        padding: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 4,
        marginBottom: 12,
        backgroundColor: '#f9f9f9',
    },
});

export default LoginScreen;
