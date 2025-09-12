import { colors } from '@/constants/Colors';
import { API_BASE_URL } from '@/constants/config';
import TIMS from '@/constants/TIMS';
import { useAuthStore } from '@/store/auth-store';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { CheckCircle, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  View as ImageView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import DropdownSelect from 'react-native-input-select';


interface TrekOption {
  id?: string;
  trek_id: number;
  label: string;
  value: string;
  costs: Record<string, number>;
  total: number;
  [key: string]: any; // This makes the interface compatible with react-native-input-select
}

interface FormData {
  tims_card_no?: string; // Generated on backend
  transaction_id: string;
  issue_date?: Date; // Set on backend
  image: string;
  full_name: string;
  nationality: string;
  passport_number: string;
  gender: string;
  date_of_birth: Date;
  trek_id: number;
  trekker_area: string;
  route: string;
  entry_date: Date;
  exit_date: Date;
  nepal_contact_name: string;
  nepal_organization: string;
  nepal_designation: string;
  nepal_mobile: string;
  nepal_office_number: string;
  nepal_address: string;
  home_contact_name: string;
  home_city: string;
  home_mobile: string;
  home_office_number: string;
  home_address: string;
  status?: string; // Set on backend
  payment_status?: string; // Set on backend
  transit_pass_cost: Record<string, number>;
  permit_cost: number;
  created_at?: Date; // Set on backend
  updated_at?: Date; // Set on backend
  user?: number | null; // Set on backend
}

export default function TransitPassScreen() {
  const router = useRouter();
  const authStore = useAuthStore();
  const [localError, setLocalError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    transaction_id: '',
    image: '',
    full_name: '',
    nationality: '',
    passport_number: '',
    gender: '',
    date_of_birth: new Date(),
    trek_id: 0,
    trekker_area: '',
    route: '',
    entry_date: new Date(),
    exit_date: new Date(),
    nepal_contact_name: '',
    nepal_organization: '',
    nepal_designation: '',
    nepal_mobile: '',
    nepal_office_number: '',
    nepal_address: '',
    home_contact_name: '',
    home_city: '',
    home_mobile: '',
    home_office_number: '',
    home_address: '',
    transit_pass_cost: {},
    permit_cost: 0
  });
  
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUploadSuccess, setImageUploadSuccess] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState<keyof Pick<FormData, 'date_of_birth' | 'entry_date' | 'exit_date'> | ''>('');
  const [transitPassCost, setTransitPassCost] = useState<Record<string, number>>({});

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];

  const trekOptions: TrekOption[] = TIMS.map(trek => ({
    label: trek.name,
    value: trek.name,
    trek_id: trek.id,
    costs: Object.fromEntries(
      Object.entries(trek.Transit_Pass_Cost).filter(([_, v]) => typeof v === 'number')
    ),
    total: trek.Total_Transit_Cost_NPR
  }));

  const pickImage = async () => {
    setUploading(true);
    setImageUploadSuccess(false);
    
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        base64: true
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setImage(asset.uri);
        
        // Create base64 string with proper format
        let base64Img = `data:image/jpg;base64,${asset.base64}`;

        // Cloudinary upload
        const cloudName = "ddykuhurr";
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        
        const formData = new FormData();
        formData.append('file', base64Img);
        formData.append('upload_preset', 'finalProject');

        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        const json = await response.json();
        
        if (response.ok && json.secure_url) {
          setFormData(prev => ({
            ...prev,
            image: json.secure_url
          }));
          setImage(json.secure_url);
          setImageUploadSuccess(true);
          
          setTimeout(() => {
            setImageUploadSuccess(false);
          }, 2000);
        } else {
          throw new Error(json.error?.message || 'Failed to upload image');
        }
      }
    } catch (err: any) {
      console.log('Image upload error:', err);
      setLocalError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleTrekSelection = (item: TrekOption) => {
    const selectedTrek = TIMS.find(trek => trek.name === item.value);
    setFormData(prev => ({
      ...prev,
      trek_id: item.trek_id,
      trekker_area: item.value,
      route: selectedTrek ? selectedTrek.trekker_area : item.value,
      permit_cost: item.total
    }));
    setTransitPassCost(item.costs);
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined,
    field: keyof Pick<FormData, 'date_of_birth' | 'entry_date' | 'exit_date'>
  ) => {
    if (event.type === 'set') {
      setShowDatePicker('');
      if (selectedDate) {
        setFormData(prev => ({
          ...prev,
          [field]: selectedDate
        }));
      }
    } else {
      setShowDatePicker('');
    }
  };

  const handleSubmit = async () => {
    // Get the authentication token from store
    const token = authStore.token;

    if (!token) {
      Alert.alert('Error', 'Please log in first');
      router.push('/auth/login');
      return;
    }

    // Validate required fields
    if (!formData.image) {
      Alert.alert('Error', 'Please upload an image before submitting');
      return;
    }

    if (!formData.full_name || !formData.nationality || !formData.passport_number || !formData.gender) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      // Log the request data for debugging
      const requestData = {
        ...formData,
        transit_pass_cost: transitPassCost,
        date_of_birth: formData.date_of_birth.toISOString().split('T')[0],
        entry_date: formData.entry_date.toISOString().split('T')[0],
        exit_date: formData.exit_date.toISOString().split('T')[0],
        issue_date: new Date().toISOString().split('T')[0],
        permit_cost: Number(formData.permit_cost), // Send as number instead of string
        payment_status: 'pending',
        status: 'pending'
      };
      console.log('Request Data:', requestData);

      const response = await fetch(`${API_BASE_URL}tims/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`, 
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Server Response:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        
        // Create a more detailed error message
        let errorMessage = `Server Error: ${response.status} ${response.statusText}\n`;
        if (errorData) {
          errorMessage += '\nDetails:\n';
          Object.entries(errorData).forEach(([key, value]) => {
            errorMessage += `${key}: ${value}\n`;
          });
        }
        throw new Error(errorMessage);
      }

      Alert.alert('Success', 'TIMS application submitted successfully');
      router.back();
    } catch (error) {
      console.error('Submission Error:', error);
      Alert.alert(
        'Error', 
        'Failed to submit TIMS application. Please check your connection and try again.\n' +
        (error)
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>TIMS Application</Text>
        </View>

        <ScrollView style={styles.formContainer}>
          <TouchableOpacity 
              onPress={pickImage}
              style={styles.imageUploadContainer}
              disabled={uploading}
            >
              {image ? (
                <Image 
                  source={{ uri: image }} 
                  style={styles.profileImage} 
                />
              ) : (
                <ImageView style={styles.profileImagePlaceholder}>
                  <User size={32} color={colors.textSecondary} />
                </ImageView>
              )}
            </TouchableOpacity>
            
            {uploading && (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.uploadingText}>Uploading image...</Text>
              </View>
            )}

            {imageUploadSuccess && (
              <View style={styles.successContainer}>
                <CheckCircle
                  size={20}
                  color={colors.success}
                  style={styles.messageIcon}
                />
                <Text style={styles.successText}>Photo uploaded successfully!</Text>
              </View>
            )}

          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Transaction ID"
            value={formData.transaction_id}
            onChangeText={(text) => setFormData(prev => ({ ...prev, transaction_id: text }))}
            placeholderTextColor={colors.textSecondary}
          />

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={formData.full_name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, full_name: text }))}
            placeholderTextColor={colors.textSecondary}
          />

          <TextInput
            style={styles.input}
            placeholder="Nationality"
            value={formData.nationality}
            onChangeText={(text) => setFormData(prev => ({ ...prev, nationality: text }))}
            placeholderTextColor={colors.textSecondary}
          />

          <TextInput
            style={styles.input}
            placeholder="Passport Number"
            value={formData.passport_number}
            onChangeText={(text) => setFormData(prev => ({ ...prev, passport_number: text }))}
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.sectionTitle}>Gender</Text>
          <View style={styles.radioGroup}>
            {genderOptions.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={styles.radioRow}
                onPress={() => setFormData(p => ({ ...p, gender: opt.value }))}
              >
                <View
                  style={[
                    styles.radioCircle,
                    formData.gender === opt.value && styles.radioFilled,
                  ]}
                />
                <Text style={styles.radioLabel}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker('date_of_birth')}
          >
            <Text style={styles.dateButtonText}>
              Date of Birth: {formData.date_of_birth.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          {(showDatePicker === 'date_of_birth' || Platform.OS === 'ios') && (
            <DateTimePicker
              testID="dateOfBirthPicker"
              value={formData.date_of_birth}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => handleDateChange(event, date, 'date_of_birth')}
              textColor={colors.text}
              themeVariant={colors.background === '#000000' ? 'dark' : 'light'}
              accentColor={colors.primary}
              style={{ backgroundColor: colors.card, width: '100%' }}
            />
          )}

          <Text style={styles.sectionTitle}>Trek Information</Text>

          <DropdownSelect
            label="Trek Area"
            placeholder="Select a trek…"
            options={trekOptions}
            optionLabel="label"
            optionValue="value"
            selectedValue={formData.trekker_area}
            onValueChange={(value) => {
              if (typeof value === 'string') {
                const selected = trekOptions.find(t => t.value === value);
                if (selected) handleTrekSelection(selected);
              }
            }}
            primaryColor={colors.primary}
            dropdownStyle={{ borderWidth: 0 }}
          />

          <TextInput
            style={styles.input}
            placeholder="Route"
            value={formData.route}
            onChangeText={(text) => setFormData(prev => ({ ...prev, route: text }))}
            placeholderTextColor={colors.textSecondary}
          />

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker('entry_date')}
          >
            <Text style={styles.dateButtonText}>
              Entry Date: {formData.entry_date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          {(showDatePicker === 'entry_date' || Platform.OS === 'ios') && (
            <DateTimePicker
              testID="entryDatePicker"
              value={formData.entry_date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => handleDateChange(event, date, 'entry_date')}
              textColor={colors.text}
              themeVariant={colors.background === '#000000' ? 'dark' : 'light'}
              accentColor={colors.primary}
              style={{ backgroundColor: colors.card, width: '100%' }}
            />
          )}

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker('exit_date')}
          >
            <Text style={styles.dateButtonText}>
              Exit Date: {formData.exit_date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          {(showDatePicker === 'exit_date' || Platform.OS === 'ios') && (
            <DateTimePicker
              testID="exitDatePicker"
              value={formData.exit_date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => handleDateChange(event, date, 'exit_date')}
              textColor={colors.text}
              themeVariant={colors.background === '#000000' ? 'dark' : 'light'}
              accentColor={colors.primary}
              style={{ backgroundColor: colors.card, width: '100%' }}
            />
          )}

          <Text style={styles.sectionTitle}>Nepal Contact</Text>

          <TextInput
            style={styles.input}
            placeholder="Contact Name"
            value={formData.nepal_contact_name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, nepal_contact_name: text }))}
            placeholderTextColor={colors.textSecondary}
          />

          <TextInput
            style={styles.input}
            placeholder="Organization"
            value={formData.nepal_organization}
            onChangeText={(text) => setFormData(prev => ({ ...prev, nepal_organization: text }))}
            placeholderTextColor={colors.textSecondary}
          />

          <TextInput
            style={styles.input}
            placeholder="Designation (Optional)"
            value={formData.nepal_designation}
            onChangeText={(text) => setFormData(prev => ({ ...prev, nepal_designation: text }))}
            placeholderTextColor={colors.textSecondary}
          />

          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            value={formData.nepal_mobile}
            onChangeText={(text) => setFormData(prev => ({ ...prev, nepal_mobile: text }))}
            placeholderTextColor={colors.textSecondary}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Office Number (Optional)"
            value={formData.nepal_office_number}
            onChangeText={(text) => setFormData(prev => ({ ...prev, nepal_office_number: text }))}
            placeholderTextColor={colors.textSecondary}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Address"
            value={formData.nepal_address}
            onChangeText={(text) => setFormData(prev => ({ ...prev, nepal_address: text }))}
            placeholderTextColor={colors.textSecondary}
            multiline
          />

          <Text style={styles.sectionTitle}>Home Country Contact</Text>

          <TextInput
            style={styles.input}
            placeholder="Contact Name"
            value={formData.home_contact_name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, home_contact_name: text }))}
            placeholderTextColor={colors.textSecondary}
          />

          <TextInput
            style={styles.input}
            placeholder="City"
            value={formData.home_city}
            onChangeText={(text) => setFormData(prev => ({ ...prev, home_city: text }))}
            placeholderTextColor={colors.textSecondary}
          />

          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            value={formData.home_mobile}
            onChangeText={(text) => setFormData(prev => ({ ...prev, home_mobile: text }))}
            placeholderTextColor={colors.textSecondary}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Office Number (Optional)"
            value={formData.home_office_number}
            onChangeText={(text) => setFormData(prev => ({ ...prev, home_office_number: text }))}
            placeholderTextColor={colors.textSecondary}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Address"
            value={formData.home_address}
            onChangeText={(text) => setFormData(prev => ({ ...prev, home_address: text }))}
            placeholderTextColor={colors.textSecondary}
            multiline
          />

          {Object.keys(transitPassCost).length > 0 && (
            <View style={styles.costContainer}>
              <Text style={styles.costTitle}>Transit Pass Cost Breakdown:</Text>
              {Object.entries(transitPassCost).map(([key, value]) => (
                <Text key={key} style={styles.costItem}>
                  {key}: NPR {value}
                </Text>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Application</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  imageUploadContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.card,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadingText: {
    marginLeft: 8,
    color: colors.textSecondary,
    fontSize: 14,
  },
  successContainer: {
    backgroundColor: `${colors.success}20`,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageIcon: {
    marginRight: 8,
  },
  successText: {
    color: colors.success,
    fontSize: 14,
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  formContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    color: colors.text,
  },

  placeholderStyle: {
    color: colors.textSecondary,
  },
  selectedTextStyle: {
    color: colors.text,
  },
  dateButton: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  dateButtonText: {
    color: colors.text,
  },
  costContainer: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  costTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  costItem: {
    color: colors.text,
    marginBottom: 4,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerContainer: {
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  picker: {
    backgroundColor: colors.card,
    color: colors.text,
  },
  radioGroup: { marginBottom: 12 },
  radioRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 8,
  },
  radioFilled: { backgroundColor: colors.primary },
  radioLabel: { color: colors.text, fontSize: 16 },
});
