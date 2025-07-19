import Header from '../../components/Header';
import {useEventStore} from '../../store/useEventStore';
import {useNavigation} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
  StatusBar,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {textColor} from '../../assets/pngs/Colors/color';
import {pushEventToFirebase} from '../../services/firebase_services/createEventOfUser';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width, height} = Dimensions.get('window');

interface EventData {
  title: string;
  date: string;
  intent: string;
  location: string;
  description?: string;
}

interface FormErrors {
  title?: string;
  date?: string;
  intent?: string;
  location?: string;
  description?: string;
}

interface IntentOption {
  id: string;
  label: string;
  icon: string;
  description: string;
  color: string;
}

const intentOptions: IntentOption[] = [
  {
    id: 'networking',
    label: 'Networking',
    icon: '🤝',
    description: 'Connect with like-minded people',
    color: 'grey',
  },
  {
    id: 'partnership',
    label: 'Partnership',
    icon: '🤝',
    description: 'Explore business collaborations',
    color: 'green',
  },
  {
    id: 'exploration',
    label: 'Exploring Market/Ideas',
    icon: '🔍',
    description: 'Discover new opportunities',
    color: 'yellow',
  },
  {
    id: 'selling product',
    label: 'Selling Product/Services',
    icon: '🎯',
    description: 'Promote your offerings',
    color: 'purple',
  },
  {
    id: 'hiring',
    label: 'Hiring',
    icon: '👥',
    description: 'Find talented individuals',
    color: 'blue',
  },
  {
    id: 'custom',
    label: 'Custom Intent',
    icon: '⚡',
    description: 'Define your own purpose',
    color: 'brown',
  },
];

const CreateEventScreen: React.FC = () => {
  const {eventData, setEventData} = useEventStore();

  const navigation = useNavigation();
  const [errors, setErrors] = useState<FormErrors>({});
  const [focusedField, setFocusedField] = useState<string>('');
  const [showIntentModal, setShowIntentModal] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
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
    ]).start();
  }, []);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    console.log('Date picker event:', event.type, selectedDate);

    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        setTempDate(selectedDate);
        const formattedDate = selectedDate.toLocaleDateString('en-US');
        handleInputChange('date', formattedDate);
      }
    } else {
      // iOS
      if (selectedDate) {
        setTempDate(selectedDate);
        const formattedDate = selectedDate.toLocaleDateString('en-US');
        handleInputChange('date', formattedDate);
      }
    }
  };

  const confirmIOSDate = () => {
    setShowDatePicker(false);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!eventData.title?.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!eventData.date?.trim()) {
      newErrors.date = 'Event date is required';
    }

    if (!eventData.intent?.trim()) {
      newErrors.intent = 'Please select an intent';
    }

    if (!eventData.location?.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof EventData, value: string) => {
    const updatedData = {...eventData, [field]: value};
    setEventData(updatedData);

    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: undefined}));
    }
  };

  const handleIntentSelect = (intent: IntentOption) => {
    console.log('Intent selected:', intent.label);
    handleInputChange('intent', intent.label);
    setShowIntentModal(false);
  };
  const handleCreateEvent = async () => {
    if (validateForm()) {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      try {
        await pushEventToFirebase(userId, token, eventData); // Push to Firebase
        console.log('Event Data:', eventData);
        navigation.navigate('QRCode' as never);
      } catch (error) {
        console.log('error', error.message);
        Alert.alert('Error', 'Failed to save event. Please try again.');
      }
    } else {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
    }
  };

  // const handleCreateEvent = () => {
  //   if (validateForm()) {
  //     console.log('Event Data:', eventData);
  //     navigation.navigate('QRCode' as never);
  //   } else {
  //     Alert.alert('Validation Error', 'Please fill in all required fields.');
  //   }
  // };

  // const renderIntentOption = ({item}: {item: IntentOption}) => (
  //   <TouchableOpacity
  //     style={styles.intentOption}
  //     onPress={() => handleIntentSelect(item)}
  //     activeOpacity={0.7}>
  //     <View style={styles.intentOptionContent}>
  //       <Text style={styles.intentIcon}>{item.icon}</Text>
  //       <View style={styles.intentTextContainer}>
  //         <Text style={styles.intentLabel}>{item.label}</Text>
  //         <Text style={styles.intentDescription}>{item.description}</Text>
  //       </View>
  //     </View>
  //   </TouchableOpacity>
  // );
  const renderIntentOption = ({item}: {item: IntentOption}) => {
    if (item.id === 'custom') {
      return (
        <View style={[styles.intentOption, {paddingBottom: 16}]}>
          <Text style={styles.inputLabel}>Enter Custom Intent</Text>
          <TextInput
            placeholder="Type your custom intent"
            placeholderTextColor="#A0A0A0"
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              padding: 10,
              fontSize: 16,
              color: '#2C3E50',
            }}
            value={
              eventData.intent &&
              !intentOptions.find(opt => opt.label === eventData.intent)
                ? eventData.intent
                : ''
            }
            onChangeText={text => handleInputChange('intent', text)}
          />

          <TouchableOpacity
            style={{
              marginTop: 10,
              backgroundColor: '#9B59B6',
              paddingVertical: 10,
              borderRadius: 8,
              alignItems: 'center',
            }}
            onPress={() => {
              if (eventData.intent.trim()) {
                setShowIntentModal(false);
              }
            }}>
            <Text style={{color: '#fff', fontWeight: '600'}}>
              Save Custom Intent
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    const isSelected = eventData.intent === item.label;

    return (
      <TouchableOpacity
        style={[
          styles.intentOption,
          isSelected && {backgroundColor: '#EEE6F6', borderRadius: 10},
        ]}
        onPress={() => handleIntentSelect(item)}
        activeOpacity={0.7}>
        <View style={styles.intentOptionContent}>
          <Text style={styles.intentIcon}>{item.icon}</Text>
          <View style={styles.intentTextContainer}>
            <Text style={styles.intentLabel}>{item.label}</Text>
            <Text style={styles.intentDescription}>{item.description}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getSelectedIntentIcon = () => {
    const selectedIntent = intentOptions.find(
      option => option.label === eventData.intent,
    );
    return selectedIntent ? selectedIntent.icon : '🎯';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={textColor.bg}
        translucent={false}
      />
      <Header
        fadeAnim={fadeAnim}
        slideAnim={slideAnim}
        title="Create Event"
        subtitle="Plan your next amazing event"
        onBackPress={() => navigation.goBack()}
      />

      {/* Form Card */}
      <Animated.View
        style={[
          styles.formCard,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* Event Title */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Event Title</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedField === 'title' && styles.inputWrapperFocused,
                errors.title && styles.inputWrapperError,
              ]}>
              <Text style={styles.inputIcon}>🎉</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter event title"
                placeholderTextColor="#A0A0A0"
                value={eventData.title || ''}
                onChangeText={value => handleInputChange('title', value)}
                onFocus={() => setFocusedField('title')}
                onBlur={() => setFocusedField('')}
              />
            </View>
            {errors.title && (
              <Text style={styles.errorText}>{errors.title}</Text>
            )}
          </View>

          {/* Event Date */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Event Date</Text>
            <TouchableOpacity
              style={[
                styles.inputWrapperT,
                errors.date && styles.inputWrapperError,
              ]}
              onPress={() => {
                console.log('Opening date picker');
                setShowDatePicker(true);
              }}
              activeOpacity={0.7}>
              <Text style={styles.inputIcon}>📅</Text>
              <Text
                style={[
                  styles.dateText,
                  {color: eventData.date ? '#2C3E50' : '#A0A0A0'},
                ]}>
                {eventData.date || 'Select Date'}
              </Text>
            </TouchableOpacity>
            {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
          </View>

          {/* Event Intent */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Event Intent</Text>
            <TouchableOpacity
              style={[
                styles.inputWrapperT,
                errors.intent && styles.inputWrapperError,
              ]}
              onPress={() => {
                console.log('Opening intent modal');
                setShowIntentModal(true);
              }}
              activeOpacity={0.7}>
              <Text style={styles.inputIcon}>{getSelectedIntentIcon()}</Text>
              <Text
                style={[
                  styles.dateText,
                  {color: eventData.intent ? '#2C3E50' : '#A0A0A0'},
                ]}>
                {eventData.intent || 'Select event intent'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
            {errors.intent && (
              <Text style={styles.errorText}>{errors.intent}</Text>
            )}
          </View>

          {/* Event Location */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Event Location</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedField === 'location' && styles.inputWrapperFocused,
                errors.location && styles.inputWrapperError,
              ]}>
              <Text style={styles.inputIcon}>📍</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter event location"
                placeholderTextColor="#A0A0A0"
                value={eventData.location || ''}
                onChangeText={value => handleInputChange('location', value)}
                onFocus={() => setFocusedField('location')}
                onBlur={() => setFocusedField('')}
              />
            </View>
            {errors.location && (
              <Text style={styles.errorText}>{errors.location}</Text>
            )}
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedField === 'description' && styles.inputWrapperFocused,
              ]}>
              <Text style={styles.inputIcon}>🗒️</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your thoughts"
                placeholderTextColor="#A0A0A0"
                value={eventData.description || ''}
                onChangeText={value => handleInputChange('description', value)}
                onFocus={() => setFocusedField('description')}
                onBlur={() => setFocusedField('')}
              />
            </View>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateEvent}
            activeOpacity={0.8}>
            <Text style={styles.createButtonText}>Create Event</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}>
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                style={styles.datePickerStyle}
              />

              {Platform.OS === 'ios' && (
                <View style={styles.datePickerActions}>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={confirmIOSDate}>
                    <Text style={styles.datePickerButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}

      {/* Intent Selection Modal */}
      {showIntentModal && (
        <Modal
          visible={showIntentModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowIntentModal(false)}>
          <View style={styles.intentModalOverlay}>
            <View style={styles.intentModalContainer}>
              <View style={styles.intentModalHeader}>
                <Text style={styles.intentModalTitle}>Select Event Intent</Text>
                <TouchableOpacity
                  style={styles.intentModalClose}
                  onPress={() => setShowIntentModal(false)}>
                  <Text style={styles.intentModalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={intentOptions}
                renderItem={renderIntentOption}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.intentModalContent}
              />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  formCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: -20,
    marginHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  scrollContent: {
    paddingTop: 30,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    minHeight: 5,
  },

  inputWrapperT: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    minHeight: 5,
  },
  inputWrapperFocused: {
    borderColor: '#9B59B6',
    backgroundColor: '#FFFFFF',
  },
  inputWrapperError: {
    borderColor: '#E74C3C',
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
  },
  dateText: {
    flex: 1,
    fontSize: 16,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 8,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 14,
    marginTop: 6,
  },
  debugContainer: {
    padding: 15,
    backgroundColor: '#E8F4FD',
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#B3D9FF',
  },
  debugText: {
    fontSize: 12,
    color: '#2C3E50',
    marginBottom: 4,
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#9B59B6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 30,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },

  // Date Picker Modal Styles
  datePickerModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: height * 0.6,
    paddingBottom: 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F6',
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  datePickerClose: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerCloseText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  datePickerStyle: {
    width: '100%',
    height: 200,
  },
  datePickerActions: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  datePickerButton: {
    backgroundColor: '#9B59B6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  datePickerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Intent Modal Styles
  intentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  intentModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: height * 0.7,
  },
  intentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F6',
  },
  intentModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  intentModalClose: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  intentModalCloseText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  intentModalContent: {
    paddingVertical: 16,
  },
  intentOption: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  intentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  intentIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  intentTextContainer: {
    flex: 1,
  },
  intentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  intentDescription: {
    fontSize: 14,
    color: '#7F8C8D',
  },
});

export default CreateEventScreen;
