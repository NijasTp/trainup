import React, { useState } from 'react';
import { login as loginApi } from '../../services/authService';
import { login } from '../../redux/slices/userAuthSlice';
import { Link, useNavigate } from 'react-router-dom';
import InputField from './InputField';
import ActionButton from './ActionButton';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';


const LoginForm = () => {
  const dispatch = useDispatch()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const { user } = await loginApi(email, password);
      dispatch(login(user));
      toast.success("Login successful");
      navigate("/home");
      setLoading(false);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Login failed";
      setError(errorMessage);
      console.error("Login error:", err);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full border-t-2 border-b-2 border-gray-900 h-6 w-6"></div>
          <span className="ml-2">Signing In...</span>
        </div>
      ) : (
        <h2 className="text-center text-2xl font-semibold text-white mb-6">Sign In</h2>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <InputField
        type="email"
        name="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon="email"
      />

      <InputField
        type="password"
        name="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon="lock"
      />

      <div className="flex items-center justify-between text-sm">

        <Link to="/forgot-password" className="text-[#176B87] hover:text-[#64CCC5] transition-colors">
          Forgot password?
        </Link>
      </div>

      <ActionButton type="submit" text="SIGN IN" />

      <div className="text-center text-sm text-gray-400 mt-6">
        Don't have an account?
        <Link to='/signup' className="text-[#176B87] font-semibold ml-1 hover:text-[#64CCC5] transition-colors">
          Sign up
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;