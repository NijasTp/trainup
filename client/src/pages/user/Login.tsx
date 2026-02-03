import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/user/LoginForm';
import TrainerLoginForm from '../../components/trainer/TrainerLoginForm';
import GymLoginForm from '../../components/gym/GymLoginForm';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import type { LoginPageProps } from "@/interfaces/user/ILogin";
import Aurora from '@/components/ui/Aurora';

const LoginPage = ({ initialRole = 'user' }: LoginPageProps) => {
  const [activeRole, setActiveRole] = useState<'user' | 'trainer' | 'gym'>(initialRole);
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.userAuth);
  const { trainer } = useSelector((state: RootState) => state.trainerAuth);
  const { gym } = useSelector((state: RootState) => state.gymAuth);

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
    } else if (gym) {
      navigate('/gym/dashboard', { replace: true });
    }
  }, [user, trainer, gym, navigate]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Aurora Background Layer */}
      <div className="absolute inset-0 z-0">
        <Aurora
          colorStops={["#7cff67", "#B19EEF", "#5227FF"]}
          blend={0.5}
          amplitude={1.0}
          speed={1}
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="backdrop-blur-xl bg-gray-900/60 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 transition-all duration-300">
          <div className="pt-12 px-8 pb-4">
            <h1 className="text-center text-4xl font-black tracking-tighter text-white mb-8">
              TRAIN<span className="text-[#176B87]">UP</span>
            </h1>

            {/* 3-Way Toggle Switch */}
            <div className="bg-white/5 p-1 rounded-2xl flex relative h-12">
              <button
                onClick={() => setActiveRole('user')}
                className={`flex-1 text-xs font-black uppercase tracking-widest transition-all duration-500 z-10 ${activeRole === 'user' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                  }`}
              >
                User
              </button>
              <button
                onClick={() => setActiveRole('trainer')}
                className={`flex-1 text-xs font-black uppercase tracking-widest transition-all duration-500 z-10 ${activeRole === 'trainer' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                  }`}
              >
                Trainer
              </button>
              <button
                onClick={() => setActiveRole('gym')}
                className={`flex-1 text-xs font-black uppercase tracking-widest transition-all duration-500 z-10 ${activeRole === 'gym' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                  }`}
              >
                Gym
              </button>

              {/* Sliding Background */}
              <div
                className={`absolute top-1 bottom-1 w-[calc(33.33%-4px)] bg-[#176B87] rounded-xl transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${activeRole === 'user' ? 'translate-x-0' :
                  activeRole === 'trainer' ? 'translate-x-[100%]' : 'translate-x-[200%]'
                  }`}
              ></div>
            </div>
          </div>

          <div className="px-8 pb-10">
            <div className={`transition-all duration-500 ${activeRole === 'user' ? 'block opacity-100' : 'hidden opacity-0'}`}>
              <LoginForm />
            </div>
            <div className={`transition-all duration-500 ${activeRole === 'trainer' ? 'block opacity-100' : 'hidden opacity-0'}`}>
              <TrainerLoginForm />
            </div>
            <div className={`transition-all duration-500 ${activeRole === 'gym' ? 'block opacity-100' : 'hidden opacity-0'}`}>
              <GymLoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
