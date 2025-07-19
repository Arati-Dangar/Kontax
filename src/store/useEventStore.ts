import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface EventData {
  title: string;
  date: string;
  intent: string;
  location: string;
  description?: string;
}

interface EventStore {
  eventData: EventData;
  setEventData: (data: Partial<EventData>) => void;
  resetEventData: () => void;
}

export const useEventStore = create<EventStore>()(
  persist(
    set => ({
      eventData: {
        title: '',
        date: '',
        intent: '',
        location: '',
        description: '',
      },
      setEventData: data =>
        set(state => ({
          eventData: {...state.eventData, ...data},
        })),
      resetEventData: () =>
        set(() => ({
          eventData: {
            title: '',
            date: '',
            intent: '',
            location: '',
            description: '',
          },
        })),
    }),
    {
      name: 'event-storage', // key name in storage
      storage: {
        getItem: async key => {
          const item = await AsyncStorage.getItem(key);
          return item ? JSON.parse(item) : null; // Parse the string back to object
        },
        setItem: async (key, value) => {
          await AsyncStorage.setItem(key, JSON.stringify(value)); // Store as string
        },
        removeItem: async key => {
          await AsyncStorage.removeItem(key);
        },
      },
    },
  ),
);
