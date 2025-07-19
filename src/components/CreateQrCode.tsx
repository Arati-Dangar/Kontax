// components/CreateQrCode.tsx
import {usePersonalStore} from '../store/userPersonalStore';
import React, {useEffect, useRef, useState} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface UserDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  dateOfBirth: string;
}
interface QRData {
  user: UserDetails;

  generatedAt: string;
  qrId: string;
}
const CreateQrCode = () => {
  const qrRef = useRef<any>(null);
  const qrScaleAnim = useRef(new Animated.Value(0.8)).current;
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [qrValue, setQrValue] = useState<string>('');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const {formData: sampleUserData} = usePersonalStore();

  const generateVCard = () => {
    const {
      firstName,
      lastName,
      email,
      phone,
      organization,
      designation,
      linkedln,
    } = sampleUserData;

    let vCard = `BEGIN:VCARD\nVERSION:3.0\n`;
    vCard += `N:${lastName};${firstName};;;\n`;

    if (phone) vCard += `TEL;TYPE=work,VOICE:${phone}\n`;
    if (email) vCard += `EMAIL:${email}\n`;
    if (organization) vCard += `ORG:${organization}\n`;
    if (designation) vCard += `TITLE:${designation}\n`;
    if (linkedln) vCard += `URL:${linkedln}\n`;

    vCard += `END:VCARD`;

    console.log('Generated vCard:', vCard.trim());
    return vCard.trim();
  };
  useEffect(() => {
    const qrDataObject: QRData = {
      user: sampleUserData,
      generatedAt: new Date().toISOString(),
      qrId: `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    setQrData(qrDataObject);
  }, []);

  useEffect(() => {
    if (qrData) {
      const newQrValue = generateVCard();
      setQrValue(newQrValue);
    }
  }, [qrData]);

  return (
    <Animated.View
      style={{
        alignItems: 'center',
        transform: [{scale: qrScaleAnim}, {scale: pulseAnim}],
      }}>
      <View style={styles.qrWrapper}>
        {qrValue !== '' && (
          <QRCode
            value={qrValue}
            size={200}
            ref={qrRef}
            backgroundColor="white"
            color="black"
            getRef={c => {
              if (c) {
                qrRef.current = c;
              }
            }}
          />
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  qrWrapper: {
    padding: 18,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    marginTop: 10,
    fontSize: 14,
    color: '#2C3E50',
  },
});

export default CreateQrCode;
