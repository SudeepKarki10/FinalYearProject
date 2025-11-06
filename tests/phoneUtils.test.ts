// Test file to verify phone number utility functions
import { formatPhoneForDialing, getFirstPhoneNumber, hasMultiplePhoneNumbers } from '../utils/phoneUtils';

// Test cases for phone number handling
const testCases = [
  {
    input: '+977-1-100',
    expected: '+977-1-100',
    description: 'Single phone number'
  },
  {
    input: '+977-1-100, +977-1-102',
    expected: '+977-1-100',
    description: 'Comma separated phone numbers'
  },
  {
    input: '+977-1-100; +977-1-102; +977-1-103',
    expected: '+977-1-100',
    description: 'Semicolon separated phone numbers'
  },
  {
    input: '+977-1-100|+977-1-102',
    expected: '+977-1-100',
    description: 'Pipe separated phone numbers'
  },
  {
    input: '+977-1-100/+977-1-102',
    expected: '+977-1-100',
    description: 'Slash separated phone numbers'
  },
  {
    input: '+977-1-100\n+977-1-102',
    expected: '+977-1-100',
    description: 'Newline separated phone numbers'
  },
  {
    input: '',
    expected: undefined,
    description: 'Empty string'
  },
  {
    input: undefined,
    expected: undefined,
    description: 'Undefined input'
  }
];

console.log('Testing phone number utility functions...\n');

testCases.forEach((testCase, index) => {
  const result = getFirstPhoneNumber(testCase.input);
  const hasMultiple = hasMultiplePhoneNumbers(testCase.input);
  const status = result === testCase.expected ? '✅ PASS' : '❌ FAIL';
  
  console.log(`Test ${index + 1}: ${testCase.description}`);
  console.log(`  Input: "${testCase.input}"`);
  console.log(`  Expected: ${testCase.expected}`);
  console.log(`  Got: ${result}`);
  console.log(`  Has Multiple: ${hasMultiple}`);
  console.log(`  Status: ${status}\n`);
});

// Test phone formatting
console.log('Testing phone formatting...');
const phoneToFormat = '+977-1-100 (ext. 123)';
const formatted = formatPhoneForDialing(phoneToFormat);
console.log(`Original: "${phoneToFormat}"`);
console.log(`Formatted: "${formatted}"`);
console.log(`Expected: "+9771100"`);
console.log(`Status: ${formatted === '+9771100' ? '✅ PASS' : '❌ FAIL'}\n`);

export { }; // Make this a module
