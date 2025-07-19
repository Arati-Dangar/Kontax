// src/services/firebase_services/pushSharedQrCode.ts

import {ref, push} from 'firebase/database';
import {database} from '../../../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const pushSharedQrCode = async (
  eventTitle: string,
  eventDate: string,
  isEffectiveOnline: boolean,
): Promise<void> => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) throw new Error('User ID not found in AsyncStorage');

    const sharedRef = ref(database, `users/${userId}/sharedQrcode`);
    await push(sharedRef, {
      title: eventTitle,
      date: eventDate,
      sharedAt: new Date().toISOString(),
      isEffectiveOnline,
    });
  } catch (error) {
    console.error('Failed to push shared QR code:', error);
    throw error;
  }
};
