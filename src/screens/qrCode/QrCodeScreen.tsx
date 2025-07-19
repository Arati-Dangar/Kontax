import React, {useRef, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
  StatusBar,
  Share,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {SafeAreaView} from 'react-native-safe-area-context';
import Clipboard from '@react-native-clipboard/clipboard';
import RNShare from 'react-native-share';
import RNFS from 'react-native-fs';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import NetInfo from '@react-native-community/netinfo';
import {useEventStore} from '../../store/useEventStore';
import {usePersonalStore} from '../../store/userPersonalStore';
import {useNavigation} from '@react-navigation/native';
import {getIntentStyle} from '../../constants/intentData';
import {pushSharedQrCode} from '../../services/firebase_services/pushSharedQrCode';
import Header from '../../components/Header';

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

interface EventDetails {
  title: string;
  date: string;
  intent: string;
  location: string;
}

interface QRData {
  user: UserDetails;
  event: EventDetails;
  generatedAt: string;
  qrId: string;
}

const QrCodeScreen: React.FC = () => {
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const [manualMode, setManualMode] = useState<boolean>(true);

  const [qrValue, setQrValue] = useState<string>('');

  const {eventData} = useEventStore();
  const {formData: sampleUserData} = usePersonalStore();
  const generateUrl = () => {
    const baseUrl = 'http://harshpatel958.github.io/kontax-landing/';
    const params = new URLSearchParams();

    const {
      firstName,
      lastName,
      email,
      phone,
      organization,
      designation,
      linkedln,
    } = sampleUserData;

    const {title, date, intent, location} = eventData;

    // Only add selected fields if they exist
    if (firstName) params.append('firstName', firstName);
    if (lastName) params.append('lastName', lastName);
    if (email) params.append('email', email);
    if (phone) params.append('phone', phone);
    if (organization) params.append('organization', organization);
    if (designation) params.append('designation', designation);
    if (linkedln) params.append('linkedln', linkedln);

    if (title) params.append('title', title);
    if (date) params.append('date', date);
    if (intent) params.append('intent', intent);
    if (location) params.append('location', location);

    const finalUrl = `${baseUrl}?${params.toString()}`;
    console.log('Generated URL:', finalUrl);
    return finalUrl;
  };

  // const generateUrl = () => {
  //   const baseUrl = 'http://harshpatel958.github.io/kontax-landing/';
  //   console.log('Sample User Data:', sampleUserData);
  //   console.log('Event Data:', eventData);
  //   const params = new URLSearchParams();

  //   const combinedData = {
  //     ...sampleUserData,
  //     ...eventData,
  //   };
  //   Object.keys(combinedData).forEach(key => {
  //     if (combinedData[key]) {
  //       params.append(key, combinedData[key]);
  //     }
  //   });

  //   const finalUrl = `${baseUrl}?${params.toString()}`;
  //   console.log('Generated URL:', finalUrl);
  //   return finalUrl;
  // };
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

    const {
      title,
      date, // Format: YYYY-MM-DD or ISO
      // Format: HH:MM or full ISO datetime
      intent,
      location,
    } = eventData;

    let vCard = `BEGIN:VCARD\nVERSION:3.0\n`;
    vCard += `N:${lastName};${firstName};;;\n`;

    if (phone) vCard += `TEL;TYPE=work,VOICE:${phone}\n`;
    if (email) vCard += `EMAIL:${email}\n`;
    if (organization) vCard += `ORG:${organization}\n`;
    if (designation) vCard += `TITLE:${designation}\n`;
    if (linkedln) vCard += `URL:${linkedln}\n`;

    // Custom fields
    if (title) vCard += `X-EVENT-TITLE:${title}\n`;
    if (date) vCard += `X-EVENT-DATE:${date}\n`;
    if (intent) vCard += `X-EVENT-INTENT:${intent}\n`;
    if (location) vCard += `X-EVENT-LOCATION:${location}\n`;

    vCard += `END:VCARD`;

    console.log('Generated vCard:', vCard.trim());
    return vCard.trim();
  };

  // const generateVCard = () => {
  //   const {
  //     firstName,
  //     lastName,
  //     email,
  //     phone,
  //     organization,
  //     designation,
  //     linkedln,

  //   } = sampleUserData;

  //   let vCard = `BEGIN:VCARD\nVERSION:3.0\n`;
  //   vCard += `N:${lastName};${firstName};;;\n`;

  //   if (phone) vCard += `TEL;TYPE=work,VOICE:${phone}\n`;
  //   if (email) vCard += `EMAIL:${email}\n`;
  //   if (organization) vCard += `ORG:${organization}\n`;
  //   if (designation) vCard += `TITLE:${designation}\n`;
  //   if (linkedln) vCard += `URL:${linkedln}\n`;

  //   vCard += `END:VCARD`;

  //   console.log('Generated vCard:', vCard.trim());
  //   return vCard.trim();
  // };

  // Function to get QR data based on online status
  const getQRValue = () => {
    const onlineMode = manualMode !== null ? manualMode : isOnline;
    return onlineMode ? generateUrl() : generateVCard();
  };
  const isEffectiveOnline = manualMode !== null ? manualMode : isOnline;

  // Create a proper ref for QR Code
  const qrRef = useRef<any>(null);
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const qrScaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('Network state changed:', state.isConnected);
      setIsOnline(state.isConnected ?? false);
    });

    // Get initial network state
    NetInfo.fetch().then(state => {
      console.log('Initial network state:', state.isConnected);
      setIsOnline(state.isConnected ?? false);
    });

    // Generate QR data
    const qrDataObject: QRData = {
      user: sampleUserData,
      event: eventData,
      generatedAt: new Date().toISOString(),
      qrId: `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setQrData(qrDataObject);

    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(qrScaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulse animation
    startPulseAnimation();

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Update QR value when online status changes
  useEffect(() => {
    if (qrData) {
      const newQrValue = getQRValue();
      setQrValue(newQrValue);
    }
  }, [isOnline, qrData, manualMode]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      const apiLevel = Platform.constants?.Release || 0;

      if (parseInt(apiLevel, 10) >= 13) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };
  const modeSwitch = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <Text style={{marginRight: 10, fontWeight: 'bold', color: '#2C3E50'}}>
        Mode: {manualMode ? 'Online' : 'Offline'}
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: '#27AE60',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 20,
        }}
        onPress={() => {
          if (manualMode) setManualMode(false);
          else setManualMode(true);
        }}>
        <Text
          style={{
            fontWeight: 'bold',

            padding: 3,
            paddingHorizontal: 4,
            borderColor: 'green',

            borderRadius: 20,
            // backgroundColor: 'yellow',
          }}>
          Switch to: {manualMode ? 'Offline' : 'Online'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const handleShareQR = async () => {
    if (!qrData || !qrRef.current) {
      Alert.alert('Error', 'QR code or data not ready');
      return;
    }

    setIsProcessing(true);

    try {
      qrRef.current.toDataURL(async dataURL => {
        try {
          const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');
          const fileName = `qr-event-${Date.now()}.png`;
          const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;

          await RNFS.writeFile(filePath, base64Data, 'base64');

          const shareMessage = `🎉 Event: ${qrData.event.title}
📅 Date: ${qrData.event.date}
👤 By: ${qrData.user.firstName} ${qrData.user.lastName}
📲 Scan QR to view ${isEffectiveOnline ? 'online' : 'contact details'}`;

          const shareOptions = {
            title: `Event: ${qrData.event.title}`,
            message: shareMessage,
            url: 'file://' + filePath,
            type: 'image/png',
          };

          const result = await RNShare.open(shareOptions);

          if (result.success || result.app) {
            // ✅ Only push to Firebase if shared via app
            await pushSharedQrCode(
              qrData.event.title,
              qrData.event.date,
              isEffectiveOnline,
            );
          }
          setIsProcessing(false);
        } catch (err) {
          console.error('Share failed:', err);
          fallbackShare('Event QR:\n' + JSON.stringify(qrData, null, 2));
          setIsProcessing(false);
        }
      });
    } catch (error) {
      console.error('Error:', error);
      fallbackShare('Event QR:\n' + JSON.stringify(qrData, null, 2));
      setIsProcessing(false);
    }
  };

  const fallbackShare = async (message: string) => {
    try {
      await Share.share({
        message,
        title: 'Event QR Code',
      });
      setIsProcessing(false);
    } catch (error) {
      console.error('Fallback share error:', error);
      Alert.alert('Error', 'Failed to share QR code');
      setIsProcessing(false);
    }
  };

  const handleCopyData = async () => {
    if (!qrValue) {
      Alert.alert('Error', 'No data to copy');
      return;
    }

    try {
      await Clipboard.setString(qrValue);

      Alert.alert(
        'Copied! ✅',
        `${isOnline ? 'URL' : 'vCard'} data has been copied to clipboard`,
        [{text: 'OK', style: 'default'}],
      );
    } catch (error) {
      console.error('Copy error:', error);
      Alert.alert('Error', 'Failed to copy data to clipboard');
    }
  };

  const handleDownloadQR = async () => {
    if (!qrData) {
      Alert.alert('Error', 'QR code data not available');
      return;
    }

    if (!qrRef.current) {
      Alert.alert('Error', 'QR code not ready for download');
      return;
    }

    setIsProcessing(true);

    try {
      // Request storage permission
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Storage permission is required to download QR code',
        );
        setIsProcessing(false);
        return;
      }

      // Get QR code as data URL
      qrRef.current.toDataURL(async (dataURL: string) => {
        try {
          // Create filename
          const fileName = `qr-code-${qrData.event.title
            .replace(/[^a-z0-9]/gi, '_')
            .toLowerCase()}-${Date.now()}.png`;

          // Define file path
          const downloadDir =
            Platform.OS === 'ios'
              ? RNFS.DocumentDirectoryPath
              : RNFS.DownloadDirectoryPath;

          const filePath = `${downloadDir}/${fileName}`;

          // Convert data URL to base64
          const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');

          // Write file
          await RNFS.writeFile(filePath, base64Data, 'base64');

          // Save to camera roll (photo gallery)
          if (Platform.OS === 'ios') {
            await CameraRoll.save(filePath, {type: 'photo'});
          } else {
            // For Android, the file is already in Downloads folder
            // Optionally save to gallery as well
            try {
              await CameraRoll.save(filePath, {type: 'photo'});
            } catch (galleryError) {
              console.log('Gallery save failed, but file saved to Downloads');
            }
          }

          setIsProcessing(false);

          Alert.alert(
            'Download Successful! ✅',
            `QR code saved as:\n${fileName}\n\nLocation: ${
              Platform.OS === 'ios' ? 'Photos' : 'Downloads folder & Gallery'
            }`,
            [
              {text: 'OK', style: 'default'},
              {
                text: 'Open File',
                style: 'default',
                onPress: () => {
                  console.log('File saved at:', filePath);
                },
              },
            ],
          );
        } catch (fileError) {
          console.error('File save error:', fileError);
          setIsProcessing(false);
          Alert.alert('Error', 'Failed to save QR code to device');
        }
      });
    } catch (error) {
      console.error('Download error:', error);
      setIsProcessing(false);
      Alert.alert('Error', 'Failed to download QR code');
    }
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  if (!qrData || !qrValue) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Generating QR Code...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="" />

      <Header
        fadeAnim={fadeAnim}
        slideAnim={slideAnim}
        title="Event QR Code"
        subtitle=" Share your event details instantly"
        onBackPress={() => navigation.goBack()}
        renderFooter={modeSwitch}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* QR Code Container */}
        <Animated.View
          style={[
            styles.qrContainer,
            {
              opacity: fadeAnim,
              transform: [{scale: qrScaleAnim}, {scale: pulseAnim}],
            },
          ]}>
          <View style={styles.qrCodeWrapper}>
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
          </View>
          <Text style={styles.qrLabel}>
            Scan to {isOnline ? 'view details online' : 'add to contacts'}
          </Text>
        </Animated.View>

        {/* Event Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>📱 QR Code Generated</Text>
            <TouchableOpacity
              style={styles.detailsToggle}
              onPress={toggleDetails}>
              <Text style={styles.detailsToggleText}>
                {showDetails ? 'Hide Details' : 'Show Details'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Mode:</Text>

            <Text
              style={[
                styles.summaryValue,
                {color: isOnline ? '#4CAF50' : '#FF5722'},
              ]}>
              {manualMode ? 'Online' : 'Offline'}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Event:</Text>
            <Text style={styles.summaryValue}>{qrData.event.title}</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Date:</Text>
            <Text style={styles.summaryValue}>{qrData.event.date}</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Intent:</Text>
            <Text
              style={[
                styles.summaryValutIntent,
                getIntentStyle(qrData.event.intent),
              ]}>
              {qrData.event.intent}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Location:</Text>
            <Text style={styles.summaryValue}>{qrData.event.location}</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Organizer:</Text>
            <Text style={styles.summaryValue}>
              {`${qrData.user.firstName} ${qrData.user.lastName}`}
            </Text>
          </View>
        </View>

        {/* Detailed Information (Collapsible) */}
        {showDetails && (
          <Animated.View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>
              {isOnline ? 'Generated URL' : 'Generated vCard'}
            </Text>
            <View style={styles.jsonContainer}>
              <Text style={styles.jsonText}>{qrValue}</Text>
            </View>
          </Animated.View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              isProcessing && styles.disabledButton,
            ]}
            onPress={handleShareQR}
            activeOpacity={0.8}
            disabled={isProcessing}>
            <Text style={styles.primaryButtonText}>
              {isProcessing ? '⏳ Processing...' : '📤 Share QR Code'}
            </Text>
          </TouchableOpacity>

          <View style={styles.secondaryButtonsRow}>
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                isProcessing && styles.disabledButton,
              ]}
              onPress={handleDownloadQR}
              activeOpacity={0.8}
              disabled={isProcessing}>
              <Text style={styles.secondaryButtonText}>💾 Download</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleCopyData}
              activeOpacity={0.8}>
              <Text style={styles.secondaryButtonText}>
                📋 Copy {isOnline ? 'URL' : 'vCard'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#7F8C8D',
  },
  header: {
    backgroundColor: '#27AE60',
    paddingTop: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#A8E6C8',
    marginBottom: 12,
  },
  networkStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  networkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  scrollContent: {
    paddingTop: 30,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  qrCodeWrapper: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  qrLabel: {
    marginTop: 12,
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  summaryContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  detailsToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#27AE60',
    borderRadius: 16,
  },
  detailsToggleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  summaryItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '600',
    width: 80,
  },
  summaryValue: {
    fontSize: 16,
    color: '#2C3E50',
    flex: 1,
  },
  summaryValutIntent: {
    fontSize: 16,
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'grey',
  },
  detailsContainer: {
    backgroundColor: '#F1F2F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  jsonContainer: {
    backgroundColor: '#2C3E50',
    borderRadius: 8,
    padding: 12,
  },
  jsonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 18,
  },
  actionContainer: {
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: '#27AE60',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#27AE60',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    flex: 0.48,
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#27AE60',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  // Debug styles (Remove in production)
  debugContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  debugText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default QrCodeScreen;
