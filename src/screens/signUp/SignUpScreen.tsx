// import { useNavigation } from '@react-navigation/native';
// import { textColor } from '../../assets/pngs/Colors/color';

// import uuid from 'react-native-uuid';
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Dimensions,
//   StatusBar,
//   Platform,
//   SafeAreaView,
//   Animated,
//   KeyboardAvoidingView,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import { Image } from 'react-native';
// import { openPrepopulatedDB } from '../../services/db';
// import { userDetails } from '../../services/userDeatils';
// import { signUpWithEmail } from '../../services/firebase_services/signUpWithEmail';
// import { usePersonalStore } from '../../store/userPersonalStore';

// const { width, height } = Dimensions.get('window');

// // Constants for maintainability
// const COLORS = {
//   primary: '#667eea',
//   secondary: '#764ba2',
//   white: '#ffffff',
//   black: '#000000',
//   gray: '#f8f9fa',
//   darkGray: '#6c757d',
//   lightGray: '#e9ecef',
//   error: '#dc3545',
//   success: '#28a745',
//   warning: '#ffc107',
//   transparent: 'transparent',
//   shadow: 'rgba(0, 0, 0, 0.1)',
//   inputBorder: '#dee2e6',
//   inputBorderFocus: '#667eea',
//   placeholder: '#adb5bd',
// };

// const SIZES = {
//   title: 32,
//   subtitle: 16,
//   input: 16,
//   button: 18,
//   link: 16,
//   error: 14,
//   icon: 24,
//   inputHeight: 56,
//   buttonHeight: 56,
//   borderRadius: 12,
//   buttonRadius: 28,
// };

// const SPACING = {
//   xs: 4,
//   sm: 8,
//   md: 16,
//   lg: 24,
//   xl: 32,
//   xxl: 48,
// };

// const VALIDATION_RULES = {
//   name: {
//     minLength: 2,
//     maxLength: 50,
//     pattern: /^[a-zA-Z\s]+$/,
//   },
//   email: {
//     pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//   },
//   phone: {
//     pattern: /^[\+]?[1-9][\d]{3,14}$/,
//   },
//   password: {
//     minLength: 8,
//     pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
//   },
// };

// const SignupScreen = ({
//   onSignupSuccess,
//   onNavigateToLogin,
//   onSocialLogin,
//   enableSocialLogin = true,

//   termsUrl = 'https://example.com/terms',
//   privacyUrl = 'https://example.com/privacy',
// }) => {

// const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
//  const resetForm = usePersonalStore(state => state.resetForm);

//   const inputRefs = {
//     email: useRef(),
//     password: useRef(),
//     confirmPassword: useRef(),
//   };

//   const handleInputChange = (field, value) => {
//     setFormData({ ...formData, [field]: value });
//     if (errors[field]) {
//       const { [field]: _, ...rest } = errors;
//       setErrors(rest);
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email';
//     if (formData.password.length < 8) newErrors.password = 'Password too short';
//     if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
//     if (!agreeToTerms) newErrors.terms = 'Agree to terms';
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // UI state
//   const [errors, setErrors] = useState({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [agreeToTerms, setAgreeToTerms] = useState(false);
//   const [focusedField, setFocusedField] = useState(null);
// const navigation=useNavigation();
//   // Animation values
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(50)).current;
//   const shakeAnim = useRef(new Animated.Value(0)).current;

//   // Validation functions
//   const validateField = useCallback((field, value) => {
//     switch (field) {

//       case 'email':
//         if (!value.trim()) return 'Email is required';
//         if (!VALIDATION_RULES.email.pattern.test(value)) return 'Please enter a valid email address';
//         return null;

//       case 'password':
//         if (!value) return 'Password is required';
//         if (value.length < VALIDATION_RULES.password.minLength) return `Password must be at least ${VALIDATION_RULES.password.minLength} characters`;
//         if (!VALIDATION_RULES.password.pattern.test(value)) return 'Password must contain uppercase, lowercase, number, and special character';
//         return null;

//       case 'confirmPassword':
//         if (!value) return 'Please confirm your password';
//         if (value !== formData.password) return 'Passwords do not match';
//         return null;

//       default:
//         return null;
//     }
//   }, [formData.password]);

//   const {addUserDetail}=userDetails();

//   const handleInputBlur = useCallback((field) => {
//     setFocusedField(null);
//     const error = validateField(field, formData[field]);
//     if (error) {
//       setErrors(prev => ({ ...prev, [field]: error }));
//     }
//   }, [formData, validateField]);

// // const handleSubmit = async () => {
// //   if (!validateForm()) return;

// //   setIsLoading(true);
// //   try {
// //     const { email, password} = formData;

// //     // Step 2: Open SQLite DB
// //     const db = await openPrepopulatedDB();

// //     // Step 3: Prepare user object
// //     const userData = {
// //       name: '',
// //       email,
// //       phone: '', // you can add this later if needed
// //       password,
// //       linkedln: '',
// //       bio: '',
// //       organization: '',
// //       designation: '',
// //       profileImage: '',
// //       createdAt: new Date().toISOString(),
// //     };

// //     // Step 4: Save user to SQLite + Firebase Realtime DB
// //     await addUserDetail(db, userData);

// //     console.log('userDetail', userData);

// //     // Step 5: Navigate to personal detail form
// //     Alert.alert('Signup successful', 'Welcome to Kontaxto!');
// //     navigation.navigate('PersonalDetailsForm');

// //   } catch (error) {
// //     console.error('Signup error:', error.message);
// //     Alert.alert('Signup Error', error.message);
// //   } finally {
// //     setIsLoading(false);
// //   }
// // };

// const handleSubmit = async () => {
//   if (!validateForm()) return;

//   setIsLoading(true);

//   try {
//     const { email, password } = formData;

//     const result = await signUpWithEmail(email, password);
//     console.log('Signup successful:', result.user);

//     // Optional: Store token
//     await AsyncStorage.setItem('accessToken', result.token);
//     await AsyncStorage.setItem('userId',result.user.uid)
//     await AsyncStorage.setItem('userEmail', email);
//     resetForm()

//     Alert.alert('Signup Successful', 'Welcome!');
//     navigation.navigate('PersonalDetailsForm');

//   } catch (error: any) {
//     Alert.alert('Signup Failed', error.message);
//     console.log(error)
//   } finally {
//     setIsLoading(false);
//   }
// };

//   const handleSocialSignup = useCallback((provider) => {
//     if (onSocialLogin) {
//       onSocialLogin(provider);
//     }
//   }, [onSocialLogin]);

//   // Render components
//   const renderHeader = () => (
//     <View
//       style={[
//         styles.header,

//       ]}
//     >
//       <Text style={styles.title}>Create Account</Text>
//       <Text style={styles.subtitle}>Join Kontaxto and start managing your contacts smarter</Text>
//     </View>
//   );

//   const renderInput = (field, placeholder, keyboardType = 'default', secureTextEntry = false) => {
//     const isPasswordField = field === 'password' || field === 'confirmPassword';
//     const showPasswordIcon = isPasswordField && (
//       field === 'password' ? showPassword : showConfirmPassword
//     );

//     return (
//       <View style={styles.inputContainer} key={field}>
//         <View style={[
//           styles.inputWrapper,
//           focusedField === field && styles.inputWrapperFocused,
//           errors[field] && styles.inputWrapperError,
//         ]}>
//           <TextInput
//             ref={inputRefs[field]}
//             style={[
//               styles.input,
//               errors[field] && styles.inputError,
//             ]}
//             placeholder={placeholder}
//             placeholderTextColor={COLORS.placeholder}
//             value={formData[field]}
//             onChangeText={(value) => handleInputChange(field, value)}

//             onBlur={() => handleInputBlur(field)}
//             keyboardType={keyboardType}
//             secureTextEntry={secureTextEntry && !showPasswordIcon}
//             autoCapitalize={field === 'email' ? 'none' : 'words'}
//          autoComplete={
//   field === 'email'
//     ? 'email'
//     : field === 'password' || field === 'confirmPassword'
//     ? 'password'
//     : 'off'
// }

//             testID={`input_${field}`}
//             returnKeyType={field === 'confirmPassword' ? 'done' : 'next'}
//            onSubmitEditing={() => {
//   const fieldOrder = ['email', 'password', 'confirmPassword'];
//   const currentIndex = fieldOrder.indexOf(field);
//   const nextField = fieldOrder[currentIndex + 1];

//   if (nextField && inputRefs[nextField]?.current) {
//     inputRefs[nextField].current.focus();
//   }
// }}

//           />
//           {isPasswordField && (
//             <TouchableOpacity
//               style={styles.eyeIcon}
//               onPress={() => {
//                 if (field === 'password') {
//                   setShowPassword(!showPassword);
//                 } else {
//                   setShowConfirmPassword(!showConfirmPassword);
//                 }
//               }}
//               testID={`toggle_${field}_visibility`}
//             >

//             </TouchableOpacity>
//           )}
//         </View>
//         {errors[field] && (
//           <Text style={styles.errorText} testID={`error_${field}`}>
//             {errors[field]}
//           </Text>
//         )}
//       </View>
//     );
//   };

//   const renderTermsCheckbox = () => (
//     <View style={{flexDirection:'row',alignItems:"center",justifyContent:'center'}}>
//     <TouchableOpacity
//       style={styles.checkboxContainer}
//       onPress={() => setAgreeToTerms(!agreeToTerms)}
//       testID="terms_checkbox"
//     >
//       <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
//         {agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
//       </View></TouchableOpacity>
//       <Text style={styles.checkboxText}>
//         I agree to the{' '}
//         <Text style={styles.linkText}>Terms of Service</Text>
//         {' '}and{' '}
//         <Text style={styles.linkText}>Privacy Policy</Text>
//       </Text></View>

//   );

//   const renderSignupButton = () => (
//     <TouchableOpacity
//       style={[
//         styles.signupButton,
//         (!agreeToTerms || isLoading) && styles.signupButtonDisabled,
//       ]}
//       onPress={handleSubmit}
//       disabled={!agreeToTerms || isLoading}
//       testID="signup_button"
//     >
//       {isLoading ? (
//         <ActivityIndicator color={COLORS.white} size="small" />
//       ) : (
//         <Text style={styles.signupButtonText}>Create Account</Text>
//       )}
//     </TouchableOpacity>
//   );

//   const renderSocialLogin = () => {
//     if (!enableSocialLogin) return null;

//     return (
//       <View style={styles.socialContainer}>
//         <View style={styles.divider}>
//           <View style={styles.dividerLine} />
//           <Text style={styles.dividerText}>or continue with</Text>
//           <View style={styles.dividerLine} />
//         </View>

//         <View style={styles.socialButtons}>
//           <TouchableOpacity
//             style={styles.socialButton}
//             onPress={() => handleSocialSignup('google')}
//             testID="google_signup"
//           >
//             <Image
//              source={require('../../assets/pngs/google.png')}  // Adjust path as needed
//    style={{ height:30, width:30}}/>
//             <Text style={styles.socialButtonText}>Google</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.socialButton}
//             onPress={() => handleSocialSignup('facebook')}
//             testID="facebook_signup"
//           >
//                <Image
//              source={require('../../assets/pngs/facebook.png')}  // Adjust path as needed
//  style={{ height:30, width:30}}/>
//             <Text style={styles.socialButtonText}> Facebook</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   const renderLoginLink = () => (
//     <View style={styles.loginContainer}>
//       <Text style={styles.loginText}>Already have an account? </Text>
//       <TouchableOpacity onPress={()=>navigation.navigate('Login')} testID="login_link">
//         <Text style={styles.loginLink}>Sign In</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.keyboardAvoid}
//       >
//         <ScrollView
//           contentContainerStyle={styles.scrollContent}
//           showsVerticalScrollIndicator={false}
//           keyboardShouldPersistTaps="handled"
//         >
//           <View
//             style={[
//               styles.formContainer,

//             ]}
//           >
//             {renderHeader()}

//             <View style={styles.form}>

//               {renderInput('email', 'Email Address', 'email-address')}

//               {renderInput('password', 'Password', 'default', true)}
//               {renderInput('confirmPassword', 'Confirm Password', 'default', true)}

//               {renderTermsCheckbox()}
//               {errors.terms && (
//                 <Text style={styles.errorText} testID="error_terms">
//                   {errors.terms}
//                 </Text>
//               )}

//               {renderSignupButton()}
//               {renderSocialLogin()}
//               {renderLoginLink()}
//             </View>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,

//   },
//   keyboardAvoid: {
//     flex: 1,
//        top:40
//   },
//   scrollContent: {
//     flexGrow: 1,
//     paddingHorizontal: SPACING.lg,
//   },
//   formContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     paddingVertical: SPACING.xl,

//   },
//   header: {
//     alignItems: 'center',
//     // marginBottom: SPACING.xxl,

//     marginBottom: 30,
//   },

//    title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: textColor.secondColor,
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: SIZES.subtitle,
//     color:COLORS.darkGray,
//     textAlign: 'center',
//     lineHeight: 24,
//   },
//   form: {
//     // flex: 1,
//        width: '100%',
//   },
//   nameRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: SPACING.md,
//   },
//   nameInput: {
//     flex: 1,
//   },
//   inputContainer: {
//     marginBottom: SPACING.md,
//   },

//   inputWrapperFocused: {
//     borderColor: COLORS.inputBorderFocus,
//     backgroundColor: COLORS.white,
//     ...Platform.select({
//       ios: {
//         shadowColor: COLORS.primary,
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//       },
//       android: {
//         elevation: 2,
//       },
//     }),
//   },
//   inputWrapperError: {
//     borderColor: COLORS.error,
//   },

//     input: {
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//     borderRadius: 12,
//     padding: 16,
//     fontSize: 16,
//     backgroundColor: '#F8F8F8',
//     color: '#333',
//   },
//   inputError: {
//     color: COLORS.error,
//   },
//   eyeIcon: {
//     paddingHorizontal: SPACING.md,
//     paddingVertical: SPACING.sm,
//   },
//   eyeIconText: {
//     fontSize: SIZES.icon,
//   },
//   errorText: {
//     fontSize: SIZES.error,
//     color: COLORS.error,
//     marginTop: SPACING.xs,
//     marginLeft: SPACING.xs,
//   },
//   checkboxContainer: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     marginVertical: SPACING.lg,
//   },
//   checkbox: {
//     width: 20,
//     height: 20,
//     borderWidth: 2,
//     borderColor: COLORS.inputBorder,
//     borderRadius: 4,
//     marginRight: SPACING.sm,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 2,
//   },
//   checkboxChecked: {
//     backgroundColor: textColor.bg,
//     borderColor: textColor.bg,
//   },
//   checkmark: {
//     color: COLORS.white,
//     fontSize: 12,
//     fontWeight: 'bold',
//   },
//   checkboxText: {
//     flex: 1,
//     fontSize: SIZES.input,
//     color: COLORS.darkGray,
//     lineHeight: 22,
//   },
//   linkText: {
//     color: textColor.secondColor,
//     fontWeight: '600',
//   },

//   signupButtonDisabled: {
//     backgroundColor: '#D0D0D0',
//     shadowOpacity: 0,
//   },

//     signupButton: {
//     backgroundColor: textColor.bg,
//     borderRadius: 12,
//     paddingVertical: 16,
//     alignItems: 'center',
//     marginBottom: 20,
//     shadowColor: textColor.bg,
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   signupButtonText: {
//     // fontSize: SIZES.button,
//     // fontWeight: '600',
//     // color: COLORS.white,
//      color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   socialContainer: {
//     marginVertical: SPACING.lg,
//   },
//   divider: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: SPACING.lg,
//   },
//   dividerLine: {
//     flex: 1,
//     height: 1,
//     backgroundColor: COLORS.lightGray,
//   },
//   dividerText: {
//     marginHorizontal: SPACING.md,
//     fontSize: SIZES.input,
//     color: COLORS.darkGray,
//   },
//   socialButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: SPACING.md,
//   },
//   socialButton: {
//     flex: 1,
//     height: SIZES.buttonHeight,
//     borderRadius: SIZES.borderRadius,
//     flexDirection:'row',
//     gap:2,
//     borderWidth: 1,
//     borderColor: COLORS.inputBorder,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: COLORS.white,
//   },
//   socialButtonText: {
//     fontSize: SIZES.button,
//     color: COLORS.black,
//     fontWeight: '500',
//   },
//   loginContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: SPACING.xl,
//   },
//   loginText: {
//     fontSize: 14,
//     color: COLORS.darkGray,
//   },
//   loginLink: {
//     fontSize: 14,
//     color:textColor.secondColor,
//     fontWeight: '600',
//   },
// });

// // Default props
// SignupScreen.defaultProps = {
//   onSignupSuccess: (userData) => console.log('Signup successful:', userData),
//   onNavigateToLogin: () => console.log('Navigate to login'),
//   onSocialLogin: (provider) => console.log('Social login:', provider),
//   enableSocialLogin: true,
//   termsUrl: 'https://example.com/terms',
//   privacyUrl: 'https://example.com/privacy',
// };

// export default SignupScreen;

import {useNavigation} from '@react-navigation/native';
import {textColor} from '../../assets/pngs/Colors/color';
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useRef, useCallback, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Platform,
  SafeAreaView,
  Animated,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {Image} from 'react-native';
import {openPrepopulatedDB} from '../../services/db';
import {userDetails} from '../../services/userDeatils';
import {signUpWithEmail} from '../../services/firebase_services/signUpWithEmail';
import {usePersonalStore} from '../../store/userPersonalStore';
import {signInWithGoogle} from '../../components/signIn/googleSignIn';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

// Constants for maintainability
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  white: '#ffffff',
  black: '#000000',
  gray: '#f8f9fa',
  darkGray: '#6c757d',
  lightGray: '#e9ecef',
  error: '#dc3545',
  success: '#28a745',
  warning: '#ffc107',
  transparent: 'transparent',
  shadow: 'rgba(0, 0, 0, 0.1)',
  inputBorder: '#dee2e6',
  inputBorderFocus: '#667eea',
  placeholder: '#adb5bd',
};

const VALIDATION_RULES = {
  name: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  phone: {
    pattern: /^[\+]?[1-9][\d]{3,14}$/,
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
};

const SignupScreen = ({
  onSignupSuccess,
  onNavigateToLogin,
  onSocialLogin,
  enableSocialLogin = true,
  termsUrl = 'https://example.com/terms',
  privacyUrl = 'https://example.com/privacy',
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const resetForm = usePersonalStore(state => state.resetForm);

  const inputRefs = {
    email: useRef(),
    password: useRef(),
    confirmPassword: useRef(),
  };

  const handleInputChange = (field, value) => {
    setFormData({...formData, [field]: value});
    if (errors[field]) {
      const {[field]: _, ...rest} = errors;
      setErrors(rest);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = 'Invalid email';
    if (formData.password.length < 8) newErrors.password = 'Password too short';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    if (!agreeToTerms) newErrors.terms = 'Agree to terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // UI state
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigation = useNavigation();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Validation functions
  const validateField = useCallback(
    (field, value) => {
      switch (field) {
        case 'email':
          if (!value.trim()) return 'Email is required';
          if (!VALIDATION_RULES.email.pattern.test(value))
            return 'Please enter a valid email address';
          return null;

        case 'password':
          if (!value) return 'Password is required';
          if (value.length < VALIDATION_RULES.password.minLength)
            return `Password must be at least ${VALIDATION_RULES.password.minLength} characters`;
          if (!VALIDATION_RULES.password.pattern.test(value))
            return 'Password must contain uppercase, lowercase, number, and special character';
          return null;

        case 'confirmPassword':
          if (!value) return 'Please confirm your password';
          if (value !== formData.password) return 'Passwords do not match';
          return null;

        default:
          return null;
      }
    },
    [formData.password],
  );

  const {addUserDetail} = userDetails();

  const handleInputBlur = useCallback(
    field => {
      setFocusedField(null);
      const error = validateField(field, formData[field]);
      if (error) {
        setErrors(prev => ({...prev, [field]: error}));
      }
    },
    [formData, validateField],
  );

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const {email, password} = formData;

      const result = await signUpWithEmail(email, password);
      console.log('Signup successful:', result.user);

      // Optional: Store token
      await AsyncStorage.setItem('accessToken', result.token);
      await AsyncStorage.setItem('userId', result.user.uid);
      await AsyncStorage.setItem('userEmail', email);
      resetForm();

      Alert.alert('Signup Successful', 'Welcome!');
      navigation.navigate('PersonalDetailsForm');
    } catch (error) {
      Alert.alert('Signup Failed', error.message);
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = useCallback(
    provider => {
      if (onSocialLogin) {
        onSocialLogin(provider);
      }
    },
    [onSocialLogin],
  );

  // Render components
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>
        Join Kontaxto and start managing your contacts smarter
      </Text>
    </View>
  );

  const renderInput = (
    field,
    placeholder,
    keyboardType = 'default',
    secureTextEntry = false,
  ) => {
    const isPasswordField = field === 'password' || field === 'confirmPassword';
    const showPasswordIcon =
      isPasswordField &&
      (field === 'password' ? showPassword : showConfirmPassword);

    return (
      <View style={styles.inputContainer} key={field}>
        <View
          style={[
            styles.inputWrapper,
            focusedField === field,
            errors[field] && styles.inputWrapperError,
          ]}>
          <TextInput
            ref={inputRefs[field]}
            style={[styles.input, errors[field] && styles.inputError]}
            placeholder={placeholder}
            placeholderTextColor={COLORS.placeholder}
            value={formData[field]}
            onChangeText={value => handleInputChange(field, value)}
            onFocus={() => setFocusedField(field)}
            onBlur={() => handleInputBlur(field)}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry && !showPasswordIcon}
            autoCapitalize={field === 'email' ? 'none' : 'words'}
            autoComplete={
              field === 'email'
                ? 'email'
                : field === 'password' || field === 'confirmPassword'
                ? 'password'
                : 'off'
            }
            testID={`input_${field}`}
            returnKeyType={field === 'confirmPassword' ? 'done' : 'next'}
            onSubmitEditing={() => {
              const fieldOrder = ['email', 'password', 'confirmPassword'];
              const currentIndex = fieldOrder.indexOf(field);
              const nextField = fieldOrder[currentIndex + 1];

              if (nextField && inputRefs[nextField]?.current) {
                inputRefs[nextField].current.focus();
              }
            }}
          />
          {isPasswordField && (
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => {
                if (field === 'password') {
                  setShowPassword(!showPassword);
                } else {
                  setShowConfirmPassword(!showConfirmPassword);
                }
              }}
              testID={`toggle_${field}_visibility`}></TouchableOpacity>
          )}
        </View>
        {errors[field] && (
          <Text style={styles.errorText} testID={`error_${field}`}>
            {errors[field]}
          </Text>
        )}
      </View>
    );
  };

  const renderTermsCheckbox = () => (
    <View style={styles.checkboxMainContainer}>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => setAgreeToTerms(!agreeToTerms)}
        testID="terms_checkbox">
        <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
          {agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
      <Text style={styles.checkboxText}>
        I agree to the <Text style={styles.linkText}>Terms of Service</Text> and{' '}
        <Text style={styles.linkText}>Privacy Policy</Text>
      </Text>
    </View>
  );

  const renderSignupButton = () => (
    <TouchableOpacity
      style={[
        styles.signupButton,
        (!agreeToTerms || isLoading) && styles.signupButtonDisabled,
      ]}
      onPress={handleSubmit}
      disabled={!agreeToTerms || isLoading}
      testID="signup_button">
      {isLoading ? (
        <ActivityIndicator color={COLORS.white} size="small" />
      ) : (
        <Text style={styles.signupButtonText}>Create Account</Text>
      )}
    </TouchableOpacity>
  );

  const renderSocialLogin = () => {
    if (!enableSocialLogin) return null;

    return (
      <View style={styles.socialContainer}>
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialButtons}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => signInWithGoogle()}
            testID="google_signup">
            <Image
              source={require('../../assets/pngs/google.png')}
              style={styles.socialIcon}
            />
            <Text style={styles.socialButtonText}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleSocialSignup('facebook')}
            testID="facebook_signup">
            <Image
              source={require('../../assets/pngs/facebook.png')}
              style={styles.socialIcon}
            />
            <Text style={styles.socialButtonText}>Facebook</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderLoginLink = () => (
    <View style={styles.loginContainer}>
      <Text style={styles.loginText}>Already have an account? </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('Login')}
        testID="login_link">
        <Text style={styles.loginLink}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={textColor.bg} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.formContainer}>
            {renderHeader()}

            <View style={styles.form}>
              {renderInput('email', 'Email Address', 'email-address')}
              {renderInput('password', 'Password', 'default', true)}
              {renderInput(
                'confirmPassword',
                'Confirm Password',
                'default',
                true,
              )}

              {renderTermsCheckbox()}
              {errors.terms && (
                <Text style={styles.errorText} testID="error_terms">
                  {errors.terms}
                </Text>
              )}

              {renderSignupButton()}
              {renderSocialLogin()}
              {renderLoginLink()}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: screenWidth * 0.05, // 5% of screen width
    paddingVertical: screenHeight * 0.02, // 2% of screen height
    minHeight: screenHeight * 0.95, // Minimum height to ensure content fits
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 400, // Maximum width for larger screens
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: screenHeight * 0.04, // 4% of screen height
  },
  title: {
    fontSize: Math.min(screenWidth * 0.07, 28), // Responsive font size with max limit
    fontWeight: 'bold',
    color: textColor.secondColor,
    marginBottom: screenHeight * 0.01,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Math.min(screenWidth * 0.04, 16), // Responsive font size with max limit
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: screenWidth * 0.02,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: screenHeight * 0.02, // 2% of screen height
  },
  inputWrapper: {
    position: 'relative',
    borderRadius: 12,
  },
  inputWrapperFocused: {
    borderColor: COLORS.inputBorderFocus,
    backgroundColor: COLORS.white,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputWrapperError: {
    borderColor: COLORS.error,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: screenWidth * 0.04,
    paddingVertical: screenHeight * 0.018,
    fontSize: Math.min(screenWidth * 0.04, 16),
    backgroundColor: '#F8F8F8',
    color: '#333',
    minHeight: screenHeight * 0.06, // Minimum touch target height
    paddingRight: screenWidth * 0.12, // Space for eye icon
  },
  inputError: {
    borderColor: COLORS.error,
  },
  eyeIcon: {
    position: 'absolute',
    right: screenWidth * 0.04,
    top: '50%',
    transform: [{translateY: -12}],
    paddingVertical: screenHeight * 0.01,
    paddingHorizontal: screenWidth * 0.02,
  },
  eyeIconText: {
    fontSize: Math.min(screenWidth * 0.045, 18),
  },
  errorText: {
    fontSize: Math.min(screenWidth * 0.035, 14),
    color: COLORS.error,
    marginTop: screenHeight * 0.005,
    marginLeft: screenWidth * 0.02,
  },
  checkboxMainContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: screenHeight * 0.02,
    paddingHorizontal: screenWidth * 0.01,
  },
  checkboxContainer: {
    marginRight: screenWidth * 0.03,
    marginTop: screenHeight * 0.003,
  },
  checkbox: {
    width: screenWidth * 0.05,
    height: screenWidth * 0.05,
    maxWidth: 20,
    maxHeight: 20,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: textColor.bg,
    borderColor: textColor.bg,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: Math.min(screenWidth * 0.03, 12),
    fontWeight: 'bold',
  },
  checkboxText: {
    flex: 1,
    fontSize: Math.min(screenWidth * 0.04, 16),
    color: COLORS.darkGray,
    lineHeight: 22,
  },
  linkText: {
    color: textColor.secondColor,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: textColor.bg,
    borderRadius: 12,
    paddingVertical: screenHeight * 0.02,
    alignItems: 'center',
    marginBottom: screenHeight * 0.025,
    shadowColor: textColor.bg,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    minHeight: screenHeight * 0.06, // Minimum touch target height
  },
  signupButtonDisabled: {
    backgroundColor: '#D0D0D0',
    shadowOpacity: 0,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: Math.min(screenWidth * 0.045, 18),
    fontWeight: 'bold',
  },
  socialContainer: {
    marginVertical: screenHeight * 0.02,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: screenHeight * 0.025,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  dividerText: {
    marginHorizontal: screenWidth * 0.04,
    fontSize: Math.min(screenWidth * 0.04, 16),
    color: COLORS.darkGray,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: screenWidth * 0.03,
  },
  socialButton: {
    flex: 1,
    minHeight: screenHeight * 0.06,
    borderRadius: 12,
    flexDirection: 'row',
    gap: screenWidth * 0.02,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: screenHeight * 0.015,
  },
  socialIcon: {
    height: screenWidth * 0.06,
    width: screenWidth * 0.06,
    maxHeight: 24,
    maxWidth: 24,
  },
  socialButtonText: {
    fontSize: Math.min(screenWidth * 0.04, 16),
    color: COLORS.black,
    fontWeight: '500',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: screenHeight * 0.03,
    paddingVertical: screenHeight * 0.01,
  },
  loginText: {
    fontSize: Math.min(screenWidth * 0.035, 14),
    color: COLORS.darkGray,
  },
  loginLink: {
    fontSize: Math.min(screenWidth * 0.035, 14),
    color: textColor.secondColor,
    fontWeight: '600',
  },
});

// Default props
SignupScreen.defaultProps = {
  onSignupSuccess: userData => console.log('Signup successful:', userData),
  onNavigateToLogin: () => console.log('Navigate to login'),
  onSocialLogin: provider => console.log('Social login:', provider),
  enableSocialLogin: true,
  termsUrl: 'https://example.com/terms',
  privacyUrl: 'https://example.com/privacy',
};

export default SignupScreen;
