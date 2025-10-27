export default function LoadingSpinner(){
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-4 border-t-transparent border-blue-400 rounded-full animate-spin animation-delay-150"></div>
        <div className="absolute inset-4 border-4 border-t-transparent border-blue-200 rounded-full animate-spin animation-delay-300"></div>
      </div>
    </div>
  );
};