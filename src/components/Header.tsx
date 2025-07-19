import {textColor} from '../assets/pngs/Colors/color';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type AnimatedHeaderProps = {
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  title?: string;
  subtitle?: string;
  onBackPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  renderFooter?: React.ReactNode;
};

const Header: React.FC<AnimatedHeaderProps> = ({
  fadeAnim,
  slideAnim,
  title,
  subtitle,
  onBackPress,
  renderFooter,
  containerStyle,
}) => {
  return (
    <View style={[styles.header, containerStyle]}>
      <Animated.View
        style={[
          styles.headerContent,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        {onBackPress && (
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Ionicons name="arrow-back" size={22} color="#420063" />
            <Text style={styles.backButtonText}> Back</Text>
          </TouchableOpacity>
        )}
        {title && <Text style={styles.headerTitle}>{title}</Text>}
        {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      </Animated.View>
      {renderFooter && (
        <View style={styles.footerContainer}>{renderFooter}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    // paddingTop: 40,
    paddingHorizontal: 20,
    backgroundColor: textColor.bg,
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  backButton: {
    paddingVertical: 10,
    flexDirection: 'row',
    gap: 2,
  },
  backButtonText: {
    fontSize: 16,
    color: '#420063',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: textColor.secondColor,
    marginTop: 4,
    marginBottom: 30,
  },
  footerContainer: {
    // marginTop: 10,
    marginBottom: 20,
  },
});

export default Header;
