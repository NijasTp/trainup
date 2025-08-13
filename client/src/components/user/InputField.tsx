import React, { useState } from "react";
import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";

interface InputFieldProps {
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon: "email" | "lock" | "user";
  name: string;
}

const InputField = ({ type, value, onChange, placeholder, icon, name }: InputFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  const getInputType = () => {
    if (!isPassword) return type;
    return showPassword ? "text" : "password";
  };

  return (
    <div className="relative group">
      <div className="flex items-center bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden group-focus-within:border-[#176B87] group-focus-within:ring-1 group-focus-within:ring-[#176B87] transition-all duration-300">
        <div className="flex items-center justify-center w-12 text-gray-400">
          {icon === "email" && <FaEnvelope />}
          {icon === "lock" && <FaLock />}
          {icon === "user" && <FaUser />}
        </div>

        <input
          type={getInputType()}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full bg-transparent border-none outline-none text-white p-4 placeholder-gray-500 pr-12"
          placeholder={placeholder}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 text-gray-400 hover:text-white focus:outline-none"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>

      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-[#176B87] to-[#64CCC5] group-focus-within:w-full transition-all duration-300" />
    </div>
  );
};



export default InputField;