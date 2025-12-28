import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '../../components/user/LoginForm';
import TrainerLoginForm from '../../components/trainer/TrainerLoginForm';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';

import type { LoginPageProps } from "@/interfaces/user/ILogin";

const LoginPage = ({ initialRole = 'user' }: LoginPageProps) => {
  const isTrainer = initialRole === 'trainer';
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.userAuth);
  const { trainer } = useSelector((state: RootState) => state.trainerAuth);

  useEffect(() => {
    if (user) {
      navigate('/home', { replace: true });
    } else if (trainer) {
      if (trainer.profileStatus === 'approved') {
        navigate('/trainer/dashboard', { replace: true });
      } else if (trainer.profileStatus === 'rejected') {
        navigate('/trainer/rejected', { replace: true });
      } else {
        navigate('/trainer/waitlist', { replace: true });
      }
    }
  }, [user, trainer, navigate]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1570829460005-c840387bb1ca?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGVtcHR5JTIwZ3ltfGVufDB8fDB8fHww"
          alt="Gym Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70"></div>
      </div>


      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="backdrop-blur-md bg-gray-800/90 rounded-2xl overflow-hidden shadow-2xl border border-gray-700 transition-all duration-300">
          <div className="pt-10 px-8 pb-6">
            <h1 className="text-center text-3xl font-extrabold tracking-wider text-white mb-2">
              TRAIN<span className="text-[#176B87]">UP</span>
            </h1>

            {/* Toggle Switch */}
            <div className="flex justify-center mt-6 mb-2">
              <div className="bg-gray-700/50 p-1 rounded-full flex relative">
                <Link
                  to="/user/login"
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 z-10 ${!isTrainer ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                    }`}
                >
                  User
                </Link>
                <Link
                  to="/trainer/login"
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 z-10 ${isTrainer ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                    }`}
                >
                  Trainer
                </Link>

                {/* Sliding Background */}
                <div
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#176B87] rounded-full transition-all duration-300 ease-in-out ${isTrainer ? 'translate-x-full' : 'translate-x-0'
                    }`}
                ></div>
              </div>
            </div>
          </div>

          <div className="px-8 pb-8">
            <div className={`transition-opacity duration-300 ${!isTrainer ? 'block' : 'hidden'}`}>
              <LoginForm />
            </div>
            <div className={`transition-opacity duration-300 ${isTrainer ? 'block' : 'hidden'}`}>
              <TrainerLoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;