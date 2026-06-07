import type { UserType } from "@/redux/slices/userAuthSlice";

export interface GoogleLoginButtonProps {
    onLoginSuccess: (user: UserType) => void;
    onLoginError?: (error: SafeAny) => void;
}

