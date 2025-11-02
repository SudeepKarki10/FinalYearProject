import { colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAdminStore } from '@/store/admin-store';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface QRScannerModalProps {
  visible: boolean;
  onClose: () => void;
  verificationResult: any;
}

const { width } = Dimensions.get('window');

export default function QRScannerModal({ visible, onClose, verificationResult }: QRScannerModalProps) {
  const colorScheme = useColorScheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { verifyQRCode, updatePassStatus, clearVerificationResult, isLoading } = useAdminStore();

  useEffect(() => {
    if (visible && !permission) {
      requestPermission();
    }
    if (visible) {
      setScanned(false);
      setScanning(false);
    }
    // Set initial status when verification result changes
    if (verificationResult?.permit_details?.status) {
      setSelectedStatus(verificationResult.permit_details.status as 'pending' | 'approved' | 'rejected');
    }
  }, [visible, permission, requestPermission, verificationResult]);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || scanning) return;
    
    setScanned(true);
    setScanning(true);

    try {
      await verifyQRCode(data);
    } catch {
      Alert.alert('Error', 'Failed to verify QR code');
      setScanned(false);
      setScanning(false);
    }
  };

  const resetScanner = () => {
    console.log('QRScannerModal: Resetting scanner');
    setScanned(false);
    setScanning(false);
    clearVerificationResult();
  };

  const handleSaveStatus = async () => {
    if (!verificationResult?.permit_details?.id) {
      Alert.alert('Error', 'No TIMS pass ID found');
      return;
    }

    try {
      setIsSaving(true);
      const permitId = Number(verificationResult.permit_details.id);
      if (Number.isNaN(permitId)) {
        throw new Error('Invalid TIMS pass id');
      }

      await updatePassStatus(permitId, selectedStatus);
      Alert.alert('Success', 'Status updated successfully');
      onClose();
    } catch (_error) {
      console.error('Failed to update TIMS status via QR modal', _error);
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return colors.success;
      case 'rejected':
        return colors.error;
      case 'pending':
        return colors.warning;
      default:
        return colors.text;
    }
  };

  const styles = StyleSheet.create({
    modal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 50,
      paddingBottom: 20,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#ffffff',
      flex: 1,
      textAlign: 'center',
    },
    closeButton: {
      padding: 8,
      width: 40,
      alignItems: 'center',
    },
    scannerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scanner: {
      width: width * 0.8,
      height: width * 0.8,
      borderRadius: 12,
      overflow: 'hidden',
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scanFrame: {
      width: width * 0.6,
      height: width * 0.6,
      borderWidth: 2,
      borderColor: '#ffffff',
      borderRadius: 12,
      backgroundColor: 'transparent',
    },
    instruction: {
      color: '#ffffff',
      fontSize: 16,
      textAlign: 'center',
      marginTop: 20,
      paddingHorizontal: 40,
    },
    permissionContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    permissionText: {
      color: '#ffffff',
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20,
    },
    permissionButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    permissionButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '500',
    },
    resultContainer: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
      margin: 20,
      borderRadius: 12,
      padding: 20,
    },
    resultHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    resultTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginLeft: 12,
      color: colorScheme === 'dark' ? '#ffffff' : colors.text,
    },
    successIcon: {
      color: colors.success,
    },
    errorIcon: {
      color: colors.error,
    },
    resultContent: {
      gap: 12,
    },
    resultRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? '#333' : '#f0f0f0',
    },
    resultLabel: {
      fontSize: 14,
      color: colorScheme === 'dark' ? '#aaa' : colors.textSecondary,
      fontWeight: '500',
    },
    resultValue: {
      fontSize: 14,
      color: colorScheme === 'dark' ? '#ffffff' : colors.text,
      fontWeight: '400',
      flex: 1,
      textAlign: 'right',
    },
    errorMessage: {
      color: colors.error,
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    secondaryButton: {
      backgroundColor: colorScheme === 'dark' ? '#333' : '#f0f0f0',
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '500',
    },
    primaryButtonText: {
      color: '#ffffff',
    },
    secondaryButtonText: {
      color: colorScheme === 'dark' ? '#ffffff' : colors.text,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      color: '#ffffff',
      fontSize: 16,
      marginTop: 16,
    },
    statusSection: {
      marginTop: 20,
      padding: 16,
      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f8f8f8',
      borderRadius: 8,
    },
    statusSectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colorScheme === 'dark' ? '#ffffff' : colors.text,
      marginBottom: 12,
    },
    dropdownContainer: {
      marginBottom: 16,
    },
    dropdownLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colorScheme === 'dark' ? '#aaa' : colors.textSecondary,
      marginBottom: 8,
    },
    dropdownButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
      borderWidth: 1,
      borderColor: colorScheme === 'dark' ? '#444' : '#e0e0e0',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    dropdownButtonText: {
      fontSize: 16,
      fontWeight: '500',
      textTransform: 'capitalize',
    },
    dropdownMenu: {
      position: 'absolute',
      top: 48,
      left: 0,
      right: 0,
      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#ffffff',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colorScheme === 'dark' ? '#444' : '#e0e0e0',
      zIndex: 1000,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    dropdownOption: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? '#333' : '#f0f0f0',
    },
    dropdownOptionLast: {
      borderBottomWidth: 0,
    },
    dropdownOptionText: {
      fontSize: 16,
      color: colorScheme === 'dark' ? '#ffffff' : colors.text,
      textTransform: 'capitalize',
    },
    saveButton: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    saveButtonDisabled: {
      backgroundColor: colorScheme === 'dark' ? '#333' : '#ccc',
    },
    saveButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
  });

  const renderScanner = () => {
    if (!permission) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Requesting camera permission...</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Camera access is required to scan QR codes
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (isLoading || scanning) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Verifying QR code...</Text>
        </View>
      );
    }

    return (
      <View style={styles.scannerContainer}>
        <View style={styles.scanner}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          />
          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
          </View>
        </View>
        <Text style={styles.instruction}>
          Position the QR code within the frame to scan
        </Text>
      </View>
    );
  };

  const renderResult = () => {
    if (!verificationResult) return null;

    const isSuccess = verificationResult.success && verificationResult.verified;

    return (
      <ScrollView style={styles.resultContainer}>
        <View style={styles.resultHeader}>
          <Ionicons 
            name={isSuccess ? "checkmark-circle" : "close-circle"}
            size={24}
            style={isSuccess ? styles.successIcon : styles.errorIcon}
          />
          <Text style={styles.resultTitle}>
            {isSuccess ? "QR Verified Successfully" : "Verification Failed"}
          </Text>
        </View>

        <View style={styles.resultContent}>
          {verificationResult.error && (
            <Text style={styles.errorMessage}>{verificationResult.error}</Text>
          )}

          {verificationResult.verification_details && (
            <>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Verified By:</Text>
                <Text style={styles.resultValue}>
                  {verificationResult.verification_details.verified_by}
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Officer Role:</Text>
                <Text style={styles.resultValue}>
                  {verificationResult.verification_details.officer_role}
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Verification Time:</Text>
                <Text style={styles.resultValue}>
                  {verificationResult.verification_details.verification_time}
                </Text>
              </View>
            </>
          )}

          {verificationResult.permit_details && (
            <>
              <View style={styles.resultRow}>

            <Text style={styles.resultLabel}>TIMS ID:</Text>
                <Text style={styles.resultValue}>
                  {verificationResult.permit_details.id}
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>TIMS Card No:</Text>
                <Text style={styles.resultValue}>
                  {verificationResult.permit_details.tims_card_no}
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Full Name:</Text>
                <Text style={styles.resultValue}>
                  {verificationResult.permit_details.full_name}
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Nationality:</Text>
                <Text style={styles.resultValue}>
                  {verificationResult.permit_details.nationality}
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Passport Number:</Text>
                <Text style={styles.resultValue}>
                  {verificationResult.permit_details.passport_number}
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Trek Area:</Text>
                <Text style={styles.resultValue}>
                  {verificationResult.permit_details.trekker_area}
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Route:</Text>
                <Text style={styles.resultValue}>
                  {verificationResult.permit_details.route}
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Entry Date:</Text>
                <Text style={styles.resultValue}>
                  {verificationResult.permit_details.entry_date}
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Exit Date:</Text>
                <Text style={styles.resultValue}>
                  {verificationResult.permit_details.exit_date}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Status Management Section - Only show for successful verifications */}
        {isSuccess && verificationResult.permit_details && (
          <View style={styles.statusSection}>
            <Text style={styles.statusSectionTitle}>Update Status</Text>
            
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownLabel}>Select Status:</Text>
              <TouchableOpacity 
                style={styles.dropdownButton}
                onPress={() => setShowStatusDropdown(!showStatusDropdown)}
              >
                <Text style={[
                  styles.dropdownButtonText,
                  { color: getStatusColor(selectedStatus) }
                ]}>
                  {selectedStatus}
                </Text>
                <Ionicons 
                  name={showStatusDropdown ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={colorScheme === 'dark' ? '#ffffff' : colors.text}
                />
              </TouchableOpacity>

              {showStatusDropdown && (
                <View style={styles.dropdownMenu}>
                  {['pending', 'approved', 'rejected'].map((status, index) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.dropdownOption,
                        index === 2 && styles.dropdownOptionLast
                      ]}
                      onPress={() => {
                        setSelectedStatus(status as 'pending' | 'approved' | 'rejected');
                        setShowStatusDropdown(false);
                      }}
                    >
                      <Text style={[
                        styles.dropdownOptionText,
                        { color: getStatusColor(status) }
                      ]}>
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity 
              style={[
                styles.saveButton,
                isSaving && styles.saveButtonDisabled
              ]}
              onPress={handleSaveStatus}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="#ffffff" />
                  <Text style={styles.saveButtonText}>Save Status</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={resetScanner}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Scan Again
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={onClose}
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" style={styles.modal}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan TIMS QR Code</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {verificationResult ? renderResult() : renderScanner()}
      </View>
    </Modal>
  );
}