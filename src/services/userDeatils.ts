// import { useEffect, useState } from "react";
// import { openPrepopulatedDB } from "./db";
// import SQLite from 'react-native-sqlite-storage';
// import {ref, push, serverTimestamp, update, get} from 'firebase/database';
// import { database } from "../../firebaseConfig";
// import NetInfo from '@react-native-community/netinfo';
// import bcrypt from "bcryptjs";
// import { Alert } from "react-native";
// import uuid from 'react-native-uuid';
// import AsyncStorage from "@react-native-async-storage/async-storage";

// type MinimalUser = {
//   email: string;
//   password: string;
// };
// export interface user {

//   name: string;
//   email: string;
//   phone: string;
//   password: string;
//   linkedln: string;
//   bio: string;
//   organization: string;
//   designation: string;
//   profileImage: string;
//   createdAt: string;
// }

// export const userDetails = () => {

//   const [userDetails,setUserDetails]=useState<user[]>([])

//  const fetchAllUserDetails = async (database: any) => {
//     try {
//       const [results] = await database.executeSql(
//         'SELECT * FROM users',
//       );
//       const rows = results.rows.raw();
//       console.log('Fetched rows:', rows);
//       setUserDetails(rows);
//     } catch (e) {
//       console.error('Fetch error:', e);
//     }
//   };

// const addUserDetail = async (db: any, detail: user) => {
//   if (!db) return;

//   try {
//     const isConnected = (await NetInfo.fetch()).isConnected;

//     // Ensure password is a valid non-empty string
//     const password = String(detail.password || '').trim();
//     console.log('Password before hashing:', detail.password);

//     if (!password) {
//       throw new Error('Invalid password: must be a non-empty string');
//     }

//     const createdAt = new Date().toISOString();

//     await db.executeSql(
//       `INSERT INTO users (
//          name, email, phone,
//          password, linkedln, bio,
//          organization, designation,
//          profileImage, createdAt
//        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         detail.name,
//         detail.email,
//         detail.phone,
//         detail.password,
//         detail.linkedln,
//         detail.bio,
//         detail.organization,
//         detail.designation,
//         detail.profileImage,
//         createdAt,
//       ]
//     );

//     if (isConnected) {
//       const userRef = ref(database, 'users');
//       await push(userRef, {
//         name: detail.name,
//         email: detail.email,
//         phone: detail.phone,
//         password: password,
//         linkedln: detail.linkedln,
//         bio: detail.bio,
//         organization: detail.organization,
//         designation: detail.designation,
//         profileImage: detail.profileImage,
//         createdAt,

//       });

//       Alert.alert("Successfully pushed user to Firebase");
//     }

//     await fetchAllUserDetails(db);
//     console.log('User added successfully');

//   } catch (error) {
//     console.log('Insert user error:', error.message || error);
//     Alert.alert('Error', error.message || 'Something went wrong');
//   }
// };

// const addPersonalDetail = async (db: any, detail: any) => {
//   try {
//     const token = await AsyncStorage.getItem('accessToken');
//     if (!token) throw new Error('No token found in AsyncStorage');

//     // 1. Update in local SQLite
//     await db.executeSql(
//       `UPDATE users SET
//         name = ?,
//         phone = ?,
//         password = ?,
//         linkedln = ?,
//         bio = ?,
//         organization = ?,
//         designation = ?,
//         profileImage = ?
//       WHERE email = ?`,
//       [
//         detail.name,
//         detail.phone,
//         detail.password,
//         detail.linkedln,
//         detail.bio,
//         detail.organization,
//         detail.designation,
//         detail.profileImage,
//         detail.email,
//       ]
//     );

//     // 2. Update in Firebase, if connected
//     const isConnected = (await NetInfo.fetch()).isConnected;
//     if (isConnected) {
//       const usersRef = ref(database, 'users');
//       const snapshot = await get(usersRef);

//       if (snapshot.exists()) {
//         const usersData = snapshot.val();

//         const matchingKey = Object.keys(usersData).find(
//           key => usersData[key].token === token
//         );

//         if (matchingKey) {
//           const firebaseUser = usersData[matchingKey];
//           const updates: Record<string, any> = {};

//           // Only update if the field is missing or empty
//           Object.entries(detail).forEach(([key, value]) => {
//             if (firebaseUser[key] === undefined || firebaseUser[key] === '') {
//               updates[key] = value;
//             }
//           });

//           if (Object.keys(updates).length > 0) {
//             const userRef = ref(database, `users/${matchingKey}`);
//             await update(userRef, updates);
//             console.log('Updated fields in Firebase:', updates);
//           } else {
//             console.log('No fields to update in Firebase');
//           }
//         } else {
//           console.warn('No matching Firebase user found for token.');
//         }
//       }
//     }

//     console.log('User updated successfully in SQLite and Firebase');
//   } catch (error) {
//     console.error('Update error:', error.message || error);
//     throw error;
//   }
// };

// const updateUserDetail = async (db: any, detail: any, original: any) => {
//   try {
//     const token = await AsyncStorage.getItem('token');
//     if (!token) throw new Error('No token found in AsyncStorage');

//     const updates: Record<string, any> = {};

//     // 1. Prepare only changed fields for SQLite
//     Object.entries(detail).forEach(([key, value]) => {
//       if (value !== original[key]) {
//         updates[key] = value;
//       }
//     });

//     if (Object.keys(updates).length === 0) {
//       console.log('No changes detected');
//       return;
//     }

//     // 2. Update SQLite (dynamically)
//     const updateKeys = Object.keys(updates);
//     const updateValues = updateKeys.map(key => updates[key]);
//     const setClause = updateKeys.map(key => `${key} = ?`).join(', ');

//     await db.executeSql(
//       `UPDATE users SET ${setClause} WHERE email = ?`,
//       [...updateValues, detail.email]
//     );

//     // 3. Update Firebase only if connected and field is missing/empty
//     const isConnected = (await NetInfo.fetch()).isConnected;
//     if (isConnected) {
//       const usersRef = ref(database, 'users');
//       const snapshot = await get(usersRef);

//       if (snapshot.exists()) {
//         const usersData = snapshot.val();

//         const matchingKey = Object.keys(usersData).find(
//           key => usersData[key].token === token
//         );

//      if (matchingKey) {
//   const firebaseUpdates = { ...updates }; // ✅ use all changed fields

//   if (Object.keys(firebaseUpdates).length > 0) {
//     const userRef = ref(database, `users/${matchingKey}`);
//     await update(userRef, firebaseUpdates);
//     console.log('Updated fields in Firebase:', firebaseUpdates);
//   }
// }

//       }
//     }

//     console.log('User updated successfully');
//   } catch (error) {
//     console.log('Update error:', error.message || error);
//     throw error;
//   }
// };

//  const updatePrivacySettings = async (settings: Record<string, boolean>) => {
//     try {
//       const token = await AsyncStorage.getItem('accessToken');
//       const isConnected = (await NetInfo.fetch()).isConnected;

//       if (!isConnected) throw new Error('No internet connection');
//       if (!token) throw new Error('No token found');

//       const usersRef = ref(database, 'users');
//       const snapshot = await get(usersRef);

//       if (!snapshot.exists()) throw new Error('No users found in database');

//       const usersData = snapshot.val();
//       const matchingKey = Object.keys(usersData).find(
//         key => usersData[key].token === token
//       );

//       if (!matchingKey) throw new Error('No matching user found for token');

//       await update(ref(database, `users/${matchingKey}/privacySettings`), settings);
//       Alert.alert('Success', 'Privacy Settings Saved');

//     } catch (error: any) {
//       console.error('Privacy update error:', error.message || error);
//       Alert.alert('Error', error.message || 'Failed to save privacy settings');
//     }
//   };

//  return {
//     addUserDetail,
//     updatePrivacySettings,
//   updateUserDetail,
//   addPersonalDetail

// }

// }

import {useEffect, useState} from 'react';
import {openPrepopulatedDB} from './db';
import SQLite from 'react-native-sqlite-storage';
import {ref, push, serverTimestamp, update, get} from 'firebase/database';
import {database} from '../../firebaseConfig';
import NetInfo from '@react-native-community/netinfo';
import bcrypt from 'bcryptjs';
import {Alert} from 'react-native';
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

type MinimalUser = {
  email: string;
  password: string;
};

export interface user {
  name: string;
  email: string;
  phone: string;
  password: string;
  linkedln: string;
  bio: string;
  organization: string;
  designation: string;
  profileImage: string;
  createdAt: string;
}

export const userDetails = () => {
  const [userDetails, setUserDetails] = useState<user[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const fetchAllUserDetails = async (database: any) => {
    try {
      setIsLoading(true);
      const [results] = await database.executeSql('SELECT * FROM users');
      const rows = results.rows.raw();
      console.log('Fetched rows from SQLite:', rows);
      setUserDetails(rows);
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // New function to get user details with offline support
  const getUserDetails = async () => {
    try {
      setIsLoading(true);
      const db = await openPrepopulatedDB();

      const isConnected = (await NetInfo.fetch()).isConnected;

      if (!isConnected) {
        // Offline: fetch from SQLite
        console.log('Offline mode: fetching from SQLite');
        await fetchAllUserDetails(db);
      } else {
        // Online: you can choose to sync or just use local data
        console.log('Online mode: fetching from SQLite');
        await fetchAllUserDetails(db);

        // Optionally sync with Firebase here if needed
        // await syncWithFirebase(db);
      }
    } catch (error) {
      console.error('Error getting user details:', error);
      Alert.alert('Error', 'Failed to fetch user details');
    } finally {
      setIsLoading(false);
    }
  };

  // Get specific user by email from SQLite
  const getUserByEmail = async (email: string) => {
    try {
      const db = await openPrepopulatedDB();
      const [results] = await db.executeSql(
        'SELECT * FROM users WHERE email = ?',
        [email],
      );

      if (results.rows.length > 0) {
        return results.rows.item(0);
      }
      return null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  };

  // Get current logged-in user details
  const getCurrentUserDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error('No token found');

      const db = await openPrepopulatedDB();

      // First try to get from SQLite using some identifier
      // You might need to adjust this query based on how you store the current user
      const [results] = await db.executeSql(
        'SELECT * FROM users LIMIT 1', // Adjust this query as needed
      );

      if (results.rows.length > 0) {
        return results.rows.item(0);
      }

      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  };

  const addUserDetail = async (db: any, detail: user) => {
    if (!db) return;

    try {
      const isConnected = (await NetInfo.fetch()).isConnected;

      const password = String(detail.password || '').trim();
      console.log('Password before hashing:', detail.password);

      if (!password) {
        throw new Error('Invalid password: must be a non-empty string');
      }

      const createdAt = new Date().toISOString();

      await db.executeSql(
        `INSERT INTO users (
           name, email, phone,
           password, linkedln, bio,
           organization, designation,
           profileImage, createdAt
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          detail.name,
          detail.email,
          detail.phone,
          detail.password,
          detail.linkedln,
          detail.bio,
          detail.organization,
          detail.designation,
          detail.profileImage,
          createdAt,
        ],
      );

      if (isConnected) {
        const userRef = ref(database, 'users');
        await push(userRef, {
          name: detail.name,
          email: detail.email,
          phone: detail.phone,
          password: password,
          linkedln: detail.linkedln,
          bio: detail.bio,
          organization: detail.organization,
          designation: detail.designation,
          profileImage: detail.profileImage,
          createdAt,
        });

        Alert.alert('Successfully pushed user to Firebase');
      } else {
        Alert.alert('User saved locally. Will sync when online.');
      }

      await fetchAllUserDetails(db);
      console.log('User added successfully');
    } catch (error) {
      console.log('Insert user error:', error.message || error);
      Alert.alert('Error', error.message || 'Something went wrong');
    }
  };

  const addPersonalDetail = async (db: any, detail: any) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error('No token found in AsyncStorage');

      // 1. Update in local SQLite
      await db.executeSql(
        `UPDATE users SET 
          name = ?, 
          phone = ?, 
          password = ?, 
          linkedln = ?, 
          bio = ?, 
          organization = ?, 
          designation = ?, 
          profileImage = ? 
        WHERE email = ?`,
        [
          detail.name,
          detail.phone,
          detail.password,
          detail.linkedln,
          detail.bio,
          detail.organization,
          detail.designation,
          detail.profileImage,
          detail.email,
        ],
      );

      // 2. Update in Firebase, if connected
      const isConnected = (await NetInfo.fetch()).isConnected;
      if (isConnected) {
        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
          const usersData = snapshot.val();

          const matchingKey = Object.keys(usersData).find(
            key => usersData[key].token === token,
          );

          if (matchingKey) {
            const firebaseUser = usersData[matchingKey];
            const updates: Record<string, any> = {};

            Object.entries(detail).forEach(([key, value]) => {
              if (firebaseUser[key] === undefined || firebaseUser[key] === '') {
                updates[key] = value;
              }
            });

            if (Object.keys(updates).length > 0) {
              const userRef = ref(database, `users/${matchingKey}`);
              await update(userRef, updates);
              console.log('Updated fields in Firebase:', updates);
            } else {
              console.log('No fields to update in Firebase');
            }
          } else {
            console.warn('No matching Firebase user found for token.');
          }
        }
      } else {
        console.log('Offline: Changes saved locally, will sync when online');
      }

      console.log('User updated successfully in SQLite and Firebase');
    } catch (error) {
      console.error('Update error:', error.message || error);
      throw error;
    }
  };

  const updateUserDetail = async (db: any, detail: any, original: any) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found in AsyncStorage');

      const updates: Record<string, any> = {};

      Object.entries(detail).forEach(([key, value]) => {
        if (value !== original[key]) {
          updates[key] = value;
        }
      });

      if (Object.keys(updates).length === 0) {
        console.log('No changes detected');
        return;
      }

      const updateKeys = Object.keys(updates);
      const updateValues = updateKeys.map(key => updates[key]);
      const setClause = updateKeys.map(key => `${key} = ?`).join(', ');

      await db.executeSql(`UPDATE users SET ${setClause} WHERE email = ?`, [
        ...updateValues,
        detail.email,
      ]);

      const isConnected = (await NetInfo.fetch()).isConnected;
      if (isConnected) {
        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
          const usersData = snapshot.val();

          const matchingKey = Object.keys(usersData).find(
            key => usersData[key].token === token,
          );

          if (matchingKey) {
            const firebaseUpdates = {...updates};

            if (Object.keys(firebaseUpdates).length > 0) {
              const userRef = ref(database, `users/${matchingKey}`);
              await update(userRef, firebaseUpdates);
              console.log('Updated fields in Firebase:', firebaseUpdates);
            }
          }
        }
      }

      console.log('User updated successfully');
    } catch (error) {
      console.log('Update error:', error.message || error);
      throw error;
    }
  };

  const updatePrivacySettings = async (settings: Record<string, boolean>) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const isConnected = (await NetInfo.fetch()).isConnected;

      if (!isConnected) throw new Error('No internet connection');
      if (!token) throw new Error('No token found');

      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);

      if (!snapshot.exists()) throw new Error('No users found in database');

      const usersData = snapshot.val();
      const matchingKey = Object.keys(usersData).find(
        key => usersData[key].token === token,
      );

      if (!matchingKey) throw new Error('No matching user found for token');

      await update(
        ref(database, `users/${matchingKey}/privacySettings`),
        settings,
      );
      Alert.alert('Success', 'Privacy Settings Saved');
    } catch (error: any) {
      console.error('Privacy update error:', error.message || error);
      Alert.alert('Error', error.message || 'Failed to save privacy settings');
    }
  };

  return {
    // Data
    userDetails,
    isLoading,
    isOffline,

    // Functions
    addUserDetail,
    updatePrivacySettings,
    updateUserDetail,
    addPersonalDetail,

    // New offline-focused functions
    getUserDetails,
    getUserByEmail,
    getCurrentUserDetails,
    fetchAllUserDetails, // Now exposed
  };
};
