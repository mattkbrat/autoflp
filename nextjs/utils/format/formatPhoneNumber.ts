// Regex that matches the following:
// +x (xxx) xxx-xxxx
// (xxx) xxx-xxxx
// xxx-xxxx

export const phoneNumberRegexString = '\\(\\d{3}\\) \\d{3}-\\d{4}';

export const phoneNumberRegex = new RegExp(phoneNumberRegexString);

function formatPhoneNumber(phoneNumber: string) {
  phoneNumber = phoneNumber.replace(/\D/g, '');

  let formatted = phoneNumber;

  if (phoneNumber.length >= 6 && phoneNumber.length < 10) {
    if (phoneNumber.length === 7) {
      formatted = phoneNumber.replace(/(\d{3})(\d{4})/, '$1-$2');
    } else {
      if (phoneNumber[0] === '1') {
        formatted = `+1 (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(
          4,
          7,
        )}-${phoneNumber.slice(7)}`;
      } else {
        formatted = `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
          3,
          6,
        )}-${phoneNumber.slice(6)}`;
      }
    }
  } else if (phoneNumber.length >= 10) {
    switch (phoneNumber.length) {
      case 10:
        formatted = `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
          3,
          6,
        )}-${phoneNumber.slice(6)}`;
        break;
      case 11:
        formatted = phoneNumber.replace(
          /(\d{1})(\d{3})(\d{3})(\d{4})/,
          '+$1 ($2) $3-$4',
        );
        break;
      default:
        formatted = phoneNumber;
    }
  }

  return formatted;
}

export default formatPhoneNumber;
