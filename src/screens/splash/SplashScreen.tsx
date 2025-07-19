import {textColor} from '../../assets/pngs/Colors/color';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';

const {width, height} = Dimensions.get('window');

const logo = (
  <Image
    source={require('../../assets/pngs/logo.png')} // Adjust path as needed
    style={{width: 300, height: 300, resizeMode: 'contain'}}
  />
);
const COLORS = {
  primary: '#667ee',
  secondary: 'rgba(204, 192, 216, 0.3)',
  white: '#ffffff',
  bg: textColor.bg,
  whiteTransparent: 'rgba(255, 255, 255, 0.8)',
  whiteTransparent6: 'rgba(255, 255, 255, 0.6)',
  dark: '#2c3e50',
  accent: '#f39c12',
};

const TIMING = {
  logoFadeIn: 1000,
  logoScale: 800,
  titleFadeIn: 600,
  subtitleFadeIn: 400,
  loadingDelay: 1500,
  minimumSplashTime: 2500,
  fadeOut: 500,
};

const SIZES = {
  logo: 120,
  title: 42,
  subtitle: 18,
  version: 14,
  loadingIndicator: 'small',
};

const SplashScreen = ({
  onAnimationComplete,
  minimumShowTime = TIMING.minimumSplashTime,
  showVersionInfo = true,
  customLogo = logo,
  appVersion = '1.0.0',
}) => {
  // Animation values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(20)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading...');
  const startTime = useRef(Date.now());
  const navigation = useNavigation();
  // Loading messages for better UX
  const loadingMessages = [
    'Initializing...',
    'Loading contacts...',
    'Setting up sync...',
    'Almost ready...',
  ];

  // Start splash animations
  useEffect(() => {
    startSplashAnimation();
  }, []);

  // Handle loading state changes
  useEffect(() => {
    if (isLoading) {
      startLoadingTextAnimation();
    }
  }, [isLoading]);

  const startSplashAnimation = () => {
    // Logo animation
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: TIMING.logoFadeIn,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Start loading phase
    setTimeout(() => {
      setIsLoading(true);
      startLoadingAnimation();
    }, TIMING.loadingDelay);

    // Start pulse animation for logo
    startPulseAnimation();
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const startLoadingAnimation = () => {
    Animated.timing(loadingOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const startLoadingTextAnimation = () => {
    let messageIndex = 0;
    const interval = setInterval(() => {
      if (messageIndex < loadingMessages.length) {
        setLoadingText(loadingMessages[messageIndex]);
        messageIndex++;
      } else {
        clearInterval(interval);
        // Ensure minimum splash time, then complete
        const elapsedTime = Date.now() - startTime.current;
        const remainingTime = Math.max(0, minimumShowTime - elapsedTime);

        setTimeout(() => {
          completeSplash();
        }, remainingTime);
      }
    }, 600);
  };

  const completeSplash = () => {
    // Fade out animation
    Animated.timing(containerOpacity, {
      toValue: 0,
      duration: TIMING.fadeOut,
      useNativeDriver: true,
    }).start(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    });

    navigation.navigate('Onboarding');
  };

  const renderLogo = () => {
    if (customLogo) {
      return customLogo;
    }

    return (
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{scale: Animated.multiply(logoScale, pulseAnim)}],
          },
        ]}
        testID="splash_logo">
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>K</Text>
        </View>
      </Animated.View>
    );
  };

  const renderLoading = () => (
    <Animated.View
      style={[styles.loadingContainer, {opacity: loadingOpacity}]}
      testID="splash_loading">
      <ActivityIndicator
        size={SIZES.loadingIndicator}
        color={COLORS.bg}
        style={styles.loadingIndicator}
      />
      <Text style={styles.loadingText}>{loadingText}</Text>
    </Animated.View>
  );

  const renderVersionInfo = () => {
    if (!showVersionInfo) return null;

    return (
      <Animated.View
        style={[styles.versionContainer, {opacity: subtitleOpacity}]}
        testID="splash_version">
        <Text style={styles.versionText}>Version {appVersion}</Text>
      </Animated.View>
    );
  };

  const renderBackground = () => (
    <View style={styles.backgroundGradient}>
      <View style={styles.backgroundOverlay} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.bg}
        translucent={false}
      />

      <Animated.View
        style={[styles.content, {opacity: containerOpacity}]}
        testID="splash_container">
        {renderBackground()}

        <View style={styles.mainContent}>{renderLogo()}</View>

        {isLoading && renderLoading()}
        {renderVersionInfo()}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',

    alignItems: 'center',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(204, 192, 216, 0.3)',
  },
  mainContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoCircle: {
    width: SIZES.logo,
    height: SIZES.logo,
    borderRadius: SIZES.logo / 2,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'sans-serif',
      },
    }),
  },

  loadingContainer: {
    position: 'absolute',
    bottom: 120,
    alignItems: 'center',
  },
  loadingIndicator: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.bg,
    textAlign: 'center',
    fontWeight: '500',
  },
  versionContainer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  versionText: {
    fontSize: SIZES.version,
    color: COLORS.bg,
    textAlign: 'center',
    fontWeight: '400',
  },
});

// Default props
SplashScreen.defaultProps = {
  onAnimationComplete: () => console.log('Splash animation completed'),
  minimumShowTime: TIMING.minimumSplashTime,
  showVersionInfo: true,
  appVersion: '1.0.0',
};

export default SplashScreen;
