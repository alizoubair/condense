import { Amplify } from 'aws-amplify';

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_USER_POOL_ID || 'placeholder',
      userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID || 'placeholder',
      identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID || 'placeholder',
      loginWith: {
        email: true,
      },
      signUpVerificationMethod: 'code' as const,
      userAttributes: {
        email: {
          required: true,
        },
      },
      allowGuestAccess: false,
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: true,
      },
    },
  },
  API: {
    REST: {
      'condense-api': {
        endpoint: process.env.REACT_APP_API_URL || 'https://placeholder-api-url',
        region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
      },
    },
  },
};

// Only configure Amplify if we have real values (not placeholders)
if (process.env.REACT_APP_USER_POOL_ID && 
    process.env.REACT_APP_USER_POOL_ID !== 'placeholder') {
  Amplify.configure(amplifyConfig);
}

export default amplifyConfig;