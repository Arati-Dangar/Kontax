import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organization: string;
  designation: string;
  linkedln: string;
}

interface PersonalStore {
  formData: FormData;
  setFormData: (data: Partial<FormData>) => void;
  resetForm: () => void;
}
export const usePersonalStore = create<PersonalStore>()(
  persist(
    set => ({
      formData: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        organization: '',
        designation: '',
        linkedln: '',
      },
      setFormData: data =>
        set(state => ({
          formData: {...state.formData, ...data},
        })),
      resetForm: () =>
        set(() => ({
          formData: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            organization: '',
            designation: '',
            linkedln: '',
          },
        })),
    }),
    {
      name: 'user-storage', // key name in storage
      storage: {
        getItem: async key => {
          const item = await AsyncStorage.getItem(key);
          return item ? JSON.parse(item) : null;
        },
        setItem: async (key, value) => {
          await AsyncStorage.setItem(key, JSON.stringify(value));
        },
        removeItem: async key => {
          await AsyncStorage.removeItem(key);
        },
      },
    },
  ),
);
