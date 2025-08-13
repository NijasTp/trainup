// components/Toast.tsx
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000); // auto close after 4s
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <div className="bg-red-600 text-white px-7 py-5 rounded-sm shadow-lg flex items-center gap-3">
        <span className="font-bold text-lg">✖</span>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default Toast;