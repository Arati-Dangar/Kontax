import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {getApp} from '@react-native-firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from '@react-native-firebase/auth';

GoogleSignin.configure({
  webClientId:
    '983347847554-hdg578i68ebvjqiutgrihohiq4jeu731.apps.googleusercontent.com',
  offlineAccess: true,
  forceCodeForRefreshToken: true, // Add this for better token handling
});

export async function signInWithGoogle() {
  try {
    // Check if device supports Google Play Services
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

    // Sign out any existing user first to ensure clean state
    await GoogleSignin.signOut();

    // Perform the sign in
    const userInfo = await GoogleSignin.signIn();

    // Get the ID token
    const {idToken} = userInfo;

    if (!idToken) {
      throw new Error('No ID token received from Google Sign-In');
    }

    // Create Firebase credential
    const credential = GoogleAuthProvider.credential(idToken);

    // Get Firebase auth instance
    const app = getApp();
    const auth = getAuth(app);

    // Sign in with Firebase
    const result = await signInWithCredential(auth, credential);

    return result;
  } catch (error) {
    console.log('Google Sign-In Error:', error);
    throw error;
  }
}
