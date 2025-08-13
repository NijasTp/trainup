
import { Link } from 'react-router-dom';
import LoginForm from '../../components/user/LoginForm';

const LoginPage = () => {
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
        <div className="backdrop-blur-md bg-gray-800/90 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
          <div className="pt-10 px-8 pb-6">
            <h1 className="text-center text-3xl font-extrabold tracking-wider text-white">
              TRAIN<span className="text-[#176B87]">UP</span>
            </h1>
            <p className="text-center text-gray-400 text-sm mt-1">
             
              Are you a gym? <Link className='text-blue-600' to='/gym/login'>Login...</Link><br/>
              Are you a trainer? <Link className='text-blue-600' to='/trainer/login'>Login...</Link>
            </p>
          </div>
          
          
          <div className="px-8 pb-8">
            <LoginForm />
          </div>
          
        
        </div>
      </div>
    </div>
  );
};

export default LoginPage;