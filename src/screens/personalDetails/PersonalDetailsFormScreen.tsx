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
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconT from 'react-native-vector-icons/FontAwesome';
import {textColor} from '../../assets/pngs/Colors/color';
import {openPrepopulatedDB} from '../../services/db';
import {userDetails} from '../../services/userDeatils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchImageLibrary} from 'react-native-image-picker';
import {set} from '@react-native-firebase/database';

interface FormData {
  firstName: string;
  lastName: string;
  bio: string;
  phone: string;

  organization: string;
  designation: string;
  linkedln: string;
  profileImage: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  bio?: string;
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

  const {addPersonalDetail} = userDetails();
  const handleSelectImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.7,
        includeBase64: true,
      },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert(
            'Error',
            response.errorMessage || 'Image selection failed',
          );
          return;
        }

        const asset = response.assets?.[0];
        if (asset?.base64) {
          const imageUri = `data:${asset.type};base64,${asset.base64}`;
          setFormData({...formData, profileImage: imageUri});
        }
      },
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert(
        'Validation Error',
        'Please fill in all required fields correctly.',
        [{text: 'OK'}],
      );
      return;
    }

    try {
      const db = await openPrepopulatedDB();

      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      const updatedUser = {
        name: fullName, // ✅ combine first + last

        phone: formData.phone,

        linkedln: formData.linkedln,
        bio: formData.bio,
        organization: formData.organization,
        designation: formData.designation,
        profileImage: '', // or formData.profileImage
        createdAt: new Date().toISOString(),
      };

      await addPersonalDetail(db, updatedUser);

      navigation.navigate('PrivacyControl');
    } catch (error) {
      console.log('Submit error:', error);
      Alert.alert('Error', 'Failed to update user.');
    }
  };

  const renderInput = (
    field: keyof FormData,
    placeholder: string,
    icon: React.ReactNode,
    keyboardType: 'default' | 'phone-pad' = 'default',
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
            placeholder={placeholder}
            placeholderTextColor="#A0A0A0"
            value={formData[field]}
            multiline={field === 'bio'}
            numberOfLines={field === 'bio' ? 4 : 1}
            style={[
              styles.input,
              field === 'bio' && {height: 100, textAlignVertical: 'top'},
            ]}
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
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleSelectImage}
            activeOpacity={0.7}>
            {formData.profileImage ? (
              <Image
                source={{uri: formData.profileImage}}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.avatarText}>
                {formData.firstName?.charAt(0).toUpperCase() ?? '?'}
                {formData.lastName?.charAt(0).toUpperCase() ?? ''}
              </Text>
            )}
          </TouchableOpacity>

          <ScrollView
            style={styles.formContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {renderInput(
              'firstName',
              'First Name',
              <Icon name="person" size={24} color={textColor.bg} />,
            )}
            {renderInput(
              'lastName',
              'Last Name',
              <Icon name="person" size={24} color={textColor.bg} />,
            )}

            {renderInput(
              'phone',
              'Phone Number',
              <Icon name="phone" size={24} color={textColor.bg} />,
              'phone-pad',
            )}
            {renderInput(
              'organization',
              'Organization',
              <Icon name="home" size={24} color={textColor.bg} />,
            )}
            {renderInput(
              'designation',
              'Designation',
              <Icon name="work" size={24} color={textColor.bg} />,
            )}
            {renderInput(
              'linkedln',
              'Linkedln',
              <IconT name="linkedin-square" size={24} color={textColor.bg} />,
            )}

            {renderInput(
              'bio',
              'Enter your bio',
              <IconT name="user" size={20} color={textColor.bg} />,
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
  avatarContainer: {
    alignSelf: 'center',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3498DB',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: textColor.bg,
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
    backgroundColor: textColor.bg,
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
