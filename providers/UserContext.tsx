// UserContext.tsx
import React, { createContext, useContext } from 'react';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';

// Define the type of the context to be User or null
const UserContext = createContext<FirebaseAuthTypes.User | null>(null);

export const useUser = () => useContext(UserContext);

export default UserContext;
