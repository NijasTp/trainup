export interface GoogleLoginButtonProps {
    onLoginSuccess: (jwt: string) => void;
    onLoginError?: (error: any) => void;
}
