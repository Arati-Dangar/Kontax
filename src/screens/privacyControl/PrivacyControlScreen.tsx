import {useNavigation} from '@react-navigation/native';
import {textColor} from '../../assets/pngs/Colors/color';
import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import {userDetails} from '../../services/userDeatils';
import {usePrivacySettingsStore} from '../../store/privacySetting';
import Header from '../../components/Header';

const SETTINGS_CONFIG = [
  {
    section: 'Profile Privacy',
    items: [
      {
        key: 'profileVisibility',
        title: 'Profile Visibility',
        subtitle: 'Allow others to see your profile',
      },
      {key: 'showName', title: 'Name', subtitle: 'Let others know Your name'},
      {
        key: 'shareRole',
        title: 'Role & Organization',
        subtitle: 'Allow access to see your Role',
      },
      {
        key: 'shareLinkedln',
        title: 'Linkedln Profile',
        subtitle: 'Allow access to see your Linkedln',
      },
      {key: 'shareBio', title: 'Bio', subtitle: 'Allow access to your Bio'},
      {
        key: 'shareContacts',
        title: 'Phone Number',
        subtitle: 'Allow access to your number',
      },
    ],
  },
  // Add more sections later as needed
];
const defaultSettings = SETTINGS_CONFIG.reduce((acc, section) => {
  section.items.forEach(item => (acc[item.key] = false)); // or your own default
  return acc;
}, {});

const PrivacySettingsScreen = () => {
  // Privacy settings state
  // const { updatePrivacySettings } = userDetails();

  const {settings, toggleSetting} = usePrivacySettingsStore();
  const navigation = useNavigation();
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

  const handleCompleteSetup = async () => {
    const updatedSettings = {...settings};

    console.log('setting updated', updatedSettings);
    navigation.navigate('Home');
  };
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Account Deleted',
              'Your account has been scheduled for deletion.',
            );
          },
        },
      ],
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Data Export',
      'Your data export request has been submitted. You will receive an email with your data within 24 hours.',
    );
  };

  const SettingItem = ({title, subtitle, value, onToggle, type = 'switch'}) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{false: '#E0E0E0', true: 'textColor.bg'}}
          thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
        />
      ) : (
        <TouchableOpacity style={styles.arrowButton} onPress={onToggle}>
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const SectionHeader = ({title}) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const ActionButton = ({title, onPress, destructive = false}) => (
    <TouchableOpacity
      style={[styles.actionButton, destructive && styles.destructiveButton]}
      onPress={onPress}>
      <Text
        style={[
          styles.actionButtonText,
          destructive && styles.destructiveText,
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={()=>navigation.goBack()}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Settings</Text>
          <View style={styles.headerSpacer} />
        </View> */}
      <Header
        fadeAnim={fadeAnim}
        slideAnim={slideAnim}
        title="Privacy Settings"
        containerStyle={{paddingTop: 10, paddingBottom: 20}}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {SETTINGS_CONFIG.map(section => (
          <View key={section.section}>
            <SectionHeader title={section.section} />
            <View style={styles.section}>
              {section.items.map(item => (
                <SettingItem
                  key={item.key}
                  title={item.title}
                  subtitle={item.subtitle}
                  value={settings[item.key]}
                  onToggle={() => toggleSetting(item.key)}
                />
              ))}
            </View>
          </View>
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <TouchableOpacity
        onPress={handleCompleteSetup}
        style={[styles.navButton, styles.getStartedButton]}
        testID="get_started_button"
        activeOpacity={0.7}>
        <Text style={[styles.navButtonText]}>Complete Setup</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: textColor.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  navButton: {
    paddingVertical: 15,
    bottom: 40,
    marginHorizontal: 40,
    borderRadius: 18,
    backgroundColor: textColor.bg,
    minWidth: 80,
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: 'white',
  },
  getStartedButton: {
    backgroundColor: textColor.bg,
    paddingHorizontal: 20,
  },

  navButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 24,

    alignSelf: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    color: textColor.bg,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F5F5F5',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: textColor.secondColor,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  arrowButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 20,
    color: textColor.bg,
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: textColor.bg,
  },
  destructiveButton: {
    backgroundColor: '#FFFFFF',
  },
  destructiveText: {
    color: '#FF3B30',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default PrivacySettingsScreen;
