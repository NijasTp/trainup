
interface ResendTimerProps {
  timer: number;
  onResend: () => void;
  isDisabled: boolean;
}
export default function ResendTimer ({ timer, onResend, isDisabled }:ResendTimerProps) {
    
    
    return (
  <div className="text-center space-y-2">
    <p className="text-[#4B8B9B] text-sm">
      {timer > 0 ? `Resend code in ${timer}s` : "Didn't receive the code?"}
    </p>
    <button
      onClick={onResend}
      disabled={isDisabled}
      className="text-sm text-[#4B8B9B] hover:text-white font-medium disabled:opacity-50 transition duration-300"
    >
      Resend OTP
    </button>
  </div>
)}
