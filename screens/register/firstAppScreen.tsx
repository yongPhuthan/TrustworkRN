// screens/FirstAppScreen.tsx
import React, {useState, useEffect} from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import Navigation from '../../navigations/navigation';
import firebase from '../../firebase';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Ensure you have this library installed

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
        <View style={styles.container}>
            <Text style={styles.logo}>Trustsify</Text>
            <Image
                style={styles.image}
                source={require('../../assets/images/Buildingpermit-bro.png')}
            />
            <Text style={styles.heading}>Start selling online with Trustsify</Text>
            <View style={styles.bulletPointContainer}>
                <Icon name="storefront-outline" style={styles.icon} />
                <Text style={styles.description}>Create your online store</Text>
            </View>
            <View style={styles.bulletPointContainer}>
                <Icon name="chart-line" style={styles.icon} />
                <Text style={styles.description}>Grow your audience</Text>
            </View>
            <View style={styles.bulletPointContainer}>
                <Icon name="cellphone-link" style={styles.icon} />
                <Text style={styles.description}>Manage from anywhere</Text>
            </View>

            <Pressable style={[styles.pressable, styles.getStartedButton]} onPress={handleRegister}>
                <Text style={styles.pressableText}>Get started</Text>
            </Pressable>
            <Pressable style={[styles.pressable, styles.loginButton]} onPress={handleLogin}>
                <Text style={styles.pressableTextLogin}>Login</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
 
    logo: {
        fontSize: 20,
        color: 'black',
        marginTop: 10,
        marginBottom: 32,
        fontWeight: 'bold',
    },
    heading: {
        fontSize: 24,
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    bulletPointContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
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
        width: '90%', // Full width buttons
        paddingVertical: 12,
        borderRadius: 4,
        marginVertical: 8,
    },
    getStartedButton: {
        backgroundColor: '#012b20', // Shopify's button color for 'Get started'
    },
    loginButton: {
        backgroundColor: 'transparent', // Transparent button with a border for 'Login'
        borderWidth: 1,
        borderColor: '#5C5F62', // Border color similar to Shopify's
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
