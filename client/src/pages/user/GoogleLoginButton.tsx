
import api from '@/lib/axios';
import React, { useEffect } from 'react';

import type { GoogleLoginButtonProps } from "@/interfaces/user/IGoogleLogin";

declare global {
  interface Window {
    google: any;
  }
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

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
