import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../lib/axios";
import InputField from "./InputField";
import ActionButton from "./ActionButton";
import { FaUserPlus } from "react-icons/fa";
import { passwordValidation } from "@/constants/validations";
import { GoogleLoginButton } from "@/pages/user/GoogleLoginButton";
import { useDispatch } from "react-redux";
import { login } from "@/redux/slices/userAuthSlice";
import debounce from "lodash.debounce";

interface SignupFormProps {
  setError: (error: string) => void;
}

const SignupForm = ({ setError }: SignupFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isUsernameTaken, setIsUsernameTaken] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error) setError(error);
  }, [setError]);

  const checkUsername = debounce(async (username: string) => {
    if (!username.trim()) {
      setIsUsernameTaken(false);
      return;
    }
    try {
      const response = await API.post("/user/check-username", { username });
      setIsUsernameTaken(response.data.isAvailable);
      console.log(response.data);
    } catch (err) {
      console.error("Username check failed:", err);
    }
  }, 500);

  useEffect(() => {
    checkUsername(name);
    return () => checkUsername.cancel();
  }, [name]);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (isUsernameTaken) {
      setError("Username is already taken");
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setError("Invalid email format");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== cpassword) {
      setError("Passwords do not match");
      return;
    }
    if (!passwordValidation(password)) {
      setError("Password should have at least 8 chars, one uppercase, one lowercase, one number, one special char");
      return;
    }
    if (!agreeTerms) {
      setError("You must agree to the Terms and Conditions");
      return;
    }

    try {
      await API.post("/user/request-otp", { email });
      navigate("/verify-otp", {
        state: { name, email, password },
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send OTP");
      console.log('err', err)
    }
  }

  const handleGoogleSuccess = (user: string) => {
    dispatch(login(user));
    navigate("/complete-profile");
  };

  const handleGoogleError = (error: any) => {
    console.error("Google login error:", error);
    alert("Google login failed. Please try again.");
  };

  return (
    <>
      <form onSubmit={handleSignup} className="space-y-5">
        <div>
          <InputField
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            icon="user"
            name="name"
          />
          {isUsernameTaken && (
            <p className="text-red-500 text-sm mt-1">Username is already taken</p>
          )}
        </div>

        <InputField
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
          icon="email"
          name="email"
        />

        <InputField
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          icon="lock"
          name="password"
        />

        <InputField
          type="password"
          value={cpassword}
          onChange={(e) => setCPassword(e.target.value)}
          placeholder="Confirm Password"
          icon="lock"
          name="confirm-password"
        />

        <div className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            id="terms"
            checked={agreeTerms}
            onChange={() => setAgreeTerms(!agreeTerms)}
            className="h-4 w-4 rounded accent-[#176B87]"
          />
          <label htmlFor="terms" className="text-gray-300">
            I agree to the{" "}
            <a
              href="#terms"
              className="text-[#176B87] hover:text-[#64CCC5] transition-colors"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#privacy"
              className="text-[#176B87] hover:text-[#64CCC5] transition-colors"
            >
              Privacy Policy
            </a>
          </label>
        </div>

        <ActionButton
          type="submit"
          text="CREATE ACCOUNT"
          icon={<FaUserPlus className="mr-2" />}
        />
      </form>

      <div className="my-8 flex items-center">
        <div className="flex-grow border-t border-gray-700"></div>
        <span className="px-4 text-sm text-gray-500">Or continue with</span>
        <div className="flex-grow border-t border-gray-700"></div>
      </div>

      <GoogleLoginButton
        onLoginSuccess={handleGoogleSuccess}
        onLoginError={handleGoogleError}
      />

      <p className="mt-8 text-center text-gray-400">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-[#176B87] font-semibold hover:text-[#64CCC5] transition-colors"
        >
          Sign In
        </Link>
      </p>
    </>
  );
};

export default SignupForm;