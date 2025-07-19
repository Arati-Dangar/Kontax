// // src/services/auth/signupWithEmail.ts

// import auth from '@react-native-firebase/auth';
// import { ref, push } from 'firebase/database';

// import uuid from 'react-native-uuid';
// import { database } from '../../../firebaseConfig';

// export const signUpWithEmail = async (email: string, password: string) => {
//   try {

//     const userCredential = await auth().createUserWithEmailAndPassword(email.trim(), password);
//     const firebaseUser = userCredential.user;

//     const customToken = uuid.v4() as string;

//     const userRef = ref(database, 'users');
//     await push(userRef, {
//       email,
//       password,
//       token: customToken,
//     });

//     return {
//       success: true,

//       user: firebaseUser,
//       token: customToken,
//     };
//   } catch (error: any) {
//     console.error('Signup error:', error);
//     throw new Error(error.message || 'Signup failed');
//   }
// };

import auth from '@react-native-firebase/auth';
import {
  ref,
  push,
  get,
  child,
  query,
  orderByChild,
  equalTo,
} from 'firebase/database';
import uuid from 'react-native-uuid';
import {database} from '../../../firebaseConfig';
import {Alert} from 'react-native';

import bcrypt from 'bcryptjs';
import NetInfo from '@react-native-community/netinfo';
import {openPrepopulatedDB} from '../db';

// export const signUpWithEmail = async (email: string, password: string) => {
//   try {
//     const emailTrimmed = email.trim();

//     // Step 1: Check if the email already exists in Realtime Database
//     const usersRef = ref(database, 'users');
//     const emailQuery = query(usersRef, orderByChild('email'), equalTo(emailTrimmed));
//     const snapshot = await get(emailQuery);

//     if (snapshot.exists()) {
//       throw new Error('Email already exists in the database.');
//     }

//     // Step 2: Create user with Firebase Auth
//     const userCredential = await auth().createUserWithEmailAndPassword(emailTrimmed, password);
//     const firebaseUser = userCredential.user;

//     // Step 3: Add user to Realtime DB
//     const customToken = uuid.v4() as string;
//     await push(usersRef, {
//       email: emailTrimmed,
//       password,
//       token: customToken,
//     });

//     return {
//       success: true,
//       user: firebaseUser,
//       token: customToken,
//     };
//   } catch (error: any) {
//     console.error('Signup error:', error);
//     throw new Error(error.message || 'Signup failed');
//   }
// };

const fakeUid = uuid.v4() as string;
export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const emailTrimmed = email.trim();
    const isConnected = (await NetInfo.fetch()).isConnected;

    // Hash password regardless of mode
    // const hashedPassword = await bcrypt.hash(password, 10);
    const token = uuid.v4() as string;
    const createdAt = new Date().toISOString();

    if (!isConnected) {
      const db = await openPrepopulatedDB();
      await db.executeSql(
        `INSERT INTO users (
          name, email, phone, password, linkedln, bio,
          organization, designation, profileImage, createdAt,token
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
        ['', emailTrimmed, '', password, '', '', '', '', '', createdAt, token],
      );

      Alert.alert('Offline Mode', 'User saved locally. Will sync when online.');
      return {
        success: true,
        user: {uid: fakeUid},
        token,
        offline: true,
      };
    }

    // --- Online mode ---
    const usersRef = ref(database, 'users');
    const emailQuery = query(
      usersRef,
      orderByChild('email'),
      equalTo(emailTrimmed),
    );
    const snapshot = await get(emailQuery);

    if (snapshot.exists()) {
      throw new Error('Email already exists in the database.');
    }

    const userCredential = await auth().createUserWithEmailAndPassword(
      emailTrimmed,
      password,
    );
    const firebaseUser = userCredential.user;

    await push(usersRef, {
      email: emailTrimmed,
      password: password,
      token,
      createdAt,
    });

    return {
      success: true,
      user: firebaseUser,
      token,
      offline: false,
    };
  } catch (error: any) {
    console.error('Signup error:', error);
    throw new Error(error.message || 'Signup failed');
  }
};
