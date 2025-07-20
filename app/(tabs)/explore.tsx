import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { colors } from "../../constants/Colors";
import { useSOSAlert } from '../../store/map-store';

// Emergency issue types and help options
const ISSUE_TYPES = [
  { label: 'Lost', value: 'lost' },
  { label: 'Injured', value: 'injured' },
  { label: 'Theft', value: 'theft' },
  { label: 'Need Rescue', value: 'rescue' }
];
const HELP_OPTIONS = [
  { label: 'Police Stations', value: 'police' },
  { label: 'Hotels/Lodges', value: 'lodging' },
  { label: 'Hospitals', value: 'hospital' },
  { label: 'Rescue Associations', value: 'rescue' }
];

// Type definition for SOS contacts
type SOSContact = {
  name: string;
  phone?: string;
  email?: string;
  location?: { lat: number; lng: number };
  fallback?: boolean;
};

// Default fallback contacts if API fails
const FALLBACK_CONTACTS: SOSContact[] = [
  {
    name: "Nepal Police",
    phone: "100",
    email: "police@helpnepal.gov.np",
    fallback: true
  },
  {
    name: "Nepal Health Service",
    phone: "102",
    email: "health@emergencycare.np",
    fallback: true
  },
  {
    name: "Rescue Association",
    phone: "+9779801234567",
    email: "rescue@himalayarescue.org",
    fallback: true
  }
];

export default function ExploreScreen() {
  const router = useRouter();

  // Form state
  const [selectedIssueTypes, setSelectedIssueTypes] = useState<string[]>(['lost']);
  const [selectedHelpOptions, setSelectedHelpOptions] = useState<string[]>(['hospital', 'police']);
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // UI state
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [showContactList, setShowContactList] = useState<boolean>(false);
  const [contacts, setContacts] = useState<SOSContact[]>([]);

  // Get SOS alert hook
  const { sendSOSAlert, loading: isSendingSOS, error: sosError } = useSOSAlert();

  // Get current location when component mounts
  useEffect(() => {
    getLocationAsync();
  }, []);

  // Request and get user's current location
  const getLocationAsync = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission denied',
          'We need location permission to help in emergencies. Please enable it in settings.',
          [{ text: 'OK' }]
        );
       
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location error',
        'Could not determine your location. Using default location for Annapurna region.',
        [{ text: 'OK' }]
      );
      // Default to a location in Annapurna region if location fails
      setLocation({ lat: 28.238339, lng: 84.382653 });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Toggle help option selection
  const toggleHelpOption = (value: string) => {
    if (selectedHelpOptions.includes(value)) {
      setSelectedHelpOptions(selectedHelpOptions.filter(option => option !== value));
    } else {
      setSelectedHelpOptions([...selectedHelpOptions, value]);
    }
  };

  // Toggle issue type selection
  const toggleIssueType = (value: string) => {
    if (selectedIssueTypes.includes(value)) {
      setSelectedIssueTypes(selectedIssueTypes.filter(type => type !== value));
    } else {
      setSelectedIssueTypes([...selectedIssueTypes, value]);
    }
  };

  // Handle sending the SOS request
  const handleSOS = async () => {
    if (!location) {
      Alert.alert('Location Required', 'Please wait while we determine your location, or try again.');
      getLocationAsync();
      return;
    }

    if (selectedIssueTypes.length === 0) {
      Alert.alert('Emergency Type Required', 'Please select at least one emergency type.');
      return;
    }

    if (description.trim() === '') {
      Alert.alert('Description Required', 'Please provide a brief description of your emergency.');
      return;
    }

    if (selectedHelpOptions.length === 0) {
      Alert.alert('Help Options Required', 'Please select at least one help option.');
      return;
    }

    try {
      const response = await sendSOSAlert(
        location.lat,
        location.lng,
        [...selectedHelpOptions, ...selectedIssueTypes] // Include both help options and issue types
      );

      console.log(JSON.stringify(response));

      if (response) {
        // If we have contacts in the response, set them
        if (response.contacts) {
          setContacts(response.contacts);
          setShowContactList(true);
        }
        
        Alert.alert(
          'SOS Alert Sent',
          'Your emergency request has been sent successfully. We have found contacts nearby who may be able to help you.',
          [
            {
              text: 'Proceed',
              onPress: () => {
                // Reset form fields
                setDescription('');
                setSelectedIssueTypes([]);
                setSelectedHelpOptions([]);
                // Navigate to raised-issues page
                router.push('/raised-issues');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error sending SOS:', error);
      
      // Fall back to default emergency contacts if API fails
      setContacts(FALLBACK_CONTACTS);
      setShowContactList(true);
      
      Alert.alert(
        'SOS Partially Sent',
        'There was an issue sending your SOS, but we have provided emergency contact numbers you can call directly.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle calling a contact
  const callContact = (phone: string) => {
    if (!phone) {
      Alert.alert('No Phone Number', 'This contact does not have a phone number.');
      return;
    }

    const formattedPhone = phone.replace(/\s/g, '');
    Linking.openURL(`tel:${formattedPhone}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emergency SOS</Text>
        <TouchableOpacity 
          style={styles.raisedIssuesButton}
          onPress={() => router.push('/raised-issues')}
        >
          <Ionicons name="list" size={20} color={colors.primary} />
          <Text style={styles.raisedIssuesText}>Raised Issues</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
        {/* Location Status */}
        <View style={styles.locationContainer}>
          <Text style={styles.sectionTitle}>Your Location</Text>
          <View style={styles.locationStatus}>
            {isLoadingLocation ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : location ? (
              <View style={styles.locationFound}>
                <Ionicons name="location" size={20} color="green" />
                <Text style={styles.locationText}>
                  Location found: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </Text>
              </View>
            ) : (
              <View style={styles.locationNotFound}>
                <Ionicons name="location-outline" size={20} color="red" />
                <Text style={styles.locationText}>Location not available</Text>
                <TouchableOpacity style={styles.retryButton} onPress={getLocationAsync}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        
        {/* Issue Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Type</Text>
          <View style={styles.issueTypeContainer}>
            {ISSUE_TYPES.map((issueType) => (
              <TouchableOpacity
                key={issueType.value}
                style={[
                  styles.helpOptionButton,
                  selectedIssueTypes.includes(issueType.value) && styles.helpOptionButtonSelected
                ]}
                onPress={() => toggleIssueType(issueType.value)}
              >
                <View style={[
                  styles.helpOptionCheckbox,
                  selectedIssueTypes.includes(issueType.value) && styles.helpOptionCheckboxSelected
                ]}>
                  {selectedIssueTypes.includes(issueType.value) && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <Text style={styles.helpOptionText}>{issueType.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Help Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request Help From</Text>
          <View style={styles.helpOptionsContainer}>
            {HELP_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.helpOptionButton,
                  selectedHelpOptions.includes(option.value) && styles.helpOptionButtonSelected
                ]}
                onPress={() => toggleHelpOption(option.value)}
              >
                <View style={[
                  styles.helpOptionCheckbox,
                  selectedHelpOptions.includes(option.value) && styles.helpOptionCheckboxSelected
                ]}>
                  {selectedHelpOptions.includes(option.value) && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <Text style={styles.helpOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Describe Your Emergency</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Briefly describe your situation..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>
        
        {/* SOS Button */}
        <TouchableOpacity
          style={[
            styles.sosButton,
            (!location || isSendingSOS) && styles.sosButtonDisabled
          ]}
          onPress={handleSOS}
          disabled={!location || isSendingSOS}
        >
          {isSendingSOS ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="warning" size={24} color="white" />
              <Text style={styles.sosButtonText}>SEND SOS</Text>
            </>
          )}
        </TouchableOpacity>
        
        {/* Contact List */}
        {showContactList && contacts.length > 0 && (
          <View style={styles.contactsSection}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            <Text style={styles.contactsSubtitle}>Tap on a contact to call</Text>
            
            {contacts.map((contact, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.contactCard,
                  contact.fallback && styles.contactCardFallback
                ]}
                onPress={() => callContact(contact.phone ?? '')}
              >
                <View style={styles.contactHeader}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  {contact.fallback && (
                    <View style={styles.fallbackBadge}>
                      <Text style={styles.fallbackBadgeText}>Official</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.contactDetails}>
                  {contact.phone ? (
                    <View style={styles.contactDetail}>
                      <Ionicons name="call" size={16} color={colors.primary} />
                      <Text style={styles.contactPhone}>{contact.phone}</Text>
                    </View>
                  ) : (
                    <Text style={styles.noPhone}>No phone number available</Text>
                  )}
                  
                  {contact.email && (
                    <View style={styles.contactDetail}>
                      <Ionicons name="mail" size={16} color={colors.primary} />
                      <Text style={styles.contactEmail}>{contact.email}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text
  },
  raisedIssuesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  raisedIssuesText: {
    marginLeft: 6,
    color: colors.primary,
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12
  },
  locationContainer: {
    marginBottom: 24
  },
  locationStatus: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  locationFound: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  locationNotFound: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
    flex: 1
  },
  retryButton: {
    backgroundColor: colors.primary,
    padding: 6,
    borderRadius: 4,
    marginLeft: 8
  },
  retryButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  issueTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8
  },
  issueTypeButton: {
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  issueTypeButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  issueTypeText: {
    color: colors.text,
    fontSize: 14
  },
  issueTypeTextSelected: {
    color: 'white',
    fontWeight: 'bold'
  },
  helpOptionsContainer: {
    marginBottom: 8
  },
  helpOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  helpOptionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`
  },
  helpOptionCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  helpOptionCheckboxSelected: {
    backgroundColor: colors.primary
  },
  helpOptionText: {
    fontSize: 16,
    color: colors.text
  },
  descriptionInput: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top'
  },
  sosButton: {
    backgroundColor: 'red',
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sosButtonDisabled: {
    opacity: 0.5
  },
  sosButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8
  },
  contactsSection: {
    marginTop: 16
  },
  contactsSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    fontStyle: 'italic'
  },
  contactCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12
  },
  contactCardFallback: {
    borderColor: colors.primary,
    borderWidth: 2
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1
  },
  fallbackBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  fallbackBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  contactDetails: {
    marginTop: 4
  },
  contactDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  contactPhone: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold'
  },
  contactEmail: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text
  },
  noPhone: {
    fontStyle: 'italic',
    color: colors.textSecondary,
    marginBottom: 4
  }
});