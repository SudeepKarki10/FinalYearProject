import { Linking } from 'react-native';

/**
 * Utility functions for handling phone numbers in the app
 */

/**
 * Extracts the first phone number from a string that might contain multiple numbers
 * @param phoneString - The phone string that might contain multiple numbers separated by delimiters
 * @returns The first valid phone number or undefined if none found
 */
export const getFirstPhoneNumber = (phoneString?: string): string | undefined => {
  if (!phoneString) return undefined;
  
  // Split by common delimiters and get the first non-empty number
  const phoneNumbers = phoneString
    .split(/[,;|\/\n]/) // Split by comma, semicolon, pipe, slash, or newline
    .map(num => num.trim())
    .filter(num => num.length > 0);
  
  return phoneNumbers.length > 0 ? phoneNumbers[0] : undefined;
};

/**
 * Checks if a phone string contains multiple phone numbers
 * @param phoneString - The phone string to check
 * @returns True if multiple numbers are detected
 */
export const hasMultiplePhoneNumbers = (phoneString?: string): boolean => {
  if (!phoneString) return false;
  return /[,;|\/\n]/.test(phoneString);
};

/**
 * Formats a phone number for dialing by removing non-digit characters except +
 * @param phoneNumber - The phone number to format
 * @returns Cleaned phone number ready for dialing
 */
export const formatPhoneForDialing = (phoneNumber: string): string => {
  return phoneNumber.replace(/[^\d+]/g, '');
};

/**
 * Initiates a phone call using the device's dialer
 * @param phoneNumber - The phone number to call
 */
export const initiatePhoneCall = (phoneNumber: string): void => {
  const formattedNumber = formatPhoneForDialing(phoneNumber);
  Linking.openURL(`tel:${formattedNumber}`);
};