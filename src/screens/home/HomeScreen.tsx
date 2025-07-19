import React, {useRef, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  StatusBar,
  Dimensions,
  SafeAreaView,
  ImageBackground,
  Image,
} from 'react-native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import Icon from 'react-native-vector-icons/MaterialIcons';

import IconT from 'react-native-vector-icons/FontAwesome';
import {useNavigation} from '@react-navigation/native';

import {usePersonalStore} from '../../store/userPersonalStore';
import CreateQrCode from '../../components/CreateQrCode';
import {textColor} from '../../assets/pngs/Colors/color';
import {
  fetchConnectionsCount,
  fetchSharedCardsCount,
  fetchUserEventsCount,
} from '../../services/firebase_services/fetchUserState';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEventStore} from '../../store/useEventStore';
import {getRecentVcards} from '../../services/firebase_services/getRecentVcards';
import {getIntentStyle} from '../../constants/intentData';

const {width, height} = Dimensions.get('window');

dayjs.extend(relativeTime);
// Replace with your actual default QR data

const HomeScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Home');

  const navigation = useNavigation();

  const {logout} = usePersonalStore();
  //   const [recentContacts, setRecentContacts] = useState([
  //   {
  //     id: 1,
  //     name: 'Arjun Mehta',
  //     action: 'Added',
  //     time: '2 hours ago',
  //      icon:  <IconT name="user" size={20} color={textColor.bg} />,
  //     badge: 'New',
  //   },
  //   {
  //     id: 2,
  //     name: 'Priya Shah',
  //     action: 'Shared',
  //     time: '5 hours ago',
  //         icon:  <IconT name="user" size={20} color={textColor.bg} />,
  //   },
  //   {
  //     id: 3,
  //     name: 'Vikram Das',
  //     action: 'Scanned',
  //     time: '1 day ago',
  //     icon:  <IconT name="user" size={20} color={textColor.bg} />,
  //   },
  // ]);

  const resetEventData = useEventStore(state => state.resetEventData);

  // Inside component
  const [recentContacts, setRecentContacts] = useState([]);

  useEffect(() => {
    const loadRecentContacts = async () => {
      try {
        const contacts = await getRecentVcards(10);
        setRecentContacts(contacts);
        console.log('Recent contacts loaded:', contacts);
      } catch (error) {
        console.log('Failed to load recent contacts:', error);
      }
    };

    loadRecentContacts();
  }, []);

  const [totalEvents, setTotalEvents] = useState(0);
  const [sharedCards, setSharedCards] = useState(0);
  const [connections, setConnections] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId'); // ✅ await the value

        if (!userId) return;

        const [eventCount, cardCount, connectionCount] = await Promise.all([
          fetchUserEventsCount(userId),
          fetchSharedCardsCount(userId),
          fetchConnectionsCount(userId),
        ]);

        setTotalEvents(eventCount);
        setSharedCards(cardCount);
        setConnections(connectionCount);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    loadStats();
  }, []);

  const handleLogout = () => {
    logout();

    navigation.navigate('Login');
  };
  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);
    switch (tabName) {
      case 'Create Event':
        navigation.navigate('CreateEvent');
        resetEventData();

        break;
      case 'View Cards':
        navigation.navigate('VcardHistory');
        break;
      case 'Scanner':
        navigation.navigate('ScanQr');
        break;
      case 'Profile':
        navigation.navigate('PersonalData');
        break;
      default:
        break;
    }
  };

  const StatCard = ({
    value,
    label,
    icon,
    color = textColor.bg,
    bgColor = '#F8F9FA',
  }) => (
    <View style={[styles.statCard, {backgroundColor: bgColor}]}>
      <View style={[styles.statIconContainer, {backgroundColor: `${color}15`}]}>
        {React.cloneElement(icon, {color})}
      </View>
      <Text style={[styles.statValue, {color}]}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={1} ellipsizeMode="tail">
        {label}
      </Text>
    </View>
  );

  const FeatureCard = ({
    title,
    description,
    icon,
    onPress,
    color = '#949494',
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.featureCard, {backgroundColor: color}]}
      activeOpacity={0.85}>
      <View style={styles.featureCardContent}>
        <View style={styles.featureIconWrapper}>{icon}</View>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );

  const TabButton = ({name, icon, isActive, onPress}) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTab]}
      onPress={onPress}
      activeOpacity={0.7}>
      {isActive && <View style={styles.tabIndicator} />}
      <View style={[styles.tabIconContainer, isActive && styles.activeTabIcon]}>
        {React.cloneElement(icon, {
          color: isActive ? textColor.bg : '#8E8E93',
          size: 24,
        })}
      </View>
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>
        {name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={''} />

      <View style={[styles.headerContent]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => handleLogout()}>
            <Icon name="logout" size={24} color="#420063" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="notifications" size={24} color="#420063" />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.welcomeContainer}>
          <Text style={styles.headerTitle}>KonTaxto</Text>
          <Text style={styles.welcomeText}>Welcome back!</Text>
        </View>
      </View>

      <SafeAreaView style={styles.mainContent}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Enhanced Stats Section */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsContainer}>
              <StatCard
                value={totalEvents.toString()}
                label="Events"
                icon={<Icon name="event" size={24} />}
                color={textColor.bg}
                bgColor="#FFFFFF"
              />
              <StatCard
                value={sharedCards.toString()}
                label="Cards Shared"
                icon={<Icon name="share" size={24} />}
                color="#E74C3C"
                bgColor="#FFFFFF"
              />
              <StatCard
                value={connections.toString()}
                label="Connections"
                icon={<Icon name="people" size={24} />}
                color="#27AE60"
                bgColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Default QR Code Section */}
          <View style={[styles.qrSection]}>
            <Text style={styles.sectionTitle}>Your Digital Card</Text>

            <View style={styles.qrCodeContainer}>
              <CreateQrCode />

              <Text style={styles.qrText}>Scan to Connect</Text>
            </View>
          </View>

          {/* Feature Cards */}
          <View style={[styles.featuresSection]}>
            <Text style={styles.sectionTitle}>Explore Features</Text>
            <View style={styles.featuresContainer}>
              <FeatureCard
                title="Create Event"
                description="Plan and organize amazing events"
                icon={
                  <Image
                    source={require('../../assets/pngs/event.png')} // Adjust path as needed
                    style={{width: 100, height: 100, resizeMode: 'contain'}}
                  />
                }
                onPress={() => handleTabPress('Create Event')}
              />
              <FeatureCard
                title="QR Scanner"
                description="Scan codes instantly"
                icon={
                  <Image
                    source={require('../../assets/pngs/qr.png')} // Adjust path as needed
                    style={{width: 100, height: 100, resizeMode: 'contain'}}
                  />
                }
                onPress={() => handleTabPress('Scanner')}
              />
            </View>
          </View>

          <Animated.View style={[styles.recentSection]}>
            <Text style={styles.sectionTitle}>Recent Contacts</Text>
            {recentContacts.length > 0 ? (
              <View style={styles.activityCard}>
                {recentContacts.map((contact, index) => (
                  <View key={index} style={styles.activityItem}>
                    <View style={styles.activityIcon}>
                      {contact.profilePicture ? (
                        <Image
                          source={{
                            uri: contact.profilePicture || 'default_image_url',
                          }}
                          style={{width: 44, height: 44, borderRadius: 22}}
                        />
                      ) : (
                        <IconT name="user" size={20} color={textColor.bg} />
                      )}
                    </View>

                    <View style={styles.activityContent}>
                      {/* Name and Intent badge in row */}
                      <View style={styles.topRow}>
                        <Text style={styles.activityTitle}>
                          {contact.firstName} {contact.lastName}
                        </Text>

                        {contact.intent && (
                          <View
                            style={[
                              styles.intentBadge,
                              getIntentStyle(contact.intent),
                            ]}>
                            <Text style={[styles.intentText]}>
                              {contact.intent}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Org & Designation */}
                      {(contact.organization || contact.designation) && (
                        <View style={styles.rowInfo}>
                          {contact.organization && (
                            <Text style={styles.infoText}>
                              {contact.organization}
                            </Text>
                          )}
                          {contact.organization && contact.designation && (
                            <Text style={styles.dot}>•</Text>
                          )}
                          {contact.designation && (
                            <Text style={styles.infoText}>
                              {contact.designation}
                            </Text>
                          )}
                        </View>
                      )}

                      {contact.createdAt && (
                        <Text style={styles.activityTime}>
                          {dayjs(contact.createdAt).fromNow()}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View
                style={[
                  styles.recentSection,
                  {
                    alignItems: 'center',
                    padding: 20,
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 10,
                  },
                ]}>
                <Text style={{color: '#999', fontSize: 16}}>
                  No recent contacts
                </Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* Enhanced Bottom Tab Navigation */}
      <View style={styles.bottomTab}>
        <View style={styles.tabContainer}>
          <TabButton
            name="Home"
            icon={<Icon name="home" />}
            isActive={activeTab === 'Home'}
            onPress={() => setActiveTab('Home')}
          />
          <TabButton
            name="Create"
            icon={<Icon name="add-circle" />}
            isActive={activeTab === 'Create Event'}
            onPress={() => handleTabPress('Create Event')}
          />
          <TabButton
            name="Cards"
            icon={<Icon name="credit-card" />}
            isActive={activeTab === 'View Cards'}
            onPress={() => handleTabPress('View Cards')}
          />
          <TabButton
            name="Scanner"
            icon={<Icon name="qr-code-scanner" />}
            isActive={activeTab === 'Scanner'}
            onPress={() => handleTabPress('Scanner')}
          />
          <TabButton
            name="Profile"
            icon={<Icon name="person" />}
            isActive={activeTab === 'Profile'}
            onPress={() => handleTabPress('Profile')}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: textColor.bg,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  intentBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  intentText: {
    fontSize: 12,
    color: 'white', // Teal
    fontWeight: '600',
  },

  rowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  infoText: {
    fontSize: 12,
    color: '#444',
  },

  dot: {
    marginHorizontal: 6,
    fontSize: 10,
    color: '#888',
  },

  headerContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: textColor.bg,

    zIndex: 1,
    position: 'relative',
  },

  activityBadge: {
    backgroundColor: 'red',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'center',
  },

  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },

  featureCardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },

  featureIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  timeContainer: {
    alignItems: 'flex-start',
  },
  timeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dateText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    // backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  welcomeContainer: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#420063',
  },
  mainContent: {
    flex: 1,
    marginTop: -20,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 6,
    alignItems: 'center',

    elevation: 8,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',

    fontWeight: '500',
  },
  qrSection: {
    paddingHorizontal: 20,
    paddingBottom: 25,
  },

  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },

  qrText: {
    fontSize: 16,
    color: textColor.secondColor,
    fontWeight: '600',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  shareButtonText: {
    color: textColor.secondColor,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureCard: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 16,
    overflow: 'hidden',

    elevation: 8,
  },
  featureGradient: {
    padding: 20,
    alignItems: 'center',
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 16,
  },
  recentSection: {
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F6',
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',

    color: '#2C3E50',
  },
  activityTime: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  // activityBadge: {
  //   backgroundColor: '#E74C3C',
  //   paddingHorizontal: 8,
  //   paddingVertical: 4,
  //   borderRadius: 12,
  // },
  bottomTab: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 16,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#F8F9FA',
  },
  tabIndicator: {
    position: 'absolute',
    top: -2,
    width: 30,
    height: 3,
    backgroundColor: textColor.bg,
    borderRadius: 2,
  },
  tabIconContainer: {
    marginBottom: 4,
  },
  activeTabIcon: {
    transform: [{scale: 1.1}],
  },
  tabText: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTabText: {
    color: textColor.bg,
    fontWeight: '600',
  },
});

export default HomeScreen;
