import {useNavigation} from '@react-navigation/native';
import {textColor} from '../../assets/pngs/Colors/color';
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import {openPrepopulatedDB} from '../../services/db';
import {usePersonalStore} from '../../store/userPersonalStore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  equalTo,
  get,
  getDatabase,
  orderByChild,
  query,
  ref,
} from '@react-native-firebase/database';
import {getApp} from '@react-native-firebase/app';
import {app, database} from '../../../firebaseConfig';
import {Scroll} from 'lucide-react';
import {isOnline} from '../../utils/network';
import {signInWithGoogle} from '../../components/signIn/googleSignIn';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();
  const {formData, setFormData} = usePersonalStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      let matchedUser = null;

      if (await isOnline()) {
        // ✅ Online - use Firebase Realtime DB
        const db = getDatabase(app);
        const usersRef = ref(db, 'users');
        const userQuery = query(
          usersRef,
          orderByChild('email'),
          equalTo(email.trim()),
        );
        const snapshot = await get(userQuery);

        if (!snapshot.exists()) {
          Alert.alert('Login Failed', 'User not found');
          return;
        }

        snapshot.forEach(childSnap => {
          const user = childSnap.val();
          if (user.password === password) {
            matchedUser = {
              id: childSnap.key,
              ...user,
            };
          }
        });
      } else {
        // ✅ Offline - use SQLite fallback
        console.log('Offline mode - using SQLite fallback');
        const db = await openPrepopulatedDB();
        const [results] = await db.executeSql(
          'SELECT * FROM users WHERE email = ?',
          [email.trim()],
        );

        console.log('SQLite results:', results);
        const rows = results.rows;
        for (let i = 0; i < rows.length; i++) {
          const user = rows.item(i);
          if (user.password === password) {
            matchedUser = user;
            break;
          }
        }
      }

      if (!matchedUser) {
        Alert.alert('Login Failed', 'Invalid credentials');
        return;
      }

      // ✅ Save session
      setFormData(matchedUser);
      console.log('Login successful. Token:', matchedUser.token);

      // await AsyncStorage.setItem('userId', matchedUser.id || '');
      // await AsyncStorage.setItem('token', matchedUser.token || '');
      await AsyncStorage.setItem('userId', String(matchedUser.id || ''));
      await AsyncStorage.setItem('token', String(matchedUser.token || ''));

      navigation.navigate('Home');
    } catch (error) {
      console.log('Login error:', error);
      Alert.alert('Login Error', 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSocialLogin = () => {
    return (
      <View style={styles.socialContainer}>
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
            onPress={() => {}}
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
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={textColor.bg} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.loginContainer}>
            {/* Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to your account</Text>
            </View>

            {/* Login Form */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#B0B0B0"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#B0B0B0"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isLoading && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={isLoading}>
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              {renderSocialLogin()}

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: screenWidth * 0.05, // 5% of screen width
    paddingVertical: screenHeight * 0.03, // 3% of screen height
    minHeight: screenHeight * 0.9, // Minimum height to ensure content fits
  },
  loginContainer: {
    width: '100%',
    maxWidth: 400, // Maximum width for larger screens
    alignSelf: 'center',
  },
  headerContainer: {
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
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    width: '100%',
  },
  socialContainer: {
    marginVertical: screenHeight * 0.02,
    paddingHorizontal: screenWidth * 0.05, // 5% of screen width
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
    borderColor: textColor.secondColor,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
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
    color: 'black',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: screenHeight * 0.025, // 2.5% of screen height
  },
  inputLabel: {
    fontSize: Math.min(screenWidth * 0.04, 16),
    fontWeight: '600',
    color: textColor.secondColor,
    marginBottom: screenHeight * 0.01,
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
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: screenHeight * 0.03,
    paddingVertical: screenHeight * 0.01, // Increase touch area
  },
  forgotPasswordText: {
    color: textColor.secondColor,
    fontSize: Math.min(screenWidth * 0.035, 14),
    fontWeight: '500',
  },
  loginButton: {
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
  loginButtonDisabled: {
    backgroundColor: '#D0D0D0',
    shadowOpacity: 0,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: Math.min(screenWidth * 0.045, 18),
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: screenHeight * 0.025,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: screenWidth * 0.04,
    fontSize: Math.min(screenWidth * 0.04, 16),
    color: '#666',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: screenHeight * 0.025,
    paddingVertical: screenHeight * 0.01,
  },
  signupText: {
    color: '#666',
    fontSize: Math.min(screenWidth * 0.035, 14),
  },
  signupLink: {
    color: textColor.secondColor,
    fontSize: Math.min(screenWidth * 0.035, 14),
    fontWeight: '600',
  },
});

export default LoginScreen;
