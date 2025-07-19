import {textColor} from '../../assets/pngs/Colors/color';
import {useNavigation} from '@react-navigation/native';
import React, {useState, useRef, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Animated,
  StatusBar,
  Platform,
  SafeAreaView,
} from 'react-native';

const {width, height} = Dimensions.get('window');

// Responsive helper functions
const getResponsiveSize = size => {
  const scale = width / 375; // Base width (iPhone 8/X)
  const newSize = size * scale;
  return Math.max(newSize, size * 0.8); // Minimum 80% of original size
};

const getResponsiveFontSize = size => {
  const scale = width / 375;
  const newSize = size * scale;
  return Math.max(newSize, size * 0.85); // Minimum 85% for better readability
};

const isSmallScreen = width < 350;
const isMediumScreen = width >= 350 && width < 400;
const isLargeScreen = width >= 400;

// Constants for better maintainability - now responsive
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  white: '#ffffff',
  whiteTransparent: 'rgba(255,255,255,0.3)',
  whiteTransparent2: 'rgba(255,255,255,0.2)',
  whiteTransparent8: 'rgba(255,255,255,0.8)',
  whiteTransparent9: 'rgba(255,255,255,0.9)',
};

const SIZES = {
  iconContainer: getResponsiveSize(
    isSmallScreen ? 100 : isMediumScreen ? 110 : 120,
  ),
  iconSize: getResponsiveSize(isSmallScreen ? 45 : isMediumScreen ? 55 : 60),
  dotSize: getResponsiveSize(8),
  activeDotWidth: getResponsiveSize(20),
  borderRadius: getResponsiveSize(60),
  buttonBorderRadius: getResponsiveSize(25),
};

const SPACING = {
  xs: getResponsiveSize(4),
  sm: getResponsiveSize(10),
  md: getResponsiveSize(20),
  lg: getResponsiveSize(30),
  xl: getResponsiveSize(40),
  xxl: getResponsiveSize(50),
  xxxl: getResponsiveSize(80),
};

const TYPOGRAPHY = {
  title: getResponsiveFontSize(isSmallScreen ? 26 : isMediumScreen ? 30 : 32),
  subtitle: getResponsiveFontSize(
    isSmallScreen ? 16 : isMediumScreen ? 17 : 18,
  ),
  description: getResponsiveFontSize(
    isSmallScreen ? 14 : isMediumScreen ? 15 : 16,
  ),
  button: getResponsiveFontSize(isSmallScreen ? 14 : isMediumScreen ? 15 : 16),
  skip: getResponsiveFontSize(isSmallScreen ? 14 : isMediumScreen ? 15 : 16),
};

// Onboarding data - easily maintainable
const ONBOARDING_DATA = [
  {
    id: 1,
    title: 'Welcome to Kontaxto',
    subtitle: 'Your Smart Contact Manager',
    description:
      'Organize, manage, and connect with your contacts like never before. Experience the future of contact management.',
    icon: '📱',
    color: textColor.bg,
    testID: 'onboarding_welcome',
  },

  {
    id: 2,
    title: 'Seamless Sync',
    subtitle: 'All Your Contacts, Everywhere',
    description:
      'Sync across all your devices and platforms. Your contacts are always up-to-date and accessible.',
    icon: '🔄',
    color: '#667eea',
    testID: 'onboarding_sync',
  },
  {
    id: 3,
    title: 'Get Started',
    subtitle: 'Ready to Transform?',
    description:
      'Join thousands of users who have revolutionized their contact management. Start your journey today!',
    icon: '🚀',
    color: textColor.bg,
    testID: 'onboarding_get_started',
  },
];

const OnboardingScreen = ({onComplete, onSkip}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation();

  // Memoized calculations for performance
  const isLastSlide = useMemo(
    () => currentIndex === ONBOARDING_DATA.length - 1,
    [currentIndex],
  );
  const isFirstSlide = useMemo(() => currentIndex === 0, [currentIndex]);
  const currentSlide = useMemo(
    () => ONBOARDING_DATA[currentIndex],
    [currentIndex],
  );

  // Navigation handlers with useCallback for performance
  const handleNext = useCallback(() => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    }
  }, [currentIndex]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      scrollViewRef.current?.scrollTo({
        x: prevIndex * width,
        animated: true,
      });
    }
  }, [currentIndex]);

  const handleSkip = useCallback(() => {
    if (onSkip) {
      onSkip();
    } else {
      const lastIndex = ONBOARDING_DATA.length - 1;
      setCurrentIndex(lastIndex);
      scrollViewRef.current?.scrollTo({
        x: lastIndex * width,
        animated: true,
      });
    }
  }, [onSkip]);

  const handleGetStarted = () => {
    navigation.navigate('SignUp');
  };

  const handleScroll = useCallback(
    event => {
      const scrollPosition = event.nativeEvent.contentOffset.x;
      const index = Math.round(scrollPosition / width);
      if (index !== currentIndex) {
        setCurrentIndex(index);
      }
    },
    [currentIndex],
  );

  // Render components
  const renderDots = useCallback(() => {
    return (
      <View style={styles.dotsContainer} testID="onboarding_dots">
        {ONBOARDING_DATA.map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === currentIndex
                    ? COLORS.white
                    : COLORS.whiteTransparent,
                width:
                  index === currentIndex ? SIZES.activeDotWidth : SIZES.dotSize,
              },
            ]}
            testID={`dot_${index}`}
          />
        ))}
      </View>
    );
  }, [currentIndex]);

  const renderSlide = useCallback((item, index) => {
    return (
      <View
        key={item.id}
        style={[styles.slide, {backgroundColor: item.color}]}
        testID={item.testID}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon} testID={`icon_${index}`}>
              {item.icon}
            </Text>
          </View>

          <Text style={styles.title} testID={`title_${index}`}>
            {item.title}
          </Text>
          <Text style={styles.subtitle} testID={`subtitle_${index}`}>
            {item.subtitle}
          </Text>
          <Text style={styles.description} testID={`description_${index}`}>
            {item.description}
          </Text>
        </View>
      </View>
    );
  }, []);

  const renderNavigationButtons = useCallback(() => {
    return (
      <View style={styles.navigationButtons}>
        {!isFirstSlide && !isLastSlide ? (
          <TouchableOpacity
            onPress={handlePrevious}
            style={styles.navButton}
            testID="back_button"
            activeOpacity={0.7}>
            <Text style={styles.navButtonText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}

        <View style={styles.spacer} />

        {!isLastSlide ? (
          <TouchableOpacity
            onPress={handleNext}
            style={[styles.navButton, styles.nextButton]}
            testID="next_button"
            activeOpacity={0.7}>
            <Text style={[styles.navButtonText, styles.nextButtonText]}>
              Next
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.lastSlideButtons}>
            <TouchableOpacity
              onPress={handleGetStarted}
              style={[styles.navButton, styles.getStartedButton]}
              testID="get_started_button"
              activeOpacity={0.7}>
              <Text style={[styles.navButtonText, styles.getStartedText]}>
                Get Started
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={[styles.navButton, styles.loginButton]}
              testID="login_button"
              activeOpacity={0.7}>
              <Text style={[styles.navButtonText, styles.lastButtonText]}>
                Already have an account?
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }, [isFirstSlide, isLastSlide, handlePrevious, handleNext, handleGetStarted]);

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: currentSlide.color}]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={currentSlide.color}
        translucent={false}
      />

      {/* Main Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        testID="onboarding_scroll_view"
        bounces={false}
        decelerationRate="fast">
        {ONBOARDING_DATA.map((item, index) => renderSlide(item, index))}
      </ScrollView>

      {/* Header with Skip button */}
      {!isLastSlide && (
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipButton}
            testID="skip_button"
            activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        {renderDots()}
        {renderNavigationButtons()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  content: {
    alignItems: 'center',
    // justifyContent: 'center',
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? SPACING.xxxl : SPACING.xxl,
    paddingHorizontal: SPACING.md,
  },
  iconContainer: {
    width: SIZES.iconContainer,
    height: SIZES.iconContainer,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.whiteTransparent2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  icon: {
    fontSize: SIZES.iconSize,
  },
  title: {
    fontSize: TYPOGRAPHY.title,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    lineHeight: TYPOGRAPHY.title * 1.2,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.subtitle,
    color: COLORS.whiteTransparent9,
    textAlign: 'center',
    marginBottom: SPACING.md,
    fontWeight: '600',
    paddingHorizontal: SPACING.md,
    lineHeight: TYPOGRAPHY.subtitle * 1.3,
  },
  description: {
    fontSize: TYPOGRAPHY.description,
    color: COLORS.whiteTransparent8,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.description * 1.5,
    paddingHorizontal: SPACING.md,
    maxWidth: width * 0.85,
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    right: SPACING.md,
    zIndex: 1,
  },
  skipButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: SPACING.md,
  },
  skipText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.skip,
    fontWeight: '600',
  },
  bottomContainer: {
    position: 'absolute',
    bottom:
      Platform.OS === 'ios'
        ? height < 700
          ? SPACING.lg
          : SPACING.xl
        : height < 700
        ? SPACING.md
        : SPACING.lg,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.xl,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  dot: {
    height: SIZES.dotSize,
    borderRadius: SIZES.dotSize / 2,
    marginHorizontal: SPACING.xs,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    minHeight: getResponsiveSize(50),
  },
  navButton: {
    paddingVertical: getResponsiveSize(15),
    paddingHorizontal: SPACING.lg,
    borderRadius: SIZES.buttonBorderRadius,
    backgroundColor: COLORS.whiteTransparent2,
    minWidth: getResponsiveSize(80),
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  nextButton: {
    backgroundColor: COLORS.white,
  },
  getStartedButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  loginButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  lastSlideButtons: {
    alignItems: 'center',
    gap: SPACING.sm,
    marginRight: isSmallScreen ? SPACING.md : SPACING.xl,
  },
  navButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.button,
    fontWeight: '600',
    textAlign: 'center',
  },
  nextButtonText: {
    color: COLORS.primary,
  },
  getStartedText: {
    color: COLORS.primary,
  },
  lastButtonText: {
    color: 'white',
    fontSize: isSmallScreen ? TYPOGRAPHY.button * 0.9 : TYPOGRAPHY.button,
  },
  spacer: {
    flex: 1,
  },
});

// Default props for better maintainability
OnboardingScreen.defaultProps = {
  onComplete: () => console.log('Onboarding completed'),
  onSkip: () => console.log('Onboarding skipped'),
};

export default OnboardingScreen;
