import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import PersonalDetailsFormScreen from '../screens/personalDetails/PersonalDetailsFormScreen';
import PersonalDataScreen from '../screens/pesonalData/PersonalDataScreen';
import CreateEventScreen from '../screens/createEvent/CreateEventScreen';
import QrCodeScreen from '../screens/qrCode/QrCodeScreen';
import ContactDetailsForm from '../screens/contactDetailsForm/ContactDetailsForm';
import ScanQrScreen from '../screens/scanQr/ScanQrScreen';
import VcardHistoryScreen from '../screens/vcardHistory/VcardHistoryScreen';

export type RootStackParamList = {
  PersonalDetailsForm: undefined;
  PersonalData: undefined;
  CreateEvent: undefined;
  QRCode: undefined;
  ContactDetailsForm: undefined;
  ScanQr: undefined;
  VcardHistory: undefined;
};
const Stack = createNativeStackNavigator<RootStackParamList>();
const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="PersonalDetailsForm">
      <Stack.Screen
        name="PersonalDetailsForm"
        component={PersonalDetailsFormScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="VcardHistory"
        component={VcardHistoryScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ScanQr"
        component={ScanQrScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="PersonalData"
        component={PersonalDataScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="CreateEvent"
        component={CreateEventScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="QRCode"
        component={QrCodeScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="ContactDetailsForm"
        component={ContactDetailsForm}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
