
import api from '@/lib/axios';
import React, { useEffect, useCallback } from 'react';

import type { GoogleLoginButtonProps } from "@/interfaces/user/IGoogleLogin";

declare global {
  interface Window {
    google: SafeAny;
  }
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onLoginSuccess,
  onLoginError,
}) => {
  const handleCredentialResponse = useCallback(async (response: SafeAny) => {
    try {
      const idToken = response.credential;
      const res = await api.post('/user/google-login', { idToken });
      const data = await res.data;
      if (res.status === 200) {
        onLoginSuccess(data.user);
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (errorVal) { const error = errorVal as SafeAny;
      console.error(error);
      if (onLoginError) onLoginError(error);
    }
  }, [onLoginSuccess, onLoginError]);

  const initializeGoogleSignIn = useCallback(() => {
    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: handleCredentialResponse,
    });
    window.google.accounts.id.renderButton(
      document.getElementById('googleSignInDiv'),
      { theme: 'outline', size: 'large' }
    );
  }, [handleCredentialResponse]);

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
  }, [initializeGoogleSignIn]);

  return <div id="googleSignInDiv"></div>;
};
