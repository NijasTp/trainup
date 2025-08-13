export const emailValidation = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const passwordValidation = (password: string): boolean => {
    // At least 8 chars, one uppercase, one lowercase, one number, one special char
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(password);
};

export const usernameValidation = (username: string): boolean => {
    // 3-20 chars, letters, numbers, underscores
    const re = /^[a-zA-Z0-9_]{3,20}$/;
    return re.test(username);
};

export const phoneValidation = (phone: string): boolean => {
    // Simple international phone validation
    const re = /^\+?\d{10,15}$/;
    return re.test(phone);
};