module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // หรือใช้ jest.setup.js ถ้าไม่ใช้ TS
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native'
    + '|react-native-paper'
    + '|@react-native'
    + '|@react-navigation'
    + '|@tanstack/react-query'
    + '|react-native-keyboard-aware-scroll-view'
    + '|@react-native-community/async-storage'
    + '|@react-navigation/native'
    + '|@react-navigation/stack'
    + '|@react-navigation/bottom-tabs'
    + '|react-native-screens'
    + '|react-native-reanimated'
    + '|react-native-gesture-handler'
    + '|react-native-safe-area-context'
    + '|react-native-tab-view'
    + '|react-native-svg'
    + '|react-native-webview'
    + '|react-native-modal'
    + '|react-native-paper'
    + '|react-native-vector-icons'
    + '|react-native-iphone-x-helper'
    + '|@fortawesome/react-native-fontawesome'
    + '|react-native-image-picker'
    + '|react-native-modal'
    + '|react-native-animatable'
    + '|@react-native-firebase/app'
    + '|@react-native-firebase/auth'
    + '|@react-native-firebase/firestore'
    + '|@react-native-firebase/functions'
    + '|@react-native-firebase/messaging'
    + '|@react-native-firebase/storage'
    + '|react-native-fast-image'
    + '|react-native-fs'
    + '|react-native-get-random-values'
    + '|react-native-permissions'
    + '|react-native-picker-select'
    + '|react-native-share'
    + '|react-native-signature-canvas'
    + '|react-native-view-pdf'
    + '|react-native-web'
    + '|@react-native-async-storage/async-storage'
    + '|@react-native-community/datetimepicker'
    + '|@react-native-community/netinfo'
    + '|@react-native-picker/picker'
    + '|uuid'
    // เพิ่มโมดูลอื่นๆ ที่คุณใช้
    + ')/)',
  ],
};
