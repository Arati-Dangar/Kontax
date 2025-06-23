import {useEventStore} from '../../store/useEventStore';
import {useNavigation} from '@react-navigation/native';
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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

const {width} = Dimensions.get('window');

interface EventData {
  title: string;
  date: string;
  intent: string;
  location: string;
}

interface FormErrors {
  title?: string;
  date?: string;
  intent?: string;
  location?: string;
}

interface IntentOption {
  id: string;
  label: string;
  icon: string;
  description: string;
}

const intentOptions: IntentOption[] = [
  {
    id: 'networking',
    label: 'Networking',
    icon: '🤝',
    description: 'Connect with like-minded people',
  },
  {
    id: 'partnership',
    label: 'Partnership',
    icon: '🤝',
    description: 'Explore business collaborations',
  },
  {
    id: 'exploration',
    label: 'Exploration',
    icon: '🔍',
    description: 'Discover new opportunities',
  },
  {
    id: 'nothing_specific',
    label: 'Nothing Specific',
    icon: '🎯',
    description: 'Just going with the flow',
  },
];

const CreateEventScreen: React.FC = () => {
  const {eventData, setEventData} = useEventStore();
  const navigation = useNavigation();
  const [errors, setErrors] = useState<FormErrors>({});
  const [focusedField, setFocusedField] = useState<string>('');
  const [showIntentModal, setShowIntentModal] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const modalScale = useRef(new Animated.Value(0.8)).current;

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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!eventData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!eventData.date.trim()) {
      newErrors.date = 'Event date is required';
    }

    if (!eventData.intent.trim()) {
      newErrors.intent = 'Please select an intent';
    }
    if (!eventData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleInputChange = (field: keyof EventData, value: string) => {
    setEventData({[field]: value}); // ✅ update just one field

    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: undefined}));
    }
  };

  const handleIntentSelect = (intent: IntentOption) => {
    handleInputChange('intent', intent.label);
    setShowIntentModal(false);
  };

  const openIntentModal = () => {
    setShowIntentModal(true);
    // Reset and animate the modal scale
    modalScale.setValue(0.8);
    Animated.spring(modalScale, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const closeIntentModal = () => {
    Animated.timing(modalScale, {
      toValue: 0.8,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowIntentModal(false);
    });
  };

  const handleCreateEvent = () => {
    if (validateForm()) {
      setEventData(eventData);
      console.log(eventData);
      navigation.navigate('QRCode');
    } else {
      Alert.alert('Validation Error', 'Please fill in all required fields.', [
        {text: 'OK'},
      ]);
    }
  };

  const renderIntentOption = ({item}: {item: IntentOption}) => (
    <TouchableOpacity
      style={styles.intentOption}
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

  const getSelectedIntentIcon = () => {
    const selectedIntent = intentOptions.find(
      option => option.label === eventData.intent,
    );
    return selectedIntent ? selectedIntent.icon : '🎯';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#9B59B6" />

      {/* Header */}
      <View style={styles.header}>
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
            },
          ]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Event</Text>
          <Text style={styles.headerSubtitle}>
            Plan your next amazing event
          </Text>
        </Animated.View>
      </View>

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
                value={eventData.title}
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
            <View
              style={[
                styles.inputWrapper,
                focusedField === 'date' && styles.inputWrapperFocused,
                errors.date && styles.inputWrapperError,
              ]}>
              <Text style={styles.inputIcon}>📅</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/DD/YYYY or DD/MM/YYYY"
                placeholderTextColor="#A0A0A0"
                value={eventData.date}
                onChangeText={value => handleInputChange('date', value)}
                onFocus={() => setFocusedField('date')}
                onBlur={() => setFocusedField('')}
              />
            </View>
            {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
          </View>

          {/* Event Intent Dropdown */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Event Intent</Text>
            <TouchableOpacity
              style={[
                styles.inputWrapper,
                styles.dropdownWrapper,
                errors.intent && styles.inputWrapperError,
              ]}
              onPress={openIntentModal}
              activeOpacity={0.8}>
              <Text style={styles.inputIcon}>{getSelectedIntentIcon()}</Text>
              <Text
                style={[
                  styles.dropdownText,
                  !eventData.intent && styles.placeholderText,
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
                value={eventData.location}
                onChangeText={value => handleInputChange('location', value)}
                onFocus={() => setFocusedField('location')}
                onBlur={() => setFocusedField('')}
              />
            </View>
            {errors.location && (
              <Text style={styles.errorText}>{errors.location}</Text>
            )}
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

      {/* Intent Selection Modal */}
      <Modal
        visible={showIntentModal}
        transparent={true}
        animationType="none"
        onRequestClose={closeIntentModal}
        statusBarTranslucent={true}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeIntentModal}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={e => e.stopPropagation()}>
            <Animated.View
              style={[
                styles.modalContainer,
                {transform: [{scale: modalScale}]},
              ]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Event Intent</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={closeIntentModal}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={intentOptions}
                renderItem={renderIntentOption}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalContent}
              />
            </Animated.View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#9B59B6',
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
    color: '#E8E3F0',
  },
  formCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: -20,
    marginHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
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
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#E8E8E8',
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
    height: 50,
    fontSize: 16,
    color: '#2C3E50',
  },
  dropdownWrapper: {
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
  },
  placeholderText: {
    color: '#A0A0A0',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 14,
    marginTop: 6,
  },
  createButton: {
    backgroundColor: '#9B59B6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#9B59B6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: width * 0.85,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  modalContent: {
    paddingVertical: 16,
  },
  intentOption: {
    paddingHorizontal: 24,
    paddingVertical: 16,
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
