import React, {useRef, useEffect} from 'react';
import IconT from 'react-native-vector-icons/FontAwesome';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
  StatusBar,
  TextInput,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {usePersonalStore} from '../../store/userPersonalStore';
import {textColor} from '../../assets/pngs/Colors/color';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchImageLibrary} from 'react-native-image-picker';
import {openPrepopulatedDB} from '../../services/db';
import {userDetails} from '../../services/userDeatils'; // Ensure this import is correct

const PersonalDataScreen: React.FC = () => {
  const [isEditing, setIsEditing] = React.useState(false);
  const {formData, setFormData} = usePersonalStore();
  const [editedData, setEditedData] = React.useState(formData);
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const email = AsyncStorage.getItem('email');

  const {updateUserDetail} = userDetails();

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
        console.log('Selected image asset:', asset);
        if (asset?.base64) {
          const imageUri = `data:${asset.type};base64,${asset.base64}`;
          setEditedData(prev => ({...prev, profileImage: imageUri}));
        }
      },
    );
  };

  useEffect(() => {
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleCreateEvent = () => {
    navigation.navigate('CreateEvent');
  };

  // const handleEditProfile = () => {
  //   if (isEditing) {
  //     setFormData(editedData); // save to store

  //     Alert.alert('Success', 'Profile updated!');
  //   }
  //   setIsEditing(!isEditing); // toggle mode
  // };

  const handleEditProfile = async () => {
    if (isEditing) {
      try {
        const db = await openPrepopulatedDB();

        const detail = {
          name: `${editedData.firstName} ${editedData.lastName}`,
          phone: editedData.phone,
          password: '', // or the actual value if available
          linkedln: editedData.linkedln,
          bio: '',
          organization: editedData.organization,
          designation: editedData.designation,
          profileImage: editedData.profileImage,
          email: editedData.email,
        };

        const original = {
          name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          password: '',
          linkedln: formData.linkedln,
          bio: '',
          organization: formData.organization,
          designation: formData.designation,
          profileImage: formData.profileImage,
          email: formData.email,
        };

        await updateUserDetail(db, detail, original);
        setFormData(editedData);
        console.log('Profile updated successfully:', editedData);
        console.log();
        Alert.alert('Success', 'Profile updated!');
      } catch (err) {
        console.log('Update error:', err);
        Alert.alert('Update Failed', 'Could not update user profile.');
      }
    }

    setIsEditing(prev => !prev);
  };

  const renderDetailItem = (
    icon: React.ReactNode,
    label: keyof typeof editedData,
    isLast = false,
  ) => (
    <View style={[styles.detailItem, !isLast && styles.detailItemBorder]}>
      <View style={styles.detailIcon}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={editedData[label]}
            onChangeText={text =>
              setEditedData(prev => ({...prev, [label]: text}))
            }
          />
        ) : (
          <Text style={styles.detailValue}>{formData[label]}</Text>
        )}
      </View>
    </View>
  );

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={textColor.bg} />

      {/* Header */}
      <View style={styles.header}>
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
            },
          ]}>
          <TouchableOpacity
            style={styles.backIcon}
            onPress={() => navigation.navigate('Home')}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={textColor.secondColor}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => {
              if (isEditing) handleSelectImage();
            }}
            activeOpacity={isEditing ? 0.7 : 1}>
            {editedData.profileImage ? (
              <Image
                source={{uri: editedData.profileImage}}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.avatarText}>
                {getInitials(editedData.firstName, editedData.lastName)}
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.headerName}>
            {`${formData.firstName} ${formData.lastName}`}
          </Text>
          <Text style={styles.headerEmail}>{formData.email}</Text>

          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}>
            <View style={styles.editButtonT}>
              <Icon
                name={isEditing ? 'check' : 'edit'}
                size={24}
                color="white"
              />
              <Text style={styles.editButtonText}>
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Details Card */}
      <Animated.View
        style={[
          styles.detailsCard,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}, {scale: scaleAnim}],
          },
        ]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.detailsContainer}>
            {renderDetailItem(
              <Icon name="person" size={24} color="#4292c6" />,
              'firstName',
            )}
            {renderDetailItem(
              <Icon name="person" size={24} color="#4292c6" />,
              'lastName',
            )}
            {renderDetailItem(
              <Icon name="email" size={24} color="#4292c6" />,
              'email',
            )}
            {renderDetailItem(
              <Icon name="phone" size={24} color="#4292c6" />,
              'phone',
            )}
            {renderDetailItem(
              <Icon name="home" size={24} color="#4292c6" />,
              'organization',
            )}
            {renderDetailItem(
              <Icon name="work" size={24} color="#4292c6" />,
              'designation',
            )}
            {renderDetailItem(
              <IconT name="linkedin-square" size={24} color="#0077B5" />,
              'linkedln',
              true,
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: textColor.bg,
    paddingTop: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backIcon: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 10,
    padding: 8,
  },

  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 4,
    fontSize: 16,
    color: '#2C3E50',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3498DB',
  },
  headerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerEmail: {
    fontSize: 16,
    color: '#E8F4FD',
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  editButtonT: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'center',
  },
  detailsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: -20,
    marginHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  detailsContainer: {
    paddingHorizontal: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  detailItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F6',
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 18,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  actionButtonsContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  createEventButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#E74C3C',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  secondaryButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#3498DB',
    fontWeight: '600',
  },
});

export default PersonalDataScreen;
