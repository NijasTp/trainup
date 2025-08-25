import { Link } from "react-router-dom";

interface CompleteProfileModalProps {
  onComplete: () => void;
}

const CompleteProfileModal = ({ onComplete }: CompleteProfileModalProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl p-6 w-96 text-center">
        <h2 className="text-xl font-bold mb-4">Complete Your Profile</h2>
        <p className="text-gray-600 mb-6">
          You haven’t completed your profile. Complete it for better services.
        </p>
        <Link
          to="/complete-profile"
          onClick={onComplete}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Go to Profile
        </Link>
      </div>
    </div>
  );
};

export default CompleteProfileModal;