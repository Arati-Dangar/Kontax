import {setReactNativeAsyncStorage} from '@react-native-firebase/app';
import {initializeApp} from 'firebase/app';

import {getDatabase} from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  appId: process.env.APPID,
};

const app = initializeApp(firebaseConfig);

// const auth = getAuth(app);

const database = getDatabase(app);

export {database, app};
