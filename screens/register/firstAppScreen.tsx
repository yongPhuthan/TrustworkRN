// screens/FirstAppScreen.tsx
import React, {useState, useEffect} from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import Navigation from '../../navigations/navigation';
import firebase from '../../firebase';

const FirstAppScreen = ({ navigation }) => {

    const handleLogin = () => {
        navigation.navigate('LoginScreen');
    };

    const handleRegister = () => {
        navigation.navigate('RegisterScreen');
      };
    //   useEffect(() => {
    //     const unsubscribe = firebase.auth().onAuthStateChanged(user => {
    //       if (user) {
    //         // If there's a user, sign them out
    //         firebase.auth().signOut();
    //       }

    //     });
    
    //     return unsubscribe;
    // }, []);
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Trustwork</Text>

            <Pressable style={styles.pressable} onPress={handleLogin}>
                <Text style={styles.pressableText}>เข้าสู่ระบบ</Text>
            </Pressable>

            <Pressable style={styles.pressable} onPress={handleRegister}>
                <Text style={styles.pressableText}>ลงทะเบียน</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    title: {
        fontSize: 32,
        marginBottom: 24,
        fontWeight: 'bold'
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 16,
    },
    pressable: {
        backgroundColor: '#0073BA',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 4,
        marginVertical: 8,
    },
    pressableText: {
        color: 'white',
        fontSize: 16,
    },
});

export default FirstAppScreen;
