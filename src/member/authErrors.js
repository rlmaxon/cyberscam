// Plain-language versions of Cognito's error messages.
export function friendlyAuthError(err) {
  switch (err?.name) {
    case 'UsernameExistsException':
      return 'An account with this email already exists. Try signing in, or use "Forgot password?" to reset it.';
    case 'InvalidPasswordException':
      if (/symbol/i.test(err.message)) return 'Your password needs a special character, like ! @ # $ or ?. Please add one and try again.';
      if (/upper/i.test(err.message)) return 'Your password needs an uppercase letter (A–Z). Please add one and try again.';
      if (/lower/i.test(err.message)) return 'Your password needs a lowercase letter (a–z). Please add one and try again.';
      if (/numeric|number/i.test(err.message)) return 'Your password needs a number (0–9). Please add one and try again.';
      if (/length|long/i.test(err.message)) return 'Your password is too short. Please make it longer and try again.';
      return 'That password doesn\'t meet the requirements. Please try another.';
    case 'InvalidParameterException':
      return 'Please check the email address and try again.';
    case 'CodeMismatchException':
      return 'That code doesn\'t match. Please check the email and type the 6-digit code again.';
    case 'ExpiredCodeException':
      return 'That code has expired. Tap "Send a new code" and use the newest email.';
    case 'LimitExceededException':
    case 'TooManyRequestsException':
    case 'TooManyFailedAttemptsException':
      return 'Too many tries in a short time. Please wait a few minutes and try again.';
    case 'NotAuthorizedException':
      if (/SignUp is not permitted/i.test(err.message)) {
        return 'New accounts aren\'t open quite yet. Everything on the site is still free to use without an account.';
      }
      return 'Invalid email or password. Please try again.';
    case 'UserNotFoundException':
      return 'We couldn\'t find an account with that email.';
    default:
      return err?.message || 'Something went wrong. Please try again.';
  }
}
