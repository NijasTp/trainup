import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Provider } from 'react-redux'
import './index.css'
import './admin-theme.css'
import App from './App.tsx'
import { store } from './redux/store.ts';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <GoogleOAuthProvider clientId={clientId}>
          <App />
        </GoogleOAuthProvider>
      </Provider>
    </BrowserRouter>
  </StrictMode>,
)
