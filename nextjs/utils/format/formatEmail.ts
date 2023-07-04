export const emailRegexString = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$';

function ValidateEmail(mail: string) {
  // check against emailRegex
  const emailRegex = new RegExp(emailRegexString);
  return emailRegex.test(mail);
}

function formatEmail(email: string) {
  // first check that the email is valid
  if (ValidateEmail(email)) {
    // format the email
    email = email.replace(/(\w+)(@)(\w+)(\.)(\w+)/, '$1@$3.$5');
  }
  return email;
}

export default formatEmail;
