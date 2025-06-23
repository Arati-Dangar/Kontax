import {useNavigation} from '@react-navigation/native';
import {usePersonalStore} from '../../store/userPersonalStore';

import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconT from 'react-native-vector-icons/FontAwesome';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  organization: string;
  designation: string;
  linkedln: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  organization: string;
  designation: string;
  linkedln: string;
}

const PersonalDetailsFormScreen: React.FC = () => {
  const {formData, setFormData} = usePersonalStore();
  const navigation = useNavigation();
  const [errors, setErrors] = useState<FormErrors>({});
  const [focusedField, setFocusedField] = useState<string>('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;

    return phoneRegex.test(phone);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.organization.trim()) {
      newErrors.organization = 'Organization is required';
    }

    if (!formData.designation.trim()) {
      newErrors.designation = 'Designation is required';
    }

    if (!formData.linkedln.trim()) {
      newErrors.linkedln = 'linkedln url is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData({[field]: value});
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: undefined}));
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      Alert.alert(
        'Success!',
        'Personal details have been saved successfully.',
        [{text: 'OK'}],
      );
      console.log('Form Data:', formData);
    } else {
      Alert.alert(
        'Validation Error',
        'Please fill in all required fields correctly.',
        [{text: 'OK'}],
      );
    }
    setFormData(formData);
    console.log(formData);
    navigation.navigate('PersonalData');
  };

  const renderInput = (
    field: keyof FormData,
    placeholder: string,
    icon: React.ReactNode,
    keyboardType: 'default' | 'email-address' | 'phone-pad' = 'default',
  ) => {
    const isFocused = focusedField === field;
    const hasError = !!errors[field];

    return (
      <View style={styles.inputContainer}>
        <View
          style={[
            styles.inputWrapper,
            isFocused && styles.inputWrapperFocused,
            hasError && styles.inputWrapperError,
          ]}>
          <Text style={styles.inputIcon}>{icon}</Text>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#A0A0A0"
            value={formData[field]}
            onChangeText={value => handleInputChange(field, value)}
            onFocus={() => setFocusedField(field)}
            onBlur={() => setFocusedField('')}
            keyboardType={keyboardType}
          />
        </View>
        {hasError && (
          <Animated.Text style={styles.errorText}>
            {errors[field]}
          </Animated.Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
            },
          ]}>
          <View style={styles.header}>
            <Text style={styles.title}>Personal Details</Text>
            <Text style={styles.subtitle}>Please fill in your information</Text>
          </View>

          <ScrollView
            style={styles.formContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {renderInput(
              'firstName',
              'First Name',
              <Icon name="person" size={24} color="#4292c6" />,
            )}
            {renderInput(
              'lastName',
              'Last Name',
              <Icon name="person" size={24} color="#4292c6" />,
            )}
            {renderInput(
              'email',
              'Email Address',
              <Icon name="email" size={24} color="#4292c6" />,
              'email-address',
            )}
            {renderInput(
              'phone',
              'Phone Number',
              <Icon name="phone" size={24} color="#4292c6" />,
              'phone-pad',
            )}
            {renderInput(
              'organization',
              'Organization',
              <Icon name="home" size={24} color="#4292c6" />,
            )}
            {renderInput(
              'designation',
              'Designation',
              <Icon name="work" size={24} color="#4292c6" />,
            )}
            {renderInput(
              'linkedln',
              'Linkedln',
              <IconT name="linkedin-square" size={24} color="#0077B5" />,
            )}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.8}>
              <Text style={styles.submitButtonText}>Save Details</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  inputWrapperFocused: {
    borderColor: '#3498DB',
    shadowOpacity: 0.1,
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
  errorText: {
    color: '#E74C3C',
    fontSize: 14,
    marginTop: 6,
    marginLeft: 16,
  },
  submitButton: {
    backgroundColor: '#3498DB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,

    shadowColor: '#3498DB',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default PersonalDetailsFormScreen;
