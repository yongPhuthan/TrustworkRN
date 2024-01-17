// screens/FirstAppScreen.tsx
import React, {useState, useEffect} from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import Navigation from '../../navigations/navigation';
import firebase from '../../firebase';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Ensure you have this library installed
import { Button } from 'react-native-paper';

const FirstAppScreen = ({ navigation }) => {
    const [loadingUser, setLoadingUser] = useState(true);
    const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

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
        <View style={{ flex: 1,justifyContent: 'center', // Aligns children vertically in the center
        alignItems: 'center', flexDirection:'column',  }}>
            <Text style={styles.logo}>Trusthwork</Text>
                <Image
                    style={styles.image}
                    source={require('../../assets/images/Buildingpermit-bro.png')}
                />
                <Text style={styles.heading}>ระบบเสนอราคาเพื่อปิดการขาย</Text>
                <Text style={styles.heading}>สำหรับผู้รับเหมามืออาชีพ</Text>
    
            <View style={{
               
                width: '100%',
                alignItems: 'center',
                justifyContent: 'flex-end',
                flex: 1, 
                marginBottom: 20,
            }}>
                <Pressable style={[styles.pressable, styles.getStartedButton]} onPress={handleRegister}>
                    <Text style={styles.pressableText}>ลงทะเบียนใช้งาน</Text>
                </Pressable>
                <Button mode='outlined' style={{
                    width: '90%',
                    borderRadius: 4,
                }} onPress={handleLogin}>
                    <Text style={styles.pressableTextLogin}>เข้าสู่ระบบ</Text>
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
 
    logo: {
        fontSize: 32,
        color: 'black',
        marginTop: 150,
        marginBottom: 32,
        fontWeight: 'bold',
    },
    heading: {
        fontSize: 18,
        color: 'black',
        // fontWeight: 'bold',
        textAlign: 'center',
     
    },
    bulletPointContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 8,
        justifyContent:'center'
    },
    icon: {
        fontSize: 24,
        color: '#5C5F62',
        marginRight: 8,
    },
    description: {
        fontSize: 18,
        color: '#5C5F62',
    },  
    container: {
        flex: 1,
        marginTop: 200,
        alignItems: 'center',

        justifyContent: 'center',
        backgroundColor: 'white',
    },
 
    image: {
        width: '80%', // Example static image path
        height: 200, // Set your desired size
        resizeMode: 'contain',
        marginBottom: 50,
    },
    pressable: {
        paddingVertical: 12,
        borderRadius: 4,
        marginVertical: 8,
    },
    getStartedButton: {
        width: '90%',
        backgroundColor: '#012b20', // Shopify's button color for 'Get started'
    },
    loginButton: {
height: 40,
        width: '90%',
    },
    pressableText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center', // Ensure text is centered within the full width buttons
    },  
    pressableTextLogin: {
        color: '#5C5F62',
        fontSize: 16,
        textAlign: 'center', // Ensure text is centered within the full width buttons
    },
});


export default FirstAppScreen;
