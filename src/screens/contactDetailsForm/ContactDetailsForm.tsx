import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  StatusBar,
  Dimensions,
  Platform,
  Modal,
  Animated,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import useScanStore from '../../store/useScanStore';
import {useEventStore} from '../../store/useEventStore';
import {useScanDetails} from '../../services/useScanDetails';
import AudioRecorder from '../../components/AudioRecorder';
import VoiceNotePlayer from '../../components/VouceNotePlayer';
import { TagModal } from '../../components/TagModel';
import { getIntentStyle, synergyTags } from '../../constants/intentData';

const {width} = Dimensions.get('window');

interface IntentOption {
  id: string;
  label: string;
  icon: string;
  description: string;
}

interface VcardDetail {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organization: string;
  designation: string;
  linkedln: string;
  eventDetails: {
    title: string;
    location: string;
    intent: string;
    date: string;
  };
  notes: string;
  yourIntent: string;
  tags: string;
  voiceNote?: string | null; // Optional field for voice note
  

}

const intentOptions: IntentOption[] = [
  {
    id: 'networking',
    label: 'Networking',
    icon: '🤝',
    description: 'Connect with like-minded people',
  },
  {
    id: 'partnership',
    label: 'Partnership',
    icon: '🤝',
    description: 'Explore business collaborations',
  },
  {
    id: 'exploration',
    label: 'Exploration',
    icon: '🔍',
    description: 'Discover new opportunities',
  },
  {
    id: 'nothing_specific',
    label: 'Nothing Specific',
    icon: '🎯',
    description: 'Just going with the flow',
  },
];

const ContactDetailsForm = () => {
  const [currentScreen, setCurrentScreen] = useState('form');
  const {addVcardDetail} = useScanDetails();
  const [isSaving, setIsSaving] = useState(false);

  type FormData = {
    firstName: string;
    lastName: string;
    name: {
      firstName: string;
      lastName: string;
    };
    organization: string;
    designation: string;
    phone: string;
    email: string;
    url: string;
    linkedln: string;
    notes?: string;
    tags?: string;
    voiceNote?: string | null; // Optional field for voice note
   
  };

  const {qrData: formData, clearQrData} = useScanStore() as {
    qrData: FormData;
    clearQrData: (value: string) => void;
  };

  const {eventData} = useEventStore();
  const [showIntentModal, setShowIntentModal] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const modalScale = useRef(new Animated.Value(0.8)).current;

  const [yourData, setYourData] = useState({
    note: '',
    tags: '',
    intent: '',
    voiceNote:''
  });

  console.log('eventData', eventData);

  const isFormValid = () => {
    return (
      formData.firstName?.trim() ||
      formData.name?.firstName?.trim() ||
      formData.lastName?.trim() ||
      formData.name?.lastName?.trim() ||
      formData.email?.trim()
    );
  };
//  const getIntentStyle = (intent: string) => {
//     switch (intent.toLowerCase()) {
//       case 'business':
//         return {backgroundColor: 'yellow'};
//       case 'personal':
//         return {backgroundColor: 'pink'};
//       case 'networking':
//         return {backgroundColor: 'green'};
//       case 'partnership':
//         return {backgroundColor: 'blue'};

//       case 'exploration':
//         return {backgroundColor: 'orange'};
//       default:
//         return {backgroundColor: 'purple'};
//     }
//   };
  // Function to save vCard to database
  const saveVcardToDatabase = async () => {

    if (!isFormValid()) {
      Alert.alert(
        'Validation Error',
        'Please ensure you have at least First Name, Last Name, or Email.',
      );
      return false;
    }

    setIsSaving(true);

    try {
      const vcardDetail: VcardDetail = {
        firstName: formData.firstName || formData.name?.firstName || '',
        lastName: formData.lastName || formData.name?.lastName || '',
        email: formData.email || '',
        phone:
          typeof formData.phone === 'string'
            ? formData.phone
            : formData.phone?.number || '',
        organization: formData.organization || '',
        designation: formData.designation || '',
        linkedln: formData.linkedln || formData.url || '',
        eventDetails: {
          title:    eventData.title || formData.title || 'top',
          location: eventData.location || formData.location ||'Location',
          intent: eventData.intent || formData.intent|| 'General',
          date:  new Date().toISOString().split('T')[0],
        },
        notes: yourData.note || '',
        yourIntent: yourData.intent || '',
        tags: yourData.tags || '',
        voiceNote: yourData.voiceNote || null, // Optional field for voice note
      
      };

      await addVcardDetail(vcardDetail);
      console.log('fvcardDetail', vcardDetail);

      Alert.alert('Success', 'Contact details saved successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Optionally navigate to vCard view or stay on form
            setCurrentScreen('vcard');
          },
        },
      ]);

      return true;
    } catch (error) {
      console.error('Error saving vCard:', error);
      Alert.alert('Error', 'Failed to save contact details. Please try again.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const generateVCard = () => {
    const card = new vCard();

    const firstName =
      formData.firstName?.trim() || formData.name?.firstName?.trim() || '';
    const lastName =
      formData.lastName?.trim() || formData.name?.lastName?.trim() || '';

    if (firstName || lastName) {
      card.addName(lastName, firstName);
      card.addFormattedName(`${firstName} ${lastName}`.trim());
    }

    if (formData.organization) {
      card.addOrganization(formData.organization);
    }

    if (formData.designation) {
      card.addJobtitle(formData.designation);
    }

    const phoneNumber =
      typeof formData.phone === 'string'
        ? formData.phone.trim()
        : formData.phone?.number?.trim() || '7687686886';

    if (phoneNumber) {
      card.addPhoneNumber(phoneNumber, 'WORK');
    }

    if (formData.email) {
      card.addEmail(formData.email, 'WORK');
    }
    if (formData.url) {
      card.addURL(formData.url);
    }
    if (formData.linkedln) {
      card.addURL(formData.linkedln);
    }

    const eventNote = `Event: ${eventData.title} | Date: ${
      eventData.date
    } | Location: ${'udaipur'}`;
    const fullNote = formData.notes
      ? `${formData.notes}\n\n${eventNote}`
      : eventNote;
    card.addNote(fullNote);

    const allTags = [];
    if (formData.tags) {
      const personalTags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      allTags.push(...personalTags);
    }
    if (eventData.eventTag) {
      const eventTags = eventData.eventTag
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      allTags.push(...eventTags);
    }
    if (eventData.intent) {
      allTags.push(`intent:${eventData.intent}`);
    }

    if (allTags.length > 0) {
      card.addCategories(allTags);
    }

    return card.getFormattedString();
  };

  const handleInputChange = (field: keyof typeof yourData, value: string) => {
    setYourData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleIntentSelect = (intent: IntentOption) => {
    handleInputChange('intent', intent.label);
    setShowIntentModal(false);
  };

  const openIntentModal = () => {
    setShowIntentModal(true);
    modalScale.setValue(0.8);
    Animated.spring(modalScale, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const closeIntentModal = () => {
    Animated.timing(modalScale, {
      toValue: 0.8,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowIntentModal(false);
    });
  };

 
  const createVCard = async () => {
    const saved = await saveVcardToDatabase();
    if (saved) {
      // Data is already saved, vCard view will be shown via the success alert callback
    }
  };

  const clearForm = () => {
    clearQrData('');
    setYourData({
      note: '',
      tags: '',
      intent: '',
      voiceNote:''
    });
  };

  const renderIntentOption = ({item}: {item: IntentOption}) => (
    <TouchableOpacity
      style={styles.intentOption}
      onPress={() => handleIntentSelect(item)}
      activeOpacity={0.7}>
      <View style={styles.intentOptionContent}>
        <Text style={styles.intentIcon}>{item.icon}</Text>
        <View style={styles.intentTextContainer}>
          <Text style={styles.intentLabel}>{item.label}</Text>
          <Text style={styles.intentDescription}>{item.description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
const [isTagsModalVisible, setTagsModalVisible] = useState(false);

const openTagsModal = () => setTagsModalVisible(true);
const closeTagsModal = () => setTagsModalVisible(false);

const handleSaveTags = (tagsArray) => {
  updateField("tags", tagsArray); // Assuming `tags` is stored as an array
  setTagsModalVisible(false);
};
  const shareVCard = async () => {
    try {
      const vCardString = generateVCard();
      const fullName =
        `${formData.firstName || ''} ${formData.lastName || ''}`.trim() ||
        `${formData.name?.firstName || ''} ${
          formData.name?.lastName || ''
        }`.trim() ||
        'Contact';

      await Share.share({
        message: vCardString,
        title: `${fullName} - Contact Card`,
      });
    } catch (error) {
      console.log('Error sharing vCard:', error);
    }
  };

  const updateField = (field: string, value: string) => {
    setYourData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const getProfileInitials = () => {
    const firstInitial =
      formData.firstName?.charAt(0)?.toUpperCase() ||
      formData.name?.firstName?.charAt(0)?.toUpperCase() ||
      '';
    const lastInitial =
      formData.lastName?.charAt(0)?.toUpperCase() ||
      formData.name?.lastName?.charAt(0)?.toUpperCase() ||
      '';

    return `${firstInitial}${lastInitial}` || 'UC';
  };
const getTagsPreview = () => {
  if (!yourData.tags) return [];
  if (Array.isArray(yourData.tags)) return yourData.tags;
  return yourData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
};




  const getSelectedIntentIcon = () => {
    const selectedIntent = intentOptions.find(
      option => option.label === yourData.intent,
    );
    return selectedIntent ? selectedIntent.icon : '🎯';
  };


  if (currentScreen === 'vcard') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
        <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.header}>
          <TouchableOpacity
            onPress={() => setCurrentScreen('form')}
            style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#fff" />
            <Text style={styles.backButtonText}>Back to Form</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contact Card</Text>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.profileImageContainer}>
              <Text style={styles.profileInitials}>{getProfileInitials()}</Text>
            </LinearGradient>

            <Text style={styles.profileName}>
              {formData?.firstName || formData.name.firstName}{' '}
              {formData?.lastName || formData.name.lastName}
            </Text>

            {formData.designation && (
              <Text style={styles.profileDesignation}>
                {formData.designation}
              </Text>
            )}

            {formData.organization && (
              <Text style={styles.profileOrganization}>
                {formData.organization}
              </Text>
            )}
          </View>

          {/* Contact Information */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Contact Information</Text>

            {formData.email && (
              <View style={styles.infoRow}>
                <Icon name="mail" size={20} color="#6366f1" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{formData.email}</Text>
                </View>
              </View>
            )}

            {(typeof formData.phone === 'string' || formData.phone.number) && (
              <View style={styles.infoRow}>
                <Icon name="phone" size={20} color="#6366f1" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>
                    {typeof formData.phone === 'string'
                      ? formData.phone
                      : formData.phone?.number || '87787867656'}
                  </Text>
                </View>
              </View>
            )}

            {formData.linkedln && formData.url && (
              <View style={styles.infoRow}>
                <Icon name="globe" size={20} color="#6366f1" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>linkedln</Text>
                  <Text style={styles.infoValue}>
                    {formData.linkedln || formData.url}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Event Information */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Event Details</Text>

            <View style={styles.infoRow}>
              <Icon name="calendar" size={20} color="#10b981" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Event</Text>
                <Text style={styles.infoValue}>
                  {eventData.title || formData.title || 'top'}
                </Text>

              
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="clock" size={20} color="#10b981" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>
                  {eventData.date || formData.date || '7/10/2023'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="map-pin" size={20} color="#10b981" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>
                  {eventData.location || formData.location || 'ggg'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="target" size={20} color="#10b981" />
              <View style={[styles.infoContent,{flex:0}]}>
                <Text style={styles.infoLabel}>Purpose</Text>
                {/* <Text style={styles.infoValue}>
                  {eventData.intent || formData.intent || 'no'}
                </Text> */}

                   <Text
                              style={[
                                styles.summaryValutIntent,
                                getIntentStyle(eventData.intent || formData.intent || 'no'),
                              ]}>
                             {eventData.intent || formData.intent || 'no'}
                            </Text>
              </View>
            </View>
          </View>

          {/* Notes */}
          {yourData.note && (
          
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Personal Notes</Text>
              <Text style={styles.notesText}>{yourData.note}</Text>
            </View>
          )}

<View style={{}}>
          {yourData.intent && (
             
            <View style={[styles.infoSection]}>
              <Text style={styles.sectionTitle}>Your Intent</Text>
              <Text style={[styles.notesText,styles.summaryValutIntent, getIntentStyle(yourData.intent ),  { alignSelf: "flex-start" }]}>{yourData.intent}</Text>
            </View>
       
          )}
</View>
          {/* Tags */}
          {/* {getTagsPreview().length > 0 && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {getTagsPreview().map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )} */}


          {getTagsPreview().length > 0 && (
  <View style={styles.infoSection}>
    <Text style={styles.sectionTitle}>Tags</Text>
    <View style={styles.tagsContainer}>
      {getTagsPreview().map((tag, index) => {
        // Find matching color from synergyTags
        const tagConfig = synergyTags.find(item => item.value === tag);
        const backgroundColor = tagConfig?.color || '#e0e7ff'; 

        return (
          <View key={index} style={[styles.tag, { backgroundColor }]}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        );
      })}
    </View>
  </View>
)}

{yourData.voiceNote && (
  <View style={styles.infoSection}>
    <Text style={styles.sectionTitle}>Voice Note</Text>
    <VoiceNotePlayer audioPath={yourData.voiceNote} />
  </View>
)}
     
        </ScrollView>
      </View>
    );
  }

  // Main Form Screen
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
      <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.header}>
        <Text style={styles.headerTitle}>vCard Creator</Text>
        <Text style={styles.headerSubtitle}>
          Create professional contact cards
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, {flex: 1, marginRight: 8}]}>
              <Icon
                name="user"
                size={18}
                color="#9ca3af"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="First Name"
                value={formData.firstName || formData.name.firstName}
                style={styles.textInput}
                placeholderTextColor="#9ca3af"
                editable={false}
              />
            </View>

            <View style={[styles.inputContainer, {flex: 1, marginLeft: 8}]}>
              <Icon
                name="user"
                size={18}
                color="#9ca3af"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Last Name"
                value={formData.lastName || formData.name.lastName}
                style={styles.textInput}
                placeholderTextColor="#9ca3af"
                editable={false}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Icon
              name="briefcase"
              size={18}
              color="#9ca3af"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="Organization"
              value={formData.organization}
              style={styles.textInput}
              placeholderTextColor="#9ca3af"
              editable={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon
              name="award"
              size={18}
              color="#9ca3af"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="Job Title / Designation"
              value={formData.designation}
              style={styles.textInput}
              placeholderTextColor="#9ca3af"
              editable={false}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Contact Details</Text>

          <View style={styles.inputContainer}>
            <Icon
              name="phone"
              size={18}
              color="#9ca3af"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={
                typeof formData.phone === 'string'
                  ? formData.phone
                  : formData.phone?.number || ''
              }
              style={styles.textInput}
              placeholderTextColor="#9ca3af"
              editable={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon
              name="mail"
              size={18}
              color="#9ca3af"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="Email Address"
              keyboardType="email-address"
              value={formData.email}
              style={styles.textInput}
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              editable={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon
              name="globe"
              size={18}
              color="#9ca3af"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="Linkedln"
              value={formData.linkedln || formData.url}
              style={styles.textInput}
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              editable={false}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Additional Information</Text>

          <View style={styles.inputContainer}>
            <Icon
              name="edit-3"
              size={18}
              color="#9ca3af"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="Personal Notes"
              value={yourData.note}
              onChangeText={text => updateField('note', text)}
              style={[styles.textInput, styles.multilineInput]}
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* <View style={styles.inputContainer}>
            <Icon
              name="tag"
              size={18}
              color="#9ca3af"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="Tags (comma separated)"
              value={yourData.tags}
              onChangeText={text => updateField('tags', text)}
              style={styles.textInput}
              placeholderTextColor="#9ca3af"
            />
          </View> */}


<View style={styles.inputContainer}>
  <TouchableOpacity
    style={[styles.inputWrapper, styles.dropdownWrapper]}
    onPress={openTagsModal}
    activeOpacity={0.8}
  >
    <Text style={styles.inputIcon}>
      <Icon name="tag" size={18} color="#9ca3af" />
    </Text>
    <Text
      style={[
        styles.dropdownText,
        (!yourData.tags || yourData.tags.length === 0) && styles.placeholderText,
      ]}
    >
      {yourData.tags?.length > 0 ? yourData.tags.join(", ") : "Select tags"}
    </Text>
    <Text style={styles.dropdownArrow}>▼</Text>
  </TouchableOpacity>
</View>

          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={[styles.inputWrapper, styles.dropdownWrapper]}
              onPress={openIntentModal}
              activeOpacity={0.8}>
              <Text style={styles.inputIcon}>{getSelectedIntentIcon()}</Text>
              <Text
                style={[
                  styles.dropdownText,
                  !yourData.intent && styles.placeholderText,
                ]}>
                {yourData.intent || 'Select your intent'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>

    

        </View>

        <View>   <Text style={styles.sectionTitle}>Voice Note</Text>
              <AudioRecorder onAudioRecorded={(path) => updateField('voiceNote', path)} /></View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={createVCard}
            style={styles.createButton}
            disabled={isSaving}>
            <LinearGradient
              colors={
                isSaving ? ['#9ca3af', '#6b7280'] : ['#6366f1', '#8b5cf6']
              }
              style={styles.gradientButton}>
              <Icon
                name={isSaving ? 'loader' : 'credit-card'}
                size={20}
                color="#fff"
              />
              <Text style={styles.buttonText}>
                {isSaving ? 'Saving...' : 'Save & Create vCard'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={clearForm} style={styles.clearButton}>
            <Icon name="refresh-cw" size={20} color="#6b7280" />
            <Text style={styles.clearButtonText}>Clear Form</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showIntentModal}
        transparent={true}
        animationType="none"
        onRequestClose={closeIntentModal}
        statusBarTranslucent={true}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeIntentModal}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={e => e.stopPropagation()}>
            <Animated.View
              style={[
                styles.modalContainer,
                {transform: [{scale: modalScale}]},
              ]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Your Intent</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={closeIntentModal}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={intentOptions}
                renderItem={renderIntentOption}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalContent}
              />
            </Animated.View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
<TagModal
  visible={isTagsModalVisible}
  onClose={closeTagsModal}
  onSave={handleSaveTags}
  selectedTags={yourData.tags}
/>

      
    </View>
  );
};

// All your existing styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    bottom:12
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },
   summaryValutIntent: {
    fontSize: 16,
padding:4,
borderRadius: 8,
color: '#fff',
    // backgroundColor: 'grey',
  },
  inputWrapperFocused: {
    borderColor: '#9B59B6',
    backgroundColor: '#FFFFFF',
  },
  inputWrapperError: {
    borderColor: '#E74C3C',
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#2C3E50',
  },
  dropdownWrapper: {
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
  },
  placeholderText: {
    color: '#A0A0A0',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 14,
    marginTop: 6,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    textAlign: 'center',
    marginTop: 5,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formSection: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },

  multilineInput: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  profileInitials: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  profileDesignation: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 3,
  },
  profileOrganization: {
    fontSize: 16,
    color: '#9ca3af',
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  notesText: {
    fontSize: 16,
    
    color: '#4b5563',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: 'grey',
    fontWeight: '500',
  },
  actionButtons: {
    marginTop: 30,
    marginBottom: 40,
  },
  createButton: {
    marginBottom: 15,
  },
  shareButton: {
    marginBottom: 15,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  clearButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: width * 0.85,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  modalContent: {
    paddingVertical: 16,
  },
  intentOption: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  intentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  intentIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  intentTextContainer: {
    flex: 1,
  },
  intentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  intentDescription: {
    fontSize: 14,
    color: '#7F8C8D',
  },
});

export default ContactDetailsForm;
