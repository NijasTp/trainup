import React from "react";

type ActionButtonProps = {
  type?: "button" | "submit" | "reset";
  text: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
   icon?: React.ReactNode;
};

const ActionButton: React.FC<ActionButtonProps> = ({ type, text, onClick }) => {
  return (
    <button 
      type={type || 'button'} 
      className="relative w-full py-4 bg-[#001C30] hover:bg-[#176B87] text-white font-semibold tracking-wider rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 overflow-hidden"
      onClick={onClick}
    >
      {text}
      {/* Animated effect on button press */}
      <span className="absolute inset-0 flex justify-center items-center opacity-0 hover:opacity-100">
        <span className="w-full h-full bg-white/10 transform scale-0 hover:scale-100 rounded-full transition-transform duration-500"></span>
      </span>
    </button>
  );
};

export default ActionButton;