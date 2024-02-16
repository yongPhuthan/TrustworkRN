import { jest } from '@jest/globals';
import * as ReactQuery from "@tanstack/react-query";
import '@testing-library/jest-native/extend-expect';


jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('react-native-webview', () => 'WebView');

jest.mock('@react-native-firebase/app', () => ({
  apps: [],
  initializeApp: jest.fn(() => ({
    auth: jest.fn(() => ({
      onAuthStateChanged: jest.fn(),
      currentUser: jest.fn(() => ({
        uid: '1234',
        email: 'user@example.com'
      }))
    })),
    firestore: jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve({
            data: () => ({
              name: 'John Doe'
            })
          })),
        })),
      })),
    })),
  })),
  // Mock the app method to return the default app instance
  app: jest.fn(() => ({
    auth: jest.fn(() => ({
      onAuthStateChanged: jest.fn(),
      currentUser: jest.fn(() => ({
        uid: '1234',
        email: 'user@example.com'
      }))
    })),
    firestore: jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve({
            data: () => ({
              name: 'John Doe'
            })
          })),
        })),
      })),
    })),
    // Add other Firebase services you're using
  })),
}));

jest.mock('@react-native-firebase/auth', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      onAuthStateChanged: jest.fn(() => jest.fn()), 
      signInWithEmailAndPassword: jest.fn(),
      currentUser: {
        uid: 'testUid',
        email: 'test@example.com',
        // Add other properties as needed
      },

      // Mock other methods you use from auth here
    })),
  };
});

jest.mock('@react-native-firebase/storage', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      ref: jest.fn((path) => ({
        putFile: jest.fn(() => Promise.resolve({
          state: 'success',
          downloadURL: `https://example.com/${path}`,
        })),
        getDownloadURL: jest.fn(() => Promise.resolve(`https://example.com/${path}`)),
        // Add other methods and properties as needed for your tests
      })),
    })),
  };
});

jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    onMessage: jest.fn(),
    onNotificationOpenedApp: jest.fn(),
    getInitialNotification: jest.fn(() => Promise.resolve(null)),
    requestPermission: jest.fn(() => Promise.resolve('granted')),
    getToken: jest.fn(() => Promise.resolve('mockToken')),
    // Add other methods you use from the messaging module
  })),
}));

jest.mock('react-native-permissions', () => ({
  checkNotifications: jest.fn(() => Promise.resolve({
    status: 'granted', // or 'denied', 'blocked', etc., depending on what you want to test
    settings: {},
  })),
  requestNotifications: jest.fn(() => Promise.resolve({
    status: 'granted', // Adjust the simulated response as needed for your tests
    settings: {},
  })),
  PERMISSIONS: {
    IOS: {
      NOTIFICATIONS: 'notifications',
    },
    ANDROID: {
      // Add Android permissions used by your app for testing purposes
    },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    BLOCKED: 'blocked',
    // Add other results as needed
  },
}));
jest.mock('react-native-gesture-handler', () => ({
  // Mock any specific exports here, for example:
  Swipeable: jest.fn().mockImplementation(() => null),
  DrawerLayout: jest.fn().mockImplementation(() => null),
  // Add more mocks as needed based on your usage
}));
jest.mock("@tanstack/react-query", () => {
  const original: typeof ReactQuery = jest.requireActual("@tanstack/react-query");

  return {
    ...original,
    useQuery: () => ({ isLoading: false, error: {}, data: [] }),
  };
});
const mockGetIdToken = jest.fn(() => Promise.resolve('fake_token'));

jest.mock('./providers/UserContext', () => ({
  useUser: jest.fn(() => ({
    getIdToken: mockGetIdToken,
  })),
}));




// Mock other Firebase services here if you're using them, similar to the firestore example above

// เพิ่ม mocks อื่นๆ ที่จำเป็นสำหรับโปรเจกต์ของคุณ
