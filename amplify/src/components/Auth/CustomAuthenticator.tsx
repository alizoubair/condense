import React from 'react';
import { Authenticator, View, Text, Heading } from '@aws-amplify/ui-react';
import './CustomAuthenticator.css';

const components = {
    Header() {
        return (
            <View textAlign="center" padding="large">
                <div className="mb-6">
                    <Heading level={1} className="text-gray-900 mb-4 font-bold text-3xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Condense
                    </Heading>
                    <Text className="text-gray-600">
                        Sign in to your account to continue
                    </Text>
                </div>
            </View>
        );
    },

    SignIn: {
        Header() {
            return (
                <View textAlign="center" padding="medium">
                    <Heading level={3} className="text-gray-900 mb-2">
                        Sign In
                    </Heading>
                    <Text className="text-gray-600">
                        Enter your credentials to access your account
                    </Text>
                </View>
            );
        },
        Footer() {
            return (
                <View textAlign="center" padding="medium">
                    <div className="pt-4 border-t border-gray-100">
                        <Text className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <span className="text-blue-600 font-semibold cursor-pointer hover:text-blue-700 transition-colors">
                                Sign up here
                            </span>
                        </Text>
                    </div>
                </View>
            );
        },
    },

    SignUp: {
        Header() {
            return (
                <View textAlign="center" padding="medium">
                    <Heading level={3} className="text-gray-900 mb-2">
                        Create Account
                    </Heading>
                    <Text className="text-gray-600">
                        Join us today and get started
                    </Text>
                </View>
            );
        },
        Footer() {
            return (
                <View textAlign="center" padding="medium">
                    <div className="pt-4 border-t border-gray-100">
                        <Text className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <span className="text-blue-600 font-semibold cursor-pointer hover:text-blue-700 transition-colors">
                                Sign in here
                            </span>
                        </Text>
                    </div>
                </View>
            );
        },
    },

    ConfirmSignUp: {
        Header() {
            return (
                <View textAlign="center" padding="medium">
                    <Heading level={3} className="text-gray-900 mb-2">
                        Verify Your Email
                    </Heading>
                    <Text className="text-gray-600">
                        We've sent a verification code to your email address
                    </Text>
                </View>
            );
        },
    },

    ForgotPassword: {
        Header() {
            return (
                <View textAlign="center" padding="medium">
                    <Heading level={3} className="text-gray-900 mb-2">
                        Reset Password
                    </Heading>
                    <Text className="text-gray-600">
                        Enter your email to receive a reset code
                    </Text>
                </View>
            );
        },
    },
};

interface CustomAuthenticatorProps {
    children: React.ReactNode;
}

export const CustomAuthenticator: React.FC<CustomAuthenticatorProps> = ({ children }) => {
    // Custom CSS variables for Amplify UI styling
    const customStyles = {
        '--amplify-colors-brand-primary-60': '#3b82f6',
        '--amplify-colors-brand-primary-80': '#1d4ed8',
        '--amplify-colors-brand-primary-100': '#1e40af',
        '--amplify-components-authenticator-background-color': 'transparent',
        '--amplify-components-authenticator-router-box-shadow': '0 0 16px rgba(0, 0, 0, 0.1)',
        '--amplify-components-authenticator-router-border-width': '1px',
        '--amplify-components-authenticator-router-border-color': '#e5e7eb',
        '--amplify-components-authenticator-router-background-color': 'white',
        '--amplify-components-authenticator-router-border-radius': '12px',
        '--amplify-components-button-primary-background-color': '#3b82f6',
        '--amplify-components-button-primary-border-color': '#3b82f6',
        '--amplify-components-button-primary-color': 'white',
        '--amplify-components-button-primary-hover-background-color': '#1d4ed8',
        '--amplify-components-button-primary-hover-border-color': '#1d4ed8',
        '--amplify-components-button-primary-focus-box-shadow': '0 0 0 2px rgba(59, 130, 246, 0.5)',
        '--amplify-components-button-border-radius': '8px',
        '--amplify-components-button-padding-block': '12px',
        '--amplify-components-button-padding-inline': '24px',
        '--amplify-components-button-font-size': '16px',
        '--amplify-components-button-font-weight': '600',
        '--amplify-components-button-line-height': '1.5',
        '--amplify-components-fieldcontrol-border-color': '#d1d5db',
        '--amplify-components-fieldcontrol-focus-border-color': '#3b82f6',
        '--amplify-components-fieldcontrol-border-radius': '8px',
        '--amplify-components-fieldcontrol-padding': '12px',
        '--amplify-components-fieldcontrol-font-size': '16px',
        '--amplify-space-medium': '1rem',
        '--amplify-space-large': '1.5rem',
        background: 'transparent',
        backgroundColor: 'transparent',
    } as React.CSSProperties;

    return (
        <div style={{ background: 'transparent', backgroundColor: 'transparent', minHeight: '100vh' }}>
            <Authenticator
                components={components}
                formFields={{
                    signIn: {
                        username: {
                            placeholder: 'Enter your email address',
                            label: 'Email Address',
                            labelHidden: false,
                        },
                        password: {
                            placeholder: 'Enter your password',
                            label: 'Password',
                            labelHidden: false,
                        },
                    },
                    signUp: {
                        email: {
                            placeholder: 'Enter your email address',
                            label: 'Email Address',
                            labelHidden: false,
                            order: 1,
                        },
                        password: {
                            placeholder: 'Create a strong password',
                            label: 'Password',
                            labelHidden: false,
                            order: 2,
                        },
                        confirm_password: {
                            placeholder: 'Confirm your password',
                            label: 'Confirm Password',
                            labelHidden: false,
                            order: 3,
                        },
                    },
                }}
                loginMechanisms={['email']}
                signUpAttributes={['email']}
                variation="modal"
            >
                {({ signOut, user }) => (
                    <div style={customStyles}>
                        {children}
                    </div>
                )}
            </Authenticator>
        </div>
    );
};