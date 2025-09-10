import { motion } from 'motion/react';
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import TiltedCard from '@/components/TiltedCard';
import tuLogo from '@/assets/tulogo.png';
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center text-center w-full max-w-md"
      >
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-2xl text-gray-400 mb-6">Oops! The page you're looking for doesn't exist.</p>
        
        <div className="flex justify-center">
          <TiltedCard
            imageSrc={tuLogo}
            altText="Website Logo"
            captionText="Back to Home"
            containerHeight="300px"
            containerWidth="300px"
            imageHeight="300px"
            imageWidth="300px"
            rotateAmplitude={12}
            scaleOnHover={1.2}
            showMobileWarning={false}
            showTooltip={true}
            displayOverlayContent={true}
            overlayContent={
              <Link to="/">
              <p className="text-black text-lg font-medium">
                Return to Home
              </p>
              </Link>
            }
          />
        </div>

        <Button
          onClick={() => navigate('/')}
          className="mt-8 bg-[#4B8B9B] hover:bg-[#4B8B9B]/80 text-white px-6 py-3"
        >
          Back to Home
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;