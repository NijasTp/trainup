// src/components/GoogleLoginButton.tsx
import api from '@/lib/axios';
import React, { useEffect } from 'react';

interface GoogleLoginButtonProps {
  onLoginSuccess: (jwt: string) => void;
  onLoginError?: (error: any) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

const CLIENT_ID = '779990597734-ge56n8rthf0vcd38gc1c3htqlecn2nqj.apps.googleusercontent.com';

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onLoginSuccess,
  onLoginError,
}) => {
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = initializeGoogleSignIn;
    } else {
      initializeGoogleSignIn();
    }
  }, []);

  const initializeGoogleSignIn = () => {
    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: handleCredentialResponse,
    });
    window.google.accounts.id.renderButton(
      document.getElementById('googleSignInDiv'),
      { theme: 'outline', size: 'large' }
    );
  };

  const handleCredentialResponse = async (response: any) => {
    try {
      const idToken = response.credential;
      const res = await api.post('/user/google-login', { idToken });
      const data = await res.data;
      if (res.status === 200) {
        onLoginSuccess(data.user); 
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error(error);
      if (onLoginError) onLoginError(error);
    }
  };

  return <div id="googleSignInDiv"></div>;
};
